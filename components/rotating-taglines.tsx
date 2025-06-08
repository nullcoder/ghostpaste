"use client";

import { useState, useEffect } from "react";

const taglines = [
  "Share API keys securely",
  "Code review snippets",
  "Configuration files",
  "Database migrations",
  "Debug information",
  "Interview challenges",
  "Error stack traces",
  "Shell scripts safely",
];

export function RotatingTaglines() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % taglines.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="inline-block min-w-[200px] text-left">
      <span
        key={currentIndex}
        className="animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
      >
        {taglines[currentIndex]}
      </span>
    </span>
  );
}
