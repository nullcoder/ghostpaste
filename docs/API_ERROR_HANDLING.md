# API Error Handling Best Practices

This document outlines the best practices for handling errors in GhostPaste API routes.

## Overview

We use a consistent error handling approach across all API routes:

1. **Internal Errors**: Use `AppError` class from `@/types/errors`
2. **API Responses**: Convert to `ApiErrorResponse` format using utilities from `@/lib/api-errors`
3. **Error Codes**: Use standardized `ErrorCode` enum for consistency

## Error Flow

```typescript
// 1. Throw AppError internally
throw ApiErrors.badRequest("Invalid input");

// 2. Catch and convert to API response
return errorResponse(error);

// 3. Client receives standardized format
{
  "error": "BAD_REQUEST",
  "message": "Invalid input",
  "details": { ... }
}
```

## Example Implementation

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, ApiErrors, validationError } from "@/lib/api-errors";
import type { CreateGistResponse } from "@/types/api";

// Define validation schema
const requestSchema = z.object({
  name: z.string().min(1),
  value: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten();
      return errorResponse(
        validationError("Invalid request data", errors.fieldErrors)
      );
    }

    // Business logic that might throw errors
    if (someCondition) {
      throw ApiErrors.forbidden("Access denied");
    }

    // Success response
    return NextResponse.json<CreateGistResponse>(data, { status: 201 });
  } catch (error) {
    // AppError instances are handled with their status codes
    if (error instanceof AppError) {
      return errorResponse(error);
    }

    // Unexpected errors are logged and return 500
    console.error("Unexpected error:", error);
    return errorResponse(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}
```

## Common Error Patterns

### 1. Validation Errors (422)

```typescript
// Zod validation
const validation = schema.safeParse(data);
if (!validation.success) {
  return errorResponse(
    validationError("Invalid data", validation.error.flatten().fieldErrors)
  );
}

// Manual validation
if (!isValidFormat(data)) {
  throw ApiErrors.unprocessableEntity("Invalid format", {
    field: "data",
    expected: "valid-format",
  });
}
```

### 2. Authentication Errors (401)

```typescript
if (!isAuthenticated) {
  throw ApiErrors.unauthorized("Authentication required");
}
```

### 3. Authorization Errors (403)

```typescript
if (!hasPermission) {
  throw ApiErrors.forbidden("Insufficient permissions");
}
```

### 4. Not Found Errors (404)

```typescript
const resource = await getResource(id);
if (!resource) {
  throw ApiErrors.notFound("Gist");
}
```

### 5. Size Limit Errors (413)

```typescript
if (data.length > MAX_SIZE) {
  throw ApiErrors.payloadTooLarge(
    `Size exceeds ${MAX_SIZE / 1024 / 1024}MB limit`
  );
}
```

### 6. Storage Errors (500)

```typescript
try {
  await storage.save(data);
} catch (error) {
  throw ApiErrors.storageError("Failed to save data", {
    retry: true,
    operation: "save",
  });
}
```

## Error Response Format

All API errors follow this structure:

```typescript
interface ApiErrorResponse {
  error: string; // ErrorCode enum value
  message: string; // Human-readable message
  details?: Record<string, any>; // Optional additional context
}
```

## Testing Error Handling

```typescript
import { ErrorCode } from "@/types/errors";

// Use type guards for type-safe testing
function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    "message" in data
  );
}

// Test example
it("should handle validation errors", async () => {
  const response = await POST(invalidRequest);
  const data = await response.json();

  expect(response.status).toBe(422);
  expect(isApiErrorResponse(data)).toBe(true);
  if (isApiErrorResponse(data)) {
    expect(data.error).toBe(ErrorCode.UNPROCESSABLE_ENTITY);
    expect(data.message).toBe("Invalid data");
    expect(data.details?.fieldErrors).toBeDefined();
  }
});
```

## Benefits

1. **Consistency**: All errors follow the same format
2. **Type Safety**: TypeScript ensures correct error handling
3. **Maintainability**: Centralized error creation and formatting
4. **Testing**: Easy to test with type guards
5. **Debugging**: Clear error codes and messages

## Migration Guide

To update existing routes:

1. Replace manual error responses with `errorResponse()`
2. Use `ApiErrors` helpers for common cases
3. Update tests to check for `ErrorCode` values
4. Remove any type casting in favor of type guards
