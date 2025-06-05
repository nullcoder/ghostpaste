/**
 * Feature flags system for GhostPaste
 * Allows toggling features without code changes
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Env } from "@/types";

/**
 * Feature flag names
 */
export enum Feature {
  // Core features
  ONE_TIME_VIEW = "one_time_view",
  EDIT_PIN = "edit_pin",
  EXPIRY = "expiry",

  // Service features
  RATE_LIMIT = "rate_limit",
  ANALYTICS = "analytics",

  // UI features
  DARK_MODE = "dark_mode",
  SYNTAX_HIGHLIGHTING = "syntax_highlighting",
  MARKDOWN_PREVIEW = "markdown_preview",

  // Experimental features
  COLLABORATIVE_EDITING = "collaborative_editing",
  VERSION_HISTORY = "version_history",
  CUSTOM_THEMES = "custom_themes",
}

/**
 * Feature flag configuration
 */
interface FeatureConfig {
  enabled: boolean;
  rolloutPercentage?: number; // 0-100
  allowedUsers?: string[]; // User IDs for gradual rollout
  minVersion?: string; // Minimum app version
}

/**
 * Default feature flag configuration
 */
const DEFAULT_FEATURES: Record<Feature, FeatureConfig> = {
  // Core features - always enabled
  [Feature.ONE_TIME_VIEW]: { enabled: true },
  [Feature.EDIT_PIN]: { enabled: true },
  [Feature.EXPIRY]: { enabled: true },

  // Service features - depend on bindings
  [Feature.RATE_LIMIT]: { enabled: false }, // Enabled if KV is available
  [Feature.ANALYTICS]: { enabled: false }, // Enabled if Analytics is available

  // UI features - enabled by default
  [Feature.DARK_MODE]: { enabled: true },
  [Feature.SYNTAX_HIGHLIGHTING]: { enabled: true },
  [Feature.MARKDOWN_PREVIEW]: { enabled: true },

  // Experimental features - disabled by default
  [Feature.COLLABORATIVE_EDITING]: { enabled: false, rolloutPercentage: 0 },
  [Feature.VERSION_HISTORY]: { enabled: false, rolloutPercentage: 0 },
  [Feature.CUSTOM_THEMES]: { enabled: false, rolloutPercentage: 0 },
};

/**
 * Feature flags manager
 */
export class FeatureFlags {
  private features: Record<Feature, FeatureConfig>;
  private env: Env;

  constructor(env: Env) {
    this.env = env;
    this.features = this.initializeFeatures();
  }

  /**
   * Initialize features based on environment
   */
  private initializeFeatures(): Record<Feature, FeatureConfig> {
    const features = { ...DEFAULT_FEATURES };

    // Enable service features based on bindings
    // These will be enabled when the bindings are added to wrangler.toml
    // For now, check if the properties exist on the env object
    if ("RATE_LIMIT_KV" in this.env && this.env.RATE_LIMIT_KV) {
      features[Feature.RATE_LIMIT].enabled = true;
    }

    if ("ANALYTICS" in this.env && this.env.ANALYTICS) {
      features[Feature.ANALYTICS].enabled = true;
    }

    // Override features from environment variables if available
    // In production, these could come from a KV store or external service

    return features;
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: Feature, userId?: string): boolean {
    const config = this.features[feature];

    if (!config || !config.enabled) {
      return false;
    }

    // Check user-specific rollout
    if (config.allowedUsers && userId) {
      return config.allowedUsers.includes(userId);
    }

    // Check percentage rollout
    if (
      config.rolloutPercentage !== undefined &&
      config.rolloutPercentage < 100
    ) {
      // Simple hash-based rollout
      const hash = this.hashString(userId || "anonymous");
      const percentage = (hash % 100) + 1;
      return percentage <= config.rolloutPercentage;
    }

    return true;
  }

  /**
   * Get all enabled features
   */
  getEnabledFeatures(): Feature[] {
    return Object.entries(this.features)
      .filter(([_, config]) => config.enabled)
      .map(([feature]) => feature as Feature);
  }

  /**
   * Get feature configuration
   */
  getFeatureConfig(feature: Feature): FeatureConfig | undefined {
    return this.features[feature];
  }

  /**
   * Update feature configuration (for testing/development)
   */
  setFeatureConfig(feature: Feature, config: Partial<FeatureConfig>): void {
    if (this.features[feature]) {
      this.features[feature] = { ...this.features[feature], ...config };
    }
  }

  /**
   * Simple hash function for rollout
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Get feature flags instance
 * Must be called within a request context
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  const { env } = await getCloudflareContext();
  return new FeatureFlags(env);
}

/**
 * React hook-friendly feature check
 * Returns a function that can be used in components
 */
export async function createFeatureChecker() {
  const flags = await getFeatureFlags();
  return (feature: Feature, userId?: string) =>
    flags.isEnabled(feature, userId);
}
