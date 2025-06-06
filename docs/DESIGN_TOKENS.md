# Design Tokens

GhostPaste uses a comprehensive design token system to ensure consistent styling across all components. These tokens are defined in `app/globals.css` and can be used throughout the application.

## Spacing Scale

Our spacing scale follows a consistent pattern based on rem units (1rem = 16px):

| Token          | Value   | Pixels | Usage                                  |
| -------------- | ------- | ------ | -------------------------------------- |
| `--spacing-0`  | 0       | 0px    | No spacing                             |
| `--spacing-1`  | 0.25rem | 4px    | Tight spacing between related elements |
| `--spacing-2`  | 0.5rem  | 8px    | Small padding/margin                   |
| `--spacing-3`  | 0.75rem | 12px   | Medium-small spacing                   |
| `--spacing-4`  | 1rem    | 16px   | Default spacing unit                   |
| `--spacing-5`  | 1.25rem | 20px   | Medium spacing                         |
| `--spacing-6`  | 1.5rem  | 24px   | Large spacing                          |
| `--spacing-8`  | 2rem    | 32px   | Extra large spacing                    |
| `--spacing-10` | 2.5rem  | 40px   | Section spacing                        |
| `--spacing-12` | 3rem    | 48px   | Large section spacing                  |
| `--spacing-16` | 4rem    | 64px   | Major section breaks                   |
| `--spacing-20` | 5rem    | 80px   | Page-level spacing                     |
| `--spacing-24` | 6rem    | 96px   | Maximum spacing                        |

### Usage Examples

```css
/* Component padding */
.component {
  padding: var(--spacing-4);
}

/* Card with different spacing */
.card {
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

/* Tight list items */
.list-item {
  padding: var(--spacing-2) var(--spacing-3);
}
```

## Typography Scale

Our typography system provides a comprehensive set of font sizes:

| Token              | Value    | Pixels | Usage                  |
| ------------------ | -------- | ------ | ---------------------- |
| `--font-size-xs`   | 0.75rem  | 12px   | Small labels, captions |
| `--font-size-sm`   | 0.875rem | 14px   | Secondary text, hints  |
| `--font-size-base` | 1rem     | 16px   | Body text default      |
| `--font-size-lg`   | 1.125rem | 18px   | Emphasized body text   |
| `--font-size-xl`   | 1.25rem  | 20px   | Small headings         |
| `--font-size-2xl`  | 1.5rem   | 24px   | Section headings       |
| `--font-size-3xl`  | 1.875rem | 30px   | Page headings          |
| `--font-size-4xl`  | 2.25rem  | 36px   | Large headings         |
| `--font-size-5xl`  | 3rem     | 48px   | Hero text              |
| `--font-size-6xl`  | 3.75rem  | 60px   | Display text           |

### Line Heights

| Token               | Value | Usage                |
| ------------------- | ----- | -------------------- |
| `--leading-none`    | 1     | Single line elements |
| `--leading-tight`   | 1.25  | Headings             |
| `--leading-snug`    | 1.375 | Subheadings          |
| `--leading-normal`  | 1.5   | Body text (default)  |
| `--leading-relaxed` | 1.625 | Readable paragraphs  |
| `--leading-loose`   | 2     | Spacious text        |

### Font Weights

| Token                    | Value | Usage             |
| ------------------------ | ----- | ----------------- |
| `--font-weight-normal`   | 400   | Body text         |
| `--font-weight-medium`   | 500   | Emphasized text   |
| `--font-weight-semibold` | 600   | Subheadings       |
| `--font-weight-bold`     | 700   | Headings, buttons |

### Typography Usage

```css
/* Heading styles */
h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
}

/* Body text */
p {
  font-size: var(--font-size-base);
  line-height: var(--leading-normal);
}

/* Small text */
.caption {
  font-size: var(--font-size-sm);
  color: var(--color-muted-foreground);
}
```

## Responsive Breakpoints

Our breakpoint system follows standard responsive design patterns:

| Token              | Value  | Usage                    |
| ------------------ | ------ | ------------------------ |
| `--breakpoint-sm`  | 640px  | Mobile landscape         |
| `--breakpoint-md`  | 768px  | Tablet portrait          |
| `--breakpoint-lg`  | 1024px | Tablet landscape/desktop |
| `--breakpoint-xl`  | 1280px | Large desktop            |
| `--breakpoint-2xl` | 1536px | Extra large screens      |

### Container Max Widths

Matching container widths for consistent layouts:

| Token             | Value  | Usage                    |
| ----------------- | ------ | ------------------------ |
| `--container-sm`  | 640px  | Small container          |
| `--container-md`  | 768px  | Medium container         |
| `--container-lg`  | 1024px | Standard container       |
| `--container-xl`  | 1280px | Wide container (default) |
| `--container-2xl` | 1536px | Full width container     |

