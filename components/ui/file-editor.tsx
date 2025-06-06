"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import {
  detectLanguage,
  validateFilename,
  formatFileSize,
  checkFileSize,
  SUPPORTED_LANGUAGES,
} from "@/lib/language-detection";
import { cn } from "@/lib/utils";

export interface FileData {
  id: string;
  name: string;
  content: string;
  language?: string;
}

export interface FileEditorProps {
  file: FileData;
  onChange: (id: string, updates: Partial<FileData>) => void;
  onDelete: (id: string) => void;
  showDelete: boolean;
  existingFilenames: string[];
  readOnly?: boolean;
  className?: string;
}

export function FileEditor({
  file,
  onChange,
  onDelete,
  showDelete,
  existingFilenames,
  readOnly = false,
  className,
}: FileEditorProps) {
  const [filenameError, setFilenameError] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  // Calculate file size and check status
  const fileSize = useMemo(() => {
    return new TextEncoder().encode(file.content).length;
  }, [file.content]);

  const sizeCheck = useMemo(() => {
    return checkFileSize(fileSize);
  }, [fileSize]);

  // Validate filename on mount and changes
  useEffect(() => {
    if (!isDirty) return;

    const otherFilenames = existingFilenames.filter(
      (name) => name !== file.name
    );
    const validation = validateFilename(file.name, otherFilenames);

    if (!validation.valid) {
      setFilenameError(validation.error || "");
    } else {
      setFilenameError("");
    }
  }, [file.name, existingFilenames, file.id, isDirty]);

  // Handle filename change
  const handleFilenameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setIsDirty(true);

      // Update the filename
      onChange(file.id, { name: newName });

      // Auto-detect language from new filename
      const detectedLanguage = detectLanguage(newName);
      if (detectedLanguage !== file.language) {
        onChange(file.id, { language: detectedLanguage });
      }
    },
    [file.id, file.language, onChange]
  );

  // Handle language selection
  const handleLanguageChange = useCallback(
    (value: string) => {
      onChange(file.id, { language: value });
    },
    [file.id, onChange]
  );

  // Handle content change
  const handleContentChange = useCallback(
    (value: string) => {
      onChange(file.id, { content: value });
    },
    [file.id, onChange]
  );

  // Handle delete
  const handleDelete = useCallback(() => {
    if (readOnly) return;

    // If file has content, confirm deletion
    if (file.content.trim()) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${file.name || "Untitled"}"? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    onDelete(file.id);
  }, [file.id, file.name, file.content, onDelete, readOnly]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* File header */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {/* Filename input */}
        <div className="flex-1">
          <Label htmlFor={`filename-${file.id}`} className="sr-only">
            Filename
          </Label>
          <Input
            id={`filename-${file.id}`}
            type="text"
            value={file.name}
            onChange={handleFilenameChange}
            placeholder="filename.txt"
            disabled={readOnly}
            className={cn(
              "font-mono",
              filenameError &&
                "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={!!filenameError}
            aria-describedby={
              filenameError ? `filename-error-${file.id}` : undefined
            }
          />
          {filenameError && (
            <p
              id={`filename-error-${file.id}`}
              className="text-destructive mt-1 text-sm"
            >
              {filenameError}
            </p>
          )}
        </div>

        {/* Language selector */}
        <div className="w-full sm:w-48">
          <Label htmlFor={`language-${file.id}`} className="sr-only">
            Language
          </Label>
          <Select
            value={file.language || "text"}
            onValueChange={handleLanguageChange}
            disabled={readOnly}
          >
            <SelectTrigger id={`language-${file.id}`}>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Delete button */}
        {showDelete && !readOnly && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            aria-label={`Delete ${file.name || "file"}`}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Code editor */}
      <div className="relative">
        <CodeEditor
          value={file.content}
          onChange={handleContentChange}
          language={file.language || "text"}
          placeholder="// Enter your code here..."
          readOnly={readOnly}
          showLineNumbers={true}
          wordWrap={false}
          height="400px"
          className={cn(
            sizeCheck.status === "warning" && "ring-2 ring-yellow-500",
            sizeCheck.status === "error" && "ring-destructive ring-2"
          )}
        />

        {/* Size indicator */}
        <div
          className={cn(
            "absolute right-2 bottom-2 rounded px-2 py-1 text-xs",
            "bg-background/80 border backdrop-blur-sm",
            sizeCheck.status === "warning" &&
              "border-yellow-500 text-yellow-600",
            sizeCheck.status === "error" &&
              "text-destructive border-destructive"
          )}
        >
          {formatFileSize(fileSize)}
        </div>
      </div>

      {/* Size warning/error message */}
      {sizeCheck.message && (
        <p
          className={cn(
            "text-sm",
            sizeCheck.status === "warning" && "text-yellow-600",
            sizeCheck.status === "error" && "text-destructive"
          )}
        >
          {sizeCheck.message}
        </p>
      )}
    </div>
  );
}
