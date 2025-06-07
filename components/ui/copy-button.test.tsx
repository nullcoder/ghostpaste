import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopyButton, CopyTextButton, CopyIconButton } from "./copy-button";

// Mock the copy utility functions
vi.mock("@/lib/copy-to-clipboard", () => ({
  copyToClipboard: vi.fn(),
  copyToClipboardWithRetry: vi.fn(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock console methods to avoid noise in tests
vi.spyOn(console, "error").mockImplementation(() => {});

describe("CopyButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("basic functionality", () => {
    it("renders with default props", () => {
      render(<CopyButton text="test text" />);

      const button = screen.getByRole("button", { name: /copy to clipboard/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("size-9"); // icon size default
    });

    it("renders with custom aria-label", () => {
      render(<CopyButton text="test" aria-label="Copy test content" />);

      const button = screen.getByRole("button", { name: "Copy test content" });
      expect(button).toBeInTheDocument();
    });

    it("renders with custom children", () => {
      render(
        <CopyButton text="test">
          <span>Custom Content</span>
        </CopyButton>
      );

      expect(screen.getByText("Custom Content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<CopyButton text="test" className="custom-class" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("can be disabled", () => {
      render(<CopyButton text="test" disabled />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("copy functionality", () => {
    it("calls copyToClipboard when clicked", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      (copyToClipboard as any).mockResolvedValue({ success: true });

      render(<CopyButton text="test content" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(copyToClipboard).toHaveBeenCalledWith("test content");
    });

    it("calls copyToClipboardWithRetry when useRetry is true", async () => {
      const { copyToClipboardWithRetry } = await import(
        "@/lib/copy-to-clipboard"
      );
      (copyToClipboardWithRetry as any).mockResolvedValue({ success: true });

      render(<CopyButton text="test" useRetry maxRetries={3} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(copyToClipboardWithRetry).toHaveBeenCalledWith("test", 3);
    });

    it("shows success toast on successful copy", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      const { toast } = await import("sonner");

      (copyToClipboard as any).mockResolvedValue({ success: true });

      render(<CopyButton text="test" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Copied to clipboard");
      });
    });

    it("shows custom success message", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      const { toast } = await import("sonner");

      (copyToClipboard as any).mockResolvedValue({ success: true });

      render(<CopyButton text="test" successMessage="Custom success!" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Custom success!");
      });
    });

    it("shows error toast on copy failure", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      const { toast } = await import("sonner");

      (copyToClipboard as any).mockResolvedValue({
        success: false,
        error: "Copy failed",
      });

      render(<CopyButton text="test" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Copy failed");
      });
    });

    it("shows custom error message", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      const { toast } = await import("sonner");

      (copyToClipboard as any).mockResolvedValue({
        success: false,
        error: "Original error",
      });

      render(<CopyButton text="test" errorMessage="Custom error!" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Custom error!");
      });
    });

    it("calls onCopy callback with result", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      const onCopy = vi.fn();
      const result = { success: true };

      (copyToClipboard as any).mockResolvedValue(result);

      render(<CopyButton text="test" onCopy={onCopy} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledWith(result);
      });
    });
  });

  describe("visual feedback", () => {
    it("shows check icon on successful copy", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      (copyToClipboard as any).mockResolvedValue({ success: true });

      render(<CopyButton text="test" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute("aria-label", "Copied to clipboard");
      });
    });

    it("can disable visual feedback", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      (copyToClipboard as any).mockResolvedValue({ success: true });

      render(<CopyButton text="test" showVisualFeedback={false} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        // Should not change to "Copied to clipboard"
        expect(button).toHaveAttribute("aria-label", "Copy to clipboard");
      });
    });

    it("can disable toast notifications", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      const { toast } = await import("sonner");

      (copyToClipboard as any).mockResolvedValue({ success: true });

      render(<CopyButton text="test" showToast={false} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(copyToClipboard).toHaveBeenCalled();
      });

      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("shows loading state during copy operation", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");

      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const copyPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (copyToClipboard as any).mockReturnValue(copyPromise);

      render(<CopyButton text="test" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      // Button should be disabled during loading
      expect(button).toBeDisabled();

      // Resolve the promise
      resolvePromise!({ success: true });

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });

    it("prevents multiple simultaneous copy operations", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");

      let resolvePromise: (value: any) => void;
      const copyPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (copyToClipboard as any).mockReturnValue(copyPromise);

      render(<CopyButton text="test" />);

      const button = screen.getByRole("button");

      // Click multiple times
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Should only call copyToClipboard once
      expect(copyToClipboard).toHaveBeenCalledTimes(1);

      resolvePromise!({ success: true });
    });
  });

  describe("error handling", () => {
    it("handles unexpected errors gracefully", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      const { toast } = await import("sonner");

      (copyToClipboard as any).mockRejectedValue(new Error("Unexpected error"));

      render(<CopyButton text="test" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "An unexpected error occurred"
        );
      });
    });

    it("calls onCopy with error info on exception", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      const onCopy = vi.fn();

      (copyToClipboard as any).mockRejectedValue(new Error("Test error"));

      render(<CopyButton text="test" onCopy={onCopy} showToast={false} />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledWith({
          success: false,
          error: "Test error",
        });
      });
    });
  });

  describe("variants and styling", () => {
    it("applies correct variant classes", () => {
      render(<CopyButton text="test" variant="outline" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("border");
    });

    it("applies correct size classes", () => {
      render(<CopyButton text="test" size="lg" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10");
    });

    it("shows success styling when copy succeeds", async () => {
      const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
      (copyToClipboard as any).mockResolvedValue({ success: true });

      render(<CopyButton text="test" />);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass("bg-green-50");
      });
    });
  });
});

describe("CopyTextButton", () => {
  it("renders with text label", () => {
    render(<CopyTextButton text="test content" label="Copy Code" />);

    expect(screen.getByText("Copy Code")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toHaveClass("gap-2"); // Should have gap for icon + text
  });

  it("uses default label", () => {
    render(<CopyTextButton text="test" />);

    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("applies outline variant by default", () => {
    render(<CopyTextButton text="test" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("border");
  });
});

describe("CopyIconButton", () => {
  it("renders as icon-only button", () => {
    render(<CopyIconButton text="test content" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("h-7", "w-7");
    expect(button).toHaveAttribute("aria-label", "Copy to clipboard");
  });

  it("applies ghost variant by default", () => {
    render(<CopyIconButton text="test" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("hover:bg-accent");
  });
});

describe("accessibility", () => {
  it("has proper ARIA labels", () => {
    render(<CopyButton text="test" />);

    const button = screen.getByRole("button", { name: /copy to clipboard/i });
    expect(button).toBeInTheDocument();
  });

  it("updates aria-label on success", async () => {
    const { copyToClipboard } = await import("@/lib/copy-to-clipboard");
    (copyToClipboard as any).mockResolvedValue({ success: true });

    render(<CopyButton text="test" />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute("aria-label", "Copied to clipboard");
    });
  });

  it("supports keyboard navigation", () => {
    render(<CopyButton text="test" />);

    const button = screen.getByRole("button");
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it("maintains focus during loading", async () => {
    const { copyToClipboard } = await import("@/lib/copy-to-clipboard");

    let resolvePromise: (value: any) => void;
    const copyPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (copyToClipboard as any).mockReturnValue(copyPromise);

    render(<CopyButton text="test" />);

    const button = screen.getByRole("button");
    button.focus();
    fireEvent.click(button);

    expect(document.activeElement).toBe(button);

    resolvePromise!({ success: true });

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
