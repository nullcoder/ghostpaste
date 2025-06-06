/**
 * Tests for crypto.ts - Web Crypto API encryption/decryption utilities
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  generateEncryptionKey,
  exportKey,
  importKey,
  encrypt,
  decrypt,
  generateShareableUrl,
  extractKeyFromUrl,
  type EncryptedData,
} from "./crypto";
import { DecryptionFailedError } from "./errors";

// Polyfill for crypto in test environment if needed
beforeAll(async () => {
  if (!globalThis.crypto) {
    const { webcrypto } = await import("crypto");
    // @ts-expect-error - Assigning polyfill to globalThis
    globalThis.crypto = webcrypto;
  }
});

describe("Crypto Module", () => {
  describe("generateEncryptionKey", () => {
    it("should generate a valid CryptoKey", async () => {
      const key = await generateEncryptionKey();

      expect(key).toBeDefined();
      expect(key.type).toBe("secret");
      expect(key.algorithm.name).toBe("AES-GCM");
      expect((key.algorithm as AesKeyGenParams).length).toBe(256);
      expect(key.extractable).toBe(true);
      expect(key.usages).toContain("encrypt");
      expect(key.usages).toContain("decrypt");
    });

    it("should generate different keys each time", async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();

      const exported1 = await exportKey(key1);
      const exported2 = await exportKey(key2);

      expect(exported1).not.toBe(exported2);
    });
  });

  describe("exportKey and importKey", () => {
    it("should export key to base64url string", async () => {
      const key = await generateEncryptionKey();
      const exported = await exportKey(key);

      expect(typeof exported).toBe("string");
      expect(exported.length).toBeGreaterThan(0);
      // Base64url should not contain +, /, or =
      expect(exported).not.toMatch(/[+/=]/);
    });

    it("should import key from base64url string", async () => {
      const originalKey = await generateEncryptionKey();
      const exported = await exportKey(originalKey);
      const importedKey = await importKey(exported);

      expect(importedKey).toBeDefined();
      expect(importedKey.type).toBe("secret");
      expect(importedKey.algorithm.name).toBe("AES-GCM");
      expect((importedKey.algorithm as AesKeyGenParams).length).toBe(256);
    });

    it("should round-trip export and import", async () => {
      const originalKey = await generateEncryptionKey();
      const exported = await exportKey(originalKey);
      const importedKey = await importKey(exported);

      // Test by encrypting with original and decrypting with imported
      const testData = new TextEncoder().encode("Test round-trip");
      const encrypted = await encrypt(testData, originalKey);
      const decrypted = await decrypt(encrypted, importedKey);

      expect(new TextDecoder().decode(decrypted)).toBe("Test round-trip");
    });

    it("should throw DecryptionError for invalid key string", async () => {
      await expect(importKey("invalid-key")).rejects.toThrow(
        DecryptionFailedError
      );
    });
  });

  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt data successfully", async () => {
      const key = await generateEncryptionKey();
      const originalText = "Hello, GhostPaste! 👻";
      const data = new TextEncoder().encode(originalText);

      const encrypted = await encrypt(data, key);
      const decrypted = await decrypt(encrypted, key);

      const decryptedText = new TextDecoder().decode(decrypted);
      expect(decryptedText).toBe(originalText);
    });

    it("should produce different ciphertext for same data", async () => {
      const key = await generateEncryptionKey();
      const data = new TextEncoder().encode("Same data");

      const encrypted1 = await encrypt(data, key);
      const encrypted2 = await encrypt(data, key);

      // IVs should be different
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      // Ciphertexts should be different
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);

      // But both should decrypt to same data
      const decrypted1 = await decrypt(encrypted1, key);
      const decrypted2 = await decrypt(encrypted2, key);
      expect(decrypted1).toEqual(decrypted2);
    });

    it("should handle empty data", async () => {
      const key = await generateEncryptionKey();
      const data = new Uint8Array(0);

      const encrypted = await encrypt(data, key);
      const decrypted = await decrypt(encrypted, key);

      expect(decrypted.length).toBe(0);
    });

    it("should handle large data", async () => {
      const key = await generateEncryptionKey();
      // Create 1MB of data
      const data = new Uint8Array(1024 * 1024);
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 256;
      }

      const encrypted = await encrypt(data, key);
      const decrypted = await decrypt(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it("should handle binary data", async () => {
      const key = await generateEncryptionKey();
      const data = new Uint8Array([0, 1, 2, 3, 255, 254, 253, 252]);

      const encrypted = await encrypt(data, key);
      const decrypted = await decrypt(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it("should throw DecryptionError with wrong key", async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();
      const data = new TextEncoder().encode("Secret data");

      const encrypted = await encrypt(data, key1);

      await expect(decrypt(encrypted, key2)).rejects.toThrow(
        DecryptionFailedError
      );
      await expect(decrypt(encrypted, key2)).rejects.toThrow(
        "Invalid key or corrupted data"
      );
    });

    it("should throw DecryptionError with corrupted ciphertext", async () => {
      const key = await generateEncryptionKey();
      const data = new TextEncoder().encode("Test data");

      const encrypted = await encrypt(data, key);
      // Corrupt the ciphertext
      const corrupted: EncryptedData = {
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext.slice(0, -4) + "xxxx",
      };

      await expect(decrypt(corrupted, key)).rejects.toThrow(
        DecryptionFailedError
      );
    });

    it("should throw DecryptionError with corrupted IV", async () => {
      const key = await generateEncryptionKey();
      const data = new TextEncoder().encode("Test data");

      const encrypted = await encrypt(data, key);
      // Corrupt the IV
      const corrupted: EncryptedData = {
        iv: "invalid-iv",
        ciphertext: encrypted.ciphertext,
      };

      await expect(decrypt(corrupted, key)).rejects.toThrow(
        DecryptionFailedError
      );
    });
  });

  describe("URL utilities", () => {
    describe("generateShareableUrl", () => {
      it("should generate URL with key in fragment", async () => {
        const key = await generateEncryptionKey();
        const url = await generateShareableUrl(
          "https://ghostpaste.dev",
          "abc123",
          key
        );

        expect(url).toMatch(/^https:\/\/ghostpaste\.dev\/g\/abc123#key=/);

        const urlObj = new URL(url);
        expect(urlObj.pathname).toBe("/g/abc123");

        const params = new URLSearchParams(urlObj.hash.slice(1));
        const keyString = params.get("key");
        expect(keyString).toBeTruthy();
        expect(keyString).not.toMatch(/[+/=]/); // Base64url format
      });

      it("should handle different base URLs", async () => {
        const key = await generateEncryptionKey();
        const url = await generateShareableUrl(
          "http://localhost:3000",
          "test123",
          key
        );

        expect(url).toMatch(/^http:\/\/localhost:3000\/g\/test123#key=/);
      });
    });

    describe("extractKeyFromUrl", () => {
      it("should extract key from valid URL", async () => {
        const originalKey = await generateEncryptionKey();
        const url = await generateShareableUrl(
          "https://ghostpaste.dev",
          "abc123",
          originalKey
        );

        const extractedKey = await extractKeyFromUrl(url);
        expect(extractedKey).toBeTruthy();

        // Test that extracted key works
        const data = new TextEncoder().encode("Test extraction");
        const encrypted = await encrypt(data, originalKey);
        const decrypted = await decrypt(encrypted, extractedKey!);

        expect(new TextDecoder().decode(decrypted)).toBe("Test extraction");
      });

      it("should return null for URL without fragment", async () => {
        const key = await extractKeyFromUrl("https://ghostpaste.dev/g/abc123");
        expect(key).toBeNull();
      });

      it("should return null for URL without key parameter", async () => {
        const key = await extractKeyFromUrl(
          "https://ghostpaste.dev/g/abc123#other=value"
        );
        expect(key).toBeNull();
      });

      it("should return null for invalid URL", async () => {
        const key = await extractKeyFromUrl("not-a-url");
        expect(key).toBeNull();
      });

      it("should handle URL with multiple hash parameters", async () => {
        const originalKey = await generateEncryptionKey();
        const exportedKey = await exportKey(originalKey);
        const url = `https://ghostpaste.dev/g/abc123#key=${exportedKey}&version=1`;

        const extractedKey = await extractKeyFromUrl(url);
        expect(extractedKey).toBeTruthy();

        // Verify it's the correct key
        const data = new TextEncoder().encode("Multi-param test");
        const encrypted = await encrypt(data, originalKey);
        const decrypted = await decrypt(encrypted, extractedKey!);

        expect(new TextDecoder().decode(decrypted)).toBe("Multi-param test");
      });
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle Unicode text correctly", async () => {
      const key = await generateEncryptionKey();
      const originalText = "Hello 世界 🌍 Здравствуй мир";
      const data = new TextEncoder().encode(originalText);

      const encrypted = await encrypt(data, key);
      const decrypted = await decrypt(encrypted, key);

      const decryptedText = new TextDecoder().decode(decrypted);
      expect(decryptedText).toBe(originalText);
    });

    it("should handle special characters in text", async () => {
      const key = await generateEncryptionKey();
      const originalText = "Special chars: \n\r\t\"'\\<>&";
      const data = new TextEncoder().encode(originalText);

      const encrypted = await encrypt(data, key);
      const decrypted = await decrypt(encrypted, key);

      const decryptedText = new TextDecoder().decode(decrypted);
      expect(decryptedText).toBe(originalText);
    });

    it("should maintain data integrity", async () => {
      const key = await generateEncryptionKey();
      const data = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        data[i] = i;
      }

      const encrypted = await encrypt(data, key);
      const decrypted = await decrypt(encrypted, key);

      expect(decrypted).toEqual(data);
      expect(decrypted.length).toBe(data.length);
    });
  });
});
