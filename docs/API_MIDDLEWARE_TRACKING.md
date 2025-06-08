# API Middleware Implementation Tracking

**Issue**: #108 - feat: implement API middleware and security  
**Created**: 2025-01-07  
**Last Updated**: 2025-01-07  
**Status**: Planning

## Overview

This document tracks the implementation of comprehensive middleware for the GhostPaste API, including input validation, error handling, rate limiting, CORS configuration, and security headers.

## Architecture Overview

```
lib/
  middleware/
    index.ts          # Main middleware composer
    validation.ts     # Input validation middleware
    security.ts       # Security headers & CSRF protection
    rate-limit.ts     # Rate limiting with Cloudflare KV
    cors.ts          # CORS configuration
    timeout.ts       # Request timeout handling
    error-handler.ts # Error handling wrapper
    types.ts         # TypeScript types for middleware
    utils.ts         # Shared utilities
    __tests__/       # Test files for each middleware
```

## Implementation Phases

### Phase 1: Core Infrastructure (Priority: High)

- [ ] Create middleware composition system
- [ ] Define middleware types and interfaces
- [ ] Create base middleware utilities
- [ ] Set up test infrastructure

### Phase 2: Security Middleware (Priority: High)

- [ ] Enhance security headers middleware
- [ ] Improve CSRF protection
- [ ] Add request sanitization
- [ ] Implement Content-Security-Policy

### Phase 3: Validation Middleware (Priority: High)

- [ ] Create schema-based validation middleware
- [ ] Add input sanitization
- [ ] Implement size limit checks
- [ ] Add multipart form validation

### Phase 4: Performance Middleware (Priority: High)

- [ ] Implement request timeout handling (50ms limit)
- [ ] Add CPU time monitoring
- [ ] Create abort mechanisms
- [ ] Add performance logging

### Phase 5: Rate Limiting (Priority: Medium)

- [ ] Set up Cloudflare KV namespace
- [ ] Implement sliding window rate limiter
- [ ] Add per-endpoint rate limits
- [ ] Create rate limit headers

### Phase 6: CORS Enhancement (Priority: Medium)

- [ ] Configure production CORS settings
- [ ] Add per-route CORS options
- [ ] Optimize preflight handling
- [ ] Add proper Vary headers

### Phase 7: Integration (Priority: High)

- [ ] Update all API routes to use middleware
- [ ] Migrate existing validation logic
- [ ] Remove duplicate security code
- [ ] Update documentation

## Detailed Task Breakdown

### 1. Middleware Composition System

**File**: `lib/middleware/index.ts`

```typescript
export interface MiddlewareOptions {
  validation?: ZodSchema;
  rateLimit?: RateLimitConfig;
  requireCSRF?: boolean;
  cors?: CorsConfig;
  timeout?: number;
}

export function withMiddleware(
  handler: NextRouteHandler,
  options: MiddlewareOptions
): NextRouteHandler;
```

**Tasks**:

- [ ] Create type definitions
- [ ] Implement middleware chaining
- [ ] Add error propagation
- [ ] Create tests

### 2. Input Validation Middleware

**File**: `lib/middleware/validation.ts`

**Features**:

- Schema validation using Zod
- Input sanitization (XSS prevention)
- Size limit enforcement
- Content-Type validation
- Multipart form handling

**Tasks**:

- [ ] Create validation middleware
- [ ] Add sanitization utilities
- [ ] Implement size checks
- [ ] Handle multipart data
- [ ] Create comprehensive tests

### 3. Security Headers Middleware

**File**: `lib/middleware/security.ts`

**Headers to implement**:

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy

**Tasks**:

- [ ] Define security header configurations
- [ ] Create header injection middleware
- [ ] Add CSRF validation integration
- [ ] Implement origin validation
- [ ] Write security tests

### 4. Rate Limiting Implementation

**File**: `lib/middleware/rate-limit.ts`

**Configuration**:

