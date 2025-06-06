/**
 * Language detection utilities for file extensions
 */

/**
 * Map of file extensions to language identifiers
 * These should match the language modes available in CodeMirror
 */
export const LANGUAGE_MAP: Record<string, string> = {
  // JavaScript variants
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",

  // Web languages
  html: "html",
  htm: "html",
  xml: "xml",
  svg: "xml",
  css: "css",
  scss: "css",
  sass: "css",
  less: "css",

  // Data formats
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",

  // Programming languages
  py: "python",
  rb: "ruby",
  go: "go",
  rs: "rust",
  java: "java",
  c: "c",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  h: "c",
  hpp: "cpp",
  cs: "csharp",
  php: "php",
  swift: "swift",
  kt: "kotlin",
  scala: "scala",
  r: "r",
  lua: "lua",
  dart: "dart",

  // Shell scripts
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  fish: "shell",
  ps1: "powershell",
  bat: "batch",
  cmd: "batch",

  // Config files
  dockerfile: "dockerfile",
  makefile: "makefile",
  mk: "makefile",
  nginx: "nginx",
  conf: "text",
  ini: "ini",
  cfg: "ini",

  // Documentation
  md: "markdown",
  markdown: "markdown",
  mdx: "markdown",
  rst: "restructuredtext",
  tex: "latex",

  // Database
  sql: "sql",
  mysql: "sql",
  pgsql: "sql",
  sqlite: "sql",

  // Other
  vim: "vim",
  diff: "diff",
  patch: "diff",
  log: "text",
  txt: "text",
} as const;

/**
 * List of supported languages for the dropdown
 * This should match the languages available in CodeEditor
 */
export const SUPPORTED_LANGUAGES = [
  { value: "text", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "shell", label: "Shell" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "makefile", label: "Makefile" },
] as const;

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  if (!filename) {
    return "";
  }

  // Handle special cases
  if (filename.toLowerCase() === "dockerfile") {
    return "dockerfile";
  }
  if (filename.toLowerCase() === "makefile") {
    return "makefile";
  }

  // Check if filename has an extension
  if (!filename.includes(".")) {
    return "";
  }

  // Get the last extension (handles cases like .test.ts)
  const parts = filename.split(".");
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Detect language from filename
 */
export function detectLanguage(filename: string): string {
  const extension = getFileExtension(filename);
  return LANGUAGE_MAP[extension] || "text";
}

/**
 * Check if a language is supported by our editor
 */
export function isSupportedLanguage(language: string): boolean {
  return SUPPORTED_LANGUAGES.some((lang) => lang.value === language);
}

/**
 * Get display label for a language
 */
export function getLanguageLabel(language: string): string {
  const found = SUPPORTED_LANGUAGES.find((lang) => lang.value === language);
  return found ? found.label : "Plain Text";
}

/**
 * Generate a default filename with the given index
 */
export function generateDefaultFilename(
  index: number,
  extension = "txt"
): string {
  return `file${index}.${extension}`;
}

/**
 * Validate filename according to GhostPaste rules
 */
export function validateFilename(
  filename: string,
  existingFilenames: string[] = []
): { valid: boolean; error?: string } {
  // Check if empty
  if (!filename || filename.trim().length === 0) {
    return { valid: false, error: "Filename is required" };
  }

  // Check length
  if (filename.length > 255) {
    return { valid: false, error: "Filename must be 255 characters or less" };
  }

  // Check for invalid characters
  const invalidChars = /[/\\:*?"<>|]/;
  if (invalidChars.test(filename)) {
    return { valid: false, error: "Filename contains invalid characters" };
  }

  // Check for duplicates
  const isDuplicate = existingFilenames.some(
    (existing) => existing.toLowerCase() === filename.toLowerCase()
  );
  if (isDuplicate) {
    return { valid: false, error: "Filename already exists" };
  }

  return { valid: true };
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

/**
 * Check if file size is within warning/error thresholds
 */
export function checkFileSize(bytes: number): {
  status: "ok" | "warning" | "error";
  message?: string;
} {
  const WARNING_THRESHOLD = 400 * 1024; // 400KB
  const ERROR_THRESHOLD = 500 * 1024; // 500KB

  if (bytes > ERROR_THRESHOLD) {
    return {
      status: "error",
      message: `File size (${formatFileSize(bytes)}) exceeds 500KB limit`,
    };
  }

  if (bytes > WARNING_THRESHOLD) {
    return {
      status: "warning",
      message: `File size (${formatFileSize(bytes)}) is large and may affect performance`,
    };
  }

  return { status: "ok" };
}
