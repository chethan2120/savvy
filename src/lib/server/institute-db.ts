import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { coursesData } from '@/lib/data';

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
  updatedAt: string | null;
};

type Database = {
  accounts: InstituteAccount[];
  enrollments: Enrollment[];
  logins: LoginEvent[];
  punches: PunchRecord[];
  categories: CourseCategory[];
  customCourses: CustomCourse[];
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
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'institute-db.json');
const SECRET_PATH = path.join(DATA_DIR, 'session-secret');
let memoryDb: Database | null = null;
let memorySecret: string | null = null;
export const SESSION_COOKIE = 'savvy_session';
export const INSTITUTE_TZ = 'Asia/Kolkata';

const PROGRAM_IDS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];

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
  };
}

function normaliseDb(parsed: Database) {
  parsed.accounts ??= [];
  parsed.enrollments ??= [];
  parsed.logins ??= [];
  parsed.punches ??= [];
  parsed.categories ??= [];
  parsed.customCourses ??= [];
  parsed.courseCategories ??= {};
  parsed.marks ??= [];
  parsed.notifications ??= [];
  parsed.announcements ??= [];
  parsed.leaveRequests ??= [];
  parsed.chapters ??= [];
  parsed.instructors ??= [];
  parsed.certificates ??= [];
  parsed.branding ??= {};
  parsed.studentAccess ??= { ...DEFAULT_STUDENT_ACCESS };
  return parsed;
}

function readDb(): Database {
  if (memoryDb) return memoryDb;
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(DB_PATH)) {
      const seeded = emptyDatabase();
      writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2));
      memoryDb = seeded;
      return seeded;
    }
    memoryDb = normaliseDb(JSON.parse(readFileSync(DB_PATH, 'utf8')) as Database);
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
  };
}

function writeDb(db: Database) {
  memoryDb = db;
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
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
    permissions: account.role === 'staff' ? { ...DEFAULT_STAFF_PERMISSIONS, ...account.permissions } : undefined,
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

export function listAccounts() {
  return readDb().accounts
    .filter((account) => account.registrationStatus !== 'pending' && account.registrationStatus !== 'rejected')
    .map(publicAccount);
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
  };
  db.accounts.push(account);
  if (input.courseId && PROGRAM_IDS.includes(input.courseId)) {
    db.enrollments.push({
      id: `enr-${randomBytes(4).toString('hex')}`,
      accountId: account.id,
      courseId: input.courseId,
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
}) {
  const db = readDb();
  const account = db.accounts.find((item) => item.id === id);
  if (!account || account.role === 'admin') return { ok: false as const, message: 'That account cannot be edited here.' };
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
  if (patch.status) account.status = patch.status;
  if (patch.password) {
    const secret = hashPassword(patch.password);
    account.passwordHash = secret.passwordHash;
    account.passwordSalt = secret.passwordSalt;
  }
  writeDb(db);
  return { ok: true as const, account: publicAccount(account) };
}

export function allCourses() {
  const db = readDb();
  const published = coursesData.filter((course) => PROGRAM_IDS.includes(course.id)).map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    duration: course.duration,
    description: course.short_description ?? '',
    image: course.featured_image,
    href: `/course/${course.slug}`,
    active: true,
    custom: false,
  }));
  const custom = db.customCourses.filter((course) => course.active).map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    duration: course.duration,
    description: course.description,
    image: '/images/course/ndt-level-2-course.png',
    href: `/course/${course.slug}`,
    active: course.active,
    custom: true,
    categoryId: course.categoryId,
  }));
  return [...published, ...custom].map((course) => {
    const categoryId = ('categoryId' in course && course.categoryId) || db.courseCategories[course.id] || '';
    const category = db.categories.find((item) => item.id === categoryId);
    return {
      ...course,
      categoryId,
      categoryName: category?.name || 'Uncategorised',
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
  if (db.studentAccess?.requestEnrolment === false) return { ok: false as const, message: 'Enrolment requests are closed.' };
  const student = db.accounts.find((item) => item.id === accountId);
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
  if (existing) {
    existing.status = 'enrolled';
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
      };
    })
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

export function overviewCounts() {
  const db = readDb();
  const courses = allCourses();
  return {
    students: db.accounts.filter((account) => account.role === 'student').length,
    staff: db.accounts.filter((account) => account.role === 'staff').length,
    courses: courses.length,
    pendingRequests: db.enrollments.filter((row) => row.status === 'requested').length,
    enrolments: db.enrollments.filter((row) => row.status === 'enrolled' && db.accounts.find((account) => account.id === row.accountId)?.role === 'student').length,
  };
}

export function listCategories() {
  const db = readDb();
  return db.categories.map((category) => ({
    ...category,
    courseCount: allCourses().filter((course) => course.categoryId === category.id).length,
  }));
}

export function saveCategory(input: { id?: string; name: string; description?: string; active?: boolean }) {
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
    writeDb(db);
    return { ok: true as const, category };
  }
  const category: CourseCategory = {
    id: `cat-${randomBytes(4).toString('hex')}`,
    name,
    description: input.description?.trim() ?? '',
    active: input.active !== false,
    createdAt: new Date().toISOString(),
  };
  db.categories.push(category);
  writeDb(db);
  return { ok: true as const, category };
}

