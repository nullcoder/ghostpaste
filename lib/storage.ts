import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AppError, ErrorCode } from "@/types/errors";
import type { GistMetadata } from "@/types/models";

/**
 * R2 storage key structure
 */
export const StorageKeys = {
  metadata: (id: string) => `metadata/${id}.json`,
  version: (id: string, timestamp: string) => `versions/${id}/${timestamp}.bin`,
  temp: (id: string) => `temp/${id}`,
} as const;

/**
 * R2 storage client wrapper
 * Provides type-safe operations for storing and retrieving encrypted gists
 */
export class R2Storage {
  private bucket: R2Bucket | null = null;

  /**
   * Initialize the R2 bucket connection
   * Must be called before any operations
   */
  async initialize(): Promise<void> {
    try {
      // Normal Cloudflare Workers environment
      const { env } = await getCloudflareContext({ async: true });
      this.bucket = env.GHOSTPASTE_BUCKET;

      if (!this.bucket) {
        throw new AppError(
          ErrorCode.STORAGE_ERROR,
          500,
          "R2 bucket binding not found",
          { binding: "GHOSTPASTE_BUCKET" }
        );
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        "Failed to initialize R2 storage",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  /**
   * Ensure bucket is initialized
   */
  private ensureBucket(): R2Bucket {
    if (!this.bucket) {
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        "R2 storage not initialized. Call initialize() first."
      );
    }
    return this.bucket;
  }

  /**
   * Store gist metadata
   */
  async putMetadata(id: string, metadata: GistMetadata): Promise<void> {
    const bucket = this.ensureBucket();
    const key = StorageKeys.metadata(id);

    try {
      await bucket.put(key, JSON.stringify(metadata), {
        httpMetadata: {
          contentType: "application/json",
        },
        customMetadata: {
          type: "metadata",
          version: metadata.version.toString(),
          createdAt: metadata.created_at,
        },
      });
    } catch (error) {
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        `Failed to store metadata for gist ${id}`,
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  /**
   * Retrieve gist metadata
   */
  async getMetadata(id: string): Promise<GistMetadata | null> {
    const bucket = this.ensureBucket();
    const key = StorageKeys.metadata(id);

    try {
      const object = await bucket.get(key);
      if (!object) return null;

      const text = await object.text();
      return JSON.parse(text) as GistMetadata;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new AppError(
          ErrorCode.STORAGE_ERROR,
          500,
          `Invalid metadata format for gist ${id}`,
          { error: error.message }
        );
      }
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        `Failed to retrieve metadata for gist ${id}`,
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  /**
   * Store encrypted blob as a new version
   * Returns the timestamp used for this version
   */
  async putBlob(id: string, data: Uint8Array): Promise<string> {
    const bucket = this.ensureBucket();
    const timestamp = new Date().toISOString();
    const key = StorageKeys.version(id, timestamp);

    try {
      await bucket.put(key, data, {
        httpMetadata: {
          contentType: "application/octet-stream",
        },
        customMetadata: {
          type: "version",
          size: data.length.toString(),
          timestamp,
        },
      });
      return timestamp;
    } catch (error) {
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        `Failed to store blob version for gist ${id}`,
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  /**
   * Retrieve encrypted blob by version timestamp
   */
  async getBlob(id: string, timestamp: string): Promise<Uint8Array | null> {
    const bucket = this.ensureBucket();
    const key = StorageKeys.version(id, timestamp);

    try {
      const object = await bucket.get(key);
      if (!object) return null;

      const arrayBuffer = await object.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        `Failed to retrieve blob version ${timestamp} for gist ${id}`,
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  /**
   * Get the current blob for a gist by reading metadata
   */
  async getCurrentBlob(id: string): Promise<Uint8Array | null> {
    const metadata = await this.getMetadata(id);
    if (!metadata || !metadata.current_version) return null;

    return this.getBlob(id, metadata.current_version);
  }

  /**
   * Delete gist (metadata and all versions)
   */
  async deleteGist(id: string): Promise<void> {
    const bucket = this.ensureBucket();
    const metadataKey = StorageKeys.metadata(id);

    try {
      // Delete metadata
      await bucket.delete(metadataKey);

      // List and delete all versions
      const versionsPrefix = `versions/${id}/`;
      const versions = await bucket.list({ prefix: versionsPrefix });

      if (versions.objects.length > 0) {
        await Promise.all(
          versions.objects.map((obj) => bucket.delete(obj.key))
        );
      }
    } catch (error) {
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        `Failed to delete gist ${id}`,
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  /**
   * Check if gist exists
   */
  async exists(id: string): Promise<boolean> {
    const bucket = this.ensureBucket();
    const key = StorageKeys.metadata(id);

    try {
      const object = await bucket.head(key);
      return object !== null;
    } catch {
      // R2 throws an error for non-existent objects in head()
      return false;
    }
  }

  /**
   * List gists (with pagination)
   */
  async listGists(options?: { limit?: number; cursor?: string }): Promise<{
    gists: Array<{ id: string; metadata: GistMetadata }>;
    cursor?: string;
    truncated: boolean;
  }> {
    const bucket = this.ensureBucket();
    const limit = options?.limit ?? 100;

    try {
      const result = await bucket.list({
        prefix: "metadata/",
        limit,
        cursor: options?.cursor,
      });

      const gists = await Promise.all(
        result.objects.map(async (obj) => {
          const id = obj.key.replace("metadata/", "").replace(".json", "");
          const metadata = await this.getMetadata(id);
          if (!metadata) {
            throw new Error(`Metadata not found for ${id}`);
          }
          return { id, metadata };
        })
      );

      return {
        gists,
        cursor: result.truncated ? result.cursor : undefined,
        truncated: result.truncated,
      };
    } catch (error) {
      throw new AppError(ErrorCode.STORAGE_ERROR, 500, "Failed to list gists", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * List all versions for a gist
   */
  async listVersions(id: string): Promise<
    Array<{
      timestamp: string;
      size: number;
    }>
  > {
    const bucket = this.ensureBucket();
    const prefix = `versions/${id}/`;

    try {
      const result = await bucket.list({ prefix, limit: 1000 });

      return result.objects
        .map((obj) => ({
          timestamp: obj.key.replace(prefix, "").replace(".bin", ""),
          size: obj.size,
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Newest first
    } catch (error) {
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        `Failed to list versions for gist ${id}`,
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  /**
   * Delete old versions beyond the limit (default: 50)
   */
  async pruneVersions(id: string, keepCount: number = 50): Promise<number> {
    const versions = await this.listVersions(id);

    if (versions.length <= keepCount) {
      return 0;
    }

    const bucket = this.ensureBucket();
    const toDelete = versions.slice(keepCount);

    try {
      await Promise.all(
        toDelete.map((v) => bucket.delete(StorageKeys.version(id, v.timestamp)))
      );

      return toDelete.length;
    } catch (error) {
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        `Failed to prune versions for gist ${id}`,
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalGists: number;
    totalSize: number;
  }> {
    const bucket = this.ensureBucket();

    try {
      let totalGists = 0;
      let totalSize = 0;
      let cursor: string | undefined;

      // Count all objects
      do {
        const result = await bucket.list({
          limit: 1000,
          cursor,
        });

        for (const obj of result.objects) {
          if (obj.key.startsWith("metadata/")) {
            totalGists++;
          }
          totalSize += obj.size;
        }

        cursor = result.truncated ? result.cursor : undefined;
      } while (cursor);

      return { totalGists, totalSize };
    } catch (error) {
      throw new AppError(
        ErrorCode.STORAGE_ERROR,
        500,
        "Failed to get storage statistics",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }
}

/**
 * Singleton instance
 */
let storageInstance: R2Storage | null = null;

/**
 * Get or create R2 storage instance
 */
export async function getR2Storage(): Promise<R2Storage> {
  if (!storageInstance) {
    storageInstance = new R2Storage();
    await storageInstance.initialize();
  }
  return storageInstance;
}

/**
 * Reset storage instance (for testing)
 */
export function resetStorageInstance(): void {
  storageInstance = null;
}

/**
 * Handle R2-specific errors
 */
export function isR2NotFoundError(error: unknown): boolean {
  // R2 typically returns null for non-existent objects rather than throwing
  // but some operations might throw specific errors
  return (
    error instanceof Error &&
    (error.message.includes("R2ObjectNotFound") ||
      error.message.includes("NoSuchKey"))
  );
}
