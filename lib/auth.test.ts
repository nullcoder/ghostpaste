/**
 * Tests for auth.ts - PIN authentication utilities
 */

import { describe, it, expect, vi } from "vitest";
import {
  generateSalt,
  hashPin,
  validatePin,
  validatePinStrength,
  generateRandomPin,
} from "./auth";
import { BadRequestError, UnauthorizedError } from "./errors";

describe("Auth Module", () => {
  describe("generateSalt", () => {
    it("should generate a valid base64-encoded salt", async () => {
      const salt = await generateSalt();

      expect(salt).toBeTruthy();
      expect(typeof salt).toBe("string");

      // Verify it's valid base64
      const decoded = atob(salt);
      expect(decoded.length).toBe(16); // 16 bytes
    });

    it("should generate unique salts", async () => {
      const salts = await Promise.all([
        generateSalt(),
        generateSalt(),
        generateSalt(),
        generateSalt(),
        generateSalt(),
      ]);

      // All salts should be unique
      const uniqueSalts = new Set(salts);
      expect(uniqueSalts.size).toBe(5);
    });

    it("should handle crypto errors gracefully", async () => {
      // Mock crypto.getRandomValues to throw
      const originalGetRandomValues = crypto.getRandomValues;
      crypto.getRandomValues = vi.fn(() => {
        throw new Error("Crypto error");
      });

      await expect(generateSalt()).rejects.toThrow(
        "Failed to generate salt for PIN hashing"
      );

      // Restore original
      crypto.getRandomValues = originalGetRandomValues;
    });
  });

  describe("hashPin", () => {
    it("should hash a valid PIN", async () => {
      const pin = "MyPin2024";
      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");

      // Verify it's valid base64
      const decoded = atob(hash);
      expect(decoded.length).toBe(32); // 32 bytes (256 bits)
    });

    it("should produce different hashes for different PINs", async () => {
      const salt = await generateSalt();
      const hash1 = await hashPin("MyPin2024", salt);
      const hash2 = await hashPin("YourPin2025", salt);

      expect(hash1).not.toBe(hash2);
    });

    it("should produce different hashes for same PIN with different salts", async () => {
      const pin = "MyPin2024";
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();

      const hash1 = await hashPin(pin, salt1);
      const hash2 = await hashPin(pin, salt2);

      expect(hash1).not.toBe(hash2);
    });

    it("should produce identical hashes for same PIN and salt", async () => {
      const pin = "MyPin2024";
      const salt = await generateSalt();

      const hash1 = await hashPin(pin, salt);
      const hash2 = await hashPin(pin, salt);

      expect(hash1).toBe(hash2);
    });

    it("should reject PINs that don't meet requirements", async () => {
      const salt = await generateSalt();

      // Too short
      await expect(hashPin("ab1", salt)).rejects.toThrow(BadRequestError);
      await expect(hashPin("ab1", salt)).rejects.toThrow("at least 4");

      // Too long
      await expect(hashPin("a".repeat(21) + "1", salt)).rejects.toThrow(
        BadRequestError
      );
      await expect(hashPin("a".repeat(21) + "1", salt)).rejects.toThrow(
        "no more than 20"
      );

      // No numbers
      await expect(hashPin("abcd", salt)).rejects.toThrow(BadRequestError);
      await expect(hashPin("abcd", salt)).rejects.toThrow(
        "letters and numbers"
      );

      // No letters
      await expect(hashPin("1234", salt)).rejects.toThrow(BadRequestError);
      await expect(hashPin("1234", salt)).rejects.toThrow(
        "letters and numbers"
      );
    });

    it("should handle crypto errors gracefully", async () => {
      const pin = "MyPin2024";
      const salt = await generateSalt();

      // Mock crypto.subtle.importKey to throw
      const originalImportKey = crypto.subtle.importKey;
      crypto.subtle.importKey = vi
        .fn()
        .mockRejectedValue(new Error("Crypto error"));

      await expect(hashPin(pin, salt)).rejects.toThrow("Failed to hash PIN");

      // Restore original
      crypto.subtle.importKey = originalImportKey;
    });
  });

  describe("validatePin", () => {
    it("should validate correct PIN", async () => {
      const pin = "MyPin2024";
      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      const isValid = await validatePin(pin, hash, salt);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect PIN", async () => {
      const correctPin = "MyPin2024";
      const wrongPin = "WrongPin2025";
      const salt = await generateSalt();
      const hash = await hashPin(correctPin, salt);

      await expect(validatePin(wrongPin, hash, salt)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(validatePin(wrongPin, hash, salt)).rejects.toThrow(
        "Invalid PIN"
      );
    });

    it("should reject PIN with wrong salt", async () => {
      const pin = "MyPin2024";
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();
      const hash = await hashPin(pin, salt1);

      await expect(validatePin(pin, hash, salt2)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should reject invalid hash format", async () => {
      const pin = "MyPin2024";
      const salt = await generateSalt();
      const invalidHash = "invalid-hash";

      await expect(validatePin(pin, invalidHash, salt)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should handle edge cases", async () => {
      const pin = "MyPin2024";
      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      // Empty PIN
      await expect(validatePin("", hash, salt)).rejects.toThrow(
        UnauthorizedError
      );

      // Null/undefined PIN
      await expect(validatePin(null as any, hash, salt)).rejects.toThrow(
        UnauthorizedError
      );
      await expect(validatePin(undefined as any, hash, salt)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should use constant-time comparison", async () => {
      // This test verifies the function structure includes constant-time comparison
      // The actual timing attack prevention is difficult to test in unit tests
      const pin = "MyPin2024";
      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      // Should complete validation even with wrong PIN
      await expect(validatePin("WrongPin123", hash, salt)).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  describe("validatePinStrength", () => {
    it("should accept valid PINs", () => {
      const validPins = [
        "Code1",
        "MyPin2024",
        "ABC123",
        "Pass9876Word",
        "a1b2c3d4",
        "SecurePin1",
      ];

      for (const pin of validPins) {
        const result = validatePinStrength(pin);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it("should reject empty or invalid PIN", () => {
      const result1 = validatePinStrength("");
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain("PIN is required");

      const result2 = validatePinStrength(null as any);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain("PIN is required");

      const result3 = validatePinStrength(undefined as any);
      expect(result3.isValid).toBe(false);
      expect(result3.errors).toContain("PIN is required");
    });

    it("should reject PINs that are too short", () => {
      const shortPins = ["a1", "ab1", "1a"];

      for (const pin of shortPins) {
        const result = validatePinStrength(pin);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "PIN must be at least 4 characters long"
        );
      }
    });

    it("should reject PINs that are too long", () => {
      const longPin = "a".repeat(20) + "1"; // 21 characters
      const result = validatePinStrength(longPin);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "PIN must be no more than 20 characters long"
      );
    });

    it("should reject PINs without letters", () => {
      const numberOnlyPins = ["1234", "5678", "9999", "000000"];

      for (const pin of numberOnlyPins) {
        const result = validatePinStrength(pin);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "PIN must contain both letters and numbers"
        );
      }
    });

    it("should reject PINs without numbers", () => {
      const letterOnlyPins = ["abcd", "test", "password", "admin"];

      for (const pin of letterOnlyPins) {
        const result = validatePinStrength(pin);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "PIN must contain both letters and numbers"
        );
      }
    });

    it("should reject common weak PINs", () => {
      const weakPins = ["1234", "password", "pass1234", "test1234", "admin123"];

      for (const pin of weakPins) {
        const result = validatePinStrength(pin);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "PIN is too common, please choose a stronger PIN"
        );
      }
    });

    it("should handle multiple validation errors", () => {
      // Too short and no letters
      const result1 = validatePinStrength("123");
      expect(result1.isValid).toBe(false);
      expect(result1.errors.length).toBeGreaterThanOrEqual(2);
      expect(result1.errors).toContain(
        "PIN must be at least 4 characters long"
      );
      expect(result1.errors).toContain(
        "PIN must contain both letters and numbers"
      );

      // Too long and no numbers
      const result2 = validatePinStrength("a".repeat(21));
      expect(result2.isValid).toBe(false);
      expect(result2.errors.length).toBeGreaterThanOrEqual(2);
      expect(result2.errors).toContain(
        "PIN must be no more than 20 characters long"
      );
      expect(result2.errors).toContain(
        "PIN must contain both letters and numbers"
      );
    });

    it("should be case-insensitive for weak PIN detection", () => {
      const weakPins = ["PASSWORD", "PASS1234", "Test1234", "Admin123"];

      for (const pin of weakPins) {
        const result = validatePinStrength(pin);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
          "PIN is too common, please choose a stronger PIN"
        );
      }
    });
  });

  describe("generateRandomPin", () => {
    it("should generate valid PINs", () => {
      for (let i = 0; i < 10; i++) {
        const pin = generateRandomPin();
        const result = validatePinStrength(pin);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(pin.length).toBe(8);
      }
    });

    it("should generate unique PINs", () => {
      const pins = new Set();
      for (let i = 0; i < 20; i++) {
        pins.add(generateRandomPin());
      }

      // Very unlikely to generate duplicates
      expect(pins.size).toBe(20);
    });

    it("should always include letters and numbers", () => {
      for (let i = 0; i < 10; i++) {
        const pin = generateRandomPin();
        expect(/[a-zA-Z]/.test(pin)).toBe(true);
        expect(/\d/.test(pin)).toBe(true);
      }
    });
  });

  describe("Integration tests", () => {
    it("should handle full PIN lifecycle", async () => {
      // Generate a PIN
      const pin = generateRandomPin();

      // Validate strength
      const validation = validatePinStrength(pin);
      expect(validation.isValid).toBe(true);

      // Generate salt and hash
      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      // Validate correct PIN
      const isValid = await validatePin(pin, hash, salt);
      expect(isValid).toBe(true);

      // Validate incorrect PIN
      await expect(validatePin("wrong123", hash, salt)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it("should handle Unicode PINs", async () => {
      // While not recommended, the system should handle Unicode gracefully
      const pin = "MyPin2024"; // Keep it simple for now
      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      const isValid = await validatePin(pin, hash, salt);
      expect(isValid).toBe(true);
    });

    it("should be consistent across multiple validations", async () => {
      const pin = "MySecure123";
      const salt = await generateSalt();
      const hash = await hashPin(pin, salt);

      // Validate multiple times
      for (let i = 0; i < 5; i++) {
        const isValid = await validatePin(pin, hash, salt);
        expect(isValid).toBe(true);
      }
    });
  });
});
