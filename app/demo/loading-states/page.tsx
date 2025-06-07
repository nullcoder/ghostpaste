"use client";

import * as React from "react";
import {
  LoadingState,
  LoadingSkeleton,
  LoadingSpinner,
  LoadingProgress,
  EditorSkeleton,
  useDelayedLoading,
} from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoadingStatesDemo() {
  const [showFullscreen, setShowFullscreen] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [isDelayedLoading, setIsDelayedLoading] = React.useState(false);
  const showDelayed = useDelayedLoading(isDelayedLoading, 500);

  // Simulate progress
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 10;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Loading States Demo</h1>

      <Tabs defaultValue="skeleton" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skeleton">Skeleton</TabsTrigger>
          <TabsTrigger value="spinner">Spinner</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="delayed">Delayed</TabsTrigger>
        </TabsList>

        <TabsContent value="skeleton" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loading States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Generic Loading Skeleton
                </h3>
                <LoadingState type="skeleton" />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Editor Loading Skeleton
                </h3>
                <EditorSkeleton />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Direct Skeleton Component
                </h3>
                <LoadingSkeleton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spinner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spinner Loading States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Default Spinner</h3>
                <LoadingState type="spinner" />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Spinner with Custom Message
                </h3>
                <LoadingState type="spinner" message="Encrypting files..." />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Direct Spinner Component
                </h3>
                <LoadingSpinner message="Decrypting gist..." />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Fullscreen Spinner
                </h3>
                <Button
                  onClick={() => {
                    setShowFullscreen(true);
                    setTimeout(() => setShowFullscreen(false), 3000);
                  }}
                >
                  Show Fullscreen Spinner (3s)
                </Button>
                {showFullscreen && (
                  <LoadingState
                    type="spinner"
                    message="Processing your request..."
                    fullscreen
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Loading States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Auto-incrementing Progress
                </h3>
                <LoadingState
                  type="progress"
                  message="Uploading files..."
                  progress={progress}
                />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Static Progress Examples
                </h3>
                <div className="space-y-4">
                  <LoadingProgress message="Processing main.js" progress={25} />
                  <LoadingProgress
                    message="Encrypting data.json"
                    progress={50}
                  />
                  <LoadingProgress
                    message="Finalizing upload..."
                    progress={90}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Edge Cases (Clamped Values)
                </h3>
                <div className="space-y-4">
                  <LoadingProgress
                    message="Negative progress (clamped to 0)"
                    progress={-20}
                  />
                  <LoadingProgress
                    message="Overflow progress (clamped to 100)"
                    progress={150}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delayed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delayed Loading States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  useDelayedLoading Hook Demo
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  The loading state only shows if the operation takes longer
                  than 500ms. This prevents flashing loading states for quick
                  operations.
                </p>
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      setIsDelayedLoading(true);
                      setTimeout(() => setIsDelayedLoading(false), 100);
                    }}
                  >
                    Quick Operation (100ms - No Loading State)
                  </Button>

                  <Button
                    onClick={() => {
                      setIsDelayedLoading(true);
                      setTimeout(() => setIsDelayedLoading(false), 1000);
                    }}
                  >
                    Slow Operation (1s - Shows Loading State)
                  </Button>

                  <div className="mt-4">
                    <p className="text-muted-foreground text-sm">
                      Loading state active: {isDelayedLoading ? "Yes" : "No"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Showing loading UI: {showDelayed ? "Yes" : "No"}
                    </p>
                  </div>

                  {showDelayed && (
                    <LoadingSpinner message="Processing delayed operation..." />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
            {`// Basic skeleton
<LoadingState type="skeleton" />

// Spinner with message
<LoadingState type="spinner" message="Encrypting files..." />

// Progress bar
<LoadingState type="progress" message="Uploading..." progress={45} />

// Fullscreen overlay
<LoadingState type="spinner" fullscreen={true} />

// Editor skeleton
<EditorSkeleton />

// Delayed loading hook
const showLoading = useDelayedLoading(isLoading, 100);
{showLoading && <LoadingSpinner />}`}
          </pre>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Accessibility Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>✓ Proper ARIA roles (status, progressbar)</p>
          <p>✓ Screen reader announcements with aria-live</p>
          <p>✓ Descriptive aria-labels</p>
          <p>✓ Progress percentage announcements</p>
          <p>✓ Respects prefers-reduced-motion</p>
        </CardContent>
      </Card>
    </div>
  );
}
