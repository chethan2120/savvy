-- Savvy Training Institute Initial Database Schema & Seed Data
-- NOTE: uses gen_random_uuid() (Postgres core). The live project also adds an
-- admin_users allowlist + public.is_admin() and admin-only SELECT policies on
-- submissions — see SUPABASE_SETUP.md for the full applied version.

-- 1. ENUM TYPES
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'contacted', 'enrolled', 'rejected');
CREATE TYPE submission_status AS ENUM ('unread', 'read', 'replied', 'archived');

-- 2. SITE SETTINGS & ANNOUNCEMENT BANNERS
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Savvy Training Institute',
  phone_primary TEXT NOT NULL DEFAULT '+91 90000 12345',
  phone_secondary TEXT DEFAULT '+91 90000 12345',
  email_primary TEXT NOT NULL DEFAULT 'contact@savvytraining.example',
  email_secondary TEXT DEFAULT 'contact@savvytraining.example',
  address TEXT NOT NULL DEFAULT 'Savvy Training Institute, Training Centre, Bengaluru, Karnataka, India',
  whatsapp_number TEXT DEFAULT '919000012345',
  facebook_url TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',
  twitter_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcement_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  link_text TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COURSES & MODULES & FAQS
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  fee TEXT NOT NULL,
  training_mode TEXT NOT NULL DEFAULT 'Classroom & Online',
  certification TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  placement_support BOOLEAN DEFAULT TRUE,
  rating NUMERIC(2,1) DEFAULT 5.0,
  featured_image TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE course_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- 4. INSTRUCTORS
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  facebook_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TESTIMONIALS
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  course_taken TEXT NOT NULL,
  rating INT DEFAULT 5,
  quote TEXT NOT NULL,
  photo_url TEXT,
  is_featured BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BLOG CATEGORIES & POSTS
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'SAV Editorial Team',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  published BOOLEAN DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. GALLERY ITEMS
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'Lab & Practical',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUBMISSIONS & APPLICATIONS
CREATE TABLE admission_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  qualification TEXT NOT NULL,
  selected_course TEXT NOT NULL,
  preferred_mode TEXT DEFAULT 'Classroom',
  message TEXT,
  photo_path TEXT,
  marksheet_path TEXT,
  status application_status DEFAULT 'pending',
  consent BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT,
  course_applied TEXT,
  message TEXT NOT NULL,
  status submission_status DEFAULT 'unread',
  source_page TEXT DEFAULT 'contact-us',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can view active announcement banners" ON announcement_banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view published courses" ON courses FOR SELECT USING (published = TRUE);
CREATE POLICY "Public can view course modules" ON course_modules FOR SELECT USING (TRUE);
CREATE POLICY "Public can view course faqs" ON course_faqs FOR SELECT USING (TRUE);
CREATE POLICY "Public can view instructors" ON instructors FOR SELECT USING (TRUE);
CREATE POLICY "Public can view testimonials" ON testimonials FOR SELECT USING (TRUE);
CREATE POLICY "Public can view blog categories" ON blog_categories FOR SELECT USING (TRUE);
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (published = TRUE);
CREATE POLICY "Public can view gallery items" ON gallery_items FOR SELECT USING (TRUE);
CREATE POLICY "Public can view site settings" ON site_settings FOR SELECT USING (TRUE);

-- Public insert policies for form submissions
CREATE POLICY "Public can submit admission application" ON admission_applications FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can submit contact form" ON contact_submissions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

-- SEED DATA INSERTS
INSERT INTO site_settings (site_name) VALUES ('Savvy Training Institute');

INSERT INTO announcement_banners (message, link_text, link_url) VALUES 
('⚡ Next Batch Starts This Monday! Online & Offline Admissions Open for NDT Level 2 & QA/QC', 'Apply Now', '/admission');

