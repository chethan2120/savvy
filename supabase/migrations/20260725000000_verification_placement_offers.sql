-- Certificate verification/regeneration, placement records, pre-enrolment offers.
--
-- Security model:
--   * certificates stay student-private (RLS from the student_portal migration).
--     Public verification goes through verify_certificate(), a SECURITY DEFINER
--     function that returns ONLY the fields printed on the certificate face and
--     requires an exact match on an institute-issued ID. It never lists rows,
--     never accepts wildcards, and never exposes email/phone/student_id.
--   * placements + pre_enrollment_offers are public marketing data (read-only
--     for anon, admin-managed).

-- ---------------------------------------------------------------------------
-- Placement records (the institute's main target)
-- ---------------------------------------------------------------------------
CREATE TABLE placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  photo_url TEXT,
  course_title TEXT NOT NULL,
  company TEXT NOT NULL,
  job_role TEXT NOT NULL,
  location TEXT,
  package_lpa TEXT,
  placed_on DATE DEFAULT CURRENT_DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recruiter/hiring-partner logos shown on the placement page
CREATE TABLE recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  industry TEXT,
  sort_order INT DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Pre-enrolment offers
-- ---------------------------------------------------------------------------
CREATE TABLE pre_enrollment_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_label TEXT,          -- e.g. "25% OFF" / "₹5,000 OFF"
  coupon_code TEXT,
  valid_till DATE,
  seats_left INT,
  course_slug TEXT,             -- NULL = applies to all courses
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads captured by the pre-enrolment (offer claim) form
CREATE TABLE pre_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  course_slug TEXT,
  offer_id UUID REFERENCES pre_enrollment_offers(id) ON DELETE SET NULL,
  coupon_code TEXT,
  source TEXT,                  -- youtube / website / referral ...
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_enrollment_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view placements" ON placements FOR SELECT USING (TRUE);
CREATE POLICY "Admin manages placements" ON placements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can view recruiters" ON recruiters FOR SELECT USING (TRUE);
CREATE POLICY "Admin manages recruiters" ON recruiters FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can view active offers" ON pre_enrollment_offers FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admin manages offers" ON pre_enrollment_offers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Leads are write-only for the public: submit, never read back.
CREATE POLICY "Public can submit pre-enrollment" ON pre_enrollments FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admin manages pre-enrollments" ON pre_enrollments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Public certificate verification / regeneration
-- ---------------------------------------------------------------------------
-- Look up a certificate by the ID the institute gave the student: either the
-- certificate number or the enrolment number. Exact match only (case- and
-- whitespace-insensitive) so the endpoint cannot be used to enumerate records.
CREATE OR REPLACE FUNCTION public.verify_certificate(p_query TEXT)
RETURNS TABLE (
  certificate_no   TEXT,
  enrollment_no    TEXT,
  student_name     TEXT,
  course_title     TEXT,
  grade            TEXT,
  issue_date       DATE,
  expiry_date      DATE,
  instructor_name  TEXT,
  is_valid         BOOLEAN
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
    (c.expiry_date IS NULL OR c.expiry_date >= CURRENT_DATE) AS is_valid
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

-- ---------------------------------------------------------------------------
-- SEED
-- ---------------------------------------------------------------------------
INSERT INTO recruiters (name, industry, sort_order) VALUES
  ('Bureau Veritas', 'Third-party inspection', 1),
  ('TUV India', 'Certification & inspection', 2),
  ('SGS India', 'Testing & verification', 3),
  ('L&T Hydrocarbon Engineering', 'Oil & gas EPC', 4),
  ('Reliance Industries', 'Refining & petrochemicals', 5),
  ('Adani Ports & SEZ', 'Infrastructure', 6),
  ('Saipem', 'Offshore EPC', 7),
  ('Petrofac', 'Energy services', 8),
  ('Gulf Technical Inspection', 'Middle East inspection', 9),
  ('Intertek', 'Quality assurance', 10);

INSERT INTO placements (student_name, course_title, company, job_role, location, package_lpa, placed_on, is_featured, sort_order) VALUES
  ('Rahul Verma',    'NDT Level II Course',                  'Bureau Veritas',              'NDT Technician Level II',   'Abu Dhabi, UAE',   '₹9.6 LPA', CURRENT_DATE - 120, TRUE, 1),
  ('Priya Singh',    'Fire & Safety Course',                 'Adani Ports & SEZ',           'Safety Officer',            'Mundra, India',    '₹6.2 LPA', CURRENT_DATE - 90,  TRUE, 2),
  ('Amit Kumar',     'CSWIP 3.1 Welding Inspector Course',   'Petrofac',                    'Welding Inspector',         'Doha, Qatar',      '₹12.4 LPA',CURRENT_DATE - 60,  TRUE, 3),
  ('Mohd Arshad',    'QA & QC Course',                       'L&T Hydrocarbon Engineering', 'QA/QC Engineer',            'Hazira, India',    '₹7.8 LPA', CURRENT_DATE - 45,  TRUE, 4),
  ('Sneha Rathore',  'HVAC Course',                          'Voltas Ltd',                  'HVAC Site Engineer',        'Noida, India',     '₹5.4 LPA', CURRENT_DATE - 30,  FALSE,5),
  ('Imran Sheikh',   'NDT Level II Course',                  'SGS India',                   'Radiographer Level II',     'Jamnagar, India',  '₹8.1 LPA', CURRENT_DATE - 20,  FALSE,6);

INSERT INTO pre_enrollment_offers (title, description, discount_label, coupon_code, valid_till, seats_left, is_active, sort_order) VALUES
  ('Early-Bird Pre-Enrolment', 'Book your seat before the batch starts and lock in the current fee with a flat discount on any certification course.', '25% OFF', 'EARLY25', CURRENT_DATE + 30, 12, TRUE, 1),
  ('YouTube Subscriber Offer', 'Watching us on YouTube? Pre-enrol with this code for an extra fee waiver plus a free NDT fundamentals starter kit.', '₹5,000 OFF', 'WWNDTYT', CURRENT_DATE + 45, 25, TRUE, 2),
  ('Placement Fast-Track Bundle', 'Pre-enrol in any two courses and get free placement fast-track: CV workshop, mock interviews and priority recruiter referrals.', 'BUNDLE', 'PLACE2X', CURRENT_DATE + 60, 8, TRUE, 3);
