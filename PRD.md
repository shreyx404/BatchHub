# BatchHub — Product Requirements Document (PRD)

> **Version:** 1.2  
> **Last Updated:** 2026-08-22  
> **Status:** Living Document

---

## 1. Vision & Problem Statement

### The Problem

College batches rely on WhatsApp groups to share assignments, deadlines, lab schedules, and notices. This creates:

- **Information overload** — important updates get buried under casual conversation.
- **No searchability** — students scroll endlessly to find a specific assignment or deadline.
- **No structure** — everything is dumped into one flat chat with no categorisation.
- **No accountability** — no single source of truth; conflicting information spreads easily.
- **Ephemeral media** — attachments expire, links rot, and context is lost.

### The Vision

**BatchHub** is *one organised place for everything your batch needs to know* — a modern, mobile-first web app that replaces scattered WhatsApp messages with a centralized, searchable, and structured academic information gallery.

---

## 2. Target Users & Personas

| Persona | Role | Goals |
|---------|------|-------|
| **Student** | Passive consumer | Browse updates, check deadlines, access resource links/documents, share links with classmates |
| **Batch Representative (BR)** | Admin / Content creator | Post assignments, notices, deadlines; manage subjects; keep information current |
| **Discord-active BR** | Power user | Post updates directly from Discord without opening the web app |

---

## 3. Core Features

### 3.1 Student-Facing (Public)

| # | Feature | Description |
|---|---------|-------------|
| F-01 | **Structured Feed** | Notices → Pinned → Deadline-sorted → General updates |
| F-02 | **Deadline Banner** | Horizontal scrollable banner showing upcoming deadlines with countdown timers; urgent items (< 48h) are visually highlighted |
| F-03 | **Dynamic Unpinning** | Posts with expired `due_date` automatically lose their pinned status client-side |
| F-04 | **Search** | Debounced (300 ms) full-text search across title and content fields with `Ctrl + K` shortcut |
| F-05 | **Filters** | Filter by content type (assignment, lab, notice, etc.) and by subject |
| F-06 | **Post Detail Page** | Full Markdown rendering, tags, direct resource links & attachments, and formatted share button |
| F-07 | **Deep Links & Sharing** | Every post has a unique URL (`/post/:id`) shareable via native Web Share API with rich formatted text (`*<Title>*\n\n_BatchHub :_ ->\n<Link>`) and robust clipboard fallback |
| F-08 | **Academic Deadlines Calendar View** | Full-page interactive calendar (`/calendar`) supporting **Month**, **Week** (7-day timetable with touch scrolling), and **Agenda** (chronological grouped timeline strictly presenting upcoming deliverables with countdowns) views, complete with subject filter chips, date navigation, today snap-back, urgency indicators (< 24h red badges), selected-date inspector drawer with direct resource links, upcoming 7-day queue, and faded-out display of past & archived events in grid/week views |
| F-08a | **Demo Mode** | App runs with sample data when Supabase is not configured, allowing UI preview without a database |

### 3.2 Admin Dashboard (Password-Protected)

| # | Feature | Description |
|---|---------|-------------|
| F-09 | **Secure Login & Multi-Layer Defense** | Password validated server-side with SHA-256 hashed `crypto.timingSafeEqual`; protected by 4 security layers: 10 attempts / 24-hour lockout per IP, per-device fingerprint tracking, Cloudflare Turnstile bot verification, and a 30 failed attempts / 24-hour global site-wide limit |
| F-10 | **Dashboard Overview & Live Student View** | Stats cards (total posts, published, drafts, archived, subjects), quick action buttons, and an embedded live "Student View" preview panel mirroring the homepage feed |
| F-11 | **Post CRUD & Management** | Create, edit, publish, archive, and delete posts with live Markdown preview; filter by status and sort by created date or due date |
| F-12 | **Subject Manager** | Create, edit, delete subjects with color coding |
| F-13 | **Resource Links & Attachments** | Add labeled resource links (Google Drive, Classroom, PDFs, GitHub) without upload bottlenecks |
| F-14 | **Metadata Management** | Tags (comma-separated), external links (label + URL pairs), due dates, pin toggle, status control |
| F-14a | **Admin Calendar View** | Dedicated multi-mode calendar view in Admin Dashboard (`/admin/calendar`) accessible from sidebar navigation for inspecting batch deliverables in Month, Week, and Agenda modes, featuring status filters for matrix views (`All`, `Upcoming`, `Past Due`, `Archived`, `Drafts`), upcoming queue, and direct "Edit Post" shortcuts (with past/archived items excluded in Agenda mode) |

### 3.3 Discord Bot Integration (Optional)

| # | Feature | Description |
|---|---------|-------------|
| F-15 | **Full Post Management via `/post`** | Comprehensive slash subcommands: `/post create` (with subject autocomplete, links parsing), `/post update`, `/post delete`, `/post pin`, `/post unpin`, `/post list`, `/post view` (rich embed), `/post archive`, and `/post publish` |
| F-16 | **Signature Verification** | Cryptographic Ed25519 signature verification using `tweetnacl` to validate all incoming Discord interactions |
| F-17 | **Subject Autocomplete** | Live subject search on Discord `type: 4` interactions |

---

## 4. Content Model

### 4.1 Content Types

| Type | Use Case |
|------|----------|
| `assignment` | Homework and assignments |
| `lab` | Lab work and practicals |
| `notice` | General announcements |
| `deadline` | Important date reminders |
| `resource` | Study materials and references |
| `important` | Urgent, high-priority updates |

### 4.2 Post Statuses

| Status | Visibility |
|--------|------------|
| `published` | Visible to all students in main feed & calendar |
| `draft` | Only visible in admin dashboard |
| `archived` | Hidden from public home feed; visible in Admin Posts table and in Calendar views (in faded-out theme) |

---

## 5. Feed Ordering Logic

When no filters are active, the homepage displays posts in this priority order:

1. **Notices & Important** — highlighted section at the top
2. **Pinned posts** — excluding any already shown in notices
3. **Posts with due dates** — sorted ascending by deadline (soonest first)
4. **Posts without due dates** — sorted ascending by `created_at` (FCFS)

When filters or search are active, all sections collapse into a flat, chronological list.

---

## 6. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| **Performance** | First Contentful Paint < 1.5s on 4G |
| **Mobile-first** | Fully usable on 320px+ screens |
| **Accessibility** | Focus-visible outlines, semantic HTML, ARIA labels on interactive elements |
| **Security** | RLS on all tables, timing-safe password comparison, 4-tier brute force defense: 10 attempts / 24h lockout per IP & device fingerprint, Cloudflare Turnstile anti-bot, 30/day global rate limiting, CSP headers, payload field whitelisting |
| **Offline resilience** | Demo mode with sample data when DB is unavailable |
| **SEO** | Proper meta tags, semantic heading hierarchy |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Adoption | > 80% of batch members use BatchHub as primary source within 2 weeks |
| Engagement | Average 3+ visits per week per student |
| Admin efficiency | BR can create and publish a post in < 60 seconds |
| Data freshness | Zero stale pinned posts (dynamic unpinning handles this automatically) |

---

## 8. Out of Scope (v1)

- User authentication for students (currently public read-only)
- Push notifications / email alerts
- Comments or reactions on posts
- Multi-batch / multi-tenant support (schema has `batch_id` placeholder but not implemented)
- Analytics dashboard for admin
- PWA / offline caching
