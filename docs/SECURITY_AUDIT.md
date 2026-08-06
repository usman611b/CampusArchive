# CampusArchive Security Audit

Date: 2026-08-06

Scope: React/Vite frontend, Express API, custom JWT authentication, Supabase PostgreSQL/Storage/Realtime, Nginx, PM2, AWS EC2, and the proposed GitHub Actions deployment pipeline.

This audit maps the five checks in "5 Security Checks Before You Launch Your App" to CampusArchive. It documents implemented controls and remaining operational work. It is not a substitute for an independent penetration test.

## 1. Secret leak prevention

Implemented:

- `.env`, production environment files, keys, PEM files, logs, and build outputs are ignored by Git.
- Tracked `.env.example` files contain placeholders only.
- The backend refuses to start without a valid Supabase URL, service-role key, and a JWT secret of at least 32 characters.
- Production startup rejects obvious placeholder credentials and non-HTTPS CORS origins.
- The browser receives only the Supabase publishable/anon key. The service-role key remains server-side.
- The hardcoded frontend Supabase project URL fallback was removed.
- CI scans Git history with Gitleaks and fails on high/critical production dependency advisories.

Operational requirements:

- Rotate any credential that has ever appeared in Git history, screenshots, logs, chat, or terminal recordings.
- Keep `backend/.env`, `frontend/.env.production`, and the EC2 private key out of GitHub Actions artifacts.
- Use GitHub OIDC for AWS access instead of permanent AWS access keys.

## 2. Personal-data flow

| Data | Entry point | Storage | External transfer | Protection |
| --- | --- | --- | --- | --- |
| Email, name, username, institution | Registration/profile API | Supabase `users` | Supabase only | TLS, validation, admin-only management responses |
| Password | Registration/login API | BCrypt hash in `users.password_hash` | Supabase only after hashing | Never returned by DTOs; 12-character registration policy |
| JWT access token | Login response | Browser local storage | Express Authorization header | Signed, seven-day expiry, server-side role/account recheck |
| Avatar URL and bio | Profile API | Supabase `users` | URL may reference an external image host | HTTPS URL and plain-text validation |
| IP address and user agent | Resource view/download API | `views` and `downloads` | Supabase | Not returned through public resource DTOs |
| Resource files | Direct signed upload | Private Supabase Storage bucket | Supabase Storage | 50 MB/type allowlist, user-bound object path, signed download URL |
| Comments/ratings/likes | Interaction APIs | Supabase interaction tables | Realtime invalidation payloads | Authentication for writes, ownership checks, sanitization, RLS |

Implemented deletion endpoint:

```text
DELETE /api/v1/auth/me
```

It requires the current password, then soft-deletes the account and anonymizes email, username, name, password hash, avatar, and bio while preserving referential integrity for community resources.

## 3. Pre-deployment production controls

Implemented:

- Required environment validation with production placeholder detection.
- `helmet` security headers on API responses.
- Nginx security-header include file for the React application.
- Exact CORS origin allowlist; production origins must use HTTPS.
- `trust proxy` enabled for the single Nginx proxy so rate limiting uses the real client IP.
- Global API, authentication, registration, upload, interaction, discussion, and download rate limits.
- One-megabyte API JSON/body limit; resource files upload directly through signed Supabase URLs.
- Generic production 500 responses with a request correlation ID.
- PM2/systemd startup, Nginx validation, HTTPS redirect, Certbot renewal, and health checks.

## 4. Custom-auth and complex-logic review

Implemented:

- Passwords use BCrypt and are never mapped into API DTOs.
- New registrations always receive the `STUDENT` role.
- First-admin bootstrap is disabled unless `ENABLE_FIRST_ADMIN_BOOTSTRAP=true` is deliberately set.
- Protected requests verify the JWT and then load the authoritative current role and account status from Supabase.
- JWTs include a password-version fingerprint, so password changes invalidate every previously issued session.
- Authorization fails closed when the database role check is unavailable.
- Admin routes enforce authentication, role checks, and granular permissions server-side.
- Resource/comment/rating mutations verify ownership or moderator authority server-side.
- Non-approved resources return 404 unless requested by their uploader or a moderator.
- Search pagination is bounded and PostgREST filter control characters are removed from user queries.
- Text fields reject HTML and comments are additionally sanitized.
- Signed upload paths contain the authenticated user ID and course ID; submitted paths must match that ownership prefix.
- Downloads use five-minute signed URLs. There is no public-bucket fallback.
- Storage records are no longer falsely marked virus-scan `PASSED`; they begin as `PENDING`.

## 5. Attacker-perspective review

Attack paths addressed:

- ID manipulation: ownership and visibility checks protect uploads, bookmarks, notifications, comments, ratings, and non-approved resources.
- Login bypass: malformed/expired JWTs fail; database lookup failures do not preserve stale privileges.
- Privilege escalation: registration and login cannot promote a user based only on a known email address.
- Mass registration and brute force: separate rate limits apply to registration and login.
- Storage abuse: file names, extensions, declared MIME types, sizes, and object ownership paths are validated.
- XSS/content injection: React escaping, plain-text validators, comment sanitization, safe redirect validation, and CSP defense-in-depth.
- Internal exposure: production errors omit stack traces, database messages, paths, and secrets; resource DTOs omit storage paths and hashes.
- Cost abuse: download, upload, interaction, and global API limits reduce automated egress and write abuse.

## Supabase migration required

Apply `backend/database/20260806_security_hardening.sql` in the Supabase SQL Editor. It:

- revokes browser access to application tables except the three Realtime interaction feeds;
- enables RLS on audit logs and interaction tables;
- restores only required Realtime read grants and policies;
- makes the `academic_resources` bucket private;
- enforces the 50 MB storage limit and MIME allowlist.

Apply it in a maintenance window and test Realtime comments, ratings, and likes immediately afterward.

## EC2/Nginx changes required

After deploying this commit:

1. Add `ENABLE_FIRST_ADMIN_BOOTSTRAP=false` to `backend/.env`.
2. Confirm `CORS_ORIGIN=https://campusarchive.usmanalii.com`.
3. Add this line inside the HTTPS `server` block in `/etc/nginx/conf.d/campusarchive.conf`:

   ```nginx
   include /var/www/CampusArchive/deploy/nginx/security-headers.conf;
   ```

4. Change `client_max_body_size 55M;` to `client_max_body_size 2M;`. Files upload directly to Supabase rather than through Express.
5. Run `sudo nginx -t`, reload Nginx, and restart PM2 with updated environment variables.

## Residual risks and next work

- JWTs are stored in browser local storage. The CSP and input controls reduce XSS likelihood, but an HttpOnly Secure SameSite cookie design would provide stronger token-theft resistance and requires CSRF-aware auth changes.
- Email ownership verification and a real password-reset token flow are not implemented in the custom-auth system.
- MIME allowlisting does not prove file contents. Add malware scanning or document-content verification before automatically trusting uploaded files; moderator review remains required.
- Express rate limiting is per-instance memory. Move counters to a shared store before horizontally scaling to multiple API instances.
- Application-level rate limits do not replace AWS Shield/WAF for high-volume denial-of-service protection.
- Run an independent penetration test before handling highly sensitive data or serving an institution at scale.
