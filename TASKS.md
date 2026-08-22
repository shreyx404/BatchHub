# BatchHub — Task Breakdown

> **Version:** 1.1  
> **Last Updated:** 2026-08-21  
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
- [x] **T-011** — Build full Discord webhook handler (`api/discord.js`)
  - [x] Raw body parsing (disabled default body parser)
  - [x] Ed25519 cryptographic signature verification (`tweetnacl`)
  - [x] Discord PING (`type: 1`) handshake response
  - [x] Discord Autocomplete (`type: 4`) for live subject search
  - [x] Full CRUD subcommands: `create`, `update`, `delete`, `pin`, `unpin`, `list`, `view`, `archive`, `publish`
  - [x] Discord attachment download & Supabase Storage upload pipeline
  - [x] Links parsing helper (`"Label | URL"`) and field reset handling (`"clear"`)
  - [x] Dark-aesthetic rich embed builder for post detail and list views
- [x] **T-012** — Create Discord command registration script (`scripts/register-discord-commands.js`)
  - [x] Nested subcommand structure under `/post`
  - [x] Autocomplete configuration for subjects
  - [x] Native attachment type configuration

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
  - [x] Dashboard with stats cards, quick actions, and embedded live "Student View" preview
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
- [x] **T-052** — Fix timezone-shifting bug on post edit with `toLocalISOString` helper and add custom Publication Date support
- [x] **T-053** — Implement persistent 10-attempt, 24-hour lockout in `useAdmin.js` with live countdown timer in `AdminLogin.jsx`
- [x] **T-054** — Create client-side zero-dependency device fingerprinting utility (`src/lib/fingerprint.js`)
- [x] **T-055** — Integrate Cloudflare Turnstile bot verification (client widget + server verification in `api/admin.js`)
- [x] **T-056** — Add persistent global velocity rate limiting (30 failed attempts/day site-wide) via Supabase `admin_login_attempts` table
- [x] **T-057** — Enhance post sharing on `PostPage` with formatted text templating, native Web Share API, and clipboard copy fallback
- [x] **T-058** — Refine Cloudflare Turnstile anti-bot verification to login authentication ping actions, unblocking authenticated admin CRUD operations
- [x] **T-059** — Implement Vite dev server SSR middleware for `/api/admin` to execute serverless handler locally during `npm run dev`
- [x] **T-060** — Add flexible sorting controls in admin `PostTable` (default: Due Date Ascending, with Created Date option, Asc/Desc toggle, and floating posts with no deadlines to top)
- [x] **T-061** — Embed live "Student View" preview panel in Admin Dashboard home (`AdminPage.jsx`) mirroring homepage structured feed
- [x] **T-062** — Implement secure admin query actions (`getAllPosts`, `getPost`) via `/api/admin` to bypass public read RLS, enabling full access to archived and draft posts
- [x] **T-063** — Enhance admin dashboard overview with dedicated Archived stat card and deep-linking filter navigation
- [x] **T-064** — Add 1-click unarchive / restore action button (`ArchiveRestore`) and URL search params sync in `PostTable`
- [x] **T-065** — Fix mobile touch visibility for admin action buttons (`PostTable`, `SubjectManager`) and add explicit confirmation modal for archiving posts
- [x] **T-066** — Auto-archive expired posts: admin API action (`autoArchiveExpired`), Vercel daily cron (`api/cron/auto-archive.js` scheduled at `0 0 * * *` for Vercel Hobby plan compliance), and client-side trigger on admin dashboard load — archives published posts 24h after their `due_date`
- [x] **T-067** — Implement route-level code splitting using React `lazy()` and `Suspense` fallback in `App.jsx`
- [x] **T-068** — Conduct strict 0px border-radius design system audit across all UI components (Modals, Badges, Chips, Inputs, Buttons, Toasts, Cards)
- [x] **T-069** — Implement timing-safe SHA-256 password hash comparison in serverless `api/admin.js` to eliminate timing/length side-channel vulnerabilities
- [x] **T-070** — Unify file attachments and external resources into high-contrast direct Resource Links (`links` array) across post creation and view pages
- [x] **T-071** — Add global `Ctrl + K` / `Cmd + K` search keyboard shortcut and ESC modal dismiss for keyboard accessibility
- [x] **T-087** — Refine post share text template format (`*<Title>*\n\n_BatchHub :_ ->\n<Link>`) and establish mandatory system markdown documentation & Git push workflows
- [x] **T-088** — Update BatchHub brand icon and favicon assets across Header, Admin Sidebar, Admin Login, and HTML document metadata using custom graduate batch illustration
- [x] **T-089** — Float posts without deadlines to the very top in admin `PostTable` when sorting by Due Date (with secondary sorting by newest created date)
- [x] **T-090** — Comprehensive security hardening: Fail-closed & timing-safe authentication in auto-archive cron (`api/cron/auto-archive.js`), persistent serverless per-IP rate limiting via Supabase `admin_login_attempts` in `api/admin.js`, restricted CORS origin handling, and strict URL scheme sanitization (`https?://`, `mailto:`) in `PostPage` & `PostForm`
- [x] **T-091** — Set default status filter to 'published' in admin 'All Posts' section (`PostTable.jsx`) with URL parameter synchronization and explicit 'Total Posts' overview link (`/admin/posts?status=all`)
- [x] **T-080** — Calendar view for deadlines: Full-page `/calendar` route with 7-column monthly grid, subject filter chips, today highlighting, urgency indicators (<24h red accents), selected-date inspector sidebar with resource links, upcoming-in-7-days agenda, month navigation, and `TODAY` snap-back. Admin dashboard calendar view at `/admin/calendar` with sidebar link. No new dependencies (uses existing `date-fns`).

---

## Future Tasks (Backlog)

- [ ] **T-073** — Student authentication (Google OAuth via Supabase Auth)
- [ ] **T-074** — Push notifications for new posts / approaching deadlines
- [ ] **T-075** — Multi-batch support (use `batch_id` field, admin selects batch)
- [ ] **T-076** — Admin analytics dashboard (post views, engagement metrics)
- [ ] **T-077** — PWA support with offline caching (service worker)
- [ ] **T-078** — Email digest for weekly summaries
- [ ] **T-079** — Comments / reactions on posts

- [ ] **T-081** — Dark/Light theme toggle (currently dark-only)
- [ ] **T-082** — Bulk post operations in admin (archive all, delete selected)
- [ ] **T-083** — Post scheduling (publish at a future date)
- [ ] **T-084** — Supabase Realtime subscriptions for live feed updates
- [ ] **T-085** — Export posts as PDF or CSV from admin
- [ ] **T-086** — Subject-wise archive / history page
