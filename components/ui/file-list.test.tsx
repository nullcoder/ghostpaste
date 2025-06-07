import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { FileList, FileListSkeleton } from "./file-list";

// Mock modules
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FileList", () => {
  const mockFiles = [
    {
      name: "main.js",
      content: 'console.log("Hello World");',
      size: 27,
      language: "javascript",
    },
    {
      name: "styles.css",
      content: "body { margin: 0; }",
      size: 19,
    },
    {
      name: "README.md",
      content: "# Project\n\nDescription here",
      size: 28,
    },
  ];

  const mockOnCopy = vi.fn();
  const mockOnDownload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/test");
    global.URL.revokeObjectURL = vi.fn();

    // Mock navigator.clipboard
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn(() => Promise.resolve()),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all files with correct information", () => {
    render(<FileList files={mockFiles} />);

    // Check file names
    expect(screen.getByText("main.js")).toBeInTheDocument();
    expect(screen.getByText("styles.css")).toBeInTheDocument();
    expect(screen.getByText("README.md")).toBeInTheDocument();

    // Check file sizes
    expect(screen.getByText("27 B")).toBeInTheDocument();
    expect(screen.getByText("19 B")).toBeInTheDocument();
    expect(screen.getByText("28 B")).toBeInTheDocument();

    // Check line counts
    expect(screen.getByText("1 line")).toBeInTheDocument();
    expect(screen.getAllByText("1 line")).toHaveLength(3);

    // Check language badges
    expect(screen.getByText("javascript")).toBeInTheDocument();
    expect(screen.getByText("css")).toBeInTheDocument();
    expect(screen.getByText("markdown")).toBeInTheDocument();
  });

  it("renders empty state when no files", () => {
    render(<FileList files={[]} />);
    expect(screen.getByText("No files to display")).toBeInTheDocument();
  });

  it("generates correct anchor IDs for deep linking", () => {
    const { container } = render(<FileList files={mockFiles} />);

    expect(container.querySelector("#file-main-js-0")).toBeInTheDocument();
    expect(container.querySelector("#file-styles-css-1")).toBeInTheDocument();
    expect(container.querySelector("#file-readme-md-2")).toBeInTheDocument();
  });

  it("handles copy button click", async () => {
    const user = userEvent.setup();
    render(<FileList files={mockFiles} onCopy={mockOnCopy} />);

    const copyButtons = screen.getAllByLabelText(/Copy .* content/);
    await user.click(copyButtons[0]);

    expect(mockOnCopy).toHaveBeenCalledWith(mockFiles[0]);
  });

  it("handles download button click", async () => {
    const user = userEvent.setup();
    render(<FileList files={mockFiles} onDownload={mockOnDownload} />);

    const downloadButtons = screen.getAllByLabelText(/Download .*/);
    await user.click(downloadButtons[0]);

    expect(mockOnDownload).toHaveBeenCalledWith(mockFiles[0]);
  });

  it("handles download with correct file content", async () => {
    const user = userEvent.setup();

    // Store original methods
    const originalCreateElement = document.createElement.bind(document);
    const originalAppendChild = document.body.appendChild.bind(document.body);
    const originalRemoveChild = document.body.removeChild.bind(document.body);

    // Track calls
    const mockClick = vi.fn();
    let createdAnchor: any = null;

    // Override createElement only for anchor tags
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === "a") {
        createdAnchor = {
          href: "",
          download: "",
          click: mockClick,
          style: {},
        };
        return createdAnchor;
      }
      return originalCreateElement(tagName);
    }) as any;

    // Override appendChild and removeChild
    document.body.appendChild = vi.fn((child) => {
      if (child === createdAnchor) {
        return child;
      }
      return originalAppendChild(child);
    }) as any;

    document.body.removeChild = vi.fn((child) => {
      if (child === createdAnchor) {
        return child;
      }
      return originalRemoveChild(child);
    }) as any;

    render(<FileList files={mockFiles} />);

    const downloadButtons = screen.getAllByLabelText(/Download .*/);
    await user.click(downloadButtons[0]);

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
      expect(createdAnchor.download).toBe("main.js");
    });

    // Restore original methods
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });

  it("displays code editors with correct props", () => {
    const { container } = render(
      <FileList files={mockFiles} showLineNumbers={true} editorHeight="300px" />
    );

    // CodeEditor components should have the correct data attributes
    const editors = container.querySelectorAll("[data-language]");
    expect(editors).toHaveLength(3);
    expect(editors[0]).toHaveAttribute("data-language", "javascript");
    expect(editors[1]).toHaveAttribute("data-language", "css");
    expect(editors[2]).toHaveAttribute("data-language", "markdown");
  });

  it("applies custom className", () => {
    const { container } = render(
      <FileList files={mockFiles} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("detects language when not provided", () => {
    const filesWithoutLanguage = [
      {
        name: "script.py",
        content: "print('Hello')",
        size: 15,
      },
    ];

    render(<FileList files={filesWithoutLanguage} />);
    expect(screen.getByText("python")).toBeInTheDocument();
  });

  it("formats large file sizes correctly", () => {
    const largeFiles = [
      {
        name: "large.txt",
        content: "x".repeat(1500),
        size: 1500,
      },
      {
        name: "huge.txt",
        content: "x".repeat(1500000),
        size: 1500000,
      },
    ];

    render(<FileList files={largeFiles} />);
    expect(screen.getByText("1.46 KB")).toBeInTheDocument();
    expect(screen.getByText("1.43 MB")).toBeInTheDocument();
  });

  it("handles special characters in filenames", () => {
    const specialFiles = [
      {
        name: "file-with-dashes.js",
        content: "test",
        size: 4,
      },
      {
        name: "file.with.dots.txt",
        content: "test",
        size: 4,
      },
    ];

    const { container } = render(<FileList files={specialFiles} />);
    expect(
      container.querySelector("#file-file-with-dashes-js-0")
    ).toBeInTheDocument();
    expect(
      container.querySelector("#file-file-with-dots-txt-1")
    ).toBeInTheDocument();
  });

  it("shows responsive download button text", () => {
    render(<FileList files={mockFiles} />);

    // Check for icon-only buttons on mobile (aria-label present)
    const downloadButtons = screen.getAllByLabelText(/Download .*/);
    expect(downloadButtons).toHaveLength(3);
  });
});

describe("FileListSkeleton", () => {
  it("renders default number of skeletons", () => {
    const { container } = render(<FileListSkeleton />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders custom number of skeletons", () => {
    const { container } = render(<FileListSkeleton count={5} />);
    const cards = container.querySelectorAll(".overflow-hidden");
    expect(cards).toHaveLength(5);
  });

  it("applies custom className", () => {
    const { container } = render(<FileListSkeleton className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
