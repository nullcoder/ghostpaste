"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps {
  /**
   * Current password value
   */
  value: string;
  /**
   * Callback when password changes
   */
  onChange: (value: string) => void;
  /**
   * Confirm password value (for create mode with confirmation)
   */
  confirmValue?: string;
  /**
   * Callback when confirm password changes
   */
  onConfirmChange?: (value: string) => void;
  /**
   * Mode of operation - create for new passwords, verify for entering existing
   */
  mode: "create" | "verify";
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Label for the password field
   */
  label?: string;
  /**
   * Whether to show the confirm field (create mode only)
   */
  showConfirm?: boolean;
  /**
   * Error message to display (e.g., from server validation)
   */
  error?: string;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
}

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password: string): {
  strength: "weak" | "medium" | "strong";
  score: number;
} {
  if (!password) return { strength: "weak", score: 0 };

  let score = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Length score
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character type score
  const typeCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
    Boolean
  ).length;
  score += typeCount;

  // Determine strength
  if (score <= 2) return { strength: "weak", score };
  if (score <= 5) return { strength: "medium", score };
  return { strength: "strong", score };
}

/**
 * PasswordInput component for secure password entry
 *
 * In create mode: Shows strength indicator and optional confirmation field
 * In verify mode: Simple password input for authentication
 *
 * All hashing is done server-side for security
 */
export function PasswordInput({
  value,
  onChange,
  confirmValue: externalConfirmValue,
  onConfirmChange,
  mode = "create",
  disabled = false,
  className,
  label = "Password",
  showConfirm = true,
  error: externalError,
  placeholder = "Enter password",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [internalConfirmValue, setInternalConfirmValue] = React.useState("");

  // Use external confirm value if provided, otherwise use internal state
  const confirmValue =
    externalConfirmValue !== undefined
      ? externalConfirmValue
      : internalConfirmValue;
  const setConfirmValue = onConfirmChange || setInternalConfirmValue;

  const [errors, setErrors] = React.useState<{
    password?: string;
    confirm?: string;
  }>({});

  const passwordStrength = React.useMemo(
    () => calculatePasswordStrength(value),
    [value]
  );

  // Validate password
  React.useEffect(() => {
    const newErrors: typeof errors = {};

    if (value && value.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (value && value.length > 64) {
      newErrors.password = "Password must be no more than 64 characters";
    }

    if (
      mode === "create" &&
      showConfirm &&
      confirmValue &&
      value !== confirmValue
    ) {
      newErrors.confirm = "Passwords do not match";
    }

    setErrors(newErrors);
  }, [value, confirmValue, mode, showConfirm]);

  const strengthColors = {
    weak: "text-destructive",
    medium: "text-yellow-600",
    strong: "text-green-600",
  };

  const strengthBars = {
    weak: 1,
    medium: 2,
    strong: 3,
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password">{label}</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "pr-20",
              (errors.password || externalError) &&
                "border-destructive focus-visible:ring-destructive"
            )}
            placeholder={placeholder}
            maxLength={64}
            aria-invalid={!!(errors.password || externalError)}
            aria-describedby={
              errors.password || externalError ? "password-error" : undefined
            }
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2">
            <span className="text-muted-foreground text-xs">
              {value.length}/64
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {(errors.password || externalError) && (
          <p
            id="password-error"
            className="text-destructive flex items-center gap-1 text-sm"
          >
            <AlertCircle className="h-3 w-3" />
            {errors.password || externalError}
          </p>
        )}
      </div>

      {/* Password strength indicator */}
      {mode === "create" && value && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Strength:</span>
            <span
              className={cn(
                "text-sm font-medium",
                strengthColors[passwordStrength.strength]
              )}
            >
              {passwordStrength.strength.charAt(0).toUpperCase() +
                passwordStrength.strength.slice(1)}
            </span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((bar) => (
              <div
                key={bar}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  bar <= strengthBars[passwordStrength.strength]
                    ? strengthColors[passwordStrength.strength].replace(
                        "text-",
                        "bg-"
                      )
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confirm password field */}
      {mode === "create" && showConfirm && (
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              disabled={disabled || !value}
              className={cn(
                "pr-20",
                errors.confirm &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              placeholder="Confirm password"
              maxLength={64}
              aria-invalid={!!errors.confirm}
              aria-describedby={errors.confirm ? "confirm-error" : undefined}
            />
            <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2">
              <span className="text-muted-foreground text-xs">
                {confirmValue.length}/64
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={disabled || !value}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          {errors.confirm && (
            <p
              id="confirm-error"
              className="text-destructive flex items-center gap-1 text-sm"
            >
              <X className="h-3 w-3" />
              {errors.confirm}
            </p>
          )}
          {confirmValue && !errors.confirm && value === confirmValue && (
            <p className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-3 w-3" />
              Passwords match
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Helper to check if password is valid and confirmed
 */
export function isPasswordValid(
  password: string,
  confirmPassword?: string,
  requireConfirm: boolean = true
): boolean {
  if (!password || password.length < 8 || password.length > 64) {
    return false;
  }

  if (
    requireConfirm &&
    confirmPassword !== undefined &&
    password !== confirmPassword
  ) {
    return false;
  }

  return true;
}
