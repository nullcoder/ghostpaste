import { NextRequest, NextResponse } from "next/server";
import { StorageOperations } from "@/lib/storage-operations";
import { AppError, ErrorCode } from "@/types/errors";
import { errorResponse, ApiErrors, validationError } from "@/lib/api-errors";
import { validateCSRFProtection } from "@/lib/security";
import { createLogger } from "@/lib/logger";
import { sha256Hash, validateGistPin } from "@/lib/crypto-utils";
import { updateGistMetadataSchema } from "@/lib/api-schemas";
import type { GistMetadata } from "@/types/models";
import type { GetGistMetadataResponse, UpdateGistResponse } from "@/types/api";

const getLogger = createLogger("api:gists:get");
const deleteLogger = createLogger("api:gists:delete");
const putLogger = createLogger("api:gists:put");

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
      getLogger.error(
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

    // Note: One-time view deletion is now handled by explicit DELETE endpoint
    // to avoid race conditions between metadata and blob requests

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
    getLogger.error(
      "Unexpected error in GET /api/gists/[id]",
      error instanceof Error ? error : new Error(String(error))
    );
    return errorResponse(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}

/**
 * Generate metadata proof hash using WebCrypto
 */
async function generateMetadataProof(
  createdAt: string,
  totalSize: number,
  gistId: string
): Promise<string> {
  return sha256Hash(`${createdAt}${totalSize}${gistId}delete`);
}

/**
 * DELETE /api/gists/[id]
 * Delete a gist with appropriate authentication:
 * - One-time view gists: require metadata proof validation
 * - PIN-protected gists: require PIN validation via X-Edit-Password header
 * - Unprotected gists: cannot be deleted
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Validate gist ID format
    if (!id || typeof id !== "string" || id.length === 0) {
      return errorResponse(ApiErrors.badRequest("Invalid gist ID"));
    }

    // CSRF Protection
    if (!validateCSRFProtection(request)) {
      deleteLogger.warn("CSRF protection failed", {
        origin: request.headers.get("origin"),
        customHeader: request.headers.get("X-Requested-With"),
        gistId: id,
      });
      return errorResponse(ApiErrors.forbidden("Invalid request headers"));
    }

    // Parse request body (proof for one-time view, optional for PIN-protected)
    let requestBody: { proof?: string };
    try {
      requestBody = await request.json();
    } catch {
      return errorResponse(ApiErrors.badRequest("Invalid JSON body"));
    }

    // Get gist metadata to validate proof
    let metadata: GistMetadata;
    try {
      const gist = await StorageOperations.getGist(id);
      if (!gist) {
        return errorResponse(ApiErrors.notFound("Gist"));
      }
      metadata = gist.metadata;
    } catch (error) {
      if (error instanceof AppError) {
        if (error.code === ErrorCode.NOT_FOUND) {
          return errorResponse(ApiErrors.notFound("Gist"));
        }
      }

      deleteLogger.error(
        "Error retrieving gist for deletion",
        error instanceof Error ? error : new Error(String(error))
      );
      return errorResponse(ApiErrors.storageError("Failed to retrieve gist"));
    }

    // Check if gist has already expired
    if (metadata.expires_at) {
      const expiryDate = new Date(metadata.expires_at);
      if (expiryDate <= new Date()) {
        return errorResponse(ApiErrors.gone("Gist has already expired"));
      }
    }

    // Determine deletion method based on gist type
    const isOneTimeView = metadata.one_time_view;
    const isPinProtected = metadata.edit_pin_hash && metadata.edit_pin_salt;

    if (isOneTimeView) {
      // One-time view deletion: requires metadata proof
      const { proof } = requestBody;
      if (!proof || typeof proof !== "string") {
        return errorResponse(
          ApiErrors.badRequest(
            "Missing or invalid proof for one-time view deletion"
          )
        );
      }

      // Validate metadata proof
      const expectedProof = await generateMetadataProof(
        metadata.created_at,
        metadata.total_size,
        metadata.id
      );

      if (proof !== expectedProof) {
        deleteLogger.warn("Invalid metadata proof for deletion", {
          gistId: id,
          providedProof: proof.substring(0, 8) + "...", // Log only first 8 chars for security
        });
        return errorResponse(ApiErrors.forbidden("Invalid deletion proof"));
      }
    } else if (isPinProtected) {
      // PIN-protected deletion: requires PIN validation
      const editPassword = request.headers.get("X-Edit-Password");
      if (!editPassword) {
        return errorResponse(
          ApiErrors.unauthorized("Edit password required for deletion")
        );
      }

      // Validate PIN using WebCrypto (async to avoid blocking workers)
      try {
        const isValidPin = await validateGistPin(editPassword, metadata);
        if (!isValidPin) {
          deleteLogger.warn("Invalid edit password for deletion", {
            gistId: id,
          });
          return errorResponse(ApiErrors.unauthorized("Invalid edit password"));
        }
      } catch (error) {
        deleteLogger.error(
          "Error validating PIN for deletion",
          error instanceof Error ? error : new Error(String(error))
        );
        return errorResponse(ApiErrors.unauthorized("PIN validation failed"));
      }
    } else {
      // Gist is neither one-time view nor PIN-protected
      return errorResponse(
        ApiErrors.forbidden(
          "Gist cannot be deleted - not one-time view and not PIN-protected"
        )
      );
    }

    // Delete the gist
    try {
      const deleted = await StorageOperations.deleteIfNeeded(metadata);
      if (!deleted) {
        deleteLogger.warn("Gist was not deleted", { gistId: id });
        return errorResponse(
          ApiErrors.badRequest("Gist was not eligible for deletion")
        );
      }

      deleteLogger.info("Successfully deleted gist", {
        gistId: id,
        deletionType: isOneTimeView ? "one-time-view" : "pin-protected",
      });

      return new NextResponse(null, {
        status: 204, // No Content
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    } catch (error) {
      deleteLogger.error(
        "Error deleting gist",
        error instanceof Error ? error : new Error(String(error))
      );
      return errorResponse(ApiErrors.storageError("Failed to delete gist"));
    }
  } catch (error) {
    // Handle unexpected errors
    deleteLogger.error(
      "Unexpected error in DELETE /api/gists/[id]",
      error instanceof Error ? error : new Error(String(error))
    );
    return errorResponse(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}

/**
 * PUT /api/gists/[id]
 * Update a gist with PIN validation and optimistic locking
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Validate gist ID format
    if (!id || typeof id !== "string" || id.length === 0) {
      return errorResponse(ApiErrors.badRequest("Invalid gist ID"));
    }

    // CSRF Protection
    if (!validateCSRFProtection(request)) {
      putLogger.warn("CSRF protection failed", {
        origin: request.headers.get("origin"),
        customHeader: request.headers.get("X-Requested-With"),
        gistId: id,
      });
      return errorResponse(ApiErrors.forbidden("Invalid request headers"));
    }

    // Validate Content-Type
    const contentType = request.headers.get("Content-Type");
    if (!contentType || !contentType.startsWith("multipart/form-data")) {
      return errorResponse(
        ApiErrors.badRequest("Content-Type must be multipart/form-data")
      );
    }

    // Parse the multipart form data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return errorResponse(ApiErrors.badRequest("Invalid multipart form data"));
    }

    // Extract required parts
    const metadataFile = formData.get("metadata") as File;
    const blobFile = formData.get("blob") as File;
    const versionParam = formData.get("version") as string;

    if (!metadataFile || !blobFile || !versionParam) {
      return errorResponse(
        ApiErrors.badRequest(
          "Missing required form parts: metadata, blob, version"
        )
      );
    }

    // Parse version for optimistic locking
    const clientVersion = parseInt(versionParam, 10);
    if (isNaN(clientVersion) || clientVersion < 1) {
      return errorResponse(ApiErrors.badRequest("Invalid version number"));
    }

    // Parse and validate metadata
    let parsedMetadata: unknown;
    try {
      const metadataText = await metadataFile.text();
      parsedMetadata = JSON.parse(metadataText);
    } catch {
      return errorResponse(ApiErrors.badRequest("Invalid metadata JSON"));
    }

    // Validate metadata against schema
    const validationResult = updateGistMetadataSchema.safeParse(parsedMetadata);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return errorResponse(
        validationError("Invalid update metadata", errors.fieldErrors)
      );
    }

    const updatedMetadata = validationResult.data;

    // Read blob data
    let blobData: Uint8Array;
    try {
      const arrayBuffer = await blobFile.arrayBuffer();
      blobData = new Uint8Array(arrayBuffer);
    } catch {
      return errorResponse(ApiErrors.badRequest("Invalid blob data"));
    }

    // Get existing gist for validation
    let existingGist: { metadata: GistMetadata; blob: Uint8Array };
    try {
      const result = await StorageOperations.getGist(id);
      if (!result) {
        return errorResponse(ApiErrors.notFound("Gist"));
      }
      existingGist = result;
    } catch (error) {
      if (error instanceof AppError && error.code === ErrorCode.NOT_FOUND) {
        return errorResponse(ApiErrors.notFound("Gist"));
      }
      putLogger.error(
        "Error retrieving gist for update",
        error instanceof Error ? error : new Error(String(error))
      );
      return errorResponse(ApiErrors.storageError("Failed to retrieve gist"));
    }

    // Check if gist has expired
    if (existingGist.metadata.expires_at) {
      const expiryDate = new Date(existingGist.metadata.expires_at);
      if (expiryDate <= new Date()) {
        return errorResponse(ApiErrors.gone("Gist has expired"));
      }
    }

    // Optimistic locking check
    if (existingGist.metadata.version !== clientVersion) {
      return errorResponse(
        ApiErrors.badRequest(
          "Version conflict - gist was modified by another user"
        )
      );
    }

    // PIN validation if gist is protected
    if (
      existingGist.metadata.edit_pin_hash &&
      existingGist.metadata.edit_pin_salt
    ) {
      const editPassword = request.headers.get("X-Edit-Password");
      if (!editPassword) {
        return errorResponse(ApiErrors.unauthorized("Edit password required"));
      }

      // Validate PIN using WebCrypto (async to avoid blocking workers)
      try {
        const isValidPin = await validateGistPin(
          editPassword,
          existingGist.metadata
        );
        if (!isValidPin) {
          putLogger.warn("Invalid edit password attempt", { gistId: id });
          return errorResponse(ApiErrors.unauthorized("Invalid edit password"));
        }
      } catch (error) {
        putLogger.error(
          "Error validating PIN",
          error instanceof Error ? error : new Error(String(error))
        );
        return errorResponse(ApiErrors.unauthorized("PIN validation failed"));
      }
    }

    // Validate size limits
    if (blobData.length > 5 * 1024 * 1024) {
      // 5MB limit
      return errorResponse(
        ApiErrors.payloadTooLarge("Gist content exceeds 5MB limit")
      );
    }

    // Prepare updated metadata
    const newVersion = existingGist.metadata.version + 1;
    const partialMetadata: Partial<GistMetadata> = {
      version: newVersion,
      total_size: blobData.length,
      encrypted_metadata: updatedMetadata.encrypted_metadata,
      // Update editor preferences if provided
      indent_mode:
        updatedMetadata.indent_mode || existingGist.metadata.indent_mode,
      indent_size:
        updatedMetadata.indent_size || existingGist.metadata.indent_size,
      wrap_mode: updatedMetadata.wrap_mode || existingGist.metadata.wrap_mode,
      theme: updatedMetadata.theme || existingGist.metadata.theme,
    };

    // Store the updated gist
    try {
      await StorageOperations.updateGist(id, partialMetadata, blobData);

      putLogger.info("Successfully updated gist", {
        gistId: id,
        oldVersion: clientVersion,
        newVersion: newVersion,
      });

      return NextResponse.json<UpdateGistResponse>(
        { version: newVersion },
        { status: 200 }
      );
    } catch (error) {
      putLogger.error(
        "Error storing updated gist",
        error instanceof Error ? error : new Error(String(error))
      );
      return errorResponse(ApiErrors.storageError("Failed to update gist"));
    }
  } catch (error) {
    putLogger.error(
      "Unexpected error in PUT /api/gists/[id]",
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
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Requested-With, X-Edit-Password",
      "Access-Control-Max-Age": "86400",
    },
  });
}
