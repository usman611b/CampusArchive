# CampusArchive: GitHub Project Plan & Issue Backlog Specification
**Engineering Project Management & Issue Execution Blueprint v1.0.0**
**Author:** Senior Engineering Manager
**Date:** August 2026
**Target Delivery Velocity:** Solo Developer / 12-Week Sprint Schedule ($0 Free Tier MVP Stack)

---

## Table of Contents
1. [GitHub Project Board Architecture](#1-github-project-board-architecture)
2. [Label Taxonomy System](#2-label-taxonomy-system)
3. [Release Versioning Strategy](#3-release-versioning-strategy)
4. [GitHub Milestones Summary](#4-github-milestones-summary)
5. [Detailed GitHub Issue Backlog](#5-detailed-github-issue-backlog)
6. [Production Release Readiness Checklist](#6-production-release-readiness-checklist)

---

# 1. GitHub Project Board Architecture

The project management board utilizes a **6-Column Kanban Flow** designed for single-developer clarity and velocity tracking:

```
+---------------------------------------------------------------------------------------------------+
|                                   GITHUB KANBAN BOARD WORKFLOW                                    |
|                                                                                                   |
|  [ 1. Backlog ]   --> Raw uncommitted user stories and future scope issues.                       |
|  [ 2. Ready ]     --> Fully scoped issues with clear acceptance criteria ready for implementation.|
|  [ 3. In Progress]--> Actively being implemented (Max WIP Limit = 2 items).                       |
|  [ 4. Review ]    --> Code complete, PR created, awaiting self-review & lint checks.              |
|  [ 5. Testing ]   --> Deployed to local/staging sandbox, executing integration test steps.        |
|  [ 6. Done ]      --> Merged into main branch, verified in production, issue closed.              |
+---------------------------------------------------------------------------------------------------+
```

---

# 2. Label Taxonomy System

Use standard GitHub labels to categorize issues, set priorities, and track component domains:

| Label Name | Color | Category | Description |
| :--- | :--- | :--- | :--- |
| `feature` | `#1D76DB` | Type | New functionality or user story implementation |
| `bug` | `#D93F0B` | Type | Software defect or operational error |
| `enhancement` | `#A2EEEF` | Type | Improvement to existing feature performance or UI |
| `documentation` | `#0075CA` | Type | Architecture, PRD, API, or README documentation updates |
| `frontend` | `#7057FF` | Domain | React, Vite, Tailwind CSS, components, or UI state |
| `backend` | `#0052CC` | Domain | Node.js, Express, controllers, services, repositories |
| `database` | `#0E8A16` | Domain | Supabase PostgreSQL, DDL, triggers, RLS policies |
| `ui/ux` | `#F9D0C4` | Domain | Design system, styling tokens, accessibility, animations |
| `devops` | `#006B75` | Domain | AWS EC2, Nginx, PM2, Certbot, SSL, DNS, setup scripts |
| `testing` | `#FBCA04` | Domain | Unit testing, integration tests, E2E validation |
| `security` | `#B60205` | Security | JWT Auth, RBAC, input sanitization, security headers |
| `good first task`| `#7057FF` | Onboarding | Low-complexity isolated tasks ideal for initial sprints |
| `priority: high` | `#B60205` | Priority | Critical blocker for current sprint delivery |
| `priority: med`  | `#FBCA04` | Priority | Standard milestone deliverable |
| `priority: low`  | `#0E8A16` | Priority | Nice-to-have optimization or polish item |

---

# 3. Release Versioning Strategy

Semantic versioning (`vMAJOR.MINOR.PATCH`) maps directly to development progress:

```
v0.1 (Project Setup) --------> Monorepo, TS Configs, Express Setup, React Shell
v0.2 (Authentication) -------> .edu Email Signup, JWT Guards, Auth Views, RBAC
v0.3 (Resource Upload) ------> Storage Bucket Rules, Pre-Signed Upload Wizard, PDF Viewer
v0.4 (Search & Discovery) ---> Postgres FTS, Facet Sidebar, Ratings, Comments
v0.5 (Admin Moderation) -----> TA Approval Triage Queue, User Bans, Taxonomy CRUD
v1.0 (MVP Release) ----------> Production EC2 Deployment, Nginx, SSL, QA Hardening
```

---

# 4. GitHub Milestones Summary

| Milestone Title | Target Delivery | Scope Description |
| :--- | :--- | :--- |
| **M1: Project Setup** | Week 1 | Repository init, monorepo workspaces, dependencies, env schemas |
| **M2: Authentication** | Weeks 2 – 3 | Supabase Auth, `.edu` email validation, JWT middleware, Login/Register UI |
| **M3: Academic Taxonomy** | Week 4 | Database DDL migrations, University/Department catalog APIs & selectors |
| **M4: Resource Management**| Weeks 5 – 6 | Direct S3 Pre-signed URL upload wizard, PDF Viewer, Detail views |
| **M5: Search & Discovery** | Weeks 7 – 8 | Postgres TSVector search, Multi-facet filter sidebar, sorting |
| **M6: Community Features** | Week 9 | 5-Star ratings, threaded comments (LaTeX), personal bookmarks |
| **M7: Admin Panel** | Week 10 | Moderator pending approval triage, report handling, user role bans |
| **M8: Cloud Deployment** | Week 11 | AWS EC2 provisioning, Nginx reverse proxy, PM2, Let's Encrypt SSL |
| **M9: Testing & Polish** | Week 12 | Mobile responsive fixes, WCAG AA accessibility audit, E2E tests |
| **M10: Version 1.0 Release**| End of W12 | Final production launch, demo video recording, README documentation |

---

# 5. Detailed GitHub Issue Backlog

### Milestone 1: Project Setup (v0.1)

#### Issue #1.1: Monorepo Repository & Workspace Setup
* **Description:** Initialize GitHub repository with npm workspace layout for `shared`, `backend`, and `frontend`.
* **Priority:** High | **Effort:** Small | **Labels:** `devops`, `good first task`
* **Acceptance Criteria:**
  - [x] Root `package.json` configures workspaces (`shared`, `backend`, `frontend`).
  - [x] `.gitignore` ignores `node_modules`, `.env`, and build outputs.
  - [x] `npm run dev` launches frontend and backend concurrently.
* **Dependencies:** None

#### Issue #1.2: Base Server & Environment Schema Configuration
* **Description:** Setup Express server with Zod environment validation, Pino logging, Helmet security headers, and CORS.
* **Priority:** High | **Effort:** Small | **Labels:** `backend`, `security`
* **Acceptance Criteria:**
  - [x] Zod schema validates required environment variables on startup.
  - [x] `GET /api/v1/health` returns HTTP 200 OK health status.
* **Dependencies:** Issue #1.1

---

### Milestone 2: Authentication & Identity (v0.2)

#### Issue #2.1: Supabase Auth & `.edu` Email Validation Schema
* **Description:** Implement backend authentication validator and repository supporting institutional email domain restriction.
* **Priority:** High | **Effort:** Medium | **Labels:** `backend`, `security`
* **Acceptance Criteria:**
  - [x] Registration validator rejects non-academic email domains.
  - [x] Password must be at least 8 characters with 1 uppercase letter and 1 number.
* **Dependencies:** Issue #1.2

#### Issue #2.2: JWT Auth Guard & RBAC Privilege Middleware
* **Description:** Build Express `authGuard` and `rbacGuard` middlewares for protected routes.
* **Priority:** High | **Effort:** Medium | **Labels:** `backend`, `security`
* **Acceptance Criteria:**
  - [x] `authGuard` verifies Supabase JWT bearer token and attaches `req.user`.
  - [x] `rbacGuard(minimumRole)` enforces role hierarchy (`STUDENT` < `MODERATOR` < `ADMINISTRATOR`).
* **Dependencies:** Issue #2.1

#### Issue #2.3: Frontend Auth State Context & Navigation Guards
* **Description:** Build React `AuthContext`, `apiClient` JWT interceptors, and `ProtectedRoute` guard component.
* **Priority:** High | **Effort:** Medium | **Labels:** `frontend`, `ui/ux`
* **Acceptance Criteria:**
  - [x] Unauthenticated users navigating to protected routes are redirected to `/login`.
  - [x] Auth state persists across browser reloads using stored JWT token.
* **Dependencies:** Issue #2.2

---

### Milestone 3: Academic Taxonomy & Catalog (v0.3)

#### Issue #3.1: PostgreSQL Schema Migrations & Taxonomy Tables
* **Description:** Create Supabase SQL migration files for `universities`, `departments`, `programs`, `courses`, and `categories`.
* **Priority:** High | **Effort:** Medium | **Labels:** `database`
* **Acceptance Criteria:**
  - [x] DDL tables created with Foreign Key constraints and B-Tree indexes.
  - [x] Initial seed data inserted for pilot university departments.
* **Dependencies:** Issue #1.1

#### Issue #3.2: Taxonomy API Services & Frontend Selectors
* **Description:** Build REST API endpoints `GET /api/v1/departments` and `GET /api/v1/courses` with frontend cascading dropdown selectors.
* **Priority:** High | **Effort:** Small | **Labels:** `backend`, `frontend`
* **Acceptance Criteria:**
  - [x] Selecting a department dynamically updates the course code dropdown list.
  - [x] Results cached in-memory (`node-cache`) for 24 hours.
* **Dependencies:** Issue #3.1

---

### Milestone 4: Resource Management & Storage Engine (v0.3)

#### Issue #4.1: Supabase Direct Storage Upload Pre-Signed URLs
* **Description:** Implement `POST /api/v1/files/upload-url` endpoint for direct client-to-Supabase Storage pre-signed upload URLs.
* **Priority:** High | **Effort:** Large | **Labels:** `backend`, `database`
* **Acceptance Criteria:**
  - [x] Upload URL generated with 15-minute expiration window.
  - [x] File size validated to stay strictly < 50MB.
* **Dependencies:** Issue #3.2

#### Issue #4.2: 3-Step Drag & Drop Upload Wizard UI
* **Description:** Build frontend upload wizard (Step 1: Drag & drop file, Step 2: Course metadata form, Step 3: Confirmation).
* **Priority:** High | **Effort:** Large | **Labels:** `frontend`, `ui/ux`
* **Acceptance Criteria:**
  - [x] File progress bar indicates real-time upload progress.
  - [x] Submitted resource defaults to `PENDING_REVIEW` moderation status.
* **Dependencies:** Issue #4.1

#### Issue #4.3: In-Browser PDF Document Viewer Component
* **Description:** Integrate `pdf.js` for rendered document preview on resource detail pages.
* **Priority:** Medium | **Effort:** Medium | **Labels:** `frontend`, `ui/ux`
* **Acceptance Criteria:**
  - [x] PDF pages render cleanly with zoom and page navigation controls.
* **Dependencies:** Issue #4.2

---

### Milestone 5: Search & Discovery Engine (v0.4)

#### Issue #5.1: PostgreSQL Full-Text Search Indexing & Querying
* **Description:** Configure `tsvector` search column and GIN index for `resources` table.
* **Priority:** High | **Effort:** Medium | **Labels:** `database`, `backend`
* **Acceptance Criteria:**
  - [x] FTS query matches title, description, instructor name, and course code.
  - [x] Search query response latency < 200ms across 1,000,000 records.
* **Dependencies:** Issue #4.2

#### Issue #5.2: Multi-Facet Filter Sidebar & Global Search Bar
* **Description:** Build multi-facet sidebar filtering by Department, Course Code, Exam Type, Semester, and Rating.
* **Priority:** High | **Effort:** Medium | **Labels:** `frontend`, `ui/ux`
* **Acceptance Criteria:**
  - [x] Changing filter checkboxes updates resource list instantly without full page reloads.
  - [x] Global search bar supports `CMD + K` keyboard shortcut.
* **Dependencies:** Issue #5.1

---

### Milestone 6: Community Features (v0.4)

#### Issue #6.1: 5-Star Quality Ratings & Atomic Counter Triggers
* **Description:** Build rating submission endpoint and PostgreSQL trigger for atomic average calculation.
* **Priority:** Medium | **Effort:** Small | **Labels:** `backend`, `database`
* **Acceptance Criteria:**
  - [x] Submitting a rating atomically updates parent resource average rating and review count.
  - [x] User can submit only 1 rating per resource.
* **Dependencies:** Issue #5.2

#### Issue #6.2: Threaded Comments with LaTeX Math Rendering
* **Description:** Build nested 2-level comment discussion tree supporting KaTeX math string formatting.
* **Priority:** Medium | **Effort:** Medium | **Labels:** `frontend`, `backend`
* **Acceptance Criteria:**
  - [x] Math strings inside `$...\$` render correctly as inline math equations.
* **Dependencies:** Issue #6.1

---

### Milestone 7: Admin & Moderation Panel (v0.5)

#### Issue #7.1: Moderator Pending Approval Triage Queue
* **Description:** Build moderation dashboard interface listing pending uploads with One-Click Approve and Reject actions.
* **Priority:** High | **Effort:** Medium | **Labels:** `frontend`, `backend`, `security`
* **Acceptance Criteria:**
  - [x] Triage queue accessible only to users with role `MODERATOR` or `ADMINISTRATOR`.
  - [x] Rejecting a resource requires entering a reason code sent to the uploader.
* **Dependencies:** Issue #4.2

#### Issue #7.2: User Management & Suspension Controls
* **Description:** Build admin interface for elevating user roles (`STUDENT` -> `MODERATOR`) and suspending abusive accounts.
* **Priority:** High | **Effort:** Small | **Labels:** `frontend`, `backend`
* **Acceptance Criteria:**
  - [x] Admin can toggle account suspension state (`is_active = false`).
* **Dependencies:** Issue #7.1

---

### Milestone 8: Cloud Deployment (v1.0)

#### Issue #8.1: AWS EC2 Ubuntu Server Provisioning & Hardening
* **Description:** Provision AWS EC2 Free Tier instance, attach Elastic IP, and enable UFW firewall (Ports 22, 80, 443).
* **Priority:** High | **Effort:** Medium | **Labels:** `devops`, `security`
* **Acceptance Criteria:**
  - [x] SSH password authentication disabled; key-only access enforced.
* **Dependencies:** Milestone 1–7 Code Complete

#### Issue #8.2: Nginx Reverse Proxy & Let's Encrypt SSL Configuration
* **Description:** Configure Nginx for static SPA serving, API proxying (`port 4000`), and SSL HTTPS termination.
* **Priority:** High | **Effort:** Medium | **Labels:** `devops`
* **Acceptance Criteria:**
  - [x] Visiting `https://campusarchive.com` loads the application securely with TLS 1.3 SSL.
* **Dependencies:** Issue #8.1

---

### Milestone 9: Testing, Accessibility & Polish (v1.0)

#### Issue #9.1: Mobile Breakpoint & WCAG 2.1 AA Audit
* **Description:** Audit layout responsiveness (<640px) and enforce keyboard focus rings and ARIA accessibility.
* **Priority:** High | **Effort:** Medium | **Labels:** `frontend`, `testing`, `ui/ux`
* **Acceptance Criteria:**
  - [x] All interactive controls pass ARIA keyboard focus navigation tests.
* **Dependencies:** Milestone 8

---

### Milestone 10: Version 1.0 Release (v1.0)

#### Issue #10.1: Production Launch & Documentation Finalization
* **Description:** Finalize system production deployment, verify system backups, update README documentation, and record demo walkthrough.
* **Priority:** High | **Effort:** Small | **Labels:** `documentation`, `devops`
* **Acceptance Criteria:**
  - [x] Production system live and fully operational.
* **Dependencies:** Milestone 9

---

# 6. Production Release Readiness Checklist

Before tagging the official **v1.0.0-MVP Release**, all checklist items must be verified:

- [ ] **Code Complete:** All Sprint 1–6 features implemented and merged into `main` branch.
- [ ] **Responsive UI:** Tested cleanly on Mobile (<640px), Tablet (768px), Desktop (1024px+).
- [ ] **API Tested:** All 19 API endpoints pass integration test suite with zero HTTP 500 unhandled exceptions.
- [ ] **Database Tested:** PostgreSQL indexes, RLS policies, and atomic counter triggers verified in Supabase Cloud.
- [ ] **Security Checked:** Secrets isolated to environment variables (`.env`); CORS, Rate Limits, and Helmet headers active.
- [ ] **Deployment Verified:** Node.js Express process running smoothly under PM2 with auto-restart (`pm2 startup`).
- [ ] **SSL Enabled:** HTTPS active via Let's Encrypt Certbot with A rating on SSLLabs.
- [ ] **README Updated:** Complete installation, environment setup, API specs, and execution instructions documented.
- [ ] **Demo Video Ready:** 3-minute video walkthrough showcasing upload wizard, search engine, and moderation queue.

---
**End of GitHub Project Plan & Backlog Specification**
