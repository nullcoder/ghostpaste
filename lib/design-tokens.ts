/**
 * Design tokens for GhostPaste
 * These match the CSS custom properties defined in globals.css
 */

export const spacing = {
  0: "var(--spacing-0)",
  1: "var(--spacing-1)",
  2: "var(--spacing-2)",
  3: "var(--spacing-3)",
  4: "var(--spacing-4)",
  5: "var(--spacing-5)",
  6: "var(--spacing-6)",
  8: "var(--spacing-8)",
  10: "var(--spacing-10)",
  12: "var(--spacing-12)",
  16: "var(--spacing-16)",
  20: "var(--spacing-20)",
  24: "var(--spacing-24)",
} as const;

export const fontSize = {
  xs: "var(--font-size-xs)",
  sm: "var(--font-size-sm)",
  base: "var(--font-size-base)",
  lg: "var(--font-size-lg)",
  xl: "var(--font-size-xl)",
  "2xl": "var(--font-size-2xl)",
  "3xl": "var(--font-size-3xl)",
  "4xl": "var(--font-size-4xl)",
  "5xl": "var(--font-size-5xl)",
  "6xl": "var(--font-size-6xl)",
} as const;

export const fontWeight = {
  normal: "var(--font-weight-normal)",
  medium: "var(--font-weight-medium)",
  semibold: "var(--font-weight-semibold)",
  bold: "var(--font-weight-bold)",
} as const;

export const lineHeight = {
  none: "var(--leading-none)",
  tight: "var(--leading-tight)",
  snug: "var(--leading-snug)",
  normal: "var(--leading-normal)",
  relaxed: "var(--leading-relaxed)",
  loose: "var(--leading-loose)",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const containers = {
  sm: "var(--container-sm)",
  md: "var(--container-md)",
  lg: "var(--container-lg)",
  xl: "var(--container-xl)",
  "2xl": "var(--container-2xl)",
} as const;

export const radius = {
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
} as const;

export const shadow = {
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
} as const;

export const duration = {
  fast: "var(--duration-fast)",
  normal: "var(--duration-normal)",
  slow: "var(--duration-slow)",
} as const;

export const zIndex = {
  10: "var(--z-index-10)",
  20: "var(--z-index-20)",
  30: "var(--z-index-30)",
  40: "var(--z-index-40)",
  50: "var(--z-index-50)",
} as const;

/**
 * Media query helper
 * @example
 * const styles = css`
 *   padding: ${spacing[4]};
 *
 *   ${media.md} {
 *     padding: ${spacing[6]};
 *   }
 * `;
 */
export const media = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]})`,
} as const;

/**
 * Type-safe design token getter
 * @example
 * const padding = getToken('spacing', 4); // Returns 'var(--spacing-4)'
 */
export function getToken<T extends keyof typeof tokens>(
  category: T,
  value: keyof (typeof tokens)[T]
): string {
  return tokens[category][value] as string;
}

const tokens = {
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  breakpoints,
  containers,
  radius,
  shadow,
  duration,
  zIndex,
} as const;

export type DesignTokens = typeof tokens;
export type SpacingScale = keyof typeof spacing;
export type FontSizeScale = keyof typeof fontSize;
export type BreakpointScale = keyof typeof breakpoints;
