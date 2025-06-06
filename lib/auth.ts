/**
 * PIN authentication utilities using PBKDF2-SHA256
 *
 * This module provides secure PIN hashing and validation for edit protection,
 * using industry-standard PBKDF2 with SHA-256 for key derivation.
 *
 * Security properties:
 * - PBKDF2 with 100,000 iterations (NIST SP 800-132 recommendation)
 * - SHA-256 hash function (collision resistant)
 * - 128-bit random salts (prevents rainbow tables)
 * - Constant-time comparison (prevents timing attacks)
 * - PIN complexity requirements (letters + numbers)
 *
 * @module auth
 * @see {@link https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf}
 */

import { BadRequestError, UnauthorizedError } from "./errors";
import { logger } from "./logger";
import { base64Encode, base64Decode } from "./base64";

/**
 * Configuration for PBKDF2 hashing
 */
const PBKDF2_CONFIG = {
  algorithm: "PBKDF2",
  hash: "SHA-256",
  iterations: 100_000,
  keyLength: 32, // 256 bits
} as const;

/**
 * PIN validation requirements
 */
const PIN_REQUIREMENTS = {
  minLength: 4,
  maxLength: 20,
  requireLetters: true,
  requireNumbers: true,
  // Pattern to check for at least one letter and one number
  pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
} as const;

/**
 * Salt configuration
 */
const SALT_LENGTH = 16; // 16 bytes = 128 bits

/**
 * Generate a cryptographically secure random salt
 *
 * @returns Base64-encoded salt string
 */
export async function generateSalt(): Promise<string> {
  try {
    const saltBuffer = new Uint8Array(SALT_LENGTH);
    crypto.getRandomValues(saltBuffer);

    // Convert to base64 for storage
    const salt = base64Encode(saltBuffer);

    logger.debug("Generated salt for PIN hashing", {
      saltLength: SALT_LENGTH,
      encodedLength: salt.length,
    });

    return salt;
  } catch (error) {
    logger.error("Failed to generate salt", error as Error);
    throw new Error("Failed to generate salt for PIN hashing");
  }
}

/**
 * Hash a PIN using PBKDF2-SHA256
 *
 * @param pin - The PIN to hash
 * @param salt - Base64-encoded salt
 * @returns Base64-encoded hash string
 * @throws {BadRequestError} If PIN is invalid
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  // Validate PIN strength first
  const validation = validatePinStrength(pin);
  if (!validation.isValid) {
    throw new BadRequestError(`Invalid PIN: ${validation.errors.join(", ")}`);
  }

  try {
    // Convert PIN to buffer
    const encoder = new TextEncoder();
    const pinBuffer = encoder.encode(pin);

    // Decode salt from base64
    const saltBuffer = base64Decode(salt);

    // Import PIN as key material
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      pinBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    // Derive key using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: PBKDF2_CONFIG.algorithm,
        salt: saltBuffer,
        iterations: PBKDF2_CONFIG.iterations,
        hash: PBKDF2_CONFIG.hash,
      },
      keyMaterial,
      PBKDF2_CONFIG.keyLength * 8 // bits
    );

    // Convert to base64 for storage
    const hashArray = new Uint8Array(derivedBits);
    const hash = base64Encode(hashArray);

    logger.debug("Successfully hashed PIN", {
      iterations: PBKDF2_CONFIG.iterations,
      keyLength: PBKDF2_CONFIG.keyLength,
    });

    return hash;
  } catch (error) {
    logger.error("Failed to hash PIN", error as Error);
    throw new Error("Failed to hash PIN");
  }
}

/**
 * Validate a PIN against a stored hash
 *
 * Uses constant-time comparison to prevent timing attacks
 *
 * @param pin - The PIN to validate
 * @param storedHash - Base64-encoded stored hash
 * @param salt - Base64-encoded salt used for hashing
 * @returns True if PIN is valid
 * @throws {UnauthorizedError} If PIN is invalid
 */
export async function validatePin(
  pin: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  try {
    // Hash the provided PIN with the same salt
    const computedHash = await hashPin(pin, salt);

    // Constant-time comparison to prevent timing attacks
    const storedBytes = base64Decode(storedHash);
    const computedBytes = base64Decode(computedHash);

    // Ensure both are the same length
    if (storedBytes.length !== computedBytes.length) {
      throw new UnauthorizedError("Invalid PIN");
    }

    // XOR all bytes and accumulate differences
    let difference = 0;
    for (let i = 0; i < storedBytes.length; i++) {
      difference |= storedBytes[i] ^ computedBytes[i];
    }

    // If difference is 0, hashes match
    if (difference !== 0) {
      logger.warn("PIN validation failed", {
        attempt: "invalid_pin",
      });
      throw new UnauthorizedError("Invalid PIN");
    }

    logger.debug("PIN validation successful");
    return true;
  } catch (error) {
    // Re-throw UnauthorizedError as-is
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    // Log and throw generic error for other failures
    logger.error("Error during PIN validation", error as Error);
    throw new UnauthorizedError("PIN validation failed");
  }
}

/**
 * PIN strength validation result
 */
export interface PinValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate PIN strength requirements
 *
 * Requirements:
 * - 4-20 characters long
 * - Must contain at least one letter
 * - Must contain at least one number
 *
 * @param pin - The PIN to validate
 * @returns Validation result with any errors
 */
export function validatePinStrength(pin: string): PinValidationResult {
  const errors: string[] = [];

  // Check if PIN is provided
  if (!pin || typeof pin !== "string") {
    return {
      isValid: false,
      errors: ["PIN is required"],
    };
  }

  // Check length
  if (pin.length < PIN_REQUIREMENTS.minLength) {
    errors.push(
      `PIN must be at least ${PIN_REQUIREMENTS.minLength} characters long`
    );
  }

  if (pin.length > PIN_REQUIREMENTS.maxLength) {
    errors.push(
      `PIN must be no more than ${PIN_REQUIREMENTS.maxLength} characters long`
    );
  }

  // Check pattern (letters and numbers)
  if (!PIN_REQUIREMENTS.pattern.test(pin)) {
    errors.push("PIN must contain both letters and numbers");
  }

  // Additional checks for common weak PINs
  const weakPins = [
    "1234",
    "0000",
    "1111",
    "2222",
    "3333",
    "4444",
    "5555",
    "6666",
    "7777",
    "8888",
    "9999",
    "password",
    "pass1234",
    "1234pass",
    "test1234",
    "admin123",
  ];

  if (weakPins.includes(pin.toLowerCase())) {
    errors.push("PIN is too common, please choose a stronger PIN");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure random PIN for testing or suggestions
 *
 * @returns A random PIN that meets all requirements
 */
export function generateRandomPin(): string {
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const all = letters + numbers;

  // Ensure at least one letter and one number
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];

  // Generate remaining characters
  const remainingLength = 8 - 2; // 8 characters total, minus the guaranteed letter and number
  let remaining = "";
  for (let i = 0; i < remainingLength; i++) {
    remaining += all[Math.floor(Math.random() * all.length)];
  }

  // Combine and shuffle
  const pinArray = (randomLetter + randomNumber + remaining).split("");
  for (let i = pinArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pinArray[i], pinArray[j]] = [pinArray[j], pinArray[i]];
  }

  return pinArray.join("");
}
