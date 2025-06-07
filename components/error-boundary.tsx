"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { logger } from "@/lib/logger";
import { AppError, ErrorCode } from "@/types/errors";

interface ErrorBoundaryProps {
  /** Child components to render */
  children: ReactNode;
  /** Optional fallback component to render on error */
  fallback?: (error: Error, errorInfo: React.ErrorInfo) => ReactNode;
  /** Optional error handler for custom logging/reporting */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Show reset button to attempt recovery */
  showReset?: boolean;
  /** Show home button to navigate back */
  showHome?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors anywhere in the child
 * component tree and displays a fallback UI instead of crashing the app.
 *
 * Features:
 * - Integrates with existing error handling system
 * - Consistent UI design with shadcn/ui components
 * - Optional custom fallback rendering
 * - Error logging and reporting
 * - Recovery actions (reset, navigate home)
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Log the error using the app's logger
    logger.error("React Error Boundary caught an error", error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: "ErrorBoundary",
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In development, also log to console for easier debugging
    if (process.env.NODE_ENV === "development") {
      console.group("🚨 ErrorBoundary Caught Error");
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.groupEnd();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    // Navigate to home page
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  getErrorMessage(): string {
    const { error } = this.state;
    if (!error) return "An unexpected error occurred";

    // Handle AppError instances
    if (error instanceof AppError) {
      return error.message;
    }

    // Handle specific error types
    if (error.name === "ChunkLoadError") {
      return "Failed to load application resources. Please refresh the page.";
    }

    if (error.message.includes("Loading chunk")) {
      return "Application update detected. Please refresh the page.";
    }

    if (error.message.includes("Network")) {
      return "Network error occurred. Please check your connection and try again.";
    }

    // Default to error message, but sanitize it
    return error.message || "Something went wrong";
  }

  getErrorCode(): ErrorCode | null {
    const { error } = this.state;
    if (error instanceof AppError) {
      return error.code;
    }
    return null;
  }

  render() {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      showReset = true,
      showHome = true,
    } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo!);
      }

      // Default fallback UI
      const errorMessage = this.getErrorMessage();
      const errorCode = this.getErrorCode();
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6">
          <Card className="mx-auto max-w-md">
            <CardHeader className="text-center">
              <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <AlertTriangle className="text-destructive h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred while rendering this page.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="border-destructive bg-destructive/5 rounded-md border-l-4 p-4">
                <p className="text-destructive text-sm font-medium">
                  {errorMessage}
                </p>
                {errorCode && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Error code: {errorCode}
                  </p>
                )}
              </div>

              {isDevelopment && error.stack && (
                <details className="text-xs">
                  <summary className="text-muted-foreground hover:text-foreground cursor-pointer font-medium">
                    Technical Details (Development)
                  </summary>
                  <pre className="bg-muted mt-2 overflow-auto rounded border p-2 text-xs whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                  {errorInfo?.componentStack && (
                    <pre className="bg-muted mt-2 overflow-auto rounded border p-2 text-xs whitespace-pre-wrap">
                      Component Stack:{errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              {showReset && (
                <Button
                  onClick={this.handleReset}
                  variant="default"
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              {showHome && (
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook-based wrapper for the ErrorBoundary component.
 * Useful for functional components that need error boundary functionality.
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
