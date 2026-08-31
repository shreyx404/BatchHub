# BatchHub — Technology Stack

> **Version:** 1.4  
> **Last Updated:** 2026-08-31

---

## Overview

BatchHub is built with a modern JAMstack architecture: a React SPA frontend hosted on Vercel's CDN (with lazy route splitting), serverless API functions for secure admin operations, and Supabase as the managed backend (PostgreSQL).

---

## 1. Frontend

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **React** | 19.1 | UI component library | Industry standard, large ecosystem, hooks-based architecture |
| **Vite** | 6.3 | Build tool & dev server | Instant HMR, fast builds, native ES modules support |
| **React Router** | 7.6 | Client-side routing | SPA navigation with `lazy()` route splitting and Suspense fallback |
| **Tailwind CSS** | 4.1 | Utility-first CSS framework | Rapid styling with custom design tokens via `@theme` directive |
| **Lucide React** | 0.511 | Icon library | Consistent, tree-shakeable SVG icons |
| **React Markdown** | 10.1 | Markdown rendering | Safe rendering of user-authored content with element filtering |
| **React Hot Toast** | 2.5 | Toast notifications | Lightweight, customisable notification system styled with 0px sharp corners |
| **date-fns** | 4.1 | Date utilities | Tree-shakeable date formatting, relative times, and comparisons |
| **Cloudflare Turnstile** | v0 API | Invisible CAPTCHA / Anti-Bot | Free, privacy-focused bot defense loaded asynchronously without UX friction |
| **Device Fingerprinting** | Internal | Hardware & Graphics Hashing | Zero-dependency canvas, WebGL, and hardware signals hashed via djb2 algorithm |
| **Web Share & Clipboard** | Native Web APIs | Formatted Post Sharing | Native OS share sheet with automatic asynchronous clipboard copy fallback |

---

## 2. Backend & Database

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Supabase** | Managed PostgreSQL + Auth + Realtime | Zero server management; built-in RLS, RESTful API |
| **PostgreSQL** | Relational database | Strong typing, array columns (`TEXT[]`), JSONB support (`links`), full-text search (GIN indexes), triggers |
| **Supabase JS Client** | 2.49 | Official SDK for both client (anon key) and server (service role key) access |
| **admin_login_attempts** | Database Table | Persistent site-wide login attempt logging for 24-hour rate limiting & audit |

---

## 3. Serverless Functions

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Vercel Serverless Functions** | Backend API endpoints | Zero-config deployment alongside the frontend; scales automatically |
| **Node.js (crypto)** | SHA-256 Timing-safe comparison | `crypto.createHash('sha256')` + `crypto.timingSafeEqual` prevents timing & length side-channel attacks |
| **Cloudflare Siteverify API** | Server-side bot verification | Validates client Turnstile tokens with Cloudflare |
| **tweetnacl** | 1.0.3 | Ed25519 signature verification for Discord webhook security |

---

## 4. Hosting & Deployment

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Vercel** | Hosting platform | Git-push deploys, global CDN, serverless functions, environment variable management |
| **GitHub** | Source control | Standard Git workflow, Vercel integration |

---

## 5. Development Tooling

| Tool | Version | Purpose |
|------|---------|---------|
| **@vitejs/plugin-react** | 4.5 | React Fast Refresh + JSX transform for Vite |
| **@tailwindcss/vite** | 4.1 | Tailwind CSS integration with Vite build pipeline |
| **dotenv** | 17.4 | Environment variable loading for dev server and local scripts |
| **Vite Dev API Middleware** | Custom SSR | Executes `/api/admin.js` serverless handler during local `npm run dev` development |

---

## 6. Design System

### Typography

| Font | Family | Usage |
|------|--------|-------|
| **Playfair Display** | Serif | Headings (`h1`–`h4`), display text, post titles |
| **Inter** | Sans-serif | Body text, labels, UI elements, meta information |
| **SF Mono / Consolas** | Monospace | Timestamps, code blocks, technical labels |

### Type Scale

