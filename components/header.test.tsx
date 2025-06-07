import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./header";

// Mock next-themes used by ThemeToggle
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
    systemTheme: "light",
    themes: ["light", "dark"],
    forcedTheme: undefined,
  }),
}));

describe("Header", () => {
  it("renders logo and navigation links", () => {
    render(<Header />);
    expect(
      screen.getByRole("link", { name: /ghostpaste/i })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /create/i })[0]
    ).toBeInTheDocument();
  });

  it("toggles mobile navigation", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const toggle = screen.getByLabelText(/toggle menu/i);
    expect(
      screen.queryByLabelText("Mobile navigation")
    ).not.toBeInTheDocument();

    await user.click(toggle);
    expect(screen.getByLabelText("Mobile navigation")).toBeInTheDocument();

    await user.click(toggle);
    expect(
      screen.queryByLabelText("Mobile navigation")
    ).not.toBeInTheDocument();
  });
});
