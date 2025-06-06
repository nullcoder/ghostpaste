/**
 * Base64 encoding/decoding utilities
 *
 * Provides both standard and URL-safe base64 encoding/decoding functions
 * for use throughout the application.
 */

import { logger } from "./logger";

/**
 * Standard base64 encode a Uint8Array
 *
 * Used for internal storage (database, JSON, etc.)
 * Output includes padding and may contain +, / characters
 *
 * @param data - Data to encode
 * @returns Standard base64 encoded string
 *
 * @example
 * ```typescript
 * const encoded = base64Encode(new Uint8Array([1, 2, 3]));
 * // Returns: "AQID"
 * ```
 */
export function base64Encode(data: Uint8Array): string {
  try {
    // For edge runtime compatibility, we need to handle large data in chunks
    // to avoid "Maximum call stack size exceeded" errors
    if (data.length > 8192) {
      // Handle large data in chunks
      let binaryString = "";
      const chunkSize = 8192;

      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, Math.min(i + chunkSize, data.length));
        binaryString += String.fromCharCode(...chunk);
      }

      return btoa(binaryString);
    } else {
      // For small data, use the simpler approach
      return btoa(String.fromCharCode(...data));
    }
  } catch (error) {
    logger.error("Failed to base64 encode data", error as Error);
    throw new Error("Failed to encode data to base64");
  }
}

/**
 * Standard base64 decode a string to Uint8Array
 *
 * Used for internal storage (database, JSON, etc.)
 * Accepts standard base64 with padding
 *
 * @param str - Base64 encoded string
 * @returns Decoded data as Uint8Array
 *
 * @example
 * ```typescript
 * const decoded = base64Decode("AQID");
 * // Returns: Uint8Array([1, 2, 3])
 * ```
 */
export function base64Decode(str: string): Uint8Array {
  try {
    // Use built-in atob for decoding
    return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
  } catch (error) {
    logger.error("Failed to base64 decode data", error as Error);
    throw new Error("Failed to decode data from base64");
  }
}

/**
 * URL-safe base64 encode a Uint8Array
 *
 * Used for encoding data that will be included in URLs
 * Replaces +/= with URL-safe characters -_
 * Removes padding for cleaner URLs
 *
 * @param data - Data to encode
 * @returns URL-safe base64 encoded string (no padding)
 *
 * @example
 * ```typescript
 * const key = base64UrlEncode(cryptoKeyBytes);
 * const url = `https://example.com#key=${key}`;
 * ```
 */
export function base64UrlEncode(data: Uint8Array): string {
  try {
    // First encode to standard base64
    const base64 = base64Encode(data);

    // Convert to URL-safe format
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, ""); // Remove padding
  } catch (error) {
    logger.error("Failed to base64url encode data", error as Error);
    throw new Error("Failed to encode data to base64url");
  }
}

/**
 * URL-safe base64 decode a string to Uint8Array
 *
 * Used for decoding data from URLs
 * Handles URL-safe characters and missing padding
 *
 * @param str - URL-safe base64 encoded string
 * @returns Decoded data as Uint8Array
 *
 * @example
 * ```typescript
 * const keyString = getKeyFromUrl(); // e.g., from #key=...
 * const keyBytes = base64UrlDecode(keyString);
 * ```
 */
export function base64UrlDecode(str: string): Uint8Array {
  try {
    // Convert URL-safe characters back to standard base64
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if necessary
    const padding = base64.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }

    // Decode using standard base64
    return base64Decode(base64);
  } catch (error) {
    logger.error("Failed to base64url decode data", error as Error);
    throw new Error("Failed to decode data from base64url");
  }
}

/**
 * Check if a string is valid base64
 *
 * @param str - String to validate
 * @param urlSafe - Whether to check for URL-safe base64
 * @returns True if valid base64
 */
export function isValidBase64(str: string, urlSafe = false): boolean {
  if (typeof str !== "string") {
    return false;
  }

  // Empty string is valid base64
  if (str === "") {
    return true;
  }

  if (urlSafe) {
    // URL-safe base64 pattern (no padding)
    return /^[A-Za-z0-9_-]+$/.test(str);
  } else {
    // Standard base64 pattern (with optional padding)
    return /^[A-Za-z0-9+/]*={0,2}$/.test(str);
  }
}
