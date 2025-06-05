# 📦 Dependencies Documentation

This document provides information about the core dependencies used in GhostPaste and their edge runtime compatibility.

## Core Dependencies

### ID Generation

- **nanoid** (v5.1.5) - Secure, URL-safe unique ID generator
  - ✅ Edge compatible
  - Used for generating unique gist IDs
  - Generates 21-character IDs by default

### Code Editor

- **CodeMirror 6** - Modern code editor framework
  - ✅ Edge compatible (when using state-only features)
  - Core packages:
    - `codemirror` - Core editor framework
    - `@codemirror/state` - Editor state management
    - `@codemirror/view` - Editor view (use carefully in edge runtime)

### Language Support

Installed language modes for syntax highlighting:

- `@codemirror/lang-javascript` - JavaScript/TypeScript
- `@codemirror/lang-python` - Python
- `@codemirror/lang-html` - HTML
- `@codemirror/lang-css` - CSS
- `@codemirror/lang-json` - JSON
- `@codemirror/lang-markdown` - Markdown
- `@codemirror/lang-sql` - SQL
- `@codemirror/lang-xml` - XML
- `@codemirror/lang-yaml` - YAML

### Themes

- `@codemirror/theme-one-dark` - One Dark theme
- `@uiw/codemirror-theme-github` - GitHub light/dark themes

### UI Framework

- **shadcn/ui** - Component library built on Radix UI
  - `@radix-ui/react-slot` - Composition primitive
  - `class-variance-authority` - Variant styling
  - `clsx` - Class name utility
  - `tailwind-merge` - Tailwind class merging
  - `lucide-react` - Icon library

### Theme Management

- **next-themes** - Theme switching for Next.js
  - ✅ Edge compatible
  - Handles dark/light mode with system preference support

### Type Definitions

- **@cloudflare/workers-types** - TypeScript types for Cloudflare Workers
  - Provides types for R2, KV, Durable Objects, etc.

## Edge Runtime Compatibility

All core dependencies have been tested and verified to work in Cloudflare Workers edge runtime:

1. **nanoid** - Fully compatible, uses Web Crypto API
2. **CodeMirror** - State management is compatible, DOM operations should be client-side only
3. **UI libraries** - React components work in SSR/edge runtime
4. **Type definitions** - Development only, no runtime impact

## Usage Notes

### CodeMirror in Edge Runtime

When using CodeMirror in edge runtime (SSR), only use state-related features:

```typescript
// ✅ Safe for edge runtime
import { EditorState } from "@codemirror/state";
const state = EditorState.create({ doc: "code" });

// ❌ Not safe for edge runtime (requires DOM)
import { EditorView } from "@codemirror/view";
// Only use EditorView on client-side
```

### nanoid Usage

```typescript
import { nanoid } from "nanoid";
const id = nanoid(); // Generates 21-char ID
const customId = nanoid(10); // Custom length
```

## Bundle Size Considerations

- CodeMirror language modes are modular - only import what you need
- Consider dynamic imports for large language modes
- Tree-shaking will remove unused exports
