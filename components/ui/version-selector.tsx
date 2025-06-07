"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Lock } from "lucide-react";

export interface Version {
  /**
   * Version number (1-based)
   */
  version: number;
  /**
   * ISO timestamp when version was created
   */
  created_at: string;
  /**
   * Total size in bytes
   */
  size: number;
  /**
   * Number of files in this version
   */
  file_count: number;
  /**
   * Whether this version was edited with PIN
   */
  edited_with_pin?: boolean;
}

export interface VersionSelectorProps {
  /**
   * Current version number
   */
  currentVersion: number;
  /**
   * Array of available versions
   */
  versions: Version[];
  /**
   * Callback when version is selected
   */
  onVersionChangeAction: (version: number) => void;
  /**
   * Whether the selector is loading
   */
  loading?: boolean;
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
 * Format timestamp to relative or absolute time
 */
export function formatVersionTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Less than 1 minute
  if (diffMins < 1) {
    return "just now";
  }

  // Less than 1 hour
  if (diffHours < 1) {
    return diffMins === 1 ? "1 minute ago" : `${diffMins} minutes ago`;
  }

  // Less than 24 hours
  if (diffDays < 1) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  // Less than 7 days
  if (diffDays < 7) {
    if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
    }
    return `${diffDays} days ago`;
  }

  // More than 7 days - show absolute date
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Same year
  if (date.getFullYear() === now.getFullYear()) {
    return `${month} ${day} at ${time}`;
  }

  // Different year
  return `${month} ${day}, ${date.getFullYear()} at ${time}`;
}

/**
 * Version selector dropdown component
 */
export function VersionSelector({
  currentVersion,
  versions,
  onVersionChangeAction,
  loading = false,
  disabled = false,
  className,
}: VersionSelectorProps) {
  const totalVersions = versions.length;

  // Sort versions by number (newest first)
  const sortedVersions = React.useMemo(
    () => [...versions].sort((a, b) => b.version - a.version),
    [versions]
  );

  if (totalVersions === 0) {
    return null;
  }

  // Don't show selector if only one version
  if (totalVersions === 1) {
    return (
      <div className={cn("text-muted-foreground text-sm", className)}>
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Version 1 (only version)
        </Badge>
      </div>
    );
  }

  return (
    <Select
      value={currentVersion.toString()}
      onValueChange={(value) => onVersionChangeAction(parseInt(value, 10))}
      disabled={disabled || loading}
    >
      <SelectTrigger
        className={cn("w-[200px]", className)}
        aria-label="Select version"
      >
        <SelectValue>
          <span className="text-sm">
            Version {currentVersion} of {totalVersions}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {sortedVersions.map((version) => {
          const isCurrent = version.version === currentVersion;
          const isOriginal = version.version === 1;
          const formattedTime = formatVersionTime(version.created_at);

          return (
            <SelectItem
              key={version.version}
              value={version.version.toString()}
              className="py-3"
            >
              <div className="flex w-full items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      Version {version.version}
                    </span>
                    {isCurrent && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {isOriginal && (
                      <Badge variant="secondary" className="text-xs">
                        Original
                      </Badge>
                    )}
                    {version.edited_with_pin && (
                      <Lock className="text-muted-foreground h-3 w-3" />
                    )}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3 text-xs">
                    <span>{formattedTime}</span>
                    <span>•</span>
                    <span>
                      {version.file_count}{" "}
                      {version.file_count === 1 ? "file" : "files"}
                    </span>
                  </div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

/**
 * Compact version selector for mobile or space-constrained layouts
 */
export function CompactVersionSelector({
  currentVersion,
  versions,
  onVersionChangeAction,
  loading = false,
  disabled = false,
  className,
}: VersionSelectorProps) {
  const totalVersions = versions.length;

  if (totalVersions <= 1) {
    return null;
  }

  return (
    <Select
      value={currentVersion.toString()}
      onValueChange={(value) => onVersionChangeAction(parseInt(value, 10))}
      disabled={disabled || loading}
    >
      <SelectTrigger
        className={cn("w-[120px]", className)}
        size="sm"
        aria-label={`Version ${currentVersion} of ${totalVersions}`}
      >
        <SelectValue>
          <span className="text-xs">
            v{currentVersion}/{totalVersions}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {[...versions]
          .sort((a, b) => b.version - a.version)
          .map((version) => (
            <SelectItem
              key={version.version}
              value={version.version.toString()}
            >
              <div className="flex items-center gap-2">
                <span>v{version.version}</span>
                {version.version === currentVersion && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
