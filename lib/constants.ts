/**
 * Application constants and limits for GhostPaste
 */

import {
  DEFAULT_SIZE_LIMITS,
  MAGIC_NUMBER,
  BINARY_FORMAT_VERSION,
  DEFAULT_R2_CONFIG,
} from "@/types";

/**
 * File size limits
 * Re-exported from types for convenience
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE: DEFAULT_SIZE_LIMITS.maxFileSize,
  MAX_TOTAL_SIZE: DEFAULT_SIZE_LIMITS.maxTotalSize,
  MAX_FILE_COUNT: DEFAULT_SIZE_LIMITS.maxFileCount,
  MAX_FILENAME_LENGTH: DEFAULT_SIZE_LIMITS.maxFilenameLength,
  MAX_LANGUAGE_LENGTH: DEFAULT_SIZE_LIMITS.maxLanguageLength,
} as const;

/**
 * Gist metadata limits
 */
export const GIST_LIMITS = {
  MAX_DESCRIPTION_LENGTH: 1000, // Maximum description length
  MIN_PIN_LENGTH: 4, // Minimum PIN length
  MAX_PIN_LENGTH: 20, // Maximum PIN length
} as const;

/**
 * Expiry options and their durations in milliseconds
 */
export const EXPIRY_DURATIONS = {
  never: null,
  "1hour": 60 * 60 * 1000,
  "24hours": 24 * 60 * 60 * 1000,
  "7days": 7 * 24 * 60 * 60 * 1000,
  "30days": 30 * 24 * 60 * 60 * 1000,
} as const;

export type ExpiryOption = keyof typeof EXPIRY_DURATIONS;

/**
 * Default editor preferences
 */
export const DEFAULT_EDITOR_PREFERENCES = {
  indentMode: "spaces" as const,
  indentSize: 2,
  wrapMode: "soft" as const,
  theme: "auto" as const,
};

/**
 * Supported indent sizes
 */
export const INDENT_SIZES = [2, 4, 8] as const;

/**
 * Encryption constants
 */
export const ENCRYPTION = {
  ALGORITHM: "AES-GCM",
  KEY_LENGTH: 256, // bits
  IV_LENGTH: 12, // bytes
  SALT_LENGTH: 16, // bytes
  ITERATIONS: 100000, // PBKDF2 iterations
  TAG_LENGTH: 16, // bytes
} as const;

/**
 * Binary format constants
 * Using values from types/binary.ts
 */
export const BINARY_FORMAT = {
  MAGIC_NUMBER,
  VERSION: BINARY_FORMAT_VERSION,
  HEADER_SIZE: 11, // bytes (4 + 1 + 2 + 4)
} as const;

/**
 * R2 storage prefixes
 * Using values from types/env.ts
 */
export const STORAGE_PREFIXES = {
  GISTS: DEFAULT_R2_CONFIG.gistPrefix,
  BLOBS: DEFAULT_R2_CONFIG.blobPrefix,
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Rate limiting defaults
 */
export const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 60,
  REQUESTS_PER_HOUR: 300,
  CREATE_PER_HOUR: 10,
} as const;

/**
 * Cache control headers
 */
export const CACHE_CONTROL = {
  NO_STORE: "no-store",
  PRIVATE_NO_CACHE: "private, no-cache",
  PUBLIC_IMMUTABLE: "public, max-age=31536000, immutable",
  PUBLIC_SHORT: "public, max-age=300",
} as const;

/**
 * Content types
 */
export const CONTENT_TYPES = {
  JSON: "application/json",
  OCTET_STREAM: "application/octet-stream",
  TEXT_PLAIN: "text/plain",
  TEXT_HTML: "text/html",
} as const;

/**
 * Validation helpers
 */
export function isValidFileSize(size: number): boolean {
  return size > 0 && size <= FILE_LIMITS.MAX_FILE_SIZE;
}

export function isValidTotalSize(size: number): boolean {
  return size > 0 && size <= FILE_LIMITS.MAX_TOTAL_SIZE;
}

export function isValidFileCount(count: number): boolean {
  return count > 0 && count <= FILE_LIMITS.MAX_FILE_COUNT;
}

export function isValidFilename(filename: string): boolean {
  return (
    filename.length > 0 &&
    filename.length <= FILE_LIMITS.MAX_FILENAME_LENGTH &&
    !filename.includes("/") &&
    !filename.includes("\\")
  );
}

export function isValidPin(pin: string): boolean {
  return (
    pin.length >= GIST_LIMITS.MIN_PIN_LENGTH &&
    pin.length <= GIST_LIMITS.MAX_PIN_LENGTH
  );
}

export function isValidExpiryOption(expiry: string): expiry is ExpiryOption {
  return expiry in EXPIRY_DURATIONS;
}

export function getExpiryDate(option: ExpiryOption): Date | null {
  const duration = EXPIRY_DURATIONS[option];
  if (duration === null) {
    return null;
  }
  return new Date(Date.now() + duration);
}

export function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) {
    return false;
  }
  return new Date(expiresAt) <= new Date();
}
