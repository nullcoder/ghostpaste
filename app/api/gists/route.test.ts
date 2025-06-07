import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, OPTIONS } from "./route";
import { StorageOperations } from "@/lib/storage-operations";
import { AppError, ErrorCode } from "@/types/errors";
import { FILE_LIMITS } from "@/lib/constants";
import { generateSalt, hashPin } from "@/lib/auth";
import type { CreateGistResponse, ApiErrorResponse } from "@/types/api";

// Mock dependencies
vi.mock("@/lib/storage-operations");
vi.mock("@/lib/auth");

// Type guards
function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    "message" in data
  );
}

function isCreateGistResponse(data: unknown): data is CreateGistResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "url" in data &&
    "createdAt" in data
  );
}

describe("POST /api/gists", () => {
  const mockCreateGist = vi.fn();
  const mockGenerateSalt = vi.mocked(generateSalt);
  const mockHashPin = vi.mocked(hashPin);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(StorageOperations.createGist).mockImplementation(mockCreateGist);
    mockCreateGist.mockResolvedValue({
      id: "test-id-123",
      timestamp: "2024-01-01T00:00:00.000Z",
    });
    mockGenerateSalt.mockResolvedValue("test-salt");
    mockHashPin.mockResolvedValue("hashed-password");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Helper to create multipart form data
   */
  function createFormData(parts: {
    metadata?: Record<string, unknown>;
    blob?: Uint8Array;
    password?: string;
  }): FormData {
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

    if (parts.password !== undefined) {
      formData.append("password", parts.password);
    }

    return formData;
  }

  it("should create a gist successfully", async () => {
    const formData = createFormData({
      metadata: {
        expires_at: "2024-12-31T23:59:59.000Z",
        one_time_view: false,
        file_count: 2,
        blob_count: 1,
      },
      blob: new Uint8Array([1, 2, 3, 4, 5]),
      password: "my-secret-password",
    });

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(response.headers.get("Location")).toBe(
      "https://ghostpaste.dev/g/test-id-123"
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    // Type guard check
    expect(isCreateGistResponse(data)).toBe(true);
    if (isCreateGistResponse(data)) {
      expect(data).toMatchObject({
        id: "test-id-123",
        url: "https://ghostpaste.dev/g/test-id-123",
        expiresAt: "2024-12-31T23:59:59.000Z",
        isOneTimeView: false,
      });
      expect(data.createdAt).toBeDefined();
    }

    expect(mockGenerateSalt).toHaveBeenCalled();
    expect(mockHashPin).toHaveBeenCalledWith("my-secret-password", "test-salt");
    expect(mockCreateGist).toHaveBeenCalledWith(
      {
        expires_at: "2024-12-31T23:59:59.000Z",
        one_time_view: false,
        edit_pin_hash: "hashed-password",
        edit_pin_salt: "test-salt",
        total_size: 5,
        blob_count: 1,
        encrypted_metadata: { iv: "", data: "" },
      },
      new Uint8Array([1, 2, 3, 4, 5])
    );
  });

  it("should create a one-time view gist without password", async () => {
    const formData = createFormData({
      metadata: {
        one_time_view: true,
      },
      blob: new Uint8Array([1, 2, 3, 4, 5]),
    });

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);

    expect(isCreateGistResponse(data)).toBe(true);
    if (isCreateGistResponse(data)) {
      expect(data.isOneTimeView).toBe(true);
      expect(data.expiresAt).toBeNull();
    }

    expect(mockGenerateSalt).not.toHaveBeenCalled();
    expect(mockHashPin).not.toHaveBeenCalled();
    expect(mockCreateGist).toHaveBeenCalledWith(
      {
        expires_at: undefined,
        one_time_view: true,
        edit_pin_hash: undefined,
        edit_pin_salt: undefined,
        total_size: 5,
        blob_count: 1,
        encrypted_metadata: { iv: "", data: "" },
      },
      expect.any(Uint8Array)
    );
  });

  it("should reject invalid content type", async () => {
    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: "data" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);

    expect(isApiErrorResponse(data)).toBe(true);
    if (isApiErrorResponse(data)) {
      expect(data.error).toBe(ErrorCode.BAD_REQUEST);
      expect(data.message).toBe("Content-Type must be multipart/form-data");
    }
  });

  it("should reject missing metadata", async () => {
    const formData = createFormData({
      blob: new Uint8Array([1, 2, 3]),
    });

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);

    expect(isApiErrorResponse(data)).toBe(true);
    if (isApiErrorResponse(data)) {
      expect(data.error).toBe(ErrorCode.BAD_REQUEST);
      expect(data.message).toContain("metadata and blob");
    }
  });

  it("should reject missing blob", async () => {
    const formData = createFormData({
      metadata: { one_time_view: false },
    });

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);

    expect(isApiErrorResponse(data)).toBe(true);
    if (isApiErrorResponse(data)) {
      expect(data.error).toBe(ErrorCode.BAD_REQUEST);
      expect(data.message).toContain("metadata and blob");
    }
  });

  it("should reject invalid metadata JSON", async () => {
    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob(["not json"], { type: "text/plain" }),
      "metadata.txt"
    );
    formData.append("blob", new Blob([new Uint8Array([1, 2, 3])]), "blob.bin");

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);

    expect(isApiErrorResponse(data)).toBe(true);
    if (isApiErrorResponse(data)) {
      expect(data.error).toBe(ErrorCode.BAD_REQUEST);
      expect(data.message).toBe("Invalid metadata JSON");
    }
  });

  it("should validate metadata fields", async () => {
    const formData = createFormData({
      metadata: {
        expires_at: "not-a-date",
        file_count: -1,
      },
      blob: new Uint8Array([1, 2, 3]),
    });

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);

    expect(isApiErrorResponse(data)).toBe(true);
    if (isApiErrorResponse(data)) {
      expect(data.error).toBe(ErrorCode.UNPROCESSABLE_ENTITY);
      expect(data.message).toBe("Invalid metadata");
      expect(data.details).toBeDefined();
    }
  });

  it("should reject oversized blobs", async () => {
    const largeBlob = new Uint8Array(FILE_LIMITS.MAX_TOTAL_SIZE + 1);
    const formData = createFormData({
      metadata: {},
      blob: largeBlob,
    });

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(413);

    expect(isApiErrorResponse(data)).toBe(true);
    if (isApiErrorResponse(data)) {
      expect(data.error).toBe(ErrorCode.PAYLOAD_TOO_LARGE);
      expect(data.message).toContain("exceeds");
    }
  });

  it("should handle storage errors", async () => {
    mockCreateGist.mockRejectedValueOnce(
      new AppError(ErrorCode.STORAGE_ERROR, 500, "Storage failed", {
        details: "test",
      })
    );

    const formData = createFormData({
      metadata: {},
      blob: new Uint8Array([1, 2, 3]),
    });

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);

    expect(isApiErrorResponse(data)).toBe(true);
    if (isApiErrorResponse(data)) {
      expect(data.error).toBe(ErrorCode.STORAGE_ERROR);
      expect(data.message).toBe("Storage failed");
      expect(data.details).toEqual({ details: "test" });
    }
  });

  it("should handle unexpected errors", async () => {
    mockCreateGist.mockRejectedValueOnce(new Error("Unexpected error"));

    const formData = createFormData({
      metadata: {},
      blob: new Uint8Array([1, 2, 3]),
    });

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);

    expect(isApiErrorResponse(data)).toBe(true);
    if (isApiErrorResponse(data)) {
      expect(data.error).toBe(ErrorCode.STORAGE_ERROR);
    }
  });

  it("should handle empty metadata", async () => {
    const formData = createFormData({
      metadata: {},
      blob: new Uint8Array([1, 2, 3, 4, 5]),
    });

    const request = new NextRequest("http://localhost:3000/api/gists", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);

    expect(isCreateGistResponse(data)).toBe(true);
    if (isCreateGistResponse(data)) {
      expect(data.expiresAt).toBeNull();
      expect(data.isOneTimeView).toBe(false);
    }

    expect(mockCreateGist).toHaveBeenCalledWith(
      {
        expires_at: undefined,
        one_time_view: undefined,
        edit_pin_hash: undefined,
        edit_pin_salt: undefined,
        total_size: 5,
        blob_count: 1,
        encrypted_metadata: { iv: "", data: "" },
      },
      expect.any(Uint8Array)
    );
  });
});

describe("OPTIONS /api/gists", () => {
  it("should handle preflight requests", async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "https://ghostpaste.dev"
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe(
      "POST, OPTIONS"
    );
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type"
    );
    expect(response.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