-- SEED COURSES
INSERT INTO courses (slug, title, short_description, description, duration, fee, training_mode, certification, eligibility, featured_image, is_featured, sort_order) VALUES
('ndt-level-2-course', 'NDT Level II Course', 'Comprehensive ASNT Level 2 training covering Ultrasonic, Radiographic, Magnetic Particle, Liquid Penetrant, and Visual Testing with 100% placement support.', 'Are you ready to elevate your engineering career? At Savvy Training Institute in Bengaluru, India, our NDT Level II Course prepares you for real-world industrial inspection challenges across aerospace, oil & gas, manufacturing, and heavy engineering.', '45 Days', '₹35,000', 'Classroom & Online', 'ASNT Level II Certificate (VT, LPT, MPT, UT, RT, RTFI)', 'B.Tech / Engineering Diploma / B.Sc / 12th Pass', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop', TRUE, 1),

('qa-and-qc-course', 'QA & QC Course', 'Master Quality Assurance & Quality Control standards, piping inspection, welding codes, and international ISO quality management.', 'Become a certified multi-discipline QA/QC Inspector. Our program covers inspection documentation, non-conformance reporting, welding metallurgy, NDT integration, and global site audit protocols.', '30 Days', '₹35,000', 'Classroom & Online', 'Certified Quality Inspector (QA/QC)', 'Engineering Graduate / Diploma / Technical Background', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=1200&auto=format&fit=crop', TRUE, 2),

('fire-safety-course', 'Fire & Safety Course', 'Professional 1-year diploma training in industrial fire protection, hazard management, safety audits, and OSHA compliance.', 'Prepare for high-demand roles as Fire & Safety Inspector, Health Safety Environment (HSE) Officer, and Industrial Safety Supervisor in oil refineries, construction sites, and manufacturing plants.', '1 Year / 3 Months', '₹45,000', 'Classroom & Online', 'Diploma in Fire & Industrial Safety', '10th / 12th / ITI / Graduation', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop', TRUE, 3),

('hvac-course', 'HVAC Course', 'Practical training in Heating, Ventilation, Air Conditioning design, load calculation, duct sizing, and system troubleshooting.', 'Master HVAC design, VRF/VRV systems, chilled water plant layout, psychrometric calculations, and HVAC installation engineering with real hands-on lab projects.', '30 Days', '₹25,000', 'Classroom & Online', 'Certified HVAC Design Engineer', 'Diploma / B.Tech Mechanical or Electrical / 12th ITI', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop', TRUE, 4),

('revit-mep-training-course-fees', 'Revit MEP Training Course', 'Advanced Building Information Modeling (BIM) training for Mechanical, Electrical, and Plumbing design using Autodesk Revit.', 'Learn modern 3D BIM modeling, MEP coordination, clash detection, HVAC modeling, piping layouts, electrical conduit routing, and construction documentation.', '30 Days', '₹25,000', 'Classroom & Online', 'Autodesk Revit MEP Certification', 'Diploma / B.Tech Civil, Mechanical, Electrical / CAD Designers', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop', FALSE, 5),

('cswip-3-1-course', 'CSWIP 3.1 Welding Inspector Course', 'Pre-exam preparation and advanced training for TWI CSWIP 3.1 Welding Inspector global certification.', 'Gain comprehensive expertise in weld flaws, destructive testing, heat treatment, welding procedures (WPS/PQR), symbol interpretation, and international codes (AWS D1.1, ASME IX).', '30 Days', '₹1,80,000', 'Classroom & Online', 'TWI CSWIP 3.1 Welding Inspector Prep Certificate', 'Min 3 years inspection experience or Engineering Degree + 1 yr exp', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1200&auto=format&fit=crop', FALSE, 6);

-- SEED INSTRUCTORS
INSERT INTO instructors (name, role, bio, photo_url, sort_order) VALUES
('Feroz Alam', 'Director', 'A dynamic and results-driven director with over ten years of expertise in Non-Destructive Testing (NDT) training, renowned for building innovative, industry-aligned programs that empower both students and instructors.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop', 1),
('Tabrej Alam', 'Director', 'A visionary director with a decade of teaching experience, combining industrial inspection expertise and passion to create engaging, high-impact learning environments.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop', 2),
('Md Javed', 'Senior Instructor', 'A seasoned educator with ten years of specialized experience in Ultrasonic and Radiographic NDT Training, delivering practical, real-world inspection skills.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop', 3),
('Deepak Kumar', 'Digital & Technical Lead', 'Over 2 years of experience leading technical systems, student platforms, and web development for Savvy Training Institute.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop', 4);

-- SEED TESTIMONIALS
INSERT INTO testimonials (student_name, course_taken, quote, is_featured) VALUES
('Shadab', 'NDT Level II Course', 'Outstanding job placement assistance! I secured a quality inspection position in Gulf soon after completing my NDT Level II Course at Savvy Training Institute. The hands-on lab sessions gave me complete practical confidence.', TRUE),
('Vikash', 'NDT & QA/QC Combo', 'Great facilities and hands-on experience! The practical flaw detection sessions were invaluable, providing real-world exposure to ultrasonic flaw detectors and radiographic film reading.', TRUE),
('Rohit', 'QA/QC Course', 'Top-notch certification program! The instructors at Savvy Training Institute ensure you grasp every technical aspect. I passed my certification exam with flying colors.', TRUE),
('Sanjay', 'Fire & Safety Course', 'The training was clear, structured, and practical. The placement cell guided me through every interview stage until I landed my safety inspector role.', TRUE);

-- SEED BLOG CATEGORIES & POSTS
INSERT INTO blog_categories (name, slug) VALUES
('NDT Techniques', 'ndt-techniques'),
('QA/QC Inspection', 'qa-qc-inspection'),
('Career Advice', 'career-advice');

INSERT INTO blog_posts (slug, title, excerpt, content, featured_image, author_name) VALUES
('exploring-the-top-non-destructive-testing-ndtmethods', 'Exploring the Top Non-Destructive Testing (NDT) Methods', 'Non-destructive testing (NDT) methods play a crucial role in ensuring structural integrity without damaging components. Learn about UT, RT, MT, PT, and VT.', 'Non-Destructive Testing (NDT) comprises a set of analysis techniques used in science and industry to evaluate the properties of a material, component, or system without causing damage. At Savvy Training Institute, our ASNT Level 2 program trains students in the five primary methods: Visual Testing (VT), Liquid Penetrant Testing (LPT), Magnetic Particle Testing (MPT), Ultrasonic Testing (UT), and Radiographic Testing (RT).', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop', 'Feroz Alam'),

('radiographic-testing-rt-a-comprehensive-overview', 'Radiographic Testing (RT): A Comprehensive Industrial Guide', 'Discover how Radiographic Testing utilizes X-rays and Gamma rays to inspect internal material structures and weld integrity.', 'Radiographic Testing (RT) is one of the most critical NDT inspection techniques used in pipeline construction, pressure vessel fabrication, and aerospace engineering. By passing radiation through an object onto industrial film or digital sensors, inspectors can detect internal voids, porosity, incomplete penetration, and micro-cracks.', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1200&auto=format&fit=crop', 'Md Javed'),

('complete-guide-to-ndt-level-ii-certification-requirements-training-and-career-opportunities', 'Complete Guide to NDT Level II Certification: Requirements & Career Growth', 'Everything you need to know about eligibility, course duration, syllabus, and global career opportunities in NDT Level 2.', 'NDT Level II certification qualifies technicians to set up and calibrate inspection equipment, perform tests according to written procedures, evaluate and record test results, and supervise Level I technicians. Demand for certified ASNT Level II inspectors is surging across oil & gas refineries, aerospace manufacturing, and infrastructure projects.', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=1200&auto=format&fit=crop', 'Feroz Alam');

-- SEED GALLERY ITEMS
INSERT INTO gallery_items (title, image_url, category) VALUES
('Ultrasonic Testing Practical Lab', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop', 'Practical Lab'),
('Industrial Weld Inspection Session', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?q=80&w=1000&auto=format&fit=crop', 'Site Visit'),
('QA/QC Inspection Tools Demonstration', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=1000&auto=format&fit=crop', 'Practical Lab'),
('Student Batch Certification Ceremony', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop', 'Events'),
('HVAC Ducting & Plant Layout Model', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000&auto=format&fit=crop', 'Practical Lab'),
('Fire & Safety Equipment Demo', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop', 'Practical Lab');
