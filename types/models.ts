/**
 * Core data models for GhostPaste
 */

/**
 * Metadata stored in R2 for each gist
 * Mix of encrypted and unencrypted fields
 */
export interface GistMetadata {
  // System fields (unencrypted)
  id: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  expires_at?: string; // ISO 8601, optional expiry
  version: number; // Version number, incremented on updates
  current_version: string; // Timestamp of current blob version

  // Size information (unencrypted)
  total_size: number; // Total size in bytes
  blob_count: number; // Number of file blobs

  // Edit authentication (unencrypted)
  edit_pin_hash?: string; // BCrypt hash of edit PIN
  edit_pin_salt?: string; // Salt for PIN hashing

  // View restrictions (unencrypted)
  one_time_view?: boolean; // Delete after first view

  // Editor preferences (unencrypted)
  indent_mode?: "tabs" | "spaces";
  indent_size?: number; // 2, 4, 8
  wrap_mode?: "none" | "soft" | "hard";
  theme?: "light" | "dark" | "auto";

  // Encrypted metadata
  encrypted_metadata: EncryptedData;
}

/**
 * User-provided metadata (encrypted)
 */
export interface UserMetadata {
  description?: string; // Optional gist description
}

/**
 * Metadata for individual files within a gist
 */
export interface FileMetadata {
  name: string; // Original filename
  size: number; // Size in bytes
  language?: string; // Programming language
  blob_id: string; // Reference to encrypted blob in R2
}

/**
 * Structure for encrypted data
 */
export interface EncryptedData {
  iv: string; // Base64 encoded initialization vector
  data: string; // Base64 encoded ciphertext
}

/**
 * Individual file in a gist (for application use)
 */
export interface File {
  name: string;
  content: string;
  language?: string;
}

/**
 * Options for creating a gist
 */
export interface GistOptions {
  description?: string;
  expiry?: "never" | "1hour" | "24hours" | "7days" | "30days";
  editPin?: string;
  oneTimeView?: boolean;
  indentMode?: "tabs" | "spaces";
  indentSize?: number;
  wrapMode?: "none" | "soft" | "hard";
  theme?: "light" | "dark" | "auto";
}

/**
 * Editor preferences configuration
 */
export interface EditorPreferences {
  indentMode: "tabs" | "spaces";
  indentSize: number;
  wrapMode: "none" | "soft" | "hard";
  theme: "light" | "dark" | "auto";
}
