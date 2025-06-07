"use client";

import { useState, useEffect } from "react";

export default function HeaderDemo() {
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    // Set initial width
    setViewportWidth(window.innerWidth);

    // Update viewport width on resize
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-4 text-2xl font-bold">Header Component Demo</h1>

      <div className="bg-muted mb-8 rounded-lg p-4">
        <p className="text-muted-foreground mb-2 text-sm">
          Current viewport width:{" "}
          <span className="font-mono">{viewportWidth}px</span>
        </p>
        <p className="text-muted-foreground text-sm">
          Mobile menu appears at: <span className="font-mono">&lt;768px</span>
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-xl font-semibold">Features to Test</h2>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>Resize browser window to see mobile menu (hamburger) appear</li>
            <li>Click hamburger menu to open mobile navigation drawer</li>
            <li>Test theme toggle in both desktop and mobile views</li>
            <li>Check sticky header behavior by scrolling</li>
            <li>Verify all navigation links work correctly</li>
            <li>Test keyboard navigation (Tab, Enter, Escape)</li>
            <li>
              Try &quot;Skip to main content&quot; link (visible on focus)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Accessibility Features</h2>
          <ul className="list-inside list-disc space-y-2 text-sm">
            <li>Press Tab to navigate through interactive elements</li>
            <li>
              First Tab press reveals &quot;Skip to main content&quot; link
            </li>
            <li>All buttons have proper ARIA labels</li>
            <li>Mobile menu can be closed with Escape key</li>
            <li>Theme toggle has screen reader text</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Long Content for Scroll Testing
          </h2>
          <div className="space-y-4">
            {[...Array(20)].map((_, i) => (
              <p key={i} className="bg-muted rounded p-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Paragraph {i + 1} of 20
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
