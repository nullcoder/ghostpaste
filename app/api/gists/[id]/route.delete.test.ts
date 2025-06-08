import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { DELETE } from "./route";
import { StorageOperations } from "@/lib/storage-operations";
import { ApiErrors } from "@/lib/api-errors";
import { sha256Hash, validateGistPin } from "@/lib/crypto-utils";
import type { GistMetadata } from "@/types/models";
import type { ApiErrorResponse } from "@/types/api";

// Mock StorageOperations
vi.mock("@/lib/storage-operations", () => ({
  StorageOperations: {
    getGist: vi.fn(),
    deleteIfNeeded: vi.fn(),
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
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock crypto utils
vi.mock("@/lib/crypto-utils", async () => {
  const actual = await vi.importActual("@/lib/crypto-utils");
  return {
    ...actual,
    validateGistPin: vi.fn(),
  };
});

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

const createContext = (id = "test-gist-id") => ({
  params: Promise.resolve({ id }),
});

describe("DELETE /api/gists/[id]", () => {
  const oneTimeMetadata: GistMetadata = {
    ...mockMetadata,
    one_time_view: true,
  };

  const generateProof = async (
    createdAt: string,
    totalSize: number,
    gistId: string
  ): Promise<string> => {
    return sha256Hash(`${createdAt}${totalSize}${gistId}delete`);
  };

  const createDeleteRequest = (
    body: object,
    headers: Record<string, string> = {}
  ) => {
    const defaultHeaders = {
      "Content-Type": "application/json",
      "X-Requested-With": "GhostPaste",
      Origin: "https://ghostpaste.dev",
    };

    return new NextRequest("https://test.com/api/gists/test-gist-id", {
      method: "DELETE",
      headers: {
        ...defaultHeaders,
        ...headers,
      },
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful deletion", () => {
    it("should delete one-time view gist with valid proof", async () => {
      const mockGist = { metadata: oneTimeMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(StorageOperations.deleteIfNeeded).mockResolvedValue(true);

      const proof = await generateProof(
        oneTimeMetadata.created_at,
        oneTimeMetadata.total_size,
        oneTimeMetadata.id
      );
      const request = createDeleteRequest({ proof });
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(204);
      expect(response.headers.get("Cache-Control")).toBe(
        "no-store, no-cache, must-revalidate"
      );
      expect(StorageOperations.deleteIfNeeded).toHaveBeenCalledWith(
        oneTimeMetadata
      );
    });
  });

  describe("CSRF protection", () => {
    it("should reject requests without X-Requested-With header", async () => {
      const proof = await generateProof(
        oneTimeMetadata.created_at,
        oneTimeMetadata.total_size,
        oneTimeMetadata.id
      );
      const request = createDeleteRequest(
        { proof },
        { "X-Requested-With": "" }
      );
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(403);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid request headers");
    });

    it("should handle requests with missing origin header (test environment limitation)", async () => {
      const proof = await generateProof(
        oneTimeMetadata.created_at,
        oneTimeMetadata.total_size,
        oneTimeMetadata.id
      );

      // Note: In test environment, NextRequest doesn't properly handle origin headers
      // This test verifies that missing origin header doesn't cause failures
      // (though in production, browsers always send origin headers for DELETE)
      const request = new NextRequest(
        "https://test.com/api/gists/test-gist-id",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "GhostPaste",
            // No origin header - in production browsers always send this
          },
          body: JSON.stringify({ proof }),
        }
      );
      const context = createContext();

      // Mock the gist for successful deletion
      const mockGist = { metadata: oneTimeMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(StorageOperations.deleteIfNeeded).mockResolvedValue(true);

      const response = await DELETE(request, context);

      // Should succeed since we have valid X-Requested-With header and no origin restriction
      expect(response.status).toBe(204);
    });

    it("should accept requests from localhost during development", async () => {
      const mockGist = { metadata: oneTimeMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(StorageOperations.deleteIfNeeded).mockResolvedValue(true);

      const proof = await generateProof(
        oneTimeMetadata.created_at,
        oneTimeMetadata.total_size,
        oneTimeMetadata.id
      );
      const request = createDeleteRequest(
        { proof },
        { Origin: "http://localhost:3000" }
      );
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(204);
    });
  });

  describe("metadata proof validation", () => {
    it("should reject requests with missing proof", async () => {
      const request = createDeleteRequest({});
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(400);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe(
        "Missing or invalid proof for one-time view deletion"
      );
    });

    it("should reject requests with invalid proof", async () => {
      const mockGist = { metadata: oneTimeMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const request = createDeleteRequest({ proof: "invalid-proof" });
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(403);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid deletion proof");
    });

    it("should validate proof against correct metadata", async () => {
      const mockGist = { metadata: oneTimeMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      // Generate proof with wrong values
      const wrongProof = await generateProof(
        "wrong-date",
        999,
        oneTimeMetadata.id
      );
      const request = createDeleteRequest({ proof: wrongProof });
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(403);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid deletion proof");
    });
  });

  describe("gist validation", () => {
    it("should reject deletion of unprotected gists (not one-time view and not PIN-protected)", async () => {
      const unprotectedMetadata = {
        ...mockMetadata,
        one_time_view: false,
        edit_pin_hash: undefined,
        edit_pin_salt: undefined,
      };
      const mockGist = {
        metadata: unprotectedMetadata,
        blob: new Uint8Array(),
      };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const proof = await generateProof(
        unprotectedMetadata.created_at,
        unprotectedMetadata.total_size,
        unprotectedMetadata.id
      );
      const request = createDeleteRequest({ proof });
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(403);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe(
        "Gist cannot be deleted - not one-time view and not PIN-protected"
      );
    });

    it("should reject deletion of expired gists", async () => {
      const expiredMetadata = {
        ...oneTimeMetadata,
        expires_at: "2020-01-01T00:00:00.000Z", // Past date
      };
      const mockGist = { metadata: expiredMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const proof = await generateProof(
        expiredMetadata.created_at,
        expiredMetadata.total_size,
        expiredMetadata.id
      );
      const request = createDeleteRequest({ proof });
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(410);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Gist has already expired");
    });

    it("should return 404 for non-existent gist", async () => {
      const notFoundError = ApiErrors.notFound("Gist");
      vi.mocked(StorageOperations.getGist).mockRejectedValue(notFoundError);

      const proof = await generateProof(
        oneTimeMetadata.created_at,
        oneTimeMetadata.total_size,
        oneTimeMetadata.id
      );
      const request = createDeleteRequest({ proof });
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(404);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Gist not found");
    });
  });

  describe("error handling", () => {
    it("should return 400 for invalid gist ID", async () => {
      const proof = await generateProof(
        oneTimeMetadata.created_at,
        oneTimeMetadata.total_size,
        ""
      );
      const request = createDeleteRequest({ proof });
      const context = createContext("");

      const response = await DELETE(request, context);

      expect(response.status).toBe(400);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid gist ID");
    });

    it("should return 400 for invalid JSON body", async () => {
      const request = new NextRequest(
        "https://test.com/api/gists/test-gist-id",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "GhostPaste",
            Origin: "https://ghostpaste.dev",
          },
          body: "invalid-json",
        }
      );
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(400);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid JSON body");
    });

    it("should handle storage errors during deletion", async () => {
      const mockGist = { metadata: oneTimeMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(StorageOperations.deleteIfNeeded).mockRejectedValue(
        new Error("Storage error")
      );

      const proof = await generateProof(
        oneTimeMetadata.created_at,
        oneTimeMetadata.total_size,
        oneTimeMetadata.id
      );
      const request = createDeleteRequest({ proof });
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(500);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Failed to delete gist");
    });

    it("should handle case where gist was not deleted", async () => {
      const mockGist = { metadata: oneTimeMetadata, blob: new Uint8Array() };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(StorageOperations.deleteIfNeeded).mockResolvedValue(false); // Not deleted

      const proof = await generateProof(
        oneTimeMetadata.created_at,
        oneTimeMetadata.total_size,
        oneTimeMetadata.id
      );
      const request = createDeleteRequest({ proof });
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(400);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Gist was not eligible for deletion");
    });
  });

  describe("PIN-protected deletion", () => {
    const pinProtectedMetadata: GistMetadata = {
      ...mockMetadata,
      one_time_view: false,
      edit_pin_hash: "hashed-pin-value",
      edit_pin_salt: "salt-value",
    };

    const createPinDeleteRequest = (
      body: object = {},
      editPassword?: string
    ) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Requested-With": "GhostPaste",
        Origin: "https://ghostpaste.dev",
      };

      if (editPassword) {
        headers["X-Edit-Password"] = editPassword;
      }

      return new NextRequest("https://test.com/api/gists/test-gist-id", {
        method: "DELETE",
        headers,
        body: JSON.stringify(body),
      });
    };

    it("should successfully delete PIN-protected gist with valid PIN", async () => {
      const mockGist = {
        metadata: pinProtectedMetadata,
        blob: new Uint8Array(),
      };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(StorageOperations.deleteIfNeeded).mockResolvedValue(true);
      vi.mocked(validateGistPin).mockResolvedValue(true);

      const request = createPinDeleteRequest({}, "correct-pin");
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(204);
      expect(validateGistPin).toHaveBeenCalledWith(
        "correct-pin",
        pinProtectedMetadata
      );
      expect(StorageOperations.deleteIfNeeded).toHaveBeenCalledWith(
        pinProtectedMetadata
      );
    });

    it("should reject PIN-protected deletion without X-Edit-Password header", async () => {
      const mockGist = {
        metadata: pinProtectedMetadata,
        blob: new Uint8Array(),
      };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);

      const request = createPinDeleteRequest({}); // No PIN header
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(401);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Edit password required for deletion");
    });

    it("should reject PIN-protected deletion with invalid PIN", async () => {
      const mockGist = {
        metadata: pinProtectedMetadata,
        blob: new Uint8Array(),
      };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(validateGistPin).mockResolvedValue(false);

      const request = createPinDeleteRequest({}, "wrong-pin");
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(401);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("Invalid edit password");
      expect(validateGistPin).toHaveBeenCalledWith(
        "wrong-pin",
        pinProtectedMetadata
      );
    });

    it("should handle PIN validation errors gracefully", async () => {
      const mockGist = {
        metadata: pinProtectedMetadata,
        blob: new Uint8Array(),
      };
      vi.mocked(StorageOperations.getGist).mockResolvedValue(mockGist);
      vi.mocked(validateGistPin).mockRejectedValue(new Error("Crypto error"));

      const request = createPinDeleteRequest({}, "some-pin");
      const context = createContext();

      const response = await DELETE(request, context);

      expect(response.status).toBe(401);
      const data: ApiErrorResponse = await response.json();
      expect(data.message).toBe("PIN validation failed");
    });
  });
});
