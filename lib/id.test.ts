import { describe, it, expect } from "vitest";
import {
  generateGistId,
  generateReadableId,
  generateShortId,
  generatePrefixedId,
  generateTimestampId,
  generateVersionId,
  isValidNanoId,
  extractTimestamp,
  generateUniqueId,
} from "./id";

describe("ID generation utilities", () => {
  describe("generateGistId", () => {
    it("should generate IDs of default length", () => {
      const id = generateGistId();
      expect(id).toHaveLength(12);
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("should generate IDs of custom length", () => {
      const id = generateGistId(20);
      expect(id).toHaveLength(20);
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("should generate unique IDs", () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateGistId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe("generateReadableId", () => {
    it("should generate readable IDs without ambiguous characters", () => {
      const id = generateReadableId();
      expect(id).toHaveLength(12);
      // Should not contain 0, O, I, l
      expect(id).not.toMatch(/[0OIl]/);
      expect(id).toMatch(
        /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/
      );
    });

    it("should generate IDs of custom length", () => {
      const id = generateReadableId(16);
      expect(id).toHaveLength(16);
    });
  });

  describe("generateShortId", () => {
    it("should generate alphanumeric IDs", () => {
      const id = generateShortId();
      expect(id).toHaveLength(8);
      expect(id).toMatch(/^[0-9A-Za-z]+$/);
    });

    it("should generate IDs of custom length", () => {
      const id = generateShortId(6);
      expect(id).toHaveLength(6);
    });
  });

  describe("generatePrefixedId", () => {
    it("should generate IDs with prefix", () => {
      const id = generatePrefixedId("gist");
      expect(id).toMatch(/^gist_[A-Za-z0-9_-]{12}$/);
    });

    it("should support custom length", () => {
      const id = generatePrefixedId("version", 8);
      expect(id).toMatch(/^version_[A-Za-z0-9_-]{8}$/);
    });
  });

  describe("generateTimestampId", () => {
    it("should generate timestamp-based IDs", () => {
      const id = generateTimestampId();
      expect(id).toMatch(/^[a-z0-9]+_[A-Za-z0-9_-]+$/);

      const parts = id.split("_");
      expect(parts).toHaveLength(2);
      expect(parts[1]).toHaveLength(8);
    });

    it("should generate sequential timestamps", async () => {
      const id1 = generateTimestampId();
      await new Promise((resolve) => setTimeout(resolve, 10));
      const id2 = generateTimestampId();

      const timestamp1 = id1.split("_")[0];
      const timestamp2 = id2.split("_")[0];

      expect(timestamp2 >= timestamp1).toBe(true);
    });
  });

  describe("generateVersionId", () => {
    it("should generate version IDs with correct format", () => {
      const id = generateVersionId();
      expect(id).toMatch(/^v_[a-z0-9]+_[0-9A-Za-z]{6}$/);
    });

    it("should include timestamp in version ID", () => {
      const id = generateVersionId();
      const parts = id.split("_");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe("v");

      // Should be able to parse timestamp
      const timestamp = parseInt(parts[1], 36);
      expect(timestamp).toBeGreaterThan(0);
    });
  });

  describe("isValidNanoId", () => {
    it("should validate correct nanoid format", () => {
      expect(isValidNanoId("abc123-_ABC")).toBe(true);
      expect(isValidNanoId("ValidId_123")).toBe(true);
    });

    it("should reject invalid characters", () => {
      expect(isValidNanoId("abc 123")).toBe(false);
      expect(isValidNanoId("abc@123")).toBe(false);
      expect(isValidNanoId("abc!123")).toBe(false);
    });

    it("should check length when specified", () => {
      expect(isValidNanoId("abc123", 6)).toBe(true);
      expect(isValidNanoId("abc123", 10)).toBe(false);
    });

    it("should reject non-string inputs", () => {
      expect(isValidNanoId(null as any)).toBe(false);
      expect(isValidNanoId(123 as any)).toBe(false);
      expect(isValidNanoId("")).toBe(false);
    });
  });

  describe("extractTimestamp", () => {
    it("should extract timestamp from timestamp ID", () => {
      const now = Date.now();
      const timestampBase36 = now.toString(36);
      const id = `${timestampBase36}_suffix`;

      const extracted = extractTimestamp(id);
      expect(extracted).toBeInstanceOf(Date);
      expect(Math.abs(extracted!.getTime() - now)).toBeLessThan(1000);
    });

    it("should return null for invalid IDs", () => {
      expect(extractTimestamp("invalid")).toBe(null);
      expect(extractTimestamp("")).toBe(null);
      expect(extractTimestamp(null as any)).toBe(null);
      expect(extractTimestamp("notbase36_suffix")).toBe(null);
    });
  });

  describe("generateUniqueId", () => {
    it("should generate complex unique IDs", () => {
      const id = generateUniqueId();
      const parts = id.split("_");

      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/^[a-z0-9]+$/); // timestamp
      expect(parts[1]).toHaveLength(8); // nanoid
      expect(parts[2]).toMatch(/^[a-z0-9]+$/); // random
    });

    it("should generate highly unique IDs", () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        ids.add(generateUniqueId());
      }
      expect(ids.size).toBe(1000);
    });
  });
});
