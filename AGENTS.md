# BatchHub — AI Agent Guidelines

> **Version:** 1.0  
> **Last Updated:** 2026-08-20

This file provides context and rules for AI coding agents working on the BatchHub codebase.

---

## 1. Project Context

**BatchHub** is a centralized academic information gallery for college batches. It replaces scattered WhatsApp messages with one organized, searchable web app.

- **Frontend:** React 19 SPA with Vite 6, Tailwind CSS v4, React Router v7
- **Backend:** Supabase (PostgreSQL + Storage) with Vercel Serverless Functions
- **Design:** Dark editorial aesthetic — Playfair Display headings, Inter body, monochromatic palette, square corners

---

## 2. File Structure & Conventions

```
src/
├── main.jsx              # Entry point — BrowserRouter, Toaster
├── App.jsx               # Route definitions only
├── index.css             # Design system — @theme tokens, typography, animations, utilities
├── lib/
│   ├── supabase.js       # Supabase client init (returns null if not configured)
│   ├── api.js            # ALL data fetching — dual-mode (Supabase + demo fallback)
│   ├── constants.js      # Content types, statuses, app metadata
│   └── demoData.js       # In-memory mock data for demo mode
├── hooks/
│   ├── usePosts.js       # usePosts(filters), useUpcomingDeadlines()
│   ├── usePost.js        # usePost(id)
│   ├── useSubjects.js    # useSubjects()
│   └── useAdmin.js       # useAdmin() — auth state + login/logout
├── components/
│   ├── layout/           # Header, Footer
│   ├── ui/               # Badge, SearchBar, FilterBar, Modal, LoadingState, ErrorState, EmptyState
│   ├── posts/            # PostCard, PostGrid, DeadlineBanner, PinnedSection, NoticesSection
│   └── admin/            # AdminLogin, AdminSidebar, PostForm, PostTable, FileUploader, SubjectManager
└── pages/
    ├── HomePage.jsx      # Student feed with structured sections
    ├── PostPage.jsx      # Full post detail view
    ├── AdminPage.jsx     # Admin dashboard with nested routes
    └── NotFoundPage.jsx  # 404 page

api/
├── admin.js              # Secure admin API (auth + rate limit + CRUD)
└── discord.js            # Discord interaction webhook

supabase/
├── schema.sql            # Database DDL + indexes + RLS policies + triggers
└── seed.sql              # Sample data for initial setup

scripts/
└── register-discord-commands.js   # One-time Discord slash command registration
```

---

## 3. Coding Conventions

### 3.1 General

- **Language:** JavaScript (ES Modules, `"type": "module"`)
- **No TypeScript** — the project uses plain JSX
- **Functional components only** — no class components
- **Custom hooks** for all data fetching logic
- **No global state library** — local `useState` + hook composition

### 3.2 Naming

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `PostCard.jsx`, `DeadlineBanner.jsx` |
| Hooks | camelCase with `use` prefix | `usePosts.js`, `useAdmin.js` |
| API functions | camelCase verbs | `fetchPosts()`, `createPost()`, `deleteAttachment()` |
| CSS variables | kebab-case with prefix | `--color-text-muted`, `--text-sm` |
| Constants | SCREAMING_SNAKE_CASE | `CONTENT_TYPES`, `MAX_FILE_SIZE` |
| Files | PascalCase for components, camelCase for utilities | `PostForm.jsx`, `api.js` |

### 3.3 Styling

- **Tailwind CSS v4** with `@theme` block in `index.css` for design tokens
- Use CSS variables from the design system (`var(--color-*)`, `var(--text-*)`)
- Custom utility classes defined in `index.css`: `.glass`, `.skeleton`, `.prose`, `.input-field`, `.line-clamp-*`, `.scrollbar-hide`
- Prefer inline Tailwind classes over creating new CSS classes
- Border-radius tokens are all `0px` (sharp/square aesthetic) — **do not add rounded corners**

### 3.4 Component Patterns

