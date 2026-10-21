-- Admin allowlist required by every later migration.
-- The initial schema comment and SUPABASE_SETUP.md describe this, but the SQL
-- was never checked in. Student-portal policies call public.is_admin(), so this
-- file must run after the initial schema and before 20260724010000.
--
-- Model: Supabase Auth holds the password. admin_users stores only the email
-- of people allowed into /admin. is_admin() is true when the signed-in user's
-- JWT email is on that list.

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_users a
    WHERE lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- The function is SECURITY DEFINER, so it can read this table even though
-- only an admin session is allowed to list it.
DROP POLICY IF EXISTS "admin reads allowlist" ON admin_users;
CREATE POLICY "admin reads allowlist" ON admin_users
  FOR SELECT USING (public.is_admin());

-- Public may insert these rows (policies from the initial schema). Only an
-- admin may read them back. There is no public SELECT.
DROP POLICY IF EXISTS "admin reads admission applications" ON admission_applications;
CREATE POLICY "admin reads admission applications" ON admission_applications
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin reads contact submissions" ON contact_submissions;
CREATE POLICY "admin reads contact submissions" ON contact_submissions
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "admin reads newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "admin reads newsletter subscribers" ON newsletter_subscribers
  FOR SELECT USING (public.is_admin());

INSERT INTO admin_users (email)
VALUES ('admin@ndtis.in')
ON CONFLICT (email) DO NOTHING;
