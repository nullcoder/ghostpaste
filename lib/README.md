# Lib Directory

This directory contains utility functions, business logic, and service modules.

## Structure

```
lib/
├── config.ts        # Configuration management
├── constants.ts     # Application constants and limits
├── feature-flags.ts # Feature flag system
├── utils.ts         # General utility functions (cn, etc.)
├── config.test.ts   # Configuration tests
├── constants.test.ts # Constants tests
└── [future modules will be added here]
```

## Implemented Modules

### Configuration (`config.ts`)

- Type-safe access to Cloudflare environment variables
- Feature flags based on available services
- Environment detection (development/production)
- Application URL helpers

### Constants (`constants.ts`)

- File size limits (500KB/file, 5MB/gist, 20 files)
- Expiry durations for gists
- HTTP status codes
- Validation helpers for files, PINs, and expiry options
- Binary format constants
- Cache control headers

### Feature Flags (`feature-flags.ts`)

- Advanced feature flag system with gradual rollout
- Percentage-based feature rollouts
- User-specific feature targeting
- Runtime feature toggling without deployments

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
