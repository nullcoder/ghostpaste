import { ThemeToggle } from "@/components/theme-toggle";
import { R2Test } from "@/components/r2-test";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">GhostPaste</h1>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-4xl">
        <div className="bg-card text-card-foreground rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold">
            Zero-Knowledge Encrypted Code Sharing
          </h2>
          <p className="text-muted-foreground mb-4">
            Share code snippets securely with client-side encryption. Your code,
            your privacy.
          </p>
          <div className="space-y-2">
            <p>
              Current theme:{" "}
              <code className="bg-muted rounded px-2 py-1 text-sm">
                system/light/dark
              </code>
            </p>
            <p>
              Click the theme toggle button in the header to switch between
              light and dark modes.
            </p>
          </div>
        </div>

        <div className="bg-card text-card-foreground mt-8 rounded-lg border p-6 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">R2 Bucket Test</h3>
          <R2Test />
        </div>
      </main>
    </div>
  );
}
