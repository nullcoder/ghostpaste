import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { StorageOperations, StorageHelpers } from "./storage-operations";
import { getR2Storage, resetStorageInstance } from "./storage";
import { AppError, ErrorCode } from "@/types/errors";
import type { GistMetadata, File } from "@/types/models";

// Mock dependencies
vi.mock("./storage");
vi.mock("./id", () => ({
  generateGistId: vi.fn(() => "test-gist-id"),
}));
vi.mock("./logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("StorageOperations", () => {
  const mockStorage = {
    putBlob: vi.fn(),
    putMetadata: vi.fn(),
    getMetadata: vi.fn(),
    getCurrentBlob: vi.fn(),
    getBlob: vi.fn(),
    deleteGist: vi.fn(),
    exists: vi.fn(),
    listGists: vi.fn(),
    listVersions: vi.fn(),
    pruneVersions: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetStorageInstance();
    vi.mocked(getR2Storage).mockResolvedValue(mockStorage as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createGist", () => {
    it("should create a new gist successfully", async () => {
      const metadata: Omit<
        GistMetadata,
        "id" | "created_at" | "updated_at" | "version" | "current_version"
      > = {
        total_size: 1000,
        blob_count: 1,
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };
      const blob = new Uint8Array([1, 2, 3]);
      const timestamp = "2025-06-07T10:00:00.000Z";

      mockStorage.putBlob.mockResolvedValue(timestamp);
      mockStorage.putMetadata.mockResolvedValue(undefined);

      const result = await StorageOperations.createGist(metadata, blob);

      expect(result).toEqual({
        id: "test-gist-id",
        timestamp,
      });

      expect(mockStorage.putBlob).toHaveBeenCalledWith("test-gist-id", blob);
      expect(mockStorage.putMetadata).toHaveBeenCalledWith(
        "test-gist-id",
        expect.objectContaining({
          id: "test-gist-id",
          version: 1,
          current_version: timestamp,
          ...metadata,
        })
      );
    });

    it("should retry on transient failures", async () => {
      const metadata: Omit<
        GistMetadata,
        "id" | "created_at" | "updated_at" | "version" | "current_version"
      > = {
        total_size: 1000,
        blob_count: 1,
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };
      const blob = new Uint8Array([1, 2, 3]);
      const timestamp = "2025-06-07T10:00:00.000Z";

      // Fail twice, then succeed
      mockStorage.putBlob
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Timeout"))
        .mockResolvedValueOnce(timestamp);
      mockStorage.putMetadata.mockResolvedValue(undefined);

      const result = await StorageOperations.createGist(metadata, blob, {
        maxAttempts: 3,
        initialDelay: 10,
      });

      expect(result).toEqual({
        id: "test-gist-id",
        timestamp,
      });
      expect(mockStorage.putBlob).toHaveBeenCalledTimes(3);
    });

    it("should not retry on client errors", async () => {
      const metadata: Omit<
        GistMetadata,
        "id" | "created_at" | "updated_at" | "version" | "current_version"
      > = {
        total_size: 1000,
        blob_count: 1,
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };
      const blob = new Uint8Array([1, 2, 3]);

      mockStorage.putBlob.mockRejectedValue(
        new AppError(ErrorCode.BAD_REQUEST, 400, "Invalid data")
      );

      await expect(
        StorageOperations.createGist(metadata, blob)
      ).rejects.toThrow("Invalid data");

      expect(mockStorage.putBlob).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateGist", () => {
    it("should update gist metadata and blob", async () => {
      const existingMetadata: GistMetadata = {
        id: "test-id",
        created_at: "2025-06-01T10:00:00.000Z",
        updated_at: "2025-06-01T10:00:00.000Z",
        version: 1,
        current_version: "2025-06-01T10:00:00.000Z",
        total_size: 1000,
        blob_count: 1,
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };

      const updatedMetadata = {
        total_size: 2000,
        blob_count: 2,
      };

      const newBlob = new Uint8Array([4, 5, 6]);
      const newTimestamp = "2025-06-07T11:00:00.000Z";

      mockStorage.getMetadata.mockResolvedValue(existingMetadata);
      mockStorage.putBlob.mockResolvedValue(newTimestamp);
      mockStorage.putMetadata.mockResolvedValue(undefined);
      mockStorage.pruneVersions.mockResolvedValue(0);

      const result = await StorageOperations.updateGist(
        "test-id",
        updatedMetadata,
        newBlob
      );

      expect(result).toEqual({ timestamp: newTimestamp });

      expect(mockStorage.putMetadata).toHaveBeenCalledWith(
        "test-id",
        expect.objectContaining({
          ...existingMetadata,
          ...updatedMetadata,
          updated_at: expect.any(String),
          version: 2,
          current_version: newTimestamp,
        })
      );

      expect(mockStorage.pruneVersions).toHaveBeenCalledWith("test-id");
    });

    it("should update only metadata when no blob provided", async () => {
      const existingMetadata: GistMetadata = {
        id: "test-id",
        created_at: "2025-06-01T10:00:00.000Z",
        updated_at: "2025-06-01T10:00:00.000Z",
        version: 1,
        current_version: "2025-06-01T10:00:00.000Z",
        total_size: 1000,
        blob_count: 1,
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };

      mockStorage.getMetadata.mockResolvedValue(existingMetadata);
      mockStorage.putMetadata.mockResolvedValue(undefined);
      mockStorage.pruneVersions.mockResolvedValue(0);

      const result = await StorageOperations.updateGist("test-id", {
        expires_at: "2025-06-08T10:00:00.000Z",
      });

      expect(result).toEqual({ timestamp: undefined });
      expect(mockStorage.putBlob).not.toHaveBeenCalled();
      expect(mockStorage.putMetadata).toHaveBeenCalledWith(
        "test-id",
        expect.objectContaining({
          expires_at: "2025-06-08T10:00:00.000Z",
          version: 2,
          current_version: existingMetadata.current_version,
        })
      );
    });

    it("should throw error if gist not found", async () => {
      mockStorage.getMetadata.mockResolvedValue(null);

      await expect(
        StorageOperations.updateGist("non-existent", {})
      ).rejects.toThrow("Gist non-existent not found");
    });
  });

  describe("getGist", () => {
    it("should retrieve gist metadata and blob", async () => {
      const metadata: GistMetadata = {
        id: "test-id",
        created_at: "2025-06-01T10:00:00.000Z",
        updated_at: "2025-06-01T10:00:00.000Z",
        version: 1,
        current_version: "2025-06-01T10:00:00.000Z",
        total_size: 1000,
        blob_count: 1,
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };
      const blob = new Uint8Array([1, 2, 3]);

      mockStorage.getMetadata.mockResolvedValue(metadata);
      mockStorage.getCurrentBlob.mockResolvedValue(blob);

      const result = await StorageOperations.getGist("test-id");

      expect(result).toEqual({ metadata, blob });
    });

    it("should return null if gist not found", async () => {
      mockStorage.getMetadata.mockResolvedValue(null);

      const result = await StorageOperations.getGist("non-existent");

      expect(result).toBeNull();
    });

    it("should throw error if blob not found", async () => {
      const metadata: GistMetadata = {
        id: "test-id",
        created_at: "2025-06-01T10:00:00.000Z",
        updated_at: "2025-06-01T10:00:00.000Z",
        version: 1,
        current_version: "2025-06-01T10:00:00.000Z",
        total_size: 1000,
        blob_count: 1,
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };

      mockStorage.getMetadata.mockResolvedValue(metadata);
      mockStorage.getCurrentBlob.mockResolvedValue(null);

      await expect(StorageOperations.getGist("test-id")).rejects.toThrow(
        "Operation failed after 3 attempts"
      );
    });
  });

  describe("deleteIfNeeded", () => {
    it("should delete one-time view gist", async () => {
      const metadata: GistMetadata = {
        id: "test-id",
        created_at: "2025-06-01T10:00:00.000Z",
        updated_at: "2025-06-01T10:00:00.000Z",
        version: 1,
        current_version: "2025-06-01T10:00:00.000Z",
        total_size: 1000,
        blob_count: 1,
        one_time_view: true,
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };

      mockStorage.deleteGist.mockResolvedValue(undefined);

      const result = await StorageOperations.deleteIfNeeded(metadata);

      expect(result).toBe(true);
      expect(mockStorage.deleteGist).toHaveBeenCalledWith("test-id");
    });

    it("should delete expired gist", async () => {
      const metadata: GistMetadata = {
        id: "test-id",
        created_at: "2025-06-01T10:00:00.000Z",
        updated_at: "2025-06-01T10:00:00.000Z",
        version: 1,
        current_version: "2025-06-01T10:00:00.000Z",
        total_size: 1000,
        blob_count: 1,
        expires_at: "2025-06-01T10:00:00.000Z", // Past date
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };

      mockStorage.deleteGist.mockResolvedValue(undefined);

      const result = await StorageOperations.deleteIfNeeded(metadata);

      expect(result).toBe(true);
      expect(mockStorage.deleteGist).toHaveBeenCalledWith("test-id");
    });

    it("should not delete non-expired gist", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const metadata: GistMetadata = {
        id: "test-id",
        created_at: "2025-06-01T10:00:00.000Z",
        updated_at: "2025-06-01T10:00:00.000Z",
        version: 1,
        current_version: "2025-06-01T10:00:00.000Z",
        total_size: 1000,
        blob_count: 1,
        expires_at: futureDate.toISOString(),
        encrypted_metadata: {
          iv: "test-iv",
          data: "test-data",
        },
      };

      const result = await StorageOperations.deleteIfNeeded(metadata);

      expect(result).toBe(false);
      expect(mockStorage.deleteGist).not.toHaveBeenCalled();
    });
  });

  describe("cleanupExpiredGists", () => {
    it("should delete expired gists in batches", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const gists = [
        {
          id: "expired-1",
          metadata: {
            id: "expired-1",
            expires_at: "2025-06-01T10:00:00.000Z", // Past
          } as GistMetadata,
        },
        {
          id: "active-1",
          metadata: {
            id: "active-1",
            expires_at: futureDate.toISOString(), // Future
          } as GistMetadata,
        },
        {
          id: "expired-2",
          metadata: {
            id: "expired-2",
            expires_at: "2025-06-02T10:00:00.000Z", // Past
          } as GistMetadata,
        },
        {
          id: "no-expiry",
          metadata: {
            id: "no-expiry",
          } as GistMetadata,
        },
      ];

      mockStorage.listGists.mockResolvedValueOnce({
        gists,
        truncated: false,
      });
      mockStorage.deleteGist.mockResolvedValue(undefined);

      const result = await StorageOperations.cleanupExpiredGists(100);

      expect(result).toEqual({ deleted: 2, checked: 4 });
      expect(mockStorage.deleteGist).toHaveBeenCalledTimes(2);
      expect(mockStorage.deleteGist).toHaveBeenCalledWith("expired-1");
      expect(mockStorage.deleteGist).toHaveBeenCalledWith("expired-2");
    });
  });
});

