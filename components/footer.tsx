import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { Ghost } from "lucide-react";

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
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn("bg-background/50 border-t backdrop-blur-sm", className)}
    >
      <Container>
        <div className="py-8 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:justify-between">
            {/* Left section - Branding */}
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <Ghost className="h-6 w-6" aria-hidden="true" />
                <span className="text-lg font-semibold">GhostPaste</span>
              </div>
              <p className="text-muted-foreground text-sm">
                © {currentYear} GhostPaste. Zero-knowledge encrypted code
                sharing.
              </p>
            </div>

            {/* Right section - Navigation */}
            <nav
              className="flex items-center justify-center gap-6 text-sm md:justify-end"
              aria-label="Footer navigation"
            >
              <Link
                href="https://github.com/nullcoder/ghostpaste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
              >
                GitHub
              </Link>
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
              >
                Terms
              </Link>
            </nav>
          </div>

          {/* Optional: Build info */}
          {buildId && (
            <div className="text-muted-foreground/70 mt-6 text-center text-xs md:text-left">
              Build {buildId}
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
}

/**
 * Footer with build ID from environment variable
 */
export function FooterWithBuildInfo(props: Omit<FooterProps, "buildId">) {
  const buildId =
    process.env.NEXT_PUBLIC_BUILD_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

  return <Footer {...props} buildId={buildId} />;
}
