import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  R2Storage,
  getR2Storage,
  StorageKeys,
  isR2NotFoundError,
  resetStorageInstance,
} from "./storage";
import { AppError, ErrorCode } from "@/types/errors";
import type { GistMetadata } from "@/types/models";

// Mock getCloudflareContext
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(),
}));

// Import the mocked module
import { getCloudflareContext } from "@opennextjs/cloudflare";

describe("R2Storage", () => {
  let storage: R2Storage;
  let mockBucket: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock R2 bucket
    mockBucket = {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      head: vi.fn(),
      list: vi.fn(),
    };

    // Mock the getCloudflareContext function
    vi.mocked(getCloudflareContext).mockResolvedValue({
      env: {
        GHOSTPASTE_BUCKET: mockBucket,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        ENVIRONMENT: "test",
      } as any,
      cf: {} as any,
      ctx: {} as any,
    });

    storage = new R2Storage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialize", () => {
    it("should initialize successfully with bucket binding", async () => {
      await expect(storage.initialize()).resolves.toBeUndefined();
    });

    it("should throw error if bucket binding not found", async () => {
      vi.mocked(getCloudflareContext).mockResolvedValue({
        env: {
          NEXT_PUBLIC_APP_URL: "http://localhost:3000",
          ENVIRONMENT: "test",
        } as any,
        cf: {} as any,
        ctx: {} as any,
      });

      await expect(storage.initialize()).rejects.toThrow(AppError);
      await expect(storage.initialize()).rejects.toMatchObject({
        code: ErrorCode.STORAGE_ERROR,
        statusCode: 500,
        message: "R2 bucket binding not found",
      });
    });

    it("should handle initialization errors", async () => {
      vi.mocked(getCloudflareContext).mockRejectedValue(
        new Error("Context error")
      );

      await expect(storage.initialize()).rejects.toThrow(AppError);
      await expect(storage.initialize()).rejects.toMatchObject({
        code: ErrorCode.STORAGE_ERROR,
        statusCode: 500,
        message: "Failed to initialize R2 storage",
      });
    });
  });

  describe("putMetadata", () => {
    const mockMetadata: GistMetadata = {
      id: "test-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      version: 1,
      current_version: "2024-01-01T00:00:00Z",
      total_size: 1000,
      blob_count: 1,
      encrypted_metadata: {
        iv: "test-iv",
        data: "test-data",
      },
    };

    it("should store metadata successfully", async () => {
      await storage.initialize();
      await storage.putMetadata("test-id", mockMetadata);

      expect(mockBucket.put).toHaveBeenCalledWith(
        "metadata/test-id.json",
        JSON.stringify(mockMetadata),
        {
          httpMetadata: { contentType: "application/json" },
          customMetadata: {
            type: "metadata",
            version: "1",
            createdAt: "2024-01-01T00:00:00Z",
          },
        }
      );
    });

    it("should throw error if not initialized", async () => {
      await expect(
        storage.putMetadata("test-id", mockMetadata)
      ).rejects.toThrow("R2 storage not initialized");
    });

    it("should handle put errors", async () => {
      await storage.initialize();
      mockBucket.put.mockRejectedValue(new Error("Put failed"));

      await expect(
        storage.putMetadata("test-id", mockMetadata)
      ).rejects.toThrow(AppError);
      await expect(
        storage.putMetadata("test-id", mockMetadata)
      ).rejects.toMatchObject({
        code: ErrorCode.STORAGE_ERROR,
        message: "Failed to store metadata for gist test-id",
      });
    });
  });

  describe("getMetadata", () => {
    const mockMetadata: GistMetadata = {
      id: "test-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      version: 1,
      current_version: "2024-01-01T00:00:00Z",
      total_size: 1000,
      blob_count: 1,
      encrypted_metadata: {
        iv: "test-iv",
        data: "test-data",
      },
    };

    it("should retrieve metadata successfully", async () => {
      await storage.initialize();
      mockBucket.get.mockResolvedValue({
        text: vi.fn().mockResolvedValue(JSON.stringify(mockMetadata)),
      });

      const result = await storage.getMetadata("test-id");
      expect(result).toEqual(mockMetadata);
      expect(mockBucket.get).toHaveBeenCalledWith("metadata/test-id.json");
    });

    it("should return null if metadata not found", async () => {
      await storage.initialize();
      mockBucket.get.mockResolvedValue(null);

      const result = await storage.getMetadata("test-id");
      expect(result).toBeNull();
    });

    it("should handle invalid JSON", async () => {
      await storage.initialize();
      mockBucket.get.mockResolvedValue({
        text: vi.fn().mockResolvedValue("invalid json"),
      });

      await expect(storage.getMetadata("test-id")).rejects.toThrow(AppError);
      await expect(storage.getMetadata("test-id")).rejects.toMatchObject({
        code: ErrorCode.STORAGE_ERROR,
        message: "Invalid metadata format for gist test-id",
      });
    });
  });

  describe("putBlob", () => {
    it("should store blob successfully and return timestamp", async () => {
      await storage.initialize();
      const data = new Uint8Array([1, 2, 3, 4]);
      const timestamp = await storage.putBlob("test-id", data);

      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(mockBucket.put).toHaveBeenCalledWith(
        expect.stringMatching(/^versions\/test-id\/.*\.bin$/),
        data,
        {
          httpMetadata: { contentType: "application/octet-stream" },
          customMetadata: {
            type: "version",
            size: "4",
            timestamp: expect.any(String),
          },
        }
      );
    });

    it("should handle put errors", async () => {
      await storage.initialize();
      mockBucket.put.mockRejectedValue(new Error("Put failed"));

      await expect(
        storage.putBlob("test-id", new Uint8Array())
      ).rejects.toThrow(AppError);
    });
  });

  describe("getBlob", () => {
    it("should retrieve blob by timestamp successfully", async () => {
      await storage.initialize();
      const mockData = new Uint8Array([1, 2, 3, 4]);
      mockBucket.get.mockResolvedValue({
        arrayBuffer: vi.fn().mockResolvedValue(mockData.buffer),
      });

      const timestamp = "2024-01-01T00:00:00Z";
      const result = await storage.getBlob("test-id", timestamp);
      expect(result).toEqual(mockData);
      expect(mockBucket.get).toHaveBeenCalledWith(
        "versions/test-id/2024-01-01T00:00:00Z.bin"
      );
    });

    it("should return null if blob not found", async () => {
      await storage.initialize();
      mockBucket.get.mockResolvedValue(null);

      const result = await storage.getBlob("test-id", "2024-01-01T00:00:00Z");
      expect(result).toBeNull();
    });
  });

  describe("getCurrentBlob", () => {
    const mockMetadata: GistMetadata = {
      id: "test-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      version: 1,
      current_version: "2024-01-01T00:00:00Z",
      total_size: 1000,
      blob_count: 1,
      encrypted_metadata: {
        iv: "test-iv",
        data: "test-data",
      },
    };

    it("should retrieve current blob using metadata", async () => {
      await storage.initialize();
      const mockData = new Uint8Array([1, 2, 3, 4]);

      // Mock metadata get
      mockBucket.get
        .mockResolvedValueOnce({
          text: vi.fn().mockResolvedValue(JSON.stringify(mockMetadata)),
        })
        // Mock blob get
        .mockResolvedValueOnce({
          arrayBuffer: vi.fn().mockResolvedValue(mockData.buffer),
        });

      const result = await storage.getCurrentBlob("test-id");
      expect(result).toEqual(mockData);
    });

    it("should return null if metadata not found", async () => {
      await storage.initialize();
      mockBucket.get.mockResolvedValue(null);

      const result = await storage.getCurrentBlob("test-id");
      expect(result).toBeNull();
    });
  });

  describe("deleteGist", () => {
    it("should delete metadata and all versions", async () => {
      await storage.initialize();
      mockBucket.list.mockResolvedValue({
        objects: [
          { key: "versions/test-id/2024-01-01T00:00:00Z.bin" },
          { key: "versions/test-id/2024-01-02T00:00:00Z.bin" },
        ],
        truncated: false,
      });

      await storage.deleteGist("test-id");

      expect(mockBucket.delete).toHaveBeenCalledWith("metadata/test-id.json");
      expect(mockBucket.delete).toHaveBeenCalledWith(
        "versions/test-id/2024-01-01T00:00:00Z.bin"
      );
      expect(mockBucket.delete).toHaveBeenCalledWith(
        "versions/test-id/2024-01-02T00:00:00Z.bin"
      );
      expect(mockBucket.delete).toHaveBeenCalledTimes(3);
    });

    it("should handle delete errors", async () => {
      await storage.initialize();
      mockBucket.list.mockResolvedValue({ objects: [], truncated: false });
      mockBucket.delete.mockRejectedValue(new Error("Delete failed"));

      await expect(storage.deleteGist("test-id")).rejects.toThrow(AppError);
    });
  });

  describe("exists", () => {
    it("should return true if gist exists", async () => {
      await storage.initialize();
      mockBucket.head.mockResolvedValue({});

      const result = await storage.exists("test-id");
      expect(result).toBe(true);
      expect(mockBucket.head).toHaveBeenCalledWith("metadata/test-id.json");
    });

    it("should return false if gist does not exist", async () => {
      await storage.initialize();
      mockBucket.head.mockResolvedValue(null);

      const result = await storage.exists("test-id");
      expect(result).toBe(false);
    });

    it("should return false on head error", async () => {
      await storage.initialize();
      mockBucket.head.mockRejectedValue(new Error("Not found"));

      const result = await storage.exists("test-id");
      expect(result).toBe(false);
    });
  });

  describe("listGists", () => {
    const mockMetadata: GistMetadata = {
      id: "test-id",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      version: 1,
      current_version: "2024-01-01T00:00:00Z",
      total_size: 1000,
      blob_count: 1,
      encrypted_metadata: {
        iv: "test-iv",
        data: "test-data",
      },
    };

    it("should list gists successfully", async () => {
      await storage.initialize();
      mockBucket.list.mockResolvedValue({
        objects: [{ key: "metadata/test-id.json" }],
        truncated: false,
      });
      mockBucket.get.mockResolvedValue({
        text: vi.fn().mockResolvedValue(JSON.stringify(mockMetadata)),
      });

      const result = await storage.listGists();
      expect(result.gists).toHaveLength(1);
      expect(result.gists[0]).toEqual({
        id: "test-id",
        metadata: mockMetadata,
      });
      expect(result.truncated).toBe(false);
    });

    it("should handle pagination", async () => {
      await storage.initialize();
      mockBucket.list.mockResolvedValue({
        objects: [],
        truncated: true,
        cursor: "next-cursor",
      });

      const result = await storage.listGists({ limit: 10 });
      expect(result.cursor).toBe("next-cursor");
      expect(result.truncated).toBe(true);
    });
  });

  describe("getStorageStats", () => {
    it("should calculate storage statistics", async () => {
      await storage.initialize();
      mockBucket.list.mockResolvedValue({
        objects: [
          { key: "metadata/gist1.json", size: 100 },
          { key: "blobs/gist1", size: 1000 },
          { key: "metadata/gist2.json", size: 150 },
          { key: "blobs/gist2", size: 2000 },
        ],
        truncated: false,
      });

      const stats = await storage.getStorageStats();
      expect(stats.totalGists).toBe(2);
      expect(stats.totalSize).toBe(3250);
    });

    it("should handle paginated results", async () => {
      await storage.initialize();
      mockBucket.list
        .mockResolvedValueOnce({
          objects: [{ key: "metadata/gist1.json", size: 100 }],
          truncated: true,
          cursor: "cursor1",
        })
        .mockResolvedValueOnce({
          objects: [{ key: "metadata/gist2.json", size: 200 }],
          truncated: false,
        });

      const stats = await storage.getStorageStats();
      expect(stats.totalGists).toBe(2);
      expect(stats.totalSize).toBe(300);
    });
  });

  describe("listVersions", () => {
    it("should list all versions for a gist", async () => {
      await storage.initialize();
      mockBucket.list.mockResolvedValue({
        objects: [
          { key: "versions/test-id/2024-01-02T00:00:00Z.bin", size: 200 },
          { key: "versions/test-id/2024-01-01T00:00:00Z.bin", size: 100 },
        ],
        truncated: false,
      });

      const versions = await storage.listVersions("test-id");

      expect(versions).toHaveLength(2);
      expect(versions[0]).toEqual({
        timestamp: "2024-01-02T00:00:00Z",
        size: 200,
      });
      expect(versions[1]).toEqual({
        timestamp: "2024-01-01T00:00:00Z",
        size: 100,
      });
    });

    it("should handle list errors", async () => {
      await storage.initialize();
      mockBucket.list.mockRejectedValue(new Error("List failed"));

      await expect(storage.listVersions("test-id")).rejects.toThrow(AppError);
    });
  });

  describe("pruneVersions", () => {
    it("should delete old versions beyond limit", async () => {
      await storage.initialize();
      mockBucket.list.mockResolvedValue({
        objects: [
          { key: "versions/test-id/2024-01-05T00:00:00Z.bin", size: 100 },
          { key: "versions/test-id/2024-01-04T00:00:00Z.bin", size: 100 },
          { key: "versions/test-id/2024-01-03T00:00:00Z.bin", size: 100 },
          { key: "versions/test-id/2024-01-02T00:00:00Z.bin", size: 100 },
          { key: "versions/test-id/2024-01-01T00:00:00Z.bin", size: 100 },
        ],
        truncated: false,
      });

      const deleted = await storage.pruneVersions("test-id", 3);

      expect(deleted).toBe(2);
      expect(mockBucket.delete).toHaveBeenCalledWith(
        "versions/test-id/2024-01-02T00:00:00Z.bin"
      );
      expect(mockBucket.delete).toHaveBeenCalledWith(
        "versions/test-id/2024-01-01T00:00:00Z.bin"
      );
    });

    it("should not delete if under limit", async () => {
      await storage.initialize();
      mockBucket.list.mockResolvedValue({
        objects: [
          { key: "versions/test-id/2024-01-02T00:00:00Z.bin", size: 100 },
          { key: "versions/test-id/2024-01-01T00:00:00Z.bin", size: 100 },
        ],
        truncated: false,
      });

      const deleted = await storage.pruneVersions("test-id", 50);

      expect(deleted).toBe(0);
      expect(mockBucket.delete).not.toHaveBeenCalled();
    });
  });
});

