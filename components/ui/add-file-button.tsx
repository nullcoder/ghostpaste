"use client";

import { forwardRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AddFileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Current file count */
  fileCount: number;
  /** Maximum files allowed */
  maxFiles: number;
  /** Whether size limit has been exceeded */
  sizeExceeded?: boolean;
}

export const AddFileButton = forwardRef<HTMLButtonElement, AddFileButtonProps>(
  (
    {
      fileCount,
      maxFiles,
      sizeExceeded = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const remainingFiles = maxFiles - fileCount;
    const isDisabled = disabled || fileCount >= maxFiles || sizeExceeded;

    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn("w-full", className)}
        disabled={isDisabled}
        {...props}
      >
        <Plus className="mr-2 h-4 w-4" />
        {children || "Add another file"}
        {remainingFiles <= 3 && remainingFiles > 0 && (
          <span className="text-muted-foreground ml-2">
            ({remainingFiles} remaining)
          </span>
        )}
      </Button>
    );
  }
);

AddFileButton.displayName = "AddFileButton";
