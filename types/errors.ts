/**
 * Error types and error handling for GhostPaste
 */

/**
 * Standard error codes for the application
 */
export enum ErrorCode {
  // Client errors (4xx)
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE",
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",
  TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS",

  // Server errors (5xx)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Application-specific errors
  INVALID_ENCRYPTION_KEY = "INVALID_ENCRYPTION_KEY",
  DECRYPTION_FAILED = "DECRYPTION_FAILED",
  INVALID_PIN = "INVALID_PIN",
  GIST_EXPIRED = "GIST_EXPIRED",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  TOO_MANY_FILES = "TOO_MANY_FILES",
  INVALID_BINARY_FORMAT = "INVALID_BINARY_FORMAT",
  STORAGE_ERROR = "STORAGE_ERROR",
}

/**
 * Standardized API error response
 */
export interface APIError {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
  };
  status: number;
}

/**
 * Application error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }

  toAPIError(): APIError {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
      status: this.statusCode,
    };
  }
}

/**
 * Error response builder
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  statusCode: number,
  details?: Record<string, any>
): APIError {
  return {
    error: {
      code,
      message,
      details,
    },
    status: statusCode,
  };
}
