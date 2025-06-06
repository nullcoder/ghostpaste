import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddFileButton } from "./add-file-button";

describe("AddFileButton", () => {
  it("renders with default text", () => {
    render(<AddFileButton fileCount={1} maxFiles={20} />);

    expect(screen.getByText("Add another file")).toBeInTheDocument();
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("renders with custom text", () => {
    render(
      <AddFileButton fileCount={1} maxFiles={20}>
        Custom Add Text
      </AddFileButton>
    );

    expect(screen.getByText("Custom Add Text")).toBeInTheDocument();
  });

  it("shows remaining count when approaching limit", () => {
    render(<AddFileButton fileCount={18} maxFiles={20} />);

    expect(screen.getByText("(2 remaining)")).toBeInTheDocument();
  });

  it("doesn't show remaining count when plenty of space", () => {
    render(<AddFileButton fileCount={5} maxFiles={20} />);

    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
  });

  it("disables when at max files", () => {
    render(<AddFileButton fileCount={20} maxFiles={20} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables when size exceeded", () => {
    render(<AddFileButton fileCount={5} maxFiles={20} sizeExceeded={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables when disabled prop is true", () => {
    render(<AddFileButton fileCount={1} maxFiles={20} disabled={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<AddFileButton fileCount={1} maxFiles={20} onClick={handleClick} />);

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("doesn't fire click when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <AddFileButton fileCount={20} maxFiles={20} onClick={handleClick} />
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("shows remaining count for different thresholds", () => {
    const { rerender } = render(<AddFileButton fileCount={17} maxFiles={20} />);
    expect(screen.getByText("(3 remaining)")).toBeInTheDocument();

    rerender(<AddFileButton fileCount={18} maxFiles={20} />);
    expect(screen.getByText("(2 remaining)")).toBeInTheDocument();

    rerender(<AddFileButton fileCount={19} maxFiles={20} />);
    expect(screen.getByText("(1 remaining)")).toBeInTheDocument();

    rerender(<AddFileButton fileCount={20} maxFiles={20} />);
    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <AddFileButton fileCount={1} maxFiles={20} className="custom-button" />
    );

    expect(screen.getByRole("button")).toHaveClass("custom-button");
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<AddFileButton fileCount={1} maxFiles={20} ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it("renders Plus icon", () => {
    render(<AddFileButton fileCount={1} maxFiles={20} />);

    const icon = screen.getByRole("button").querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("lucide-plus");
  });
});
