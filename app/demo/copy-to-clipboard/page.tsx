"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CopyButton,
  CopyTextButton,
  CopyIconButton,
} from "@/components/ui/copy-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Note: Using Input component for textarea functionality
import {
  copyToClipboard,
  copyToClipboardWithRetry,
  isCopySupported,
  copyHelpers,
  type CopyResult,
} from "@/lib/copy-to-clipboard";
import { Check, Copy, Download, FileText, Globe, Code } from "lucide-react";
// Toast is automatically available through the CopyButton components

export default function CopyToClipboardDemo() {
  const [customText, setCustomText] = useState("Hello, World!");
  const [copyResult, setCopyResult] = useState<string>("");
  const [testFiles] = useState([
    { name: "index.js", content: 'console.log("Hello, World!");' },
    {
      name: "utils.ts",
      content: "export const formatDate = (date: Date) => date.toISOString();",
    },
    { name: "README.md", content: "# My Project\n\nThis is a sample project." },
  ]);

  const handleCustomCopy = async () => {
    const result = await copyToClipboard(customText);
    setCopyResult(
      result.success ? "✅ Successfully copied!" : `❌ Failed: ${result.error}`
    );
  };

  const handleRetryCopy = async () => {
    const result = await copyToClipboardWithRetry(customText, 3);
    setCopyResult(
      result.success
        ? "✅ Successfully copied with retry!"
        : `❌ Failed after retries: ${result.error}`
    );
  };

  const handleCopyResult = (result: CopyResult) => {
    setCopyResult(
      result.success ? "✅ Copy successful!" : `❌ Copy failed: ${result.error}`
    );
  };

  const handleCopyGistUrl = async () => {
    const result = await copyHelpers.copyGistUrl("abc123", "secret-key");
    setCopyResult(
      result.success ? "✅ Gist URL copied!" : `❌ Failed: ${result.error}`
    );
  };

  const handleCopyMultipleFiles = async () => {
    const result = await copyHelpers.copyMultipleFiles(testFiles);
    setCopyResult(
      result.success ? "✅ All files copied!" : `❌ Failed: ${result.error}`
    );
  };

  const handleCopyFileWithComment = async () => {
    const result = await copyHelpers.copyFileContent(
      testFiles[0].content,
      testFiles[0].name
    );
    setCopyResult(
      result.success
        ? "✅ File with comment copied!"
        : `❌ Failed: ${result.error}`
    );
  };

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Copy to Clipboard Demo
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive demonstration of copy-to-clipboard functionality with
            different components, utilities, and error handling.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm">Copy Support:</span>
            {isCopySupported() ? (
              <span className="inline-flex items-center gap-1 text-green-600">
                <Check className="h-4 w-4" />
                Supported
              </span>
            ) : (
              <span className="text-red-600">Not Supported</span>
            )}
          </div>
        </div>

        <Tabs defaultValue="components" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="utilities">Utilities</TabsTrigger>
            <TabsTrigger value="helpers">Helpers</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Basic Copy Button */}
              <Card>
                <CardHeader>
                  <CardTitle>CopyButton Component</CardTitle>
                  <CardDescription>
                    Icon-only copy button with visual feedback and toast
                    notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-text">Text to copy:</Label>
                    <div className="flex gap-2">
                      <Input
                        id="custom-text"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Enter text to copy..."
                      />
                      <CopyButton
                        text={customText}
                        onCopy={handleCopyResult}
                        successMessage="Custom text copied!"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Variants & Sizes:</p>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton
                        text="Default ghost"
                        variant="ghost"
                        size="icon"
                      />
                      <CopyButton
                        text="Outline"
                        variant="outline"
                        size="icon"
                      />
                      <CopyButton
                        text="Secondary"
                        variant="secondary"
                        size="icon"
                      />
                      <CopyButton text="Small" size="sm" />
                      <CopyButton text="Large" size="lg" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Configuration Options:
                    </p>
                    <div className="space-y-2">
                      <CopyButton
                        text={customText}
                        showToast={false}
                        onCopy={handleCopyResult}
                        className="mr-2"
                      />
                      <span className="text-muted-foreground text-sm">
                        No toast notification
                      </span>
                    </div>
                    <div className="space-y-2">
                      <CopyButton
                        text={customText}
                        showVisualFeedback={false}
                        onCopy={handleCopyResult}
                        className="mr-2"
                      />
                      <span className="text-muted-foreground text-sm">
                        No visual feedback
                      </span>
                    </div>
                    <div className="space-y-2">
                      <CopyButton
                        text={customText}
                        useRetry
                        maxRetries={2}
                        onCopy={handleCopyResult}
                        className="mr-2"
                      />
                      <span className="text-muted-foreground text-sm">
                        With retry logic
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Copy Text Button */}
              <Card>
                <CardHeader>
                  <CardTitle>CopyTextButton Component</CardTitle>
                  <CardDescription>
                    Button with icon and text label for inline copy actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Default Usage:</p>
                    <CopyTextButton
                      text={customText}
                      onCopy={handleCopyResult}
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Custom Labels:</p>
                    <div className="flex flex-wrap gap-2">
                      <CopyTextButton
                        text="https://ghostpaste.dev/g/abc123"
                        label="Copy URL"
                        variant="default"
                      />
                      <CopyTextButton
                        text="const x = 42;"
                        label="Copy Code"
                        variant="secondary"
                      />
                      <CopyTextButton
                        text="user@example.com"
                        label="Copy Email"
                        variant="outline"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">File Examples:</p>
                    <div className="space-y-2">
                      {testFiles.map((file) => (
                        <div
                          key={file.name}
                          className="flex items-center justify-between rounded border p-2"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="text-muted-foreground h-4 w-4" />
                            <span className="text-sm font-medium">
                              {file.name}
                            </span>
                          </div>
                          <CopyTextButton
                            text={file.content}
                            label="Copy"
                            successMessage={`${file.name} copied!`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Copy Icon Button */}
              <Card>
                <CardHeader>
                  <CardTitle>CopyIconButton Component</CardTitle>
                  <CardDescription>
                    Compact icon-only button for space-constrained layouts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">In File Headers:</p>
                    <div className="space-y-2">
                      {testFiles.map((file) => (
                        <div
                          key={file.name}
                          className="bg-muted/30 flex items-center justify-between rounded border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="text-muted-foreground h-4 w-4" />
                            <span className="font-medium">{file.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <CopyIconButton
                              text={file.content}
                              className="h-7 w-7"
                              successMessage={`${file.name} copied!`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">URL Display:</p>
                    <div className="relative">
                      <div className="bg-muted/50 rounded-md border p-3 pr-12 font-mono text-sm">
                        <span className="break-all">
                          https://ghostpaste.dev/g/abc123
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            #key=secret-key
                          </span>
                        </span>
                      </div>
                      <CopyIconButton
                        text="https://ghostpaste.dev/g/abc123#key=secret-key"
                        className="absolute top-2 right-2"
                        successMessage="URL copied to clipboard!"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Result Display */}
              <Card>
                <CardHeader>
                  <CardTitle>Copy Results</CardTitle>
                  <CardDescription>
                    Real-time feedback from copy operations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded border p-3 font-mono text-sm">
                    {copyResult || "No recent copy operations"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="utilities" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Direct API Usage</CardTitle>
                  <CardDescription>
                    Using the copy utility functions directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="direct-text">Text to copy:</Label>
                    <Input
                      id="direct-text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter text to copy..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleCustomCopy} size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Once
                    </Button>
                    <Button
                      onClick={handleRetryCopy}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy with Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Copy Support Detection</CardTitle>
                  <CardDescription>
                    Check if copy functionality is available.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Browser Support:</strong>
                    </p>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>
                        • Modern Clipboard API:{" "}
                        {navigator.clipboard ? "✅" : "❌"}
                      </li>
                      <li>
                        • Secure Context: {window.isSecureContext ? "✅" : "❌"}
                      </li>
                      <li>
                        • Fallback Support:{" "}
                        {document.queryCommandSupported?.("copy") ? "✅" : "❌"}
                      </li>
                      <li>
                        • Overall Support: {isCopySupported() ? "✅" : "❌"}
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="helpers" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>GhostPaste Helpers</CardTitle>
                  <CardDescription>
                    Specialized copy functions for GhostPaste content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleCopyGistUrl} className="w-full">
                    <Globe className="mr-2 h-4 w-4" />
                    Copy Gist URL
                  </Button>
                  <Button
                    onClick={handleCopyFileWithComment}
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Copy File with Comment
                  </Button>
                  <Button onClick={handleCopyMultipleFiles} className="w-full">
                    <Code className="mr-2 h-4 w-4" />
                    Copy All Files
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Files</CardTitle>
                  <CardDescription>
                    Sample files for testing copy operations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {testFiles.map((file) => (
                      <div key={file.name} className="space-y-1">
                        <p className="text-sm font-medium">{file.name}</p>
                        <pre className="bg-muted overflow-x-auto rounded border p-2 text-xs">
                          {file.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Real-World Examples</CardTitle>
                  <CardDescription>
                    How copy functionality appears in actual GhostPaste
                    components.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Share Dialog Example */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Share Dialog Example</h3>
                    <div className="space-y-3 rounded border p-4">
                      <p className="text-muted-foreground text-sm">
                        Your secure link:
                      </p>
                      <div className="relative">
                        <div className="bg-muted/50 rounded-md border p-3 pr-12 font-mono text-sm">
                          <span className="break-all">
                            https://ghostpaste.dev/g/demo123
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              #key=demo-secret-key
                            </span>
                          </span>
                        </div>
                        <CopyIconButton
                          text="https://ghostpaste.dev/g/demo123#key=demo-secret-key"
                          className="absolute top-2 right-2"
                          successMessage="Share URL copied!"
                        />
                      </div>
                      <div className="flex gap-2">
                        <CopyTextButton
                          text="https://ghostpaste.dev/g/demo123#key=demo-secret-key"
                          label="Copy Link"
                          variant="default"
                          successMessage="Share URL copied!"
                        />
                        <Button variant="secondary">Done</Button>
                      </div>
                    </div>
                  </div>

                  {/* GistViewer Example */}
                  <div className="space-y-3">
                    <h3 className="font-medium">GistViewer Example</h3>
                    <div className="rounded border">
                      <div className="bg-muted flex items-center justify-between border-b px-4 py-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="text-muted-foreground h-4 w-4" />
                          <span className="font-medium">example.js</span>
                        </div>
                        <div className="flex gap-1">
                          <CopyIconButton
                            text='function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));'
                            className="h-7 w-7"
                            successMessage="example.js copied!"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <pre className="text-sm">
                          {`function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features Demonstrated</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">✨ Component Features</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>
                  • Three component variants (CopyButton, CopyTextButton,
                  CopyIconButton)
                </li>
                <li>• Toast notifications with Sonner integration</li>
                <li>• Visual feedback with icon switching</li>
                <li>• Configurable success/error messages</li>
                <li>• Loading states and error handling</li>
                <li>• Accessibility support (ARIA labels, keyboard nav)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">🛠️ Utility Features</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Modern Clipboard API with fallback</li>
                <li>• Retry logic for unreliable connections</li>
                <li>• Browser support detection</li>
                <li>• Specialized helpers for GhostPaste content</li>
                <li>• Multi-file copy with separators</li>
                <li>• File content with filename comments</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
