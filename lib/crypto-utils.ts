/**
 * High-level encryption utilities for GhostPaste
 *
 * This module provides simplified, high-level functions for common encryption
 * operations, making it easier to use encryption throughout the application.
 *
 * Key features:
 * - Simplified API for encrypting/decrypting gists
 * - Automatic key generation and management
 * - URL generation with embedded encryption keys
 * - PIN protection integration
 * - Metadata handling (expiration, one-time view, etc.)
 *
 * Usage flow:
 * 1. Create gist: `createGist(files, options)` → returns encrypted data + URL
 * 2. Share URL: Contains gist ID and encryption key in fragment
 * 3. Load gist: `loadGistFromUrl(url)` → returns decrypted files
 *
 * @module crypto-utils
 * @see {@link /docs/ENCRYPTION.md} for detailed architecture
 */

import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encryptAndPack,
  unpackAndDecrypt,
  encrypt,
  decrypt,
  generateShareableUrl as generateShareableUrlBase,
  extractKeyFromUrl as extractKeyFromUrlBase,
  type EncryptedBlob,
} from "./crypto";
import { encodeFiles, decodeFiles } from "./binary";
import { generateSalt, hashPin, validatePin } from "./auth";
import { generateShortId } from "./id";
import { logger } from "./logger";
import { base64Encode, base64Decode } from "./base64";
import {
  type File,
  type GistMetadata,
  type UserMetadata,
} from "@/types/models";
import { DecryptionFailedError, InvalidEncryptionKeyError } from "./errors";

/**
 * Encrypted gist data structure
 */
export interface EncryptedGist {
  /** Unique identifier for the gist */
  id: string;
  /** Encrypted file data blob */
  encryptedData: EncryptedBlob;
  /** Base64url encoded encryption key */
  encryptionKey?: string;
  /** Metadata for the gist (unencrypted) */
  metadata: Partial<GistMetadata>;
}

/**
 * Decrypted gist data structure
 */
export interface DecryptedGist {
  /** Unique identifier for the gist */
  id: string;
  /** Array of decrypted files */
  files: File[];
  /** User metadata (description, etc.) */
  userMetadata?: UserMetadata;
  /** Full gist metadata */
  metadata: Partial<GistMetadata>;
}

/**
 * Options for encrypting a gist
 */
export interface EncryptGistOptions {
  /** Optional description for the gist */
  description?: string;
  /** Optional PIN for edit protection */
  editPin?: string;
  /** Whether this is a one-time view gist */
  oneTimeView?: boolean;
  /** Expiration time */
  expiresAt?: Date;
}

/**
 * Generate a shareable URL with encryption key
 *
 * @param baseUrl - Base URL of the application (e.g., "https://ghostpaste.dev")
 * @param gistId - ID of the gist
 * @param key - Encryption key (CryptoKey or base64url string)
 * @returns Complete shareable URL with key in fragment
 *
 * @example
 * ```typescript
 * // With CryptoKey
 * const url = await generateShareableUrl("https://ghostpaste.dev", "abc123", cryptoKey);
 *
 * // With string key
 * const url = await generateShareableUrl("https://ghostpaste.dev", "abc123", "base64urlKey");
 * // Returns: https://ghostpaste.dev/g/abc123#key=base64urlKey
 * ```
 */
export async function generateShareableUrl(
  baseUrl: string,
  gistId: string,
  key: CryptoKey | string
): Promise<string> {
  if (typeof key === "string") {
    // If key is already a string, use it directly
    return `${baseUrl}/g/${gistId}#key=${key}`;
  }

  // Otherwise use the base crypto function
  return generateShareableUrlBase(baseUrl, gistId, key);
}

/**
 * Extract encryption key from URL
 *
 * @param url - URL containing key in fragment
 * @returns Extracted CryptoKey or null if not found
 *
 * @example
 * ```typescript
 * const key = await extractKeyFromUrl(window.location.href);
 * if (key) {
 *   const decrypted = await decryptGist(encryptedGist, key);
 * }
 * ```
 */
export async function extractKeyFromUrl(
  url: string
): Promise<CryptoKey | null> {
  return extractKeyFromUrlBase(url);
}

