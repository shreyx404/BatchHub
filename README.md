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
- ✏️ Create, edit, publish, archive posts with timezone-safe date picking
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

BatchHub includes a built-in serverless function to receive posts directly from Discord via Slash Commands (`/post`). 

1. Create an app in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Deploy BatchHub to Vercel and add `DISCORD_PUBLIC_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to your Vercel Environment Variables.
3. In Discord's Developer Portal, set your **Interactions Endpoint URL** to `https://<your-vercel-domain>/api/discord`.
4. Register the slash commands to your server by running:
```bash
DISCORD_TOKEN="your-bot-token" DISCORD_APP_ID="your-app-id" node scripts/register-discord-commands.js
```

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
