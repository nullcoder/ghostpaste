/**
 * Environment types for Cloudflare Workers
 */

import type {
  R2Bucket,
  KVNamespace,
  AnalyticsEngineDataset,
  ExecutionContext,
} from "@cloudflare/workers-types";

/**
 * Cloudflare Workers environment bindings
 */
export interface Env {
  // R2 bucket binding
  GHOSTPASTE_BUCKET: R2Bucket;

  // Environment variables
  ENVIRONMENT?: "development" | "production";

  // Optional rate limiting (Cloudflare Workers KV)
  RATE_LIMIT_KV?: KVNamespace;

  // Optional analytics (Cloudflare Analytics Engine)
  ANALYTICS?: AnalyticsEngineDataset;
}

/**
 * Request context for Cloudflare Workers
 */
export interface RequestContext {
  env: Env;
  ctx: ExecutionContext;
  request: Request;
}

/**
 * R2 object metadata
 */
export interface R2ObjectMetadata {
  key: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: Record<string, string>;
  customMetadata?: Record<string, string>;
}

/**
 * Configuration for R2 operations
 */
export interface R2Config {
  gistPrefix: string; // Prefix for gist metadata objects
  blobPrefix: string; // Prefix for encrypted blob objects
}

/**
 * Default R2 configuration
 */
export const DEFAULT_R2_CONFIG: R2Config = {
  gistPrefix: "gists/",
  blobPrefix: "blobs/",
};
