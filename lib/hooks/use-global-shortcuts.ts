"use client";

import { useEffect, useCallback } from "react";
import { toast } from "sonner";

/**
 * Platform detection utility
 */
export function getPlatformKey(): "⌘" | "Ctrl" {
  if (typeof navigator === "undefined") return "Ctrl";
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  return isMac ? "⌘" : "Ctrl";
}

/**
 * Get full platform key name for display
 */
export function getPlatformKeyName(): "Cmd" | "Ctrl" {
  if (typeof navigator === "undefined") return "Ctrl";
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  return isMac ? "Cmd" : "Ctrl";
}

/**
 * Check if the current platform is Mac
 */
export function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/.test(navigator.platform);
}

export interface ShortcutHandlers {
  /**
   * Called when Cmd/Ctrl + S is pressed
   */
  onSave?: () => void | Promise<void>;
  /**
   * Called when Cmd/Ctrl + Enter is pressed
   */
  onSubmit?: () => void | Promise<void>;
  /**
   * Called when Escape is pressed
   */
  onEscape?: () => void;
  /**
   * Called when Cmd/Ctrl + ? is pressed
   */
  onHelp?: () => void;
  /**
   * Whether shortcuts are enabled
   */
  enabled?: boolean;
}

/**
 * Global keyboard shortcuts hook
 */
export function useGlobalShortcuts({
  onSave,
  onSubmit,
  onEscape,
  onHelp,
  enabled = true,
}: ShortcutHandlers = {}) {
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!enabled) return;

      const isMeta = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + S - Save
      if (isMeta && e.key === "s") {
        e.preventDefault();
        if (onSave) {
          try {
            await onSave();
          } catch (error) {
            console.error("Save shortcut error:", error);
            toast.error("Failed to save");
          }
        }
        return;
      }

      // Cmd/Ctrl + Enter - Submit
      if (isMeta && e.key === "Enter") {
        e.preventDefault();
        if (onSubmit) {
          try {
            await onSubmit();
          } catch (error) {
            console.error("Submit shortcut error:", error);
            toast.error("Failed to submit");
          }
        }
        return;
      }

      // Escape - Close/Cancel
      if (e.key === "Escape") {
        // Don't prevent default to allow exiting fullscreen
        if (onEscape) {
          onEscape();
        }
        return;
      }

      // Cmd/Ctrl + ? or Cmd/Ctrl + / - Help
      if (isMeta && (e.key === "?" || e.key === "/")) {
        e.preventDefault();
        if (onHelp) {
          onHelp();
        }
        return;
      }
    },
    [enabled, onSave, onSubmit, onEscape, onHelp]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(keys: string): string {
  const platformKey = getPlatformKey();
  // Replace "Cmd/Ctrl" or "Cmd" or "Ctrl" with the platform key
  return keys.replace(/Cmd\/Ctrl|Cmd|Ctrl/g, platformKey);
}

/**
 * Common keyboard shortcuts for reference
 */
export const SHORTCUTS = {
  save: "Cmd/Ctrl + S",
  submit: "Cmd/Ctrl + Enter",
  escape: "Escape",
  help: "Cmd/Ctrl + ?",
  selectAll: "Cmd/Ctrl + A",
  undo: "Cmd/Ctrl + Z",
  redo: "Cmd/Ctrl + Y",
  find: "Cmd/Ctrl + F",
} as const;
