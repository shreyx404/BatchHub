# BatchHub — Architecture Document

> **Version:** 1.1  
> **Last Updated:** 2026-08-21

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL (Hosting)                         │
│                                                                 │
│  ┌───────────────────────┐    ┌──────────────────────────────┐  │
│  │   Static Frontend     │    │   Serverless Functions (/api) │  │
│  │   (Vite + React SPA)  │    │                              │  │
│  │                       │    │  ┌────────────┐              │  │
│  │  • HomePage           │    │  │ admin.js   │ ← Admin CRUD │  │
│  │  • PostPage (Lazy)    │    │  │            │   + Auth      │  │
│  │  • AdminPage (Lazy)   │    │  └────────────┘              │  │
│  │  • NotFoundPage (Lazy)│    │  ┌────────────┐              │  │
│  │                       │    │  │ discord.js │ ← Webhook     │  │
│  │  Reads via anon key ──┼───►│  │            │   + Sig       │  │
│  │                       │    │  └────────────┘   Verify      │  │
│  └───────────────────────┘    └──────────┬───────────────────┘  │
│                                          │                      │
└──────────────────────────────────────────┼──────────────────────┘
                                  ### 2.1 Student Reading Posts

```
Student Browser
    │
    ▼
React App (client)
    │  Uses VITE_SUPABASE_ANON_KEY
    ▼
Supabase PostgREST API
    │  RLS Policy: SELECT WHERE status = 'published'
    ▼
PostgreSQL (posts + subjects joined)
    │
    ▼
Response → Client-side processing:
    • Dynamic unpinning (overdue posts lose is_pinned)
    • Re-sorting (pinned first, then by created_at)
    • Categorisation into sections (notices, pinned, deadline-sorted, general)
```

### 2.2 Admin Authentication & Operations

```
Admin Browser (Login Flow)
    │  1. Generates device fingerprint (canvas + WebGL + hardware)
    │  2. Solves Cloudflare Turnstile invisible challenge
    │  3. Sends password + fingerprint + Turnstile token with action: '__ping'
    ▼
Vercel Serverless Function / Local Vite Dev Middleware (api/admin.js)
    │  1. Layer 1: Per-IP rate limit check (10 attempts / 24h lockout)
    │  2. Layer 2: Per-device fingerprint check (10 attempts / 24h lockout)
    │  3. Layer 3: Cloudflare Turnstile token validation on login (anti-bot)
    │  4. Layer 4: Global rate limit check (>30 failed attempts/24h site-wide)
    │  5. Layer 5: Timing-safe SHA-256 hash comparison (crypto.timingSafeEqual)
    │  6. Logs attempt to Supabase (admin_login_attempts table)
    │  7. Returns session authorization confirmation
    ▼
Admin Browser (Authenticated Operations Flow: create/update/delete)
    │  Sends Authorization: Bearer <token> + { action, payload }
    ▼
Vercel Serverless Function / Local Vite Dev Middleware (api/admin.js)
    │  1. Rate limiter & Bearer token verification
    │  2. Payload field whitelisting (pick())
    │  3. Action routing (switch/case)
    ▼
Supabase (via Service Role Key — bypasses RLS)
    │
    ▼
PostgreSQL mutation (INSERT / UPDATE / DELETE)
    │  Trigger: updated_at auto-set on UPDATE
    ▼
Response → Admin UI updates (or lockout countdown if rate-limited)
```

### 2.3 Discord Bot Post Management Flow

```
Discord Server
    │  User runs /post subcommand (create, update, delete, pin, unpin, list, view, archive, publish)
    ▼
Discord API
    │  POST to Interactions Endpoint URL (type 2 command or type 4 autocomplete)
    ▼
Vercel Serverless Function (api/discord.js)
    │  1. Read raw stream body (bodyParser disabled)
    │  2. Cryptographic Ed25519 signature verification (tweetnacl)
    │  3. If PING (type 1) → Return PONG (type 1)
    │  4. If Autocomplete (type 4) → Query Supabase subjects table with ilike search → Return choices
    │  5. If Command (type 2) → Route to subcommand handler:
    │     ├── create: Insert post + parse links
    │     ├── update: Update post fields + parse links (support "clear" reset keyword)
    │     ├── delete: Delete post from Supabase
    │     ├── pin / unpin: Update is_pinned boolean
    │     ├── list: Query recent posts with optional type/status filter → Return overview embed
    │     ├── view: Query post with joins (subjects) → Return rich formatted embed
    │     └── archive / publish: Update post status
    ▼
Supabase (via Service Role Key)
    │  Executes PostgreSQL operations
    ▼
Discord Client receives instant formatted response or rich embed
```

### 2.4 Resource Links Flow

