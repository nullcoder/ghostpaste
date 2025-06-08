"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyIconButton } from "@/components/ui/copy-button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Copy, Download, FileText } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { copyHelpers } from "@/lib/copy-to-clipboard";
import type { File } from "@/types";

export interface GistViewerProps {
  files: File[];
  className?: string;
}

export function GistViewer({ files, className }: GistViewerProps) {
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const { resolvedTheme } = useTheme();

  const handleCopyAll = async () => {
    try {
      await copyHelpers.copyMultipleFiles(files);
    } catch (error) {
      console.error("Failed to copy all files:", error);
    }
  };

  const handleDownloadFile = (file: File) => {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    // For now, download as individual files
    // TODO: Implement ZIP download for multiple files
    files.forEach((file) => handleDownloadFile(file));
  };

  if (files.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <p className="text-muted-foreground">No files to display</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col gap-4", className)}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="text-xs"
            >
              Line Numbers: {showLineNumbers ? "On" : "Off"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWordWrap(!wordWrap)}
              className="text-xs"
            >
              Word Wrap: {wordWrap ? "On" : "Off"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyAll}
              className="text-xs"
            >
              <Copy className="mr-1 h-3 w-3" />
              Copy All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAll}
              className="text-xs"
            >
              <Download className="mr-1 h-3 w-3" />
              Download All
            </Button>
          </div>
        </div>

        {/* Files List - Vertical Layout */}
        <div className="space-y-4">
          {files.map((file) => (
            <FileContent
              key={file.name}
              file={file}
              theme={resolvedTheme === "dark" ? "dark" : "light"}
              showLineNumbers={showLineNumbers}
              wordWrap={wordWrap}
              onCopy={() => {}}
              onDownload={() => handleDownloadFile(file)}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

interface FileContentProps {
  file: File;
  theme: "light" | "dark";
  showLineNumbers: boolean;
  wordWrap: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

function FileContent({
  file,
  theme,
  showLineNumbers,
  wordWrap,
  onCopy: _onCopy,
  onDownload,
}: FileContentProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      {/* File Header */}
      <div className="bg-muted flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="text-muted-foreground h-4 w-4" />
          <span className="font-medium">{file.name}</span>
        </div>

        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <CopyIconButton
                text={file.content}
                className="h-7 w-7"
                aria-label={`Copy ${file.name} to clipboard`}
                data-testid={`copy-${file.name}`}
                successMessage={`${file.name} copied to clipboard!`}
              />
            </TooltipTrigger>
            <TooltipContent>Copy to clipboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onDownload}
                aria-label={`Download ${file.name}`}
              >
                <Download className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download file</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Code Editor */}
      <CodeEditor
        value={file.content}
        language={file.language}
        theme={theme}
        readOnly={true}
        showLineNumbers={showLineNumbers}
        wordWrap={wordWrap}
        height="auto"
      />
    </div>
  );
}
