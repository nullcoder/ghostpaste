import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GistViewer } from "./gist-viewer";
import type { File } from "@/types";

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock CodeEditor component
vi.mock("@/components/ui/code-editor", () => ({
  CodeEditor: ({
    value,
    language,
    readOnly,
  }: {
    value: string;
    language?: string;
    readOnly?: boolean;
  }) => (
    <div data-testid="code-editor" data-readonly={readOnly}>
      <div data-testid="code-content">{value}</div>
      <div data-testid="code-language">{language}</div>
    </div>
  ),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

// Mock clipboard API globally
const mockWriteText = vi.fn();
Object.defineProperty(global.navigator, "clipboard", {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
});

describe("GistViewer", () => {
  const mockFiles: File[] = [
    {
      name: "example.js",
      content: "console.log('Hello, world!');",
      language: "javascript",
    },
    {
      name: "styles.css",
      content: "body { margin: 0; }",
      language: "css",
    },
    {
      name: "index.html",
      content: "<h1>Hello</h1>",
      language: "html",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with no files", () => {
    render(<GistViewer files={[]} />);
    expect(screen.getByText("No files to display")).toBeInTheDocument();
  });

  it("renders all files in vertical layout", () => {
    render(<GistViewer files={mockFiles} />);

    // Check all file names are displayed
    expect(screen.getByText("example.js")).toBeInTheDocument();
    expect(screen.getByText("styles.css")).toBeInTheDocument();
    expect(screen.getByText("index.html")).toBeInTheDocument();

    // Check all file contents are displayed
    const codeContents = screen.getAllByTestId("code-content");
    expect(codeContents).toHaveLength(3);
    expect(codeContents[0]).toHaveTextContent("console.log('Hello, world!');");
    expect(codeContents[1]).toHaveTextContent("body { margin: 0; }");
    expect(codeContents[2]).toHaveTextContent("<h1>Hello</h1>");
  });

  it("displays file icons for each file", () => {
    render(<GistViewer files={mockFiles} />);

    // Should have a file icon for each file
    const fileHeaders = screen.getAllByText(
      /example\.js|styles\.css|index\.html/
    );
    expect(fileHeaders).toHaveLength(3);

    // Each file should have its name displayed
    expect(screen.getByText("example.js")).toBeInTheDocument();
    expect(screen.getByText("styles.css")).toBeInTheDocument();
    expect(screen.getByText("index.html")).toBeInTheDocument();
  });

  it("toggles line numbers", () => {
    render(<GistViewer files={mockFiles} />);

    const lineNumbersBtn = screen.getByRole("button", {
      name: /Line Numbers: On/i,
    });
    fireEvent.click(lineNumbersBtn);

    expect(
      screen.getByRole("button", { name: /Line Numbers: Off/i })
    ).toBeInTheDocument();
  });

  it("toggles word wrap", () => {
    render(<GistViewer files={mockFiles} />);

    const wordWrapBtn = screen.getByRole("button", { name: /Word Wrap: Off/i });
    fireEvent.click(wordWrapBtn);

    expect(
      screen.getByRole("button", { name: /Word Wrap: On/i })
    ).toBeInTheDocument();
  });

  it("copies file content to clipboard", async () => {
    render(<GistViewer files={mockFiles} />);

    // Find the copy button using test ID
    const copyButton = screen.getByTestId("copy-example.js");

    // Simulate clicking the button directly
    fireEvent.click(copyButton);

    // Wait for async clipboard operation
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockWriteText).toHaveBeenCalledWith(
        "console.log('Hello, world!');"
      );
    });
  });

  it("downloads individual file", async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();
    // Mock createElement to track download
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, "createElement");
    createElementSpy.mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        element.click = mockClick;
      }
      return element;
    });

    // Spy on appendChild and removeChild without mocking
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    render(<GistViewer files={mockFiles} />);

    // Find the download button for the first file
    const downloadButton = screen.getByRole("button", {
      name: /Download example.js/i,
    });

    // Click the download button
    await user.click(downloadButton);

    expect(mockClick).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();

    const appendedElements = appendChildSpy.mock.calls.map((call) => call[0]);
    const anchor = appendedElements.find(
      (el) => (el as HTMLElement).tagName === "A"
    ) as HTMLAnchorElement | undefined;
    expect(anchor).toBeDefined();
    expect(anchor?.download).toBe("example.js");
    expect(anchor?.href).toBe("blob:mock-url");
  });

  it("downloads all files", async () => {
    const user = userEvent.setup();
    const mockClick = vi.fn();

    // Mock createElement for download
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        element.click = mockClick;
      }
      return element;
    });

    render(<GistViewer files={mockFiles} />);

    const downloadAllBtn = screen.getByRole("button", {
      name: /download all/i,
    });
    await user.click(downloadAllBtn);

    // Should trigger download for each file
    expect(mockClick).toHaveBeenCalledTimes(3);
  });

  it("renders with custom className", () => {
    const { container } = render(
      <GistViewer files={mockFiles} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("shows CodeEditor in read-only mode", () => {
    render(<GistViewer files={mockFiles} />);

    const codeEditors = screen.getAllByTestId("code-editor");
    codeEditors.forEach((editor) => {
      expect(editor).toHaveAttribute("data-readonly", "true");
    });
  });

  it("handles missing language gracefully", () => {
    const filesWithoutLang: File[] = [
      {
        name: "notes.txt",
        content: "Some plain text",
      },
    ];

    render(<GistViewer files={filesWithoutLang} />);

    expect(screen.getByText("Some plain text")).toBeInTheDocument();
    expect(screen.getByTestId("code-language")).toHaveTextContent("");
  });

  it("displays multiple files with same content correctly", () => {
    const duplicateFiles: File[] = [
      {
        name: "file1.js",
        content: "const x = 1;",
        language: "javascript",
      },
      {
        name: "file2.js",
        content: "const x = 1;",
        language: "javascript",
      },
    ];

    render(<GistViewer files={duplicateFiles} />);

    expect(screen.getByText("file1.js")).toBeInTheDocument();
    expect(screen.getByText("file2.js")).toBeInTheDocument();

    const codeContents = screen.getAllByTestId("code-content");
    expect(codeContents).toHaveLength(2);
    expect(codeContents[0]).toHaveTextContent("const x = 1;");
    expect(codeContents[1]).toHaveTextContent("const x = 1;");
  });
});
