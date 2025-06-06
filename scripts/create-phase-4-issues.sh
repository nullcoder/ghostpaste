#!/bin/bash

# Script to create all Phase 4 GitHub issues for GhostPaste
# Requires GitHub CLI (gh) to be installed and authenticated

echo "Creating Phase 4: UI Components issues..."

# Function to create an issue
create_issue() {
    local title=$1
    local body=$2
    local labels=$3
    local issue_number=$4
    
    echo "Creating issue #$issue_number: $title"
    
    gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        --project "👻 GhostPaste" \
        --milestone "Phase 4: UI Components"
}

# Layout Components
create_issue \
    "feat: create header component with navigation" \
    "Create the main header component for GhostPaste with navigation and branding.

## Requirements
- Logo/brand on the left
- Navigation items (Create, About, GitHub)  
- Theme toggle button on the right
- Mobile-responsive hamburger menu
- Sticky header on scroll
- Use shadcn/ui navigation components

## Acceptance Criteria
- [ ] Header displays logo and navigation
- [ ] Theme toggle works
- [ ] Mobile menu functions correctly
- [ ] Keyboard navigation support
- [ ] ARIA labels for accessibility

## Technical Notes
- Use Next.js Link for navigation
- Implement with shadcn/ui NavigationMenu
- Support both light and dark themes
- Test on mobile devices" \
    "ui,component,priority: high" \
    42

create_issue \
    "feat: create footer component" \
    "Create a simple footer component with links and copyright.

## Requirements
- Copyright notice
- Links to GitHub, Privacy, Terms
- Social links (optional)
- Responsive layout

## Acceptance Criteria
- [ ] Footer displays all required information
- [ ] Links are accessible
- [ ] Responsive on all screen sizes

## Technical Notes
- Keep it simple and clean
- Ensure sufficient contrast in both themes
- Use semantic HTML" \
    "ui,component,priority: low" \
    43

create_issue \
    "feat: create container component for consistent spacing" \
    "Create a reusable container component for consistent page margins and max-width.

## Requirements
- Max-width constraint (1280px)
- Responsive padding
- Center alignment
- Support for different variants (narrow, wide, full)

## Acceptance Criteria
- [ ] Container constrains content width
- [ ] Responsive padding works
- [ ] Different variants available

## Technical Notes
- Use Tailwind's container as base
- Add custom padding scale
- Support prose variant for content" \
    "ui,component,priority: medium" \
    44

create_issue \
    "feat: implement design system tokens" \
    "Set up design tokens for consistent spacing, typography, and breakpoints.

## Requirements
- Define spacing scale (4, 8, 16, 24, 32, 48, 64)
- Typography scale (text-xs through text-6xl)
- Breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Color tokens for themes
- Add to Tailwind config

## Acceptance Criteria
- [ ] Design tokens documented
- [ ] Tailwind config updated
- [ ] Usage examples provided

## Technical Notes
- Extend Tailwind config
- Document in README
- Create TypeScript constants" \
    "ui,design-system,priority: high" \
    45

# Editor Components
create_issue \
    "feat: create CodeMirror editor wrapper component" \
    "Create a React wrapper for CodeMirror 6 with all required features.

## Requirements
- Support for all installed language modes
- Theme switching (light/dark)
- Line numbers toggle
- Word wrap toggle
- Syntax highlighting
- Placeholder text
- Read-only mode
- Custom styling to match design system
- Performance optimization for large files

## Technical Details
- Use CodeMirror 6 with React
- Implement proper cleanup on unmount
- Handle theme changes dynamically
- Support controlled and uncontrolled modes

## Acceptance Criteria
- [ ] Editor renders and accepts input
- [ ] Syntax highlighting works
- [ ] Theme switching works
- [ ] All language modes supported
- [ ] Performance acceptable for 500KB files
- [ ] Proper TypeScript types

## Performance Requirements
- Initial render <50ms
- Theme switch <16ms
- Handle 500KB files smoothly" \
    "ui,component,priority: critical" \
    46

create_issue \
    "feat: create single file editor component" \
    "Create the FileEditor component that combines filename input, language selector, and code editor.

## Requirements
- Filename input with validation
- Language dropdown (auto-detect from extension)
- Remove button (conditional display)
- Integration with CodeEditor component
- Error states for invalid filenames
- Responsive layout

