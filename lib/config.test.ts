import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getConfig,
  isFeatureEnabled,
  isDevelopment,
  isProduction,
} from "./config";
import type { Env } from "@/types";

// Mock the Cloudflare context
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(),
}));

describe("Configuration Management", () => {
  const mockEnv: Env = {
    GHOSTPASTE_BUCKET: {} as R2Bucket,
    NEXT_PUBLIC_APP_URL: "https://ghostpaste.dev",
    ENVIRONMENT: "production",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
    TURNSTILE_SECRET_KEY: "",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { getCloudflareContext } = vi.mocked(
      await import("@opennextjs/cloudflare")
    );
    getCloudflareContext.mockResolvedValue({
      env: mockEnv,
      ctx: {} as ExecutionContext,
      cf: {},
    });
  });

  describe("getConfig", () => {
    it("should return configuration with all required fields", async () => {
      const config = await getConfig();

      expect(config).toMatchObject({
        appUrl: "https://ghostpaste.dev",
        environment: "production",
        r2Bucket: mockEnv.GHOSTPASTE_BUCKET,
        rateLimitKV: undefined,
        analytics: undefined,
      });
    });

    it("should enable core features by default", async () => {
      const config = await getConfig();

      expect(config.features.rateLimit).toBe(false); // Not yet enabled
      expect(config.features.analytics).toBe(false); // Not yet enabled
      expect(config.features.oneTimeView).toBe(true);
      expect(config.features.editPin).toBe(true);
      expect(config.features.expiry).toBe(true);
    });
  });

  describe("Feature checks", () => {
    it("should correctly identify enabled features", async () => {
      const config = await getConfig();

      expect(isFeatureEnabled(config, "rateLimit")).toBe(false);
      expect(isFeatureEnabled(config, "analytics")).toBe(false);
      expect(isFeatureEnabled(config, "oneTimeView")).toBe(true);
    });
  });

  describe("Environment checks", () => {
    it("should correctly identify production environment", async () => {
      const config = await getConfig();

      expect(isDevelopment(config)).toBe(false);
      expect(isProduction(config)).toBe(true);
    });

    it("should correctly identify development environment", async () => {
      const { getCloudflareContext } = vi.mocked(
        await import("@opennextjs/cloudflare")
      );
      getCloudflareContext.mockResolvedValue({
        env: { ...mockEnv, ENVIRONMENT: "development" },
        ctx: {} as ExecutionContext,
        cf: {},
      });

      const config = await getConfig();

      expect(isDevelopment(config)).toBe(true);
      expect(isProduction(config)).toBe(false);
    });
  });
});
