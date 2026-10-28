export interface SiteSettings {
  site_name: string;
  phone_primary: string;
  phone_secondary?: string;
  email_primary: string;
  email_secondary?: string;
  address: string;
  whatsapp_number: string;
  facebook_url: string;
  youtube_url: string;
  twitter_url: string;
  instagram_url: string;
}

export interface AnnouncementBanner {
  id: string;
  message: string;
  link_text?: string;
  link_url?: string;
  is_active: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  duration: string;
  fee: string;
  training_mode: string;
  certification: string;
  eligibility: string;
  placement_support: boolean;
  published?: boolean;
  archived?: boolean;
  expected_hours?: number | null;
  chapter_count?: number | null;
  start_date?: string;
  end_date?: string;
  category?: string;
  attribution?: string;
  prerequisites?: string[];
  learning_outcomes?: string[];
  rating: number;
  featured_image: string;
  is_featured: boolean;
  sort_order: number;
  modules?: CourseModule[];
  faqs?: CourseFAQ[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  sort_order: number;
  study_hours?: number | null;
}

export interface CourseFAQ {
  id: string;
  course_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface Instructor {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  student_name: string;
  course_taken: string;
  rating: number;
  quote: string;
  photo_url?: string;
  is_featured: boolean;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_name?: string;
  author_name: string;
  published_at: string;
  seo_title?: string;
  seo_description?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  category: string;
}

export interface AdmissionApplicationInput {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  qualification: string;
  selected_course: string;
  preferred_mode: string;
  message?: string;
  photo_file?: File;
  marksheet_file?: File;
  consent: boolean;
}

export interface ContactSubmissionInput {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  course_applied?: string;
  message: string;
  honeypot?: string;
}

// --- Student portal ---

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  enrollment_no: string;
  account_status?: string;
  course_interest?: string;
  suspended_until?: string | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_on: string;
  status: string;
}

export type MaterialType = 'note' | 'video';

/**
 * Who can open a material.
 *   enrolled — only students enrolled in that course (default)
 *   students — any signed-in student
 *   public   — anyone, including visitors browsing the course page
 */
export type MaterialVisibility = 'enrolled' | 'students' | 'public';

export interface CourseMaterial {
  id: string;
  course_id: string;
  type: MaterialType;
  title: string;
  description?: string;
  content?: string;
  storage_path?: string;
  duration?: string;
  visibility: MaterialVisibility;
  is_published?: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

/** Public-safe certificate view returned by the verify_certificate() RPC. */
export interface VerifiedCertificate {
  certificate_no: string;
  enrollment_no: string;
  student_name: string;
  course_title: string;
  grade: string;
  issue_date: string;
  expiry_date?: string;
  instructor_name?: string;
  course_start?: string;
  course_end?: string;
  is_valid: boolean;
  is_revoked?: boolean;
}

export interface PlacementRecord {
  id: string;
  student_name: string;
  photo_url?: string;
  course_title: string;
  company: string;
  job_role: string;
  location?: string;
  package_lpa?: string;
  placed_on: string;
  is_featured: boolean;
  sort_order: number;
}

export interface Recruiter {
  id: string;
  name: string;
  logo_url?: string;
  industry?: string;
  sort_order: number;
}

export interface PreEnrollmentOffer {
  id: string;
  title: string;
  description: string;
  discount_label?: string;
  coupon_code?: string;
  valid_till?: string;
  seats_left?: number;
  course_slug?: string;
  is_active: boolean;
  sort_order: number;
}

export interface PreEnrollmentInput {
  full_name: string;
  phone: string;
  email?: string;
  course_slug?: string;
  offer_id?: string;
  coupon_code?: string;
  source?: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id?: string;
  certificate_no: string;
  student_name: string;
  course_title: string;
  grade: string;
  issue_date: string;
  expiry_date?: string;
  instructor_name?: string;
  course_start?: string;
  course_end?: string;
  revoked_at?: string | null;
  revoke_reason?: string | null;
  created_at: string;
}
