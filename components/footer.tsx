import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { GhostLogo } from "@/components/ghost-logo";
import { DynamicYear } from "@/components/dynamic-year";

export interface FooterProps {
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Build ID to display (optional)
   */
  buildId?: string;
}

/**
 * Footer component with branding, copyright, and navigation links
 */
export function Footer({ className, buildId }: FooterProps) {
  return (
    <footer
      className={cn("bg-background/50 border-t backdrop-blur-sm", className)}
    >
      <Container>
        <div className="py-8 md:py-12">
          {/* Top section - Branding and main nav */}
          <div className="grid gap-8 md:grid-cols-4">
            {/* Branding */}
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <GhostLogo className="text-indigo-600/80 dark:text-indigo-400/80" />
                <span className="text-lg font-semibold">GhostPaste</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Zero-knowledge encrypted code sharing. Your code stays private.
              </p>
              <p className="text-muted-foreground text-xs">
                © <DynamicYear /> GhostPaste
              </p>
            </div>

            {/* Product column */}
            <div className="text-center md:text-left">
              <h3 className="mb-3 font-semibold">✨ Make Magic</h3>
              <nav
                className="flex flex-col gap-2"
                aria-label="Product navigation"
              >
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  Home
                </Link>
                <Link
                  href="/create"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  Create
                </Link>
                <Link
                  href="/examples"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  Examples
                </Link>
                <Link
                  href="/help"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  Help/FAQ
                </Link>
              </nav>
            </div>

            {/* Company column */}
            <div className="text-center md:text-left">
              <h3 className="mb-3 font-semibold">🤝 Behind the Sheets</h3>
              <nav
                className="flex flex-col gap-2"
                aria-label="Company navigation"
              >
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  About
                </Link>
                <Link
                  href="/security"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  Security
                </Link>
                <Link
                  href="/architecture"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  Architecture
                </Link>
                <Link
                  href="https://github.com/nullcoder/ghostpaste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  GitHub
                </Link>
              </nav>
            </div>

            {/* Legal column */}
            <div className="text-center md:text-left">
              <h3 className="mb-3 font-semibold">⚖️ Boring (but Important)</h3>
              <nav
                className="flex flex-col gap-2"
                aria-label="Legal navigation"
              >
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  Terms of Service
                </Link>
                <Link
                  href="https://github.com/nullcoder/ghostpaste/security/policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
                >
                  Security Policy
                </Link>
              </nav>
            </div>
          </div>

          {/* Bottom section - Claude message and build info */}
          <div className="border-border/50 mt-8 border-t pt-8">
            <div className="space-y-2 text-center">
              <div className="text-muted-foreground/70 text-xs">
                <span className="inline-block">
                  👻 Haunted by Claude since 2025
                </span>
              </div>
              {buildId && (
                <div className="text-muted-foreground/70 text-xs">
                  Build {buildId}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

/**
 * Footer with build ID from environment variable
 */
export function FooterWithBuildInfo(props: Omit<FooterProps, "buildId">) {
  // For Cloudflare Workers deployment, you need to set this during build
  // e.g., in your build script: NEXT_PUBLIC_BUILD_ID=$(git rev-parse --short HEAD)
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID;

  return <Footer {...props} buildId={buildId} />;
}
