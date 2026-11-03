import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import path from 'path';
import { coursesData, blogPostsData } from '@/lib/data';
import { homepageFaqSeed, onlineCourses, shopProducts as referenceShopProducts, teachingQualifications } from '@/lib/academy-content';
import { courseVisuals } from '@/lib/course-visuals';
import type { Course, CourseModule } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { supabaseTablesReady } from '@/lib/supabase-schema';

export type InstituteRole = 'admin' | 'staff' | 'student';
export type AccountStatus = 'active' | 'inactive';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';
export type EnrollmentStatus = 'enrolled' | 'requested' | 'rejected' | 'cancelled';

export type StaffPermissions = {
  manageCourses: boolean;
  markAttendance: boolean;
  uploadMaterials: boolean;
  viewStudents: boolean;
  manageAnnouncements: boolean;
  viewEnrollments: boolean;
  viewAssignedCourses: boolean;
  viewAllCourses: boolean;
  editCourses: boolean;
  manageChapters: boolean;
  addChapters: boolean;
  editChapters: boolean;
  publishChapters: boolean;
  viewEnrolledStudents: boolean;
  assignTeachingStaff: boolean;
  manageEnrolments: boolean;
};

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  manageCourses: false,
  markAttendance: true,
  uploadMaterials: false,
  viewStudents: true,
  manageAnnouncements: false,
  viewEnrollments: false,
  viewAssignedCourses: true,
  viewAllCourses: false,
  editCourses: false,
  manageChapters: false,
  addChapters: false,
  editChapters: false,
  publishChapters: false,
  viewEnrolledStudents: true,
  assignTeachingStaff: false,
  manageEnrolments: false,
};

export type StudentAccess = {
  viewAvailableCourses: boolean;
  viewEnrolledCourses: boolean;
  viewChapters: boolean;
  viewMaterials: boolean;
  requestEnrolment: boolean;
  viewOwnStudyHours: boolean;
};

export const DEFAULT_STUDENT_ACCESS: StudentAccess = {
  viewAvailableCourses: true,
  viewEnrolledCourses: true,
  viewChapters: true,
  viewMaterials: true,
  requestEnrolment: true,
  viewOwnStudyHours: true,
};

export type InstituteAccount = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: InstituteRole;
  status: AccountStatus;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  photo?: string | null;
  permissions?: StaffPermissions;
  studentPermissions?: Partial<StudentAccess>;
  /** Sample records used only while Demo Data is switched on. They cannot sign in. */
  isDemo?: boolean;
  designation?: string;
  notes?: string;
  /** Set only for accounts that came from the public registration form. */
  registrationStatus?: RegistrationStatus;
  courseInterest?: string;
  reviewedAt?: string | null;
};

export type Enrollment = {
  id: string;
  accountId: string;
  courseId: string;
  status: EnrollmentStatus;
  createdAt: string;
  reviewedAt?: string | null;
  reviewerId?: string | null;
  reason?: string | null;
};

export type CourseCategory = {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  parentId?: string | null;
};

export type CourseMaterialRecord = {
  id: string;
  courseId: string;
  chapterId?: string | null;
  title: string;
  description: string;
  type: 'pdf' | 'document' | 'slides' | 'link' | 'other';
  fileName?: string | null;
  storageName?: string | null;
  externalUrl?: string | null;
  visibility: 'enrolled' | 'staff' | 'admin';
  createdAt: string;
};

export type CustomCourse = {
  id: string;
  title: string;
  slug: string;
  duration: string;
  description: string;
  categoryId: string;
  active: boolean;
  createdAt: string;
  shortDescription?: string;
  priceInr?: number | null;
  prices?: Partial<Record<'INR' | 'GBP' | 'USD' | 'AED', number | null>>;
  studyHours?: number | null;
  manualChapterCount?: number | null;
  image?: string;
  certificate?: string;
  prerequisites?: string[];
  outcomes?: string[];
  visible?: boolean;
  trainingMode?: string;
};

export type CourseOverride = {
  title?: string;
  shortDescription?: string;
  description?: string;
  duration?: string;
  priceInr?: number | null;
  prices?: Partial<Record<'INR' | 'GBP' | 'USD' | 'AED', number | null>>;
  studyHours?: number | null;
  manualChapterCount?: number | null;
  image?: string;
  certificate?: string;
  prerequisites?: string[];
  outcomes?: string[];
  visible?: boolean;
  categoryId?: string;
};

export type AttendanceMark = {
  id: string;
  accountId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  accountId: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: 'staff' | 'students' | 'both';
  published: boolean;
  createdAt: string;
};

export type LeaveRequest = {
  id: string;
  accountId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string | null;
  createdAt: string;
};

export type LoginEvent = {
  id: string;
  accountId: string;
  loggedInAt: string;
  loggedOutAt: string | null;
};

export type PunchRecord = {
  id: string;
  accountId: string;
  punchedInAt: string;
  punchedOutAt: string | null;
};

export type Chapter = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  sortOrder: number;
  studyHours: number | null;
  objectives: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CourseInstructor = {
  courseId: string;
  accountId: string;
};

export type IssuedCertificate = {
  id: string;
  number: string;
  studentId: string;
  courseId: string;
  studentName: string;
  courseTitle: string;
  completionDate: string | null;
  issueDate: string;
  status: 'issued' | 'revoked';
  revokedAt?: string | null;
};

export type InstituteBranding = {
  seal?: string | null;
  signature?: string | null;
  signatoryName?: string | null;
  signatoryDesignation?: string | null;
};

export type WebsiteSettingsRecord = {
  showRecognitions: boolean;
  instituteName: string;
  defaultCurrency?: 'INR' | 'EUR' | 'GBP' | 'USD' | 'AED';
  showCoursePrices?: boolean;
  updatedAt: string | null;
};

export type EnquiryCategory = 'career' | 'mentorship' | 'contact' | 'strategy';

export type ContactEnquiryRecord = {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  courseId?: string;
  courseName: string;
  otherCourse?: string;
  message?: string;
  status: 'new' | 'contacted' | 'in_progress' | 'enrolled' | 'closed';
  category?: EnquiryCategory;
  specialism?: string;
  availability?: string;
  supportType?: string;
  cvFile?: string | null;
  attachments?: string[];
};

export type ShopProductRecord = {
  id: string;
  slug: string;
  title: string;
  format: string;
  includes: string[];
  priceGbp: number | null;
  published: boolean;
  fileName?: string | null;
  createdAt: string;
};

export type StudentReviewRecord = {
  id: string;
  courseId: string;
  courseTitle: string;
  authorId: string;
  authorName: string;
  rating: number;
  body: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

export type ForumReplyRecord = {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
  hidden: boolean;
  approved?: boolean;
};

export type ForumThreadRecord = {
  id: string;
  title: string;
  body: string;
  category?: string;
  initials?: string;
  exampleReplyCount?: number;
  example?: boolean;
  pending?: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  hidden: boolean;
  reported: boolean;
  replies: ForumReplyRecord[];
};

export type GuestFeedbackRecord = {
  id: string;
  name: string;
  phone: string;
  body: string;
  courseTitle?: string;
  rating?: number;
  status: 'pending' | 'approved' | 'hidden';
  createdAt: string;
};

export type HomepageFaq = {
  id: string;
  question: string;
  answer: string;
};

export type PortalItemRecord = {
  id: string;
  kind: 'info' | 'zoom' | 'schedule' | 'update';
  title: string;
  detail: string;
  zoomUrl?: string;
  startsAt?: string;
  published: boolean;
  createdAt: string;
};

export type NewsletterRecord = {
  id: string;
  email: string;
  createdAt: string;
  active: boolean;
};

export type ArticleRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featuredImage: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ArticleDraft = {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  category?: string;
  author?: string;
  featuredImage?: string;
  published?: boolean;
};

const RETIRED_CATEGORY_IDS = new Set(['cat-ndt', 'cat-qaqc', 'cat-hse', 'cat-mep']);

const DEFAULT_SEED_PRICES: Record<string, Partial<Record<'INR' | 'GBP' | 'USD' | 'AED', number>>> = {
  c1: { INR: 35000, GBP: 330, USD: 420, AED: 1550 },
  c2: { INR: 35000, GBP: 330, USD: 420, AED: 1550 },
  c3: { INR: 45000, GBP: 420, USD: 540, AED: 1980 },
  c4: { INR: 25000, GBP: 240, USD: 300, AED: 1100 },
  c5: { INR: 25000, GBP: 240, USD: 300, AED: 1100 },
  c6: { INR: 180000, GBP: 1690, USD: 2150, AED: 7900 },
  c7: { INR: 28000, GBP: 280, USD: 360, AED: 1350 },
  c8: { INR: 25000, GBP: 250, USD: 320, AED: 1200 },
  c9: { INR: 32000, GBP: 320, USD: 410, AED: 1550 },
};

type Database = {
  accounts: InstituteAccount[];
  enrollments: Enrollment[];
  logins: LoginEvent[];
  punches: PunchRecord[];
  categories: CourseCategory[];
  customCourses: CustomCourse[];
  courseOverrides: Record<string, CourseOverride>;
  courseCategories: Record<string, string>;
  marks: AttendanceMark[];
  notifications: AppNotification[];
  announcements: Announcement[];
  leaveRequests: LeaveRequest[];
  chapters: Chapter[];
  instructors: CourseInstructor[];
  certificates: IssuedCertificate[];
  branding: InstituteBranding;
  studentAccess: StudentAccess;
  websiteSettings?: WebsiteSettingsRecord;
  enquiries: ContactEnquiryRecord[];
  newsletter: NewsletterRecord[];
  articles: ArticleRecord[];
  shopProducts?: ShopProductRecord[];
  reviews?: StudentReviewRecord[];
  threads?: ForumThreadRecord[];
  guestFeedback?: GuestFeedbackRecord[];
  portalItems?: PortalItemRecord[];
  referenceCatalogSeeded?: boolean;
  communityExamplesSeeded?: boolean;
  homepageFaqs?: HomepageFaq[];
  homepageFaqsSeeded?: boolean;
  demoDataEnabled?: boolean;
  courseMaterials?: CourseMaterialRecord[];
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'institute-db.json');
const SECRET_PATH = path.join(DATA_DIR, 'session-secret');
let memoryDb: Database | null = null;
let lastDbMtime: number = 0;
let normaliseShouldPersist = false;
let memorySecret: string | null = null;
export const SESSION_COOKIE = 'savvy_session';
export const INSTITUTE_TZ = 'Asia/Kolkata';

const PROGRAM_IDS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'];

export function isLegacyProgram(id: string) {
  return PROGRAM_IDS.includes(id);
}
type DatabaseCourse = {
  id: string; slug: string; title: string; short_description?: string; duration: string;
  fee?: string; featured_image?: string; category?: string | null; expected_hours?: number | null;
  certification?: string; eligibility?: string; published?: boolean; archived?: boolean;
};
let databaseCourses: DatabaseCourse[] | null = null;

/** Refresh the server-session catalogue from the same published course table as the website. */
export async function refreshCourseCatalog() {
  if (!isSupabaseConfigured) {
    databaseCourses = null;
    return;
  }
  if (!(await supabaseTablesReady())) {
    databaseCourses = [];
    return;
  }
  const { data, error } = await supabase.from('courses').select('*').eq('published', true).order('sort_order');
  if (error || !data) {
    databaseCourses = [];
    console.error('Portal course catalogue could not be refreshed.', error?.message ?? 'No course data returned.');
    return;
  }
  databaseCourses = (data as DatabaseCourse[]).filter((course) => !course.archived);
}

function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const passwordHash = scryptSync(password, salt, 32).toString('hex');
  return { passwordSalt: salt, passwordHash };
}

function verifyPassword(password: string, salt: string, hash: string) {
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, 'hex');
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function seedAccount(
  id: string,
  fullName: string,
  email: string,
  phone: string,
  role: InstituteRole,
): InstituteAccount {
  const secret = hashPassword('demo123');
  return {
    id,
    fullName,
    email,
    phone,
    role,
    status: 'active',
    passwordHash: secret.passwordHash,
    passwordSalt: secret.passwordSalt,
    createdAt: new Date().toISOString(),
  };
}

function emptyDatabase(): Database {
  const overrides: Record<string, CourseOverride> = {};
  for (const [id, prices] of Object.entries(DEFAULT_SEED_PRICES)) {
    overrides[id] = { prices, priceInr: prices.INR ?? null };
  }

  return {
    accounts: [
      seedAccount('acct-admin', 'Savvy Admin', 'admin@gmail.com', '9000000001', 'admin'),
      seedAccount('acct-staff', 'Savvy Staff', 'staff@gmail.com', '9000000002', 'staff'),
      seedAccount('acct-student', 'Savvy Student', 'student1@gmail.com', '9000000003', 'student'),
    ],
    enrollments: [
      { id: 'enr-staff-c1', accountId: 'acct-staff', courseId: 'c1', status: 'enrolled', createdAt: new Date().toISOString() },
      { id: 'enr-staff-c2', accountId: 'acct-staff', courseId: 'c2', status: 'enrolled', createdAt: new Date().toISOString() },
    ],
    logins: [],
    punches: [],
    categories: [],
    customCourses: [],
    courseOverrides: overrides,
    courseCategories: {},
    marks: [],
    notifications: [],
    announcements: [],
    leaveRequests: [],
    chapters: [],
    instructors: [],
    certificates: [],
    branding: {},
    studentAccess: { ...DEFAULT_STUDENT_ACCESS },
    enquiries: [],
    newsletter: [],
    articles: [],
    shopProducts: [],
    reviews: [],
    threads: [],
    guestFeedback: [],
    portalItems: [],
    referenceCatalogSeeded: false,
    communityExamplesSeeded: false,
    homepageFaqs: [],
    homepageFaqsSeeded: false,
  };
}

