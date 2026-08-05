# CampusArchive: Future Engineering Roadmap

---

## Phase 1 — Architecture & Structural Foundation (Completed ✅)
- Refactored database ERD from loose files to course-centric relational models.
- Established 13-section Course Hub information architecture.
- Built 7-Step Guided Upload Wizard pipeline.
- Provisioned complete documentation suite under `/docs`.

---

## Phase 2 — Post-MVP Features (Roadmap)

### 1. Collaborative Real-Time Notes
- Notion-style block editor for collaborative study note creation.
- Real-time CRDT / WebSockets synchronization for study group note sessions.

### 2. AI Document Summarizer & Q&A Assistant
- Vector embeddings stored in PostgreSQL using `pgvector`.
- AI assistant providing chapter summaries, flashcards, and instant Q&A based on uploaded course notes.

### 3. Faculty Verification & TA Accreditation
- Verified badge accreditation for university professors and course TAs.
- Pinning official solution sets and course syllabi to the top of Course Hub sections.

### 4. Multi-University Institutional Federation
- Multi-tenant domain partitioning allowing separate university tenants (`mit.campusarchive.edu`, `stanford.campusarchive.edu`).
