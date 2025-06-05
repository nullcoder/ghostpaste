/**
 * Environment types for Cloudflare Workers
 */

import type {
  KVNamespace,
  AnalyticsEngineDataset,
  ExecutionContext,
} from "@cloudflare/workers-types";

/**
 * Extended environment interface for future features
 * This represents the full environment once all features are enabled
 */
export interface ExtendedEnv extends CloudflareEnv {
  // Optional rate limiting (Cloudflare Workers KV)
  RATE_LIMIT_KV?: KVNamespace;

  // Optional analytics (Cloudflare Analytics Engine)
  ANALYTICS?: AnalyticsEngineDataset;
}

/**
 * Type alias for the current environment
 * Uses CloudflareEnv which is auto-generated from wrangler.toml
 */
export type Env = CloudflareEnv;

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
