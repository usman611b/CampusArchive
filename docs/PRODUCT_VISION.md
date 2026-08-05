# CampusArchive: Product Vision & Functional Requirements Specification
**Document Version:** 1.0.0  
**Tagline:** *Preserving Knowledge. Empowering Students.*  
**Target Audience:** University Undergraduate & Graduate Students, Teaching Assistants, Academic Moderators, and System Administrators.

---

## 1. Product Vision Statement

**CampusArchive** is the central academic knowledge platform engineered specifically for university student ecosystems. Unlike traditional, unorganized file shares (such as Google Drive folders or ephemeral messaging groups), CampusArchive organizes academic content around the **Course**—creating unified, database-driven **Course Hubs** that bring together lecture notes, past exam papers, assignments, lab manuals, projects, textbooks, and peer discussions.

It combines the structural rigors of **Canvas LMS**, the collaborative Q&A environment of **Stack Overflow**, the modular documentation capabilities of **Notion**, the structural hierarchy of **GitHub**, and the accessibility of **Google Drive**.

---

## 2. Core Mental Model: Course-Centric Knowledge

### 2.1 The Student Study Flow
Students do not study by searching for floating file names. Students study by preparing for specific courses within their semester.

```text
[ Academics Portal ]
        │
        ▼
[ Department ] ─── (e.g., Computer Science)
        │
        ▼
[ Program ] ────── (e.g., BS Computer Science)
        │
        ▼
[ Semester ] ───── (e.g., Semester 4)
        │
        ▼
[ Course Hub ] ─── (e.g., CS-201: Data Structures & Algorithms)
        │
  ┌─────┴───────┬────────────┬──────────────┬─────────────┬─────────────┐
  │             │            │              │             │             │
[Notes]   [Past Papers] [Assignments]   [Projects]   [Lab Manuals]  [Discussion]
(25 sets)   (30 exams)    (12 rubrics)   (8 repos)    (10 guides)   (Peer Q&A)
```

---

## 3. User Personas

### Persona 1: Usman (Undergraduate Computer Science Senior)
- **Goal:** Quickly locate 3 years of past midterm and final exam papers with verified solution sets for upcoming finals.
- **Pain Point:** Frustrated by dead links, broken WhatsApp group attachments, and missing solutions.
- **CampusArchive Workflow:** Navigates directly to `Academics` → `BSCS` → `Semester 5` → `Database Systems` → `Past Papers` → Views rated 5-star verified midterm papers with student discussions.

### Persona 2: Ayesha (High-Achieving Contributor)
- **Goal:** Share comprehensive, handwritten and typed lecture notes with peers while building a verified academic reputation portfolio.
- **Pain Point:** No centralized platform to archive notes for future junior cohorts once the semester ends.
- **CampusArchive Workflow:** Uses the 7-Step Upload Wizard to publish structured notes under the `Data Structures` Course Hub, earning karma points and contributor badges.

### Persona 3: Dr. Hassan (Academic Moderator / TA)
- **Goal:** Ensure uploaded past papers and solution guides do not violate institutional academic integrity or contain inappropriate content.
- **Pain Point:** Lack of moderation queues on public cloud drives.
- **CampusArchive Workflow:** Reviews student submissions in the **Admin Moderation Portal**, verifying course metadata attribution before approving files for public indexing.

---

## 4. Functional Requirements Matrix

| ID | Module | Feature Description | User Role | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | **Academics** | Browse academic taxonomy (`Department` → `Program` → `Semester` → `Course`) | All Users | P0 (Critical) |
| **FR-02** | **Course Hub** | View structured course sections (Notes, Past Papers, Assignments, Projects, Books) | All Users | P0 (Critical) |
| **FR-03** | **Upload Wizard** | 7-Step guided wizard enforcing course metadata attribution prior to file upload | Students | P0 (Critical) |
| **FR-04** | **Moderation Queue**| Admin triage portal to approve or reject pending student resource submissions | Moderators | P0 (Critical) |
| **FR-05** | **Global Search** | Faceted multi-field search (title, course code, teacher, tags, category) | All Users | P0 (Critical) |
| **FR-06** | **Community Q&A** | Threaded discussion comments under resources and course sections | Students | P1 (High) |
| **FR-07** | **Peer Rating** | 5-Star rating system with Bayesian weighted averaging for quality sorting | Students | P1 (High) |
| **FR-08** | **Bookmarks** | Personal saved resource collections accessible from user sidebar | Students | P1 (High) |

---

## 5. Non-Functional Requirements (NFRs)

- **Performance:** Sub-100ms API query execution for course catalog navigation and search filtering.
- **Storage Efficiency:** Direct client-to-storage upload pipeline bypassing API compute bottleneck.
- **Security:** Zero-trust RBAC authorization, strict file MIME validation, pre-signed temporary URLs.
- **UI/UX Consistency:** 100% preservation of SaaS visual identity, responsive glassmorphism styling, and native light/dark theme contrast.
