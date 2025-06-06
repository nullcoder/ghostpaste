import { describe, it, expect } from "vitest";
import {
  sanitizeString,
  sanitizeHtml,
  validateFilename,
  validateGistId,
  validatePin,
  validateFileSize,
  validateGistSize,
  validateFileCount,
  validateISODate,
  validateExpiry,
  validateUrl,
  validateJson,
  validateContentType,
} from "./validation";
import {
  BadRequestError,
  PayloadTooLargeError,
  TooManyFilesError,
} from "./errors";
import { FILE_LIMITS, GIST_LIMITS } from "./constants";

describe("Validation utilities", () => {
  describe("sanitizeString", () => {
    it("should trim and limit string length", () => {
      expect(sanitizeString("  hello  ", 5)).toBe("hello");
      expect(sanitizeString("verylongstring", 5)).toBe("veryl");
    });

    it("should remove null bytes and control characters", () => {
      expect(sanitizeString("hello\0world")).toBe("helloworld");
      expect(sanitizeString("hello\x01\x02world")).toBe("helloworld");
      expect(sanitizeString("hello\nworld")).toBe("hello\nworld"); // Keep newlines
      expect(sanitizeString("hello\tworld")).toBe("hello\tworld"); // Keep tabs
    });

    it("should handle non-string inputs", () => {
      expect(sanitizeString(null as any)).toBe("");
      expect(sanitizeString(undefined as any)).toBe("");
      expect(sanitizeString(123 as any)).toBe("");
    });
  });

  describe("sanitizeHtml", () => {
    it("should escape HTML entities", () => {
      expect(sanitizeHtml("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;"
      );
      expect(sanitizeHtml("\"hello\" & 'world'")).toBe(
        "&quot;hello&quot; &amp; &#x27;world&#x27;"
      );
    });

    it("should handle non-string inputs", () => {
      expect(sanitizeHtml(null as any)).toBe("");
      expect(sanitizeHtml(undefined as any)).toBe("");
    });
  });

  describe("validateFilename", () => {
    it("should sanitize dangerous characters", () => {
      expect(validateFilename("file/name.txt")).toBe("file_name.txt");
      expect(validateFilename("file\\name.txt")).toBe("file_name.txt");
      expect(validateFilename("file:name.txt")).toBe("file_name.txt");
      expect(validateFilename("file*name?.txt")).toBe("file_name_.txt");
    });

    it("should handle dots", () => {
      expect(validateFilename("file..name.txt")).toBe("file_name.txt");
      expect(validateFilename("...")).toBe("_");
    });

    it("should reject invalid filenames", () => {
      expect(() => validateFilename("")).toThrow(BadRequestError);
      expect(() => validateFilename(null as any)).toThrow(BadRequestError);
      // "." is allowed, ".." gets transformed to "_"
      expect(validateFilename(".")).toBe(".");
      expect(validateFilename("..")).toBe("_");
    });

    it("should limit filename length", () => {
      const longName = "a".repeat(300);
      expect(validateFilename(longName).length).toBe(255);
    });
  });

  describe("validateGistId", () => {
    it("should accept valid gist IDs", () => {
      expect(validateGistId("abc123def")).toBe("abc123def");
      expect(validateGistId("ABC-123_def")).toBe("ABC-123_def");
    });

    it("should remove invalid characters", () => {
      expect(validateGistId("abc!@#123def")).toBe("abc123def");
      expect(validateGistId("abc 123 def")).toBe("abc123def");
    });

    it("should reject invalid lengths", () => {
      expect(() => validateGistId("abc")).toThrow(BadRequestError);
      expect(() => validateGistId("a".repeat(40))).toThrow(BadRequestError);
    });

    it("should reject non-string inputs", () => {
      expect(() => validateGistId(null as any)).toThrow(BadRequestError);
      expect(() => validateGistId(123 as any)).toThrow(BadRequestError);
    });
  });

  describe("validatePin", () => {
    it("should accept valid PINs", () => {
      expect(validatePin("pass123")).toBe("pass123");
      expect(validatePin("MyP@ssw0rd!")).toBe("MyP@ssw0rd!");
      expect(validatePin("test1234")).toBe("test1234");
    });

    it("should reject too short or too long PINs", () => {
      expect(() => validatePin("ab1")).toThrow("PIN must be 4-20 characters");
      expect(() => validatePin("a1".repeat(15))).toThrow(
        "PIN must be 4-20 characters"
      );
    });

    it("should reject invalid characters", () => {
      expect(() => validatePin("test 123")).toThrow(
        "PIN contains invalid characters"
      );
      expect(() => validatePin("test\n123")).toThrow(
        "PIN contains invalid characters"
      );
    });

    it("should require both letters and numbers", () => {
      expect(() => validatePin("abcdef")).toThrow(
        "PIN must contain at least one letter and one number"
      );
      expect(() => validatePin("123456")).toThrow(
        "PIN must contain at least one letter and one number"
      );
    });

    it("should reject non-string inputs", () => {
      expect(() => validatePin(null as any)).toThrow(BadRequestError);
      expect(() => validatePin(123 as any)).toThrow(BadRequestError);
    });
  });

  describe("validateFileSize", () => {
    it("should accept valid file sizes", () => {
      expect(() => validateFileSize(0)).not.toThrow();
      expect(() => validateFileSize(1000)).not.toThrow();
      expect(() => validateFileSize(FILE_LIMITS.MAX_FILE_SIZE)).not.toThrow();
    });

    it("should reject invalid sizes", () => {
      expect(() => validateFileSize(-1)).toThrow(BadRequestError);
      expect(() => validateFileSize(null as any)).toThrow(BadRequestError);
      expect(() => validateFileSize("1000" as any)).toThrow(BadRequestError);
    });

    it("should reject files too large", () => {
      expect(() => validateFileSize(FILE_LIMITS.MAX_FILE_SIZE + 1)).toThrow(
        PayloadTooLargeError
      );
    });
  });

  describe("validateGistSize", () => {
    it("should accept valid gist sizes", () => {
      expect(() => validateGistSize(0)).not.toThrow();
      expect(() => validateGistSize(FILE_LIMITS.MAX_TOTAL_SIZE)).not.toThrow();
    });

    it("should reject gists too large", () => {
      expect(() => validateGistSize(FILE_LIMITS.MAX_TOTAL_SIZE + 1)).toThrow(
        PayloadTooLargeError
      );
    });
  });

  describe("validateFileCount", () => {
    it("should accept valid file counts", () => {
      expect(() => validateFileCount(0)).not.toThrow();
      expect(() => validateFileCount(FILE_LIMITS.MAX_FILE_COUNT)).not.toThrow();
    });

    it("should reject too many files", () => {
      expect(() => validateFileCount(FILE_LIMITS.MAX_FILE_COUNT + 1)).toThrow(
        TooManyFilesError
      );
    });
  });

  describe("validateISODate", () => {
    it("should accept valid ISO 8601 dates", () => {
      expect(validateISODate("2024-01-01T00:00:00.000Z")).toBe(
        "2024-01-01T00:00:00.000Z"
      );
      expect(validateISODate("2024-01-01T00:00:00Z")).toBe(
        "2024-01-01T00:00:00Z"
      );
    });

    it("should reject invalid formats", () => {
      expect(() => validateISODate("2024-01-01")).toThrow(
        "Date must be in ISO 8601 format"
      );
      expect(() => validateISODate("01/01/2024")).toThrow(
        "Date must be in ISO 8601 format"
      );
      expect(() => validateISODate("invalid")).toThrow(
        "Date must be in ISO 8601 format"
      );
    });

    it("should reject invalid dates", () => {
      expect(() => validateISODate("2024-13-01T00:00:00Z")).toThrow(
        "Invalid date"
      );
      expect(() => validateISODate("2024-01-32T00:00:00Z")).toThrow(
        "Invalid date"
      );
    });

    it("should reject non-string inputs", () => {
      expect(() => validateISODate(null as any)).toThrow(
        "Date string is required"
      );
      expect(() => validateISODate(new Date() as any)).toThrow(
        "Date string is required"
      );
    });
  });

  describe("validateExpiry", () => {
    it("should accept valid future dates", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = validateExpiry(tomorrow);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should accept ISO date strings", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const result = validateExpiry(futureDate.toISOString());
      expect(result).toBe(futureDate.toISOString());
    });

    it("should reject past dates", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(() => validateExpiry(yesterday)).toThrow(
        "Expiry date must be in the future"
      );
    });

    it("should reject dates too far in future", () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + GIST_LIMITS.MAX_EXPIRY_DAYS + 1);

      expect(() => validateExpiry(farFuture)).toThrow("cannot be more than");
    });
  });

  describe("validateUrl", () => {
    it("should accept valid URLs", () => {
      const url1 = validateUrl("https://example.com");
      expect(url1.href).toBe("https://example.com/");

      const url2 = validateUrl("http://localhost:3000/path");
      expect(url2.href).toBe("http://localhost:3000/path");
    });

    it("should reject invalid protocols", () => {
      expect(() => validateUrl("ftp://example.com")).toThrow(
        "Invalid URL protocol"
      );
      expect(() => validateUrl("javascript:alert('xss')")).toThrow(
        "Invalid URL protocol"
      );
    });

    it("should reject invalid URLs", () => {
      expect(() => validateUrl("not a url")).toThrow("Invalid URL format");
      expect(() => validateUrl("")).toThrow("URL is required");
      expect(() => validateUrl(null as any)).toThrow("URL is required");
    });
  });

  describe("validateJson", () => {
    it("should accept valid JSON structures", () => {
      expect(validateJson({ a: 1, b: "test" })).toEqual({ a: 1, b: "test" });
      expect(validateJson([1, 2, 3])).toEqual([1, 2, 3]);
      expect(validateJson("string")).toBe("string");
      expect(validateJson(123)).toBe(123);
      expect(validateJson(null)).toBe(null);
    });

    it("should reject deeply nested structures", () => {
      const createNested = (depth: number): any => {
        if (depth === 0) return "value";
        return { nested: createNested(depth - 1) };
      };

      expect(() => validateJson(createNested(5), 5)).not.toThrow();
      expect(() => validateJson(createNested(6), 5)).toThrow(
        "JSON structure too deeply nested"
      );
    });
  });

  describe("validateContentType", () => {
    it("should accept allowed content types", () => {
      const allowed = ["application/json", "text/plain"];

      expect(validateContentType("application/json", allowed)).toBe(
        "application/json"
      );
      expect(validateContentType("text/plain", allowed)).toBe("text/plain");
      expect(validateContentType("APPLICATION/JSON", allowed)).toBe(
        "application/json"
      );
      expect(validateContentType("text/plain; charset=utf-8", allowed)).toBe(
        "text/plain"
      );
    });

    it("should reject disallowed content types", () => {
      const allowed = ["application/json"];

      expect(() => validateContentType("text/html", allowed)).toThrow(
        "Invalid content type"
      );
      expect(() => validateContentType("", allowed)).toThrow(
        "Content type is required"
      );
      expect(() => validateContentType(null as any, allowed)).toThrow(
        "Content type is required"
      );
    });
  });
});
