"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function R2Test() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testR2Access = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/r2-test");
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  const testR2Write = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/r2-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: `test-${Date.now()}`,
          data: "Test data from UI",
        }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button onClick={testR2Access} disabled={loading}>
          Test R2 Access
        </Button>
        <Button onClick={testR2Write} disabled={loading}>
          Test R2 Write
        </Button>
      </div>
      {result && (
        <pre className="bg-muted overflow-auto rounded-lg p-4 text-sm">
          {result}
        </pre>
      )}
    </div>
  );
}
