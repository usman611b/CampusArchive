# CampusArchive: Backend Architecture Specification
**Production Node.js & Express Engineering Specification v1.0.0**
**Author:** Senior Backend Architect
**Date:** August 2026
**Target Deployment:** Single Express Server on AWS EC2 Free Tier + Supabase Backend

---

## Table of Contents
1. [Backend Architecture & Request Flow](#1-backend-architecture--request-flow)
2. [Enterprise Folder Structure](#2-enterprise-folder-structure)
3. [Layer Responsibilities & Separation of Concerns](#3-layer-responsibilities--separation-of-concerns)
4. [Middleware Architecture](#4-middleware-architecture)
5. [Core Domain Modules](#5-core-domain-modules)
6. [Security Architecture](#6-security-architecture)
7. [Error Handling & Logging Strategy](#7-error-handling--logging-strategy)
8. [File Upload Architecture (EC2 Free-Tier Optimized)](#8-file-upload-architecture-ec2-free-tier-optimized)
9. [Performance Optimization (Single EC2 Instance)](#9-performance-optimization-single-ec2-instance)
10. [Future-Ready AI Extension Architecture](#10-future-ready-ai-extension-architecture)

---

# 1. Backend Architecture & Request Flow

### 1.1 Architectural Pattern: Clean Layered Monolith
The backend of CampusArchive adopts a **Stateless Layered Monolith** pattern operating as a single Express.js application deployed on a single **AWS EC2 Free Tier (`t2.micro` / `t3.micro`)** instance behind Nginx and PM2.

```
+---------------------------------------------------------------------------------------------------+
|                                        CLIENT REQUEST LAYER                                       |
|                       (React SPA / Mobile Web Client / Public Browsers)                            |
+---------------------------------------------------|-----------------------------------------------+
                                                    | HTTPS / REST
                                                    v
+---------------------------------------------------------------------------------------------------+
|                                  EC2 REVERSE PROXY TIER (Nginx)                                   |
|   - SSL / TLS 1.3 Termination (Let's Encrypt Certbot)                                             |
|   - Static Gzip / Brotli Payload Compression                                                      |
|   - Edge IP Rate Limiting                                                                         |
+---------------------------------------------------|-----------------------------------------------+
                                                    | HTTP (Port 4000)
                                                    v
+---------------------------------------------------------------------------------------------------+
|                               EXPRESS APPLICATION LAYER (PM2 Cluster)                             |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | MIDDLEWARE PIPELINE: Helmet -> CORS -> RateLimiter -> AuthGuard -> RBAC -> ZodValidator    |  |
|  +----------------------------------------------+----------------------------------------------+  |
|                                                 |                                                 |
|                                                 v                                                 |
|  +---------------------------------------------------------------------------------------------+  |
|  | CONTROLLER LAYER: Extracts HTTP inputs, delegates to Service, formats JSON response         |  |
|  +----------------------------------------------+----------------------------------------------+  |
|                                                 |                                                 |
|                                                 v                                                 |
|  +---------------------------------------------------------------------------------------------+  |
|  | SERVICE LAYER: Core Business Rules, Transactions, In-Memory LRU Cache, Domain Events        |  |
|  +----------------------------------------------+----------------------------------------------+  |
|                                                 |                                                 |
|                                                 v                                                 |
|  +---------------------------------------------------------------------------------------------+  |
|  | REPOSITORY LAYER: Data Access Abstraction executing SQL queries via Supabase JS Client       |  |
|  +----------------------------------------------+----------------------------------------------+  |
+-------------------------------------------------|-----------------------------------------------+
                                                  | SQL / Storage SDK
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                     DATA PERSISTENCE LAYER                                        |
|  +------------------------------+  +---------------------------+  +-----------------------------+ |
|  | Supabase PostgreSQL Primary  |  | Supabase Auth Subsystem   |  | Supabase Object Storage     | |
|  | (Entities, Metadata, FTS)    |  | (JWT Validation, Session) |  | (PDFs, Images, Avatars)     | |
|  +------------------------------+  +---------------------------+  +-----------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 1.2 End-to-End Request Execution Lifecycle
1. **Ingress:** Client HTTP request arrives at Nginx reverse proxy on port 443. Nginx handles SSL termination and passes request to `http://127.0.0.1:4000`.
2. **Security & Guard Interceptors:**
   * `helmet()` enforces HTTP security headers.
   * `cors()` checks origin whitelist.
   * `rateLimiter` checks client IP sliding-window request limits.
   * `authGuard` verifies JWT signature via Supabase Auth secret and populates `req.user`.
   * `rbacGuard` verifies user permissions for restricted routes.
3. **Input Validation:** `validate(ZodSchema)` parses request body, query parameters, and URL path variables. If invalid, throws `ValidationError` (HTTP 422).
4. **Controller Execution:** Controller receives clean typed data, delegates business logic execution to the corresponding Service method.
5. **Business Logic Execution:** Service processes domain rules, checks in-memory `node-cache` for static data, and calls Repository methods.
6. **Data Access:** Repository executes parameterized queries via Supabase JS Client (`@supabase/supabase-js`).
7. **Response Formatting:** Controller wraps output in standard JSON success envelope (`{ success: true, data }`) and returns HTTP 200/201.
8. **Centralized Error Handling:** Any thrown error automatically bubbles up to `errorHandler` middleware returning standard JSON error envelope (`{ success: false, message, errors, statusCode }`).

---

# 2. Enterprise Folder Structure

```
backend/
├── src/
│   ├── config/                   # Global Environment & Client Configuration
│   │   ├── env.config.ts         # Dotenv parsing & Zod env schema validation
│   │   ├── supabase.config.ts    # Supabase Client Singleton
│   │   └── logger.config.ts      # Pino Logger Configuration
│   ├── constants/                # Project Constants & Enums
│   │   ├── errorCodes.ts         # Business Error Code Enums
│   │   ├── httpStatuses.ts       # HTTP Status Code Mapping
│   │   └── roles.ts              # Role & Permission Definitions
│   ├── controllers/              # Request Handlers (Thin Layer)
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── resource.controller.ts
│   │   ├── course.controller.ts
│   │   ├── department.controller.ts
│   │   ├── category.controller.ts
│   │   ├── bookmark.controller.ts
│   │   ├── comment.controller.ts
│   │   ├── rating.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── admin.controller.ts
│   │   └── analytics.controller.ts
│   ├── docs/                     # OpenAPI / Swagger Documentation Specs
│   │   └── openapi.json
│   ├── middlewares/              # Express Interceptor Middleware
│   │   ├── authGuard.middleware.ts
│   │   ├── rbacGuard.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── upload.middleware.ts
│   ├── repositories/             # Data Access Abstraction Layer (Supabase Queries)
│   │   ├── user.repository.ts
│   │   ├── resource.repository.ts
│   │   ├── course.repository.ts
│   │   ├── department.repository.ts
│   │   ├── comment.repository.ts
│   │   └── analytics.repository.ts
│   ├── routes/                   # Route Registry Definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── resource.routes.ts
│   │   ├── course.routes.ts
│   │   ├── department.routes.ts
│   │   ├── category.routes.ts
│   │   ├── bookmark.routes.ts
│   │   ├── comment.routes.ts
│   │   ├── rating.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── index.ts              # Master Router aggregator (/api/v1)
│   ├── services/                 # Business Logic & Orchestration Layer
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── resource.service.ts
│   │   ├── course.service.ts
│   │   ├── department.service.ts
│   │   ├── comment.service.ts
│   │   ├── rating.service.ts
│   │   ├── cache.service.ts      # In-Memory LRU Cache Service (node-cache)
│   │   └── analytics.service.ts
│   ├── types/                    # Shared TypeScript Interface Definitions
│   │   ├── express.d.ts          # Express Request Context Extensions
│   │   ├── auth.types.ts
│   │   └── resource.types.ts
│   ├── utils/                    # Common Utility Functions
│   │   ├── apiResponse.ts        # Standardized Success / Error Envelopes
│   │   ├── customErrors.ts       # Domain Error Class Hierarchy
│   │   └── formatters.ts
│   ├── validators/               # Zod Validation Schemas
│   │   ├── auth.validator.ts
│   │   ├── resource.validator.ts
│   │   └── course.validator.ts
│   ├── app.ts                    # Express Application Setup & Middleware Pipeline
│   └── server.ts                 # Server Entry Point & Process Listener
├── ecosystem.config.js           # PM2 Production Topology Config
├── package.json
└── tsconfig.json
```

---

# 3. Layer Responsibilities & Separation of Concerns

To guarantee maintainability, strict separation of concerns is enforced across layers:

| Architectural Layer | Core Responsibility | Input | Output | Allowed Dependencies | Prohibited Actions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Routes** | URL endpoint mapping & middleware chaining | HTTP Request URL | Router Delegate | Express `Router`, Controllers, Middlewares | NO business logic, NO DB queries |
| **Middlewares** | Cross-cutting request processing & security guards | Express `req`, `res`, `next` | Modified `req` or Next Error | Auth Utilities, Zod, Logger | NO direct SQL queries |
| **Validators** | Schema validation & sanitization | Raw `req.body`, `req.query`, `req.params` | Validated Typed Object | Zod library | NO DB lookups, NO business rules |
| **Controllers** | HTTP Request extraction & Response formatting | Express `req`, `res` | JSON Response Envelope | Services, Response Utilities | NO SQL queries, NO business logic |
| **Services** | Core business logic, cache checks, orchestration | Validated DTO Objects | Domain Entities / DTOs | Repositories, Cache Service | NO Express `req`/`res` objects |
| **Repositories**| Database access layer & SQL query execution | Domain Query Params | Raw Database Records | Supabase Client Singleton | NO HTTP logic, NO validation logic |
| **Configuration** | Environment loading & SDK client singletons | `.env` variables | Config Singletons | `dotenv`, Zod | NO request state |

---

# 4. Middleware Architecture

```
Incoming Request 
   │
   ├──> 1. Helmet Middleware (Inject Security Headers)
   ├──> 2. CORS Middleware (Origin Whitelist Check)
   ├──> 3. Logger Middleware (Assign Correlation ID & Log HTTP Request)
   ├──> 4. Rate Limiter Middleware (Check IP Sliding Window Request Count)
   ├──> 5. Auth Guard Middleware (Verify JWT Bearer Token -> Populate req.user)
   ├──> 6. RBAC Guard Middleware (Verify User Role Scope Permissions)
   ├──> 7. Validation Middleware (Zod Schema Validation for Body/Query/Params)
   │
   └──> Target Controller Handler -> Throws Error? ──> 8. Global Error Handler
```

### 4.1 Detailed Middleware Specification
1. **`helmet`:** Enforces HSTS (2 years), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and CSP.
2. **`cors`:** Restricts API access exclusively to whitelisted frontend origin URLs.
3. **`logger`:** Assigns unique `X-Request-ID` UUID to every request via Pino HTTP logger.
4. **`rateLimiter`:** Enforces sliding-window limits using `express-rate-limit`:
   * Global routes: 100 requests per 15 minutes per IP.
   * Auth routes (`/api/v1/auth/*`): 5 requests per 15 minutes per IP.
5. **`authGuard`:** Extracts `Authorization: Bearer <jwt>`, validates signature using Supabase JWT Secret, and attaches decoded session payload (`userId`, `email`, `role`, `universityId`) to `req.user`.
6. **`rbacGuard(allowedRoles)`:** Checks if `req.user.role` matches specified endpoint permissions.
7. **`validate(ZodSchema)`:** Validates inputs and strips unknown fields before handing execution to controllers.
8. **`errorHandler`:** Centralized catch-all error handling middleware that captures uncaught exceptions and domain errors.

---

# 5. Core Domain Modules

The application logic is partitioned into **12 decoupled domain modules**:

1. **Auth Module:** User registration, credential authentication, JWT token issuance, email verification, password resets, and session revocation.
2. **Users Module:** User profile management, avatar uploads, karma point tracking, and user account soft-deletion.
3. **Resources Module:** Resource metadata lifecycle (create, update, publish, archive, approve, reject), S3 upload URL acquisition, and download/view counter updates.
4. **Courses Module:** Course taxonomy catalog management (course codes, credit hours, department binding).
5. **Departments Module:** Academic department setup and program linkages.
6. **Categories Module:** Taxonomy classification tags (Exams, Lecture Notes, Syllabi, Lab Reports).
7. **Bookmarks Module:** Personal saved collection libraries.
8. **Comments Module:** Threaded Q&A discussion trees supporting LaTeX math string content and upvoting.
9. **Ratings Module:** 1 to 5 star quality reviews with Bayesian mean aggregations.
10. **Notifications Module:** In-app alert inbox for status updates, comment replies, and announcements.
11. **Admin Module:** Content review triage queue, user role promotions, user suspensions, and administrative announcement broadcasts.
12. **Analytics Module:** Dashboard operational telemetry metrics tracking DAU, daily uploads, download bandwidth, and trending resource scoring calculations.

---

# 6. Security Architecture

1. **JWT Signature Enforcement:** All protected routes assert valid RSA-256 / HS256 signed JWT tokens issued by Supabase Auth.
2. **Role-Based Access Control (RBAC):** Middleware guarantees `STUDENT`, `MODERATOR`, and `ADMINISTRATOR` privilege boundaries.
3. **Zod Input Sanitization:** Strict Zod schema validation strips extra parameters, enforcing strong type casting.
4. **Direct-to-Storage Upload Security:** Files are uploaded directly to Supabase Storage via short-lived (15-minute) Pre-Signed PUT URLs. Express validates file extension, MIME type, and size limits before issuing upload keys.
5. **SQL Injection Prevention:** 100% of database interactions execute via parameterized queries using the Supabase Client / PostgreSQL prepared statements.
6. **XSS (Cross-Site Scripting) Mitigation:** User text input fields (comments, descriptions) are sanitized using `sanitize-html` to strip executable JavaScript.
7. **Environment Variable Integrity:** Environment variables validated on server startup using Zod schema (`env.config.ts`); server refuses to boot if mandatory secrets are missing.

---

# 7. Error Handling & Logging Strategy

### 7.1 Custom Domain Error Hierarchy (`customErrors.ts`)

```typescript
// Base Domain Application Error
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any[];

  constructor(message: string, statusCode: number, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') { super(message, 400); }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') { super(message, 401); }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden action') { super(message, 403); }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') { super(message, 404); }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') { super(message, 409); }
}

export class ValidationError extends AppError {
  constructor(errors: any[], message = 'Validation failed') { 
    super(message, 422, errors); 
  }
}
```

### 7.2 Global Error Handler Middleware Specification
* Catches instances of `AppError` and returns standard JSON payload:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [{ "field": "email", "message": "Invalid email domain" }],
    "statusCode": 422
  }
  ```
* Unhandled runtime exceptions (500) log complete stack trace to Pino logger and return generic message (`Internal Server Error`) in production to prevent internal implementation leakage.

---

# 8. File Upload Architecture (EC2 Free-Tier Optimized)

To prevent Node.js event-loop blockage and memory exhaustion on **AWS EC2 Free Tier (`t2.micro` - 1GB RAM)**, file binaries **never stream through Express server memory**.

```
+--------+                 +-------------------+                 +------------------+                 +---------------+
| Client |                 | Express API (EC2) |                 | Supabase Storage |                 | PostgreSQL DB |
+---+----+                 +---------+---------+                 +--------+---------+                 +-------+-------+
    |                                 |                                   |                                   |
    | 1. Request Upload Pre-Signed URL|                                   |                                   |
    |    (FileName, Size, MIME)       |                                   |                                   |
    |-------------------------------->|                                   |                                   |
    |                                 | 2. Validate Size (<50MB) & MIME   |                                   |
    |                                 | 3. Generate S3 Pre-Signed PUT URL |                                   |
    | 4. Return Pre-Signed Upload URL |<----------------------------------|                                   |
    |<--------------------------------|                                   |                                   |
    |                                                                     |                                   |
    | 5. Direct Binary Upload Stream (HTTP PUT)                           |                                   |
    |-------------------------------------------------------------------->|                                   |
    | 6. HTTP 200 OK (S3 ETag)                                            |                                   |
    |<--------------------------------------------------------------------|                                   |
    |                                                                     |                                   |
    | 7. Complete Upload POST /files/complete                             |                                   |
    |    (Storage Path, Resource Metadata)                                |                                   |
    |-------------------------------------------------------------------------------------------------------->|
    |                                                                                                         | 8. Persist Metadata
    | 9. HTTP 201 Created                                                                                     |    (Status: PENDING)
    |<--------------------------------------------------------------------------------------------------------|
```

### 8.1 Upload Lifecycle Operations
* **Validation:** Server verifies file size (max 50MB) and extension whitelist (`.pdf`, `.docx`, `.pptx`, `.zip`, `.png`, `.jpg`).
* **Storage:** Files land in Supabase Storage `/documents/quarantine/{university_id}/{uuid}.pdf`.
* **Download:** Downloads execute via short-lived (5-minute) signed URLs or CloudFront distribution link while atomically incrementing database `download_count`.
* **Replace / Delete:** Replacing or soft-deleting a resource updates database state and issues background deletion calls to clean up object keys in storage.

---

# 9. Performance Optimization (Single EC2 Instance)

1. **In-Memory Taxonomy Caching (`node-cache`):** Universities, departments, programs, and category listings are cached in server memory with a 24-hour TTL:
   ```typescript
   // In-Memory Cache Service Blueprint
   import NodeCache from 'node-cache';
   export const memoryCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });
   ```
2. **Nginx Payload Compression:** Nginx compresses all static assets and API JSON responses using Gzip / Brotli before transmission.
3. **Database Connection Streamlining:** Supabase client uses connection pooling (PgBouncer in Transaction mode) restricting active connections to max 20, keeping memory usage minimal.
4. **Cursor-Based Pagination:** High-volume endpoints support cursor pagination (`created_at`, `id`) to maintain constant-time $O(1)$ query performance over large datasets.

---

# 10. Future-Ready AI Extension Architecture

The backend architecture incorporates a dedicated **AI Service Subsystem Slot** (`/src/services/ai.service.ts` and `/src/controllers/ai.controller.ts`) so upcoming Phase 3 AI capabilities can be plugged in without refactoring core code.

```
src/
├── controllers/
│   └── ai.controller.ts          # AI API Endpoints (Semantic Search, Summarization, QA Chat)
├── services/
│   └── ai.service.ts             # Orchestrates LLM APIs & Vector Embedding queries
├── repositories/
│   └── ai.repository.ts          # Executes pgvector HNSW distance queries (<=>)
└── routes/
    └── ai.routes.ts              # Mounts /api/v1/ai/...
```

### 10.1 AI Service Extension Capabilities
1. **Vector Semantic Search:** Query prompts are embedded and sent to `ai.repository.ts` to execute cosine similarity matches against `ai_embeddings` using PostgreSQL `pgvector`.
2. **PDF Summarization:** Background workers trigger `ai.service.ts` to summarize uploaded document text layers into 3-bullet points via LLM APIs.
3. **Interactive Study Assistant:** Contextual Q&A chat endpoint manages document session memory.
4. **Duplicate Upload Detector:** Computes perceptual hash and vector distance to flag potential re-uploads.

---
**End of Backend Architecture Specification**
