/**
 * Core utilities for GhostPaste
 *
 * This module exports all utility functions used throughout the application
 */

// Environment detection
export * from "../environment";

// Logging
export { logger, createLogger, LogLevel } from "../logger";

// Error handling
export * from "../errors";

// Validation
export * from "../validation";

// ID generation
export * from "../id";

// Class name utilities (from shadcn/ui)
export { cn } from "../utils";
