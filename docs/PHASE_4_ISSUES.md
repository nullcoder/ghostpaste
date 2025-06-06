# Phase 4: UI Components - GitHub Issues Breakdown

## Overview

Phase 4 focuses on building the UI components for GhostPaste. These components should be built using shadcn/ui, be fully accessible, support dark/light themes, and work on all screen sizes.

## Issue Groups

### 1. Layout Components (Foundation)

#### Issue #42: Create Header Component

**Title:** feat: create header component with navigation
**Labels:** `ui`, `component`, `priority: high`
**Description:**
Create the main header component for GhostPaste with navigation and branding.

**Requirements:**

- Logo/brand on the left
- Navigation items (Create, About, GitHub)
- Theme toggle button on the right
- Mobile-responsive hamburger menu
- Sticky header on scroll
- Use shadcn/ui navigation components

**Acceptance Criteria:**

- [ ] Header displays logo and navigation
- [ ] Theme toggle works
- [ ] Mobile menu functions correctly
- [ ] Keyboard navigation support
- [ ] ARIA labels for accessibility

---

#### Issue #43: Create Footer Component

**Title:** feat: create footer component
**Labels:** `ui`, `component`, `priority: low`
**Description:**
Create a simple footer component with links and copyright.

**Requirements:**

- Copyright notice
- Links to GitHub, Privacy, Terms
- Social links (optional)
- Responsive layout

**Acceptance Criteria:**

- [ ] Footer displays all required information
- [ ] Links are accessible
- [ ] Responsive on all screen sizes

---

#### Issue #44: Create Container Component

**Title:** feat: create container component for consistent spacing
**Labels:** `ui`, `component`, `priority: medium`
**Description:**
Create a reusable container component for consistent page margins and max-width.

**Requirements:**

- Max-width constraint (1280px)
- Responsive padding
- Center alignment
- Support for different variants (narrow, wide, full)

**Acceptance Criteria:**

- [ ] Container constrains content width
- [ ] Responsive padding works
- [ ] Different variants available

---

#### Issue #45: Implement Responsive Design Tokens

**Title:** feat: implement design system tokens
**Labels:** `ui`, `design-system`, `priority: high`
**Description:**
Set up design tokens for consistent spacing, typography, and breakpoints.

**Requirements:**

- Define spacing scale (4, 8, 16, 24, 32, 48, 64)
- Typography scale (text-xs through text-6xl)
- Breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Color tokens for themes
- Add to Tailwind config

**Acceptance Criteria:**

- [ ] Design tokens documented
- [ ] Tailwind config updated
- [ ] Usage examples provided

---

### 2. Editor Components (Core)

#### Issue #46: Create CodeEditor Component

**Title:** feat: create CodeMirror editor wrapper component
**Labels:** `ui`, `component`, `priority: critical`
**Description:**
Create a React wrapper for CodeMirror 6 with all required features.

**Requirements:**

- Support for all installed language modes
- Theme switching (light/dark)
- Line numbers toggle
- Word wrap toggle
- Syntax highlighting
- Placeholder text
- Read-only mode
- Custom styling to match design system
- Performance optimization for large files

**Technical Details:**

- Use CodeMirror 6 with React
- Implement proper cleanup on unmount
- Handle theme changes dynamically
- Support controlled and uncontrolled modes

**Acceptance Criteria:**

- [ ] Editor renders and accepts input
- [ ] Syntax highlighting works
- [ ] Theme switching works
- [ ] All language modes supported
- [ ] Performance acceptable for 500KB files
- [ ] Proper TypeScript types

---

#### Issue #47: Create FileEditor Component

**Title:** feat: create single file editor component
**Labels:** `ui`, `component`, `priority: critical`
**Description:**
Create the FileEditor component that combines filename input, language selector, and code editor.

**Requirements:**

- Filename input with validation
- Language dropdown (auto-detect from extension)
- Remove button (conditional display)
- Integration with CodeEditor component
- Error states for invalid filenames
- Responsive layout

**Acceptance Criteria:**

- [ ] Component renders all sub-components
- [ ] Filename validation works
- [ ] Language auto-detection works
- [ ] Remove button conditional logic works
- [ ] Error states display correctly
- [ ] Keyboard navigation between fields

---

#### Issue #48: Create MultiFileEditor Component

