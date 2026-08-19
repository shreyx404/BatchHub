# BatchHub

> **One organized place for everything your batch needs to know.**

BatchHub is a modern, mobile-first web app that serves as a centralized academic information gallery for a college batch. It replaces scattered WhatsApp messages with one organized, searchable source of truth.

## Features

### Students
- 🔍 Browse, search, and filter updates
- 📋 View detailed posts with markdown content
- 📎 Download attachments
- 📅 See upcoming deadlines
- 📌 Pinned important updates
- 🔗 Deep links for sharing on WhatsApp

### Admin (BR)
- 🔐 Password-protected admin dashboard
- ✏️ Create, edit, publish, archive posts
- 📘 Manage assignments, labs, notices, deadlines, resources
- 📚 Manage subjects with color coding
- 📎 Upload attachments (drag-and-drop)
- 🏷️ Add tags and external links

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

Edit `.env.local` with your Supabase credentials and admin password.

### 3. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
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

## Deployment

### Vercel
1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy!

The `vercel.json` handles SPA routing automatically.

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Router
├── index.css             # Design system
├── lib/                  # API, constants, Supabase client
├── hooks/                # Custom React hooks
├── components/
│   ├── layout/           # Header, Footer
│   ├── ui/               # Badges, search, filters, modals
│   ├── posts/            # Post cards, grid, deadlines
│   └── admin/            # Admin forms, tables, sidebar
└── pages/                # Route pages
```

## License

Private — built for internal batch use.
