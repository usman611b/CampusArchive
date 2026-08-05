# CampusArchive: Frontend Architecture Specification
**Framework:** React 18 + Vite + TypeScript + Tailwind CSS

---

## 1. Directory Structure

```text
frontend/
├── src/
│   ├── assets/              # Icons, logos, static illustrations
│   ├── components/
│   │   ├── academic/        # CourseHub, DepartmentCard, SemesterGrid
│   │   ├── home/            # LandingHero, FeaturesGrid, DepartmentExplorer
│   │   ├── layout/          # Navbar, Sidebar, Footer
│   │   ├── resource/        # ResourceCard, ResourceDetailsModal, UploadWizardModal
│   │   └── ui/              # Button, Card, Badge, Input, PageHeader
│   ├── context/             # AuthContext, ThemeContext
│   ├── hooks/               # useAcademics, useResources, useUploadWizard
│   ├── pages/
│   │   ├── DashboardView.tsx
│   │   ├── AcademicsView.tsx
│   │   ├── CourseHubView.tsx
│   │   ├── UploadResourceView.tsx
│   │   ├── ResourceLibraryView.tsx
│   │   ├── ProfileView.tsx
│   │   ├── AdminDashboardView.tsx
│   │   └── Login.tsx
│   ├── services/            # apiService, authService, academicService, resourceService
│   ├── types/               # TypeScript interfaces & domain models
│   ├── utils/               # cn (clsx/tailwind-merge), formatters, validators
│   ├── App.tsx              # Root router & view layout switcher
│   └── main.tsx             # DOM entry point
```

---

## 2. State Management Architecture

1. **Authentication State (`AuthContext`):** Session tokens, user profile model, role permissions.
2. **Academic Explorer State (`useAcademics`):** Currently selected department, program, semester, and active Course Hub ID.
3. **Guided Upload State (`useUploadWizard`):** 7-Step form wizard state tracking cascading selection step data before submission.
4. **Server Cache State (Axios / TanStack Query):** Cache-aside pattern handling async API data with optimistic UI updates.

---

## 3. UI Component Design Principles

- **Visual Preservation:** All cards, buttons, badges, glassmorphism overlays, and light/dark theme tokens are preserved across all new views.
- **Strict Theme Tokens:** Uses CSS variables `--color-foreground` and `--color-muted-foreground` to guarantee zero text contrast degradation across light and dark modes.
