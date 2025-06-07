# 📘 GhostPaste Specification

## 💡 Overview

GhostPaste is a zero-knowledge encrypted code sharing platform where users can create, share, and edit encrypted code snippets. The server never has access to plaintext content—all encryption and decryption happens client-side.

**Core Principles:**

- 🔐 Zero-knowledge encryption
- 👤 No user accounts required
- ✏️ PIN-protected editing
- ⏱️ Self-expiring gists
- 🔄 Version history

**Live at:** [ghostpaste.dev](https://ghostpaste.dev)

---

## 🏗️ Architecture

### Deployment Model

GhostPaste runs entirely on Cloudflare's edge network:

- **Next.js** deployed via Cloudflare Workers using `@cloudflare/next-on-pages`
- **R2 Storage** accessed through native Workers bindings (no AWS SDK needed)
- **Zero cold starts** with Workers' always-warm edge runtime
- **Global distribution** across Cloudflare's network

### Tech Stack

| Component      | Technology                         | Purpose                             |
| -------------- | ---------------------------------- | ----------------------------------- |
| **Frontend**   | Next.js 15                         | React framework with app router     |
| **UI Library** | [shadcn/ui](https://ui.shadcn.com) | Modern, accessible components       |
| **Editor**     | CodeMirror 6                       | Syntax highlighting & editing       |
| **Encryption** | Web Crypto API                     | AES-GCM client-side encryption      |
| **Runtime**    | Cloudflare Workers                 | Edge computing platform             |
| **Storage**    | Cloudflare R2                      | Object storage with native bindings |

### Storage Structure

All data stored in Cloudflare R2:

```
ghostpaste-bucket/
├── metadata/
│   └── {gist-id}.json       # Metadata with current version pointer
└── versions/
    └── {gist-id}/
        └── {timestamp}.bin  # All encrypted blobs (no separate blobs/ directory)
```

**Key improvements:**

- No redundant storage - all blobs stored only in `versions/`
- Current version tracked via `current_version` field in metadata
- Simpler updates - just add new version file and update metadata pointer
- No file copying/moving needed when creating versions

---

## 📊 Data Models

### Metadata Structure

Each gist has a metadata file containing both public system data and encrypted user data:

```typescript
interface GistMetadata {
  // Unencrypted system fields
  id: string; // nanoid (21 chars)
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  expires_at?: string; // ISO 8601 (optional)
  current_version: string; // ISO 8601 timestamp pointing to latest version
  version: number; // Current version number
  version_count: number; // Total versions
  total_size: number; // Total size in bytes
  file_count: number; // Number of files
  schema_version: 1; // For future migrations

  // Edit authentication (optional)
  edit_password_hash?: string; // PBKDF2 hash of edit password
  edit_password_salt?: string; // Random salt for hash

  // Editor preferences (unencrypted for quick UI setup)
  editor: {
    indent_mode: "spaces" | "tabs";
    indent_size: number; // 2, 4, 8
    wrap_mode: "soft" | "off";
    theme?: "light" | "dark";
  };

  // Encrypted user content
  encrypted_metadata: {
    iv: string; // Base64 encoded IV
    ciphertext: string; // Base64 encoded encrypted data
  };
}

// Encrypted portion contains:
interface UserMetadata {
  description?: string;
  files: Array<{
    name: string;
    size: number;
    language?: string;
  }>;
}
```

### Content Storage

File contents stored as encrypted binary with custom format:

```
Binary format (before encryption):
[4 bytes: file count]
For each file:
  [4 bytes: filename length]
  [filename UTF-8 bytes]
  [4 bytes: content length]
  [content UTF-8 bytes]

Stored format:
[12 bytes: IV][Encrypted binary data]
```

---

## 🔐 Encryption

### Specifications

- **Algorithm:** AES-GCM (256-bit keys)
- **Key Generation:** `crypto.getRandomValues()`
- **Key Format:** Base64 encoded
- **IV:** Fresh 12-byte IV per encryption
- **URL Format:** `https://ghostpaste.dev/g/{id}#key={base64-key}`

### Password Protection

For editable gists:

- **Algorithm:** PBKDF2-SHA256 (server-side)
- **Iterations:** 100,000
- **Salt:** Random 16 bytes per gist
- **Input:** User password (8-64 characters, alphanumeric + special characters)
- **Implementation:** All hashing performed server-side for security
- **Transport:** Password sent over HTTPS only
- **Future:** Consider OPAQUE protocol for zero-knowledge password authentication

---

## 🔌 API Endpoints

All API routes run on Cloudflare Workers with Edge Runtime.

### Create Gist

```http
POST /api/gists
Content-Type: multipart/form-data

Parts:
- metadata: JSON with GistMetadata
- blob: Binary encrypted content
- password: Optional edit password (plain text)

Response: 201 Created
{
  "id": "abc123...",
  "url": "https://ghostpaste.dev/g/abc123"
}
```

### Get Gist

```http
GET /api/gists/{id}

Response: 200 OK
{
  "metadata": { /* GistMetadata */ },
  "blob_url": "/api/blobs/{id}"
}
```

### Get Blob

```http
GET /api/blobs/{id}

Response: 200 OK
[Binary data from versions/{id}/{current_version}.bin]
```

Note: The blob endpoint internally fetches from the versions directory using the current_version timestamp from metadata.

### Update Gist

```http
PUT /api/gists/{id}
Content-Type: multipart/form-data
X-Edit-Password: {password}

Parts:
- metadata: Updated metadata JSON
- blob: New encrypted content
- version: Previous version (optimistic locking)

Response: 200 OK
{
  "version": 2
}
```

### Error Responses

```json
{
  "error": "Human readable message",
  "code": "ERROR_CODE"
}
```

Error codes:

- `NOT_FOUND` - Gist doesn't exist
- `INVALID_PASSWORD` - Wrong edit password
- `VERSION_CONFLICT` - Concurrent edit
- `SIZE_LIMIT` - Exceeds limits
- `RATE_LIMIT` - Too many requests

---

## 📏 Limits

| Resource                | Limit         | Rationale                |
| ----------------------- | ------------- | ------------------------ |
| File size               | 500 KB        | Covers 99% of code files |
| Gist size               | 5 MB          | ~10-20 typical files     |
| Files per gist          | 20            | UI performance           |
| Versions kept           | 50            | Storage management       |
| Create rate             | 30/hour/IP    | Prevent abuse            |
| Update rate             | 60/hour/IP    | Allow active editing     |
| Minimum password length | 8 characters  | Security best practice   |
| Maximum password length | 64 characters | Usability and security   |
| Request size            | 100 MB        | Cloudflare Workers limit |
| CPU time                | 50ms          | Workers CPU limit        |

---

## 🎯 Core Features

### 1. Self-Expiring Gists

Users can set expiration times:

- Minimum: 1 hour
- Maximum: 30 days
- Default: No expiration

Implementation:

- Separate Cloudflare Worker with scheduled trigger
- Checks `expires_at` field hourly
- Batch deletes expired gists + versions
- Configured in wrangler.toml

### 2. One-Time View

Gists that delete after first decryption:

- `one_time_view: true` flag in metadata
- Client notifies server after successful decrypt
- Server immediately deletes all gist data
- Optional download before viewing

### 3. Version History

- Last 50 versions kept
- Each version stored as `versions/{gist-id}/{timestamp}.bin`
- Metadata tracks `current_version` timestamp
- Creating new version:
  1. Upload blob to `versions/{gist-id}/{new-timestamp}.bin`
  2. Update metadata with new `current_version` and increment `version`
  3. No copying/moving of blobs required
- Accessible via dropdown UI
- Same encryption key for all versions
- Version cleanup removes old timestamp files beyond limit

---

## 🛡️ Security

### Client Security

- All encryption in browser
- Keys never sent to server
- URL fragments not in HTTP requests
- No cookies or local storage of keys
- CSP headers prevent XSS

### Server Security

- Rate limiting per IP
- Input validation
- CORS restricted to ghostpaste.dev
- No logging of encrypted content
- HTTPS only with HSTS

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-eval';  // Required for CodeMirror
style-src 'self' 'unsafe-inline';
connect-src 'self' https://api.ghostpaste.dev;
img-src 'self' data: https:;
```

---

## 🎨 UI/UX Flow

### Creating a Gist

1. User enters code in editor
2. Adds multiple files (GitHub Gist-style):
   - Initial file shown by default
   - Click "Add file" button to append new file editor below
   - Each file has inline remove button (except when only one file)
   - No tabs - all files visible vertically
3. Sets preferences:
   - Description (optional)
   - Expiration (optional)
   - Edit password (optional)
   - One-time view (optional)
4. Click "Create"
5. Get shareable URL

### Viewing a Gist

1. Open shared URL
2. Browser extracts key from fragment
3. Fetch and decrypt metadata
4. Fetch and decrypt content
5. Display in read-only editor
6. Multiple files shown vertically (same as creation)

### Editing a Gist

1. Click "Edit" button
2. Enter password if required
3. Make changes:
   - Edit existing files inline
   - Add new files at the bottom
   - Remove files (minimum 1 required)
4. Click "Update"
5. New version created

### Multiple File Editor UX

The file editor follows GitHub Gist's design pattern:

- **Vertical Layout:** All files displayed vertically in a single scrollable page
- **File Components:** Each file has:
  - Filename input field (with extension auto-detection)
  - Language selector dropdown
  - Remove button (✕) on the right (hidden when only 1 file)
  - Full-height code editor below
- **Add File Button:** At the bottom of all files
  - Adds a new empty file editor
  - Auto-scrolls to the new file
  - Default filename: `file1.txt`, `file2.txt`, etc.
- **File Management:**
  - Minimum 1 file required
  - Maximum 20 files allowed
  - Real-time validation of filenames
  - Duplicate filenames prevented
- **Responsive Design:**
  - Stack vertically on all screen sizes
  - Consistent spacing between files
  - Touch-friendly controls on mobile

---

## 🚀 Implementation Notes

### Development Setup

```bash
# Install dependencies
npm install

# Local development with Wrangler
npm run dev

# Build for Cloudflare Workers
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

### Wrangler Configuration

```toml
# wrangler.toml
name = "ghostpaste"
compatibility_date = "2024-12-01"

[[r2_buckets]]
binding = "GHOSTPASTE_BUCKET"
bucket_name = "ghostpaste-bucket"

[vars]
NEXT_PUBLIC_APP_URL = "https://ghostpaste.dev"

# Scheduled worker for expiry cleanup
[[triggers]]
crons = ["0 * * * *"] # Every hour
```

### R2 Access in Workers

```typescript
// Access R2 from Workers environment
export interface Env {
  GHOSTPASTE_BUCKET: R2Bucket;
}

// Example usage in API route
export async function POST(request: Request, env: Env) {
  // Store new version
  const timestamp = new Date().toISOString();
  await env.GHOSTPASTE_BUCKET.put(
    `versions/${id}/${timestamp}.bin`,
    encryptedBlob
  );

  // Update metadata to point to new version
  metadata.current_version = timestamp;
  metadata.version += 1;
  await env.GHOSTPASTE_BUCKET.put(
    `metadata/${id}.json`,
    JSON.stringify(metadata)
  );
}
```

### Client-Side Encryption Example

```javascript
// Generate key
const key = await crypto.subtle.generateKey(
  { name: "AES-GCM", length: 256 },
  true,
  ["encrypt", "decrypt"]
);

// Encrypt
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  key,
  new TextEncoder().encode(JSON.stringify(data))
);

// Export key for URL
const keyData = await crypto.subtle.exportKey("raw", key);
const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(keyData)));
```

---

## 📅 Future Considerations

- GitHub integration for gist import/export
- Syntax highlighting for more languages
- Collaborative editing with WebRTC
- CLI tool for terminal users
- API tokens for programmatic access

---

## 📝 Storage Design Notes

The storage structure uses a single `versions/` directory for all blobs rather than separate `blobs/` and `versions/` directories. This design:

1. **Eliminates redundancy** - No duplicate storage of current blob
2. **Simplifies updates** - New versions just add a timestamp file
3. **Improves atomicity** - Single write operation for new versions
4. **Reduces complexity** - No file copying or moving operations
5. **Better consistency** - Metadata always points to valid version file

When fetching the current blob, the system reads metadata to get the `current_version` timestamp, then fetches from `versions/{id}/{current_version}.bin`.

---

Last updated: 2025-06-07
