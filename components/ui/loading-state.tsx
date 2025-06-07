"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export interface LoadingStateProps {
  /**
   * Type of loading indicator
   */
  type: "skeleton" | "spinner" | "progress";
  /**
   * Message to display (for spinner and progress types)
   */
  message?: string;
  /**
   * Progress percentage (0-100) for progress type
   */
  progress?: number;
  /**
   * Whether to show fullscreen overlay
   */
  fullscreen?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Accessible label for screen readers
   */
  ariaLabel?: string;
}

/**
 * LoadingState component provides consistent loading indicators
 */
export function LoadingState({
  type,
  message,
  progress = 0,
  fullscreen = false,
  className,
  ariaLabel,
}: LoadingStateProps) {
  const content = React.useMemo(() => {
    switch (type) {
      case "skeleton":
        return <LoadingSkeleton />;
      case "spinner":
        return <LoadingSpinner message={message} ariaLabel={ariaLabel} />;
      case "progress":
        return (
          <LoadingProgress
            message={message}
            progress={progress}
            ariaLabel={ariaLabel}
          />
        );
    }
  }, [type, message, progress, ariaLabel]);

  if (fullscreen) {
    return (
      <div
        className={cn(
          "bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
          className
        )}
      >
        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}

/**
 * LoadingSkeleton for page/component loading states
 */
export function LoadingSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Skeleton className="mb-4 h-8 w-3/4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="mt-6 flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * LoadingSpinner with optional message
 */
export function LoadingSpinner({
  message = "Loading...",
  ariaLabel,
  className,
}: {
  message?: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col items-center gap-4", className)}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || message}
    >
      <div className="relative h-12 w-12">
        <div className="border-muted border-t-primary absolute inset-0 animate-spin rounded-full border-4" />
      </div>
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );
}

/**
 * LoadingProgress for file processing operations
 */
export function LoadingProgress({
  message = "Processing...",
  progress = 0,
  ariaLabel,
  className,
}: {
  message?: string;
  progress?: number;
  ariaLabel?: string;
  className?: string;
}) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={cn("w-full max-w-md", className)}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || message}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <span className="text-muted-foreground text-sm">
          {clampedProgress}%
        </span>
      </div>
      <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full transition-all duration-300 ease-in-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * EditorSkeleton specifically for code editor loading states
 */
export function EditorSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* File header skeleton */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
      {/* Editor content skeleton */}
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Utility hook for delayed loading states
 * Shows loading state only if operation takes longer than threshold
 */
export function useDelayedLoading(
  isLoading: boolean,
  delay: number = 100
): boolean {
  const [showLoading, setShowLoading] = React.useState(false);

  React.useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setShowLoading(true);
      }, delay);

      return () => clearTimeout(timeout);
    } else {
      setShowLoading(false);
    }
  }, [isLoading, delay]);

  return showLoading;
}
