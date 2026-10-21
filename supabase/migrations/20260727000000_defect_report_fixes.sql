-- Fixes for the defect report of 27 Jul 2026.
--
--   1. The "admissions-files" bucket the admission form uploads into was
--      created by hand in the dashboard and never described in a migration, so
--      a fresh environment had no bucket and every upload failed silently.
--      Declared here so the setup is reproducible.
--   2. Admins could not read the "course-materials" bucket. The visibility
--      rewrite dropped the admin branch of the storage policy, so an admin
--      previewing a lesson they had just uploaded got no signed URL and the
--      player showed a black frame.

-- ---------------------------------------------------------------------------
-- 1. Admission uploads
-- ---------------------------------------------------------------------------
-- Private: these are a minor's photo and academic records in the general case.
INSERT INTO storage.buckets (id, name, public)
VALUES ('admissions-files', 'admissions-files', FALSE)
ON CONFLICT (id) DO UPDATE SET public = FALSE;

-- An applicant is anonymous at the point of upload, so INSERT is open to the
-- anon role — matching the "Public can submit admission application" policy on
-- the table. Nothing else is: an applicant cannot list, read back, overwrite or
-- delete anything in the bucket.
DROP POLICY IF EXISTS "applicant uploads admission files" ON storage.objects;
CREATE POLICY "applicant uploads admission files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'admissions-files');

DROP POLICY IF EXISTS "admin reads admission files" ON storage.objects;
CREATE POLICY "admin reads admission files" ON storage.objects
  FOR SELECT USING (bucket_id = 'admissions-files' AND public.is_admin());

DROP POLICY IF EXISTS "admin removes admission files" ON storage.objects;
CREATE POLICY "admin removes admission files" ON storage.objects
  FOR DELETE USING (bucket_id = 'admissions-files' AND public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Admin can read course material files
-- ---------------------------------------------------------------------------
-- The visibility policy from 20260726000000 covers students only. An admin has
-- no enrolment row, so previewing an "enrolled students" lesson failed for the
-- one account that is allowed to see everything.
DROP POLICY IF EXISTS "admin reads materials storage" ON storage.objects;
CREATE POLICY "admin reads materials storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-materials' AND public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. The seeded demo lessons pointed at a bucket that no longer serves them
-- ---------------------------------------------------------------------------
-- Every seeded video used commondatastorage.googleapis.com/gtv-videos-bucket,
-- which now answers 403 — so none of the demo lessons played, whatever the
-- player did. They are repointed at a clip this site serves itself, and their
-- description says plainly that it is a placeholder waiting for the real
-- recording. Real lessons uploaded from the admin panel are untouched.
UPDATE course_materials
   SET content = '/video/hero-course-2.mp4',
       description = coalesce(description, '') || ' (Placeholder clip — upload the recorded session to replace it.)'
 WHERE type = 'video'
   AND content LIKE '%gtv-videos-bucket%';
