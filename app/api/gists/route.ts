import { NextRequest, NextResponse } from "next/server";
import { StorageOperations } from "@/lib/storage-operations";
import { FILE_LIMITS } from "@/lib/constants";
import { AppError } from "@/types/errors";
import { generateSalt, hashPin } from "@/lib/auth";
import { errorResponse, ApiErrors, validationError } from "@/lib/api-errors";
import { validateCSRFProtection } from "@/lib/security";
import { createLogger } from "@/lib/logger";
import { createGistMetadataSchema } from "@/lib/api-schemas";
import type { CreateGistResponse } from "@/types/api";
import type { GistMetadata } from "@/types/models";
import { verifyTurnstileToken, isTurnstileEnabled } from "@/lib/turnstile";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Parse multipart form data from request
 */
async function parseMultipartFormData(request: NextRequest): Promise<{
  metadata: Record<string, unknown>;
  blob: Uint8Array;
  password?: string;
  turnstileToken?: string;
}> {
  const formData = await request.formData();

  // Get required parts
  const metadataFile = formData.get("metadata") as File | null;
  const blobFile = formData.get("blob") as File | null;
  const passwordValue = formData.get("password") as string | null;
  const turnstileToken = formData.get("turnstileToken") as string | null;

  if (!metadataFile || !blobFile) {
    throw ApiErrors.badRequest(
      "Missing required form data parts: metadata and blob"
    );
  }

  // Parse metadata JSON
  let metadata: Record<string, unknown>;
  try {
    const metadataText = await metadataFile.text();
    metadata = JSON.parse(metadataText) as Record<string, unknown>;
  } catch {
    throw ApiErrors.badRequest("Invalid metadata JSON");
  }

  // Read blob data
  const blobBuffer = await blobFile.arrayBuffer();
  const blob = new Uint8Array(blobBuffer);

  return {
    metadata,
    blob,
    password: passwordValue || undefined,
    turnstileToken: turnstileToken || undefined,
  };
}

const logger = createLogger("api:gists:post");

/**
 * POST /api/gists
 * Creates a new encrypted gist
 */
export async function POST(request: NextRequest) {
  try {
    // Get Cloudflare environment
    const { env } = getCloudflareContext();
    // CSRF Protection
    if (!validateCSRFProtection(request)) {
      logger.warn("CSRF protection failed", {
        origin: request.headers.get("origin"),
        customHeader: request.headers.get("X-Requested-With"),
      });
      return errorResponse(ApiErrors.forbidden("Invalid request headers"));
    }

    // Check content type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("multipart/form-data")) {
      return errorResponse(
        ApiErrors.badRequest("Content-Type must be multipart/form-data")
      );
    }

    // Parse multipart form data
    let formParts: {
      metadata: Record<string, unknown>;
      blob: Uint8Array;
      password?: string;
      turnstileToken?: string;
    };
    try {
      formParts = await parseMultipartFormData(request);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(error);
      }
      return errorResponse(
        ApiErrors.badRequest("Failed to parse multipart form data")
      );
    }

    const { metadata: rawMetadata, blob, password, turnstileToken } = formParts;

    // Verify Turnstile token if enabled
    if (isTurnstileEnabled(env)) {
      if (!turnstileToken) {
        return errorResponse(
          ApiErrors.badRequest("Verification token is required")
        );
      }

      const turnstileResult = await verifyTurnstileToken(
        turnstileToken,
        env.TURNSTILE_SECRET_KEY!,
        request.headers.get("cf-connecting-ip") || undefined
      );

      if (!turnstileResult.success) {
        logger.warn("Turnstile verification failed", {
          errorCodes: turnstileResult["error-codes"],
        });
        return errorResponse(
          ApiErrors.badRequest("Verification failed. Please try again.")
        );
      }
    }

    // Validate metadata
    const validationResult = createGistMetadataSchema.safeParse(rawMetadata);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return errorResponse(
        validationError("Invalid metadata", errors.fieldErrors)
      );
    }

    const validatedMetadata = validationResult.data;

    // Check size limits
    if (blob.length > FILE_LIMITS.MAX_TOTAL_SIZE) {
      return errorResponse(
        ApiErrors.payloadTooLarge(
          `Total size exceeds ${FILE_LIMITS.MAX_TOTAL_SIZE / 1024 / 1024}MB limit`
        )
      );
    }

    // Hash password if provided
    let editPinHash: string | undefined;
    let editPinSalt: string | undefined;
    if (password) {
      editPinSalt = await generateSalt();
      editPinHash = await hashPin(password, editPinSalt);
    }

    // Prepare metadata for storage
    const metadata: Omit<
      GistMetadata,
      "id" | "created_at" | "updated_at" | "version" | "current_version"
    > = {
      expires_at: validatedMetadata.expires_at ?? undefined,
      one_time_view: validatedMetadata.one_time_view,
      edit_pin_hash: editPinHash,
      edit_pin_salt: editPinSalt,
      total_size: blob.length,
      blob_count: validatedMetadata.blob_count || 1,
      // Use encrypted_metadata from client request (zero-knowledge design)
      encrypted_metadata: validatedMetadata.encrypted_metadata || {
        iv: "",
        data: "",
      },
      // Editor preferences
      indent_mode: validatedMetadata.indent_mode,
      indent_size: validatedMetadata.indent_size,
      wrap_mode: validatedMetadata.wrap_mode,
      theme: validatedMetadata.theme,
    };

    // Create gist using storage operations
    try {
      const { id } = await StorageOperations.createGist(metadata, blob);

      // Build response
      const response: CreateGistResponse = {
        id,
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://ghostpaste.dev"}/g/${id}`,
        createdAt: new Date().toISOString(),
        expiresAt: metadata.expires_at ?? null,
        isOneTimeView: metadata.one_time_view ?? false,
      };

      return NextResponse.json<CreateGistResponse>(response, {
        status: 201,
        headers: {
          Location: response.url,
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      // Handle storage errors
      if (error instanceof AppError) {
        return errorResponse(error);
      }

      // Log unexpected errors
      logger.error(
        "Storage error:",
        error instanceof Error ? error : new Error(String(error))
      );
      return errorResponse(ApiErrors.storageError("Failed to store gist data"));
    }
  } catch (error) {
    // Handle unexpected errors
    logger.error(
      "Unexpected error in POST /api/gists:",
      error instanceof Error ? error : new Error(String(error))
    );
    return errorResponse(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}

/**
 * OPTIONS /api/gists
 * Handle preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin":
        process.env.NEXT_PUBLIC_APP_URL || "https://ghostpaste.dev",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
      "Access-Control-Max-Age": "86400",
    },
  });
}
