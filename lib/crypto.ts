/**
 * Web Crypto API based encryption/decryption utilities for GhostPaste
 *
 * This module provides AES-GCM encryption using the Web Crypto API,
 * ensuring compatibility with Cloudflare Workers edge runtime.
 *
 * Security properties:
 * - AES-256-GCM provides authenticated encryption (confidentiality + integrity)
 * - Each encryption uses a unique IV (initialization vector)
 * - Keys are never sent to the server (shared via URL fragments)
 * - All operations use constant-time algorithms where possible
 *
 * @module crypto
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API}
 */

import { InvalidEncryptionKeyError, DecryptionFailedError } from "./errors";
import { logger } from "./logger";
import { base64UrlEncode, base64UrlDecode } from "./base64";

/**
 * Encryption algorithm configuration
 *
 * Using AES-GCM (Galois/Counter Mode) for authenticated encryption:
 * - Provides both confidentiality and authenticity
 * - Recommended by NIST SP 800-38D
 * - Supported by all modern browsers via Web Crypto API
 */
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256; // 256-bit keys (32 bytes) for AES-256
const IV_LENGTH = 12; // 96 bits (12 bytes) - recommended for AES-GCM
const TAG_LENGTH = 128; // 128 bits (16 bytes) - authentication tag length

/**
 * Encrypted data structure with raw binary data
 */
export interface EncryptedData {
  /** Initialization vector (12 bytes) */
  iv: Uint8Array;
  /** Encrypted ciphertext (raw binary) */
  ciphertext: Uint8Array;
}

/**
 * Encrypted blob format for storage
 * Format: [12 bytes IV][Encrypted data]
 */
export type EncryptedBlob = Uint8Array;

/**
 * Generate a new AES-256 encryption key
 *
 * Creates a cryptographically secure 256-bit key using the Web Crypto API.
 * Each key is unique and should be used for a single gist only (forward secrecy).
 *
 * @returns Promise<CryptoKey> A new 256-bit AES key for encryption/decryption
 * @throws {InvalidEncryptionKeyError} If key generation fails
 *
 * @example
 * ```typescript
 * const key = await generateEncryptionKey();
 * // Use key for encryption/decryption operations
 * ```
 *
 * @security Keys are marked as extractable to allow sharing via URLs
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  try {
    const key = await crypto.subtle.generateKey(
      {
        name: ALGORITHM,
        length: KEY_LENGTH,
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    logger.debug("Generated new AES-256 encryption key");
    return key;
  } catch (error) {
    logger.error("Failed to generate encryption key", error as Error);
    throw new InvalidEncryptionKeyError("Failed to generate encryption key", {
      originalError: error,
    });
  }
}

/**
 * Export a CryptoKey to base64url string format
 *
 * @param key - The CryptoKey to export
 * @returns Promise<string> Base64url encoded key
 *
 * @example
 * ```typescript
 * const key = await generateEncryptionKey();
 * const exportedKey = await exportKey(key);
 * // exportedKey can be safely included in URLs
 * ```
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  try {
    const exported = await crypto.subtle.exportKey("raw", key);
    const keyString = base64UrlEncode(new Uint8Array(exported));

    logger.debug("Exported CryptoKey to base64url format");
    return keyString;
  } catch (error) {
    logger.error("Failed to export key", error as Error);
    throw new InvalidEncryptionKeyError("Failed to export encryption key", {
      originalError: error,
    });
  }
}

/**
 * Import a base64url encoded key string to CryptoKey
 *
 * @param keyString - Base64url encoded key string
 * @returns Promise<CryptoKey> Imported CryptoKey for use with Web Crypto API
 *
 * @example
 * ```typescript
 * const key = await importKey(keyStringFromUrl);
 * // Use key for decryption
 * ```
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  try {
    const keyData = base64UrlDecode(keyString);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData.buffer as ArrayBuffer,
      {
        name: ALGORITHM,
        length: KEY_LENGTH,
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    logger.debug("Imported CryptoKey from base64url format");
    return key;
  } catch (error) {
    logger.error("Failed to import key", error as Error);
    throw new DecryptionFailedError("Failed to import encryption key", {
      originalError: error,
    });
  }
}

/**
 * Encrypt data using AES-GCM
 *
 * @param data - The data to encrypt
 * @param key - The encryption key
 * @returns Promise<EncryptedData> Object containing IV and ciphertext
 *
 * @example
 * ```typescript
 * const key = await generateEncryptionKey();
 * const data = new TextEncoder().encode("Hello, World!");
 * const encrypted = await encrypt(data, key);
 * ```
 */
export async function encrypt(
  data: Uint8Array,
  key: CryptoKey
): Promise<EncryptedData> {
  try {
    // Generate a random IV for this encryption
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    // Encrypt the data
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv,
        tagLength: TAG_LENGTH,
      },
      key,
      data.buffer as ArrayBuffer
    );

    // Return raw binary data
    const result = {
      iv,
      ciphertext: new Uint8Array(ciphertext),
    };

    logger.debug("Successfully encrypted data", {
      dataSize: data.length,
      ciphertextSize: ciphertext.byteLength,
    });

    return result;
  } catch (error) {
    logger.error("Encryption failed", error as Error);
    throw new InvalidEncryptionKeyError("Failed to encrypt data", {
      originalError: error,
    });
  }
}

