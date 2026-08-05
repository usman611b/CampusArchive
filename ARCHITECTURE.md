# CampusArchive: Enterprise Software Architecture Document
**System Architecture & Engineering Specification v1.0.0**
**Author:** Principal Software Architect
**Date:** August 2026
**Target Platform:** Multi-Tenant University Academic Resource Management System

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Functional Requirements](#2-functional-requirements)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [High-Level Architecture](#4-high-level-architecture)
5. [Component Architecture](#5-component-architecture)
6. [System Design & Module Responsibilities](#6-system-design--module-responsibilities)
7. [Authentication Flow](#7-authentication-flow)
8. [Authorization & RBAC Matrix](#8-authorization--rbac-matrix)
9. [File Upload Architecture](#9-file-upload-architecture)
10. [Search Architecture](#10-search-architecture)
11. [Notification Architecture](#11-notification-architecture)
12. [Analytics Architecture](#12-analytics-architecture)
13. [Logging & Observability](#13-logging--observability)
14. [Security Architecture](#14-security-architecture)
15. [Performance Optimization](#15-performance-optimization)
16. [Scalability Strategy (500 Universities, 1M Files, 100k Users)](#16-scalability-strategy)
17. [Future AI Architecture](#17-future-ai-architecture)
18. [Deployment Architecture & Infrastructure](#18-deployment-architecture--infrastructure)
19. [Directory & Project Code Base Structure](#19-directory--project-code-base-structure)
20. [Development Phases & Engineering Roadmap](#20-development-phases--engineering-roadmap)

---

# 1. Executive Summary

### 1.1 What CampusArchive Is
**CampusArchive** ("Preserving Knowledge. Empowering Students.") is a cloud-native, multi-tenant academic resource preservation and discovery platform designed for university ecosystems. It serves as a unified digital repository where students, teaching assistants, and faculty can seamlessly upload, organize, index, discover, and collaborate on educational assets—including lecture notes, past examinations, lab reports, study guides, reference materials, and research summaries.

### 1.2 Who Will Use It
1. **Students (Undergraduate & Graduate):** Core consumers and contributors searching for course-specific past papers, uploading study notes, bookmarking exam preparation kits, and voting/commenting on resource quality.
2. **Teaching Assistants (TAs) & Course Moderators:** Authorized university reviewers responsible for verifying academic integrity, moderating submitted content, approving resource visibility, and curating course resource index structures.
3. **University System Administrators:** Institutional admins overseeing university-wide metadata configurations, department setups, staff provisioning, domain whitelisting, and compliance audit logs.
4. **Platform Platform/Super Admins:** Global SaaS operators monitoring system health, managing cross-university tenant provisioning, overseeing storage limits, and maintaining AI integration infrastructure.

### 1.3 What Problems It Solves
* **Information Fragmentation:** University course materials are currently scattered across ephemeral chat groups (WhatsApp, Telegram), ad-hoc Google Drive folders, expired Learning Management System (LMS) pages, and local devices.
* **Loss of Institutional Knowledge:** High-quality study guides and solutions produced by graduating senior cohorts are lost annually due to the lack of a persistent, multi-generational archive.
* **Poor Searchability & Metadata Indexing:** Traditional cloud drives lack structured filtering by university, department code, course number, professor, semester, exam type, or document schema.
* **Lack of Quality Assurance & Trust:** Free file shares suffer from duplicate uploads, low-quality spam, incorrect answers, and dead links. CampusArchive enforces community reputation, peer ratings, and automated moderation pipelines.

### 1.4 Why This Architecture Was Chosen
The architecture specified in this document adopts a **Modular Monolith transitioning to Microservices-Ready Distributed Architecture** built on top of high-performance Node.js/TypeScript, React SPA (with SSR/SSG capabilities), PostgreSQL (relational foundation with JSONB & pgvector extensibility), Redis (in-memory caching & rate-limiting queue broker), and S3-Compatible Object Storage with CDN Edge Distribution.

**Key Architecting Rationale:**
* **Stateless Compute:** API servers maintain zero local state, permitting frictionless horizontal autoscaling behind reverse proxies.
* **Direct-to-Object-Storage Upload Pattern:** Uploads bypass the Node.js API server using secure S3 Pre-Signed URLs, ensuring zero server I/O bottleneck even when thousands of students upload large PDFs simultaneously during finals week.
* **Asynchronous Queue-Driven Processing:** Heavy compute operations (virus scanning, PDF text extraction, thumbnail generation, vector embedding creation, and email distribution) are offloaded to dedicated background workers via BullMQ.
* **Multi-Tenant Foundation:** Database schemas incorporate strict `university_id` tenant isolation columns, preparing the system for multi-university scaling without needing early database multi-cluster complexity.

---

# 2. Functional Requirements

### 2.1 Feature Breakdown & Specification

#### 1. Authentication
* **Email & Password Registration:** Support domain-restricted registration (`.edu` / `.ac.uk` or official university domains).
* **Magic Link & SSO Ready:** Email-based magic link passwordless login; SAML 2.0 / OAuth2 / OIDC hooks for university Single Sign-On integration (Google Workspace, Microsoft Entra ID / Azure AD, Shibboleth).
* **Token-Based Sessions:** Stateless dual-token mechanism (short-lived JWT Access Token + long-lived secure HttpOnly Refresh Token).
* **Password Management:** Self-service password reset flows using cryptographically secure, single-use, time-bound tokens sent via email.

#### 2. Authorization (RBAC)
* **Granular Role Hierarchy:** Four distinct roles (`Guest`, `Student`, `Moderator`, `Administrator`).
* **Resource Ownership & Scoped Access:** Students can edit/delete their own unapproved uploads; Moderators can edit/approve/reject/delete any resource within their assigned university/department; Administrators hold platform-wide overrides.

#### 3. Resource Upload
* **Multi-File Upload Pipeline:** Support drag-and-drop batch upload of PDFs, DOCX, PPTX, TXT, images (PNG, JPG, WEBP), and code archives (ZIP).
* **Rich Metadata Attribution:** Mandatory tagging including Title, Description, Department, Course Code, Professor/Instructor Name, Academic Term (e.g., Fall 2025), Resource Type (Midterm Exam, Final Exam, Lecture Notes, Lab Report, Homework Solution, Syllabus), and Tags.
* **Direct-to-S3 Upload:** Client-side binary transfer using S3 Pre-Signed PUT URLs.

#### 4. Resource Download
* **Secure Access Delivery:** Generation of time-limited S3 Pre-Signed GET URLs or CloudFront Signed URLs to prevent hotlinking.
* **Download Quota & Rate Limits:** Protection against bulk scraping bots via user-level rate limiting.
* **Resume Support:** Native HTTP Range request support via CDN for large files.

#### 5. Bookmarks & Collections
* **Personal Library:** Ability for students to save/bookmark resources into personal or public curated collections (e.g., "CS101 Final Exam Prep Kit").
* **One-Click Save:** Instant toggling of saved state with asynchronous background sync.

#### 6. Comments & Discussion
* **Threaded Discussions:** Nested comment hierarchies under each resource for Q&A, solution corrections, and peer explanations.
* **Markdown Support:** Support for code formatting, LaTeX math rendering (via KaTeX), and markdown styling in comments.
* **Flagging & Upvoting:** Upvote helpful comments; flag inappropriate or abusive comments for moderator review.

#### 7. Ratings & Peer Review
* **5-Star Rating System:** Aggregate rating calculation with weighted Bayesian mean to prevent score skewing on low vote counts.
* **Quality Attributes:** Secondary ratings for clarity, solution accuracy, and completeness.

#### 8. Search & Filtering
* **High-Performance Keyword Search:** Instant search matching against title, description, course code, instructor, tags, and document content.
* **Faceted Multi-Filter System:** Filter simultaneously by University, Department, Course, Document Type, Semester, Year, Rating, and File Format.
* **Dynamic Sorting:** Sort by Relevance, Most Downloaded, Highest Rated, Newest Upload, or Trending Velocity.

#### 9. Notifications
* **In-App Real-Time Alerts:** WebSocket-powered notification dropdown for resource approvals, replies to comments, upvote milestones, and system updates.
* **Email Digest & Instant Alerts:** Configurable user preferences for instant email alerts or weekly summary digests.

#### 10. Profiles & Reputation System
* **Student Dashboard:** View uploaded contributions, download history, earned reputation points, and saved collections.
* **Gamified Karma/Reputation:** Points awarded when uploads receive high ratings, downloads, or upvotes, unlocking contributor badges (e.g., "Top CS Contributor").

#### 11. Leaderboard
* **University & Department Leaderboards:** Showcase top student contributors filterable by term, academic year, or department.
* **Incentive Engine:** Boost peer-to-peer sharing through competitive recognition.

#### 12. Admin Panel
* **Institutional Dashboard:** Comprehensive dashboard for university admins to oversee user accounts, storage consumption, flag queues, and course catalogs.
* **Batch Operations:** Mass approve/reject uploads, assign moderator permissions, or archive legacy courses.

#### 13. Analytics Engine
* **Platform Metrics:** Real-time dashboards tracking daily active users (DAU), total uploads, download bandwidth, search query frequencies, and storage growth.
* **Resource Heatmaps:** Analytics showing peak activity times (e.g., midterm and final exam weeks).

#### 14. Moderation Workflow
* **Pending Approval Queue:** Configurable auto-approval or manual moderation queue prior to public resource indexing.
* **Moderation Actions:** Approve, Reject with Reason, Request Revision, Flag for Deletion, or Quarantine.

#### 15. Reporting System
* **User Abuse & Copyright (DMCA) Flags:** Built-in reporting system allowing users to flag copyright violations, incorrect solutions, spam, or inappropriate content.
* **Triage Portal:** Dedicated queue for moderators/admins to review flagged items and take disciplinary actions.

#### 16. Course Management
* **Course Catalog Index:** Structured taxonomy of courses categorized by Department (e.g., `CS-101: Introduction to Computer Science`).
* **Course Metadata:** Course name, code, description, prerequisite links, and active professors.

#### 17. Department Management
* **Academic Hierarchy:** Top-level university organization (e.g., School of Engineering -> Department of Computer Science & Engineering).
* **Custom Taxonomies:** Flexible department tagging to support diverse global university structures.

#### 18. Storage Management
* **Quota Tracking:** Storage capacity monitoring per user and per university tenant.
* **Lifecycle Rules:** Automatic tiering of old files to low-cost Glacier cold storage after configurable retention periods.

#### 19. Activity Logs & Audit Trail
* **Immutable Security Logging:** Comprehensive recording of administrative actions, permission changes, resource deletions, user bans, and authentication failures.

---

# 3. Non-Functional Requirements

### 3.1 Performance
* **API Response Time:** 95% of standard REST API requests must complete within **< 150ms** (p95); 99% within **< 300ms** (p99).
* **Search Latency:** Full-text search queries must yield results within **< 200ms** for datasets exceeding 1,000,000 document records.
* **Page Load Time (First Contentful Paint - FCP):** Target FCP under **1.2s** over standard 4G networks; Time to Interactive (TTI) under **2.0s**.
* **File Upload Throughput:** Direct client-to-S3 transfers utilizing parallel multipart uploading for files > 15MB, achieving maximum available client network throughput.

### 3.2 Scalability
* **Active User Capacity:** System must seamlessly support **100,000+ registered active users** across 500 universities, with concurrent peak user load of **10,000 simultaneous active sessions**.
* **File Corpus:** Designed to index and store over **1,000,000+ PDF documents** (~5 Terabytes of storage) with zero database degradation.
* **Horizontal Elasticity:** Compute nodes (API & Background Workers) must scale horizontally in response to CPU (>70%) or Memory (>80%) utilization.

### 3.3 Availability & Reliability
* **Target Uptime SLA:** **99.9% uptime** (~8.76 hours maximum unplanned downtime per year).
* **Multi-AZ Redundancy:** Database, Cache, and Object Storage hosted across at least two Availability Zones (AZs) in a primary AWS region.
* **Graceful Degradation:** Storage or background worker failures must not crash the main web application; search defaults to cached results if search workers experience transient outages.

### 3.4 Maintainability & Extensibility
* **Clean Code & Modular Architecture:** Strict adherence to Layered Architecture (Controllers -> Services -> Repositories -> Data Access) and SOLID design principles.
* **API Versioning:** All public and internal APIs must be versioned via URL prefix (`/api/v1/...`).
* **Automated Testing Coverage:** Mandatory 80%+ unit test coverage for core business services and 70%+ integration test coverage for critical workflows.

### 3.5 Security & Compliance
* **Encryption Standards:** Data in transit protected via **TLS 1.3**; Data at rest encrypted using **AES-256** (S3 server-side encryption & PostgreSQL encrypted EBS volumes).
* **Zero-Trust Security Controls:** OWASP Top 10 defenses including rate limiting, Helmet header protection, parameterized queries, and strict CORS policies.
* **Data Privacy:** FERPA and GDPR compliant data handling, user data export tools, and secure account deletion ("right to be forgotten").

### 3.6 Accessibility
* **WCAG 2.1 AA Compliance:** Full support for screen readers (NVDA, VoiceOver), semantic HTML5 tags, proper ARIA labels, high-contrast color palette, and full keyboard navigation.

### 3.7 SEO & Meta Sharing
* **Dynamic OpenGraph Meta Tags:** Server-Side Rendering (SSR) or Static Site Generation (SSG) for public course landing pages and resource preview pages to generate rich previews on WhatsApp, Twitter, and Slack.
* **Sitemap Generation:** Automated daily XML sitemap index updates for university course directories.

### 3.8 Responsive Design
* **Mobile-First Layout:** Fluid responsive design spanning Breakpoints: Mobile (<640px), Tablet (640px–1024px), Desktop (1024px–1440px), Ultra-wide (>1440px). Touch target sizes set to a minimum of 48x48px.

### 3.9 Fault Tolerance & Disaster Recovery
* **Disaster Recovery Targets:** Recovery Point Objective (**RPO**) < 15 minutes; Recovery Time Objective (**RTO**) < 1 hour.
* **Database Backups:** Automated daily full snapshots with continuous WAL point-in-time recovery (PITR) retained for 30 days.

---

# 4. High-Level Architecture

```
+---------------------------------------------------------------------------------------------------+
|                                      CLIENT TIER (User Interfaces)                                 |
|  +-----------------------------------+  +-----------------------------------+  +----------------+ |
|  | Web Browser (React SPA / Next.js) |  |  Mobile Web / PWA Client App      |  | Desktop Client | |
|  +-----------------------------------+  +-----------------------------------+  +----------------+ |
+---------------------------------------------------|-----------------------------------------------+
                                                    | HTTPS / TLS 1.3 / WSS
                                                    v
+---------------------------------------------------------------------------------------------------+
|                                INGRESS & EDGE ROUTING TIER                                        |
|  +----------------------------------------------------------------------------------------------+  |
|  |  CloudFront CDN / Cloudflare Edge (DDoS Protection, Web Application Firewall, Static Caching)  |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                   | Internal Proxy / SSL Termination               |
|  +----------------------------------------------------------------------------------------------+  |
|  |  Nginx Reverse Proxy & Load Balancer (SSL Termination, Gzip/Brotli, Rate Limiting, HTTP/2)    |  |
|  +----------------------------------------------------------------------------------------------+  |
+---------------------------------------------------|-----------------------------------------------+
                                                    | HTTP REST / WebSockets
                                                    v
+---------------------------------------------------------------------------------------------------+
|                                APPLICATION SERVICE TIER (Stateless)                               |
|  +----------------------------------------------------------------------------------------------+  |
|  | Node.js / Express API Gateway & Application Server Cluster (PM2 Cluster / Horizontal Scale)  |  |
|  |  [ Auth Guard ] [ Validation Middleware ] [ Security Headers ] [ Router ] [ Controller Layer] |  |
|  +----------------------------------------------------------------------------------------------+  |
|         |                     |                      |                        |                   |
|         v                     v                      v                        v                   |
|  +--------------+    +-----------------+    +------------------+    +-------------------+         |
|  | Auth Module  |    | Resource Module |    | Search Module    |    | User & Karma Mod  |         |
|  +--------------+    +-----------------+    +------------------+    +-------------------+         |
+---------|---------------------|----------------------|------------------------|-------------------+
          |                     |                      |                        |
          | Async Task Dispatch | Read / Write         | Query / Index Sync     | Event Emission
          v                     v                      v                        v
+---------------------------------------------------------------------------------------------------+
|                                ASYNCHRONOUS QUEUE & EVENT BUS                                     |
|  +----------------------------------------------------------------------------------------------+  |
|  |  Redis BullMQ Message Queue & Event Bus (Task Distribution, Socket.io Pub/Sub Adapter)      |  |
|  +----------------------------------------------------------------------------------------------+  |
|         |                                            |                                            |
|         v Background Workers                         v Subscriptions                              |
|  +-----------------------------------+    +---------------------------------------------------+   |
|  | Virus Scan / OCR / PDF Thumbnails |    | Notification Dispatcher (Email, WebSockets, Push) |   |
|  +-----------------------------------+    +---------------------------------------------------+   |
+---------------------------------------------------|-----------------------------------------------+
                                                    | SQL / Search Protocols / S3 SDK
                                                    v
+---------------------------------------------------------------------------------------------------+
|                                   DATA & STORAGE TIER                                             |
|  +------------------------------+  +---------------------------+  +-----------------------------+ |
|  | Primary PostgreSQL RDBMS     |  | Redis In-Memory Cache     |  | AWS S3 Object Storage       | |
|  | (Entities, Auth, Metadata,   |  | (Sessions, Rate Limits,   |  | (PDF Files, Thumbnails,     | |
|  |  pgvector Embeddings)        |  |  Hot Query Cache)         |  |  Quarantined Uploads)       | |
|  +------------------------------+  +---------------------------+  +-----------------------------+ |
|                 |                                                                                 |
|                 +--------------------> Search Engine (PostgreSQL tsvector / Meilisearch / Elastic)  |
+---------------------------------------------------------------------------------------------------+
```

### 4.1 Detailed Layer Explanation

1. **Client Tier:** Represents user touchpoints. Built as a single-page React application delivering rich, interactive UI components while utilizing SSR/SSG for public SEO-indexed resource and course routes.
2. **Ingress & Edge Routing Tier:** Handles edge security, SSL/TLS termination, rate limiting, and global caching. CloudFront/Cloudflare provides DDoS mitigation and serves static assets, while local Nginx proxies load balances incoming traffic across app instances.
3. **Application Service Tier:** Node.js/Express stateless app instances running in PM2 cluster mode. This tier exposes RESTful JSON APIs and WebSocket endpoints, enforcing authentication, validation, domain business logic, and transactional orchestration.
4. **Asynchronous Queue & Event Bus Tier:** Powered by Redis and BullMQ. Decouples heavy or slow operations (PDF processing, virus scanning, email sending, vector index generation) from synchronous client HTTP request-response cycles.
5. **Data & Storage Tier:** 
   * **PostgreSQL:** The authoritative transactional database storing users, universities, departments, courses, resource metadata, comments, and audit logs.
   * **Redis Cache:** Ultra-low latency memory store handling session state token blocklists, cache-aside data, API rate limit windows, and pub/sub channels.
   * **AWS S3:** Scalable object storage partitioned into buckets (`quarantine`, `public-resources`, `thumbnails`) with lifecycle policies.
   * **Search Subsystem:** Utilizes PostgreSQL full-text search capability (`tsvector`, GIN indexes) with an architectural abstraction ready for seamless transition to Meilisearch/ElasticSearch as data volume expands.

---

# 5. Component Architecture

```
                  +---------------------------------------------------+
                  |                 FRONTEND MODULE                   |
                  |  +---------------------+  +--------------------+  |
                  |  |  Pages / Views      |  |  UI Components     |  |
                  |  +---------------------+  +--------------------+  |
                  |  | State (Zustand/Query) |  | API Client (Axios) |  |
                  |  +---------------------+  +--------------------+  |
                  +-------------------------|-------------------------+
                                            | JSON HTTP / REST
                                            v
+---------------------------------------------------------------------------------------------------+
|                                     BACKEND SERVICES MODULE                                       |
|                                                                                                   |
|  +----------------------+   +-----------------------+   +----------------------+                  |
|  | Authentication Service|   |  Resource Service     |   | Moderation Service   |                  |
|  +----------------------+   +-----------------------+   +----------------------+                  |
|  |  User & Role Service |   |  Storage/S3 Service   |   | Notification Service |                  |
|  +----------------------+   +-----------------------+   +----------------------+                  |
|  |  Search Service      |   |  Analytics Service    |   | Audit Log Service    |                  |
|  +----------------------+   +-----------------------+   +----------------------+                  |
+-------------------------------------------|-------------------------------------------------------+
                                            | SQL Queries / Key-Value / S3 SDK
                                            v
+---------------------------------------------------------------------------------------------------+
|                                      DATA PERSISTENCE LAYER                                       |
|  +--------------------------------+  +-------------------------------+  +-----------------------+ |
|  | PostgreSQL Database            |  | Redis Cache & Queue           |  | AWS S3 Buckets        | |
|  | - Users, Roles, Institutions   |  | - Session Blocklist           |  | - /quarantine         | |
|  | - Courses, Resources, Metadata |  | - API Rate Limit Counters     |  | - /approved-resources | |
|  | - Comments, Ratings, Audits    |  | - BullMQ Job Queues           |  | - /thumbnails         | |
|  +--------------------------------+  +-------------------------------+  +-----------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 5.1 Component Breakdown

#### 1. Frontend Components
* **Auth Guard & Router:** Manages client-side route protection, token renewal, and role-based view rendering.
* **Resource Explorer:** Interactive grid/list view featuring real-time search input, facet filters, sorting dropdowns, and pagination controls.
* **Direct Uploader Component:** Handles client-side drag-and-drop, client file validation, magic byte checking, S3 pre-signed URL acquisition, progress bar tracking, and metadata form submission.
* **Viewer & Annotation Canvas:** In-browser PDF previewer (via `pdf.js`) allowing document viewing without requiring full file download.
* **Discussion & Rating Widget:** Interactive nested comment tree with LaTeX math preview and star-rating inputs.

#### 2. Backend Services
* **AuthService:** Handles registration, password hashing (Argon2id/Bcrypt), JWT generation/verification, and magic link validation.
* **ResourceService:** Business logic for resource creation, metadata updates, approval states, tag assignment, and download link signing.
* **StorageService:** Interface wrapping AWS S3 SDK for generating pre-signed upload/download URLs, file deletion, and key namespace management.
* **SearchService:** Constructs optimized SQL/Full-Text queries, applies multi-facet filters, computes relevance scores, and manages pagination offsets/cursors.
* **ModerationService:** Manages flag triage queues, approval workflows, administrative overrides, and user reporting actions.
* **NotificationService:** Emits real-time WebSocket events and dispatches asynchronous email jobs to BullMQ workers.
* **AnalyticsService:** Asynchronously buffers event telemetry (views, downloads) into Redis before bulk flushing to database stores.
* **AuditLogService:** Write-only ledger service recording immutable security and administrative events.

---

# 6. System Design & Module Responsibilities

| Module | Core Responsibility | Inbound Dependencies | Outbound Dependencies | Communication Pattern |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Module** | User identity, credential verification, token lifecycle, password resets | API Gateway, Client | PostgreSQL, Redis, Mail Worker | Synchronous REST / Async Queue |
| **User Module** | Profile management, karma points, university affiliations, role assignments | Auth Module, Admin Module | PostgreSQL | Synchronous REST |
| **Resource Module** | Document metadata lifecycle, tagging, course association, approval status | API Gateway, Client | Storage Module, Search Module, PostgreSQL | Synchronous REST / Async Events |
| **Storage Module** | Cloud object storage interaction, pre-signed URL generation, S3 key layout | Resource Module | AWS S3 SDK | Synchronous SDK Calls |
| **Search Module** | Full-text query execution, multi-facet filtering, relevance ranking | API Gateway, Resource Module | PostgreSQL (`tsvector`), Search Index | Synchronous Database Query |
| **Moderation Module** | Content review queue, flag handling, rejection workflows, reputation penalization | Client (Moderator UI), Admin Module | Resource Module, Notification Module | Synchronous REST |
| **Notification Module**| Real-time user alert distribution, socket connections, email dispatching | Resource Module, Moderation Module | Socket.io, BullMQ, SendGrid/SES | Async Event Driven / WebSockets |
| **Analytics Module** | Telemetry ingestion (views, downloads), trending calculation algorithms | API Gateway Middleware | Redis Buffer, PostgreSQL Analytics Store | Non-blocking Async Event |
| **Audit Module** | Tamper-proof logging of security, permission, and deletion events | All Backend Modules | PostgreSQL (Immutable Table) | Synchronous / Fire-and-Forget |

---

# 7. Authentication Flow

### 7.1 Detailed Authentication Architecture

The system utilizes a dual-token stateless authentication model augmented with Redis-backed session revocation list (token blacklisting).

```
+--------+            +-------------+          +-------------+          +-------------+          +---------------+
| Client |            | API Gateway |          | Auth Service|          | Redis Cache |          | PostgreSQL DB |
+---+----+            +------+------+          +------+------+          +------+------+          +-------+-------+
    |                        |                        |                        |                         |
    | 1. POST /auth/login    |                        |                        |                         |
    |----------------------->|                        |                        |                         |
    |                        | 2. Pass Credentials    |                        |                         |
    |                        |----------------------->|                        |                         |
    |                        |                        | 3. Query User & Hash   |                         |
    |                        |                        |------------------------------------------------->|
    |                        |                        | 4. User Entity & Hash  |                         |
    |                        |                        |<-------------------------------------------------|
    |                        |                        |                        |                         |
    |                        |                        | 5. Verify Password Hash|                         |
    |                        |                        | 6. Generate Tokens:    |                         |
    |                        |                        |    - AccessToken (15m) |                         |
    |                        |                        |    - RefreshToken(7d)  |                         |
    |                        | 7. Return Tokens       |                        |                         |
    |                        |<-----------------------|                        |                         |
    | 8. Set HttpOnly Cookie |                        |                        |                         |
    |    & JSON AccessToken  |                        |                        |                         |
    |<-----------------------|                        |                        |                         |
    |                        |                        |                        |                         |
    |--+                     |                        |                        |                         |
    |  | 9. Authenticated    |                        |                        |                         |
    |  |    Request (Bearer) |                        |                        |                         |
    |<-+                     |                        |                        |                         |
    |                        |                        |                        |                         |
    | 10. GET /api/v1/resource                        |                        |                         |
    |    (Header: Authorization: Bearer <AccessToken>) |                        |                         |
    |----------------------->|                        |                        |                         |
    |                        | 11. Check Token Revocation Status               |                         |
    |                        |------------------------------------------------>|                         |
    |                        | 12. Token Valid (Not Revoked)                   |                         |
    |                        |<------------------------------------------------|                         |
    |                        |                        |                        |                         |
    |                        | 13. Verify JWT Signature & Claims               |                         |
    |                        | 14. Execute Request & Return Data               |                         |
    |    HTTP 200 OK         |                        |                        |                         |
    |<-----------------------|                        |                        |                         |
```

### 7.2 Core Authentication Protocols

1. **User Registration:**
   * User submits Email, Password, Full Name, University ID, and Department.
   * System verifies that the email domain matches allowed institutional patterns (e.g., `*@university.edu`).
   * Password is hashed using **Argon2id** (memory cost: 65536 KB, time cost: 3 iterations, parallelism: 4).
   * A verification email containing a 64-byte random hex token is dispatched. Account status remains `pending_verification`.

2. **Login & Token Issuance:**
   * Upon successful verification of credentials, Auth Service generates two tokens:
     * **Access Token:** Short-lived JWT (15-minute expiration) signed with RSA-256 containing `userId`, `role`, `universityId`, and `permissions`. Sent in JSON response body.
     * **Refresh Token:** Long-lived token (7-day expiration) stored in an **HttpOnly, Secure, SameSite=Strict** browser cookie.
   * A hash of the Refresh Token is persisted in the database associated with the user session record.

3. **Silent Token Refresh Cycle:**
   * When the Access Token expires, client Axios interceptors catch the HTTP 401 response and automatically send a `POST /auth/refresh` request carrying the HttpOnly Refresh Token cookie.
   * Backend validates the Refresh Token hash, checks if revoked in Redis, issues a new Access Token, and rotates the Refresh Token.

4. **Logout & Session Revocation:**
   * Calling `POST /auth/logout` immediately places the current JWT Access Token signature (JTI) into the Redis Blocklist with an Expiration TTL equal to the token's remaining lifespan.
   * The Refresh Token cookie is cleared, and its database session hash is invalidated.

---

# 8. Authorization & RBAC Matrix

CampusArchive enforces Role-Based Access Control (RBAC) at both API routes (middleware layer) and domain services (business logic layer).

### 8.1 Role Definitions
1. **Guest:** Unauthenticated user accessing public university landing pages, course directories, and public resource previews.
2. **Student:** Verified university member capable of uploading, downloading, bookmarking, commenting, rating, and flagging resources.
3. **Moderator:** Academic reviewer authorized to moderate submissions, manage flags, edit course details, and manage resource approvals within their department/university.
4. **Administrator:** System admin with full tenant-level or platform-wide privileges, including user role management, system configurations, and audit review.

### 8.2 Detailed Role-Permission Matrix

| Permission Code | Permission Description | Guest | Student | Moderator | Administrator |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `resource:read_public` | View public course catalog & previews | **X** | **X** | **X** | **X** |
| `resource:download` | Download resource attachments | | **X** | **X** | **X** |
| `resource:upload` | Submit new academic resources | | **X** | **X** | **X** |
| `resource:edit_own` | Modify own uploaded unapproved material | | **X** | **X** | **X** |
| `resource:delete_own` | Soft-delete own uploaded material | | **X** | **X** | **X** |
| `resource:bookmark` | Save resources to personal collections | | **X** | **X** | **X** |
| `comment:create` | Post comments and LaTeX solutions | | **X** | **X** | **X** |
| `rating:rate` | Submit 5-star ratings and votes | | **X** | **X** | **X** |
| `report:create` | Flag resource or comment for abuse | | **X** | **X** | **X** |
| `moderation:approve` | Approve pending resource submissions | | | **X** | **X** |
| `moderation:reject` | Reject submission with explanation | | | **X** | **X** |
| `moderation:delete_any`| Delete any resource in department | | | **X** | **X** |
| `course:manage` | Create / update course catalog metadata | | | **X** | **X** |
| `user:manage_roles` | Assign Moderator roles / ban users | | | | **X** |
| `system:audit_read` | Access immutable security audit logs | | | | **X** |

---

# 9. File Upload Architecture

To ensure max scalability and avoid Node.js event-loop blocking caused by streaming heavy binaries, CampusArchive uses a **Direct-to-S3 Multipart Signed Upload Pattern**.

```
+--------+                 +-------------+                 +-------------+                 +----------------+
| Client |                 | API Server  |                 | AWS S3      |                 | BullMQ Worker  |
+---+----+                 +------+------+                 +------+------+                 +-------+--------+
    |                             |                               |                                 |
    | 1. Request Pre-Signed URL   |                               |                                 |
    |    (FileName, Size, MIME)   |                               |                                 |
    |---------------------------->|                               |                                 |
    |                             | 2. Validate MIME & Limits     |                                 |
    |                             | 3. Generate S3 Pre-Signed PUT |                                 |
    | 4. Return Pre-Signed URL    |<------------------------------+                                 |
    |<----------------------------|                               |                                 |
    |                             |                               |                                 |
    | 5. Direct Binary Upload (PUT)                               |                                 |
    |------------------------------------------------------------>|                                 |
    | 6. HTTP 200 OK (S3 ETag)                                    |                                 |
    |<------------------------------------------------------------|                                 |
    |                             |                               |                                 |
    | 7. POST /resources/complete |                               |                                 |
    |    (S3 Key, Metadata Payload)                               |                                 |
    |---------------------------->|                               |                                 |
    |                             | 8. Save Record (Status: PENDING)                                |
    |                             | 9. Dispatch Job to Queue      |                                 |
    |                             |---------------------------------------------------------------->|
    | 10. HTTP 201 Created        |                               |                                 |
    |<----------------------------|                               |                                 |
                                                                                                    | 11. Fetch File
                                                                  |<--------------------------------|
                                                                  | 12. Virus Scan (ClamAV)         |
                                                                  | 13. PDF Text & Thumbnail Extract|
                                                                  | 14. Move to /approved Bucket    |
                                                                  | 15. Update Status: APPROVED     |
```

### 9.1 Upload Execution Steps

1. **Client Pre-Flight Validation:** Client checks file size (max 50MB per file) and file extension whitelist (`.pdf`, `.docx`, `.pptx`, `.txt`, `.png`, `.jpg`, `.zip`).
2. **Pre-Signed URL Generation:** Client sends metadata request to API. Server verifies user quotas, validates extension, generates a unique S3 object key (`quarantine/{university_id}/{uuid}.pdf`), and returns an S3 Pre-Signed Upload URL with a 15-minute expiration window.
3. **Direct Binary Upload:** Client streams file binary directly to AWS S3 storage endpoint via standard HTTP PUT request with progress callback support.
4. **Completion Acknowledgement:** Upon S3 upload completion, client calls API `POST /resources/complete` sending S3 object key and rich resource metadata. Server creates a PostgreSQL resource record marked with `status = 'PENDING_MODERATION'`.
5. **Asynchronous Processing Pipeline (BullMQ Workers):**
   * **Virus Scanning:** Worker streams file from S3 quarantine bucket through a ClamAV container service. If a threat is detected, file is instantly purged and account flagged.
   * **Thumbnail Generation:** Worker converts first page of PDF into WebP preview image (sizes: 300px thumbnail, 800px preview) using `sharp` and `pdf-poppler`, saving output to S3 `thumbnails/` folder.
   * **Metadata & Text Extraction:** Worker extracts document text layer using `pdf-parse` for inclusion in PostgreSQL full-text search indexes.
   * **Bucket Promotion:** Clean files are copied from `quarantine/` bucket to `approved-resources/` bucket.

### 9.2 Secure Download & Caching Delivery
* **Pre-Signed Download URLs:** Resource files are never served directly via public S3 bucket URLs. Downloads execute via CloudFront Signed URLs with short lifetimes (5 minutes) containing single-use client IP restrictions.
* **HTTP Byte Range Support:** CloudFront natively handles range requests allowing users to pause/resume large downloads seamlessly.

---

# 10. Search Architecture

Search is the primary discovery engine of CampusArchive. The architecture delivers instant multi-faceted search across structured metadata and full-text document content.

```
                   +-----------------------------------------------+
                   |          SEARCH QUERY EXECUTION FLOW          |
                   +-----------------------+-----------------------+
                                           |
                                           v
                   +-----------------------------------------------+
                   | Client Search Bar Input                       |
                   | Query: "CS101 Midterm 2024 Smith"              |
                   +-----------------------+-----------------------+
                                           |
                                           v
                   +-----------------------------------------------+
                   | Search Service Query Normalization            |
                   | - Sanitize & strip special characters         |
                   | - Convert to TSQUERY format                   |
                   | - Extract facet filters (Dept, Year, Type)    |
                   +-----------------------+-----------------------+
                                           |
                     +---------------------+---------------------+
                     |                                           |
                     v (Phase 1 / Default)                       v (Phase 3 Enterprise Vector)
   +------------------------------------+      +------------------------------------+
   | PostgreSQL Full-Text Engine        |      | Hybrid Search Engine (Meilisearch) |
   | - tsvector match on title & body   |      | - BM25 Keyword Scoring             |
   | - GIN index execution              |      | - pgvector Semantic Embeddings     |
   | - Trigonometry fuzzy matching      |      | - Vector Similarity (Cosine)       |
   +-----------------+------------------+      +-----------------+------------------+
                     |                                           |
                     +---------------------+---------------------+
                                           |
                                           v
                   +-----------------------------------------------+
                   | Result Aggregation & Ranking                  |
                   | Score = (Relevance * 0.5) + (Rating * 0.3)    |
                   |         + (DownloadCount * 0.2)               |
                   +-----------------------+-----------------------+
                                           |
                                           v
                   +-----------------------------------------------+
                   | Return Paginated JSON Payload                 |
                   +-----------------------------------------------+
```

### 10.1 Multi-Facet Search Strategy

Search operations blend full-text relevance with strict domain filter constraints.

#### PostgreSQL Full-Text Implementation (Phase 1 Baseline)
* **TSVector Column:** Resources table maintains a generated `search_vector` column indexing Title (Weight A), Course Code (Weight A), Description (Weight B), Instructor Name (Weight B), and Extracted Text Content (Weight C).
* **GIN Indexing:** Generalized Inverted Index (`GIN`) applied on `search_vector` to deliver sub-50ms search lookups across millions of rows.
* **Trigram Fuzzy Matching:** PostgreSQL `pg_trgm` extension handles user typos in course names or instructors (e.g., matching "Algorthms" to "Algorithms").

#### Multi-Filter Combination Query Example Structure
```sql
SELECT r.id, r.title, r.rating_avg, r.download_count,
       ts_rank(r.search_vector, query) AS rank
FROM resources r, to_tsquery('english', 'computer & science & midterm') query
WHERE r.search_vector @@ query
  AND r.university_id = 'univ_mit_01'
  AND r.department_id = 'dept_cs_02'
  AND r.resource_type = 'EXAM_MIDTERM'
  AND r.status = 'APPROVED'
ORDER BY rank DESC, r.created_at DESC
LIMIT 20 OFFSET 0;
```

### 10.2 Ranking & Relevance Algorithm
Resource display ordering uses a weighted hybrid formula balancing text match score, document reputation, and community engagement:

$$\text{FinalScore} = (w_1 \cdot \text{SearchRelevance}) + (w_2 \cdot \text{BayesianRating}) + (w_3 \cdot \log_{10}(\text{Downloads} + 1)) + (w_4 \cdot \text{RecencyDecay})$$

Where weights are tuned as: $w_1 = 0.50$, $w_2 = 0.25$, $w_3 = 0.15$, $w_4 = 0.10$.

---

# 11. Notification Architecture

CampusArchive incorporates a real-time, event-driven notification engine that notifies users instantly when content is approved, commented on, or flagged.

```
+------------------+         +--------------------+         +-------------------+         +-----------------+
| Triggering Event |         | Notification Engine|         | Redis Pub/Sub     |         | Client Browser  |
| (e.g. Approved)  |-------->| (Event Handler)    |-------->| Socket.io Cluster |-------->| (WebSocket Conn)|
+------------------+         +---------+----------+         +-------------------+         +-----------------+
                                       |
                                       | Async Job Dispatch
                                       v
                             +--------------------+         +-------------------+
                             | BullMQ Mail Queue  |-------->| Email API         |
                             |                    |         | (SendGrid/SES)    |
                             +--------------------+         +-------------------+
```

### 11.1 Real-Time WebSocket Infrastructure
* **Socket.io + Redis Adapter:** WebSocket connections are authenticated during initial handshake using short-lived JWTs. Connections are associated with user-specific channels (`user:{userId}`).
* **Horizontal Socket Scaling:** Multiple Node.js WebSocket gateway instances sync across instances via Redis Pub/Sub backplane.

### 11.2 Notification Channels & Delivery Strategy
1. **In-App Real-Time Channel (High Priority):** Instant push via WebSocket for comment replies, upvotes, moderation status updates, and mention notifications (`@username`).
2. **Email Channel (Configurable Priority):** Asynchronous transaction emails dispatched via BullMQ workers to SendGrid / AWS SES. Users can configure preferences in profile settings (Instant, Daily Digest, or Muted).
3. **Future Web Push Channel:** Architectural hooks established for Web Push API (VAPID key signatures) targeting mobile PWA clients.

---

# 12. Analytics Architecture

Analytics tracking operates asynchronously to prevent monitoring telemetry from degrading user request latency.

```
+---------------------------------------------------------------------------------------------------+
|                                 TELEMETRY INGESTION PIPELINE                                      |
|                                                                                                   |
|  +--------------+  1. Non-Blocking Event  +-------------------+  2. Bulk Buffer  +------------+ |
|  | API Server / |------------------------>| Redis In-Memory   |----------------->| BullMQ     | |
|  | Middleware   |                         | Telemetry Streams |                  | Worker     | |
|  +--------------+                         +-------------------+                  +-----+------+ |
|                                                                                        |          |
|                                                                      3. Batch Insert   |          |
|                                                                                        v          |
|                                                                                  +------------+   |
|                                                                                  | Postgres   |   |
|                                                                                  | Analytics  |   |
|                                                                                  | Store      |   |
|                                                                                  +------------+   |
+---------------------------------------------------------------------------------------------------+
```

### 12.1 Tracked Telemetry Metrics
* **Resource Views:** Unique and total page visits per document.
* **Downloads:** Confirmed S3 download link generations.
* **Upload Velocity:** Daily upload counts aggregated by department and course code.
* **Bookmark & Rating Actions:** Micro-engagement metrics for computing trending scores.

### 12.2 Trending Resource Algorithm
The system computes "Trending Resources" using a decaying velocity formula that highlights materials currently popular for upcoming exams while fading older assets:

$$\text{TrendingScore} = \frac{V + (3 \cdot D) + (5 \cdot U)}{(T + 2)^\text{gravity}}$$

Where:
* $V$ = Views in last 72 hours
* $D$ = Downloads in last 72 hours
* $U$ = Upvotes/Bookmarks in last 72 hours
* $T$ = Hours elapsed since resource creation or recent spike
* $\text{gravity}$ = $1.5$ (Decay coefficient)

---

# 13. Logging & Observability

```
+--------------------------------------------------------------------------------------------------+
|                               LOGGING & OBSERVABILITY PIPELINE                                   |
|                                                                                                  |
|  +---------------------+   +-----------------------+   +-------------------------------------+   |
|  | Application Logs    |   | Security Audit Logs   |   | Performance & Metric Logs           |   |
|  | (Winston / Pino)    |   | (Postgres Immutable)  |   | (OpenTelemetry / Prometheus)        |   |
|  +----------+----------+   +-----------+-----------+   +------------------+------------------+   |
|             |                          |                              |                          |
|             v                          v                              v                          |
|  +---------------------+   +-----------------------+   +-------------------------------------+   |
|  | JSON Log Aggregator |   | DB Audit Repository   |   | Prometheus / Grafana Dashboard      |   |
|  | (Datadog / Vector)  |   | (Read-Only Admin UI)  |   | (System Metrics, Latency & Error)   |   |
|  +---------------------+   +-----------------------+   +-------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
```

### 13.1 Logging Tiers & Standards
1. **Application Runtime Logs:** Structured JSON logs generated via Pino/Winston containing timestamp, log level (`INFO`, `WARN`, `ERROR`, `FATAL`), correlation ID (`X-Request-ID`), user ID, route, and execution time.
2. **Error Stack Trace Tracking:** Integrated with Sentry for automatic capture of uncaught backend exceptions and frontend JavaScript runtime errors, complete with environment context and source maps.
3. **Immutable Security Audit Log:** Dedicated database table `audit_logs` retaining security-critical administrative actions (User Banning, Role Elevation, Resource Hard Deletion, Permission Changes). Audit table accepts `INSERT` operations only; updates/deletions are denied at PostgreSQL schema trigger level.

---

# 14. Security Architecture

Security is architected with a **Defense-in-Depth Strategy** across all layers.

```
+-----------------------------------------------------------------------------------------------+
|                                    DEFENSE-IN-DEPTH LAYERS                                    |
|                                                                                               |
|  [ Layer 1: Edge & Network Security ]    --> Cloudflare WAF, TLS 1.3, DDoS Mitigation           |
|  [ Layer 2: HTTP Transport Guard ]       --> Helmet (CSP, HSTS), Rate Limiter, CORS Whitelist   |
|  [ Layer 3: Application Security ]       --> JWT Auth, RBAC Authorization, Zod Sanitization     |
|  [ Layer 4: Storage & Data Security ]    --> S3 Pre-Signed Quarantine, AES-256 Storage, Argon2id |
|  [ Layer 5: Audit & Compliance Guard ]   --> Immutable Trigger Audit Logs, Virus Scanning      |
+-----------------------------------------------------------------------------------------------+
```

### 14.1 Key Security Controls
* **Helmet Security Headers:** Enforces `Strict-Transport-Security` (HSTS: 2 years), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict `Content-Security-Policy` (CSP).
* **CORS Policy:** Strict whitelist validation restricting API access solely to authorized platform domain origin patterns (`https://*.campusarchive.com`).
* **Sliding-Window Rate Limiting:** Powered by Redis. Global API route limit set to 100 requests/minute per IP; Auth endpoints (`/auth/login`, `/auth/forgot-password`) strictly rate limited to 5 requests/minute per IP.
* **XSS (Cross-Site Scripting) Prevention:** User text inputs sanitized via `DOMPurify` on client-side and backend HTML-stripping middleware (`sanitize-html`).
* **SQL Injection Prevention:** All data queries executed exclusively via parameterized queries using Knex/Prisma/Drizzle ORM layers; raw SQL concatenations strictly forbidden.
* **Strict Input Validation:** Every incoming API request body, query parameter, and URL path parameter validated against strict **Zod** schema contracts prior to controller execution.

---

# 15. Performance Optimization

```
+--------------------------------------------------------------------------------------------------+
|                               PERFORMANCE OPTIMIZATION STRATEGY                                  |
|                                                                                                  |
|  +-----------------------+    +-----------------------+    +----------------------------------+  |
|  | Frontend Performance  |    | Caching Layers        |    | Database Query Optimization      |  |
|  | - Code Splitting      |    | - CDN Static Cache    |    | - B-Tree & GIN Indexes           |  |
|  | - Lazy-loaded Modals  |    | - Redis Cache-Aside   |    | - Read Replica Query Splitting   |  |
|  | - Virtualized Lists   |    | - HTTP Stale-While-   |    | - Connection Pooling             |  |
|  | - WebP Image Srcsets  |    |   Revalidate Headers  |    |   (PgBouncer)                    |  |
|  +-----------------------+    +-----------------------+    +----------------------------------+  |
+--------------------------------------------------------------------------------------------------+
```

### 15.1 Optimization Techniques
1. **Frontend Optimization:**
   * Dynamic code-splitting using React `lazy()` and `Suspense` routes.
   * Component virtualized lists (`react-window`) for rendering long resource catalog grids without DOM bloat.
   * Automated WebP image format conversion for thumbnails with responsive `srcset` scaling.
2. **Multi-Tier Caching (Redis Cache-Aside Pattern):**
   * Frequently accessed static metadata (University Lists, Department Trees, Course Catalogs) cached in Redis with 24-hour TTL. Cache invalidated automatically on admin updates.
   * High-traffic resource details cached with 15-minute TTL; download counters updated asynchronously via Redis atomic increments (`INCRBY`).
3. **Database Performance:**
   * Compound B-Tree indexes on frequent query paths (e.g., `INDEX (university_id, department_id, created_at DESC)`).
   * Connection pooling managed by **PgBouncer** keeping active database client connections lean and preventing pool exhaustion during spike events.

---

# 16. Scalability Strategy

Architecture design roadmap ensuring seamless scalability to **500 Universities**, **1,000,000 Files**, and **100,000 Active Users**.

```
+---------------------------------------------------------------------------------------------------+
|                                HORIZONTAL SCALABILITY TOPOLOGY                                    |
|                                                                                                   |
|                      +-----------------------------------------------------+                      |
|                      | Application Load Balancer / Nginx Ingress Gateway   |                      |
|                      +--------------------------+--------------------------+                      |
|                                                 |                                                 |
|                   +-----------------------------+-----------------------------+                   |
|                   |                             |                             |                   |
|                   v                             v                             v                   |
|       +-----------------------+     +-----------------------+     +-----------------------+       |
|       | Stateless App Node 1  |     | Stateless App Node 2  |     | Stateless App Node N  |       |
|       +-----------+-----------+     +-----------+-----------+     +-----------+-----------+       |
|                   |                             |                             |                   |
|                   +-----------------------------+-----------------------------+                   |
|                                                 |                                                 |
|       +-----------------------------------------+-----------------------------------------+       |
|       |                                         |                                         |       |
|       v                                         v                                         v       |
|  +--------------------------+      +--------------------------+      +--------------------------+ |
|  | PostgreSQL Primary (Writes)|      | Postgres Read Replica 1  |      | Postgres Read Replica 2  | |
|  +--------------------------+      +--------------------------+      +--------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 16.1 Scaling Metrics & Infrastructure Blueprint

| Scaling Metric | Target Volume | Architectural Strategy & Mitigation |
| :--- | :--- | :--- |
| **Universities** | 500 Tenants | Logical multi-tenancy via database `university_id` partitioning; isolated tenant configuration schemas. |
| **File Corpus** | 1,000,000 Files (~5TB) | AWS S3 object storage (virtually unlimited scale); S3 Lifecycle rules migrating files older than 2 years to AWS Glacier Flexible Retrieval. |
| **Active Users** | 100,000 Users | Stateless API cluster managed by Autoscaling Groups (HPA); Redis cluster handling distributed session revocation state. |
| **Database Read Traffic**| 5,000 Read QPS | Read/Write splitting. Write queries route to Primary DB; Read queries load balance across 2+ PostgreSQL Read Replicas. |
| **Search Volume** | 1,000 Search QPS | Migration from PostgreSQL `tsvector` to dedicated clustered search engine (Meilisearch cluster or ElasticSearch/OpenSearch). |

---

# 17. Future AI Architecture

CampusArchive is designed with modular **AI Extension Hooks**, enabling plug-and-play AI microservices without rewriting core monolith business logic.

```
+---------------------------------------------------------------------------------------------------+
|                                   FUTURE AI ENGINE EXTENSION LAYER                                |
|                                                                                                   |
|  +-----------------------+  Document Text  +------------------------+  Embeddings +---------------+ |
|  | Background Upload Queue|--------------->| Text Chunking & AI     |----------->| Vector Database | |
|  | (BullMQ Completed Job)|                 | Embedding Worker       |            | (pgvector /     | |
|  +-----------------------+                 | (OpenAI / Gemini API)  |            |  Pinecone)      | |
|                                            +------------------------+            +-------+-------+ |
|                                                                                          |         |
|                                                                       Similarity Query   |         |
|                                                                                          v         |
|  +-----------------------------------------------------------------------------------------------+ |
|  | AI Microservice Capabilities:                                                                 | |
|  |  1. Semantic Vector Search (RAG Pipeline for natural language query matches)                  | |
|  |  2. Automated PDF Summarizer (Generates 3-bullet core summaries of lecture notes)             | |
|  |  3. Interactive Study Assistant Chat (Contextual Q&A against document text embeddings)        | |
|  |  4. AI Duplicate Detection (Perceptual pHash & Embedding distance checks for re-uploads)      | |
|  +-----------------------------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 17.1 Specific AI Capability Extension Specifications
1. **AI Semantic Search (RAG Pipeline):** Extracted document text layer chunked into 500-token segments, embedded via OpenAI/Gemini embedding models, and indexed in `pgvector`. Search converts user prompts into vector queries executing cosine distance matches (`<=>`).
2. **AI PDF Summarization Service:** Upon document approval, background workers call LLM APIs to produce automated bulleted executive summaries and key formula indexes displayed alongside resource listings.
3. **Interactive Study Chatbot:** Embedded document viewer incorporates a side-panel chat UI allowing students to ask clarifying questions directly against the document context.
4. **Automated AI Duplicate Detection:** Prevents duplicate upload clutter by hashing PDF pages via perceptual hashing (`pHash`) and computing embedding similarity distance. Flagged near-duplicates (>95% similarity) are alerted to uploader.

---

# 18. Deployment Architecture & Infrastructure

Production deployment specification targeting a high-availability AWS EC2 / ECS environment managed via Nginx, PM2, and automated Let's Encrypt SSL certificates.

```
+---------------------------------------------------------------------------------------------------+
|                                  PRODUCTION DEPLOYMENT TOPOLOGY                                   |
|                                                                                                   |
|  [ Route 53 DNS ] --> (*.campusarchive.com)                                                       |
|        |                                                                                          |
|        v                                                                                          |
|  [ AWS Application Load Balancer ] (SSL / TLS Termination - Let's Encrypt / ACM)                  |
|        |                                                                                          |
|        +-----------------------------------+-----------------------------------+                  |
|        |                                   |                                   |                  |
|        v                                   v                                   v                  |
|  +---------------------------+   +---------------------------+   +---------------------------+    |
|  | AWS EC2 Instance 1        |   | AWS EC2 Instance 2        |   | AWS EC2 Instance N        |    |
|  | - Nginx Reverse Proxy     |   | - Nginx Reverse Proxy     |   | - Nginx Reverse Proxy     |    |
|  | - PM2 Node.js Cluster     |   | - PM2 Node.js Cluster     |   | - PM2 Node.js Cluster     |    |
|  | - Static Frontend Assets  |   | - Static Frontend Assets  |   | - Static Frontend Assets  |    |
|  +-------------+-------------+   +-------------+-------------+   +-------------+-------------+    |
|                |                               |                               |                  |
|                +-------------------------------+-------------------------------+                  |
|                                                |                                                  |
|        +---------------------------------------+---------------------------------------+          |
|        |                                       |                                       |          |
|        v                                       v                                       v          |
|  +---------------------------+   +---------------------------+   +---------------------------+    |
|  | AWS RDS PostgreSQL        |   | AWS ElastiCache Redis     |   | AWS S3 Multi-Bucket Store |    |
|  | (Multi-AZ Master + Read)  |   | (Cluster Mode Enabled)    |   | (Quarantine / Public)     |    |
|  +---------------------------+   +---------------------------+   +---------------------------+    |
+---------------------------------------------------------------------------------------------------+
```

### 18.1 Nginx Reverse Proxy Production Configuration Blueprint
```nginx
# /etc/nginx/sites-available/campusarchive.conf
upstream nodejs_backend {
    server 127.0.0.1:4000 max_fails=3 fail_timeout=30s;
    keepalive 64;
}

server {
    listen 80;
    server_name *.campusarchive.com campusarchive.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name *.campusarchive.com campusarchive.com;

    ssl_certificate /etc/letsencrypt/live/campusarchive.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/campusarchive.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Frontend Static Asset Delivery
    location / {
        root /var/www/campusarchive/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 30d;
    }

    # API Proxy Routing
    location /api/ {
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

### 18.2 PM2 Production Cluster Configuration Blueprint
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'campusarchive-api',
      script: './dist/server.js',
      instances: 'max', // Scale to CPU core count
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'campusarchive-worker',
      script: './dist/workers/index.js',
      instances: 2,
      exec_mode: 'fork',
      autorestart: true,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

---

# 19. Directory & Project Code Base Structure

Clean Architecture folder layout enforcing strict layer decoupling and modular enterprise organization.

```
campusarchive/
├── .github/                      # CI/CD Workflows (GitHub Actions)
│   └── workflows/
│       ├── ci.yml                # Lint, Test, Typecheck pipeline
│       └── deploy.yml            # Deployment automation scripts
├── docs/                         # System Documentation & Architecture Specs
│   ├── ARCHITECTURE.md
│   └── API_SPEC.md               # OpenAPI 3.0 Specifications
├── frontend/                     # React Single Page Application Client
│   ├── public/                   # Static Favicons, Manifests, Assets
│   ├── src/
│   │   ├── assets/               # CSS Design Tokens, SVGs, Fonts
│   │   ├── components/           # Reusable UI Component Library
│   │   │   ├── common/           # Buttons, Inputs, Modals, Badges
│   │   │   ├── layout/           # Navbar, Sidebar, Footer, Containers
│   │   │   ├── resource/         # FileCard, PDFViewer, SearchFilterBar
│   │   │   └── discussion/       # CommentTree, RatingStars, KaTeXRenderer
│   │   ├── config/               # Client Env Configs & Constants
│   │   ├── hooks/                # Custom React Hooks (useAuth, useSearch)
│   │   ├── pages/                # Top-level Route View Components
│   │   │   ├── Home.tsx
│   │   │   ├── SearchExplorer.tsx
│   │   │   ├── ResourceDetail.tsx
│   │   │   ├── UploadWizard.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── AdminConsole.tsx
│   │   ├── routes/               # Protected & Public Router Guards
│   │   ├── services/             # Axios API Client Modules
│   │   ├── store/                # Zustand State Stores & Query Caches
│   │   ├── types/                # Shared Frontend TypeScript Interfaces
│   │   ├── utils/                # Date Formatters, File Helpers, Validators
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # Node.js / Express Enterprise API Engine
│   ├── src/
│   │   ├── config/               # Database, Redis, S3, Env Initializers
│   │   ├── constants/            # Error Codes, HTTP Statuses, Role Enums
│   │   ├── controllers/          # HTTP Request Handlers (Thin Layer)
│   │   │   ├── auth.controller.ts
│   │   │   ├── resource.controller.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── moderation.controller.ts
│   │   │   └── admin.controller.ts
│   │   ├── middleware/           # Request Interceptors & Guards
│   │   │   ├── authGuard.middleware.ts
│   │   │   ├── rbacGuard.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── rateLimiter.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── models/               # ORM Entity Definitions / Schemas
│   │   ├── repositories/         # Database Query Abstraction (Data Access)
│   │   │   ├── user.repository.ts
│   │   │   ├── resource.repository.ts
│   │   │   └── course.repository.ts
│   │   ├── routes/               # API Router Specs (/api/v1/...)
│   │   ├── services/             # Core Business Logic Layer
│   │   │   ├── auth.service.ts
│   │   │   ├── resource.service.ts
│   │   │   ├── storage.service.ts
│   │   │   ├── search.service.ts
│   │   │   ├── moderation.service.ts
│   │   │   └── notification.service.ts
│   │   ├── utils/                # Cryptography, JWT, Logger, S3 Helpers
│   │   ├── workers/              # BullMQ Background Processing Handlers
│   │   │   ├── virusScan.worker.ts
│   │   │   ├── pdfProcessor.worker.ts
│   │   │   └── email.worker.ts
│   │   ├── app.ts                # Express Application Setup
│   │   └── server.ts             # Entry point / HTTP Server listener
│   ├── package.json
│   └── tsconfig.json
├── shared/                       # Shared Contracts & Schemas Across Stacks
│   ├── types/                    # Common DTO Interfaces
│   └── schemas/                  # Shared Zod Validation Rules
├── docker-compose.yml            # Local Dev Stack (Postgres, Redis, ClamAV)
├── ecosystem.config.js           # PM2 Production Topology Config
└── README.md
```

---

# 20. Development Phases & Engineering Roadmap

Strategic execution plan partitioned into 4 evolutionary deployment phases.

```
Phase 1: MVP Core Architecture (Months 1–3)
+-----------------------------------------------------------------------------------+
| - Core Database Schemas & Migrations                                              |
| - Authentication Subsystem (Email Verification, JWT, Password Resets)             |
| - University / Department / Course Taxonomies                                      |
| - Direct-to-S3 Upload Pipeline & Virus Scanner Integration                       |
| - Baseline Keyword Search & Facet Filters (Postgres tsvector)                      |
| - Basic PDF Document Viewer                                                       |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
Phase 2: Community & Engagement Infrastructure (Months 4–6)
+-----------------------------------------------------------------------------------+
| - Threaded Comment Engine with LaTeX Rendering                                    |
| - 5-Star Rating & Upvote Reputation Karma Engine                                  |
| - Personal Collections & One-Click Bookmarks                                      |
| - Real-Time Socket.io In-App Notification System                                  |
| - Moderation Triage Queue & User Flagging Portal                                  |
| - Gamified Student & Department Leaderboards                                      |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
Phase 3: Intelligence & Advanced AI Integration (Months 7–9)
+-----------------------------------------------------------------------------------+
| - Vector Database Integration (pgvector Chunking & Embeddings)                    |
| - Natural Language AI Search Engine (RAG Pipeline)                                |
| - Automated AI PDF Summarizer & Keyword Auto-Extractor                            |
| - Document Q&A Interactive AI Chatbot Sidepanel                                   |
| - Perceptual pHash AI Duplicate Upload Detection                                  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
Phase 4: Multi-University Scaling & Enterprise SaaS Platform (Months 10–12)
+-----------------------------------------------------------------------------------+
| - University Institutional SSO (SAML 2.0 / Shibboleth / Azure AD Integration)      |
| - Custom Subdomain Tenant Routing (e.g. mit.campusarchive.com)                    |
| - Dedicated Search Engine Cluster Migration (Meilisearch / ElasticSearch)         |
| - Read Replica Database Splitting & Global CDN Optimization                       |
| - Institutional Analytics & Executive Export Reporting                            |
+-----------------------------------------------------------------------------------+
```

---
**End of Software Architecture Document**
