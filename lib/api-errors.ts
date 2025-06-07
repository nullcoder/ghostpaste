/**
 * API error handling utilities
 */

import { NextResponse } from "next/server";
import { AppError, ErrorCode } from "@/types/errors";
import type { ApiErrorResponse } from "@/types/api";

/**
 * Convert an AppError to ApiErrorResponse format
 */
export function toApiErrorResponse(error: AppError): ApiErrorResponse {
  return {
    error: error.code,
    message: error.message,
    details: error.details,
  };
}

/**
 * Create a NextResponse with error formatting
 */
export function errorResponse(
  error: AppError | Error
): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json<ApiErrorResponse>(toApiErrorResponse(error), {
      status: error.statusCode,
    });
  }

  // Handle unexpected errors
  console.error("Unexpected error:", error);
  return NextResponse.json<ApiErrorResponse>(
    {
      error: ErrorCode.INTERNAL_SERVER_ERROR,
      message: "An unexpected error occurred",
    },
    { status: 500 }
  );
}

/**
 * Common API error responses
 */
export const ApiErrors = {
  badRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError(ErrorCode.BAD_REQUEST, 400, message, details),

  unauthorized: (message: string = "Unauthorized") =>
    new AppError(ErrorCode.UNAUTHORIZED, 401, message),

  forbidden: (message: string = "Forbidden") =>
    new AppError(ErrorCode.FORBIDDEN, 403, message),

  notFound: (resource: string) =>
    new AppError(ErrorCode.NOT_FOUND, 404, `${resource} not found`),

  payloadTooLarge: (message: string) =>
    new AppError(ErrorCode.PAYLOAD_TOO_LARGE, 413, message),

  unprocessableEntity: (message: string, details?: Record<string, unknown>) =>
    new AppError(ErrorCode.UNPROCESSABLE_ENTITY, 422, message, details),

  tooManyRequests: (message: string = "Too many requests") =>
    new AppError(ErrorCode.TOO_MANY_REQUESTS, 429, message),

  internalServerError: (message: string = "Internal server error") =>
    new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 500, message),

  storageError: (message: string, details?: Record<string, unknown>) =>
    new AppError(ErrorCode.STORAGE_ERROR, 500, message, details),

  gone: (message: string) => new AppError(ErrorCode.GIST_EXPIRED, 410, message),
};

/**
 * Validation error helper
 */
export function validationError(
  message: string,
  fieldErrors?: Record<string, string[]>
): AppError {
  return new AppError(
    ErrorCode.UNPROCESSABLE_ENTITY,
    422,
    message,
    fieldErrors ? { fieldErrors } : undefined
  );
}
