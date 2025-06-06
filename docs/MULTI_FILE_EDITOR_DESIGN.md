# Multi-File Editor Design

## Overview

The GhostPaste multi-file editor follows GitHub Gist's UX pattern where files are displayed vertically in a single page rather than using tabs. This provides better visibility of all files and a more intuitive editing experience.

## Design Principles

1. **Vertical Layout**: All files visible at once, no hidden content
2. **Inline Editing**: Each file is a self-contained unit with all controls
3. **Progressive Disclosure**: Start with one file, add more as needed
4. **Mobile-First**: Works well on all screen sizes
5. **Accessibility**: Keyboard navigable, screen reader friendly

## Component Architecture

### 1. MultiFileEditor (Container)

The main container that manages the state of all files.

**State Management:**

```typescript
interface FileData {
  id: string; // Unique identifier (nanoid)
  name: string; // Filename with extension
  content: string; // File content
  language?: string; // Detected or selected language
}

const [files, setFiles] = useState<FileData[]>([
  { id: nanoid(), name: "", content: "", language: "text" },
]);
```

**Key Features:**

- Manages array of files
- Handles add/remove operations
- Validates constraints (1-20 files)
- Prevents duplicate filenames
- Generates default filenames

### 2. FileEditor (Individual File)

Each file is rendered as a FileEditor component.

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ [filename.js    ] [JavaScript ▼] [✕]                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  // Your code here...                                  │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components:**

- Filename input (with validation)
- Language selector dropdown
- Remove button (conditional)
- CodeMirror editor

### 3. AddFileButton

Simple button component at the bottom of all files.

```
┌─────────────────────────────────────┐
│         ➕ Add another file          │
└─────────────────────────────────────┘
```

## User Interactions

### Adding Files

1. User clicks "Add another file"
2. New FileEditor appended to bottom
3. Page auto-scrolls to new file
4. Focus placed on filename input
5. Default filename generated (e.g., "file2.txt")

### Removing Files

1. User clicks ✕ button on file
2. Confirmation if file has content
3. File removed from list
4. If last file, remove button hidden

### Filename Changes

1. User types in filename field
2. Real-time validation:
   - No empty names
   - No duplicate names
   - Valid characters only
   - Max 255 characters
3. Language auto-detected from extension
4. Error shown below input if invalid

### Language Selection

1. Dropdown shows supported languages
2. Selection updates syntax highlighting
3. Manual selection overrides auto-detection

## State Flow

```
User Action          State Update              UI Update
───────────          ────────────              ─────────
Add File      →      files.push(newFile)  →    Render new FileEditor
                                              Auto-scroll to bottom

Remove File   →      files.filter(...)    →    Remove FileEditor
                                              Update remove buttons

Edit Filename →      file.name = value    →    Validate & show errors
                     file.language = auto      Update syntax highlight

Edit Content  →      file.content = value →    Update editor content

Select Lang   →      file.language = sel  →    Update syntax highlight
```

## Responsive Behavior

### Desktop (>768px)

- Full-width editors
- Side-by-side filename and language inputs
- Comfortable spacing

### Mobile (<768px)

- Stacked filename and language inputs
- Full-width editors
- Touch-friendly button sizes
- Reduced vertical spacing

## Performance Considerations

1. **Lazy Loading**: CodeMirror instances created on-demand
2. **Debouncing**: Filename validation debounced
3. **Virtual Scrolling**: For many files (future enhancement)
4. **Memoization**: FileEditor components memoized

## Accessibility

1. **Keyboard Navigation**:

   - Tab through all inputs
   - Ctrl+Enter to add new file
   - Delete key to remove (with focus)

2. **Screen Readers**:

   - Proper ARIA labels
   - Announce file operations
   - Describe editor state

3. **Focus Management**:
   - Focus new file on add
   - Focus previous file on remove
   - Trap focus in dialogs

## Error Handling

1. **Filename Errors**:

   - "Filename is required"
   - "Filename already exists"
   - "Invalid characters in filename"

2. **File Limit**:

   - Disable add button at 20 files
   - Show tooltip explaining limit

3. **Content Size**:
   - Warn at 400KB per file
   - Error at 500KB per file
   - Show total size indicator

## Future Enhancements

1. **Drag and Drop Reordering**
2. **File Templates** (e.g., "Add HTML/CSS/JS set")
3. **Import from URL**
4. **Syntax Validation**
5. **Collaborative Editing**

## Implementation Checklist

- [ ] Create FileEditor component
- [ ] Create MultiFileEditor container
- [ ] Implement file state management
- [ ] Add filename validation
- [ ] Implement language auto-detection
- [ ] Add remove functionality with confirmation
- [ ] Create AddFileButton component
- [ ] Implement auto-scroll on add
- [ ] Add keyboard shortcuts
- [ ] Implement responsive design
- [ ] Add accessibility features
- [ ] Create unit tests
- [ ] Add integration tests
- [ ] Performance optimization
- [ ] Documentation