function ensureReferenceCatalog(parsed: Database) {
  let changed = false;
  parsed.shopProducts ??= [];
  parsed.reviews ??= [];
  parsed.threads ??= [];
  parsed.enquiries ??= [];
  parsed.guestFeedback ??= [];
  parsed.portalItems ??= [];

  for (const id of PROGRAM_IDS) {
    const current = parsed.courseOverrides[id] || {};
    if (current.visible !== false) {
      parsed.courseOverrides[id] = { ...current, visible: false };
      changed = true;
    }
  }
  if (parsed.customCourses) {
    const before = parsed.customCourses.length;
    parsed.customCourses = parsed.customCourses.filter((course) => course.id !== 'course-d5b00b87' && course.title.trim().toLowerCase() !== 'social media');
    if (parsed.customCourses.length !== before) changed = true;
  }

  if (!parsed.referenceCatalogSeeded && !parsed.categories.some((item) => item.id === 'cat-teaching')) {
    parsed.categories.push({
      id: 'cat-teaching',
      name: 'Teaching qualifications',
      description: 'Regulated teaching qualifications, completed fully online with live Zoom sessions.',
      active: true,
      createdAt: '2026-10-05T00:00:00.000Z',
    });
    changed = true;
  }
  if (!parsed.referenceCatalogSeeded && !parsed.categories.some((item) => item.id === 'cat-online')) {
    parsed.categories.push({
      id: 'cat-online',
      name: 'Online courses',
      description: 'Practical courses taught by Lisa Zaman, with manuals, video demonstrations and a certificate on completion.',
      active: true,
      createdAt: '2026-10-05T00:00:00.000Z',
    });
    changed = true;
  }

  const addCourse = (course: CustomCourse) => {
    if (parsed.customCourses.some((item) => item.slug === course.slug || item.id === course.id)) return;
    parsed.customCourses.push(course);
    parsed.courseCategories[course.id] = course.categoryId;
    changed = true;
  };

  if (!parsed.referenceCatalogSeeded) for (const item of teachingQualifications) {
    addCourse({
      id: `ref-${item.slug}`,
      slug: item.slug,
      title: item.title,
      duration: item.level,
      description: `${item.summary}. Intended for ${item.audience}. Study method: ${item.study}.`,
      shortDescription: item.summary,
      categoryId: 'cat-teaching',
      active: true,
      createdAt: '2026-10-05T00:00:00.000Z',
      prices: { GBP: null },
      certificate: 'Regulated teaching qualification',
      outcomes: [item.audience],
      visible: true,
      trainingMode: item.study,
      image: courseVisuals[item.slug]?.src || '',
    });
  }

  if (!parsed.referenceCatalogSeeded) for (const item of onlineCourses) {
    const modules = Number.parseInt(item.modules, 10) || null;
    addCourse({
      id: `ref-${item.slug}`,
      slug: item.slug,
      title: item.title,
      duration: item.modules,
      description: `${item.summary} Online and self-paced, with a certificate on completion. The source site describes manuals and video demonstrations, but it does not publish the video files.`,
      shortDescription: item.summary,
      categoryId: 'cat-online',
      active: true,
      createdAt: '2026-10-05T00:00:00.000Z',
      prices: { GBP: null },
      manualChapterCount: modules,
      certificate: 'Certificate',
      visible: true,
      trainingMode: 'Online, self-paced',
      image: courseVisuals[item.slug]?.src || '',
    });
  }

  for (const course of parsed.customCourses) {
    if (!course.id.startsWith('ref-') || course.image) continue;
    const visual = courseVisuals[course.slug];
    if (!visual) continue;
    course.image = visual.src;
    changed = true;
  }

  parsed.homepageFaqs ??= [];
  if (!parsed.homepageFaqsSeeded && parsed.homepageFaqs.length === 0) {
    parsed.homepageFaqs = homepageFaqSeed.map((item) => ({ ...item }));
    parsed.homepageFaqsSeeded = true;
    changed = true;
  }

  if (!parsed.referenceCatalogSeeded) {
    if (parsed.shopProducts.length === 0) {
      parsed.shopProducts = referenceShopProducts.map((item) => ({
        id: `shop-${item.slug}`,
        slug: item.slug,
        title: item.title,
        format: item.format,
        includes: [...item.includes],
        priceGbp: null,
        published: true,
        fileName: null,
        createdAt: '2026-10-05T00:00:00.000Z',
      }));
    }
    parsed.referenceCatalogSeeded = true;
    changed = true;
  }

  for (const enquiry of parsed.enquiries) {
    if (!enquiry.category) {
      enquiry.category = 'contact';
      changed = true;
    }
  }

  if (!parsed.communityExamplesSeeded) {
    const examples: ForumThreadRecord[] = [
      { id: 'example-unit-3', title: 'Tips for writing Unit 3 assessment plans?', category: 'Teaching Qualifications', initials: 'AM', exampleReplyCount: 12 },
      { id: 'example-sensitive-wax', title: 'Best wax for sensitive skin clients', category: 'Beauty', initials: 'RK', exampleReplyCount: 8 },
      { id: 'example-home-room', title: 'Setting up a training room at home: insurance?', category: 'Business', initials: 'SL', exampleReplyCount: 15 },
      { id: 'example-massage-partner', title: 'Looking for a massage practice partner nearby', category: 'Massage', initials: 'AM', exampleReplyCount: 4 },
    ].map((item) => ({
      ...item,
      body: '',
      example: true,
      pending: false,
      authorId: 'example',
      authorName: item.initials,
      createdAt: '2026-10-05T00:00:00.000Z',
      hidden: false,
      reported: false,
      replies: [],
    }));
    for (const example of examples) {
      if (!parsed.threads.some((item) => item.id === example.id)) parsed.threads.push(example);
    }
    parsed.communityExamplesSeeded = true;
    changed = true;
  }
  return changed;
}

function normaliseDb(parsed: Database) {
  parsed.accounts ??= [];
  parsed.enrollments ??= [];
  parsed.logins ??= [];
  parsed.punches ??= [];
  parsed.categories ??= [];
  const categoryCount = parsed.categories.length;
  parsed.categories = parsed.categories.filter((category) => !RETIRED_CATEGORY_IDS.has(category.id));
  parsed.customCourses ??= [];
  const customCount = parsed.customCourses.length;
  parsed.customCourses = parsed.customCourses.filter((course) => course.id !== 'course-d5b00b87' && course.title.trim().toLowerCase() !== 'social media');
  let republished = false;
  for (const course of parsed.customCourses) {
    if (course.id.startsWith('course-') && course.visible === false) {
      course.visible = true;
      republished = true;
    }
  }
  parsed.courseOverrides ??= {};
  parsed.courseCategories ??= {};
  let linksRemoved = false;
  for (const id of [...PROGRAM_IDS, 'course-d5b00b87']) {
    if (parsed.courseCategories[id]) {
      delete parsed.courseCategories[id];
      linksRemoved = true;
    }
  }
  for (const [id, categoryId] of Object.entries(parsed.courseCategories)) {
    if (RETIRED_CATEGORY_IDS.has(categoryId)) {
      delete parsed.courseCategories[id];
      linksRemoved = true;
    }
  }
  const retiredTouched = parsed.categories.length !== categoryCount || parsed.customCourses.length !== customCount || linksRemoved || republished;
  for (const [id, prices] of Object.entries(DEFAULT_SEED_PRICES)) {
    if (!parsed.courseOverrides[id]) {
      parsed.courseOverrides[id] = { prices, priceInr: prices.INR ?? null };
    } else if (!parsed.courseOverrides[id].prices) {
      parsed.courseOverrides[id].prices = prices;
    }
  }
  parsed.marks ??= [];
  parsed.notifications ??= [];
  parsed.announcements ??= [];
  parsed.leaveRequests ??= [];
  parsed.chapters ??= [];
  if (parsed.chapters.length === 0) {
    for (const course of coursesData) {
      if (course.modules && course.modules.length > 0) {
        course.modules.forEach((mod, idx) => {
          parsed.chapters.push({
            id: `chap-${course.id}-${mod.id || idx + 1}`,
            courseId: course.id,
            title: mod.title,
            description: mod.description || '',
            sortOrder: mod.sort_order ?? idx + 1,
            studyHours: 8,
            objectives: `Master core theoretical principles and practical inspection protocols for ${mod.title}.`,
            content: `Comprehensive hands-on curriculum, laboratory calibration, reference standards, and defect analysis for ${mod.title}.`,
            status: 'published',
            createdBy: 'acct-admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      }
    }
  }
  parsed.instructors ??= [];
  parsed.certificates ??= [];
  parsed.branding ??= {};
  parsed.studentAccess ??= { ...DEFAULT_STUDENT_ACCESS };
  parsed.enquiries ??= [];
  parsed.newsletter ??= [];
  parsed.articles ??= [];
  parsed.demoDataEnabled ??= false;
  parsed.courseMaterials ??= [];
  if (parsed.articles.length === 0 && blogPostsData && blogPostsData.length > 0) {
    parsed.articles = blogPostsData.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category_name || 'Technical Engineering',
      author: post.author_name || 'Savvy Technical Faculty',
      featuredImage: post.featured_image,
      published: true,
      createdAt: post.published_at || new Date().toISOString(),
      updatedAt: post.published_at || new Date().toISOString(),
    }));
  }
  normaliseShouldPersist = ensureReferenceCatalog(parsed) || retiredTouched;
  if (normaliseShouldPersist) parsed.referenceCatalogSeeded = parsed.referenceCatalogSeeded ?? true;
  return parsed;
}

function readDb(): Database {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(DB_PATH)) {
      const seeded = emptyDatabase();
      ensureReferenceCatalog(seeded);
      writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2));
      memoryDb = seeded;
      lastDbMtime = statSync(DB_PATH).mtimeMs;
      return seeded;
    }
    const stat = statSync(DB_PATH);
    if (memoryDb && stat.mtimeMs === lastDbMtime) {
      return memoryDb;
    }
    const raw = JSON.parse(readFileSync(DB_PATH, 'utf8')) as Database;
    const chaptersBefore = raw.chapters?.length ?? 0;
    const articlesBefore = raw.articles?.length ?? 0;
    const catalogBefore = raw.referenceCatalogSeeded === true;
    memoryDb = normaliseDb(raw);
    lastDbMtime = stat.mtimeMs;
    if (
      normaliseShouldPersist ||
      (chaptersBefore === 0 && memoryDb.chapters.length > 0) ||
      (articlesBefore === 0 && memoryDb.articles.length > 0) ||
      (!catalogBefore && memoryDb.referenceCatalogSeeded)
    ) {
      try {
        writeFileSync(DB_PATH, JSON.stringify(memoryDb, null, 2));
        lastDbMtime = statSync(DB_PATH).mtimeMs;
      } catch (error) {
        console.error('Institute database changes could not be saved.', error instanceof Error ? error.message : 'write failed');
      }
    }
    return memoryDb;
  } catch (error) {
    console.error('Institute database file is unavailable.', error instanceof Error ? error.message : 'read failed');
    memoryDb = emptyDatabase();
    return memoryDb;
  }
}

const DEFAULT_INSTITUTE_NAME = 'Savvy Training Institute';

function publicWebsiteSettings(record?: WebsiteSettingsRecord) {
  const name = record?.instituteName?.trim();
  return {
    show_recognitions: record?.showRecognitions === true,
    institute_name: name || DEFAULT_INSTITUTE_NAME,
    show_course_prices: record?.showCoursePrices === true,
  };
}

function writeDb(db: Database) {
  memoryDb = db;
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    lastDbMtime = statSync(DB_PATH).mtimeMs;
  } catch (error) {
    console.error('Institute database file could not be saved.', error instanceof Error ? error.message : 'write failed');
  }
}

export function sessionSecret() {
  if (memorySecret) return memorySecret;
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured && configured.length >= 32) {
    memorySecret = configured;
    return configured;
  }
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(SECRET_PATH)) writeFileSync(SECRET_PATH, randomBytes(32).toString('hex'));
    const stored = readFileSync(SECRET_PATH, 'utf8').trim();
    if (stored.length >= 32) {
      memorySecret = stored;
      return stored;
    }
  } catch (error) {
    console.error('Session secret file is unavailable.', error instanceof Error ? error.message : 'read failed');
  }
  throw new Error('SESSION_SECRET is not configured');
}

export function signSession(account: InstituteAccount) {
  const payload = Buffer.from(JSON.stringify({
    sub: account.id,
    role: account.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  })).toString('base64url');
  const sig = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function readSessionToken(token?: string | null): { sub: string; role: InstituteRole } | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub: string; role: InstituteRole; exp: number };
    if (!data.sub || data.exp < Date.now()) return null;
    if (data.role !== 'admin' && data.role !== 'staff' && data.role !== 'student') return null;
    return { sub: data.sub, role: data.role };
  } catch {
    return null;
  }
}

export function publicAccount(account: InstituteAccount) {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone,
    role: account.role,
    status: account.status,
    createdAt: account.createdAt,
    hasPhoto: Boolean(account.photo),
    isDemo: account.isDemo === true,
    designation: account.designation || '',
    notes: account.notes || '',
    assignedCourseIds: account.role === 'staff'
      ? readDb().instructors.filter((row) => row.accountId === account.id).map((row) => row.courseId)
      : undefined,
    permissions: account.role === 'staff' ? { ...DEFAULT_STAFF_PERMISSIONS, ...account.permissions } : undefined,
    studentPermissions: account.role === 'student' ? { ...DEFAULT_STUDENT_ACCESS, ...(readDb().studentAccess || {}), ...(account.studentPermissions || {}) } : undefined,
  };
}

function digits(value: string) {
  return value.replace(/\D/g, '');
}

export function findAccountByIdentifier(identifier: string) {
  const db = readDb();
  const raw = identifier.trim().toLowerCase();
  const phone = digits(identifier);
  return db.accounts.find((account) => account.email.toLowerCase() === raw || (phone.length >= 8 && digits(account.phone) === phone)) ?? null;
}

export function getAccount(id: string) {
  return readDb().accounts.find((account) => account.id === id) ?? null;
}

export function authenticate(identifier: string, password: string, role: InstituteRole) {
  const account = findAccountByIdentifier(identifier);
  if (!account) return { ok: false as const, code: 'unknown' as const };
  if (!verifyPassword(password, account.passwordSalt, account.passwordHash)) {
    return { ok: false as const, code: 'invalid' as const };
  }
  if (account.role !== role) return { ok: false as const, code: 'wrong-role' as const, role: account.role };
  if (account.registrationStatus === 'pending') return { ok: false as const, code: 'pending' as const };
  if (account.registrationStatus === 'rejected') return { ok: false as const, code: 'rejected' as const };
  if (account.isDemo) return { ok: false as const, code: 'inactive' as const };
  if (account.status !== 'active') return { ok: false as const, code: 'inactive' as const };
  const db = readDb();
  db.logins.push({
    id: `login-${randomBytes(6).toString('hex')}`,
    accountId: account.id,
    loggedInAt: new Date().toISOString(),
    loggedOutAt: null,
  });
  writeDb(db);
  return { ok: true as const, account };
}

export function closeOpenLogin(accountId: string) {
  const db = readDb();
  const open = [...db.logins].reverse().find((event) => event.accountId === accountId && !event.loggedOutAt);
  if (open) open.loggedOutAt = new Date().toISOString();
  writeDb(db);
}

function shownInDirectory(db: Database, account: InstituteAccount) {
  if (account.registrationStatus === 'pending' || account.registrationStatus === 'rejected') return false;
  if (account.isDemo && db.demoDataEnabled !== true) return false;
  return true;
}

export function listAccounts() {
  const db = readDb();
  return db.accounts.filter((account) => shownInDirectory(db, account)).map(publicAccount);
}