describe("StorageKeys", () => {
  it("should generate correct keys", () => {
    expect(StorageKeys.metadata("test-id")).toBe("metadata/test-id.json");
    expect(StorageKeys.version("test-id", "2024-01-01T00:00:00Z")).toBe(
      "versions/test-id/2024-01-01T00:00:00Z.bin"
    );
    expect(StorageKeys.temp("test-id")).toBe("temp/test-id");
  });
});

describe("getR2Storage", () => {
  beforeEach(() => {
    // Reset singleton before test
    resetStorageInstance();
  });

  it("should return singleton instance", async () => {
    // Mock bucket for singleton test
    const mockBucket = {
      put: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
      head: vi.fn(),
      list: vi.fn(),
    };

    vi.mocked(getCloudflareContext).mockResolvedValue({
      env: {
        GHOSTPASTE_BUCKET: mockBucket,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        ENVIRONMENT: "test",
      } as any,
      cf: {} as any,
      ctx: {} as any,
    });

    const storage1 = await getR2Storage();
    const storage2 = await getR2Storage();
    expect(storage1).toBe(storage2);
  });
});

describe("isR2NotFoundError", () => {
  it("should identify R2 not found errors", () => {
    expect(isR2NotFoundError(new Error("R2ObjectNotFound"))).toBe(true);
    expect(isR2NotFoundError(new Error("NoSuchKey"))).toBe(true);
    expect(isR2NotFoundError(new Error("Other error"))).toBe(false);
    expect(isR2NotFoundError("not an error")).toBe(false);
  });
});
