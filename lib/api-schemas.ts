/**
 * Shared API validation schemas
 *
 * This module provides Zod schemas for API request/response validation
 * to ensure consistency across endpoints.
 */

import { z } from "zod";

/**
 * Schema for encrypted metadata structure
 * Used in both POST and PUT endpoints
 */
export const encryptedMetadataSchema = z.object({
  iv: z.string().min(1),
  data: z.string().min(1),
});

/**
 * Schema for editor preferences
 * Shared between create and update operations
 */
export const editorPreferencesSchema = z.object({
  indent_mode: z.enum(["tabs", "spaces"]).optional(),
  indent_size: z.number().int().positive().optional(),
  wrap_mode: z.enum(["none", "soft", "hard"]).optional(),
  theme: z.enum(["light", "dark", "auto"]).optional(),
});

/**
 * Schema for POST /api/gists metadata
 */
export const createGistMetadataSchema = z.object({
  expires_at: z.string().datetime().nullable().optional(),
  one_time_view: z.boolean().optional(),
  file_count: z.number().int().positive().optional(),
  blob_count: z.number().int().positive().optional(),
  encrypted_metadata: encryptedMetadataSchema.optional(),
  ...editorPreferencesSchema.shape,
});

/**
 * Schema for PUT /api/gists/[id] metadata
 */
export const updateGistMetadataSchema = z.object({
  encrypted_metadata: encryptedMetadataSchema.optional(),
  ...editorPreferencesSchema.shape,
});

/**
 * Type exports for use in route handlers
 */
export type CreateGistMetadata = z.infer<typeof createGistMetadataSchema>;
export type UpdateGistMetadata = z.infer<typeof updateGistMetadataSchema>;
export type EncryptedMetadata = z.infer<typeof encryptedMetadataSchema>;
