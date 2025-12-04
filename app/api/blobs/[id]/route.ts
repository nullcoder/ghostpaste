import { NextRequest, NextResponse } from "next/server";
import { StorageOperations } from "@/lib/storage-operations";
import { AppError, ErrorCode } from "@/types/errors";
import { errorResponse, ApiErrors } from "@/lib/api-errors";
import { createLogger } from "@/lib/logger";
import type { GistMetadata } from "@/types/models";

const logger = createLogger("api:blobs:get");

/**
 * GET /api/blobs/[id]
 * Retrieve encrypted blob data by gist ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Validate gist ID format
    if (!id || typeof id !== "string" || id.length === 0) {
      return errorResponse(ApiErrors.badRequest("Invalid gist ID"));
    }

    // Get gist data including blob
    let gistData: { metadata: GistMetadata; blob: Uint8Array };
    try {
      const result = await StorageOperations.getGist(id);
      if (!result) {
        return errorResponse(ApiErrors.notFound("Gist"));
      }
      gistData = result;
    } catch (error) {
      if (error instanceof AppError) {
        // Handle specific storage errors
        if (error.code === ErrorCode.NOT_FOUND) {
          return errorResponse(ApiErrors.notFound("Gist"));
        }
        if (error.code === ErrorCode.GIST_EXPIRED) {
          return errorResponse(ApiErrors.gone("Gist has expired"));
        }
      }

      // Log unexpected errors
      logger.error(
        "Error retrieving gist blob",
        error instanceof Error ? error : new Error(String(error))
      );
      return errorResponse(
        ApiErrors.storageError("Failed to retrieve gist blob")
      );
    }

    const { metadata, blob } = gistData;

    // Check if gist has expired
    if (metadata.expires_at) {
      const expiryDate = new Date(metadata.expires_at);
      if (expiryDate <= new Date()) {
        return errorResponse(ApiErrors.gone("Gist has expired"));
      }
    }

    // Note: One-time view deletion is now handled by explicit DELETE endpoint
    // to avoid race conditions between metadata and blob requests

    // Return blob data with appropriate headers
    // Convert Uint8Array to Buffer for compatibility with NextResponse
    return new NextResponse(Buffer.from(blob), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": blob.length.toString(),
        "Cache-Control": metadata.one_time_view
          ? "no-store, no-cache, must-revalidate"
          : "private, max-age=3600", // 1 hour for regular gist blobs
        "Content-Disposition": `attachment; filename="gist-${id}.bin"`,
        // Security headers
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  } catch (error) {
    // Handle unexpected errors
    logger.error(
      "Unexpected error in GET /api/blobs/[id]",
      error instanceof Error ? error : new Error(String(error))
    );
    return errorResponse(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}

/**
 * OPTIONS /api/blobs/[id]
 * Handle preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin":
        process.env.NEXT_PUBLIC_APP_URL || "https://ghostpaste.dev",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
