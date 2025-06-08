"use client";

import React, { useEffect, useRef } from "react";

interface TurnstileProps {
  sitekey: string;
  onSuccess?: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  action?: string;
  size?: "normal" | "flexible" | "compact";
  appearance?: "always" | "execute" | "interaction-only";
  execution?: "render" | "execute";
  language?: string;
}

declare global {
  interface Window {
    turnstile: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          action?: string;
          size?: "normal" | "flexible" | "compact";
          appearance?: "always" | "execute" | "interaction-only";
          execution?: "render" | "execute";
          language?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      execute: (widgetId: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

const Turnstile: React.FC<TurnstileProps> = ({
  sitekey,
  onSuccess,
  onExpire,
  onError,
  theme = "auto",
  action,
  size = "normal",
  appearance = "interaction-only",
  execution = "render",
  language = "auto",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          theme,
          action,
          size,
          appearance,
          execution,
          language,
          callback: onSuccess,
          "error-callback": onError,
          "expired-callback": onExpire,
        });
      }
    };

    // Check if Turnstile is already loaded
    if (window.turnstile) {
      renderWidget();
    } else {
      // Set up the callback for when Turnstile loads
      window.onloadTurnstileCallback = renderWidget;

      // Load Turnstile script if not already present
      const scriptId = "cf-turnstile-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }

    // Cleanup - always register cleanup function
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Widget might already be removed
        }
        widgetIdRef.current = null;
      }
    };
  }, [
    sitekey,
    onSuccess,
    onError,
    onExpire,
    theme,
    action,
    size,
    appearance,
    execution,
    language,
  ]);

  return <div ref={containerRef} />;
};

export { Turnstile };
