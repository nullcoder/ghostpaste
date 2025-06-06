"use client";

import { useState } from "react";
import { FileEditor, FileData } from "@/components/ui/file-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function FileEditorDemo() {
  const [files, setFiles] = useState<FileData[]>([
    {
      id: "1",
      name: "hello.js",
      content: `// A simple JavaScript function
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
      language: "javascript",
    },
    {
      id: "2",
      name: "styles.css",
      content: `/* Main styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}`,
      language: "css",
    },
  ]);

  const [readOnly, setReadOnly] = useState(false);

  const handleChange = (id: string, updates: Partial<FileData>) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file))
    );
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const addNewFile = () => {
    const newId = Date.now().toString();
    const existingCount = files.length;
    setFiles((prev) => [
      ...prev,
      {
        id: newId,
        name: `file${existingCount + 1}.txt`,
        content: "",
        language: "text",
      },
    ]);
  };

  const getAllFilenames = () => files.map((f) => f.name);

  return (
    <div className="container mx-auto max-w-6xl p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>FileEditor Component Demo</CardTitle>
          <CardDescription>
            Test the FileEditor component with filename validation, language
            detection, and code editing features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
            <Button onClick={addNewFile} disabled={files.length >= 20}>
              Add New File
            </Button>
            <Button variant="outline" onClick={() => setReadOnly(!readOnly)}>
              {readOnly ? "Enable Editing" : "Disable Editing"}
            </Button>
          </div>

          <p className="text-muted-foreground mb-4 text-sm">
            Files: {files.length} / 20
          </p>
        </CardContent>
      </Card>

      {/* File Editors */}
      <div className="space-y-8">
        {files.map((file, index) => (
          <Card key={file.id}>
            <CardHeader>
              <CardTitle className="text-lg">File {index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <FileEditor
                file={file}
                onChange={handleChange}
                onDelete={handleDelete}
                showDelete={files.length > 1}
                existingFilenames={getAllFilenames()}
                readOnly={readOnly}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features to Test */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testing Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Try changing filenames and see language auto-detection</p>
          <p>• Test filename validation (empty, duplicates, invalid chars)</p>
          <p>• Switch languages manually using the dropdown</p>
          <p>• Add content to see file size indicators</p>
          <p>
            • Test the delete button (with confirmation for non-empty files)
          </p>
          <p>• Toggle read-only mode to disable editing</p>
          <p>• Add large content (400KB+) to see size warnings</p>
        </CardContent>
      </Card>
    </div>
  );
}
