import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  useGlobalShortcuts,
  getPlatformKey,
  getPlatformKeyName,
  isMacPlatform,
  formatShortcut,
} from "./use-global-shortcuts";

describe("Platform detection", () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.stubGlobal("navigator", { platform: "MacIntel" });
  });

  afterEach(() => {
    vi.stubGlobal("navigator", originalNavigator);
  });

  it("detects Mac platform", () => {
    vi.stubGlobal("navigator", { platform: "MacIntel" });
    expect(getPlatformKey()).toBe("⌘");
    expect(getPlatformKeyName()).toBe("Cmd");
    expect(isMacPlatform()).toBe(true);
  });

  it("detects iPhone platform", () => {
    vi.stubGlobal("navigator", { platform: "iPhone" });
    expect(getPlatformKey()).toBe("⌘");
    expect(getPlatformKeyName()).toBe("Cmd");
    expect(isMacPlatform()).toBe(true);
  });

  it("detects non-Mac platform", () => {
    vi.stubGlobal("navigator", { platform: "Win32" });
    expect(getPlatformKey()).toBe("Ctrl");
    expect(getPlatformKeyName()).toBe("Ctrl");
    expect(isMacPlatform()).toBe(false);
  });

  it("handles undefined navigator", () => {
    vi.stubGlobal("navigator", undefined);
    expect(getPlatformKey()).toBe("Ctrl");
    expect(getPlatformKeyName()).toBe("Ctrl");
    expect(isMacPlatform()).toBe(false);
  });
});

describe("formatShortcut", () => {
  it("formats shortcuts for Mac", () => {
    vi.stubGlobal("navigator", { platform: "MacIntel" });
    expect(formatShortcut("Cmd/Ctrl + S")).toBe("⌘ + S");
    expect(formatShortcut("Cmd + Enter")).toBe("⌘ + Enter");
  });

  it("formats shortcuts for PC", () => {
    vi.stubGlobal("navigator", { platform: "Win32" });
    expect(formatShortcut("Cmd/Ctrl + S")).toBe("Ctrl + S");
    expect(formatShortcut("Ctrl + Enter")).toBe("Ctrl + Enter");
  });
});

describe("useGlobalShortcuts", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", { platform: "MacIntel" });
  });

  it("calls onSave when Cmd+S is pressed", () => {
    const onSave = vi.fn();
    renderHook(() => useGlobalShortcuts({ onSave }));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        metaKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("calls onSave when Ctrl+S is pressed", () => {
    const onSave = vi.fn();
    renderHook(() => useGlobalShortcuts({ onSave }));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when Cmd+Enter is pressed", () => {
    const onSubmit = vi.fn();
    renderHook(() => useGlobalShortcuts({ onSubmit }));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        metaKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls onEscape when Escape is pressed", () => {
    const onEscape = vi.fn();
    renderHook(() => useGlobalShortcuts({ onEscape }));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "Escape",
      });
      window.dispatchEvent(event);
    });

    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("calls onHelp when Cmd+? is pressed", () => {
    const onHelp = vi.fn();
    renderHook(() => useGlobalShortcuts({ onHelp }));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "?",
        metaKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onHelp).toHaveBeenCalledTimes(1);
  });

  it("calls onHelp when Cmd+/ is pressed", () => {
    const onHelp = vi.fn();
    renderHook(() => useGlobalShortcuts({ onHelp }));

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "/",
        metaKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onHelp).toHaveBeenCalledTimes(1);
  });

  it("prevents default behavior for shortcuts", () => {
    const onSave = vi.fn();
    renderHook(() => useGlobalShortcuts({ onSave }));

    const event = new KeyboardEvent("keydown", {
      key: "s",
      metaKey: true,
    });
    const preventDefault = vi.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it("does not prevent default for Escape", () => {
    const onEscape = vi.fn();
    renderHook(() => useGlobalShortcuts({ onEscape }));

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
    });
    const preventDefault = vi.spyOn(event, "preventDefault");

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("respects enabled flag", () => {
    const onSave = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useGlobalShortcuts({ onSave, enabled }),
      { initialProps: { enabled: false } }
    );

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        metaKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onSave).not.toHaveBeenCalled();

    // Enable shortcuts
    rerender({ enabled: true });

    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        metaKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("handles async handlers", async () => {
    const onSave = vi.fn().mockResolvedValueOnce(undefined);
    renderHook(() => useGlobalShortcuts({ onSave }));

    await act(async () => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        metaKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("handles handler errors gracefully", async () => {
    const error = new Error("Save failed");
    const onSave = vi.fn().mockRejectedValueOnce(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderHook(() => useGlobalShortcuts({ onSave }));

    await act(async () => {
      const event = new KeyboardEvent("keydown", {
        key: "s",
        metaKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(consoleSpy).toHaveBeenCalledWith("Save shortcut error:", error);
    consoleSpy.mockRestore();
  });

  it("cleans up event listeners on unmount", () => {
    const onSave = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useGlobalShortcuts({ onSave }));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });
});
