"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur",
        scrolled && "shadow-sm"
      )}
    >
      <a
        href="#main"
        className="bg-muted sr-only absolute top-2 left-4 rounded px-2 py-1 text-sm focus:not-sr-only"
      >
        Skip to main content
      </a>
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center font-semibold">
          <span className="mr-1">👻</span>
          GhostPaste
        </Link>
        <NavigationMenu className="hidden sm:block">
          <NavigationMenuList className="flex gap-4">
            <NavigationMenuItem>
              <Link href="/create" legacyBehavior passHref>
                <NavigationMenuLink className="text-sm font-medium hover:underline">
                  Create
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/about" legacyBehavior passHref>
                <NavigationMenuLink className="text-sm font-medium hover:underline">
                  About
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="https://github.com/nullcoder/ghostpaste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline"
              >
                GitHub
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                aria-label="Toggle menu"
                variant="ghost"
                size="icon"
                className="sm:hidden"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              aria-label="Mobile navigation"
              className="sm:hidden"
            >
              <nav className="mt-4 grid gap-2 text-base">
                <Link
                  href="/create"
                  onClick={() => setMobileOpen(false)}
                  className="hover:underline"
                >
                  Create
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileOpen(false)}
                  className="hover:underline"
                >
                  About
                </Link>
                <a
                  href="https://github.com/nullcoder/ghostpaste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  onClick={() => setMobileOpen(false)}
                >
                  GitHub
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
