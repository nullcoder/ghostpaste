/**
 * Configuration management for GhostPaste
 * Provides type-safe access to environment variables and settings
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Application configuration interface
 */
export interface AppConfig {
  // Application
  appUrl: string;
  environment: "development" | "production";

  // Storage
  r2Bucket: R2Bucket;

  // Optional services
  rateLimitKV?: KVNamespace;
  analytics?: AnalyticsEngineDataset;

  // Feature flags
  features: {
    rateLimit: boolean;
    analytics: boolean;
    oneTimeView: boolean;
    editPin: boolean;
    expiry: boolean;
  };
}

/**
 * Get the current environment
 */
function getEnvironment(): "development" | "production" {
  if (process.env.NODE_ENV === "development") {
    return "development";
  }
  // In Cloudflare Workers, we check the URL
  if (typeof globalThis !== "undefined" && "location" in globalThis) {
    const hostname = globalThis.location?.hostname || "";
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      return "development";
    }
  }
  return "production";
}

/**
 * Get application configuration from Cloudflare environment
 * This function must be called within a request context
 */
export async function getConfig(): Promise<AppConfig> {
  const { env } = await getCloudflareContext();

  const environment = env.ENVIRONMENT || getEnvironment();

  return {
    // Application
    appUrl: env.NEXT_PUBLIC_APP_URL || "https://ghostpaste.dev",
    environment,

    // Storage
    r2Bucket: env.GHOSTPASTE_BUCKET,

    // Optional services - will be undefined until added to wrangler.toml
    rateLimitKV: undefined, // env.RATE_LIMIT_KV when enabled
    analytics: undefined, // env.ANALYTICS when enabled

    // Feature flags - can be toggled based on environment
    features: {
      rateLimit: false, // Will be !!env.RATE_LIMIT_KV when enabled
      analytics: false, // Will be !!env.ANALYTICS when enabled
      oneTimeView: true, // Always enabled
      editPin: true, // Always enabled
      expiry: true, // Always enabled
    },
  };
}

/**
 * Type guard to check if a feature is enabled
 */
export function isFeatureEnabled(
  config: AppConfig,
  feature: keyof AppConfig["features"]
): boolean {
  return config.features[feature];
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(config: AppConfig): string {
  return config.appUrl;
}

/**
 * Get the API URL for the application
 */
export function getApiUrl(config: AppConfig, path: string): string {
  const baseUrl = getBaseUrl(config);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}/api${cleanPath}`;
}

/**
 * Check if running in development
 */
export function isDevelopment(config: AppConfig): boolean {
  return config.environment === "development";
}

/**
 * Check if running in production
 */
export function isProduction(config: AppConfig): boolean {
  return config.environment === "production";
}
