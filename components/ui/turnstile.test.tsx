import { render, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { Turnstile } from "./turnstile";

describe("Turnstile", () => {
  const mockRender = vi.fn().mockReturnValue("widget-123");
  const mockReset = vi.fn();
  const mockRemove = vi.fn();
  const mockOnSuccess = vi.fn();
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
        onSuccess={mockOnSuccess}
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
          appearance: "interaction-only",
          execution: "render",
          language: "auto",
        })
      );
    });

    // Check container exists
    const turnstileContainer = container.querySelector("div");
    expect(turnstileContainer).toBeInTheDocument();

    // Test that callbacks are properly forwarded
    const renderCall = mockRender.mock.calls[0][1];

    // Test onSuccess callback
    renderCall.callback("test-token");
    expect(mockOnSuccess).toHaveBeenCalledWith("test-token");

    // Test onError callback
    renderCall["error-callback"]();
    expect(mockOnError).toHaveBeenCalled();

    // Test onExpire callback
    renderCall["expired-callback"]();
    expect(mockOnExpire).toHaveBeenCalled();
  });

  it("applies custom theme and size", async () => {
    render(
      <Turnstile
        sitekey="test-site-key"
        onSuccess={mockOnSuccess}
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
      <Turnstile sitekey="test-site-key" onSuccess={mockOnSuccess} />
    );

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    });

    unmount();

    expect(mockRemove).toHaveBeenCalledWith("widget-123");
  });

  it("checks script is loaded", async () => {
    render(<Turnstile sitekey="test-site-key" onSuccess={mockOnSuccess} />);

    // Check that script was added
    const script = document.getElementById("cf-turnstile-script");
    expect(script).toBeTruthy();
    expect(script?.getAttribute("src")).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/api.js"
    );
  });
});
