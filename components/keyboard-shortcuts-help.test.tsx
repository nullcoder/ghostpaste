import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  KeyboardShortcutsHelp,
  KeyboardShortcut,
} from "./keyboard-shortcuts-help";

describe("KeyboardShortcutsHelp", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
    vi.stubGlobal("navigator", { platform: "MacIntel" });
  });

  it("renders dialog when open", () => {
    render(
      <KeyboardShortcutsHelp open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    expect(
      screen.getByText("Quick actions to improve your workflow")
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <KeyboardShortcutsHelp open={false} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });

  it("shows Mac shortcuts on Mac platform", () => {
    render(
      <KeyboardShortcutsHelp open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText("⌘ + ?")).toBeInTheDocument();
    expect(screen.getByText("⌘ + S")).toBeInTheDocument();
    expect(screen.getByText("⌘ + Enter")).toBeInTheDocument();
  });

  it("shows PC shortcuts on non-Mac platform", () => {
    vi.stubGlobal("navigator", { platform: "Win32" });

    render(
      <KeyboardShortcutsHelp open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText("Ctrl + ?")).toBeInTheDocument();
    expect(screen.getByText("Ctrl + S")).toBeInTheDocument();
    expect(screen.getByText("Ctrl + Enter")).toBeInTheDocument();
  });

  it("displays all shortcut groups", () => {
    render(
      <KeyboardShortcutsHelp open={true} onOpenChange={mockOnOpenChange} />
    );

    // Group headers
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Gist Actions")).toBeInTheDocument();
    expect(screen.getByText("Editor Shortcuts")).toBeInTheDocument();

    // General shortcuts
    expect(screen.getByText("Show keyboard shortcuts")).toBeInTheDocument();
    expect(screen.getByText("Close dialog/Cancel action")).toBeInTheDocument();
    expect(screen.getByText("Navigate forward")).toBeInTheDocument();
    expect(screen.getByText("Navigate backward")).toBeInTheDocument();

    // Gist actions
    expect(screen.getByText("Save gist")).toBeInTheDocument();
    expect(screen.getByText("Create or update gist")).toBeInTheDocument();

    // Editor shortcuts
    expect(screen.getByText("Select all")).toBeInTheDocument();
    expect(screen.getByText("Undo")).toBeInTheDocument();
    expect(screen.getByText("Redo")).toBeInTheDocument();
    expect(screen.getByText("Find in file")).toBeInTheDocument();
    expect(screen.getByText("Insert tab/spaces")).toBeInTheDocument();
  });

  it("shows context information for shortcuts", () => {
    render(
      <KeyboardShortcutsHelp open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText("When editing")).toBeInTheDocument();
    expect(screen.getByText("In forms")).toBeInTheDocument();
    expect(screen.getAllByText("In editor")).toHaveLength(5);
  });

  it("calls onOpenChange when dialog is closed", async () => {
    const user = userEvent.setup();
    render(
      <KeyboardShortcutsHelp open={true} onOpenChange={mockOnOpenChange} />
    );

    // Find and click the close button
    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("applies custom className", () => {
    const { container } = render(
      <KeyboardShortcutsHelp
        open={true}
        onOpenChange={mockOnOpenChange}
        className="custom-class"
      />
    );

    // Find any element with our custom class to ensure it's applied
    const elementWithCustomClass =
      container.querySelector(".custom-class") ||
      document.querySelector(".custom-class");
    expect(elementWithCustomClass).toBeInTheDocument();
  });

  it("shows tip at the bottom", () => {
    render(
      <KeyboardShortcutsHelp open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(
      screen.getByText(/These shortcuts are designed to work/i)
    ).toBeInTheDocument();
  });
});

describe("KeyboardShortcut", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", { platform: "MacIntel" });
  });

  it("renders shortcut with Mac key", () => {
    render(<KeyboardShortcut keys="Cmd/Ctrl + S" />);
    expect(screen.getByText("⌘ + S")).toBeInTheDocument();
  });

  it("renders shortcut with PC key", () => {
    vi.stubGlobal("navigator", { platform: "Win32" });
    render(<KeyboardShortcut keys="Cmd/Ctrl + S" />);
    expect(screen.getByText("Ctrl + S")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<KeyboardShortcut keys="Escape" className="custom-kbd" />);
    const kbd = screen.getByText("Escape");
    expect(kbd).toHaveClass("custom-kbd");
  });

  it("formats multiple platform keys in one string", () => {
    render(<KeyboardShortcut keys="Cmd + Shift + A" />);
    expect(screen.getByText("⌘ + Shift + A")).toBeInTheDocument();
  });
});
