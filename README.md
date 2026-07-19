# Spin to Lead

An interactive leadership game by **The Voyage Club** — built for the university Orientation & Induction stall.

> Every leader starts with one bold step.

First-year students walk up to a kiosk, enter their name, spin a wheel, complete a short leadership challenge, and see their result — all in under 90 seconds.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS (custom warm-ivory editorial palette)
- shadcn/ui-style component primitives
- Framer Motion (wheel physics, page transitions)
- Zustand (game + admin session state)
- TanStack Query (server state)
- Supabase (database, storage, optional auth) with a **full local mock mode**

## Getting started

```bash
npm install
cp .env.example .env   # optional — app runs in mock mode without it
npm run dev
```

Open http://localhost:5173.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | No | Supabase project URL. Absent → mock mode. |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase anon/publishable key. |
| `VITE_ADMIN_PASSWORD` | No | Password for the mock admin login (default `voyage-admin`). |
| `VITE_KIOSK_IDLE_TIMEOUT_MS` | No | Idle ms before kiosk auto-resets to Welcome (default `120000`). |

## Mock mode

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are not set, the app runs entirely on local seed data (32 questions across 4 categories). Everything works: playing, admin CRUD (in-memory for the session), participant log, CSV export. Data resets on page reload.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL files in order in the SQL editor:
   - `supabase/schema.sql` — tables, RLS policies, triggers
   - `supabase/seed.sql` — 32 seed questions
   - `supabase/storage-setup.sql` — `leader-images` storage bucket
3. Copy the project URL and anon key into `.env`.

### A note on security

This is an event kiosk app, not a bank. The admin panel is gated by a client-side
password (`VITE_ADMIN_PASSWORD`) and RLS policies allow anonymous reads of active
questions and inserts of participant plays. Question/media writes are permitted to
the anon role so the admin panel works without full Supabase Auth. If you need
stricter guarantees, wire up Supabase Auth email/password for the admin account and
tighten the RLS policies in `supabase/schema.sql` accordingly.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Welcome |
| `/participant` | Participant details |
| `/spin` | Spinner wheel |
| `/challenge` | Challenge (renders by category) |
| `/result` | Result |
| `/thank-you` | Thank-you / finish |
| `/admin` | Admin login |
| `/admin/dashboard` | Admin overview |
| `/admin/questions` | Question management |
| `/admin/media` | Media management |
| `/admin/participants` | Participant log + leaderboard |

## Kiosk behaviour

- Auto-resets to Welcome after 2 minutes of inactivity (configurable)
- Zoom/refresh gestures suppressed where the browser allows
- Text selection disabled on UI chrome, kept for form inputs
- All tap targets ≥ 48px
- `prefers-reduced-motion` respected (wheel selects instantly)

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Typecheck only |
| `npm run test:e2e` | Run the Playwright acceptance suite in local mock mode |
| `npm run test:e2e:ui` | Open the Playwright test runner UI |

## Verification and event-day checks

`npm run test:e2e` starts a separate Vite server with Supabase variables deliberately blank. It verifies the participant journey, all four challenge types, and core admin workflows against safe in-memory data; it never writes to the live event project.

Run the one-off production check in [tests/e2e/live-smoke.md](tests/e2e/live-smoke.md) before the event. It covers the live question read, participant write/readback, and Storage access with cleanup instructions.

Before launch, replace the placeholder Voyage Club logo, QR destination, and Guess the Leader portraits with approved event assets.

## Deploying to Vercel

This is a Vite single-page app. Import the Git repository in Vercel; it will use `npm run build`, publish `dist`, and apply the SPA rewrite in `vercel.json` so routes such as `/admin/dashboard` work on a direct visit.

Add these environment variables in **Vercel → Project → Settings → Environment Variables** for every environment that should use live data:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_PASSWORD`

Leave the two Supabase variables unset for a mock-only preview. Values prefixed with `VITE_` are included in the browser bundle, so `VITE_ADMIN_PASSWORD` is an event-day UI gate, not a server-side secret. Redeploy after changing any variable.

## Repository hygiene

`.env`, `node_modules`, generated builds, and local Playwright artifacts are ignored. Keep only `.env.example` in Git. If an earlier commit containing real environment values was pushed to a shared remote, rotate the Supabase key and admin password before sharing the repository again.