/**
 * High-level function to encrypt a gist
 *
 * @param files - Array of files to encrypt
 * @param options - Encryption options
 * @returns Encrypted gist data with key
 *
 * @example
 * ```typescript
 * const files: File[] = [
 *   { name: "main.js", content: "console.log('Hello');", language: "javascript" }
 * ];
 *
 * const encrypted = await encryptGist(files, {
 *   description: "My secure code",
 *   editPin: "1234",
 *   oneTimeView: false
 * });
 *
 * // Store encrypted.encryptedData in R2
 * // Share URL with encrypted.encryptionKey
 * ```
 */
export async function encryptGist(
  files: File[],
  options: EncryptGistOptions = {}
): Promise<EncryptedGist> {
  try {
    // Validate input
    if (!files || files.length === 0) {
      throw new Error("No files provided for encryption");
    }

    // Generate unique ID for the gist (8 characters for short URLs)
    const gistId = generateShortId(8);

    // Encode files to binary format
    const encodedData = encodeFiles(files);

    // Generate encryption key
    const key = await generateEncryptionKey();

    // Encrypt the data
    const { blob: encryptedData } = await encryptAndPack(encodedData, key);

    // Export key for sharing
    const encryptionKey = await exportKey(key);

    // Prepare metadata
    const metadata: Partial<GistMetadata> = {
      id: gistId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      total_size: encodedData.length,
      blob_count: 1,
      one_time_view: options.oneTimeView,
    };

    // Handle expiration
    if (options.expiresAt) {
      metadata.expires_at = options.expiresAt.toISOString();
    }

    // Handle PIN protection
    if (options.editPin) {
      const salt = await generateSalt();
      const pinHash = await hashPin(options.editPin, salt);
      metadata.edit_pin_hash = pinHash;
      metadata.edit_pin_salt = salt;
    }

    // Encrypt user metadata (always encrypt, even if empty)
    const userMetadata: UserMetadata = {
      description: options.description || undefined,
    };

    // Encrypt the metadata using the same key as the gist content
    const encoder = new TextEncoder();
    const metadataJson = JSON.stringify(userMetadata);
    const metadataBytes = encoder.encode(metadataJson);

    const encryptedMetadata = await encrypt(metadataBytes, key);

    // Convert to the expected format (base64 encoded for storage)
    metadata.encrypted_metadata = {
      iv: base64Encode(encryptedMetadata.iv),
      data: base64Encode(encryptedMetadata.ciphertext),
    };

    logger.debug("Encrypted gist successfully", {
      gistId,
      fileCount: files.length,
      encryptedSize: encryptedData.length,
      hasPin: !!options.editPin,
      oneTimeView: !!options.oneTimeView,
    });

    return {
      id: gistId,
      encryptedData,
      encryptionKey,
      metadata,
    };
  } catch (error) {
    logger.error("Failed to encrypt gist", error as Error);
    throw new InvalidEncryptionKeyError("Failed to encrypt gist", {
      originalError: error,
    });
  }
}

/**
 * High-level function to decrypt a gist
 *
 * @param encryptedGist - The encrypted gist data
 * @param key - Decryption key (CryptoKey or base64url string)
 * @returns Decrypted gist with files
 *
 * @example
 * ```typescript
 * // With CryptoKey
 * const decrypted = await decryptGist(encryptedGist, cryptoKey);
 *
 * // With string key
 * const decrypted = await decryptGist(encryptedGist, keyString);
 *
 * // Access files
 * console.log(decrypted.files);
 * ```
 */