**Title:** feat: create multi-file editor container
**Labels:** `ui`, `component`, `priority: critical`
**Description:**
Create the container component that manages multiple FileEditor instances.

**Requirements:**

- State management for file array
- Add/remove file functionality
- Filename duplicate prevention
- Auto-generate filenames (file1.txt, file2.txt)
- Enforce min 1, max 20 files
- Calculate total size
- Auto-scroll to new files
- Performance optimization

**Acceptance Criteria:**

- [ ] Can add up to 20 files
- [ ] Can remove files (min 1)
- [ ] Duplicate names prevented
- [ ] Auto-scroll works
- [ ] State updates efficiently
- [ ] Total size calculated

---

#### Issue #49: Create AddFileButton Component

**Title:** feat: create add file button component
**Labels:** `ui`, `component`, `priority: medium`
**Description:**
Create the button component for adding new files.

**Requirements:**

- Plus icon with text
- Disabled state at 20 files
- Loading state while adding
- Tooltip for disabled state
- Consistent with design system

**Acceptance Criteria:**

- [ ] Button renders correctly
- [ ] Disabled at file limit
- [ ] Tooltip shows reason
- [ ] Click handler works

---

### 3. Form Components (Gist Options)

#### Issue #50: Create ExpirySelector Component

**Title:** feat: create expiry time selector component
**Labels:** `ui`, `component`, `priority: medium`
**Description:**
Create a component for selecting gist expiration time.

**Requirements:**

- Predefined options (1 hour, 1 day, 1 week, 30 days, Never)
- Custom time input (optional)
- Clear visual indication of selection
- Accessible dropdown/radio group
- Show human-readable format

**Acceptance Criteria:**

- [ ] All time options available
- [ ] Selection updates parent state
- [ ] Accessible with keyboard
- [ ] Clear visual feedback

---

#### Issue #51: Create PINInput Component

**Title:** feat: create PIN input component
**Labels:** `ui`, `component`, `priority: medium`
**Description:**
Create a secure PIN input component for edit protection.

**Requirements:**

- Masked input by default
- Show/hide toggle
- Strength indicator
- Validation messages
- Character counter
- Confirm PIN field
- Accessible labels

**Acceptance Criteria:**

- [ ] PIN input masks characters
- [ ] Show/hide toggle works
- [ ] Validation displays errors
- [ ] Strength indicator accurate
- [ ] Confirm field matches

---

#### Issue #52: Create ShareDialog Component

**Title:** feat: create share dialog with copy functionality
**Labels:** `ui`, `component`, `priority: high`
**Description:**
Create a dialog that displays the shareable URL after gist creation.

**Requirements:**

- Modal/dialog overlay
- Display full URL
- Copy button with feedback
- QR code generation (optional)
- Social share buttons (optional)
- Close on escape/click outside
- Success animation

**Acceptance Criteria:**

- [ ] Dialog displays URL
- [ ] Copy button works
- [ ] Visual feedback on copy
- [ ] Keyboard accessible
- [ ] Mobile-friendly layout

---

### 4. Display Components (Viewing)

#### Issue #53: Create GistViewer Component

**Title:** feat: create gist viewer component
**Labels:** `ui`, `component`, `priority: high`
**Description:**
Create the read-only gist viewer component.

**Requirements:**

- Display multiple files
- Syntax highlighting
- File tabs or list
- Copy button per file
- Download button
- Print-friendly view
- Loading states
- Error states

**Acceptance Criteria:**

- [ ] Displays all files
- [ ] Syntax highlighting works
- [ ] Copy/download functional
- [ ] Responsive layout
- [ ] Loading states smooth

---

#### Issue #54: Create FileList Component

**Title:** feat: create file list/tab component
**Labels:** `ui`, `component`, `priority: medium`
**Description:**
Create a component to display and navigate between files in view mode.

**Requirements:**

- List view for many files
- Tab view for few files
- File icons by type
- Active state indication
- Keyboard navigation
- Mobile-friendly

**Acceptance Criteria:**

- [ ] Shows all files
- [ ] Navigation works
- [ ] Active state clear
- [ ] Responsive design
- [ ] Keyboard accessible

---

#### Issue #55: Create VersionHistory Component

**Title:** feat: create version history dropdown
**Labels:** `ui`, `component`, `priority: low`
**Description:**
Create a dropdown to select and view different versions.

