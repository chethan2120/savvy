-- Student Portal: certificates + enrollment-gated course materials.
-- Security model:
--   * course_materials — a row is readable ONLY by students enrolled in that
--     row's course (the row itself is the secret; unenrolled users get 0 rows).
--   * certificates — readable ONLY by the owning student.
--   * Admins (public.is_admin()) manage everything.
--   * A private storage bucket "course-materials" mirrors the same gate so
--     uploaded files are only reachable via short-lived signed URLs that
--     Supabase issues only when RLS confirms enrollment.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE material_type AS ENUM ('note', 'video');

-- Student profile (1:1 with auth.users)
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  enrollment_no TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments — which courses a student took (drives material access)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_on DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  UNIQUE (student_id, course_id)
);

-- Course materials — notes + videos, gated by enrollment
CREATE TABLE course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type material_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,          -- note body (text) OR external/embed video url
  storage_path TEXT,     -- private bucket object path for admin-uploaded files
  duration TEXT,         -- e.g. "12:30" for videos
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificates
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  certificate_no TEXT UNIQUE NOT NULL,
  student_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  grade TEXT DEFAULT 'A',
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  instructor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Is the current authenticated user enrolled in a given course?
CREATE OR REPLACE FUNCTION public.is_enrolled(cid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.course_id = cid AND e.student_id = auth.uid()
  );
$$;

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student reads own profile" ON students FOR SELECT USING (id = auth.uid());
CREATE POLICY "admin manages students" ON students FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "student reads own enrollments" ON enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "admin manages enrollments" ON enrollments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "enrolled student reads materials" ON course_materials FOR SELECT USING (public.is_enrolled(course_id));
CREATE POLICY "admin manages materials" ON course_materials FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "student reads own certificates" ON certificates FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "admin manages certificates" ON certificates FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Private bucket for uploaded materials. Path convention: "<course_id>/<file>".
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "enrolled read materials storage" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'course-materials'
    AND public.is_enrolled((split_part(name, '/', 1))::uuid)
  );

CREATE POLICY "admin write materials storage" ON storage.objects
  FOR ALL USING (
    bucket_id = 'course-materials' AND public.is_admin()
  ) WITH CHECK (
    bucket_id = 'course-materials' AND public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- SEED (dummy data for testing). Creates confirmed email/password auth users.
-- NOTE: token columns must be '' (not NULL) or GoTrue throws
-- "Database error querying schema" on sign-in.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_auth_user(p_email TEXT, p_password TEXT)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE uid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, reauthentication_token, phone_change, phone_change_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
    '', '', '', '', '', '', '', ''
  );
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), uid, uid::text,
    json_build_object('sub', uid::text, 'email', p_email, 'email_verified', true)::jsonb,
    'email', now(), now(), now()
  );
  RETURN uid;
END;
$$;

DO $$
DECLARE
  rahul_id UUID; priya_id UUID; amit_id UUID;
  c_ndt   UUID := (SELECT id FROM courses WHERE slug = 'ndt-level-2-course');
  c_qaqc  UUID := (SELECT id FROM courses WHERE slug = 'qa-and-qc-course');
  c_fire  UUID := (SELECT id FROM courses WHERE slug = 'fire-safety-course');
  c_hvac  UUID := (SELECT id FROM courses WHERE slug = 'hvac-course');
  c_cswip UUID := (SELECT id FROM courses WHERE slug = 'cswip-3-1-course');
