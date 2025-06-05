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

To test R2 locally with wrangler:

```bash
npm run preview
```

This runs the application with Cloudflare Workers runtime and R2 bindings.

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

GhostPaste will use the following R2 object structure:

```
metadata/{gistId}.json    # Unencrypted metadata
blobs/{gistId}.bin       # Encrypted binary data
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
