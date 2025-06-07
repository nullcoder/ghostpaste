# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

GhostPaste is a zero-knowledge encrypted code sharing platform. See `docs/SPEC.md` for full specification.

**Domain:** ghostpaste.dev

## Key Implementation Notes

### File Structure

```
app/                     # Next.js app router pages
├── api/                 # API routes
├── create/              # Gist creation page
├── g/[id]/              # Gist viewing page
└── demo/                # Demo pages for components

components/              # React components (using shadcn/ui)
├── ui/                  # Reusable UI components
│   ├── code-editor.tsx  # CodeMirror wrapper
│   ├── file-editor.tsx  # Single file editor
│   ├── multi-file-editor.tsx # Multi-file container
│   └── copy-button.tsx  # Copy functionality
├── header.tsx           # App header with nav
├── share-dialog.tsx     # Share URL dialog
├── gist-viewer.tsx      # Read-only viewer
└── error-boundary.tsx   # Error handling

lib/                     # Utilities and core logic
├── crypto.ts            # Encryption/decryption utilities
├── binary.ts            # Binary format encoding/decoding
├── auth.ts              # PIN authentication
├── copy-to-clipboard.ts # Copy utilities
├── validation.ts        # Input validation
└── language-detection.ts # File type detection

types/                   # TypeScript interfaces
├── models.ts            # Core data models
├── api.ts               # API types
└── errors.ts            # Error types
```

### Critical Security Rules

1. **NEVER** send encryption keys to the server
2. **NEVER** log or store decryption keys
3. **ALWAYS** use URL fragments for key sharing (`#key=...`)
4. **ALWAYS** validate PIN before allowing edits
5. **ALWAYS** use fresh IVs for each encryption

### Common Commands

```bash
npm run dev          # Start Next.js development server
npm run preview      # Build and run with local Cloudflare Workers simulation
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
npm run deploy       # Deploy to production
```

For more commands, see the [Local Development Guide](docs/LOCAL_DEVELOPMENT.md).

### Testing Checklist

- [x] Encryption/decryption works correctly
- [x] Binary format encoding/decoding
- [x] PIN authentication flow
- [x] File size limits enforced
- [ ] Self-expiring gists delete properly
- [ ] One-time view gists delete after viewing
- [x] Copy-to-clipboard functionality
- [x] Toast notifications
- [x] Error boundaries contain errors properly

### Environment Variables

See `.env.example` for required Cloudflare R2 configuration.

## When Making Changes

1. **Read the spec first**: Always check `docs/SPEC.md` for requirements
2. **Test encryption**: Any crypto changes need thorough testing
3. **Check limits**: Enforce size limits (500KB/file, 5MB/gist, 20 files)
4. **Validate inputs**: Especially for user-provided content
5. **Handle errors**: Provide clear error messages to users
6. **Follow guidelines**: See `CONTRIBUTING.md` for development workflow

For detailed architecture, API specs, and data models, refer to `docs/SPEC.md`.

## Git Workflow

- Always create a new branch for features/fixes
- Use descriptive branch names (e.g., `feature/add-encryption` or `fix/pin-validation`)
- Commit frequently with clear, concise commit messages
- Pull request workflow:
  1. Create branch from `main`
  2. Make changes
  3. Run tests and linting
  4. Create pull request
  5. Request code review
  6. Squash and merge after approval
  7. When merging, write commit summary from all commits in the pull request
  8. Use a comprehensive summary (not a commit list) as the squash merge commit message, describing the overall work accomplished in the PR
- Prefer rebase over merge to keep history clean
- Always pull latest changes from `main` before starting new work

### Commit Attribution

When attributing commits to Claude, use:

```
Co-Authored-By: Claude <claude@ghostpaste.dev>
```

## Project Management

### GitHub Project

- All issues and PRs are tracked in the "👻 GhostPaste" project board
- When creating issues or PRs, always add `--project "👻 GhostPaste"`
- Follow the label system documented in `docs/LABELS.md`

### Issue Management

- Every issue must have: category label, priority label, and status label
- Reference TODO.md line numbers in issues when applicable
- Link related issues in the description

### Progress Tracking

