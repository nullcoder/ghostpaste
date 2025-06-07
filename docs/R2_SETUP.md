# Cloudflare R2 Setup Guide

This guide documents the R2 setup process for GhostPaste.

## Prerequisites

- Cloudflare account with R2 access
- Wrangler CLI installed (`npm install -g wrangler`)
- Account ID set in environment or wrangler.toml

## R2 Bucket Configuration

### Bucket Details

- **Bucket Name:** `ghostpaste-bucket`
- **Binding Name:** `GHOSTPASTE_BUCKET`
- **Created:** 2025-06-05

### Setup Steps

1. **Create R2 Bucket** (if not exists):

   ```bash
   export CLOUDFLARE_ACCOUNT_ID=your-account-id
   npx wrangler r2 bucket create ghostpaste-bucket
   ```

2. **Configure Binding** in `wrangler.toml`:

   ```toml
   [[r2_buckets]]
   binding = "GHOSTPASTE_BUCKET"
   bucket_name = "ghostpaste-bucket"
   ```

3. **Access in Code**:

   ```typescript
   import { getCloudflareContext } from "@opennextjs/cloudflare";

   const { env } = await getCloudflareContext({ async: true });
   const bucket = env.GHOSTPASTE_BUCKET as R2Bucket;
   ```

## Testing R2 Access

### Test Endpoints

The `/api/r2-test` endpoint provides the following operations:

- **GET** - List bucket contents and verify access
- **POST** - Test read/write operations with text and binary data
- **DELETE** - Test object deletion (requires `?key=objectKey`)

### Local Development

For R2 access in development, you have two options:

1. **Using Next.js dev server** (recommended for development):

   ```bash
   npm run dev
   ```

   The Next.js config automatically initializes Cloudflare bindings in development mode.

2. **Using Wrangler preview** (tests actual Workers runtime):
   ```bash
   npm run preview
   ```
   This runs the application with the full Cloudflare Workers runtime.

### Test Commands

```bash
# Test bucket access
curl http://localhost:8788/api/r2-test

# Test write operations
curl -X POST http://localhost:8788/api/r2-test \
  -H "Content-Type: application/json" \
  -d '{"key": "test-file", "data": "Hello, R2!"}'

# Test delete operation
curl -X DELETE "http://localhost:8788/api/r2-test?key=test-file"
```

## Storage Structure

GhostPaste uses a versioned storage structure following the SPEC.md design:

```
metadata/{gistId}.json                    # Unencrypted metadata (points to current version)
versions/{gistId}/{timestamp}.bin         # Encrypted blob versions
temp/{gistId}                            # Temporary storage (optional)
```

Key points:

- All blobs are stored as versioned files under `versions/`
- Metadata tracks the `current_version` timestamp
- No separate `blobs/` directory - everything is versioned
- New versions just add a timestamp file
- Last 50 versions are kept (older ones pruned)

## R2 Storage Client

GhostPaste includes a type-safe R2 storage client wrapper (`lib/storage.ts`) that provides:

### Features

- **Type-safe operations**: Strongly typed methods for all R2 operations
- **Error handling**: Custom error types with detailed error messages
- **Singleton pattern**: Efficient connection reuse across requests
- **Binary support**: Handle both JSON metadata and binary blobs

### Usage

```typescript
import { getR2Storage } from "@/lib/storage";

// Get storage instance (automatically initialized)
const storage = await getR2Storage();

// Store metadata
await storage.putMetadata(gistId, metadata);

// Retrieve metadata
const metadata = await storage.getMetadata(gistId);

// Store encrypted blob (returns timestamp for the version)
const timestamp = await storage.putBlob(gistId, encryptedData);

// Retrieve specific version
const blob = await storage.getBlob(gistId, timestamp);

// Retrieve current version
const currentBlob = await storage.getCurrentBlob(gistId);

// List all versions for a gist
const versions = await storage.listVersions(gistId);

// Prune old versions (keep last 50)
const deletedCount = await storage.pruneVersions(gistId, 50);

// Check if gist exists
const exists = await storage.exists(gistId);

// Delete gist (metadata and all versions)
await storage.deleteGist(gistId);

// List gists with pagination
const { gists, cursor } = await storage.listGists({ limit: 100 });
```

### Key Structure

The storage client uses consistent key patterns:

```typescript
const StorageKeys = {
  metadata: (id: string) => `metadata/${id}.json`,
  version: (id: string, timestamp: string) => `versions/${id}/${timestamp}.bin`,
  temp: (id: string) => `temp/${id}`,
};
```

## Important Notes

1. **Bindings Required**: R2 access only works in the Cloudflare Workers runtime
2. **Local Testing**: Use `npm run preview` (not `npm run dev`) to test R2 locally
3. **Error Handling**: Always check if bucket binding exists before operations
4. **Binary Data**: R2 supports both text and binary data (ArrayBuffer, Uint8Array)

## Troubleshooting

### Common Issues

1. **"R2 bucket binding not found"**

   - Ensure you're running with `npm run preview` (not `npm run dev`)
   - Check wrangler.toml has correct bucket configuration

2. **"Account ID not found"**

   - Set `CLOUDFLARE_ACCOUNT_ID` environment variable
   - Or add `account_id` to wrangler.toml

3. **"Bucket already exists"**
   - This is fine - the bucket is already created
   - Use `wrangler r2 bucket list` to verify

## Security Considerations

- Never expose R2 operations directly to users
- Always validate and sanitize object keys
- Implement proper access controls in API routes
- Use appropriate content types for stored data
