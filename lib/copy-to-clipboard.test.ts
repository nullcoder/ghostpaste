import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  copyToClipboard,
  copyToClipboardWithRetry,
  isCopySupported,
  copyHelpers,
} from "./copy-to-clipboard";

// Mock console methods to avoid noise in tests
vi.spyOn(console, "warn").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset DOM
    document.body.innerHTML = "";

    // Mock window.isSecureContext
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("input validation", () => {
    it("should reject non-string input", async () => {
      const result = await copyToClipboard(123 as any);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid input: text must be a string");
    });

    it("should reject empty string", async () => {
      const result = await copyToClipboard("");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot copy empty text");
    });

    it("should accept valid string input", async () => {
      // Mock successful clipboard API
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: { writeText: mockWriteText },
      });

      const result = await copyToClipboard("test text");
      expect(result.success).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith("test text");
    });
  });

  describe("modern clipboard API", () => {
    it("should use navigator.clipboard.writeText when available", async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: { writeText: mockWriteText },
      });

      const result = await copyToClipboard("test content");

      expect(result.success).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith("test content");
    });

    it("should handle clipboard API errors and fallback", async () => {
      const mockWriteText = vi
        .fn()
        .mockRejectedValue(new Error("Clipboard API failed"));
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: { writeText: mockWriteText },
      });

      // Mock successful execCommand fallback
      const mockExecCommand = vi.fn().mockReturnValue(true);
      Object.defineProperty(document, "execCommand", {
        writable: true,
        value: mockExecCommand,
      });

      const result = await copyToClipboard("test content");

      expect(result.success).toBe(true);
      expect(mockWriteText).toHaveBeenCalled();
      expect(mockExecCommand).toHaveBeenCalledWith("copy");
    });

    it("should fallback when not in secure context", async () => {
      Object.defineProperty(window, "isSecureContext", {
        writable: true,
        value: false,
      });

      const mockWriteText = vi.fn();
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: { writeText: mockWriteText },
      });

      const mockExecCommand = vi.fn().mockReturnValue(true);
      Object.defineProperty(document, "execCommand", {
        writable: true,
        value: mockExecCommand,
      });

      const result = await copyToClipboard("test content");

      expect(result.success).toBe(true);
      expect(mockWriteText).not.toHaveBeenCalled();
      expect(mockExecCommand).toHaveBeenCalledWith("copy");
    });
  });

  describe("fallback method", () => {
    beforeEach(() => {
      // Disable modern clipboard API
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: undefined,
      });
    });

    it("should use execCommand fallback when clipboard API unavailable", async () => {
      const mockExecCommand = vi.fn().mockReturnValue(true);
      Object.defineProperty(document, "execCommand", {
        writable: true,
        value: mockExecCommand,
      });

      const result = await copyToClipboard("fallback test");

      expect(result.success).toBe(true);
      expect(mockExecCommand).toHaveBeenCalledWith("copy");
    });

    it("should create and remove textarea element during fallback", async () => {
      const mockExecCommand = vi.fn().mockReturnValue(true);
      Object.defineProperty(document, "execCommand", {
        writable: true,
        value: mockExecCommand,
      });

      const initialChildCount = document.body.children.length;

      await copyToClipboard("textarea test");

      // Textarea should be removed after copy
      expect(document.body.children.length).toBe(initialChildCount);
    });

    it("should handle execCommand failure", async () => {
      const mockExecCommand = vi.fn().mockReturnValue(false);
      Object.defineProperty(document, "execCommand", {
        writable: true,
        value: mockExecCommand,
      });

      const result = await copyToClipboard("failing test");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Copy command failed");
    });

    it("should handle execCommand exceptions", async () => {
      const mockExecCommand = vi.fn().mockImplementation(() => {
        throw new Error("DOM exception");
      });
      Object.defineProperty(document, "execCommand", {
        writable: true,
        value: mockExecCommand,
      });

      const result = await copyToClipboard("exception test");

      expect(result.success).toBe(false);
      expect(result.error).toBe("DOM exception");
    });
  });

  describe("edge cases", () => {
    it("should handle very long text", async () => {
      const longText = "a".repeat(10000);

      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: { writeText: mockWriteText },
      });

      const result = await copyToClipboard(longText);

      expect(result.success).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(longText);
    });

    it("should handle text with special characters", async () => {
      const specialText = "特殊文字 🚀 \n\t\"quotes\" 'single' <tags>";

      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", {
        writable: true,
        value: { writeText: mockWriteText },
      });

      const result = await copyToClipboard(specialText);

      expect(result.success).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(specialText);
    });
  });
});