**Requirements:**

- Dropdown with version list
- Show timestamp and number
- Load version on selection
- Visual diff indicator (optional)
- Current version highlighted

**Acceptance Criteria:**

- [ ] Lists all versions
- [ ] Selection loads version
- [ ] Current version marked
- [ ] Timestamps readable

---

#### Issue #56: Create LoadingStates Component

**Title:** feat: create loading state components
**Labels:** `ui`, `component`, `priority: medium`
**Description:**
Create consistent loading states for the application.

**Requirements:**

- Skeleton screens for editor
- Spinner for actions
- Progress bar for uploads
- Shimmer effects
- Accessible loading announcements

**Acceptance Criteria:**

- [ ] Multiple loading states
- [ ] Smooth animations
- [ ] Accessible to screen readers
- [ ] Consistent design

---

#### Issue #57: Create ErrorBoundary Component

**Title:** feat: create error boundary component
**Labels:** `ui`, `component`, `priority: high`
**Description:**
Create an error boundary to catch and display errors gracefully.

**Requirements:**

- Catch React errors
- User-friendly error message
- Retry button
- Report issue link
- Dev mode stack trace
- Log errors properly

**Acceptance Criteria:**

- [ ] Catches errors
- [ ] Shows friendly message
- [ ] Retry functionality
- [ ] Logs errors
- [ ] Dev mode details

---

### 5. UI Features (Enhancements)

#### Issue #58: Implement Toast Notifications

**Title:** feat: add toast notification system
**Labels:** `ui`, `feature`, `priority: medium`
**Description:**
Implement a toast notification system for user feedback.

**Requirements:**

- Success, error, warning, info variants
- Auto-dismiss with timer
- Manual dismiss button
- Queue multiple toasts
- Position configuration
- Animation in/out
- Use shadcn/ui toast

**Acceptance Criteria:**

- [ ] All variants work
- [ ] Auto-dismiss works
- [ ] Queue system works
- [ ] Accessible announcements
- [ ] Smooth animations

---

#### Issue #59: Create Keyboard Shortcuts

**Title:** feat: implement keyboard shortcuts
**Labels:** `ui`, `feature`, `priority: low`
**Description:**
Add keyboard shortcuts for common actions.

**Requirements:**

- Cmd/Ctrl+S to save
- Cmd/Ctrl+Enter to create/update
- Cmd/Ctrl+K for command palette (future)
- Escape to close dialogs
- Tab navigation
- Help dialog with shortcut list

**Acceptance Criteria:**

- [ ] Shortcuts work correctly
- [ ] Don't conflict with browser
- [ ] Help dialog available
- [ ] Works across platforms

---

#### Issue #60: Implement Copy to Clipboard

**Title:** feat: add copy to clipboard functionality
**Labels:** `ui`, `feature`, `priority: high`
**Description:**
Implement copy functionality throughout the app.

**Requirements:**

- Copy share URL
- Copy individual files
- Copy all files
- Visual feedback on copy
- Fallback for older browsers
- Keyboard shortcut support

**Acceptance Criteria:**

- [ ] Copy works everywhere needed
- [ ] Visual feedback clear
- [ ] Fallback works
- [ ] Accessible to keyboard

---

## Implementation Order

1. **Foundation** (Layout components) - Issues #42-45
2. **Core Editor** - Issues #46-49
3. **Display Components** - Issues #53, #56, #57
4. **Form Components** - Issues #50-52
5. **Enhancements** - Issues #54, #55, #58-60

## Technical Guidelines

### Component Structure

```typescript
// Example component structure
interface ComponentProps {
  // Props
}

export function Component({ ...props }: ComponentProps) {
  // Implementation
}
```

### Styling

- Use Tailwind CSS classes
- Follow shadcn/ui patterns
- Support dark mode with `dark:` prefix
- Use CSS variables for theming

### Testing

- Unit tests for logic
- Component tests with React Testing Library
- Accessibility tests
- Visual regression tests (optional)

### Documentation

- Props documentation with JSDoc
- Usage examples in Storybook (optional)
- README for complex components

## Success Metrics

- All components render without errors
- 100% keyboard accessible
- WCAG 2.1 AA compliant
- Performance: <50ms render time
- Bundle size: <10KB per component
- Test coverage: >80%
