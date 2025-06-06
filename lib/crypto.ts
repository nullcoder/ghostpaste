/**
 * Web Crypto API based encryption/decryption utilities for GhostPaste
 *
 * This module provides AES-GCM encryption using the Web Crypto API,
 * ensuring compatibility with Cloudflare Workers edge runtime.
 */

import { InvalidEncryptionKeyError, DecryptionFailedError } from "./errors";
import { logger } from "./logger";

/**
 * Encryption algorithm configuration
 */
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for AES-GCM
const TAG_LENGTH = 128; // 128 bits for AES-GCM auth tag

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Initialization vector (base64url encoded) */
  iv: string;
  /** Encrypted ciphertext (base64url encoded) */
  ciphertext: string;
}

/**
 * Generate a new AES-256 encryption key
 *
 * @returns Promise<CryptoKey> A new 256-bit AES key for encryption/decryption
 *
 * @example
 * ```typescript
 * const key = await generateEncryptionKey();
 * // Use key for encryption/decryption operations
 * ```
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
      keyData,
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
      data
    );

    // Return base64url encoded values
    const result = {
      iv: base64UrlEncode(iv),
      ciphertext: base64UrlEncode(new Uint8Array(ciphertext)),
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
    // Decode base64url values
    const iv = base64UrlDecode(encryptedData.iv);
    const ciphertext = base64UrlDecode(encryptedData.ciphertext);

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
        tagLength: TAG_LENGTH,
      },
      key,
      ciphertext
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
 * Base64url encode a Uint8Array
 *
 * @param data - Data to encode
 * @returns Base64url encoded string (URL safe, no padding)
 */
function base64UrlEncode(data: Uint8Array): string {
  // Convert to binary string in chunks to avoid stack overflow
  let binaryString = "";
  const chunkSize = 8192;

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
    binaryString += Array.from(chunk, (byte) => String.fromCharCode(byte)).join(
      ""
    );
  }

  // Convert to base64
  const base64 = btoa(binaryString);

  // Convert to base64url by replacing characters and removing padding
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Base64url decode a string to Uint8Array
 *
 * @param str - Base64url encoded string
 * @returns Decoded data as Uint8Array
 */
function base64UrlDecode(str: string): Uint8Array {
  // Convert base64url to base64 by replacing characters
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if necessary
  const padding = base64.length % 4;
  if (padding) {
    base64 += "=".repeat(4 - padding);
  }

  // Decode base64
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
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
