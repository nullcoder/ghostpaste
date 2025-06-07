"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  copyToClipboard,
  copyToClipboardWithRetry,
  type CopyResult,
} from "@/lib/copy-to-clipboard";

export interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Button variant */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Additional CSS classes */
  className?: string;
  /** Custom success message for toast */
  successMessage?: string;
  /** Custom error message for toast */
  errorMessage?: string;
  /** Whether to show toast notifications */
  showToast?: boolean;
  /** Whether to use visual feedback (icon change) */
  showVisualFeedback?: boolean;
  /** Duration in ms to show success state */
  successDuration?: number;
  /** Whether to retry on failure */
  useRetry?: boolean;
  /** Maximum number of retries */
  maxRetries?: number;
  /** Custom children - if provided, will override default icon */
  children?: React.ReactNode;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Custom aria-label for accessibility */
  "aria-label"?: string;
  /** Custom onCopy callback */
  onCopy?: (result: CopyResult) => void;
}

/**
 * Reusable copy button component that provides consistent copy functionality
 * across the application with toast notifications and visual feedback.
 */
export function CopyButton({
  text,
  variant = "ghost",
  size = "icon",
  className,
  successMessage,
  errorMessage,
  showToast = true,
  showVisualFeedback = true,
  successDuration = 2000,
  useRetry = false,
  maxRetries = 2,
  children,
  disabled = false,
  "aria-label": ariaLabel,
  onCopy,
  ...props
}: CopyButtonProps &
  Omit<React.ComponentProps<typeof Button>, keyof CopyButtonProps>) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      const result = useRetry
        ? await copyToClipboardWithRetry(text, maxRetries)
        : await copyToClipboard(text);

      // Call custom callback if provided
      onCopy?.(result);

      if (result.success) {
        // Show visual feedback
        if (showVisualFeedback) {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), successDuration);
        }

        // Show toast notification
        if (showToast) {
          toast.success(successMessage || "Copied to clipboard");
        }
      } else {
        // Handle copy failure
        if (showToast) {
          const message = errorMessage || result.error || "Failed to copy";
          toast.error(message);
        }
      }
    } catch (error) {
      // Handle unexpected errors
      const message = errorMessage || "An unexpected error occurred";
      if (showToast) {
        toast.error(message);
      }

      onCopy?.({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button content
  const getButtonContent = () => {
    if (children) {
      return children;
    }

    // Default icon behavior
    if (isLoading) {
      return <Copy className="h-4 w-4 animate-pulse" />;
    }

    if (copySuccess && showVisualFeedback) {
      return <Check className="h-4 w-4 text-green-600" />;
    }

    return <Copy className="h-4 w-4" />;
  };

  // Generate accessible label
  const getAriaLabel = () => {
    if (ariaLabel) {
      return ariaLabel;
    }

    if (copySuccess) {
      return "Copied to clipboard";
    }

    return "Copy to clipboard";
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(
        "transition-colors",
        copySuccess && showVisualFeedback && "bg-green-50 dark:bg-green-950/20",
        className
      )}
      onClick={handleCopy}
      disabled={disabled || isLoading}
      aria-label={getAriaLabel()}
      {...props}
    >
      {getButtonContent()}
    </Button>
  );
}

/**
 * Copy button specifically for inline text with icon and label
 */
export function CopyTextButton({
  text,
  label = "Copy",
  className,
  ...props
}: Omit<CopyButtonProps, "children" | "size"> & {
  label?: string;
}) {
  return (
    <CopyButton
      text={text}
      size="sm"
      variant="outline"
      className={cn("gap-2", className)}
      {...props}
    >
      <Copy className="h-4 w-4" />
      {label}
    </CopyButton>
  );
}

/**
 * Icon-only copy button for compact spaces
 */
export function CopyIconButton({
  text,
  className,
  ...props
}: Omit<CopyButtonProps, "children" | "size">) {
  return (
    <CopyButton
      text={text}
      size="icon"
      variant="ghost"
      className={cn("h-7 w-7", className)}
      {...props}
    />
  );
}
