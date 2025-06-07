import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { GhostLogo } from "./ghost-logo";

describe("GhostLogo", () => {
  it("renders correctly with default props", () => {
    const { container } = render(<GhostLogo />);
    const svg = container.querySelector("svg");

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 32 32");
    expect(svg).toHaveClass("h-6", "w-6");
  });

  it("applies custom className", () => {
    const { container } = render(<GhostLogo className="text-red-500" />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveClass("text-red-500");
  });

  it("applies correct size classes", () => {
    const { container: smallContainer } = render(<GhostLogo size="sm" />);
    const { container: mediumContainer } = render(<GhostLogo size="md" />);
    const { container: largeContainer } = render(<GhostLogo size="lg" />);

    expect(smallContainer.querySelector("svg")).toHaveClass("h-4", "w-4");
    expect(mediumContainer.querySelector("svg")).toHaveClass("h-6", "w-6");
    expect(largeContainer.querySelector("svg")).toHaveClass("h-8", "w-8");
  });

  it("contains ghost body path", () => {
    const { container } = render(<GhostLogo />);
    const path = container.querySelector("path");

    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute("fill", "currentColor");
  });

  it("contains bracket eyes", () => {
    const { container } = render(<GhostLogo />);
    const textElements = container.querySelectorAll("text");

    expect(textElements).toHaveLength(2);
    expect(textElements[0]).toHaveTextContent("<");
    expect(textElements[1]).toHaveTextContent(">");
  });

  it("contains binary dots", () => {
    const { container } = render(<GhostLogo />);
    const circles = container.querySelectorAll("circle");

    expect(circles).toHaveLength(3);
    circles.forEach((circle) => {
      expect(circle).toHaveAttribute("fill", "white");
    });
  });

  it("has proper accessibility attributes", () => {
    const { container } = render(<GhostLogo />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
