# Phase 5: API Development - Issue Tracking

## Overview

Phase 5 focuses on implementing the API layer for GhostPaste, including R2 storage integration, RESTful endpoints, and security middleware. This phase is critical for enabling the core functionality of creating, reading, updating, and deleting encrypted gists.

## Issue Breakdown

### Storage Layer (2 issues)

| GitHub # | Component             | Priority | Status      | Description                          |
| -------- | --------------------- | -------- | ----------- | ------------------------------------ |
| #103     | R2 Storage Foundation | CRITICAL | 🟢 Complete | R2 client wrapper and configuration  |
| #104     | Storage Operations    | CRITICAL | 🟢 Complete | Metadata and blob storage operations |

### API Endpoints (3 issues)

| GitHub # | Component          | Priority | Status      | Description                                  |
| -------- | ------------------ | -------- | ----------- | -------------------------------------------- |
| #105     | Create Gist API    | CRITICAL | 🟢 Complete | POST /api/gists endpoint                     |
| #106     | Read Gist APIs     | CRITICAL | 🟡 Ready    | GET endpoints for metadata and blobs         |
| #107     | Update/Delete APIs | HIGH     | 🟡 Ready    | PUT and DELETE endpoints with PIN validation |

### Infrastructure (2 issues)

| GitHub # | Component         | Priority | Status   | Description                              |
| -------- | ----------------- | -------- | -------- | ---------------------------------------- |
| #108     | API Middleware    | HIGH     | 🟡 Ready | Validation, error handling, and security |
| #109     | API Documentation | MEDIUM   | 🟡 Ready | OpenAPI docs and integration tests       |

## Detailed Issue Specifications

### Issue 1: R2 Storage Foundation

**Priority:** CRITICAL  
**Estimated Time:** 3-4 days  
**Dependencies:** None

**Tasks:**

- [ ] Create R2 client wrapper using Cloudflare Workers R2 bindings
- [ ] Configure R2 bucket binding in wrangler.toml
- [ ] Create type-safe wrapper for R2 operations
- [ ] Handle R2 errors (R2Error, R2ObjectNotFound)
- [ ] Write unit tests for R2 client wrapper
- [ ] Document R2 configuration requirements

**Acceptance Criteria:**

- R2 client can be imported and used in API routes
- Type-safe operations for put, get, delete, list
- Proper error handling with custom error types
- Configuration works in both dev and production

### Issue 2: Storage Operations

**Priority:** CRITICAL  
**Estimated Time:** 2-3 days  
**Dependencies:** Issue 1

**Tasks:**

- [ ] Implement metadata upload/download (JSON) using R2 API
- [ ] Implement blob upload/download (binary) using R2 API
- [ ] Implement streaming for large files
- [ ] Add retry logic for transient failures
- [ ] Create storage utility functions
- [ ] Write integration tests with miniflare

**Acceptance Criteria:**

- Can store and retrieve JSON metadata
- Can store and retrieve binary blobs
- Streaming works for files up to 5MB
- Handles network errors gracefully

### Issue 3: Create Gist API

**Priority:** CRITICAL  
**Estimated Time:** 3-4 days  
**Dependencies:** Issue 2

**Tasks:**

- [ ] Create POST /api/gists endpoint
- [ ] Implement multipart form data parsing (Workers-compatible)
- [ ] Add request size validation (Workers limit: 100MB)
- [ ] Validate input data structure
- [ ] Store metadata in R2 with proper key structure
- [ ] Store encrypted blob in R2
- [ ] Return gist ID and share URL

**Acceptance Criteria:**

- Endpoint accepts encrypted gist data
- Validates all required fields
- Enforces size limits (500KB/file, 5MB total)
- Returns 201 with gist ID on success
- Handles errors with appropriate status codes

### Issue 4: Read Gist APIs

**Priority:** CRITICAL  
**Estimated Time:** 2-3 days  
**Dependencies:** Issue 2

**Tasks:**

- [ ] Create GET /api/gists/[id] for metadata
- [ ] Create GET /api/blobs/[id] for encrypted data
- [ ] Configure edge runtime for all routes
- [ ] Add caching headers for blobs
- [ ] Handle 404 for missing gists
- [ ] Implement one-time view deletion

**Acceptance Criteria:**

- Can retrieve gist metadata by ID
- Can retrieve encrypted blob by ID
- Returns 404 for non-existent gists
- One-time view gists are deleted after access
- Appropriate cache headers are set

### Issue 5: Update/Delete APIs

**Priority:** HIGH  
**Estimated Time:** 3-4 days  
**Dependencies:** Issues 3 & 4

**Tasks:**

- [ ] Create PUT /api/gists/[id] endpoint
- [ ] Create DELETE /api/gists/[id] endpoint
- [ ] Implement PIN validation for both endpoints
- [ ] Ensure atomic operations (metadata + blob)
- [ ] Handle version conflicts
- [ ] Add audit logging

**Acceptance Criteria:**

- Can update gist with correct PIN
- Can delete gist with correct PIN
- Returns 401 for incorrect PIN
- Operations are atomic (all or nothing)
- Proper cleanup of both metadata and blob

### Issue 6: API Middleware & Security

**Priority:** HIGH  
**Estimated Time:** 3-4 days  
**Dependencies:** Can start with Issue 3

**Tasks:**

- [ ] Create input validation middleware
- [ ] Create error handling middleware
- [ ] Implement Cloudflare rate limiting rules
- [ ] Configure CORS for production domain
- [ ] Add request timeout handling (50ms CPU limit)
- [ ] Implement security headers

**Acceptance Criteria:**

