# Savvy authentication system

This folder is a copy of the login, session, role, and account code from the Savvy Training Institute site. The files are the original source. They were not rewritten.

The original site was not modified by creating this folder.

## What this system actually does

There is one login page, `/login`. The visitor chooses Admin, Staff, or Student. The choice does not grant that role. `POST /api/auth/login` accepts the account only when the stored role matches the choice, then sets an httpOnly cookie named `savvy_session`.

Passwords are hashed with scrypt inside `src/lib/server/institute-db.ts`. The session token is HMAC-SHA256. `SESSION_SECRET` must be at least 32 characters. On Vercel the disk is read-only, so the secret has to come from the environment. If it is missing, login returns 503.

Accounts are stored in `data/institute-db.json`, which this package does not contain. That file holds private account records and password hashes. A new project creates its own file on first run. When the file is missing, `emptyDatabase()` creates three demo accounts:

| Role | Email | Phone | Password |
| --- | --- | --- | --- |
| Admin | admin@gmail.com | 9000000001 | demo123 |
| Staff | staff@gmail.com | 9000000002 | demo123 |
| Student | student1@gmail.com | 9000000003 | demo123 |

Those passwords are hashed when the file is created. They are not stored in this package.

Student registration is `POST /api/auth/register`. A new account stays `pending` and cannot sign in until an admin approves it from Registration Requests. Approval is not an email.

Forgot password is the form on `/login`. It calls `supabase.auth.resetPasswordForEmail`. There is no local reset-token page. If Supabase is not configured, that form cannot send mail.

Sign-out is `POST /api/auth/logout`, then the browser goes to `/login`.

## What does not exist

- There is no `middleware.ts`. Pages and API routes check the session themselves.
- There is no React authentication context or provider.
- There is no separate Admin, Staff, or Student login page.
- There is no Zod schema for login or registration.
- `src/components/portal/PortalLogin.tsx` is not mounted. The page that users open is `src/app/login/page.tsx`.
- The Supabase service-role key is not used by this flow.
- Supabase Auth is not the store that accepts Admin, Staff, and Student sign-in. The institute database is.

## 1. Copy the files

Copy the contents of this folder into the root of a new Next.js 14 App Router project, keeping the paths:

- `src/` merges with the new project's `src/`
- `public/brand/logo.jpg` stays at `public/brand/logo.jpg`
- `supabase/migrations/` stays in that folder if you apply the SQL
- `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json`, and `next.config.mjs` are the originals. Merge them with the new project instead of blindly replacing a config you have already changed.

`tsconfig.json` must keep:

```json
"paths": { "@/*": ["./src/*"] }
```

The new root layout must import the copied stylesheet and the font variable the dashboards use. From the original `src/app/layout.tsx`:

```tsx
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
```

Put `className={inter.variable}` on `<body>`. The original layout also mounts the public header and smooth scroll. Those files are not part of this package. Leave them out unless the new site already has them.

Do not copy `data/institute-db.json` or `data/session-secret` from the old project. They contain private account data.

## 2. Install the dependencies

Versions are the ones in the original `package.json`. They are also listed in `dependencies.json`.

```bash
npm install next@^14.2.24 react@^18.3.1 react-dom@^18.3.1 @supabase/supabase-js@^2.48.1 lucide-react@^0.475.0 pdf-lib@^1.17.1 qrcode@^1.5.4
npm install -D typescript@^5.7.3 @types/node@^20.17.19 @types/react@^18.3.18 @types/react-dom@^18.3.5 @types/qrcode@^1.5.6 tailwindcss@^3.4.17 postcss@^8.5.2 autoprefixer@^10.4.20
```

`@supabase/ssr` is installed in the original app but these files do not import it.

## 3. Configure the environment

Copy `.env.example` to `.env.local`. Set `SESSION_SECRET` to a new random string of at least 32 characters.

Supabase URL and anon key are required only for the forgot-password email and for the fallback in `resolveIdentity()` when the institute cookie is absent. Sign-in of the demo accounts works without Supabase.

