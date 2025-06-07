import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";
import { AppError, ErrorCode } from "@/types/errors";
import {
  toApiErrorResponse,
  errorResponse,
  ApiErrors,
  validationError,
} from "./api-errors";

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data, init) => ({ data, init })),
  },
}));

// Mock logger
const mockLogger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

vi.mock("@/lib/logger", () => ({
  createLogger: vi.fn(() => mockLogger),
}));

describe("API Error Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toApiErrorResponse", () => {
    it("should convert AppError to ApiErrorResponse format", () => {
      const appError = new AppError(ErrorCode.BAD_REQUEST, 400, "Bad request", {
        field: "value",
      });

      const result = toApiErrorResponse(appError);

      expect(result).toEqual({
        error: ErrorCode.BAD_REQUEST,
        message: "Bad request",
        details: { field: "value" },
      });
    });

    it("should handle AppError without details", () => {
      const appError = new AppError(ErrorCode.NOT_FOUND, 404, "Not found");

      const result = toApiErrorResponse(appError);

      expect(result).toEqual({
        error: ErrorCode.NOT_FOUND,
        message: "Not found",
        details: undefined,
      });
    });
  });

  describe("errorResponse", () => {
    it("should create NextResponse from AppError", () => {
      const appError = new AppError(
        ErrorCode.UNAUTHORIZED,
        401,
        "Unauthorized access"
      );

      errorResponse(appError);

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: ErrorCode.UNAUTHORIZED,
          message: "Unauthorized access",
          details: undefined,
        },
        { status: 401 }
      );
    });

    it("should handle generic Error", () => {
      const error = new Error("Something went wrong");

      errorResponse(error);

      expect(mockLogger.error).toHaveBeenCalledWith("Unexpected error:", error);
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          error: ErrorCode.INTERNAL_SERVER_ERROR,
          message: "An unexpected error occurred",
        },
        { status: 500 }
      );
    });
  });

  describe("ApiErrors", () => {
    it("should create bad request error", () => {
      const error = ApiErrors.badRequest("Invalid input", { field: "email" });

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(ErrorCode.BAD_REQUEST);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Invalid input");
      expect(error.details).toEqual({ field: "email" });
    });

    it("should create unauthorized error", () => {
      const error = ApiErrors.unauthorized();

      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe("Unauthorized");
    });

    it("should create not found error", () => {
      const error = ApiErrors.notFound("Gist");

      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe("Gist not found");
    });

    it("should create payload too large error", () => {
      const error = ApiErrors.payloadTooLarge("File exceeds 5MB limit");

      expect(error.code).toBe(ErrorCode.PAYLOAD_TOO_LARGE);
      expect(error.statusCode).toBe(413);
      expect(error.message).toBe("File exceeds 5MB limit");
    });

    it("should create storage error", () => {
      const error = ApiErrors.storageError("Failed to save", { retry: true });

      expect(error.code).toBe(ErrorCode.STORAGE_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe("Failed to save");
      expect(error.details).toEqual({ retry: true });
    });
  });

  describe("validationError", () => {
    it("should create validation error with field errors", () => {
      const error = validationError("Validation failed", {
        email: ["Invalid email format"],
        password: ["Too short", "Must contain uppercase"],
      });

      expect(error.code).toBe(ErrorCode.UNPROCESSABLE_ENTITY);
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe("Validation failed");
      expect(error.details).toEqual({
        fieldErrors: {
          email: ["Invalid email format"],
          password: ["Too short", "Must contain uppercase"],
        },
      });
    });

    it("should create validation error without field errors", () => {
      const error = validationError("Invalid request format");

      expect(error.code).toBe(ErrorCode.UNPROCESSABLE_ENTITY);
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe("Invalid request format");
      expect(error.details).toBeUndefined();
    });
  });
});
