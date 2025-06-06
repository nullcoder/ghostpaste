/**
 * Binary format encoding/decoding utilities for multi-file support
 *
 * This module provides efficient binary packing/unpacking for multiple files
 * in a single blob, reducing storage overhead and maintaining data integrity.
 */

import {
  BINARY_FORMAT_VERSION,
  MAGIC_NUMBER,
  DEFAULT_SIZE_LIMITS,
  type BinaryHeader,
  type BinarySizeLimits,
} from "@/types/binary";
import { type File } from "@/types/models";
import {
  InvalidBinaryFormatError,
  FileTooLargeError,
  TooManyFilesError,
  PayloadTooLargeError,
  BadRequestError,
} from "./errors";
import { logger } from "./logger";

/**
 * Text encoder/decoder instances
 */
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Convert a 32-bit number to 4 bytes in little-endian format
 */
function uint32ToBytes(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  bytes[0] = value & 0xff;
  bytes[1] = (value >> 8) & 0xff;
  bytes[2] = (value >> 16) & 0xff;
  bytes[3] = (value >> 24) & 0xff;
  return bytes;
}

/**
 * Convert 4 bytes in little-endian format to a 32-bit number
 */
function bytesToUint32(bytes: Uint8Array, offset: number = 0): number {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  );
}

/**
 * Convert a 16-bit number to 2 bytes in little-endian format
 */
function uint16ToBytes(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  bytes[0] = value & 0xff;
  bytes[1] = (value >> 8) & 0xff;
  return bytes;
}

/**
 * Convert 2 bytes in little-endian format to a 16-bit number
 */
function bytesToUint16(bytes: Uint8Array, offset: number = 0): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

/**
 * Encode multiple files into a single binary blob
 *
 * Binary format:
 * - 4 bytes: Magic number "GPST" (0x47505354)
 * - 1 byte: Version
 * - 2 bytes: File count
 * - 4 bytes: Total size
 * - For each file:
 *   - 2 bytes: Filename length
 *   - N bytes: Filename (UTF-8)
 *   - 4 bytes: Content length
 *   - N bytes: Content (UTF-8)
 *   - 1 byte: Language length
 *   - N bytes: Language (UTF-8, optional)
 *
 * @param files - Array of files to encode
 * @param limits - Size limits to enforce
 * @returns Encoded binary data
 * @throws {BadRequestError} If input validation fails
 * @throws {TooManyFilesError} If too many files
 * @throws {FileTooLargeError} If individual file too large
 * @throws {PayloadTooLargeError} If total size too large
 * @throws {InvalidBinaryFormatError} If encoding fails
 */
