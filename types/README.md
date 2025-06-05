# Types Directory

This directory contains TypeScript type definitions and interfaces used throughout the application.

## Structure

```
types/
├── index.ts         # Main export file for all types
└── [type files will be added here]
```

## Planned Type Definitions (to be implemented)

### Data Models

- `GistMetadata` - Metadata stored in R2 (unencrypted)
- `EncryptedData` - Structure of encrypted blob data
- `UserMetadata` - User-related metadata

### API Types

- `APIResponse` - Standardized API response format
- `APIError` - Error response structure
- Request/Response types for each endpoint

### Application Types

- `File` - Individual file in a gist
- `GistOptions` - Creation options (expiry, PIN, etc.)
- `BinaryFormat` - Binary encoding format structure

## Conventions

- Use `interface` for object shapes
- Use `type` for unions, aliases, and complex types
- Export all types from `index.ts` for easy imports
- Prefix enum values with the enum name
- Document complex types with JSDoc comments
- Avoid using `any` - use `unknown` if type is truly unknown

## Example Import

```typescript
import { GistMetadata, APIResponse } from "@/types";
```
