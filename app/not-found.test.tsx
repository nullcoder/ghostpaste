import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders 404 text", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  it("renders main heading", () => {
    render(<NotFound />);
    expect(screen.getByText("This page has been ghosted!")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<NotFound />);
    expect(
      screen.getByText(
        /The gist you're looking for has vanished into the digital ether/
      )
    ).toBeInTheDocument();
  });

  it("renders ghost icon", () => {
    render(<NotFound />);
    // Look for the ghost SVG by its container
    const ghostContainer = screen.getByText("404").previousElementSibling;
    expect(ghostContainer).toHaveClass("animate-float");
  });

  it("renders home button with correct link", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /go home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders create new gist button with correct link", () => {
    render(<NotFound />);
    const createLink = screen.getByRole("link", { name: /create new gist/i });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/create");
  });

  it("renders easter egg text", () => {
    render(<NotFound />);
    expect(
      screen.getByText(/Just like that person who never texted back.../)
    ).toBeInTheDocument();
  });

  it("applies correct animation classes", () => {
    render(<NotFound />);
    const heading = screen.getByText("404");
    expect(heading).toHaveClass("animate-glitch");
  });

  it("has proper layout classes", () => {
    const { container } = render(<NotFound />);
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass("min-h-[80vh]");
    expect(mainContainer).toHaveClass("flex-col");
    expect(mainContainer).toHaveClass("items-center");
    expect(mainContainer).toHaveClass("justify-center");
  });
});
