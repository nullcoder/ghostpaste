import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./header";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

describe("Header", () => {
  it("renders with logo and navigation", () => {
    render(<Header />);

    // Check logo
    expect(screen.getByText("GhostPaste")).toBeInTheDocument();

    // Check desktop navigation links
    expect(screen.getByRole("link", { name: "Create" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();

    // Check theme toggles (both desktop and mobile)
    const themeToggles = screen.getAllByRole("button", {
      name: "Toggle theme",
    });
    expect(themeToggles).toHaveLength(2); // One for desktop, one for mobile
  });

  it("includes skip to main content link", () => {
    render(<Header />);

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveClass("sr-only");
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("shows mobile menu button on small screens", () => {
    render(<Header />);

    const mobileMenuButton = screen.getByRole("button", {
      name: "Open navigation menu",
    });
    expect(mobileMenuButton).toBeInTheDocument();
    expect(mobileMenuButton).toHaveClass("md:hidden");
  });

  it("opens and closes mobile menu", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const mobileMenuButton = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    // Open menu
    await user.click(mobileMenuButton);

    // Check if sheet content is visible
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Check mobile navigation links
    const mobileNav = screen.getByRole("dialog");
    expect(mobileNav).toContainElement(screen.getAllByText("Create")[1]);
    expect(mobileNav).toContainElement(screen.getAllByText("About")[1]);
    expect(mobileNav).toContainElement(screen.getAllByText("GitHub")[1]);

    // Close menu by clicking a link
    const createLink = screen.getAllByText("Create")[1];
    await user.click(createLink);

    // Menu should be closed (dialog removed from DOM)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has correct link hrefs", () => {
    render(<Header />);

    // Desktop links
    const desktopCreateLink = screen.getByRole("link", { name: "Create" });
    expect(desktopCreateLink).toHaveAttribute("href", "/create");

    const desktopAboutLink = screen.getByRole("link", { name: "About" });
    expect(desktopAboutLink).toHaveAttribute("href", "/about");

    // GitHub link (external)
    const githubLinks = screen.getAllByRole("link", { name: /GitHub/i });
    githubLinks.forEach((link) => {
      expect(link).toHaveAttribute(
        "href",
        "https://github.com/nullcoder/ghostpaste"
      );
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("logo links to home page", () => {
    render(<Header />);

    const logoLink = screen.getByRole("link", { name: /GhostPaste/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("has sticky positioning", () => {
    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("sticky", "top-0", "z-50");
  });

  it("applies proper backdrop blur", () => {
    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass(
      "bg-background/95",
      "backdrop-blur",
      "supports-[backdrop-filter]:bg-background/60"
    );
  });

  it("mobile menu closes on escape key", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const mobileMenuButton = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    // Open menu
    await user.click(mobileMenuButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Press escape
    await user.keyboard("{Escape}");

    // Menu should be closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mobile menu has proper aria labels", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const mobileMenuButton = screen.getByRole("button", {
      name: "Open navigation menu",
    });

    await user.click(mobileMenuButton);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    // Check close button
    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(closeButton).toBeInTheDocument();
  });
});
