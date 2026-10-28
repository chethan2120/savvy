# File manifest

Every file below is a byte-for-byte copy of the file in the Savvy Training Institute app. Nothing in this list is a rewrite.

## Sign-in, registration, session

| File | Purpose |
| --- | --- |
| `src/app/login/page.tsx` | The live login screen. One page for Admin, Staff, and Student, plus student registration and the forgot-password form. |
| `src/lib/portal-auth.ts` | Client sign-in, sign-out, and role resolution. The institute cookie is checked before any Supabase session. |
| `src/lib/demo-auth.ts` | Clears an older browser demo flag during sign-out. |
| `src/lib/friendly-error.ts` | Maps failed requests to the message shown on the login screen. |
| `src/lib/supabase.ts` | Supabase browser client. Used for password-reset email and the fallback identity check. |
| `src/lib/server/session.ts` | Reads the `savvy_session` cookie and enforces `requireRole`. |
| `src/lib/server/institute-db.ts` | Accounts, scrypt passwords, HMAC sessions, registration approval, and role permissions. This is the authentication store. |
| `src/app/api/auth/login/route.ts` | `POST /api/auth/login`. Checks the selected role and sets the session cookie. |
| `src/app/api/auth/logout/route.ts` | `POST /api/auth/logout`. Clears the session cookie. |
| `src/app/api/auth/register/route.ts` | `POST /api/auth/register`. Creates a pending student account. No admin email is sent. |
| `src/app/api/auth/session/route.ts` | `GET /api/auth/session`. Returns the signed-in account without the password hash. |
| `src/components/portal/PortalLogin.tsx` | An older login component. It is not mounted by any page. The live screen is `src/app/login/page.tsx`. |

## Role dashboards

| File | Purpose |
| --- | --- |
| `src/app/admin/page.tsx` | Admin entry. Redirects to `/login?role=admin` when the session is not an admin. |
| `src/app/staff/page.tsx` | Staff entry. Redirects to `/login?role=staff` when the session is not staff. |
| `src/app/student/page.tsx` | Student entry. Redirects to `/login?role=student` when the session is not a student. |
| `src/app/admin/courses/[courseId]/page.tsx` | Admin course page behind the same session. |
| `src/app/staff/courses/[courseId]/page.tsx` | Staff course page behind the same session. |
| `src/app/student/courses/[courseId]/page.tsx` | Student course page behind the same session. |
| `src/components/dashboard/DashboardHeader.tsx` | Dashboard header. Reads the session and signs out. |
| `src/components/dashboard/InstitutePanels.tsx` | Profile, account list, enrolment, and attendance panels used after sign-in. |
| `src/components/dashboard/Operations.tsx` | Account settings, people, permissions, and attendance used by the admin and staff dashboards. |
| `src/components/dashboard/RegistrationRequests.tsx` | Admin approval and rejection of student registrations. |
| `src/components/dashboard/Learning.tsx` | Role-gated course view, staff permissions, and student access settings. |
| `src/components/lms/AdminModules.tsx` | Admin dashboard sections loaded by the admin entry page. |
| `src/components/lms/StudentPanels.tsx` | Student profile and attendance panels. |
| `src/components/portal/ui.tsx` | Shared form and empty-state controls used by the dashboards. |
| `src/components/portal/MaterialViewer.tsx` | Lesson viewer opened from the signed-in dashboards. |
| `src/components/SecureVideoPlayer.tsx` | Video player used by that lesson viewer. |

## Account and protected APIs

| File | Purpose |
| --- | --- |
| `src/app/api/accounts/route.ts` | Admin list, create, and update of accounts. |
| `src/app/api/accounts/me/route.ts` | The signed-in user reads and updates their own profile and password. |
| `src/app/api/photos/route.ts` | Profile photo upload for the signed-in account. |
| `src/app/api/registrations/route.ts` | Admin-only list and review of registration requests. |
| `src/app/api/workspace/route.ts` | Signed-in workspace actions, including permissions and student access. |
| `src/app/api/programs/route.ts` | Signed-in programme list used by the dashboards. |
| `src/app/api/enrollments/route.ts` | Enrolment requests and admin assignment. Requires a session. |
| `src/app/api/attendance/route.ts` | Attendance. Role checks are enforced on the server. |
| `src/app/api/branding/route.ts` | Institute seal and signature. Only an admin can change them. |
| `src/app/api/certificates/[id]/route.ts` | Certificate download for the signed-in owner or an admin. |
| `src/app/api/website-settings/route.ts` | Settings read used by the admin dashboard. |
| `src/app/api/public-courses/route.ts` | Course names shown on the registration form. |
| `src/app/api/course-images/route.ts` | Course image upload. Admin, or staff who are allowed to manage courses. |
| `src/app/api/course-images/[id]/route.ts` | Serves a stored course image. |

## Supporting modules pulled in by those files

| File | Purpose |
| --- | --- |
| `src/lib/courses.ts` | Course catalogue read by the public-courses API. |
| `src/lib/useCourseCatalog.ts` | Loads that catalogue into the registration form. |
| `src/lib/supabase-schema.ts` | Checks whether the Supabase `courses` table exists. |
| `src/lib/data.ts` | Static course, blog, and settings data imported by the dashboards. |
| `src/lib/types.ts` | Shared TypeScript types. |
| `src/lib/lessons.ts` | Study-hour and video helpers used by the staff and student pages. |
| `src/lib/video-source.ts` | Classifies a lesson video URL. |
| `src/lib/certificate-file.ts` | Builds the certificate file from the signed-in session. |
| `src/components/CertificateDocument.tsx` | Certificate preview component. |
| `src/components/brand/SavvyLogo.tsx` | Logo on the login screen. It loads `/brand/logo.jpg`. |

## Styles, configuration, and the logo

| File | Purpose |
| --- | --- |
| `src/styles/globals.css` | Global styles, including `.account-theme`, `.auth-layout`, and the admin, staff, and student dashboard scopes. |
| `tailwind.config.ts` | Tailwind configuration used by those class names. |
| `postcss.config.mjs` | PostCSS configuration for Tailwind. |
| `tsconfig.json` | TypeScript configuration. `@/*` points at `./src/*`. |
| `next.config.mjs` | Maps `VITE_SUPABASE_*` onto `NEXT_PUBLIC_SUPABASE_*`. |
| `public/brand/logo.jpg` | The institute seal shown on the login screen. |

## Supabase SQL

These are the original migrations that define Supabase roles, `is_admin()`, student profiles, and row level security. The live sign-in does not read these tables. See the README.

| File | Purpose |
| --- | --- |
| `supabase/migrations/20260724000000_initial_schema.sql` | Initial Supabase schema. |
| `supabase/migrations/20260724005000_admin_allowlist.sql` | `admin_users` and `public.is_admin()`. |
| `supabase/migrations/20260724010000_student_portal.sql` | Student profile, enrolment, and their policies. |
| `supabase/migrations/20260726000000_portal_upgrades.sql` | Portal policies and admin user functions. |
| `supabase/migrations/20261019000000_lms.sql` | LMS tables and policies. |
| `supabase/migrations/20261019120000_attendance_accounts.sql` | Attendance account tables. |
| `supabase/migrations/20261021140000_chapters_certificates.sql` | Chapter and certificate tables. |

## Package documents

| File | Purpose |
| --- | --- |
| `README.md` | How to install this copy in a new Next.js project. |
| `dependencies.json` | Package versions imported by these files. |
| `.env.example` | Environment variable names. Values are placeholders. |
