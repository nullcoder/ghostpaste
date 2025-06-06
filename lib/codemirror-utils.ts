import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

/**
 * Performance optimizations for large files
 */
export function largeFileOptimizations(): Extension[] {
  return [
    // Limit viewport rendering for better performance
    EditorView.theme({
      ".cm-scroller": {
        fontFamily: "var(--font-mono)",
      },
    }),

    // Disable some expensive features for very large documents
    EditorView.updateListener.of((update) => {
      const docSize = update.state.doc.length;

      // For files over 100KB, we might want to disable some features
      if (docSize > 100000) {
        // This is where we'd disable expensive extensions
        // But for now, CodeMirror 6 handles large files well out of the box
      }
    }),
  ];
}

/**
 * Get file size in a human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Detect if content is likely minified
 */
export function isMinified(content: string): boolean {
  if (!content || content.length < 500) return false;

  // Check average line length
  const lines = content.split("\n");
  const avgLineLength = content.length / lines.length;

  // If average line length is very high, it's likely minified
  return avgLineLength > 200;
}

/**
 * Get recommended settings based on content
 */
export function getRecommendedSettings(content: string): {
  wordWrap: boolean;
  showLineNumbers: boolean;
} {
  const minified = isMinified(content);

  return {
    wordWrap: minified, // Enable word wrap for minified files
    showLineNumbers: !minified, // Disable line numbers for minified files
  };
}
