# BatchHub

> **One organized place for everything your batch needs to know.**

BatchHub is a modern, mobile-first web app that serves as a centralized academic information gallery for a college batch. It replaces scattered WhatsApp messages with one organized, searchable source of truth.

## Features

### Students
- 📁 **College Study Material Drive Button:** Permanent navigation button in the top header located between Archive and Theme toggle, redirecting students directly to the batch's centralized Google Drive folder for semester materials, notes, syllabus, and study resources in a new tab
- 🌗 **Dark / Light Theme Toggle:** Seamless dual-theme support switching between Editorial Elevated Dark gallery mode (`#050505`) and pristine Editorial Paper Light mode (`#F8F7F4`), featuring zero-flicker startup anti-flash script, system scheme detection, and persistent state
- 📰 **Editorial Elevated Design:** Dark editorial aesthetic with 5-tier surface elevation ladder (`#000000` to `#141414`), warm amber accents (`#D4A574` / `#A86A24`), oversized Playfair Display hero with live stats counter, section dividers with diamond markers (`◇`), and film grain texture overlay
- ⏱️ **Typographic Countdown Cards:** Live-ticking `DD:HH:MM` numeric blocks in the upcoming deadlines banner with count-pulse animations and urgent diamond glows
- 🍱 **Bento Grid Layouts:** High-priority notices and pinned updates feature dynamic 2-column lead cards
- 📜 **Continuous Ledger Timeline:** Seamless zero-gap timeline (`gap-0`) with diamond markers and hover illumination
- 🧭 **Quick Footer Navigation:** Ergonomic bottom bar with quick routes (Home, Calendar, Archive) and amber hover states
- 🔍 Browse, search (`Ctrl + K`), and filter updates
- 🗓️ Full-page interactive Academic Deadlines Calendar (`/calendar`) with **Month**, **Week** (7-day timetable), and **Agenda** (chronological timeline strictly presenting active upcoming deliverables with contained independent scroll and sticky date headers) views, default selection date set to TODAY, subject filter chips, date navigation, today snap-back, selected-date inspector with empty-state handling, upcoming 7-day deadlines sidebar, and greyed-out display of past & archived deliverables in grid/week views
- 🗄️ Full-page Archive gallery (`/archive`) to browse, search (`Ctrl + K`), filter (by content type and subject), and sort (Recent, Oldest, Due Date, A → Z) past events, expired deliverables, and completed assignments with bi-directional URL parameter state
- 📋 View detailed posts with markdown content
- 🔗 Direct access to resource links & document attachments (Google Drive, Classroom, PDFs, GitHub)
- 📅 See upcoming deadlines (automatically unpinned when passed)
- 📌 Pinned important updates
- 📢 Highlighted Notices & Important section at the top of the feed
- 🗂️ Structured feed: Notices → Pinned → Deadline-sorted → General updates
- ⚡ Fast route code splitting with React `Suspense` and `lazy`
- 🔗 Deep links and native formatted post sharing with clipboard fallback

### Admin (BR)
- 🔐 Password-protected admin dashboard backed by a secure Serverless API
- 🛡️ 4-Tier Security Fortress: Cloudflare Turnstile bot verification, Device Fingerprinting, 10-attempt 24-hour lockout, and 30/day global rate limiting
- ⚙️ **App Settings & Material Link Manager:** Dedicated `/admin/settings` management view to configure, test in a new tab, reset to default, and update the global College Study Material URL with instant real-time sync across all mounted headers
- 👁️ Live "Student View" preview embedded directly inside the Admin Dashboard overview
- 🗓️ Integrated multi-mode Admin Calendar view (`/admin/calendar`) with status filters (All, Upcoming, Past Due, Archived, Drafts), quick New Deadline action, and direct edit shortcuts
- ✏️ Create, edit, publish, archive, and 1-click restore posts with timezone-safe date picking
- 📊 Manage all posts with status filters (Published, Drafts, Archived), deep-linking stats cards, and Created Date / Due Date sorting (with no-deadline post priority)
- 📘 Manage assignments, labs, notices, deadlines, resources
- 📚 Manage subjects with color coding
- 🔗 Add and rearrange labeled resource links & attachments (drag-and-drop handles & Move Up/Down buttons)
- ⏱️ Configure pin duration presets (Indefinite, Until Due Date, 24 Hours, 3 Days, 1 Week, 2 Weeks, Custom Date) with dynamic unpinning
- 🤖 Discord Bot Integration: Use slash commands to post instantly from Discord


## Content Types

| Type | Emoji | Description |
|------|-------|-------------|
| Assignment | 📘 | Homework and assignments |
| Lab | 🧪 | Lab work and practicals |
| Notice | 📢 | General announcements |
| Deadline | 📅 | Important deadlines |
| Resource | 📚 | Study materials and references |
| Important | ⭐ | Urgent updates |

## Tech Stack

