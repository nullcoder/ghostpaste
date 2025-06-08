import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  verifyTurnstileToken,
  isTurnstileEnabled,
  getTurnstileErrorMessage,
} from "./turnstile";

// Mock fetch globally
global.fetch = vi.fn();

describe("turnstile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("verifyTurnstileToken", () => {
    it("should verify valid token successfully", async () => {
      const mockResponse = {
        success: true,
        challenge_ts: "2024-01-01T00:00:00Z",
        hostname: "example.com",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verifyTurnstileToken("valid-token", "secret-key");

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: expect.any(URLSearchParams),
        })
      );
    });

    it("should include remote IP when provided", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await verifyTurnstileToken("token", "secret", "192.168.1.1");

      const call = (global.fetch as any).mock.calls[0];
      const body = call[1].body as URLSearchParams;
      expect(body.get("remoteip")).toBe("192.168.1.1");
    });

    it("should handle verification failure", async () => {
      const mockResponse = {
        success: false,
        "error-codes": ["invalid-input-response"],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await verifyTurnstileToken("invalid-token", "secret-key");

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(false);
    });

    it("should handle network errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const result = await verifyTurnstileToken("token", "secret");

      expect(result).toEqual({
        success: false,
        "error-codes": ["verification-failed"],
      });
    });

    it("should handle non-ok responses", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      });

      const result = await verifyTurnstileToken("token", "secret");

      expect(result).toEqual({
        success: false,
        "error-codes": ["verification-failed"],
      });
    });
  });

  describe("isTurnstileEnabled", () => {
    it("should return true when secret key is configured", () => {
      expect(isTurnstileEnabled({ TURNSTILE_SECRET_KEY: "secret-key" })).toBe(
        true
      );
    });

    it("should return false when secret key is not configured", () => {
      expect(isTurnstileEnabled({})).toBe(false);
      expect(isTurnstileEnabled({ TURNSTILE_SECRET_KEY: "" })).toBe(false);
      expect(isTurnstileEnabled({ TURNSTILE_SECRET_KEY: "   " })).toBe(false);
    });
  });

  describe("getTurnstileErrorMessage", () => {
    it("should return default message for no error codes", () => {
      expect(getTurnstileErrorMessage()).toBe("Verification failed");
      expect(getTurnstileErrorMessage([])).toBe("Verification failed");
    });

    it("should return human-readable messages for known error codes", () => {
      expect(getTurnstileErrorMessage(["missing-input-secret"])).toBe(
        "The secret parameter was not passed"
      );
      expect(getTurnstileErrorMessage(["invalid-input-response"])).toBe(
        "The response parameter is invalid"
      );
    });

    it("should handle multiple error codes", () => {
      expect(
        getTurnstileErrorMessage([
          "missing-input-secret",
          "invalid-input-response",
        ])
      ).toBe(
        "The secret parameter was not passed, The response parameter is invalid"
      );
    });

    it("should return unknown error codes as-is", () => {
      expect(getTurnstileErrorMessage(["unknown-error"])).toBe("unknown-error");
    });
  });
});
