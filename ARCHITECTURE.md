# BatchHub — Architecture Document

> **Version:** 1.0  
> **Last Updated:** 2026-08-20

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
│  │  • PostPage           │    │  │            │   + Auth      │  │
│  │  • AdminPage          │    │  └────────────┘              │  │
│  │  • NotFoundPage       │    │  ┌────────────┐              │  │
│  │                       │    │  │ discord.js │ ← Webhook     │  │
│  │  Reads via anon key ──┼───►│  │            │   + Sig       │  │
│  │                       │    │  └────────────┘   Verify      │  │
│  └───────────────────────┘    └──────────┬───────────────────┘  │
│                                          │                      │
└──────────────────────────────────────────┼──────────────────────┘
                                           │ Service Role Key
                                           ▼
                            ┌──────────────────────────┐
                            │      SUPABASE             │
                            │                          │
                            │  ┌────────────────────┐  │
                            │  │   PostgreSQL        │  │
                            │  │   • subjects        │  │
                            │  │   • posts           │  │
                            │  │   • attachments     │  │
                            │  │   (RLS enabled)     │  │
                            │  └────────────────────┘  │
                            │                          │
                            │  ┌────────────────────┐  │
                            │  │   Storage           │  │
                            │  │   • attachments     │  │
                            │  │     bucket (public)  │  │
                            │  └────────────────────┘  │
                            └──────────────────────────┘
```

---

## 2. Data Flow

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
PostgreSQL (posts + subjects + attachments joined)
    │
    ▼
Response → Client-side processing:
    • Dynamic unpinning (overdue posts lose is_pinned)
    • Re-sorting (pinned first, then by created_at)
    • Categorisation into sections (notices, pinned, deadline-sorted, general)
```

### 2.2 Admin Creating / Editing Posts

```
Admin Browser
    │  Bearer token (password) in Authorization header
    ▼
Vercel Serverless Function (api/admin.js)
    │  1. Rate limit check (IP-based, 10/15min)
    │  2. Timing-safe password comparison
    │  3. Payload field whitelisting (pick())
    │  4. Action routing (switch/case)
    ▼
Supabase (via Service Role Key — bypasses RLS)
    │
    ▼
PostgreSQL mutation (INSERT / UPDATE / DELETE)
    │  Trigger: updated_at auto-set on UPDATE
    ▼
Response → Admin UI updates
```

### 2.3 Discord Bot Posting

```
Discord Server
    │  User runs /post slash command
    ▼
Discord API
    │  POST to Interactions Endpoint URL
    ▼
Vercel Serverless Function (api/discord.js)
    │  1. Read raw body (bodyParser disabled)
    │  2. Ed25519 signature verification (tweetnacl)
    │  3. Handle PING (type 1) or Command (type 2)
    │  4. Extract options: title, type, content, due_date, is_pinned, tags
    ▼
Supabase (via Service Role Key)
    │
    ▼
PostgreSQL INSERT into posts (status = 'published', created_by = 'Discord Bot')
    │
    ▼
Discord receives confirmation message: "✅ Successfully created..."
```

### 2.4 File Upload Flow

```
Admin selects file(s) in PostForm
    │
    ▼
FileUploader validates size (< 10 MB) and stores in local state
    │
    ▼
On form submit:
    │  1. Create/update the post via admin API
    │  2. For each file:
    │     a. uploadFile() → Supabase Storage (sanitised UUID filename)
    │     b. Get public URL
    │     c. createAttachment() → admin API → attachments table
    ▼
Attachment record linked to post via post_id FK
```

---

## 3. Frontend Architecture

### 3.1 Component Tree

```
<BrowserRouter>
└── <App>                          // Route definitions
    ├── <HomePage>                 // "/" — Main student feed
    │   ├── <Header>               // Sticky nav: logo, search toggle, admin link
    │   ├── <SearchBar>            // Debounced text input
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
    ├── <PostPage>                 // "/post/:id" — Full post detail
    │   ├── <NavBar>               // Back navigation
    │   ├── <Badge> × N            // Type + Subject badges
    │   ├── <ReactMarkdown>        // Rendered content
    │   ├── Attachments list
    │   ├── Links list
    │   └── <Footer>
    │
    ├── <AdminPage>                // "/admin/*" — Protected dashboard
    │   ├── <AdminLogin>           // Password gate
    │   ├── <AdminSidebar>         // Navigation sidebar
    │   └── Nested routes:
    │       ├── <AdminDashboard>   // "/admin" — Stats + quick actions
    │       ├── <PostForm>         // "/admin/create" — New post
    │       ├── <EditPostWrapper>  // "/admin/edit/:id" — Edit post
    │       │   └── <PostForm>
    │       ├── <PostTable>        // "/admin/posts" — All posts list
    │       └── <SubjectManager>   // "/admin/subjects" — CRUD subjects
    │
    └── <NotFoundPage>             // "*" — 404

<Toaster>                          // Global toast notifications
```

