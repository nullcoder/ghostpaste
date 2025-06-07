import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import {
  LoadingState,
  LoadingSkeleton,
  LoadingSpinner,
  LoadingProgress,
  EditorSkeleton,
  useDelayedLoading,
} from "./loading-state";
import { renderHook, act } from "@testing-library/react";

describe("LoadingState", () => {
  it("renders skeleton variant", () => {
    const { container } = render(<LoadingState type="skeleton" />);
    // Check for skeleton elements
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders spinner variant with message", () => {
    render(<LoadingState type="spinner" message="Loading data..." />);
    expect(screen.getByText("Loading data...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders progress variant with percentage", () => {
    render(
      <LoadingState type="progress" message="Uploading..." progress={75} />
    );
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "75"
    );
  });

  it("renders fullscreen overlay when fullscreen prop is true", () => {
    const { container } = render(
      <LoadingState type="spinner" fullscreen={true} />
    );
    const overlay = container.querySelector(".fixed.inset-0");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("z-50");
  });

  it("applies custom className", () => {
    const { container } = render(
      <LoadingState type="spinner" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("sets custom aria-label", () => {
    render(
      <LoadingState
        type="spinner"
        message="Loading..."
        ariaLabel="Custom loading message"
      />
    );
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Custom loading message"
    );
  });
});

describe("LoadingSkeleton", () => {
  it("renders skeleton structure", () => {
    const { container } = render(<LoadingSkeleton />);
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

describe("LoadingSpinner", () => {
  it("renders with default message", () => {
    render(<LoadingSpinner />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders with custom message", () => {
    render(<LoadingSpinner message="Please wait..." />);
    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });

  it("has proper ARIA attributes", () => {
    render(<LoadingSpinner message="Loading..." />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-label", "Loading...");
  });

  it("applies custom className", () => {
    render(<LoadingSpinner className="custom-spinner" />);
    expect(screen.getByRole("status")).toHaveClass("custom-spinner");
  });
});

describe("LoadingProgress", () => {
  it("renders with progress bar", () => {
    render(<LoadingProgress progress={50} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("clamps progress values between 0 and 100", () => {
    const { rerender } = render(<LoadingProgress progress={-10} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
    expect(screen.getByText("0%")).toBeInTheDocument();

    rerender(<LoadingProgress progress={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<LoadingProgress message="Uploading files..." progress={30} />);
    expect(screen.getByText("Uploading files...")).toBeInTheDocument();
  });

  it("has proper ARIA attributes", () => {
    render(<LoadingProgress progress={60} ariaLabel="File upload progress" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "60");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    expect(progressbar).toHaveAttribute("aria-label", "File upload progress");
  });
});

describe("EditorSkeleton", () => {
  it("renders editor skeleton structure", () => {
    const { container } = render(<EditorSkeleton />);
    // Should have multiple skeleton elements for editor UI
    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(5);
  });

  it("applies custom className", () => {
    const { container } = render(<EditorSkeleton className="custom-editor" />);
    expect(container.firstChild).toHaveClass("custom-editor");
  });
});

describe("useDelayedLoading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false initially when loading is true", () => {
    const { result } = renderHook(() => useDelayedLoading(true, 100));
    expect(result.current).toBe(false);
  });

  it("returns true after delay when loading is true", async () => {
    const { result } = renderHook(() => useDelayedLoading(true, 100));

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(true);
  });

  it("returns false when loading is false", () => {
    const { result } = renderHook(() => useDelayedLoading(false, 100));
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(false);
  });

  it("resets to false when loading changes from true to false", () => {
    const { result, rerender } = renderHook(
      ({ loading }) => useDelayedLoading(loading, 100),
      { initialProps: { loading: true } }
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);

    rerender({ loading: false });
    expect(result.current).toBe(false);
  });

  it("uses default delay of 100ms when not specified", () => {
    const { result } = renderHook(() => useDelayedLoading(true));

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(99);
    });
    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe(true);
  });
});
