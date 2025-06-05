# Lib Directory

This directory contains utility functions, business logic, and service modules.

## Structure

```
lib/
├── utils.ts         # General utility functions (cn, etc.)
└── [future modules will be added here]
```

## Planned Modules (to be implemented)

### Core Modules

- `crypto.ts` - Encryption/decryption utilities using Web Crypto API
- `storage.ts` - Cloudflare R2 storage client wrapper
- `binary.ts` - Binary format encoding/decoding for file storage
- `auth.ts` - PIN hashing and validation

### Utilities

- `logger.ts` - Structured logging utility
- `errors.ts` - Custom error classes and handling
- `validation.ts` - Input validation helpers
- `constants.ts` - Application constants and limits

## Conventions

- All modules must be edge runtime compatible (no Node.js APIs)
- Use Web Crypto API for cryptographic operations
- Export functions and constants as named exports
- Write pure functions where possible
- Include comprehensive error handling
- Add JSDoc comments for public APIs

## Edge Runtime Compatibility

All code in this directory must work in Cloudflare Workers:

- No `fs`, `path`, or other Node.js modules
- Use Web APIs (fetch, crypto, etc.)
- Keep bundle sizes small
- Consider CPU time limits (50ms)
- Handle streaming for large data
