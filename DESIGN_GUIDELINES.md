# CampusArchive: UI/UX Design Guidelines & Architecture Bible
**Single Source of Truth for Frontend Engineers & AI Agents v1.0.0**
**Author:** Senior Product Designer & UI Architect
**Date:** August 2026
**Target Design Framework:** React + Tailwind CSS + Framer Motion + Lucide Icons

---

## Executive Summary
This document defines the authoritative design system, component standards, visual tokens, and interaction rules for **CampusArchive** ("*Preserving Knowledge. Empowering Students.*"). 

All frontend interfaces must adhere strictly to these guidelines to ensure a cohesive, accessible, hyper-performant, and visually stunning SaaS application inspired by **Linear**, **Vercel**, **Notion**, **GitHub**, **Stripe Dashboard**, **Google Drive**, and **Apple HIG**.

---

## Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Visual Identity](#2-visual-identity)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Grid System](#5-grid-system)
6. [Layout Rules](#6-layout-rules)
7. [Spacing Rules](#7-spacing-rules)
8. [Border Radius Rules](#8-border-radius-rules)
9. [Shadow Rules & Elevation](#9-shadow-rules--elevation)
10. [Iconography](#10-iconography)
11. [Buttons](#11-buttons)
12. [Forms & Inputs](#12-forms--inputs)
13. [Cards](#13-cards)
14. [Tables](#14-tables)
15. [Search Components](#15-search-components)
16. [Upload Components](#16-upload-components)
17. [Empty States](#17-empty-states)
18. [Loading States](#18-loading-states)
19. [Error States](#19-error-states)
20. [Toast Notifications](#20-toast-notifications)
21. [Modal & Dialog Design](#21-modal--dialog-design)
22. [Sidebar Rules](#22-sidebar-rules)
23. [Navbar Rules](#23-navbar-rules)
24. [Dashboard Rules](#24-dashboard-rules)
25. [Animation Guidelines](#25-animation-guidelines)
26. [Responsive Rules](#26-responsive-rules)
27. [Accessibility Rules (WCAG 2.1 AA)](#27-accessibility-rules-wcag-21-aa)
28. [Dark Mode System Rules](#28-dark-mode-system-rules)
29. [Naming Conventions](#29-naming-conventions)
30. [Component Reusability Rules](#30-component-reusability-rules)
31. [UX Best Practices](#31-ux-best-practices)
32. [Performance Best Practices](#32-performance-best-practices)

---

# 1. Design Philosophy

CampusArchive follows **5 Core UI/UX Principles**:

1. **Precision & Speed (Linear Influence):** Instant feedback loops, keyboard shortcuts (`CMD + K`), sub-100ms UI transitions, and zero artificial delays.
2. **Subtle Dark Mode Elegance (Vercel Influence):** Deep void backgrounds (`#09090B`), crisp 1px borders (`#27272A`), high-contrast text, and accent glow shadows.
3. **Structured Clarity (Notion & Google Drive Influence):** Deeply organized taxonomy trees, clean breadcrumbs, structured document metadata, and intuitive file exploration.
4. **Dense Technical Utility (GitHub Influence):** Information-dense data tables, clear status indicators, explicit commit/upload badges, and zero wasted white space.
5. **Tactile Feedback (Stripe & Apple HIG Influence):** Subtle hover elevations, micro-animations, clear state indicators, and accessible focus rings.

---

# 2. Visual Identity

* **Product Name:** CampusArchive
* **Tagline:** Preserving Knowledge. Empowering Students.
* **Brand Aesthetic:** Professional academic SaaS—modern, trustworthy, dark-mode first, and hyper-focused on readability and speed.
* **Voice & Tone:** Direct, helpful, authoritative, and concise.

---

# 3. Color System

CampusArchive uses a curated **Tailwind HSL Color System** built around `zinc` neutral grays and vibrant `blue`/`indigo` accents.

### 3.1 Dark Mode Palette (Default Core Vibe)
* **Background Root:** `#09090B` (`zinc-950`)
* **Background Surface / Card:** `#121215` (`zinc-900/60` with `border-zinc-800/80`)
* **Background Secondary / Hover:** `#18181B` (`zinc-900`)
* **Border Lines:** `#27272A` (`zinc-800`) / Subtle: `#3F3F46` (`zinc-700`)
* **Text Primary:** `#FAFAFA` (`zinc-50`)
* **Text Secondary:** `#A1A1AA` (`zinc-400`)
* **Text Muted:** `#71717A` (`zinc-500`)
* **Brand Primary:** `#3B82F6` (`blue-500`) / Hover: `#2563EB` (`blue-600`)
* **Brand Accent Glow:** `rgba(59, 130, 246, 0.25)`

### 3.2 Light Mode Palette
* **Background Root:** `#FFFFFF` (`white`)
* **Background Surface:** `#F4F4F5` (`zinc-100`)
* **Border Lines:** `#E4E4E7` (`zinc-200`)
* **Text Primary:** `#09090B` (`zinc-950`)
* **Text Secondary:** `#71717A` (`zinc-500`)
* **Brand Primary:** `#2563EB` (`blue-600`)

### 3.3 Semantic State Colors
* **Success:** `#22C55E` (`emerald-500`) | Background: `rgba(34, 197, 94, 0.1)`
* **Warning:** `#F59E0B` (`amber-500`) | Background: `rgba(245, 158, 11, 0.1)`
* **Danger / Error:** `#EF4444` (`red-500`) | Background: `rgba(239, 68, 68, 0.1)`
* **Info / Badge:** `#06B6D4` (`cyan-500`) | Background: `rgba(6, 182, 212, 0.1)`

---

# 4. Typography

* **Font Family:** `Inter`, `Plus Jakarta Sans`, system-ui, sans-serif.
* **Font Weights:** `Light (300)`, `Regular (400)`, `Medium (500)`, `Semibold (600)`, `Bold (700)`.

### 4.1 Typography Hierarchy & Utility Classes
| Level | Font Size / Line Height | Tracking | Tailwind Utility | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | 60px / 1.1 | `-0.02em` | `text-6xl font-bold tracking-tight` | Main Landing Page Hero |
| **Page Header** | 30px / 36px | `-0.01em` | `text-3xl font-bold tracking-tight` | Top-level view headers |
| **Section Title** | 24px / 32px | `-0.01em` | `text-2xl font-semibold tracking-tight` | Section headers, Modal titles |
| **Card Heading** | 18px / 28px | `normal` | `text-lg font-semibold` | Resource Card titles |
| **Body Primary** | 14px / 20px | `normal` | `text-sm text-zinc-200` | Default body copy, Inputs |
| **Body Muted** | 14px / 20px | `normal` | `text-sm text-zinc-400` | Secondary descriptions |
| **Caption / Badge**| 12px / 16px | `0.01em` | `text-xs text-zinc-500 font-medium` | Metadata pills, timestamps |

---

# 5. Grid System

* **12-Column Responsive Layout Grid:**
  * Desktop (≥1024px): 12 Columns, 24px Gutter (`gap-6`).
  * Tablet (768px–1023px): 6 Columns, 16px Gutter (`gap-4`).
  * Mobile (<768px): 1 or 2 Columns, 12px Gutter (`gap-3`).
* **Container Max-Widths:**
  * Content Views: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
  * Auth Cards: `max-w-md mx-auto`
  * Reading / Document Views: `max-w-4xl mx-auto`

---

# 6. Layout Rules

### 6.1 Layout Shells
1. **`AppShell` (Dashboard & Workspace Views):**
   * Fixed Left Sidebar (240px width on desktop).
   * Fixed Top Navbar (64px height).
   * Scrollable Main Viewport (`flex-1 overflow-y-auto p-6 bg-zinc-950`).
2. **`AuthShell` (Login / Register):**
   * Centered card layout on glowing dark background with subtle background grid vectors.
3. **`AdminShell` (Moderation Console):**
   * Sidebar with dedicated admin section indicators (Red/Amber badges).

---

# 7. Spacing Rules

CampusArchive strictly enforces a **4px Baseline Spacing Grid**:

* `gap-1` / `p-1` = 4px (Micro spacing)
* `gap-2` / `p-2` = 8px (Compact spacing, button icon padding)
* `gap-3` / `p-3` = 12px (Form control padding)
* `gap-4` / `p-4` = 16px (Standard card padding, grid gap)
* `gap-6` / `p-6` = 24px (Section spacing, main view padding)
* `gap-8` / `p-8` = 32px (Large container padding)
* `gap-12` / `p-12` = 48px (Hero section spacing)

---

# 8. Border Radius Rules

* **`rounded-sm` (4px):** Badges, micro-tags, tooltips.
* **`rounded-md` (6px):** Buttons, text inputs, selects, dropdown items.
* **`rounded-lg` (8px):** Dropdown menus, small callouts.
* **`rounded-xl` (12px):** Resource Cards, Data Tables, Drawer containers.
* **`rounded-2xl` (16px):** Modals, Hero containers.
* **`rounded-full`:** Avatars, pill badges, status indicator dots.

---

# 9. Shadow Rules & Elevation

CampusArchive uses 4 distinct elevation levels:

* **Level 0 (Flat):** `border border-zinc-800/80 bg-zinc-900/40`
* **Level 1 (Card Hover):** `shadow-sm hover:border-zinc-700 hover:shadow-md transition-all`
* **Level 2 (Dropdowns & Popovers):** `shadow-lg bg-zinc-900 border border-zinc-800 z-40`
* **Level 3 (Modals & Drawers):** `shadow-2xl bg-zinc-950 border border-zinc-800 z-50`
* **Level 4 (Accent Glow):** `shadow-[0_0_25px_-5px_rgba(59,130,246,0.25)]`

---

# 10. Iconography

* **Icon Library:** `lucide-react`.
* **Standard Size:** `w-5 h-5` (20x20px) for standard UI actions; `w-4 h-4` (16x16px) for badges and buttons.
* **Stroke Width:** `1.5px` to `2px` (Consistent clean line weight).
* **Color Rule:** Icons inherit parent text color (`text-zinc-400 hover:text-white`).

---

# 11. Buttons

### 11.1 Button Variants & Specifications

```
+-----------------------------------------------------------------------------------------------+
|                                    BUTTON VARIANT SPEC                                        |
|                                                                                               |
|  [ Primary ]   --> bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-sm               |
|  [ Secondary ] --> bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700          |
|  [ Outline ]   --> border border-zinc-700 text-zinc-300 hover:bg-zinc-800/60                  |
|  [ Ghost ]     --> hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100                     |
|  [ Danger ]    --> bg-red-600 hover:bg-red-500 text-white font-medium                           |
+-----------------------------------------------------------------------------------------------+
```

### 11.2 Do's & Don'ts for Buttons
* **DO:** Include spinner icons during loading states and disable button clicks (`disabled opacity-50`).
* **DO:** Enforce minimum 48x48px touch boundaries on mobile screens.
* **DON'T:** Use multiple Primary buttons in the same card or view container.
* **DON'T:** Use generic button text like "Click Here"; use explicit verbs ("Download PDF", "Approve Resource").

---

# 12. Forms & Inputs

### 12.1 Input Controls
* **Default Input Class Pattern:**
  `bg-zinc-900/90 border border-zinc-800 focus:border-blue-500 text-zinc-100 placeholder-zinc-500 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`
* **Labels:** Always placed above input field (`text-xs font-medium text-zinc-300 mb-1.5 block`).
* **Required Indicators:** Red asterisk (`<span class="text-red-500">*</span>`).
* **Error Text:** Displayed directly beneath input (`text-xs text-red-400 mt-1 flex items-center gap-1`).

---

# 13. Cards

### 13.1 Resource Card Standards
* **Container:** `border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 relative group`
* **Header Slot:** Category Pill badge (e.g. `EXAM_MIDTERM`), File Type Icon (`PDF`), Academic Year.
* **Body Slot:** Title (`text-lg font-semibold group-hover:text-blue-400 transition-colors`), Instructor Name, Description.
* **Footer Slot:** Star Rating Average (`4.85 ★`), Download Count (`342 downloads`), Uploader Avatar pill.

---

# 14. Tables

### 14.1 Data Table Standards
* **Container:** `border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/30`
* **Header Row:** `bg-zinc-900/80 border-b border-zinc-800 text-xs font-semibold uppercase tracking-wider text-zinc-400`
* **Body Rows:** `divide-y divide-zinc-800/60 text-sm text-zinc-300 hover:bg-zinc-800/40 transition-colors`
* **Cell Padding:** `px-4 py-3.5`

---

# 15. Search Components

* **Global Search Bar (`CMD + K`):**
  * Icon: `lucide-search` prepended inside input container.
  * Shortcut Hint: Badge prepended to right side (`<kbd class="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 rounded px-1.5 py-0.5">⌘K</kbd>`).
  * Autocomplete Dropdown: Absolute positioning popover showing instant course code and title suggestions.

---

# 16. Upload Components

* **Drag-and-Drop Zone:**
  * Border: Dotted outline (`border-2 border-dashed border-zinc-700 hover:border-blue-500 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all rounded-xl p-8 text-center cursor-pointer`).
  * Upload Progress Bar: Animated bar (`bg-blue-600 h-2 rounded-full transition-all duration-300`).

---

# 17. Empty States

* **Layout:** Centered column container (`flex flex-col items-center justify-center p-12 text-center`).
* **Visual Anchor:** Muted icon inside rounded circle container (`w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mb-4`).
* **Content:** Primary Headline (`text-base font-semibold text-zinc-200`), Description (`text-sm text-zinc-400 max-w-sm mb-6`), and Primary CTA Button.

---

# 18. Loading States

* **Skeleton Loaders:**
  * Class: `animate-pulse bg-zinc-800/60 rounded-md`
  * Never use full-screen spinners for content areas; use skeleton card grids that match target layout wireframes.

---

# 19. Error States

* **Form Validation Error:** Red border highlight (`border-red-500/80 focus:ring-red-500`) with error text message underneath.
* **Global Alert Banner:** `bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 text-sm flex items-center gap-3`.

---

# 20. Toast Notifications

* **Positioning:** Fixed bottom-right corner (`fixed bottom-4 right-4 z-50 space-y-2`).
* **Card Container:** `bg-zinc-900 border border-zinc-800 shadow-2xl rounded-lg p-4 min-w-[320px] max-w-md flex items-center justify-between animate-slide-up`.
* **Auto-Dismiss:** Automatically dismisses after 5 seconds with manual `X` close trigger.

---

# 21. Modal & Dialog Design

* **Backdrop Overlay:** `fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in`
* **Modal Card Container:** `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full z-50`
* **Dismissal Rules:** Keyboard `ESC` press or clicking backdrop overlay triggers close callback.

---

# 22. Sidebar Rules

* **Desktop Layout:** Fixed left sidebar (width: 240px). `border-r border-zinc-800 bg-zinc-950/80 p-4 flex flex-col justify-between`.
* **Active Navigation Pill:** `bg-zinc-900 text-white font-medium border border-zinc-800 rounded-md px-3 py-2 text-sm flex items-center gap-3`.
* **Inactive Item:** `text-zinc-400 hover:text-white hover:bg-zinc-900/50 rounded-md px-3 py-2 text-sm flex items-center gap-3 transition-colors`.

---

# 23. Navbar Rules

* **Top Bar:** Fixed height (64px). `border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between z-30`.
* **Left Section:** Brand logo pill & Title.
* **Middle Section:** `CMD+K` Live Search Input trigger.
* **Right Section:** Quick Upload CTA button, Notification Bell, User Avatar Dropdown.

---

# 24. Dashboard Rules

* **Overview Stat Cards Grid:** 4-column responsive grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`).
* **Metric Card Structure:** Icon container top-right, Subtitle text top-left, Large metric counter (`text-3xl font-bold text-white`), and comparison indicator.

---

# 25. Animation Guidelines

Powered by **Framer Motion**:

* **Page View Entrance:** `initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, ease: 'easeOut' }}`
* **Hover Scaling:** `whileHover={{ scale: 1.01 }}` `whileTap={{ scale: 0.98 }}`
* **Staggered Children:** `staggerChildren: 0.04`

---

# 26. Responsive Rules

* Breakpoint tokens: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`.
* Mobile Navigation: Sidebar collapses into a sliding bottom-drawer or hamburger drawer on screens `< 1024px`.
* Touch Targets: Minimum 48x48px padding boundaries for all mobile buttons.

---

# 27. Accessibility Rules (WCAG 2.1 AA)

1. **Color Contrast:** All text elements enforce minimum 4.5:1 contrast ratio against background surfaces.
2. **Keyboard Focus Rings:** All tabbable elements must display visible focus rings (`focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none`).
3. **Semantic HTML:** Explicit use of `<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>`, `<button>`, and `<input>`.
4. **Icon Labels:** Decorative icons must carry `aria-hidden="true"`. Actionable icon-only buttons must include `aria-label="Action description"`.

---

# 28. Dark Mode System Rules

* CampusArchive is **Dark Mode First** (`class="dark"` enabled on `<html>` by default).
* Pure black (`#000000`) is avoided for card backgrounds; `zinc-950` (`#09090B`) is used for canvas, and `zinc-900` (`#18181B`) for elevated cards.
* 1px border lines (`border-zinc-800`) are used to create structural depth instead of heavy drop shadows.

---

# 29. Naming Conventions

* **React Components:** `PascalCase.tsx` (e.g. `ResourceCard.tsx`, `PDFViewer.tsx`).
* **Custom Hooks:** `camelCase.ts` starting with `use` (e.g. `useAuth.ts`, `useSearch.ts`).
* **Types / Interfaces:** `PascalCase.ts` (e.g. `UserDTO`, `ResourceStatus`).
* **CSS / Tailwind Utility Ordering:** Structural layout -> Typography -> Background & Border -> Interactive & Animations.

---

# 30. Component Reusability Rules

1. **Single Responsibility:** A component should do one thing well (e.g., `<Button />` handles click states and loading spinners; `<ResourceCard />` composes button, badge, and metadata).
2. **Compound Components:** Complex controls (Modals, Dropdowns) export compound slots (`Modal.Header`, `Modal.Body`, `Modal.Footer`).
3. **Props Extension:** Primitive components extend native HTML attributes (`interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`).

---

# 31. UX Best Practices

* **Minimal Clicks to Action:** Users should be able to download a past exam paper in **2 clicks or fewer** from the homepage.
* **Instant Optimistic UI Feedback:** Upvoting a comment or toggling a bookmark instantly updates the UI badge counter before server roundtrip completion.
* **Clear Error Recovery:** Never leave a user stranded; all error states must feature an explicit "Retry Action" or "Return to Dashboard" CTA.

---

# 32. Performance Best Practices

* **Prevent Layout Shift (CLS):** Set explicit height/width constraints on image thumbnails and document viewers.
* **Code Splitting:** Lazy-load non-critical routes (`React.lazy()`) and heavy components (`pdf.js`).
* **Debounced Inputs:** Search inputs debounced by 300ms to eliminate unnecessary API requests.

---
**End of UI/UX Design Guidelines & Architecture Bible**
