-- Savvy Training Institute LMS.
-- Run after the earlier migrations. Passwords stay in Supabase Auth.
-- Existing seeded students stay active. Public signups start as pending.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS suspended_until DATE,
  ADD COLUMN IF NOT EXISTS course_interest TEXT,
  ADD COLUMN IF NOT EXISTS photo_path TEXT;

ALTER TABLE students DROP CONSTRAINT IF EXISTS students_account_status_check;
ALTER TABLE students
  ADD CONSTRAINT students_account_status_check
  CHECK (account_status IN ('pending', 'active', 'rejected', 'disabled', 'suspended'));

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS expected_hours NUMERIC DEFAULT 40,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS attribution TEXT,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE course_materials
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoke_reason TEXT,
  ADD COLUMN IF NOT EXISTS course_start DATE,
  ADD COLUMN IF NOT EXISTS course_end DATE;

-- ---------------------------------------------------------------------------
-- Staff
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  account_status TEXT NOT NULL DEFAULT 'active',
  suspended_until DATE,
  can_attendance BOOLEAN NOT NULL DEFAULT TRUE,
  can_videos BOOLEAN NOT NULL DEFAULT TRUE,
  can_certificates BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit_courses BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT staff_account_status_check
    CHECK (account_status IN ('pending', 'active', 'rejected', 'disabled', 'suspended'))
);

CREATE TABLE IF NOT EXISTS staff_courses (
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, course_id)
);