- All inputs are validated before processing
- Errors return consistent JSON format
- Rate limiting prevents abuse
- CORS allows only specified origins
- CPU-intensive operations are optimized

### Issue 7: API Documentation & Testing

**Priority:** MEDIUM  
**Estimated Time:** 2-3 days  
**Dependencies:** All other issues for completion

**Tasks:**

- [ ] Create OpenAPI/Swagger specification
- [ ] Document all endpoints and schemas
- [ ] Create API integration test suite
- [ ] Add example requests and responses
- [ ] Document R2 setup and configuration
- [ ] Create API client examples

**Acceptance Criteria:**

- Complete OpenAPI specification
- All endpoints have integration tests
- Documentation includes examples
- Setup guide for R2 configuration
- Tests run in CI pipeline

## Implementation Order

### Week 1: Foundation (Issues 1-2)

Start with R2 storage foundation as it blocks all other work. These issues can be worked on sequentially by one developer or in parallel if Issue 2 developer starts with interfaces and tests.

### Week 2: Core APIs (Issues 3-4)

Implement the create and read endpoints. These can be developed in parallel by different developers once storage layer is ready.

### Week 3: Complete CRUD & Security (Issues 5-6)

Round out the API with update/delete operations and security middleware. Issue 6 can start earlier in parallel.

### Week 4: Documentation & Polish (Issue 7)

Complete API documentation and ensure comprehensive test coverage.

## Priority Summary

- **CRITICAL** (4): Issues 1, 2, 3, 4 - Core functionality
- **HIGH** (2): Issues 5, 6 - Security and complete CRUD
- **MEDIUM** (1): Issue 7 - Documentation and testing

## Success Metrics

- All API endpoints return responses within 50ms
- Zero data loss during storage operations
- 100% test coverage for critical paths
- API documentation is complete and accurate
- Rate limiting effectively prevents abuse

## Notes

1. **R2 Configuration**: Ensure R2 bucket is created in Cloudflare dashboard before starting
2. **Edge Runtime**: All routes must use `export const runtime = 'edge'`
3. **Security**: PIN validation is critical for edit/delete operations
4. **Performance**: Watch for CPU time limits in Workers environment
5. **Testing**: Use miniflare for local R2 testing

## Quick Commands

```bash
# Create all Phase 5 issues
gh issue create --title "feat: implement R2 storage foundation" --body "See PHASE_5_ISSUE_TRACKING.md for details" --label "api,priority: critical" --project "👻 GhostPaste"

# View Phase 5 issues
gh issue list --label "api" --state open

# Start work on an issue
gh issue edit [number] --add-label "in progress"
```

## Completed Work

### Issue #103: R2 Storage Foundation ✅

- Implemented type-safe R2 client wrapper with singleton pattern
- Added full versioning support following SPEC.md design
- Created comprehensive error handling with custom error types
- Implemented all core operations: put, get, delete, list, exists
- Added version management methods: listVersions, pruneVersions
- Achieved 100% test coverage
- Updated documentation with usage examples

**Key Changes:**

- All blobs now stored as `versions/{id}/{timestamp}.bin`
- Metadata tracks `current_version` timestamp
- No separate `blobs/` directory - everything is versioned
- Automatic pruning of old versions (keep last 50)

## Completed Work

### Issue #104: Storage Operations ✅

- Implemented comprehensive retry logic with exponential backoff for transient failures
- Created storage operation helpers for common patterns (create, update, get, delete)
- Added helper functions for size validation, expiry dates, and formatting
- Implemented cleanup operations for expired gists and one-time view handling
- Created integration test framework ready for API endpoints
- Achieved 100% test coverage for all storage operations

**Key Implementation Details:**

- **Retry Logic**: Exponential backoff for network/timeout errors, no retry for 4xx client errors
- **Storage Operations**: createGist, updateGist, getGist, deleteIfNeeded, cleanupExpiredGists
- **Helper Functions**: Size validation (500KB/file, 5MB total), expiry calculations, formatting
- **Version Management**: Full versioning support with pruning (keep last 50)
- **Binary Operations**: Encoding/decoding files to/from binary format
- **Integration Ready**: Framework prepared for testing API endpoints once implemented

### Issue #105: Create Gist API ✅

- Implemented POST /api/gists endpoint with multipart/form-data parsing
- Added Zod validation for metadata fields
- Integrated PBKDF2-SHA256 password hashing with salt
- Added comprehensive error handling using AppError system
- Implemented size validation against configured limits
- Created full test suite with 100% coverage (12 passing tests)
- Properly handles CORS with OPTIONS endpoint

**Key Implementation Details:**

- Uses native FormData API for multipart parsing (Edge compatible)
- Stores edit PIN hash and salt separately in metadata
- Returns 201 Created with Location header
- Validates datetime formats and numeric fields
- Handles all error cases with appropriate status codes

## Next Steps

### Immediate Priority: Issue #106 - Read Gist APIs (CRITICAL)

With the Create API complete, we need the Read endpoints to retrieve gists:

### Recommended Timeline

**Week 1 (Complete):**

- ✅ Issue #103: R2 Storage Foundation (COMPLETE)
- ✅ Issue #104: Storage Operations (COMPLETE)

**Week 2 (In Progress):**

- ✅ Issue #105: Create Gist API (COMPLETE)
- Issue #106: Read Gist APIs (2-3 days) - Next priority

**Week 3:**

- Issue #107: Update/Delete APIs (3-4 days)
- Issue #108: API Middleware & Security (3-4 days) - can start earlier

**Week 4:**

- Issue #109: API Documentation & Testing (2-3 days)
- Integration testing and bug fixes

Last Updated: 2025-06-07
