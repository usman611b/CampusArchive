# CampusArchive: Production REST API Specification
**Enterprise API Design Document & Interface Specification v1.0.0**
**Author:** Principal API Architect & Senior Backend Engineer
**Date:** August 2026
**Target Environment:** Single Node.js/Express Server on AWS EC2 Free Tier + Supabase Backend

---

## Table of Contents
1. [API Overview](#1-api-overview)
2. [Authentication & Authorization Architecture](#2-authentication--authorization-architecture)
3. [Standard Response Format & Pagination Standard](#3-standard-response-format--pagination-standard)
4. [Error Handling & HTTP Status Codes](#4-error-handling--http-status-codes)
5. [Complete API Endpoint Catalog](#5-complete-api-endpoint-catalog)
   - [5.1 Authentication APIs](#51-authentication-apis)
   - [5.2 Universities APIs](#52-universities-apis)
   - [5.3 Departments APIs](#53-departments-apis)
   - [5.4 Programs APIs](#54-programs-apis)
   - [5.5 Courses APIs](#55-courses-apis)
   - [5.6 Categories APIs](#56-categories-apis)
   - [5.7 Tags APIs](#57-tags-apis)
   - [5.8 Resources APIs](#58-resources-apis)
   - [5.9 File APIs](#59-file-apis)
   - [5.10 Bookmark APIs](#510-bookmark-apis)
   - [5.11 Rating APIs](#511-rating-apis)
   - [5.12 Comments APIs](#512-comments-apis)
   - [5.13 Notification APIs](#513-notification-apis)
   - [5.14 Profile & Gamification APIs](#514-profile--gamification-apis)
   - [5.15 Leaderboard APIs](#515-leaderboard-apis)
   - [5.16 Analytics APIs](#516-analytics-apis)
   - [5.17 Admin & Moderation APIs](#517-admin--moderation-apis)
   - [5.18 Report APIs](#518-report-apis)
   - [5.19 Search APIs](#519-search-apis)
6. [Request & Response Examples](#6-request--response-examples)
7. [Request Validation Rules (Zod Schemas)](#7-request-validation-rules-zod-schemas)
8. [File Upload Architecture (Direct-to-Supabase Storage)](#8-file-upload-architecture-direct-to-supabase-storage)
9. [Security Infrastructure](#9-security-infrastructure)
10. [API Folder Structure & Architecture](#10-api-folder-structure--architecture)
11. [API Versioning Strategy](#11-api-versioning-strategy)
12. [API Testing & Documentation Strategy](#12-api-testing--documentation-strategy)
13. [EC2 Free-Tier Performance Optimization](#13-ec2-free-tier-performance-optimization)
14. [Future AI API Specifications (Design Only)](#14-future-ai-api-specifications-design-only)

---

# 1. API Overview

### 1.1 Architectural Style
The CampusArchive API is designed following strict **RESTful (Representational State Transfer)** principles over HTTPS:
* **Resource-Oriented Endpoints:** URLs identify entities using plural nouns (e.g., `/api/v1/resources`, `/api/v1/courses`).
* **Standard HTTP Verbs:** Explicit utilization of `GET` (read), `POST` (create), `PUT` (full update), `PATCH` (partial update), and `DELETE` (removal).
* **Stateless Execution:** Every request carries full authentication context in HTTP headers (`Authorization: Bearer <JWT>`). No server-side session memory is held on the Express instance.

### 1.2 Versioning Strategy
* **URL Path Versioning:** All public endpoints carry an explicit version prefix: `/api/v1/...`.
* **Deprecation Policy:** Future breaking changes will introduce `/api/v2/...` while maintaining `/api/v1/...` for a minimum 6-month deprecation window.

### 1.3 JSON & Naming Standards
* **Encoding:** All request payload bodies and response data are serialized in UTF-8 JSON (`Content-Type: application/json`).
* **Property Naming:** `camelCase` format for JSON payload keys (e.g., `academicYear`, `downloadCount`).
* **Timestamp Standard:** ISO 8601 UTC string format (e.g., `2026-08-03T20:30:00.000Z`).
* **UUID Format:** All entity identifiers follow RFC 4122 standard UUIDv4 strings.

---

# 2. Authentication & Authorization Architecture

The API leverages **Supabase Authentication** backed by JSON Web Tokens (JWT).

### 2.1 Authentication Flow
1. User logs in via `POST /api/v1/auth/login`.
2. Supabase Auth generates a signed JWT Access Token (1-hour validity) and Refresh Token (7-day validity).
3. Client includes the JWT Access Token in all protected requests:
   ```http
   Authorization: Bearer <jwt_access_token>
   ```
4. Express `authGuard` middleware validates token signature against Supabase JWT secret and extracts claims (`sub` = userId, `role`, `university_id`).

### 2.2 Role-Based Access Control (RBAC)
Middleware enforces role hierarchies (`GUEST`, `STUDENT`, `MODERATOR`, `ADMINISTRATOR`):
* `requireAuth`: Guarantees valid JWT session.
* `requireRole('MODERATOR')`: Asserts user has Moderator or Administrator role.
* `requireAdmin`: Asserts user has Administrator privileges.

---

# 3. Standard Response Format & Pagination Standard

To ensure client contract predictability, **100% of API endpoints return a unified JSON response envelope**.

### 3.1 Success Response Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 3.2 Error Response Envelope
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid institutional .edu email address."
    }
  ],
  "statusCode": 422
}
```

### 3.3 Pagination, Filtering & Sorting Standard

#### Standard Query Parameters
* `page`: Integer (Default: `1`)
* `limit`: Integer (Default: `20`, Max: `100`)
* `sortBy`: String (Default: `createdAt`)
* `sortOrder`: String (`asc` | `desc`, Default: `desc`)
* `search`: String (Keyword query string)

---

# 4. Error Handling & HTTP Status Codes

| Status Code | Status Text | Trigger Condition |
| :--- | :--- | :--- |
| **200** | `OK` | Successful GET, PUT, PATCH, or DELETE operation. |
| **201** | `Created` | Successful POST creation of a new entity. |
| **204** | `No Content` | Successful request with intentionally empty response body. |
| **400** | `Bad Request` | Malformed JSON request body or missing required path params. |
| **401** | `Unauthorized` | Missing, expired, or invalid JWT access token in header. |
| **403** | `Forbidden` | User authenticated but lacks necessary role/permission scope. |
| **404** | `Not Found` | Requested entity UUID or endpoint route does not exist. |
| **409** | `Conflict` | Resource conflict (e.g., duplicate email registration, duplicate rating). |
| **422** | `Unprocessable Entity` | Request payload failed Zod schema validation rules. |
| **429** | `Too Many Requests` | User or IP exceeded sliding-window rate limit caps. |
| **500** | `Internal Server Error` | Unexpected backend crash or unhandled system exception. |

---

# 5. Complete API Endpoint Catalog

### 5.1 Authentication APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new student account with university `.edu` domain |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user credentials & issue JWT tokens |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revoke session & invalidate tokens |
| `POST` | `/api/v1/auth/forgot-password` | Public | Trigger password reset verification email |
| `POST` | `/api/v1/auth/reset-password` | Public | Submit new password with reset token |
| `POST` | `/api/v1/auth/verify-email` | Public | Confirm account email verification token |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch current authenticated user profile & permissions |
| `PATCH`| `/api/v1/auth/update-profile` | Authenticated | Update user profile bio, full name, or semester |
| `POST` | `/api/v1/auth/upload-avatar` | Authenticated | Acquire S3 pre-signed upload URL for user avatar photo |
| `DELETE`|`/api/v1/auth/account` | Authenticated | Request self-service account deletion (soft delete) |

---

### 5.2 Universities APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/universities` | Public | List all onboarding active universities |
| `GET` | `/api/v1/universities/:id` | Public | Fetch specific university metadata & departments |
| `POST` | `/api/v1/universities` | Admin | Create a new university institution tenant |
| `PATCH`| `/api/v1/universities/:id` | Admin | Update university settings, logo, or domain |
| `DELETE`|`/api/v1/universities/:id` | Admin | Soft-delete a university tenant |

---

### 5.3 Departments APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/departments` | Public | List departments (filterable by `universityId`) |
| `GET` | `/api/v1/departments/:id` | Public | Fetch department details & active course counts |
| `POST` | `/api/v1/departments` | Admin/Mod | Add a new academic department |
| `PATCH`| `/api/v1/departments/:id` | Admin/Mod | Update department details |
| `DELETE`|`/api/v1/departments/:id` | Admin | Remove a department entry |

---

### 5.4 Programs APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/programs` | Public | List degree programs (filterable by `departmentId`) |
| `GET` | `/api/v1/programs/:id` | Public | Fetch degree program details |
| `POST` | `/api/v1/programs` | Admin/Mod | Create degree program (e.g., BSCS, MBA) |
| `PATCH`| `/api/v1/programs/:id` | Admin/Mod | Update degree program |
| `DELETE`|`/api/v1/programs/:id` | Admin | Delete degree program |

---

### 5.5 Courses APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/courses` | Public | List course catalog (filters: `departmentId`, `code`) |
| `GET` | `/api/v1/courses/:id` | Public | Fetch course details & associated resources count |
| `POST` | `/api/v1/courses` | Admin/Mod | Add a new course catalog entry |
| `PATCH`| `/api/v1/courses/:id` | Admin/Mod | Update course code, title, or credit hours |
| `DELETE`|`/api/v1/courses/:id` | Admin | Delete course entry |

---

### 5.6 Categories APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/categories` | Public | List resource categories (Exams, Notes, Labs) |
| `GET` | `/api/v1/categories/:id` | Public | Fetch specific category detail |
| `POST` | `/api/v1/categories` | Admin | Create category taxonomy entry |
| `PATCH`| `/api/v1/categories/:id` | Admin | Update category details |
| `DELETE`|`/api/v1/categories/:id` | Admin | Remove category |

---

### 5.7 Tags APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/tags` | Public | List popular tags with usage counts |
| `GET` | `/api/v1/tags/:slug` | Public | Fetch resources linked to a tag slug |
| `POST` | `/api/v1/tags` | Authenticated | Create a new tag entry |
| `DELETE`|`/api/v1/tags/:id` | Admin/Mod | Remove inappropriate tag |

---

### 5.8 Resources APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/resources` | Public | List approved resources with filtering & sorting |
| `GET` | `/api/v1/resources/search` | Public | Search resources by keyword query string |
| `GET` | `/api/v1/resources/:id` | Public | Get resource metadata & file attachments |
| `POST` | `/api/v1/resources` | Authenticated | Initialize resource submission & get upload pre-signed URL |
| `PATCH`| `/api/v1/resources/:id` | Authenticated | Edit resource title, description, or tags |
| `DELETE`|`/api/v1/resources/:id` | Authenticated | Soft-delete own uploaded resource |
| `POST` | `/api/v1/resources/:id/publish`| Authenticated | Submit unapproved draft resource for review |
| `POST` | `/api/v1/resources/:id/archive`| Admin/Mod | Archive legacy resource |
| `POST` | `/api/v1/resources/:id/approve`| Admin/Mod | Approve pending resource submission |
| `POST` | `/api/v1/resources/:id/reject` | Admin/Mod | Reject resource submission with reason string |
| `GET` | `/api/v1/resources/:id/download`| Authenticated | Get signed CloudFront/S3 download link & track count |
| `POST` | `/api/v1/resources/:id/view` | Public | Increment resource view count telemetry |

---

### 5.9 File APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/files/upload-url` | Authenticated | Acquire S3 pre-signed upload URL for document attachment |
| `POST` | `/api/v1/files/complete` | Authenticated | Confirm S3 binary upload completion & attach to resource |
| `DELETE`|`/api/v1/files/:id` | Authenticated | Delete a specific file attachment |
| `PUT` | `/api/v1/files/:id/replace` | Authenticated | Request pre-signed URL to replace file attachment |
| `GET` | `/api/v1/files/resource/:resourceId` | Public | List all file attachments bound to a resource |

---

### 5.10 Bookmark APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/bookmarks` | Authenticated | List current user saved resource bookmarks |
| `POST` | `/api/v1/bookmarks` | Authenticated | Save resource to user bookmarks collection |
| `DELETE`|`/api/v1/bookmarks/:resourceId`| Authenticated | Remove resource from user bookmarks |

---

### 5.11 Rating APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/resources/:id/ratings` | Authenticated | Submit 1-5 star rating and review text |
| `PATCH`| `/api/v1/ratings/:id` | Authenticated | Update user's rating or review text |
| `DELETE`|`/api/v1/ratings/:id` | Authenticated | Remove rating review |

---

### 5.12 Comments APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/resources/:id/comments` | Public | Fetch threaded comment tree for a resource |
| `POST` | `/api/v1/resources/:id/comments` | Authenticated | Add top-level comment (supports LaTeX math text) |
| `POST` | `/api/v1/comments/:id/replies` | Authenticated | Add nested reply to a comment |
| `PATCH`| `/api/v1/comments/:id` | Authenticated | Edit comment content |
| `DELETE`|`/api/v1/comments/:id` | Authenticated | Soft-delete comment |
| `POST` | `/api/v1/comments/:id/like` | Authenticated | Toggle upvote like on comment |

---

### 5.13 Notification APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | Authenticated | Get user in-app notifications inbox |
| `PATCH`| `/api/v1/notifications/:id/read`| Authenticated | Mark single notification as read |
| `PATCH`| `/api/v1/notifications/read-all`| Authenticated | Mark all inbox notifications as read |
| `DELETE`|`/api/v1/notifications/:id` | Authenticated | Delete a notification item |

---

### 5.14 Profile & Gamification APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/profiles/me` | Authenticated | Fetch current user full profile & stats |
| `GET` | `/api/v1/profiles/:userId` | Public | Fetch public user profile, karma score & badges |
| `GET` | `/api/v1/profiles/:userId/achievements` | Public | List achievements earned by a user |

---

### 5.15 Leaderboard APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/leaderboards/top-contributors` | Public | Fetch top student contributors by karma points |
| `GET` | `/api/v1/leaderboards/most-downloads` | Public | Fetch users with highest resource download counts |
| `GET` | `/api/v1/leaderboards/most-uploads` | Public | Fetch top uploading contributors |

---

### 5.16 Analytics APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/dashboard` | Admin/Mod | Get platform overview statistics (DAU, uploads) |
| `GET` | `/api/v1/analytics/popular-courses` | Public | Fetch courses with highest active student engagement |
| `GET` | `/api/v1/analytics/trending-resources` | Public | Get resources computed via trending velocity formula |

---

### 5.17 Admin & Moderation APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/moderation/queue` | Admin/Mod | Fetch pending resource submissions queue |
| `GET` | `/api/v1/admin/users` | Admin | List system users with role/verification filters |
| `PATCH`| `/api/v1/admin/users/:id/role` | Admin | Elevate user role (STUDENT -> MODERATOR) |
| `POST` | `/api/v1/admin/users/:id/ban` | Admin | Ban/suspend abusive user account |
| `POST` | `/api/v1/admin/announcements` | Admin | Broadcast system-wide announcement |

---

### 5.18 Report APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/reports/resources/:id` | Authenticated | Report inappropriate resource or DMCA violation |
| `POST` | `/api/v1/reports/comments/:id` | Authenticated | Flag abusive or offensive comment |
| `GET` | `/api/v1/reports` | Admin/Mod | Fetch reports triage queue |
| `PATCH`| `/api/v1/reports/:id/resolve` | Admin/Mod | Resolve flag (Dismiss or Action Taken) |

---

### 5.19 Search APIs

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/search` | Public | Execute keyword full-text search with facets |
| `GET` | `/api/v1/search/autocomplete` | Public | Get instant live search autocomplete suggestions |
| `GET` | `/api/v1/search/recent` | Authenticated | Get user recent search query history |

---

# 6. Request & Response Examples

### 6.1 User Registration (`POST /api/v1/auth/register`)

#### Request Body
```json
{
  "email": "alex.smith@mit.edu",
  "password": "SecurePassword123!",
  "fullName": "Alex Smith",
  "universityId": "123e4567-e89b-12d3-a456-426614174000",
  "departmentId": "223e4567-e89b-12d3-a456-426614174001",
  "programId": "323e4567-e89b-12d3-a456-426614174002"
}
```

#### Success Response (`HTTP 201 Created`)
```json
{
  "success": true,
  "message": "Registration successful. Verification email sent.",
  "data": {
    "user": {
      "id": "987e6543-e89b-12d3-a456-426614174999",
      "email": "alex.smith@mit.edu",
      "fullName": "Alex Smith",
      "role": "STUDENT",
      "verificationStatus": "PENDING_VERIFICATION",
      "createdAt": "2026-08-03T20:30:00.000Z"
    }
  }
}
```

---

### 6.2 Pre-Signed File Upload Acquisition (`POST /api/v1/files/upload-url`)

#### Request Body
```json
{
  "fileName": "CS101_Midterm_Exam_2025.pdf",
  "fileSizeBytes": 4521048,
  "mimeType": "application/pdf",
  "resourceType": "EXAM_MIDTERM"
}
```

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "message": "S3 Pre-signed URL generated successfully.",
  "data": {
    "uploadUrl": "https://campusarchive-documents.s3.amazonaws.com/quarantine/univ_mit/987e6543.pdf?AWSAccessKeyId=AKIAIOSFODNN7EXAMPLE&Expires=1700000000&Signature=vj2OHAY",
    "fileKey": "quarantine/univ_mit/987e6543.pdf",
    "expiresInSeconds": 900
  }
}
```

---

### 6.3 Resource Multi-Facet Search (`GET /api/v1/resources?search=midterm&departmentId=223e...&page=1&limit=2`)

#### Success Response (`HTTP 200 OK`)
```json
{
  "success": true,
  "message": "Resources retrieved successfully.",
  "data": [
    {
      "id": "777e4567-e89b-12d3-a456-426614174777",
      "title": "CS101 Introduction to CS Midterm Solution",
      "instructorName": "Dr. Alan Turing",
      "academicYear": 2025,
      "termName": "FALL",
      "downloadCount": 342,
      "ratingAvg": 4.85,
      "ratingCount": 42,
      "uploader": {
        "id": "987e6543-e89b-12d3-a456-426614174999",
        "fullName": "Alex Smith"
      },
      "createdAt": "2026-08-01T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 2,
    "total": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

# 7. Request Validation Rules (Zod Schemas)

Every API request payload is strictly validated before touching controller business logic using **Zod** middleware:

```typescript
// Zod Validation Schemas Specification

import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email().refine(val => val.endsWith('.edu') || val.endsWith('.ac.uk'), {
    message: 'Registration requires a valid institutional university email address.'
  }),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  fullName: z.string().min(2).max(100),
  universityId: z.string().uuid(),
  departmentId: z.string().uuid().optional(),
  programId: z.string().uuid().optional()
});

export const CreateResourceSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().max(2000).optional(),
  courseId: z.string().uuid(),
  categoryId: z.string().uuid(),
  instructorName: z.string().max(150).optional(),
  academicYear: z.number().int().min(2000).max(2100),
  termName: z.enum(['FALL', 'SPRING', 'SUMMER']),
  visibility: z.enum(['PUBLIC', 'UNIVERSITY_ONLY', 'DEPARTMENT_ONLY']).default('PUBLIC'),
  tags: z.array(z.string().min(2).max(30)).max(10).optional()
});
```

---

# 8. File Upload Architecture (Direct-to-Supabase Storage)

To maintain maximum performance under **AWS EC2 Free Tier (`t2.micro` / `t3.micro` - 1GB RAM)** bounds, file binaries **NEVER stream through the Node.js server memory**.

```
+--------+            +-------------------+            +------------------+            +------------------+
| Client |            | Express API (EC2) |            | Supabase Storage |            | Postgres DB      |
+---+----+            +---------+---------+            +--------+---------+            +--------+---------+
    |                           |                               |                               |
    | 1. POST /files/upload-url |                               |                               |
    |-------------------------->|                               |                               |
    |                           | 2. Validate Size & MIME       |                               |
    |                           | 3. Ask Supabase for Signed URL|                               |
    |                           |------------------------------>|                               |
    |                           | 4. Return Pre-Signed URL      |                               |
    | 5. Return Upload Pre-Signed URL                       |<------------------------------|                               |
    |<--------------------------|                               |                               |
    |                                                           |                               |
    | 6. Direct Binary Upload (PUT Request)                     |                               |
    |---------------------------------------------------------->|                               |
    | 7. HTTP 200 OK (Upload Success)                           |                               |
    |<----------------------------------------------------------|                               |
    |                                                                                           |
    | 8. POST /files/complete (Payload: S3 Key & Resource Metadata)                             |
    |------------------------------------------------------------------------------------------>|
    |                                                                                           | 9. Save Metadata
    | 10. HTTP 201 Created                                                                      | (Status: PENDING)
    |<------------------------------------------------------------------------------------------|
```

### 8.1 File Upload Limits & Constraints
* **Max File Size:** 50 MB per attachment file.
* **Allowed MIME Types:** `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`), `application/vnd.openxmlformats-officedocument.presentationml.presentation` (`.pptx`), `application/zip`, `image/jpeg`, `image/png`, `image/webp`.

---

# 9. Security Infrastructure

1. **Helmet HTTP Header Protections:** Automatically configured via Express `helmet()` enforcing strict HSTS (2 years), X-Content-Type-Options, X-Frame-Options DENY, and XSS Protection.
2. **CORS Configuration:** Configured using standard Express `cors()` allowing origins matching white-listed university frontend domains only.
3. **Sliding-Window Rate Limiting (`express-rate-limit`):**
   * Global API Routes: 100 requests per 15 minutes per IP.
   * Authentication Endpoints (`/api/v1/auth/*`): 5 requests per 15 minutes per IP.
4. **Input Sanitization:** Strips HTML/script injections from comments and text fields via `sanitize-html`.

---

# 10. API Folder Structure & Architecture

Production Clean Architecture directory structure for the Node.js / Express backend:

```
backend/
├── src/
│   ├── config/               # Supabase Client, Env Variables
│   │   ├── env.ts
│   │   └── supabase.ts
│   ├── constants/            # Error Codes, HTTP Statuses
│   │   └── httpStatus.ts
│   ├── controllers/          # HTTP Controllers (Thin Request Handler Layer)
│   │   ├── auth.controller.ts
│   │   ├── resource.controller.ts
│   │   ├── search.controller.ts
│   │   └── admin.controller.ts
│   ├── middlewares/          # Express Middleware Stack
│   │   ├── authGuard.ts
│   │   ├── rbacGuard.ts
│   │   ├── rateLimiter.ts
│   │   ├── validate.ts
│   │   └── errorHandler.ts
│   ├── repositories/         # Database Access Layer (Supabase Queries)
│   │   ├── user.repository.ts
│   │   ├── resource.repository.ts
│   │   └── course.repository.ts
│   ├── routes/               # Express Route Definitions (/api/v1/...)
│   │   ├── auth.routes.ts
│   │   ├── resource.routes.ts
│   │   ├── course.routes.ts
│   │   └── index.ts
│   ├── services/             # Core Business Logic Layer
│   │   ├── auth.service.ts
│   │   ├── resource.service.ts
│   │   └── search.service.ts
│   ├── utils/                # Response Helpers, Logger (Pino)
│   │   ├── apiResponse.ts
│   │   └── logger.ts
│   ├── validators/           # Zod Validation Schemas
│   │   ├── auth.validator.ts
│   │   └── resource.validator.ts
│   ├── app.ts                # Express Setup & Middleware Mounts
│   └── server.ts             # HTTP Listener Entry Point
├── package.json
└── tsconfig.json
```

---

# 11. API Versioning Strategy

* **Version Path:** All current APIs exist under `/api/v1`.
* **Evolution Rules:** Non-breaking additions (e.g., new response fields, optional query parameters) are added directly to `/api/v1`. Breaking changes (e.g., removing fields, changing authentication schemes) trigger a version bump to `/api/v2`.

---

# 12. API Testing & Documentation Strategy

1. **Swagger / OpenAPI 3.0 Specs:** Generated automatically using `swagger-jsdoc` and served interactively via `/api/docs` route.
2. **Postman Collection:** Exported OpenAPI json specification importable directly into Postman for automated API testing.
3. **Integration Testing Stack:** Automated API integration tests authored using **Jest** and **Supertest** executing against a Supabase local development container.

---

# 13. EC2 Free-Tier Performance Optimization

To maintain sub-150ms response times on a single AWS EC2 `t2.micro` / `t3.micro` instance:
* **Gzip & Brotli Compression:** Nginx handles static file and JSON payload compression at reverse-proxy layer.
* **In-Memory Taxonomy Caching:** University, department, and category catalog lists cached in Node.js server memory using a 24-hour LRU cache (`node-cache`), eliminating repetitive database lookups for static metadata.
* **Streamlined DB Connections:** Connection count tuned via Supabase pool manager to max 20 connections.

---

# 14. Future AI API Specifications (Design Only)

Architectural design specs for future Phase 3 AI extension endpoints.

### 14.1 AI Natural Language Search (`POST /api/v1/ai/search`)
* **Purpose:** Vector semantic search powered by `pgvector` cosine similarity.
* **Request:** `{ "prompt": "Find calculus practice midterms with step by step integration solutions" }`
* **Response:** Returns ranked list of relevant document chunk matches with similarity score.

### 14.2 AI PDF Document Summarizer (`POST /api/v1/ai/summarize/:resourceId`)
* **Purpose:** Generates 3-bullet executive summaries of uploaded documents.

### 14.3 AI Chat With Notes (`POST /api/v1/ai/chat/:resourceId`)
* **Purpose:** Contextual Q&A interactive chat session against document text chunk embeddings.

### 14.4 AI Duplicate Detection (`POST /api/v1/ai/detect-duplicates`)
* **Purpose:** Checks newly uploaded file against database embeddings and perceptual hashes to flag duplicate uploads.

---
**End of REST API Specification Document**
