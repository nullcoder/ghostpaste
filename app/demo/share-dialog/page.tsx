"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/share-dialog";

export default function ShareDialogDemo() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scenario, setScenario] = useState<
    "simple" | "with-title" | "long-key"
  >("simple");

  const scenarios = {
    simple: {
      url: "https://ghostpaste.dev/g/abc123#key=eyJhbGciOiJBMTI4R0NNIiwiZXhwIjoxNjg5MzM2MDAwfQ",
      title: undefined,
    },
    "with-title": {
      url: "https://ghostpaste.dev/g/def456#key=eyJhbGciOiJBMTI4R0NNIiwiZXhwIjoxNjg5MzM2MDAwfQ",
      title: "My Configuration Files",
    },
    "long-key": {
      url: "https://ghostpaste.dev/g/xyz789#key=eyJhbGciOiJBMTI4R0NNIiwiZXhwIjoxNjg5MzM2MDAwLCJpdiI6IjEyMzQ1Njc4OTBhYmNkZWYiLCJkYXRhIjoiZXlKaGJHY2lPaUZCTVRJNFIwTk5JaXdpWlhod0lqb3hOamc1TXpNMk1EQXdNSDAifQ",
      title: "React Component Library",
    },
  };

  const handleCopy = () => {
    console.log("URL copied to clipboard");
  };

  const handleDownload = () => {
    console.log("Text file downloaded");
  };

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ShareDialog Demo
          </h1>
          <p className="text-muted-foreground mt-2">
            Demo of the ShareDialog component with different scenarios.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Scenarios</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-medium">Simple Gist</h3>
              <p className="text-muted-foreground text-sm">
                Basic gist without title
              </p>
              <Button
                onClick={() => {
                  setScenario("simple");
                  setDialogOpen(true);
                }}
                className="w-full"
              >
                Open Dialog
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Gist with Title</h3>
              <p className="text-muted-foreground text-sm">
                Gist with a descriptive title
              </p>
              <Button
                onClick={() => {
                  setScenario("with-title");
                  setDialogOpen(true);
                }}
                className="w-full"
              >
                Open Dialog
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Long Encryption Key</h3>
              <p className="text-muted-foreground text-sm">
                Gist with very long encryption key
              </p>
              <Button
                onClick={() => {
                  setScenario("long-key");
                  setDialogOpen(true);
                }}
                className="w-full"
              >
                Open Dialog
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Features Demonstrated</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">✅ Core Features</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Visual URL fragment separation</li>
                <li>• Copy to clipboard with feedback</li>
                <li>• Download as text file</li>
                <li>• Security warning display</li>
                <li>• Success animation on creation</li>
                <li>• Mobile-friendly responsive layout</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">🔒 Security Features</h3>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Fragment key highlighting</li>
                <li>• Clear security warnings</li>
                <li>• Complete URL copy requirement</li>
                <li>• No URL logging or analytics</li>
                <li>• Fallback copy for older browsers</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Accessibility Features</h2>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>• Keyboard navigation support</li>
            <li>• Focus trap within dialog</li>
            <li>• Escape key to close</li>
            <li>• Screen reader friendly labels</li>
            <li>• Auto-focus on primary action</li>
          </ul>
        </div>
      </div>

      <ShareDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shareUrl={scenarios[scenario].url}
        gistTitle={scenarios[scenario].title}
        onCopy={handleCopy}
        onDownload={handleDownload}
      />
    </div>
  );
}
