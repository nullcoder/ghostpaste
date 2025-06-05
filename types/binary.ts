/**
 * Binary format types for efficient file encoding
 */

/**
 * Binary format version for future compatibility
 */
export const BINARY_FORMAT_VERSION = 1;

/**
 * Magic number to identify binary format (4 bytes: "GPST")
 */
export const MAGIC_NUMBER = 0x47505354; // "GPST" in hex

/**
 * Binary format header structure
 */
export interface BinaryHeader {
  magic: number; // 4 bytes: Magic number (0x47505354)
  version: number; // 1 byte: Format version
  fileCount: number; // 2 bytes: Number of files
  totalSize: number; // 4 bytes: Total size of all files
}

/**
 * File entry in binary format
 */
export interface BinaryFileEntry {
  nameLength: number; // 2 bytes: Length of filename
  name: string; // Variable: UTF-8 encoded filename
  contentLength: number; // 4 bytes: Length of file content
  content: Uint8Array; // Variable: File content
  languageLength: number; // 1 byte: Length of language string
  language?: string; // Variable: Optional language identifier
}

/**
 * Complete binary format structure
 */
export interface BinaryFormat {
  header: BinaryHeader;
  files: BinaryFileEntry[];
}

/**
 * Size limits for binary format
 */
export interface BinarySizeLimits {
  maxFileSize: number; // 500KB per file
  maxTotalSize: number; // 5MB total
  maxFileCount: number; // 20 files maximum
  maxFilenameLength: number; // 255 characters
  maxLanguageLength: number; // 50 characters
}

/**
 * Default size limits
 */
export const DEFAULT_SIZE_LIMITS: BinarySizeLimits = {
  maxFileSize: 500 * 1024, // 500KB
  maxTotalSize: 5 * 1024 * 1024, // 5MB
  maxFileCount: 20,
  maxFilenameLength: 255,
  maxLanguageLength: 50,
};

/**
 * Binary encoding/decoding result
 */
export interface BinaryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Type guards for binary format validation
 */
export function isBinaryHeader(obj: any): obj is BinaryHeader {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.magic === "number" &&
    typeof obj.version === "number" &&
    typeof obj.fileCount === "number" &&
    typeof obj.totalSize === "number"
  );
}

export function isBinaryFileEntry(obj: any): obj is BinaryFileEntry {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.nameLength === "number" &&
    typeof obj.name === "string" &&
    typeof obj.contentLength === "number" &&
    obj.content instanceof Uint8Array &&
    typeof obj.languageLength === "number" &&
    (obj.language === undefined || typeof obj.language === "string")
  );
}
