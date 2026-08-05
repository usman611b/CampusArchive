# CampusArchive: Backend Architecture Specification
**Runtime & Framework:** Node.js v20 + Express + TypeScript

---

## 1. Modular Architecture Overview

```text
backend/
├── src/
│   ├── config/              # Environment variables, database & S3 clients
│   ├── middleware/          # authGuard, rbacGuard, errorHandler, rateLimiter
│   ├── modules/
│   │   ├── academics/       # Departments, Programs, Semesters, Courses
│   │   ├── auth/            # Registration, Login, Token Refresh, Password Reset
│   │   ├── resources/       # Upload Intent, Submission, Details, Downloads
│   │   ├── community/       # Bookmarks, Ratings, Threaded Comments
│   │   ├── search/          # Faceted Multi-Field Search Engine
│   │   ├── dashboard/       # Continue Studying, Activity Feed, Telemetry
│   │   └── admin/           # Pending Moderation Queue, Approvals, System Audit
│   ├── repositories/        # Database access layer (PostgreSQL SQL queries)
│   ├── services/            # Core business logic layer
│   ├── utils/               # ApiError, ApiResponse, Logger
│   └── server.ts            # Express server initialization
```

---

## 2. Design Patterns & Principles

- **Controller-Service-Repository Pattern:** Strict separation between HTTP handling (Controllers), business logic (Services), and database execution (Repositories).
- **Direct-to-Cloud Upload Pipeline:** Generation of secure, short-lived S3 / Supabase pre-signed upload URLs.
- **Fail-Safe Validation:** Request body, parameter, and query validation via Zod schemas prior to reaching service handlers.
