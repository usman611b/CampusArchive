# CampusArchive: Frontend Architecture & Design System Specification
**Production UI/UX Engineering & Design Document v1.0.0**
**Author:** Senior Frontend Architect & UI/UX Lead
**Date:** August 2026
**Target Stack:** React + Vite + Tailwind CSS + React Router + Framer Motion + React Context

---

## Table of Contents
1. [Frontend Architecture](#1-frontend-architecture)
2. [Design System & Tokens (Linear & Vercel Aesthetic)](#2-design-system--tokens)
3. [Component Library Specifications](#3-component-library-specifications)
4. [Page Specifications & Visual Layouts](#4-page-specifications--visual-layouts)
5. [Responsive Breakpoints & Mobile-First Strategy](#5-responsive-breakpoints--mobile-first-strategy)
6. [UX Guidelines & Micro-Interactions](#6-ux-guidelines--micro-interactions)
7. [Future-Ready AI Extension Slots](#7-future-ready-ai-extension-slots)

---

# 1. Frontend Architecture

### 1.1 Scalable Folder Structure
```
frontend/
├── public/                       # Static favicons, public manifest, fonts
├── src/
│   ├── assets/                   # Static images, SVGs, brand logos
│   ├── components/               # Atomic Design Component Library
│   │   ├── ui/                   # Primitive UI Controls (Buttons, Inputs, Badges, Modals)
│   │   ├── layout/               # Layout Containers (Navbar, Sidebar, Footer, AppShell)
│   │   ├── resource/             # Domain Resource Components (FileCard, PDFViewer, FilterBar)
│   │   ├── discussion/           # CommentTree, RatingWidget, MathRenderer
│   │   └── ai/                   # AI Extension Component Slots (AISummary, AIChatDrawer)
│   ├── context/                  # React Context Providers (State Management)
│   │   ├── AuthContext.tsx       # Auth Session & User Profile State
│   │   ├── ThemeContext.tsx      # Light/Dark Theme Switcher State
│   │   ├── ToastContext.tsx      # System Alert Toast State
│   │   └── FilterContext.tsx     # Resource Search & Facet Filter State
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useAuth.ts            # Auth Context Consumer
│   │   ├── useDebounce.ts        # Input Search Debouncer
│   │   ├── useFetch.ts           # API Query Hook
│   │   └── useMediaQuery.ts      # Responsive Breakpoint Observer
│   ├── layouts/                  # Top-Level Layout Guards & Outlets
│   │   ├── RootLayout.tsx        # Top-level Providers & Toast Container
│   │   ├── AppLayout.tsx         # Auth Shell (Sidebar + Navbar + Footer)
│   │   ├── AuthLayout.tsx        # Centered Auth Cards Shell
│   │   └── AdminLayout.tsx       # Admin Dashboard Shell
│   ├── pages/                    # Views / Page Components
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── BrowseResources.tsx
│   │   ├── ResourceDetail.tsx
│   │   ├── UploadResource.tsx
│   │   ├── MyUploads.tsx
│   │   ├── Bookmarks.tsx
│   │   ├── Notifications.tsx
│   │   ├── Profile.tsx
│   │   ├── Settings.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── NotFound.tsx
│   ├── router/                   # React Router Configuration & Guards
│   │   ├── index.tsx             # Router Specification & Lazy Routes
│   │   └── ProtectedRoute.tsx    # Role & Auth Router Guards
│   ├── services/                 # API Interceptor & Service Modules
│   │   ├── apiClient.ts          # Axios Instance with JWT Interceptor
│   │   ├── authService.ts
│   │   ├── resourceService.ts
│   │   └── userService.ts
│   ├── types/                    # Shared TypeScript Domain Contracts
│   │   ├── user.ts
│   │   ├── resource.ts
│   │   └── api.ts
│   ├── utils/                    # Formatters, Class Merger (clsx/tailwind-merge)
│   │   ├── cn.ts                 # Classname Utility (`clsx` + `twMerge`)
│   │   ├── formatDate.ts
│   │   └── formatBytes.ts
│   ├── index.css                 # Tailwind Directives & CSS Tokens
│   ├── main.tsx                  # React Entry point
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

### 1.2 Routing Structure & Declarative Tree
Powered by `react-router-dom` with code-splitting via `React.lazy()`:

```tsx
// Router Architecture Overview
const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <AuthLayout><Login /></AuthLayout> },
      { path: 'register', element: <AuthLayout><Register /></AuthLayout> },
      {
        element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'resources', element: <BrowseResources /> },
          { path: 'resources/:id', element: <ResourceDetail /> },
          { path: 'upload', element: <UploadResource /> },
          { path: 'my-uploads', element: <MyUploads /> },
          { path: 'bookmarks', element: <Bookmarks /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'profile/:id', element: <Profile /> },
          { path: 'settings', element: <Settings /> }
        ]
      },
      {
        path: 'admin',
        element: <ProtectedRoute requiredRole="ADMINISTRATOR"><AdminLayout /></ProtectedRoute>,
        children: [
          { index: true, element: <AdminDashboard /> }
        ]
      },
      { path: '*', element: <NotFound /> }
    ]
  }
];
```

### 1.3 State Management Architecture (React Context)
 lightweight, zero-boilerplate state architecture using modular React Contexts:
1. **AuthContext:** Holds `user` session object, `token`, `isAuthenticated`, `role`, and `login()/logout()` methods.
2. **ThemeContext:** Manages `theme` (`light` | `dark` | `system`) synced with `localStorage` and `document.documentElement` class list.
3. **ToastContext:** Exposes `showToast({ type: 'success'|'error', message })` to trigger global alert toasts.
4. **FilterContext:** Stores active resource filter states (`department`, `course`, `term`, `category`, `searchQuery`, `sortBy`).

### 1.4 API Client Layer (`apiClient.ts`)
* Built with Axios. Automatically injects `Authorization: Bearer <token>` from local session storage.
* Catches 401 Unauthorized responses to attempt token refresh or redirect gracefully to `/login`.

---

# 2. Design System & Tokens

Influenced by **Linear**, **Vercel**, **Notion**, and **GitHub**: Clean dark-mode first aesthetic, refined typography, subtle 1px border lines, dark background glows, and high-contrast text.

### 2.1 Color Palette Tokens (Tailwind HSL Schema)

#### Light Mode Palette
* **Background Primary:** `#FFFFFF` (`zinc-0`)
* **Background Secondary:** `#F4F4F5` (`zinc-100`)
* **Card / Surface:** `#FFFFFF` (`border: 1px solid #E4E4E7`)
* **Text Primary:** `#09090B` (`zinc-950`)
* **Text Secondary:** `#71717A` (`zinc-500`)
* **Brand Primary:** `#2563EB` (`blue-600` - Vibrant Academic Indigo/Blue)
* **Brand Accent:** `#4F46E5` (`indigo-600`)

#### Dark Mode Palette (Default Core Vibe)
* **Background Primary:** `#09090B` (`zinc-950` - Deep Void Dark)
* **Background Secondary:** `#18181B` (`zinc-900`)
* **Card / Surface:** `#121215` (`border: 1px solid #27272A`)
* **Text Primary:** `#FAFAFA` (`zinc-50`)
* **Text Secondary:** `#A1A1AA` (`zinc-400`)
* **Brand Primary:** `#3B82F6` (`blue-500`)
* **Brand Accent:** `#6366F1` (`indigo-500`)

#### State & Feedback Colors
* **Success:** `#22C55E` (`emerald-500`)
* **Warning:** `#F59E0B` (`amber-500`)
* **Error / Danger:** `#EF4444` (`red-500`)
* **Info:** `#06B6D4` (`cyan-500`)

### 2.2 Typography Scale
* **Font Family:** `Inter`, `Plus Jakarta Sans`, system-ui, sans-serif.
* **Heading Display:** `font-bold tracking-tight text-zinc-900 dark:text-zinc-50`.
* **Scale:**
  * `text-xs`: 12px / 16px line-height (Badges, Timestamps)
  * `text-sm`: 14px / 20px line-height (Body Copy, Table Cells, Form Labels)
  * `text-base`: 16px / 24px line-height (Subheadings, Default Body)
  * `text-lg`: 18px / 28px line-height (Section Subtitles)
  * `text-xl`: 20px / 28px line-height (Card Titles)
  * `text-2xl`: 24px / 32px line-height (Page Titles)
  * `text-4xl`: 36px / 40px line-height (Hero Subheadings)
  * `text-6xl`: 60px / 1.1 line-height (Main Hero Title)

### 2.3 Spacing, Border Radius & Elevation
* **Border Radius:**
  * `rounded-sm`: 4px (Badges, Micro-tags)
  * `rounded-md`: 6px (Buttons, Inputs, Tooltips)
  * `rounded-lg`: 8px (Dropdowns, Cards)
  * `rounded-xl`: 12px (Modals, Large Cards)
  * `rounded-2xl`: 16px (Hero Containers)
* **Shadows & Glassmorphism:**
  * `shadow-sm`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
  * `shadow-glow`: `0 0 25px -5px rgba(59, 130, 246, 0.25)` (Accent Glow)
  * `glass`: `backdrop-blur-md bg-zinc-950/70 border border-zinc-800/80`

### 2.4 Iconography
* **Icon Set:** `lucide-react` (Clean, 1.5px to 2px stroke width, consistent 20x20px baseline size).

---

# 3. Component Library Specifications

### 3.1 Primitive Controls

#### 1. Button Component
* **Variants:**
  * `primary`: Blue background (`bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-medium transition-colors`).
  * `secondary`: Subtle dark background (`bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700`).
  * `outline`: Ghost outline (`border border-zinc-700 text-zinc-300 hover:bg-zinc-900`).
  * `danger`: Red destructive action (`bg-red-600 hover:bg-red-500 text-white`).
  * `ghost`: Minimal background (`hover:bg-zinc-800 text-zinc-400 hover:text-white`).
* **Sizes:** `sm` (height: 32px), `md` (height: 40px), `lg` (height: 48px).
* **States:** Normal, Hover, Active, Focus Ring (`focus:ring-2 focus:ring-blue-500`), Disabled (`opacity-50 cursor-not-allowed`), Loading (Spinner replacing icon).

#### 2. Input & Search Bar Components
* **Styling:** Dark background (`bg-zinc-900/90 border border-zinc-800 focus:border-blue-500 text-zinc-100 placeholder-zinc-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500`).
* **Search Bar:** Prepend search icon (`lucide-search`), append shortcut hint badge (`CMD + K`), includes clear `X` button when active.

#### 3. Cards & Tables
* **Resource Card:** 1px border (`border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5`). Displays Category Badge, File Format Icon, Title, Department Code, Rating Stars, Download Count, and Uploader Avatar.
* **Data Table:** Clean, border-bottom rows (`divide-y divide-zinc-800 text-sm`). Sticky header row (`bg-zinc-900 text-zinc-400 font-semibold uppercase text-xs`). Hover states on row entries (`hover:bg-zinc-800/40`).

#### 4. Feedback Controls (Modal, Toast, Drawer)
* **Modal Overlay:** Backdrop blur overlay (`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in`). Centered card container with ESC key close handler.
* **Drawer (Sidepanel):** Slides in from right (`fixed right-0 top-0 h-full w-96 bg-zinc-950 border-l border-zinc-800 z-50 shadow-2xl`).
* **Toast Notification:** Floating alert card positioned bottom-right (`fixed bottom-4 right-4 z-50 bg-zinc-900 border border-zinc-800 rounded-lg p-4 shadow-xl flex items-center gap-3 animate-slide-up`).

#### 5. States (Skeleton, Empty, Error)
* **Loading Skeleton:** Pulsing gray blocks (`animate-pulse bg-zinc-800/60 rounded-md`).
* **Empty State:** Centered container with muted illustration icon, title, description, and primary CTA button.
* **Error State:** Warning alert box with retry button (`bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4`).

---

# 4. Page Specifications & Visual Layouts

### 4.1 Landing Page (`/`)
* **Hero Section:** Centered headline with glowing gradient text ("Preserving Knowledge. Empowering Students."), multi-tenant university selector, search bar with live auto-complete, and CTA buttons ("Explore Archive", "Upload Resource").
* **Feature Grid:** 3x2 grid showcasing High-Speed PDF Search, Community Ratings, Direct Cloud Storage, and Multi-University Archiving.
* **Live Stats Bar:** Counters showing total resources, active universities, and download metrics.
* **Footer:** Institutional links, copyright, and domain whitelisting request button.

### 4.2 Browse Resources Page (`/resources`)
* **Split Layout:**
  * **Left Sidebar (Desktop Filter Panel):** Multi-select facets (University, Department, Course, Document Type, Semester Year, Rating Threshold).
  * **Main Content Area:** Search query header, active filter tags chips with one-click clear, sorting dropdown (Relevance, Most Downloaded, Highest Rated, Newest), and resource card grid (or table view toggle).

### 4.3 Resource Detail Page (`/resources/:id`)
* **Top Header:** Course Code pill, Title, Uploader Profile, Academic Year, Term, and Action Buttons (Download Signed File, Bookmark, Share, Flag Report).
* **Split Layout Container:**
  * **Main Column (70%):** Embedded `pdf.js` interactive document viewer with zoom/page controls. Below viewer: Threaded comment discussion tree with LaTeX math rendering support.
  * **Right Sidebar (30%):** File Metadata details (File Size, MIME Type, Virus Scan Badge), Uploader Reputation Card, Rating breakdown distribution bar chart, and Related Course Resources list.

### 4.4 Upload Resource Wizard (`/upload`)
* **Multi-Step Drag-and-Drop Form:**
  * **Step 1 (File Drop Zone):** Drag & drop area for PDFs/DOCXs with instant client-side size/type validation and upload progress bar.
  * **Step 2 (Metadata Attribution):** Department dropdown, Course selector, Title, Description, Instructor Name, Category, Academic Term, and Tags.
  * **Step 3 (Review & Submit):** Summary preview card and final confirmation button.

### 4.5 User Dashboard (`/dashboard`)
* **Overview Analytics Cards:** Total Uploads, Earned Karma Points, Received Downloads, Saved Bookmarks.
* **Activity Grid:** Recent Uploads Status (Approved, Pending Review), Recommended Materials for Enrolled Courses, and Recent Announcements.

---

# 5. Responsive Breakpoints & Mobile-First Strategy

### 5.1 Breakpoint System
```javascript
// tailwind.config.js Breakpoint Map
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile Landscape / Small Tablets
      'md': '768px',   // Tablets (Portrait)
      'lg': '1024px',  // Laptops / Small Desktops (Sidebar Collapses Below)
      'xl': '1280px',  // Desktop (Full Layout)
      '2xl': '1536px'  // Ultra-wide Screens
    }
  }
}
```

### 5.2 Mobile Adaptation Strategy
* **Navigation:** Sidebar transitions into a sliding bottom-sheet or mobile hamburger slide-out drawer (`lg:hidden`).
* **Filter Panel:** Filters move from fixed left sidebar to a floating trigger button opening a full-screen mobile slide-up modal.
* **Resource Tables:** Tables transform into stacked card lists on screens `< 768px`.
* **Touch Targets:** All interactive buttons and inputs enforce minimum **48x48px touch boundary** sizes.

---

# 6. UX Guidelines & Micro-Interactions

1. **Framer Motion Animations:**
   * **Page Transitions:** Fade & subtle Y-axis slide (`initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}`).
   * **Hover Micro-Interactions:** Buttons & Cards scale up slightly (`whileHover={{ scale: 1.01 }}` `whileTap={{ scale: 0.98 }}`).
   * **List Staggering:** Staggered child list entry for search result cards (`staggerChildren: 0.05`).
2. **Keyboard Accessibility & Shortcuts:**
   * `CMD + K` or `/` opens global live search modal.
   * `ESC` key dismisses active drawers, modals, and dropdown menus.
   * Visible focus indicators (`focus-visible:ring-2 focus-visible:ring-blue-500`) across all tabbable controls.
3. **Optimistic UI Updates:** Instant visual state feedback when toggling bookmarks, upvoting comments, or submitting ratings prior to server response confirmation.

---

# 7. Future-Ready AI Extension Slots

The UI layout incorporates **pre-architected extension slots** so upcoming Phase 3 AI capabilities integrate natively without requiring UI redesigns.

```
+---------------------------------------------------------------------------------------------------+
|                                  RESOURCE DETAIL VIEW (AI READY)                                  |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | [AI SLOT 1: AI Document Summary Banner]                                                     |  |
|  | "✨ AI Summary: Key takeaways include 1. Integration by parts formula 2. Limit definitions"    |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  +----------------------------------------------------+  +-------------------------------------+  |
|  | Main Document Viewer (PDF Canvas)                  |  | Right Sidepanel                     |  |
|  |                                                    |  |                                     |  |
|  |                                                    |  | [AI SLOT 2: AI Study Chat Assistant]|  |
|  |                                                    |  | +---------------------------------+ |  |
|  |                                                    |  | | Chat UI: "Ask notes a question" | |  |
|  |                                                    |  | +---------------------------------+ |  |
|  +----------------------------------------------------+  +-------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

### 7.1 Specific AI Component Extension Slots
1. **AI Document Summary Slot (`components/ai/AISummaryCard.tsx`):** Expandable top banner on resource details displaying 3-bullet AI-generated summaries with a "Generated by AI" badge.
2. **AI Study Assistant Drawer Slot (`components/ai/AIChatDrawer.tsx`):** Fixed right-side chat widget trigger button allowing contextual Q&A against current document embeddings.
3. **AI Natural Language Search Toggle (`components/resource/SearchFilterBar.tsx`):** Toggle switch in the search bar ("✨ AI Semantic Search") switching mode from keyword matching to vector embedding search.
4. **AI Duplicate Flag Indicator (`components/resource/FileCard.tsx`):** Warning badge overlay for uploaders when AI duplicate detection flags high similarity.

---
**End of Frontend Architecture & Design System Specification**
