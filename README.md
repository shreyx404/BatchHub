# BatchHub

> **One organized place for everything your batch needs to know.**

BatchHub is a modern, mobile-first web app that serves as a centralized academic information gallery for a college batch. It replaces scattered WhatsApp messages with one organized, searchable source of truth.

## Features

### Students
- 🔍 Browse, search, and filter updates
- 📋 View detailed posts with markdown content
- 📎 Download attachments
- 📅 See upcoming deadlines (automatically unpinned when passed)
- 📌 Pinned important updates
- 📢 Highlighted Notices & Important section at the top of the feed
- 🗂️ Structured feed: Notices → Pinned → Deadline-sorted → General updates
- 🔗 Deep links and native formatted post sharing with clipboard fallback

### Admin (BR)
- 🔐 Password-protected admin dashboard backed by a secure Serverless API
- 🛡️ 4-Tier Security Fortress: Cloudflare Turnstile bot verification, Device Fingerprinting, 10-attempt 24-hour lockout, and 30/day global rate limiting
- 👁️ Live "Student View" preview embedded directly inside the Admin Dashboard overview
- ✏️ Create, edit, publish, archive posts with timezone-safe date picking
- 📊 Manage all posts with status filters and Created Date / Due Date sorting (with no-deadline post priority)
- 📘 Manage assignments, labs, notices, deadlines, resources
- 📚 Manage subjects with color coding
- 📎 Upload attachments (drag-and-drop)
- 🏷️ Add tags and external links
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

- **Frontend:** React 19 + Vite 6
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Storage)
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
4. Create a storage bucket named `attachments` (set to Public)
5. Copy your Project URL and Anon Key to `.env.local`

### 4. Run development server
```bash
npm run dev
```

### 5. Access the app
- **Student view:** `http://localhost:5173`
- **Admin dashboard:** `http://localhost:5173/admin`

## Demo Mode

If Supabase credentials are not configured, BatchHub runs in **demo mode** with sample data. Perfect for previewing the UI without setting up a database.

## 🤖 Discord Bot Integration (Optional)

BatchHub includes a built-in serverless function (`api/discord.js`) providing full post management directly from Discord with interactive Slash Commands.

### Slash Subcommands

| Subcommand | Description | Key Options |
|------------|-------------|-------------|
| `/post create` | Create a new post | `title`*, `type`*, `content`, `due_date`, `is_pinned`, `tags`, `subject`, `links`, `file` |
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
- 📎 **File Attachments:** Attach files directly in `/post create` — automatically downloaded and saved to Supabase Storage.
- 🔗 **Links Parsing:** Pass links in `"Label | https://example.com, Slides | https://slides.com"` format.
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
├── App.jsx               # Router
├── index.css             # Design system
├── lib/                  # API, constants, Supabase client, fingerprint.js
├── hooks/                # Custom React hooks (usePosts, usePost, useSubjects, useAdmin)
├── components/
│   ├── layout/           # Header, Footer
│   ├── ui/               # Badges, search, filters, modals
│   ├── posts/            # Post cards, grid, deadlines, notices section
│   └── admin/            # Admin forms, tables, sidebar, login with Turnstile
└── pages/                # Route pages

api/                      # Vercel Serverless Functions
├── admin.js              # Secure backend for admin dashboard (4-tier security)
└── discord.js            # Discord interactions webhook

scripts/                  
└── register-discord-commands.js # Script to deploy Discord slash commands
```

## License

Private — built for internal batch use.
