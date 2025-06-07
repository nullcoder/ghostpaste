"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  KeyboardShortcutsHelp,
  KeyboardShortcut,
} from "@/components/keyboard-shortcuts-help";
import { useGlobalShortcuts, getPlatformKeyName } from "@/lib/hooks";
import { toast } from "sonner";
import { Keyboard, Save, Send, HelpCircle, X } from "lucide-react";

export default function KeyboardShortcutsDemo() {
  const [showHelp, setShowHelp] = useState(false);
  const [lastAction, setLastAction] = useState<string>("");
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  const platformKey = getPlatformKeyName();

  // Set up global shortcuts
  useGlobalShortcuts({
    onSave: async () => {
      setLastAction("Save triggered!");
      toast.success("Save shortcut triggered", {
        description: `${platformKey} + S was pressed`,
      });
    },
    onSubmit: async () => {
      setLastAction("Submit triggered!");
      toast.success("Submit shortcut triggered", {
        description: `${platformKey} + Enter was pressed`,
      });
    },
    onEscape: () => {
      setLastAction("Escape triggered!");
      toast.info("Escape key pressed", {
        description: "This would close dialogs",
      });
    },
    onHelp: () => {
      setLastAction("Help triggered!");
      setShowHelp(true);
    },
    enabled: shortcutsEnabled,
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Keyboard Shortcuts Demo</h1>
          <p className="text-muted-foreground text-lg">
            Test the keyboard shortcuts implementation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Global Shortcuts Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Shortcuts Enabled</p>
                <p className="text-muted-foreground text-sm">
                  Toggle to enable/disable all keyboard shortcuts
                </p>
              </div>
              <Button
                variant={shortcutsEnabled ? "default" : "outline"}
                onClick={() => setShortcutsEnabled(!shortcutsEnabled)}
              >
                {shortcutsEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg border p-4">
              <p className="mb-2 text-sm font-medium">Last Action:</p>
              <p className="font-mono text-lg">
                {lastAction || "No action triggered yet"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold">Try these shortcuts:</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Save className="text-muted-foreground h-4 w-4" />
                    <span>Save action</span>
                  </div>
                  <KeyboardShortcut keys={`${platformKey} + S`} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Send className="text-muted-foreground h-4 w-4" />
                    <span>Submit action</span>
                  </div>
                  <KeyboardShortcut keys={`${platformKey} + Enter`} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <X className="text-muted-foreground h-4 w-4" />
                    <span>Escape/Cancel</span>
                  </div>
                  <KeyboardShortcut keys="Escape" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="text-muted-foreground h-4 w-4" />
                    <span>Show help</span>
                  </div>
                  <KeyboardShortcut keys={`${platformKey} + ?`} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <Button onClick={() => setShowHelp(true)} className="w-full">
                <Keyboard className="mr-2 h-4 w-4" />
                Show All Keyboard Shortcuts
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted overflow-x-auto rounded-lg p-4 font-mono text-sm">
              <pre>{`import { useGlobalShortcuts } from "@/lib/hooks";

function MyComponent() {
  useGlobalShortcuts({
    onSave: async () => {
      // Handle save action
      await saveData();
      toast.success("Saved!");
    },
    onSubmit: async () => {
      // Handle submit action
      await submitForm();
    },
    onEscape: () => {
      // Close dialogs, cancel actions
      closeModal();
    },
    onHelp: () => {
      // Show help dialog
      setShowHelp(true);
    },
    enabled: true, // Can be toggled
  });
}`}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              The keyboard shortcuts automatically detect your platform and show
              the appropriate keys.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="mb-2 font-medium">Your Platform</p>
                <p className="font-mono text-lg">
                  {typeof navigator !== "undefined"
                    ? navigator.platform
                    : "Unknown"}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-2 font-medium">Command Key</p>
                <p className="font-mono text-lg">{platformKey}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsHelp open={showHelp} onOpenChange={setShowHelp} />
    </div>
  );
}
