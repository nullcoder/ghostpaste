import { describe, it, expect } from "vitest";
import { cn, formatFileSize, countLines, fileSlug } from "./utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("should handle conditional classes", () => {
    const result = cn("base", false && "hidden", undefined, null, "visible");
    expect(result).toBe("base visible");
  });

  it("should merge Tailwind classes properly", () => {
    const result = cn(
      "bg-red-500 hover:bg-red-600",
      "bg-blue-500 hover:bg-blue-600"
    );
    expect(result).toBe("bg-blue-500 hover:bg-blue-600");
  });

  it("should handle arrays", () => {
    const result = cn(["text-sm", "font-bold"], "text-lg");
    expect(result).toBe("font-bold text-lg");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn(undefined, null, false)).toBe("");
  });
});

describe("formatFileSize", () => {
  it("should format bytes correctly", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(100)).toBe("100 B");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(1572864)).toBe("1.5 MB");
    expect(formatFileSize(1073741824)).toBe("1 GB");
  });

  it("should handle decimal places", () => {
    expect(formatFileSize(1536, 0)).toBe("2 KB");
    expect(formatFileSize(1536, 1)).toBe("1.5 KB");
    expect(formatFileSize(1536, 2)).toBe("1.5 KB");
    expect(formatFileSize(1556, 2)).toBe("1.52 KB");
  });

  it("should handle negative decimal places", () => {
    expect(formatFileSize(1536, -1)).toBe("2 KB");
  });

  it("should handle very large files", () => {
    expect(formatFileSize(1099511627776)).toBe("1 TB");
  });
});

describe("countLines", () => {
  it("should count lines correctly", () => {
    expect(countLines("")).toBe(0);
    expect(countLines("single line")).toBe(1);
    expect(countLines("line 1\nline 2")).toBe(2);
    expect(countLines("line 1\nline 2\nline 3")).toBe(3);
    expect(countLines("line 1\n\nline 3")).toBe(3); // Empty line counts
  });

  it("should handle different line endings", () => {
    expect(countLines("line 1\nline 2")).toBe(2);
    expect(countLines("line 1\n")).toBe(2); // Trailing newline adds a line
  });
});

describe("fileSlug", () => {
  it("should generate valid slugs", () => {
    expect(fileSlug("test.js")).toBe("test-js");
    expect(fileSlug("My File.tsx")).toBe("my-file-tsx");
    expect(fileSlug("some_file-name.py")).toBe("some-file-name-py");
    expect(fileSlug("UPPERCASE.CSS")).toBe("uppercase-css");
  });

  it("should handle special characters", () => {
    expect(fileSlug("file@#$.js")).toBe("file-js");
    expect(fileSlug("my file (1).txt")).toBe("my-file-1-txt");
    expect(fileSlug("...dots...")).toBe("dots");
  });

  it("should handle edge cases", () => {
    expect(fileSlug("")).toBe("");
    expect(fileSlug("---")).toBe("");
    expect(fileSlug("a")).toBe("a");
  });
});
