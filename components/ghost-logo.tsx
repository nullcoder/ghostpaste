import { cn } from "@/lib/utils";

interface GhostLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function GhostLogo({ className, size = "md" }: GhostLogoProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-16 w-16",
    "2xl": "h-32 w-32",
  };

  return (
    <svg
      className={cn(sizeClasses[size], className)}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Main ghost body */}
      <path
        d="M16 6c-4.4 0-8 3.6-8 8v9l1.5 2.5c0.3 0.5 1 0.3 1.3-0.2L12 23.8c0.2-0.3 0.6-0.3 0.8 0L14 25.3c0.2 0.3 0.6 0.3 0.8 0L16 23.8c0.2-0.3 0.6-0.3 0.8 0L18 25.3c0.2 0.3 0.6 0.3 0.8 0L20 23.8c0.2-0.3 0.6-0.2 1.2 0.2L22.5 25.5c0.3 0.5 1 0.3 1.3-0.2L24 23V14c0-4.4-3.6-8-8-8Z"
        fill="currentColor"
      />

      {/* Code bracket eyes */}
      <text
        x="12"
        y="18"
        fontFamily="monospace"
        fontSize="8"
        fill="white"
        textAnchor="middle"
      >
        &lt;
      </text>
      <text
        x="20"
        y="18"
        fontFamily="monospace"
        fontSize="8"
        fill="white"
        textAnchor="middle"
      >
        &gt;
      </text>

      {/* Binary dots for tech aesthetic */}
      <circle cx="14" cy="20" r="0.8" fill="white" opacity="0.8" />
      <circle cx="16" cy="20" r="0.8" fill="white" opacity="0.6" />
      <circle cx="18" cy="20" r="0.8" fill="white" opacity="0.8" />
    </svg>
  );
}
