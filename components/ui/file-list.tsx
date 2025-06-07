"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { CopyButton } from "@/components/ui/copy-button";
import { Download, FileCode } from "lucide-react";
import { cn, formatFileSize, countLines, fileSlug } from "@/lib/utils";
import { detectLanguage } from "@/lib/language-detection";
import { toast } from "sonner";

export interface FileData {
  /**
   * File name
   */
  name: string;
  /**
   * File content
   */
  content: string;
  /**
   * Programming language (optional, will be detected if not provided)
   */
  language?: string;
  /**
   * File size in bytes
   */
  size: number;
}

export interface FileListProps {
  /**
   * Array of files to display
   */
  files: FileData[];
  /**
   * Callback when copy button is clicked
   */
  onCopy?: (filename: string) => void;
  /**
   * Callback when download button is clicked
   */
  onDownload?: (filename: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Height for each code editor
   */
  editorHeight?: string;
  /**
   * Whether to show line numbers in code editor
   */
  showLineNumbers?: boolean;
  /**
   * Whether to enable word wrap in code editor
   */
  wordWrap?: boolean;
}

/**
 * FileList component displays files in a vertical layout with syntax highlighting
 * Similar to GitHub Gist view mode
 */
export function FileList({
  files,
  onCopy,
  onDownload,
  className,
  editorHeight = "auto",
  showLineNumbers = true,
  wordWrap = false,
}: FileListProps) {
  const handleDownload = (file: FileData) => {
    try {
      const blob = new Blob([file.content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onDownload?.(file.name);
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      toast.error("Failed to download file");
      console.error("Download error:", error);
    }
  };

  const handleCopy = (filename: string) => {
    onCopy?.(filename);
  };

  if (files.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileCode className="text-muted-foreground mb-2 h-12 w-12" />
          <p className="text-muted-foreground text-sm">No files to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {files.map((file, index) => {
        const detectedLanguage = file.language || detectLanguage(file.name);
        const lineCount = countLines(file.content);
        const slug = fileSlug(file.name);
        const fileId = `file-${slug}-${index}`;

        return (
          <Card key={index} id={fileId} className="overflow-hidden">
            <CardHeader className="border-b px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate font-mono text-sm font-medium">
                    {file.name}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    {detectedLanguage}
                  </Badge>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {lineCount} {lineCount === 1 ? "line" : "lines"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CopyButton
                    text={file.content}
                    variant="ghost"
                    size="sm"
                    successMessage={`Copied ${file.name}`}
                    aria-label={`Copy ${file.name} to clipboard`}
                    onCopy={() => handleCopy(file.name)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    className="gap-2"
                    aria-label={`Download ${file.name}`}
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <CodeEditor
                value={file.content}
                language={detectedLanguage}
                readOnly={true}
                showLineNumbers={showLineNumbers}
                wordWrap={wordWrap}
                height={editorHeight}
                className="rounded-none border-0"
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * FileListSkeleton component for loading states
 */
export function FileListSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                <div className="bg-muted h-5 w-16 animate-pulse rounded-full" />
                <div className="bg-muted h-4 w-12 animate-pulse rounded" />
                <div className="bg-muted h-4 w-16 animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-muted h-8 w-8 animate-pulse rounded" />
                <div className="bg-muted hidden h-8 w-24 animate-pulse rounded sm:block" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-muted h-40 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
