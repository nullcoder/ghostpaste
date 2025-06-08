import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  FileCode,
  Server,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Code2,
  Github,
  ArrowRight,
  Clock,
} from "lucide-react";
import { GhostLogo } from "@/components/ghost-logo";

export const metadata: Metadata = {
  title: "Security - GhostPaste",
  description:
    "Deep dive into GhostPaste&apos;s zero-knowledge encryption and security architecture.",
};

export default function SecurityPage() {
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
              Security Architecture
            </h1>
            <p className="text-muted-foreground text-lg">
              A technical deep dive into how GhostPaste keeps your code private
            </p>
          </div>
        </Container>
      </section>

      {/* Zero-Knowledge Architecture */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <Shield className="text-primary h-6 w-6" />
              Zero-Knowledge Architecture
            </h2>

            <div className="prose prose-sm dark:prose-invert mb-8 max-w-none">
              <p className="text-base">
                GhostPaste implements true zero-knowledge encryption. This means
                we have zero ability to access your plaintext data, zero
                knowledge of your encryption keys, and zero way to comply with
                requests to decrypt your data.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                  What You Can See
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Your original code and files</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>The encryption/decryption key</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>When and how to share</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Complete control over your data</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <EyeOff className="h-5 w-5 text-red-600 dark:text-red-400" />
                  What We Can&apos;t See
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span>Your unencrypted code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span>Your encryption keys</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span>What your paste contains</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span>Who you share with</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Encryption Details */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <Lock className="text-primary h-6 w-6" />
              Encryption Implementation
            </h2>

            <div className="grid gap-6">
              {/* Encryption Flow */}
              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Encryption Flow</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Key Generation</p>
                      <p className="text-muted-foreground text-sm">
                        A cryptographically secure random 256-bit key is
                        generated using{" "}
                        <code className="bg-muted rounded px-1 py-0.5 text-xs">
                          crypto.getRandomValues()
                        </code>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Client-Side Encryption</p>
                      <p className="text-muted-foreground text-sm">
                        Your data is encrypted using AES-256-GCM with a unique
                        IV for each encryption
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Binary Format</p>
                      <p className="text-muted-foreground text-sm">
                        Encrypted data is packed into a custom binary format
                        with version info and file metadata. Enforces limits:
                        500KB/file, 5MB total, 20 files max
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Server Storage</p>
                      <p className="text-muted-foreground text-sm">
                        Only the encrypted blob is sent to and stored on our
                        servers
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      5
                    </div>
                    <div>
                      <p className="font-medium">Key in URL Fragment</p>
                      <p className="text-muted-foreground text-sm">
                        The encryption key is placed in the URL fragment (after
                        #) which never reaches any server
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Technical Specifications */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold">
                    <Code2 className="h-5 w-5" />
                    Cryptographic Details
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-medium">Encryption Algorithm</dt>
                      <dd className="text-muted-foreground">
                        AES-256-GCM (Galois/Counter Mode)
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Key Size</dt>
                      <dd className="text-muted-foreground">
                        256 bits (32 bytes)
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">IV Size</dt>
                      <dd className="text-muted-foreground">
                        96 bits (12 bytes) - unique per encryption
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Auth Tag Size</dt>
                      <dd className="text-muted-foreground">
                        128 bits (16 bytes)
                      </dd>
                    </div>
                  </dl>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold">
                    <Server className="h-5 w-5" />
                    Infrastructure Security
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-medium">Hosting</dt>
                      <dd className="text-muted-foreground">
                        Cloudflare Workers (Edge Computing)
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Storage</dt>
                      <dd className="text-muted-foreground">
                        Cloudflare R2 (S3-compatible)
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Transport</dt>
                      <dd className="text-muted-foreground">
                        TLS 1.3+ enforced
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">DDoS Protection</dt>
                      <dd className="text-muted-foreground">
                        Cloudflare automatic protection
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Data Residency</dt>
                      <dd className="text-muted-foreground">
                        Global edge locations
                      </dd>
                    </div>
                  </dl>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Password Protection */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <Key className="text-primary h-6 w-6" />
              Password Protection & Authentication
            </h2>

            <div className="prose prose-sm dark:prose-invert mb-8 max-w-none">
              <p className="text-base">
                GhostPaste offers optional password protection for your gists,
                allowing you to control who can edit or delete them. This
                feature uses industry-standard password hashing to ensure your
                password remains secure even if our servers are compromised.
              </p>
            </div>

            <div className="grid gap-6">
              {/* Password Security Flow */}
              <Card className="p-6">
                <h3 className="mb-4 font-semibold">
                  How Password Protection Works
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Password Creation</p>
                      <p className="text-muted-foreground text-sm">
                        When you set a password, it&apos;s sent securely to our
                        server where it&apos;s immediately hashed using{" "}
                        <code className="bg-muted rounded px-1 py-0.5 text-xs">
                          PBKDF2-SHA256
                        </code>{" "}
                        with 100,000 iterations and a random salt
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Secure Storage</p>
                      <p className="text-muted-foreground text-sm">
                        Only the hash and salt are stored in our database. Your
                        original password is discarded immediately after hashing
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Edit Verification</p>
                      <p className="text-muted-foreground text-sm">
                        When editing, your password is sent to the server where
                        it&apos;s re-hashed with the same salt and compared
                        against the stored hash
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Zero Knowledge</p>
                      <p className="text-muted-foreground text-sm">
                        We can verify your password without ever knowing what it
                        is, maintaining zero-knowledge principles
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Technical Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold">
                    <Lock className="h-5 w-5" />
                    Hashing Specifications
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-medium">Algorithm</dt>
                      <dd className="text-muted-foreground">
                        PBKDF2 with SHA-256
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Iterations</dt>
                      <dd className="text-muted-foreground">
                        100,000 (OWASP recommended minimum)
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Salt Size</dt>
                      <dd className="text-muted-foreground">
                        128 bits (16 bytes) of cryptographically secure random
                        data
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Hash Output</dt>
                      <dd className="text-muted-foreground">
                        256 bits (32 bytes)
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Password Requirements</dt>
                      <dd className="text-muted-foreground">
                        4-20 characters with at least one letter and one number
                      </dd>
                    </div>
                  </dl>
                </Card>

                <Card className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold">
                    <Shield className="h-5 w-5" />
                    Security Benefits
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>
                        <strong>Brute-force resistance:</strong> 100,000
                        iterations make cracking computationally expensive
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>
                        <strong>Rainbow table protection:</strong> Unique salts
                        prevent precomputed attacks
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>
                        <strong>Server compromise safety:</strong> Even if
                        hashes leak, passwords remain protected
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>
                        <strong>Zero-knowledge:</strong> We never see or store
                        your actual password
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>
                        <strong>Timing attack protection:</strong> Constant-time
                        comparison prevents timing-based attacks
                      </span>
                    </li>
                  </ul>
                </Card>
              </div>

              {/* Password Best Practices */}
              <Card className="border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/10">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
                  <AlertTriangle className="h-5 w-5" />
                  Password Best Practices
                </h3>
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>Use a unique password not used elsewhere</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>Consider longer passwords for sensitive data</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      <span>Include numbers, letters, and symbols</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <span>Avoid common patterns (1234, password)</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <span>
                        Don&apos;t reuse passwords from other services
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                      <span>
                        Remember: password protects edits, not viewing
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Data Retention */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <Clock className="text-primary h-6 w-6" />
              Data Retention & Cleanup
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Automatic Expiration</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>
                      All gists have mandatory expiration times (default: 7
                      days)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>
                      Encrypted data is permanently deleted after expiration
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>No data recovery possible after expiration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Metadata (size, timestamp) is also purged</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 font-semibold">View-Once Security</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Gist is immediately deleted after first view</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Perfect for sharing sensitive credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Prevents accidental re-access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Link becomes permanently invalid</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Security Guarantees */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <Key className="text-primary h-6 w-6" />
              Security Guarantees
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/10">
                <CheckCircle className="mb-3 h-8 w-8 text-green-600 dark:text-green-400" />
                <h3 className="mb-2 font-semibold">End-to-End Encryption</h3>
                <p className="text-muted-foreground text-sm">
                  Data is encrypted before leaving your browser and decrypted
                  only in the recipient&apos;s browser
                </p>
              </Card>

              <Card className="border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/10">
                <CheckCircle className="mb-3 h-8 w-8 text-green-600 dark:text-green-400" />
                <h3 className="mb-2 font-semibold">Forward Secrecy</h3>
                <p className="text-muted-foreground text-sm">
                  Each paste uses a unique encryption key that&apos;s never
                  reused
                </p>
              </Card>

              <Card className="border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/10">
                <CheckCircle className="mb-3 h-8 w-8 text-green-600 dark:text-green-400" />
                <h3 className="mb-2 font-semibold">Authenticated Encryption</h3>
                <p className="text-muted-foreground text-sm">
                  GCM mode ensures data integrity and authenticity
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Browser Security & Metadata */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <Shield className="text-primary h-6 w-6" />
              Browser Security & Privacy
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                  What&apos;s Encrypted
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>All file contents and code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>File names and descriptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Programming language information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Number of files in gist</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <EyeOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Visible Metadata
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <span>Gist ID and creation timestamp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <span>Expiration time and view-once status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <span>Encrypted blob size (but not content size)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <span>Whether password protection is enabled</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="mt-6 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/10">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
                <Code2 className="h-5 w-5" />
                Browser Requirements
              </h3>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Modern browser with Web Crypto API support</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>JavaScript enabled for encryption/decryption</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>HTTPS required (enforced automatically)</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Chrome 37+, Firefox 34+, Safari 11+</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>Mobile browsers with crypto support</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span>Internet Explorer not supported</span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* Threat Model */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <AlertTriangle className="text-primary h-6 w-6" />
              Threat Model
            </h2>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 font-semibold text-green-700 dark:text-green-300">
                  What We Protect Against
                </h3>
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>
                        Server compromise - encrypted data remains secure
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>
                        Network eavesdropping - TLS + client encryption
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>Legal requests - we cannot decrypt your data</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>Data breaches - only encrypted blobs exposed</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>Replay attacks - unique IVs and auth tags</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                      <span>
                        Tampering - GCM authentication detects changes
                      </span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 font-semibold text-orange-700 dark:text-orange-300">
                  Limitations
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <span>
                      <strong>Compromised device:</strong> If your device is
                      compromised, attackers can access decrypted data
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <span>
                      <strong>Phishing:</strong> Always verify you&apos;re on
                      ghostpaste.dev before entering PINs
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <span>
                      <strong>Link sharing:</strong> Anyone with the complete
                      link can decrypt - share carefully
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                    <span>
                      <strong>Browser security:</strong> We rely on
                      browser&apos;s WebCrypto implementation
                    </span>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Verification */}
      <section className="border-b py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-bold">
              <FileCode className="text-primary h-6 w-6" />
              Trust, but Verify
            </h2>

            <div className="prose prose-sm dark:prose-invert mb-8 max-w-none">
              <p className="text-base">
                Don&apos;t just take our word for it. GhostPaste is fully open
                source, allowing you to:
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Audit the Code</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Review our encryption implementation</li>
                  <li>• Verify no backdoors or data collection</li>
                  <li>• Check for security vulnerabilities</li>
                  <li>• Ensure keys stay client-side</li>
                </ul>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="https://github.com/nullcoder/ghostpaste">
                    <Github className="mr-2 h-4 w-4" />
                    View Source Code
                  </Link>
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Run Your Own Instance</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li>• Deploy to your own infrastructure</li>
                  <li>• Control your data completely</li>
                  <li>• Customize for your needs</li>
                  <li>• Perfect for sensitive environments</li>
                </ul>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="https://github.com/nullcoder/ghostpaste#deployment">
                    <Server className="mr-2 h-4 w-4" />
                    Deployment Guide
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* Security Disclosure */}
      <section className="py-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Card className="border-orange-200 bg-orange-50 p-8 dark:border-orange-800 dark:bg-orange-900/10">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                Security Disclosure
              </h2>
              <div className="space-y-4 text-sm">
                <p>
                  Found a security vulnerability? We appreciate responsible
                  disclosure.
                </p>
                <p>
                  Please review our security policy for responsible disclosure
                  guidelines:
                </p>
                <Button asChild variant="outline" className="bg-background">
                  <Link href="https://github.com/nullcoder/ghostpaste/security/policy">
                    View Security Policy
                  </Link>
                </Button>
                <p className="text-muted-foreground text-xs">
                  We&apos;ll acknowledge your report within 48 hours and work
                  with you to understand and resolve the issue quickly.
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-12">
        <Container>
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h2 className="text-2xl font-bold">
              Security Through Transparency
            </h2>
            <p className="text-muted-foreground">
              Our code is open, our encryption is proven, and your data remains
              yours.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild>
                <Link href="/create">
                  Try It Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/help">Learn More</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
