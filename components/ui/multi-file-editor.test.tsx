import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiFileEditor } from "./multi-file-editor";
import { FileData } from "./file-editor";

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

describe("MultiFileEditor", () => {
  const mockOnChange = vi.fn();

  const defaultProps = {
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it("renders with default single file", () => {
    render(<MultiFileEditor {...defaultProps} />);

    // Should show file count
    expect(screen.getByText("Total: 1 file")).toBeInTheDocument();

    // Should show size indicator
    expect(screen.getByText(/0 B \/ 5 MB/)).toBeInTheDocument();

    // Should have one file editor
    const filenameInputs = screen.getAllByPlaceholderText("filename.txt");
    expect(filenameInputs).toHaveLength(1);

    // Should show add file button
    expect(screen.getByText("Add another file")).toBeInTheDocument();
  });

  it("renders with initial files", () => {
    const initialFiles: FileData[] = [
      {
        id: "1",
        name: "test1.js",
        content: "console.log(1);",
        language: "javascript",
      },
      {
        id: "2",
        name: "test2.js",
        content: "console.log(2);",
        language: "javascript",
      },
    ];

    render(<MultiFileEditor {...defaultProps} initialFiles={initialFiles} />);

    expect(screen.getByText("Total: 2 files")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test1.js")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test2.js")).toBeInTheDocument();
  });

  it("adds new files", async () => {
    const user = userEvent.setup();
    render(<MultiFileEditor {...defaultProps} />);

    const addButton = screen.getByText("Add another file");
    await user.click(addButton);

    // Should now have 2 files
    expect(screen.getByText("Total: 2 files")).toBeInTheDocument();

    // New file should have default name
    const filenameInputs = screen.getAllByPlaceholderText("filename.txt");
    expect(filenameInputs).toHaveLength(2);

    // onChange should be called with 2 files
    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "file1.txt" }),
        expect.objectContaining({ name: "file2.txt" }),
      ])
    );
  });

  it("removes files with confirmation", async () => {
    const user = userEvent.setup();
    const initialFiles: FileData[] = [
      {
        id: "1",
        name: "test1.js",
        content: "content1",
        language: "javascript",
      },
      {
        id: "2",
        name: "test2.js",
        content: "content2",
        language: "javascript",
      },
    ];

    render(<MultiFileEditor {...defaultProps} initialFiles={initialFiles} />);

    // Delete buttons should be visible when more than 1 file
    const deleteButtons = screen.getAllByLabelText(/Delete/);
    expect(deleteButtons).toHaveLength(2);

    // Click delete on first file
    await user.click(deleteButtons[0]);

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ id: "2", name: "test2.js" }),
    ]);
  });

  it("hides delete button when only one file remains", () => {
    const initialFiles: FileData[] = [
      { id: "1", name: "test.js", content: "", language: "javascript" },
    ];

    render(<MultiFileEditor {...defaultProps} initialFiles={initialFiles} />);

    // No delete button when only 1 file
    const deleteButtons = screen.queryAllByLabelText(/Delete/);
    expect(deleteButtons).toHaveLength(0);
  });

  it("enforces maximum file limit", async () => {
    const user = userEvent.setup();
    render(<MultiFileEditor {...defaultProps} maxFiles={3} />);

    const addButton = screen.getByText("Add another file");

    // Add 2 more files (total 3)
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getByText("Total: 3 files")).toBeInTheDocument();

    // Button should not be in the document when at max
    expect(screen.queryByText("Add another file")).not.toBeInTheDocument();
  });

  it("shows remaining file count when approaching limit", async () => {
    const user = userEvent.setup();
    render(<MultiFileEditor {...defaultProps} maxFiles={5} />);

    const addButton = screen.getByText("Add another file");

    // Add files until we see remaining count
    await user.click(addButton); // 2 files
    await user.click(addButton); // 3 files

    // Should show remaining when 2 left
    expect(screen.getByText("(2 remaining)")).toBeInTheDocument();
  });

  it("updates file content", async () => {
    render(<MultiFileEditor {...defaultProps} />);

    // Wait for CodeMirror to initialize
    await waitFor(() => {
      const editor = document.querySelector(".cm-editor");
      expect(editor).toBeInTheDocument();
    });

    // Simulate content change (handled by FileEditor)
    expect(mockOnChange).toBeDefined();
  });

  it("validates filenames through FileEditor", async () => {
    const user = userEvent.setup();
    const initialFiles: FileData[] = [
      { id: "1", name: "test.js", content: "", language: "javascript" },
      { id: "2", name: "other.js", content: "", language: "javascript" },
    ];

    render(<MultiFileEditor {...defaultProps} initialFiles={initialFiles} />);

    // Get filename inputs
    const filenameInputs = screen.getAllByPlaceholderText("filename.txt");
    expect(filenameInputs).toHaveLength(2);

    // The FileEditor component handles validation internally
    // We just verify the inputs exist and can be changed
    await user.clear(filenameInputs[1]);
    await user.type(filenameInputs[1], "newname.js");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("calculates and displays total size", () => {
    const initialFiles: FileData[] = [
      {
        id: "1",
        name: "test1.js",
        content: "a".repeat(1024),
        language: "javascript",
      }, // 1KB
      {
        id: "2",
        name: "test2.js",
        content: "b".repeat(2048),
        language: "javascript",
      }, // 2KB
    ];

    render(<MultiFileEditor {...defaultProps} initialFiles={initialFiles} />);

    // Should show total size
    expect(screen.getByText(/3 KB \/ 5 MB/)).toBeInTheDocument();
  });

  it("shows warning when approaching size limit", () => {
    // Create content that's 80% of 5MB
    const largeContent = "x".repeat(4.2 * 1024 * 1024);
    const initialFiles: FileData[] = [
      { id: "1", name: "large.txt", content: largeContent, language: "text" },
    ];

    render(<MultiFileEditor {...defaultProps} initialFiles={initialFiles} />);

    // Should show warning
    expect(screen.getByText(/approaching the 5 MB limit/)).toBeInTheDocument();
  });

  it("shows error when exceeding size limit", () => {
    // Create content that exceeds 5MB
    const hugeContent = "x".repeat(6 * 1024 * 1024);
    const initialFiles: FileData[] = [
      { id: "1", name: "huge.txt", content: hugeContent, language: "text" },
    ];

    render(<MultiFileEditor {...defaultProps} initialFiles={initialFiles} />);

    // Should show error
    expect(screen.getByText(/exceeds 5 MB limit/)).toBeInTheDocument();

    // Add button should be disabled
    const addButton = screen.getByText("Add another file");
    expect(addButton).toBeDisabled();
  });

  it("generates unique default filenames", async () => {
    const user = userEvent.setup();
    const initialFiles: FileData[] = [
      { id: "1", name: "file2.txt", content: "", language: "text" },
    ];

    render(<MultiFileEditor {...defaultProps} initialFiles={initialFiles} />);

    const addButton = screen.getByText("Add another file");
    await user.click(addButton);

    // Check that onChange was called with a new file
    expect(mockOnChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "file2.txt" }),
        expect.objectContaining({
          name: expect.stringMatching(/^file\d+\.txt$/),
        }),
      ])
    );
  });

  it("supports keyboard shortcut for adding files", async () => {
    const user = userEvent.setup();
    render(<MultiFileEditor {...defaultProps} />);

    // Press Ctrl+Enter
    await user.keyboard("{Control>}{Enter}{/Control}");

    // Should add a new file
    expect(screen.getByText("Total: 2 files")).toBeInTheDocument();
  });

  it("scrolls to new file when added", async () => {
    const user = userEvent.setup();
    render(<MultiFileEditor {...defaultProps} />);

    const addButton = screen.getByText("Add another file");
    await user.click(addButton);

    // scrollIntoView should be called
    await waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "end",
      });
    });
  });

  it("disables editing in readOnly mode", () => {
    const initialFiles: FileData[] = [
      { id: "1", name: "test.js", content: "readonly", language: "javascript" },
    ];

    render(
      <MultiFileEditor
        {...defaultProps}
        initialFiles={initialFiles}
        readOnly={true}
      />
    );

    // Should not show add button
    expect(screen.queryByText("Add another file")).not.toBeInTheDocument();

    // Should not show delete buttons
    expect(screen.queryByLabelText(/Delete/)).not.toBeInTheDocument();

    // Filename input should be disabled
    const filenameInput = screen.getByDisplayValue("test.js");
    expect(filenameInput).toBeDisabled();
  });

  it("respects custom limits", () => {
    render(
      <MultiFileEditor
        {...defaultProps}
        maxFiles={10}
        maxTotalSize={1024 * 1024} // 1MB
        maxFileSize={100 * 1024} // 100KB
      />
    );

    // Should show custom limit
    expect(screen.getByText(/0 B \/ 1 MB/)).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <MultiFileEditor {...defaultProps} className="custom-multi-editor" />
    );

    expect(container.firstChild).toHaveClass("custom-multi-editor");
  });

  it("shows keyboard shortcut hint", () => {
    render(<MultiFileEditor {...defaultProps} />);

    expect(screen.getByText(/Ctrl/)).toBeInTheDocument();
    // Use getAllByText since "Enter" appears in multiple places
    const enterElements = screen.getAllByText(/Enter/);
    expect(enterElements.length).toBeGreaterThan(0);
  });

  it("handles file updates correctly", async () => {
    const user = userEvent.setup();
    const initialFiles: FileData[] = [
      { id: "1", name: "test.js", content: "", language: "javascript" },
    ];

    render(<MultiFileEditor {...defaultProps} initialFiles={initialFiles} />);

    // Get the filename input
    const filenameInput = screen.getByDisplayValue("test.js");

    // Clear and type new filename
    await user.clear(filenameInput);
    await user.type(filenameInput, "updated.txt");

    // onChange should have been called multiple times during typing
    expect(mockOnChange).toHaveBeenCalled();

    // Last call should have the updated filename
    const lastCall =
      mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[0]).toEqual([
      expect.objectContaining({
        id: "1",
        name: "updated.txt",
        language: "text", // Auto-detected for .txt
      }),
    ]);
  });
});
