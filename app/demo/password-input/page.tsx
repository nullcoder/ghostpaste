"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { Container } from "@/components/ui/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Shield, Lock } from "lucide-react";

export default function PasswordInputDemo() {
  const [createPassword, setCreatePassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [hasCreatedPassword, setHasCreatedPassword] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [customLabel, setCustomLabel] = useState("");

  const handleCreatePassword = () => {
    // In a real app, the password would be sent to the server over HTTPS
    // The server would handle all hashing with PBKDF2
    if (createPassword.length >= 8) {
      setHasCreatedPassword(true);
      toast.success("Password protection enabled!");
    } else {
      toast.error("Password must be at least 8 characters");
    }
  };

  const handleVerify = async () => {
    if (!verifyPassword) {
      toast.error("Please enter a password");
      return;
    }

    // In a real app, this would be an API call to the server
    // The server would verify the password against the stored hash
    // Here we're just simulating the flow
    toast.info("In production, password would be verified server-side");

    // Simulate server response
    setTimeout(() => {
      if (verifyPassword === createPassword) {
        toast.success("Password verified successfully!");
        setVerificationError("");
      } else {
        setVerificationError("Invalid password");
        toast.error("Invalid password");
      }
    }, 500);
  };

  return (
    <Container className="py-8">
      <div className="space-y-8">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Shield className="h-8 w-8" />
            PasswordInput Component Demo
          </h1>
          <p className="text-muted-foreground mt-2">
            A secure password input component with PBKDF2 hashing, strength
            indicator, and validation.
          </p>
        </div>

        {/* Create Mode Example */}
        <Card>
          <CardHeader>
            <CardTitle>Create Password</CardTitle>
            <CardDescription>
              Set a new password with strength indicator and confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PasswordInput
              value={createPassword}
              onChange={setCreatePassword}
              mode="create"
              showConfirm={true}
            />

            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreatePassword}
                size="sm"
                disabled={createPassword.length < 8}
              >
                Enable Password Protection
              </Button>
              {hasCreatedPassword && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Enabled
                </span>
              )}
            </div>

            {hasCreatedPassword && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-muted-foreground text-sm">
                  <strong>Note:</strong> In production, the password would be
                  sent securely over HTTPS to the server for hashing with
                  PBKDF2-SHA256 (100,000 iterations) with a random salt.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verify Mode Example */}
        {hasCreatedPassword && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Password</CardTitle>
              <CardDescription>
                Test password verification against the hash created above.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PasswordInput
                value={verifyPassword}
                onChange={setVerifyPassword}
                mode="verify"
                showConfirm={false}
                error={verificationError}
              />

              <div className="flex items-center gap-4">
                <Button onClick={handleVerify} size="sm">
                  <Lock className="mr-2 h-4 w-4" />
                  Verify Password
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Different Configurations */}
        <Card>
          <CardHeader>
            <CardTitle>Component Variations</CardTitle>
            <CardDescription>
              Different ways to configure the PasswordInput component.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Without Confirm */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                Without Confirmation Field
              </h3>
              <PasswordInput
                value=""
                onChange={() => {}}
                mode="create"
                showConfirm={false}
              />
            </div>

            {/* Custom Label */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Custom Label</h3>
              <PasswordInput
                value={customLabel}
                onChange={setCustomLabel}
                mode="create"
                label="Edit Protection Password"
                showConfirm={false}
              />
            </div>

            {/* Disabled State */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Disabled State</h3>
              <PasswordInput
                value="disabled123"
                onChange={() => {}}
                mode="create"
                disabled={true}
                showConfirm={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Password Strength Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Password Strength Examples</CardTitle>
            <CardDescription>
              See how different passwords are rated by the strength indicator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { password: "weak", description: "Short password (< 8 chars)" },
                {
                  password: "weakpass",
                  description: "8+ chars, lowercase only",
                },
                {
                  password: "Medium123",
                  description: "12+ chars with mixed case and numbers",
                },
                {
                  password: "StrongPass123!@#",
                  description: "16+ chars with all character types",
                },
              ].map((example) => (
                <div key={example.password} className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    {example.description}
                  </p>
                  <PasswordInput
                    value={example.password}
                    onChange={() => {}}
                    mode="create"
                    showConfirm={false}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Component Features</CardTitle>
            <CardDescription>
              Key features of the PasswordInput component.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Secure password input with show/hide toggle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>
                  Real-time password strength indicator (weak/medium/strong)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>
                  Character counter showing current length vs maximum (64 chars)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Password confirmation field with match validation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>PBKDF2-SHA256 hashing with 100,000 iterations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Random 16-byte salt generation for each password</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Validation for 8-64 character length requirement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>
                  Accessible with proper ARIA labels and error announcements
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Support for create and verify modes</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              How the password hashing works under the hood.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-sm font-medium">
                  Server-Side Hashing
                </h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Algorithm: PBKDF2-SHA256 (performed on server)</li>
                  <li>• Iterations: 100,000</li>
                  <li>• Salt: 16 bytes (128 bits) - generated server-side</li>
                  <li>• Output: 32 bytes (256 bits)</li>
                  <li>• Transport: HTTPS only</li>
                  <li>
                    • Future: Consider OPAQUE protocol for zero-knowledge auth
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">
                  Password Strength Calculation
                </h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>
                    • <strong>Weak:</strong> Less than 12 characters or single
                    character type
                  </li>
                  <li>
                    • <strong>Medium:</strong> 12+ characters with 2+ character
                    types
                  </li>
                  <li>
                    • <strong>Strong:</strong> 16+ characters with 3+ character
                    types
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Character Types</h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Lowercase letters (a-z)</li>
                  <li>• Uppercase letters (A-Z)</li>
                  <li>• Numbers (0-9)</li>
                  <li>• Special characters (!@#$%^&* etc.)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
            <CardDescription>
              How to use the PasswordInput in your components.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4">
              <code className="text-sm">{`import { useState, FormEvent } from "react";
import { PasswordInput, isPasswordValid } from "@/components/ui/password-input";

export function CreateGistForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate password
    if (!isPasswordValid(password, confirmPassword)) {
      return;
    }

    // Send password to server over HTTPS
    // Server will handle PBKDF2 hashing
    await createGist({
      password, // Sent over HTTPS
      // ... other gist data
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <PasswordInput
        value={password}
        onChange={setPassword}
        confirmValue={confirmPassword}
        onConfirmChange={setConfirmPassword}
        mode="create"
        label="Edit Protection Password (Optional)"
      />
      
      <button type="submit">Create Gist</button>
    </form>
  );
}`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
