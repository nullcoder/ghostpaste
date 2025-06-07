import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary, withErrorBoundary } from "./error-boundary";
import { AppError, ErrorCode } from "@/types/errors";

// Mock the logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

// Mock console methods to avoid noise in tests
vi.spyOn(console, "error").mockImplementation(() => {});
vi.spyOn(console, "group").mockImplementation(() => {});
vi.spyOn(console, "groupEnd").mockImplementation(() => {});

// Test component that throws an error
function ThrowError({
  shouldThrow = false,
  errorToThrow,
}: {
  shouldThrow?: boolean;
  errorToThrow?: Error;
}) {
  if (shouldThrow) {
    throw errorToThrow || new Error("Test error");
  }
  return <div>No error</div>;
}

// Test component that works normally
function WorkingComponent() {
  return <div>Working component</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("does not render error boundary UI when there is no error", () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("catches and displays errors from child components", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(
        "An unexpected error occurred while rendering this page."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("displays default error UI with action buttons", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Go Home")).toBeInTheDocument();
  });

  it("handles AppError instances correctly", () => {
    const appError = new AppError(
      ErrorCode.DECRYPTION_FAILED,
      400,
      "Custom app error"
    );

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorToThrow={appError} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom app error")).toBeInTheDocument();
    expect(
      screen.getByText("Error code: DECRYPTION_FAILED")
    ).toBeInTheDocument();
  });

  it("handles chunk load errors with appropriate message", () => {
    const chunkError = new Error("Loading chunk 123 failed");
    chunkError.name = "ChunkLoadError";

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorToThrow={chunkError} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(
        "Failed to load application resources. Please refresh the page."
      )
    ).toBeInTheDocument();
  });

  it("handles network errors with appropriate message", () => {
    const networkError = new Error("Network request failed");

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorToThrow={networkError} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText(
        "Network error occurred. Please check your connection and try again."
      )
    ).toBeInTheDocument();
  });

  it("can hide reset button when showReset is false", () => {
    render(
      <ErrorBoundary showReset={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    expect(screen.getByText("Go Home")).toBeInTheDocument();
  });

  it("can hide home button when showHome is false", () => {
    render(
      <ErrorBoundary showHome={false}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.queryByText("Go Home")).not.toBeInTheDocument();
  });

  it("resets error state when Try Again is clicked", () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click Try Again
    fireEvent.click(screen.getByText("Try Again"));

    // Re-render with working component
    rerender(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    // Should show working component
    expect(screen.getByText("Working component")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("navigates to home when Go Home is clicked", () => {
    // Mock window.location
    const originalLocation = window.location;
    const mockLocation = { ...originalLocation, href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText("Go Home"));

    expect(window.location.href).toBe("/");

    // Restore original location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("calls onError callback when provided", () => {
    const onError = vi.fn();
    const testError = new Error("Test error for callback");

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} errorToThrow={testError} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      testError,
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("uses custom fallback when provided", () => {
    const customFallback = (error: Error) => (
      <div>Custom error: {error.message}</div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError
          shouldThrow={true}
          errorToThrow={new Error("Custom test error")}
        />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Custom error: Custom test error")
    ).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("logs errors using the app logger", async () => {
    const { logger } = await import("@/lib/logger");

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(logger.error).toHaveBeenCalledWith(
      "React Error Boundary caught an error",
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
        errorBoundary: "ErrorBoundary",
      })
    );
  });

  it("shows technical details in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Technical Details (Development)")
    ).toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it("hides technical details in production mode", () => {
    vi.stubEnv("NODE_ENV", "production");

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(
      screen.queryByText("Technical Details (Development)")
    ).not.toBeInTheDocument();

    vi.unstubAllEnvs();
  });

  it("handles errors without messages gracefully", () => {
    const errorWithoutMessage = new Error("");
    errorWithoutMessage.message = "";

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} errorToThrow={errorWithoutMessage} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});

describe("withErrorBoundary HOC", () => {
  it("wraps component with ErrorBoundary", () => {
    const WrappedComponent = withErrorBoundary(WorkingComponent);

    render(<WrappedComponent />);

    expect(screen.getByText("Working component")).toBeInTheDocument();
  });

  it("catches errors in wrapped component", () => {
    const WrappedThrowError = withErrorBoundary(ThrowError);

    render(<WrappedThrowError shouldThrow={true} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("passes error boundary props to wrapped component", () => {
    const WrappedThrowError = withErrorBoundary(ThrowError, {
      showReset: false,
      showHome: false,
    });

    render(<WrappedThrowError shouldThrow={true} />);

    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
    expect(screen.queryByText("Go Home")).not.toBeInTheDocument();
  });

  it("sets correct display name", () => {
    const WrappedComponent = withErrorBoundary(WorkingComponent);
    expect(WrappedComponent.displayName).toBe(
      "withErrorBoundary(WorkingComponent)"
    );

    const WrappedFunction = withErrorBoundary(() => <div>Test</div>);
    expect(WrappedFunction.displayName).toBe("withErrorBoundary()");
  });
});

describe("ErrorBoundary accessibility", () => {
  it("has proper ARIA roles and labels", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Buttons should be properly labeled
    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    const goHomeButton = screen.getByRole("button", { name: /go home/i });

    expect(tryAgainButton).toBeInTheDocument();
    expect(goHomeButton).toBeInTheDocument();
  });

  it("supports keyboard navigation", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const tryAgainButton = screen.getByText("Try Again");
    const goHomeButton = screen.getByText("Go Home");

    // Both buttons should be focusable
    tryAgainButton.focus();
    expect(document.activeElement).toBe(tryAgainButton);

    goHomeButton.focus();
    expect(document.activeElement).toBe(goHomeButton);
  });
});
