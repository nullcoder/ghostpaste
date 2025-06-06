"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import { FileEditor, FileData } from "@/components/ui/file-editor";
import { AddFileButton } from "@/components/ui/add-file-button";
import {
  generateDefaultFilename,
  formatFileSize,
} from "@/lib/language-detection";
import { cn } from "@/lib/utils";

export interface MultiFileEditorProps {
  /** Initial files to display */
  initialFiles?: FileData[];
  /** Callback when files change */
  onChange: (files: FileData[]) => void;
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Maximum total size for all files (in bytes) */
  maxTotalSize?: number;
  /** Maximum size per file (in bytes) */
  maxFileSize?: number;
  /** Custom class name */
  className?: string;
}

const DEFAULT_MAX_FILES = 20;
const DEFAULT_MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_FILE_SIZE = 500 * 1024; // 500KB

export function MultiFileEditor({
  initialFiles = [],
  onChange,
  readOnly = false,
  maxFiles = DEFAULT_MAX_FILES,
  maxTotalSize = DEFAULT_MAX_TOTAL_SIZE,
  maxFileSize: _maxFileSize = DEFAULT_MAX_FILE_SIZE, // Currently unused but available for future file size validation
  className,
}: MultiFileEditorProps) {
  // Initialize with at least one file
  const [files, setFiles] = useState<FileData[]>(() => {
    if (initialFiles.length > 0) {
      return initialFiles;
    }
    return [
      {
        id: "default-file-1", // Use deterministic ID for SSR
        name: "file1.txt",
        content: "",
        language: "text",
      },
    ];
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // Calculate total size
  const totalSize = useMemo(() => {
    return files.reduce((sum, file) => {
      return sum + new TextEncoder().encode(file.content).length;
    }, 0);
  }, [files]);

  // Get all files for validation (we need both name and id)
  const allFiles = useMemo(
    () => files.map((f) => ({ id: f.id, name: f.name })),
    [files]
  );

  // Check if we can add more files
  const canAddFile = files.length < maxFiles && !readOnly;

  // Check if we can remove files
  const canRemoveFile = files.length > 1 && !readOnly;

  // Handle file changes
  const handleFileChange = useCallback(
    (id: string, updates: Partial<FileData>) => {
      const newFiles = files.map((file) =>
        file.id === id ? { ...file, ...updates } : file
      );
      setFiles(newFiles);
      onChange(newFiles);
    },
    [files, onChange]
  );

  // Handle file deletion
  const handleFileDelete = useCallback(
    (id: string) => {
      const newFiles = files.filter((file) => file.id !== id);
      setFiles(newFiles);
      onChange(newFiles);
    },
    [files, onChange]
  );

  // Add new file
  const addNewFile = useCallback(() => {
    if (!canAddFile) return;

    // Generate unique filename
    const existingNames = files.map((f) => f.name);
    let counter = files.length + 1;
    let filename = generateDefaultFilename(counter);

    // Keep incrementing until we find a unique name
    while (existingNames.includes(filename)) {
      counter++;
      filename = generateDefaultFilename(counter);
    }

    const newFile: FileData = {
      id: nanoid(),
      name: filename,
      content: "",
      language: "text",
    };

    const newFiles = [...files, newFile];
    setFiles(newFiles);
    onChange(newFiles);

    // Auto-scroll to the new file
    setTimeout(() => {
      if (addButtonRef.current) {
        addButtonRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 100);
  }, [files, canAddFile, onChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to add new file
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        addNewFile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addNewFile]);

  // Total size status
  const sizeStatus = useMemo(() => {
    if (totalSize > maxTotalSize) {
      return {
        type: "error" as const,
        message: `Total size (${formatFileSize(totalSize)}) exceeds ${formatFileSize(maxTotalSize)} limit`,
      };
    }
    if (totalSize > maxTotalSize * 0.8) {
      return {
        type: "warning" as const,
        message: `Total size (${formatFileSize(totalSize)}) is approaching the ${formatFileSize(maxTotalSize)} limit`,
      };
    }
    return { type: "ok" as const };
  }, [totalSize, maxTotalSize]);

  return (
    <div ref={containerRef} className={cn("space-y-6", className)}>
      {/* Header with file count and total size */}
      <div className="flex items-center justify-between text-sm">
        <div>
          Total: {files.length} {files.length === 1 ? "file" : "files"}
        </div>
        <div
          className={cn(
            "font-mono",
            sizeStatus.type === "warning" && "text-yellow-600",
            sizeStatus.type === "error" && "text-destructive"
          )}
        >
          {formatFileSize(totalSize)} / {formatFileSize(maxTotalSize)}
        </div>
      </div>

      {/* File editors */}
      <div className="space-y-6">
        {files.map((file) => (
          <div
            key={file.id}
            className="hover:border-muted-foreground/25 rounded-lg border p-4 transition-colors"
          >
            <FileEditor
              file={file}
              onChange={handleFileChange}
              onDelete={handleFileDelete}
              showDelete={canRemoveFile}
              existingFilenames={allFiles
                .filter((f) => f.id !== file.id)
                .map((f) => f.name)}
              readOnly={readOnly}
            />
          </div>
        ))}
      </div>

      {/* Size warning/error */}
      {sizeStatus.message && (
        <p
          className={cn(
            "text-sm",
            sizeStatus.type === "warning" && "text-yellow-600",
            sizeStatus.type === "error" && "text-destructive"
          )}
        >
          {sizeStatus.message}
        </p>
      )}

      {/* Add file button */}
      {canAddFile && (
        <AddFileButton
          ref={addButtonRef}
          onClick={addNewFile}
          fileCount={files.length}
          maxFiles={maxFiles}
          sizeExceeded={sizeStatus.type === "error"}
        />
      )}

      {/* Keyboard shortcut hint */}
      {canAddFile && (
        <p className="text-muted-foreground text-center text-xs">
          Press <kbd className="bg-muted rounded px-1">Ctrl</kbd> +{" "}
          <kbd className="bg-muted rounded px-1">Enter</kbd> to add a new file
        </p>
      )}
    </div>
  );
}