- **Frontend:** React 19 + Vite 6 + React Router v7 (Lazy routing)
- **Styling:** Tailwind CSS v4 (Editorial Elevated dark design, surface elevation ladder, warm amber accents, 0px sharp corners)
- **Backend:** Supabase (PostgreSQL) + Vercel Serverless Functions
- **Icons:** Lucide React
- **Hosting:** Vercel

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials, admin password, and optionally Turnstile / Discord keys:
```env
# Client-side (bundled into frontend)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key (Optional, Cloudflare Turnstile bot protection)

# Server-side secrets (No VITE_ prefix!)
ADMIN_PASSWORD=your-secure-password
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (Required for Admin Dashboard & Discord)
TURNSTILE_SECRET_KEY=your-turnstile-secret-key (Optional, server-side bot verification)
DISCORD_PUBLIC_KEY=your-discord-public-key (Optional, for Discord Bot)
```

### 3. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor (creates tables including `admin_login_attempts`)
3. Run `supabase/seed.sql` for sample data
4. Copy your Project URL and Anon Key to `.env.local`

### 4. Run development server
```bash
npm run dev
```

### 5. Access the app
- **Student view:** `http://localhost:5173`
- **Admin dashboard:** `http://localhost:5173/admin`

### 6. Run automated tests
```bash
npm test
```
Runs the full-stack automated test suite (Unit, Integration, Dual-Mode API, Security Penetration, Rate Limiting, Turnstile, Auto-Archive Cron, and Discord signature verification).

## Demo Mode

If Supabase credentials are not configured, BatchHub runs in **demo mode** with sample data. Perfect for previewing the UI and admin dashboard without setting up a database.

## 🤖 Discord Bot Integration (Optional)

BatchHub includes a built-in serverless function (`api/discord.js`) providing full post management directly from Discord with interactive Slash Commands.

### Slash Subcommands

| Subcommand | Description | Key Options |
|------------|-------------|-------------|
| `/post create` | Create a new post | `title`*, `type`*, `content`, `due_date`, `is_pinned`, `tags`, `subject`, `links` |
| `/post update` | Update an existing post | `id`*, `title`, `type`, `content`, `due_date`, `is_pinned`, `status`, `tags`, `subject`, `links` |
| `/post delete` | Delete a post permanently | `id`* |
| `/post pin` | Pin a post to the top | `id`* |
| `/post unpin` | Unpin a post | `id`* |
| `/post list` | List recent posts with IDs | `type`, `count` (1–10), `status` |
| `/post view` | View full post details as a rich embed | `id`* |
| `/post archive` | Archive post (hides from student feed) | `id`* |
| `/post publish` | Publish a draft or archived post | `id`* |

*\* = required*

### Key Features
- 📚 **Subject Autocomplete:** Start typing a subject name in `subject` to search and select from registered subjects.
- 🔗 **Links & Resources:** Pass links in `"Label | https://example.com, Slides | https://slides.com"` format.
- 🧹 **Field Clearing:** On `/post update`, pass `"clear"` to remove `due_date`, `tags`, `subject`, or `links`.

### Setup Instructions

1. Create an application in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Under **General Information**, copy the **Public Key** and **Application ID**.
3. Under the **Bot** tab, create a bot and copy its **Token**.
4. In your Vercel project environment variables, configure:
   - `DISCORD_PUBLIC_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_SUPABASE_URL`
5. In Discord's Developer Portal, set your **Interactions Endpoint URL** to:
   ```
   https://<your-vercel-domain>/api/discord
   ```
6. Register the slash commands globally by running:
   ```bash
   node scripts/register-discord-commands.js
   ```
   *(Ensure `DISCORD_TOKEN` and `DISCORD_APP_ID` are set in `.env` or `.env.local`)*

## Deployment

### Vercel
1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy!

The `vercel.json` handles SPA routing and CSP automatically.

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Router (lazy route splitting + Suspense)
├── index.css             # Design system (@theme, surface ladder, amber tokens, utilities)
├── lib/                  # API, constants, Supabase client, demoData.js, fingerprint.js
├── hooks/                # Custom React hooks (usePosts, usePost, useSubjects, useCalendar, useArchivePosts, useAdmin)
├── components/
│   ├── layout/           # Header, Footer (with quick navigation)
│   ├── ui/               # Badges, search, filters, archive sort, modals, states
│   ├── posts/            # PostCard, PostGrid, DeadlineBanner (countdown), PinnedSection, NoticesSection
│   ├── calendar/         # CalendarGrid, CalendarWeekView, CalendarAgendaView, CalendarSidebar, CalendarControls
│   └── admin/            # Admin forms, tables, sidebar, calendar, login with Turnstile
└── pages/                # Route pages (HomePage, CalendarPage, ArchivePage, PostPage, AdminPage, NotFoundPage)

api/                      # Vercel Serverless Functions
├── admin.js              # Secure backend for admin dashboard (5-tier rate limiting)
├── calendar.js           # Public serverless calendar deadlines API (service-role)
├── discord.js            # Discord interactions webhook (Ed25519)
└── cron/
    └── auto-archive.js   # Daily Vercel Cron for archiving expired posts

tests/                    # Automated Test Suite
└── runner.js             # Zero-dependency test runner (unit, api, security, cron, discord)

scripts/                  
└── register-discord-commands.js # Script to deploy Discord slash commands
```

## License

Private — built for internal batch use.
