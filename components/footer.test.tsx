import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { Footer, FooterWithBuildInfo } from "./footer";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    ...props
  }: React.PropsWithChildren<
    React.AnchorHTMLAttributes<HTMLAnchorElement>
  >) => <a {...props}>{children}</a>,
}));

describe("Footer", () => {
  it("renders branding elements", () => {
    render(<Footer />);

    // Check for logo/text
    expect(screen.getByText("GhostPaste")).toBeInTheDocument();

    // Check for copyright with current year
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(
        `© ${currentYear} GhostPaste. Zero-knowledge encrypted code sharing.`
      )
    ).toBeInTheDocument();
  });

  it("renders navigation links with correct attributes", () => {
    render(<Footer />);

    // Check GitHub link
    const githubLink = screen.getByRole("link", { name: "GitHub" });
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/nullcoder/ghostpaste"
    );
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

    // Check Privacy link
    const privacyLink = screen.getByRole("link", { name: "Privacy" });
    expect(privacyLink).toHaveAttribute("href", "/privacy");
    expect(privacyLink).not.toHaveAttribute("target");

    // Check Terms link
    const termsLink = screen.getByRole("link", { name: "Terms" });
    expect(termsLink).toHaveAttribute("href", "/terms");
    expect(termsLink).not.toHaveAttribute("target");
  });

  it("renders build ID when provided", () => {
    render(<Footer buildId="abc123" />);
    expect(screen.getByText("Build abc123")).toBeInTheDocument();
  });

  it("does not render build info when buildId is not provided", () => {
    render(<Footer />);
    expect(screen.queryByText(/Build/)).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Footer className="custom-footer" />);
    expect(container.querySelector("footer")).toHaveClass("custom-footer");
  });

  it("has proper semantic structure", () => {
    render(<Footer />);

    // Check for footer element
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();

    // Check for navigation element
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      "Footer navigation"
    );
  });

  it("uses responsive classes for layout", () => {
    const { container } = render(<Footer />);

    // Check for responsive flex layout
    const flexContainer = container.querySelector(
      ".flex.flex-col.md\\:flex-row"
    );
    expect(flexContainer).toBeInTheDocument();

    // Check for responsive text alignment
    const brandingSection = container.querySelector(
      ".text-center.md\\:text-left"
    );
    expect(brandingSection).toBeInTheDocument();
  });
});

describe("FooterWithBuildInfo", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("uses NEXT_PUBLIC_BUILD_ID when available", () => {
    process.env.NEXT_PUBLIC_BUILD_ID = "custom-build-123";
    render(<FooterWithBuildInfo />);
    expect(screen.getByText("Build custom-build-123")).toBeInTheDocument();
  });

  it("uses VERCEL_GIT_COMMIT_SHA when NEXT_PUBLIC_BUILD_ID is not available", () => {
    delete process.env.NEXT_PUBLIC_BUILD_ID;
    process.env.VERCEL_GIT_COMMIT_SHA = "abcdef1234567890";
    render(<FooterWithBuildInfo />);
    expect(screen.getByText("Build abcdef1")).toBeInTheDocument();
  });

  it("does not render build info when no env vars are available", () => {
    delete process.env.NEXT_PUBLIC_BUILD_ID;
    delete process.env.VERCEL_GIT_COMMIT_SHA;
    render(<FooterWithBuildInfo />);
    expect(screen.queryByText(/Build/)).not.toBeInTheDocument();
  });
});
