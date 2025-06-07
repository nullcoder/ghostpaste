/**
 * Copy to clipboard utility functions for GhostPaste
 *
 * Provides consistent copy functionality with fallback support
 * for older browsers and error handling.
 */

export interface CopyResult {
  success: boolean;
  error?: string;
}

/**
 * Copy text to clipboard using modern Clipboard API with fallback
 *
 * @param text - Text to copy to clipboard
 * @returns Promise<CopyResult> - Result object with success status and optional error
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  // Validate input
  if (typeof text !== "string") {
    return {
      success: false,
      error: "Invalid input: text must be a string",
    };
  }

  if (text.length === 0) {
    return {
      success: false,
      error: "Cannot copy empty text",
    };
  }

  // Check if we're in a secure context and clipboard API is available
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch {
      // Fall back to legacy method if clipboard API fails
      return await copyToClipboardFallback(text);
    }
  }

  // Use fallback method for non-secure contexts or older browsers
  return await copyToClipboardFallback(text);
}

/**
 * Fallback copy method using document.execCommand for older browsers
 *
 * @param text - Text to copy to clipboard
 * @returns Promise<CopyResult> - Result object with success status and optional error
 */
async function copyToClipboardFallback(text: string): Promise<CopyResult> {
  try {
    // Create a temporary textarea element
    const textarea = document.createElement("textarea");
    textarea.value = text;

    // Make textarea invisible but not display: none (which would prevent selection)
    textarea.style.position = "fixed";
    textarea.style.left = "-999999px";
    textarea.style.top = "-999999px";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";

    // Add to DOM, select, copy, and remove
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const successful = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (successful) {
      return { success: true };
    } else {
      return {
        success: false,
        error: "Copy command failed",
      };
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Copy text to clipboard with automatic retry logic
 *
 * @param text - Text to copy to clipboard
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @returns Promise<CopyResult> - Result object with success status and optional error
 */
export async function copyToClipboardWithRetry(
  text: string,
  maxRetries: number = 2
): Promise<CopyResult> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await copyToClipboard(text);

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // Add small delay between retries
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return {
    success: false,
    error: `Failed after ${maxRetries + 1} attempts. Last error: ${lastError}`,
  };
}

/**
 * Check if copy to clipboard is supported in the current environment
 *
 * @returns boolean - True if copy functionality is available
 */
export function isCopySupported(): boolean {
  // Check for modern clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    return true;
  }

  // Check for legacy document.execCommand support
  try {
    return (
      document.queryCommandSupported && document.queryCommandSupported("copy")
    );
  } catch {
    return false;
  }
}

/**
 * Copy specific content types commonly used in GhostPaste
 */
export const copyHelpers = {
  /**
   * Copy a complete gist URL with fragment
   */
  async copyGistUrl(gistId: string, key?: string): Promise<CopyResult> {
    const baseUrl = `${window.location.origin}/g/${gistId}`;
    const url = key ? `${baseUrl}#key=${key}` : baseUrl;
    return copyToClipboard(url);
  },

  /**
   * Copy file content with optional filename as comment
   */
  async copyFileContent(
    content: string,
    filename?: string
  ): Promise<CopyResult> {
    const textToCopy = filename ? `// ${filename}\n${content}` : content;
    return copyToClipboard(textToCopy);
  },

  /**
   * Copy multiple files as a combined string
   */
  async copyMultipleFiles(
    files: Array<{ name: string; content: string }>
  ): Promise<CopyResult> {
    const combined = files
      .map((file) => `// ${file.name}\n${file.content}`)
      .join("\n\n---\n\n");
    return copyToClipboard(combined);
  },
};
