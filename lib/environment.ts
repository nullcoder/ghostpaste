/**
 * Environment detection utilities for edge runtime
 *
 * These utilities work both at build time and runtime in Cloudflare Workers
 */

/**
 * Check if running in production environment
 *
 * This uses build-time replacement for process.env.NODE_ENV
 * In Cloudflare Workers, this is replaced at build time
 */
export function isProductionBuild(): boolean {
  // This gets replaced at build time by the bundler
  return process.env.NODE_ENV === "production";
}

/**
 * Check if running in development environment at build time
 */
export function isDevelopmentBuild(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Get environment from runtime context (requires request context)
 * This should be used when you have access to the Cloudflare env
 */
export function getRuntimeEnvironment(
  url?: string | URL
): "development" | "production" {
  // Check URL if provided
  if (url) {
    const hostname =
      typeof url === "string" ? new URL(url).hostname : url.hostname;
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      return "development";
    }
  }

  // In Workers, check if we have access to global location
  if (typeof globalThis !== "undefined" && "location" in globalThis) {
    const hostname = globalThis.location?.hostname || "";
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
      return "development";
    }
  }

  // Default to production in runtime
  return "production";
}

/**
 * Get the current environment using the best available method
 * Uses build-time check first, falls back to runtime detection
 */
export function getCurrentEnvironment(): "development" | "production" {
  // First try build-time environment
  if (isDevelopmentBuild()) {
    return "development";
  }

  // For production builds, do runtime check to handle local testing
  return getRuntimeEnvironment();
}
