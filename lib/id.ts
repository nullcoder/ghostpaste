import { nanoid, customAlphabet } from "nanoid";

/**
 * ID generation utilities using nanoid
 *
 * Provides secure, URL-safe ID generation for gists and other entities
 */

/**
 * Default ID length for gists
 */
const DEFAULT_ID_LENGTH = 12;

/**
 * Custom alphabet for readable IDs (excludes ambiguous characters)
 * Removes: 0, O, I, l to avoid confusion
 */
const READABLE_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Custom alphabet for short IDs (alphanumeric only)
 */
const ALPHANUMERIC_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * Generate a secure random ID for gists
 * @param length - Length of the ID (default: 12)
 * @returns URL-safe random ID
 */
export function generateGistId(length = DEFAULT_ID_LENGTH): string {
  return nanoid(length);
}

/**
 * Generate a readable ID (excludes ambiguous characters)
 * @param length - Length of the ID (default: 12)
 * @returns Readable random ID
 */
export function generateReadableId(length = DEFAULT_ID_LENGTH): string {
  const generate = customAlphabet(READABLE_ALPHABET, length);
  return generate();
}

/**
 * Generate a short alphanumeric ID
 * @param length - Length of the ID (default: 8)
 * @returns Alphanumeric ID
 */
export function generateShortId(length = 8): string {
  const generate = customAlphabet(ALPHANUMERIC_ALPHABET, length);
  return generate();
}

/**
 * Generate a prefixed ID (e.g., "gist_abc123")
 * @param prefix - Prefix for the ID
 * @param length - Length of the random part (default: 12)
 * @returns Prefixed ID
 */
export function generatePrefixedId(
  prefix: string,
  length = DEFAULT_ID_LENGTH
): string {
  return `${prefix}_${nanoid(length)}`;
}

/**
 * Generate a timestamp-based ID for sorting
 * Combines timestamp with random suffix for uniqueness
 * @param length - Length of the random suffix (default: 8)
 * @returns Timestamp-based ID
 */
export function generateTimestampId(length = 8): string {
  const timestamp = Date.now().toString(36); // Base36 for shorter representation
  const suffix = nanoid(length);
  return `${timestamp}_${suffix}`;
}

/**
 * Generate a version ID for gist versions
 * @returns Version ID in format "v_<timestamp>_<random>"
 */
export function generateVersionId(): string {
  const timestamp = Date.now().toString(36);
  const random = generateShortId(6);
  return `v_${timestamp}_${random}`;
}

/**
 * Validate if a string is a valid nanoid
 * @param id - The ID to validate
 * @param expectedLength - Expected length of the ID
 * @returns True if valid nanoid format
 */
export function isValidNanoId(id: string, expectedLength?: number): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }

  // Check if it contains only URL-safe characters
  const urlSafeRegex = /^[A-Za-z0-9_-]+$/;
  if (!urlSafeRegex.test(id)) {
    return false;
  }

  // Check length if specified
  if (expectedLength !== undefined && id.length !== expectedLength) {
    return false;
  }

  return true;
}

/**
 * Extract timestamp from a timestamp-based ID
 * @param id - The timestamp ID
 * @returns Date object or null if invalid
 */
export function extractTimestamp(id: string): Date | null {
  if (!id || !id.includes("_")) {
    return null;
  }

  const [timestampPart] = id.split("_");
  const timestamp = parseInt(timestampPart, 36);

  if (isNaN(timestamp) || timestamp <= 0) {
    return null;
  }

  // Validate that the timestamp is reasonable (not too far in past or future)
  const date = new Date(timestamp);
  const now = Date.now();
  const yearInMs = 365 * 24 * 60 * 60 * 1000;

  // Check if date is within reasonable bounds (100 years past to 100 years future)
  if (timestamp < now - 100 * yearInMs || timestamp > now + 100 * yearInMs) {
    return null;
  }

  return date;
}

/**
 * Generate a collision-resistant ID by combining multiple sources
 * Useful for critical unique constraints
 * @returns Highly unique ID
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random1 = nanoid(8);
  const random2 = Math.random().toString(36).substring(2, 8).padEnd(6, "0");
  return `${timestamp}_${random1}_${random2}`;
}