export function encodeFiles(
  files: File[],
  limits: BinarySizeLimits = DEFAULT_SIZE_LIMITS
): Uint8Array {
  // Validate inputs
  if (!files || files.length === 0) {
    throw new BadRequestError("No files provided for encoding");
  }

  if (files.length > limits.maxFileCount) {
    throw new TooManyFilesError(
      `Too many files: ${files.length} exceeds limit of ${limits.maxFileCount}`
    );
  }

  // Calculate total size and validate limits
  let totalContentSize = 0;
  const encodedFiles: Array<{
    nameBytes: Uint8Array;
    contentBytes: Uint8Array;
    languageBytes: Uint8Array;
  }> = [];

  for (const file of files) {
    // Validate filename
    if (!file.name || file.name.length === 0) {
      throw new BadRequestError("File name cannot be empty");
    }

    if (file.name.length > limits.maxFilenameLength) {
      throw new BadRequestError(
        `Filename too long: ${file.name.length} exceeds limit of ${limits.maxFilenameLength}`
      );
    }

    // Encode strings to UTF-8
    const nameBytes = textEncoder.encode(file.name);
    const contentBytes = textEncoder.encode(file.content || "");
    const languageBytes = textEncoder.encode(file.language || "");

    // Validate individual file size
    if (contentBytes.length > limits.maxFileSize) {
      throw new FileTooLargeError(
        `File "${file.name}" too large: ${contentBytes.length} bytes exceeds limit of ${limits.maxFileSize}`
      );
    }

    // Validate language length
    if (languageBytes.length > limits.maxLanguageLength) {
      throw new BadRequestError(
        `Language identifier too long: ${languageBytes.length} exceeds limit of ${limits.maxLanguageLength}`
      );
    }

    totalContentSize += contentBytes.length;
    encodedFiles.push({ nameBytes, contentBytes, languageBytes });
  }

  // Validate total size
  if (totalContentSize > limits.maxTotalSize) {
    throw new PayloadTooLargeError(
      `Total size too large: ${totalContentSize} bytes exceeds limit of ${limits.maxTotalSize}`
    );
  }

  // Calculate total binary size
  // Header: 4 (magic) + 1 (version) + 2 (file count) + 4 (total size) = 11 bytes
  let totalBinarySize = 11;

  for (const { nameBytes, contentBytes, languageBytes } of encodedFiles) {
    // Per file: 2 (name length) + name + 4 (content length) + content + 1 (lang length) + lang
    totalBinarySize +=
      2 + nameBytes.length + 4 + contentBytes.length + 1 + languageBytes.length;
  }

  // Create binary buffer
  const buffer = new Uint8Array(totalBinarySize);
  let offset = 0;

  // Write header
  // Magic number (4 bytes)
  buffer.set(uint32ToBytes(MAGIC_NUMBER), offset);
  offset += 4;

  // Version (1 byte)
  buffer[offset] = BINARY_FORMAT_VERSION;
  offset += 1;

  // File count (2 bytes)
  buffer.set(uint16ToBytes(files.length), offset);
  offset += 2;

  // Total content size (4 bytes)
  buffer.set(uint32ToBytes(totalContentSize), offset);
  offset += 4;

  // Write files
  for (let i = 0; i < files.length; i++) {
    const { nameBytes, contentBytes, languageBytes } = encodedFiles[i];

    // Filename length (2 bytes)
    buffer.set(uint16ToBytes(nameBytes.length), offset);
    offset += 2;

    // Filename
    buffer.set(nameBytes, offset);
    offset += nameBytes.length;

    // Content length (4 bytes)
    buffer.set(uint32ToBytes(contentBytes.length), offset);
    offset += 4;

    // Content
    buffer.set(contentBytes, offset);
    offset += contentBytes.length;

    // Language length (1 byte)
    buffer[offset] = languageBytes.length;
    offset += 1;

    // Language (if present)
    if (languageBytes.length > 0) {
      buffer.set(languageBytes, offset);
      offset += languageBytes.length;
    }
  }

  logger.debug("Encoded files to binary format", {
    fileCount: files.length,
    totalContentSize,
    totalBinarySize,
    compressionRatio: (totalBinarySize / totalContentSize).toFixed(2),
  });

  return buffer;
}

/**
 * Decode binary blob back to individual files
 *
 * @param data - Binary data to decode
 * @param limits - Size limits to validate against
 * @returns Array of decoded files
 * @throws {InvalidBinaryFormatError} If data is invalid or corrupted
 */
