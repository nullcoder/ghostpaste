"use client";

import { useState } from "react";
import { ExpirySelector } from "@/components/ui/expiry-selector";
import { Container } from "@/components/ui/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function ExpirySelectorDemo() {
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [disabledExample, setDisabledExample] = useState<string | null>(null);
  const [multipleSelectors, setMultipleSelectors] = useState<{
    [key: string]: string | null;
  }>({
    selector1: null,
    selector2: "2025-06-08T15:00:00Z", // 1 day from now
    selector3: null,
  });

  return (
    <Container className="py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ExpirySelector Component Demo
          </h1>
          <p className="text-muted-foreground mt-2">
            A component for selecting gist expiration times with human-readable
            date formatting.
          </p>
        </div>

        {/* Basic Example */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Usage</CardTitle>
            <CardDescription>
              Select an expiration time to see how the component works.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiration Time</label>
              <ExpirySelector
                value={expiresAt}
                onChange={setExpiresAt}
                className="w-full sm:w-[280px]"
              />
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm font-medium">Current Selection:</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {expiresAt ? (
                  <>
                    Expires at:{" "}
                    <code className="bg-background rounded px-2 py-1">
                      {format(new Date(expiresAt), "PPPp")}
                    </code>
                  </>
                ) : (
                  "Never expires"
                )}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                ISO timestamp:{" "}
                <code className="bg-background rounded px-2 py-1">
                  {expiresAt || "null"}
                </code>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpiresAt(null)}
              >
                Reset to Never
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const future = new Date();
                  future.setHours(future.getHours() + 1);
                  setExpiresAt(future.toISOString());
                }}
              >
                Set to 1 hour
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disabled State */}
        <Card>
          <CardHeader>
            <CardTitle>Disabled State</CardTitle>
            <CardDescription>
              The selector can be disabled to prevent user interaction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Disabled ExpirySelector
              </label>
              <ExpirySelector
                value={disabledExample}
                onChange={setDisabledExample}
                disabled
                className="w-full sm:w-[280px]"
              />
            </div>
            <p className="text-muted-foreground text-sm">
              This selector is disabled and cannot be interacted with.
            </p>
          </CardContent>
        </Card>

        {/* Multiple Selectors */}
        <Card>
          <CardHeader>
            <CardTitle>Multiple Selectors</CardTitle>
            <CardDescription>
              Multiple expiry selectors can be used independently on the same
              page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(multipleSelectors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium capitalize">
                    {key.replace("selector", "Gist ")}
                  </label>
                  <div className="flex items-center gap-4">
                    <ExpirySelector
                      value={value}
                      onChange={(newValue) =>
                        setMultipleSelectors((prev) => ({
                          ...prev,
                          [key]: newValue,
                        }))
                      }
                      className="w-full sm:w-[280px]"
                    />
                    <span className="text-muted-foreground text-sm">
                      {value
                        ? `Expires ${format(new Date(value), "PP")}`
                        : "Never expires"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Options */}
        <Card>
          <CardHeader>
            <CardTitle>Available Time Options</CardTitle>
            <CardDescription>
              The component provides these predefined expiration options as per
              the specification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Never", description: "Gist will not expire" },
                {
                  label: "1 hour",
                  description: "Expires 60 minutes from creation",
                },
                {
                  label: "6 hours",
                  description: "Expires 6 hours from creation",
                },
                {
                  label: "1 day",
                  description: "Expires 24 hours from creation",
                },
                {
                  label: "7 days",
                  description: "Expires 1 week from creation",
                },
                {
                  label: "30 days",
                  description: "Expires 1 month from creation",
                },
              ].map((option) => (
                <div
                  key={option.label}
                  className="space-y-1 rounded-lg border p-3"
                >
                  <p className="font-medium">{option.label}</p>
                  <p className="text-muted-foreground text-sm">
                    {option.description}
                  </p>
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
              Key features of the ExpirySelector component.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>
                  Human-readable expiration times (e.g., &quot;tomorrow at 3:45
                  PM&quot;)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>
                  Smart date formatting - shows &quot;today&quot;,
                  &quot;tomorrow&quot;, day of week, or full date
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Returns ISO 8601 timestamps for API compatibility</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Clock icon for visual clarity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Keyboard accessible with proper ARIA labels</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Mobile-friendly dropdown interface</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>
                  Matches exact expiration options from the GhostPaste
                  specification
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
            <CardDescription>
              How to use the ExpirySelector in your components.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4">
              <code className="text-sm">{`import { useState } from "react";
import { ExpirySelector } from "@/components/ui/expiry-selector";

export function CreateGistForm() {
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  return (
    <form>
      <div className="space-y-2">
        <label>Expiration Time</label>
        <ExpirySelector
          value={expiresAt}
          onChange={setExpiresAt}
        />
      </div>
      
      {/* Submit with expiresAt as ISO string or null */}
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
