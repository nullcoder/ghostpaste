import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Globe,
  Shield,
  Code2,
  Database,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Server,
  Lock,
  Users,
  FileCode,
  Cpu,
  HardDrive,
  Network,
} from "lucide-react";
import { GhostLogo } from "@/components/ghost-logo";

export const metadata: Metadata = {
  title: "Architecture - GhostPaste",
  description:
    "Deep dive into GhostPaste's edge-first, zero-knowledge architecture built for performance and privacy.",
};

export default function ArchitecturePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="from-background to-muted/20 relative overflow-hidden bg-gradient-to-b py-12">
        <Container>
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <div className="mb-4 inline-flex items-center justify-center">
              <GhostLogo
                size="lg"
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              How GhostPaste Works Under the Hood
            </h1>
            <p className="text-muted-foreground text-lg">
              A technical deep dive into our edge-first, zero-knowledge
              architecture built for developers who want to understand how
              things actually work.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">Edge Computing</Badge>
              <Badge variant="secondary">Zero-Knowledge</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Web Crypto API</Badge>
            </div>
          </div>
        </Container>
      </section>

      {/* The Big Picture */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              The Big Picture
            </h2>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Client Side */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Your Browser</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Encrypts files with AES-256-GCM</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileCode className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <span>Packs data into custom binary format</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                    <span>Keeps encryption keys in URL fragments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Code2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                    <span>Handles all crypto operations locally</span>
                  </li>
                </ul>
              </Card>

              {/* Edge Network */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Edge Network</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
                    <span>Cloudflare Workers in 275+ locations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Cpu className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                    <span>50ms CPU budget per request</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Server className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-600" />
                    <span>Stateless request handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Network className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                    <span>Low-latency responses from nearest edge</span>
                  </li>
                </ul>
              </Card>

              {/* Storage Layer */}
              <Card className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold">Storage</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Database className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                    <span>Cloudflare R2 for encrypted blobs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                    <span>Automatic expiration handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span>Only encrypted data stored</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Globe className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
                    <span>Global distribution with smart placement</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Edge-First? */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Why Edge-First Architecture?
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  The Traditional Problem
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <strong>Geographic Latency:</strong> Single server location
                    means slow responses for global users
                  </li>
                  <li>
                    <strong>Trust Requirements:</strong> Users must trust the
                    server operator with their unencrypted data
                  </li>
                  <li>
                    <strong>Infrastructure Complexity:</strong> Managing
                    databases, backups, scaling, monitoring
                  </li>
                  <li>
                    <strong>Single Point of Failure:</strong> Server downtime =
                    service unavailable
                  </li>
                  <li>
                    <strong>Legal Vulnerabilities:</strong> Centralized data
                    storage subject to jurisdictional requests
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Our Edge Solution
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <strong>Global Performance:</strong> Edge functions run
                    within milliseconds of every user worldwide
                  </li>
                  <li>
                    <strong>Zero-Knowledge by Design:</strong> Encryption
                    happens client-side, we never see plaintext
                  </li>
                  <li>
                    <strong>Serverless Simplicity:</strong> No databases to
                    manage, automatic scaling, built-in redundancy
                  </li>
                  <li>
                    <strong>Inherent Reliability:</strong> Distributed across
                    275+ data centers with automatic failover
                  </li>
                  <li>
                    <strong>Regulatory Resilience:</strong> Can&apos;t decrypt
                    data we don&apos;t have keys for
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Key Architectural Decisions */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Key Architectural Decisions
            </h2>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Code2 className="h-5 w-5 text-blue-600" />
                  Client-Side Encryption with Web Crypto API
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-green-600 dark:text-green-400">
                      Why This Works
                    </h4>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>• Hardware-accelerated AES on modern devices</li>
                      <li>
                        • Cryptographically secure random number generation
                      </li>
                      <li>
                        • Native browser support (no external dependencies)
                      </li>
                      <li>• Keys never leave the client browser</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 dark:text-orange-400">
                      Trade-offs
                    </h4>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>• Requires modern browser (no IE support)</li>
                      <li>• JavaScript must be enabled</li>
                      <li>• HTTPS required for crypto API access</li>
                      <li>• Client-side performance varies by device</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <FileCode className="h-5 w-5 text-purple-600" />
                  Custom Binary Format
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-green-600 dark:text-green-400">
                      Why Not JSON?
                    </h4>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>• 40-60% smaller payload size</li>
                      <li>• Streaming-friendly structure</li>
                      <li>• Built-in versioning support</li>
                      <li>• No parsing overhead on server</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 dark:text-orange-400">
                      Complexity Cost
                    </h4>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>• Custom serialization/deserialization logic</li>
                      <li>• More complex debugging</li>
                      <li>• Need tools for format inspection</li>
                      <li>• Migration complexity for format changes</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Globe className="h-5 w-5 text-green-600" />
                  Stateless Edge Functions
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium text-green-600 dark:text-green-400">
                      Advantages
                    </h4>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>• Infinite horizontal scalability</li>
                      <li>• No database maintenance overhead</li>
                      <li>• Cold start times under 1ms</li>
                      <li>• Automatic global distribution</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 dark:text-orange-400">
                      Constraints
                    </h4>
                    <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                      <li>• 50ms CPU time budget per request</li>
                      <li>• Limited to edge-compatible APIs</li>
                      <li>• No persistent connections</li>
                      <li>• All operations must be atomic</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Edge Runtime Constraints */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Working Within Edge Runtime Constraints
            </h2>

            <Card className="border-blue-200 bg-blue-50 p-8 dark:border-blue-800 dark:bg-blue-900/10">
              <div className="mb-6 text-center">
                <Cpu className="mx-auto mb-3 h-12 w-12 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold">
                  Edge functions have strict resource limits
                </h3>
                <p className="text-muted-foreground mt-2">
                  Limited CPU time, memory, and APIs mean we had to rethink how
                  traditional file sharing works.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 font-semibold">Design Constraints</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                      <span>
                        <strong>CPU limits:</strong> No long-running operations
                        or complex computations
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                      <span>
                        <strong>Memory constraints:</strong> Can&apos;t buffer
                        large files in memory
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                      <span>
                        <strong>API limitations:</strong> Subset of Node.js APIs
                        available
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                      <span>
                        <strong>Cold starts:</strong> Functions must start
                        quickly from scratch
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold">Our Solutions</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>
                        <strong>Streaming processing:</strong> Handle data as it
                        flows through, no buffering
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>
                        <strong>Async operations:</strong> Non-blocking I/O for
                        all external calls
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>
                        <strong>Efficient formats:</strong> Binary data
                        structures for minimal parsing
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span>
                        <strong>Edge-native APIs:</strong> Web Crypto instead of
                        Node.js crypto libraries
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Zero-Knowledge Properties */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              What Makes It Zero-Knowledge?
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Shield className="h-5 w-5 text-green-600" />
                  Technical Implementation
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <strong>URL Fragment Keys:</strong> Encryption keys are
                    stored in URL fragments (after #) which never reach any
                    server
                  </li>
                  <li>
                    <strong>Client-Side Crypto:</strong> All
                    encryption/decryption happens in your browser using Web
                    Crypto API
                  </li>
                  <li>
                    <strong>Encrypted-Only Storage:</strong> We only store the
                    encrypted blob, never plaintext or keys
                  </li>
                  <li>
                    <strong>Metadata Encryption:</strong> Even file names and
                    descriptions are encrypted with the same key
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Users className="h-5 w-5 text-blue-600" />
                  Real-World Implications
                </h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <strong>Legal Protection:</strong> We cannot comply with
                    requests to decrypt data we don&apos;t have keys for
                  </li>
                  <li>
                    <strong>Server Breach Safety:</strong> Even if our systems
                    are compromised, your data remains encrypted
                  </li>
                  <li>
                    <strong>No Trust Required:</strong> You don&apos;t need to
                    trust us with your sensitive data
                  </li>
                  <li>
                    <strong>Audit-Friendly:</strong> Open source code means you
                    can verify our claims
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* What's Next */}
      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h2 className="text-2xl font-bold">Want to Dive Deeper?</h2>
            <p className="text-muted-foreground">
              This is just the architectural overview. We&apos;re planning deep
              dives into cryptography implementation, binary format
              specification, performance optimization, and more.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild>
                <Link href="/security">
                  Security Deep Dive
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="https://github.com/nullcoder/ghostpaste">
                  View Source Code
                </Link>
              </Button>
            </div>
            <div className="text-muted-foreground text-sm">
              <p>
                Questions about our architecture? Found something interesting?
                <br />
                We&apos;d love to hear from developers who are curious about how
                things work.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
