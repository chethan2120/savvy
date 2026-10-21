'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { resolveRole, signOutPortal } from '@/lib/portal-auth';
import type { StudentProfile, Certificate, CourseMaterial } from '@/lib/types';
import { CertificateDocument } from '@/components/CertificateDocument';
import { downloadCertificate } from '@/lib/certificate-file';
import { NoteBody, VideoPreview } from '@/components/portal/MaterialViewer';
import { Empty, StatTile } from '@/components/portal/ui';
import { isPlayableVideo } from '@/lib/lessons';
import { StudentAttendance, StudentProfilePanel } from '@/components/lms/StudentPanels';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AccountProfile, CertifiedPrograms, PunchCard } from '@/components/dashboard/InstitutePanels';
import { StudentCertificates } from '@/components/dashboard/Learning';
import {
  GraduationCap, Loader2, Award, BookOpen, FileText, PlayCircle, Download, Clock,
  X, Printer, ChevronDown, LayoutGrid,
} from 'lucide-react';

type EnrolledCourse = {
  course_id: string;
  title: string;
  slug: string;
  status: string;
  duration?: string;
  certification?: string;
  expected_hours?: number;
};

type Tab = 'courses' | 'videos' | 'notes' | 'certificates' | 'attendance' | 'profile';

const TABS: Tab[] = ['courses', 'videos', 'notes', 'certificates', 'attendance', 'profile'];
const isTab = (v: string): v is Tab => (TABS as string[]).includes(v);