export async function decryptGist(
  encryptedGist: EncryptedGist,
  key: CryptoKey | string
): Promise<DecryptedGist> {
  try {
    // Import key if it's a string
    const cryptoKey = typeof key === "string" ? await importKey(key) : key;

    // Decrypt the data
    const decryptedData = await unpackAndDecrypt(
      encryptedGist.encryptedData,
      cryptoKey
    );

    // Decode files from binary format
    const files = decodeFiles(decryptedData);

    // Decrypt user metadata if present
    let userMetadata: UserMetadata | undefined;
    if (
      encryptedGist.metadata.encrypted_metadata?.iv &&
      encryptedGist.metadata.encrypted_metadata?.data
    ) {
      try {
        // Reconstruct the encrypted data structure
        const encryptedMetadata = {
          iv: base64Decode(encryptedGist.metadata.encrypted_metadata.iv),
          ciphertext: base64Decode(
            encryptedGist.metadata.encrypted_metadata.data
          ),
        };

        // Decrypt the metadata
        const decryptedBytes = await decrypt(encryptedMetadata, cryptoKey);
        const decoder = new TextDecoder();
        const metadataJson = decoder.decode(decryptedBytes);
        userMetadata = JSON.parse(metadataJson) as UserMetadata;

        logger.debug("Successfully decrypted user metadata", {
          hasDescription: !!userMetadata.description,
        });
      } catch (error) {
        logger.warn("Failed to decrypt user metadata", {
          error: error instanceof Error ? error.message : String(error),
          gistId: encryptedGist.id,
        });
        // Continue without user metadata if decryption fails
        userMetadata = undefined;
      }
    }

    logger.debug("Decrypted gist successfully", {
      gistId: encryptedGist.id,
      fileCount: files.length,
      totalSize: decryptedData.length,
    });

    return {
      id: encryptedGist.id,
      files,
      userMetadata,
      metadata: encryptedGist.metadata,
    };
  } catch (error) {
    logger.error("Failed to decrypt gist", error as Error);

    if (error instanceof Error && error.name === "OperationError") {
      throw new DecryptionFailedError("Invalid decryption key", {
        originalError: error,
      });
    }

    throw new DecryptionFailedError("Failed to decrypt gist", {
      originalError: error,
    });
  }
}

/**
 * Check if a gist has expired
 *
 * @param metadata - Gist metadata
 * @returns True if the gist has expired
 */
export function isGistExpired(metadata: Partial<GistMetadata>): boolean {
  if (!metadata.expires_at) {
    return false;
  }

  const expiryDate = new Date(metadata.expires_at);
  return expiryDate < new Date();
}

/**
 * Validate PIN for gist editing
 *
 * @param pin - PIN to validate
 * @param metadata - Gist metadata containing PIN hash
 * @returns True if PIN is valid
 */
export async function validateGistPin(
  pin: string,
  metadata: Partial<GistMetadata>
): Promise<boolean> {
  if (!metadata.edit_pin_hash || !metadata.edit_pin_salt) {
    return false;
  }

  try {
    return await validatePin(
      pin,
      metadata.edit_pin_hash,
      metadata.edit_pin_salt
    );
  } catch {
    return false;
  }
}

/**
 * Create a complete gist object ready for storage
 *
 * @param files - Files to include in the gist
 * @param options - Gist creation options
 * @returns Complete encrypted gist with metadata
 */
export async function createGist(
  files: File[],
  options: EncryptGistOptions = {}
): Promise<{ gist: EncryptedGist; shareUrl: string }> {
  // Encrypt the gist
  const gist = await encryptGist(files, options);

  // Generate shareable URL
  const shareUrl = await generateShareableUrl(
    "https://ghostpaste.dev",
    gist.id,
    gist.encryptionKey!
  );

  return { gist, shareUrl };
}

/**
 * Load and decrypt a gist from URL
 *
 * @param url - URL containing gist ID and encryption key
 * @param encryptedData - Encrypted gist data (would be loaded from storage)
 * @returns Decrypted gist or null if key not found
 */
export async function loadGistFromUrl(
  url: string,
  encryptedData: EncryptedBlob,
  metadata: Partial<GistMetadata>
): Promise<DecryptedGist | null> {
  // Extract key from URL
  const key = await extractKeyFromUrl(url);
  if (!key) {
    return null;
  }

  // Extract gist ID from URL
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  const gistId = pathParts[pathParts.length - 1];

  // Create encrypted gist object
  const encryptedGist: EncryptedGist = {
    id: gistId,
    encryptedData,
    metadata,
  };

  // Decrypt and return
  return decryptGist(encryptedGist, key);
}

/**
 * Generate SHA-256 hash using WebCrypto API
 *
 * @param input - String to hash
 * @returns Hex-encoded hash string
 *
 * @example
 * ```typescript
 * const hash = await sha256Hash("hello world");
 * console.log(hash); // "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
 * ```
 */
export async function sha256Hash(input: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = new Uint8Array(hashBuffer);

    // Convert to hex string
    const hashHex = Array.from(hashArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    logger.debug("Generated SHA-256 hash", {
      inputLength: input.length,
      hashLength: hashHex.length,
    });

    return hashHex;
  } catch (error) {
    logger.error("Failed to generate SHA-256 hash", error as Error);
    throw new Error("Failed to generate SHA-256 hash");
  }
}
