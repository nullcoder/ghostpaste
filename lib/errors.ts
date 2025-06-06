import { AppError, ErrorCode } from "@/types/errors";
import { logger } from "./logger";

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Maps error codes to HTTP status codes
 */
const ERROR_CODE_TO_STATUS: Record<ErrorCode, number> = {
  [ErrorCode.BAD_REQUEST]: HTTP_STATUS.BAD_REQUEST,
  [ErrorCode.UNAUTHORIZED]: HTTP_STATUS.UNAUTHORIZED,
  [ErrorCode.FORBIDDEN]: HTTP_STATUS.FORBIDDEN,
  [ErrorCode.NOT_FOUND]: HTTP_STATUS.NOT_FOUND,
  [ErrorCode.CONFLICT]: HTTP_STATUS.CONFLICT,
  [ErrorCode.PAYLOAD_TOO_LARGE]: HTTP_STATUS.PAYLOAD_TOO_LARGE,
  [ErrorCode.UNPROCESSABLE_ENTITY]: HTTP_STATUS.UNPROCESSABLE_ENTITY,
  [ErrorCode.TOO_MANY_REQUESTS]: HTTP_STATUS.TOO_MANY_REQUESTS,
  [ErrorCode.INTERNAL_SERVER_ERROR]: HTTP_STATUS.INTERNAL_SERVER_ERROR,
  [ErrorCode.SERVICE_UNAVAILABLE]: HTTP_STATUS.SERVICE_UNAVAILABLE,
  [ErrorCode.INVALID_ENCRYPTION_KEY]: HTTP_STATUS.BAD_REQUEST,
  [ErrorCode.DECRYPTION_FAILED]: HTTP_STATUS.BAD_REQUEST,
  [ErrorCode.INVALID_PIN]: HTTP_STATUS.UNAUTHORIZED,
  [ErrorCode.GIST_EXPIRED]: HTTP_STATUS.GONE,
  [ErrorCode.FILE_TOO_LARGE]: HTTP_STATUS.PAYLOAD_TOO_LARGE,
  [ErrorCode.TOO_MANY_FILES]: HTTP_STATUS.BAD_REQUEST,
  [ErrorCode.INVALID_BINARY_FORMAT]: HTTP_STATUS.BAD_REQUEST,
  [ErrorCode.STORAGE_ERROR]: HTTP_STATUS.INTERNAL_SERVER_ERROR,
};

/**
 * Pre-configured error classes for common scenarios
 */