```
Admin configures labeled links in PostForm (e.g. G-Drive, Classroom, PDF, GitHub)
    │
    ▼
Payload stored in posts.links (JSONB: [{ label, url }])
    │
    ▼
Rendered on PostPage as high-contrast actionable link cards with external domain icons
```

---

## 3. Frontend Architecture

### 3.1 Component Tree

```
<BrowserRouter>
└── <App>                          // Route definitions (lazy routes + Suspense fallback)
    ├── <HomePage>                 // "/" — Main student feed
    │   ├── <Header>               // Sticky nav: logo, search toggle, admin link
    │   ├── <SearchBar>            // Debounced text input (Ctrl+K shortcut)
    │   ├── <FilterBar>            // Type + Subject pill buttons
    │   ├── <DeadlineBanner>       // Horizontal scrollable deadline cards
    │   ├── <NoticesSection>       // Notice & Important posts, highlighted
    │   │   └── <PostCard> × N
    │   ├── <PinnedSection>        // Pinned posts section
    │   │   └── <PostCard> × N
    │   ├── <PostGrid>             // Grid of remaining posts
    │   │   └── <PostCard> × N
    │   └── <Footer>
    │
    ├── <PostPage> (Lazy)          // "/post/:id" — Full post detail
    │   ├── <NavBar>               // Back navigation
    │   ├── <Badge> × N            // Type + Subject badges
    │   ├── <ReactMarkdown>        // Rendered content
    │   ├── Links / Resources list
    │   ├── Share action           // Web Share API + clipboard fallback
    │   └── <Footer>
    │
    ├── <AdminPage> (Lazy)         // "/admin/*" — Protected dashboard
    │   ├── <AdminLogin>           // Password gate (Turnstile protected)
    │   ├── <AdminSidebar>         // Navigation sidebar
    │   └── Nested routes:
    │       ├── <AdminDashboard>   // "/admin" — Stats + quick actions + live Student View feed preview
    │       ├── <PostForm>         // "/admin/create" — New post
    │       ├── <EditPostWrapper>  // "/admin/edit/:id" — Edit post
    │       │   └── <PostForm>
    │       ├── <PostTable>        // "/admin/posts" — All posts list (status filter, created/due date sort)
    │       └── <SubjectManager>   // "/admin/subjects" — CRUD subjects
    │
    └── <NotFoundPage> (Lazy)      // "*" — 404
```

### 3.2 State Management

BatchHub uses **local component state + custom hooks** — no global state library.

| Hook | Source | Purpose |
|------|--------|---------|
| `usePosts(filters)` | `hooks/usePosts.js` | Fetches published posts with filters; provides `posts`, `loading`, `error`, `refetch` |
| `useUpcomingDeadlines()` | `hooks/usePosts.js` | Fetches posts with future `due_date`, sorted ascending |
| `usePost(id)` | `hooks/usePost.js` | Fetches a single post by UUID |
| `useSubjects()` | `hooks/useSubjects.js` | Fetches all subjects sorted by name |
| `useAdmin()` | `hooks/useAdmin.js` | Manages auth state: `isAuthenticated`, `login()`, `logout()` with instant demo bypass |

### 3.3 API Layer (`lib/api.js`)

All data fetching is centralised in a single API module that:
- Checks `isSupabaseConfigured()` before every call
- Falls back to in-memory `DEMO_POSTS` / `DEMO_SUBJECTS` arrays
- Routes admin mutations and privileged reads (`fetchAllPosts`, admin `fetchPost`) through `adminRequest()` → `POST /api/admin` to bypass public read RLS restrictions

---

## 4. Backend Architecture

### 4.1 Serverless Functions

| Endpoint | File | Auth Method | Purpose |
|----------|------|-------------|---------|
| `POST /api/admin` | `api/admin.js` | Bearer token (timing-safe SHA-256) | All admin CRUD operations with 5-layer rate limiting (in-memory & persistent Supabase IP rate limit) |
| `POST /api/discord` | `api/discord.js` | Ed25519 signature | Discord interaction webhook |
| `GET /api/cron/auto-archive` | `api/cron/auto-archive.js` | `CRON_SECRET` Bearer token (timing-safe SHA-256) | Daily auto-archive of expired posts (fail-closed if unconfigured) |

### 4.2 Admin API Actions

The admin endpoint uses a single `POST` with an `action` field to route requests:

| Action | Payload | Result |
|--------|---------|--------|
| `getAllPosts` | _(none)_ | Select all posts (bypassing public RLS) with joins |
| `getPost` | `{id}` | Select single post by ID (bypassing public RLS) with joins |
| `createPost` | Post fields | Insert + return with joins |
| `updatePost` | `{id, updates}` | Update + return with joins |
| `deletePost` | `{id}` | Delete row |
| `createSubject` | Subject fields | Insert + return |
| `updateSubject` | `{id, updates}` | Update + return |
| `deleteSubject` | `{id}` | Delete row |
| `autoArchiveExpired` | _(none)_ | Archive published posts with `due_date` > 24h past |

