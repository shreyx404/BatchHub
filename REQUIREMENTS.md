# BatchHub — Requirements Specification

> **Version:** 1.0  
> **Last Updated:** 2026-08-20

---

## 1. Functional Requirements

### 1.1 Public Feed (Student View)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001 | Display published posts in a structured feed with sections: Notices & Important → Pinned → Deadline-sorted → General | P0 | ✅ Implemented |
| FR-002 | Show an upcoming deadlines banner with countdown timers at the top of the feed | P0 | ✅ Implemented |
| FR-003 | Visually highlight urgent deadlines (< 48 hours remaining) with inverted styling | P0 | ✅ Implemented |
| FR-004 | Automatically unpin posts whose `due_date` has passed (client-side dynamic unpinning) | P1 | ✅ Implemented |
| FR-005 | Provide debounced search (300 ms) across `title` and `content` fields | P0 | ✅ Implemented |
| FR-006 | Allow filtering by content type (assignment, lab, notice, deadline, resource, important) | P0 | ✅ Implemented |
| FR-007 | Allow filtering by subject | P0 | ✅ Implemented |
| FR-008 | Collapse structured sections into a flat list when any filter or search is active | P1 | ✅ Implemented |
| FR-009 | Show "Overdue" label on post cards whose deadline has passed | P1 | ✅ Implemented |
| FR-010 | Display post count next to section headings | P2 | ✅ Implemented |

### 1.2 Post Detail Page

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-011 | Render post content as Markdown with sanitisation (disallow `script`, `iframe`, `object`, `embed`) | P0 | ✅ Implemented |
| FR-012 | Display type badge, subject badge, creation date, and relative timestamp | P0 | ✅ Implemented |
| FR-013 | Display due date with formatted date and time when present | P0 | ✅ Implemented |
| FR-014 | Render tags as styled chips | P1 | ✅ Implemented |
| FR-015 | Display external links with label and URL in clickable cards | P1 | ✅ Implemented |
| FR-016 | Display file attachments with file name, size, type icon, and download link | P0 | ✅ Implemented |
| FR-017 | Provide a "Share" button using native Web Share API with formatted text (`*Title*\nBatchHub: URL`) and robust clipboard fallback | P0 | ✅ Implemented |
| FR-018 | Show a "Back to BatchHub" navigation bar at the top | P1 | ✅ Implemented |

### 1.3 Admin Authentication
| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-019 | Password-protected admin login screen at `/admin` | P0 | ✅ Implemented |
| FR-020 | Password validated server-side only (never checked client-side) | P0 | ✅ Implemented |
| FR-021 | Store authenticated session token in `sessionStorage` (cleared on tab close) | P0 | ✅ Implemented |
| FR-022 | Support logout action that clears the session token | P0 | ✅ Implemented |
| FR-023 | Enforce persistent 10-attempt, 24-hour lockout stored in `localStorage` with live UI countdown timer | P0 | ✅ Implemented |
| FR-024 | Integrate Cloudflare Turnstile invisible bot challenge on admin login form | P0 | ✅ Implemented |
| FR-025 | Compute and track browser device fingerprint across IP/VPN changes | P0 | ✅ Implemented |
| FR-026 | Enforce global velocity limit of 30 failed login attempts/day site-wide | P0 | ✅ Implemented |

### 1.4 Admin Dashboard

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-027 | Display dashboard with stat cards: Total Posts, Published, Drafts, Subjects | P0 | ✅ Implemented |
| FR-028 | Provide quick action buttons: "Create New Post" and "Manage Posts" | P1 | ✅ Implemented |
| FR-029 | Sidebar navigation with links to Dashboard, Create Post, Manage Posts, and Subjects | P0 | ✅ Implemented |
| FR-030 | Responsive sidebar that collapses to a hamburger menu on mobile | P1 | ✅ Implemented |