### Responsive Usage

```css
/* Mobile-first responsive design */
.container {
  width: 100%;
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--spacing-4);
}

@media (min-width: 768px) {
  .container {
    padding: 0 var(--spacing-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 var(--spacing-8);
  }
}
```

## Additional Design Tokens

### Border Radius

| Token         | Value                | Usage           |
| ------------- | -------------------- | --------------- |
| `--radius-sm` | calc(--radius - 4px) | Small elements  |
| `--radius-md` | calc(--radius - 2px) | Medium elements |
| `--radius-lg` | --radius             | Default radius  |
| `--radius-xl` | calc(--radius + 4px) | Large elements  |

### Shadows

| Token         | Usage            |
| ------------- | ---------------- |
| `--shadow-sm` | Subtle elevation |
| `--shadow-md` | Cards, dropdowns |
| `--shadow-lg` | Modals, popovers |
| `--shadow-xl` | High elevation   |

### Animation Durations

| Token               | Value | Usage                 |
| ------------------- | ----- | --------------------- |
| `--duration-fast`   | 150ms | Quick transitions     |
| `--duration-normal` | 300ms | Standard animations   |
| `--duration-slow`   | 500ms | Deliberate animations |

### Z-Index Scale

| Token          | Value | Usage            |
| -------------- | ----- | ---------------- |
| `--z-index-10` | 10    | Dropdowns        |
| `--z-index-20` | 20    | Sticky elements  |
| `--z-index-30` | 30    | Fixed headers    |
| `--z-index-40` | 40    | Modals           |
| `--z-index-50` | 50    | Tooltips, toasts |

## Using Design Tokens in Components

### With Tailwind CSS v4

Since we're using Tailwind CSS v4 with CSS variables, you can use these tokens directly in your styles:

```css
/* In your component CSS */
.custom-card {
  padding: var(--spacing-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

/* Or with Tailwind utilities */
.button {
  @apply px-[var(--spacing-4)] py-[var(--spacing-2)];
}
```

### In React Components

```tsx
// Using inline styles
<div style={{ padding: "var(--spacing-4)" }}>Content</div>;

// Using CSS modules or styled components
const Card = styled.div`
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
`;
```

### With shadcn/ui Components

shadcn/ui components already use many of these tokens. When customizing:

```tsx
// Customizing a Button with consistent spacing
<Button className="px-[var(--spacing-6)] py-[var(--spacing-3)]">
  Custom Spacing
</Button>

// Using consistent typography
<Card>
  <CardHeader>
    <CardTitle className="text-[length:var(--font-size-2xl)]">
      Title
    </CardTitle>
  </CardHeader>
</Card>
```

## Best Practices

1. **Always use tokens** instead of hard-coded values
2. **Mobile-first** - Start with mobile styles and add breakpoints
3. **Consistent spacing** - Use the spacing scale for all padding/margins
4. **Semantic usage** - Choose tokens based on their purpose, not just their value
5. **Accessibility** - Ensure sufficient contrast and readable font sizes

## Component Examples

### Container Component

```tsx
// components/ui/container.tsx
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Container({
  children,
  className,
  size = "xl",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-[var(--spacing-4)]",
        "md:px-[var(--spacing-6)] lg:px-[var(--spacing-8)]",
        className
      )}
      style={{
        maxWidth: `var(--container-${size})`,
      }}
    >
      {children}
    </div>
  );
}
```

### Spacing Utility Classes

```css
/* Utility classes using design tokens */
.space-y-sm > * + * {
  margin-top: var(--spacing-2);
}

.space-y-md > * + * {
  margin-top: var(--spacing-4);
}

.space-y-lg > * + * {
  margin-top: var(--spacing-8);
}
```

## Migration Guide

When updating existing components to use design tokens:

1. Replace hard-coded pixel values with token variables
2. Update media queries to use breakpoint tokens
3. Replace arbitrary spacing with scale values
4. Ensure consistent use across similar components

```css
/* Before */
.card {
  padding: 24px;
  margin-bottom: 32px;
}

/* After */
.card {
  padding: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}
```

## Token Reference Sheet

For quick reference during development:

- **Small spacing**: 4px (--spacing-1), 8px (--spacing-2)
- **Medium spacing**: 16px (--spacing-4), 24px (--spacing-6)
- **Large spacing**: 32px (--spacing-8), 48px (--spacing-12)
- **Body text**: 16px (--font-size-base)
- **Headings**: 24px (--font-size-2xl) to 48px (--font-size-5xl)
- **Mobile**: < 640px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