describe("copyToClipboardWithRetry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should succeed on first attempt when copy works", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: mockWriteText },
    });

    const result = await copyToClipboardWithRetry("test");

    expect(result.success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and eventually succeed", async () => {
    const mockWriteText = vi
      .fn()
      .mockRejectedValueOnce(new Error("First attempt failed"))
      .mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: mockWriteText },
    });

    // Mock execCommand to fail as well for first attempt
    const mockExecCommand = vi
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      writable: true,
      value: mockExecCommand,
    });

    const result = await copyToClipboardWithRetry("retry test", 2);

    expect(result.success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledTimes(2);
  });

  it("should fail after max retries exceeded", async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error("Always fails"));
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: mockWriteText },
    });

    const mockExecCommand = vi.fn().mockReturnValue(false);
    Object.defineProperty(document, "execCommand", {
      writable: true,
      value: mockExecCommand,
    });

    const result = await copyToClipboardWithRetry("fail test", 1);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed after 2 attempts");
    expect(mockWriteText).toHaveBeenCalledTimes(2);
  });

  it("should use default retry count of 2", async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error("Always fails"));
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: mockWriteText },
    });

    const mockExecCommand = vi.fn().mockReturnValue(false);
    Object.defineProperty(document, "execCommand", {
      writable: true,
      value: mockExecCommand,
    });

    const result = await copyToClipboardWithRetry("default retry test");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Failed after 3 attempts");
    expect(mockWriteText).toHaveBeenCalledTimes(3);
  });
});

describe("isCopySupported", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true when modern clipboard API is available", () => {
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: vi.fn() },
    });
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: true,
    });

    expect(isCopySupported()).toBe(true);
  });

  it("should return false when not in secure context", () => {
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: vi.fn() },
    });
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: false,
    });

    const mockQueryCommandSupported = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "queryCommandSupported", {
      writable: true,
      value: mockQueryCommandSupported,
    });

    expect(isCopySupported()).toBe(true);
  });

  it("should return true when execCommand is supported", () => {
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: undefined,
    });

    const mockQueryCommandSupported = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "queryCommandSupported", {
      writable: true,
      value: mockQueryCommandSupported,
    });

    expect(isCopySupported()).toBe(true);
    expect(mockQueryCommandSupported).toHaveBeenCalledWith("copy");
  });

  it("should return false when no copy support is available", () => {
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: undefined,
    });

    const mockQueryCommandSupported = vi.fn().mockReturnValue(false);
    Object.defineProperty(document, "queryCommandSupported", {
      writable: true,
      value: mockQueryCommandSupported,
    });

    expect(isCopySupported()).toBe(false);
  });

  it("should handle queryCommandSupported exceptions", () => {
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: false,
    });

    // Make queryCommandSupported throw
    Object.defineProperty(document, "queryCommandSupported", {
      writable: true,
      value: () => {
        throw new Error("queryCommandSupported not supported");
      },
    });

    expect(isCopySupported()).toBe(false);
  });
});

describe("copyHelpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        origin: "https://ghostpaste.dev",
      },
    });

    // Mock secure context
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: true,
    });

    // Mock successful clipboard
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: mockWriteText },
    });
  });

  describe("copyGistUrl", () => {
    it("should copy gist URL without key", async () => {
      const result = await copyHelpers.copyGistUrl("abc123");

      expect(result.success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "https://ghostpaste.dev/g/abc123"
      );
    });

    it("should copy gist URL with encryption key", async () => {
      const result = await copyHelpers.copyGistUrl("abc123", "secretkey");

      expect(result.success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "https://ghostpaste.dev/g/abc123#key=secretkey"
      );
    });
  });

  describe("copyFileContent", () => {
    it("should copy content without filename", async () => {
      const content = 'console.log("hello world");';
      const result = await copyHelpers.copyFileContent(content);

      expect(result.success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(content);
    });

    it("should copy content with filename comment", async () => {
      const content = 'console.log("hello world");';
      const result = await copyHelpers.copyFileContent(content, "app.js");

      expect(result.success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '// app.js\nconsole.log("hello world");'
      );
    });
  });

  describe("copyMultipleFiles", () => {
    it("should copy multiple files with separators", async () => {
      const files = [
        { name: "index.js", content: 'console.log("index");' },
        { name: "utils.js", content: "export const util = () => {};" },
      ];

      const result = await copyHelpers.copyMultipleFiles(files);

      expect(result.success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '// index.js\nconsole.log("index");\n\n---\n\n// utils.js\nexport const util = () => {};'
      );
    });

    it("should handle empty files array", async () => {
      const result = await copyHelpers.copyMultipleFiles([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cannot copy empty text");
    });

    it("should handle single file", async () => {
      const files = [{ name: "single.js", content: "const x = 1;" }];
      const result = await copyHelpers.copyMultipleFiles(files);

      expect(result.success).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "// single.js\nconst x = 1;"
      );
    });
  });
});

describe("integration scenarios", () => {
  it("should handle typical ShareDialog usage", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: mockWriteText },
    });
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: true,
    });

    const gistUrl = "https://ghostpaste.dev/g/abc123#key=secret";
    const result = await copyToClipboard(gistUrl);

    expect(result.success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith(gistUrl);
  });

  it("should handle typical GistViewer file copy usage", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      writable: true,
      value: { writeText: mockWriteText },
    });
    Object.defineProperty(window, "isSecureContext", {
      writable: true,
      value: true,
    });

    const fileContent = 'function example() {\n  return "Hello World";\n}';
    const result = await copyHelpers.copyFileContent(fileContent, "example.js");

    expect(result.success).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith(
      '// example.js\nfunction example() {\n  return "Hello World";\n}'
    );
  });
});
