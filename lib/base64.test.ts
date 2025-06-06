import { describe, it, expect, vi } from "vitest";
import {
  base64Encode,
  base64Decode,
  base64UrlEncode,
  base64UrlDecode,
  isValidBase64,
} from "./base64";

// Mock logger
vi.mock("./logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("Base64 Utilities", () => {
  describe("base64Encode", () => {
    it("should encode simple data", () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const encoded = base64Encode(data);
      expect(encoded).toBe("AQIDBAU=");
    });

    it("should encode empty data", () => {
      const data = new Uint8Array(0);
      const encoded = base64Encode(data);
      expect(encoded).toBe("");
    });

    it("should encode large data", () => {
      // Create 10KB of data
      const data = new Uint8Array(10000);
      for (let i = 0; i < data.length; i++) {
        data[i] = i % 256;
      }
      const encoded = base64Encode(data);
      expect(encoded).toBeTruthy();
      expect(encoded.length).toBeGreaterThan(10000);
    });

    it("should handle binary data with all byte values", () => {
      const data = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        data[i] = i;
      }
      const encoded = base64Encode(data);
      const decoded = base64Decode(encoded);
      expect(decoded).toEqual(data);
    });
  });

  describe("base64Decode", () => {
    it("should decode simple data", () => {
      const decoded = base64Decode("AQIDBAU=");
      expect(decoded).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
    });

    it("should decode empty string", () => {
      const decoded = base64Decode("");
      expect(decoded).toEqual(new Uint8Array(0));
    });

    it("should throw on invalid base64", () => {
      expect(() => base64Decode("!@#$%")).toThrow(
        "Failed to decode data from base64"
      );
    });

    it("should handle padding correctly", () => {
      const cases = [
        { encoded: "YQ==", expected: new Uint8Array([97]) }, // "a"
        { encoded: "YWI=", expected: new Uint8Array([97, 98]) }, // "ab"
        { encoded: "YWJj", expected: new Uint8Array([97, 98, 99]) }, // "abc"
      ];

      for (const { encoded, expected } of cases) {
        const decoded = base64Decode(encoded);
        expect(decoded).toEqual(expected);
      }
    });
  });

  describe("base64UrlEncode", () => {
    it("should encode to URL-safe format", () => {
      // Data that would produce + and / in standard base64
      const data = new Uint8Array([255, 254, 253, 252, 251]);
      const encoded = base64UrlEncode(data);

      // Should not contain URL-unsafe characters
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("=");

      // Should contain URL-safe replacements
      expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("should remove padding", () => {
      const data = new Uint8Array([1]);
      const standardEncoded = base64Encode(data);
      const urlEncoded = base64UrlEncode(data);

      expect(standardEncoded).toContain("=");
      expect(urlEncoded).not.toContain("=");
    });

    it("should be reversible", () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const encoded = base64UrlEncode(data);
      const decoded = base64UrlDecode(encoded);
      expect(decoded).toEqual(data);
    });
  });

  describe("base64UrlDecode", () => {
    it("should decode URL-safe format", () => {
      // Test with known URL-safe encoded value
      const decoded = base64UrlDecode("_-79_Ps");
      expect(decoded).toBeTruthy();
      expect(decoded.length).toBeGreaterThan(0);
    });

    it("should handle missing padding", () => {
      // These would need padding in standard base64
      const cases = [
        "YQ", // Would be "YQ==" in standard base64
        "YWI", // Would be "YWI=" in standard base64
        "YWJj", // No padding needed
      ];

      for (const encoded of cases) {
        const decoded = base64UrlDecode(encoded);
        expect(decoded).toBeTruthy();
      }
    });

    it("should convert URL-safe characters", () => {
      // Manually create a URL-safe string with - and _
      const urlSafe = "ab-cd_ef";
      const decoded = base64UrlDecode(urlSafe);

      // Re-encode to verify it works
      const reencoded = base64UrlEncode(decoded);
      expect(reencoded).toBeTruthy();
    });

    it("should throw on invalid input", () => {
      expect(() => base64UrlDecode("!@#$%")).toThrow(
        "Failed to decode data from base64url"
      );
    });
  });

  describe("isValidBase64", () => {
    describe("standard base64", () => {
      it("should accept valid base64", () => {
        expect(isValidBase64("AQIDBAU=")).toBe(true);
        expect(isValidBase64("YWJjZGVmZ2hpams=")).toBe(true);
        expect(isValidBase64("YQ==")).toBe(true);
        expect(isValidBase64("")).toBe(true);
      });

      it("should reject invalid base64", () => {
        expect(isValidBase64("!@#$%")).toBe(false);
        expect(isValidBase64("ABC DEF")).toBe(false);
        expect(isValidBase64("===")).toBe(false);
        expect(isValidBase64(null as unknown as string)).toBe(false);
        expect(isValidBase64(undefined as unknown as string)).toBe(false);
      });

      it("should accept base64 with + and /", () => {
        expect(isValidBase64("ab+cd/ef==")).toBe(true);
        expect(isValidBase64("+/+/+/==")).toBe(true);
      });
    });

    describe("URL-safe base64", () => {
      it("should accept valid URL-safe base64", () => {
        expect(isValidBase64("AQIDBAU", true)).toBe(true);
        expect(isValidBase64("ab-cd_ef", true)).toBe(true);
        expect(isValidBase64("", true)).toBe(true);
      });

      it("should reject standard base64 characters", () => {
        expect(isValidBase64("ab+cd/ef", true)).toBe(false);
        expect(isValidBase64("AQIDBAU=", true)).toBe(false);
      });

      it("should reject invalid characters", () => {
        expect(isValidBase64("!@#$%", true)).toBe(false);
        expect(isValidBase64("ABC DEF", true)).toBe(false);
      });
    });
  });

  describe("Round-trip encoding/decoding", () => {
    it("should handle various data sizes", () => {
      const sizes = [0, 1, 16, 100, 1000, 10000];

      for (const size of sizes) {
        const data = new Uint8Array(size);
        crypto.getRandomValues(data);

        // Test standard base64
        const encoded = base64Encode(data);
        const decoded = base64Decode(encoded);
        expect(decoded).toEqual(data);

        // Test URL-safe base64
        const urlEncoded = base64UrlEncode(data);
        const urlDecoded = base64UrlDecode(urlEncoded);
        expect(urlDecoded).toEqual(data);
      }
    });

    it("should handle Unicode strings when encoded as UTF-8", () => {
      const text = "Hello 世界! 🌍 Привет мир!";
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      // Standard base64
      const encoded = base64Encode(data);
      const decoded = base64Decode(encoded);
      const decodedText = new TextDecoder().decode(decoded);
      expect(decodedText).toBe(text);

      // URL-safe base64
      const urlEncoded = base64UrlEncode(data);
      const urlDecoded = base64UrlDecode(urlEncoded);
      const urlDecodedText = new TextDecoder().decode(urlDecoded);
      expect(urlDecodedText).toBe(text);
    });
  });
});
