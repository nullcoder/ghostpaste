# Integration Tests

This directory contains example integration tests and will house real integration tests once the API endpoints are implemented.

## Current Status

**Integration tests are not yet runnable** because they require API endpoints to be implemented first (Issues #105-107).

## What's Here

- `storage-operations.example.ts` - Example tests showing how storage operations should work
- This serves as documentation for future integration tests

## Future Integration Tests

Once API endpoints are implemented, real integration tests will:

1. **Start wrangler dev server** - Run the actual Cloudflare Workers environment
2. **Make HTTP requests** - Test API endpoints like `POST /api/gists`, `GET /api/gists/[id]`
3. **Verify end-to-end flow** - Test complete workflows from creation to retrieval
4. **Use real R2 storage** - Ensure actual R2 operations work correctly

## Planned Test Structure

```bash
lib/integration/
├── api-endpoints.integration.test.ts    # Test API endpoints
├── gist-lifecycle.integration.test.ts   # Test complete gist workflows
├── expiry-cleanup.integration.test.ts   # Test scheduled cleanup
└── performance.integration.test.ts      # Test with large files
```

## Running Tests (When Ready)

```bash
# This will work once API endpoints are implemented:
npm run test:integration

# Which will:
# 1. Start wrangler dev in background
# 2. Wait for server to be ready
# 3. Run integration tests against live API
# 4. Clean up wrangler dev process
```

## Current Testing

For now, use unit tests which provide excellent coverage:

```bash
# Test storage operations
npm run test lib/storage-operations.test.ts

# Test all units
npm run test
```
