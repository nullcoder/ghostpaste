import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GhostLogo } from "@/components/ghost-logo";
import {
  ArrowLeft,
  Shield,
  Eye,
  Database,
  Lock,
  Cookie,
  Globe,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - GhostPaste",
  description:
    "Privacy Policy for GhostPaste - How we protect your data with zero-knowledge encryption",
  openGraph: {
    title: "Privacy Policy - GhostPaste",
    description:
      "We can't read your code. Zero-knowledge encryption, no tracking, no cookies, no analytics. Your privacy is our architecture.",
    url: "https://ghostpaste.dev/privacy",
  },
  twitter: {
    title: "Privacy Policy - GhostPaste",
    description:
      "Zero-knowledge encryption, no tracking, no cookies. We can't read your code even if we wanted to.",
  },
};

export default function PrivacyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="from-background to-muted/20 relative overflow-hidden bg-gradient-to-b py-12">
        <Container>
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <div className="mb-4 inline-flex items-center justify-center">
              <GhostLogo
                size="lg"
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 6, 2025
            </p>
          </div>
        </Container>
      </section>

      {/* Introduction */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  Privacy First, Always
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  This Privacy Policy describes how GhostPaste (&quot;we&quot;,
                  &quot;us&quot;, or &quot;our&quot;) handles information when
                  you use our service. We are committed to protecting your
                  privacy through zero-knowledge encryption and minimal data
                  collection practices.
                </p>
              </div>
              <Card className="bg-primary/5 border-primary/20 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <h3 className="mb-2 font-semibold">The Short Version 🛡️</h3>
                    <p className="text-sm">
                      We can&apos;t see your code. We don&apos;t track you. We
                      don&apos;t sell data. Your pastes are encrypted before
                      they reach us. Privacy isn&apos;t just a feature -
                      it&apos;s our foundation.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Privacy Sections */}
      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-12">
            {/* Information We Don&apos;t Collect */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  1. Information We DON&apos;T Collect
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>Thanks to our zero-knowledge architecture:</p>
                  <ul className="space-y-2 text-sm">
                    <li>We cannot see your unencrypted code or content</li>
                    <li>We do not track individual users</li>
                    <li>We do not use analytics or tracking cookies</li>
                    <li>
                      We do not collect email addresses or personal information
                    </li>
                    <li>We do not have user accounts or profiles</li>
                    <li>We do not log IP addresses for tracking</li>
                    <li>We cannot access your encryption keys</li>
                  </ul>
                </div>
              </div>
              <Card className="h-fit border-green-500/20 bg-green-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Eye className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-green-700 dark:text-green-300">
                      We&apos;re Privacy Blind 🙈
                    </h3>
                    <p className="text-sm">
                      Imagine we&apos;re wearing a blindfold - we literally
                      can&apos;t see your code because it&apos;s encrypted
                      before it reaches us. No tracking, no profiling, no creepy
                      stuff.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* What We Store */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">2. What We Store</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>We only store:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Encrypted blobs:</strong> Your code, encrypted
                      client-side
                    </li>
                    <li>
                      <strong>Metadata:</strong> Creation time, expiry time,
                      file count
                    </li>
                    <li>
                      <strong>Hashed Passwords:</strong> If you set a password
                      (we can&apos;t reverse it)
                    </li>
                    <li>
                      <strong>Random IDs:</strong> To identify your pastes
                    </li>
                  </ul>
                  <p className="mt-4 text-sm">
                    All encryption happens in your browser. We never receive or
                    store plaintext content or encryption keys.
                  </p>
                </div>
              </div>
              <Card className="h-fit border-green-500/20 bg-green-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-green-700 dark:text-green-300">
                      Just Encrypted Gibberish 🔐
                    </h3>
                    <p className="text-sm">
                      Our database looks like random nonsense because everything
                      is encrypted. Even if someone hacked us (please
                      don&apos;t!), they&apos;d just get encrypted blobs they
                      can&apos;t read.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* How Encryption Works */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  3. How Our Encryption Works
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>Your privacy is protected by:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Client-side encryption:</strong> AES-256-GCM in
                      your browser
                    </li>
                    <li>
                      <strong>Key generation:</strong> Unique key for each paste
                    </li>
                    <li>
                      <strong>URL fragments:</strong> Keys in # part (never sent
                      to server)
                    </li>
                    <li>
                      <strong>Zero-knowledge:</strong> We can&apos;t decrypt
                      even if asked
                    </li>
                    <li>
                      <strong>Open source:</strong> Verify our code yourself
                    </li>
                  </ul>
                </div>
              </div>
              <Card className="h-fit border-blue-500/20 bg-blue-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">
                      Fort Knox for Code 🏰
                    </h3>
                    <p className="text-sm">
                      Your code gets locked in a digital safe before leaving
                      your computer. The key? Only you have it. We just store
                      the locked safe. Military-grade encryption, zero access.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Server Logs */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  4. Server Logs & Infrastructure
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>For service operation and security:</p>
                  <ul className="space-y-2 text-sm">
                    <li>Cloudflare may log requests for DDoS protection</li>
                    <li>
                      Temporary error logs for debugging (no personal data)
                    </li>
                    <li>No long-term IP address storage</li>
                    <li>No user behavior tracking</li>
                    <li>Logs are automatically purged</li>
                  </ul>
                </div>
              </div>
              <Card className="h-fit border-yellow-500/20 bg-yellow-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-yellow-700 dark:text-yellow-300">
                      Basic Operations Only 🔧
                    </h3>
                    <p className="text-sm">
                      Cloudflare helps protect against attacks and keeps things
                      fast. They might see you visited, but not what you shared.
                      We keep logs minimal and delete them quickly.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Cookies */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  5. Cookies & Local Storage
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>We use minimal browser storage:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Theme preference:</strong> Light/dark mode choice
                    </li>
                    <li>
                      <strong>No tracking cookies:</strong> Zero, zilch, nada
                    </li>
                    <li>
                      <strong>No third-party cookies:</strong> Just us here
                    </li>
                    <li>
                      <strong>No analytics:</strong> We don&apos;t need to know
                    </li>
                  </ul>
                </div>
              </div>
              <Card className="h-fit border-green-500/20 bg-green-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Cookie className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-green-700 dark:text-green-300">
                      Cookie Diet 🍪
                    </h3>
                    <p className="text-sm">
                      We&apos;re on a strict cookie diet - only the essential
                      one to remember if you like dark mode. No tracking
                      cookies, no ads, no nonsense.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Data Sharing */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  6. Data Sharing & Third Parties
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>We share your data with:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Nobody:</strong> We don&apos;t sell data
                    </li>
                    <li>
                      <strong>No one:</strong> We don&apos;t trade data
                    </li>
                    <li>
                      <strong>Zero third parties:</strong> Your data stays with
                      us
                    </li>
                    <li>
                      <strong>Not even governments:</strong> We can&apos;t
                      decrypt it anyway
                    </li>
                  </ul>
                  <p className="mt-4 text-sm">
                    Exception: Cloudflare provides our infrastructure, but they
                    only see encrypted data.
                  </p>
                </div>
              </div>
              <Card className="h-fit border-green-500/20 bg-green-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-green-700 dark:text-green-300">
                      Your Data = Fort Knox 🏦
                    </h3>
                    <p className="text-sm">
                      We don&apos;t have a business model based on your data. We
                      can&apos;t sell what we can&apos;t see. Even if the FBI
                      asked nicely, we couldn&apos;t help - we don&apos;t have
                      the keys!
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Data Deletion */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  7. Data Retention & Deletion
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>Your data is automatically deleted:</p>
                  <ul className="space-y-2 text-sm">
                    <li>After your set expiry time (1 hour to 30 days)</li>
                    <li>Immediately for one-time view pastes</li>
                    <li>When you manually delete with your password</li>
                    <li>Default retention: 30 days maximum</li>
                  </ul>
                  <p className="mt-4 text-sm">
                    Deleted means deleted - we don&apos;t keep backups of user
                    content.
                  </p>
                </div>
              </div>
              <Card className="h-fit border-blue-500/20 bg-blue-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Database className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">
                      Auto-Cleanup Crew 🧹
                    </h3>
                    <p className="text-sm">
                      Your pastes self-destruct based on your settings. One-time
                      views? Gone after viewing. Set an expiry? Poof, it&apos;s
                      gone. We&apos;re not a permanent storage service.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Your Rights */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">8. Your Rights</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>You have the right to:</p>
                  <ul className="space-y-2 text-sm">
                    <li>Use the service anonymously</li>
                    <li>Delete your content anytime (with password)</li>
                    <li>Not be tracked or profiled</li>
                    <li>Review our open-source code</li>
                    <li>Run your own instance</li>
                  </ul>
                </div>
              </div>
              <Card className="bg-primary/5 border-primary/20 h-fit p-6">
                <div className="flex items-start gap-3">
                  <Shield className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <h3 className="mb-2 font-semibold">
                      You&apos;re in Control 🎮
                    </h3>
                    <p className="text-sm">
                      No accounts, no tracking, no BS. Use it, delete it,
                      inspect the code, or run your own. Your data, your rules.
                      We&apos;re just here to help you share code safely.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Updates */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  9. Policy Updates
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm">
                    We may update this policy to reflect changes in our
                    practices or for legal reasons. Updates will be posted here
                    with a new &quot;Last updated&quot; date. Significant
                    changes will be highlighted.
                  </p>
                </div>
              </div>
              <Card className="h-fit border-blue-500/20 bg-blue-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">
                      Keeping You Posted 📬
                    </h3>
                    <p className="text-sm">
                      If we change something important, we&apos;ll update the
                      date. But honestly, our core promise won&apos;t change: we
                      can&apos;t see your stuff, and we like it that way.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">10. Contact Us</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm">Questions about privacy? Reach out:</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>
                      GitHub Issues:{" "}
                      <Link
                        href="https://github.com/nullcoder/ghostpaste/issues"
                        className="text-primary hover:underline"
                      >
                        Ask a Question
                      </Link>
                    </li>
                    <li>
                      Source Code:{" "}
                      <Link
                        href="https://github.com/nullcoder/ghostpaste"
                        className="text-primary hover:underline"
                      >
                        Verify Our Claims
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <Card className="bg-primary/5 border-primary/20 h-fit p-6">
                <div className="flex items-start gap-3">
                  <Lock className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <h3 className="mb-2 font-semibold">
                      Privacy Questions? 🤔
                    </h3>
                    <p className="text-sm">
                      We&apos;re transparent about everything. Check our code,
                      ask questions, suggest improvements. Privacy is a
                      community effort. Built with 👻 and 🤖.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom CTA */}
      <section className="bg-muted/30 border-t py-12">
        <Container>
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <h2 className="text-2xl font-bold">Privacy by Design</h2>
            <p className="text-muted-foreground">
              Not just a policy, but a promise. Your code stays yours, always.
            </p>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Button asChild>
                <Link href="/create">Start Sharing Privately</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/terms">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Read Terms of Service
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
