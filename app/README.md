# App Directory

This directory contains the Next.js 15 App Router pages and routes.

## Structure

```
app/
├── layout.tsx       # Root layout with providers
├── page.tsx         # Home page (/)
├── globals.css      # Global styles and Tailwind imports
├── create/
│   └── page.tsx     # Create new gist page (/create)
├── g/
│   └── [id]/
│       └── page.tsx # View gist page (/g/[id])
└── api/             # API routes (will be added in Phase 5)
```

## Conventions

- All pages use `export default` for the page component
- Dynamic route parameters use `params: Promise<{ paramName: string }>` in Next.js 15
- All routes are configured for edge runtime compatibility
- Use async components where needed for data fetching
- Follow the colocation pattern for route-specific components

## Route Overview

- `/` - Landing page with create gist form
- `/create` - Dedicated page for creating new gists (alternative to home)
- `/g/[id]` - View a specific gist by ID (requires decryption key in URL fragment)
