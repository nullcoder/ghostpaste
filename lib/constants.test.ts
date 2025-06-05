import { describe, it, expect } from "vitest";
import {
  FILE_LIMITS,
  GIST_LIMITS,
  EXPIRY_DURATIONS,
  isValidFileSize,
  isValidTotalSize,
  isValidFileCount,
  isValidFilename,
  isValidPin,
  isValidExpiryOption,
  getExpiryDate,
  isExpired,
} from "./constants";

describe("Constants and Validation", () => {
  describe("File validation", () => {
    it("should validate file sizes correctly", () => {
      expect(isValidFileSize(100)).toBe(true);
      expect(isValidFileSize(FILE_LIMITS.MAX_FILE_SIZE)).toBe(true);
      expect(isValidFileSize(FILE_LIMITS.MAX_FILE_SIZE + 1)).toBe(false);
      expect(isValidFileSize(0)).toBe(false);
      expect(isValidFileSize(-1)).toBe(false);
    });

    it("should validate total sizes correctly", () => {
      expect(isValidTotalSize(1000)).toBe(true);
      expect(isValidTotalSize(FILE_LIMITS.MAX_TOTAL_SIZE)).toBe(true);
      expect(isValidTotalSize(FILE_LIMITS.MAX_TOTAL_SIZE + 1)).toBe(false);
      expect(isValidTotalSize(0)).toBe(false);
    });

    it("should validate file counts correctly", () => {
      expect(isValidFileCount(1)).toBe(true);
      expect(isValidFileCount(FILE_LIMITS.MAX_FILE_COUNT)).toBe(true);
      expect(isValidFileCount(FILE_LIMITS.MAX_FILE_COUNT + 1)).toBe(false);
      expect(isValidFileCount(0)).toBe(false);
    });

    it("should validate filenames correctly", () => {
      expect(isValidFilename("test.js")).toBe(true);
      expect(isValidFilename("a".repeat(FILE_LIMITS.MAX_FILENAME_LENGTH))).toBe(
        true
      );
      expect(
        isValidFilename("a".repeat(FILE_LIMITS.MAX_FILENAME_LENGTH + 1))
      ).toBe(false);
      expect(isValidFilename("")).toBe(false);
      expect(isValidFilename("test/file.js")).toBe(false);
      expect(isValidFilename("test\\file.js")).toBe(false);
    });
  });

  describe("PIN validation", () => {
    it("should validate PINs correctly", () => {
      expect(isValidPin("1234")).toBe(true);
      expect(isValidPin("a".repeat(GIST_LIMITS.MIN_PIN_LENGTH))).toBe(true);
      expect(isValidPin("a".repeat(GIST_LIMITS.MAX_PIN_LENGTH))).toBe(true);
      expect(isValidPin("123")).toBe(false);
      expect(isValidPin("a".repeat(GIST_LIMITS.MAX_PIN_LENGTH + 1))).toBe(
        false
      );
    });
  });

  describe("Expiry validation", () => {
    it("should validate expiry options correctly", () => {
      expect(isValidExpiryOption("never")).toBe(true);
      expect(isValidExpiryOption("1hour")).toBe(true);
      expect(isValidExpiryOption("24hours")).toBe(true);
      expect(isValidExpiryOption("7days")).toBe(true);
      expect(isValidExpiryOption("30days")).toBe(true);
      expect(isValidExpiryOption("invalid")).toBe(false);
    });

    it("should calculate expiry dates correctly", () => {
      const now = Date.now();

      expect(getExpiryDate("never")).toBe(null);

      const oneHour = getExpiryDate("1hour");
      expect(oneHour).toBeInstanceOf(Date);
      expect(oneHour!.getTime() - now).toBeCloseTo(
        EXPIRY_DURATIONS["1hour"]!,
        -3
      );

      const sevenDays = getExpiryDate("7days");
      expect(sevenDays).toBeInstanceOf(Date);
      expect(sevenDays!.getTime() - now).toBeCloseTo(
        EXPIRY_DURATIONS["7days"]!,
        -3
      );
    });

    it("should check expiry correctly", () => {
      const future = new Date(Date.now() + 1000).toISOString();
      const past = new Date(Date.now() - 1000).toISOString();

      expect(isExpired(null)).toBe(false);
      expect(isExpired(undefined)).toBe(false);
      expect(isExpired(future)).toBe(false);
      expect(isExpired(past)).toBe(true);
    });
  });

  describe("Constants values", () => {
    it("should have correct file limits", () => {
      expect(FILE_LIMITS.MAX_FILE_SIZE).toBe(500 * 1024);
      expect(FILE_LIMITS.MAX_TOTAL_SIZE).toBe(5 * 1024 * 1024);
      expect(FILE_LIMITS.MAX_FILE_COUNT).toBe(20);
    });

    it("should have correct expiry durations", () => {
      expect(EXPIRY_DURATIONS.never).toBe(null);
      expect(EXPIRY_DURATIONS["1hour"]).toBe(60 * 60 * 1000);
      expect(EXPIRY_DURATIONS["24hours"]).toBe(24 * 60 * 60 * 1000);
    });
  });
});
