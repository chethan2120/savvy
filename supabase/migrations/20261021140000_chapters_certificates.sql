-- Optional Supabase schema for chapters, instructors, certificates, and institute branding.
-- The running application stores these records in the server institute database
-- until NEXT_PUBLIC_SUPABASE_SCHEMA_READY=true. Do not run this against a project
-- that already uses a different courses table without reviewing it first.
-- Apply in the Supabase SQL editor. It is idempotent.

create table if not exists public.chapters (
  id text primary key,
  course_id text not null,
  title text not null,
  description text not null default '',
  sort_order integer not null default 1,
  study_hours numeric,
  objectives text not null default '',
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_instructors (
  course_id text not null,
  account_id text not null,
  primary key (course_id, account_id)
);

create table if not exists public.issued_certificates (
  id text primary key,
  number text not null unique,
  student_id text not null,
  course_id text not null,
  student_name text not null,
  course_title text not null,
  completion_date date,
  issue_date timestamptz not null default now(),
  status text not null default 'issued' check (status in ('issued', 'revoked')),
  revoked_at timestamptz
);

create table if not exists public.institute_branding (
  id text primary key default 'default',
  seal text,
  signature text
);

alter table public.chapters enable row level security;
alter table public.course_instructors enable row level security;
alter table public.issued_certificates enable row level security;
alter table public.institute_branding enable row level security;

-- No anon policies. The Next.js server is the current writer, using the
-- institute session rather than the Supabase anon key. Add authenticated
-- policies only after the accounts table from the earlier migrations exists.
