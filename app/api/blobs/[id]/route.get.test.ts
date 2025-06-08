import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { StorageOperations } from "@/lib/storage-operations";
import { ApiErrors } from "@/lib/api-errors";
import type { GistMetadata } from "@/types/models";
import type { ApiErrorResponse } from "@/types/api";

// Mock StorageOperations
vi.mock("@/lib/storage-operations", () => ({
  StorageOperations: {
    getGist: vi.fn(),
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  })),
}));

describe("GET /api/blobs/[id]", () => {
  const mockMetadata: GistMetadata = {
    id: "test-gist-id",
    created_at: "2025-06-07T10:00:00.000Z",
    updated_at: "2025-06-07T10:00:00.000Z",
    expires_at: undefined,
    one_time_view: false,
    edit_pin_hash: "hash123",
    edit_pin_salt: "salt123",
    total_size: 1024,
    blob_count: 1,
    version: 1,
    current_version: "1733568000000",
    indent_mode: "spaces",
    indent_size: 2,
    wrap_mode: "soft",
    theme: "dark",
    encrypted_metadata: { iv: "iv123", data: "encrypted" },
  };

  const mockBlob = new Uint8Array([1, 2, 3, 4, 5]);

  const createRequest = () => {
    return new NextRequest("https://test.com/api/blobs/test-gist-id");
  };

  const createContext = (id = "test-gist-id") => ({
    params: Promise.resolve({ id }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("successful retrieval", () => {
    it("should return blob data for valid gist", async () => {
      const mockGist = { metadata: mockMetadata, blob: mockBlob };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const request = createRequest();
      const context = createContext();
      const response = await GET(request, context);

      expect(response.status).toBe(200);

      const data = await response.arrayBuffer();
      const uint8Array = new Uint8Array(data);
      expect(uint8Array).toEqual(mockBlob);
    });

    it("should set appropriate headers for blob response", async () => {
      const mockGist = { metadata: mockMetadata, blob: mockBlob };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const request = createRequest();
      const context = createContext();
      const response = await GET(request, context);

      expect(response.headers.get("Content-Type")).toBe(
        "application/octet-stream"
      );
      expect(response.headers.get("Content-Length")).toBe(
        mockBlob.length.toString()
      );
      expect(response.headers.get("Cache-Control")).toBe(
        "private, max-age=3600"
      );
      expect(response.headers.get("Content-Disposition")).toBe(
        'attachment; filename="gist-test-gist-id.bin"'
      );
      expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    });

    it("should handle one-time view gists correctly", async () => {
      const oneTimeMetadata = { ...mockMetadata, one_time_view: true };
      const mockGist = { metadata: oneTimeMetadata, blob: mockBlob };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const request = createRequest();
      const context = createContext();
      const response = await GET(request, context);

      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe(
        "no-store, no-cache, must-revalidate"
      );
      // Note: Auto-deletion removed, now handled by explicit DELETE endpoint
    });

    it("should handle large blob data", async () => {
      const largeMockBlob = new Uint8Array(1024 * 1024); // 1MB
      largeMockBlob.fill(42); // Fill with some data
      const mockGist = { metadata: mockMetadata, blob: largeMockBlob };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const request = createRequest();
      const context = createContext();
      const response = await GET(request, context);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Length")).toBe(
        largeMockBlob.length.toString()
      );

      const data = await response.arrayBuffer();
      expect(data.byteLength).toBe(1024 * 1024);
    });
  });

  describe("error handling", () => {
    it("should return 400 for invalid gist ID", async () => {
      const request = createRequest();
      const context = createContext("");
      const response = await GET(request, context);

      expect(response.status).toBe(400);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid gist ID");
    });

    it("should return 404 for non-existent gist", async () => {
      const notFoundError = ApiErrors.notFound("Gist");
      vi.mocked(StorageOperations.getGist).mockRejectedValue(notFoundError);

      const request = createRequest();
      const context = createContext();
      const response = await GET(request, context);

      expect(response.status).toBe(404);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Gist not found");
    });

    it("should return 410 for expired gist based on expires_at", async () => {
      const expiredMetadata = {
        ...mockMetadata,
        expires_at: "2020-01-01T00:00:00.000Z", // Past date
      };
      const mockGist = { metadata: expiredMetadata, blob: mockBlob };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const request = createRequest();
      const context = createContext();
      const response = await GET(request, context);

      expect(response.status).toBe(410);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Gist has expired");
    });

    it("should handle storage errors gracefully", async () => {
      const storageError = new Error("Storage connection failed");
      vi.mocked(StorageOperations.getGist).mockRejectedValue(storageError);

      const request = createRequest();
      const context = createContext();
      const response = await GET(request, context);

      expect(response.status).toBe(500);
      // Note: Logger mock calls can't be easily tested with current mock setup
    });

    // Note: Auto-deletion test removed since deletion is now handled by explicit DELETE endpoint

    it("should handle unexpected errors", async () => {
      const unexpectedError = new TypeError("Something went wrong");
      vi.mocked(StorageOperations.getGist).mockRejectedValue(unexpectedError);

      const request = createRequest();
      const context = createContext();
      const response = await GET(request, context);

      expect(response.status).toBe(500);
      // Note: Logger mock calls can't be easily tested with current mock setup
    });

    it("should handle empty blob data", async () => {
      const emptyBlob = new Uint8Array(0);
      const mockGist = { metadata: mockMetadata, blob: emptyBlob };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const request = createRequest();
      const context = createContext();
      const response = await GET(request, context);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Length")).toBe("0");

      const data = await response.arrayBuffer();
      expect(data.byteLength).toBe(0);
    });
  });
});
