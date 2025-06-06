import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";

// Mock next-themes at the top level
vi.mock("next-themes", () => {
  const mockSetTheme = vi.fn();
  return {
    useTheme: vi.fn(() => ({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
      systemTheme: "light",
      themes: ["light", "dark"],
      forcedTheme: undefined,
    })),
  };
});

describe("ThemeToggle", () => {
  let mockSetTheme: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Get the mocked module
    const nextThemes = await import("next-themes");
    const useThemeMock = vi.mocked(nextThemes.useTheme);

    // Create fresh mock for each test
    mockSetTheme = vi.fn();
    useThemeMock.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
      resolvedTheme: "light",
      systemTheme: "light",
      themes: ["light", "dark"],
      forcedTheme: undefined,
    });
  });

  it("should render the theme toggle button", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it("should have sun icon visible in light mode", () => {
    render(<ThemeToggle />);
    const sunIcon = screen.getByRole("button").querySelector(".lucide-sun");
    expect(sunIcon).toBeInTheDocument();
    expect(sunIcon).toHaveClass("scale-100");
  });

  it("should call setTheme when clicked", async () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should toggle to light theme when in dark mode", async () => {
    // Update mock for dark mode
    const nextThemes = await import("next-themes");
    const useThemeMock = vi.mocked(nextThemes.useTheme);

    useThemeMock.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
      resolvedTheme: "dark",
      systemTheme: "light",
      themes: ["light", "dark"],
      forcedTheme: undefined,
    });

    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
