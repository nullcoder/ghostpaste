import { describe, it, expect, beforeEach } from "vitest";
import { StorageOperations, StorageHelpers } from "../storage-operations";
import { resetStorageInstance } from "../storage";
import type { File } from "@/types/models";
import { encrypt } from "../crypto";

/**
 * Example integration tests for storage operations
 *
 * These tests demonstrate how storage operations should work with real R2 storage.
 * They cannot currently run because they require API endpoints to be implemented first.
 *
 * Once API endpoints are ready, these can be converted to actual integration tests
 * that make HTTP requests to test the full end-to-end functionality.
 */
describe("Storage Operations Integration", () => {
  // Test data
  const testFiles: File[] = [
    {
      name: "main.ts",
      content: `console.log("Hello, World!");`,
      language: "typescript",
    },
    {
      name: "README.md",
      content: `# Test Project\n\nThis is a test.`,
      language: "markdown",
    },
  ];

  beforeEach(() => {
    resetStorageInstance();
  });

  describe("Full Gist Lifecycle", () => {
    it("should create, read, update, and delete a gist", async () => {
      // 1. Create encrypted blob
      const blob = StorageHelpers.createEncryptedBlob(testFiles);
      const encryptionKey = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      const encrypted = await encrypt(blob, encryptionKey);

      // 2. Create gist
      const { id, timestamp } = await StorageOperations.createGist(
        {
          total_size: StorageHelpers.calculateTotalSize(testFiles),
          blob_count: testFiles.length,
          encrypted_metadata: {
            iv: btoa(String.fromCharCode(...encrypted.iv)),
            data: btoa(String.fromCharCode(...new Uint8Array([1, 2, 3]))), // Mock encrypted metadata
          },
        },
        encrypted.ciphertext
      );

      expect(id).toBeTruthy();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      // 3. Read gist
      const result = await StorageOperations.getGist(id);
      expect(result).not.toBeNull();
      expect(result!.metadata.id).toBe(id);
      expect(result!.metadata.version).toBe(1);
      expect(result!.metadata.current_version).toBe(timestamp);
      expect(result!.blob).toBeInstanceOf(Uint8Array);

      // 4. Update gist
      const updatedFiles = [
        ...testFiles,
        {
          name: "config.json",
          content: '{"test": true}',
          language: "json",
        },
      ];
      const updatedBlob = StorageHelpers.createEncryptedBlob(updatedFiles);
      const updatedEncrypted = await encrypt(updatedBlob, encryptionKey);

      const { timestamp: newTimestamp } = await StorageOperations.updateGist(
        id,
        {
          total_size: StorageHelpers.calculateTotalSize(updatedFiles),
          blob_count: updatedFiles.length,
        },
        updatedEncrypted.ciphertext
      );

      expect(newTimestamp).toBeTruthy();
      expect(newTimestamp).not.toBe(timestamp);

      // 5. Verify update
      const updated = await StorageOperations.getGist(id);
      expect(updated!.metadata.version).toBe(2);
      expect(updated!.metadata.current_version).toBe(newTimestamp);
      expect(updated!.metadata.blob_count).toBe(3);

      // 6. Check version history
      const versions = await StorageOperations.getVersionHistory(id);
      expect(versions.length).toBeGreaterThanOrEqual(2);
      expect(versions[0].timestamp).toBe(newTimestamp); // Newest first

      // 7. Delete gist
      const storage = await import("../storage").then((m) => m.getR2Storage());
      await storage.deleteGist(id);

      // 8. Verify deletion
      const deleted = await StorageOperations.getGist(id);
      expect(deleted).toBeNull();
    });
  });

  describe("Expiry and One-Time View", () => {
    it("should handle one-time view deletion", async () => {
      const blob = StorageHelpers.createEncryptedBlob(testFiles);

      // Create one-time view gist
      const { id } = await StorageOperations.createGist(
        {
          total_size: StorageHelpers.calculateTotalSize(testFiles),
          blob_count: testFiles.length,
          one_time_view: true,
          encrypted_metadata: {
            iv: btoa("test-iv"),
            data: btoa("test-data"),
          },
        },
        blob
      );

      // Get gist
      const result = await StorageOperations.getGist(id);
      expect(result).not.toBeNull();

      // Delete after view
      const deleted = await StorageOperations.deleteIfNeeded(result!.metadata);
      expect(deleted).toBe(true);

      // Verify deletion
      const gone = await StorageOperations.getGist(id);
      expect(gone).toBeNull();
    });

    it("should handle expired gist cleanup", async () => {
      const blob = StorageHelpers.createEncryptedBlob(testFiles);

      // Create expired gist
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const { id } = await StorageOperations.createGist(
        {
          total_size: StorageHelpers.calculateTotalSize(testFiles),
          blob_count: testFiles.length,
          expires_at: pastDate.toISOString(),
          encrypted_metadata: {
            iv: btoa("test-iv"),
            data: btoa("test-data"),
          },
        },
        blob
      );

      // Run cleanup
      const { deleted, checked } =
        await StorageOperations.cleanupExpiredGists();
      expect(deleted).toBeGreaterThanOrEqual(1);
      expect(checked).toBeGreaterThanOrEqual(1);

      // Verify deletion
      const gone = await StorageOperations.getGist(id);
      expect(gone).toBeNull();
    });
  });

  describe("Error Handling and Retry", () => {
    it("should handle concurrent operations gracefully", async () => {
      const blob = StorageHelpers.createEncryptedBlob(testFiles);

      // Create multiple gists concurrently
      const promises = Array(5)
        .fill(null)
        .map((_, i) =>
          StorageOperations.createGist(
            {
              total_size: StorageHelpers.calculateTotalSize(testFiles),
              blob_count: testFiles.length,
              encrypted_metadata: {
                iv: btoa(`test-iv-${i}`),
                data: btoa(`test-data-${i}`),
              },
            },
            blob
          )
        );

      const results = await Promise.all(promises);

      // All should succeed with unique IDs
      const ids = results.map((r) => r.id);
      expect(new Set(ids).size).toBe(5);

      // Clean up
      const storage = await import("../storage").then((m) => m.getR2Storage());
      await Promise.all(ids.map((id) => storage.deleteGist(id)));
    });

    it("should validate size limits", () => {
      // Test single file too large
      const largeFile: File[] = [
        {
          name: "large.txt",
          content: "x".repeat(501 * 1024), // 501KB
          language: "text",
        },
      ];

      expect(() => StorageHelpers.validateSizeLimits(largeFile)).toThrow(
        'File "large.txt" exceeds maximum size of 500KB'
      );

      // Test total size too large
      const manyFiles: File[] = Array(20)
        .fill(null)
        .map((_, i) => ({
          name: `file${i}.txt`,
          content: "x".repeat(300 * 1024), // 300KB each = 6MB total
          language: "text",
        }));

      expect(() => StorageHelpers.validateSizeLimits(manyFiles)).toThrow(
        "Total size exceeds maximum of 5MB"
      );
    });
  });

  describe("Storage Helpers", () => {
    it("should correctly calculate expiry dates", () => {
      const now = new Date();

      const oneHour = new Date(StorageHelpers.getExpiryDate("1hour"));
      const oneHourDiff = oneHour.getTime() - now.getTime();
      expect(oneHourDiff).toBeGreaterThan(59 * 60 * 1000);
      expect(oneHourDiff).toBeLessThan(61 * 60 * 1000);

      const sevenDays = new Date(StorageHelpers.getExpiryDate("7days"));
      const sevenDaysDiff = sevenDays.getTime() - now.getTime();
      expect(sevenDaysDiff).toBeGreaterThan(6.9 * 24 * 60 * 60 * 1000);
      expect(sevenDaysDiff).toBeLessThan(7.1 * 24 * 60 * 60 * 1000);
    });

    it("should format file sizes correctly", () => {
      expect(StorageHelpers.formatFileSize(512)).toBe("512 B");
      expect(StorageHelpers.formatFileSize(1536)).toBe("1.5 KB");
      expect(StorageHelpers.formatFileSize(1048576)).toBe("1.0 MB");
      expect(StorageHelpers.formatFileSize(5767168)).toBe("5.5 MB");
    });

    it("should correctly parse and create binary blobs", () => {
      const files: File[] = [
        {
          name: "test.js",
          content: "console.log('test');",
          language: "javascript",
        },
        { name: "style.css", content: "body { margin: 0; }", language: "css" },
      ];

      const blob = StorageHelpers.createEncryptedBlob(files);
      expect(blob).toBeInstanceOf(Uint8Array);

      const parsed = StorageHelpers.parseEncryptedBlob(blob);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].name).toBe("test.js");
      expect(parsed[0].content).toBe("console.log('test');");
      expect(parsed[1].name).toBe("style.css");
      expect(parsed[1].content).toBe("body { margin: 0; }");
    });
  });
});