- Check off completed tasks in `docs/TODO.md`
- Update issue status labels as work progresses
- Close issues only after PR is merged
- **IMPORTANT**: Update project board status, not just labels (see below)

### Development Workflow

1. Pick an issue from the project board
2. Update issue status to "In Progress" in project board
3. Create feature branch: `git checkout -b feat/issue-description`
4. Make changes following the issue requirements
5. Create PR and link to issue with "Closes #XX"
6. Add PR to project board with "In Progress" status
7. Add `needs review` label to PR
8. Request review and address feedback
9. After merge: Update both issue and PR to "Done" in project board

## Best Practices

### Documentation First

- Always check official documentation before implementing:
  - Next.js 15: Use `create-next-app` and official guides
  - shadcn/ui: Use `npx shadcn-ui@latest` CLI commands
  - Cloudflare: Follow Workers and R2 official docs
  - CodeMirror: Refer to v6 documentation
- Use official CLIs and generators instead of manual setup

### Code Quality

- Run `npm run lint` and `npm run typecheck` before committing
- Follow TypeScript strict mode practices
- Write edge-runtime compatible code only
- Keep components small and focused
- Use proper error boundaries

### Security

- Never commit secrets or API keys
- Always validate and sanitize user input
- Use environment variables for sensitive data
- Follow encryption best practices in `docs/SPEC.md`

### Performance

- Consider Cloudflare Workers limits (50ms CPU, 100MB request)
- Optimize for edge runtime constraints
- Minimize bundle sizes
- Use dynamic imports where appropriate

### Testing

- Write tests for critical paths (encryption, binary format)
- Test edge cases and error scenarios
- Verify edge runtime compatibility
- Run tests before creating PRs

## Project Board Status Management

### Updating Status in GitHub Projects

The project board uses these status values:

- **Todo** (ID: `f75ad846`)
- **In Progress** (ID: `47fc9ee4`)
- **Done** (ID: `98236657`)

To update status using GitHub CLI:

```bash
# Get item IDs for issues/PRs
gh api graphql -f query='
{
  user(login: "nullcoder") {
    projectV2(number: 1) {
      items(first: 20) {
        nodes {
          id
          content {
            ... on Issue { number title }
            ... on PullRequest { number title }
          }
        }
      }
    }
  }
}'

# Update to "In Progress"
gh project item-edit --project-id PVT_kwHOAAF1rM4A6v2O --id [ITEM_ID] \
  --field-id PVTSSF_lAHOAAF1rM4A6v2OzgvQDY4 --single-select-option-id 47fc9ee4

# Update to "Done"
gh project item-edit --project-id PVT_kwHOAAF1rM4A6v2O --id [ITEM_ID] \
  --field-id PVTSSF_lAHOAAF1rM4A6v2OzgvQDY4 --single-select-option-id 98236657
```

### Status Update Checklist

- [ ] When starting work: Set issue to "In Progress"
- [ ] When creating PR: Add PR to board with "In Progress"
- [ ] After merge: Set both issue and PR to "Done"
- [ ] Update TODO.md to check off completed tasks

## Recent Accomplishments (Phase 4 UI Components)

As of June 6, 2025, we've completed 11 out of 19 Phase 4 UI components (58%):

### Completed Components

- **Critical Components** (3/3): CodeEditor, FileEditor, MultiFileEditor
- **High Priority** (6/6): Header, GistViewer, ShareDialog, ErrorBoundary, Copy to Clipboard, Design Tokens
- **Medium Priority** (2/7): AddFileButton, Toast Notifications

### Key Features Implemented

- Full CodeMirror 6 integration with syntax highlighting
- Multi-file editing with GitHub Gist-style UI
- Comprehensive copy-to-clipboard system with fallbacks
- Toast notifications using Sonner
- Error boundaries for graceful error handling
- Share dialog with security warnings
- Responsive header with theme toggle

### Next Priority Components

1. Container (MEDIUM) - Layout consistency
2. ExpirySelector (MEDIUM) - Gist expiration options
3. PINInput (MEDIUM) - Security feature for edits

## Date Tracking

**IMPORTANT**: Always check the current date before updating documents:

```bash
date  # Check current date/time
```

Last Updated: 2025-06-06
