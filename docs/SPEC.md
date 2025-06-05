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

### Tech Stack

| Component      | Technology                              | Purpose                           |
| -------------- | --------------------------------------- | --------------------------------- |
| **Frontend**   | Next.js 14+ (SPA mode)                  | React framework with app router   |
| **UI Library** | [shadcn/ui](https://ui.shadcn.com)      | Modern, accessible components     |
| **Editor**     | CodeMirror 6                            | Syntax highlighting & editing     |
| **Encryption** | Web Crypto API                          | AES-GCM client-side encryption    |
| **Backend**    | Next.js API + Cloudflare Workers        | API endpoints & edge computing    |
| **Storage**    | Cloudflare R2                           | Object storage for all data       |

### Storage Structure

All data stored in Cloudflare R2:

```
ghostpaste-bucket/
├── metadata/
│   └── {gist-id}.json       # Mixed encrypted/unencrypted metadata
├── blobs/
│   └── {gist-id}.bin        # Encrypted binary content
└── versions/
    └── {gist-id}/
        └── {timestamp}.bin  # Encrypted version history
```

---

## 📊 Data Models

### Metadata Structure

Each gist has a metadata file containing both public system data and encrypted user data:

```typescript
interface GistMetadata {
  // Unencrypted system fields
  id: string;                    // nanoid (21 chars)
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
  expires_at?: string;           // ISO 8601 (optional)
  version: number;               // Current version number
  version_count: number;         // Total versions
  total_size: number;            // Total size in bytes
  file_count: number;            // Number of files
  schema_version: 1;             // For future migrations
  
  // Edit authentication (optional)
  edit_pin_hash?: string;        // PBKDF2 hash of edit PIN
  edit_pin_salt?: string;        // Random salt for hash
  
  // Editor preferences (unencrypted for quick UI setup)
  editor: {
    indent_mode: 'spaces' | 'tabs';
    indent_size: number;         // 2, 4, 8
    wrap_mode: 'soft' | 'off';
    theme?: 'light' | 'dark';
  };
  
  // Encrypted user content
  encrypted_metadata: {
    iv: string;                  // Base64 encoded IV
    ciphertext: string;          // Base64 encoded encrypted data
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

### PIN Protection

For editable gists:
- **Algorithm:** PBKDF2-SHA256
- **Iterations:** 100,000
- **Salt:** Random 16 bytes per gist
- **Input:** User PIN (4-8 digits)

---

## 🔌 API Endpoints

### Create Gist

```http
POST /api/gists
Content-Type: multipart/form-data

Parts:
- metadata: JSON with GistMetadata
- blob: Binary encrypted content
- pin: Optional edit PIN (plain text)

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
[Binary data]
```

### Update Gist

```http
PUT /api/gists/{id}
Content-Type: multipart/form-data
X-Edit-PIN: {pin}

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
- `INVALID_PIN` - Wrong edit PIN
- `VERSION_CONFLICT` - Concurrent edit
- `SIZE_LIMIT` - Exceeds limits
- `RATE_LIMIT` - Too many requests

---

## 📏 Limits

| Resource           | Limit       | Rationale                    |
| ------------------ | ----------- | ---------------------------- |
| File size          | 500 KB      | Covers 99% of code files     |
| Gist size          | 5 MB        | ~10-20 typical files         |
| Files per gist     | 20          | UI performance               |
| Versions kept      | 50          | Storage management           |
| Create rate        | 30/hour/IP  | Prevent abuse                |
| Update rate        | 60/hour/IP  | Allow active editing         |
| Minimum PIN length | 4 digits    | Basic security               |
| Maximum PIN length | 8 digits    | Usability                    |

---

## 🎯 Core Features

### 1. Self-Expiring Gists

Users can set expiration times:
- Minimum: 1 hour
- Maximum: 30 days
- Default: No expiration

Implementation:
- Cloudflare Workers CRON job
- Checks `expires_at` field hourly
- Deletes expired gists + versions

### 2. One-Time View

Gists that delete after first decryption:
- Special flag in metadata
- Client notifies server after successful decrypt
- Server immediately deletes

### 3. Version History

- Last 50 versions kept
- Each version timestamped
- Accessible via dropdown UI
- Same encryption key for all versions

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
2. Adds files via tabs
3. Sets preferences:
   - Description (optional)
   - Expiration (optional)
   - Edit PIN (optional)
   - One-time view (optional)
4. Click "Create"
5. Get shareable URL

### Viewing a Gist

1. Open shared URL
2. Browser extracts key from fragment
3. Fetch and decrypt metadata
4. Fetch and decrypt content
5. Display in read-only editor

### Editing a Gist

1. Click "Edit" button
2. Enter PIN if required
3. Make changes
4. Click "Update"
5. New version created

---

## 🚀 Implementation Notes

### Development Setup

```bash
# Environment variables
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=ghostpaste-bucket
NEXT_PUBLIC_APP_URL=https://ghostpaste.dev

# Commands
npm install
npm run dev
npm run build
npm run deploy
```

### R2 Configuration

```bash
# Create bucket
wrangler r2 bucket create ghostpaste-bucket

# Set CORS
wrangler r2 bucket cors put ghostpaste-bucket --rules '[
  {
    "allowedOrigins": ["https://ghostpaste.dev"],
    "allowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "allowedHeaders": ["*"],
    "maxAgeSeconds": 3600
  }
]'
```

### Client-Side Encryption Example

```javascript
// Generate key
const key = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,
  ['encrypt', 'decrypt']
);

// Encrypt
const iv = crypto.getRandomValues(new Uint8Array(12));
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  new TextEncoder().encode(JSON.stringify(data))
);

// Export key for URL
const keyData = await crypto.subtle.exportKey('raw', key);
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

Last updated: 2025-06-04