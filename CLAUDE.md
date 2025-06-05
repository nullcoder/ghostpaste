# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

GhostPaste is a zero-knowledge encrypted code sharing platform. See `docs/SPEC.md` for full specification.

**Domain:** ghostpaste.dev

## Key Implementation Notes

### File Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # React components (using shadcn/ui)
├── lib/
│   ├── crypto.ts       # Encryption/decryption utilities
│   ├── storage.ts      # R2 storage client
│   └── binary.ts       # Binary format encoding/decoding
└── types/              # TypeScript interfaces
```

### Critical Security Rules
1. **NEVER** send encryption keys to the server
2. **NEVER** log or store decryption keys
3. **ALWAYS** use URL fragments for key sharing (`#key=...`)
4. **ALWAYS** validate PIN before allowing edits
5. **ALWAYS** use fresh IVs for each encryption

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

### Testing Checklist
- [ ] Encryption/decryption works correctly
- [ ] Binary format encoding/decoding
- [ ] PIN authentication flow
- [ ] File size limits enforced
- [ ] Self-expiring gists delete properly
- [ ] One-time view gists delete after viewing

### Environment Variables
See `.env.example` for required Cloudflare R2 configuration.

## When Making Changes

1. **Read the spec first**: Always check `docs/SPEC.md` for requirements
2. **Test encryption**: Any crypto changes need thorough testing
3. **Check limits**: Enforce size limits (500KB/file, 5MB/gist, 20 files)
4. **Validate inputs**: Especially for user-provided content
5. **Handle errors**: Provide clear error messages to users

For detailed architecture, API specs, and data models, refer to `docs/SPEC.md`.