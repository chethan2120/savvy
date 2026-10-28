'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { blogPostsData } from '@/lib/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { supabaseTablesReady } from '@/lib/supabase-schema';
import { resolveRole, signOutPortal } from '@/lib/portal-auth';
import { friendlyError } from '@/lib/friendly-error';
import { classifyVideoSource, videoSourceLabel } from '@/lib/video-source';
import type { Certificate, CourseMaterial, MaterialVisibility, StudentProfile } from '@/lib/types';
import type { LmsSection } from '@/components/lms/AdminModules';
const AdminLms = dynamic(() => import('@/components/lms/AdminModules').then((mod) => mod.AdminLms), { ssr: false });
const AdminSummary = dynamic(() => import('@/components/lms/AdminModules').then((mod) => mod.AdminSummary), { ssr: false });
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AccountProfile, AttendanceDesk, CertifiedPrograms, UserManagement } from '@/components/dashboard/InstitutePanels';
import { AccountSettingsHub, AttendanceRegister, CourseDesk, EnrollmentQueue, PeopleDirectory } from '@/components/dashboard/Operations';
import { RegistrationRequests } from '@/components/dashboard/RegistrationRequests';
import { CertificateDesk } from '@/components/dashboard/Learning';
import { NoteBody, VideoPreview } from '@/components/portal/MaterialViewer';
import {
  Panel, StatTile, Input, Textarea, Select, Feedback, Empty,
  VisibilityBadge, visibilityLabel, visibilityHint,
} from '@/components/portal/ui';
import {
  ShieldCheck, BookOpen, FileText, Mail, Users, Loader2, Award, PlayCircle, Plus,
  UploadCloud, GraduationCap, KeyRound, Pencil, Trash2, Search, X, Copy, Check,
  ImageIcon, FileDown, ExternalLink,
} from 'lucide-react';

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city?: string;
  qualification?: string;
  selected_course: string;
  preferred_mode: string;
  message?: string;
  status?: string;
  student_id?: string | null;
  photo_path?: string | null;
  marksheet_path?: string | null;
  created_at: string;
};

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course_applied: string;
  message: string;
  created_at: string;
};

type CourseRow = { id: string; title: string; slug: string; start_date?: string | null; end_date?: string | null };
type EnrollmentRow = {
  id: string;
  student_id: string;
  course_id: string;
  status: string;
  students?: { full_name: string; enrollment_no: string };
  courses?: { title: string };
};

type AdminTab = 'overview' | 'accounts' | 'registrations' | 'programs' | 'profile' | 'applications' | 'contacts' | 'students' | 'materials' | 'certificates' | 'blogs' | LmsSection;

const ADMIN_TABS: AdminTab[] = [
  'overview', 'accounts', 'registrations', 'programs', 'applications', 'contacts', 'students', 'approvals', 'staff', 'courseAdmin',
  'materials', 'attendance', 'certificates', 'settings', 'reports', 'audit', 'blogs', 'profile',
];

const isAdminTab = (v: string): v is AdminTab => (ADMIN_TABS as string[]).includes(v);