export function decodeFiles(
  data: Uint8Array,
  limits: BinarySizeLimits = DEFAULT_SIZE_LIMITS
): File[] {
  if (!data || data.length < 11) {
    throw new InvalidBinaryFormatError(
      "Binary data too small to contain valid header"
    );
  }

  let offset = 0;

  // Read and validate magic number
  const magic = bytesToUint32(data, offset);
  if (magic !== MAGIC_NUMBER) {
    throw new InvalidBinaryFormatError(
      `Invalid magic number: expected ${MAGIC_NUMBER.toString(16)}, got ${magic.toString(16)}`
    );
  }
  offset += 4;

  // Read and validate version
  const version = data[offset];
  if (version !== BINARY_FORMAT_VERSION) {
    throw new InvalidBinaryFormatError(
      `Unsupported version: expected ${BINARY_FORMAT_VERSION}, got ${version}`
    );
  }
  offset += 1;

  // Read file count
  const fileCount = bytesToUint16(data, offset);
  if (fileCount === 0 || fileCount > limits.maxFileCount) {
    throw new InvalidBinaryFormatError(
      `Invalid file count: ${fileCount} (must be 1-${limits.maxFileCount})`
    );
  }
  offset += 2;

  // Read total size
  const totalSize = bytesToUint32(data, offset);
  if (totalSize > limits.maxTotalSize) {
    throw new InvalidBinaryFormatError(
      `Total size too large: ${totalSize} exceeds limit of ${limits.maxTotalSize}`
    );
  }
  offset += 4;

  // Decode files
  const files: File[] = [];
  let decodedSize = 0;

  try {
    for (let i = 0; i < fileCount; i++) {
      // Check remaining data
      if (offset + 2 > data.length) {
        throw new InvalidBinaryFormatError(
          `Unexpected end of data while reading file ${i + 1}`
        );
      }

      // Read filename length
      const nameLength = bytesToUint16(data, offset);
      offset += 2;

      if (nameLength === 0 || nameLength > limits.maxFilenameLength) {
        throw new InvalidBinaryFormatError(
          `Invalid filename length: ${nameLength} for file ${i + 1}`
        );
      }

      // Read filename
      if (offset + nameLength > data.length) {
        throw new InvalidBinaryFormatError(
          `Unexpected end of data while reading filename for file ${i + 1}`
        );
      }

      const nameBytes = data.slice(offset, offset + nameLength);
      const name = textDecoder.decode(nameBytes);
      offset += nameLength;

      // Read content length
      if (offset + 4 > data.length) {
        throw new InvalidBinaryFormatError(
          `Unexpected end of data while reading content length for file ${i + 1}`
        );
      }

      const contentLength = bytesToUint32(data, offset);
      offset += 4;

      if (contentLength > limits.maxFileSize) {
        throw new InvalidBinaryFormatError(
          `File too large: ${contentLength} exceeds limit of ${limits.maxFileSize}`
        );
      }

      // Read content
      if (offset + contentLength > data.length) {
        throw new InvalidBinaryFormatError(
          `Unexpected end of data while reading content for file ${i + 1}`
        );
      }

      const contentBytes = data.slice(offset, offset + contentLength);
      const content = textDecoder.decode(contentBytes);
      offset += contentLength;
      decodedSize += contentLength;

      // Read language length
      if (offset >= data.length) {
        throw new InvalidBinaryFormatError(
          `Unexpected end of data while reading language length for file ${i + 1}`
        );
      }

      const languageLength = data[offset];
      offset += 1;

      if (languageLength > limits.maxLanguageLength) {
        throw new InvalidBinaryFormatError(
          `Language identifier too long: ${languageLength} exceeds limit of ${limits.maxLanguageLength}`
        );
      }

      // Read language (optional)
      let language: string | undefined;
      if (languageLength > 0) {
        if (offset + languageLength > data.length) {
          throw new InvalidBinaryFormatError(
            `Unexpected end of data while reading language for file ${i + 1}`
          );
        }

        const languageBytes = data.slice(offset, offset + languageLength);
        language = textDecoder.decode(languageBytes);
        offset += languageLength;
      }

      files.push({ name, content, language });
    }
  } catch (error) {
    if (error instanceof InvalidBinaryFormatError) {
      throw error;
    }
    // Handle TextDecoder errors
    throw new InvalidBinaryFormatError(
      "Failed to decode text data: invalid UTF-8",
      {
        originalError: error,
      }
    );
  }

  // Verify total size matches
  if (decodedSize !== totalSize) {
    throw new InvalidBinaryFormatError(
      `Size mismatch: decoded ${decodedSize} bytes, expected ${totalSize}`
    );
  }

  logger.debug("Decoded binary format to files", {
    fileCount: files.length,
    totalSize,
    dataSize: data.length,
  });

  return files;
}

