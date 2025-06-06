"use client";

import { useState } from "react";
import { MultiFileEditor } from "@/components/ui/multi-file-editor";
import { FileData } from "@/components/ui/file-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MultiFileEditorDemo() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [readOnly, setReadOnly] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [key, setKey] = useState(0); // Force re-render of MultiFileEditor

  // Sample files for testing
  const sampleFiles: FileData[] = [
    {
      id: "sample-1",
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
    <h1>Welcome to GhostPaste</h1>
    <script src="script.js"></script>
</body>
</html>`,
      language: "html",
    },
    {
      id: "sample-2",
      name: "styles.css",
      content: `/* Main styles for GhostPaste */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2563eb;
  margin-bottom: 1rem;
}

.container {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 2rem;
}`,
      language: "css",
    },
    {
      id: "sample-3",
      name: "script.js",
      content: `// GhostPaste initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('GhostPaste loaded!');
  
  // Initialize encryption
  const encryptionKey = generateKey();
  
  // Set up event listeners
  setupEventListeners();
});

function generateKey() {
  return crypto.getRandomValues(new Uint8Array(32));
}

function setupEventListeners() {
  // Add your event listeners here
}`,
      language: "javascript",
    },
  ];

  const loadSampleFiles = () => {
    setFiles(sampleFiles);
    setKey((prev) => prev + 1); // Force re-render with new files
  };

  const clearFiles = () => {
    setFiles([]);
    setKey((prev) => prev + 1); // Force re-render with empty files
  };

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>MultiFileEditor Component Demo</CardTitle>
          <CardDescription>
            Test the MultiFileEditor component that manages multiple files in a
            vertical layout, similar to GitHub Gists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={loadSampleFiles} variant="outline">
              Load Sample Files
            </Button>
            <Button onClick={clearFiles} variant="outline">
              Clear All Files
            </Button>
            <Button onClick={() => setReadOnly(!readOnly)} variant="outline">
              {readOnly ? "Enable Editing" : "Disable Editing"}
            </Button>
            <Button onClick={() => setShowJson(!showJson)} variant="outline">
              {showJson ? "Hide JSON" : "Show JSON"}
            </Button>
          </div>

          <div className="text-muted-foreground text-sm">
            <p>• Files are displayed vertically (no tabs)</p>
            <p>• Maximum 20 files, 5MB total size</p>
            <p>• Press Ctrl+Enter to add new files</p>
            <p>• Files can be renamed, deleted, and edited</p>
          </div>
        </CardContent>
      </Card>

      {/* MultiFileEditor */}
      <Card>
        <CardHeader>
          <CardTitle>File Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiFileEditor
            key={key}
            initialFiles={files}
            onChange={setFiles}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {/* JSON Output */}
      {showJson && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>JSON Output</CardTitle>
            <CardDescription>
              Current state of all files in JSON format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted overflow-auto rounded p-4 text-xs">
              {JSON.stringify(files, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Features to Test */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <h3 className="font-semibold">File Management:</h3>
          <ul className="ml-4 list-disc space-y-1">
            <li>Add files using the button or Ctrl+Enter</li>
            <li>Delete files with the ✕ button (min 1 file required)</li>
            <li>Rename files and see language auto-detection</li>
            <li>Try duplicate filenames to see validation</li>
          </ul>

          <h3 className="mt-4 font-semibold">Size Limits:</h3>
          <ul className="ml-4 list-disc space-y-1">
            <li>Individual files: 500KB limit (400KB warning)</li>
            <li>Total size: 5MB limit</li>
            <li>Size indicators update in real-time</li>
          </ul>

          <h3 className="mt-4 font-semibold">Features:</h3>
          <ul className="ml-4 list-disc space-y-1">
            <li>Auto-scroll to new files</li>
            <li>Default filename generation (file1.txt, file2.txt...)</li>
            <li>Responsive design for mobile</li>
            <li>Read-only mode support</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