`next.config.mjs` copies `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` onto `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` because Next.js does not expose `VITE_*` to the browser.

## 4. Connect the backend

The authentication backend is the local JSON store in `src/lib/server/institute-db.ts`, not a hosted database. On first start the server creates `data/institute-db.json`. Add `data/` to `.gitignore`.

To keep using the existing Supabase project for password-reset email, put that project's URL and anon key in `.env.local`. Do not put the service-role key in the client.

The SQL files under `supabase/migrations/` are the original Supabase policies, including `public.is_admin()` and the student profile policies. They have not been applied to the database behind the current site. Applying them is optional and does not replace the institute session. Apply them in filename order only if the new project also uses those Supabase tables. Do not invent a connection string, and do not import the old `institute-db.json`.

## 5. Routes

| Path | Who can open it |
| --- | --- |
| `/login` | Public. Role buttons send the choice to the login API. |
| `/admin` | Admin session. Anyone else is sent to `/login?role=admin`. |
| `/staff` | Staff session. Anyone else is sent to `/login?role=staff`. |
| `/student` | Student session. Anyone else is sent to `/login?role=student`. |
| `/admin/courses/[courseId]` | Admin, through the course page. |
| `/staff/courses/[courseId]` | Staff, through the course page. |
| `/student/courses/[courseId]` | Student, through the course page. |

The role check is `resolveRole()` in `src/lib/portal-auth.ts`, called by each dashboard page. API routes call `currentAccount()` or `requireRole()` in `src/lib/server/session.ts`.

## 6. Role permissions

Roles are `admin`, `staff`, and `student`.

- Admin can create accounts, approve registrations, and change staff permissions.
- Staff permissions are flags on the account: `manageCourses`, `markAttendance`, `uploadMaterials`, `viewStudents`, and the more specific course and chapter flags in `StaffPermissions` inside `institute-db.ts`.
- Students see their own profile, enrolment, and attendance. Chapter content stays behind the checks already in `courseRecord`.
- A pending or rejected registration cannot sign in. An inactive account cannot sign in.

## 7. Database migrations

No migration is required for the institute login. The JSON file is created by the code.

Apply the copied SQL only when the new project should also have the Supabase tables and policies. Order:

1. `20260724000000_initial_schema.sql`
2. `20260724005000_admin_allowlist.sql`
3. `20260724010000_student_portal.sql`
4. `20260726000000_portal_upgrades.sql`
5. `20261019000000_lms.sql`
6. `20261019120000_attendance_accounts.sql`
7. `20261021140000_chapters_certificates.sql`

Later course-catalogue SQL from the original repo is not part of this authentication copy.

## 8. Run and test

```bash
npm run dev
```

1. Open `http://localhost:3000/login`.
2. Choose Student, sign in as `student1@gmail.com` / `demo123`. The browser should land on `/student`.
3. Sign out. The browser should return to `/login`.
4. Choose Admin and try the student account. The API should reject it as the wrong role.
5. Sign in as `admin@gmail.com` / `demo123`. The browser should land on `/admin`.
6. Open `/staff` while the admin cookie is set. The staff page should send you back to login.
7. Register a new student. The account should stay pending until the admin approves it under Registration Requests.
8. Wrong password should stay on the login page with the error from the API.

Profile changes are saved through `/api/accounts/me`. Profile photos go through `/api/photos`.

## Project-specific pieces to adapt

- Root layout must import `src/styles/globals.css` and the Inter `--font-sans` variable.
- `tailwind.config.ts` content paths must include the copied `src` files.
- `data/institute-db.json` is created in the new project. It starts empty of your real users.
- Dashboard pages also render courses, attendance, and certificates because that is how the original role screens are built. Those screens call the copied API routes.
- Login registration loads course names from `/api/public-courses`. That route is included.

## Validation

Each copied source file was hashed against the original. The hashes matched. This folder is not a separate Next.js app, so it is not type-checked on its own. Type-check it after it is placed in the new project and the layout and Tailwind paths above are connected.