### 1.5 Post Management (Admin)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-031 | Create new posts with: title (required), content (Markdown), type, subject, due date, status, pin toggle, tags, links, and file attachments | P0 | ✅ Implemented |
| FR-032 | Edit existing posts with all fields pre-populated | P0 | ✅ Implemented |
| FR-033 | Delete posts with confirmation | P0 | ✅ Implemented |
| FR-034 | Change post status between published, draft, and archived | P0 | ✅ Implemented |
| FR-035 | Live Markdown preview toggle in the content editor | P1 | ✅ Implemented |
| FR-036 | Drag-and-drop file upload with 10 MB per file size limit | P1 | ✅ Implemented |
| FR-037 | Multiple link entries per post with label + URL pairs | P1 | ✅ Implemented |
| FR-038 | Comma-separated tag input | P2 | ✅ Implemented |

### 1.6 Subject Management (Admin)

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-039 | Create subjects with name, code, and hex color | P0 | ✅ Implemented |
| FR-040 | Edit existing subjects | P0 | ✅ Implemented |
| FR-041 | Delete subjects (associated posts get `subject_id = NULL` via `ON DELETE SET NULL`) | P0 | ✅ Implemented |

### 1.7 Discord Bot Integration

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-042 | Handle Discord interaction webhook with Ed25519 signature verification via `tweetnacl` | P1 | ✅ Implemented |
| FR-043 | Respond to Discord PING (type 1) for endpoint verification | P1 | ✅ Implemented |
| FR-044 | Support `/post create` with title, type, content, due date, pin, tags, links, subject, and file attachments | P1 | ✅ Implemented |
| FR-045 | Support `/post update` to edit existing posts by ID, including clearing fields via `"clear"` | P1 | ✅ Implemented |
| FR-046 | Support `/post delete` to permanently remove posts and cascade-delete attachments | P1 | ✅ Implemented |
| FR-047 | Support `/post pin` and `/post unpin` to toggle pinned status directly from Discord | P1 | ✅ Implemented |
| FR-048 | Support `/post list` with optional filters (type, status) and count limit | P1 | ✅ Implemented |
| FR-049 | Support `/post view` rendering full post details as a dark-aesthetic rich Discord embed | P1 | ✅ Implemented |
| FR-050 | Support `/post archive` and `/post publish` for post visibility control | P1 | ✅ Implemented |
| FR-051 | Handle Discord Autocomplete (`type: 4`) for live subject searching by name/code | P1 | ✅ Implemented |
| FR-052 | Automatically download Discord attachments and persist to Supabase Storage with UUID prefix | P1 | ✅ Implemented |
| FR-053 | Provide a registration script (`scripts/register-discord-commands.js`) deploying all 9 subcommands | P2 | ✅ Implemented |

### 1.8 Demo Mode

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-046 | Detect missing Supabase credentials and fall back to in-memory demo data | P1 | ✅ Implemented |
| FR-047 | Demo data includes sample subjects and posts with relative dates for freshness | P2 | ✅ Implemented |
| FR-048 | All CRUD operations work against in-memory arrays in demo mode | P2 | ✅ Implemented |

---

## 2. Non-Functional Requirements

### 2.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-001 | First Contentful Paint | < 1.5s on 4G |
| NFR-002 | Bundle size (gzipped) | < 150 KB |
| NFR-003 | Search debounce latency | 300 ms |
| NFR-004 | Serverless function cold start | < 500 ms |

### 2.2 Security

