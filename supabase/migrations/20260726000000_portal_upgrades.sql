-- Portal upgrades:
--   1. Course materials get an explicit visibility setting. Until now every
--      material was locked to enrolled students, so an admin had no way to
--      publish a free preview lesson. Visibility is now a choice the admin
--      makes per material, and both the table RLS and the storage RLS honour
--      the same setting.
--   2. Materials become editable: an updated_at stamp plus a trigger.
--   3. Admin can create a student login directly from an admission
--      application (admin_create_student), which also enrols the new student
--      so their course materials are available on first sign-in.
--   4. Applications remember which student account they produced.
--   5. Helper functions so a page can tell an admin session apart from a
--      student session.

-- ---------------------------------------------------------------------------
-- 1. Material visibility
-- ---------------------------------------------------------------------------
ALTER TABLE course_materials
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'enrolled',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE course_materials
  DROP CONSTRAINT IF EXISTS course_materials_visibility_check;
ALTER TABLE course_materials
  ADD CONSTRAINT course_materials_visibility_check
  CHECK (visibility IN ('enrolled', 'students', 'public'));

COMMENT ON COLUMN course_materials.visibility IS
  'enrolled = only students enrolled in this course; students = any signed-in student; public = anyone, including visitors on the course page.';

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS course_materials_touch ON course_materials;
CREATE TRIGGER course_materials_touch
  BEFORE UPDATE ON course_materials
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 2. Session helpers
-- ---------------------------------------------------------------------------
-- Does the current session belong to a student profile? Used by the portal so
-- an admin session cannot silently render the student portal (and vice versa).
CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM students s WHERE s.id = auth.uid());
$$;

GRANT EXECUTE ON FUNCTION public.is_student() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. RLS that honours visibility
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "enrolled student reads materials" ON course_materials;

CREATE POLICY "read materials by visibility" ON course_materials
  FOR SELECT USING (
    visibility = 'public'
    OR (visibility = 'students' AND public.is_student())
    OR public.is_enrolled(course_id)
  );

-- Storage mirrors the table: the object path starts with the course id, so we
-- resolve the owning material row and apply the same rule to the file.
DROP POLICY IF EXISTS "enrolled read materials storage" ON storage.objects;

CREATE POLICY "read materials storage by visibility" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-materials'
    AND EXISTS (
      SELECT 1 FROM course_materials m
      WHERE m.storage_path = storage.objects.name
        AND (
          m.visibility = 'public'
          OR (m.visibility = 'students' AND public.is_student())
          OR public.is_enrolled(m.course_id)
        )
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Applications remember the account they produced
-- ---------------------------------------------------------------------------
ALTER TABLE admission_applications
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 5. Create a student login from an admission application
-- ---------------------------------------------------------------------------
-- Admin-only. Creates the auth user, the student profile and the enrolments in
-- one step so the new student sees their course materials on first sign-in.
-- Runs as SECURITY DEFINER because auth.users is not writable by the anon key;
-- the is_admin() guard on the first line is what keeps that safe.
CREATE OR REPLACE FUNCTION public.admin_create_student(
  p_full_name     TEXT,
  p_email         TEXT,
  p_password      TEXT,
  p_phone         TEXT DEFAULT NULL,
  p_enrollment_no TEXT DEFAULT NULL,
  p_course_ids    UUID[] DEFAULT '{}',
  p_application_id UUID DEFAULT NULL
)
-- OUT params are prefixed so they cannot collide with the student_id columns
-- on enrollments / admission_applications inside the body.
RETURNS TABLE (created_student_id UUID, created_enrollment_no TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
-- pgcrypto (crypt/gen_salt) lives in the extensions schema on Supabase, so it
-- has to be on the pinned search_path.
SET search_path = public, extensions
AS $$
DECLARE
  uid      UUID := gen_random_uuid();
  enr_no   TEXT;
  cid      UUID;
  seq      INT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an administrator can create a student login.';
  END IF;

  IF length(coalesce(p_password, '')) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters.';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(btrim(p_email))) THEN
    RAISE EXCEPTION 'An account already exists for %', p_email;
  END IF;

  -- Enrolment numbers run SAV-<year>-<4 digits>, continuing the existing series.
  enr_no := nullif(btrim(coalesce(p_enrollment_no, '')), '');
  IF enr_no IS NULL THEN
    SELECT coalesce(max(substring(s.enrollment_no from '(\d{4})$')::int), 100) + 1
      INTO seq
      FROM students s
     WHERE s.enrollment_no ~ '^SAV-\d{4}-\d{4}$';
    enr_no := format('SAV-%s-%s', to_char(CURRENT_DATE, 'YYYY'), lpad(seq::text, 4, '0'));
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, reauthentication_token, phone_change, phone_change_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
    lower(btrim(p_email)), crypt(p_password, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    '', '', '', '', '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), uid, uid::text,
    json_build_object('sub', uid::text, 'email', lower(btrim(p_email)), 'email_verified', true)::jsonb,
    'email', now(), now(), now()
  );

  INSERT INTO students (id, full_name, email, phone, enrollment_no)
  VALUES (uid, p_full_name, lower(btrim(p_email)), p_phone, enr_no);

  FOREACH cid IN ARRAY coalesce(p_course_ids, '{}')
  LOOP
    INSERT INTO enrollments (student_id, course_id, status)
    VALUES (uid, cid, 'active')
    ON CONFLICT (student_id, course_id) DO NOTHING;
  END LOOP;

  IF p_application_id IS NOT NULL THEN
    UPDATE admission_applications a
       SET student_id = uid, status = 'enrolled'
     WHERE a.id = p_application_id;
  END IF;

  RETURN QUERY SELECT uid, enr_no;
END;
$$;

-- Both admin functions guard on is_admin() internally; the grants keep them off
-- the anon REST surface entirely.
REVOKE ALL ON FUNCTION public.admin_create_student(TEXT, TEXT, TEXT, TEXT, TEXT, UUID[], UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_student(TEXT, TEXT, TEXT, TEXT, TEXT, UUID[], UUID) TO authenticated;

-- Reset a student's password from the admin portal.
CREATE OR REPLACE FUNCTION public.admin_reset_student_password(p_student_id UUID, p_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an administrator can reset a student password.';
  END IF;
  IF length(coalesce(p_password, '')) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters.';
  END IF;
  UPDATE auth.users
     SET encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now()
   WHERE id = p_student_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_reset_student_password(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_reset_student_password(UUID, TEXT) TO authenticated;

-- ---------------------------------------------------------------------------
-- 6. Make the seeded preview lessons public so the course pages have something
--    to show, and keep everything else enrolment-gated.
-- ---------------------------------------------------------------------------
UPDATE course_materials SET visibility = 'public'
 WHERE title IN ('Module 1 — Introduction to NDT', 'Fire Triangle & Classes of Fire');
