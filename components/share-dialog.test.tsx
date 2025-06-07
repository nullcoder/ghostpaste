import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShareDialog } from "./share-dialog";

// Mock clipboard API
const mockWriteText = vi.fn();
Object.defineProperty(global.navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
});

// Mock document.execCommand for fallback
Object.defineProperty(document, "execCommand", {
  value: vi.fn(() => true),
  writable: true,
  configurable: true,
});

// Mock URL.createObjectURL and revokeObjectURL
Object.defineProperty(global.URL, "createObjectURL", {
  value: vi.fn(() => "mock-blob-url"),
  writable: true,
});

Object.defineProperty(global.URL, "revokeObjectURL", {
  value: vi.fn(),
  writable: true,
});

describe("ShareDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    shareUrl: "https://ghostpaste.dev/g/abc123#key=eyJhbGciOiJBMTI4R0NNIn0",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any existing timeouts
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders when open", () => {
    render(<ShareDialog {...defaultProps} />);

    expect(screen.getByText("Gist Created Successfully!")).toBeInTheDocument();
    expect(screen.getByText("Your secure link:")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<ShareDialog {...defaultProps} open={false} />);

    expect(
      screen.queryByText("Gist Created Successfully!")
    ).not.toBeInTheDocument();
  });

  it("displays URL with fragment separation", () => {
    render(<ShareDialog {...defaultProps} />);

    // Base URL should be visible
    expect(
      screen.getByText("https://ghostpaste.dev/g/abc123")
    ).toBeInTheDocument();
    // Fragment should be visible with special styling
    expect(
      screen.getByText("#key=eyJhbGciOiJBMTI4R0NNIn0")
    ).toBeInTheDocument();
  });

  it("displays security warning", () => {
    render(<ShareDialog {...defaultProps} />);

    expect(screen.getByText("Important Security Notice")).toBeInTheDocument();
    expect(screen.getByText(/The blue part after/)).toBeInTheDocument();
    expect(screen.getByText(/complete URL/)).toBeInTheDocument();
  });

  it("calls copy function when copy button is clicked", () => {
    mockWriteText.mockResolvedValue(undefined);
    const onCopy = vi.fn();

    render(<ShareDialog {...defaultProps} onCopy={onCopy} />);

    const copyButton = screen.getByLabelText("Copy URL to clipboard");
    fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(defaultProps.shareUrl);
  });

  it("shows copy button initially", () => {
    render(<ShareDialog {...defaultProps} />);

    expect(screen.getByText("Copy Link")).toBeInTheDocument();
  });

  it("attempts fallback when clipboard API fails", () => {
    mockWriteText.mockRejectedValue(new Error("Clipboard not available"));

    render(<ShareDialog {...defaultProps} />);

    const copyButton = screen.getByLabelText("Copy URL to clipboard");
    fireEvent.click(copyButton);

    // Should attempt the clipboard API first
    expect(mockWriteText).toHaveBeenCalledWith(defaultProps.shareUrl);
  });

  it("downloads text file when download button is clicked", () => {
    const onDownload = vi.fn();
    const createElementSpy = vi.spyOn(document, "createElement");
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    render(<ShareDialog {...defaultProps} onDownload={onDownload} />);

    const downloadButton = screen.getByText("Download as Text");
    fireEvent.click(downloadButton);

    expect(createElementSpy).toHaveBeenCalledWith("a");
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(onDownload).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });

  it("includes gist title in download content when provided", () => {
    const gistTitle = "My Test Gist";
    let blobContent = "";

    // Mock Blob to capture content
    const originalBlob = global.Blob;
    global.Blob = vi.fn().mockImplementation((content) => {
      blobContent = content[0];
      return new originalBlob(content);
    }) as unknown as typeof Blob;

    render(<ShareDialog {...defaultProps} gistTitle={gistTitle} />);

    const downloadButton = screen.getByText("Download as Text");
    fireEvent.click(downloadButton);

    expect(blobContent).toContain(`Title: ${gistTitle}`);
    expect(blobContent).toContain(defaultProps.shareUrl);
    expect(blobContent).toContain(
      "IMPORTANT: This URL contains a decryption key"
    );

    // Restore original Blob
    global.Blob = originalBlob;
  });

  it("calls onOpenChange when dialog is closed", () => {
    const onOpenChange = vi.fn();

    render(<ShareDialog {...defaultProps} onOpenChange={onOpenChange} />);

    const doneButton = screen.getByText("Done");
    fireEvent.click(doneButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("handles URLs without fragments", () => {
    const urlWithoutFragment = "https://ghostpaste.dev/g/abc123";

    render(<ShareDialog {...defaultProps} shareUrl={urlWithoutFragment} />);

    expect(
      screen.getByText("https://ghostpaste.dev/g/abc123")
    ).toBeInTheDocument();
    // Should not render any blue fragment text (the # in security warning doesn't count)
    expect(screen.queryByText(/^#key=/)).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(<ShareDialog {...defaultProps} />);

    // Dialog should have proper ARIA attributes
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Copy button should have aria-label
    const copyButton = screen.getByLabelText("Copy URL to clipboard");
    expect(copyButton).toBeInTheDocument();

    // Close button should have screen reader text
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("has copy button that can be clicked", () => {
    mockWriteText.mockResolvedValue(undefined);

    render(<ShareDialog {...defaultProps} />);

    const copyButton = screen.getByLabelText("Copy URL to clipboard");
    expect(copyButton).toBeEnabled();
  });

  it("formats download filename correctly with title", () => {
    let downloadAttribute = "";

    // Mock anchor element creation
    const originalCreateElement = document.createElement;
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "a") {
        const element = originalCreateElement.call(document, tagName);
        Object.defineProperty(element, "download", {
          set: (value) => {
            downloadAttribute = value;
          },
          get: () => downloadAttribute,
          configurable: true,
        });
        return element;
      }
      return originalCreateElement.call(document, tagName);
    });

    render(<ShareDialog {...defaultProps} gistTitle="My Test @ Gist!" />);

    const downloadButton = screen.getByText("Download as Text");
    fireEvent.click(downloadButton);

    expect(downloadAttribute).toBe("ghostpaste-My-Test---Gist-.txt");
  });

  it("uses default filename when no title provided", () => {
    let downloadAttribute = "";

    // Mock anchor element creation
    const originalCreateElement = document.createElement;
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "a") {
        const element = originalCreateElement.call(document, tagName);
        Object.defineProperty(element, "download", {
          set: (value) => {
            downloadAttribute = value;
          },
          get: () => downloadAttribute,
          configurable: true,
        });
        return element;
      }
      return originalCreateElement.call(document, tagName);
    });

    render(<ShareDialog {...defaultProps} />);

    const downloadButton = screen.getByText("Download as Text");
    fireEvent.click(downloadButton);

    expect(downloadAttribute).toBe("ghostpaste-gist.txt");
  });
});
