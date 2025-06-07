"use client";

import { useState } from "react";
import { FileList, FileListSkeleton } from "@/components/ui/file-list";
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
import { FileCode, Loader2 } from "lucide-react";

// Sample files for demo
const sampleFiles = [
  {
    name: "server.js",
    content: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    language: "javascript",
    size: 285,
  },
  {
    name: "package.json",
    content: `{
  "name": "demo-server",
  "version": "1.0.0",
  "description": "A simple Express server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`,
    size: 312,
  },
  {
    name: "README.md",
    content: `# Demo Server

A simple Express.js server for demonstration purposes.

## Installation

\`\`\`bash
npm install
\`\`\`

## Running the server

\`\`\`bash
# Production
npm start

# Development
npm run dev
\`\`\`

## API Endpoints

- \`GET /\` - Returns a hello world message

## License

MIT`,
    size: 268,
  },
  {
    name: ".gitignore",
    content: `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
.vscode/
.idea/`,
    size: 76,
  },
];

const pythonFiles = [
  {
    name: "app.py",
    content: `from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/')
def hello():
    return jsonify({"message": "Hello from Flask!"})

@app.route('/api/users')
def get_users():
    users = [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"}
    ]
    return jsonify(users)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)`,
    size: 412,
  },
  {
    name: "requirements.txt",
    content: `Flask==2.3.3
gunicorn==21.2.0
python-dotenv==1.0.0`,
    size: 55,
  },
];

export default function FileListDemo() {
  const [selectedDemo, setSelectedDemo] = useState<"node" | "python">("node");
  const [isLoading, setIsLoading] = useState(false);
  const [copyCount, setCopyCount] = useState<Record<string, number>>({});
  const [downloadCount, setDownloadCount] = useState<Record<string, number>>(
    {}
  );

  const currentFiles = selectedDemo === "node" ? sampleFiles : pythonFiles;

  const handleCopy = (filename: string) => {
    setCopyCount((prev) => ({
      ...prev,
      [filename]: (prev[filename] || 0) + 1,
    }));
  };

  const handleDownload = (filename: string) => {
    setDownloadCount((prev) => ({
      ...prev,
      [filename]: (prev[filename] || 0) + 1,
    }));
  };

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Files loaded successfully!");
    }, 2000);
  };

  return (
    <Container className="py-8">
      <div className="space-y-8">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <FileCode className="h-8 w-8" />
            FileList Component Demo
          </h1>
          <p className="text-muted-foreground mt-2">
            A vertical file viewer with syntax highlighting, copy, and download
            functionality.
          </p>
        </div>

        {/* Demo Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Demo Selection</CardTitle>
            <CardDescription>
              Choose between different file collections to display.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={selectedDemo === "node" ? "default" : "outline"}
                onClick={() => setSelectedDemo("node")}
                size="sm"
              >
                Node.js Project
              </Button>
              <Button
                variant={selectedDemo === "python" ? "default" : "outline"}
                onClick={() => setSelectedDemo("python")}
                size="sm"
              >
                Python Project
              </Button>
              <Button
                variant="outline"
                onClick={simulateLoading}
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Simulate Loading"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File List Display */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {selectedDemo === "node"
              ? "Node.js Express Server"
              : "Python Flask App"}
          </h2>
          {isLoading ? (
            <FileListSkeleton count={selectedDemo === "node" ? 4 : 2} />
          ) : (
            <FileList
              files={currentFiles}
              onCopy={handleCopy}
              onDownload={handleDownload}
              showLineNumbers={true}
              wordWrap={false}
              editorHeight="auto"
            />
          )}
        </div>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Interaction Stats</CardTitle>
            <CardDescription>
              Track how many times files have been copied or downloaded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-medium">Copy Count</h3>
                {Object.keys(copyCount).length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {Object.entries(copyCount).map(([file, count]) => (
                      <li key={file}>
                        <span className="font-mono">{file}</span>:{" "}
                        <span className="text-muted-foreground">
                          {count} times
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No files copied yet
                  </p>
                )}
              </div>
              <div>
                <h3 className="mb-2 font-medium">Download Count</h3>
                {Object.keys(downloadCount).length > 0 ? (
                  <ul className="space-y-1 text-sm">
                    {Object.entries(downloadCount).map(([file, count]) => (
                      <li key={file}>
                        <span className="font-mono">{file}</span>:{" "}
                        <span className="text-muted-foreground">
                          {count} times
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No files downloaded yet
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Component Features</CardTitle>
            <CardDescription>
              Key features of the FileList component.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>
                  Vertical file layout similar to GitHub Gist (no tabs)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>
                  Syntax highlighting with automatic language detection
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Language badge display for each file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>File size display in human-readable format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Line count indicator for each file</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Copy button with clipboard integration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Download button for individual files</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Anchor navigation for deep linking (#file-name)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Mobile-responsive design</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Loading skeleton for better UX</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Empty state handling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Keyboard accessible with proper ARIA labels</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
            <CardDescription>
              How to use the FileList component in your code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4">
              <code className="text-sm">{`import { FileList } from "@/components/ui/file-list";

const files = [
  {
    name: "app.js",
    content: "console.log('Hello');",
    size: 22, // in bytes
    language: "javascript" // optional
  },
  {
    name: "styles.css",
    content: "body { margin: 0; }",
    size: 20
  }
];

export function MyGistViewer() {
  const handleCopy = (filename) => {
    console.log(\`Copied \${filename}\`);
  };

  const handleDownload = (filename) => {
    console.log(\`Downloaded \${filename}\`);
  };

  return (
    <FileList
      files={files}
      onCopy={handleCopy}
      onDownload={handleDownload}
      showLineNumbers={true}
      wordWrap={false}
      editorHeight="auto"
    />
  );
}`}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Anchor Navigation Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Anchor Navigation</CardTitle>
            <CardDescription>
              Click these links to jump to specific files using anchor
              navigation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentFiles.map((file, index) => (
                <Button key={file.name} variant="outline" size="sm" asChild>
                  <a
                    href={`#file-${file.name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "")}-${index}`}
                  >
                    Jump to {file.name}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
