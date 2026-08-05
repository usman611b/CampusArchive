# CampusArchive: REST API Specification
**Version:** v1.0.0  
**Base URL:** `/api/v1`

---

## 1. Authentication Endpoints (`/api/v1/auth`)

- `POST /auth/register` — Register a new student account (`.edu` domain restriction).
- `POST /auth/login` — Authenticate user and issue Access Token + HttpOnly Refresh Token cookie.
- `POST /auth/refresh` — Issue a new short-lived Access Token.
- `POST /auth/logout` — Revoke active session tokens.

---

## 2. Academics & Course Hub Endpoints (`/api/v1/academics` & `/api/v1/courses`)

- `GET /academics/departments` — List academic departments.
- `GET /academics/departments/:deptSlug/programs` — List degree programs under a department.
- `GET /academics/programs/:progSlug/semesters/:semNum/courses` — List courses for a specific semester.
- `GET /courses/:courseId` — Get Course Hub details, statistics, and instructor info.
- `GET /courses/:courseId/resources?category=:catSlug` — Fetch resources within a Course Hub section.

---

## 3. Upload & Resource Endpoints (`/api/v1/resources`)

- `POST /resources/upload-intent` — Step 6: Validate file metadata and return S3 Pre-Signed Upload URL.
- `POST /resources/submit` — Step 7: Create resource record with `status = PENDING`.
- `GET /resources/:resourceId` — Fetch resource details and comment tree.
- `POST /resources/:resourceId/download` — Increment download counter and return signed download URL.
- `POST /resources/:resourceId/bookmark` — Toggle bookmark state.
- `POST /resources/:resourceId/rate` — Submit 1-5 star quality rating.

---

## 4. Admin & Moderation Endpoints (`/api/v1/admin`)

- `GET /admin/pending-approvals` — Triage queue of student submissions awaiting review.
- `PATCH /admin/resources/:resourceId/approve` — Approve resource for Course Hub indexing.
- `PATCH /admin/resources/:resourceId/reject` — Reject resource with specific feedback.
