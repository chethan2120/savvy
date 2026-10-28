-- Login and classroom attendance are separate from the older daily status tables.
-- Apply this after the earlier LMS migrations. The development server also
-- keeps these records in data/institute-db.json until this schema is applied.

create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_in_at timestamptz not null default now(),
  logged_out_at timestamptz
);

create table if not exists public.attendance_punches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  punched_in_at timestamptz not null default now(),
  punched_out_at timestamptz
);

alter table public.login_events enable row level security;
alter table public.attendance_punches enable row level security;

create policy "users read own login events" on public.login_events
  for select using (auth.uid() = user_id or public.is_admin());
create policy "users read own punches" on public.attendance_punches
  for select using (auth.uid() = user_id or public.is_admin() or public.is_staff());
create policy "users insert own punches" on public.attendance_punches
  for insert with check (auth.uid() = user_id and (public.is_student() or public.is_staff()));
create policy "users close own punches" on public.attendance_punches
  for update using (auth.uid() = user_id and (public.is_student() or public.is_staff()));
