/**
 * Security utilities for API endpoints
 *
 * This module provides security validation functions for protecting
 * API endpoints from various attacks including CSRF, XSS, and injection.
 *
 * @module security
 */

import { NextRequest } from "next/server";
import { createLogger } from "./logger";

const logger = createLogger("security");

/**
 * Validate CSRF protection headers
 *
 * Implements defense against Cross-Site Request Forgery (CSRF) attacks using:
 * 1. X-Requested-With custom header (required) - blocks simple form submissions
 * 2. Origin header validation - verifies request comes from allowed domains
 *
 * This dual approach provides strong CSRF protection:
 * - Custom header cannot be set by simple forms or basic fetch() from other origins
 * - Origin validation ensures requests come from trusted domains
 * - Allows localhost in development for local testing
 *
 * @param request - The incoming NextRequest
 * @returns True if CSRF validation passes, false otherwise
 *
 * @example
 * ```typescript
 * if (!validateCSRFProtection(request)) {
 *   return errorResponse(ApiErrors.forbidden("Invalid request headers"));
 * }
 * ```
 */
export function validateCSRFProtection(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const customHeader = request.headers.get("X-Requested-With");

  // Check custom header (required for CSRF protection)
  if (!customHeader || customHeader !== "GhostPaste") {
    logger.debug(
      "CSRF validation failed: missing or invalid X-Requested-With header",
      {
        customHeader: customHeader || "missing",
      }
    );
    return false;
  }

  // Check origin if present (browsers always send origin on state-changing requests)
  if (origin) {
    const allowedOrigins = [
      "https://ghostpaste.dev",
      process.env.NEXT_PUBLIC_APP_URL,
      // Allow localhost in development mode only
      ...(process.env.NODE_ENV === "development"
        ? ["http://localhost:3000"]
        : []),
    ].filter(Boolean);

    if (!allowedOrigins.includes(origin)) {
      logger.debug("CSRF validation failed: origin not in allowed list", {
        origin,
        allowedOrigins,
      });
      return false;
    }
  }

  logger.debug("CSRF validation passed", {
    origin: origin || "not provided",
    customHeader,
  });

  return true;
}

/**
 * Validate Content-Type for multipart requests
 *
 * Ensures that endpoints expecting multipart/form-data receive the correct
 * Content-Type header to prevent content type confusion attacks.
 *
 * @param request - The incoming NextRequest
 * @returns True if Content-Type is valid multipart/form-data
 */
export function validateMultipartContentType(request: NextRequest): boolean {
  const contentType = request.headers.get("Content-Type");

  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    logger.debug("Invalid Content-Type for multipart request", {
      contentType: contentType || "missing",
    });
    return false;
  }

  return true;
}

/**
 * Get security headers for API responses
 *
 * Returns a set of standard security headers to include in API responses
 * to prevent various client-side attacks.
 *
 * @returns Object with security headers
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };
}

/**
 * Validate API rate limiting headers (placeholder for future implementation)
 *
 * This function is a placeholder for implementing rate limiting validation
 * based on client IP, API keys, or other identifying information.
 *
 * @param _request - The incoming NextRequest (unused in current implementation)
 * @returns True if rate limit check passes
 */
export function validateRateLimit(_request: NextRequest): boolean {
  // TODO: Implement rate limiting logic
  // Could check:
  // - Client IP address
  // - API key usage
  // - Request frequency
  // - User-Agent patterns

  return true; // Allow all requests for now
}
