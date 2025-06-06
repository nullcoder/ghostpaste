import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  HTTP_STATUS,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  PayloadTooLargeError,
  InvalidPinError,
  GistExpiredError,
  toAppError,
  handleError,
  withErrorHandling,
  assert,
  assertDefined,
} from "./errors";
import { AppError, ErrorCode } from "@/types/errors";

// Mock the logger to avoid console output in tests
vi.mock("./logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("HTTP_STATUS", () => {
  it("should have all standard HTTP status codes", () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.GONE).toBe(410);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });
});

describe("Error Classes", () => {
  it("should create BadRequestError with correct properties", () => {
    const error = new BadRequestError("Invalid input");

    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe(ErrorCode.BAD_REQUEST);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Invalid input");
  });

  it("should create UnauthorizedError with details", () => {
    const error = new UnauthorizedError("Invalid credentials", { userId: 123 });

    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(error.statusCode).toBe(401);
    expect(error.details).toEqual({ userId: 123 });
  });

  it("should create NotFoundError with default message", () => {
    const error = new NotFoundError();

    expect(error.message).toBe("Not Found");
    expect(error.statusCode).toBe(404);
  });

  it("should create PayloadTooLargeError", () => {
    const error = new PayloadTooLargeError("File too big");

    expect(error.code).toBe(ErrorCode.PAYLOAD_TOO_LARGE);
    expect(error.statusCode).toBe(413);
  });

  it("should create InvalidPinError", () => {
    const error = new InvalidPinError();

    expect(error.code).toBe(ErrorCode.INVALID_PIN);
    expect(error.statusCode).toBe(401);
  });

  it("should create GistExpiredError", () => {
    const error = new GistExpiredError("Gist has expired", {
      gistId: "abc123",
    });

    expect(error.code).toBe(ErrorCode.GIST_EXPIRED);
    expect(error.statusCode).toBe(410);
    expect(error.details).toEqual({ gistId: "abc123" });
  });
});

describe("toAppError", () => {
  it("should return AppError unchanged", () => {
    const appError = new BadRequestError("Test");
    const result = toAppError(appError);

    expect(result).toBe(appError);
  });

  it("should convert Error to AppError", () => {
    const error = new Error("Something went wrong");
    const result = toAppError(error);

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("Something went wrong");
    expect(result.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    expect(result.details?.originalError).toBe("Error");
  });

  it("should convert unknown error to AppError", () => {
    const result = toAppError("String error");

    expect(result).toBeInstanceOf(AppError);
    expect(result.message).toBe("An unexpected error occurred");
    expect(result.details?.originalError).toBe("String error");
  });

  it("should use custom error code and message", () => {
    const result = toAppError(null, ErrorCode.BAD_REQUEST, "Custom message");

    expect(result.code).toBe(ErrorCode.BAD_REQUEST);
    expect(result.message).toBe("Custom message");
    expect(result.statusCode).toBe(400);
  });
});

describe("handleError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error response for AppError", () => {
    const error = new NotFoundError("Resource not found");
    const response = handleError(error);

    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe("application/json");
  });

  it("should handle non-AppError", () => {
    const error = new Error("Unexpected");
    const response = handleError(error);

    expect(response.status).toBe(500);
  });

  it("should log errors with context", async () => {
    const loggerModule =
      await vi.importMock<typeof import("./logger")>("./logger");
    const error = new BadRequestError("Test error");

    handleError(error, "TestContext");

    expect(loggerModule.logger.error).toHaveBeenCalledWith(
      "[TestContext] Test error",
      error,
      expect.objectContaining({
        code: ErrorCode.BAD_REQUEST,
        statusCode: 400,
      })
    );
  });
});

describe("withErrorHandling", () => {
  it("should wrap async handler and catch errors", async () => {
    const handler = async (): Promise<Response> => {
      throw new BadRequestError("Test error");
    };

    const wrapped = withErrorHandling(handler);
    const response = await wrapped();

    expect(response.status).toBe(400);
  });

  it("should pass through successful responses", async () => {
    const successResponse = new Response("Success", { status: 200 });
    const handler = async () => successResponse;

    const wrapped = withErrorHandling(handler);
    const response = await wrapped();

    expect(response).toBe(successResponse);
  });

  it("should preserve handler arguments", async () => {
    const handler = async (req: Request, ctx: any) => {
      return new Response(`${req.method} ${ctx.value}`);
    };

    const wrapped = withErrorHandling(handler);
    const mockReq = { method: "GET" } as Request;
    const mockCtx = { value: "test" };

    const response = await wrapped(mockReq, mockCtx);
    const text = await response.text();

    expect(text).toBe("GET test");
  });
});

describe("assert", () => {
  it("should not throw when condition is truthy", () => {
    expect(() => assert(true, "Should not throw")).not.toThrow();
    expect(() => assert(1, "Should not throw")).not.toThrow();
    expect(() => assert("value", "Should not throw")).not.toThrow();
  });

  it("should throw BadRequestError with string message", () => {
    expect(() => assert(false, "Validation failed")).toThrow(BadRequestError);

    try {
      assert(0, "Zero is falsy");
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      expect((error as BadRequestError).message).toBe("Zero is falsy");
    }
  });

  it("should throw provided AppError", () => {
    const customError = new NotFoundError("Custom not found");

    expect(() => assert(null, customError)).toThrow(customError);
  });
});

describe("assertDefined", () => {
  it("should not throw for defined values", () => {
    expect(() => assertDefined("value")).not.toThrow();
    expect(() => assertDefined(0)).not.toThrow();
    expect(() => assertDefined(false)).not.toThrow();
    expect(() => assertDefined([])).not.toThrow();
    expect(() => assertDefined({})).not.toThrow();
  });

  it("should throw for null", () => {
    expect(() => assertDefined(null)).toThrow(BadRequestError);

    try {
      assertDefined(null, "Custom null message");
    } catch (error) {
      expect((error as BadRequestError).message).toBe("Custom null message");
    }
  });

  it("should throw for undefined", () => {
    expect(() => assertDefined(undefined)).toThrow(BadRequestError);

    try {
      assertDefined(undefined);
    } catch (error) {
      expect((error as BadRequestError).message).toBe("Value is required");
    }
  });
});
