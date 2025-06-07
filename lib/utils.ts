import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to human readable format
 * @param bytes Number of bytes
 * @param decimals Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.5 KB", "23 B")
 */
export function formatFileSize(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Count the number of lines in a string
 * @param text The text to count lines in
 * @returns Number of lines
 */
export function countLines(text: string): number {
  if (!text) return 0;
  return text.split("\n").length;
}

/**
 * Generate a slug from a filename for use as an anchor
 * @param filename The filename to convert to a slug
 * @returns URL-safe slug
 */
export function fileSlug(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
