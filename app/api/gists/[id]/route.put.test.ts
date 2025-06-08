import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PUT } from "./route";
import { StorageOperations } from "@/lib/storage-operations";
import { validateGistPin } from "@/lib/crypto-utils";
import type { GistMetadata } from "@/types/models";
import type { ApiErrorResponse } from "@/types/api";

// Mock dependencies
vi.mock("@/lib/storage-operations", () => ({
  StorageOperations: {
    getGist: vi.fn(),
    updateGist: vi.fn(),
  },
}));

vi.mock("@/lib/crypto-utils", async () => {
  const actual = await vi.importActual("@/lib/crypto-utils");
  return {
    ...actual,
    validateGistPin: vi.fn(),
  };
});

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  })),
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

const mockMetadata: GistMetadata = {
  id: "test-gist-id",
  created_at: "2025-06-08T10:00:00.000Z",
  updated_at: "2025-06-08T10:00:00.000Z",
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
  encrypted_metadata: { iv: "existing-iv", data: "existing-data" },
};

const createPutRequest = (
  parts: {
    metadata?: object;
    blob?: Uint8Array;
    version?: string;
  },
  headers: Record<string, string> = {}
): NextRequest => {
  const formData = new FormData();

  if (parts.metadata !== undefined) {
    const metadataBlob = new Blob([JSON.stringify(parts.metadata)], {
      type: "application/json",
    });
    formData.append("metadata", metadataBlob, "metadata.json");
  }

  if (parts.blob !== undefined) {
    const blobFile = new Blob([parts.blob], {
      type: "application/octet-stream",
    });
    formData.append("blob", blobFile, "blob.bin");
  }

  if (parts.version !== undefined) {
    formData.append("version", parts.version);
  }

  return new NextRequest("http://localhost:3000/api/gists/test-gist-id", {
    method: "PUT",
    headers: {
      "X-Requested-With": "GhostPaste",
      Origin: "http://localhost:3000",
      ...headers,
    },
    body: formData,
  });
};

const createContext = (id = "test-gist-id") => ({
  params: Promise.resolve({ id }),
});

describe("PUT /api/gists/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful updates", () => {
    it("should update gist with valid encrypted metadata", async () => {
      const mockGist = { metadata: mockMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(StorageOperations.updateGist).mockResolvedValue({});
      vi.mocked(validateGistPin).mockResolvedValue(true);

      const request = createPutRequest(
        {
          metadata: {
            encrypted_metadata: {
              iv: "new-base64-iv",
              data: "new-base64-data",
            },
            indent_mode: "tabs",
            theme: "light",
          },
          blob: new Uint8Array([1, 2, 3, 4, 5]),
          version: "1",
        },
        {
          "X-Edit-Password": "correct-pin",
        }
      );

      const context = createContext();
      const response = await PUT(request, context);

      expect(response.status).toBe(200);
      const data = (await response.json()) as { version: number };
      expect(data.version).toBe(2);

      expect(StorageOperations.updateGist).toHaveBeenCalledWith(
        "test-gist-id",
        expect.objectContaining({
          version: 2,
          encrypted_metadata: {
            iv: "new-base64-iv",
            data: "new-base64-data",
          },
          indent_mode: "tabs",
          theme: "light",
        }),
        expect.any(Uint8Array)
      );
    });

    it("should update gist without encrypted metadata", async () => {
      const mockGist = { metadata: mockMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(StorageOperations.updateGist).mockResolvedValue({});
      vi.mocked(validateGistPin).mockResolvedValue(true);

      const request = createPutRequest(
        {
          metadata: {
            indent_mode: "tabs",
            indent_size: 4,
          },
          blob: new Uint8Array([1, 2, 3]),
          version: "1",
        },
        {
          "X-Edit-Password": "correct-pin",
        }
      );

      const context = createContext();
      const response = await PUT(request, context);

      expect(response.status).toBe(200);
      expect(StorageOperations.updateGist).toHaveBeenCalledWith(
        "test-gist-id",
        expect.objectContaining({
          encrypted_metadata: undefined,
          indent_mode: "tabs",
          indent_size: 4,
        }),
        expect.any(Uint8Array)
      );
    });
  });

  describe("validation errors", () => {
    it("should reject invalid encrypted metadata schema", async () => {
      const request = createPutRequest({
        metadata: {
          encrypted_metadata: {
            iv: "", // Empty string should fail min(1) validation
            data: "valid-data",
          },
        },
        blob: new Uint8Array([1, 2, 3]),
        version: "1",
      });

      const context = createContext();
      const response = await PUT(request, context);

      expect(response.status).toBe(422);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid update metadata");
      expect(data.details).toBeDefined();
    });

    it("should reject invalid editor preferences", async () => {
      const request = createPutRequest({
        metadata: {
          indent_mode: "invalid-mode", // Should fail enum validation
          theme: "rainbow", // Should fail enum validation
        },
        blob: new Uint8Array([1, 2, 3]),
        version: "1",
      });

      const context = createContext();
      const response = await PUT(request, context);

      expect(response.status).toBe(422);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid update metadata");
    });

    it("should reject missing encrypted metadata fields", async () => {
      const request = createPutRequest({
        metadata: {
          encrypted_metadata: {
            iv: "valid-iv",
            // Missing 'data' field
          },
        },
        blob: new Uint8Array([1, 2, 3]),
        version: "1",
      });

      const context = createContext();
      const response = await PUT(request, context);

      expect(response.status).toBe(422);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid update metadata");
    });
  });

  describe("CSRF protection", () => {
    it("should reject requests without CSRF headers", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/gists/test-gist-id",
        {
          method: "PUT",
          body: new FormData(),
        }
      );

      const context = createContext();
      const response = await PUT(request, context);

      expect(response.status).toBe(403);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid request headers");
    });
  });
});
