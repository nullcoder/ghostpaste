"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import {
  MultiFileEditor,
  type MultiFileEditorHandle,
} from "@/components/ui/multi-file-editor";
import { ExpirySelector } from "@/components/ui/expiry-selector";
import { PasswordInput } from "@/components/ui/password-input";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { encryptGist } from "@/lib/crypto-utils";
import type { FileData } from "@/components/ui/file-editor";
import { SecurityLoading } from "@/components/security-loading";
import { Turnstile } from "@/components/ui/turnstile";

export default function CreateGistPage() {
  // Get Turnstile site key - safe to use on client as it's a public key
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const router = useRouter();
  const multiFileEditorRef = useRef<MultiFileEditorHandle>(null);
  const [files, setFiles] = useState<FileData[]>(() => [
    {
      id: "initial-file",
      name: "untitled.txt",
      content: "",
      language: "text",
    },
  ]);
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(() => {
    // Default to 7 days from now
    const sevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return sevenDays.toISOString();
  });
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  );
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isTurnstileReady, setIsTurnstileReady] = useState(false);

  // Stable callback references to prevent Turnstile re-renders
  const handleTurnstileSuccess = useCallback((token: string) => {
    setTurnstileToken(token);
    setIsTurnstileReady(true);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setError(
      "🛡️ Security check failed. Please refresh the page and try again."
    );
    setIsTurnstileReady(false);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
    setIsTurnstileReady(false);
    setError(
      "⏰ Security verification expired. Please refresh the page to continue."
    );
  }, []);

  const handleFilesChange = useCallback((newFiles: FileData[]) => {
    setFiles(newFiles);
    // Don't clear errors on file change - let them persist

    // Check for duplicate filenames
    const nameCount = new Map<string, number>();
    const duplicates = new Set<string>();

    newFiles.forEach((file) => {
      const count = (nameCount.get(file.name) || 0) + 1;
      nameCount.set(file.name, count);
      if (count > 1) {
        duplicates.add(file.name);
      }
    });

    if (duplicates.size > 0) {
      setValidationMessage(
        "🚨 Oops! You have duplicate filenames. Each file needs a unique name!"
      );
      setHasValidationErrors(true);
    } else {
      setValidationMessage(null);
      setHasValidationErrors(false);
    }
  }, []);

  const handleValidationChange = useCallback(
    (isValid: boolean) => {
      if (!isValid && !validationMessage) {
        setValidationMessage(
          "🔧 There are some issues to fix before we can proceed"
        );
      } else if (
        isValid &&
        validationMessage &&
        !validationMessage.includes("duplicate")
      ) {
        setValidationMessage(null);
      }
      setHasValidationErrors(!isValid);
    },
    [validationMessage]
  );

  const handleCreate = async () => {
    try {
      setIsCreating(true);
      setError(null);
      setValidationMessage(null);

      // Get current files with their actual content from editors
      const currentFiles = multiFileEditorRef.current?.getFiles() || files;

      // Validate before submission
      if (currentFiles.length === 0) {
        setError("✋ Hold up! You need at least one file to create a gist");
        return;
      }

      // Check if all files are empty
      const hasContent = currentFiles.some(
        (file) => file.content.trim().length > 0
      );
      if (!hasContent) {
        setError(
          "💭 Your files are empty! Add some code, text, or even your favorite recipe"
        );
        return;
      }

      if (hasValidationErrors) {
        setError(
          "⚠️ Almost there! Just fix the issues above and you're good to go"
        );
        return;
      }

      // Verify Turnstile token
      if (!turnstileToken) {
        setError(
          "🛡️ Security verification required. Please refresh the page and try again."
        );
        return;
      }

      // Encrypt the gist on the client side
      const encryptedGist = await encryptGist(currentFiles, {
        description: description || undefined,
        editPin: password || undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      // Prepare FormData for multipart/form-data submission
      const formData = new FormData();

      // Add encrypted data as blob
      const encryptedBlob = new Blob([encryptedGist.encryptedData], {
        type: "application/octet-stream",
      });
      formData.append("blob", encryptedBlob);

      // Add metadata as JSON blob
      const metadataBlob = new Blob([JSON.stringify(encryptedGist.metadata)], {
        type: "application/json",
      });
      formData.append("metadata", metadataBlob);

      // Add password if provided
      if (password) {
        formData.append("password", password);
      }

      // Add Turnstile token
      formData.append("turnstileToken", turnstileToken);

      // Call the API to create the gist
      const response = await fetch("/api/gists", {
        method: "POST",
        headers: {
          "X-Requested-With": "GhostPaste",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json()) as {
          message?: string;
          error?: string;
        };
        const errorMessage =
          errorData.message || errorData.error || "Failed to create gist";
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as { id: string };

      // Create the shareable URL with the encryption key in the fragment
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}/g/${data.id}#key=${encryptedGist.encryptionKey}`;

      setShareUrl(fullUrl);
    } catch (err) {
      console.error("Error creating gist:", err);
      if (err instanceof Error) {
        // Add some personality to common errors
        if (err.message.includes("size")) {
          setError(
            "📏 Whoa! That's too big. Try keeping each file under 500KB"
          );
        } else if (err.message.includes("network")) {
          setError("🌐 Network hiccup! Check your connection and try again");
        } else {
          setError(`😕 Something went wrong: ${err.message}`);
        }
      } else {
        setError("🤔 An unexpected error occurred. Mind trying again?");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleShareClose = () => {
    // Reset form and redirect to home
    router.push("/");
  };

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">Create New Gist</h1>
        <p className="text-muted-foreground">
          Share code snippets securely with zero-knowledge encryption. Your
          files are encrypted locally in your browser before upload.
        </p>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              Give your gist a memorable title or description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="What's in this gist?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* File Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>
              Add your code, configs, or notes. Up to 20 files, 500KB each.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MultiFileEditor
              ref={multiFileEditorRef}
              initialFiles={files}
              onChange={handleFilesChange}
              onValidationChange={handleValidationChange}
              maxFiles={20}
              maxFileSize={500 * 1024}
            />
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>
              Control who can edit and when your gist expires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiration</Label>
              <ExpirySelector value={expiresAt} onChange={setExpiresAt} />
              <p className="text-muted-foreground text-sm">
                Your gist will self-destruct at the selected time (defaults to 7
                days)
              </p>
            </div>

            {/* Password Protection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="password">Password</Label>
                <Badge variant="secondary" className="text-xs">
                  Optional
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Add a password to control who can edit or delete your gist.
                Leave empty if you don&apos;t need edit protection.
              </p>
              <PasswordInput
                value={password}
                onChange={setPassword}
                mode="create"
                placeholder="Leave empty for no protection"
                showConfirm={false}
                label=""
                fieldName="Password"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {(error || validationMessage) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {validationMessage && <div>{validationMessage}</div>}
              {error && <div>{error}</div>}
            </AlertDescription>
          </Alert>
        )}

        {/* Create Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleCreate}
            disabled={
              isCreating ||
              files.length === 0 ||
              hasValidationErrors ||
              (!!turnstileSiteKey && !isTurnstileReady)
            }
          >
            {isCreating ? (
              <LoadingState type="spinner" message="Creating..." />
            ) : (
              "Create Gist"
            )}
          </Button>
        </div>

        {/* Security Loading Overlay */}
        {isCreating && (
          <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-card rounded-lg border p-8 shadow-lg">
              <SecurityLoading
                type="encrypt"
                message="Encrypting your files securely..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Invisible Turnstile Verification */}
      {turnstileSiteKey && (
        <Turnstile
          sitekey={turnstileSiteKey}
          action="create_gist"
          onSuccess={handleTurnstileSuccess}
          onError={handleTurnstileError}
          onExpire={handleTurnstileExpire}
          appearance="interaction-only"
        />
      )}

      {/* Share Dialog */}
      {shareUrl && (
        <ShareDialog
          shareUrl={shareUrl}
          open={true}
          onOpenChange={(open) => !open && handleShareClose()}
        />
      )}
    </Container>
  );
}
