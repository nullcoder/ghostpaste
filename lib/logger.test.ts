import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, createLogger, LogLevel } from "./logger";

// Mock the environment module to control test behavior
vi.mock("./environment", () => ({
  getCurrentEnvironment: vi.fn(() => "development"),
}));

describe("Logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("log levels in development", () => {
    it("should log debug messages", () => {
      logger.debug("Debug message", { data: "test" });

      expect(console.debug).toHaveBeenCalled();
      const call = (console.debug as any).mock.calls[0][0];
      expect(call).toContain("DEBUG");
      expect(call).toContain("Debug message");
      expect(call).toContain('"data":"test"');
    });

    it("should log info messages", () => {
      logger.info("Info message", { userId: 123 });

      expect(console.info).toHaveBeenCalled();
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toContain("INFO");
      expect(call).toContain("Info message");
      expect(call).toContain("123");
    });

    it("should log warning messages", () => {
      logger.warn("Warning message");

      expect(console.warn).toHaveBeenCalled();
      const call = (console.warn as any).mock.calls[0][0];
      expect(call).toContain("WARN");
      expect(call).toContain("Warning message");
    });

    it("should log error messages with error object", () => {
      const error = new Error("Test error");
      logger.error("Error occurred", error, { context: "test" });

      expect(console.error).toHaveBeenCalled();
      const call = (console.error as any).mock.calls[0][0];
      expect(call).toContain("ERROR");
      expect(call).toContain("Error occurred");
      expect(call).toContain("Test error");
      expect(call).toContain("test");
    });
  });

  describe("log levels in production", () => {
    beforeEach(async () => {
      // Change mock to return production
      const env = await vi.importMock("./environment");
      vi.mocked(env.getCurrentEnvironment).mockReturnValue("production");
    });

    afterEach(async () => {
      // Reset to development
      const env = await vi.importMock("./environment");
      vi.mocked(env.getCurrentEnvironment).mockReturnValue("development");
    });

    it("should skip debug and info in production logger", () => {
      // Create a new logger instance with production settings
      const prodLogger = new (logger.constructor as any)(LogLevel.INFO, true);

      prodLogger.debug("Debug message");
      expect(console.debug).not.toHaveBeenCalled();

      prodLogger.info("Info message");
      expect(console.info).not.toHaveBeenCalled();

      prodLogger.warn("Warning message");
      expect(console.warn).toHaveBeenCalled();

      prodLogger.error("Error message");
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe("child logger", () => {
    it("should create child logger with context", () => {
      const childLogger = createLogger("TestModule");

      childLogger.info("Child message");

      expect(console.info).toHaveBeenCalled();
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toContain("[TestModule]");
      expect(call).toContain("Child message");
    });

    it("should support nested child loggers", () => {
      const childLogger = createLogger("Parent");
      const grandchildLogger = childLogger.child("Child");

      grandchildLogger.warn("Nested message");

      expect(console.warn).toHaveBeenCalled();
      const call = (console.warn as any).mock.calls[0][0];
      expect(call).toContain("[Parent:Child]");
      expect(call).toContain("Nested message");
    });
  });

  describe("log formatting", () => {
    it("should include timestamp in ISO format", () => {
      logger.info("Test");

      const call = (console.info as any).mock.calls[0][0];
      const timestampMatch = call.match(/\[(.*?)\]/);
      expect(timestampMatch).toBeTruthy();

      const timestamp = timestampMatch[1];
      expect(() => new Date(timestamp)).not.toThrow();
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });

    it("should handle undefined data gracefully", () => {
      logger.info("Message without data");

      expect(console.info).toHaveBeenCalled();
      const call = (console.info as any).mock.calls[0][0];
      expect(call).not.toContain("undefined");
    });

    it("should stringify complex data objects", () => {
      const complexData = {
        nested: { value: 42 },
        array: [1, 2, 3],
      };

      logger.info("Complex data", complexData);

      const call = (console.info as any).mock.calls[0][0];
      expect(call).toContain(JSON.stringify(complexData));
    });

    it("should handle circular references", () => {
      const circular: any = { a: 1 };
      circular.self = circular;

      // JSON.stringify throws on circular references, so we expect it to throw
      expect(() => logger.info("Circular", circular)).toThrow();
    });
  });

  describe("log level filtering", () => {
    it("should respect minimum log level", () => {
      // Create logger that only logs WARN and above
      const warnLogger = new (logger.constructor as any)(LogLevel.WARN, false);

      vi.clearAllMocks();

      warnLogger.debug("Debug");
      warnLogger.info("Info");
      warnLogger.warn("Warn");
      warnLogger.error("Error");

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });
});
