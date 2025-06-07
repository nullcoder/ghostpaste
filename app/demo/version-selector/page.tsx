"use client";

import * as React from "react";
import {
  VersionSelector,
  CompactVersionSelector,
  formatVersionTime,
  type Version,
} from "@/components/ui/version-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Generate mock versions with realistic data
function generateMockVersions(count: number): Version[] {
  const versions: Version[] = [];
  const now = Date.now();

  for (let i = count; i > 0; i--) {
    // Create versions with varying time intervals
    let createdAt: number;
    if (i === count) {
      // Current version - 2 hours ago
      createdAt = now - 2 * 60 * 60 * 1000;
    } else if (i === count - 1) {
      // Previous version - 1 day ago
      createdAt = now - 24 * 60 * 60 * 1000;
    } else if (i === count - 2) {
      // 3 days ago
      createdAt = now - 3 * 24 * 60 * 60 * 1000;
    } else if (i === count - 3) {
      // 1 week ago
      createdAt = now - 7 * 24 * 60 * 60 * 1000;
    } else {
      // Older versions - weeks/months ago
      createdAt = now - (count - i + 7) * 24 * 60 * 60 * 1000;
    }

    versions.push({
      version: i,
      created_at: new Date(createdAt).toISOString(),
      size: Math.floor(Math.random() * 5000) + 500,
      file_count: Math.floor(Math.random() * 5) + 1,
      edited_with_pin: i > 1 && Math.random() > 0.7, // 30% chance for non-original versions
    });
  }

  return versions;
}

export default function VersionSelectorDemo() {
  const [currentVersion, setCurrentVersion] = React.useState(5);
  const [compactVersion, setCompactVersion] = React.useState(3);
  const [loadingDemo, setLoadingDemo] = React.useState(false);

  const fewVersions = generateMockVersions(3);
  const manyVersions = generateMockVersions(12);
  const singleVersion = generateMockVersions(1);

  const handleVersionChange = (version: number) => {
    setLoadingDemo(true);
    toast.info(`Loading version ${version}...`);

    setTimeout(() => {
      setCurrentVersion(version);
      setLoadingDemo(false);
      toast.success(`Switched to version ${version}`);
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Version Selector Demo</h1>

      <Tabs defaultValue="standard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="standard">Standard</TabsTrigger>
          <TabsTrigger value="compact">Compact</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="formatting">Time Format</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Standard Version Selector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Multiple Versions (12 versions)
                </h3>
                <VersionSelector
                  currentVersion={currentVersion}
                  versions={manyVersions}
                  onVersionChangeAction={handleVersionChange}
                  loading={loadingDemo}
                />
                <p className="text-muted-foreground mt-2 text-sm">
                  Currently viewing version {currentVersion}
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Few Versions (3 versions)
                </h3>
                <VersionSelector
                  currentVersion={2}
                  versions={fewVersions}
                  onVersionChangeAction={(v) =>
                    toast.info(`Selected version ${v}`)
                  }
                />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Single Version (no dropdown)
                </h3>
                <VersionSelector
                  currentVersion={1}
                  versions={singleVersion}
                  onVersionChangeAction={(v) =>
                    toast.info(`Selected version ${v}`)
                  }
                />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">No Versions</h3>
                <VersionSelector
                  currentVersion={1}
                  versions={[]}
                  onVersionChangeAction={(v) =>
                    toast.info(`Selected version ${v}`)
                  }
                />
                <p className="text-muted-foreground text-sm">
                  Returns null when no versions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compact Version Selector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Compact Mode (Mobile-friendly)
                </h3>
                <CompactVersionSelector
                  currentVersion={compactVersion}
                  versions={manyVersions.slice(0, 5)}
                  onVersionChangeAction={setCompactVersion}
                />
                <p className="text-muted-foreground mt-2 text-sm">
                  Currently viewing version {compactVersion}
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Compact with Custom Styling
                </h3>
                <div className="flex gap-2">
                  <CompactVersionSelector
                    currentVersion={2}
                    versions={fewVersions}
                    onVersionChangeAction={(v) =>
                      toast.info(`Selected version ${v}`)
                    }
                    className="w-[100px]"
                  />
                  <span className="text-muted-foreground text-sm">
                    Custom width
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Different States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Loading State</h3>
                <VersionSelector
                  currentVersion={3}
                  versions={fewVersions}
                  onVersionChangeAction={() => {}}
                  loading={true}
                />
                <p className="text-muted-foreground mt-2 text-sm">
                  Selector is disabled during loading
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">Disabled State</h3>
                <VersionSelector
                  currentVersion={3}
                  versions={fewVersions}
                  onVersionChangeAction={() => {}}
                  disabled={true}
                />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  With PIN-edited Versions
                </h3>
                <VersionSelector
                  currentVersion={3}
                  versions={[
                    ...fewVersions,
                    {
                      version: 4,
                      created_at: new Date(
                        Date.now() - 60 * 60 * 1000
                      ).toISOString(),
                      size: 2048,
                      file_count: 3,
                      edited_with_pin: true,
                    },
                  ]}
                  onVersionChangeAction={(v) =>
                    toast.info(`Selected version ${v}`)
                  }
                />
                <p className="text-muted-foreground mt-2 text-sm">
                  Lock icon indicates PIN-protected edits
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formatting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Formatting Examples</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { time: 30, label: "30 seconds ago" },
                { time: 60, label: "1 minute ago" },
                { time: 300, label: "5 minutes ago" },
                { time: 3600, label: "1 hour ago" },
                { time: 7200, label: "2 hours ago" },
                { time: 86400, label: "Yesterday" },
                { time: 259200, label: "3 days ago" },
                { time: 604800, label: "1 week ago" },
                { time: 2592000, label: "1 month ago" },
                { time: 31536000, label: "1 year ago" },
              ].map(({ time, label }) => {
                const timestamp = new Date(
                  Date.now() - time * 1000
                ).toISOString();
                const formatted = formatVersionTime(timestamp);
                return (
                  <div key={time} className="flex items-center gap-4">
                    <Badge variant="outline" className="w-32">
                      {label}
                    </Badge>
                    <span className="font-mono text-sm">{formatted}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
            {`// Standard version selector
<VersionSelector
  currentVersion={3}
  versions={versions}
  onVersionChangeAction={handleVersionChange}
  loading={isLoading}
/>

// Compact version selector
<CompactVersionSelector
  currentVersion={3}
  versions={versions}
  onVersionChangeAction={handleVersionChange}
/>

// Version data structure
const version: Version = {
  version: 3,
  created_at: "2025-01-15T10:30:00Z",
  size: 2048,
  file_count: 2,
  edited_with_pin: true
};

// Format timestamp
const formatted = formatVersionTime(timestamp);`}
          </pre>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>✓ Dropdown showing version list with timestamps</p>
          <p>✓ Current version clearly highlighted</p>
          <p>✓ Human-readable relative timestamps</p>
          <p>✓ Shows version metadata (file count, PIN edits)</p>
          <p>✓ Maximum 50 versions support</p>
          <p>✓ Reverse chronological order (newest first)</p>
          <p>✓ Loading and disabled states</p>
          <p>✓ Mobile-friendly compact variant</p>
          <p>✓ Keyboard navigable</p>
          <p>✓ Accessible with ARIA labels</p>
        </CardContent>
      </Card>
    </div>
  );
}
