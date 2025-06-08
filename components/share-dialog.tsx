"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CopyButton, CopyIconButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Download, AlertTriangle } from "lucide-react";
import { type CopyResult } from "@/lib/copy-to-clipboard";

export interface ShareDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** The complete shareable URL including fragment */
  shareUrl: string;
  /** Optional title for the gist */
  gistTitle?: string;
  /** Optional callback when URL is copied */
  onCopy?: () => void;
  /** Optional callback when text file is downloaded */
  onDownload?: () => void;
}

export function ShareDialog({
  open,
  onOpenChange,
  shareUrl,
  gistTitle,
  onCopy,
  onDownload,
}: ShareDialogProps) {
  // Split the URL at the fragment for visual display
  const urlParts = shareUrl.split("#");
  const baseUrl = urlParts[0];
  const fragment = urlParts[1] ? `#${urlParts[1]}` : "";

  const handleCopyResult = (result: CopyResult) => {
    if (result.success) {
      onCopy?.();
    }
  };

  const handleDownload = () => {
    const content = `GhostPaste - Secure Gist\n\n${gistTitle ? `Title: ${gistTitle}\n` : ""}URL: ${shareUrl}\n\nIMPORTANT: This URL contains a decryption key in the fragment (after #).\nShare the complete URL to allow others to view the gist.\n\nCreated: ${new Date().toLocaleString()}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ghostpaste-${gistTitle ? gistTitle.replace(/[^a-zA-Z0-9]/g, "-") : "gist"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onDownload?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Gist Created Successfully!
          </DialogTitle>
          <DialogDescription>
            Your gist has been created and encrypted. Share the link below to
            give others access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your secure link:</label>
            <div className="relative">
              <div className="bg-muted/50 rounded-md border p-3 pr-12 font-mono text-sm">
                <div className="break-all">
                  <span className="text-foreground">{baseUrl}</span>
                  {fragment && (
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {fragment}
                    </span>
                  )}
                </div>
              </div>
              <CopyIconButton
                text={shareUrl}
                className="absolute top-2 right-2"
                onCopy={handleCopyResult}
                successMessage="URL copied to clipboard!"
                aria-label="Copy URL to clipboard"
              />
            </div>
          </div>

          {/* Security Warning */}
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Important Security Notice
                </p>
                <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                  The blue part after{" "}
                  <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
                    #
                  </code>{" "}
                  is your decryption key. Share the{" "}
                  <strong>complete URL</strong> to allow others to view your
                  gist. Anyone with this link can access your content.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Download as Text
          </Button>
          <CopyButton
            text={shareUrl}
            variant="default"
            size="default"
            label="Copy Link"
            className="w-full sm:w-auto"
            onCopy={handleCopyResult}
            successMessage="URL copied to clipboard!"
          />
          <DialogClose asChild>
            <Button variant="secondary" className="w-full sm:w-auto">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
