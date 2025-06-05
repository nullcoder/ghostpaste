# 🏷️ GitHub Labels Guide

This document describes the label system used in the GhostPaste repository to organize and prioritize issues and pull requests.

## Label Categories

### 📦 Category Labels (Blue - #0052CC)

These labels categorize the type of work:

- **`setup`** - Initial project setup and configuration
- **`feature`** - New feature implementation
- **`ui`** - User interface and components
- **`api`** - API endpoints and backend logic
- **`security`** - Security and encryption related
- **`storage`** - R2 and data storage
- **`testing`** - Tests and test infrastructure
- **`docs`** - Documentation updates
- **`deployment`** - Deployment and CI/CD

### 🚨 Priority Labels

Priority labels use a color gradient from red (critical) to light yellow (low):

- **`priority: critical`** (Red - #D93F0B) - Must be done immediately, blocking other work
- **`priority: high`** (Orange - #FFA500) - Should be done soon, important for progress
- **`priority: medium`** (Yellow - #FBCA04) - Normal priority, typical tasks
- **`priority: low`** (Light Yellow - #FEF2C0) - Nice to have, can be deferred

### 📊 Status Labels (Purple - #8E44AD)

Track the current state of issues:

- **`ready`** - Ready to be worked on, all prerequisites met
- **`in progress`** - Currently being worked on
- **`blocked`** - Blocked by another issue or external dependency
- **`needs review`** - Ready for code review

### 🔧 Type Labels

Describe the nature of the work:

- **`bug`** (Red - #d73a4a) - Something isn't working
- **`enhancement`** (Light Blue - #a2eeef) - Improvement to existing feature
- **`refactor`** (Green - #22863A) - Code improvement without feature change
- **`chore`** (Green - #22863A) - Maintenance tasks

### 🌐 Platform Labels (Teal - #008B8B)

Platform-specific considerations:

- **`cloudflare`** - Cloudflare Workers or R2 specific
- **`nextjs`** - Next.js framework specific
- **`edge-runtime`** - Edge runtime compatibility issues

### 🎯 Special Labels

- **`good first issue`** (Purple - #7057ff) - Good for newcomers to the project
- **`help wanted`** (Green - #008672) - Extra attention or expertise needed
- **`duplicate`** (Gray - #cfd3d7) - This issue or PR already exists
- **`wontfix`** (White - #ffffff) - This will not be worked on

## Labeling Guidelines

### For Issues

1. **Every issue must have:**
   - At least one category label (e.g., `feature`, `bug`, `docs`)
   - One priority label
   - One status label (initially `ready` unless `blocked`)

2. **Add platform labels when:**
   - The issue is specific to Cloudflare Workers (`cloudflare`)
   - It involves Next.js routing or features (`nextjs`)
   - Edge runtime compatibility is a concern (`edge-runtime`)

3. **Use special labels sparingly:**
   - `good first issue` - Only for well-documented, isolated tasks
   - `help wanted` - When specific expertise is needed
   - `blocked` - Always reference the blocking issue

### For Pull Requests

1. **Inherit labels from the issue** being addressed
2. **Add `needs review`** when ready for review
3. **Keep priority labels** to indicate urgency of review

### Examples

#### Example 1: New Feature Issue
```
Labels: feature, ui, priority: high, ready
Title: "Add dark mode toggle to header"
```

#### Example 2: Bug Fix Issue
```
Labels: bug, api, cloudflare, priority: critical, in progress
Title: "R2 uploads failing in production"
```

#### Example 3: Documentation Update
```
Labels: docs, priority: low, ready, good first issue
Title: "Add examples to encryption documentation"
```

#### Example 4: Blocked Setup Task
```
Labels: setup, cloudflare, priority: high, blocked
Title: "Configure CRON triggers for expiry cleanup"
Body: "Blocked by #15 - R2 bucket creation"
```

## Label Management

### Adding New Labels

Before adding a new label, consider:
1. Does an existing label cover this use case?
2. Will this label be used frequently?
3. Does it fit into our existing categories?

### Removing Labels

Remove labels that:
1. Haven't been used in the last 50 issues
2. Duplicate the meaning of existing labels
3. Are too specific to be reusable

## Automation

Consider using GitHub Actions to:
- Auto-label based on file paths changed
- Enforce labeling requirements
- Update status labels based on PR state

---

Last updated: 2025-06-05