/**
 * Performance tests
 */
describe("Storage Performance", () => {
  // Test data
  const testFiles: File[] = [
    {
      name: "test.js",
      content: `console.log("Hello, World!");`,
      language: "javascript",
    },
  ];

  it("should handle large files efficiently", async () => {
    const largeContent = "x".repeat(400 * 1024); // 400KB
    const files: File[] = [
      { name: "large1.txt", content: largeContent, language: "text" },
      { name: "large2.txt", content: largeContent, language: "text" },
    ];

    const blob = StorageHelpers.createEncryptedBlob(files);

    const start = Date.now();
    const { id } = await StorageOperations.createGist(
      {
        total_size: StorageHelpers.calculateTotalSize(files),
        blob_count: files.length,
        encrypted_metadata: {
          iv: btoa("test-iv"),
          data: btoa("test-data"),
        },
      },
      blob
    );
    const createTime = Date.now() - start;

    expect(createTime).toBeLessThan(5000); // Should complete within 5 seconds

    // Test retrieval performance
    const retrieveStart = Date.now();
    const result = await StorageOperations.getGist(id);
    const retrieveTime = Date.now() - retrieveStart;

    expect(result).not.toBeNull();
    expect(retrieveTime).toBeLessThan(2000); // Should retrieve within 2 seconds

    // Clean up
    const storage = await import("../storage").then((m) => m.getR2Storage());
    await storage.deleteGist(id);
  });

  it("should efficiently list and paginate gists", async () => {
    const blob = StorageHelpers.createEncryptedBlob(testFiles);

    // Create multiple gists
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const { id } = await StorageOperations.createGist(
        {
          total_size: 1000,
          blob_count: 1,
          encrypted_metadata: {
            iv: btoa(`test-iv-${i}`),
            data: btoa(`test-data-${i}`),
          },
        },
        blob
      );
      ids.push(id);
    }

    // Test listing
    const result = await StorageOperations.listGists({ limit: 3 });
    expect(result.gists.length).toBeLessThanOrEqual(3);

    // Clean up
    const storage = await import("../storage").then((m) => m.getR2Storage());
    await Promise.all(ids.map((id) => storage.deleteGist(id)));
  });
});