| ID | Requirement | Implementation |
|----|-------------|----------------|
| NFR-005 | Server-side password validation | Admin password sent as Bearer token, verified by serverless function |
| NFR-006 | Timing-safe password comparison | `crypto.timingSafeEqual` prevents timing attacks |
| NFR-007 | 4-Tier Brute Force Protection | (1) 10 attempts/24h per IP, (2) 10 attempts/24h per device fingerprint, (3) Cloudflare Turnstile anti-bot challenge, (4) 30 failed attempts/24h global limit via Supabase |
| NFR-008 | Payload field whitelisting | Only allowed fields (`POST_FIELDS`, `SUBJECT_FIELDS`, `ATTACHMENT_FIELDS`) are extracted from request payloads |
| NFR-009 | Search input sanitisation | PostgREST/SQL wildcard characters (`%`, `_`, `\`) escaped before query |
| NFR-010 | Markdown sanitisation | `script`, `iframe`, `object`, `embed` elements are disallowed in rendered Markdown |
| NFR-011 | Row Level Security (RLS) | All Supabase tables have RLS enabled; anon can only SELECT published posts |
| NFR-012 | Content Security Policy | CSP headers configured in `vercel.json` with Turnstile domains allowed |
| NFR-013 | File upload path safety | Filenames sanitised and prefixed with `crypto.randomUUID()` to prevent collisions and path traversal |
| NFR-014 | CORS configuration | Configurable `ALLOWED_ORIGIN` env var; defaults to `*` |

### 2.3 Usability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-015 | Mobile-first responsive design | Fully usable from 320px screen width |
| NFR-016 | Accessibility: Focus outlines | All interactive elements have visible `focus-visible` outlines |
| NFR-017 | Accessibility: ARIA labels | Search toggle, admin buttons have `aria-label` attributes |
| NFR-018 | Smooth animations | Fade-in, staggered children, and hover transitions using `cubic-bezier` easing |

### 2.4 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-019 | Graceful degradation | App functions in demo mode without Supabase |
| NFR-020 | Error states | Dedicated error component with retry button for failed API calls |
| NFR-021 | Loading states | Skeleton loaders and spinners for all async operations |
| NFR-022 | Toast notifications | Success/error feedback for all admin actions |

---

## 3. Data Requirements

### 3.1 Subjects Table

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `name` | TEXT | Not null |
| `code` | TEXT | Optional short code |
| `color` | TEXT | Hex colour, default `#6366f1` |
| `created_at` | TIMESTAMPTZ | Auto-set |

### 3.2 Posts Table

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `title` | TEXT | Not null |
| `content` | TEXT | Markdown body |
| `type` | TEXT | Enum check: `assignment`, `lab`, `notice`, `deadline`, `resource`, `important` |
| `subject_id` | UUID | FK → subjects, `ON DELETE SET NULL` |
| `is_pinned` | BOOLEAN | Default `false` |
| `status` | TEXT | Enum check: `published`, `draft`, `archived` |
| `due_date` | TIMESTAMPTZ | Optional deadline |
| `tags` | TEXT[] | Array of strings |
| `links` | JSONB | Array of `{label, url}` objects |
| `batch_id` | TEXT | Default `'default'` (placeholder for multi-tenant) |
| `created_by` | TEXT | Default `'admin'` |
| `created_at` | TIMESTAMPTZ | Auto-set |
| `updated_at` | TIMESTAMPTZ | Auto-updated via trigger |

### 3.3 Attachments Table

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `post_id` | UUID | FK → posts, `ON DELETE CASCADE` |
| `file_name` | TEXT | Not null |
| `file_url` | TEXT | Not null, public URL from Supabase Storage |
| `file_size` | BIGINT | Size in bytes |
| `file_type` | TEXT | MIME type |
| `created_at` | TIMESTAMPTZ | Auto-set |

### 3.4 Admin Login Attempts Table

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `ip` | TEXT | Client IP address (default `'unknown'`) |
| `fingerprint` | TEXT | Optional browser device fingerprint hash |
| `success` | BOOLEAN | `true` if login succeeded, `false` otherwise |
| `attempted_at` | TIMESTAMPTZ | Auto-set to `now()` |

---

## 4. Environment Variables

| Variable | Scope | Required | Purpose |
|----------|-------|----------|---------|
| `VITE_SUPABASE_URL` | Client + Server | Yes (for production) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client | Yes (for production) | Supabase anonymous key |
| `VITE_TURNSTILE_SITE_KEY` | Client | Optional | Cloudflare Turnstile public site key |
| `ADMIN_PASSWORD` | Server only | Yes | Admin dashboard password |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Yes | Full DB access for admin API and Discord bot |
| `TURNSTILE_SECRET_KEY` | Server only | Optional | Cloudflare Turnstile server validation secret |
| `DISCORD_PUBLIC_KEY` | Server only | Optional | Discord interaction signature verification |
| `DISCORD_TOKEN` | Local script only | Optional | Bot token for command registration |
| `DISCORD_APP_ID` | Local script only | Optional | Application ID for command registration |
