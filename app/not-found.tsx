import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Plus } from "lucide-react";
import { GhostLogo } from "@/components/ghost-logo";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      {/* Floating Ghost */}
      <div className="animate-float mb-8">
        <GhostLogo size="2xl" className="text-muted-foreground/50" />
      </div>

      {/* 404 Text with Glitch Effect */}
      <h1 className="animate-glitch mb-4 text-8xl font-bold tracking-tighter">
        404
      </h1>

      {/* Main Message */}
      <h2 className="mb-2 text-3xl font-semibold">
        This page has been ghosted!
      </h2>

      {/* Subtext */}
      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        The gist you&apos;re looking for has vanished into the digital ether.
        Maybe it expired, or perhaps it never existed at all...
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Gist
          </Link>
        </Button>
      </div>

      {/* Fun Easter Egg Text */}
      <p className="text-muted-foreground/60 mt-12 text-sm">
        👻 Just like that person who never texted back...
      </p>
    </div>
  );
}
