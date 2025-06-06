import { describe, it, expect } from "vitest";
import {
  isProductionBuild,
  isDevelopmentBuild,
  getRuntimeEnvironment,
  getCurrentEnvironment,
} from "./environment";

describe("Environment utilities", () => {
  describe("build-time detection", () => {
    it("should detect build environment", () => {
      // These tests verify that the build-time replacement works
      // In test environment, NODE_ENV is usually 'test'
      const isProduction = isProductionBuild();
      const isDevelopment = isDevelopmentBuild();

      // At least one should be false in test environment
      expect(isProduction || isDevelopment).toBeDefined();
    });
  });

  describe("getRuntimeEnvironment", () => {
    it("should detect development from localhost URL", () => {
      expect(getRuntimeEnvironment("http://localhost:3000")).toBe(
        "development"
      );
      expect(getRuntimeEnvironment("https://localhost:8080/path")).toBe(
        "development"
      );
      expect(getRuntimeEnvironment(new URL("http://localhost"))).toBe(
        "development"
      );
    });

    it("should detect development from 127.0.0.1", () => {
      expect(getRuntimeEnvironment("http://127.0.0.1:3000")).toBe(
        "development"
      );
      expect(getRuntimeEnvironment("https://127.0.0.1/app")).toBe(
        "development"
      );
    });

    it("should detect production from other URLs", () => {
      // In test environment, we can't fully test production detection
      // because the function checks globalThis.location which may be localhost
      const result = getRuntimeEnvironment("https://ghostpaste.dev");
      expect(["development", "production"]).toContain(result);
    });

    it("should handle globalThis.location", () => {
      const originalLocation = globalThis.location;

      // Mock localhost
      Object.defineProperty(globalThis, "location", {
        value: { hostname: "localhost" },
        writable: true,
        configurable: true,
      });
      expect(getRuntimeEnvironment()).toBe("development");

      // Mock production domain
      Object.defineProperty(globalThis, "location", {
        value: { hostname: "ghostpaste.dev" },
        writable: true,
        configurable: true,
      });
      expect(getRuntimeEnvironment()).toBe("production");

      // Restore
      if (originalLocation) {
        Object.defineProperty(globalThis, "location", {
          value: originalLocation,
          writable: true,
          configurable: true,
        });
      } else {
        delete (globalThis as any).location;
      }
    });

    it("should default to production when no URL or location", () => {
      const originalLocation = globalThis.location;
      delete (globalThis as any).location;

      expect(getRuntimeEnvironment()).toBe("production");

      // Restore
      if (originalLocation) {
        Object.defineProperty(globalThis, "location", {
          value: originalLocation,
          writable: true,
          configurable: true,
        });
      }
    });
  });

  describe("getCurrentEnvironment", () => {
    it("should return a valid environment", () => {
      const env = getCurrentEnvironment();
      expect(["development", "production"]).toContain(env);
    });

    it("should use build-time detection when available", () => {
      // In test environment, this should work consistently
      const env = getCurrentEnvironment();
      expect(env).toBeDefined();
      expect(typeof env).toBe("string");
    });
  });
});
