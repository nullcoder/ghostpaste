/**
 * API request and response types for GhostPaste
 */

import { File, GistOptions, GistMetadata } from "./models";

/**
 * Request body for creating a new gist
 */
export interface CreateGistRequest {
  files: File[];
  options?: GistOptions;
}

/**
 * Response from creating a new gist
 */
export interface CreateGistResponse {
  id: string;
  url: string;
  expires_at?: string;
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
  success: boolean;
  updated_at: string;
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
