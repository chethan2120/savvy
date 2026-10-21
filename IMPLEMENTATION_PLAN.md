# Implementation Plan — Savvy Training Institute

Editorial redesign of https://savvytraining.example/ inspired by the visual language of https://www.ada.cx/, built on Next.js 14 (App Router) + TypeScript + Tailwind + Supabase.

## Status legend
- ✅ Done — implemented and verified (build + typecheck pass)
- 🟡 Partial — works as a static/demo build; needs live Supabase credentials to be fully functional
- ⛔ Blocked — requires an external credential or asset the environment does not have

## Phase 1 — Evidence & audit ✅
- Repository inspected; existing Next.js scaffold mapped (17 routes, 18 components).
- `content_screenshots/` (55) and `design_screenshots/` (63) reviewed — see `SCREENSHOT_MAPPING.md`.
- Content audit + conflict resolution recorded in `CONTENT_ISSUES.md`.
- Ada reference distilled in `ada-cx-design-sheet.md`; source content in `content.md`.

## Phase 2 — Design system ✅
- Tokens implemented in `src/styles/globals.css` and `tailwind.config.ts` (daylight off-white canvas, forest trust colour, pastel editorial accents, fluid `clamp()` type scale, editorial easing).
- Documented in `DESIGN_SYSTEM.md`.

## Phase 3 — Technical foundation ✅ / 🟡
- ✅ Next.js App Router, TypeScript strict, Tailwind, ESLint configured.
- ✅ Supabase schema migration authored (`supabase/migrations/20260724000000_initial_schema.sql`) with RLS.
- 🟡 Supabase client created with honest config detection (`isSupabaseConfigured`); no live project connected yet.
- ✅ Global header (floating pill nav + mobile overlay), footer, announcement bar, WhatsApp button.

## Phase 4 — Public website ✅
Home, About, Course index (`/course`), Course detail (`/course/[slug]`), Admission, Blog index, Blog detail, Gallery, Contact, Privacy, Terms, error, not-found — all build and render as static/SSG pages driven by `src/lib/data.ts`.

## Phase 5 — Graphics & motion ✅ / 🟡
- ✅ Framer Motion entrance reveals, hero sequence, card stagger, hover transitions; `prefers-reduced-motion` honoured globally.
- 🟡 Custom original SVG technical graphics (NDT wave/inspection motifs) — not yet added; photographic placeholders used instead.

## Phase 6 — Data & forms ✅
- ✅ Live Supabase project `wwi` provisioned, migrated, and seeded (6 courses, 16 modules, 8 FAQs, 4 instructors, 4 testimonials, 3 posts, 8 gallery items).
- ✅ Contact + Admission forms with client validation, honeypot, file-size checks.
- ✅ **Integrity fix + verified:** forms only claim success on a real insert; otherwise an honest call/WhatsApp fallback. Contact form was submitted in-browser and the row was confirmed in `contact_submissions` via SQL.
- ✅ `admissions-files` storage bucket with anon-insert / admin-read policies.

## Phase 7 — Admin ✅ / 🟡
- ✅ **Security fix:** removed the "any password logs in" bypass. Login uses real `supabase.auth.signInWithPassword`; unconfigured backend shows a locked notice.
- ✅ Fabricated sample enquiries removed; applications/contacts fetched from Supabase with an empty-state.
- ✅ Real authorization: `admin_users` allowlist + `public.is_admin()` RLS on all submission tables (admin-only read).
- 🟡 One manual step left: create the admin auth user in the Supabase dashboard (see SUPABASE_SETUP.md). Optional further hardening: Next.js middleware route guard.

## Phase 8 — Responsive & accessibility 🟡
- ✅ Mobile-first, fluid type, hamburger overlay, focus-visible rings, semantic landmarks, skip target, reduced motion.
- 🟡 Full keyboard/AT audit across every dialog + carousel still to be completed and logged.

## Phase 9 — Hardening & optimisation 🟡
- ✅ `next build` passes; all 24 routes prerender; lint + typecheck clean.
- 🟡 Lighthouse pass, image migration to owned assets, and SVG graphic set outstanding.

## Remaining items
1. **Create the admin auth user** (1-minute dashboard step) — see SUPABASE_SETUP.md. Everything else for admin is wired and tested at the DB layer.
2. **Higher-res logo + remaining real photos.** Real logo, 7 accreditation marks, hero, engineer, HVAC, and the director's photo are migrated into `public/`. A few course/blog/gallery/instructor images remain licensed Unsplash placeholders pending the full owned media library. See `ASSET_INVENTORY.md`.
3. **Optional:** convert remaining public pages from the static content layer (`src/lib/data.ts`, which mirrors the seeded DB) to live Supabase reads, and add a middleware route guard for `/admin`.