export function submitRegistration(input: { fullName: string; email: string; phone: string; password: string; courseInterest: string }) {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const courseInterest = input.courseInterest.trim();
  if (!fullName || fullName.length > 120) return { ok: false as const, message: 'Enter your full name.' };
  if (!email.includes('@') || email.length > 160) return { ok: false as const, message: 'Enter a valid email address.' };
  if (digits(phone).length < 8 || phone.length > 20) return { ok: false as const, message: 'Enter a mobile number.' };
  if (input.password.length < 8 || input.password.length > 128) return { ok: false as const, message: 'Use a password of at least 8 characters.' };
  if (courseInterest.length > 120) return { ok: false as const, message: 'Choose a course from the list.' };

  const db = readDb();
  const existing = db.accounts.find((account) => account.email.toLowerCase() === email);
  const phoneOwner = db.accounts.find((account) => digits(account.phone) === digits(phone));
  if (phoneOwner && phoneOwner.email.toLowerCase() !== email) {
    return { ok: false as const, message: 'An account with this phone number already exists.' };
  }
  if (existing && existing.registrationStatus !== 'pending' && existing.registrationStatus !== 'rejected') {
    return { ok: false as const, message: 'An account with this email already exists. Sign in, or use Forgot password if you cannot.' };
  }

  const secret = hashPassword(input.password);
  if (existing) {
    existing.fullName = fullName;
    existing.phone = phone;
    existing.courseInterest = courseInterest;
    existing.passwordHash = secret.passwordHash;
    existing.passwordSalt = secret.passwordSalt;
    existing.registrationStatus = 'pending';
    existing.status = 'inactive';
    existing.reviewedAt = null;
    writeDb(db);
    return { ok: true as const, resent: true as const };
  }

  const account: InstituteAccount = {
    id: `acct-${randomBytes(6).toString('hex')}`,
    fullName,
    email,
    phone,
    role: 'student',
    status: 'inactive',
    registrationStatus: 'pending',
    courseInterest,
    passwordHash: secret.passwordHash,
    passwordSalt: secret.passwordSalt,
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  };
  db.accounts.push(account);
  for (const admin of db.accounts.filter((item) => item.role === 'admin' && item.status === 'active')) {
    notify(db, admin.id, 'New registration request', `${fullName} asked to create a student account.`, '/admin#registrations');
  }
  writeDb(db);
  return { ok: true as const, resent: false as const };
}

