"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorBoundary, withErrorBoundary } from "@/components/error-boundary";
import { AppError, ErrorCode } from "@/types/errors";

// Component that throws an error when triggered
function ErrorThrower({
  shouldThrow = false,
  errorType = "generic",
}: {
  shouldThrow?: boolean;
  errorType?: string;
}) {
  if (shouldThrow) {
    switch (errorType) {
      case "app-error":
        throw new AppError(
          ErrorCode.DECRYPTION_FAILED,
          400,
          "This is a custom app error for testing"
        );
      case "chunk-error":
        const chunkError = new Error("Loading chunk 123 failed");
        chunkError.name = "ChunkLoadError";
        throw chunkError;
      case "network-error":
        throw new Error("Network request failed");
      case "generic":
      default:
        throw new Error("This is a generic test error");
    }
  }
  return (
    <div className="p-4 text-green-600">✅ Component is working fine!</div>
  );
}

// Component wrapped with HOC
const WrappedErrorThrower = withErrorBoundary(ErrorThrower, {
  showReset: true,
  showHome: false,
});

export default function ErrorBoundaryDemo() {
  const [globalError, setGlobalError] = useState(false);
  const [globalErrorType, setGlobalErrorType] = useState("generic");
  const [localError, setLocalError] = useState(false);
  const [localErrorType, setLocalErrorType] = useState("generic");
  const [hocError, setHocError] = useState(false);
  const [hocErrorType, setHocErrorType] = useState("generic");

  const handleCustomFallback = (error: Error) => (
    <div className="rounded-md border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
      <h3 className="font-medium text-purple-800 dark:text-purple-200">
        Custom Error Handler
      </h3>
      <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
        Caught: {error.message}
      </p>
    </div>
  );

  const errorTypes = [
    { value: "generic", label: "Generic Error" },
    { value: "app-error", label: "App Error (with code)" },
    { value: "chunk-error", label: "Chunk Load Error" },
    { value: "network-error", label: "Network Error" },
  ];

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ErrorBoundary Demo
          </h1>
          <p className="text-muted-foreground mt-2">
            Demo of the ErrorBoundary component with different error scenarios
            and configurations.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Global Error Boundary Test */}
          <Card>
            <CardHeader>
              <CardTitle>Global Error Boundary</CardTitle>
              <CardDescription>
                Test the app-level error boundary that catches all unhandled
                errors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Error Type:</label>
                <select
                  value={globalErrorType}
                  onChange={(e) => setGlobalErrorType(e.target.value)}
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                >
                  {errorTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => setGlobalError(true)}
                variant="destructive"
                className="w-full"
              >
                Trigger Global Error
              </Button>

              <div className="rounded-md border p-4">
                <ErrorThrower
                  shouldThrow={globalError}
                  errorType={globalErrorType}
                />
              </div>
            </CardContent>
          </Card>

          {/* Local Error Boundary Test */}
          <Card>
            <CardHeader>
              <CardTitle>Local Error Boundary</CardTitle>
              <CardDescription>
                Test a local error boundary that only catches errors in a
                specific component tree.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Error Type:</label>
                <select
                  value={localErrorType}
                  onChange={(e) => setLocalErrorType(e.target.value)}
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                >
                  {errorTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => setLocalError(true)}
                variant="destructive"
                className="w-full"
              >
                Trigger Local Error
              </Button>

              <ErrorBoundary>
                <div className="rounded-md border p-4">
                  <ErrorThrower
                    shouldThrow={localError}
                    errorType={localErrorType}
                  />
                </div>
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* Custom Fallback Test */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Fallback UI</CardTitle>
              <CardDescription>
                Test error boundary with a custom fallback component instead of
                the default UI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setHocError(true)}
                variant="destructive"
                className="w-full"
              >
                Trigger Custom Fallback
              </Button>

              <ErrorBoundary fallback={handleCustomFallback}>
                <div className="rounded-md border p-4">
                  <ErrorThrower shouldThrow={hocError} errorType="generic" />
                </div>
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* HOC Error Boundary Test */}
          <Card>
            <CardHeader>
              <CardTitle>HOC Error Boundary</CardTitle>
              <CardDescription>
                Test the withErrorBoundary higher-order component wrapper.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Error Type:</label>
                <select
                  value={hocErrorType}
                  onChange={(e) => setHocErrorType(e.target.value)}
                  className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                >
                  {errorTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={() => setHocError(true)}
                variant="destructive"
                className="w-full"
              >
                Trigger HOC Error
              </Button>

              <div className="rounded-md border p-4">
                <WrappedErrorThrower
                  shouldThrow={hocError}
                  errorType={hocErrorType}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features Demonstrated</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">✅ Error Handling Features</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• React Error Boundary implementation</li>
                <li>• Integration with app error system</li>
                <li>• Custom error message formatting</li>
                <li>• Error logging to console and logger</li>
                <li>• Recovery actions (reset, go home)</li>
                <li>• Development vs production error details</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">🎨 UI Features</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Consistent with shadcn/ui design system</li>
                <li>• Dark/light theme support</li>
                <li>• Mobile-responsive layout</li>
                <li>• Accessibility support (ARIA, keyboard nav)</li>
                <li>• Custom fallback component support</li>
                <li>• Higher-order component wrapper</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Error Types</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">🔴 Error Categories</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  • <strong>Generic:</strong> Standard JavaScript errors
                </li>
                <li>
                  • <strong>App Error:</strong> Custom errors with error codes
                </li>
                <li>
                  • <strong>Chunk Load:</strong> Application resource loading
                  failures
                </li>
                <li>
                  • <strong>Network:</strong> Network connectivity issues
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">🛠️ Recovery Actions</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  • <strong>Try Again:</strong> Resets error boundary state
                </li>
                <li>
                  • <strong>Go Home:</strong> Navigates to homepage
                </li>
                <li>
                  • <strong>Custom Fallback:</strong> Alternative error UI
                </li>
                <li>
                  • <strong>Error Logging:</strong> Automatic error reporting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