describe("StorageHelpers", () => {
  describe("validateSizeLimits", () => {
    it("should pass for valid file sizes", () => {
      const files: File[] = [
        { name: "file1.ts", content: "a".repeat(100), language: "typescript" },
        { name: "file2.ts", content: "b".repeat(200), language: "typescript" },
      ];

      expect(() => StorageHelpers.validateSizeLimits(files)).not.toThrow();
    });

    it("should throw for file exceeding 500KB", () => {
      const files: File[] = [
        {
          name: "large.ts",
          content: "a".repeat(501 * 1024),
          language: "typescript",
        },
      ];

      expect(() => StorageHelpers.validateSizeLimits(files)).toThrow(
        'File "large.ts" exceeds maximum size of 500KB'
      );
    });

    it("should throw for total size exceeding 5MB", () => {
      const files: File[] = Array(20)
        .fill(null)
        .map((_, i) => ({
          name: `file${i}.ts`,
          content: "a".repeat(300 * 1024), // 300KB each
          language: "typescript",
        }));

      expect(() => StorageHelpers.validateSizeLimits(files)).toThrow(
        "Total size exceeds maximum of 5MB"
      );
    });
  });

  describe("getExpiryDate", () => {
    it("should calculate correct expiry dates", () => {
      const now = new Date();

      // Test 1 hour
      const oneHour = new Date(StorageHelpers.getExpiryDate("1hour"));
      expect(oneHour.getTime() - now.getTime()).toBeCloseTo(60 * 60 * 1000, -3);

      // Test 24 hours
      const oneDay = new Date(StorageHelpers.getExpiryDate("24hours"));
      expect(oneDay.getTime() - now.getTime()).toBeCloseTo(
        24 * 60 * 60 * 1000,
        -3
      );

      // Test 7 days
      const oneWeek = new Date(StorageHelpers.getExpiryDate("7days"));
      expect(oneWeek.getTime() - now.getTime()).toBeCloseTo(
        7 * 24 * 60 * 60 * 1000,
        -3
      );

      // Test 30 days
      const oneMonth = new Date(StorageHelpers.getExpiryDate("30days"));
      expect(oneMonth.getTime() - now.getTime()).toBeCloseTo(
        30 * 24 * 60 * 60 * 1000,
        -3
      );
    });
  });

  describe("shouldDeleteAfterView", () => {
    it("should return true for one-time view", () => {
      const metadata = {
        one_time_view: true,
      } as GistMetadata;

      expect(StorageHelpers.shouldDeleteAfterView(metadata)).toBe(true);
    });

    it("should return true for expired gist", () => {
      const metadata = {
        expires_at: "2025-06-01T10:00:00.000Z", // Past
      } as GistMetadata;

      expect(StorageHelpers.shouldDeleteAfterView(metadata)).toBe(true);
    });

    it("should return false for non-expired gist", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const metadata = {
        expires_at: futureDate.toISOString(),
      } as GistMetadata;

      expect(StorageHelpers.shouldDeleteAfterView(metadata)).toBe(false);
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      expect(StorageHelpers.formatFileSize(100)).toBe("100 B");
      expect(StorageHelpers.formatFileSize(1024)).toBe("1.0 KB");
      expect(StorageHelpers.formatFileSize(1536)).toBe("1.5 KB");
      expect(StorageHelpers.formatFileSize(1048576)).toBe("1.0 MB");
      expect(StorageHelpers.formatFileSize(5242880)).toBe("5.0 MB");
    });
  });
});
