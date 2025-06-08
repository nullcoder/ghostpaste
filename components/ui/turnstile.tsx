"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";

interface TurnstileProps {
  sitekey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact" | "invisible";
  className?: string;
}

declare global {
  interface Window {
    turnstile: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (error: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "flexible" | "compact" | "invisible";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function Turnstile({
  sitekey,
  onVerify,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  className,
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current) return;

    // Clean up any existing widget
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        // Widget might already be removed
      }
    }

    // Render new widget
    if (window.turnstile && containerRef.current) {
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          callback: onVerify,
          "error-callback": onError,
          "expired-callback": onExpire,
          theme,
          size,
        });
      } catch (error) {
        console.error("Failed to render Turnstile widget:", error);
        onError?.("Failed to load verification widget");
      }
    }

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget might already be removed
        }
      }
    };
  }, [isScriptLoaded, sitekey, onVerify, onError, onExpire, theme, size]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />
      <div
        ref={containerRef}
        className={cn(
          "cf-turnstile",
          size === "compact" && "h-[65px]",
          size === "normal" && "h-[65px]",
          size === "flexible" && "min-h-[65px]",
          size === "invisible" && "h-0",
          className
        )}
      />
    </>
  );
}
