"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background/95 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-semibold">
          GhostPaste
        </Link>
        <nav aria-label="Main navigation" className="hidden gap-4 sm:flex">
          <Link href="/create" className="text-sm font-medium hover:underline">
            Create
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline">
            About
          </Link>
          <a
            href="https://github.com/nullcoder/ghostpaste"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
          >
            GitHub
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            aria-label="Toggle menu"
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>
      {open && (
        <nav
          aria-label="Mobile navigation"
          className="bg-background border-t px-4 pt-2 pb-4 sm:hidden"
        >
          <Link
            href="/create"
            className="block py-2 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            Create
          </Link>
          <Link
            href="/about"
            className="block py-2 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            About
          </Link>
          <a
            href="https://github.com/nullcoder/ghostpaste"
            target="_blank"
            rel="noopener noreferrer"
            className="block py-2 text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            GitHub
          </a>
        </nav>
      )}
    </header>
  );
}
