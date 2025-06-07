"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { getPlatformKey } from "@/lib/hooks/use-global-shortcuts";
import { cn } from "@/lib/utils";

export interface KeyboardShortcutsHelpProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  /**
   * Callback when dialog open state changes
   */
  onOpenChange: (open: boolean) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string;
    action: string;
    context?: string;
  }>;
}

/**
 * Dialog showing all available keyboard shortcuts
 */
export function KeyboardShortcutsHelp({
  open,
  onOpenChange,
  className,
}: KeyboardShortcutsHelpProps) {
  const platformKey = getPlatformKey();

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: "General",
      shortcuts: [
        {
          keys: `${platformKey} + ?`,
          action: "Show keyboard shortcuts",
        },
        {
          keys: "Escape",
          action: "Close dialog/Cancel action",
        },
        {
          keys: "Tab",
          action: "Navigate forward",
        },
        {
          keys: "Shift + Tab",
          action: "Navigate backward",
        },
      ],
    },
    {
      title: "Gist Actions",
      shortcuts: [
        {
          keys: `${platformKey} + S`,
          action: "Save gist",
          context: "When editing",
        },
        {
          keys: `${platformKey} + Enter`,
          action: "Create or update gist",
          context: "In forms",
        },
      ],
    },
    {
      title: "Editor Shortcuts",
      shortcuts: [
        {
          keys: `${platformKey} + A`,
          action: "Select all",
          context: "In editor",
        },
        {
          keys: `${platformKey} + Z`,
          action: "Undo",
          context: "In editor",
        },
        {
          keys: `${platformKey} + Y`,
          action: "Redo",
          context: "In editor",
        },
        {
          keys: `${platformKey} + F`,
          action: "Find in file",
          context: "In editor",
        },
        {
          keys: "Tab",
          action: "Insert tab/spaces",
          context: "In editor",
        },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[80vh] max-w-2xl overflow-y-auto", className)}
      >
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick actions to improve your workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcutGroups.map((group, index) => (
            <div key={group.title}>
              {index > 0 && <Separator className="mb-4" />}
              <div>
                <h3 className="mb-3 font-semibold">{group.title}</h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut) => (
                    <div
                      key={`${shortcut.keys}-${shortcut.action}`}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <kbd className="bg-muted border-border min-w-[100px] rounded-md border px-2 py-1.5 text-center font-mono text-xs">
                          {shortcut.keys}
                        </kbd>
                        <span className="text-sm">{shortcut.action}</span>
                      </div>
                      {shortcut.context && (
                        <span className="text-muted-foreground text-xs">
                          {shortcut.context}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground border-t pt-4 text-sm">
          <p>
            Tip: These shortcuts are designed to work across different browsers
            and platforms. Some shortcuts may vary based on your operating
            system.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Keyboard shortcut display component for inline use
 */
export function KeyboardShortcut({
  keys,
  className,
}: {
  keys: string;
  className?: string;
}) {
  const platformKey = getPlatformKey();
  const formattedKeys = keys.replace(/Cmd\/Ctrl|Cmd|Ctrl/g, platformKey);

  return (
    <kbd
      className={cn(
        "bg-muted border-border rounded border px-1.5 py-0.5 font-mono text-xs",
        className
      )}
    >
      {formattedKeys}
    </kbd>
  );
}