/**
 * Validate binary format without fully decoding
 *
 * This is a lighter-weight validation that checks the format structure
 * without decoding all content, useful for quick validation checks.
 *
 * @param data - Binary data to validate
 * @param limits - Size limits to validate against
 * @returns True if format is valid
 * @throws {InvalidBinaryFormatError} If format is invalid
 */
export function validateBinaryFormat(
  data: Uint8Array,
  limits: BinarySizeLimits = DEFAULT_SIZE_LIMITS
): boolean {
  if (!data || data.length < 11) {
    throw new InvalidBinaryFormatError(
      "Binary data too small to contain valid header"
    );
  }

  // Validate magic number
  const magic = bytesToUint32(data, 0);
  if (magic !== MAGIC_NUMBER) {
    throw new InvalidBinaryFormatError("Invalid magic number");
  }

  // Validate version
  const version = data[4];
  if (version !== BINARY_FORMAT_VERSION) {
    throw new InvalidBinaryFormatError("Unsupported version");
  }

  // Validate file count
  const fileCount = bytesToUint16(data, 5);
  if (fileCount === 0 || fileCount > limits.maxFileCount) {
    throw new InvalidBinaryFormatError("Invalid file count");
  }

  // Validate total size
  const totalSize = bytesToUint32(data, 7);
  if (totalSize > limits.maxTotalSize) {
    throw new InvalidBinaryFormatError("Total size exceeds limit");
  }

  // Quick structural validation without full decode
  let offset = 11;
  let calculatedSize = 0;

  for (let i = 0; i < fileCount; i++) {
    // Check filename length
    if (offset + 2 > data.length) {
      throw new InvalidBinaryFormatError(
        "Truncated data: missing filename length"
      );
    }

    const nameLength = bytesToUint16(data, offset);
    if (nameLength === 0 || nameLength > limits.maxFilenameLength) {
      throw new InvalidBinaryFormatError("Invalid filename length");
    }
    offset += 2 + nameLength;

    // Check content length
    if (offset + 4 > data.length) {
      throw new InvalidBinaryFormatError(
        "Truncated data: missing content length"
      );
    }

    const contentLength = bytesToUint32(data, offset);
    if (contentLength > limits.maxFileSize) {
      throw new InvalidBinaryFormatError("File size exceeds limit");
    }
    calculatedSize += contentLength;
    offset += 4 + contentLength;

    // Check language length
    if (offset >= data.length) {
      throw new InvalidBinaryFormatError(
        "Truncated data: missing language length"
      );
    }

    const languageLength = data[offset];
    if (languageLength > limits.maxLanguageLength) {
      throw new InvalidBinaryFormatError("Language identifier too long");
    }
    offset += 1 + languageLength;
  }

  // Verify we consumed exactly the right amount of data
  if (offset !== data.length) {
    throw new InvalidBinaryFormatError("Extra data after files");
  }

  // Verify total size matches
  if (calculatedSize !== totalSize) {
    throw new InvalidBinaryFormatError("Total size mismatch");
  }

  return true;
}

/**
 * Extract header information from binary data without full decode
 *
 * @param data - Binary data to read header from
 * @returns Binary header information
 * @throws {InvalidBinaryFormatError} If header is invalid
 */
export function extractHeader(data: Uint8Array): BinaryHeader {
  if (!data || data.length < 11) {
    throw new InvalidBinaryFormatError(
      "Binary data too small to contain valid header"
    );
  }

  const magic = bytesToUint32(data, 0);
  const version = data[4];
  const fileCount = bytesToUint16(data, 5);
  const totalSize = bytesToUint32(data, 7);

  return {
    magic,
    version,
    fileCount,
    totalSize,
  };
}