| Token | Size | Typical Use |
|-------|------|-------------|
| `--text-xs` | 11px | Micro labels, section headers, meta counters |
| `--text-sm` | 13px | Body small, buttons, badges |
| `--text-base` | 15px | Default body text |
| `--text-lg` | 17px | Blockquotes, emphasized body |
| `--text-xl` | 20px | H3, sub-headings |
| `--text-2xl` | 26px | H2, stat numbers |
| `--text-3xl` | 34px | H1 in prose |
| `--text-4xl` | 44px | Hero heading (mobile) |
| `--text-5xl` | 56px | Hero heading (desktop) |

### Colour Palette

| Token | Value | Role |
|-------|-------|------|
| `--color-bg` | `#000000` | Page background |
| `--color-surface` | `#000000` | Card/component background |
| `--color-surface-2` | `#0f0f0f` | Elevated surfaces |
| `--color-surface-3` | `#1a1a1a` | Highest elevation |
| `--color-border` | `#1f1f1f` | Subtle borders |
| `--color-border-light` | `#333333` | Visible borders, dividers |
| `--color-text` | `#f5f5f4` | Primary text (warm white) |
| `--color-text-muted` | `#a8a29e` | Secondary text |
| `--color-text-dim` | `#78716c` | Tertiary / placeholder text |
| `--color-accent` | `#f5f5f4` | Buttons, interactive accents |

### Visual Effects

| Effect | Implementation |
|--------|----------------|
| **Glass morphism** | `.glass` / `.glass-strong` with `backdrop-filter: blur()` |
| **Skeleton loaders** | CSS shimmer animation with gradient sweep |
| **Staggered animations** | `.stagger-children` with incremental `animation-delay` (50ms steps) |
| **Micro-interactions** | Hover transforms (`translateY`, `translateX`), border glow, opacity transitions |
| **Ledger design** | Post cards use a vertical timeline with diamond node markers |

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Editorial / Magazine feel** | Serif headings, generous whitespace, refined type scale |
| **Monochromatic** | Black/white/stone colour palette with no per-type color coding |
| **Sharp geometry** | All border-radius tokens set to `0px` (square corners) |
| **Dark-first** | Entire design built for dark backgrounds |
| **Information density** | Compact cards with just enough metadata; expanded detail on click |

---

## 7. Security Technologies

| Area | Technology / Approach |
|------|----------------------|
| **Admin auth** | Bearer token over HTTPS, validated server-side with `crypto.timingSafeEqual` |
| **Layer 1: IP Rate Limiting** | In-memory IP-based tracker (10 failed attempts triggers 24-hour lockout) |
| **Layer 2: Device Fingerprinting** | Client canvas + WebGL + hardware hash tracking (10 failed attempts triggers 24-hour lockout across VPNs) |
| **Layer 3: Bot Challenge** | Cloudflare Turnstile invisible CAPTCHA token validated via `challenges.cloudflare.com` |
| **Layer 4: Global Rate Limiting** | Persistent Supabase query on `admin_login_attempts` (30 failed attempts/24h site-wide triggers cooldown) |
| **Payload safety** | Server-side field whitelisting via `pick()` function |
| **Search safety** | SQL wildcard character escaping (`%`, `_`, `\`) |
| **Markdown safety** | Disallowed elements: `script`, `iframe`, `object`, `embed` |
| **Discord webhook** | Ed25519 signature verification via `tweetnacl` |
| **File uploads** | UUID-prefixed filenames, character sanitisation |
| **HTTP headers** | CSP (including Cloudflare Turnstile), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` |
| **Database access** | Row Level Security: anon = read published only; service role = full access |

---

## 8. Dependency Graph

```
Production Dependencies
├── @supabase/supabase-js   → Database & storage client
├── react                   → UI framework
├── react-dom               → DOM renderer
├── react-router-dom        → Client-side routing
├── react-hot-toast         → Toast notifications
├── react-markdown          → Markdown → React components
├── lucide-react            → Icon library
├── date-fns                → Date formatting & math
└── tweetnacl               → Ed25519 crypto (Discord)

Dev Dependencies
├── vite                    → Build tool
├── @vitejs/plugin-react    → React plugin for Vite
├── tailwindcss             → CSS framework
├── @tailwindcss/vite       → Tailwind Vite integration
└── dotenv                  → Env vars for scripts
```