### 3.2 State Management

BatchHub uses **local component state + custom hooks** — no global state library.

| Hook | Source | Purpose |
|------|--------|---------|
| `usePosts(filters)` | `hooks/usePosts.js` | Fetches published posts with filters; provides `posts`, `loading`, `error`, `refetch` |
| `useUpcomingDeadlines()` | `hooks/usePosts.js` | Fetches posts with future `due_date`, sorted ascending |
| `usePost(id)` | `hooks/usePost.js` | Fetches a single post by UUID |
| `useSubjects()` | `hooks/useSubjects.js` | Fetches all subjects sorted by name |
| `useAdmin()` | `hooks/useAdmin.js` | Manages auth state: `isAuthenticated`, `login()`, `logout()` |

### 3.3 API Layer (`lib/api.js`)

All data fetching is centralised in a single API module that:
- Checks `isSupabaseConfigured()` before every call
- Falls back to in-memory `DEMO_POSTS` / `DEMO_SUBJECTS` arrays
- Routes admin mutations through `adminRequest()` → `POST /api/admin`
- Handles file uploads directly to Supabase Storage (client-side with anon key)

---

## 4. Backend Architecture

### 4.1 Serverless Functions

| Endpoint | File | Auth Method | Purpose |
|----------|------|-------------|---------|
| `POST /api/admin` | `api/admin.js` | Bearer token (password) | All admin CRUD operations |
| `POST /api/discord` | `api/discord.js` | Ed25519 signature | Discord interaction webhook |

### 4.2 Admin API Actions

The admin endpoint uses a single `POST` with an `action` field to route requests:

| Action | Payload | Result |
|--------|---------|--------|
| `createPost` | Post fields | Insert + return with joins |
| `updatePost` | `{id, updates}` | Update + return with joins |
| `deletePost` | `{id}` | Delete row |
| `createSubject` | Subject fields | Insert + return |
| `updateSubject` | `{id, updates}` | Update + return |
| `deleteSubject` | `{id}` | Delete row |
| `createAttachment` | Attachment fields | Insert + return |
| `deleteAttachment` | `{id}` | Delete row |

### 4.3 Security Layers

```
Request arrives
    │
    ├── 1. CORS headers set (Access-Control-Allow-*)
    ├── 2. Method check (POST only)
    ├── 3. Rate limit check (IP → Map, 10 attempts / 15 min window)
    ├── 4. Bearer token extraction from Authorization header
    ├── 5. Timing-safe comparison with ADMIN_PASSWORD env var
    ├── 6. Supabase client initialised with SERVICE_ROLE_KEY
    ├── 7. Payload sanitised via pick() with field whitelists
    └── 8. Action routed and executed
```

---

## 5. Database Architecture

### 5.1 Entity Relationship

```
subjects (1) ──────────< (N) posts (1) ──────────< (N) attachments
    │                         │                         │
    │ id (PK, UUID)           │ id (PK, UUID)           │ id (PK, UUID)
    │ name                    │ title                    │ post_id (FK)
    │ code                    │ content                  │ file_name
    │ color                   │ type                     │ file_url
    │ created_at              │ subject_id (FK)          │ file_size
    │                         │ is_pinned                │ file_type
                              │ status                   │ created_at
                              │ due_date
                              │ tags[]
                              │ links (JSONB)
                              │ batch_id
                              │ created_by
                              │ created_at
                              │ updated_at (trigger)
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

### 5.3 Row Level Security Policies

| Table | Operation | Policy |
|-------|-----------|--------|
| `subjects` | SELECT | Public (all) |
| `posts` | SELECT | Public WHERE `status = 'published'` |
| `attachments` | SELECT | Public (all) |
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
        • Security headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
```

### Environment Variables (Vercel Dashboard)

| Variable | Exposure |
|----------|----------|
| `VITE_SUPABASE_URL` | Build time (bundled into client) |
| `VITE_SUPABASE_ANON_KEY` | Build time (bundled into client) |
| `ADMIN_PASSWORD` | Runtime only (serverless functions) |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime only (serverless functions) |
| `DISCORD_PUBLIC_KEY` | Runtime only (serverless functions) |
