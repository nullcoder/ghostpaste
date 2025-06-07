import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  AlertCircle,
  Shield,
  Key,
  Code2,
  Lock,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { GhostLogo } from "@/components/ghost-logo";

export const metadata: Metadata = {
  title: "Help & FAQ - GhostPaste",
  description:
    "Get help with GhostPaste. Learn how to share code securely with zero-knowledge encryption.",
};

export default function HelpPage() {
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
              Help & FAQ
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about sharing code securely with
              GhostPaste
            </p>
          </div>
        </Container>
      </section>

      {/* Quick Start Guide */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Zap className="text-primary h-6 w-6" />
              Quick Start Guide
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Code2 className="text-primary h-5 w-5" />
                  Creating a Paste
                </h3>
                <ol className="text-muted-foreground space-y-2 text-sm">
                  <li>
                    1. Go to{" "}
                    <Link
                      href="/create"
                      className="text-primary hover:underline"
                    >
                      Create
                    </Link>
                  </li>
                  <li>2. Paste your code or drag & drop files</li>
                  <li>
                    3. Set options (expiry, PIN for editing, one-time view)
                  </li>
                  <li>4. Click &quot;Create Secure Paste&quot;</li>
                  <li>5. Share the generated link</li>
                </ol>
              </Card>

              <Card className="p-6">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Key className="text-primary h-5 w-5" />
                  Viewing a Paste
                </h3>
                <ol className="text-muted-foreground space-y-2 text-sm">
                  <li>1. Click on a GhostPaste link</li>
                  <li>2. The paste decrypts automatically</li>
                  <li>3. View code with syntax highlighting</li>
                  <li>4. Copy code or download files</li>
                  <li>5. Edit if you have the PIN</li>
                </ol>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Common Questions */}
      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <HelpCircle className="text-primary h-6 w-6" />
              Frequently Asked Questions
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Left Column - General Questions */}
              <div className="space-y-6">
                <h3 className="mb-4 text-lg font-semibold">
                  General Questions
                </h3>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="how-secure">
                    <AccordionTrigger>
                      How secure is GhostPaste?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          GhostPaste uses military-grade AES-256-GCM encryption.
                          Your code is encrypted in your browser before being
                          sent to our servers.
                        </p>
                        <p>
                          The encryption key never leaves your device - it stays
                          in the URL fragment (after #) which browsers
                          don&apos;t send to servers.
                        </p>
                        <p>
                          We literally cannot decrypt your pastes, even if asked
                          by authorities.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-long">
                    <AccordionTrigger>
                      How long are pastes stored?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>You can set custom expiry times:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>1 hour (for sensitive data)</li>
                          <li>1 day</li>
                          <li>1 week</li>
                          <li>30 days (maximum)</li>
                          <li>One-time view (deleted after first view)</li>
                        </ul>
                        <p>
                          All pastes are automatically deleted after expiry.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="file-limits">
                    <AccordionTrigger>
                      What are the file size limits?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <ul className="list-inside list-disc space-y-1">
                          <li>500KB per file</li>
                          <li>5MB total per paste</li>
                          <li>Up to 20 files per paste</li>
                        </ul>
                        <p>
                          These limits ensure fast encryption/decryption in your
                          browser.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="lost-link">
                    <AccordionTrigger>What if I lose my link?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-orange-600 dark:text-orange-400">
                          Unfortunately, we cannot recover lost links.
                        </p>
                        <p>
                          Since we use zero-knowledge encryption, we have no way
                          to find or decrypt your paste without the original
                          link.
                        </p>
                        <p>
                          Always save important paste links immediately after
                          creation.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="edit-paste">
                    <AccordionTrigger>
                      Can I edit my paste after creation?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>Yes, if you set a PIN when creating the paste:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Click &quot;Edit&quot; on the paste page</li>
                          <li>Enter your PIN to unlock editing</li>
                          <li>Make your changes</li>
                          <li>Save the updated paste</li>
                        </ul>
                        <p>
                          The PIN also allows you to manually delete the paste.
                          Without a PIN, pastes are read-only.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Right Column - Technical Questions */}
              <div className="space-y-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Technical Questions
                </h3>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="browsers">
                    <AccordionTrigger>
                      Which browsers are supported?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          GhostPaste works on all modern browsers that support
                          WebCrypto API:
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Chrome/Edge (version 37+)</li>
                          <li>Firefox (version 34+)</li>
                          <li>Safari (version 11+)</li>
                          <li>Opera (version 24+)</li>
                        </ul>
                        <p>Internet Explorer is not supported.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="mobile">
                    <AccordionTrigger>Does it work on mobile?</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>Yes! GhostPaste is fully responsive and works on:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>iOS Safari (iPhone/iPad)</li>
                          <li>Chrome for Android</li>
                          <li>Samsung Internet</li>
                          <li>Firefox Mobile</li>
                        </ul>
                        <p>
                          All encryption features work identically on mobile
                          devices.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="languages">
                    <AccordionTrigger>
                      Which programming languages are supported?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          We support syntax highlighting for all major languages
                          including:
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>JavaScript/TypeScript, Python, Java, C/C++</li>
                          <li>Go, Rust, Ruby, PHP, Swift</li>
                          <li>HTML/CSS, SQL, JSON, YAML</li>
                          <li>And many more...</li>
                        </ul>
                        <p>Plain text works for any file type.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="open-source">
                    <AccordionTrigger>
                      Can I self-host GhostPaste?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>Absolutely! GhostPaste is open source:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>
                            Clone from{" "}
                            <Link
                              href="https://github.com/nullcoder/ghostpaste"
                              className="text-primary hover:underline"
                            >
                              GitHub
                            </Link>
                          </li>
                          <li>Deploy to Cloudflare Workers</li>
                          <li>Configure your own R2 bucket</li>
                          <li>Full deployment docs included</li>
                        </ul>
                        <p>Perfect for teams needing on-premise solutions.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Troubleshooting */}
      <section className="bg-muted/30 border-y py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              Troubleshooting
            </h2>

            <div className="grid gap-4">
              <Card className="p-6">
                <h3 className="mb-2 font-semibold text-red-600 dark:text-red-400">
                  &quot;Failed to decrypt&quot; error
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  This usually means the decryption key in the URL is incorrect
                  or incomplete.
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Try:</strong>
                  </p>
                  <ul className="ml-2 list-inside list-disc space-y-1">
                    <li>
                      Ensure you copied the complete URL including everything
                      after #
                    </li>
                    <li>Check if the paste has expired</li>
                    <li>
                      Verify the paste wasn&apos;t a one-time view that&apos;s
                      already been accessed
                    </li>
                  </ul>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2 font-semibold text-orange-600 dark:text-orange-400">
                  &quot;Paste not found&quot; error
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  The paste doesn&apos;t exist in our system.
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Possible reasons:</strong>
                  </p>
                  <ul className="ml-2 list-inside list-disc space-y-1">
                    <li>The paste has expired and been deleted</li>
                    <li>
                      It was a one-time view paste that&apos;s been viewed
                    </li>
                    <li>The URL is incorrect</li>
                    <li>The paste was manually deleted</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2 font-semibold text-yellow-600 dark:text-yellow-400">
                  Slow loading or timeout
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  Large pastes may take a moment to encrypt/decrypt.
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Tips:</strong>
                  </p>
                  <ul className="ml-2 list-inside list-disc space-y-1">
                    <li>Wait a few seconds for encryption to complete</li>
                    <li>Try refreshing the page</li>
                    <li>
                      For very large files, consider splitting into multiple
                      pastes
                    </li>
                    <li>Check your internet connection</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Security Tips */}
      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              Security Best Practices
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/10">
                <h3 className="mb-3 font-semibold text-green-700 dark:text-green-300">
                  DO ✓
                </h3>
                <ul className="space-y-2 text-sm text-green-600 dark:text-green-400">
                  <li>• Save paste links immediately</li>
                  <li>• Use short expiry times for sensitive data</li>
                  <li>• Set PINs if you need to edit later</li>
                  <li>• Share links through secure channels</li>
                  <li>• Use one-time view for passwords</li>
                  <li>• Verify recipients before sharing</li>
                </ul>
              </Card>

              <Card className="border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/10">
                <h3 className="mb-3 font-semibold text-red-700 dark:text-red-300">
                  DON&apos;T ✗
                </h3>
                <ul className="space-y-2 text-sm text-red-600 dark:text-red-400">
                  <li>• Post links publicly (social media, forums)</li>
                  <li>• Share production secrets/credentials</li>
                  <li>• Rely on GhostPaste as your only backup</li>
                  <li>• Share links over unencrypted channels</li>
                  <li>• Ignore expiry times</li>
                  <li>• Share the PIN in the same message as the link</li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Still Need Help? */}
      <section className="from-muted/30 to-background bg-gradient-to-b py-12">
        <Container>
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h2 className="text-2xl font-bold">Still Need Help?</h2>
            <p className="text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? We&apos;re here to
              help!
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="https://github.com/nullcoder/ghostpaste/issues">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Report an Issue
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/security">
                  <Lock className="mr-2 h-4 w-4" />
                  Security Details
                </Link>
              </Button>
              <Button asChild>
                <Link href="/create">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Create
                </Link>
              </Button>
            </div>

            <p className="text-muted-foreground pt-4 text-xs">
              GhostPaste is open source and community-driven. Contributions and
              feedback are always welcome!
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
