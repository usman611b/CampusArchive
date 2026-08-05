# CampusArchive: Security Architecture Specification

---

## 1. Zero-Trust Security Practices

1. **Authentication & Token Lifecycle:**
   - Stateless short-lived JWT Access Tokens (15-minute lifespan).
   - Long-lived Refresh Tokens stored in HttpOnly, Secure, SameSite=Strict cookies.
   - Session revocation blocklist maintained in Redis cache.

2. **Role-Based Access Control (RBAC):**
   - Middleware-enforced permissions (`Student`, `Moderator`, `Administrator`).
   - Resource-level ownership checks (e.g. students can only edit/delete their own unapproved uploads).

3. **File Upload Security:**
   - Pre-Signed URLs restrict upload location, size limit (50MB), and TTL (15 minutes).
   - Server-side MIME type magic-byte inspection (disallows executing scripts like `.php`, `.sh`, `.exe`).
   - ClamAV virus scanning pass prior to promoting uploaded files to the public bucket.

4. **Data Protection & Sanitization:**
   - SQL Injection prevention using parameterized queries via Prisma / Knex / Node-Postgres.
   - XSS sanitization of all HTML inputs and Markdown user content using DOMPurify.
   - Secure HTTP headers via Helmet.js.
