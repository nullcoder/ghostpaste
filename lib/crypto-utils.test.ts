/**
 * Tests for crypto-utils.ts - High-level encryption utilities
 */

import { describe, it, expect } from "vitest";
import {
  generateShareableUrl,
  extractKeyFromUrl,
  encryptGist,
  decryptGist,
  isGistExpired,
  validateGistPin,
  createGist,
  loadGistFromUrl,
} from "./crypto-utils";
import { generateEncryptionKey, exportKey } from "./crypto";
import { type File, type GistMetadata } from "@/types/models";
import { DecryptionFailedError, InvalidEncryptionKeyError } from "./errors";

describe("Crypto Utils", () => {
  const sampleFiles: File[] = [
    {
      name: "test.js",
      content: "console.log('Hello, World!');",
      language: "javascript",
    },
    {
      name: "README.md",
      content: "# Test Project",
      language: "markdown",
    },
  ];

  describe("generateShareableUrl", () => {
    it("should generate URL with CryptoKey", async () => {
      const key = await generateEncryptionKey();
      const url = await generateShareableUrl(
        "https://ghostpaste.dev",
        "abc123",
        key
      );

      expect(url).toMatch(/^https:\/\/ghostpaste\.dev\/g\/abc123#key=/);
      expect(url).toContain("#key=");
    });

    it("should generate URL with string key", async () => {
      const keyString = "test-key-string";
      const url = await generateShareableUrl(
        "https://ghostpaste.dev",
        "xyz789",
        keyString
      );

      expect(url).toBe("https://ghostpaste.dev/g/xyz789#key=test-key-string");
    });

    it("should handle different base URLs", async () => {
      const key = "test-key";
      const url1 = await generateShareableUrl(
        "http://localhost:3000",
        "id1",
        key
      );
      const url2 = await generateShareableUrl(
        "https://example.com",
        "id2",
        key
      );

      expect(url1).toBe("http://localhost:3000/g/id1#key=test-key");
      expect(url2).toBe("https://example.com/g/id2#key=test-key");
    });
  });

  describe("extractKeyFromUrl", () => {
    it("should extract key from valid URL", async () => {
      const originalKey = await generateEncryptionKey();
      const exportedKey = await exportKey(originalKey);
      const url = `https://ghostpaste.dev/g/abc123#key=${exportedKey}`;

      const extractedKey = await extractKeyFromUrl(url);
      expect(extractedKey).not.toBeNull();

      // Verify the extracted key works
      const testData = new TextEncoder().encode("test");
      const { encrypt } = await import("./crypto");
      const encrypted = await encrypt(testData, originalKey);
      const { decrypt } = await import("./crypto");
      const decrypted = await decrypt(encrypted, extractedKey!);
      expect(new TextDecoder().decode(decrypted)).toBe("test");
    });

    it("should return null for URL without key", async () => {
      const url = "https://ghostpaste.dev/g/abc123";
      const key = await extractKeyFromUrl(url);
      expect(key).toBeNull();
    });

    it("should return null for invalid URL", async () => {
      const key = await extractKeyFromUrl("not-a-url");
      expect(key).toBeNull();
    });
  });

  describe("encryptGist", () => {
    it("should encrypt files successfully", async () => {
      const encrypted = await encryptGist(sampleFiles);

      expect(encrypted.id).toBeTruthy();
      expect(encrypted.id).toHaveLength(8);
      expect(encrypted.encryptedData).toBeInstanceOf(Uint8Array);
      expect(encrypted.encryptionKey).toBeTruthy();
      expect(encrypted.metadata).toBeDefined();
      expect(encrypted.metadata.total_size).toBeGreaterThan(0);
    });

    it("should handle encryption options", async () => {
      const options = {
        description: "Test gist",
        editPin: "SecurePin123",
        oneTimeView: true,
        expiresAt: new Date(Date.now() + 86400000), // 24 hours
      };

      const encrypted = await encryptGist(sampleFiles, options);

      expect(encrypted.metadata.one_time_view).toBe(true);
      expect(encrypted.metadata.expires_at).toBeDefined();
      expect(encrypted.metadata.edit_pin_hash).toBeDefined();
      expect(encrypted.metadata.edit_pin_salt).toBeDefined();
    });

    it("should throw error for empty files", async () => {
      await expect(encryptGist([])).rejects.toThrow(InvalidEncryptionKeyError);
      await expect(encryptGist([])).rejects.toThrow("Failed to encrypt gist");
    });

    it("should generate unique IDs", async () => {
      const encrypted1 = await encryptGist(sampleFiles);
      const encrypted2 = await encryptGist(sampleFiles);

      expect(encrypted1.id).not.toBe(encrypted2.id);
    });
  });

  describe("decryptGist", () => {
    it("should decrypt with CryptoKey", async () => {
      const encrypted = await encryptGist(sampleFiles);
      const key = await import("./crypto").then((m) =>
        m.importKey(encrypted.encryptionKey!)
      );

      const decrypted = await decryptGist(encrypted, key);

      expect(decrypted.id).toBe(encrypted.id);
      expect(decrypted.files).toHaveLength(2);
      expect(decrypted.files[0].name).toBe("test.js");
      expect(decrypted.files[0].content).toBe("console.log('Hello, World!');");
      expect(decrypted.files[1].name).toBe("README.md");
    });

    it("should decrypt with string key", async () => {
      const encrypted = await encryptGist(sampleFiles);

      const decrypted = await decryptGist(encrypted, encrypted.encryptionKey!);

      expect(decrypted.files).toHaveLength(2);
      expect(decrypted.files[0].content).toBe("console.log('Hello, World!');");
    });

    it("should throw error for invalid key", async () => {
      const encrypted = await encryptGist(sampleFiles);
      const wrongKey = await generateEncryptionKey();

      await expect(decryptGist(encrypted, wrongKey)).rejects.toThrow(
        DecryptionFailedError
      );
    });

    it("should throw error for corrupted data", async () => {
      const encrypted = await encryptGist(sampleFiles);

      // Corrupt the data
      encrypted.encryptedData[10] ^= 0xff;

      await expect(
        decryptGist(encrypted, encrypted.encryptionKey!)
      ).rejects.toThrow(DecryptionFailedError);
    });
  });

  describe("isGistExpired", () => {
    it("should return false for non-expiring gist", () => {
      const metadata: Partial<GistMetadata> = {
        created_at: new Date().toISOString(),
      };

      expect(isGistExpired(metadata)).toBe(false);
    });

    it("should return false for future expiry", () => {
      const metadata: Partial<GistMetadata> = {
        expires_at: new Date(Date.now() + 86400000).toISOString(), // 24 hours
      };

      expect(isGistExpired(metadata)).toBe(false);
    });

    it("should return true for past expiry", () => {
      const metadata: Partial<GistMetadata> = {
        expires_at: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
      };

      expect(isGistExpired(metadata)).toBe(true);
    });
  });

  describe("validateGistPin", () => {
    it("should validate correct PIN", async () => {
      const pin = "TestPin123";
      const { generateSalt, hashPin } = await import("./auth");
      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      const metadata: Partial<GistMetadata> = {
        edit_pin_hash: hash,
        edit_pin_salt: salt,
      };

      const isValid = await validateGistPin(pin, metadata);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect PIN", async () => {
      const pin = "TestPin123";
      const wrongPin = "WrongPin456";
      const { generateSalt, hashPin } = await import("./auth");
      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      const metadata: Partial<GistMetadata> = {
        edit_pin_hash: hash,
        edit_pin_salt: salt,
      };

      const isValid = await validateGistPin(wrongPin, metadata);
      expect(isValid).toBe(false);
    });

    it("should return false for missing PIN data", async () => {
      const metadata: Partial<GistMetadata> = {};

      const isValid = await validateGistPin("anypin", metadata);
      expect(isValid).toBe(false);
    });
  });

  describe("createGist", () => {
    it("should create complete gist with share URL", async () => {
      const { gist, shareUrl } = await createGist(sampleFiles, {
        description: "My test gist",
        editPin: "Pin1234",
      });

      expect(gist.id).toBeTruthy();
      expect(gist.encryptedData).toBeInstanceOf(Uint8Array);
      expect(gist.metadata.edit_pin_hash).toBeDefined();

      expect(shareUrl).toContain("https://ghostpaste.dev/g/");
      expect(shareUrl).toContain("#key=");
      expect(shareUrl).toContain(gist.id);
    });

    it("should work without options", async () => {
      const { gist, shareUrl } = await createGist(sampleFiles);

      expect(gist.id).toBeTruthy();
      expect(gist.metadata.edit_pin_hash).toBeUndefined();
      expect(shareUrl).toBeTruthy();
    });
  });

  describe("loadGistFromUrl", () => {
    it("should load and decrypt gist from URL", async () => {
      // Create a gist
      const { gist, shareUrl } = await createGist(sampleFiles);

      // Load it back
      const loaded = await loadGistFromUrl(
        shareUrl,
        gist.encryptedData,
        gist.metadata
      );

      expect(loaded).not.toBeNull();
      expect(loaded!.id).toBe(gist.id);
      expect(loaded!.files).toHaveLength(2);
      expect(loaded!.files[0].name).toBe("test.js");
    });

    it("should return null for URL without key", async () => {
      const { gist } = await createGist(sampleFiles);
      const urlWithoutKey = `https://ghostpaste.dev/g/${gist.id}`;

      const loaded = await loadGistFromUrl(
        urlWithoutKey,
        gist.encryptedData,
        gist.metadata
      );

      expect(loaded).toBeNull();
    });

    it("should handle complex URLs", async () => {
      const { gist, shareUrl } = await createGist(sampleFiles);

      // Add query parameters to URL
      const complexUrl = shareUrl.replace("#key=", "?param=value#key=");

      const loaded = await loadGistFromUrl(
        complexUrl,
        gist.encryptedData,
        gist.metadata
      );

      expect(loaded).not.toBeNull();
      expect(loaded!.files).toHaveLength(2);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle full encrypt/decrypt cycle", async () => {
      const files: File[] = [
        {
          name: "app.js",
          content: "const app = express();",
          language: "javascript",
        },
        {
          name: "package.json",
          content: '{"name": "test-app"}',
          language: "json",
        },
      ];

      // Create gist with all options
      const { gist, shareUrl } = await createGist(files, {
        description: "Test application",
        editPin: "SecurePin789",
        oneTimeView: false,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      });

      // Verify creation
      expect(gist.metadata.one_time_view).toBe(false);
      expect(gist.metadata.expires_at).toBeDefined();
      expect(isGistExpired(gist.metadata)).toBe(false);

      // Verify PIN
      const pinValid = await validateGistPin("SecurePin789", gist.metadata);
      expect(pinValid).toBe(true);

      // Load from URL
      const loaded = await loadGistFromUrl(
        shareUrl,
        gist.encryptedData,
        gist.metadata
      );

      expect(loaded).not.toBeNull();
      expect(loaded!.files).toHaveLength(2);
      expect(loaded!.files[0].name).toBe("app.js");
      expect(loaded!.files[1].content).toBe('{"name": "test-app"}');
    });

    it("should handle Unicode content", async () => {
      const unicodeFiles: File[] = [
        {
          name: "greeting.txt",
          content: "Hello 世界! 🌍 Привет мир!",
          language: "text",
        },
      ];

      const { gist, shareUrl } = await createGist(unicodeFiles);
      const loaded = await loadGistFromUrl(
        shareUrl,
        gist.encryptedData,
        gist.metadata
      );

      expect(loaded!.files[0].content).toBe("Hello 世界! 🌍 Привет мир!");
    });

    it("should handle large files", async () => {
      const largeFiles: File[] = [
        {
          name: "large.txt",
          content: "x".repeat(100000), // 100KB
          language: "text",
        },
      ];

      const { gist, shareUrl } = await createGist(largeFiles);
      const loaded = await loadGistFromUrl(
        shareUrl,
        gist.encryptedData,
        gist.metadata
      );

      expect(loaded!.files[0].content.length).toBe(100000);
    });
  });
});
