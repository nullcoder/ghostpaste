import { NextRequest, NextResponse } from "next/server";
import { StorageOperations } from "@/lib/storage-operations";
import { AppError, ErrorCode } from "@/types/errors";
import { errorResponse, ApiErrors } from "@/lib/api-errors";
import { createLogger } from "@/lib/logger";
import type { GistMetadata } from "@/types/models";
import type { GetGistMetadataResponse } from "@/types/api";

const logger = createLogger("api:gists:get");

/**
 * GET /api/gists/[id]
 * Retrieve gist metadata by ID
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

    // Get gist metadata
    let metadata: GistMetadata;
    try {
      const gist = await StorageOperations.getGist(id);
      if (!gist) {
        return errorResponse(ApiErrors.notFound("Gist"));
      }
      metadata = gist.metadata;
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
        "Error retrieving gist metadata",
        error instanceof Error ? error : new Error(String(error))
      );
      return errorResponse(ApiErrors.storageError("Failed to retrieve gist"));
    }

    // Check if gist has expired
    if (metadata.expires_at) {
      const expiryDate = new Date(metadata.expires_at);
      if (expiryDate <= new Date()) {
        return errorResponse(ApiErrors.gone("Gist has expired"));
      }
    }

    // For one-time view gists, delete after successful retrieval
    if (metadata.one_time_view) {
      try {
        await StorageOperations.deleteIfNeeded(metadata);
      } catch (error) {
        // Log but don't fail the request if deletion fails
        logger.warn(
          "Failed to delete one-time view gist",
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }

    // Prepare response metadata (exclude sensitive data)
    const responseMetadata: GetGistMetadataResponse = {
      id: metadata.id,
      created_at: metadata.created_at,
      updated_at: metadata.updated_at,
      expires_at: metadata.expires_at,
      one_time_view: metadata.one_time_view,
      total_size: metadata.total_size,
      blob_count: metadata.blob_count,
      version: metadata.version,
      current_version: metadata.current_version,
      indent_mode: metadata.indent_mode,
      indent_size: metadata.indent_size,
      wrap_mode: metadata.wrap_mode,
      theme: metadata.theme,
      // Note: We exclude edit_pin_hash, edit_pin_salt, and encrypted_metadata for security
    };

    return NextResponse.json<GetGistMetadataResponse>(responseMetadata, {
      status: 200,
      headers: {
        "Cache-Control": metadata.one_time_view
          ? "no-store, no-cache, must-revalidate"
          : "private, max-age=300", // 5 minutes for regular gists
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle unexpected errors
    logger.error(
      "Unexpected error in GET /api/gists/[id]",
      error instanceof Error ? error : new Error(String(error))
    );
    return errorResponse(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}

/**
 * OPTIONS /api/gists/[id]
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
