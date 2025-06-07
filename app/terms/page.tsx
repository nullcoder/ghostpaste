import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GhostLogo } from "@/components/ghost-logo";
import { ArrowLeft, Shield, Lock, AlertCircle, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service - GhostPaste",
  description:
    "Terms of Service for GhostPaste - Zero-knowledge encrypted code sharing",
};

export default function TermsPage() {
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
              Terms of Service
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
                  Legal Introduction
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  These Terms of Service (&quot;Terms&quot;) govern your use of
                  GhostPaste (&quot;Service&quot;), operated by GhostPaste
                  (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By
                  accessing or using our Service, you agree to be bound by these
                  Terms. If you disagree with any part of these terms, you may
                  not access the Service.
                </p>
              </div>
              <Card className="bg-primary/5 border-primary/20 p-6">
                <div className="flex items-start gap-3">
                  <Heart className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <h3 className="mb-2 font-semibold">Welcome! 👋</h3>
                    <p className="text-sm">
                      By using GhostPaste, you&apos;re agreeing to these terms.
                      Don&apos;t worry - we&apos;ve kept them simple and fair.
                      The green boxes explain what each section really means.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Terms */}
      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-12">
            {/* Acceptable Use */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  1. Acceptable Use Policy
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>You may not use our Service to:</p>
                  <ul className="space-y-2 text-sm">
                    <li>Violate any applicable laws or regulations</li>
                    <li>
                      Transmit any material that is unlawful, offensive,
                      defamatory, or otherwise objectionable
                    </li>
                    <li>
                      Infringe upon any third party&apos;s intellectual property
                      rights
                    </li>
                    <li>Transmit any malware, viruses, or malicious code</li>
                    <li>
                      Attempt to gain unauthorized access to any portion of the
                      Service
                    </li>
                    <li>Harass, abuse, or harm another person or group</li>
                    <li>
                      Use the Service for any illegal or unauthorized purpose
                    </li>
                  </ul>
                </div>
              </div>
              <Card className="h-fit border-green-500/20 bg-green-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-green-700 dark:text-green-300">
                      Be Nice & Legal
                    </h3>
                    <p className="text-sm">
                      Use GhostPaste for good! Share code, not malware. Respect
                      others&apos; work. Keep it legal. We&apos;re a tool for
                      developers, not hackers.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Privacy & Data */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  2. Privacy and Data Protection
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>We implement zero-knowledge encryption, meaning:</p>
                  <ul className="space-y-2 text-sm">
                    <li>All encryption happens in your browser</li>
                    <li>We never have access to your encryption keys</li>
                    <li>We cannot decrypt or view your content</li>
                    <li>We store only encrypted data on our servers</li>
                    <li>
                      We do not track users or collect personal information
                    </li>
                    <li>We do not use cookies for tracking purposes</li>
                  </ul>
                  <p className="mt-4 text-sm">
                    For more details, see our{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <Card className="h-fit border-green-500/20 bg-green-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-green-700 dark:text-green-300">
                      Your Secrets Are Safe
                    </h3>
                    <p className="text-sm">
                      We literally can&apos;t see your code - it&apos;s
                      encrypted before it leaves your computer. We&apos;re like
                      a safety deposit box: we store your stuff, but only you
                      have the key. 🔐
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Content Ownership */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  3. Content Ownership
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>
                    You retain all rights to the content you upload to
                    GhostPaste. By using our Service:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      You represent that you own or have the right to share the
                      content
                    </li>
                    <li>
                      You grant us a limited license to store your encrypted
                      content
                    </li>
                    <li>
                      This license is solely for the purpose of operating the
                      Service
                    </li>
                    <li>You may delete your content at any time</li>
                    <li>
                      We claim no intellectual property rights over your content
                    </li>
                  </ul>
                </div>
              </div>
              <Card className="h-fit border-green-500/20 bg-green-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Heart className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-green-700 dark:text-green-300">
                      Your Code, Your Rights
                    </h3>
                    <p className="text-sm">
                      Your code is yours, period. We just hold onto the
                      encrypted version for you. You can delete it anytime. We
                      don&apos;t claim any ownership - we&apos;re just the
                      messenger!
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Service Availability */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  4. Service Availability
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>While we strive for 100% uptime:</p>
                  <ul className="space-y-2 text-sm">
                    <li>
                      The Service is provided &quot;as is&quot; and &quot;as
                      available&quot;
                    </li>
                    <li>
                      We do not guarantee uninterrupted or error-free service
                    </li>
                    <li>
                      We may perform maintenance that temporarily affects
                      availability
                    </li>
                    <li>
                      We reserve the right to modify or discontinue features
                    </li>
                    <li>
                      We are not responsible for any data loss due to your lost
                      encryption keys
                    </li>
                  </ul>
                </div>
              </div>
              <Card className="h-fit border-yellow-500/20 bg-yellow-500/5 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-yellow-700 dark:text-yellow-300">
                      We&apos;re Human (and AI) Too
                    </h3>
                    <p className="text-sm">
                      We&apos;ll do our best to keep things running smoothly,
                      but sometimes servers hiccup. Always keep backups of
                      important code. And remember - if you lose your key, we
                      can&apos;t help! 🗝️
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Limitations of Liability */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  5. Limitations of Liability
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, GHOSTPASTE SHALL NOT
                    BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                    CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
                    LIMITATION, LOSS OF PROFITS, DATA, USE, OR GOODWILL.
                  </p>
                  <p className="mt-4 text-sm">
                    Our total liability shall not exceed the amount you have
                    paid us in the past twelve months (which, for free users, is
                    zero).
                  </p>
                </div>
              </div>
              <Card className="h-fit border-yellow-500/20 bg-yellow-500/5 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-yellow-700 dark:text-yellow-300">
                      Use at Your Own Risk
                    </h3>
                    <p className="text-sm">
                      GhostPaste is a free service. We&apos;re not responsible
                      if something goes wrong. Don&apos;t store your only copy
                      of important code here. It&apos;s a sharing tool, not a
                      backup service!
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Termination */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">6. Termination</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p>
                    We may terminate or suspend access to our Service
                    immediately, without prior notice or liability, for any
                    reason whatsoever, including:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li>Breach of these Terms</li>
                    <li>Request by law enforcement or government agencies</li>
                    <li>Discontinuation of the Service</li>
                    <li>Technical or security issues</li>
                  </ul>
                </div>
              </div>
              <Card className="h-fit border-blue-500/20 bg-blue-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">
                      Play Nice or Goodbye
                    </h3>
                    <p className="text-sm">
                      If you abuse the service or break the rules, we can block
                      you. But honestly, if you&apos;re just sharing code
                      normally, you have nothing to worry about!
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Changes to Terms */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  7. Changes to Terms
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm">
                    We reserve the right to modify these Terms at any time. If
                    we make material changes, we will notify users by updating
                    the &quot;Last updated&quot; date. Your continued use of the
                    Service after changes constitutes acceptance of the new
                    Terms.
                  </p>
                </div>
              </div>
              <Card className="h-fit border-blue-500/20 bg-blue-500/5 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">
                      Terms Can Change
                    </h3>
                    <p className="text-sm">
                      We might update these terms occasionally. We&apos;ll
                      change the date at the top when we do. Keep using
                      GhostPaste = you&apos;re okay with the updates.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Governing Law */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">8. Governing Law</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm">
                    These Terms shall be governed by and construed in accordance
                    with the laws of the jurisdiction in which GhostPaste
                    operates, without regard to its conflict of law provisions.
                    Any disputes arising from these Terms shall be resolved
                    through binding arbitration.
                  </p>
                </div>
              </div>
              <Card className="h-fit border-gray-500/20 bg-gray-500/5 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h3 className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                      Legal Stuff
                    </h3>
                    <p className="text-sm">
                      If we ever disagree (hopefully not!), we&apos;ll handle it
                      through arbitration. It&apos;s faster and less formal than
                      court. Let&apos;s keep things friendly! 🤝
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact */}
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-semibold">
                  9. Contact Information
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm">
                    If you have any questions about these Terms, please contact
                    us at:
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li>
                      GitHub Issues:{" "}
                      <Link
                        href="https://github.com/nullcoder/ghostpaste/issues"
                        className="text-primary hover:underline"
                      >
                        Report an Issue
                      </Link>
                    </li>
                    <li>
                      Source Code:{" "}
                      <Link
                        href="https://github.com/nullcoder/ghostpaste"
                        className="text-primary hover:underline"
                      >
                        View on GitHub
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <Card className="bg-primary/5 border-primary/20 h-fit p-6">
                <div className="flex items-start gap-3">
                  <Heart className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                  <div>
                    <h3 className="mb-2 font-semibold">
                      Questions? We&apos;re Here!
                    </h3>
                    <p className="text-sm">
                      Got questions? Found a bug? Want to say hi? Open an issue
                      on GitHub - we&apos;re friendly and we actually respond!
                      Built with ❤️ and 🤖 by humans and Claude.
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
            <h2 className="text-2xl font-bold">Ready to Start?</h2>
            <p className="text-muted-foreground">
              By using GhostPaste, you agree to these terms. We think
              they&apos;re pretty fair - what do you think?
            </p>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Button asChild>
                <Link href="/create">I Agree - Let&apos;s Share Code!</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/about">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Learn More About Us
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
