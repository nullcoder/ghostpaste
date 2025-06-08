import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import {
  Lock,
  Ghost,
  Clock,
  Zap,
  ArrowRight,
  Code2,
  Shield,
  Github,
} from "lucide-react";
import { GhostLogo } from "@/components/ghost-logo";
import { RotatingTaglines } from "@/components/rotating-taglines";

export const metadata: Metadata = {
  title: "GhostPaste - Zero-Knowledge Encrypted Code Sharing",
  description:
    "Share code securely with client-side encryption. Your code stays private - even from us.",
  openGraph: {
    title: "GhostPaste - Share Code. Keep Secrets.",
    description:
      "Zero-knowledge encrypted code sharing. Client-side encryption ensures your code stays private - even from us. No tracking, no logs, just security.",
    url: "https://ghostpaste.dev",
  },
  twitter: {
    title: "GhostPaste - Share Code. Keep Secrets.",
    description:
      "Zero-knowledge encrypted code sharing. Client-side encryption ensures your code stays private - even from us.",
  },
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-br via-transparent opacity-50" />
        <Container>
          <div className="relative mx-auto max-w-4xl space-y-8 text-center">
            {/* Logo */}
            <div className="mb-6 inline-flex items-center justify-center">
              <GhostLogo
                size="2xl"
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Share Code.{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                Keep Secrets.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl md:text-2xl">
              Zero-knowledge encrypted code sharing. Perfect for{" "}
              <span className="text-foreground font-medium">
                <RotatingTaglines />
              </span>
              . Your code is encrypted in your browser. We can&apos;t see it.
              Nobody can.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Button asChild size="lg" className="px-8 text-lg">
                <Link href="/create">
                  Start Sharing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Trust Badge */}
            <p className="text-muted-foreground pt-4 text-sm">
              No signup required • Always free • Open source
            </p>
          </div>
        </Container>
      </section>

      {/* Live Demo Section */}
      <section className="bg-muted/30 border-y py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              See the Magic Happen
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Step 1 */}
              <Card className="relative overflow-hidden p-6">
                <div className="text-muted-foreground/10 absolute top-0 right-0 text-6xl font-bold">
                  1
                </div>
                <div className="relative space-y-3">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                    <Code2 className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">You paste your code</h3>
                  <pre className="bg-muted overflow-hidden rounded p-3 text-xs">
                    <code>{`function secret() {\n  return "Hello World";\n}`}</code>
                  </pre>
                </div>
              </Card>

              {/* Step 2 */}
              <Card className="relative overflow-hidden p-6">
                <div className="text-muted-foreground/10 absolute top-0 right-0 text-6xl font-bold">
                  2
                </div>
                <div className="relative space-y-3">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                    <Lock className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">Browser encrypts it</h3>
                  <pre className="bg-muted overflow-hidden rounded p-3 text-xs">
                    <code className="text-muted-foreground">{`7A3B9F2E8C4D6A1B5F9E
2D4C8B7A3F6E1D5C9B8A
4F7E2C1B9D6A3E8F5C2B`}</code>
                  </pre>
                </div>
              </Card>

              {/* Step 3 */}
              <Card className="relative overflow-hidden p-6">
                <div className="text-muted-foreground/10 absolute top-0 right-0 text-6xl font-bold">
                  3
                </div>
                <div className="relative space-y-3">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                    <Shield className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">We store gibberish</h3>
                  <p className="text-muted-foreground text-sm">
                    Only you have the key. We literally can&apos;t decrypt it.
                  </p>
                  <div className="text-primary font-mono text-xs">
                    ghostpaste.dev/g/abc#key=xyz
                  </div>
                </div>
              </Card>
            </div>

            <p className="text-muted-foreground mt-8 text-center">
              Your encryption key stays in the URL fragment (after #) - it never
              reaches our servers
            </p>
          </div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Built for Developers, by Developers (and AI)
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                  <Lock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold">Client-Side Encryption</h3>
                <p className="text-muted-foreground text-sm">
                  AES-256-GCM encryption happens in your browser
                </p>
              </div>

              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                  <Ghost className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">No Account Needed</h3>
                <p className="text-muted-foreground text-sm">
                  Start sharing instantly. No email, no tracking
                </p>
              </div>

              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/10 to-orange-500/10">
                  <Clock className="h-8 w-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="font-semibold">Self-Destructing</h3>
                <p className="text-muted-foreground text-sm">
                  One-time views & auto-expiry keep secrets safe
                </p>
              </div>

              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/10 to-yellow-500/10">
                  <Zap className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold">Lightning Fast</h3>
                <p className="text-muted-foreground text-sm">
                  Edge-powered by Cloudflare Workers
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Three Steps to Secure Sharing
            </h2>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="bg-primary text-primary-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Paste Your Code</h3>
                  <p className="text-muted-foreground">
                    Drop in your code, config files, or any text. Support for
                    multiple files, syntax highlighting, and all major
                    programming languages.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="bg-primary text-primary-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    Get Your Secure Link
                  </h3>
                  <p className="text-muted-foreground">
                    Your code is encrypted instantly. You get a link with the
                    decryption key embedded in the fragment - we never see it.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="bg-primary text-primary-foreground flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    Share with Confidence
                  </h3>
                  <p className="text-muted-foreground">
                    Send the link to anyone. They can view and decrypt locally.
                    Set expiry times or one-time viewing for extra security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Section */}
      <section className="border-t py-20">
        <Container>
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <h2 className="text-3xl font-bold">
              Why Developers Trust GhostPaste
            </h2>

            <div className="grid gap-8 pt-4 md:grid-cols-3">
              <div className="space-y-3">
                <Github className="text-muted-foreground mx-auto h-8 w-8" />
                <h3 className="font-semibold">Open Source</h3>
                <p className="text-muted-foreground text-sm">
                  Every line of code is public. Audit our encryption, run your
                  own instance, contribute improvements.
                </p>
              </div>

              <div className="space-y-3">
                <div className="mx-auto text-2xl">🤖</div>
                <h3 className="font-semibold">Built with Claude Code</h3>
                <p className="text-muted-foreground text-sm">
                  Human-AI collaboration at its finest. Even our AI assistant
                  can&apos;t decrypt your pastes.
                </p>
              </div>

              <div className="space-y-3">
                <div className="mx-auto text-2xl">🔒</div>
                <h3 className="font-semibold">Zero Knowledge</h3>
                <p className="text-muted-foreground text-sm">
                  We can&apos;t read your code, sell your data, or comply with
                  decryption requests. Math protects you.
                </p>
              </div>
            </div>

            <div className="pt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="https://github.com/nullcoder/ghostpaste">
                  <Github className="mr-2 h-5 w-5" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="from-background to-muted/20 bg-gradient-to-b py-20">
        <Container>
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h2 className="text-4xl font-bold">
              Ready to Share Code Securely?
            </h2>
            <p className="text-muted-foreground text-xl">
              Join thousands of developers who trust GhostPaste for private code
              sharing.
            </p>
            <Button asChild size="lg" className="px-8 text-lg">
              <Link href="/create">
                Create Your First Paste
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-muted-foreground text-sm">
              No signup • Free forever • Your code stays yours
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
