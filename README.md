# ST. ELIZABETH GIRLS SENIOR SCHOOL — Frontend

Frontend-only build for the public secondary school management & finance system, per the build prompt.
No backend, no Supabase, no auth — every screen renders from static mock data in `lib/mock-data.ts` so
you can wire in real functionality module by module.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS v4
- lucide-react icons
- Self-hosted fonts via `@fontsource` (Fraunces, IBM Plex Sans, IBM Plex Mono)
- Zero backend dependencies — no Supabase client, no fetch calls, no forms actually submit

## Running it

```
npm install
npm run dev
```

Visit `http://localhost:3000` — it redirects to `/login`. The login form doesn't check credentials;
click "Sign in to workspace" to enter the app shell at `/dashboard`.

## Design system

A "civic ledger" aesthetic to match a public-school finance/audit tool: deep green sidebar (the ledger
spine), brass/gold accents, ink-stamp status badges (`components/ui/Stamp.tsx`), tabular mono figures
for all money values, and a faint ruled-paper background. Tokens live in `app/globals.css`.

## Structure

- `app/(app)/` — every module screen, organized to match the build prompt's module numbering
  (01 Registration → 09 Settings). The `(app)` layout wraps them with the sidebar/topbar shell.
- `app/login/` — staff sign-in screen (not wired to auth)
- `lib/nav-config.ts` — the single source of truth for navigation, module grouping, and which of the
  five roles (Super Admin, Finance/Bursar, Registrar, Head Teacher, Payroll Officer) can see each screen
- `lib/grade-10-roster.ts` — Grade 10 names and admission numbers from the supplied room rosters,
  shared by the academic and finance previews
- `lib/mock-data.ts` — finance preview data; transaction and balance values remain illustrative
- `lib/format.ts` — KES currency / number formatting helpers
- `components/ui/` — shared primitives: DataTable, Card, Button, Form fields, Stamp badges, Toolbar
- `components/layout/` — Sidebar, Topbar, and RoleContext (the role switcher in the topbar avatar menu
  is a demo-only affordance — swap it for real auth-derived role data)
- `components/charts/` — small dependency-free SVG bar charts used on Dashboard and Reports

## Role preview

Click the avatar in the top-right to preview the app as any of the five roles — the sidebar filters
itself live using `navForRole()` in `lib/nav-config.ts`. Wire this to your real session/role data when
you add auth.

## What's deliberately not built

Per the brief, this is frontend only:
- No Supabase (Postgres/Auth/RLS/Storage) — schema and constraints from the build prompt aren't here
- No sequence-based receipt numbers, append-only transaction enforcement, or audit log writes — the UI
  shows where these surface (e.g. "Next receipt no." on Fees Payment) but nothing is persisted
- No Excel/CSV parsing (SheetJS/PapaParse), PDF generation, Africa's Talking SMS, or M-Pesa Daraja
  integration — upload/print/send buttons are visual only
- No form validation, submit handlers, or client-side state beyond the role switcher

Every screen from the build prompt is present, so the module structure, field lists, and screen flows
should map directly onto the schema and endpoints you build next.
