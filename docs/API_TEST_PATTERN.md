# API Test File Naming Pattern

## Overview

To maintain consistency and improve organization, API test files follow a specific naming pattern based on the HTTP methods they test.

## Naming Convention

### For routes with multiple HTTP methods

When a route file (`route.ts`) contains multiple HTTP methods (GET, POST, PUT, DELETE, etc.), split the tests into separate files:

```
route.{method}.test.ts
```

Examples:

- `route.get.test.ts` - Tests for GET endpoint
- `route.post.test.ts` - Tests for POST endpoint
- `route.put.test.ts` - Tests for PUT endpoint
- `route.delete.test.ts` - Tests for DELETE endpoint
- `route.options.test.ts` - Tests for OPTIONS endpoint (CORS)

### For routes with a single HTTP method

When a route file only contains one HTTP method, use the standard naming:

```
route.test.ts
```

## Current Structure

```
app/api/
├── gists/
│   ├── route.ts                  (POST, OPTIONS)
│   ├── route.post.test.ts        (Tests POST)
│   ├── route.options.test.ts     (Tests OPTIONS)
│   └── [id]/
│       ├── route.ts              (GET, PUT, DELETE, OPTIONS)
│       ├── route.get.test.ts
│       ├── route.put.test.ts
│       ├── route.delete.test.ts
│       └── route.options.test.ts
└── blobs/
    └── [id]/
        ├── route.ts              (GET, OPTIONS)
        ├── route.get.test.ts     (Tests GET)
        └── route.options.test.ts (Tests OPTIONS)
```

## Benefits

1. **Better Organization**: Large test files are split into manageable chunks
2. **Easier Navigation**: Developers can quickly find tests for specific endpoints
3. **Clearer Intent**: File names immediately indicate which HTTP method is being tested
4. **Parallel Development**: Multiple developers can work on different endpoint tests without conflicts

## Guidelines

1. Each test file should only import and test the specific HTTP method it's named after
2. Shared test utilities and mocks can be extracted to a common file if needed
3. Keep test files focused on their specific HTTP method
4. Include all relevant test cases: success paths, error handling, validation, etc.

## Migration

When refactoring existing tests:

1. Check if the route file has multiple HTTP methods
2. If yes, split `route.test.ts` into separate files by method
3. Ensure all tests still pass after splitting
4. Remove the original combined test file

Last Updated: 2025-06-07
