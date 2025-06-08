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
  openGraph: {
    title: "Help & FAQ - GhostPaste",
    description:
      "Everything you need to know about sharing encrypted code with GhostPaste. Guides, FAQs, and security best practices.",
    url: "https://ghostpaste.dev/help",
  },
  twitter: {
    title: "Help & FAQ - GhostPaste",
    description:
      "Learn how to share encrypted code securely. Guides, FAQs, and best practices for GhostPaste.",
  },
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
                  Creating a Gist
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
                    3. Set options (expiry, password for editing, one-time view)
                  </li>
                  <li>4. Click &quot;Create Secure Gist&quot;</li>
                  <li>5. Share the generated link</li>
                </ol>
              </Card>

              <Card className="p-6">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Key className="text-primary h-5 w-5" />
                  Viewing a Gist
                </h3>
                <ol className="text-muted-foreground space-y-2 text-sm">
                  <li>1. Click on a GhostPaste link</li>
                  <li>2. The gist decrypts automatically</li>
                  <li>3. View code with syntax highlighting</li>
                  <li>4. Copy code or download files</li>
                  <li>5. Edit if you have the password</li>
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
                          We literally cannot decrypt your gists, even if asked
                          by authorities.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-long">
                    <AccordionTrigger>
                      How long are gists stored?
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
                        <p>All gists are automatically deleted after expiry.</p>
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
                          <li>5MB total per gist</li>
                          <li>Up to 20 files per gist</li>
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
                          to find or decrypt your gist without the original
                          link.
                        </p>
                        <p>
                          Always save important gist links immediately after
                          creation.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="edit-paste">
                    <AccordionTrigger>
                      Can I edit my gist after creation?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          Yes, if you set a password when creating the gist:
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Click &quot;Edit&quot; on the gist page</li>
                          <li>Enter your password to unlock editing</li>
                          <li>Make your changes</li>
                          <li>Save the updated gist</li>
                        </ul>
                        <p>
                          The password also allows you to manually delete the
                          gist. Without a password, gists are read-only.
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

                  <AccordionItem value="command-line">
                    <AccordionTrigger>
                      Is there a command-line tool?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          Currently, GhostPaste is web-interface only. However:
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>The codebase is open source</li>
                          <li>Community CLI tools may be available</li>
                          <li>You can build your own using our code</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Privacy & Legal Questions */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <Shield className="text-primary h-6 w-6" />
              Privacy & Legal Questions
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="tracking">
                    <AccordionTrigger>
                      Do you log IP addresses or track users?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          No tracking whatsoever.
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>No analytics or tracking scripts</li>
                          <li>No IP address logging</li>
                          <li>No cookies (except theme preference)</li>
                          <li>No user accounts or profiles</li>
                          <li>No view counting or statistics</li>
                        </ul>
                        <p>
                          We believe in absolute privacy. We don&apos;t know who
                          you are or what you share.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="dmca">
                    <AccordionTrigger>
                      Can you comply with DMCA takedowns?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold">
                          We cannot verify content claims.
                        </p>
                        <p>
                          Due to zero-knowledge encryption, we cannot decrypt
                          gists to verify their contents. We can only:
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Remove specific gist IDs if provided</li>
                          <li>Cannot confirm what the gist contains</li>
                          <li>Cannot search for infringing content</li>
                        </ul>
                        <p className="text-muted-foreground text-xs">
                          This is by design for your privacy protection.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="gdpr">
                    <AccordionTrigger>
                      Is this GDPR/CCPA compliant?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          Yes, fully compliant.
                        </p>
                        <p>We collect zero personal data:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>No personal information required</li>
                          <li>No data processing or profiling</li>
                          <li>No third-party sharing</li>
                          <li>No data retention beyond expiry</li>
                          <li>Automatic deletion after expiration</li>
                        </ul>
                        <p>
                          There&apos;s simply no personal data to request or
                          delete.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="law-enforcement">
                    <AccordionTrigger>
                      Can law enforcement access my gists?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          No, it&apos;s technically impossible.
                        </p>
                        <p>Even if compelled by law enforcement, we cannot:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Decrypt your gists (we don&apos;t have keys)</li>
                          <li>Identify who created a gist</li>
                          <li>Track who accessed a gist</li>
                          <li>Recover deleted or expired gists</li>
                        </ul>
                        <p>
                          We can only provide the encrypted blob, which is
                          useless without the key from your URL.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-location">
                    <AccordionTrigger>
                      Where is my data stored?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>
                          Your encrypted data is stored on Cloudflare&apos;s
                          global network:
                        </p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Distributed across multiple regions</li>
                          <li>Automatic geographic redundancy</li>
                          <li>Enterprise-grade infrastructure</li>
                          <li>DDoS protection included</li>
                        </ul>
                        <p>
                          For self-hosted instances, data location depends on
                          your deployment choice.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Use Cases & Scenarios */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <Code2 className="text-primary h-6 w-6" />
              Common Use Cases & Scenarios
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="multiple-people">
                    <AccordionTrigger>
                      How do I share with multiple people?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>Simply share the same link with everyone:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Each person gets the complete URL with key</li>
                          <li>No limit on number of viewers</li>
                          <li>Everyone sees the same content</li>
                          <li>Consider expiry time for all viewers</li>
                        </ul>
                        <p className="text-orange-600 dark:text-orange-400">
                          Note: Anyone with the link can view. For sensitive
                          data, use one-time view or short expiry.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="password-viewing">
                    <AccordionTrigger>
                      Can I password-protect viewing?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>No, passwords only protect editing/deletion:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Anyone with the link can view the content</li>
                          <li>Passwords prevent unauthorized edits</li>
                          <li>For view protection, use one-time view</li>
                          <li>Or share links through secure channels only</li>
                        </ul>
                        <p>
                          The encryption key in the URL is your main protection.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="link-intercepted">
                    <AccordionTrigger>
                      What if someone intercepts my link?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-orange-600 dark:text-orange-400">
                          They can decrypt and view the content.
                        </p>
                        <p>To minimize risk:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Share links through encrypted channels</li>
                          <li>Use one-time view for sensitive data</li>
                          <li>Set short expiration times</li>
                          <li>Never post links publicly</li>
                          <li>Consider self-hosting for extra control</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <div className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="business-use">
                    <AccordionTrigger>
                      Can I use this for my company?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>Yes! Options for business use:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Use ghostpaste.dev for non-critical data</li>
                          <li>Self-host for complete control</li>
                          <li>Deploy to your own infrastructure</li>
                          <li>Customize branding (open source)</li>
                          <li>No licensing fees or restrictions</li>
                        </ul>
                        <p>
                          Many companies self-host for compliance requirements.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="bulk-files">
                    <AccordionTrigger>
                      How do I share multiple files?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p>GhostPaste supports multi-file gists:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Drag & drop up to 20 files at once</li>
                          <li>Or use &quot;Add File&quot; button</li>
                          <li>Each file can be up to 500KB</li>
                          <li>5MB total size limit</li>
                          <li>All files encrypted together</li>
                        </ul>
                        <p>
                          Perfect for sharing related code files or configs.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tampering">
                    <AccordionTrigger>
                      How do I know content wasn&apos;t tampered with?
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          Built-in authentication protects integrity.
                        </p>
                        <p>AES-GCM encryption includes authentication:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1">
                          <li>Any tampering causes decryption to fail</li>
                          <li>Cryptographic verification built-in</li>
                          <li>Cannot modify without detection</li>
                          <li>Server cannot alter encrypted data</li>
                        </ul>
                        <p>If decryption succeeds, the content is authentic.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Comparison with Other Services */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <HelpCircle className="text-primary h-6 w-6" />
              How GhostPaste Compares
            </h2>

            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="vs-pastebin">
                  <AccordionTrigger>
                    How is this different from Pastebin?
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="mb-2 font-semibold text-green-600 dark:text-green-400">
                            GhostPaste Advantages:
                          </p>
                          <ul className="ml-2 list-inside list-disc space-y-1">
                            <li>End-to-end encryption</li>
                            <li>Zero-knowledge architecture</li>
                            <li>No ads or tracking</li>
                            <li>Clean, modern interface</li>
                            <li>Multi-file support</li>
                            <li>Open source</li>
                          </ul>
                        </div>
                        <div>
                          <p className="mb-2 font-semibold text-orange-600 dark:text-orange-400">
                            Pastebin Advantages:
                          </p>
                          <ul className="ml-2 list-inside list-disc space-y-1">
                            <li>Permanent storage available</li>
                            <li>User accounts & history</li>
                            <li>Public content discovery</li>
                            <li>Larger file sizes</li>
                            <li>API for automation</li>
                          </ul>
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        Choose GhostPaste when privacy matters.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="vs-github-gists">
                  <AccordionTrigger>Why not use GitHub Gists?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p>GhostPaste is better when you need:</p>
                      <ul className="ml-2 list-inside list-disc space-y-1">
                        <li>Complete anonymity (no account required)</li>
                        <li>Automatic expiration</li>
                        <li>Zero-knowledge encryption</li>
                        <li>One-time view options</li>
                        <li>No public profile or history</li>
                      </ul>
                      <p>GitHub Gists are better for:</p>
                      <ul className="ml-2 list-inside list-disc space-y-1">
                        <li>Long-term code storage</li>
                        <li>Version control & history</li>
                        <li>Public sharing & discovery</li>
                        <li>Integration with GitHub ecosystem</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="vs-privatebin">
                  <AccordionTrigger>What about PrivateBin?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 text-sm">
                      <p>
                        Both offer client-side encryption, but GhostPaste
                        provides:
                      </p>
                      <ul className="ml-2 list-inside list-disc space-y-1">
                        <li>Modern, responsive UI design</li>
                        <li>Better mobile experience</li>
                        <li>Multi-file support out of the box</li>
                        <li>Cleaner codebase (Next.js + TypeScript)</li>
                        <li>Cloudflare Workers deployment</li>
                        <li>Built-in syntax highlighting</li>
                      </ul>
                      <p>
                        PrivateBin has been around longer and may have more
                        deployment options.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
                    <li>Check if the gist has expired</li>
                    <li>
                      Verify the gist wasn&apos;t a one-time view that&apos;s
                      already been accessed
                    </li>
                  </ul>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2 font-semibold text-orange-600 dark:text-orange-400">
                  &quot;Gist not found&quot; error
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  The gist doesn&apos;t exist in our system.
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Possible reasons:</strong>
                  </p>
                  <ul className="ml-2 list-inside list-disc space-y-1">
                    <li>The gist has expired and been deleted</li>
                    <li>It was a one-time view gist that&apos;s been viewed</li>
                    <li>The URL is incorrect</li>
                    <li>The gist was manually deleted</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2 font-semibold text-yellow-600 dark:text-yellow-400">
                  Slow loading or timeout
                </h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  Large gists may take a moment to encrypt/decrypt.
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
                      gists
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
                  <li>• Save gist links immediately</li>
                  <li>• Use short expiry times for sensitive data</li>
                  <li>• Set passwords if you need to edit later</li>
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
                  <li>• Share the password in the same message as the link</li>
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
