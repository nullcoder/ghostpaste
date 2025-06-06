import { FILE_LIMITS, GIST_LIMITS } from "./constants";
import {
  BadRequestError,
  PayloadTooLargeError,
  TooManyFilesError,
} from "./errors";

/**
 * Validation utilities for input sanitization and security
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 * @param input - The string to sanitize
 * @param maxLength - Maximum allowed length
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== "string") {
    return "";
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized;
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param input - The HTML string to sanitize
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Basic HTML entity encoding
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate and sanitize a filename
 * @param filename - The filename to validate
 */
export function validateFilename(filename: string): string {
  if (!filename || typeof filename !== "string") {
    throw new BadRequestError("Filename is required");
  }

  // Remove path separators and other dangerous characters
  let sanitized = filename.replace(/[\/\\:*?"<>|]/g, "_").trim();

  // Handle special cases
  if (sanitized === ".") {
    return sanitized; // single dot is allowed
  }

  // Replace multiple dots
  sanitized = sanitized.replace(/\.{2,}/g, "_");

  // Ensure filename is not empty after sanitization
  if (!sanitized) {
    throw new BadRequestError("Invalid filename");
  }

  // Limit filename length
  if (sanitized.length > 255) {
    sanitized = sanitized.slice(0, 255);
  }

  return sanitized;
}

/**
 * Validate gist ID format
 * @param id - The gist ID to validate
 */
export function validateGistId(id: string): string {
  if (!id || typeof id !== "string") {
    throw new BadRequestError("Gist ID is required");
  }

  // Remove any non-alphanumeric characters
  const sanitized = id.replace(/[^a-zA-Z0-9-_]/g, "");

  // Check length (assuming nanoid default length)
  if (sanitized.length < 8 || sanitized.length > 32) {
    throw new BadRequestError("Invalid gist ID format");
  }

  return sanitized;
}

/**
 * Validate PIN format (like a password)
 * @param pin - The PIN to validate
 */
export function validatePin(pin: string): string {
  if (!pin || typeof pin !== "string") {
    throw new BadRequestError("PIN is required");
  }

  // PIN should be 4-20 characters
  if (pin.length < 4 || pin.length > 20) {
    throw new BadRequestError("PIN must be 4-20 characters");
  }

  // Allow alphanumeric and common special characters
  if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(pin)) {
    throw new BadRequestError("PIN contains invalid characters");
  }

  // Require at least one letter and one number for basic security
  if (!/[a-zA-Z]/.test(pin) || !/[0-9]/.test(pin)) {
    throw new BadRequestError(
      "PIN must contain at least one letter and one number"
    );
  }

  return pin;
}

/**
 * Validate file size
 * @param size - The file size in bytes
 */
export function validateFileSize(size: number): void {
  if (typeof size !== "number" || size < 0) {
    throw new BadRequestError("Invalid file size");
  }

  if (size > FILE_LIMITS.MAX_FILE_SIZE) {
    throw new PayloadTooLargeError(
      `File size exceeds maximum of ${FILE_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }
}

/**
 * Validate total gist size
 * @param totalSize - The total size in bytes
 */
export function validateGistSize(totalSize: number): void {
  if (typeof totalSize !== "number" || totalSize < 0) {
    throw new BadRequestError("Invalid gist size");
  }

  if (totalSize > FILE_LIMITS.MAX_TOTAL_SIZE) {
    throw new PayloadTooLargeError(
      `Total gist size exceeds maximum of ${FILE_LIMITS.MAX_TOTAL_SIZE / 1024 / 1024}MB`
    );
  }
}

/**
 * Validate number of files
 * @param count - The number of files
 */
export function validateFileCount(count: number): void {
  if (typeof count !== "number" || count < 0) {
    throw new BadRequestError("Invalid file count");
  }

  if (count > FILE_LIMITS.MAX_FILE_COUNT) {
    throw new TooManyFilesError(
      `Number of files exceeds maximum of ${FILE_LIMITS.MAX_FILE_COUNT}`
    );
  }
}

/**
 * Validate ISO 8601 date string
 * @param dateString - The date string to validate
 * @returns ISO 8601 formatted date string
 */
export function validateISODate(dateString: string): string {
  if (!dateString || typeof dateString !== "string") {
    throw new BadRequestError("Date string is required");
  }

  // Check if it's a valid ISO 8601 format
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!iso8601Regex.test(dateString)) {
    throw new BadRequestError(
      "Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)"
    );
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new BadRequestError("Invalid date");
  }

  return dateString;
}

/**
 * Validate expiry time
 * @param expiresAt - The expiry timestamp (ISO 8601 string or Date)
 * @returns ISO 8601 formatted date string
 */
export function validateExpiry(expiresAt: string | Date): string {
  // Convert to ISO string if Date object
  const dateString =
    typeof expiresAt === "string"
      ? validateISODate(expiresAt)
      : expiresAt.toISOString();

  const date = new Date(dateString);
  const now = new Date();
  const maxExpiry = new Date(
    now.getTime() + GIST_LIMITS.MAX_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );

  if (date <= now) {
    throw new BadRequestError("Expiry date must be in the future");
  }

  if (date > maxExpiry) {
    throw new BadRequestError(
      `Expiry date cannot be more than ${GIST_LIMITS.MAX_EXPIRY_DAYS} days in the future`
    );
  }

  return dateString;
}

/**
 * Validate URL format
 * @param url - The URL to validate
 */
export function validateUrl(url: string): URL {
  if (!url || typeof url !== "string") {
    throw new BadRequestError("URL is required");
  }

  try {
    const parsed = new URL(url);

    // Only allow http(s) protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new BadRequestError("Invalid URL protocol");
    }

    return parsed;
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new BadRequestError("Invalid URL format");
  }
}

/**
 * Validate and sanitize JSON data
 * @param data - The data to validate
 * @param maxDepth - Maximum nesting depth
 */
export function validateJson(data: unknown, maxDepth = 10): unknown {
  function checkDepth(obj: unknown, currentDepth: number): void {
    if (currentDepth > maxDepth) {
      throw new BadRequestError("JSON structure too deeply nested");
    }

    if (Array.isArray(obj)) {
      obj.forEach((item) => checkDepth(item, currentDepth + 1));
    } else if (obj !== null && typeof obj === "object") {
      Object.values(obj).forEach((value) =>
        checkDepth(value, currentDepth + 1)
      );
    }
  }

  checkDepth(data, 0);
  return data;
}

/**
 * Validate content type
 * @param contentType - The content type to validate
 * @param allowedTypes - List of allowed content types
 */
export function validateContentType(
  contentType: string,
  allowedTypes: string[]
): string {
  if (!contentType || typeof contentType !== "string") {
    throw new BadRequestError("Content type is required");
  }

  const normalized = contentType.toLowerCase().split(";")[0].trim();

  if (!allowedTypes.includes(normalized)) {
    throw new BadRequestError(
      `Invalid content type. Allowed types: ${allowedTypes.join(", ")}`
    );
  }

  return normalized;
}
