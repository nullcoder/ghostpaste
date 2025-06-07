import { getR2Storage } from "./storage";
import { AppError, ErrorCode } from "@/types/errors";
import type { GistMetadata, File } from "@/types/models";
import { encodeFiles, decodeFiles } from "./binary";
import { generateGistId } from "./id";
import { logger } from "./logger";

/**
 * Retry configuration
 */
interface RetryConfig {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 100,
  maxDelay: 5000,
  backoffFactor: 2,
};

/**
 * Execute a function with exponential backoff retry
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const { maxAttempts, initialDelay, maxDelay, backoffFactor } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx)
      if (
        error instanceof AppError &&
        error.statusCode >= 400 &&
        error.statusCode < 500
      ) {
        throw error;
      }

      if (attempt === maxAttempts) {
        break;
      }

      logger.warn(
        `Storage operation failed (attempt ${attempt}/${maxAttempts})`,
        {
          error: lastError.message,
          nextRetryIn: delay,
        }
      );

      // Wait with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw new AppError(
    ErrorCode.STORAGE_ERROR,
    500,
    `Operation failed after ${maxAttempts} attempts`,
    { lastError: lastError?.message }
  );
}

/**
 * Storage operation helpers
 */
export const StorageOperations = {
  /**
   * Create a new gist with metadata and encrypted blob
   */
  async createGist(
    metadata: Omit<
      GistMetadata,
      "id" | "created_at" | "updated_at" | "version" | "current_version"
    >,
    encryptedBlob: Uint8Array,
    retryConfig?: RetryConfig
  ): Promise<{ id: string; timestamp: string }> {
    const storage = await getR2Storage();
    const id = generateGistId();
    const now = new Date().toISOString();

    return withRetry(async () => {
      // Store blob first to get timestamp
      const timestamp = await storage.putBlob(id, encryptedBlob);

      // Create complete metadata
      const fullMetadata: GistMetadata = {
        ...metadata,
        id,
        created_at: now,
        updated_at: now,
        version: 1,
        current_version: timestamp,
      };

      // Store metadata
      await storage.putMetadata(id, fullMetadata);

      logger.info("Created gist", {
        id,
        size: encryptedBlob.length,
        blobCount: metadata.blob_count,
      });

      return { id, timestamp };
    }, retryConfig);
  },

  /**
   * Update an existing gist
   */
  async updateGist(
    id: string,
    updatedMetadata: Partial<GistMetadata>,
    encryptedBlob?: Uint8Array,
    retryConfig?: RetryConfig
  ): Promise<{ timestamp?: string }> {
    const storage = await getR2Storage();

    return withRetry(async () => {
      // Get existing metadata
      const existingMetadata = await storage.getMetadata(id);
      if (!existingMetadata) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, `Gist ${id} not found`);
      }

      let newTimestamp: string | undefined;

      // Store new blob version if provided
      if (encryptedBlob) {
        newTimestamp = await storage.putBlob(id, encryptedBlob);
      }

      // Update metadata
      const fullMetadata: GistMetadata = {
        ...existingMetadata,
        ...updatedMetadata,
        id, // Ensure ID doesn't change
        created_at: existingMetadata.created_at, // Preserve creation time
        updated_at: new Date().toISOString(),
        version: existingMetadata.version + 1,
        current_version: newTimestamp || existingMetadata.current_version,
      };

      await storage.putMetadata(id, fullMetadata);

      // Prune old versions
      await storage.pruneVersions(id);

      logger.info("Updated gist", {
        id,
        version: fullMetadata.version,
        newBlobVersion: !!newTimestamp,
      });

      return { timestamp: newTimestamp };
    }, retryConfig);
  },

  /**
   * Get gist with metadata and current blob
   */
  async getGist(
    id: string,
    retryConfig?: RetryConfig
  ): Promise<{ metadata: GistMetadata; blob: Uint8Array } | null> {
    const storage = await getR2Storage();

    return withRetry(async () => {
      const metadata = await storage.getMetadata(id);
      if (!metadata) {
        return null;
      }

      const blob = await storage.getCurrentBlob(id);
      if (!blob) {
        throw new AppError(
          ErrorCode.STORAGE_ERROR,
          500,
          `Blob not found for gist ${id}`
        );
      }

      return { metadata, blob };
    }, retryConfig);
  },

  /**
   * Delete a gist if it should be deleted (one-time view or expired)
   */
  async deleteIfNeeded(
    metadata: GistMetadata,
    retryConfig?: RetryConfig
  ): Promise<boolean> {
    const storage = await getR2Storage();

    // Check if one-time view
    if (metadata.one_time_view) {
      await withRetry(() => storage.deleteGist(metadata.id), retryConfig);
      logger.info("Deleted one-time view gist", { id: metadata.id });
      return true;
    }

    // Check if expired
    if (metadata.expires_at) {
      const expiryDate = new Date(metadata.expires_at);
      if (expiryDate <= new Date()) {
        await withRetry(() => storage.deleteGist(metadata.id), retryConfig);
        logger.info("Deleted expired gist", {
          id: metadata.id,
          expiredAt: metadata.expires_at,
        });
        return true;
      }
    }

    return false;
  },

  /**
   * Check if a gist exists
   */
  async exists(id: string, retryConfig?: RetryConfig): Promise<boolean> {
    const storage = await getR2Storage();
    return withRetry(() => storage.exists(id), retryConfig);
  },

  /**
   * List gists with pagination
   */
  async listGists(
    options?: { limit?: number; cursor?: string },
    retryConfig?: RetryConfig
  ) {
    const storage = await getR2Storage();
    return withRetry(() => storage.listGists(options), retryConfig);
  },

  /**
   * Get version history for a gist
   */
  async getVersionHistory(id: string, retryConfig?: RetryConfig) {
    const storage = await getR2Storage();
    return withRetry(() => storage.listVersions(id), retryConfig);
  },

  /**
   * Get a specific version of a gist
   */
  async getGistVersion(
    id: string,
    timestamp: string,
    retryConfig?: RetryConfig
  ): Promise<Uint8Array | null> {
    const storage = await getR2Storage();
    return withRetry(() => storage.getBlob(id, timestamp), retryConfig);
  },

  /**
   * Clean up expired gists (for CRON job)
   */
  async cleanupExpiredGists(
    batchSize: number = 100,
    retryConfig?: RetryConfig
  ): Promise<{ deleted: number; checked: number }> {
    const storage = await getR2Storage();
    let deleted = 0;
    let checked = 0;
    let cursor: string | undefined;

    do {
      const result = await withRetry(
        () => storage.listGists({ limit: batchSize, cursor }),
        retryConfig
      );

      for (const { id, metadata } of result.gists) {
        checked++;

        if (metadata.expires_at) {
          const expiryDate = new Date(metadata.expires_at);
          if (expiryDate <= new Date()) {
            await withRetry(() => storage.deleteGist(id), retryConfig);
            deleted++;
            logger.info("Cleaned up expired gist", {
              id,
              expiredAt: metadata.expires_at,
            });
          }
        }
      }

      cursor = result.cursor;
    } while (cursor);

    return { deleted, checked };
  },
};