/**
 * Decrypt data using AES-GCM
 *
 * @param encryptedData - The encrypted data containing IV and ciphertext
 * @param key - The decryption key
 * @returns Promise<Uint8Array> Decrypted data
 *
 * @example
 * ```typescript
 * const decrypted = await decrypt(encryptedData, key);
 * const text = new TextDecoder().decode(decrypted);
 * ```
 */
export async function decrypt(
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<Uint8Array> {
  try {
    const { iv, ciphertext } = encryptedData;

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv as Uint8Array<ArrayBuffer>,
        tagLength: TAG_LENGTH,
      },
      key,
      ciphertext.buffer as ArrayBuffer
    );

    const result = new Uint8Array(decrypted);

    logger.debug("Successfully decrypted data", {
      ciphertextSize: ciphertext.length,
      decryptedSize: result.length,
    });

    return result;
  } catch (error) {
    logger.error("Decryption failed", error as Error);

    // Provide specific error for authentication failures
    if (error instanceof Error && error.name === "OperationError") {
      throw new DecryptionFailedError("Invalid key or corrupted data", {
        originalError: error,
      });
    }

    throw new DecryptionFailedError("Failed to decrypt data", {
      originalError: error,
    });
  }
}

/**
 * Generate a shareable URL with the encryption key in the fragment
 *
 * @param baseUrl - Base URL of the application
 * @param gistId - ID of the gist
 * @param key - Encryption key
 * @returns Promise<string> Complete URL with key in fragment
 *
 * @example
 * ```typescript
 * const url = await generateShareableUrl(
 *   "https://ghostpaste.dev",
 *   "abc123",
 *   key
 * );
 * // Returns: https://ghostpaste.dev/g/abc123#key=...
 * ```
 */
export async function generateShareableUrl(
  baseUrl: string,
  gistId: string,
  key: CryptoKey
): Promise<string> {
  const exportedKey = await exportKey(key);
  return `${baseUrl}/g/${gistId}#key=${exportedKey}`;
}

/**
 * Extract encryption key from URL fragment
 *
 * @param url - URL containing key in fragment
 * @returns Promise<CryptoKey | null> Extracted key or null if not found
 *
 * @example
 * ```typescript
 * const key = await extractKeyFromUrl(window.location.href);
 * if (key) {
 *   // Use key for decryption
 * }
 * ```
 */
export async function extractKeyFromUrl(
  url: string
): Promise<CryptoKey | null> {
  try {
    const urlObj = new URL(url);
    const fragment = urlObj.hash.slice(1); // Remove #

    if (!fragment) {
      return null;
    }

    // Parse fragment as URLSearchParams
    const params = new URLSearchParams(fragment);
    const keyString = params.get("key");

    if (!keyString) {
      return null;
    }

    return await importKey(keyString);
  } catch (error) {
    logger.error("Failed to extract key from URL", error as Error, { url });
    return null;
  }
}

/**
 * Pack encrypted data into a single blob for storage
 * Format: [12 bytes IV][Encrypted data]
 *
 * @param encryptedData - The encrypted data with separate IV and ciphertext
 * @returns Single Uint8Array blob for storage
 */
export function packEncryptedBlob(encryptedData: EncryptedData): EncryptedBlob {
  const { iv, ciphertext } = encryptedData;

  // Create a single buffer with IV + ciphertext
  const blob = new Uint8Array(iv.length + ciphertext.length);
  blob.set(iv, 0);
  blob.set(ciphertext, iv.length);

  return blob;
}

/**
 * Unpack encrypted blob into separate IV and ciphertext
 *
 * @param blob - The stored blob containing IV and ciphertext
 * @returns EncryptedData with separate IV and ciphertext
 * @throws DecryptionFailedError if blob is too small
 */
export function unpackEncryptedBlob(blob: EncryptedBlob): EncryptedData {
  if (blob.length < IV_LENGTH) {
    throw new DecryptionFailedError("Invalid encrypted blob: too small");
  }

  return {
    iv: blob.slice(0, IV_LENGTH),
    ciphertext: blob.slice(IV_LENGTH),
  };
}

/**
 * High-level function to encrypt data and pack it for storage
 *
 * @param data - The data to encrypt
 * @param key - The encryption key (optional, generates new if not provided)
 * @returns Object containing the packed blob and the key used
 */
export async function encryptAndPack(
  data: Uint8Array,
  key?: CryptoKey
): Promise<{ blob: EncryptedBlob; key: CryptoKey }> {
  const encryptionKey = key || (await generateEncryptionKey());
  const encryptedData = await encrypt(data, encryptionKey);
  const blob = packEncryptedBlob(encryptedData);

  return { blob, key: encryptionKey };
}

/**
 * High-level function to unpack and decrypt a stored blob
 *
 * @param blob - The stored encrypted blob
 * @param key - The decryption key
 * @returns Decrypted data
 */
export async function unpackAndDecrypt(
  blob: EncryptedBlob,
  key: CryptoKey
): Promise<Uint8Array> {
  const encryptedData = unpackEncryptedBlob(blob);
  return await decrypt(encryptedData, key);
}
