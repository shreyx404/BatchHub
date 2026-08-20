# BatchHub — Task Breakdown

> **Version:** 1.0  
> **Last Updated:** 2026-08-20  
> **Status Legend:** ✅ Done · 🔲 Planned · 🚧 In Progress

---

## Phase 1: Foundation (Core Infrastructure)

- [x] **T-001** — Initialise Vite + React project with Tailwind CSS v4
- [x] **T-002** — Create design system in `index.css` (`@theme` tokens, typography, animations)
- [x] **T-003** — Set up Supabase client with graceful fallback (`supabase.js`)
- [x] **T-004** — Design and create database schema (`schema.sql`)
  - [x] Subjects table with UUID, name, code, colour
  - [x] Posts table with type enum, status enum, tags array, links JSONB, due_date
  - [x] Attachments table with cascade delete
  - [x] Performance indexes (type, status, subject, due_date, created_at, full-text search)
  - [x] RLS policies (public read for published, service role full access)
  - [x] Auto-update `updated_at` trigger
- [x] **T-005** — Create seed data (`seed.sql`)
- [x] **T-006** — Create demo data module (`demoData.js`) with relative dates
- [x] **T-007** — Define content types, statuses, and constants (`constants.js`)
- [x] **T-008** — Configure Vercel deployment (`vercel.json` — SPA rewrite, CSP, security headers)

---

## Phase 2: API Layer

- [x] **T-009** — Build centralised API module (`lib/api.js`)
  - [x] `fetchPosts()` with type, subject, search filters
  - [x] `fetchAllPosts()` for admin (all statuses)
  - [x] `fetchPost(id)` — single post with joins
  - [x] `fetchUpcomingDeadlines()` — future due_dates sorted ascending
  - [x] `createPost()`, `updatePost()`, `deletePost()`
  - [x] `fetchSubjects()`, `createSubject()`, `updateSubject()`, `deleteSubject()`
  - [x] `uploadFile()`, `createAttachment()`, `deleteAttachment()`
  - [x] Demo mode fallback for all functions
- [x] **T-010** — Build admin serverless function (`api/admin.js`)
  - [x] CORS handling with preflight support
  - [x] Rate limiting (in-memory, IP-based, 10/15min)
  - [x] Timing-safe password comparison
  - [x] Payload field whitelisting
  - [x] Action routing for all CRUD operations
- [x] **T-011** — Build Discord webhook handler (`api/discord.js`)
  - [x] Raw body parsing (disabled default body parser)
  - [x] Ed25519 signature verification
  - [x] PING response handling
  - [x] `/post` command parsing and DB insert
- [x] **T-012** — Create Discord command registration script

---

## Phase 3: Custom Hooks

- [x] **T-013** — `usePosts(filters)` — posts with loading/error/refetch
- [x] **T-014** — `useUpcomingDeadlines()` — future deadlines
- [x] **T-015** — `usePost(id)` — single post fetch
- [x] **T-016** — `useSubjects()` — all subjects
- [x] **T-017** — `useAdmin()` — auth state management with server-side validation

---

## Phase 4: UI Components

### Layout
- [x] **T-018** — `Header` — sticky glass nav, logo, search toggle, admin link
- [x] **T-019** — `Footer` — simple footer

### UI Primitives
- [x] **T-020** — `Badge` — type badges and subject badges with colour coding
- [x] **T-021** — `SearchBar` — debounced search input
- [x] **T-022** — `FilterBar` — type and subject filter pills
- [x] **T-023** — `Modal` — reusable modal overlay
- [x] **T-024** — `LoadingState` / `LoadingSpinner` — skeleton loaders
- [x] **T-025** — `ErrorState` — error display with retry button
- [x] **T-026** — `EmptyState` — no results placeholder

### Post Components
- [x] **T-027** — `PostCard` — ledger-style card with diamond marker, hover glow, badges, due date, attachment count
- [x] **T-028** — `PostGrid` — responsive grid / list of PostCards
- [x] **T-029** — `DeadlineBanner` — horizontal scrollable deadline cards with urgency highlighting
- [x] **T-030** — `PinnedSection` — pinned posts container
- [x] **T-031** — `NoticesSection` — notices & important posts with highlighted border

### Admin Components
- [x] **T-032** — `AdminLogin` — password form with server-side validation
- [x] **T-033** — `AdminSidebar` — navigation sidebar with mobile collapse
- [x] **T-034** — `PostForm` — create/edit with Markdown preview, subjects, tags, links, attachments
- [x] **T-035** — `PostTable` — all posts list with status, type, edit/delete actions
- [x] **T-036** — `FileUploader` — drag-and-drop with 10 MB limit, file type icons
- [x] **T-037** — `SubjectManager` — CRUD interface for subjects with colour picker

---

## Phase 5: Pages & Routing

- [x] **T-038** — `App.jsx` — route definitions
- [x] **T-039** — `HomePage` — structured feed with all sections, search, filters
  - [x] Hero section with app name and tagline
  - [x] Deadline banner integration
  - [x] Structured view: Notices → Pinned → Deadline-sorted → General
  - [x] Flat filtered view when search/filters active
  - [x] Dynamic unpinning logic
- [x] **T-040** — `PostPage` — full post detail with Markdown, tags, links, attachments, share
- [x] **T-041** — `AdminPage` — protected admin with nested routes
  - [x] Dashboard with stats cards and quick actions
  - [x] Create post route
  - [x] Edit post route (with data prefetch)
  - [x] Posts management route
  - [x] Subjects management route
- [x] **T-042** — `NotFoundPage` — 404 page

---

## Phase 6: Polish & Security

- [x] **T-043** — Implement dynamic unpinning for overdue posts
- [x] **T-044** — Add search input sanitisation (SQL wildcard escaping)
- [x] **T-045** — Add Markdown sanitisation (disallow script, iframe, object, embed)
- [x] **T-046** — Configure CSP and security headers in `vercel.json`
- [x] **T-047** — Add file upload path safety (UUID prefix + character sanitisation)
- [x] **T-048** — Add focus-visible outlines and ARIA labels for accessibility
- [x] **T-049** — Add staggered animations and micro-interactions
- [x] **T-050** — Create `.env.example` with documented variables
- [x] **T-051** — Write `README.md` with setup instructions

---

## Future Tasks (Backlog)

- [ ] **T-052** — Student authentication (Google OAuth via Supabase Auth)
- [ ] **T-053** — Push notifications for new posts / approaching deadlines
- [ ] **T-054** — Multi-batch support (use `batch_id` field, admin selects batch)
- [ ] **T-055** — Admin analytics dashboard (post views, engagement metrics)
- [ ] **T-056** — PWA support with offline caching (service worker)
- [ ] **T-057** — Email digest for weekly summaries
- [ ] **T-058** — Comments / reactions on posts
- [ ] **T-059** — Calendar view for deadlines
- [ ] **T-060** — Dark/Light theme toggle (currently dark-only)
- [ ] **T-061** — Bulk post operations in admin (archive all, delete selected)
- [ ] **T-062** — Post scheduling (publish at a future date)
- [ ] **T-063** — Supabase Realtime subscriptions for live feed updates
- [ ] **T-064** — Export posts as PDF or CSV from admin
- [ ] **T-065** — Subject-wise archive / history page