export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details?: Record<string, any>) {
    super(ErrorCode.BAD_REQUEST, HTTP_STATUS.BAD_REQUEST, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: Record<string, any>) {
    super(ErrorCode.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: Record<string, any>) {
    super(ErrorCode.FORBIDDEN, HTTP_STATUS.FORBIDDEN, message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not Found", details?: Record<string, any>) {
    super(ErrorCode.NOT_FOUND, HTTP_STATUS.NOT_FOUND, message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: Record<string, any>) {
    super(ErrorCode.CONFLICT, HTTP_STATUS.CONFLICT, message, details);
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "Payload Too Large", details?: Record<string, any>) {
    super(
      ErrorCode.PAYLOAD_TOO_LARGE,
      HTTP_STATUS.PAYLOAD_TOO_LARGE,
      message,
      details
    );
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = "Too Many Requests", details?: Record<string, any>) {
    super(
      ErrorCode.TOO_MANY_REQUESTS,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      message,
      details
    );
  }
}

export class InternalServerError extends AppError {
  constructor(
    message = "Internal Server Error",
    details?: Record<string, any>
  ) {
    super(
      ErrorCode.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message,
      details
    );
  }
}

/**
 * Application-specific error classes
 */
export class InvalidEncryptionKeyError extends AppError {
  constructor(
    message = "Invalid encryption key",
    details?: Record<string, any>
  ) {
    super(
      ErrorCode.INVALID_ENCRYPTION_KEY,
      HTTP_STATUS.BAD_REQUEST,
      message,
      details
    );
  }
}

export class DecryptionFailedError extends AppError {
  constructor(message = "Decryption failed", details?: Record<string, any>) {
    super(
      ErrorCode.DECRYPTION_FAILED,
      HTTP_STATUS.BAD_REQUEST,
      message,
      details
    );
  }
}

export class InvalidPinError extends AppError {
  constructor(message = "Invalid PIN", details?: Record<string, any>) {
    super(ErrorCode.INVALID_PIN, HTTP_STATUS.UNAUTHORIZED, message, details);
  }
}

export class GistExpiredError extends AppError {
  constructor(message = "Gist has expired", details?: Record<string, any>) {
    super(ErrorCode.GIST_EXPIRED, HTTP_STATUS.GONE, message, details);
  }
}

export class FileTooLargeError extends AppError {
  constructor(message = "File too large", details?: Record<string, any>) {
    super(
      ErrorCode.FILE_TOO_LARGE,
      HTTP_STATUS.PAYLOAD_TOO_LARGE,
      message,
      details
    );
  }
}

export class TooManyFilesError extends AppError {
  constructor(message = "Too many files", details?: Record<string, any>) {
    super(ErrorCode.TOO_MANY_FILES, HTTP_STATUS.BAD_REQUEST, message, details);
  }
}

export class InvalidBinaryFormatError extends AppError {
  constructor(
    message = "Invalid binary format",
    details?: Record<string, any>
  ) {
    super(
      ErrorCode.INVALID_BINARY_FORMAT,
      HTTP_STATUS.BAD_REQUEST,
      message,
      details
    );
  }
}

export class StorageError extends AppError {
  constructor(message = "Storage error", details?: Record<string, any>) {
    super(
      ErrorCode.STORAGE_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message,
      details
    );
  }
}

/**
 * Convert any error to an AppError
 * @param error - The error to convert
 * @param defaultCode - Default error code if not an AppError
 * @param defaultMessage - Default message if not available
 */
export function toAppError(
  error: unknown,
  defaultCode = ErrorCode.INTERNAL_SERVER_ERROR,
  defaultMessage = "An unexpected error occurred"
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      defaultCode,
      ERROR_CODE_TO_STATUS[defaultCode] || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.message || defaultMessage,
      { originalError: error.name }
    );
  }

  return new AppError(
    defaultCode,
    ERROR_CODE_TO_STATUS[defaultCode] || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    defaultMessage,
    { originalError: String(error) }
  );
}

/**
 * Error handler for API routes
 * @param error - The error to handle
 * @param context - Optional context for logging
 */
export function handleError(error: unknown, context?: string): Response {
  const appError = toAppError(error);

  // Log the error
  const logContext = context || "API";
  logger.error(`[${logContext}] ${appError.message}`, appError, {
    code: appError.code,
    statusCode: appError.statusCode,
    details: appError.details,
  });

  // Return error response
  return new Response(JSON.stringify(appError.toAPIError()), {
    status: appError.statusCode,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Async error wrapper for API handlers
 * @param handler - The async handler function
 * @param context - Optional context for error logging
 */
export function withErrorHandling<
  T extends (...args: any[]) => Promise<Response>,
>(handler: T, context?: string): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error, context);
    }
  }) as T;
}

/**
 * Assert a condition and throw an error if false
 * @param condition - The condition to assert
 * @param error - The error to throw
 */
export function assert(
  condition: any,
  error: AppError | string
): asserts condition {
  if (!condition) {
    if (typeof error === "string") {
      throw new BadRequestError(error);
    }
    throw error;
  }
}

/**
 * Assert a value is defined (not null or undefined)
 * @param value - The value to check
 * @param message - Error message if not defined
 */
export function assertDefined<T>(
  value: T | null | undefined,
  message = "Value is required"
): asserts value is T {
  if (value === null || value === undefined) {
    throw new BadRequestError(message);
  }
}