/**
 * Helper functions for common patterns
 */
export const StorageHelpers = {
  /**
   * Create an encrypted blob from files
   */
  createEncryptedBlob(files: File[]): Uint8Array {
    return encodeFiles(files);
  },

  /**
   * Parse an encrypted blob to files
   */
  parseEncryptedBlob(blob: Uint8Array): File[] {
    return decodeFiles(blob);
  },

  /**
   * Calculate total size of files
   */
  calculateTotalSize(files: File[]): number {
    return files.reduce((total, file) => {
      return total + new TextEncoder().encode(file.content).length;
    }, 0);
  },

  /**
   * Validate gist size limits
   */
  validateSizeLimits(files: File[]): void {
    const MAX_FILE_SIZE = 500 * 1024; // 500KB
    const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB

    let totalSize = 0;

    for (const file of files) {
      const fileSize = new TextEncoder().encode(file.content).length;

      if (fileSize > MAX_FILE_SIZE) {
        throw new AppError(
          ErrorCode.FILE_TOO_LARGE,
          400,
          `File "${file.name}" exceeds maximum size of 500KB`
        );
      }

      totalSize += fileSize;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      throw new AppError(
        ErrorCode.PAYLOAD_TOO_LARGE,
        400,
        `Total size exceeds maximum of 5MB`
      );
    }
  },

  /**
   * Generate expiry date from option
   */
  getExpiryDate(expiry: "1hour" | "24hours" | "7days" | "30days"): string {
    const now = new Date();

    switch (expiry) {
      case "1hour":
        now.setHours(now.getHours() + 1);
        break;
      case "24hours":
        now.setHours(now.getHours() + 24);
        break;
      case "7days":
        now.setDate(now.getDate() + 7);
        break;
      case "30days":
        now.setDate(now.getDate() + 30);
        break;
    }

    return now.toISOString();
  },

  /**
   * Check if metadata indicates the gist should be deleted after viewing
   */
  shouldDeleteAfterView(metadata: GistMetadata): boolean {
    return (
      !!metadata.one_time_view ||
      (!!metadata.expires_at && new Date(metadata.expires_at) <= new Date())
    );
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  },
};