export function listRegistrationRequests() {
  return readDb().accounts
    .filter((account) => account.registrationStatus)
    .map((account) => ({
      id: account.id,
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
      courseInterest: account.courseInterest ?? '',
      createdAt: account.createdAt,
      reviewedAt: account.reviewedAt ?? null,
      status: account.registrationStatus as RegistrationStatus,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function reviewRegistration(id: string, decision: 'approved' | 'rejected') {
  const db = readDb();
  const account = db.accounts.find((item) => item.id === id);
  if (!account || !account.registrationStatus) return { ok: false as const, message: 'That registration request was not found.' };
  if (account.registrationStatus !== 'pending') {
    return { ok: false as const, message: `This request is already ${account.registrationStatus}.` };
  }
  account.registrationStatus = decision;
  account.status = decision === 'approved' ? 'active' : 'inactive';
  account.reviewedAt = new Date().toISOString();
  writeDb(db);
  return { ok: true as const, status: account.registrationStatus };
}

export function createAccount(input: {
  fullName: string;
  email: string;
  phone: string;
  role: 'staff' | 'student';
  password: string;
  status: AccountStatus;
  courseId?: string;
  courseIds?: string[];
  designation?: string;
  notes?: string;
  permissions?: Partial<StaffPermissions>;
}) {
  const db = readDb();
  const email = input.email.trim().toLowerCase();
  const phone = digits(input.phone);
  if (db.accounts.some((account) => account.email.toLowerCase() === email)) {
    return { ok: false as const, message: 'An account with this email already exists.' };
  }
  if (phone && db.accounts.some((account) => digits(account.phone) === phone)) {
    return { ok: false as const, message: 'An account with this phone number already exists.' };
  }
  const courseIds = [...new Set([...(input.courseIds ?? []), ...(input.courseId ? [input.courseId] : [])])];
  if (courseIds.some((courseId) => !allCourses().some((course) => course.id === courseId))) {
    return { ok: false as const, message: 'That course is not available.' };
  }
  const secret = hashPassword(input.password);
  const account: InstituteAccount = {
    id: `acct-${randomBytes(6).toString('hex')}`,
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    role: input.role,
    status: input.status,
    passwordHash: secret.passwordHash,
    passwordSalt: secret.passwordSalt,
    createdAt: new Date().toISOString(),
    designation: input.designation?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    permissions: input.role === 'staff' && input.permissions ? { ...DEFAULT_STAFF_PERMISSIONS, ...input.permissions } : undefined,
  };
  db.accounts.push(account);
  for (const courseId of courseIds) {
    db.enrollments.push({
      id: `enr-${randomBytes(4).toString('hex')}`,
      accountId: account.id,
      courseId,
      status: 'enrolled',
      createdAt: new Date().toISOString(),
    });
  }
  writeDb(db);
  return { ok: true as const, account: publicAccount(account) };
}

export function updateOwnAccount(id: string, patch: { fullName?: string; email?: string; phone?: string; password?: string; currentPassword?: string }) {
  const db = readDb();
  const account = db.accounts.find((item) => item.id === id);
  if (!account) return { ok: false as const, message: 'Account not found.' };
  if (patch.fullName !== undefined) {
    if (!patch.fullName.trim()) return { ok: false as const, message: 'Enter your full name.' };
    account.fullName = patch.fullName.trim();
  }
  if (patch.email !== undefined) {
    const email = patch.email.trim().toLowerCase();
    if (!email.includes('@')) return { ok: false as const, message: 'Enter a valid email address.' };
    if (db.accounts.some((item) => item.id !== id && item.email.toLowerCase() === email)) {
      return { ok: false as const, message: 'An account with this email already exists.' };
    }
    account.email = email;
  }
  if (patch.phone !== undefined) {
    const phone = digits(patch.phone);
    if (phone.length < 8) return { ok: false as const, message: 'Enter a phone number.' };
    if (db.accounts.some((item) => item.id !== id && digits(item.phone) === phone)) {
      return { ok: false as const, message: 'An account with this phone number already exists.' };
    }
    account.phone = patch.phone.trim();
  }
  if (patch.password) {
    if (!patch.currentPassword || !verifyPassword(patch.currentPassword, account.passwordSalt, account.passwordHash)) {
      return { ok: false as const, message: 'The current password is incorrect.' };
    }
    if (patch.password.length < 8) return { ok: false as const, message: 'Use a password of at least 8 characters.' };
    const secret = hashPassword(patch.password);
    account.passwordHash = secret.passwordHash;
    account.passwordSalt = secret.passwordSalt;
  }
  writeDb(db);
  return { ok: true as const, account: publicAccount(account) };
}

export function rosterForStaff(accountId: string) {
  const db = readDb();
  const courseIds = new Set(
    db.enrollments.filter((row) => row.accountId === accountId && row.status === 'enrolled').map((row) => row.courseId),
  );
  return db.accounts
    .filter((account) => account.role === 'student' && db.enrollments.some((row) => row.accountId === account.id && row.status === 'enrolled' && courseIds.has(row.courseId)))
    .map((account) => ({
      ...publicAccount(account),
      courseIds: db.enrollments.filter((row) => row.accountId === account.id && courseIds.has(row.courseId)).map((row) => row.courseId),
    }));
}

export function updateAccount(id: string, patch: {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: AccountStatus;
  password?: string;
  designation?: string;
  notes?: string;
  permissions?: Partial<StaffPermissions>;
}) {
  const db = readDb();
  const account = db.accounts.find((item) => item.id === id);
  if (!account || account.role === 'admin') return { ok: false as const, message: 'That account cannot be edited here.' };
  if (account.isDemo) return { ok: false as const, message: 'Demo records are controlled by the Demo Data setting and cannot be edited.' };
  if (patch.email) {
    const email = patch.email.trim().toLowerCase();
    if (db.accounts.some((item) => item.id !== id && item.email.toLowerCase() === email)) {
      return { ok: false as const, message: 'An account with this email already exists.' };
    }
    account.email = email;
  }
  if (patch.phone) {
    const phone = digits(patch.phone);
    if (phone && db.accounts.some((item) => item.id !== id && digits(item.phone) === phone)) {
      return { ok: false as const, message: 'An account with this phone number already exists.' };
    }
    account.phone = patch.phone.trim();
  }
  if (patch.fullName) account.fullName = patch.fullName.trim();
  if (patch.designation !== undefined) account.designation = patch.designation.trim();
  if (patch.notes !== undefined) account.notes = patch.notes.trim();
  if (patch.permissions && account.role === 'staff') {
    account.permissions = { ...DEFAULT_STAFF_PERMISSIONS, ...account.permissions, ...patch.permissions };
  }
  if (patch.status) account.status = patch.status;
  if (patch.password) {
    const secret = hashPassword(patch.password);
    account.passwordHash = secret.passwordHash;
    account.passwordSalt = secret.passwordSalt;
  }
  writeDb(db);
  return { ok: true as const, account: publicAccount(account) };
}

export function deleteAccount(id: string, options?: { force?: boolean }): { ok: boolean; message: string; canDeactivate?: boolean } {
  const db = readDb();
  const account = db.accounts.find((item) => item.id === id);
  if (!account) return { ok: false, message: 'Account not found.' };
  if (account.role === 'admin') return { ok: false, message: 'Administrator accounts cannot be deleted.' };
  if (account.isDemo) return { ok: false, message: 'Demo records stay in place. Switch Demo Data off to hide them.' };

  // Check academic retention dependencies
  const hasCertificates = db.certificates.some((c) => c.studentId === id && c.status === 'issued');
  if (hasCertificates && !options?.force) {
    return {
      ok: false,
      message: `Account "${account.fullName}" has issued qualification certificates on record. To comply with institutional credential audit and verification retention rules, accounts with issued certificates cannot be permanently deleted. You can deactivate this account instead.`,
      canDeactivate: true,
    };
  }

  // Remove related operational records safely
  db.accounts = db.accounts.filter((item) => item.id !== id);
  db.enrollments = db.enrollments.filter((item) => item.accountId !== id);
  db.punches = db.punches.filter((item) => item.accountId !== id);
  db.logins = db.logins.filter((item) => item.accountId !== id);
  db.leaveRequests = db.leaveRequests.filter((item) => item.accountId !== id);
  db.notifications = db.notifications.filter((item) => item.accountId !== id);
  db.instructors = db.instructors.filter((item) => item.accountId !== id);
  if (!hasCertificates) {
    db.certificates = db.certificates.filter((item) => item.studentId !== id);
    db.marks = db.marks.filter((item) => item.accountId !== id);
  }

  writeDb(db);
  return {
    ok: true,
    message: `${account.role === 'student' ? 'Student' : 'Staff'} account "${account.fullName}" has been permanently deleted.`,
  };
}

const COURSE_IMAGE = '/images/course/ndt-level-2-course.png';

export function formatCourseFee(prices?: Record<string, number | null>, _priceInr?: number | null, fallbackFee?: string): string {
  if (prices?.GBP != null && !isNaN(prices.GBP) && prices.GBP > 0) {
    return `£${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(prices.GBP)}`;
  }
  if (fallbackFee && fallbackFee.includes('£')) {
    return fallbackFee;
  }
  return 'Fee on request';
}

function lessonStats(db: Database, courseId: string, manualHours: number | null | undefined, manualCount: number | null | undefined) {
  const chapters = db.chapters.filter((chapter) => chapter.courseId === courseId && chapter.status !== 'archived');
  const hourValues = chapters.map((chapter) => chapter.studyHours).filter((hours): hours is number => hours != null);
  return {
    chapterCount: chapters.length > 0 ? chapters.length : (manualCount ?? 0),
    studyHours: hourValues.length > 0 ? hourValues.reduce((sum, hours) => sum + hours, 0) : (manualHours ?? null),
  };
}

export function allCourses() {
  const db = readDb();
  const source = databaseCourses && databaseCourses.length > 0
    ? databaseCourses
    : coursesData.filter((course) => PROGRAM_IDS.includes(course.id));
  const published = source.map((course) => {
    const seed = coursesData.find((item) => item.id === course.id);
    const override = db.courseOverrides[course.id] ?? {};
    const stats = lessonStats(db, course.id, override.studyHours ?? seed?.expected_hours ?? null, override.manualChapterCount ?? null);
    const chapterCount = stats.chapterCount > 0 ? stats.chapterCount : (seed?.modules?.length ?? 0);
    const prerequisites = override.prerequisites ?? [];
    const prices = override.prices || (override.priceInr != null ? { INR: override.priceInr } : (DEFAULT_SEED_PRICES[course.id] || { INR: null, GBP: null, USD: null, AED: null }));
    return {
      id: course.id,
      slug: course.slug,
      title: override.title || course.title,
      shortDescription: override.shortDescription || seed?.short_description || '',
      description: override.description || seed?.description || seed?.short_description || '',
      duration: override.duration || course.duration,
      image: override.image || seed?.featured_image || ('featured_image' in course ? course.featured_image : '') || COURSE_IMAGE,
      fee: formatCourseFee(prices, override.priceInr ?? ('price_inr' in course ? (course as any).price_inr : null), ('fee' in course && course.fee) || seed?.fee),
      priceInr: override.priceInr ?? prices.INR ?? null,
      prices,
      currency_prices: prices,
      certification: override.certificate || seed?.certification || ('certification' in course ? course.certification : '') || '',
      prerequisites,
      outcomes: override.outcomes ?? seed?.learning_outcomes ?? [],
      eligibility: prerequisites.length ? prerequisites.join(' · ') : (seed?.eligibility || ('eligibility' in course ? course.eligibility : '') || ''),
      expectedHours: stats.studyHours,
      manualStudyHours: override.studyHours ?? null,
      manualChapterCount: override.manualChapterCount ?? null,
      chapterCount,
      href: `/course/${course.slug}`,
      active: true,
      visible: override.visible !== false,
      custom: false,
      categoryId: override.categoryId || db.courseCategories[course.id] || '',
    };
  });
  const custom = db.customCourses.filter((course) => course.active).map((course) => {
    const stats = lessonStats(db, course.id, course.studyHours, course.manualChapterCount);
    const prerequisites = course.prerequisites ?? [];
    const prices = course.prices || (course.priceInr != null ? { INR: course.priceInr } : { INR: null, GBP: null, USD: null, AED: null });
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      shortDescription: course.shortDescription || '',
      description: course.description,
      duration: course.duration,
      image: course.image || courseVisuals[course.slug]?.src || '',
      fee: formatCourseFee(prices, course.priceInr),
      priceInr: course.priceInr ?? prices.INR ?? null,
      prices,
      currency_prices: prices,
      certification: course.certificate || '',
      prerequisites,
      outcomes: course.outcomes ?? [],
      eligibility: prerequisites.join(' · '),
      expectedHours: stats.studyHours,
      manualStudyHours: course.studyHours ?? null,
      manualChapterCount: course.manualChapterCount ?? null,
      chapterCount: stats.chapterCount,
      href: `/course/${course.slug}`,
      active: course.active,
      visible: course.visible !== false,
      custom: true,
      categoryId: course.categoryId,
      trainingMode: course.trainingMode || '',
    };
  });
  return [...published, ...custom].map((course) => {
    const category = db.categories.find((item) => item.id === course.categoryId);
    return {
      ...course,
      categoryName: category?.name || 'Uncategorised',
    };
  });
}

/** Public catalogue: the same active courses the admin list edits, including later additions. */
export function websiteCourses(): Course[] {
  const db = readDb();
  return allCourses().filter((course) => course.visible && course.active && !PROGRAM_IDS.includes(course.id)).map((course) => {
    const seed = coursesData.find((item) => item.id === course.id);
    const chapters = db.chapters
      .filter((chapter) => chapter.courseId === course.id && chapter.status === 'published')
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
    const modules: CourseModule[] = chapters.length
      ? chapters.map((chapter) => ({
        id: chapter.id,
        course_id: course.id,
        title: chapter.title,
        description: chapter.objectives || chapter.description,
        sort_order: chapter.sortOrder,
        study_hours: chapter.studyHours,
      }))
      : (seed?.modules ?? []);
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      short_description: course.shortDescription || seed?.short_description || course.description,
      description: course.description || seed?.description || course.shortDescription,
      duration: course.duration,
      fee: course.fee || 'Fee on request',
      training_mode: (course as { trainingMode?: string }).trainingMode || seed?.training_mode || 'Classroom & Online',
      certification: course.certification,
      eligibility: course.eligibility,
      placement_support: seed?.placement_support ?? false,
      expected_hours: course.expectedHours,
      chapter_count: course.chapterCount > 0 ? course.chapterCount : (seed?.modules?.length ?? 0),
      category: course.categoryName === 'Uncategorised' ? undefined : course.categoryName,
      categoryId: course.categoryId || undefined,
      prerequisites: course.prerequisites,
      learning_outcomes: course.outcomes,
      rating: seed?.rating ?? 0,
      featured_image: course.image,
      is_featured: seed?.is_featured ?? false,
      sort_order: seed?.sort_order ?? 100,
      modules,
      faqs: seed?.faqs,
      currency_prices: course.currency_prices,
      price_inr: course.priceInr,
    };
  });
}

export function programs() {
  return allCourses();
}

function courseExists(courseId: string) {
  return allCourses().some((course) => course.id === courseId);
}

export function enrollmentCounts() {
  const db = readDb();
  return Object.fromEntries(allCourses().map((course) => [
    course.id,
    db.enrollments.filter((row) => row.courseId === course.id && row.status === 'enrolled' && db.accounts.find((account) => account.id === row.accountId)?.role === 'student').length,
  ]));
}

export function accountCourses(accountId: string) {
  const db = readDb();
  return db.enrollments.filter((row) => row.accountId === accountId);
}

export function courseLinksFor(account: InstituteAccount) {
  const links = accountCourses(account.id);
  if (account.role !== 'staff') return links;
  const db = readDb();
  const teaching = db.instructors
    .filter((row) => row.accountId === account.id && !links.some((link) => link.courseId === row.courseId && link.status === 'enrolled'))
    .map((row) => ({
      id: `teach-${row.courseId}`,
      accountId: account.id,
      courseId: row.courseId,
      status: 'enrolled' as const,
      createdAt: '',
    }));
  return [...links, ...teaching];
}

export function requestEnrollment(accountId: string, courseId: string) {
  if (!courseExists(courseId)) return { ok: false as const, message: 'That course is not available.' };
  const db = readDb();
  const student = db.accounts.find((item) => item.id === accountId);
  if (student && !studentAllows(student, 'requestEnrolment')) return { ok: false as const, message: 'Enrolment requests are closed.' };
  const existing = db.enrollments.find((row) => row.accountId === accountId && row.courseId === courseId);
  if (existing?.status === 'enrolled') return { ok: false as const, message: 'You are already enrolled in this course.' };
  if (existing?.status === 'requested') return { ok: false as const, message: 'An enrollment request is already waiting.' };
  if (existing) {
    existing.status = 'requested';
    existing.createdAt = new Date().toISOString();
    existing.reason = null;
    existing.reviewedAt = null;
  } else {
    db.enrollments.push({
      id: `enr-${randomBytes(4).toString('hex')}`,
      accountId,
      courseId,
      status: 'requested',
      createdAt: new Date().toISOString(),
    });
  }
  const course = allCourses().find((item) => item.id === courseId);
  for (const admin of db.accounts.filter((item) => item.role === 'admin' && item.status === 'active')) {
    db.notifications.push({
      id: `ntf-${randomBytes(4).toString('hex')}`,
      accountId: admin.id,
      title: 'New enrolment request',
      body: `${student?.fullName ?? 'A student'} requested ${course?.title ?? 'a course'}.`,
      href: '/admin#applications',
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
  writeDb(db);
  return { ok: true as const };
}

export function assignCourse(accountId: string, courseId: string) {
  if (!courseExists(courseId)) return { ok: false as const, message: 'That course is not available.' };
  const db = readDb();
  const account = db.accounts.find((item) => item.id === accountId);
  if (!account || account.role === 'admin') return { ok: false as const, message: 'Choose a staff or student account.' };
  const existing = db.enrollments.find((row) => row.accountId === accountId && row.courseId === courseId);
  if (existing?.status === 'enrolled') return { ok: false as const, message: 'This account is already enrolled on that course.' };
  if (existing) {
    existing.status = 'enrolled';
    existing.reviewedAt = new Date().toISOString();
  } else {
    db.enrollments.push({
      id: `enr-${randomBytes(4).toString('hex')}`,
      accountId,
      courseId,
      status: 'enrolled',
      createdAt: new Date().toISOString(),
    });
  }
  writeDb(db);
  return { ok: true as const };
}

export function punchIn(accountId: string) {
  const db = readDb();
  const open = db.punches.find((row) => row.accountId === accountId && !row.punchedOutAt);
  if (open) return { ok: false as const, message: 'You already have an attendance session in progress.' };
  const record: PunchRecord = {
    id: `punch-${randomBytes(6).toString('hex')}`,
    accountId,
    punchedInAt: new Date().toISOString(),
    punchedOutAt: null,
  };
  db.punches.push(record);
  writeDb(db);
  return { ok: true as const, record };
}

export function punchOut(accountId: string) {
  const db = readDb();
  const open = [...db.punches].reverse().find((row) => row.accountId === accountId && !row.punchedOutAt);
  if (!open) return { ok: false as const, message: 'Punch in before you punch out.' };
  open.punchedOutAt = new Date().toISOString();
  writeDb(db);
  return { ok: true as const, record: open };
}

export function punchesFor(accountId: string) {
  return readDb().punches.filter((row) => row.accountId === accountId).sort((a, b) => b.punchedInAt.localeCompare(a.punchedInAt));
}

export function historyFor(accountId: string) {
  const db = readDb();
  const account = db.accounts.find((item) => item.id === accountId);
  return {
    account: account ? publicAccount(account) : null,
    logins: db.logins.filter((row) => row.accountId === accountId).map((row) => ({
      ...row,
      loginLabel: formatInstituteTime(row.loggedInAt),
      logoutLabel: row.loggedOutAt ? formatInstituteTime(row.loggedOutAt) : '',
    })),
    punches: db.punches.filter((row) => row.accountId === accountId).map((row) => ({
      ...row,
      punchInLabel: formatInstituteTime(row.punchedInAt),
      punchOutLabel: row.punchedOutAt ? formatInstituteTime(row.punchedOutAt) : '',
      duration: durationLabel(row.punchedInAt, row.punchedOutAt),
    })),
  };
}

export function instituteDate(value: string | Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: INSTITUTE_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function formatInstituteTime(value: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INSTITUTE_TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value));
}

function durationLabel(start: string, end: string | null) {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export type AttendanceRow = {
  id: string;
  accountId: string;
  name: string;
  role: InstituteRole;
  date: string;
  loginTime: string;
  logoutTime: string;
  punchIn: string;
  punchOut: string;
  duration: string;
  status: 'Present' | 'In Progress' | 'Absent' | 'Not Started';
  openPunch: boolean;
  openLogin: boolean;
};

export function attendanceRows(filters: { date?: string; role?: string; name?: string; status?: string }) {
  const db = readDb();
  const dates = new Set<string>();
  for (const event of db.logins) dates.add(instituteDate(event.loggedInAt));
  for (const punch of db.punches) dates.add(instituteDate(punch.punchedInAt));
  if (filters.date) dates.add(filters.date);

  const rows: AttendanceRow[] = [];
  for (const account of db.accounts) {
    if (account.role === 'admin') continue;
    for (const date of dates) {
      const logins = db.logins.filter((event) => event.accountId === account.id && instituteDate(event.loggedInAt) === date);
      const punches = db.punches.filter((event) => event.accountId === account.id && instituteDate(event.punchedInAt) === date);
      if (!logins.length && !punches.length) continue;
      const firstLogin = logins[0];
      const lastLogin = logins[logins.length - 1];
      const punch = punches[punches.length - 1];
      const openLogin = logins.some((event) => !event.loggedOutAt);
      const openPunch = Boolean(punch && !punch.punchedOutAt);
      let status: AttendanceRow['status'] = 'Not Started';
      if (punch && !punch.punchedOutAt) status = 'In Progress';
      else if (punch?.punchedOutAt) status = 'Present';
      else if (openLogin) status = 'In Progress';
      const row: AttendanceRow = {
        id: `${account.id}-${date}`,
        accountId: account.id,
        name: account.fullName,
        role: account.role,
        date,
        loginTime: firstLogin ? formatInstituteTime(firstLogin.loggedInAt) : '',
        logoutTime: openLogin ? '' : (lastLogin?.loggedOutAt ? formatInstituteTime(lastLogin.loggedOutAt) : ''),
        punchIn: punch ? formatInstituteTime(punch.punchedInAt) : '',
        punchOut: punch?.punchedOutAt ? formatInstituteTime(punch.punchedOutAt) : '',
        duration: punch ? durationLabel(punch.punchedInAt, punch.punchedOutAt) : (firstLogin ? durationLabel(firstLogin.loggedInAt, openLogin ? null : lastLogin?.loggedOutAt ?? null) : ''),
        status,
        openPunch,
        openLogin,
      };
      rows.push(row);
    }
  }

  return rows.filter((row) => {
    if (filters.date && row.date !== filters.date) return false;
    if (filters.role && filters.role !== 'all' && row.role !== filters.role) return false;
    if (filters.name && !row.name.toLowerCase().includes(filters.name.toLowerCase())) return false;
    if (filters.status === 'open' && !row.openPunch) return false;
    if (filters.status && filters.status !== 'all' && filters.status !== 'open' && row.status !== filters.status) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
}

export function todayKey() {
  return instituteDate(new Date());
}

function notify(db: Database, accountId: string, title: string, body: string, href: string) {
  db.notifications.push({
    id: `ntf-${randomBytes(4).toString('hex')}`,
    accountId,
    title,
    body,
    href,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function listEnrollmentRequests() {
  const db = readDb();
  const courses = allCourses();
  return db.enrollments
    .map((row) => {
      const account = db.accounts.find((item) => item.id === row.accountId);
      const course = courses.find((item) => item.id === row.courseId);
      return {
        ...row,
        studentName: account?.fullName ?? 'Unknown',
        studentEmail: account?.email ?? '',
        role: account?.role ?? 'student',
        courseTitle: course?.title ?? row.courseId,
        categoryName: course?.categoryName ?? 'Uncategorised',
        visible: account ? shownInDirectory(db, account) : false,
      };
    })
    .filter((row) => row.visible)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function reviewEnrollment(reviewerId: string, enrollmentId: string, decision: 'approved' | 'rejected', reason?: string) {
  const db = readDb();
  const row = db.enrollments.find((item) => item.id === enrollmentId);
  if (!row || row.status !== 'requested') return { ok: false as const, message: 'That request is no longer pending.' };
  row.status = decision === 'approved' ? 'enrolled' : 'rejected';
  row.reviewedAt = new Date().toISOString();
  row.reviewerId = reviewerId;
  row.reason = reason?.trim() || null;
  const course = allCourses().find((item) => item.id === row.courseId);
  notify(
    db,
    row.accountId,
    decision === 'approved' ? 'Enrolment approved' : 'Enrolment rejected',
    decision === 'approved'
      ? `${course?.title ?? 'Your course'} is now in Enrolled Courses.`
      : `${course?.title ?? 'Your request'} was not approved.${row.reason ? ` ${row.reason}` : ''}`,
    '/student#courses',
  );
  writeDb(db);
  return { ok: true as const };
}

const DEMO_STUDENTS = [
  ['Amelia Hart', 'amelia.hart@demo.savvy.invalid', '+44 7700 900201'],
  ['Oliver Bennett', 'oliver.bennett@demo.savvy.invalid', '+44 7700 900202'],
  ['Charlotte Hughes', 'charlotte.hughes@demo.savvy.invalid', '+44 7700 900203'],
  ['Harry Clarke', 'harry.clarke@demo.savvy.invalid', '+44 7700 900204'],
  ['Sophie Wright', 'sophie.wright@demo.savvy.invalid', '+44 7700 900205'],
  ['George Edwards', 'george.edwards@demo.savvy.invalid', '+44 7700 900206'],
  ['Isla Thompson', 'isla.thompson@demo.savvy.invalid', '+44 7700 900207'],
  ['Jack Wilson', 'jack.wilson@demo.savvy.invalid', '+44 7700 900208'],
  ['Freya Morgan', 'freya.morgan@demo.savvy.invalid', '+44 7700 900209'],
  ['Leo Patel', 'leo.patel@demo.savvy.invalid', '+44 7700 900210'],
  ['Grace Campbell', 'grace.campbell@demo.savvy.invalid', '+44 7700 900211'],
  ['Noah Richardson', 'noah.richardson@demo.savvy.invalid', '+44 7700 900212'],
  ['Emily Foster', 'emily.foster@demo.savvy.invalid', '+44 7700 900213'],
  ['Arthur Davies', 'arthur.davies@demo.savvy.invalid', '+44 7700 900214'],
  ['Poppy Shaw', 'poppy.shaw@demo.savvy.invalid', '+44 7700 900215'],
] as const;

const DEMO_STAFF = [
  ['Margaret Ellis', 'margaret.ellis@demo.savvy.invalid', '+44 7700 900301', 'Tutor'],
  ['James Whitaker', 'james.whitaker@demo.savvy.invalid', '+44 7700 900302', 'Assessor'],
  ['Hannah Brooks', 'hannah.brooks@demo.savvy.invalid', '+44 7700 900303', 'Course coordinator'],
  ['Daniel Price', 'daniel.price@demo.savvy.invalid', '+44 7700 900304', 'Quality lead'],
  ['Rebecca Cole', 'rebecca.cole@demo.savvy.invalid', '+44 7700 900305', 'Admissions officer'],
] as const;

function ensureDemoAccounts(db: Database) {
  const secret = hashPassword(randomBytes(24).toString('hex'));
  DEMO_STUDENTS.forEach((row, index) => {
    const id = `demo-stu-${String(index + 1).padStart(2, '0')}`;
    if (db.accounts.some((account) => account.id === id)) return;
    db.accounts.push({
      id,
      fullName: row[0],
      email: row[1],
      phone: row[2],
      role: 'student',
      status: 'active',
      passwordHash: secret.passwordHash,
      passwordSalt: secret.passwordSalt,
      createdAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      isDemo: true,
    });
  });
  DEMO_STAFF.forEach((row, index) => {
    const id = `demo-stf-${String(index + 1).padStart(2, '0')}`;
    if (db.accounts.some((account) => account.id === id)) return;
    db.accounts.push({
      id,
      fullName: row[0],
      email: row[1],
      phone: row[2],
      role: 'staff',
      status: 'active',
      passwordHash: secret.passwordHash,
      passwordSalt: secret.passwordSalt,
      createdAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
      isDemo: true,
      designation: row[3],
      permissions: { ...DEFAULT_STAFF_PERMISSIONS },
    });
  });
}

export function setDemoData(enabled: boolean) {
  const db = readDb();
  db.demoDataEnabled = enabled;
  if (enabled) ensureDemoAccounts(db);
  writeDb(db);
  return { ok: true as const, ...overviewCounts() };
}

export function overviewCounts() {
  const db = readDb();
  const visible = (accountId: string) => {
    const account = db.accounts.find((item) => item.id === accountId);
    return Boolean(account && shownInDirectory(db, account));
  };
  const students = db.accounts.filter((account) => account.role === 'student' && shownInDirectory(db, account));
  const staff = db.accounts.filter((account) => account.role === 'staff' && shownInDirectory(db, account) && account.status === 'active');
  const courses = allCourses().filter((course) => course.visible !== false && course.active !== false);
  const enrolments = db.enrollments.filter((row) => row.status === 'enrolled' && visible(row.accountId) && db.accounts.find((account) => account.id === row.accountId)?.role === 'student');
  const pendingRequests = db.enrollments.filter((row) => row.status === 'requested' && visible(row.accountId));
  const pendingRegistrations = db.accounts.filter((account) => account.registrationStatus === 'pending' && !account.isDemo).length;
  const certificates = db.certificates.filter((item) => item.status === 'issued' && visible(item.studentId));
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 1));
  const months: { key: string; label: string; shortLabel: string; year: number; month: number; students: number; enrolments: number; certificates: number; staff: number; requests: number }[] = [];
  for (let cursor = start; cursor <= end; cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;
    months.push({
      key,
      label: new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' }).format(cursor),
      shortLabel: new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' }).format(cursor),
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth() + 1,
      students: students.filter((account) => account.createdAt.slice(0, 7) === key).length,
      enrolments: enrolments.filter((row) => row.createdAt.slice(0, 7) === key).length,
      certificates: certificates.filter((item) => (item.issueDate || '').slice(0, 7) === key).length,
      staff: db.accounts.filter((account) => account.role === 'staff' && shownInDirectory(db, account) && account.createdAt.slice(0, 7) === key).length,
      requests: db.enrollments.filter((row) => visible(row.accountId) && row.createdAt.slice(0, 7) === key && row.status === 'requested').length,
    });
  }
  return {
    demoDataEnabled: db.demoDataEnabled === true,
    students: students.length,
    staff: staff.length,
    activeStaff: staff.length,
    courses: courses.length,
    publishedCourses: courses.length,
    pendingRequests: pendingRequests.length,
    pendingRegistrations,
    applicationsAwaiting: 0,
    enrolments: enrolments.length,
    certificates: certificates.length,
    months,
  };
}

export function listCategories() {
  const db = readDb();
  return db.categories.map((category) => ({
    ...category,
    courseCount: allCourses().filter((course) => course.categoryId === category.id).length,
  }));
}

export function saveCategory(input: { id?: string; name: string; description?: string; active?: boolean; parentId?: string | null }) {
  const db = readDb();
  const name = input.name.trim();
  if (!name) return { ok: false as const, message: 'Enter a category name.' };
  if (db.categories.some((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== input.id)) {
    return { ok: false as const, message: 'A category with that name already exists.' };
  }
  if (input.id) {
    const category = db.categories.find((item) => item.id === input.id);
    if (!category) return { ok: false as const, message: 'That category was not found.' };
    category.name = name;
    if (input.description !== undefined) category.description = input.description.trim();
    if (input.active !== undefined) category.active = input.active;
    if (input.parentId !== undefined) {
      if (input.parentId && (input.parentId === category.id || !db.categories.some((item) => item.id === input.parentId))) {
        return { ok: false as const, message: 'Choose a valid parent category.' };
      }
      category.parentId = input.parentId || null;
    }
    writeDb(db);
    return { ok: true as const, category };
  }
  const category: CourseCategory = {
    id: `cat-${randomBytes(4).toString('hex')}`,
    name,
    description: input.description?.trim() ?? '',
    active: input.active !== false,
    createdAt: new Date().toISOString(),
    parentId: input.parentId || null,
  };
  if (category.parentId && !db.categories.some((item) => item.id === category.parentId)) {
    return { ok: false as const, message: 'Choose a valid parent category.' };
  }
  db.categories.push(category);
  writeDb(db);
  return { ok: true as const, category };
}

export function deleteCategory(id: string) {
  const db = readDb();
  const category = db.categories.find((item) => item.id === id);
  if (!category) return { ok: false as const, message: 'That category was not found.' };
  const linked = allCourses().filter((course) => course.categoryId === id).map((course) => course.title);
  if (linked.length > 0) {
    return { ok: false as const, message: `Reassign or remove ${linked.length} course${linked.length === 1 ? '' : 's'} before deleting this category.`, courses: linked };
  }
  if (db.categories.some((item) => item.parentId === id)) {
    return { ok: false as const, message: 'Move or delete the subcategories first.' };
  }
  db.categories = db.categories.filter((item) => item.id !== id);
  writeDb(db);
  return { ok: true as const };
}

export function listCourseMaterials(courseId?: string) {
  const db = readDb();
  return (db.courseMaterials ?? []).filter((item) => !courseId || item.courseId === courseId);
}

export function saveCourseMaterial(input: {
  id?: string;
  courseId: string;
  chapterId?: string | null;
  title: string;
  description?: string;
  type?: CourseMaterialRecord['type'];
  fileName?: string | null;
  storageName?: string | null;
  externalUrl?: string | null;
  visibility?: CourseMaterialRecord['visibility'];
}) {
  const db = readDb();
  const title = input.title.trim();
  if (!title) return { ok: false as const, message: 'Enter a material title.' };
  if (!allCourses().some((course) => course.id === input.courseId)) return { ok: false as const, message: 'Choose a course.' };
  if (input.chapterId && !db.chapters.some((chapter) => chapter.id === input.chapterId && chapter.courseId === input.courseId)) {
    return { ok: false as const, message: 'Choose a chapter from that course.' };
  }
  db.courseMaterials ??= [];
  if (input.id) {
    const row = db.courseMaterials.find((item) => item.id === input.id);
    if (!row) return { ok: false as const, message: 'That material was not found.' };
    row.title = title;
    row.description = input.description?.trim() ?? row.description;
    row.courseId = input.courseId;
    row.chapterId = input.chapterId || null;
    row.type = input.type || row.type;
    row.externalUrl = input.externalUrl?.trim() || null;
    row.visibility = input.visibility || row.visibility;
    if (input.fileName !== undefined) row.fileName = input.fileName;
    if (input.storageName !== undefined) row.storageName = input.storageName;
    writeDb(db);
    return { ok: true as const, material: row };
  }
  const row: CourseMaterialRecord = {
    id: `mat-${randomBytes(4).toString('hex')}`,
    courseId: input.courseId,
    chapterId: input.chapterId || null,
    title,
    description: input.description?.trim() ?? '',
    type: input.type || (input.externalUrl ? 'link' : 'other'),
    fileName: input.fileName || null,
    storageName: input.storageName || null,
    externalUrl: input.externalUrl?.trim() || null,
    visibility: input.visibility || 'enrolled',
    createdAt: new Date().toISOString(),
  };
  db.courseMaterials.push(row);
  writeDb(db);
  return { ok: true as const, material: row };
}

export function deleteCourseMaterial(id: string) {
  const db = readDb();
  const row = (db.courseMaterials ?? []).find((item) => item.id === id);
  if (!row) return { ok: false as const, message: 'That material was not found.' };
  db.courseMaterials = (db.courseMaterials ?? []).filter((item) => item.id !== id);
  writeDb(db);
  return { ok: true as const, material: row };
}

type CourseDraft = {
  id?: string;
  title: string;
  duration?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  price?: number | string | null;
  priceGbp?: number | string | null;
  priceInr?: number | string | null;
  prices?: Partial<Record<'INR' | 'GBP' | 'USD' | 'AED', number | null>>;
  studyHours?: number | null;
  manualChapterCount?: number | null;
  certificate?: string;
  prerequisites?: string[];
  outcomes?: string[];
  visible?: boolean;
};

function cleanLines(value: string[] | undefined) {
  return (value ?? []).map((item) => item.trim()).filter(Boolean);
}

export function createCustomCourse(input: CourseDraft) {
  const db = readDb();
  const title = input.title.trim();
  if (!title) return { ok: false as const, message: 'Enter a course name.' };
  const category = db.categories.find((item) => item.id === input.categoryId && item.active);
  if (!category) return { ok: false as const, message: 'Choose an active category.' };
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `course-${randomBytes(2).toString('hex')}`;
  const taken = new Set([...coursesData.map((course) => course.slug), ...db.customCourses.map((course) => course.slug)]);
  let slug = base;
  let suffix = 2;
  while (taken.has(slug)) slug = `${base}-${suffix++}`;

  const gbpVal = input.priceGbp != null && input.priceGbp !== ''
    ? Number(input.priceGbp)
    : input.price != null && input.price !== ''
      ? Number(input.price)
      : input.prices?.GBP != null
        ? Number(input.prices.GBP)
        : null;

  const explicitInr = input.priceInr != null && input.priceInr !== ''
    ? Number(input.priceInr)
    : input.prices?.INR != null
      ? Number(input.prices.INR)
      : null;

  const coursePrices = {
    GBP: gbpVal,
    INR: explicitInr,
    USD: input.prices?.USD != null ? Number(input.prices.USD) : null,
    AED: input.prices?.AED != null ? Number(input.prices.AED) : null,
  };

  const course: CustomCourse = {
    id: `ref-${slug}`,
    title,
    slug,
    duration: input.duration?.trim() || 'Not set',
    description: input.description?.trim() ?? '',
    shortDescription: input.shortDescription?.trim() ?? '',
    categoryId: category.id,
    active: true,
    createdAt: new Date().toISOString(),
    priceInr: explicitInr,
    prices: coursePrices,
    studyHours: input.studyHours ?? null,
    manualChapterCount: input.manualChapterCount ?? null,
    image: '',
    certificate: input.certificate?.trim() ?? '',
    prerequisites: cleanLines(input.prerequisites),
    outcomes: cleanLines(input.outcomes),
    visible: input.visible !== false,
  };
  db.customCourses.push(course);
  db.courseCategories[course.id] = category.id;
  writeDb(db);
  return { ok: true as const, course };
}

export function saveCourseDetails(input: CourseDraft) {
  if (!input.id) return createCustomCourse(input);
  const db = readDb();
  const title = input.title.trim();
  if (!title) return { ok: false as const, message: 'Enter a course name.' };
  const custom = db.customCourses.find((course) => course.id === input.id);

  const gbpVal = input.priceGbp != null && input.priceGbp !== ''
    ? Number(input.priceGbp)
    : input.price != null && input.price !== ''
      ? Number(input.price)
      : input.prices?.GBP != null
        ? Number(input.prices.GBP)
        : undefined;

  if (custom) {
    custom.title = title;
    if (input.duration !== undefined) custom.duration = input.duration.trim() || custom.duration;
    if (input.description !== undefined) custom.description = input.description.trim();
    if (input.shortDescription !== undefined) custom.shortDescription = input.shortDescription.trim();
    if (gbpVal !== undefined) {
      custom.prices = { ...(custom.prices ?? {}), GBP: gbpVal };
    }
    if (input.priceInr !== undefined && input.priceInr !== '') {
      custom.priceInr = Number(input.priceInr);
      custom.prices = { ...(custom.prices ?? {}), INR: Number(input.priceInr) };
    }
    if (input.prices !== undefined) {
      custom.prices = { ...(custom.prices ?? {}), ...input.prices };
    }
    if (input.studyHours !== undefined) custom.studyHours = input.studyHours;
    if (input.manualChapterCount !== undefined) custom.manualChapterCount = input.manualChapterCount;
    if (input.certificate !== undefined) custom.certificate = input.certificate.trim();
    if (input.prerequisites) custom.prerequisites = cleanLines(input.prerequisites);
    if (input.outcomes) custom.outcomes = cleanLines(input.outcomes);
    if (input.visible !== undefined) custom.visible = input.visible;
    if (input.categoryId) {
      const category = db.categories.find((item) => item.id === input.categoryId && item.active);
      if (!category) return { ok: false as const, message: 'Choose an active category.' };
      custom.categoryId = category.id;
      db.courseCategories[custom.id] = category.id;
    }
    writeDb(db);
    return { ok: true as const, course: custom };
  }
  if (!allCourses().some((course) => course.id === input.id)) return { ok: false as const, message: 'That course was not found.' };
  const override: CourseOverride = { ...(db.courseOverrides[input.id] ?? {}) };
  override.title = title;
  if (input.duration !== undefined) override.duration = input.duration.trim();
  if (input.description !== undefined) override.description = input.description.trim();
  if (input.shortDescription !== undefined) override.shortDescription = input.shortDescription.trim();
  if (gbpVal !== undefined) {
    override.prices = { ...(override.prices ?? {}), GBP: gbpVal };
  }
  if (input.priceInr !== undefined && input.priceInr !== '') {
    override.priceInr = Number(input.priceInr);
    override.prices = { ...(override.prices ?? {}), INR: Number(input.priceInr) };
  }
  if (input.prices !== undefined) {
    override.prices = { ...(override.prices ?? {}), ...input.prices };
  }
  if (input.studyHours !== undefined) override.studyHours = input.studyHours;
  if (input.manualChapterCount !== undefined) override.manualChapterCount = input.manualChapterCount;
  if (input.certificate !== undefined) override.certificate = input.certificate.trim();
  if (input.prerequisites) override.prerequisites = cleanLines(input.prerequisites);
  if (input.outcomes) override.outcomes = cleanLines(input.outcomes);
  if (input.visible !== undefined) override.visible = input.visible;
  if (input.categoryId) {
    const category = db.categories.find((item) => item.id === input.categoryId);
    if (!category) return { ok: false as const, message: 'Choose a category.' };
    override.categoryId = category.id;
    db.courseCategories[input.id] = category.id;
  }
  db.courseOverrides[input.id] = override;
  writeDb(db);
  return { ok: true as const, course: { id: input.id } };
}

export function setCourseImage(courseId: string, publicPath: string) {
  const db = readDb();
  const custom = db.customCourses.find((course) => course.id === courseId);
  if (custom) {
    custom.image = publicPath;
    writeDb(db);
    return { ok: true as const };
  }
  if (!allCourses().some((course) => course.id === courseId)) return { ok: false as const, message: 'That course was not found.' };
  const override: CourseOverride = { ...(db.courseOverrides[courseId] ?? {}), image: publicPath };
  db.courseOverrides[courseId] = override;
  writeDb(db);
  return { ok: true as const };
}

export function assignCategory(courseId: string, categoryId: string) {
  const db = readDb();
  if (!courseExists(courseId)) return { ok: false as const, message: 'That course was not found.' };
  if (categoryId && !db.categories.some((item) => item.id === categoryId)) {
    return { ok: false as const, message: 'That category was not found.' };
  }
  if (categoryId) db.courseCategories[courseId] = categoryId;
  else delete db.courseCategories[courseId];
  const custom = db.customCourses.find((item) => item.id === courseId);
  if (custom) custom.categoryId = categoryId;
  writeDb(db);
  return { ok: true as const };
}

export function savePermissions(accountId: string, permissions: Partial<StaffPermissions & StudentAccess>) {
  const db = readDb();
  const account = db.accounts.find((item) => item.id === accountId);
  if (!account) return { ok: false as const, message: 'Account not found.' };
  if (account.isDemo) return { ok: false as const, message: 'Demo records are controlled by the Demo Data setting and cannot be edited.' };
  if (account.role === 'staff') {
    account.permissions = { ...DEFAULT_STAFF_PERMISSIONS, ...account.permissions, ...(permissions as StaffPermissions) };
  } else if (account.role === 'student') {
    account.studentPermissions = {
      ...DEFAULT_STUDENT_ACCESS,
      ...(db.studentAccess || {}),
      ...(account.studentPermissions || {}),
      ...(permissions as Partial<StudentAccess>),
    };
  } else {
    return { ok: false as const, message: 'Administrator permissions cannot be modified.' };
  }
  writeDb(db);
  return { ok: true as const, account: publicAccount(account) };
}

export function studentAllows(account: InstituteAccount, key: keyof StudentAccess): boolean {
  if (account.role === 'admin') return true;
  if (account.role !== 'student') return true;
  if (account.studentPermissions && typeof account.studentPermissions[key] === 'boolean') {
    return Boolean(account.studentPermissions[key]);
  }
  const db = readDb();
  return Boolean(db.studentAccess?.[key] ?? DEFAULT_STUDENT_ACCESS[key]);
}

export function staffAllows(account: InstituteAccount, key: keyof StaffPermissions) {
  if (account.role === 'admin') return true;
  if (account.role !== 'staff') return false;
  return Boolean({ ...DEFAULT_STAFF_PERMISSIONS, ...account.permissions }[key]);
}

export function listMarks(filters: { accountId?: string; role?: string; date?: string; courseId?: string }) {
  const db = readDb();
  return db.marks
    .filter((mark) => {
      const account = db.accounts.find((item) => item.id === mark.accountId);
      if (filters.accountId && mark.accountId !== filters.accountId) return false;
      if (filters.role && account?.role !== filters.role) return false;
      if (filters.date && mark.date !== filters.date) return false;
      if (filters.courseId && mark.courseId !== filters.courseId) return false;
      return true;
    })
    .map((mark) => ({
      ...mark,
      name: db.accounts.find((item) => item.id === mark.accountId)?.fullName ?? 'Unknown',
      role: db.accounts.find((item) => item.id === mark.accountId)?.role ?? 'student',
      courseTitle: allCourses().find((course) => course.id === mark.courseId)?.title ?? '',
      markedByName: db.accounts.find((item) => item.id === mark.markedBy)?.fullName ?? 'Unknown',
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
}

export function saveMark(actorId: string, input: { accountId: string; courseId: string; date: string; status: 'present' | 'absent' | 'late' }) {
  const db = readDb();
  const person = db.accounts.find((item) => item.id === input.accountId);
  if (!person || person.role === 'admin') return { ok: false as const, message: 'Choose a student or staff member.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false as const, message: 'Choose a valid date.' };
  const existing = db.marks.find((mark) => mark.accountId === input.accountId && mark.courseId === input.courseId && mark.date === input.date);
  if (existing) {
    existing.status = input.status;
    existing.markedBy = actorId;
  } else {
    db.marks.push({
      id: `mark-${randomBytes(4).toString('hex')}`,
      accountId: input.accountId,
      courseId: input.courseId || '',
      date: input.date,
      status: input.status,
      markedBy: actorId,
      createdAt: new Date().toISOString(),
    });
  }
  writeDb(db);
  return { ok: true as const };
}

export function notificationsFor(accountId: string) {
  return readDb().notifications.filter((item) => item.accountId === accountId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationsRead(accountId: string) {
  const db = readDb();
  for (const item of db.notifications) if (item.accountId === accountId) item.read = true;
  writeDb(db);
}

export function listAnnouncements(role: InstituteRole) {
  return readDb().announcements.filter((item) => {
    if (!item.published) return role === 'admin';
    if (role === 'admin') return true;
    if (item.audience === 'both') return true;
    if (role === 'staff') return item.audience === 'staff';
    return item.audience === 'students';
  });
}

export function saveAnnouncement(input: { id?: string; title: string; body: string; audience: Announcement['audience']; published: boolean }) {
  const db = readDb();
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) return { ok: false as const, message: 'Enter a title and a message.' };
  let announcement = input.id ? db.announcements.find((item) => item.id === input.id) : undefined;
  const wasPublished = Boolean(announcement?.published);
  if (input.id && !announcement) return { ok: false as const, message: 'That announcement was not found.' };
  if (!announcement) {
    announcement = { id: `ann-${randomBytes(4).toString('hex')}`, title, body, audience: input.audience, published: input.published, createdAt: new Date().toISOString() };
    db.announcements.push(announcement);
  } else {
    announcement.title = title;
    announcement.body = body;
    announcement.audience = input.audience;
    announcement.published = input.published;
  }
  if (input.published && !wasPublished) {
    for (const account of db.accounts) {
      const matches = announcement.audience === 'both' || (announcement.audience === 'staff' && account.role === 'staff') || (announcement.audience === 'students' && account.role === 'student');
      if (matches) notify(db, account.id, announcement.title, announcement.body, account.role === 'staff' ? '/staff' : '/student');
    }
  }
  writeDb(db);
  return { ok: true as const, announcement };
}

export function listLeave(account: InstituteAccount) {
  const db = readDb();
  const rows = account.role === 'admin' ? db.leaveRequests : db.leaveRequests.filter((item) => item.accountId === account.id);
  return rows.map((item) => ({ ...item, name: db.accounts.find((person) => person.id === item.accountId)?.fullName ?? 'Unknown' }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function requestLeave(accountId: string, input: { startDate: string; endDate: string; reason: string }) {
  if (!input.startDate || !input.endDate || !input.reason.trim()) return { ok: false as const, message: 'Enter the dates and a reason.' };
  const db = readDb();
  const person = db.accounts.find((item) => item.id === accountId);
  db.leaveRequests.push({
    id: `leave-${randomBytes(4).toString('hex')}`,
    accountId,
    startDate: input.startDate,
    endDate: input.endDate,
    reason: input.reason.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  for (const admin of db.accounts.filter((item) => item.role === 'admin')) {
    notify(db, admin.id, 'Leave request', `${person?.fullName ?? 'A staff member'} requested leave ${input.startDate} to ${input.endDate}.`, '/admin#settings');
  }
  writeDb(db);
  return { ok: true as const };
}

export function reviewLeave(id: string, decision: 'approved' | 'rejected') {
  const db = readDb();
  const row = db.leaveRequests.find((item) => item.id === id);
  if (!row || row.status !== 'pending') return { ok: false as const, message: 'That leave request is no longer pending.' };
  row.status = decision;
  row.reviewedAt = new Date().toISOString();
  notify(db, row.accountId, decision === 'approved' ? 'Leave approved' : 'Leave rejected', `${row.startDate} to ${row.endDate} was ${decision}.`, '/staff');
  writeDb(db);
  return { ok: true as const };
}

export function setPhoto(accountId: string, filename: string) {
  const db = readDb();
  const account = db.accounts.find((item) => item.id === accountId);
  if (!account) return { ok: false as const, message: 'Account not found.' };
  account.photo = filename;
  writeDb(db);
  return { ok: true as const };
}

export function photoFile(accountId: string) {
  const account = getAccount(accountId);
  if (!account?.photo) return null;
  return path.join(DATA_DIR, 'photos', account.photo);
}

function staffAssigned(db: Database, accountId: string, courseId: string) {
  return db.instructors.some((row) => row.accountId === accountId && row.courseId === courseId)
    || db.enrollments.some((row) => row.accountId === accountId && row.courseId === courseId && row.status === 'enrolled');
}

export function canOpenCourse(account: InstituteAccount, courseId: string) {
  if (account.role === 'admin') return true;
  const db = readDb();
  if (!allCourses().some((course) => course.id === courseId)) return false;
  if (account.role === 'staff') {
    if (staffAllows(account, 'viewAllCourses')) return true;
    if (!staffAllows(account, 'viewAssignedCourses')) return false;
    return staffAssigned(db, account.id, courseId);
  }
  return studentAllows(account, 'viewAvailableCourses') || studentAllows(account, 'viewEnrolledCourses');
}

export function courseRecord(courseId: string, viewer: InstituteAccount) {
  if (!canOpenCourse(viewer, courseId)) return { ok: false as const, status: 403, message: 'You do not have permission to open this course.' };
  const db = readDb();
  const course = allCourses().find((item) => item.id === courseId);
  if (!course) return { ok: false as const, status: 404, message: 'That course was not found.' };
  const enrolled = viewer.role === 'student' && db.enrollments.some((row) => row.accountId === viewer.id && row.courseId === courseId && row.status === 'enrolled');
  const request = db.enrollments.find((row) => row.accountId === viewer.id && row.courseId === courseId);
  const chapters = db.chapters
    .filter((chapter) => chapter.courseId === courseId && chapter.status !== 'archived')
    .filter((chapter) => viewer.role !== 'student' || (enrolled && studentAllows(viewer, 'viewChapters') && chapter.status === 'published'))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
  const instructors = db.instructors
    .filter((row) => row.courseId === courseId)
    .map((row) => db.accounts.find((account) => account.id === row.accountId))
    .filter((account): account is InstituteAccount => Boolean(account))
    .map((account) => ({ id: account.id, fullName: account.fullName }));
  const enrolledStudents = db.enrollments.filter((row) => {
    const student = db.accounts.find((account) => account.id === row.accountId);
    return row.courseId === courseId && row.status === 'enrolled' && student?.role === 'student' && shownInDirectory(db, student);
  });
  const manage = viewer.role === 'admin' || (viewer.role === 'staff' && (staffAllows(viewer, 'viewEnrolledStudents') || staffAllows(viewer, 'viewStudents')));
  return {
    ok: true as const,
    course,
    chapters: chapters.map((chapter) => viewer.role === 'student' && !studentAllows(viewer, 'viewMaterials')
      ? { ...chapter, content: '', objectives: '' }
      : chapter),
    instructors,
    chapterCount: course.chapterCount,
    studyHours: course.expectedHours,
    enrolledCount: viewer.role === 'student' ? null : enrolledStudents.length,
    students: manage ? enrolledStudents.map((row) => {
      const student = db.accounts.find((account) => account.id === row.accountId);
      return { id: row.accountId, fullName: student?.fullName ?? 'Unknown', email: student?.email ?? '', enrolledAt: row.createdAt };
    }) : [],
    staffChoices: viewer.role === 'admin' || staffAllows(viewer, 'assignTeachingStaff')
      ? db.accounts.filter((account) => account.role === 'staff' && account.status === 'active').map((account) => ({ id: account.id, fullName: account.fullName }))
      : [],
    enrollmentStatus: viewer.role === 'student' ? (request?.status ?? 'available') : null,
    canAddChapter: viewer.role === 'admin' || (viewer.role === 'staff' && staffAllows(viewer, 'addChapters') && (staffAllows(viewer, 'viewAllCourses') || staffAssigned(db, viewer.id, courseId))),
    canEditChapter: viewer.role === 'admin' || staffAllows(viewer, 'editChapters') || staffAllows(viewer, 'manageChapters'),
    canPublishChapter: viewer.role === 'admin' || staffAllows(viewer, 'publishChapters') || staffAllows(viewer, 'manageChapters'),
  };
}

export function saveChapter(actor: InstituteAccount, input: { id?: string; courseId: string; title: string; description?: string; sortOrder?: number; studyHours?: number | null; objectives?: string; content?: string; status?: 'draft' | 'published' }) {
  const db = readDb();
  if (!allCourses().some((course) => course.id === input.courseId)) return { ok: false as const, message: 'That course was not found.' };
  const assigned = actor.role === 'admin' || staffAllows(actor, 'viewAllCourses') || staffAssigned(db, actor.id, input.courseId);
  if (actor.role === 'student' || !assigned) return { ok: false as const, message: 'You do not have permission to manage chapters for this course.' };
  const title = input.title.trim();
  if (!title) return { ok: false as const, message: 'Enter a chapter title.' };
  const hours = input.studyHours == null || Number.isNaN(Number(input.studyHours)) ? null : Math.max(0, Number(input.studyHours));
  if (input.id) {
    const chapter = db.chapters.find((item) => item.id === input.id && item.courseId === input.courseId);
    if (!chapter) return { ok: false as const, message: 'That chapter was not found.' };
    const publishing = input.status === 'published' && chapter.status !== 'published';
    const editing = !publishing;
    if (editing && actor.role !== 'admin' && !staffAllows(actor, 'editChapters') && !staffAllows(actor, 'manageChapters')) {
      return { ok: false as const, message: 'You do not have permission to edit chapters.' };
    }
    if (publishing && actor.role !== 'admin' && !staffAllows(actor, 'publishChapters') && !staffAllows(actor, 'manageChapters')) {
      return { ok: false as const, message: 'You do not have permission to publish chapters.' };
    }
    chapter.title = title;
    chapter.description = input.description?.trim() ?? chapter.description;
    chapter.objectives = input.objectives?.trim() ?? chapter.objectives;
    chapter.content = input.content ?? chapter.content;
    chapter.studyHours = hours;
    if (input.sortOrder != null) chapter.sortOrder = input.sortOrder;
    if (input.status) chapter.status = input.status;
    chapter.updatedAt = new Date().toISOString();
    writeDb(db);
    return { ok: true as const, chapter };
  }
  if (actor.role !== 'admin' && !staffAllows(actor, 'addChapters') && !staffAllows(actor, 'manageChapters')) {
    return { ok: false as const, message: 'You do not have permission to add chapters.' };
  }
  const chapter: Chapter = {
    id: `chap-${randomBytes(4).toString('hex')}`,
    courseId: input.courseId,
    title,
    description: input.description?.trim() ?? '',
    sortOrder: input.sortOrder ?? db.chapters.filter((item) => item.courseId === input.courseId).length + 1,
    studyHours: hours,
    objectives: input.objectives?.trim() ?? '',
    content: input.content ?? '',
    status: input.status === 'published' && (actor.role === 'admin' || staffAllows(actor, 'publishChapters') || staffAllows(actor, 'manageChapters')) ? 'published' : 'draft',
    createdBy: actor.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.chapters.push(chapter);
  writeDb(db);
  return { ok: true as const, chapter };
}

export function archiveChapter(actor: InstituteAccount, id: string) {
  const db = readDb();
  const chapter = db.chapters.find((item) => item.id === id);
  if (!chapter) return { ok: false as const, message: 'That chapter was not found.' };
  if (actor.role !== 'admin' && !staffAllows(actor, 'manageChapters')) return { ok: false as const, message: 'You do not have permission to archive chapters.' };
  chapter.status = 'archived';
  chapter.updatedAt = new Date().toISOString();
  writeDb(db);
  return { ok: true as const };
}

export function orderChapters(actor: InstituteAccount, courseId: string, ids: string[]) {
  const db = readDb();
  if (actor.role !== 'admin' && !staffAllows(actor, 'editChapters') && !staffAllows(actor, 'manageChapters')) {
    return { ok: false as const, message: 'You do not have permission to reorder chapters.' };
  }
  ids.forEach((id, index) => {
    const chapter = db.chapters.find((item) => item.id === id && item.courseId === courseId);
    if (chapter) chapter.sortOrder = index + 1;
  });
  writeDb(db);
  return { ok: true as const };
}

export function assignInstructor(actor: InstituteAccount, courseId: string, accountId: string) {
  if (actor.role !== 'admin' && !staffAllows(actor, 'assignTeachingStaff')) {
    return { ok: false as const, message: 'You do not have permission to assign teaching staff.' };
  }
  const db = readDb();
  if (!allCourses().some((course) => course.id === courseId)) return { ok: false as const, message: 'That course was not found.' };
  const staff = db.accounts.find((account) => account.id === accountId && account.role === 'staff');
  if (!staff) return { ok: false as const, message: 'Choose a staff account.' };
  if (!db.instructors.some((row) => row.courseId === courseId && row.accountId === accountId)) {
    db.instructors.push({ courseId, accountId });
  }
  writeDb(db);
  return { ok: true as const };
}

export function clearInstructor(actor: InstituteAccount, courseId: string, accountId: string) {
  if (actor.role !== 'admin' && !staffAllows(actor, 'assignTeachingStaff')) {
    return { ok: false as const, message: 'You do not have permission to change teaching staff.' };
  }
  const db = readDb();
  db.instructors = db.instructors.filter((row) => !(row.courseId === courseId && row.accountId === accountId));
  writeDb(db);
  return { ok: true as const };
}

export function studentAccessPolicy() {
  return { ...DEFAULT_STUDENT_ACCESS, ...readDb().studentAccess };
}

export function saveStudentAccess(input: StudentAccess) {
  const db = readDb();
  db.studentAccess = {
    viewAvailableCourses: Boolean(input.viewAvailableCourses),
    viewEnrolledCourses: Boolean(input.viewEnrolledCourses),
    viewChapters: Boolean(input.viewChapters),
    viewMaterials: Boolean(input.viewMaterials),
    requestEnrolment: Boolean(input.requestEnrolment),
    viewOwnStudyHours: Boolean(input.viewOwnStudyHours),
  };
  writeDb(db);
  return db.studentAccess;
}

export function listCertificates(account: InstituteAccount) {
  const db = readDb();
  const rows = account.role === 'student' ? db.certificates.filter((item) => item.studentId === account.id) : db.certificates;
  return rows.sort((a, b) => b.issueDate.localeCompare(a.issueDate));
}

export function issueCertificate(actorId: string, input: { studentId: string; courseId: string; completionDate?: string | null }) {
  const db = readDb();
  const student = db.accounts.find((account) => account.id === input.studentId && account.role === 'student');
  const course = allCourses().find((item) => item.id === input.courseId);
  if (!student || !course) return { ok: false as const, message: 'Choose a student and a course.' };
  const enrolled = db.enrollments.some((row) => row.accountId === student.id && row.courseId === course.id && row.status === 'enrolled');
  if (!enrolled) return { ok: false as const, message: 'That student is not enrolled in this course.' };
  const existing = db.certificates.find((item) => item.studentId === student.id && item.courseId === course.id && item.status === 'issued');
  if (existing) return { ok: false as const, message: 'An issued certificate already exists for this student and course.' };
  const completionDate = input.completionDate && /^\d{4}-\d{2}-\d{2}$/.test(input.completionDate) ? input.completionDate : null;
  const certificate: IssuedCertificate = {
    id: `cert-${randomBytes(4).toString('hex')}`,
    number: `SAV-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`,
    studentId: student.id,
    courseId: course.id,
    studentName: student.fullName,
    courseTitle: course.title,
    completionDate,
    issueDate: new Date().toISOString(),
    status: 'issued',
  };
  db.certificates.push(certificate);
  notify(db, student.id, 'Certificate issued', `${course.title} certificate ${certificate.number} is ready to download.`, '/student#certificates');
  writeDb(db);
  return { ok: true as const, certificate };
}

export function revokeCertificate(id: string) {
  const db = readDb();
  const certificate = db.certificates.find((item) => item.id === id);
  if (!certificate || certificate.status !== 'issued') return { ok: false as const, message: 'That certificate is not active.' };
  certificate.status = 'revoked';
  certificate.revokedAt = new Date().toISOString();
  writeDb(db);
  return { ok: true as const, certificate };
}

export function certificateFor(account: InstituteAccount, id: string) {
  const certificate = readDb().certificates.find((item) => item.id === id);
  if (!certificate) return null;
  if (account.role === 'student' && certificate.studentId !== account.id) return null;
  return certificate;
}

export function brandingState() {
  return readDb().branding ?? {};
}

/** Fields the certificate may show. Filenames stay on the server. */
export function publicIdentity(branding: InstituteBranding = brandingState()) {
  return {
    hasSeal: Boolean(branding.seal),
    hasSignature: Boolean(branding.signature),
    signatoryName: branding.signatoryName?.trim() || '',
    signatoryDesignation: branding.signatoryDesignation?.trim() || '',
  };
}

export function setSignatory(name: string, designation: string) {
  const db = readDb();
  db.branding ??= {};
  db.branding.signatoryName = name;
  db.branding.signatoryDesignation = designation;
  writeDb(db);
  return publicIdentity(db.branding);
}

export function setBranding(kind: 'seal' | 'signature', filename: string | null) {
  const db = readDb();
  db.branding ??= {};
  db.branding[kind] = filename;
  writeDb(db);
  return db.branding;
}

export function brandingFile(kind: 'seal' | 'signature') {
  const name = readDb().branding?.[kind];
  if (!name) return null;
  return path.join(DATA_DIR, 'branding', name);
}

export function websiteSettings() {
  return publicWebsiteSettings(readDb().websiteSettings);
}

export function saveWebsiteSettings(input: { show_recognitions?: boolean; institute_name?: string; default_currency?: 'INR' | 'EUR' | 'GBP' | 'USD' | 'AED'; show_course_prices?: boolean }) {
  const db = readDb();
  const current = db.websiteSettings;
  const instituteName = input.institute_name !== undefined ? input.institute_name.trim() : (current?.instituteName || DEFAULT_INSTITUTE_NAME);
  if (!instituteName || instituteName.length > 120) {
    return { ok: false as const, message: 'Enter an institute name of 120 characters or fewer.' };
  }
  db.websiteSettings = {
    showRecognitions: input.show_recognitions !== undefined ? input.show_recognitions === true : (current?.showRecognitions ?? false),
    instituteName,
    defaultCurrency: input.default_currency || current?.defaultCurrency || 'GBP',
    showCoursePrices: input.show_course_prices !== undefined ? input.show_course_prices === true : (current?.showCoursePrices === true),
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return { ok: true as const, settings: publicWebsiteSettings(db.websiteSettings) };
}

export function submitContactEnquiry(input: {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  courseId?: string;
  courseName?: string;
  otherCourse?: string;
  message?: string;
  category?: string;
  specialism?: string;
  availability?: string;
  supportType?: string;
  cvFile?: string | null;
  attachments?: string[];
}) {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const email = input.email.trim().toLowerCase();
  const category: EnquiryCategory = input.category === 'career' || input.category === 'mentorship' || input.category === 'strategy' ? input.category : 'contact';
  const location = (input.location || (category === 'contact' || category === 'strategy' ? 'Online Session / Web Enquiry' : '')).trim();
  const courseName = (input.courseName || input.otherCourse || (category === 'career' ? 'Career enquiry' : category === 'mentorship' ? 'Mentorship enquiry' : category === 'strategy' ? 'Free Technical Career Strategy Call' : 'General Enquiry')).trim();
  const otherCourse = input.otherCourse?.trim();
  const message = input.message?.trim();
  const specialism = input.specialism?.trim();
  const availability = input.availability?.trim();
  const supportType = input.supportType?.trim();

  if (!fullName) return { ok: false as const, message: 'Please enter your full name.' };
  if (!email || !email.includes('@')) return { ok: false as const, message: 'Please enter a valid email address.' };
  if (category === 'career') {
    if (phone && digits(phone).length < 7) return { ok: false as const, message: 'Please enter a valid contact phone number.' };
    if (!location) return { ok: false as const, message: 'Please enter your location.' };
    if (!specialism) return { ok: false as const, message: 'Please choose a specialism.' };
    if (!availability) return { ok: false as const, message: 'Please choose your availability.' };
    if (!input.cvFile) return { ok: false as const, message: 'Please upload a CV as a PDF or Word file.' };
  } else if (!phone || digits(phone).length < 7) {
    return { ok: false as const, message: 'Please enter a valid contact phone number.' };
  }
  if (category === 'mentorship') {
    if (!supportType) return { ok: false as const, message: 'Please choose the type of support you need.' };
    if (!message) return { ok: false as const, message: 'Please describe your business plans or requirements.' };
  }

  const db = readDb();
  const enquiry: ContactEnquiryRecord = {
    id: `enq-${randomBytes(6).toString('hex')}`,
    createdAt: new Date().toISOString(),
    fullName,
    phone,
    email,
    location,
    courseId: input.courseId || undefined,
    courseName,
    otherCourse: otherCourse || undefined,
    message: message || undefined,
    status: 'new',
    category,
    specialism: specialism || undefined,
    availability: availability || undefined,
    supportType: supportType || undefined,
    cvFile: input.cvFile || null,
    attachments: input.attachments?.length ? input.attachments : undefined,
  };

  db.enquiries.unshift(enquiry);

  // Notify admins
  for (const admin of db.accounts.filter((item) => item.role === 'admin' && item.status === 'active')) {
    notify(db, admin.id, 'New Contact Enquiry', `${fullName} enquired about ${courseName} (${location}).`, '/admin#contacts');
  }

  writeDb(db);
  return { ok: true as const, enquiry };
}

export function listContactEnquiries(filters?: {
  query?: string;
  course?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}) {
  const db = readDb();
  let list = db.enquiries ?? [];

  if (filters?.query) {
    const q = filters.query.toLowerCase().trim();
    list = list.filter((item) =>
      item.fullName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phone.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.courseName.toLowerCase().includes(q) ||
      (item.otherCourse && item.otherCourse.toLowerCase().includes(q)) ||
      (item.message && item.message.toLowerCase().includes(q))
    );
  }

  if (filters?.course && filters.course !== 'all') {
    const c = filters.course.toLowerCase();
    list = list.filter((item) =>
      (item.courseId && item.courseId.toLowerCase() === c) ||
      item.courseName.toLowerCase().includes(c)
    );
  }

  if (filters?.status && filters.status !== 'all') {
    list = list.filter((item) => item.status === filters.status);
  }

  if (filters?.category && filters.category !== 'all') {
    const category = filters.category === 'career' || filters.category === 'mentorship' || filters.category === 'strategy' ? filters.category : 'contact';
    list = list.filter((item) => (item.category || 'contact') === category);
  }

  if (filters?.startDate) {
    list = list.filter((item) => item.createdAt >= filters.startDate!);
  }

  if (filters?.endDate) {
    const end = `${filters.endDate}T23:59:59.999Z`;
    list = list.filter((item) => item.createdAt <= end);
  }

  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getContactEnquiry(id: string) {
  const db = readDb();
  return db.enquiries.find((item) => item.id === id) ?? null;
}

export function updateContactEnquiryStatus(id: string, status: ContactEnquiryRecord['status']) {
  const db = readDb();
  const item = db.enquiries.find((e) => e.id === id);
  if (!item) return { ok: false as const, message: 'Enquiry not found.' };
  item.status = status;
  writeDb(db);
  return { ok: true as const, enquiry: item };
}

export function subscribeNewsletter(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@') || trimmed.length > 160) {
    return { ok: false as const, message: 'Enter a valid email address.' };
  }
  const db = readDb();
  const existing = db.newsletter.find((item) => item.email === trimmed);
  if (existing) {
    if (!existing.active) {
      existing.active = true;
      writeDb(db);
    }
    return { ok: true as const, message: 'You are subscribed to the newsletter.' };
  }
  db.newsletter.push({
    id: `sub-${randomBytes(4).toString('hex')}`,
    email: trimmed,
    createdAt: new Date().toISOString(),
    active: true,
  });
  writeDb(db);
  return { ok: true as const, message: 'Thank you for subscribing to our newsletter.' };
}

export function listNewsletterSubscribers() {
  const db = readDb();
  return db.newsletter ?? [];
}

export function listArticles(options?: { onlyPublished?: boolean; query?: string; category?: string }): ArticleRecord[] {
  const db = readDb();
  let list = [...(db.articles ?? [])];
  if (options?.onlyPublished) {
    list = list.filter((a) => a.published);
  }
  if (options?.category && options.category !== 'All') {
    list = list.filter((a) => a.category.toLowerCase() === options.category!.toLowerCase());
  }
  if (options?.query && options.query.trim()) {
    const q = options.query.trim().toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q)
    );
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getArticleBySlug(slug: string, options?: { allowDraft?: boolean }): ArticleRecord | null {
  const db = readDb();
  const article = (db.articles ?? []).find((a) => a.slug === slug || a.id === slug);
  if (!article) return null;
  if (!article.published && !options?.allowDraft) return null;
  return article;
}

export function saveArticle(input: ArticleDraft): { ok: boolean; article?: ArticleRecord; message?: string } {
  const db = readDb();
  const title = (input.title || '').trim();
  if (!title) return { ok: false, message: 'Article title is required.' };
  const content = (input.content || '').trim();
  if (!content) return { ok: false, message: 'Article content is required.' };

  const baseSlug = (input.slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `article-${randomBytes(2).toString('hex')}`;

  const taken = new Set((db.articles ?? []).filter((a) => a.id !== input.id).map((a) => a.slug));
  let slug = baseSlug;
  let suffix = 2;
  while (taken.has(slug)) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const now = new Date().toISOString();
  if (input.id) {
    const existing = (db.articles ?? []).find((a) => a.id === input.id);
    if (!existing) return { ok: false, message: 'Article not found.' };
    existing.title = title;
    existing.slug = slug;
    existing.excerpt = (input.excerpt || title).trim();
    existing.content = content;
    if (input.category) existing.category = input.category.trim();
    if (input.author) existing.author = input.author.trim();
    if (input.featuredImage !== undefined) existing.featuredImage = input.featuredImage.trim();
    if (input.published !== undefined) existing.published = Boolean(input.published);
    existing.updatedAt = now;
    writeDb(db);
    return { ok: true, article: existing };
  }

  const newArticle: ArticleRecord = {
    id: `art-${randomBytes(4).toString('hex')}`,
    title,
    slug,
    excerpt: (input.excerpt || title).trim(),
    content,
    category: (input.category || 'Technical Engineering').trim(),
    author: (input.author || 'Savvy Technical Faculty').trim(),
    featuredImage: (input.featuredImage || '/images/heroes/blogs-hero.jpg').trim(),
    published: input.published !== false,
    createdAt: now,
    updatedAt: now,
  };
  db.articles = db.articles ?? [];
  db.articles.push(newArticle);
  writeDb(db);
  return { ok: true, article: newArticle };
}

const PRIVATE_ROOT = path.join(DATA_DIR, 'private');

function fileMagicMatches(extension: string, bytes: Buffer) {
  if (bytes.length < 12) return false;
  if (extension === '.pdf') return bytes.subarray(0, 5).toString('latin1') === '%PDF-';
  if (extension === '.docx') return bytes[0] === 0x50 && bytes[1] === 0x4b;
  if (extension === '.doc') return bytes[0] === 0xd0 && bytes[1] === 0xcf;
  if (extension === '.png') return bytes[0] === 0x89 && bytes[1] === 0x50;
  if (extension === '.jpg' || extension === '.jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (extension === '.webp') return bytes.subarray(0, 4).toString('latin1') === 'RIFF' && bytes.subarray(8, 12).toString('latin1') === 'WEBP';
  return false;
}

export function savePrivateUpload(folder: 'cvs' | 'accreditation' | 'shop', id: string, originalName: string, bytes: Buffer) {
  const extension = path.extname(originalName).toLowerCase();
  const allowed = folder === 'cvs'
    ? ['.pdf', '.doc', '.docx']
    : ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp'];
  if (!allowed.includes(extension)) {
    return { ok: false as const, message: folder === 'cvs' ? 'Upload a PDF or Word CV.' : 'Upload a PDF, Word or image file.' };
  }
  if (bytes.length > 5 * 1024 * 1024) {
    return { ok: false as const, message: 'Each file must be 5 MB or smaller.' };
  }
  if (!fileMagicMatches(extension, bytes)) {
    return { ok: false as const, message: 'The file contents do not match its type.' };
  }
  const fileName = `${id}${extension}`;
  const directory = path.join(PRIVATE_ROOT, folder);
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, fileName), bytes);
  return { ok: true as const, fileName };
}

export function privateUploadPath(folder: 'cvs' | 'accreditation' | 'shop', fileName: string) {
  const base = path.basename(fileName);
  if (!base || base !== fileName) return null;
  const full = path.join(PRIVATE_ROOT, folder, base);
  return existsSync(full) ? full : null;
}

export function listShopProducts(includeUnpublished = false) {
  const db = readDb();
  return (db.shopProducts ?? []).filter((item) => includeUnpublished || item.published);
}

export function saveShopProduct(input: {
  id?: string;
  title: string;
  format?: string;
  includes?: string[];
  priceGbp?: number | null;
  published?: boolean;
  fileName?: string | null;
}) {
  const db = readDb();
  db.shopProducts ??= [];
  const title = input.title.trim();
  if (!title) return { ok: false as const, message: 'Enter a product title.' };
  const price = input.priceGbp == null || Number.isNaN(Number(input.priceGbp)) ? null : Number(input.priceGbp);
  if (price != null && price < 0) return { ok: false as const, message: 'Enter a price in pounds, or leave it blank.' };
  if (input.id) {
    const existing = db.shopProducts.find((item) => item.id === input.id);
    if (!existing) return { ok: false as const, message: 'That product was not found.' };
    existing.title = title;
    if (input.format !== undefined) existing.format = input.format.trim();
    if (input.includes) existing.includes = input.includes.map((item) => item.trim()).filter(Boolean);
    if (input.priceGbp !== undefined) existing.priceGbp = price;
    if (input.published !== undefined) existing.published = input.published;
    if (input.fileName !== undefined) existing.fileName = input.fileName;
    writeDb(db);
    return { ok: true as const, product: existing };
  }
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `product-${randomBytes(2).toString('hex')}`;
  let slug = base;
  let suffix = 2;
  while (db.shopProducts.some((item) => item.slug === slug)) slug = `${base}-${suffix++}`;
  const product: ShopProductRecord = {
    id: `shop-${randomBytes(4).toString('hex')}`,
    slug,
    title,
    format: input.format?.trim() || 'Download',
    includes: (input.includes ?? []).map((item) => item.trim()).filter(Boolean),
    priceGbp: price,
    published: input.published !== false,
    fileName: input.fileName ?? null,
    createdAt: new Date().toISOString(),
  };
  db.shopProducts.push(product);
  writeDb(db);
  return { ok: true as const, product };
}

export function deleteShopProduct(id: string) {
  const db = readDb();
  const before = db.shopProducts?.length ?? 0;
  db.shopProducts = (db.shopProducts ?? []).filter((item) => item.id !== id);
  if (db.shopProducts.length === before) return { ok: false as const, message: 'That product was not found.' };
  writeDb(db);
  return { ok: true as const };
}

export function listPublicReviews() {
  return (readDb().reviews ?? []).filter((item) => item.status === 'approved');
}

export function listReviewsForAdmin() {
  return [...(readDb().reviews ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function submitStudentReview(input: {
  courseId: string;
  courseTitle: string;
  authorId: string;
  authorName: string;
  rating: number;
  body: string;
}) {
  const body = input.body.trim();
  const rating = Math.round(input.rating);
  if (!input.courseId) return { ok: false as const, message: 'Choose a course.' };
  if (rating < 1 || rating > 5) return { ok: false as const, message: 'Choose a rating from 1 to 5.' };
  if (body.length < 12) return { ok: false as const, message: 'Write a short review of at least 12 characters.' };
  const db = readDb();
  db.reviews ??= [];
  const review: StudentReviewRecord = {
    id: `rev-${randomBytes(4).toString('hex')}`,
    courseId: input.courseId,
    courseTitle: input.courseTitle.trim() || 'Course',
    authorId: input.authorId,
    authorName: input.authorName,
    rating,
    body,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.reviews.unshift(review);
  writeDb(db);
  return { ok: true as const, review };
}

export function setReviewStatus(id: string, status: StudentReviewRecord['status']) {
  const db = readDb();
  const review = (db.reviews ?? []).find((item) => item.id === id);
  if (!review) return { ok: false as const, message: 'Review not found.' };
  review.status = status;
  writeDb(db);
  return { ok: true as const, review };
}

export function deleteReview(id: string) {
  const db = readDb();
  const before = db.reviews?.length ?? 0;
  db.reviews = (db.reviews ?? []).filter((item) => item.id !== id);
  if (db.reviews.length === before) return { ok: false as const, message: 'Review not found.' };
  writeDb(db);
  return { ok: true as const };
}

export function listHomepageFaqs() {
  return [...(readDb().homepageFaqs ?? [])];
}

export function saveHomepageFaqs(items: HomepageFaq[]) {
  const next: HomepageFaq[] = [];
  for (const item of items) {
    const question = item.question.trim();
    const answer = item.answer.trim();
    if (!question && !answer) continue;
    if (question.length < 8) return { ok: false as const, message: 'Each question needs at least a short sentence.' };
    if (answer.length < 20) return { ok: false as const, message: 'Each answer needs to explain the point in plain language.' };
    next.push({
      id: item.id?.trim() || `faq-${randomBytes(4).toString('hex')}`,
      question,
      answer,
    });
  }
  if (next.length > 20) return { ok: false as const, message: 'Keep the public FAQ list to 20 questions.' };
  const db = readDb();
  db.homepageFaqs = next;
  db.homepageFaqsSeeded = true;
  writeDb(db);
  return { ok: true as const, faqs: next };
}

export function listForumThreads(includeHidden = false) {
  return (readDb().threads ?? [])
    .filter((item) => includeHidden || (!item.hidden && item.pending !== true))
    .map((item) => ({
      ...item,
      replies: includeHidden ? item.replies : item.replies.filter((reply) => !reply.hidden && reply.approved !== false),
    }));
}

export function createForumThread(input: { title: string; body: string; authorId: string; authorName: string; category?: string }) {
  const title = input.title.trim();
  const body = input.body.trim();
  const authorName = input.authorName.trim();
  if (authorName.length < 2) return { ok: false as const, message: 'Enter your name.' };
  if (title.length < 4) return { ok: false as const, message: 'Enter a discussion title.' };
  if (body.length < 12) return { ok: false as const, message: 'Write a little more so other learners can reply.' };
  const db = readDb();
  db.threads ??= [];
  const initials = authorName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const thread: ForumThreadRecord = {
    id: `thread-${randomBytes(4).toString('hex')}`,
    title,
    body,
    category: input.category?.trim() || 'Community',
    initials,
    authorId: input.authorId,
    authorName,
    createdAt: new Date().toISOString(),
    hidden: false,
    pending: true,
    reported: false,
    replies: [],
  };
  db.threads.unshift(thread);
  writeDb(db);
  return { ok: true as const, thread };
}

export function replyToThread(input: { threadId: string; body: string; authorId: string; authorName: string }) {
  const body = input.body.trim();
  const authorName = input.authorName.trim();
  if (authorName.length < 2) return { ok: false as const, message: 'Enter your name.' };
  if (body.length < 2) return { ok: false as const, message: 'Write a reply.' };
  const db = readDb();
  const thread = (db.threads ?? []).find((item) => item.id === input.threadId && !item.hidden);
  if (!thread) return { ok: false as const, message: 'That discussion is not available.' };
  thread.replies.push({
    id: `reply-${randomBytes(4).toString('hex')}`,
    authorId: input.authorId,
    authorName,
    body,
    createdAt: new Date().toISOString(),
    hidden: false,
    approved: false,
  });
  writeDb(db);
  return { ok: true as const, thread };
}

export function deleteForumThread(id: string) {
  const db = readDb();
  const before = db.threads?.length ?? 0;
  db.threads = (db.threads ?? []).filter((item) => item.id !== id);
  if (db.threads.length === before) return { ok: false as const, message: 'Discussion not found.' };
  writeDb(db);
  return { ok: true as const };
}

export function setReplyApproval(threadId: string, replyId: string, approved: boolean) {
  const db = readDb();
  const reply = (db.threads ?? []).find((item) => item.id === threadId)?.replies.find((item) => item.id === replyId);
  if (!reply) return { ok: false as const, message: 'Reply not found.' };
  reply.approved = approved;
  reply.hidden = !approved;
  writeDb(db);
  return { ok: true as const };
}

function validPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 && /^[+0-9()\-\s]+$/.test(value);
}

export function submitGuestFeedback(input: { name: string; phone: string; body: string; courseTitle?: string; rating?: number }) {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const body = input.body.trim();
  const courseTitle = input.courseTitle?.trim() || '';
  const rating = Number(input.rating);
  if (name.length < 2) return { ok: false as const, message: 'Enter your name.' };
  if (!validPhone(phone)) return { ok: false as const, message: 'Enter a valid phone number.' };
  if (body.length < 12) return { ok: false as const, message: 'Write at least a short note of feedback.' };
  if (courseTitle && !websiteCourses().some((course) => course.title === courseTitle)) {
    return { ok: false as const, message: 'Choose a published course.' };
  }
  const hasRating = input.rating !== undefined && input.rating !== null && !Number.isNaN(rating);
  if (hasRating && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return { ok: false as const, message: 'Choose a rating from 1 to 5.' };
  }
  const db = readDb();
  db.guestFeedback ??= [];
  const feedback: GuestFeedbackRecord = {
    id: `fb-${randomBytes(4).toString('hex')}`,
    name,
    phone,
    body,
    ...(courseTitle ? { courseTitle } : {}),
    ...(Number.isInteger(rating) && rating >= 1 && rating <= 5 ? { rating } : {}),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.guestFeedback.unshift(feedback);
  writeDb(db);
  return { ok: true as const };
}

export function listPublicFeedback() {
  return (readDb().guestFeedback ?? [])
    .filter((item) => item.status === 'approved')
    .map(({ phone: _phone, ...item }) => item);
}

export function listFeedbackForAdmin() {
  return [...(readDb().guestFeedback ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function setFeedbackStatus(id: string, status: GuestFeedbackRecord['status']) {
  const db = readDb();
  const item = (db.guestFeedback ?? []).find((row) => row.id === id);
  if (!item) return { ok: false as const, message: 'Feedback not found.' };
  item.status = status;
  writeDb(db);
  return { ok: true as const };
}

export function deleteGuestFeedback(id: string) {
  const db = readDb();
  const before = db.guestFeedback?.length ?? 0;
  db.guestFeedback = (db.guestFeedback ?? []).filter((item) => item.id !== id);
  if (db.guestFeedback.length === before) return { ok: false as const, message: 'Feedback not found.' };
  writeDb(db);
  return { ok: true as const };
}

export function listPortalItems(includeHidden = false) {
  return (readDb().portalItems ?? [])
    .filter((item) => includeHidden || item.published)
    .sort((a, b) => (a.startsAt || a.createdAt).localeCompare(b.startsAt || b.createdAt));
}

export function savePortalItem(input: Partial<PortalItemRecord> & { title?: string }) {
  const title = String(input.title || '').trim();
  const detail = String(input.detail || '').trim();
  if (title.length < 2) return { ok: false as const, message: 'Enter a title.' };
  const db = readDb();
  db.portalItems ??= [];
  const kind = input.kind === 'zoom' || input.kind === 'schedule' || input.kind === 'update' ? input.kind : 'info';
  if (input.id) {
    const current = db.portalItems.find((item) => item.id === input.id);
    if (!current) return { ok: false as const, message: 'That portal item was not found.' };
    current.title = title;
    current.detail = detail;
    current.kind = kind;
    current.zoomUrl = String(input.zoomUrl || '').trim();
    current.startsAt = String(input.startsAt || '').trim();
    current.published = input.published !== false;
    writeDb(db);
    return { ok: true as const, item: current };
  }
  const item: PortalItemRecord = {
    id: `portal-${randomBytes(4).toString('hex')}`,
    kind,
    title,
    detail,
    zoomUrl: String(input.zoomUrl || '').trim(),
    startsAt: String(input.startsAt || '').trim(),
    published: input.published !== false,
    createdAt: new Date().toISOString(),
  };
  db.portalItems.push(item);
  writeDb(db);
  return { ok: true as const, item };
}

export function deletePortalItem(id: string) {
  const db = readDb();
  const before = db.portalItems?.length ?? 0;
  db.portalItems = (db.portalItems ?? []).filter((item) => item.id !== id);
  if (db.portalItems.length === before) return { ok: false as const, message: 'That portal item was not found.' };
  writeDb(db);
  return { ok: true as const };
}

export function moderateThread(id: string, action: 'hide' | 'report' | 'restore') {
  const db = readDb();
  const thread = (db.threads ?? []).find((item) => item.id === id);
  if (!thread) return { ok: false as const, message: 'Discussion not found.' };
  if (action === 'hide') thread.hidden = true;
  if (action === 'restore') {
    thread.hidden = false;
    thread.reported = false;
  }
  if (action === 'report') thread.reported = true;
  writeDb(db);
  return { ok: true as const, thread };
}

export function deleteArticle(id: string): { ok: boolean; message?: string } {
  const db = readDb();
  const initialLength = (db.articles ?? []).length;
  db.articles = (db.articles ?? []).filter((a) => a.id !== id && a.slug !== id);
  if (db.articles.length === initialLength) {
    return { ok: false, message: 'Article not found.' };
  }
  writeDb(db);
  return { ok: true, message: 'Article deleted successfully.' };
}