```typescript
interface RateLimitConfig {
  requests: number; // Max requests
  window: number; // Time window in seconds
  keyGenerator?: (req: NextRequest) => string;
}
```

**Default Limits**:

- POST /api/gists: 10 req/min
- PUT /api/gists/[id]: 20 req/min
- DELETE /api/gists/[id]: 20 req/min
- GET endpoints: 100 req/min

**Tasks**:

- [ ] Configure Cloudflare KV namespace
- [ ] Implement sliding window algorithm
- [ ] Add rate limit headers (X-RateLimit-\*)
- [ ] Create key generation strategies
- [ ] Handle distributed rate limiting
- [ ] Add bypass mechanisms for testing

### 5. Request Timeout Handling

**File**: `lib/middleware/timeout.ts`

**Requirements**:

- Monitor CPU time usage
- Abort before 50ms limit
- Clean up resources
- Return timeout errors

**Tasks**:

- [ ] Implement timeout wrapper
- [ ] Add CPU time monitoring
- [ ] Create abort controllers
- [ ] Handle cleanup logic
- [ ] Add timeout tests

### 6. CORS Configuration

**File**: `lib/middleware/cors.ts`

**Configuration**:

- Allowed origins: ghostpaste.dev, localhost (dev only)
- Allowed methods: Per endpoint
- Allowed headers: Content-Type, X-Requested-With, X-Edit-Password
- Max age: 86400 seconds

**Tasks**:

- [ ] Create CORS middleware
- [ ] Add per-route configuration
- [ ] Optimize preflight responses
- [ ] Add origin validation
- [ ] Implement Vary headers

### 7. Error Handler Enhancement

**File**: `lib/middleware/error-handler.ts`

**Features**:

- Catch all unhandled errors
- Sanitize error messages
- Log with context
- Return consistent format

**Tasks**:

- [ ] Create error wrapper middleware
- [ ] Add error sanitization
- [ ] Implement logging integration
- [ ] Handle async errors
- [ ] Create error tests

## Testing Strategy

### Unit Tests

- Test each middleware in isolation
- Mock dependencies (KV, logger, etc.)
- Test error scenarios
- Verify header injection
- Check validation logic

### Integration Tests

- Test middleware composition
- Verify middleware order
- Test real API endpoints
- Check error propagation
- Validate rate limiting

### Performance Tests

- Measure middleware overhead
- Test timeout handling
- Verify 50ms CPU limit
- Check memory usage
- Profile hot paths

## Migration Plan

1. **Phase 1**: Implement core middleware without breaking changes
2. **Phase 2**: Add middleware to new endpoints first
3. **Phase 3**: Gradually migrate existing endpoints
4. **Phase 4**: Remove old validation/security code
5. **Phase 5**: Update documentation and examples

## Success Criteria

- [ ] All API endpoints use consistent middleware
- [ ] Input validation prevents malformed requests
- [ ] Rate limiting prevents abuse
- [ ] Security headers score A+ on securityheaders.com
- [ ] All requests complete within 50ms CPU time
- [ ] 100% test coverage for middleware
- [ ] No breaking changes to API contracts
- [ ] Performance overhead < 5ms per request

## Dependencies

### Cloudflare KV Setup

```toml
# wrangler.toml
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR_KV_NAMESPACE_ID"
```

### Environment Variables

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_BYPASS_TOKEN=xxx  # For testing
CSP_REPORT_URI=https://...  # For CSP violations
```

## Open Questions

1. Should we implement rate limiting per IP or per session?
2. Do we need different rate limits for authenticated requests?
3. Should CSP be in report-only mode initially?
4. How should we handle rate limit data persistence?
5. Do we need request/response logging middleware?

## References

- [Cloudflare Workers Security Headers](https://developers.cloudflare.com/workers/examples/security-headers)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/)

## Notes

- All middleware must be edge-runtime compatible
- Avoid heavy computations to stay within 50ms CPU limit
- Use streaming where possible for large payloads
- Consider caching for frequently accessed data
- Monitor performance impact in production
