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
    // Temporarily remove window.turnstile to simulate script not loaded yet
    const originalTurnstile = window.turnstile;
    delete (window as any).turnstile;

    const { container } = render(
      <Turnstile
        sitekey="test-site-key"
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onExpire={mockOnExpire}
      />
    );

    // Restore window.turnstile and call the callback
    window.turnstile = originalTurnstile;
    window.onloadTurnstileCallback?.();

    // Wait for widget to render
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

  it("cleans up widget on unmount", () => {
    const { unmount } = render(
      <Turnstile sitekey="test-site-key" onSuccess={mockOnSuccess} />
    );

    // Widget should render immediately since window.turnstile exists
    expect(mockRender).toHaveBeenCalled();
    expect(mockRender).toHaveReturnedWith("widget-123");

    // Clear all mocks to ensure clean state for testing cleanup
    mockRender.mockClear();

    unmount();

    expect(mockRemove).toHaveBeenCalledWith("widget-123");
  });

  it("renders immediately when turnstile is already loaded", () => {
    // Turnstile is already set up in beforeEach
    render(<Turnstile sitekey="test-site-key" onSuccess={mockOnSuccess} />);

    // Should render immediately without needing the callback
    expect(mockRender).toHaveBeenCalled();
  });

  it("checks script is loaded with correct parameters", async () => {
    // Remove existing script if any
    const existingScript = document.getElementById("cf-turnstile-script");
    existingScript?.remove();

    // Temporarily remove window.turnstile
    delete (window as any).turnstile;

    render(<Turnstile sitekey="test-site-key" onSuccess={mockOnSuccess} />);

    // Check that script was added
    const script = document.getElementById("cf-turnstile-script");
    expect(script).toBeTruthy();
    expect(script?.getAttribute("src")).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onloadTurnstileCallback"
    );

    // Check that callback was set
    expect(window.onloadTurnstileCallback).toBeDefined();
  });
});
