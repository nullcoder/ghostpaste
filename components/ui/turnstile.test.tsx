import { render, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { Turnstile } from "./turnstile";

// Mock Next.js Script component
vi.mock("next/script", () => ({
  default: ({ onLoad }: { onLoad: () => void }) => {
    // Simulate script loading
    setTimeout(() => onLoad(), 0);
    return null;
  },
}));

describe("Turnstile", () => {
  const mockRender = vi.fn().mockReturnValue("widget-123");
  const mockReset = vi.fn();
  const mockRemove = vi.fn();
  const mockOnVerify = vi.fn();
  const mockOnError = vi.fn();
  const mockOnExpire = vi.fn();

  beforeEach(() => {
    // Mock window.turnstile
    global.window.turnstile = {
      render: mockRender,
      reset: mockReset,
      remove: mockRemove,
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    delete (global.window as any).turnstile;
  });

  it("renders turnstile widget when script loads", async () => {
    const { container } = render(
      <Turnstile
        sitekey="test-site-key"
        onVerify={mockOnVerify}
        onError={mockOnError}
        onExpire={mockOnExpire}
      />
    );

    // Wait for script to load and widget to render
    await waitFor(() => {
      expect(mockRender).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          sitekey: "test-site-key",
          callback: expect.any(Function),
          "error-callback": expect.any(Function),
          "expired-callback": expect.any(Function),
          theme: "auto",
          size: "normal",
        })
      );
    });

    // Check container exists
    const turnstileContainer = container.querySelector(".cf-turnstile");
    expect(turnstileContainer).toBeInTheDocument();

    // Test that callbacks are properly forwarded
    const renderCall = mockRender.mock.calls[0][1];

    // Test onVerify callback
    renderCall.callback("test-token");
    expect(mockOnVerify).toHaveBeenCalledWith("test-token");

    // Test onError callback
    renderCall["error-callback"]("test-error");
    expect(mockOnError).toHaveBeenCalledWith("test-error");

    // Test onExpire callback
    renderCall["expired-callback"]();
    expect(mockOnExpire).toHaveBeenCalled();
  });

  it("applies custom theme and size", async () => {
    render(
      <Turnstile
        sitekey="test-site-key"
        onVerify={mockOnVerify}
        theme="dark"
        size="compact"
      />
    );

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        expect.objectContaining({
          theme: "dark",
          size: "compact",
        })
      );
    });
  });

  it("cleans up widget on unmount", async () => {
    const { unmount } = render(
      <Turnstile sitekey="test-site-key" onVerify={mockOnVerify} />
    );

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    });

    unmount();

    expect(mockRemove).toHaveBeenCalledWith("widget-123");
  });

  it("handles render errors gracefully", async () => {
    mockRender.mockImplementationOnce(() => {
      throw new Error("Render failed");
    });

    render(
      <Turnstile
        sitekey="test-site-key"
        onVerify={mockOnVerify}
        onError={mockOnError}
      />
    );

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        "Failed to load verification widget"
      );
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <Turnstile
        sitekey="test-site-key"
        onVerify={mockOnVerify}
        className="custom-class"
      />
    );

    const turnstileContainer = container.querySelector(".cf-turnstile");
    expect(turnstileContainer).toHaveClass("custom-class");
  });

  it("applies correct height classes based on size", () => {
    const { container: container1 } = render(
      <Turnstile
        sitekey="test-site-key"
        onVerify={mockOnVerify}
        size="compact"
      />
    );
    expect(container1.querySelector(".cf-turnstile")).toHaveClass("h-[65px]");

    const { container: container2 } = render(
      <Turnstile
        sitekey="test-site-key"
        onVerify={mockOnVerify}
        size="normal"
      />
    );
    expect(container2.querySelector(".cf-turnstile")).toHaveClass("h-[65px]");

    const { container: container3 } = render(
      <Turnstile
        sitekey="test-site-key"
        onVerify={mockOnVerify}
        size="flexible"
      />
    );
    expect(container3.querySelector(".cf-turnstile")).toHaveClass(
      "min-h-[65px]"
    );

    const { container: container4 } = render(
      <Turnstile
        sitekey="test-site-key"
        onVerify={mockOnVerify}
        size="invisible"
      />
    );
    expect(container4.querySelector(".cf-turnstile")).toHaveClass("h-0");
  });
});
