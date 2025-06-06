import { describe, it, expect } from "vitest";
import {
  getFileExtension,
  detectLanguage,
  isSupportedLanguage,
  getLanguageLabel,
  generateDefaultFilename,
  validateFilename,
  formatFileSize,
  checkFileSize,
} from "./language-detection";

describe("getFileExtension", () => {
  it("extracts simple extensions", () => {
    expect(getFileExtension("test.js")).toBe("js");
    expect(getFileExtension("style.css")).toBe("css");
    expect(getFileExtension("data.json")).toBe("json");
  });

  it("handles multiple dots", () => {
    expect(getFileExtension("app.test.ts")).toBe("ts");
    expect(getFileExtension("style.module.css")).toBe("css");
  });

  it("handles special cases", () => {
    expect(getFileExtension("Dockerfile")).toBe("dockerfile");
    expect(getFileExtension("dockerfile")).toBe("dockerfile");
    expect(getFileExtension("Makefile")).toBe("makefile");
    expect(getFileExtension("makefile")).toBe("makefile");
  });

  it("returns empty string for no extension", () => {
    expect(getFileExtension("README")).toBe("");
    expect(getFileExtension("")).toBe("");
    expect(getFileExtension(".gitignore")).toBe("gitignore");
  });

  it("is case insensitive", () => {
    expect(getFileExtension("Test.JS")).toBe("js");
    expect(getFileExtension("STYLE.CSS")).toBe("css");
  });
});

describe("detectLanguage", () => {
  it("detects common languages", () => {
    expect(detectLanguage("script.js")).toBe("javascript");
    expect(detectLanguage("app.ts")).toBe("typescript");
    expect(detectLanguage("index.html")).toBe("html");
    expect(detectLanguage("style.css")).toBe("css");
    expect(detectLanguage("data.json")).toBe("json");
    expect(detectLanguage("script.py")).toBe("python");
    expect(detectLanguage("query.sql")).toBe("sql");
  });

  it("detects jsx and tsx", () => {
    expect(detectLanguage("Component.jsx")).toBe("javascript");
    expect(detectLanguage("Component.tsx")).toBe("typescript");
  });

  it("returns text for unknown extensions", () => {
    expect(detectLanguage("file.xyz")).toBe("text");
    expect(detectLanguage("unknown.abc")).toBe("text");
    expect(detectLanguage("noextension")).toBe("text");
  });

  it("handles special files", () => {
    expect(detectLanguage("Dockerfile")).toBe("dockerfile");
    expect(detectLanguage("Makefile")).toBe("makefile");
    expect(detectLanguage("nginx.conf")).toBe("text");
  });
});

describe("isSupportedLanguage", () => {
  it("returns true for supported languages", () => {
    expect(isSupportedLanguage("javascript")).toBe(true);
    expect(isSupportedLanguage("python")).toBe(true);
    expect(isSupportedLanguage("html")).toBe(true);
    expect(isSupportedLanguage("text")).toBe(true);
  });

  it("returns false for unsupported languages", () => {
    expect(isSupportedLanguage("cobol")).toBe(false);
    expect(isSupportedLanguage("fortran")).toBe(false);
    expect(isSupportedLanguage("")).toBe(false);
  });
});

describe("getLanguageLabel", () => {
  it("returns correct labels", () => {
    expect(getLanguageLabel("javascript")).toBe("JavaScript");
    expect(getLanguageLabel("typescript")).toBe("TypeScript");
    expect(getLanguageLabel("python")).toBe("Python");
    expect(getLanguageLabel("text")).toBe("Plain Text");
  });

  it("returns Plain Text for unknown languages", () => {
    expect(getLanguageLabel("unknown")).toBe("Plain Text");
    expect(getLanguageLabel("")).toBe("Plain Text");
  });
});

describe("generateDefaultFilename", () => {
  it("generates filenames with index", () => {
    expect(generateDefaultFilename(1)).toBe("file1.txt");
    expect(generateDefaultFilename(2)).toBe("file2.txt");
    expect(generateDefaultFilename(10)).toBe("file10.txt");
  });

  it("uses custom extension", () => {
    expect(generateDefaultFilename(1, "js")).toBe("file1.js");
    expect(generateDefaultFilename(2, "py")).toBe("file2.py");
  });
});

describe("validateFilename", () => {
  it("validates correct filenames", () => {
    expect(validateFilename("test.js")).toEqual({ valid: true });
    expect(validateFilename("my-file_123.txt")).toEqual({ valid: true });
    expect(validateFilename(".gitignore")).toEqual({ valid: true });
  });

  it("rejects empty filenames", () => {
    expect(validateFilename("")).toEqual({
      valid: false,
      error: "Filename is required",
    });
    expect(validateFilename("   ")).toEqual({
      valid: false,
      error: "Filename is required",
    });
  });

  it("rejects long filenames", () => {
    const longName = "a".repeat(256);
    expect(validateFilename(longName)).toEqual({
      valid: false,
      error: "Filename must be 255 characters or less",
    });
  });

  it("rejects invalid characters", () => {
    expect(validateFilename("file/name.txt")).toEqual({
      valid: false,
      error: "Filename contains invalid characters",
    });
    expect(validateFilename("file\\name.txt")).toEqual({
      valid: false,
      error: "Filename contains invalid characters",
    });
    expect(validateFilename("file:name.txt")).toEqual({
      valid: false,
      error: "Filename contains invalid characters",
    });
    expect(validateFilename("file*name.txt")).toEqual({
      valid: false,
      error: "Filename contains invalid characters",
    });
  });

  it("detects duplicate filenames", () => {
    const existing = ["test.js", "style.css", "index.html"];
    expect(validateFilename("new.js", existing)).toEqual({ valid: true });
    expect(validateFilename("test.js", existing)).toEqual({
      valid: false,
      error: "Filename already exists",
    });
    expect(validateFilename("TEST.JS", existing)).toEqual({
      valid: false,
      error: "Filename already exists",
    });
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(100)).toBe("100 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(10240)).toBe("10 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(1572864)).toBe("1.5 MB");
  });

  it("formats gigabytes", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB");
  });
});

describe("checkFileSize", () => {
  it("returns ok for small files", () => {
    expect(checkFileSize(1000)).toEqual({ status: "ok" });
    expect(checkFileSize(100000)).toEqual({ status: "ok" });
    expect(checkFileSize(400 * 1024 - 1)).toEqual({ status: "ok" });
  });

  it("returns warning for large files", () => {
    const result = checkFileSize(450 * 1024);
    expect(result.status).toBe("warning");
    expect(result.message).toContain("large and may affect performance");
  });

  it("returns error for files exceeding limit", () => {
    const result = checkFileSize(600 * 1024);
    expect(result.status).toBe("error");
    expect(result.message).toContain("exceeds 500KB limit");
  });

  it("handles edge cases", () => {
    expect(checkFileSize(400 * 1024)).toEqual({ status: "ok" });
    expect(checkFileSize(400 * 1024 + 1).status).toBe("warning");
    expect(checkFileSize(500 * 1024).status).toBe("warning");
    expect(checkFileSize(500 * 1024 + 1).status).toBe("error");
  });
});
