/**
 * API request and response types for GhostPaste
 */

import { File, GistOptions, GistMetadata } from "./models";

/**
 * Request body for creating a new gist (multipart/form-data)
 * Parts:
 * - metadata: JSON file containing GistMetadata fields
 * - blob: Binary encrypted content
 * - password: Optional edit password (plain text)
 */
export interface CreateGistFormData {
  metadata: {
    expires_at?: string | null; // ISO 8601 datetime
    one_time_view?: boolean;
    file_count?: number;
    blob_count?: number;
  };
  blob: Uint8Array;
  password?: string;
}

/**
 * Response from creating a new gist
 */
export interface CreateGistResponse {
  id: string;
  url: string;
  createdAt: string;
  expiresAt: string | null;
  isOneTimeView: boolean;
}

/**
 * Response from getting gist metadata
 */
export interface GetGistResponse {
  metadata: GistMetadata;
  decryption_key?: string; // Only included if requested via fragment
}

/**
 * Response from getting an encrypted blob
 */
export interface GetBlobResponse {
  encrypted_data: string; // Base64 encoded encrypted blob
  iv: string; // Base64 encoded initialization vector
}

/**
 * Request body for updating a gist
 */
export interface UpdateGistRequest {
  files: File[];
  options?: Partial<GistOptions>;
  edit_pin: string; // Required for authentication
}

/**
 * Response from updating a gist
 */
export interface UpdateGistResponse {
  version: number;
}

/**
 * Request headers for PIN authentication
 */
export interface AuthHeaders {
  "X-Edit-Pin": string;
}

/**
 * Query parameters for API endpoints
 */
export interface GistQueryParams {
  include_key?: boolean; // Include decryption key in response
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Response from GET /api/gists/[id] - public metadata without sensitive fields
 */
export type GetGistMetadataResponse = Omit<
  GistMetadata,
  "edit_pin_hash" | "edit_pin_salt" | "encrypted_metadata"
>;
