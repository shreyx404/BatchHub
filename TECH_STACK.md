# BatchHub — Technology Stack

> **Version:** 1.9  
> **Last Updated:** 2026-09-10

---

## Overview

BatchHub is built with a modern JAMstack architecture: a React SPA frontend hosted on Vercel's CDN (with lazy route splitting), serverless API functions for secure admin operations, and Supabase as the managed backend (PostgreSQL).

---

## 1. Frontend

| Technology | Version | Purpose | Why Chosen |
|------------|---------|---------|------------|
| **React** | 19.1 | UI component library | Industry standard, large ecosystem, hooks-based architecture |
| **Vite** | 6.3 | Build tool & dev server | Instant HMR, fast builds, native ES modules support |
| **React Router** | 7.6 | Client-side routing | SPA navigation with `lazy()` route splitting and Suspense fallback (`/`, `/calendar`, `/archive`, `/post/:id`, `/admin/*`) |
| **Tailwind CSS** | 4.1 | Utility-first CSS framework | Rapid styling with custom design tokens via `@theme` directive |
| **Theme Management** | Custom (`ThemeContext`) | Dual-theme state & persistence | Zero-dependency React Context + `localStorage` + inline anti-flash script + OS scheme listener |
| **Lucide React** | 0.511 | Icon library | Consistent, tree-shakeable SVG icons |
| **React Markdown** | 10.1 | Markdown rendering | Safe rendering of user-authored content with element filtering |
| **React Hot Toast** | 2.5 | Toast notifications | Lightweight, customisable notification system styled with 0px sharp corners and theme CSS variables |
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
| **app_settings** | Database Table | Persistent key-value store for global batch configurations (College Material Google Drive URL) |
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
| **Playfair Display** | Serif | Headings (`h1`–`h4`), display text, oversized hero, post titles |
| **Inter** | Sans-serif | Body text, labels, UI elements, meta information |
| **SF Mono / Consolas** | Monospace | Timestamps, code blocks, technical labels, countdown units |

### Type Scale

| Token | Size | Typical Use |
|-------|------|-------------|
| `--text-xs` | 11px | Micro labels, section headers, meta counters |
| `--text-sm` | 13px | Body small, buttons, badges |
| `--text-base` | 15px | Default body text |
| `--text-lg` | 17px | Blockquotes, emphasized body |
| `--text-xl` | 20px | H3, sub-headings |
| `--text-2xl` | 26px | H2, stat numbers, PostCard titles |
| `--text-3xl` | 34px | H1 in prose |
| `--text-4xl` | 44px | Hero heading (mobile) |
| `--text-5xl` | 56px | Hero heading (tablet) |
| `--text-6xl` | 72px | Oversized editorial hero heading (desktop) |

### Colour Palette & Surface Elevation Ladder

| Token | Value | Role |
|-------|-------|------|
| `--color-bg` | `#000000` | Deepest page background (pure black) |
| `--color-surface` | `#050505` | Primary content surface |
| `--color-surface-2` | `#0A0A0A` | Elevated card containers / subsurfaces |
| `--color-surface-3` | `#111111` | Highest elevation / inputs / pills |
| `--color-surface-hover` | `#141414` | Interactive hover highlight |
| `--color-border` | `#1f1f1f` | Subtle structural borders |
| `--color-border-light` | `#333333` | Visible borders, dividers |
| `--color-amber` | `#D4A574` | Warm amber accent for focal hierarchy, urgency, and rules |
| `--color-amber-dim` | `rgba(212, 165, 116, 0.15)` | Amber background fills and selection tint |
| `--color-amber-glow` | `rgba(212, 165, 116, 0.08)` | Ambient glow on active cards and countdown units |
| `--color-text` | `#f5f5f4` | Primary text (warm white) |
| `--color-text-muted` | `#a8a29e` | Secondary text |
| `--color-text-dim` | `#78716c` | Tertiary / placeholder text |
| `--color-accent` | `#f5f5f4` | Buttons, interactive accents |

### Visual Effects & Micro-Interactions

| Effect | Implementation |
|--------|----------------|
| **Glass morphism** | `.glass` / `.glass-strong` with `backdrop-filter: blur()` and amber tint highlights |
| **Section Dividers** | `.section-divider` editorial thin rules with centered diamond marker (`◇`) |
| **Film Grain Overlay** | `.grain-overlay` subtle textured animation for organic editorial depth |
| **Scroll Reveal** | `.scroll-reveal` with IntersectionObserver entry animations |
| **Typographic Countdown** | Large `DD:HH:MM` numeric blocks with ticking count-pulse micro-animation |
| **Bento Grid Hierarchy** | 2-column span for primary notice and pinned cards |
| **Diamond Pulse** | Breathing amber glow on urgent deadlines (`animate-diamond-pulse`) |
| **Skeleton loaders** | CSS shimmer animation with gradient sweep |
| **Ledger design** | Post cards use a continuous vertical timeline with diamond node markers (`gap-0`) |

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Editorial Elevated** | Oversized serif headings, generous negative space, film grain, and small-caps tracking |
| **Monochromatic + Amber** | Monochromatic baseline accented with warm amber (`#D4A574`) strictly for focal points & urgency |
| **Sharp geometry** | All border-radius tokens strictly set to `0px` (square corners) |
| **Surface Depth** | 5-level surface elevation ladder providing visual hierarchy without borders clutter |
| **Mobile & Tablet Ergonomics** | Fluid typography, edge-to-edge touch scrolling, and 44px minimum touch targets |

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
| **Database access** | Row Level Security: anon = read published & archived posts; service role = full access |

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
