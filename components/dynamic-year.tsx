"use client";

/**
 * Client component for dynamic year display that avoids hydration issues
 */
export function DynamicYear() {
  // No useState or useEffect needed - just get the current year directly
  const year = new Date().getFullYear();

  return <>{year}</>;
}