export default function StudentPortalPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('courses');
  const [printCert, setPrintCert] = useState<Certificate | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Only a student session opens the student portal. An admin session used to
  // land straight in here because the page trusted "a session exists".
  useEffect(() => {
    resolveRole().then((role) => {
      setAuthed(role === 'student');
      setChecking(false);
      if (role !== 'student') window.location.replace('/login?role=student');
    });
  }, []);

  const loadData = useCallback(async () => {
    const { supabaseTablesReady } = await import('@/lib/supabase-schema');
    if (!isSupabaseConfigured || !(await supabaseTablesReady())) {
      const response = await fetch('/api/programs', { cache: 'no-store' });
      if (response.ok) {
        const body = await response.json();
        const catalog = body.programs ?? [];
        setCourses((body.links ?? []).filter((link: { status: string }) => link.status === 'enrolled').map((link: { courseId: string; status: string }) => {
          const course = catalog.find((item: { id: string; title?: string; slug?: string; duration?: string }) => item.id === link.courseId);
          return {
            course_id: link.courseId,
            status: 'enrolled',
            title: course?.title ?? 'Course',
            slug: course?.slug ?? '',
            duration: course?.duration,
          };
        }));
      }
      return;
    }
    setLoading(true);
    const [{ data: prof }, { data: enr }, { data: cert }, { data: mats }] = await Promise.all([
      supabase.from('students').select('*').maybeSingle(),
      supabase.from('enrollments').select('course_id, status, courses(title, slug, duration, certification, expected_hours)'),
      supabase.from('certificates').select('*').order('issue_date', { ascending: false }),
      supabase.from('course_materials').select('*').order('sort_order', { ascending: true }),
    ]);
    setProfile((prof as StudentProfile) ?? null);
    setCourses(
      ((enr as unknown as {
        course_id: string;
        status: string;
        courses: { title: string; slug: string; duration?: string; certification?: string; expected_hours?: number } | null;
      }[]) ?? []).map((e) => ({
        course_id: e.course_id,
        status: e.status,
        title: e.courses?.title ?? 'Course',
        slug: e.courses?.slug ?? '',
        duration: e.courses?.duration,
        certification: e.courses?.certification,
        expected_hours: e.courses?.expected_hours,
      })),
    );
    setCerts((cert as Certificate[]) ?? []);
    setMaterials((mats as CourseMaterial[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  // Sections are addressable as /student#videos, so a reload or the Back
  // button returns to the same place.
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (isTab(hash)) setTab(hash);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const openTab = useCallback((next: Tab) => {
    setTab(next);
    if (window.location.hash !== `#${next}`) window.history.pushState(null, '', `#${next}`);
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  const handleLogout = async () => {
    await signOutPortal();
    window.location.replace('/login');
  };

  if (checking || !authed) {
    return (
      <div className="account-theme student-dashboard min-h-screen flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> {checking ? 'Checking your session' : 'Redirecting to sign in'}
      </div>
    );
  }

  const watermark = `${profile?.enrollment_no ?? 'WWNDT'} • ${profile?.full_name ?? ''}`.trim();
  // Materials the enrolment does not cover (open previews) are grouped last so
  // the student's own courses stay at the top of the page.
  const enrolledIds = new Set(courses.map((c) => c.course_id));
  const extraMaterials = materials.filter((m) => !enrolledIds.has(m.course_id));
  const videos = materials.filter(isPlayableVideo);
  const notes = materials.filter((m) => m.type === 'note');
  const courseName = (id: string) => courses.find((c) => c.course_id === id)?.title ?? 'Open lessons';

  return (
    <div className="account-theme student-dashboard flex min-h-screen flex-col gap-8 pb-20">
      <DashboardHeader
        role="student"
        fallbackName={profile?.full_name}
        onLogout={handleLogout}
        onProfile={() => openTab('profile')}
        onSettings={() => {
          openTab('profile');
          requestAnimationFrame(() => document.getElementById('account-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        }}
      />

      <section className="site-container flex flex-col gap-6">
        <PunchCard />
        {/* Dashboard cards double as the navigation — each one opens the
            section it counts. */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile label="Courses" value={courses.length} hint="Enrolled" active={tab === 'courses'} onClick={() => openTab('courses')} />
          <StatTile label="Video lessons" value={videos.length} active={tab === 'videos'} onClick={() => openTab('videos')} />
          <StatTile label="Notes" value={notes.length} active={tab === 'notes'} onClick={() => openTab('notes')} />
          <StatTile label="Certificates" value={certs.length} hint="Issued to you" active={tab === 'certificates'} onClick={() => openTab('certificates')} />
        </div>

        <div ref={panelRef} className="flex flex-wrap items-center gap-2 border-b border-border pb-4 scroll-mt-4">
          <TabButton active={tab === 'courses'} onClick={() => openTab('courses')} icon={<LayoutGrid className="w-4 h-4" />}>
            My courses ({courses.length})
          </TabButton>
          <TabButton active={tab === 'videos'} onClick={() => openTab('videos')} icon={<PlayCircle className="w-4 h-4" />}>
            Video lessons ({videos.length})
          </TabButton>
          <TabButton active={tab === 'notes'} onClick={() => openTab('notes')} icon={<FileText className="w-4 h-4" />}>
            Notes ({notes.length})
          </TabButton>
          <TabButton active={tab === 'certificates'} onClick={() => openTab('certificates')} icon={<Award className="w-4 h-4" />}>
            My Certificates ({certs.length})
          </TabButton>
          <TabButton active={tab === 'attendance'} onClick={() => openTab('attendance')} icon={<LayoutGrid className="w-4 h-4" />}>
            My Attendance
          </TabButton>
          <TabButton active={tab === 'profile'} onClick={() => openTab('profile')} icon={<GraduationCap className="w-4 h-4" />}>
            My Profile
          </TabButton>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading your records
          </div>
        )}

        {tab === 'courses' && !loading && (
          <div className="flex flex-col gap-6">
            <CertifiedPrograms mode="student" />
            {(courses.length > 0 || materials.length > 0) && (
              <div className="flex flex-col gap-6">
                {courses.map((course) => (
                  <CourseSection
                    key={course.course_id}
                    course={course}
                    materials={materials.filter((m) => m.course_id === course.course_id)}
                    certificate={certs.find((c) => c.course_id === course.course_id)}
                    watermark={watermark}
                  />
                ))}
                {extraMaterials.length > 0 && (
                  <CourseSection
                    course={{ course_id: 'open', title: 'Open lessons', slug: '', status: 'preview' }}
                    materials={extraMaterials}
                    watermark={watermark}
                    note="Published by the institute for every student — not part of your enrolment."
                  />
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'videos' && !loading && (
          videos.length === 0 ? (
            <div className="editorial-card bg-surface">
              <Empty
                icon={<PlayCircle className="w-7 h-7" />}
                label="Course content will be available soon."
                hint="A video plays only after the institute publishes a real lesson file for a course you are enrolled in."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {videos.map((v) => (
                <div key={v.id} className="border border-border rounded-xl p-4 bg-surface flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
                        {courseName(v.course_id)}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{v.title}</span>
                      {v.description && <span className="text-xs text-muted-foreground">{v.description}</span>}
                    </div>
                    {v.duration && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {v.duration}
                      </span>
                    )}
                  </div>
                  <VideoPreview material={v} watermark={watermark} trackStudy />
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'notes' && !loading && (
          notes.length === 0 ? (
            <div className="editorial-card bg-surface">
              <Empty
                icon={<FileText className="w-7 h-7" />}
                label="No notes are available to you yet."
                hint="Course notes appear here as soon as the institute publishes them."
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notes.map((n) => <NoteRow key={n.id} material={n} courseName={courseName(n.course_id)} />)}
            </div>
          )
        )}

        {tab === 'certificates' && !loading && (
          <>
            {certs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certs.map((cert) => (
                <CertificateCard key={cert.id} cert={cert} onPreview={() => setPrintCert(cert)} />
              ))}
            </div>
            )}
            <StudentCertificates />
          </>
        )}
        {tab === 'attendance' && !loading && <StudentAttendance studentId={profile?.id} />}
        {tab === 'profile' && !loading && (
          <div className="flex flex-col gap-4">
            <AccountProfile />
            <StudentProfilePanel profile={profile} onSaved={loadData} />
          </div>
        )}
      </section>

      {printCert && <CertificatePrint cert={printCert} onClose={() => setPrintCert(null)} />}
    </div>
  );
}

function TabButton({
  active, onClick, icon, children,
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-xs rounded-full font-medium transition-colors ${
        active ? 'bg-forest text-white' : 'bg-white border border-[#E2E6EA] text-[#102B46] hover:border-[#087F73]'
      }`}
    >
      {icon} {children}
    </button>
  );
}

function CourseSection({
  course, materials, certificate, watermark, note,
}: {
  course: EnrolledCourse;
  materials: CourseMaterial[];
  certificate?: Certificate;
  watermark: string;
  note?: string;
}) {
  const videos = materials.filter(isPlayableVideo);
  const notes = materials.filter((m) => m.type === 'note');

  return (
    <section className="editorial-card bg-surface overflow-hidden">
      <header className="px-5 py-4 border-b border-border flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-normal text-foreground">{course.title}</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="capitalize">{course.status}</span>
            {course.duration && <span>{course.duration}</span>}
            {course.certification && <span>{course.certification}</span>}
            <span>{plural(notes.length, 'note')} · {plural(videos.length, 'video')}</span>
          </div>
          {note && <p className="text-[11px] text-muted-foreground">{note}</p>}
        </div>
        {certificate && (
          <span className="text-[11px] bg-forest/10 text-forest font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Certificate issued — grade {certificate.grade}
          </span>
        )}
      </header>

      <div className="p-5 flex flex-col gap-6">
        {materials.length === 0 && (
          <Empty label="No material has been published for this course yet." />
        )}
        {videos.length === 0 && (
          <p className="text-xs text-muted-foreground">Course content will be available soon.</p>
        )}

        {videos.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-[0.14em] flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-safety-orange" /> Video lessons
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {videos.map((v) => (
                <div key={v.id} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">{v.title}</span>
                      {v.description && <span className="text-xs text-muted-foreground">{v.description}</span>}
                    </div>
                    {v.duration && (
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {v.duration}
                      </span>
                    )}
                  </div>
                  <VideoPreview material={v} watermark={watermark} trackStudy />
                </div>
              ))}
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-[0.14em] flex items-center gap-2">
              <FileText className="w-4 h-4 text-forest" /> Notes
            </h3>
            <div className="flex flex-col gap-2">
              {notes.map((n) => <NoteRow key={n.id} material={n} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function NoteRow({ material, courseName }: { material: CourseMaterial; courseName?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl bg-background overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface transition-colors"
      >
        <span className="flex flex-col gap-0.5 min-w-0">
          {courseName && (
            <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
              {courseName}
            </span>
          )}
          <span className="text-sm font-semibold text-foreground">{material.title}</span>
          {material.description && (
            <span className="text-xs text-muted-foreground truncate">{material.description}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border">
          {material.content ? (
            <NoteBody content={material.content} />
          ) : (
            <p className="text-xs text-muted-foreground">This note has no text yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function CertificateCard({ cert, onPreview }: { cert: Certificate; onPreview: () => void }) {
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await downloadCertificate(cert);
    setSaving(false);
  };

  return (
    <div className="editorial-card p-6 bg-surface flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{cert.course_title}</span>
          <span className="text-lg font-normal text-foreground">{cert.student_name}</span>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cert.revoked_at ? 'bg-red-50 text-red-700' : 'bg-yellow/40 text-foreground'}`}>
          {cert.revoked_at ? 'Revoked' : `Grade ${cert.grade}`}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
        <div><dt className="text-muted-foreground">Certificate no.</dt><dd className="font-medium text-foreground">{cert.certificate_no}</dd></div>
        <div><dt className="text-muted-foreground">Issued</dt><dd className="font-medium text-foreground">{fmtDate(cert.issue_date)}</dd></div>
        {cert.expiry_date && <div><dt className="text-muted-foreground">Valid until</dt><dd className="font-medium text-foreground">{fmtDate(cert.expiry_date)}</dd></div>}
        {cert.instructor_name && <div><dt className="text-muted-foreground">Examiner</dt><dd className="font-medium text-foreground">{cert.instructor_name}</dd></div>}
      </dl>
      <div className="flex flex-wrap gap-2 mt-auto">
        <button onClick={save} disabled={saving || Boolean(cert.revoked_at)} className="pill-button-forest text-xs py-2.5 px-5 flex items-center gap-1.5">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Download
        </button>
        <button onClick={onPreview} className="pill-button-secondary text-xs py-2.5 px-5 flex items-center gap-1.5">
          <Printer className="w-3.5 h-3.5" /> Preview &amp; print
        </button>
      </div>
    </div>
  );
}

function CertificatePrint({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 overflow-y-auto print:bg-white print:p-0 print:static">
      <div className="relative w-full max-w-3xl my-auto">
        <div className="flex justify-end gap-2 mb-3 print:hidden">
          <button onClick={() => window.print()} className="pill-button-forest text-xs py-2 px-4 flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button onClick={onClose} className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-1.5">
            <X className="w-3.5 h-3.5" /> Close
          </button>
        </div>
        <CertificateDocument cert={cert} />
      </div>
    </div>
  );
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
