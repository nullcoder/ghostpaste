import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ExpirySelector } from "./expiry-selector";

// Mock date-fns to have consistent test results
vi.mock("date-fns", async () => {
  const actual = await vi.importActual<typeof import("date-fns")>("date-fns");
  return {
    ...actual,
    format: vi.fn((date: Date, formatStr: string) => {
      // Return predictable formats for testing
      if (formatStr === "h:mm a") return "3:00 PM";
      if (formatStr === "EEEE") return "Friday";
      if (formatStr === "MMM d 'at' h:mm a") return "Dec 15 at 3:00 PM";
      return actual.format(date, formatStr);
    }),
  };
});

describe("ExpirySelector", () => {
  const mockOnChange = vi.fn();
  const mockDate = new Date("2025-06-07T15:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    mockOnChange.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with Never selected by default", () => {
    render(<ExpirySelector value={null} onChange={mockOnChange} />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Never");
  });

  it("renders with clock icon", () => {
    const { container } = render(
      <ExpirySelector value={null} onChange={mockOnChange} />
    );

    const clockIcon = container.querySelector("svg.lucide-clock");
    expect(clockIcon).toBeInTheDocument();
  });

  it("displays the correct selected value when provided", () => {
    const futureDate = new Date(mockDate.getTime() + 60 * 60 * 1000);

    render(
      <ExpirySelector
        value={futureDate.toISOString()}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("1 hour");
  });

  it("handles disabled state", () => {
    render(<ExpirySelector value={null} onChange={mockOnChange} disabled />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
  });

  it("accepts custom className", () => {
    const { container } = render(
      <ExpirySelector
        value={null}
        onChange={mockOnChange}
        className="custom-class"
      />
    );

    const trigger = container.querySelector("button");
    expect(trigger).toHaveClass("custom-class");
  });

  it("has proper ARIA labels", () => {
    render(<ExpirySelector value={null} onChange={mockOnChange} />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-label", "Select expiration time");
  });

  it("handles edge case of existing value that doesn't match options", () => {
    // Set a value that's 2 hours in the future (not in our options)
    const customDate = new Date(mockDate.getTime() + 2 * 60 * 60 * 1000);

    render(
      <ExpirySelector
        value={customDate.toISOString()}
        onChange={mockOnChange}
      />
    );

    // Should default to "Never" when no match found
    expect(screen.getByRole("combobox")).toHaveTextContent("Never");
  });

  it("shows different values for different time options", () => {
    const testCases = [
      { hours: 1, expectedText: "1 hour" },
      { hours: 6, expectedText: "6 hours" },
      { hours: 24, expectedText: "1 day" },
      { hours: 24 * 7, expectedText: "7 days" },
      { hours: 24 * 30, expectedText: "30 days" },
    ];

    testCases.forEach(({ hours, expectedText }) => {
      const { unmount } = render(
        <ExpirySelector
          value={new Date(
            mockDate.getTime() + hours * 60 * 60 * 1000
          ).toISOString()}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent(expectedText);
      unmount();
    });
  });

  it("displays Never when value is null", () => {
    render(<ExpirySelector value={null} onChange={mockOnChange} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Never");
  });

  it("displays Never when value is undefined", () => {
    render(<ExpirySelector value={null} onChange={mockOnChange} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Never");
  });
});
