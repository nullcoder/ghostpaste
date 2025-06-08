"use client";

import { Lock, Shield, Key, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityLoadingProps {
  message?: string;
  type?: "encrypt" | "decrypt" | "upload" | "process";
  className?: string;
}

export function SecurityLoading({
  message = "Processing...",
  type = "process",
  className,
}: SecurityLoadingProps) {
  const getIcon = () => {
    switch (type) {
      case "encrypt":
        return <Lock className="h-6 w-6" />;
      case "decrypt":
        return <Key className="h-6 w-6" />;
      case "upload":
        return <Shield className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const getAnimation = () => {
    switch (type) {
      case "encrypt":
        return "animate-pulse";
      case "decrypt":
        return "animate-bounce";
      case "upload":
        return "animate-spin";
      default:
        return "animate-pulse";
    }
  };

  const getMessage = () => {
    if (message !== "Processing...") return message;

    switch (type) {
      case "encrypt":
        return "Encrypting your data...";
      case "decrypt":
        return "Decrypting securely...";
      case "upload":
        return "Uploading safely...";
      default:
        return "Processing...";
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3 py-8", className)}>
      <div className={cn("text-primary", getAnimation())}>{getIcon()}</div>
      <p className="text-muted-foreground text-sm font-medium">
        {getMessage()}
      </p>
      {/* Progress bar animation */}
      <div className="bg-muted h-1 w-24 overflow-hidden rounded-full">
        <div className="bg-primary h-full w-1/3 animate-[loading_1.5s_ease-in-out_infinite] rounded-full"></div>
      </div>
    </div>
  );
}

export function EncryptionProgress({
  stage,
  className,
}: {
  stage: "generating" | "encrypting" | "uploading" | "complete";
  className?: string;
}) {
  const stages = [
    { id: "generating", label: "Generating keys", icon: Key },
    { id: "encrypting", label: "Encrypting data", icon: Lock },
    { id: "uploading", label: "Uploading securely", icon: Shield },
    { id: "complete", label: "Complete", icon: Zap },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === stage);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-3">
        {stages.map((stageItem, index) => {
          const Icon = stageItem.icon;
          const isActive = index === currentStageIndex;
          const isComplete = index < currentStageIndex;

          return (
            <div
              key={stageItem.id}
              className={cn(
                "flex items-center gap-3 transition-opacity duration-300",
                isActive
                  ? "opacity-100"
                  : isComplete
                    ? "opacity-60"
                    : "opacity-30"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                  isComplete
                    ? "border-green-500 bg-green-500 text-white"
                    : isActive
                      ? "border-primary bg-primary animate-pulse text-white"
                      : "border-muted-foreground/30"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {stageItem.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
