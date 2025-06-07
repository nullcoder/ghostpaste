import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto px-4 md:px-8 lg:px-12", {
  variants: {
    variant: {
      default: "max-w-screen-xl", // 1280px
      narrow: "max-w-3xl", // 768px
      wide: "max-w-screen-2xl", // 1536px
      full: "max-w-full", // 100%
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  /**
   * Whether to apply prose typography styles for text content
   */
  prose?: boolean;
  /**
   * The HTML element to render as the container
   * @default "div"
   */
  as?: React.ElementType;
}

/**
 * Container component for consistent page layout with responsive padding
 * and max-width constraints.
 *
 * @example
 * ```tsx
 * // Default container
 * <Container>
 *   <YourContent />
 * </Container>
 *
 * // Narrow container with prose styling
 * <Container variant="narrow" prose>
 *   <h1>Title</h1>
 *   <p>Text content with optimized typography...</p>
 * </Container>
 * ```
 */
export function Container({
  className,
  variant,
  prose = false,
  as: Component = "div",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(
        containerVariants({ variant }),
        prose &&
          "prose prose-slate dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-primary prose-code:text-primary",
        className
      )}
      {...props}
    />
  );
}