## Acceptance Criteria
- [ ] Component renders all sub-components
- [ ] Filename validation works
- [ ] Language auto-detection works
- [ ] Remove button conditional logic works
- [ ] Error states display correctly
- [ ] Keyboard navigation between fields

## Technical Notes
- Use composition with CodeEditor
- Implement filename validation
- Auto-detect language from extension
- Handle error states gracefully" \
    "ui,component,priority: critical" \
    47

create_issue \
    "feat: create multi-file editor container" \
    "Create the container component that manages multiple FileEditor instances.

## Requirements
- State management for file array
- Add/remove file functionality
- Filename duplicate prevention
- Auto-generate filenames (file1.txt, file2.txt)
- Enforce min 1, max 20 files
- Calculate total size
- Auto-scroll to new files
- Performance optimization

## Acceptance Criteria
- [ ] Can add up to 20 files
- [ ] Can remove files (min 1)
- [ ] Duplicate names prevented
- [ ] Auto-scroll works
- [ ] State updates efficiently
- [ ] Total size calculated

## Technical Notes
- Consider useReducer for state
- Implement proper memoization
- Handle array updates immutably
- Profile performance with many files" \
    "ui,component,priority: critical" \
    48

create_issue \
    "feat: create add file button component" \
    "Create the button component for adding new files.

## Requirements
- Plus icon with text
- Disabled state at 20 files
- Loading state while adding
- Tooltip for disabled state
- Consistent with design system

## Acceptance Criteria
- [ ] Button renders correctly
- [ ] Disabled at file limit
- [ ] Tooltip shows reason
- [ ] Click handler works

## Technical Notes
- Use shadcn/ui Button
- Add proper loading state
- Implement tooltip component" \
    "ui,component,priority: medium" \
    49

# Form Components
create_issue \
    "feat: create expiry time selector component" \
    "Create a component for selecting gist expiration time.

## Requirements
- Predefined options (1 hour, 1 day, 1 week, 30 days, Never)
- Custom time input (optional)
- Clear visual indication of selection
- Accessible dropdown/radio group
- Show human-readable format

## Acceptance Criteria
- [ ] All time options available
- [ ] Selection updates parent state
- [ ] Accessible with keyboard
- [ ] Clear visual feedback

## Technical Notes
- Use shadcn/ui Select or RadioGroup
- Format times clearly
- Handle timezone considerations" \
    "ui,component,priority: medium" \
    50

create_issue \
    "feat: create PIN input component" \
    "Create a secure PIN input component for edit protection.

## Requirements
- Masked input by default
- Show/hide toggle
- Strength indicator
- Validation messages
- Character counter
- Confirm PIN field
- Accessible labels

## Acceptance Criteria
- [ ] PIN input masks characters
- [ ] Show/hide toggle works
- [ ] Validation displays errors
- [ ] Strength indicator accurate
- [ ] Confirm field matches

## Technical Notes
- Use controlled input
- Implement strength algorithm
- Show helpful error messages
- Consider using OTP input pattern" \
    "ui,component,priority: medium" \
    51

create_issue \
    "feat: create share dialog with copy functionality" \
    "Create a dialog that displays the shareable URL after gist creation.

## Requirements
- Modal/dialog overlay
- Display full URL
- Copy button with feedback
- QR code generation (optional)
- Social share buttons (optional)
- Close on escape/click outside
- Success animation

## Acceptance Criteria
- [ ] Dialog displays URL
- [ ] Copy button works
- [ ] Visual feedback on copy
- [ ] Keyboard accessible
- [ ] Mobile-friendly layout

## Technical Notes
- Use shadcn/ui Dialog
- Implement copy with fallback
- Add success animation
- Test on mobile devices" \
    "ui,component,priority: high" \
    52

# Display Components
create_issue \
    "feat: create gist viewer component" \
    "Create the read-only gist viewer component.

## Requirements
- Display multiple files
- Syntax highlighting
- File tabs or list
- Copy button per file
- Download button
- Print-friendly view
- Loading states
- Error states

## Acceptance Criteria
- [ ] Displays all files
- [ ] Syntax highlighting works
- [ ] Copy/download functional
- [ ] Responsive layout
- [ ] Loading states smooth

## Technical Notes
- Reuse CodeEditor in read-only mode
- Implement file navigation
- Add print styles
- Handle loading states" \
    "ui,component,priority: high" \
    53

create_issue \
    "feat: create file list/tab component" \
    "Create a component to display and navigate between files in view mode.

