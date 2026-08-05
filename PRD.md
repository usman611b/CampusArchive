# CampusArchive: Product Requirements Document (PRD)
**Enterprise SaaS Product Specification v1.0.0**
**Author:** Senior Product Manager
**Date:** August 2026
**Target Delivery:** Initial MVP Deployment (Single University, $0 Budget Stack)

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Goals](#3-product-goals)
4. [Target Users & Ecosystem](#4-target-users--ecosystem)
5. [User Personas](#5-user-personas)
6. [User Stories & Acceptance Criteria](#6-user-stories--acceptance-criteria)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [MVP Feature Scope Matrix](#9-mvp-feature-scope-matrix)
10. [Key Success Metrics & KPIs](#10-key-success-metrics--kpis)
11. [Risks, Mitigations & Assumptions](#11-risks-mitigations--assumptions)
12. [Explicitly Out of Scope for MVP](#12-explicitly-out-of-scope-for-mvp)
13. [Product Roadmap](#13-product-roadmap)

---

# 1. Executive Summary

### 1.1 Product Overview
**CampusArchive** ("*Preserving Knowledge. Empowering Students.*") is a cloud-based academic resource management platform engineered for university ecosystems. It provides a central, structured digital repository where university students can upload, index, search, download, and preserve high-quality course study assets—including past midterm/final examinations, lecture notes, lab manuals, homework solutions, syllabi, and research summaries.

### 1.2 Mission Statement
To democratize access to institutional academic knowledge by building a persistent, multi-generational resource platform that empowers students to achieve academic excellence through peer-driven collaboration.

### 1.3 Strategic Vision
To evolve from a single-university MVP into the standard multi-tenant digital knowledge repository used across 500+ higher education institutions globally, augmented by native AI document intelligence.

### 1.4 Target Audience
* Primary: Undergraduate and graduate university students searching for course preparation materials.
* Secondary: Teaching Assistants (TAs) and Department Moderators verifying academic integrity.
* Tertiary: Department Heads and System Administrators overseeing institutional course catalogs.

---

# 2. Problem Statement

University academic resources are currently severely fragmented, leading to lost institutional knowledge and unequal student learning access.

```
+---------------------------------------------------------------------------------------------------+
|                                 CURRENT PAIN POINTS IN UNIVERSITIES                               |
|                                                                                                   |
|  [ Ephemeral Chat Groups ]   --> Past exams shared on WhatsApp/Telegram disappear when seniors    |
|                                  graduate.                                                        |
|  [ Google Drive Dead Links ] --> Unindexed Google Drive folders lead to broken permissions, dead  |
|                                  links, and duplicate clutter.                                    |
|  [ Zero Quality Control ]    --> Students waste hours studying incorrect homework solutions or    |
|                                  outdated exam keys.                                              |
|  [ Poor Metadata Search ]    --> Free file shares lack filtering by Department Code, Professor,   |
|                                  Semester, or Exam Type.                                          |
+---------------------------------------------------------------------------------------------------+
```

### Why Existing Solutions Fail
1. **Chat Apps (WhatsApp, Discord, Telegram):** Files are unindexed, unsearchable, ephemeral, and lost once a semester ends.
2. **Generic Cloud Storage (Google Drive, Dropbox):** Folders rely on manual link sharing, lack structured taxonomy filtering (Course Code, Term, Professor), and offer zero community ratings or moderation queues.
3. **Institutional LMS (Canvas, Blackboard):** Course pages expire at the end of each term, wiping historical study guides and preventing underclassmen from accessing past exam solutions.

---

# 3. Product Goals

### 3.1 Business Goals
* Validate product-market fit at an initial pilot university within 3 months of launch.
* Achieve **10,000 active student users** and index **5,000 high-quality academic documents** during Phase 1.
* Maintain a strict **$0.00/month infrastructure operating cost** during the MVP phase using free-tier cloud resources.

### 3.2 User Goals
* Find course-specific past papers and lecture notes in **< 15 seconds** via instant multi-facet search.
* Upload and share study notes effortlessly via a 3-step drag-and-drop interface.
* Verify solution accuracy through community ratings, upvotes, and peer comment discussions.

### 3.3 Technical Goals
* Build a production-ready, stateless Node.js/Express monolith deployed on AWS EC2 Free Tier (`t2.micro`).
* Offload binary file transfers directly to Supabase Storage pre-signed URLs to keep server memory usage < 400MB.
* Enforce 100% database Row Level Security (RLS) and sub-150ms API response latency.

---

# 4. Target Users & Ecosystem

```
+---------------------------------------------------------------------------------------------------+
|                                    CAMPUSARCHIVE USER ECOSYSTEM                                   |
|                                                                                                   |
|  [ Student ]        --> Consumes notes, searches past papers, uploads solutions, rates quality    |
|  [ Moderator / TA ] --> Reviews pending uploads, triages flagged reports, curates course catalog  |
|  [ Administrator ]  --> Manages roles, oversees university taxonomy, reviews immutable audit logs |
|  [ Faculty (P4) ]   --> Verifies official syllabus materials, posts official course announcements |
+---------------------------------------------------------------------------------------------------+
```

---

# 5. User Personas

### Persona 1: Alex Chen (Sophomore Computer Science Student)
* **Demographics:** 19 years old, BSCS Major, tech-savvy, active smartphone user.
* **Goals:** Wants to ace his CS101 Midterm by practicing past exam questions and reviewing senior student lecture notes.
* **Frustrations:** Frustrated by dead Google Drive links in class Discord channels and outdated exam keys without explanations.
* **Platform Usage:** Searches for CS101 midterm resources, bookmarks prep kits, reads comment solutions, and rates helpful notes.

### Persona 2: Priya Patel (Graduate TA & Department Moderator)
* **Demographics:** 23 years old, MS Software Engineering student, Computer Science Department TA.
* **Goals:** Wants to ensure uploaded study materials maintain high academic integrity and comply with university guidelines.
* **Frustrations:** Annoyed by spam uploads, incorrect solution keys, and copyrighted textbook scans uploaded by junior students.
* **Platform Usage:** Reviews pending upload submissions in the moderation queue, approves valid materials, rejects invalid uploads with clear feedback, and resolves student abuse flags.

### Persona 3: Dr. Robert Vance (Department Chair & System Admin)
* **Demographics:** 48 years old, Academic Administrator overseeing department curriculum.
* **Goals:** Desires a organized, digital repository preserving institutional knowledge across graduating classes.
* **Frustrations:** Dislikes losing senior thesis summaries and top student study guides when students graduate each year.
* **Platform Usage:** Monitors platform telemetry dashboards, updates department course catalogs, manages moderator role permissions, and inspects security audit logs.

---

# 6. User Stories & Acceptance Criteria

### Epic 1: Authentication & Institutional Verification
* **User Story 1.1:** As a student, I want to register using my official university `.edu` email address so that I can access course materials specific to my university.
  * **Acceptance Criteria:**
    * Registration form rejects non-institutional email domains (e.g., `@gmail.com`).
    * A verification email containing a secure link is dispatched immediately.
    * Account remains in `PENDING_VERIFICATION` status until the link is clicked.

### Epic 2: Resource Discovery & Search
* **User Story 2.1:** As a student, I want to filter resources by Course Code, Category (Midterm Exam, Notes), and Academic Term so that I can quickly find relevant study guides.
  * **Acceptance Criteria:**
    * Search filter bar dynamically updates results without full page reloads.
    * Results display course code, title, document type badge, rating average, download count, and uploader profile.
    * Empty state displays a helpful message and prompt to upload missing course materials.

### Epic 3: Resource Submission & Direct Upload
* **User Story 3.1:** As a student, I want to drag and drop my lecture notes PDF so that I can contribute to my department's archive.
  * **Acceptance Criteria:**
    * Client-side validation rejects files larger than 50MB or unapproved MIME types.
    * Progress bar indicates real-time upload status via pre-signed storage URLs.
    * Submitted resource is placed in `PENDING_REVIEW` queue until approved by a moderator.

### Epic 4: Moderation & Quality Assurance
* **User Story 4.1:** As a department moderator, I want to review pending resource submissions so that I can approve clean study notes and reject spam.
  * **Acceptance Criteria:**
    * Moderation dashboard lists pending uploads chronologically.
    * Moderator can preview document pages in-browser before taking action.
    * Rejection action requires selecting a reason code (e.g., "Copyright Violation", "Low Quality"), which sends an in-app notification to the uploader.

---

# 7. Functional Requirements

### 7.1 Module Specifications

```
+-----------------------------------------------------------------------------------------------+
|                                 FUNCTIONAL MODULE MATRIX                                      |
|                                                                                               |
|  [ Auth Module ]       --> Registration, Login, Email Verification, Password Reset, JWT       |
|  [ Taxonomy Module ]   --> University, Department, Program, Semester, Course Catalogs         |
|  [ Resource Module ]   --> Direct Upload, Metadata Tagging, Approval Queue, Downloads         |
|  [ Search Module ]     --> Keyword FTS, Multi-Facet Filters, Trigram Typo Matching            |
|  [ Engagement Module ] --> Threaded Comments (LaTeX), 5-Star Ratings, One-Click Bookmarks     |
|  [ Admin Module ]      --> Moderation Queue, User Bans, Role Elevation, System Analytics       |
+-----------------------------------------------------------------------------------------------+
```

#### 1. Authentication & Identity
* Support `.edu` email domain restriction during registration.
* Password hashing enforced via Argon2id / Supabase Auth.
* JWT stateless session management (15-minute access token, 7-day HttpOnly refresh token).

#### 2. Resource Management
* Support file types: PDF, DOCX, PPTX, TXT, ZIP, PNG, JPG, WEBP.
* Mandatory metadata attribution: Title, Description, Department, Course Code, Professor Name, Academic Year, Term Name, Category Type.
* Version tracking for updated document revisions.

#### 3. Search & Discovery
* Full-text keyword search matching against document titles, instructor names, and descriptions.
* Multi-facet filter combination (Department, Course Code, Exam Type, Semester, Minimum Rating).
* Dynamic sorting by Relevance, Most Downloaded, Highest Rated, and Recency.

#### 4. Engagement & Community
* Nested 2-level comment discussion threads supporting LaTeX math equations (`$...\$` rendering).
* 1 to 5 star rating review system (One rating per user per resource).
* Personal user bookmark collections ("Exam Prep Kits").

#### 5. Administration & Moderation
* Pending review queue for moderators.
* User flag triage queue for reporting copyright or offensive content.
* Role elevation (Student -> Moderator) and user suspension controls.

---

# 8. Non-Functional Requirements

### 8.1 NFR Specifications
* **Performance:** API response times < 150ms for 95% of requests (p95). Search query latency < 200ms across 1,000,000+ indexed database records. Page First Contentful Paint (FCP) < 1.2s.
* **Security:** TLS 1.3 encryption in transit, AES-256 at rest, strict OWASP defenses (Rate limiting, Helmet security headers, CORS origin whitelist, Zod input sanitization, Supabase RLS row isolation).
* **Reliability & Availability:** Target **99.9% uptime SLA**. Database continuous WAL Point-In-Time Recovery (**RPO < 5 mins**, **RTO < 30 mins**).
* **Accessibility:** Full **WCAG 2.1 AA Compliance** (screen-reader support, keyboard navigation, high contrast UI modes, min 48x48px touch targets).
* **Responsive Design:** Mobile-first fluid responsive layouts across Mobile (<640px), Tablet (640-1024px), Desktop (1024-1440px), and Ultra-wide (>1440px).
* **Scalability:** Stateless compute architecture capable of expanding from a single EC2 Free-Tier instance up to autoscaling container clusters without code refactoring.

---

# 9. MVP Feature Scope Matrix

```
+--------------------------------------------------------------------------------------------------+
|                                    MVP FEATURE SCOPE MATRIX                                      |
|                                                                                                  |
|  MUST HAVE (P0 - Critical MVP Launch)                                                             |
|  - Email Registration (.edu) & JWT Login                                                         |
|  - Direct S3 File Upload (Pre-signed URLs) & Download Link Signing                               |
|  - Course Catalog Taxonomy (Department, Course Code, Term)                                       |
|  - Keyword Search & Multi-Facet Filtering                                                        |
|  - In-Browser PDF Document Viewer                                                                |
|  - Moderation Approval Queue for TAs/Admins                                                       |
|                                                                                                  |
|  SHOULD HAVE (P1 - High Priority Post-Launch)                                                    |
|  - 5-Star Ratings & Review Text                                                                  |
|  - Threaded Comments with LaTeX Math Support                                                     |
|  - Personal Bookmark Collections                                                                 |
|  - Student Karma Reputation Points & Badges                                                      |
|                                                                                                  |
|  NICE TO HAVE (P2 - Medium Priority)                                                             |
|  - Gamified Department Leaderboard                                                               |
|  - In-App Notification Inbox Dropdown                                                            |
|  - Dark / Light Theme Selector                                                                   |
+--------------------------------------------------------------------------------------------------+
```

---

# 10. Key Success Metrics & KPIs

```
+--------------------------------------------------------------------------------------------------+
|                                      KEY PERFORMANCE INDICATORS                                   |
|                                                                                                  |
|  [ User Acquisition ]  --> 10,000 Registered Verified Students within 90 Days                   |
|  [ Content Growth ]    --> 5,000 Approved Resource Uploads within 90 Days                        |
|  [ Platform Activity ] --> 50,000 Total Document Downloads & 70% Monthly Active User (MAU) Ret   |
|  [ Engagement ]        --> > 4.2 / 5.0 Average User Satisfaction Score (CSAT Survey)             |
|  [ Operational SLA ]   --> < 12 Hours Average Moderation Queue Triage SLA Time                   |
+--------------------------------------------------------------------------------------------------+
```

---

# 11. Risks, Mitigations & Assumptions

### 11.1 Technical & Operational Risk Analysis

| Risk Description | Severity | Impact | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **EC2 Free-Tier Memory Limits** | High | Server crash due to Node.js 1GB RAM bounds | Offload binary uploads directly to Supabase Storage via Pre-Signed URLs; set PM2 `max_memory_restart: '400M'`. |
| **Low Quality / Spam Uploads** | High | Degrades platform trust & search relevance | Mandatory TA/Moderator approval queue before resources become publicly indexed; community rating system. |
| **Copyright / DMCA Flags** | Critical | Legal liability for copyrighted materials | Built-in report user flag triage tool, DMCA takedown request path, and immediate moderator purge capability. |
| **Cold Start User Friction** | Medium | Low initial document search volume | Seed initial course catalog with public domain syllabi, open-source lecture notes, and faculty-approved prep kits. |

---

# 12. Explicitly Out of Scope for MVP

To guarantee delivery within the $0 budget and 3-month engineering timeline, the following features are **explicitly excluded from the Phase 1 MVP**:
1. **Multi-University Multi-Tenant Isolation:** MVP focuses strictly on 1 pilot university; multi-tenant subdomain routing is deferred to Phase 4.
2. **AI Document Processing:** AI vector search, automated LLM document summaries, document Q&A chat sidepanels, and pHash duplicate detection are deferred to Phase 3.
3. **Native Mobile Applications:** iOS and Android native apps are out of scope (mobile PWA web responsive UI is used instead).
4. **Real-Time Synchronous Chat:** Synchronous chat rooms are excluded (asynchronous threaded document comments are used instead).

---

# 13. Product Roadmap

```
Phase 1: MVP Core Architecture (Months 1–3)
+-----------------------------------------------------------------------------------+
| - Baseline Database Schemas, Supabase Auth & JWT Session Engine                   |
| - Institutional Department & Course Catalogs                                      |
| - Direct Pre-Signed Upload Pipeline & PDF Document Viewer                         |
| - Full-Text Search & Multi-Facet Filters                                          |
| - TA & Moderator Approval Triage Dashboard                                        |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
Phase 2: Community & Engagement Infrastructure (Months 4–6)
+-----------------------------------------------------------------------------------+
| - 5-Star Ratings & Peer Review Feedback Engine                                    |
| - Threaded Comments with LaTeX Math Rendering                                     |
| - Personal Collections & One-Click Bookmarks                                      |
| - Gamified Karma Reputation Points & Contributor Badges                           |
| - In-App Notification Dropdown Inbox                                              |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
Phase 3: Intelligence & Advanced AI Capabilities (Months 7–9)
+-----------------------------------------------------------------------------------+
| - Vector Semantic Search (pgvector HNSW Cosine Similarity Queries)                 |
| - Automated AI PDF Summarizer (3-bullet key takeaway generation)                  |
| - Interactive Study Assistant Chat Sidepanel (Contextual Document QA)            |
| - AI Duplicate Upload Detection (Perceptual pHash & Embedding Distance)            |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
Phase 4: Multi-University Platform & Enterprise SaaS (Months 10–12)
+-----------------------------------------------------------------------------------+
| - Multi-Tenant Domain Routing (e.g. mit.campusarchive.com)                        |
| - Institutional Single Sign-On (SAML 2.0 / Shibboleth / Azure AD Integration)      |
| - Dedicated Search Engine Cluster Migration (Meilisearch / ElasticSearch)         |
| - Executive Analytics & Institutional Compliance Reporting                        |
+-----------------------------------------------------------------------------------+
```

---
**End of Product Requirements Document**
