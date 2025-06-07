import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PasswordInput, isPasswordValid } from "./password-input";

// Mock crypto.subtle for tests
const mockCrypto = {
  subtle: {
    importKey: vi.fn(),
    deriveBits: vi.fn(),
  },
  getRandomValues: vi.fn((array: Uint8Array) => {
    // Fill with predictable values for testing
    for (let i = 0; i < array.length; i++) {
      array[i] = i;
    }
    return array;
  }),
};

Object.defineProperty(window, "crypto", {
  value: mockCrypto,
  writable: true,
});

describe("PasswordInput", () => {
  const mockOnChange = vi.fn();
  const mockOnConfirmChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with password field", () => {
    render(<PasswordInput value="" onChange={mockOnChange} mode="create" />);

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  it("shows character counter", () => {
    render(
      <PasswordInput value="test1234" onChange={mockOnChange} mode="create" />
    );

    expect(screen.getByText("8/64")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        value="secret123"
        onChange={mockOnChange}
        mode="create"
        showConfirm={false}
      />
    );

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const toggleButton = screen.getByLabelText("Show password");

    expect(passwordInput.type).toBe("password");

    await user.click(toggleButton);
    expect(passwordInput.type).toBe("text");
    expect(screen.getByLabelText("Hide password")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Hide password"));
    expect(passwordInput.type).toBe("password");
  });

  it("shows validation error for short password", () => {
    render(
      <PasswordInput value="short" onChange={mockOnChange} mode="create" />
    );

    expect(
      screen.getByText("Password must be at least 8 characters")
    ).toBeInTheDocument();
  });

  it("shows validation error for long password", () => {
    const longPassword = "a".repeat(65);
    render(
      <PasswordInput
        value={longPassword}
        onChange={mockOnChange}
        mode="create"
      />
    );

    expect(
      screen.getByText("Password must be no more than 64 characters")
    ).toBeInTheDocument();
  });

  it("shows password strength indicator", () => {
    const { rerender } = render(
      <PasswordInput value="weak" onChange={mockOnChange} mode="create" />
    );

    // Weak password
    expect(screen.getByText("Weak")).toBeInTheDocument();

    // Medium password
    rerender(
      <PasswordInput
        value="mediumPass123"
        onChange={mockOnChange}
        mode="create"
      />
    );
    expect(screen.getByText("Medium")).toBeInTheDocument();

    // Strong password
    rerender(
      <PasswordInput
        value="StrongPass123!@#"
        onChange={mockOnChange}
        mode="create"
      />
    );
    expect(screen.getByText("Strong")).toBeInTheDocument();
  });

  it("shows confirm password field in create mode", () => {
    render(
      <PasswordInput
        value="password123"
        onChange={mockOnChange}
        mode="create"
        showConfirm={true}
      />
    );

    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });

  it("validates password match", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        value="password123"
        onChange={mockOnChange}
        mode="create"
        showConfirm={true}
      />
    );

    const confirmInput = screen.getByLabelText("Confirm Password");

    // Type mismatching password
    await user.type(confirmInput, "different123");
    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

    // Clear and type matching password
    await user.clear(confirmInput);
    await user.type(confirmInput, "password123");
    expect(screen.getByText("Passwords match")).toBeInTheDocument();
  });

  it("calls onConfirmChange when provided", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        value="password123"
        onChange={mockOnChange}
        confirmValue=""
        onConfirmChange={mockOnConfirmChange}
        mode="create"
        showConfirm={true}
      />
    );

    const confirmInput = screen.getByLabelText("Confirm Password");
    await user.type(confirmInput, "pass");

    expect(mockOnConfirmChange).toHaveBeenCalled();
  });

  it("hides confirm field when showConfirm is false", () => {
    render(
      <PasswordInput
        value="password123"
        onChange={mockOnChange}
        mode="create"
        showConfirm={false}
      />
    );

    expect(screen.queryByLabelText("Confirm Password")).not.toBeInTheDocument();
  });

  it("disables confirm field when password is empty", () => {
    render(
      <PasswordInput
        value=""
        onChange={mockOnChange}
        mode="create"
        showConfirm={true}
      />
    );

    const confirmInput = screen.getByLabelText(
      "Confirm Password"
    ) as HTMLInputElement;
    expect(confirmInput).toBeDisabled();
  });

  it("handles onChange callback", async () => {
    render(<PasswordInput value="" onChange={mockOnChange} mode="create" />);

    const passwordInput = screen.getByLabelText("Password");
    fireEvent.change(passwordInput, { target: { value: "test" } });

    expect(mockOnChange).toHaveBeenCalledWith("test");
  });

  it("respects disabled state", () => {
    render(
      <PasswordInput
        value=""
        onChange={mockOnChange}
        mode="create"
        disabled={true}
        showConfirm={false}
      />
    );

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput).toBeDisabled();

    const toggleButton = screen.getByLabelText("Show password");
    expect(toggleButton).toBeDisabled();
  });

  it("uses custom label", () => {
    render(
      <PasswordInput
        value=""
        onChange={mockOnChange}
        mode="create"
        label="Edit Password"
      />
    );

    expect(screen.getByLabelText("Edit Password")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <PasswordInput
        value=""
        onChange={mockOnChange}
        mode="create"
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("limits input to 64 characters", () => {
    render(<PasswordInput value="" onChange={mockOnChange} mode="create" />);

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput).toHaveAttribute("maxLength", "64");
  });

  it("shows strength bars", () => {
    render(
      <PasswordInput
        value="StrongPass123!@#"
        onChange={mockOnChange}
        mode="create"
      />
    );

    // Should show 3 strength bars, all filled for strong password
    const strengthSection =
      screen.getByText("Strength:").parentElement?.parentElement;
    const bars = strengthSection?.querySelectorAll('[class*="bg-green"]');
    expect(bars?.length).toBe(3);
  });

  it("does not show strength indicator in verify mode", () => {
    render(
      <PasswordInput
        value="password123"
        onChange={mockOnChange}
        mode="verify"
      />
    );

    expect(screen.queryByText("Strength:")).not.toBeInTheDocument();
  });

  it("does not show confirm field in verify mode", () => {
    render(
      <PasswordInput
        value="password123"
        onChange={mockOnChange}
        mode="verify"
        showConfirm={true}
      />
    );

    expect(screen.queryByLabelText("Confirm Password")).not.toBeInTheDocument();
  });

  it("provides proper ARIA attributes", () => {
    render(
      <PasswordInput value="short" onChange={mockOnChange} mode="create" />
    );

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute("aria-describedby", "password-error");
  });
});

describe("isPasswordValid", () => {
  it("returns false for empty password", () => {
    expect(isPasswordValid("")).toBe(false);
  });

  it("returns false for password too short", () => {
    expect(isPasswordValid("short")).toBe(false);
  });

  it("returns false for password too long", () => {
    expect(isPasswordValid("a".repeat(65))).toBe(false);
  });

  it("returns true for valid password without confirmation", () => {
    expect(isPasswordValid("validPassword123", undefined, false)).toBe(true);
  });

  it("returns true for valid password when confirmation not required", () => {
    expect(isPasswordValid("validPassword123", undefined, false)).toBe(true);
  });

  it("returns false when confirmation doesn't match", () => {
    expect(isPasswordValid("password123", "different", true)).toBe(false);
  });

  it("returns true when confirmation matches", () => {
    expect(isPasswordValid("password123", "password123", true)).toBe(true);
  });

  it("ignores confirmation when requireConfirm is false", () => {
    expect(isPasswordValid("password123", "different", false)).toBe(true);
  });
});