## Requirements
- List view for many files
- Tab view for few files
- File icons by type
- Active state indication
- Keyboard navigation
- Mobile-friendly

## Acceptance Criteria
- [ ] Shows all files
- [ ] Navigation works
- [ ] Active state clear
- [ ] Responsive design
- [ ] Keyboard accessible

## Technical Notes
- Auto-switch between tabs/list
- Use appropriate icons
- Implement keyboard navigation
- Test with many files" \
    "ui,component,priority: medium" \
    54

create_issue \
    "feat: create version history dropdown" \
    "Create a dropdown to select and view different versions.

## Requirements
- Dropdown with version list
- Show timestamp and number
- Load version on selection
- Visual diff indicator (optional)
- Current version highlighted

## Acceptance Criteria
- [ ] Lists all versions
- [ ] Selection loads version
- [ ] Current version marked
- [ ] Timestamps readable

## Technical Notes
- Use shadcn/ui Select
- Format timestamps nicely
- Handle loading states
- Consider diff visualization" \
    "ui,component,priority: low" \
    55

create_issue \
    "feat: create loading state components" \
    "Create consistent loading states for the application.

## Requirements
- Skeleton screens for editor
- Spinner for actions
- Progress bar for uploads
- Shimmer effects
- Accessible loading announcements

## Acceptance Criteria
- [ ] Multiple loading states
- [ ] Smooth animations
- [ ] Accessible to screen readers
- [ ] Consistent design

## Technical Notes
- Create reusable components
- Use CSS animations
- Add ARIA live regions
- Test performance" \
    "ui,component,priority: medium" \
    56

create_issue \
    "feat: create error boundary component" \
    "Create an error boundary to catch and display errors gracefully.

## Requirements
- Catch React errors
- User-friendly error message
- Retry button
- Report issue link
- Dev mode stack trace
- Log errors properly

## Acceptance Criteria
- [ ] Catches errors
- [ ] Shows friendly message
- [ ] Retry functionality
- [ ] Logs errors
- [ ] Dev mode details

## Technical Notes
- Implement React Error Boundary
- Add error logging
- Show stack trace in dev
- Provide helpful actions" \
    "ui,component,priority: high" \
    57

# UI Features
create_issue \
    "feat: add toast notification system" \
    "Implement a toast notification system for user feedback.

## Requirements
- Success, error, warning, info variants
- Auto-dismiss with timer
- Manual dismiss button
- Queue multiple toasts
- Position configuration
- Animation in/out
- Use shadcn/ui toast

## Acceptance Criteria
- [ ] All variants work
- [ ] Auto-dismiss works
- [ ] Queue system works
- [ ] Accessible announcements
- [ ] Smooth animations

## Technical Notes
- Use shadcn/ui Toast
- Implement toast provider
- Add queue management
- Test accessibility" \
    "ui,feature,priority: medium" \
    58

create_issue \
    "feat: implement keyboard shortcuts" \
    "Add keyboard shortcuts for common actions.

## Requirements
- Cmd/Ctrl+S to save
- Cmd/Ctrl+Enter to create/update
- Cmd/Ctrl+K for command palette (future)
- Escape to close dialogs
- Tab navigation
- Help dialog with shortcut list

## Acceptance Criteria
- [ ] Shortcuts work correctly
- [ ] Don't conflict with browser
- [ ] Help dialog available
- [ ] Works across platforms

## Technical Notes
- Use key event handlers
- Check platform differences
- Document shortcuts
- Add help dialog" \
    "ui,feature,priority: low" \
    59

create_issue \
    "feat: add copy to clipboard functionality" \
    "Implement copy functionality throughout the app.

## Requirements
- Copy share URL
- Copy individual files
- Copy all files
- Visual feedback on copy
- Fallback for older browsers
- Keyboard shortcut support

## Acceptance Criteria
- [ ] Copy works everywhere needed
- [ ] Visual feedback clear
- [ ] Fallback works
- [ ] Accessible to keyboard

## Technical Notes
- Use Clipboard API
- Implement fallback
- Add success feedback
- Test browser support" \
    "ui,feature,priority: high" \
    60

echo "Phase 4 issues created successfully!"
echo "Total issues: 19"
echo "Next steps:"
echo "1. Review issues on GitHub"
echo "2. Add to project board"
echo "3. Assign to developers"
echo "4. Begin implementation with critical path items"