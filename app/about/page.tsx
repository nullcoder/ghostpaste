import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import {
  Code2,
  Lock,
  Zap,
  Shield,
  Clock,
  Key,
  Heart,
  Sparkles,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";
import { GhostLogo } from "@/components/ghost-logo";

export const metadata: Metadata = {
  title: "About - GhostPaste",
  description:
    "Learn about GhostPaste's zero-knowledge encrypted code sharing and our unique human-AI collaboration.",
  openGraph: {
    title: "About GhostPaste - The Story Behind Secure Code Sharing",
    description:
      "Built with love, powered by privacy. Learn how GhostPaste combines human creativity and AI assistance to create the most secure code sharing platform.",
    url: "https://ghostpaste.dev/about",
  },
  twitter: {
    title: "About GhostPaste - The Story Behind Secure Code Sharing",
    description:
      "Human creativity meets AI assistance. Discover how we built the most private code sharing platform.",
  },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="from-background to-muted/20 relative overflow-hidden bg-gradient-to-b py-20">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <div className="mb-8 inline-flex items-center justify-center">
              <GhostLogo
                size="2xl"
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Your Code&apos;s Secret Keeper
            </h1>

            <p className="text-muted-foreground text-xl">
              GhostPaste isn&apos;t just another paste service. It&apos;s a
              promise that your code remains yours—invisible to everyone,
              including us.
            </p>

            <div className="flex flex-col justify-center gap-4 pt-6 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/create">Start Sharing Securely</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="https://github.com/nullcoder/ghostpaste">
                  <GithubIcon className="mr-2 h-4 w-4" />
                  View Source
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* How It Works */}
      <section className="border-b py-20">
        <Container>
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <Card className="p-6 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Code2 className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">1. Paste</h3>
              <p className="text-muted-foreground text-sm">
                Your code is encrypted directly in your browser before anything
                leaves your device
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Lock className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">2. Share</h3>
              <p className="text-muted-foreground text-sm">
                Only encrypted data reaches our servers. We store gibberish, you
                keep the key
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Key className="text-primary h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">3. Decrypt</h3>
              <p className="text-muted-foreground text-sm">
                Recipients decrypt locally with your shared key. Even we
                can&apos;t see your code
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Core Features */}
      <section className="border-b py-20">
        <Container>
          <h2 className="mb-12 text-center text-3xl font-bold">
            Core Features
          </h2>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex gap-4">
              <Shield className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 font-semibold">Client-Side Encryption</h3>
                <p className="text-muted-foreground text-sm">
                  Everything encrypted in your browser using AES-256-GCM
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Zap className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 font-semibold">No Account Required</h3>
                <p className="text-muted-foreground text-sm">
                  Share code instantly, anonymously, no sign-up needed
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 font-semibold">Self-Destructing Options</h3>
                <p className="text-muted-foreground text-sm">
                  One-time views & auto-expiry for sensitive shares
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Lock className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 font-semibold">Password Protection</h3>
                <p className="text-muted-foreground text-sm">
                  Optional password for edit/delete access control
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Code2 className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 font-semibold">Syntax Highlighting</h3>
                <p className="text-muted-foreground text-sm">
                  Beautiful highlighting for all major languages
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Sparkles className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="mb-1 font-semibold">Version History</h3>
                <p className="text-muted-foreground text-sm">
                  Track changes without compromising privacy
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Promise */}
      <section className="bg-muted/30 border-b py-20">
        <Container>
          <Card className="mx-auto max-w-3xl p-8 md:p-12">
            <h2 className="mb-8 text-center text-3xl font-bold">
              📜 The GhostPaste Promise
            </h2>

            <div className="space-y-4 text-lg">
              <div className="flex gap-3">
                <span className="text-green-500">✓</span>
                <span>We never see your unencrypted code</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-500">✓</span>
                <span>We don&apos;t track users or sell data</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-500">✓</span>
                <span>We can&apos;t recover lost decryption keys</span>
              </div>
              <div className="flex gap-3">
                <span className="text-green-500">✓</span>
                <span>
                  We can&apos;t comply with requests to decrypt your data
                  <br />
                  <span className="text-muted-foreground text-sm">
                    (because we literally can&apos;t)
                  </span>
                </span>
              </div>
            </div>

            <p className="text-muted-foreground mt-8 text-center">
              Your privacy isn&apos;t a feature—it&apos;s our foundation.
            </p>
          </Card>
        </Container>
      </section>

      {/* Built With Love (and AI) */}
      <section className="border-b py-20">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h2 className="flex items-center justify-center gap-3 text-3xl font-bold">
              Built With Love (and AI)
              <span className="text-2xl">🤖❤️</span>
            </h2>

            <div className="prose prose-lg dark:prose-invert mx-auto text-left">
              <p>
                GhostPaste is proudly built through human-AI collaboration. We
                pair program with Claude Code to ship features faster while
                maintaining the highest standards of privacy and security.
              </p>

              <p>
                <strong>The irony?</strong> Even Claude, our AI collaborator,
                can&apos;t decrypt your pastes. Zero-knowledge means
                zero-knowledge—no exceptions, not even for the AI that helped
                build it.
              </p>

              <p>
                Every commit in our repository tells a story of effective
                human-AI partnership. We believe the future of development
                isn&apos;t human vs. AI— it&apos;s human with AI, building
                better software together.
              </p>
            </div>

            <div className="pt-4">
              <code className="bg-muted rounded px-3 py-1 text-sm">
                Co-Authored-By: Claude &lt;claude@ghostpaste.dev&gt;
              </code>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button asChild variant="outline">
                <Link href="https://github.com/nullcoder/ghostpaste/commits/main">
                  View Our Commits
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="https://claude.ai/code">
                  Learn About Claude Code
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Technical Details */}
      <section className="border-b py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              For the Technically Curious
            </h2>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="tech-stack">
                <AccordionTrigger>Technical Stack</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Encryption:</strong> AES-256-GCM (military-grade)
                    </div>
                    <div>
                      <strong>Key Derivation:</strong> PBKDF2-SHA256
                    </div>
                    <div>
                      <strong>Frontend:</strong> Next.js 15, TypeScript,
                      Tailwind CSS
                    </div>
                    <div>
                      <strong>Infrastructure:</strong> Cloudflare Workers + R2
                      (edge-powered)
                    </div>
                    <div>
                      <strong>Development:</strong> Human-AI pair programming
                      with Claude
                    </div>
                    <div>
                      <strong>Code Quality:</strong> Every commit reviewed by
                      human eyes
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security">
                <AccordionTrigger>Security Model</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      GhostPaste uses client-side encryption exclusively. Your
                      plaintext never leaves your browser. The encryption key is
                      generated locally and shared via URL fragment (after the
                      #), which is never sent to servers.
                    </p>
                    <p>
                      We implement defense in depth: even if our servers were
                      compromised, your data would remain encrypted and
                      unreadable.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="limits">
                <AccordionTrigger>Limits & Constraints</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>File Size:</strong> 500KB per file
                    </div>
                    <div>
                      <strong>Total Size:</strong> 5MB per paste
                    </div>
                    <div>
                      <strong>Files per Paste:</strong> Up to 20 files
                    </div>
                    <div>
                      <strong>Retention:</strong> 30 days (or custom expiry)
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="lost-key">
                <AccordionTrigger>
                  What if I lose my decryption key?
                </AccordionTrigger>
                <AccordionContent>
                  Unfortunately, we cannot help recover lost keys. This is by
                  design—if we could decrypt your data, it wouldn&apos;t be
                  truly private. Always save your share links carefully.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="can-you-see">
                <AccordionTrigger>Can you see my code?</AccordionTrigger>
                <AccordionContent>
                  No. Your code is encrypted in your browser before it reaches
                  us. We only store encrypted data that looks like random
                  gibberish without your key.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ai-builder">
                <AccordionTrigger>Who built GhostPaste?</AccordionTrigger>
                <AccordionContent>
                  GhostPaste is a human-AI collaboration. We work with Claude
                  Code to build features faster and better. But don&apos;t
                  worry—Claude follows the same rules we do: zero access to your
                  decrypted data. Even our AI assistant sees only ghosts! 👻🤖
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="really-secure">
                <AccordionTrigger>Is this really secure?</AccordionTrigger>
                <AccordionContent>
                  Yes. We use industry-standard AES-256-GCM encryption, the same
                  used by governments and financial institutions. The key never
                  touches our servers, making it mathematically impossible for
                  us to decrypt your data.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="open-source">
                <AccordionTrigger>Is GhostPaste open source?</AccordionTrigger>
                <AccordionContent>
                  Yes! Our code is fully open source on GitHub. You can audit
                  our encryption implementation, run your own instance, or
                  contribute improvements. Transparency builds trust.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-20">
        <Container>
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h2 className="text-3xl font-bold">
              Ready to Share Code Privately?
            </h2>
            <p className="text-muted-foreground text-lg">
              Join developers who trust GhostPaste for secure code sharing. No
              account needed, just paste and go.
            </p>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/create">Create Your First Paste</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="https://github.com/nullcoder/ghostpaste">
                  <Heart className="mr-2 h-4 w-4" />
                  Star on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Console Easter Egg */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            console.log("🤖 Built with Claude Code - Even AI respects your privacy!");
            console.log("👻 Haunted by Claude since 2025");
            console.log("Check our commits: https://github.com/nullcoder/ghostpaste");
          `,
        }}
      />
    </>
  );
}
