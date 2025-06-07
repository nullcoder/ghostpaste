"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Keyboard } from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";
import { GhostLogo } from "@/components/ghost-logo";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import { useGlobalShortcuts } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Set up global shortcuts
  useGlobalShortcuts({
    onHelp: () => setShowShortcuts(true),
    onEscape: () => {
      // Close mobile menu if open
      if (isOpen) setIsOpen(false);
      // Close shortcuts dialog if open
      if (showShortcuts) setShowShortcuts(false);
    },
  });

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="focus:bg-background focus:text-foreground focus:ring-ring sr-only rounded-md focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:ring-2 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <div className="container mx-auto flex h-16 items-center justify-between px-6 md:px-8 lg:px-12">
        {/* Logo/Branding */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold transition-opacity hover:opacity-80"
        >
          <GhostLogo
            size="lg"
            className="text-indigo-600 dark:text-indigo-400"
          />
          <span>GhostPaste</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-4 md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/create" className={navigationMenuTriggerStyle()}>
                    Create
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/examples"
                    className={navigationMenuTriggerStyle()}
                  >
                    Examples
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/help" className={navigationMenuTriggerStyle()}>
                    Help
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <a
                  href="https://github.com/nullcoder/ghostpaste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "inline-flex items-center gap-2"
                  )}
                >
                  <GithubIcon className="h-4 w-4" aria-hidden="true" />
                  <span>GitHub</span>
                </a>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowShortcuts(true)}
                  aria-label="Show keyboard shortcuts"
                  title="Keyboard shortcuts"
                >
                  <Keyboard className="h-4 w-4" />
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[260px] p-0 sm:w-[320px]"
              aria-describedby="mobile-nav-description"
            >
              <SheetHeader className="p-6 pb-0">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <GhostLogo
                    size="sm"
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                  <span>GhostPaste</span>
                </SheetTitle>
              </SheetHeader>
              <p id="mobile-nav-description" className="sr-only">
                Navigation menu for mobile devices
              </p>
              <nav className="flex flex-col gap-1 p-6 pt-4">
                <SheetClose asChild>
                  <Link
                    href="/create"
                    className="hover:bg-accent hover:text-accent-foreground flex items-center justify-start gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors"
                  >
                    <span className="text-xl">✨</span>
                    Create
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/examples"
                    className="hover:bg-accent hover:text-accent-foreground flex items-center justify-start gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors"
                  >
                    <span className="text-xl">💡</span>
                    Examples
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/help"
                    className="hover:bg-accent hover:text-accent-foreground flex items-center justify-start gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors"
                  >
                    <span className="text-xl">❓</span>
                    Help
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-start gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors"
                    onClick={() => {
                      setShowShortcuts(true);
                      setIsOpen(false);
                    }}
                  >
                    <Keyboard className="h-5 w-5" aria-hidden="true" />
                    <span>Keyboard Shortcuts</span>
                  </Button>
                </SheetClose>
                <div className="bg-border my-2 h-px" />
                <a
                  href="https://github.com/nullcoder/ghostpaste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:bg-accent hover:text-accent-foreground flex items-center justify-start gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <GithubIcon className="h-5 w-5" aria-hidden="true" />
                  <span>GitHub</span>
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsHelp
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
    </header>
  );
}
