# CampusArchive: Development Roadmap & Sprint Execution Plan
**Agile Engineering Plan & Milestone Specification v1.0.0**
**Author:** Senior Technical Project Manager & Scrum Master
**Date:** August 2026
**Target Velocity:** Single Developer / 12-Week Agile Delivery Cycle

---

## Table of Contents
1. [Project Setup & Repository Architecture](#1-project-setup--repository-architecture)
2. [Sprint Execution Plan (Sprints 1 – 6)](#2-sprint-execution-plan-sprints-1--6)
   - [Sprint 1: Foundation & Core Authentication](#sprint-1-foundation--core-authentication)
   - [Sprint 2: Resource Management & Storage Engine](#sprint-2-resource-management--storage-engine)
   - [Sprint 3: Search, Discovery & Community Engagement](#sprint-3-search-discovery--community-engagement)
   - [Sprint 4: Administration, Moderation & Taxonomy](#sprint-4-administration-moderation--taxonomy)
   - [Sprint 5: Cloud Deployment & Infrastructure Integration](#sprint-5-cloud-deployment--infrastructure-integration)
   - [Sprint 6: Polish, Performance, QA & Hardening](#sprint-6-polish-performance-qa--hardening)
3. [Project Quality Checklists](#3-project-quality-checklists)
4. [Git Workflow & Milestone Strategy](#4-git-workflow--milestone-strategy)
5. [Project Folder Organization](#5-project-folder-organization)
6. [Future Version Roadmap (v1.0 -> v1.5 -> v2.0)](#6-future-version-roadmap)

---

# 1. Project Setup & Repository Architecture

### 1.1 Repository Initialization
* **Version Control:** Single monorepo architecture hosted on GitHub (`github.com/organization/campusarchive`).
* **Branch Protection:** `main` branch protected; requires clean CI checks and passing unit tests.

### 1.2 Development Environment & Dependencies Manifest

#### Frontend Dependencies (React + Vite)
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "@supabase/supabase-js": "^2.45.0",
    "axios": "^1.7.2",
    "framer-motion": "^11.3.0",
    "lucide-react": "^0.420.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "pdfjs-dist": "^4.5.136"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.9",
    "typescript": "^5.5.3",
    "vite": "^5.4.0"
  }
}
```

#### Backend Dependencies (Node.js + Express)
```json
{
  "dependencies": {
    "express": "^4.19.2",
    "@supabase/supabase-js": "^2.45.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.3.1",
    "zod": "^3.23.8",
    "pino": "^9.3.2",
    "pino-http": "^10.2.0",
    "node-cache": "^5.1.2",
    "sanitize-html": "^2.13.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.14.12",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.5.3"
  }
}
```

---

# 2. Sprint Execution Plan (Sprints 1 – 6)

```
Timeline: 12-Week Agile Delivery Schedule (2-Week Iterations)
+-----------------------------------------------------------------------------------+
| Sprint 1: Foundation & Core Auth           | Weeks 1 – 2  (Est: 40h)              |
| Sprint 2: Resource Engine & Storage        | Weeks 3 – 4  (Est: 40h)              |
| Sprint 3: Search & Community Features      | Weeks 5 – 6  (Est: 40h)              |
| Sprint 4: Admin Panel & Moderation         | Weeks 7 – 8  (Est: 40h)              |
| Sprint 5: AWS EC2 & Nginx Deployment       | Weeks 9 – 10 (Est: 40h)              |
| Sprint 6: Polish, Performance & Hardening  | Weeks 11 – 12 (Est: 40h)             |
+-----------------------------------------------------------------------------------+
```

---

### Sprint 1: Foundation & Core Authentication
* **Sprint Window:** Weeks 1 – 2 (Estimated Effort: 40 Hours)
* **Objective:** Establish repository structure, Supabase database migrations, Express server middleware base, and complete user authentication flows.

#### Features & User Stories
* Initialized React Vite SPA and Express TS API setup.
* Supabase PostgreSQL database table setup (`users`, `universities`, `departments`, `courses`).
* User Registration (restricted `.edu` email validation), Login, Logout, and JWT validation.
* Base App Layout (Navbar, Footer, App Shell, Theme Switcher).

#### Key Deliverables
* Integrated Supabase Client singleton (`config/supabase.ts`).
* JWT Auth Guard Middleware (`authGuard.middleware.ts`).
* User Session React Context (`AuthContext.tsx`).
* Auth UI Views (Login Card, Registration Form, Email Verification View).

#### Dependencies
* Supabase project creation and `.env` credentials setup.

#### Acceptance Criteria
* [x] Users can register with `.edu` emails and receive Supabase verification links.
* [x] Registered users can log in, receive a valid JWT, and view protected dashboard routes.
* [x] Invalid logins return HTTP 401 with standard JSON error envelope.

---

### Sprint 2: Resource Management & Storage Engine
* **Sprint Window:** Weeks 3 – 4 (Estimated Effort: 40 Hours)
* **Objective:** Build the resource upload wizard, integrate direct-to-Supabase Storage pre-signed URLs, and display resource catalogs and detailed document previews.

#### Features & User Stories
* Direct-to-Storage upload URL acquisition (`POST /api/v1/files/upload-url`).
* 3-Step Upload Wizard (Drag & Drop zone, Course/Department metadata form, Summary review).
* In-browser PDF document viewer (`pdf.js` integration).
* Resource Detail Page & File Download URL signing.
* Uploader self-service edit and soft-delete capabilities.

#### Key Deliverables
* Resource Database Repositories & Controllers (`resource.controller.ts`).
* Direct S3 Storage Upload Hook & Progress Bar component.
* Interactive Document Viewer (`components/resource/PDFViewer.tsx`).
* Resource Details View (`pages/ResourceDetail.tsx`).

#### Dependencies
* Sprint 1 Authentication & Course Taxonomy tables.

#### Acceptance Criteria
* [x] Uploading a PDF < 50MB streams directly to Supabase Storage via Pre-signed URL.
* [x] Uploaded resources default to `PENDING_REVIEW` moderation status.
* [x] Clicking "Download" generates a 5-minute signed URL and increments `download_count`.

---

### Sprint 3: Search, Discovery & Community Engagement
* **Sprint Window:** Weeks 5 – 6 (Estimated Effort: 40 Hours)
* **Objective:** Implement full-text search, multi-facet filter panels, threaded comment discussions, 5-star quality ratings, and personal user bookmarks.

#### Features & User Stories
* Multi-facet filter sidebar (Department, Course Code, Exam Type, Academic Term, Rating).
* High-performance full-text search query execution (`tsvector` + GIN index).
* Threaded comment discussion tree supporting LaTeX math string rendering.
* 5-star rating submission with atomic database trigger average recalculation.
* One-click bookmark collections ("Exam Prep Kits").

#### Key Deliverables
* Search & Filter Controller (`search.controller.ts`).
* Filter Context & Sidebar Component (`components/resource/FilterBar.tsx`).
* Threaded Comments Component with KaTeX math rendering (`CommentTree.tsx`).
* Rating Review Modal & Personal Bookmarks View (`pages/Bookmarks.tsx`).

#### Dependencies
* Sprint 2 Resource Creation & Catalog Data.

#### Acceptance Criteria
* [x] Typing keywords in the search bar yields filtered results in < 200ms.
* [x] Users can submit a 1-5 star review; parent resource average rating updates atomically.
* [x] Bookmarking a resource toggles saved state and updates the user's personal collection view.

---

### Sprint 4: Administration, Moderation & Taxonomy
* **Sprint Window:** Weeks 7 – 8 (Estimated Effort: 40 Hours)
* **Objective:** Deliver the moderator approval queue, user management interface, abuse flag reporting system, and administrative taxonomy management.

#### Features & User Stories
* Moderator Pending Approval Queue (`GET /api/v1/admin/moderation/queue`).
* One-click Approve/Reject actions with mandatory rejection reason messaging.
* Abuse report filing for resources and comments.
* Admin User Management (Role promotion: `STUDENT` -> `MODERATOR`, account suspension).
* Taxonomy CRUD (Adding new Courses, Departments, and Categories).

#### Key Deliverables
* Admin & Moderation Controller (`admin.controller.ts`).
* Role-Based Access Guard (`rbacGuard.middleware.ts`).
* Admin Dashboard View (`pages/AdminConsole.tsx`).
* Moderation Triage Queue Component (`components/admin/ModerationQueue.tsx`).

#### Dependencies
* Sprint 1-3 Core Tables & Role Enums.

#### Acceptance Criteria
* [x] Users with role `STUDENT` are blocked (HTTP 403) from accessing `/api/v1/admin/*`.
* [x] Approving a pending submission updates `status = 'APPROVED'`, making it visible in public search.
* [x] Admins can promote users to Moderators and suspend abusive accounts.

---

### Sprint 5: Cloud Deployment & Infrastructure Integration
* **Sprint Window:** Weeks 9 – 10 (Estimated Effort: 40 Hours)
* **Objective:** Deploy the entire production stack onto AWS EC2 Free Tier using Nginx, PM2, Let's Encrypt TLS 1.3 SSL, and Cloudflare DNS on a $0 budget.

#### Features & User Stories
* Provisioning AWS EC2 Ubuntu 24.04 LTS instance & attaching AWS Elastic IP.
* Building React static SPA assets (`npm run build`).
* Nginx Reverse Proxy configuration (Static SPA file serving + API proxying).
* PM2 process configuration (`ecosystem.config.js`) with memory caps.
* Let's Encrypt SSL Certbot installation & Cloudflare DNS proxy configuration.

#### Key Deliverables
* Nginx Production Site Configuration (`campusarchive.conf`).
* PM2 Process Topology Config (`ecosystem.config.js`).
* Cloudflare DNS A/CNAME Records.
* Server Hardening Script (UFW firewall, SSH key authentication).

#### Dependencies
* Completed code base from Sprints 1 – 4.

#### Acceptance Criteria
* [x] Visiting `https://campusarchive.com` loads the React app via HTTPS with valid SSL.
* [x] API requests to `https://campusarchive.com/api/v1/*` proxy seamlessly to Node.js on port 4000.
* [x] Server auto-restarts application processes seamlessly on reboot (`pm2 startup`).

---

### Sprint 6: Polish, Performance, QA & Hardening
* **Sprint Window:** Weeks 11 – 12 (Estimated Effort: 40 Hours)
* **Objective:** Optimize single-instance performance, audit WCAG accessibility, polish loading/empty/error states, and execute end-to-end testing prior to launch.

#### Features & User Stories
* Loading Skeleton screens & Empty state graphic illustrations.
* Responsive UI testing across Mobile (<640px), Tablet, and Desktop breakpoints.
* In-Memory LRU caching (`node-cache`) for static university/department catalogs.
* Accessibility audit (WCAG 2.1 AA keyboard focus rings, ARIA labels).
* End-to-End sanity testing across all user flows.

#### Key Deliverables
* In-Memory Cache Service (`services/cache.service.ts`).
* Loading Skeleton Library (`components/ui/Skeleton.tsx`).
* Automated Integration & Unit Test Suite (`Jest` + `Supertest`).
* Final Launch-Ready Production Build.

#### Dependencies
* Live deployment environment from Sprint 5.

#### Acceptance Criteria
* [x] Zero console warnings or broken layouts on mobile screen sizes (<640px).
* [x] All form controls pass ARIA accessibility audits with visible keyboard focus rings.
* [x] In-memory cache returns static department lists in < 15ms.

---

# 3. Project Quality Checklists

### 3.1 MVP Core Feature Checklist
- [ ] User registration with `.edu` domain restriction
- [ ] Email verification & JWT password login
- [ ] Direct-to-Supabase Storage pre-signed upload wizard (<50MB)
- [ ] In-browser PDF document viewer (`pdf.js`)
- [ ] Course taxonomy navigation (Department -> Course -> Resource)
- [ ] Keyword full-text search & multi-facet filters
- [ ] Moderator approval triage queue
- [ ] 5-Star quality rating & threaded comment discussions
- [ ] Personal collection bookmarks ("Prep Kits")
- [ ] Admin user management & abuse report handling

### 3.2 QA & Testing Checklist
- [ ] Unit tests for business logic services (`Jest`)
- [ ] Integration tests for REST API endpoints (`Supertest`)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive layout verification (<640px)
- [ ] WCAG 2.1 AA keyboard navigation accessibility check
- [ ] Form input validation boundary testing (Zod schemas)
- [ ] Unauthenticated API access protection check (HTTP 401/403)

### 3.3 Production Deployment Checklist
- [ ] AWS EC2 Ubuntu 24.04 LTS instance provisioned & Elastic IP bound
- [ ] UFW firewall enabled (Only ports 22, 80, 443 open)
- [ ] SSH password authentication disabled (`PasswordAuthentication no`)
- [ ] Node.js 20 LTS & PM2 installed globally
- [ ] Production `.env` injected on server with `chmod 600` permissions
- [ ] React frontend static assets built to `/var/www/campusarchive/frontend/dist`
- [ ] Nginx configured with Gzip, HTTP/2, and security headers
- [ ] Let's Encrypt TLS 1.3 SSL certificate issued via Certbot
- [ ] PM2 process manager configured (`max_memory_restart: '400M'`) & auto-boot enabled (`pm2 startup`)
- [ ] Cloudflare DNS A records proxied to Elastic IP

### 3.4 Project Handoff & Submission Checklist
- [ ] Full source code pushed to `main` branch on GitHub
- [ ] Comprehensive `README.md` with local setup & deployment steps
- [ ] Exported Postman API collection included in `/docs/`
- [ ] Architecture document (`ARCHITECTURE.md`) updated
- [ ] Database schema DDL specification (`DATABASE_DESIGN.md`) updated
- [ ] System live URL verified and accessible via HTTPS

---

# 4. Git Workflow & Milestone Strategy

```
[ main ] -------------------------------------------------> [ Release v1.0.0-MVP ]
   ^                                                               ^
   | (PR Merge)                                                    | (PR Merge)
[ develop ] ------------+-------------------+----------------------+
                        |                   |
                        v                   v
              [ feature/auth-flow ]   [ feature/s3-upload ]
```

### 4.1 GitHub Milestones Specification
1. **Milestone 1: MVP Alpha (Sprint 1 - 2):** Core Auth, DB Schemas, Direct File Upload Wizard.
2. **Milestone 2: MVP Beta (Sprint 3 - 4):** Search Engine, Facet Filters, Community Features, Admin Panel.
3. **Milestone 3: MVP Production Launch (Sprint 5 - 6):** EC2 Deployment, SSL, QA Hardening, Performance Tuning.

### 4.2 Conventional Commit Message Standard
All commit messages must follow standard Conventional Commit formatting:
* `feat(auth): add .edu domain email validation check`
* `fix(upload): resolve pre-signed URL expiration calculation bug`
* `docs(readme): add local docker-compose environment setup steps`
* `style(ui): update button variants to Linear dark theme palette`
* `refactor(db): optimize postgres tsvector gin search query`
* `test(api): add supertest integration suite for resource routes`

---

# 5. Project Folder Organization

```
campusarchive/
├── .github/                      # CI/CD Actions & PR Templates
├── docs/                         # Architecture Specs, ERDs, API Specs
│   ├── ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   ├── API_SPECIFICATION.md
│   ├── FRONTEND_DESIGN.md
│   └── DEVOPS_DESIGN.md
├── frontend/                     # React + Vite Client Application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/           # UI, Layout, Resource & Discussion Components
│   │   ├── context/              # Auth, Theme, Toast & Filter Contexts
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/                # Landing, Browse, Upload, Detail, Admin Pages
│   │   ├── router/
│   │   ├── services/             # Axios API Client Modules
│   │   ├── types/
│   │   └── utils/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/                      # Node.js + Express Enterprise API
│   ├── src/
│   │   ├── config/               # Supabase, Logger, Env Configs
│   │   ├── constants/
│   │   ├── controllers/          # HTTP Controllers
│   │   ├── middlewares/          # Auth, RBAC, Rate Limiter, Error Handler
│   │   ├── repositories/         # Supabase Data Access Queries
│   │   ├── routes/               # API Route Registers (/api/v1/...)
│   │   ├── services/             # Core Business Logic & In-Memory Cache
│   │   ├── types/
│   │   ├── utils/                # Custom AppError & API Response Wrappers
│   │   ├── validators/           # Zod Schema Validators
│   │   ├── app.ts
│   │   └── server.ts
│   ├── ecosystem.config.js       # PM2 Production Topology Config
│   ├── package.json
│   └── tsconfig.json
├── shared/                       # Shared TypeScript Types & DTOs
└── README.md
```

---

# 6. Future Version Roadmap

### Version 1.0 (MVP Release - Current Target)
* Single pilot university implementation.
* Email `.edu` auth, Direct Pre-signed PDF upload wizard, PDF Viewer, Keyword Search & Facet Filters.
* TA/Moderator Pending Approval Queue & Admin User Controls.
* $0 Infrastructure Stack (AWS EC2 Free Tier + Supabase Free + Nginx + PM2).

### Version 1.5 (Community & Gamification Release)
* Student Karma Reputation Points & Contributor Badges (Bronze, Silver, Gold).
* Department & University-wide Contributor Leaderboards.
* In-App Notification Dropdown Inbox (`Socket.io` real-time alerts).
* Threaded comment solution upvoting & LaTeX math rendering.

### Version 2.0 (AI Intelligence & Multi-University Enterprise Release)
* Multi-tenant domain isolation (`mit.campusarchive.com`, `stanford.campusarchive.com`).
* Native RAG AI Semantic Search powered by `pgvector` 1536-dimensional embeddings.
* Automated LLM PDF 3-bullet document summarization & keyword auto-extractor.
* Interactive AI Study Assistant Chat Sidepanel ("Chat With Notes").
* Perceptual pHash AI duplicate upload detection engine.

---
**End of Development Roadmap & Sprint Execution Plan**
