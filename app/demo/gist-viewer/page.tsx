"use client";

import { GistViewer } from "@/components/gist-viewer";
import type { File } from "@/types";

export default function GistViewerDemo() {
  const sampleFiles: File[] = [
    {
      name: "hello.js",
      content: `// A simple JavaScript example
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
console.log(greet("GhostPaste"));

// Export for module usage
export { greet };`,
      language: "javascript",
    },
    {
      name: "styles.css",
      content: `/* Modern CSS Reset */
*, *::before, *::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

input, button, textarea, select {
  font: inherit;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}`,
      language: "css",
    },
    {
      name: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GhostPaste Demo</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Welcome to GhostPaste</h1>
    <p>Share code snippets securely with zero-knowledge encryption.</p>
  </div>
  <script src="hello.js" type="module"></script>
</body>
</html>`,
      language: "html",
    },
    {
      name: "README.md",
      content: `# GhostPaste Demo

This is a demo of the GistViewer component.

## Features

- Syntax highlighting for multiple languages
- Tab navigation for multiple files
- Copy to clipboard functionality
- Download files individually or all at once
- Toggle line numbers and word wrap
- Responsive design

## Usage

\`\`\`tsx
import { GistViewer } from "@/components/gist-viewer";

function MyComponent() {
  const files = [
    { name: "file.js", content: "code here", language: "javascript" }
  ];
  
  return <GistViewer files={files} />;
}
\`\`\``,
      language: "markdown",
    },
  ];

  const manyFiles: File[] = Array.from({ length: 8 }, (_, i) => ({
    name: `component-${i + 1}.tsx`,
    content: `import React from 'react';

export function Component${i + 1}() {
  return (
    <div className="component-${i + 1}">
      <h2>Component ${i + 1}</h2>
      <p>This is component number ${i + 1}</p>
    </div>
  );
}`,
    language: "typescript",
  }));

  return (
    <div className="container mx-auto space-y-12 py-8">
      <div>
        <h1 className="mb-4 text-3xl font-bold">GistViewer Component Demo</h1>
        <p className="text-muted-foreground mb-8">
          A read-only viewer for displaying code snippets with syntax
          highlighting, file navigation, and download capabilities.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Basic Example (4 files)</h2>
        <p className="text-muted-foreground text-sm">
          Files are displayed in a vertical layout with individual copy and
          download buttons.
        </p>
        <div className="rounded-lg border p-4">
          <GistViewer files={sampleFiles} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Many Files Example (8 files)</h2>
        <p className="text-muted-foreground text-sm">
          The vertical layout scales well for any number of files.
        </p>
        <div className="rounded-lg border p-4">
          <GistViewer files={manyFiles} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Empty State</h2>
        <p className="text-muted-foreground text-sm">
          When no files are provided, a friendly message is shown.
        </p>
        <div className="rounded-lg border p-4">
          <GistViewer files={[]} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Features</h2>
        <ul className="text-muted-foreground list-inside list-disc space-y-2">
          <li>Syntax highlighting powered by CodeMirror</li>
          <li>Vertical file layout with clear file headers</li>
          <li>Individual copy and download buttons per file</li>
          <li>Download all files at once</li>
          <li>Toggle line numbers on/off</li>
          <li>Toggle word wrap on/off</li>
          <li>Responsive design for mobile devices</li>
          <li>Dark mode support</li>
          <li>Keyboard accessible</li>
          <li>Clean, GitHub-style presentation</li>
        </ul>
      </section>
    </div>
  );
}