BEGIN
  -- Admin auth user (admin@savvytraining.example must already be in the admin_users allowlist)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@savvytraining.example') THEN
    PERFORM public.seed_auth_user('admin@savvytraining.example', 'Admin@12345');
  END IF;

  rahul_id := public.seed_auth_user('rahul.student@savvytraining.example', 'Student@12345');
  priya_id := public.seed_auth_user('priya.student@savvytraining.example', 'Student@12345');
  amit_id  := public.seed_auth_user('amit.student@savvytraining.example',  'Student@12345');

  INSERT INTO students (id, full_name, email, phone, enrollment_no) VALUES
    (rahul_id, 'Rahul Verma', 'rahul.student@savvytraining.example', '+91 9812345670', 'SAV-2024-0101'),
    (priya_id, 'Priya Singh', 'priya.student@savvytraining.example', '+91 9812345671', 'SAV-2024-0102'),
    (amit_id,  'Amit Kumar',  'amit.student@savvytraining.example',  '+91 9812345672', 'SAV-2023-0088');

  INSERT INTO enrollments (student_id, course_id, status) VALUES
    (rahul_id, c_ndt, 'completed'), (rahul_id, c_qaqc, 'completed'),
    (priya_id, c_fire, 'completed'),
    (amit_id, c_hvac, 'completed'), (amit_id, c_cswip, 'completed');

  INSERT INTO certificates (student_id, course_id, certificate_no, student_name, course_title, grade, issue_date, expiry_date, instructor_name) VALUES
    (rahul_id, c_ndt,  'SAV/NDT2/2024/0101', 'Rahul Verma', 'NDT Level II Course', 'A+', CURRENT_DATE - 350, CURRENT_DATE + 730, 'Md Javed'),
    (rahul_id, c_qaqc, 'SAV/QAQC/2024/0101', 'Rahul Verma', 'QA & QC Course',      'A',  CURRENT_DATE - 270, CURRENT_DATE + 810, 'Feroz Alam'),
    (priya_id, c_fire, 'SAV/FS/2024/0102',   'Priya Singh', 'Fire & Safety Course','A',  CURRENT_DATE - 310, CURRENT_DATE + 770, 'Tabrej Alam'),
    (amit_id,  c_hvac, 'SAV/HVAC/2023/0088', 'Amit Kumar',  'HVAC Course',         'B+', CURRENT_DATE - 470, CURRENT_DATE + 610, 'Deepak Kumar'),
    (amit_id,  c_cswip,'SAV/CSWIP/2023/0088','Amit Kumar',  'CSWIP 3.1 Welding Inspector Course', 'A', CURRENT_DATE - 420, CURRENT_DATE + 660, 'Feroz Alam');

  INSERT INTO course_materials (course_id, type, title, description, content, duration, sort_order) VALUES
    (c_ndt, 'note',  'Module 1 — Introduction to NDT', 'Overview of the five primary NDT methods.', E'# Introduction to Non-Destructive Testing\n\nNDT evaluates material properties without causing damage. The five primary methods are VT, PT, MT, UT, RT.', NULL, 1),
    (c_ndt, 'note',  'Module 2 — Ultrasonic Testing Basics', 'UT principles, transducers, calibration.', E'# Ultrasonic Testing (UT)\n\nHigh-frequency sound waves detect internal flaws. Pulse-echo, angle beams, V1/V2 calibration blocks.', NULL, 2),
    (c_ndt, 'video', 'Ultrasonic Flaw Detection — Live Demo', 'Recorded lab session on UT flaw detection.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '09:56', 3),
    (c_ndt, 'video', 'Radiographic Film Interpretation', 'Reading RT films for weld defects.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', '10:53', 4),
    (c_qaqc, 'note',  'Welding Codes & Standards', 'ASME IX, AWS D1.1 overview.', E'# Welding Codes & Standards\n\nASME Section IX, AWS D1.1, WPS/PQR documentation, NCR handling.', NULL, 1),
    (c_qaqc, 'video', 'QA/QC Inspection Walkthrough', 'Site inspection documentation demo.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', '00:15', 2),
    (c_fire, 'note',  'Fire Triangle & Classes of Fire', 'Fundamentals of fire behaviour.', E'# Fire Fundamentals\n\nFuel + Heat + Oxygen. Classes A/B/C/D/K.', NULL, 1),
    (c_fire, 'video', 'Fire Extinguisher Operation (PASS)', 'Hands-on extinguisher training.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', '00:15', 2),
    (c_hvac, 'note',  'HVAC Load Calculation Basics', 'Heat load & psychrometrics.', E'# HVAC Load Calculation\n\nSensible vs latent heat, psychrometric chart, duct sizing, VRF/VRV.', NULL, 1),
    (c_hvac, 'video', 'Duct Sizing & Airflow Demo', 'Practical duct sizing session.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', '00:60', 2),
    (c_cswip, 'note',  'Weld Defects & Interpretation', 'Common weld flaws for CSWIP 3.1.', E'# Weld Defects\n\nPorosity, lack of fusion, incomplete penetration, undercut, cracks.', NULL, 1),
    (c_cswip, 'video', 'Visual Weld Inspection Technique', 'VT methodology for welds.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', '00:15', 2);
END $$;

DROP FUNCTION public.seed_auth_user(TEXT, TEXT);
