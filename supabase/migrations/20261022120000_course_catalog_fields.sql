-- Additional course details managed in the admin course catalogue.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS prerequisites TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[] NOT NULL DEFAULT '{}';
