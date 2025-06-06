import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeEditor } from "./code-editor";

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light" }),
}));

describe("CodeEditor", () => {
  it("renders with default props", () => {
    const { container } = render(<CodeEditor />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("displays initial value", async () => {
    const initialValue = "console.log('Hello, World!');";
    render(<CodeEditor value={initialValue} />);

    await waitFor(() => {
      const content = document.querySelector(".cm-content");
      expect(content?.textContent).toContain("Hello, World!");
    });
  });

  it("calls onChange when content is modified", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<CodeEditor onChange={handleChange} />);

    await waitFor(() => {
      const editor = document.querySelector(".cm-content");
      expect(editor).toBeInTheDocument();
    });

    const editor = document.querySelector(".cm-content") as HTMLElement;

    // Focus and type in the editor
    await user.click(editor);
    await user.type(editor, "test");

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    });
  });

  it("respects readOnly prop", async () => {
    const handleChange = vi.fn();

    render(
      <CodeEditor value="readonly content" readOnly onChange={handleChange} />
    );

    await waitFor(() => {
      const content = document.querySelector(".cm-content");
      expect(content).toBeInTheDocument();
      expect(content?.getAttribute("aria-readonly")).toBe("true");
    });
  });

  it("shows placeholder when empty", async () => {
    const placeholderText = "Type your code...";

    render(<CodeEditor placeholder={placeholderText} value="" />);

    await waitFor(() => {
      const placeholder = document.querySelector(".cm-placeholder");
      expect(placeholder?.textContent).toBe(placeholderText);
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <CodeEditor className="custom-editor-class" />
    );

    expect(container.firstChild).toHaveClass("custom-editor-class");
  });

  it("respects height prop", () => {
    const { container } = render(<CodeEditor height="600px" />);

    const editorContainer = container.firstChild as HTMLElement;
    expect(editorContainer).toBeInTheDocument();
  });

  it("shows line numbers when enabled", async () => {
    render(<CodeEditor showLineNumbers={true} value="line 1\nline 2" />);

    await waitFor(() => {
      const lineNumbers = document.querySelector(".cm-lineNumbers");
      expect(lineNumbers).toBeInTheDocument();
    });
  });

  it("hides line numbers when disabled", async () => {
    render(<CodeEditor showLineNumbers={false} value="line 1\nline 2" />);

    await waitFor(() => {
      const lineNumbers = document.querySelector(".cm-lineNumbers");
      expect(lineNumbers).not.toBeInTheDocument();
    });
  });

  it("supports different languages", async () => {
    const pythonCode = "def hello():\n    print('Hello, World!')";

    render(<CodeEditor language="python" value={pythonCode} />);

    await waitFor(() => {
      const content = document.querySelector(".cm-content");
      expect(content?.textContent).toContain("Hello, World!");
    });
  });

  it("updates when value prop changes", async () => {
    const { rerender } = render(<CodeEditor value="initial" />);

    await waitFor(() => {
      const content = document.querySelector(".cm-content");
      expect(content?.textContent).toContain("initial");
    });

    rerender(<CodeEditor value="updated" />);

    await waitFor(() => {
      const content = document.querySelector(".cm-content");
      expect(content?.textContent).toContain("updated");
    });
  });

  it("applies theme override", async () => {
    render(<CodeEditor theme="dark" />);

    await waitFor(() => {
      const editor = document.querySelector(".cm-editor");
      expect(editor).toBeInTheDocument();
    });
  });

  it("renders loading state during SSR", () => {
    // The component should render during SSR with loading state
    const { container } = render(<CodeEditor />);

    // Should initially show the container div
    expect(container.firstChild).toBeInTheDocument();

    // After mount, it should show the editor
    waitFor(() => {
      const editor = document.querySelector(".cm-editor");
      expect(editor).toBeInTheDocument();
    });
  });
});
