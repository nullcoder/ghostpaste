"use client";

import * as React from "react";
import { Footer, FooterWithBuildInfo } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FooterDemo() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-3xl font-bold">Footer Component Demo</h1>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Footer</TabsTrigger>
            <TabsTrigger value="build">With Build Info</TabsTrigger>
            <TabsTrigger value="styled">Custom Styling</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Footer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  The default footer with branding and navigation links.
                </p>
                <div className="rounded-lg border">
                  <Footer />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="build" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Footer with Build Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Footer displaying build ID for version tracking.
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg border">
                    <Footer buildId="v1.2.3-abc123" />
                  </div>
                  <div className="rounded-lg border">
                    <FooterWithBuildInfo />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="styled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Styled Footer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Footer with custom background and styling.
                </p>
                <div className="space-y-4">
                  <div className="rounded-lg border">
                    <Footer
                      className="bg-primary/5 border-t-primary/20"
                      buildId="custom-123"
                    />
                  </div>
                  <div className="rounded-lg border">
                    <Footer
                      className="from-primary/5 to-secondary/5 bg-gradient-to-r"
                      buildId="gradient-456"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Responsive Behavior</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 text-sm">
              The footer adapts to different screen sizes. Try resizing your
              browser window to see the responsive layout in action.
            </p>
            <div className="space-y-2 text-sm">
              <p>
                • <strong>Desktop (≥768px):</strong> Horizontal layout with
                left-aligned branding and right-aligned navigation
              </p>
              <p>
                • <strong>Mobile (&lt;768px):</strong> Stacked layout with
                centered content
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted overflow-x-auto rounded-lg p-4 text-sm">
              {`// Basic footer
<Footer />

// Footer with build ID
<Footer buildId="v1.2.3" />

// Footer with environment-based build ID
<FooterWithBuildInfo />

// Footer with custom styling
<Footer 
  className="bg-primary/5" 
  buildId="custom-build"
/>`}
            </pre>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              ✓ Responsive layout (horizontal on desktop, stacked on mobile)
            </p>
            <p>✓ Branding with Ghost icon and company name</p>
            <p>✓ Copyright notice with current year</p>
            <p>✓ Navigation links (GitHub, Privacy, Terms)</p>
            <p>✓ Optional build/version display</p>
            <p>✓ Proper semantic HTML structure</p>
            <p>✓ Accessible navigation with ARIA labels</p>
            <p>✓ Theme-aware styling</p>
            <p>✓ External links open in new tab with security attributes</p>
          </CardContent>
        </Card>
      </div>

      {/* Example of footer at page bottom */}
      <div className="mt-auto">
        <Footer buildId="demo-build" />
      </div>
    </div>
  );
}
