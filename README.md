# Savvy Training Institute — Modern Web Application

The Savvy Training Institute website, built with Next.js App Router, TypeScript, Tailwind CSS, Motion (Framer Motion), and Supabase.

---

## Technical Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + CSS Custom Properties
- **Animation**: Framer Motion
- **Database & Auth**: Supabase PostgreSQL & Supabase Auth
- **Icons**: Lucide React
- **Validation**: Zod

---

## Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/chethan2120/savvy.git
cd savvy
npm install
```

### 2. Environment Configuration

Create `.env.local` (already present for local dev) with the Supabase project's
publishable/anon key — no service-role key is required for the app:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://ljkrnpszvhjkolaacqwi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

The app **degrades gracefully without these**: forms show an honest "contact us
directly" fallback (call/WhatsApp) instead of a fake success, and `/admin` shows a
locked notice rather than granting access.

### 3. Database Migration & Seeding

The live project (`wwi`) is already migrated and seeded. For a fresh project, run
`supabase/migrations/20260724000000_initial_schema.sql` in the Supabase SQL Editor.
See **SUPABASE_SETUP.md** for the admin allowlist, storage policies, and the
one-time **admin login creation** step.

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 5. Production Build

```bash
npm run build
npm run start
```

---

## Core Routes

- `/`: Editorial Homepage (Hero, Stats, Courses, Proof, Instructors, Testimonials, Admission, FAQs, Blog preview)
- `/about-us`: Institute history, mission, vision, motto, director message, services, statistics
- `/course`: Searchable course catalog with filters
- `/course/[slug]`: Dynamic course details (NDT Level 2, QA/QC, Fire & Safety, HVAC, Revit MEP, CSWIP 3.1)
- `/admission`: Admission guide, fee payment overview, and online enrolment form with file uploads
- `/blog`: Blog listing with category filters and search
- `/blog/[slug]`: Full editorial article view with share links and TOC
- `/gallery`: Responsive student and industrial training photo gallery with lightbox
- `/contact-us`: Contact details, NAP information, interactive contact form with honeypot
- `/privacy-policy` & `/terms`: Legal documents
- `/admin`: Protected administration panel for managing courses, blog posts, applications, and enquiries

---

## License & Copyright

© 2024–2026 Savvy Training Institute. All Rights Reserved.
