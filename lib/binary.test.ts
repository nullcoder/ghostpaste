/**
 * Tests for binary.ts - Binary format encoding/decoding utilities
 */

import { describe, it, expect } from "vitest";
import {
  encodeFiles,
  decodeFiles,
  validateBinaryFormat,
  extractHeader,
} from "./binary";
import {
  MAGIC_NUMBER,
  BINARY_FORMAT_VERSION,
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

describe("Binary Module", () => {
  // Test data
  const sampleFiles: File[] = [
    {
      name: "test.js",
      content: "console.log('Hello, World!');",
      language: "javascript",
    },
    {
      name: "README.md",
      content: "# Test Project\n\nThis is a test.",
      language: "markdown",
    },
    {
      name: "empty.txt",
      content: "",
    },
  ];

  const singleFile: File[] = [
    {
      name: "index.html",
      content: "<!DOCTYPE html>\n<html><body>Test</body></html>",
      language: "html",
    },
  ];

  describe("encodeFiles", () => {
    it("should encode a single file correctly", () => {
      const encoded = encodeFiles(singleFile);

      expect(encoded).toBeInstanceOf(Uint8Array);
      expect(encoded.length).toBeGreaterThan(11); // At least header size

      // Verify magic number
      const magic =
        encoded[0] |
        (encoded[1] << 8) |
        (encoded[2] << 16) |
        (encoded[3] << 24);
      expect(magic).toBe(MAGIC_NUMBER);

      // Verify version
      expect(encoded[4]).toBe(BINARY_FORMAT_VERSION);

      // Verify file count
      const fileCount = encoded[5] | (encoded[6] << 8);
      expect(fileCount).toBe(1);
    });

    it("should encode multiple files correctly", () => {
      const encoded = encodeFiles(sampleFiles);

      expect(encoded).toBeInstanceOf(Uint8Array);

      // Extract header
      const header = extractHeader(encoded);
      expect(header.magic).toBe(MAGIC_NUMBER);
      expect(header.version).toBe(BINARY_FORMAT_VERSION);
      expect(header.fileCount).toBe(3);

      // Verify we can decode it back
      const decoded = decodeFiles(encoded);
      expect(decoded).toHaveLength(3);
    });

    it("should handle empty file content", () => {
      const filesWithEmpty: File[] = [
        {
          name: "empty.txt",
          content: "",
        },
      ];

      const encoded = encodeFiles(filesWithEmpty);
      const decoded = decodeFiles(encoded);

      expect(decoded).toHaveLength(1);
      expect(decoded[0].name).toBe("empty.txt");
      expect(decoded[0].content).toBe("");
    });

    it("should handle files without language field", () => {
      const filesNoLang: File[] = [
        {
          name: "test.txt",
          content: "Test content",
        },
      ];

      const encoded = encodeFiles(filesNoLang);
      const decoded = decodeFiles(encoded);

      expect(decoded).toHaveLength(1);
      expect(decoded[0].language).toBeUndefined();
    });

    it("should handle Unicode filenames and content", () => {
      const unicodeFiles: File[] = [
        {
          name: "测试文件.txt",
          content: "Hello 世界! 🌍 Привет мир",
          language: "text",
        },
        {
          name: "émojis 😀.js",
          content: "const greeting = '👋';",
          language: "javascript",
        },
      ];

      const encoded = encodeFiles(unicodeFiles);
      const decoded = decodeFiles(encoded);

      expect(decoded).toHaveLength(2);
      expect(decoded[0].name).toBe("测试文件.txt");
      expect(decoded[0].content).toBe("Hello 世界! 🌍 Привет мир");
      expect(decoded[1].name).toBe("émojis 😀.js");
      expect(decoded[1].content).toBe("const greeting = '👋';");
    });

    it("should handle special characters in content", () => {
      const specialFiles: File[] = [
        {
          name: "special.txt",
          content: "Line 1\nLine 2\r\nLine 3\tTabbed\0Null",
        },
      ];

      const encoded = encodeFiles(specialFiles);
      const decoded = decodeFiles(encoded);

      expect(decoded[0].content).toBe("Line 1\nLine 2\r\nLine 3\tTabbed\0Null");
    });

    it("should throw error for empty file array", () => {
      expect(() => encodeFiles([])).toThrow(BadRequestError);
      expect(() => encodeFiles([])).toThrow("No files provided");
    });

    it("should throw error for empty filename", () => {
      const invalidFiles: File[] = [
        {
          name: "",
          content: "Test",
        },
      ];

      expect(() => encodeFiles(invalidFiles)).toThrow(BadRequestError);
      expect(() => encodeFiles(invalidFiles)).toThrow(
        "File name cannot be empty"
      );
    });

    it("should throw error for too many files", () => {
      const tooManyFiles: File[] = Array(25).fill({
        name: "test.txt",
        content: "Test",
      });

      expect(() => encodeFiles(tooManyFiles)).toThrow(TooManyFilesError);
      expect(() => encodeFiles(tooManyFiles)).toThrow("Too many files");
    });

    it("should throw error for oversized file", () => {
      const oversizedFiles: File[] = [
        {
          name: "large.txt",
          content: "x".repeat(600 * 1024), // 600KB
        },
      ];

      expect(() => encodeFiles(oversizedFiles)).toThrow(FileTooLargeError);
      expect(() => encodeFiles(oversizedFiles)).toThrow(
        'File "large.txt" too large'
      );
    });

    it("should throw error for oversized total", () => {
      // Create files that individually are OK but total exceeds limit
      const files: File[] = Array(15).fill({
        name: "file.txt",
        content: "x".repeat(400 * 1024), // 400KB each, 6MB total
      });

      expect(() => encodeFiles(files)).toThrow(PayloadTooLargeError);
      expect(() => encodeFiles(files)).toThrow("Total size too large");
    });

    it("should throw error for long filename", () => {
      const longNameFiles: File[] = [
        {
          name: "x".repeat(300),
          content: "Test",
        },
      ];

      expect(() => encodeFiles(longNameFiles)).toThrow(BadRequestError);
      expect(() => encodeFiles(longNameFiles)).toThrow("Filename too long");
    });

    it("should throw error for long language identifier", () => {
      const longLangFiles: File[] = [
        {
          name: "test.txt",
          content: "Test",
          language: "x".repeat(100),
        },
      ];

      expect(() => encodeFiles(longLangFiles)).toThrow(BadRequestError);
      expect(() => encodeFiles(longLangFiles)).toThrow(
        "Language identifier too long"
      );
    });

    it("should respect custom size limits", () => {
      const customLimits: BinarySizeLimits = {
        maxFileSize: 1024, // 1KB
        maxTotalSize: 2048, // 2KB
        maxFileCount: 2,
        maxFilenameLength: 10,
        maxLanguageLength: 5,
      };

      const validFiles: File[] = [
        {
          name: "test.txt",
          content: "x".repeat(500),
          language: "text",
        },
      ];

      // Should succeed with valid files
      expect(() => encodeFiles(validFiles, customLimits)).not.toThrow();

      // Should fail with large file
      const largeFiles: File[] = [
        {
          name: "test.txt",
          content: "x".repeat(2000),
        },
      ];
      expect(() => encodeFiles(largeFiles, customLimits)).toThrow(
        FileTooLargeError
      );

      // Should fail with too many files
      const tooManyFiles: File[] = Array(3).fill({
        name: "test.txt",
        content: "Test",
      });
      expect(() => encodeFiles(tooManyFiles, customLimits)).toThrow(
        TooManyFilesError
      );
    });
  });

  describe("decodeFiles", () => {
    it("should decode encoded files correctly", () => {
      const encoded = encodeFiles(sampleFiles);
      const decoded = decodeFiles(encoded);

      expect(decoded).toHaveLength(sampleFiles.length);

      for (let i = 0; i < sampleFiles.length; i++) {
        expect(decoded[i].name).toBe(sampleFiles[i].name);
        expect(decoded[i].content).toBe(sampleFiles[i].content);
        expect(decoded[i].language).toBe(sampleFiles[i].language);
      }
    });

    it("should throw error for empty data", () => {
      expect(() => decodeFiles(new Uint8Array())).toThrow(
        InvalidBinaryFormatError
      );
      expect(() => decodeFiles(new Uint8Array())).toThrow("too small");
    });

    it("should throw error for data too small for header", () => {
      const smallData = new Uint8Array(5);
      expect(() => decodeFiles(smallData)).toThrow(InvalidBinaryFormatError);
      expect(() => decodeFiles(smallData)).toThrow("too small");
    });

    it("should throw error for invalid magic number", () => {
      const invalidData = new Uint8Array(11);
      invalidData[0] = 0x12;
      invalidData[1] = 0x34;
      invalidData[2] = 0x56;
      invalidData[3] = 0x78;

      expect(() => decodeFiles(invalidData)).toThrow(InvalidBinaryFormatError);
      expect(() => decodeFiles(invalidData)).toThrow("Invalid magic number");
    });

    it("should throw error for unsupported version", () => {
      const data = new Uint8Array(11);
      // Set correct magic number
      data[0] = MAGIC_NUMBER & 0xff;
      data[1] = (MAGIC_NUMBER >> 8) & 0xff;
      data[2] = (MAGIC_NUMBER >> 16) & 0xff;
      data[3] = (MAGIC_NUMBER >> 24) & 0xff;
      // Set wrong version
      data[4] = 99;

      expect(() => decodeFiles(data)).toThrow(InvalidBinaryFormatError);
      expect(() => decodeFiles(data)).toThrow("Unsupported version");
    });

    it("should throw error for invalid file count", () => {
      const data = new Uint8Array(11);
      // Set correct magic number and version
      data[0] = MAGIC_NUMBER & 0xff;
      data[1] = (MAGIC_NUMBER >> 8) & 0xff;
      data[2] = (MAGIC_NUMBER >> 16) & 0xff;
      data[3] = (MAGIC_NUMBER >> 24) & 0xff;
      data[4] = BINARY_FORMAT_VERSION;
      // Set file count to 0
      data[5] = 0;
      data[6] = 0;

      expect(() => decodeFiles(data)).toThrow(InvalidBinaryFormatError);
      expect(() => decodeFiles(data)).toThrow("Invalid file count");
    });

    it("should throw error for truncated data", () => {
      const encoded = encodeFiles(sampleFiles);
      // Truncate the data
      const truncated = encoded.slice(0, encoded.length - 10);

      expect(() => decodeFiles(truncated)).toThrow(InvalidBinaryFormatError);
    });

    it("should throw error for corrupted file data", () => {
      const files: File[] = [
        {
          name: "test.txt",
          content: "Test content",
        },
      ];

      const encoded = encodeFiles(files);
      // Find position of content length
      // Header: 11 bytes
      // Filename length: 2 bytes
      // Filename "test.txt": 8 bytes
      // Content length position: 11 + 2 + 8 = 21
      // Corrupt the content length to be larger than actual remaining data
      // but within the file size limit
      encoded[21] = 100; // 100 bytes (more than remaining data but under 500KB limit)
      encoded[22] = 0;
      encoded[23] = 0;
      encoded[24] = 0;

      expect(() => decodeFiles(encoded)).toThrow(InvalidBinaryFormatError);
      expect(() => decodeFiles(encoded)).toThrow("Unexpected end of data");
    });

    it("should handle round-trip with maximum values", () => {
      const maxFiles: File[] = [
        {
          name: "a".repeat(255), // Max filename length
          content: "x".repeat(100), // Some content
          language: "l".repeat(50), // Max language length
        },
      ];

      const encoded = encodeFiles(maxFiles);
      const decoded = decodeFiles(encoded);

      expect(decoded[0].name).toBe(maxFiles[0].name);
      expect(decoded[0].content).toBe(maxFiles[0].content);
      expect(decoded[0].language).toBe(maxFiles[0].language);
    });
  });

  describe("validateBinaryFormat", () => {
    it("should validate correct binary data", () => {
      const encoded = encodeFiles(sampleFiles);
      expect(validateBinaryFormat(encoded)).toBe(true);
    });

    it("should throw error for invalid data", () => {
      const invalidData = new Uint8Array(100);
      expect(() => validateBinaryFormat(invalidData)).toThrow(
        InvalidBinaryFormatError
      );
    });

    it("should validate without full decode", () => {
      const largeFiles: File[] = Array(10).fill({
        name: "file.txt",
        content: "x".repeat(10000),
      });

      const encoded = encodeFiles(largeFiles);
      // Validation should be fast and not decode content
      expect(validateBinaryFormat(encoded)).toBe(true);
    });

    it("should detect extra data after files", () => {
      const files: File[] = [
        {
          name: "test.txt",
          content: "Test",
        },
      ];

      const encoded = encodeFiles(files);
      // Add extra data
      const withExtra = new Uint8Array(encoded.length + 10);
      withExtra.set(encoded);

      expect(() => validateBinaryFormat(withExtra)).toThrow(
        InvalidBinaryFormatError
      );
      expect(() => validateBinaryFormat(withExtra)).toThrow(
        "Extra data after files"
      );
    });

    it("should detect size mismatch", () => {
      const files: File[] = [
        {
          name: "test.txt",
          content: "Test content",
        },
      ];

      const encoded = encodeFiles(files);
      // Modify the total size in header to not match actual content
      encoded[7] = 0xff;

      expect(() => validateBinaryFormat(encoded)).toThrow(
        InvalidBinaryFormatError
      );
      expect(() => validateBinaryFormat(encoded)).toThrow(
        "Total size mismatch"
      );
    });
  });

  describe("extractHeader", () => {
    it("should extract header correctly", () => {
      const encoded = encodeFiles(sampleFiles);
      const header = extractHeader(encoded);

      expect(header.magic).toBe(MAGIC_NUMBER);
      expect(header.version).toBe(BINARY_FORMAT_VERSION);
      expect(header.fileCount).toBe(3);
      expect(header.totalSize).toBeGreaterThan(0);
    });

    it("should throw error for invalid data", () => {
      expect(() => extractHeader(new Uint8Array())).toThrow(
        InvalidBinaryFormatError
      );
      expect(() => extractHeader(new Uint8Array(5))).toThrow(
        InvalidBinaryFormatError
      );
    });

    it("should extract header without validating rest of data", () => {
      // Create minimal valid header with no file data
      const header = new Uint8Array(11);
      // Magic number
      header[0] = MAGIC_NUMBER & 0xff;
      header[1] = (MAGIC_NUMBER >> 8) & 0xff;
      header[2] = (MAGIC_NUMBER >> 16) & 0xff;
      header[3] = (MAGIC_NUMBER >> 24) & 0xff;
      // Version
      header[4] = BINARY_FORMAT_VERSION;
      // File count = 1
      header[5] = 1;
      header[6] = 0;
      // Total size = 100
      header[7] = 100;
      header[8] = 0;
      header[9] = 0;
      header[10] = 0;

      const extracted = extractHeader(header);
      expect(extracted.magic).toBe(MAGIC_NUMBER);
      expect(extracted.version).toBe(BINARY_FORMAT_VERSION);
      expect(extracted.fileCount).toBe(1);
      expect(extracted.totalSize).toBe(100);
    });
  });

  describe("Edge cases and stress tests", () => {
    it("should handle many small files", () => {
      const manyFiles: File[] = Array(20)
        .fill(null)
        .map((_, i) => ({
          name: `file${i}.txt`,
          content: `Content ${i}`,
          language: i % 2 === 0 ? "text" : undefined,
        }));

      const encoded = encodeFiles(manyFiles);
      const decoded = decodeFiles(encoded);

      expect(decoded).toHaveLength(20);
      decoded.forEach((file, i) => {
        expect(file.name).toBe(`file${i}.txt`);
        expect(file.content).toBe(`Content ${i}`);
      });
    });

    it("should handle various character encodings", () => {
      const files: File[] = [
        {
          name: "ascii.txt",
          content: "Simple ASCII text",
        },
        {
          name: "latin1.txt",
          content: "Café, naïve, résumé",
        },
        {
          name: "cyrillic.txt",
          content: "Привет мир",
        },
        {
          name: "cjk.txt",
          content: "你好世界 こんにちは世界 안녕하세요",
        },
        {
          name: "emoji.txt",
          content: "🚀 🌍 💻 📝",
        },
      ];

      const encoded = encodeFiles(files);
      const decoded = decodeFiles(encoded);

      decoded.forEach((file, i) => {
        expect(file.name).toBe(files[i].name);
        expect(file.content).toBe(files[i].content);
      });
    });

    it("should maintain data integrity with random content", () => {
      // Generate random binary data as string
      const randomContent = Array(1000)
        .fill(null)
        .map(() => String.fromCharCode(Math.floor(Math.random() * 128)))
        .join("");

      const files: File[] = [
        {
          name: "random.bin",
          content: randomContent,
        },
      ];

      const encoded = encodeFiles(files);
      const decoded = decodeFiles(encoded);

      expect(decoded[0].content).toBe(randomContent);
    });

    it("should calculate compression ratio correctly", () => {
      const files: File[] = [
        {
          name: "test.txt",
          content: "x".repeat(1000),
        },
      ];

      const encoded = encodeFiles(files);
      const header = extractHeader(encoded);

      // Binary size should be close to content size + overhead
      const overhead = 11 + 2 + 8 + 4 + 1; // header + name length + "test.txt" + content length + lang length
      expect(encoded.length).toBe(1000 + overhead);
      expect(header.totalSize).toBe(1000);
    });
  });
});
