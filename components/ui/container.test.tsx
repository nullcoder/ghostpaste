import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Container } from "./container";

describe("Container", () => {
  it("renders with default variant", () => {
    const { container } = render(
      <Container>
        <div>Test content</div>
      </Container>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("max-w-screen-xl");
    expect(element).toHaveClass("mx-auto");
    expect(element).toHaveClass("px-4");
    expect(element).toHaveClass("md:px-8");
    expect(element).toHaveClass("lg:px-12");
  });

  it("renders with narrow variant", () => {
    const { container } = render(
      <Container variant="narrow">
        <div>Test content</div>
      </Container>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("max-w-3xl");
  });

  it("renders with wide variant", () => {
    const { container } = render(
      <Container variant="wide">
        <div>Test content</div>
      </Container>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("max-w-screen-2xl");
  });

  it("renders with full variant", () => {
    const { container } = render(
      <Container variant="full">
        <div>Test content</div>
      </Container>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("max-w-full");
  });

  it("applies prose classes when prose prop is true", () => {
    const { container } = render(
      <Container prose>
        <h1>Title</h1>
        <p>Content</p>
      </Container>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("prose");
    expect(element).toHaveClass("prose-slate");
    expect(element).toHaveClass("dark:prose-invert");
  });

  it("accepts custom className", () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Test content</div>
      </Container>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("custom-class");
  });

  it("renders with custom element type", () => {
    const { container } = render(
      <Container as="section">
        <div>Test content</div>
      </Container>
    );

    const element = container.firstChild;
    expect(element?.nodeName).toBe("SECTION");
  });

  it("passes through additional props", () => {
    const { container } = render(
      <Container data-testid="test-container" id="my-container">
        <div>Test content</div>
      </Container>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveAttribute("data-testid", "test-container");
    expect(element).toHaveAttribute("id", "my-container");
  });

  it("renders children correctly", () => {
    const { getByText } = render(
      <Container>
        <h1>Test Title</h1>
        <p>Test paragraph</p>
      </Container>
    );

    expect(getByText("Test Title")).toBeInTheDocument();
    expect(getByText("Test paragraph")).toBeInTheDocument();
  });

  it("combines variant and prose classes correctly", () => {
    const { container } = render(
      <Container variant="narrow" prose className="additional-class">
        <p>Test content</p>
      </Container>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass("max-w-3xl");
    expect(element).toHaveClass("prose");
    expect(element).toHaveClass("additional-class");
    expect(element).toHaveClass("mx-auto");
    expect(element).toHaveClass("px-4");
  });
});