export function createCustomCourse(input: { title: string; duration: string; description?: string; categoryId: string }) {
  const db = readDb();
  const title = input.title.trim();
  if (!title) return { ok: false as const, message: 'Enter a course name.' };
  const category = db.categories.find((item) => item.id === input.categoryId && item.active);
  if (!category) return { ok: false as const, message: 'Choose an active category.' };
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `course-${randomBytes(2).toString('hex')}`;
  const course: CustomCourse = {
    id: `course-${randomBytes(4).toString('hex')}`,
    title,
    slug,
    duration: input.duration.trim() || 'Not set',
    description: input.description?.trim() ?? '',
    categoryId: category.id,
    active: true,
    createdAt: new Date().toISOString(),
  };
  db.customCourses.push(course);
  db.courseCategories[course.id] = category.id;
  writeDb(db);
  return { ok: true as const, course };
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

export function savePermissions(accountId: string, permissions: StaffPermissions) {
  const db = readDb();
  const account = db.accounts.find((item) => item.id === accountId && item.role === 'staff');
  if (!account) return { ok: false as const, message: 'Choose a staff account.' };
  account.permissions = { ...DEFAULT_STAFF_PERMISSIONS, ...account.permissions, ...permissions };
  writeDb(db);
  return { ok: true as const, account: publicAccount(account) };
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
  return db.studentAccess.viewAvailableCourses || db.studentAccess.viewEnrolledCourses;
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
    .filter((chapter) => viewer.role !== 'student' || (enrolled && db.studentAccess.viewChapters && chapter.status === 'published'))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
  const hourValues = db.chapters.filter((chapter) => chapter.courseId === courseId && chapter.status !== 'archived' && chapter.studyHours != null).map((chapter) => chapter.studyHours as number);
  const instructors = db.instructors
    .filter((row) => row.courseId === courseId)
    .map((row) => db.accounts.find((account) => account.id === row.accountId))
    .filter((account): account is InstituteAccount => Boolean(account))
    .map((account) => ({ id: account.id, fullName: account.fullName }));
  const enrolledStudents = db.enrollments.filter((row) => row.courseId === courseId && row.status === 'enrolled' && db.accounts.find((account) => account.id === row.accountId)?.role === 'student');
  const manage = viewer.role === 'admin' || (viewer.role === 'staff' && (staffAllows(viewer, 'viewEnrolledStudents') || staffAllows(viewer, 'viewStudents')));
  return {
    ok: true as const,
    course,
    chapters: chapters.map((chapter) => viewer.role === 'student' && !db.studentAccess.viewMaterials
      ? { ...chapter, content: '', objectives: '' }
      : chapter),
    instructors,
    chapterCount: db.chapters.filter((chapter) => chapter.courseId === courseId && chapter.status !== 'archived' && (viewer.role !== 'student' || chapter.status === 'published')).length,
    studyHours: hourValues.length ? hourValues.reduce((sum, hours) => sum + hours, 0) : null,
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

export function saveWebsiteSettings(input: { show_recognitions: boolean; institute_name: string }) {
  const instituteName = input.institute_name.trim();
  if (!instituteName || instituteName.length > 120) {
    return { ok: false as const, message: 'Enter an institute name of 120 characters or fewer.' };
  }
  const db = readDb();
  db.websiteSettings = {
    showRecognitions: input.show_recognitions === true,
    instituteName,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return { ok: true as const, settings: publicWebsiteSettings(db.websiteSettings) };
}
