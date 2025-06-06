"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/ui/code-editor";

const sampleCode = {
  javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55`,

  python: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))  # 55`,

  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a demo of the CodeEditor component.</p>
</body>
</html>`,
};

export default function CodeEditorDemo() {
  const [code, setCode] = useState(sampleCode.javascript);
  const [language, setLanguage] = useState("javascript");
  const [readOnly, setReadOnly] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | undefined>(undefined);

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-3xl font-bold">CodeEditor Component Demo</h1>

      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Language</label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setCode(
                  sampleCode[e.target.value as keyof typeof sampleCode] || ""
                );
              }}
              className="rounded border px-3 py-2"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Theme</label>
            <select
              value={theme || "system"}
              onChange={(e) => {
                const value = e.target.value;
                setTheme(
                  value === "system" ? undefined : (value as "light" | "dark")
                );
              }}
              className="rounded border px-3 py-2"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={readOnly}
              onChange={(e) => setReadOnly(e.target.checked)}
            />
            Read Only
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
            />
            Show Line Numbers
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
            />
            Word Wrap
          </label>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="mb-2 text-xl font-semibold">Editor</h2>
        <div className="font-mono">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            readOnly={readOnly}
            showLineNumbers={showLineNumbers}
            wordWrap={wordWrap}
            theme={theme}
            placeholder="Start typing your code..."
            height="400px"
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Current Value:</h3>
        <pre className="overflow-x-auto rounded bg-gray-100 p-4 text-sm dark:bg-gray-800">
          <code>{code}</code>
        </pre>
      </div>

      <div className="mt-6 rounded bg-blue-50 p-4 dark:bg-blue-900/20">
        <h3 className="mb-2 text-lg font-semibold">Features:</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>Syntax highlighting for multiple languages</li>
          <li>Light and dark theme support</li>
          <li>Line numbers and code folding</li>
          <li>Auto-completion and bracket matching</li>
          <li>Search functionality (Cmd/Ctrl + F)</li>
          <li>Optimized for large files (500KB+)</li>
          <li>TypeScript support with full type safety</li>
        </ul>
      </div>
    </div>
  );
}