- Components receive data via props; hooks handle fetching
- Loading/error/empty states are handled by dedicated UI components
- Admin mutations go through `adminRequest()` which calls `/api/admin`
- Toast notifications via `react-hot-toast` for all user-facing feedback
- Animations use CSS (`animate-fade-in`, `stagger-children`) — no JS animation libraries

---

## 4. Data Flow Rules

### 4.1 Always Dual-Mode

Every function in `lib/api.js` MUST check `isSupabaseConfigured()` first:
- If **false** → operate on `DEMO_POSTS` / `DEMO_SUBJECTS` arrays in memory
- If **true** → use the Supabase client

### 4.2 Admin Operations

All write operations (create, update, delete) MUST go through the serverless function at `/api/admin`:
- Client sends `{ action, payload }` as POST body
- Server validates auth via Bearer token
- Server sanitises payload via `pick(payload, ALLOWED_FIELDS)`
- Server uses Supabase Service Role key (bypasses RLS)

**Never** write directly to Supabase from the client. The anon key has read-only access via RLS.

### 4.3 File Uploads

File uploads are the **one exception** — they go directly from the client to Supabase Storage using the anon key, because Storage has its own access policies. The resulting public URL is then attached to the post via the admin API.

---

## 5. Security Rules (Do NOT Violate)

| Rule | Detail |
|------|--------|
| **No client-side password checking** | The admin password is never compared in the browser |
| **No VITE_ prefix for secrets** | `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `DISCORD_PUBLIC_KEY` must NOT have `VITE_` prefix |
| **Payload whitelisting** | Always use `pick()` to extract only allowed fields before database operations |
| **Sanitise user input** | Escape search queries for PostgREST wildcards; disallow dangerous Markdown elements |
| **UUID filenames** | Always prefix uploaded filenames with `crypto.randomUUID()` |
| **Never expose service role key** | It goes only in Vercel env vars (runtime), never in client bundle |

---

## 6. Database Rules

- All tables have **RLS enabled** — never disable it
- The `updated_at` column is auto-managed by a PostgreSQL trigger — do not set it manually
- `posts.type` is constrained to: `assignment`, `lab`, `notice`, `deadline`, `resource`, `important`
- `posts.status` is constrained to: `published`, `draft`, `archived`
- `attachments` cascade-delete when their parent post is deleted
- `subject_id` is set to NULL when a subject is deleted (`ON DELETE SET NULL`)

---

## 7. Adding New Features — Checklist

When adding a new feature, follow this checklist:

1. **Database changes** → Update `supabase/schema.sql` (add columns, indexes, policies)
2. **API layer** → Add functions in `lib/api.js` with dual-mode (Supabase + demo)
3. **Server actions** → Add new action cases in `api/admin.js` with field whitelists
4. **Hooks** → Create or extend hooks in `hooks/` for data fetching
5. **Components** → Build in the appropriate `components/` subdirectory
6. **Pages** → Wire into routes in `App.jsx`
7. **Constants** → Add any new enums/config to `lib/constants.js`
8. **Demo data** → Update `lib/demoData.js` to include sample data for the new feature
9. **Design tokens** → Add CSS variables to `index.css` `@theme` block if new colours/sizes are needed

---

## 8. Common Pitfalls

| Pitfall | Correct Approach |
|---------|-----------------|
| Forgetting demo mode fallback | Always add `if (!isSupabaseConfigured())` branch |
| Adding rounded corners | All `--radius-*` tokens are `0px` — this is intentional |
| Using colourful type badges | The design is monochromatic — types use `var(--color-text)` variants |
| Direct Supabase writes from client | Route all mutations through `/api/admin` |
| Hardcoding the app name | Use `APP_NAME` and `APP_TAGLINE` from `constants.js` |
| Using `useEffect` for data fetching without cleanup | Follow the patterns in existing hooks |
| Adding new npm dependencies without justification | Keep the bundle lean; prefer built-in/existing solutions |
