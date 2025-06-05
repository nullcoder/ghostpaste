# Components Directory

This directory contains all React components used throughout the application.

## Structure

```
components/
├── ui/              # shadcn/ui components (auto-generated)
├── theme-provider.tsx
├── theme-toggle.tsx
└── [future components will be added here]
```

## Conventions

- All components are written in TypeScript with proper type definitions
- Components use the `.tsx` extension
- Follow the single responsibility principle - each component has one clear purpose
- Use `"use client"` directive only when necessary (client-side interactivity)
- Prefer composition over inheritance
- Export components as named exports (except for pages)

## Component Categories (to be implemented)

### Layout Components

- Header - Main navigation
- Footer - Site information
- Container - Consistent spacing wrapper

### Form Components

- FileTab - Multi-file support
- CodeEditor - CodeMirror wrapper
- ExpirySelector - Expiration time picker
- PINInput - Secure PIN entry
- ShareDialog - Share link with copy

### Display Components

- GistViewer - Display encrypted gists
- FileList - List of files in a gist
- LoadingStates - Loading indicators
- ErrorBoundary - Error handling

## Styling

- Use Tailwind CSS classes via `cn()` utility
- Follow shadcn/ui patterns for consistency
- Support both light and dark themes
- Ensure responsive design
