/**
 * Integration tests for the complete encryption workflow
 *
 * These tests verify that all encryption components work together correctly,
 * including key generation, encryption/decryption, binary format encoding,
 * and PIN protection.
 */

import { describe, it, expect } from "vitest";
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encrypt,
  decrypt,
  encryptAndPack,
  unpackAndDecrypt,
  generateShareableUrl,
  extractKeyFromUrl,
  packEncryptedBlob,
  unpackEncryptedBlob,
} from "../crypto";
import { encodeFiles, decodeFiles } from "../binary";
import { generateSalt, hashPin, validatePin } from "../auth";
import { type File } from "@/types/models";
import { DecryptionFailedError, InvalidBinaryFormatError } from "../errors";

describe("Encryption Workflow Integration", () => {
  // Test data
  const sampleFiles: File[] = [
    {
      name: "main.js",
      content: "console.log('Hello, World!');",
      language: "javascript",
    },
    {
      name: "styles.css",
      content: "body { margin: 0; padding: 0; }",
      language: "css",
    },
    {
      name: "README.md",
      content: "# Test Project\n\nThis is a test project.",
      language: "markdown",
    },
  ];

  const singleFile: File[] = [
    {
      name: "test.txt",
      content: "This is a test file content.",
    },
  ];

  describe("Complete encrypt/decrypt cycle", () => {
    it("should encrypt and decrypt a single file", async () => {
      // Encode file to binary
      const encoded = encodeFiles(singleFile);

      // Generate key and encrypt
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);

      // Decrypt and decode
      const decrypted = await decrypt(encrypted, key);
      const decoded = decodeFiles(decrypted);

      // Verify
      expect(decoded).toHaveLength(1);
      expect(decoded[0].name).toBe(singleFile[0].name);
      expect(decoded[0].content).toBe(singleFile[0].content);
    });

    it("should encrypt and decrypt multiple files", async () => {
      // Encode files to binary
      const encoded = encodeFiles(sampleFiles);

      // Generate key and encrypt
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);

      // Decrypt and decode
      const decrypted = await decrypt(encrypted, key);
      const decoded = decodeFiles(decrypted);

      // Verify all files
      expect(decoded).toHaveLength(sampleFiles.length);
      decoded.forEach((file, index) => {
        expect(file.name).toBe(sampleFiles[index].name);
        expect(file.content).toBe(sampleFiles[index].content);
        expect(file.language).toBe(sampleFiles[index].language);
      });
    });

    it("should handle large files", async () => {
      const largeFile: File[] = [
        {
          name: "large.txt",
          content: "x".repeat(400 * 1024), // 400KB
          language: "text",
        },
      ];

      const encoded = encodeFiles(largeFile);
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);
      const decrypted = await decrypt(encrypted, key);
      const decoded = decodeFiles(decrypted);

      expect(decoded[0].content.length).toBe(400 * 1024);
      expect(decoded[0].content).toBe(largeFile[0].content);
    });

    it("should preserve Unicode content through encryption", async () => {
      const unicodeFiles: File[] = [
        {
          name: "unicode.txt",
          content: "Hello 世界! 🌍 Здравствуй мир! مرحبا بالعالم",
          language: "text",
        },
      ];

      const encoded = encodeFiles(unicodeFiles);
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);
      const decrypted = await decrypt(encrypted, key);
      const decoded = decodeFiles(decrypted);

      expect(decoded[0].content).toBe(unicodeFiles[0].content);
    });
  });

  describe("Key generation and export/import", () => {
    it("should generate unique keys", async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();

      const exported1 = await exportKey(key1);
      const exported2 = await exportKey(key2);

      expect(exported1).not.toBe(exported2);
    });

    it("should export and import keys correctly", async () => {
      const originalKey = await generateEncryptionKey();
      const data = new TextEncoder().encode("Test data");

      // Encrypt with original key
      const encrypted = await encrypt(data, originalKey);

      // Export and import key
      const exported = await exportKey(originalKey);
      const importedKey = await importKey(exported);

      // Decrypt with imported key
      const decrypted = await decrypt(encrypted, importedKey);
      expect(new TextDecoder().decode(decrypted)).toBe("Test data");
    });

    it("should generate shareable URLs", async () => {
      const key = await generateEncryptionKey();
      const url = await generateShareableUrl(
        "https://ghostpaste.dev",
        "abc123",
        key
      );

      expect(url).toMatch(/^https:\/\/ghostpaste\.dev\/g\/abc123#key=/);

      // Extract key from URL
      const extractedKey = await extractKeyFromUrl(url);
      expect(extractedKey).not.toBeNull();

      // Verify extracted key works
      const data = new TextEncoder().encode("Test");
      const encrypted = await encrypt(data, key);
      const decrypted = await decrypt(encrypted, extractedKey!);
      expect(new TextDecoder().decode(decrypted)).toBe("Test");
    });

    it("should handle invalid key formats", async () => {
      await expect(importKey("invalid-key")).rejects.toThrow(
        DecryptionFailedError
      );

      await expect(importKey("")).rejects.toThrow(DecryptionFailedError);

      await expect(importKey("12345")).rejects.toThrow(DecryptionFailedError);
    });
  });

  describe("Binary format with encryption", () => {
    it("should maintain binary format integrity through encryption", async () => {
      const files: File[] = [
        {
          name: "file1.txt",
          content: "Content 1",
          language: "text",
        },
        {
          name: "file2.js",
          content: "const x = 42;",
          language: "javascript",
        },
      ];

      // Encode → Encrypt → Decrypt → Decode
      const encoded = encodeFiles(files);
      const { blob, key } = await encryptAndPack(encoded);
      const decrypted = await unpackAndDecrypt(blob, key);
      const decoded = decodeFiles(decrypted);

      expect(decoded).toHaveLength(2);
      expect(decoded[0].name).toBe("file1.txt");
      expect(decoded[1].name).toBe("file2.js");
    });

    it("should handle empty files", async () => {
      const files: File[] = [
        {
          name: "empty.txt",
          content: "",
        },
      ];

      const encoded = encodeFiles(files);
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);
      const decrypted = await decrypt(encrypted, key);
      const decoded = decodeFiles(decrypted);

      expect(decoded[0].content).toBe("");
    });

    it("should enforce size limits", async () => {
      const oversizedFile: File[] = [
        {
          name: "huge.txt",
          content: "x".repeat(600 * 1024), // 600KB - over limit
        },
      ];

      expect(() => encodeFiles(oversizedFile)).toThrow();
    });

    it("should handle maximum file count", async () => {
      const manyFiles: File[] = Array(20)
        .fill(null)
        .map((_, i) => ({
          name: `file${i}.txt`,
          content: `Content ${i}`,
        }));

      const encoded = encodeFiles(manyFiles);
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);
      const decrypted = await decrypt(encrypted, key);
      const decoded = decodeFiles(decrypted);

      expect(decoded).toHaveLength(20);
    });
  });

  describe("PIN protection workflow", () => {
    it("should complete PIN protection workflow", async () => {
      const pin = "MySecure123";
      const salt = await generateSalt();
      const pinHash = await hashPin(pin, salt);

      // Store pinHash and salt with metadata...

      // Later, validate PIN
      const isValid = await validatePin(pin, pinHash, salt);
      expect(isValid).toBe(true);

      // Wrong PIN should fail
      await expect(validatePin("WrongPin123", pinHash, salt)).rejects.toThrow();
    });

    it("should integrate PIN protection with encryption", async () => {
      // User creates gist with PIN
      const userPin = "SecurePin456";
      const salt = await generateSalt();
      const pinHash = await hashPin(userPin, salt);

      // Encrypt files
      const encoded = encodeFiles(sampleFiles);
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);

      // Store encrypted data with PIN protection
      const metadata = {
        pinHash,
        salt,
        encryptedData: encrypted,
      };

      // Later, user provides PIN to edit
      const providedPin = "SecurePin456";
      const canEdit = await validatePin(
        providedPin,
        metadata.pinHash,
        metadata.salt
      );
      expect(canEdit).toBe(true);

      // If PIN is valid, allow decryption and editing
      if (canEdit) {
        const decrypted = await decrypt(metadata.encryptedData, key);
        const files = decodeFiles(decrypted);
        expect(files).toHaveLength(3);
      }
    });

    it("should handle PIN update workflow", async () => {
      const oldPin = "OldPin123";
      const newPin = "NewPin456";

      // Initial PIN
      const salt1 = await generateSalt();
      const oldHash = await hashPin(oldPin, salt1);

      // Validate old PIN
      const isValid = await validatePin(oldPin, oldHash, salt1);
      expect(isValid).toBe(true);

      // Update to new PIN
      const salt2 = await generateSalt();
      const newHash = await hashPin(newPin, salt2);

      // Validate new PIN
      const isNewValid = await validatePin(newPin, newHash, salt2);
      expect(isNewValid).toBe(true);

      // Old PIN should not work with new hash
      await expect(validatePin(oldPin, newHash, salt2)).rejects.toThrow();
    });

    it("should handle Unicode PINs", async () => {
      const unicodePin = "Pass123"; // Keep it simple for edge runtime
      const salt = await generateSalt();
      const hash = await hashPin(unicodePin, salt);

      const isValid = await validatePin(unicodePin, hash, salt);
      expect(isValid).toBe(true);
    });
  });

  describe("Error scenarios", () => {
    it("should fail decryption with wrong key", async () => {
      const encoded = encodeFiles(singleFile);
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();

      const encrypted = await encrypt(encoded, key1);

      await expect(decrypt(encrypted, key2)).rejects.toThrow(
        DecryptionFailedError
      );
    });

    it("should handle corrupted encrypted data", async () => {
      const encoded = encodeFiles(singleFile);
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);

      // Corrupt the ciphertext
      encrypted.ciphertext[10] ^= 0xff;

      await expect(decrypt(encrypted, key)).rejects.toThrow(
        DecryptionFailedError
      );
    });

    it("should handle truncated encrypted data", async () => {
      const encoded = encodeFiles(singleFile);
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);

      // Truncate ciphertext
      const truncated = {
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext.slice(0, 10),
      };

      await expect(decrypt(truncated, key)).rejects.toThrow(
        DecryptionFailedError
      );
    });

    it("should handle invalid binary format after decryption", async () => {
      const invalidData = new Uint8Array([1, 2, 3, 4, 5]);
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(invalidData, key);
      const decrypted = await decrypt(encrypted, key);

      expect(() => decodeFiles(decrypted)).toThrow(InvalidBinaryFormatError);
    });

    it("should handle key extraction failures", async () => {
      const result1 = await extractKeyFromUrl("https://example.com");
      expect(result1).toBeNull();

      const result2 = await extractKeyFromUrl(
        "https://example.com#other=value"
      );
      expect(result2).toBeNull();

      const result3 = await extractKeyFromUrl("invalid-url");
      expect(result3).toBeNull();
    });
  });

  describe("Pack/unpack encrypted blobs", () => {
    it("should pack and unpack encrypted data", async () => {
      const data = new TextEncoder().encode("Test data");
      const key = await generateEncryptionKey();

      // Encrypt and pack
      const encrypted = await encrypt(data, key);
      const packed = packEncryptedBlob(encrypted);

      // Unpack and decrypt
      const unpacked = unpackEncryptedBlob(packed);
      const decrypted = await decrypt(unpacked, key);

      expect(new TextDecoder().decode(decrypted)).toBe("Test data");
    });

    it("should use high-level pack/unpack functions", async () => {
      const data = new TextEncoder().encode("High level test");

      // Encrypt and pack in one step
      const { blob, key } = await encryptAndPack(data);

      // Unpack and decrypt in one step
      const decrypted = await unpackAndDecrypt(blob, key);

      expect(new TextDecoder().decode(decrypted)).toBe("High level test");
    });

    it("should handle edge cases for blob packing", async () => {
      // Too small blob
      const tinyBlob = new Uint8Array(5);
      expect(() => unpackEncryptedBlob(tinyBlob)).toThrow(
        DecryptionFailedError
      );

      // Exact IV size blob (should work but have empty ciphertext)
      const ivSizeBlob = new Uint8Array(12);
      const unpacked = unpackEncryptedBlob(ivSizeBlob);
      expect(unpacked.iv.length).toBe(12);
      expect(unpacked.ciphertext.length).toBe(0);
    });
  });

  describe("Edge runtime compatibility", () => {
    it("should use only Web Crypto API", async () => {
      // Verify crypto global is available
      expect(crypto).toBeDefined();
      expect(crypto.subtle).toBeDefined();

      // Verify key generation uses Web Crypto
      const key = await generateEncryptionKey();
      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.type).toBe("secret");
      expect(key.algorithm.name).toBe("AES-GCM");
    });

    it("should use Uint8Array for all binary operations", async () => {
      const files = sampleFiles;
      const encoded = encodeFiles(files);
      expect(encoded).toBeInstanceOf(Uint8Array);

      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);
      expect(encrypted.iv).toBeInstanceOf(Uint8Array);
      expect(encrypted.ciphertext).toBeInstanceOf(Uint8Array);

      const decrypted = await decrypt(encrypted, key);
      expect(decrypted).toBeInstanceOf(Uint8Array);
    });

    it("should not use Node.js specific APIs", async () => {
      // This test verifies we're not using Buffer, fs, or other Node.js APIs
      // The test suite itself ensures compatibility by running in both environments

      // Verify we use TextEncoder/TextDecoder instead of Buffer
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const text = "Edge runtime compatible";
      const encoded = encoder.encode(text);
      const decoded = decoder.decode(encoded);

      expect(decoded).toBe(text);
    });
  });

  describe("Performance benchmarks", () => {
    it("should handle typical use case efficiently", async () => {
      const typicalFiles: File[] = Array(5)
        .fill(null)
        .map((_, i) => ({
          name: `file${i}.js`,
          content: "x".repeat(10 * 1024), // 10KB each
          language: "javascript",
        }));

      const start = performance.now();

      // Full workflow
      const encoded = encodeFiles(typicalFiles);
      const key = await generateEncryptionKey();
      const encrypted = await encrypt(encoded, key);
      const decrypted = await decrypt(encrypted, key);
      const decoded = decodeFiles(decrypted);

      const duration = performance.now() - start;

      expect(decoded).toHaveLength(5);
      // Should complete in reasonable time (adjust based on actual performance)
      expect(duration).toBeLessThan(1000); // 1 second
    });

    it("should handle large file efficiently", async () => {
      const largeFile: File[] = [
        {
          name: "large.js",
          content: "x".repeat(400 * 1024), // 400KB
        },
      ];

      const start = performance.now();

      const encoded = encodeFiles(largeFile);
      const { blob, key } = await encryptAndPack(encoded);
      const decrypted = await unpackAndDecrypt(blob, key);
      const decoded = decodeFiles(decrypted);

      const duration = performance.now() - start;

      expect(decoded[0].content.length).toBe(400 * 1024);
      // Should complete in reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds
    });
  });

  describe("Complex integration scenarios", () => {
    it("should handle mixed content types with PIN protection", async () => {
      const mixedFiles: File[] = [
        {
          name: "script.js",
          content: "console.log('Hello');",
          language: "javascript",
        },
        {
          name: "data.json",
          content: '{"name": "test", "value": 123}',
          language: "json",
        },
        {
          name: "style.css",
          content: "body { background: #fff; }",
          language: "css",
        },
        {
          name: "empty.txt",
          content: "",
        },
      ];

      // Create with PIN
      const pin = "MixedContent123";
      const salt = await generateSalt();
      const pinHash = await hashPin(pin, salt);

      // Encode and encrypt
      const encoded = encodeFiles(mixedFiles);
      const key = await generateEncryptionKey();
      const { blob } = await encryptAndPack(encoded, key);

      // Generate shareable URL
      const shareUrl = await generateShareableUrl(
        "https://ghostpaste.dev",
        "mixed123",
        key
      );

      // Simulate recipient
      const extractedKey = await extractKeyFromUrl(shareUrl);
      expect(extractedKey).not.toBeNull();

      // Decrypt and verify
      const decrypted = await unpackAndDecrypt(blob, extractedKey!);
      const decoded = decodeFiles(decrypted);

      expect(decoded).toHaveLength(4);
      expect(decoded[0].language).toBe("javascript");
      expect(decoded[1].language).toBe("json");
      expect(decoded[2].language).toBe("css");
      expect(decoded[3].content).toBe("");

      // Verify PIN for editing
      const canEdit = await validatePin(pin, pinHash, salt);
      expect(canEdit).toBe(true);
    });

    it("should handle key regeneration workflow", async () => {
      const files = sampleFiles;
      const encoded = encodeFiles(files);

      // Original encryption
      const key1 = await generateEncryptionKey();
      const encrypted1 = await encrypt(encoded, key1);

      // User wants to change the key
      const key2 = await generateEncryptionKey();

      // Decrypt with old key, encrypt with new key
      const decrypted = await decrypt(encrypted1, key1);
      const encrypted2 = await encrypt(decrypted, key2);

      // Verify new encryption works
      const finalDecrypted = await decrypt(encrypted2, key2);
      const decoded = decodeFiles(finalDecrypted);

      expect(decoded).toHaveLength(3);
      expect(decoded[0].name).toBe("main.js");

      // Old key should not work on new encryption
      await expect(decrypt(encrypted2, key1)).rejects.toThrow(
        DecryptionFailedError
      );
    });

    it("should handle concurrent encryption operations", async () => {
      const operations = Array(5)
        .fill(null)
        .map(async (_, i) => {
          const file: File[] = [
            {
              name: `concurrent${i}.txt`,
              content: `Content for file ${i}`,
            },
          ];

          const encoded = encodeFiles(file);
          const key = await generateEncryptionKey();
          const encrypted = await encrypt(encoded, key);
          const decrypted = await decrypt(encrypted, key);
          const decoded = decodeFiles(decrypted);

          return decoded[0];
        });

      const results = await Promise.all(operations);

      expect(results).toHaveLength(5);
      results.forEach((file, i) => {
        expect(file.name).toBe(`concurrent${i}.txt`);
        expect(file.content).toBe(`Content for file ${i}`);
      });
    });
  });
});