### 4.3 Security Layers
 
```
Request arrives at /api/admin
    │
    ├── 1. CORS headers set (Access-Control-Allow-*)
    ├── 2. Method check (POST only)
    ├── 3. Layer 1: In-memory IP rate limiter (10 failed attempts / 24-hour lockout)
    ├── 4. Layer 2: In-memory device fingerprint limiter (10 failed attempts / 24-hour lockout)
    ├── 5. Layer 3: Cloudflare Turnstile token verification on login (__ping)
    ├── 6. Layer 4: Timing-safe SHA-256 password comparison (crypto.timingSafeEqual against ADMIN_PASSWORD)
    ├── 7. Layer 5: Global rate limit check (>30 failed attempts/24h across all IPs via Supabase)
    ├── 8. Log attempt to Supabase (admin_login_attempts table)
    ├── 9. Clear IP and fingerprint failures on success + auto-cleanup old logs (>7 days)
    ├── 10. Supabase client initialised with SERVICE_ROLE_KEY
    ├── 11. Payload sanitised via pick() with field whitelists
    └── 12. Action routed and executed (or returns { data: { authenticated: true } } on __ping)
```

---

## 5. Database Architecture

### 5.1 Entity Relationship

```
subjects (1) ──────────< (N) posts
    │                         │
    │ id (PK, UUID)           │ id (PK, UUID)
    │ name                    │ title
    │ code                    │ content
    │ color                   │ type
    │ created_at              │ subject_id (FK)
                              │ is_pinned
                              │ status
                              │ due_date
                              │ tags[]
                              │ links (JSONB: [{label, url}])
                              │ batch_id
                              │ created_by
                              │ created_at
                              │ updated_at (trigger)

admin_login_attempts (standalone log table)
    │ id (PK, UUID)
    │ ip (TEXT)
    │ fingerprint (TEXT)
    │ success (BOOLEAN)
    │ attempted_at (TIMESTAMPTZ)
```

### 5.2 Indexes

| Index | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| `idx_posts_type` | `type` | B-tree | Filter by content type |
| `idx_posts_status` | `status` | B-tree | Filter published/draft/archived |
| `idx_posts_subject` | `subject_id` | B-tree | Filter by subject |
| `idx_posts_due_date` | `due_date` | B-tree | Deadline queries |
| `idx_posts_created_at` | `created_at DESC` | B-tree | Chronological ordering |
| `idx_posts_is_pinned` | `is_pinned` (partial) | B-tree | Only pinned posts |
| `idx_posts_batch` | `batch_id` | B-tree | Future multi-tenant |
| `idx_attachments_post` | `post_id` | B-tree | Join performance |
| `idx_posts_search` | `title + content` | GIN (tsvector) | Full-text search |
| `idx_login_attempts_attempted_at` | `attempted_at DESC` | B-tree | Fast 24-hour rate-limit window checks |
| `idx_login_attempts_success` | `success` (partial) | B-tree | Quick count of failed attempts |
| `idx_login_attempts_fingerprint` | `fingerprint` (partial) | B-tree | Fast device lookup |

### 5.3 Row Level Security Policies

| Table | Operation | Policy |
|-------|-----------|--------|
| `subjects` | SELECT | Public (all) |
| `posts` | SELECT | Public WHERE `status = 'published'` |
| `attachments` | SELECT | Public (all) |
| `admin_login_attempts` | ALL | Service role only (no public access) |
| All tables | ALL | Service role only (admin/bot operations) |

---

## 6. Deployment Architecture

```
GitHub Repository
    │
    ▼ (push / PR merge)
Vercel CI/CD
    │
    ├── Build: vite build → dist/
    ├── Deploy static assets to CDN
    ├── Deploy api/ functions as serverless
    └── Apply vercel.json:
        • SPA rewrite: /* → /index.html (except /api/*)
        • Security headers: CSP (including Turnstile), X-Frame-Options, X-Content-Type-Options, Referrer-Policy
```

### Environment Variables (Vercel Dashboard)

| Variable | Exposure | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Build time (bundled into client) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Build time (bundled into client) | Supabase anon key |
| `VITE_TURNSTILE_SITE_KEY` | Build time (bundled into client) | Cloudflare Turnstile public site key |
| `ADMIN_PASSWORD` | Runtime only (serverless functions) | Admin dashboard master password |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime only (serverless functions) | Full database access key |
| `TURNSTILE_SECRET_KEY` | Runtime only (serverless functions) | Cloudflare Turnstile server validation key |
| `DISCORD_PUBLIC_KEY` | Runtime only (serverless functions) | Discord interaction webhook signature verification |
