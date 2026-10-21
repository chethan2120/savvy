# Supabase Architecture & Setup Guide

This document outlines the database schema, Row Level Security (RLS) policies, storage buckets, and seed data setup for World Wide NDT Institute.

> **Status: LIVE.** Project `wwi` (`ljkrnpszvhjkolaacqwi`) is provisioned, migrated, and seeded. Tables, RLS, the `admissions-files` bucket, and the admin allowlist are all applied. The contact form was verified writing a real row end-to-end. The only remaining manual step is **creating the admin login user** (see below).

## Database Tables

1. **`announcement_banners`**: Top notification strip (message, link, active status).
2. **`courses`**: Main course catalog (slug, title, duration, fee, certification, training mode, description, featured image).
3. **`course_modules`**: Curriculum breakdown per course.
4. **`course_faqs`**: Frequently asked questions per course.
5. **`instructors`**: Faculty and leadership profiles (name, title, bio, photo, social links).
6. **`testimonials`**: Verified student reviews and ratings.
7. **`blog_categories`**: Post categories.
8. **`blog_posts`**: Editorial articles (slug, title, excerpt, content, cover image, publish date).
9. **`gallery_items`**: Institute and lab photos (url, caption, category).
10. **`admission_applications`**: Enrolment submissions (applicant details, course selected, photo & marksheet paths, status).
11. **`contact_submissions`**: Public enquiries (name, email, phone, subject, message).
12. **`newsletter_subscribers`**: Newsletter email list.

## Storage Buckets

- **`admissions-files`** (applied): Private bucket for student photo and qualification marksheet uploads. Anyone may `INSERT` (applicants upload their docs); only allowlisted admins may `SELECT`.

## RLS Security Policies (as applied)

- **Public read** (`SELECT`): published courses, course modules/FAQs, blog posts, instructors, testimonials, gallery items, site settings, and active announcement banners.
- **Public submit** (`INSERT`): `admission_applications`, `contact_submissions`, `newsletter_subscribers`.
- **Admin-only read**: `admission_applications`, `contact_submissions`, `newsletter_subscribers`, and `admin_users` are readable only when `public.is_admin()` is true.
- **Admin model**: an `admin_users` allowlist table holds admin emails. `public.is_admin()` returns true when the current authenticated JWT email is in that table. This avoids relying on a bespoke role claim.
- **Service role**: never exposed to the browser. The app uses only the publishable/anon key.

## Create your admin login (required, one-time)

The app authenticates admins with Supabase Auth (`signInWithPassword`) and authorises them via the `admin_users` allowlist (already seeded with `admin@ndtis.in`).

1. Supabase Dashboard → **Authentication → Users → Add user**.
2. Email: `admin@ndtis.in` (or your own — then also add it to the allowlist below). Set a strong password. Tick **Auto Confirm User**.
3. To use a different email, add it to the allowlist:
   ```sql
   INSERT INTO admin_users (email) VALUES ('you@example.com');
   ```
4. Visit `/admin` and sign in. You'll see real admission applications and contact submissions.

## Student Portal (certificates + gated course materials)

Added in migration `20260724010000_student_portal.sql`. Live and seeded.

### Tables
- **`students`** — student profile, 1:1 with `auth.users` (full name, email, phone, enrollment no.).
- **`enrollments`** — which courses a student took. **This is what unlocks materials.**
- **`course_materials`** — notes + videos, one row per item, tied to a `course_id`.
- **`certificates`** — issued certificates (certificate no., snapshot of student & course name, grade, issue/expiry dates, examiner).

### Security model (the important part — no material or certificate leaks)
- **`course_materials`** RLS: `SELECT` follows the row's `visibility` — `enrolled` (default) requires `public.is_enrolled(course_id)`, `students` requires `public.is_student()`, `public` is open to visitors. A student enrolled in course A cannot read course B's rows — an unenrolled request returns **0 rows**, not just a hidden UI. Verified end-to-end: a student's own token requesting another course's materials returns `[]`.
- **`certificates`** RLS: `SELECT` only where `student_id = auth.uid()` — a student sees only their own certificates.
- **`students` / `enrollments`** RLS: student reads only their own row; admins (`public.is_admin()`) manage all.
- **Private storage bucket `course-materials`**: files stored under `"<course_id>/<file>"`. Storage RLS mirrors the same enrollment gate, so uploaded files are only reachable through short-lived **signed URLs** that Supabase issues only for enrolled viewers. Admin uploads go here via the admin panel.
- **Portal gates**: both portals resolve the role before rendering — `/admin` requires `public.is_admin()`, `/student` requires `public.is_student()`. One session cannot open the other portal in either direction.
- **`admin_create_student()`** creates the auth user, the `students` row and the enrolments in one admin-only call, and stamps `admission_applications.student_id`. **`admin_reset_student_password()`** resets a student password. Both raise unless `is_admin()`, and `EXECUTE` is revoked from `anon`.
- Helper functions `is_enrolled()` / `is_admin()` / `is_student()` are `SECURITY DEFINER` with a pinned `search_path`.

### What the pages do
- **`/student`** — sign in → material grouped per enrolled course (notes render inline, videos play in-page) plus **Certificates** (download the file or preview and print).
- **`/admin`** — **Applications** (create a student login from an application: account + enrolment + material access in one step), **Students** (enrol, unenrol, reset password), **Course material** (add, edit, delete, preview, and set who can open it), **Certificates** (issue or delete).
- **`/verify-certificate`** — enter a certificate number or enrolment ID; a match downloads the certificate file straight away. No preview step.

### Test credentials (dummy seed data)
| Role | Email | Password | Sees |
|------|-------|----------|------|
| Admin | `admin@ndtis.in` | `Admin@12345` | Everything |
| Student | `rahul.student@ndtis.in` | `Student@12345` | NDT Level II + QA/QC (2 certs, 6 materials) |
| Student | `priya.student@ndtis.in` | `Student@12345` | Fire & Safety (1 cert, 2 materials) |
| Student | `amit.student@ndtis.in` | `Student@12345` | HVAC + CSWIP 3.1 (2 certs, 4 materials) |

> These are seeded dummy accounts for testing. Change/remove them before production. Dummy videos point at public sample MP4s; real lessons should be uploaded to the private `course-materials` bucket so signed-URL + enrollment protection applies to the file bytes too.

## Running Migrations & Seeding (for a fresh project)

The live project is already set up. To reproduce on another project, run
`supabase/migrations/20260724000000_initial_schema.sql` in the Supabase SQL Editor
(or `npx supabase db push`), then apply the admin allowlist + `is_admin()` helper
and the `admissions-files` bucket policies documented above.