function Unavailable({ module }: { module: string }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 text-sm">
      <h2 className="text-lg font-semibold">{module}</h2>
      <p className="mt-2 text-muted-foreground">{module} is not available from this dashboard yet. Student, staff, course, and enrolment records remain available in their own sections.</p>
    </section>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const mainRef = useRef<HTMLElement>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [schemaReady, setSchemaReady] = useState<boolean | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [registrationPending, setRegistrationPending] = useState(0);

  // A student session must not open the admin shell, and an admin session
  // arriving from the student portal must not be signed out — resolve the role
  // and render only for an actual administrator.
  useEffect(() => {
    resolveRole().then((role) => {
      setAuthed(role === 'admin');
      setChecking(false);
    });
  }, []);

  const loadData = useCallback(async () => {
    const ready = isSupabaseConfigured && await supabaseTablesReady();
    setSchemaReady(ready);
    if (!ready) return;
    setLoadingData(true);
    const [apps, msgs, crs, stu, enr, mat, cert] = await Promise.all([
      supabase.from('admission_applications').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('id, title, slug, start_date, end_date').order('sort_order'),
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('enrollments').select('id, student_id, course_id, status, students(full_name, enrollment_no), courses(title)'),
      supabase.from('course_materials').select('*').order('sort_order', { ascending: true }),
      supabase.from('certificates').select('*').order('issue_date', { ascending: false }),
    ]);
    setApplications((apps.data as Application[]) ?? []);
    setContacts((msgs.data as Contact[]) ?? []);
    setCourses((crs.data as CourseRow[]) ?? []);
    setStudents((stu.data as StudentProfile[]) ?? []);
    setEnrollments((enr.data as unknown as EnrollmentRow[]) ?? []);
    setMaterials((mat.data as CourseMaterial[]) ?? []);
    setCertificates((cert.data as Certificate[]) ?? []);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  useEffect(() => {
    if (!authed) return;
    fetch('/api/workspace?resource=overview', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => { if (body) setPendingCount(body.pendingRequests ?? 0); })
      .catch(() => undefined);
    fetch('/api/registrations', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => { if (body) setRegistrationPending(body.pending ?? 0); })
      .catch(() => undefined);
  }, [authed, activeTab]);

  // Each section is addressable as /admin#students, so a tab survives a reload
  // and the browser Back button steps between sections. Previously the tab was
  // component state only: the URL never moved, and on a narrow screen the panel
  // it switched to was below the fold — clicking a tab looked like nothing had
  // happened at all.
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (isAdminTab(hash)) setActiveTab(hash);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const selectTab = useCallback((key: AdminTab) => {
    setActiveTab(key);
    if (window.location.hash !== `#${key}`) {
      window.history.pushState(null, '', `#${key}`);
    }
    // Bring the panel into view — on the horizontal rail (mobile/tablet) the
    // content it switched to starts below the visible area.
    requestAnimationFrame(() => {
      mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleLogout = async () => {
    await signOutPortal();
    window.location.replace('/login');
  };

  useEffect(() => {
    if (!checking && !authed) window.location.replace('/login?role=admin');
  }, [checking, authed]);

  if (checking) {
    return (
      <div className="account-theme min-h-screen flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking your session
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="account-theme min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Redirecting to sign in
      </div>
    );
  }

  const nav: { key: AdminTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'accounts', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { key: 'registrations', label: 'Registration Requests', icon: <Users className="w-4 h-4" />, count: registrationPending },
    { key: 'programs', label: 'Certified Programs', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'applications', label: 'Applications', icon: <Users className="w-4 h-4" />, count: pendingCount },
    { key: 'contacts', label: 'Messages', icon: <Mail className="w-4 h-4" />, count: contacts.length },
    { key: 'students', label: 'Enrolments', icon: <GraduationCap className="w-4 h-4" />, count: students.length },
    { key: 'approvals', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { key: 'staff', label: 'Staff', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'courseAdmin', label: 'Courses', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'materials', label: 'Course material', icon: <BookOpen className="w-4 h-4" />, count: materials.length },
    { key: 'attendance', label: 'Attendance', icon: <Users className="w-4 h-4" /> },
    { key: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
    { key: 'settings', label: 'Account Settings', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { key: 'audit', label: 'Audit Logs', icon: <FileText className="w-4 h-4" /> },
    { key: 'blogs', label: 'Articles', icon: <FileText className="w-4 h-4" />, count: blogPostsData.length },
  ];

  const pending = applications.filter((a) => !a.student_id).length;

  return (
    <div className="account-theme admin-dashboard flex min-h-screen flex-col pb-20">
      <DashboardHeader
        role="admin"
        onLogout={handleLogout}
        onProfile={() => selectTab('profile')}
        onSettings={() => selectTab('settings')}
      />

      <div className="site-container grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 pt-8">
        {/* Rail: one list, always visible, so counts double as the workload view. */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible lg:sticky lg:top-24 lg:self-start pb-2">
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => selectTab(item.key)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === item.key
                  ? 'bg-forest text-white'
                  : 'text-foreground hover:bg-surface border border-transparent hover:border-border'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {typeof item.count === 'number' && (
                <span className={`tabular-nums ${activeTab === item.key ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <main ref={mainRef} className="flex flex-col gap-6 min-w-0 scroll-mt-6">
          {loadingData && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading records
            </div>
          )}

          {activeTab === 'overview' && !loadingData && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile label="Applications" value={applications.length} hint={`${pending} without a login`} onClick={() => selectTab('applications')} />
                <StatTile label="Students" value={students.length} hint={`${enrollments.length} enrolments`} onClick={() => selectTab('students')} />
                <StatTile label="Material" value={materials.length} hint={`${materials.filter((m) => m.type === 'video').length} videos`} onClick={() => selectTab('materials')} />
                <StatTile label="Certificates" value={certificates.length} onClick={() => selectTab('certificates')} />
              </div>
              <Panel title="What needs you" subtitle="Applications waiting for a student login.">
                {pending === 0 ? (
                  <Empty label="Every application has a login." hint="New applications appear here as soon as they are submitted." />
                ) : (
                  <div className="flex flex-col gap-2">
                    {applications.filter((a) => !a.student_id).slice(0, 5).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => selectTab('applications')}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-background hover:border-forest text-left transition-colors"
                      >
                        <span className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate">{a.full_name}</span>
                          <span className="text-[11px] text-muted-foreground truncate">{a.selected_course} · {a.email}</span>
                        </span>
                        <span className="text-[11px] text-forest shrink-0">Create login</span>
                      </button>
                    ))}
                  </div>
                )}
              </Panel>
              <AdminSummary />
            </div>
          )}

          {activeTab === 'accounts' && <UserManagement />}
          {activeTab === 'registrations' && <RegistrationRequests onPending={setRegistrationPending} />}
          {activeTab === 'programs' && <CertifiedPrograms mode="admin" />}
          {activeTab === 'applications' && <EnrollmentQueue />}

          {activeTab === 'contacts' && schemaReady === false && <Unavailable module="Messages" />}
          {activeTab === 'contacts' && schemaReady && !loadingData && <ContactsPanel contacts={contacts} />}

          {activeTab === 'students' && schemaReady === false && <Unavailable module="Enrolments" />}
          {activeTab === 'students' && schemaReady && !loadingData && (
            <StudentsPanel students={students} courses={courses} enrollments={enrollments} onChange={loadData} />
          )}

          {activeTab === 'materials' && schemaReady === false && <Unavailable module="Course material" />}
          {activeTab === 'materials' && schemaReady && !loadingData && (
            <MaterialsPanel materials={materials} courses={courses} onChange={loadData} />
          )}

          {activeTab === 'certificates' && <CertificateDesk />}

          {activeTab === 'attendance' && (
            <div className="flex flex-col gap-4">
              <AttendanceDesk />
              <AttendanceRegister />
            </div>
          )}

          {activeTab === 'approvals' && <PeopleDirectory role="student" />}
          {activeTab === 'staff' && <PeopleDirectory role="staff" />}
          {activeTab === 'courseAdmin' && <CourseDesk />}
          {activeTab === 'settings' && <AccountSettingsHub />}
          {activeTab === 'profile' && <AccountProfile />}

          {['reports', 'audit'].includes(activeTab) && (
            <AdminLms section={activeTab as LmsSection} />
          )}

          {activeTab === 'blogs' && (
            <Panel title="Published articles" subtitle="Blog content ships with the site build.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {blogPostsData.map((post) => (
                  <div key={post.id} className="border border-border rounded-xl p-4 bg-background flex items-center justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-foreground truncate">{post.title}</span>
                      <span className="text-xs text-muted-foreground">{post.category_name} · {post.published_at}</span>
                    </div>
                    <span className="text-[11px] bg-periwinkle/40 text-foreground font-medium px-2.5 py-1 rounded-full shrink-0">
                      Published
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Applications — the entry point for creating a student login
// ---------------------------------------------------------------------------
function ApplicationsPanel({
  applications, courses, onChange,
}: {
  applications: Application[]; courses: CourseRow[]; onChange: () => void;
}) {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<Application | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((a) =>
      [a.full_name, a.email, a.phone, a.selected_course].some((v) => (v ?? '').toLowerCase().includes(q)),
    );
  }, [applications, query]);

  return (
    <>
      <Panel
        title="Admission applications"
        subtitle="Create the student's login from their application — the account, enrolment and material access are set up together."
        action={<SearchBox value={query} onChange={setQuery} placeholder="Name, email, course" />}
      >
        {rows.length === 0 ? (
          <Empty label="No applications match." hint="Applications submitted from the admission form land here." />
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((a) => (
              <div key={a.id} className="border border-border rounded-xl p-4 bg-background flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{a.full_name}</span>
                  <span className="text-xs text-muted-foreground">{a.email} · {a.phone}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="text-forest font-medium">{a.selected_course}</span>
                    <span>{a.preferred_mode}</span>
                    {a.city && <span>{a.city}</span>}
                    {a.qualification && <span>{a.qualification}</span>}
                    <span>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  {a.message && <p className="text-[11px] text-muted-foreground max-w-xl">{a.message}</p>}
                  <ApplicationDocuments application={a} />
                </div>
                {a.student_id ? (
                  <span className="text-[11px] bg-forest/10 text-forest font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                    <Check className="w-3.5 h-3.5" /> Login created
                  </span>
                ) : (
                  <button onClick={() => setTarget(a)} className="pill-button-forest text-xs py-2 px-4 flex items-center gap-1.5 shrink-0">
                    <KeyRound className="w-3.5 h-3.5" /> Create login
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {target && (
        <CreateLoginDialog
          application={target}
          courses={courses}
          onClose={() => setTarget(null)}
          onCreated={() => {
            setTarget(null);
            onChange();
          }}
        />
      )}
    </>
  );
}

/**
 * The photo and marksheet an applicant attached.
 *
 * They live in the private "admissions-files" bucket, so the admin panel has to
 * mint a short-lived signed URL for each one — the raw storage path the row
 * carries is not a URL, which is why the panel used to show nothing at all for
 * applications that did have files.
 */
function ApplicationDocuments({ application }: { application: Application }) {
  const files = useMemo(
    () =>
      [
        { label: 'Student photo', path: application.photo_path, kind: 'photo' as const },
        { label: 'Marksheet', path: application.marksheet_path, kind: 'document' as const },
      ].filter((f): f is { label: string; path: string; kind: 'photo' | 'document' } => Boolean(f.path)),
    [application.photo_path, application.marksheet_path],
  );

  const [urls, setUrls] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');

  useEffect(() => {
    if (files.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        files.map(async (f) => {
          const { data, error } = await supabase.storage
            .from('admissions-files')
            .createSignedUrl(f.path, 900);
          if (error || !data?.signedUrl) {
            if (!cancelled) setErr(friendlyError(error, 'file'));
            return null;
          }
          return [f.path, data.signedUrl] as const;
        }),
      );
      if (cancelled) return;
      setUrls(Object.fromEntries(entries.filter((e): e is readonly [string, string] => e !== null)));
    })();
    return () => { cancelled = true; };
  }, [files]);

  if (files.length === 0) {
    return (
      <span className="text-[11px] text-muted-foreground mt-1">No photo or marksheet was attached.</span>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex flex-wrap gap-3">
        {files.map((f) => {
          const url = urls[f.path];
          const isImage = /\.(png|jpe?g|webp|gif|avif)$/i.test(f.path);
          return (
            <a
              key={f.path}
              href={url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!url}
              onClick={(e) => { if (!url) e.preventDefault(); }}
              className={`flex items-center gap-2 border border-border rounded-lg p-2 bg-surface transition-colors ${
                url ? 'hover:border-forest' : 'opacity-60 cursor-default'
              }`}
            >
              {isImage && url ? (
                // Signed storage URLs are not a configured next/image host, so
                // this stays a plain <img>.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={f.label} className="w-16 h-16 object-cover rounded-md bg-background" />
              ) : (
                <span className="w-16 h-16 grid place-items-center rounded-md bg-background text-muted-foreground">
                  {isImage ? <ImageIcon className="w-5 h-5" /> : <FileDown className="w-5 h-5" />}
                </span>
              )}
              <span className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-foreground">{f.label}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {url ? <>Open <ExternalLink className="w-3 h-3" /></> : 'Loading'}
                </span>
              </span>
            </a>
          );
        })}
      </div>
      {err && <span className="text-[11px] text-red-700">{err}</span>}
    </div>
  );
}

/**
 * Creates the auth account, the student profile and the enrolments in one
 * call. Enrolment is what unlocks the course notes and videos, so the applied
 * course is pre-selected — the new student signs in to a portal that already
 * has their material in it.
 */
function CreateLoginDialog({
  application, courses, onClose, onCreated,
}: {
  application: Application; courses: CourseRow[]; onClose: () => void; onCreated: () => void;
}) {
  const [fullName, setFullName] = useState(application.full_name);
  const [email, setEmail] = useState(application.email);
  const [phone, setPhone] = useState(application.phone ?? '');
  const [password, setPassword] = useState(() => suggestPassword());
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [selected, setSelected] = useState<string[]>(() => {
    const match = courses.find((c) => c.title.toLowerCase() === application.selected_course?.toLowerCase());
    return match ? [match.id] : [];
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [created, setCreated] = useState<{ enrollment_no: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!fullName.trim() || !email.trim()) { setErr('Name and email are required.'); return; }
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc('admin_create_student', {
      p_full_name: fullName.trim(),
      p_email: email.trim(),
      p_password: password,
      p_phone: phone.trim() || null,
      p_enrollment_no: enrollmentNo.trim() || null,
      p_course_ids: selected,
      p_application_id: application.id,
    });
    setBusy(false);
    if (error) { setErr(friendlyError(error, 'student login')); return; }
    const row = Array.isArray(data) ? data[0] : data;
    setCreated({ enrollment_no: row?.created_enrollment_no ?? '' });
  };

  const copyDetails = async () => {
    await navigator.clipboard.writeText(
      `Savvy Training Institute — student portal\nSign in: ${window.location.origin}/student\nEmail: ${email}\nPassword: ${password}\nEnrolment ID: ${created?.enrollment_no ?? ''}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog title={created ? 'Login created' : 'Create student login'} onClose={created ? onCreated : onClose}>
      {created ? (
        <div className="flex flex-col gap-4">
          <Feedback msg={`${fullName} can now sign in at /student. Their enrolled course material is already available.`} />
          <dl className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs border border-border rounded-xl p-4 bg-background">
            <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium text-foreground break-all">{email}</dd></div>
            <div><dt className="text-muted-foreground">Password</dt><dd className="font-medium text-foreground">{password}</dd></div>
            <div><dt className="text-muted-foreground">Enrolment ID</dt><dd className="font-medium text-foreground">{created.enrollment_no}</dd></div>
            <div><dt className="text-muted-foreground">Courses</dt><dd className="font-medium text-foreground">{selected.length}</dd></div>
          </dl>
          <p className="text-[11px] text-muted-foreground">
            This password is shown once. Copy it now and send it to the student.
          </p>
          <div className="flex gap-2">
            <button onClick={copyDetails} className="pill-button-forest text-xs py-2.5 px-5 flex items-center gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy sign-in details'}
            </button>
            <button onClick={onCreated} className="pill-button-secondary text-xs py-2.5 px-5">Done</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Full name" value={fullName} onChange={setFullName} />
            <Input label="Email" value={email} onChange={setEmail} type="email" />
            <Input label="Phone" value={phone} onChange={setPhone} placeholder="+91…" />
            <Input label="Enrolment ID" value={enrollmentNo} onChange={setEnrollmentNo} placeholder="Auto-generated if blank" />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="Temporary password" value={password} onChange={setPassword} />
            </div>
            <button
              type="button"
              onClick={() => setPassword(suggestPassword())}
              className="pill-button-secondary text-xs py-2.5 px-4 shrink-0"
            >
              New password
            </button>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold text-foreground mb-1">Enrol in</legend>
            <p className="text-[11px] text-muted-foreground -mt-1 mb-1">
              Enrolment is what unlocks a course&apos;s notes and videos for this student.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {courses.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selected.includes(c.id) ? 'border-forest bg-forest/5 text-foreground' : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} className="accent-[color:var(--forest)]" />
                  {c.title}
                </label>
              ))}
            </div>
          </fieldset>

          <Feedback err={err} />
          <div className="flex gap-2">
            <button disabled={busy} className="pill-button-forest text-xs py-2.5 px-5 flex items-center gap-1.5">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Create login
            </button>
            <button type="button" onClick={onClose} className="pill-button-secondary text-xs py-2.5 px-5">Cancel</button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

function suggestPassword() {
  const words = ['Weld', 'Probe', 'Gauge', 'Flux', 'Beam', 'Radio', 'Torque', 'Vector'];
  const w = words[Math.floor(Math.random() * words.length)];
  return `${w}@${Math.floor(1000 + Math.random() * 9000)}`;
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------
function ContactsPanel({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState('');
  const rows = contacts.filter((c) =>
    [c.name, c.email, c.phone, c.course_applied, c.message]
      .some((v) => (v ?? '').toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <Panel
      title="Enquiries"
      subtitle="Messages from the contact form."
      action={<SearchBox value={query} onChange={setQuery} placeholder="Name, email, message" />}
    >
      {rows.length === 0 ? (
        <Empty label="No messages match." />
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((c) => (
            <div key={c.id} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{c.name}</span>
                <span className="text-[11px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <span className="text-xs text-muted-foreground">{c.email} · {c.phone}</span>
              {c.course_applied && <span className="text-[11px] text-forest font-medium">{c.course_applied}</span>}
              <p className="text-xs text-foreground leading-relaxed">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Students & enrolments
// ---------------------------------------------------------------------------
function StudentsPanel({
  students, courses, enrollments, onChange,
}: {
  students: StudentProfile[]; courses: CourseRow[]; enrollments: EnrollmentRow[]; onChange: () => void;
}) {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [resetFor, setResetFor] = useState<StudentProfile | null>(null);

  const enroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!studentId || !courseId) { setErr('Choose a student and a course.'); return; }
    setBusy(true);
    const { error } = await supabase.from('enrollments').insert({ student_id: studentId, course_id: courseId, status: 'active' });
    setBusy(false);
    if (error) { setErr(friendlyError(error, 'enrolment')); return; }
    setMsg('Enrolled. That course’s notes and videos are now open to this student.');
    setCourseId('');
    onChange();
  };

  const unenroll = async (id: string) => {
    const { error } = await supabase.from('enrollments').delete().eq('id', id);
    if (error) { setErr(friendlyError(error, 'enrolment')); return; }
    onChange();
  };

  const coursesFor = (sid: string) =>
    enrollments.filter((e) => e.student_id === sid);

  return (
    <>
      <div className="flex flex-col gap-6">
        <Panel title="Enrol a student" subtitle="Enrolment is what unlocks a course's notes and videos.">
          <form onSubmit={enroll} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Select
                label="Student"
                value={studentId}
                onChange={setStudentId}
                options={students.map((s) => ({ value: s.id, label: `${s.full_name} (${s.enrollment_no})` }))}
              />
              <Select label="Course" value={courseId} onChange={setCourseId} options={courses.map((c) => ({ value: c.id, label: c.title }))} />
              <button disabled={busy} className="pill-button-forest text-xs py-2.5 flex items-center justify-center gap-1.5">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Enrol
              </button>
            </div>
            <Feedback msg={msg} err={err} />
          </form>
        </Panel>

        <Panel title={`Students (${students.length})`} subtitle="Every account, with the courses it can open.">
          {students.length === 0 ? (
            <Empty label="No student accounts yet." hint="Create the first one from an admission application." />
          ) : (
            <div className="flex flex-col gap-2">
              {students.map((s) => (
                <div key={s.id} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-semibold text-foreground">{s.full_name}</span>
                      <span className="text-xs text-muted-foreground">{s.email}{s.phone ? ` · ${s.phone}` : ''}</span>
                      <span className="text-[11px] text-muted-foreground">Enrolment ID {s.enrollment_no}</span>
                    </div>
                    <button
                      onClick={() => setResetFor(s)}
                      className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Reset password
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {coursesFor(s.id).length === 0 ? (
                      <span className="text-[11px] text-muted-foreground">No courses yet — nothing is visible in their portal.</span>
                    ) : (
                      coursesFor(s.id).map((e) => (
                        <span key={e.id} className="text-[11px] bg-forest/10 text-forest font-medium pl-2.5 pr-1 py-1 rounded-full flex items-center gap-1">
                          {e.courses?.title ?? 'Course'}
                          <button
                            onClick={() => unenroll(e.id)}
                            aria-label={`Remove ${e.courses?.title ?? 'course'} from ${s.full_name}`}
                            className="w-4 h-4 rounded-full hover:bg-forest/20 flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {resetFor && <ResetPasswordDialog student={resetFor} onClose={() => setResetFor(null)} />}
    </>
  );
}

function ResetPasswordDialog({ student, onClose }: { student: StudentProfile; onClose: () => void }) {
  const [password, setPassword] = useState(() => suggestPassword());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const { error } = await supabase.rpc('admin_reset_student_password', {
      p_student_id: student.id,
      p_password: password,
    });
    setBusy(false);
    if (error) { setErr(friendlyError(error, 'password')); return; }
    setDone(true);
  };

  return (
    <Dialog title={`Reset password — ${student.full_name}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input label="New password" value={password} onChange={setPassword} />
        {done ? (
          <Feedback msg={`Password changed. Send ${student.email} the new password — it is not shown again.`} />
        ) : (
          <Feedback err={err} />
        )}
        <div className="flex gap-2">
          {!done && (
            <button disabled={busy} className="pill-button-forest text-xs py-2.5 px-5 flex items-center gap-1.5">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Set password
            </button>
          )}
          <button type="button" onClick={onClose} className="pill-button-secondary text-xs py-2.5 px-5">
            {done ? 'Done' : 'Cancel'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Course material
// ---------------------------------------------------------------------------
const emptyDraft = {
  id: '',
  course_id: '',
  type: 'note' as 'note' | 'video',
  title: '',
  description: '',
  content: '',
  duration: '',
  visibility: 'enrolled' as MaterialVisibility,
  sort_order: 0,
};

function MaterialsPanel({
  materials, courses, onChange,
}: {
  materials: CourseMaterial[]; courses: CourseRow[]; onChange: () => void;
}) {
  const [draft, setDraft] = useState({ ...emptyDraft });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const reset = () => { setDraft({ ...emptyDraft }); setFile(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!draft.course_id || !draft.title.trim()) { setErr('Course and title are required.'); return; }
    setBusy(true);

    let storage_path: string | undefined;
    if (file) {
      // Files live in the private "course-materials" bucket under <course_id>/…
      // so storage RLS can apply the same visibility rule as the table row.
      const path = `${draft.course_id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('course-materials').upload(path, file, { upsert: false });
      if (upErr) { setBusy(false); setErr(`We could not upload that file. ${friendlyError(upErr, 'file')}`); return; }
      storage_path = path;
    }

    const payload = {
      course_id: draft.course_id,
      type: draft.type,
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      content: draft.content.trim() || null,
      duration: draft.duration.trim() || null,
      visibility: draft.visibility,
      ...(storage_path ? { storage_path } : {}),
    };

    const { error } = draft.id
      ? await supabase.from('course_materials').update(payload).eq('id', draft.id)
          : await supabase.from('course_materials').insert({
          ...payload,
          storage_path: storage_path ?? null,
          is_published: draft.type !== 'video',
          sort_order: materials.filter((m) => m.course_id === draft.course_id).length + 1,
        });

    setBusy(false);
    if (error) { setErr(friendlyError(error, 'material')); return; }
    setMsg(draft.id ? 'Material updated.' : `Material added — ${visibilityHint[draft.visibility].toLowerCase()}`);
    reset();
    onChange();
  };

  const edit = (m: CourseMaterial) => {
    setDraft({
      id: m.id,
      course_id: m.course_id,
      type: m.type,
      title: m.title,
      description: m.description ?? '',
      content: m.content ?? '',
      duration: m.duration ?? '',
      visibility: m.visibility ?? 'enrolled',
      sort_order: m.sort_order,
    });
    setFile(null);
    setMsg(''); setErr('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setVisibility = async (m: CourseMaterial, visibility: MaterialVisibility) => {
    const { error } = await supabase.from('course_materials').update({ visibility }).eq('id', m.id);
    if (error) { setErr(friendlyError(error, 'material')); return; }
    onChange();
  };

  const setPublished = async (m: CourseMaterial, isPublished: boolean) => {
    const { error } = await supabase.from('course_materials').update({ is_published: isPublished }).eq('id', m.id);
    if (error) { setErr(friendlyError(error, 'material')); return; }
    onChange();
  };

  const remove = async (m: CourseMaterial) => {
    if (!window.confirm(`Delete “${m.title}”? Students lose access to it immediately.`)) return;
    if (m.storage_path) await supabase.storage.from('course-materials').remove([m.storage_path]);
    const { error } = await supabase.from('course_materials').delete().eq('id', m.id);
    if (error) { setErr(friendlyError(error, 'material')); return; }
    onChange();
  };

  const courseName = (id: string) => courses.find((c) => c.id === id)?.title ?? 'Unknown course';
  const shown = filterCourse ? materials.filter((m) => m.course_id === filterCourse) : materials;

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title={draft.id ? 'Edit material' : 'Add note or video'}
        subtitle="Choose who can open it. Material is enrolled-only unless you publish it wider."
        action={draft.id ? (
          <button onClick={reset} className="pill-button-secondary text-xs py-2 px-4">Cancel edit</button>
        ) : undefined}
      >
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select label="Course" value={draft.course_id} onChange={(v) => set('course_id', v)} options={courses.map((c) => ({ value: c.id, label: c.title }))} />
            <Select
              label="Type"
              value={draft.type}
              onChange={(v) => set('type', v as 'note' | 'video')}
              options={[{ value: 'note', label: 'Note' }, { value: 'video', label: 'Video' }]}
              placeholder="Note"
            />
            <Select
              label="Who can open it"
              value={draft.visibility}
              onChange={(v) => set('visibility', v as MaterialVisibility)}
              options={(['enrolled', 'students', 'public'] as MaterialVisibility[]).map((v) => ({ value: v, label: visibilityLabel[v] }))}
              placeholder={visibilityLabel.enrolled}
            />
          </div>
          <p className="text-[11px] text-muted-foreground -mt-1">{visibilityHint[draft.visibility]}</p>

          <Input label="Title" value={draft.title} onChange={(v) => set('title', v)} placeholder="Module 1 — Introduction" />
          <Input label="Short description" value={draft.description} onChange={(v) => set('description', v)} placeholder="One line the student sees on the card" />

          {draft.type === 'note' ? (
            <Textarea
              label="Note text"
              value={draft.content}
              onChange={(v) => set('content', v)}
              placeholder={'# Heading\n\nBody text. Use - for bullets and **bold** for emphasis.'}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Input label="Video URL" value={draft.content} onChange={(v) => set('content', v)} placeholder="https://…/lesson.mp4 or a YouTube link" />
                </div>
                <Input label="Duration" value={draft.duration} onChange={(v) => set('duration', v)} placeholder="12:30" />
              </div>
              {/* Says up front how the pasted link will play. A YouTube share
                  link used to be accepted here and then failed silently in the
                  student portal, which no player error explained. */}
              <p className="text-[11px] text-muted-foreground">
                {draft.content.trim()
                  ? videoSourceLabel[classifyVideoSource(draft.content).kind]
                  : 'Paste a direct .mp4 link or a YouTube / Vimeo link — or upload the file below.'}
              </p>
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" /> Upload a file instead
            </span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-forest/10 file:text-forest"
            />
            <span className="text-[11px] text-muted-foreground">
              Uploads go to private storage and are served through short-lived links that follow the visibility you chose above.
            </span>
          </label>

          <div className="flex gap-2">
            <button disabled={busy} className="pill-button-forest text-xs py-2.5 px-6 flex items-center gap-1.5">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : draft.id ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {draft.id ? 'Save changes' : 'Add material'}
            </button>
          </div>
          <Feedback msg={msg} err={err} />
        </form>
      </Panel>

      <Panel
        title={`Published material (${shown.length})`}
        subtitle="Preview anything before a student sees it."
        action={
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-forest"
          >
            <option value="">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        }
      >
        {shown.length === 0 ? (
          <Empty label="Nothing published for this course yet." />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {shown.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                courseName={courseName(m.course_id)}
                onEdit={() => edit(m)}
                onDelete={() => remove(m)}
                onVisibility={(v) => setVisibility(m, v)}
                onPublished={(published) => setPublished(m, published)}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function MaterialCard({
  material, courseName, onEdit, onDelete, onVisibility, onPublished,
}: {
  material: CourseMaterial;
  courseName: string;
  onEdit: () => void;
  onDelete: () => void;
  onVisibility: (v: MaterialVisibility) => void;
  onPublished: (published: boolean) => void;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="border border-border rounded-xl p-4 bg-background flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">{courseName}</span>
          <span className="text-sm font-semibold text-foreground">{material.title}</span>
          {material.description && <span className="text-xs text-muted-foreground">{material.description}</span>}
        </div>
        <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
          material.type === 'video' ? 'bg-safety-orange/15 text-safety-orange' : 'bg-forest/10 text-forest'
        }`}>
          {material.type === 'video' ? <PlayCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />} {material.type}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <VisibilityBadge visibility={material.visibility ?? 'enrolled'} />
        {material.type === 'video' && (
          <span className="text-[10px] text-muted-foreground">
            {material.is_published === false || (!material.storage_path && !material.content) ? 'Not published' : 'Published'}
          </span>
        )}
        {material.storage_path && <span className="text-[10px] text-muted-foreground">Stored file</span>}
        {material.duration && <span className="text-[10px] text-muted-foreground">{material.duration}</span>}
      </div>

      {preview && (
        <div className="border-t border-border pt-3">
          {material.type === 'video' ? (
            <VideoPreview material={material} watermark="ADMIN PREVIEW" />
          ) : material.content ? (
            <NoteBody content={material.content} />
          ) : (
            <p className="text-xs text-muted-foreground">This note has no text yet.</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
        <button onClick={() => setPreview(!preview)} className="pill-button-secondary text-xs py-2 px-4">
          {preview ? 'Hide preview' : 'Preview'}
        </button>
        <button onClick={onEdit} className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-1.5">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <select
          value={material.visibility ?? 'enrolled'}
          onChange={(e) => onVisibility(e.target.value as MaterialVisibility)}
          aria-label={`Who can open ${material.title}`}
          className="bg-surface border border-border rounded-pill px-3 py-2 text-xs text-foreground focus:outline-none focus:border-forest"
        >
          {(['enrolled', 'students', 'public'] as MaterialVisibility[]).map((v) => (
            <option key={v} value={v}>{visibilityLabel[v]}</option>
          ))}
        </select>
        {material.type === 'video' && (
          <button
            type="button"
            onClick={() => onPublished(material.is_published === false)}
            className="pill-button-secondary text-xs py-2 px-4"
          >
            {material.is_published === false ? 'Publish' : 'Unpublish'}
          </button>
        )}
        <button
          onClick={onDelete}
          className="ml-auto text-xs text-red-700 hover:underline flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------
function CertificatesPanel({
  certificates, courses, students, onChange,
}: {
  certificates: Certificate[]; courses: CourseRow[]; students: StudentProfile[]; onChange: () => void;
}) {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [grade, setGrade] = useState('A');
  const [instructor, setInstructor] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    const student = students.find((s) => s.id === studentId);
    const course = courses.find((c) => c.id === courseId);
    if (!student || !course) { setErr('Choose a student and a course.'); return; }
    setBusy(true);
    const certNo = `SAV/${course.slug.slice(0, 5).toUpperCase()}/${new Date().getFullYear()}/${student.enrollment_no.slice(-4)}`;
    const { error } = await supabase.from('certificates').insert({
      student_id: student.id,
      course_id: course.id,
      certificate_no: certNo,
      student_name: student.full_name,
      course_title: course.title,
      grade,
      issue_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(Date.now() + 730 * 864e5).toISOString().slice(0, 10),
      instructor_name: instructor || 'Savvy Training Institute',
      course_start: course.start_date || null,
      course_end: course.end_date || null,
    });
    setBusy(false);
    if (error) { setErr(friendlyError(error, 'certificate')); return; }
    setMsg(`Certificate ${certNo} issued to ${student.full_name}. It is downloadable from their portal and from the public verification page.`);
    setInstructor('');
    onChange();
  };

  const revoke = async (cert: Certificate) => {
    const reason = window.prompt(`Reason for revoking ${cert.certificate_no}`);
    if (!reason) return;
    const { error } = await supabase.from('certificates').update({
      revoked_at: new Date().toISOString(),
      revoke_reason: reason,
    }).eq('id', cert.id);
    if (error) { setErr(friendlyError(error, 'certificate')); return; }
    await supabase.rpc('write_audit', {
      p_action: 'certificate.revoke',
      p_entity: 'certificates',
      p_entity_id: cert.id,
      p_detail: { reason },
    });
    onChange();
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Issue a certificate" subtitle="The student can download it, and anyone can verify it by number or enrolment ID.">
        <form onSubmit={issue} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Student" value={studentId} onChange={setStudentId} options={students.map((s) => ({ value: s.id, label: `${s.full_name} (${s.enrollment_no})` }))} />
            <Select label="Course" value={courseId} onChange={setCourseId} options={courses.map((c) => ({ value: c.id, label: c.title }))} />
            <Select label="Grade" value={grade} onChange={setGrade} options={['A+', 'A', 'B+', 'B', 'C'].map((g) => ({ value: g, label: g }))} placeholder="A" />
            <Input label="Examiner" value={instructor} onChange={setInstructor} placeholder="e.g. Feroz Alam" />
          </div>
          <button disabled={busy} className="pill-button-forest text-xs py-2.5 px-6 self-start flex items-center gap-1.5">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />} Issue certificate
          </button>
          <Feedback msg={msg} err={err} />
        </form>
      </Panel>

      <Panel title={`Issued certificates (${certificates.length})`}>
        {certificates.length === 0 ? (
          <Empty label="No certificates issued yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 pr-4">Certificate no.</th>
                  <th className="py-3 pr-4">Student</th>
                  <th className="py-3 pr-4">Course</th>
                  <th className="py-3 pr-4">Grade</th>
                  <th className="py-3 pr-4">Issued</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certificates.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4 font-medium text-forest">{c.certificate_no}</td>
                    <td className="py-3 pr-4 font-semibold text-foreground">{c.student_name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.course_title}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.grade}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{new Date(c.issue_date).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => revoke(c)} className="text-red-700 hover:underline flex items-center gap-1.5 ml-auto">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-background border border-border rounded-pill pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-forest w-48"
      />
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="editorial-card bg-surface w-full max-w-2xl my-8 overflow-hidden" role="dialog" aria-modal="true" aria-label={title}>
        <header className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
