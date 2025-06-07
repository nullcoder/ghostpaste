"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NotFound from "@/app/not-found";
import { ExternalLink, Ghost } from "lucide-react";

export default function NotFoundDemo() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">404 Page Demo</h1>
        <p className="text-muted-foreground text-lg">
          Preview of our ghost-themed 404 error page
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ghost className="h-5 w-5" />
            404 Page Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">👻</span>
              <span>Animated floating ghost icon</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">✨</span>
              <span>Glitch effect on the 404 text</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">🎨</span>
              <span>Ghost-themed humor and messaging</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">🌓</span>
              <span>Dark/light theme support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">📱</span>
              <span>Responsive design for all devices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-muted-foreground">🔗</span>
              <span>Clear call-to-action buttons</span>
            </li>
          </ul>

          <div className="space-y-3 border-t pt-4">
            <p className="text-muted-foreground text-sm">
              Try visiting a non-existent page to see it in action:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/this-page-does-not-exist" target="_blank">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  /this-page-does-not-exist
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/g/fake-gist-id" target="_blank">
                  <ExternalLink className="mr-2 h-3 w-3" />
                  /g/fake-gist-id
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-lg border">
            <NotFound />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Animation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Ghost Float Animation</h3>
            <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-sm">
              {`@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-20px) scale(1.05);
    opacity: 0.7;
  }
}`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">404 Glitch Effect</h3>
            <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-sm">
              {`@keyframes glitch {
  /* RGB shadow effect that shifts */
  text-shadow: 
    0.02em 0 0 rgba(255, 0, 0, 0.75),
    -0.02em -0 0 rgba(0, 255, 0, 0.75),
    0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
