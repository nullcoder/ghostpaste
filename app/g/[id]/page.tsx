"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { GistViewer } from "@/components/gist-viewer";
import { LoadingState } from "@/components/ui/loading-state";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import {
  ExternalLink,
  AlertTriangle,
  KeyRound,
  Clock,
  FileCode,
  Trash2,
} from "lucide-react";
import { extractKeyFromUrl, unpackAndDecrypt, decrypt } from "@/lib/crypto";
import { decodeFiles } from "@/lib/binary";
import { formatDistanceToNow } from "date-fns";
import { base64Decode } from "@/lib/base64";
import type { GistMetadata, UserMetadata } from "@/types/models";
import type { File } from "@/types";

interface ViewGistPageProps {
  params: Promise<{ id: string }>;
}

export default function ViewGistPage({ params: _params }: ViewGistPageProps) {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<GistMetadata | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [decryptionFailed, setDecryptionFailed] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [viewUrl, setViewUrl] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Fetch and decrypt gist
  const fetchAndDecryptGist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setWarning(null);
      setDecryptionFailed(false);
      setNotFound(false);

      // Get the encryption key from URL fragment
      const key = await extractKeyFromUrl(window.location.href);
      if (!key) {
        setError("🔐 No encryption key found in URL");
        setDecryptionFailed(true);
        setLoading(false);
        return;
      }

      // Fetch gist metadata
      const metadataResponse = await fetch(`/api/gists/${id}`, {
        headers: {
          "X-Requested-With": "GhostPaste",
        },
      });

      if (!metadataResponse.ok) {
        if (metadataResponse.status === 404) {
          setNotFound(true);
          setError("🤷 Gist not found. It may have expired or been deleted.");
        } else {
          const errorData = (await metadataResponse.json()) as {
            message?: string;
          };
          setError(errorData.message || "Failed to fetch gist");
        }
        setLoading(false);
        return;
      }

      const gistData = (await metadataResponse.json()) as GistMetadata;
      setMetadata(gistData);

      // Check if gist has expired
      if (gistData.expires_at && new Date(gistData.expires_at) < new Date()) {
        setError("⏰ This gist has expired and is no longer available.");
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Handle one-time view warning
      if (gistData.one_time_view && !gistData.viewed_at) {
        setWarning(
          "⚠️ This is a one-time view gist. It will be deleted after viewing."
        );
      }

      // Fetch encrypted blob
      const blobResponse = await fetch(`/api/blobs/${id}`, {
        headers: {
          "X-Requested-With": "GhostPaste",
        },
      });

      if (!blobResponse.ok) {
        setError("Failed to fetch gist content");
        setLoading(false);
        return;
      }

      const blob = await blobResponse.arrayBuffer();

      // Decrypt the blob
      try {
        const decryptedData = await unpackAndDecrypt(new Uint8Array(blob), key);
        const decodedFiles = decodeFiles(decryptedData);
        setFiles(decodedFiles);

        // Decrypt the metadata if present
        if (
          gistData.encrypted_metadata?.iv &&
          gistData.encrypted_metadata?.data
        ) {
          try {
            // Convert base64 to Uint8Array for decryption
            const metadataIv = base64Decode(gistData.encrypted_metadata.iv);
            const metadataCiphertext = base64Decode(
              gistData.encrypted_metadata.data
            );

            const decryptedMetadata = await decrypt(
              { iv: metadataIv, ciphertext: metadataCiphertext },
              key
            );
            const metadataJson = new TextDecoder().decode(decryptedMetadata);
            const userMetadata = JSON.parse(metadataJson) as UserMetadata;

            if (userMetadata.description) {
              setDescription(userMetadata.description);
            }
          } catch (metadataError) {
            console.warn("Failed to decrypt metadata:", metadataError);
            // Non-critical error, continue without description
          }
        }

        // For one-time view gists, mark as viewed
        if (gistData.one_time_view && !gistData.viewed_at) {
          // The GET request should have already marked it as viewed
          // Just show a message
          setWarning(
            "🗑️ This gist has been viewed and will be deleted shortly."
          );
        }
      } catch (decryptError) {
        console.error("Decryption failed:", decryptError);
        setError(
          "🔓 Failed to decrypt gist. Invalid encryption key or corrupted data."
        );
        setDecryptionFailed(true);
      }
    } catch (err) {
      console.error("Error fetching gist:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Set view URL on mount
  useEffect(() => {
    setViewUrl(window.location.href);
  }, []);

  // Fetch gist on mount
  useEffect(() => {
    fetchAndDecryptGist();
  }, [fetchAndDecryptGist]);

  if (loading) {
    return (
      <Container className="py-8">
        <LoadingState
          type="spinner"
          message="Decrypting gist... Please wait while we decrypt your content"
        />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="max-w-2xl py-8">
        <Alert
          variant={notFound || decryptionFailed ? "destructive" : "default"}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>

        {decryptionFailed && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Missing Encryption Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This gist is encrypted and requires a decryption key. The key
                should be included in the URL after the # symbol.
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">A valid URL looks like:</p>
                <code className="bg-muted block rounded p-2 text-xs">
                  {window.location.origin}/g/{id}#key=your-encryption-key
                </code>
              </div>
              <p className="text-muted-foreground text-sm">
                If you don&apos;t have the complete URL with the key, you
                won&apos;t be able to view this gist.
              </p>
            </CardContent>
          </Card>
        )}

        {notFound && (
          <div className="mt-6 text-center">
            <Button
              variant="default"
              onClick={() => (window.location.href = "/")}
            >
              Go to Homepage
            </Button>
          </div>
        )}
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Warning Alert */}
      {warning && (
        <Alert className="mb-6" variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}

      {/* Gist Header */}
      {metadata && (
        <div className="mb-6 space-y-4">
          {/* Title and metadata */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {description || "✨ Anonymous Gist"}
              </h1>
              <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="flex items-center gap-1">
                  <FileCode className="h-4 w-4" />
                  {files.length} {files.length === 1 ? "file" : "files"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Created{" "}
                  {formatDistanceToNow(new Date(metadata.created_at), {
                    addSuffix: true,
                  })}
                </span>
                {metadata.expires_at && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-600">
                      Expires{" "}
                      {formatDistanceToNow(new Date(metadata.expires_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {metadata.one_time_view && (
                <Badge variant="destructive" className="gap-1">
                  <Trash2 className="h-3 w-3" />
                  One-time view
                </Badge>
              )}
              <CopyButton
                text={viewUrl}
                variant="outline"
                size="default"
                successMessage="Gist URL copied!"
              >
                Copy URL
              </CopyButton>
              <Button
                variant="outline"
                size="default"
                onClick={() => window.open(viewUrl, "_blank")}
                aria-label="Open in new tab"
                className="px-3"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Editor preferences */}
          {(metadata.theme || metadata.indent_mode) && (
            <div className="flex gap-2">
              {metadata.theme && (
                <Badge variant="secondary" className="text-xs">
                  Theme: {metadata.theme}
                </Badge>
              )}
              {metadata.indent_mode && (
                <Badge variant="secondary" className="text-xs">
                  {metadata.indent_mode === "tabs"
                    ? "Tabs"
                    : `${metadata.indent_size || 2} Spaces`}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Files Viewer */}
      <GistViewer files={files} className="mt-6" />
    </Container>
  );
}