-- ---------------------------------------------------------------------------
-- Attendance, study time, settings, audit
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  note TEXT,
  marked_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, course_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (staff_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  material_id UUID REFERENCES course_materials(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  credited_seconds INTEGER NOT NULL DEFAULT 0,
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS learning_sessions_open_idx
  ON learning_sessions (student_id) WHERE closed_at IS NULL;

CREATE TABLE IF NOT EXISTS website_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  show_recognitions BOOLEAN NOT NULL DEFAULT FALSE,
  institute_name TEXT NOT NULL DEFAULT 'Savvy Training Institute',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO website_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  detail JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Role helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = auth.uid()
      AND s.account_status = 'active'
      AND (s.suspended_until IS NULL OR s.suspended_until > CURRENT_DATE)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff s
    WHERE s.id = auth.uid()
      AND s.account_status = 'active'
      AND (s.suspended_until IS NULL OR s.suspended_until > CURRENT_DATE)
  );
$$;

CREATE OR REPLACE FUNCTION public.staff_can(perm TEXT, cid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM staff s
    LEFT JOIN staff_courses sc ON sc.staff_id = s.id AND (cid IS NULL OR sc.course_id = cid)
    WHERE s.id = auth.uid()
      AND s.account_status = 'active'
      AND (s.suspended_until IS NULL OR s.suspended_until > CURRENT_DATE)
      AND (cid IS NULL OR sc.course_id = cid)
      AND (
        (perm = 'attendance' AND s.can_attendance)
        OR (perm = 'videos' AND s.can_videos)
        OR (perm = 'certificates' AND s.can_certificates)
        OR (perm = 'courses' AND s.can_edit_courses)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.my_account_status()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT account_status FROM students WHERE id = auth.uid()),
    (SELECT account_status FROM staff WHERE id = auth.uid()),
    CASE WHEN public.is_admin() THEN 'active' ELSE NULL END
  );
$$;

REVOKE ALL ON FUNCTION public.is_student() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.staff_can(TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.my_account_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_student() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.staff_can(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_account_status() TO authenticated;

-- ---------------------------------------------------------------------------
-- Student self-signup (only when the auth metadata asks for it)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_student_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF coalesce(NEW.raw_user_meta_data->>'signup', '') = 'student' THEN
    INSERT INTO students (id, full_name, email, phone, enrollment_no, account_status, course_interest)
    VALUES (
      NEW.id,
      coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      lower(NEW.email),
      NEW.raw_user_meta_data->>'phone',
      'SAV-' || upper(substr(replace(NEW.id::text, '-', ''), 1, 8)),
      'pending',
      NEW.raw_user_meta_data->>'course_interest'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_student_signup();

CREATE OR REPLACE FUNCTION public.resubmit_student_registration(p_course TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE students
     SET account_status = 'pending',
         course_interest = coalesce(nullif(btrim(p_course), ''), course_interest)
   WHERE id = auth.uid()
     AND account_status = 'rejected';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only a rejected application can be submitted again.';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.resubmit_student_registration(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resubmit_student_registration(TEXT) TO authenticated;

-- Students cannot change their own approval status.
CREATE OR REPLACE FUNCTION public.protect_student_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() AND NEW.account_status IS DISTINCT FROM OLD.account_status THEN
    RAISE EXCEPTION 'Only an administrator can change account status.';
  END IF;
  IF NOT public.is_admin() AND NEW.suspended_until IS DISTINCT FROM OLD.suspended_until THEN
    RAISE EXCEPTION 'Only an administrator can change a suspension.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_protect_status ON students;
CREATE TRIGGER students_protect_status
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION public.protect_student_status();

-- ---------------------------------------------------------------------------
-- Staff accounts (admin only)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_create_staff(
  p_full_name TEXT,
  p_email TEXT,
  p_password TEXT,
  p_phone TEXT DEFAULT NULL,
  p_can_attendance BOOLEAN DEFAULT TRUE,
  p_can_videos BOOLEAN DEFAULT TRUE,
  p_can_certificates BOOLEAN DEFAULT FALSE,
  p_can_edit_courses BOOLEAN DEFAULT FALSE,
  p_course_ids UUID[] DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  uid UUID := gen_random_uuid();
  cid UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an administrator can create a staff login.';
  END IF;
  IF length(coalesce(p_password, '')) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters.';
  END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = lower(btrim(p_email))) THEN
    RAISE EXCEPTION 'An account already exists for %', p_email;
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
    jsonb_build_object('full_name', p_full_name, 'signup', 'staff'),
    '', '', '', '', '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), uid, uid::text,
    json_build_object('sub', uid::text, 'email', lower(btrim(p_email)), 'email_verified', true)::jsonb,
    'email', now(), now(), now()
  );

  INSERT INTO staff (id, full_name, email, phone, account_status, can_attendance, can_videos, can_certificates, can_edit_courses)
  VALUES (uid, p_full_name, lower(btrim(p_email)), p_phone, 'active', p_can_attendance, p_can_videos, p_can_certificates, p_can_edit_courses);

  FOREACH cid IN ARRAY coalesce(p_course_ids, '{}')
  LOOP
    INSERT INTO staff_courses (staff_id, course_id) VALUES (uid, cid) ON CONFLICT DO NOTHING;
  END LOOP;

  INSERT INTO audit_logs (actor_id, action, entity, entity_id, detail)
  VALUES (auth.uid(), 'staff.create', 'staff', uid::text, jsonb_build_object('email', lower(btrim(p_email))));

  RETURN uid;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_staff(TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_staff(TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, UUID[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an administrator can delete an account.';
  END IF;
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own administrator account.';
  END IF;
  INSERT INTO audit_logs (actor_id, action, entity, entity_id)
  VALUES (auth.uid(), 'account.delete', 'auth.users', p_user_id::text);
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- Study time. Credits at most 45 seconds per heartbeat and ignores gaps.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_learning_heartbeat(p_material_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mat course_materials%ROWTYPE;
  sess learning_sessions%ROWTYPE;
  gap INTEGER;
  credit INTEGER := 0;
BEGIN
  IF NOT public.is_student() THEN
    RAISE EXCEPTION 'Only an active student can record study time.';
  END IF;

  SELECT * INTO mat FROM course_materials WHERE id = p_material_id;
  IF NOT FOUND OR NOT mat.is_published OR mat.type <> 'video' THEN
    RAISE EXCEPTION 'That lesson is not available.';
  END IF;
  IF NOT (public.is_enrolled(mat.course_id) OR mat.visibility = 'public' OR (mat.visibility = 'students' AND public.is_student())) THEN
    RAISE EXCEPTION 'You are not enrolled in this lesson.';
  END IF;
  IF mat.storage_path IS NULL AND coalesce(mat.content, '') = '' THEN
    RAISE EXCEPTION 'This lesson has no video yet.';
  END IF;

  -- Close any other open session so two tabs cannot both accrue time.
  UPDATE learning_sessions
     SET closed_at = NOW()
   WHERE student_id = auth.uid()
     AND closed_at IS NULL
     AND material_id IS DISTINCT FROM p_material_id;

  SELECT * INTO sess
    FROM learning_sessions
   WHERE student_id = auth.uid()
     AND material_id = p_material_id
     AND closed_at IS NULL
   ORDER BY started_at DESC
   LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO learning_sessions (student_id, course_id, material_id)
    VALUES (auth.uid(), mat.course_id, p_material_id);
    RETURN 0;
  END IF;

  gap := EXTRACT(EPOCH FROM (NOW() - sess.last_heartbeat))::INTEGER;
  -- A hidden or idle tab stops sending heartbeats. A long gap is not credited.
  IF gap > 0 AND gap <= 45 THEN
    credit := gap;
  END IF;

  UPDATE learning_sessions
     SET last_heartbeat = NOW(),
         credited_seconds = credited_seconds + credit
   WHERE id = sess.id;

  RETURN credit;
END;
$$;

REVOKE ALL ON FUNCTION public.record_learning_heartbeat(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_learning_heartbeat(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.write_audit(p_action TEXT, p_entity TEXT, p_entity_id TEXT, p_detail JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_admin() OR public.is_staff()) THEN
    RAISE EXCEPTION 'Not allowed to write the audit log.';
  END IF;
  INSERT INTO audit_logs (actor_id, action, entity, entity_id, detail)
  VALUES (auth.uid(), p_action, p_entity, p_entity_id, p_detail);
END;
$$;

REVOKE ALL ON FUNCTION public.write_audit(TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.write_audit(TEXT, TEXT, TEXT, JSONB) TO authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff reads own profile" ON staff;
CREATE POLICY "staff reads own profile" ON staff FOR SELECT USING (id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "admin manages staff" ON staff;
CREATE POLICY "admin manages staff" ON staff FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "read staff course assignments" ON staff_courses;
CREATE POLICY "read staff course assignments" ON staff_courses
  FOR SELECT USING (staff_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "admin manages staff courses" ON staff_courses;
CREATE POLICY "admin manages staff courses" ON staff_courses
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "student reads own attendance" ON student_attendance;
CREATE POLICY "student reads own attendance" ON student_attendance
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin() OR public.staff_can('attendance', course_id));
DROP POLICY IF EXISTS "staff marks attendance" ON student_attendance;
CREATE POLICY "staff marks attendance" ON student_attendance
  FOR INSERT WITH CHECK (public.is_admin() OR public.staff_can('attendance', course_id));
DROP POLICY IF EXISTS "staff updates attendance" ON student_attendance;
CREATE POLICY "staff updates attendance" ON student_attendance
  FOR UPDATE USING (public.is_admin() OR public.staff_can('attendance', course_id))
  WITH CHECK (public.is_admin() OR public.staff_can('attendance', course_id));

DROP POLICY IF EXISTS "staff reads own attendance" ON staff_attendance;
CREATE POLICY "staff reads own attendance" ON staff_attendance
  FOR SELECT USING (staff_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "staff writes own attendance" ON staff_attendance;
CREATE POLICY "staff writes own attendance" ON staff_attendance
  FOR INSERT WITH CHECK (staff_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "staff updates own attendance" ON staff_attendance;
CREATE POLICY "staff updates own attendance" ON staff_attendance
  FOR UPDATE USING (staff_id = auth.uid() OR public.is_admin())
  WITH CHECK (staff_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "student reads own study" ON learning_sessions;
CREATE POLICY "student reads own study" ON learning_sessions
  FOR SELECT USING (
    student_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM staff_courses sc
      WHERE sc.staff_id = auth.uid() AND sc.course_id = learning_sessions.course_id AND public.is_staff()
    )
  );

DROP POLICY IF EXISTS "admin manages courses" ON courses;
CREATE POLICY "admin manages courses" ON courses
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "staff edits assigned courses" ON courses;
CREATE POLICY "staff edits assigned courses" ON courses
  FOR UPDATE USING (public.staff_can('courses', id))
  WITH CHECK (public.staff_can('courses', id));

DROP POLICY IF EXISTS "student updates own contact" ON students;
CREATE POLICY "student updates own contact" ON students
  FOR UPDATE USING (id = auth.uid() AND account_status = 'active')
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "staff reads assigned students" ON students;
CREATE POLICY "staff reads assigned students" ON students
  FOR SELECT USING (
    id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.student_id = students.id AND public.staff_can('attendance', e.course_id)
    )
  );

DROP POLICY IF EXISTS "staff reads assigned enrollments" ON enrollments;
CREATE POLICY "staff reads assigned enrollments" ON enrollments
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin() OR public.staff_can('attendance', course_id));

DROP POLICY IF EXISTS "staff manages assigned videos" ON course_materials;
CREATE POLICY "staff manages assigned videos" ON course_materials
  FOR ALL USING (public.staff_can('videos', course_id))
  WITH CHECK (public.staff_can('videos', course_id));

CREATE OR REPLACE FUNCTION public.safe_uuid(value TEXT)
RETURNS UUID
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF value IS NULL OR btrim(value) = '' THEN
    RETURN NULL;
  END IF;
  RETURN btrim(value)::uuid;
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.safe_uuid(TEXT) TO anon, authenticated;
CREATE POLICY "staff writes materials storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'course-materials'
    AND public.staff_can('videos', public.safe_uuid(split_part(name, '/', 1)))
  );

DROP POLICY IF EXISTS "staff deletes materials storage" ON storage.objects;
CREATE POLICY "staff deletes materials storage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'course-materials'
    AND public.staff_can('videos', public.safe_uuid(split_part(name, '/', 1)))
  );

DROP POLICY IF EXISTS "staff issues certificates" ON certificates;
CREATE POLICY "staff issues certificates" ON certificates
  FOR INSERT WITH CHECK (public.is_admin() OR public.staff_can('certificates', course_id));

DROP POLICY IF EXISTS "staff reads course certificates" ON certificates;
CREATE POLICY "staff reads course certificates" ON certificates
  FOR SELECT USING (student_id = auth.uid() OR public.is_admin() OR public.staff_can('certificates', course_id));

DROP POLICY IF EXISTS "public reads website settings" ON website_settings;
CREATE POLICY "public reads website settings" ON website_settings FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "admin updates website settings" ON website_settings;
CREATE POLICY "admin updates website settings" ON website_settings
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin reads audit" ON audit_logs;
CREATE POLICY "admin reads audit" ON audit_logs FOR SELECT USING (public.is_admin());

-- Unpublished lessons stay hidden from students. Admins and assigned staff still see them.
DROP POLICY IF EXISTS "read materials by visibility" ON course_materials;
CREATE POLICY "read materials by visibility" ON course_materials
  FOR SELECT USING (
    public.is_admin()
    OR public.staff_can('videos', course_id)
    OR (
      is_published
      AND (
        visibility = 'public'
        OR (visibility = 'students' AND public.is_student())
        OR public.is_enrolled(course_id)
      )
    )
  );

DROP POLICY IF EXISTS "read materials storage by visibility" ON storage.objects;
CREATE POLICY "read materials storage by visibility" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-materials'
    AND EXISTS (
      SELECT 1 FROM course_materials m
      WHERE m.storage_path = storage.objects.name
        AND (
          public.is_admin()
          OR public.staff_can('videos', m.course_id)
          OR (
            m.is_published
            AND (
              m.visibility = 'public'
              OR (m.visibility = 'students' AND public.is_student())
              OR public.is_enrolled(m.course_id)
            )
          )
        )
    )
  );

-- Certificate verification now reports revocation without exposing contact details.
DROP FUNCTION IF EXISTS public.verify_certificate(TEXT);
CREATE FUNCTION public.verify_certificate(p_query TEXT)
RETURNS TABLE (
  certificate_no   TEXT,
  enrollment_no    TEXT,
  student_name     TEXT,
  course_title     TEXT,
  grade            TEXT,
  issue_date       DATE,
  expiry_date      DATE,
  instructor_name  TEXT,
  course_start     DATE,
  course_end       DATE,
  is_valid         BOOLEAN,
  is_revoked       BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    c.certificate_no,
    s.enrollment_no,
    c.student_name,
    c.course_title,
    c.grade,
    c.issue_date,
    c.expiry_date,
    c.instructor_name,
    c.course_start,
    c.course_end,
    (c.revoked_at IS NULL AND (c.expiry_date IS NULL OR c.expiry_date >= CURRENT_DATE)) AS is_valid,
    (c.revoked_at IS NOT NULL) AS is_revoked
  FROM certificates c
  JOIN students s ON s.id = c.student_id
  WHERE length(btrim(p_query)) >= 6
    AND (
      upper(btrim(p_query)) = upper(c.certificate_no)
      OR upper(btrim(p_query)) = upper(s.enrollment_no)
    )
  ORDER BY c.issue_date DESC;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO anon, authenticated;
