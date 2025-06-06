import { getCurrentEnvironment } from "./environment";

/**
 * Log levels for the logger
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log entry structure
 */
interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: unknown;
  error?: Error;
}

/**
 * Edge-compatible logger for Cloudflare Workers
 *
 * This logger is designed to work in edge runtime environments where
 * console methods might be restricted or need special handling.
 */
class Logger {
  private minLevel: LogLevel;
  private isProduction: boolean;

  constructor(minLevel: LogLevel = LogLevel.INFO, isProduction = false) {
    this.minLevel = minLevel;
    this.isProduction = isProduction;
  }

  /**
   * Formats a log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const parts = [`[${entry.timestamp}]`, `[${entry.level}]`, entry.message];

    if (entry.data !== undefined) {
      parts.push(JSON.stringify(entry.data));
    }

    if (entry.error) {
      parts.push(`\nError: ${entry.error.message}`);
      if (entry.error.stack) {
        parts.push(`\nStack: ${entry.error.stack}`);
      }
    }

    return parts.join(" ");
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    levelName: string,
    message: string,
    data?: unknown,
    error?: Error
  ): void {
    if (level < this.minLevel) {
      return;
    }

    // Skip logging in production for debug/info levels
    if (this.isProduction && level < LogLevel.WARN) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: levelName,
      message,
      data,
      error,
    };

    const formattedMessage = this.formatLogEntry(entry);

    // Use appropriate console method based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
  }

  /**
   * Log debug message
   * @param message - The message to log
   * @param data - Optional data to include
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, "DEBUG", message, data);
  }

  /**
   * Log info message
   * @param message - The message to log
   * @param data - Optional data to include
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, "INFO", message, data);
  }

  /**
   * Log warning message
   * @param message - The message to log
   * @param data - Optional data to include
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, "WARN", message, data);
  }

  /**
   * Log error message
   * @param message - The message to log
   * @param error - Optional error object
   * @param data - Optional additional data
   */
  error(message: string, error?: Error, data?: unknown): void {
    this.log(LogLevel.ERROR, "ERROR", message, data, error);
  }

  /**
   * Create a child logger with a specific context
   * @param context - Context to prepend to all messages
   */
  child(context: string): Logger {
    return {
      debug: (message: string, data?: unknown) => {
        this.debug(`[${context}] ${message}`, data);
      },
      info: (message: string, data?: unknown) => {
        this.info(`[${context}] ${message}`, data);
      },
      warn: (message: string, data?: unknown) => {
        this.warn(`[${context}] ${message}`, data);
      },
      error: (message: string, error?: Error, data?: unknown) => {
        this.error(`[${context}] ${message}`, error, data);
      },
      child: (childContext: string) => {
        return this.child(`${context}:${childContext}`);
      },
    } as Logger;
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger(
  getCurrentEnvironment() === "production" ? LogLevel.INFO : LogLevel.DEBUG,
  getCurrentEnvironment() === "production"
);

/**
 * Create a logger instance with a specific context
 * @param context - Context for the logger (e.g., module name)
 */
export function createLogger(context: string): Logger {
  return logger.child(context);
}
