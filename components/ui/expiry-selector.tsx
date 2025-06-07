"use client";

import * as React from "react";
import { format, isTomorrow, isToday } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

export interface ExpiryOption {
  label: string;
  value: number | null; // null for "Never", milliseconds for others
}

const EXPIRY_OPTIONS: ExpiryOption[] = [
  { label: "Never", value: null },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "6 hours", value: 6 * 60 * 60 * 1000 },
  { label: "1 day", value: 24 * 60 * 60 * 1000 },
  { label: "7 days", value: 7 * 24 * 60 * 60 * 1000 },
  { label: "30 days", value: 30 * 24 * 60 * 60 * 1000 },
];

export interface ExpirySelectorProps {
  /**
   * Current value as ISO timestamp or null for "Never"
   */
  value: string | null;
  /**
   * Callback when expiration time changes
   */
  onChange: (expiresAt: string | null) => void;
  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Formats the expiration date in a human-readable way
 */
function formatExpirationTime(date: Date): string {
  if (isToday(date)) {
    return `today at ${format(date, "h:mm a")}`;
  } else if (isTomorrow(date)) {
    return `tomorrow at ${format(date, "h:mm a")}`;
  } else {
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 7) {
      return `${format(date, "EEEE")} at ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d 'at' h:mm a");
    }
  }
}

/**
 * ExpirySelector component for selecting gist expiration time
 *
 * @example
 * ```tsx
 * const [expiresAt, setExpiresAt] = useState<string | null>(null);
 *
 * <ExpirySelector
 *   value={expiresAt}
 *   onChange={setExpiresAt}
 * />
 * ```
 */
export function ExpirySelector({
  value,
  onChange,
  disabled = false,
  className,
}: ExpirySelectorProps) {
  // Find the current option based on value
  const selectedOption = React.useMemo(() => {
    if (!value) return EXPIRY_OPTIONS[0]; // "Never"

    // For existing values, we don't need to match exactly
    // Just return a custom option with the label
    const expirationDate = new Date(value);
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();

    // Find the closest matching option
    const option = EXPIRY_OPTIONS.find((opt) => {
      if (opt.value === null) return false;
      // Allow 5 minute tolerance for matching
      return Math.abs(diffMs - opt.value) < 5 * 60 * 1000;
    });

    return option || EXPIRY_OPTIONS[0];
  }, [value]);

  const handleValueChange = (optionLabel: string) => {
    const option = EXPIRY_OPTIONS.find((opt) => opt.label === optionLabel);
    if (!option) return;

    if (option.value === null) {
      onChange(null);
    } else {
      const expirationDate = new Date(Date.now() + option.value);
      onChange(expirationDate.toISOString());
    }
  };

  return (
    <Select
      value={selectedOption.label}
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className} aria-label="Select expiration time">
        <div className="flex items-center gap-2">
          <Clock className="text-muted-foreground h-4 w-4" />
          <SelectValue placeholder="Select expiration time" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {EXPIRY_OPTIONS.map((option) => {
          let description: string | undefined;

          if (option.value !== null) {
            const futureDate = new Date(Date.now() + option.value);
            description = formatExpirationTime(futureDate);
          }

          return (
            <SelectItem
              key={option.label}
              value={option.label}
              className="relative"
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{option.label}</span>
                {description && (
                  <span className="text-muted-foreground text-xs">
                    Expires {description}
                  </span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
