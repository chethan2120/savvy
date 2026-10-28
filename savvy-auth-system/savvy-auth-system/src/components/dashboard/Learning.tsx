'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { CertificateDocument } from '@/components/CertificateDocument';
import { signOutPortal } from '@/lib/portal-auth';

type Role = 'admin' | 'staff' | 'student';
type Chapter = {
  id: string; title: string; description: string; sortOrder: number; studyHours: number | null;
  objectives: string; content: string; status: 'draft' | 'published' | 'archived';
};
type Detail = {
  course: { id: string; title: string; categoryName?: string; image: string; duration: string; description: string; href: string; fee?: string; certification?: string; eligibility?: string; expectedHours?: number | null; custom?: boolean; active?: boolean };
  chapters: Chapter[];
  instructors: { id: string; fullName: string }[];
  chapterCount: number;
  studyHours: number | null;
  enrolledCount: number | null;
  students: { id: string; fullName: string; email: string }[];
  staffChoices: { id: string; fullName: string }[];
  enrollmentStatus: string | null;
  canAddChapter: boolean;
  canEditChapter: boolean;
  canPublishChapter: boolean;
};

const field = 'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm';

export function CourseDetailPage({ role, courseId }: { role: Role; courseId: string }) {
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<'overview' | 'chapters' | 'staff' | 'students' | 'materials'>('overview');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const response = await fetch(`/api/workspace?resource=course&id=${encodeURIComponent(courseId)}`, { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      window.location.replace(`/login?role=${role}`);
      return;
    }
    if (!response.ok) {
      setError(body.message || 'This course could not be opened.');
      setLoading(false);
      return;
    }
    setDetail(body);
    setLoading(false);
  }, [courseId, role]);

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' }).then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (body.account?.role !== role) window.location.replace(`/login?role=${role}`);
    });
    load();
  }, [load, role]);

  const back = role === 'admin' ? '/admin#programs' : role === 'staff' ? '/staff#courses' : '/student#courses';
  const links = role === 'admin'
    ? [['/admin#overview', 'Overview'], ['/admin#programs', 'Certified Programs'], ['/admin#courseAdmin', 'Courses'], ['/admin#certificates', 'Certificates'], ['/admin#settings', 'Account Settings'], ['/admin#profile', 'Profile']]
    : role === 'staff'
      ? [['/staff#dashboard', 'Dashboard'], ['/staff#courses', 'Assigned Courses'], ['/staff#profile', 'My Profile']]
      : [['/student#courses', 'My courses'], ['/student#certificates', 'Certificates'], ['/student#profile', 'My Profile']];

  return (
    <div className={`${role}-dashboard account-theme min-h-screen pb-16`}>
      <DashboardHeader role={role} onLogout={() => signOutPortal()} onProfile={() => router.push(`/${role}#profile`)} onSettings={() => router.push(role === 'admin' ? '/admin#settings' : `/${role}#profile`)} />
      <div className="site-container grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 py-6">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto" aria-label="Dashboard">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={`rounded-lg px-3.5 py-2.5 text-xs whitespace-nowrap ${href === back ? 'bg-forest text-white' : 'text-[#102B46] hover:bg-white'}`}>{label}</Link>
          ))}
        </nav>
        <main>
        <Link href={back} className="text-sm text-forest">← Back to {role === 'admin' ? 'Certified Programs' : 'Courses'}</Link>
        {loading && <div className="mt-4 h-40 animate-pulse rounded-2xl bg-white" aria-label="Loading course" />}
        {error && <p className="mt-4 rounded-xl border border-border bg-white p-4 text-sm">{error}</p>}
        {detail && (
          <CourseBody detail={detail} role={role} section={section} setSection={setSection} notice={notice} setNotice={setNotice} reload={load} />
        )}
        </main>
      </div>
    </div>
  );
}

function CourseBody({
  detail, role, section, setSection, notice, setNotice, reload,
}: {
  detail: Detail; role: Role; section: 'overview' | 'chapters' | 'staff' | 'students' | 'materials';
  setSection: (section: 'overview' | 'chapters' | 'staff' | 'students' | 'materials') => void;
  notice: string; setNotice: (value: string) => void; reload: () => void;
}) {
  const course = detail.course;
  const hours = detail.studyHours == null ? 'Not assigned' : `${detail.studyHours} Hours`;
  const tabs = role === 'student'
    ? (['overview', 'chapters', 'materials'] as const)
    : (['overview', 'chapters', 'staff', 'students', 'materials'] as const);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 rounded-2xl border border-border bg-white p-4">
        <img src={course.image} alt="" width={640} height={360} className="h-40 w-full rounded-xl object-cover" />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{course.categoryName || 'Uncategorised'}</p>
          <h2 className="text-2xl font-semibold">{course.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{course.description || 'No short description has been added.'}</p>
          <p className="mt-2 text-sm">Status: {course.active === false ? 'Inactive' : 'Published'} · Duration: {course.duration}</p>
          {course.fee && <p className="mt-1 text-sm font-semibold">Fee: {course.fee}</p>}
          {course.certification && <p className="mt-1 text-sm">Certificate: {course.certification}</p>}
          {course.eligibility && <p className="mt-1 text-sm">Eligibility: {course.eligibility}</p>}
          {role === 'admin' && <Link href="/admin#courseAdmin" className="mt-3 inline-flex rounded-lg bg-forest px-3 py-2 text-sm font-semibold text-white">Edit Course</Link>}
          {role !== 'student' && course.href && <Link href={course.href} className="ml-3 text-sm text-forest underline">View on Website</Link>}
        </div>
      </section>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card label="Total Chapters" value={`${detail.chapterCount} Chapter${detail.chapterCount === 1 ? '' : 's'}`} />
        <Card label="Teaching Staff" value={detail.instructors.length ? detail.instructors.map((person) => person.fullName).join(', ') : 'Not assigned'} />
        <Card label="Total Study Hours" value={hours} />
        {role !== 'student' && <Card label="Enrolled Students" value={detail.enrolledCount == null ? 'Not available' : `${detail.enrolledCount} Student${detail.enrolledCount === 1 ? '' : 's'}`} />}
      </div>
      {role === 'student' && detail.enrollmentStatus !== 'enrolled' && (
        <p className="rounded-xl border border-border bg-white p-4 text-sm">Enrolment status: {detail.enrollmentStatus || 'Available'}. Request enrolment from Courses. Chapter content stays hidden until the request is approved.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button key={item} type="button" onClick={() => setSection(item)} className={`rounded-lg px-3 py-2 text-sm capitalize ${section === item ? 'bg-forest text-white' : 'bg-white border border-border'}`}>{item === 'staff' ? 'Teaching Staff' : item}</button>
        ))}
      </div>
      {notice && <p className="text-sm">{notice}</p>}
      {section === 'overview' && <p className="rounded-2xl border border-border bg-white p-4 text-sm">Course duration on the catalogue is {course.duration}. The study-hours total is the sum of chapter hours. Until a chapter records hours, the total entered on the course is shown. The chapter count is the number of chapters, or the count entered on the course when none exist yet.</p>}
      {section === 'chapters' && <Chapters detail={detail} role={role} setNotice={setNotice} reload={reload} />}
      {section === 'staff' && role !== 'student' && <Instructors detail={detail} setNotice={setNotice} reload={reload} />}
      {section === 'students' && role !== 'student' && (
        <ul className="rounded-2xl border border-border bg-white p-4 text-sm">
          {detail.students.length === 0 && <li>No approved student enrolments.</li>}
          {detail.students.map((student) => <li key={student.id}>{student.fullName} · {student.email}</li>)}
        </ul>
      )}
      {section === 'materials' && (
        <ul className="rounded-2xl border border-border bg-white p-4 text-sm">
          {detail.chapters.filter((chapter) => chapter.content || chapter.objectives).length === 0 && <li>No chapter materials have been published.</li>}
          {detail.chapters.filter((chapter) => chapter.content || chapter.objectives).map((chapter) => (
            <li key={chapter.id} className="mt-2"><strong>{chapter.title}</strong><p>{chapter.objectives}</p><p>{chapter.content}</p></li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-white p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>;
}

function Chapters({ detail, role, setNotice, reload }: { detail: Detail; role: Role; setNotice: (value: string) => void; reload: () => void }) {
  const [form, setForm] = useState({ title: '', sortOrder: String(detail.chapters.length + 1), description: '', studyHours: '', objectives: '', content: '', status: 'draft' });
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'chapter', courseId: detail.course.id, ...form, studyHours: form.studyHours }) });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? 'Chapter saved.' : (body.message || 'The chapter was not saved.'));
    if (response.ok) reload();
  };
  const update = async (chapter: Chapter, patch: Record<string, unknown>) => {
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'chapter', courseId: detail.course.id, id: chapter.id, title: chapter.title, description: chapter.description, sortOrder: chapter.sortOrder, studyHours: chapter.studyHours, objectives: chapter.objectives, content: chapter.content, status: chapter.status, ...patch }) });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? 'Chapter updated.' : (body.message || 'The chapter was not updated.'));
    if (response.ok) reload();
  };
  const move = async (index: number, direction: -1 | 1) => {
    const ids = detail.chapters.map((chapter) => chapter.id);
    const next = index + direction;
    if (next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]];
    await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'order-chapters', courseId: detail.course.id, ids }) });
    reload();
  };
  return (
    <div className="flex flex-col gap-3">
      {detail.canAddChapter && (
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl border border-border bg-white p-4">
          <h2 className="md:col-span-2 font-semibold">Add Chapter</h2>
          <input required className={field} placeholder="Chapter title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <input className={field} placeholder="Chapter number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
          <textarea className={`${field} md:col-span-2`} placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <input className={field} placeholder="Estimated study hours" value={form.studyHours} onChange={(event) => setForm({ ...form, studyHours: event.target.value })} />
          <select className={field} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="draft">Save as draft</option>
            {detail.canPublishChapter && <option value="published">Publish</option>}
          </select>
          <input className={`${field} md:col-span-2`} placeholder="Learning objectives (optional)" value={form.objectives} onChange={(event) => setForm({ ...form, objectives: event.target.value })} />
          <textarea className={`${field} md:col-span-2`} placeholder="Chapter content or material notes (optional)" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
          <button className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white" type="submit">Save Chapter</button>
        </form>
      )}
      <ol className="rounded-2xl border border-border bg-white p-4 text-sm">
        {detail.chapters.length === 0 && <li>{role === 'student' ? 'No published chapters yet.' : 'No chapters yet.'}</li>}
        {detail.chapters.map((chapter, index) => (
          <li key={chapter.id} className="mt-3 border-t border-border pt-3 first:mt-0 first:border-0 first:pt-0">
            <strong>{chapter.sortOrder}. {chapter.title}</strong>
            <span className="text-muted-foreground"> · {chapter.status} · {chapter.studyHours == null ? 'Hours not assigned' : `${chapter.studyHours}h`}</span>
            <p>{chapter.description}</p>
            {role !== 'student' && detail.canEditChapter && (
              <span className="mt-1 flex flex-wrap gap-3">
                <button type="button" onClick={() => move(index, -1)}>Move up</button>
                <button type="button" onClick={() => move(index, 1)}>Move down</button>
                {detail.canPublishChapter && chapter.status !== 'published' && <button type="button" onClick={() => update(chapter, { status: 'published' })}>Publish</button>}
                {chapter.status === 'published' && <button type="button" onClick={() => update(chapter, { status: 'draft' })}>Unpublish</button>}
                {role === 'admin' && <button type="button" onClick={() => fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'archive-chapter', id: chapter.id }) }).then(reload)}>Archive</button>}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Instructors({ detail, setNotice, reload }: { detail: Detail; setNotice: (value: string) => void; reload: () => void }) {
  const [accountId, setAccountId] = useState('');
  const assign = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'assign-instructor', courseId: detail.course.id, accountId }) });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? 'Teaching staff saved.' : (body.message || 'The instructor was not saved.'));
    if (response.ok) reload();
  };
  return (
    <section className="rounded-2xl border border-border bg-white p-4 text-sm">
      {detail.instructors.length === 0 && <p>No teaching staff assigned.</p>}
      <ul>{detail.instructors.map((person) => (
        <li key={person.id} className="mt-2 flex justify-between">Assigned Instructor: {person.fullName}
          {detail.staffChoices.length > 0 && <button type="button" className="text-forest" onClick={() => fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'clear-instructor', courseId: detail.course.id, accountId: person.id }) }).then(reload)}>Remove</button>}
        </li>
      ))}</ul>
      {detail.staffChoices.length > 0 && (
        <form onSubmit={assign} className="mt-3 flex flex-wrap gap-2">
          <select required className={field} value={accountId} onChange={(event) => setAccountId(event.target.value)}>
            <option value="">Choose staff</option>
            {detail.staffChoices.map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}
          </select>
          <button className="rounded-lg bg-forest px-3 py-2 text-white" type="submit">Assign teaching staff</button>
        </form>
      )}
    </section>
  );
}

export function CertificateDesk() {
  const [rows, setRows] = useState<{ id: string; number: string; studentName: string; courseTitle: string; studentId: string; courseId: string; status: string; issueDate: string; completionDate: string | null }[]>([]);
  const [students, setStudents] = useState<{ id: string; fullName: string; role: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [query, setQuery] = useState('');
  const [courseId, setCourseId] = useState('');
  const [form, setForm] = useState({ studentId: '', courseId: '', completionDate: '' });
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<(typeof rows)[number] | null>(null);
  const [identity, setIdentity] = useState({ hasSeal: true, hasSignature: true });

  const load = useCallback(async () => {
    const [certs, accounts, programs] = await Promise.all([
      fetch('/api/workspace?resource=certificates', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/accounts', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/programs', { cache: 'no-store' }).then((response) => response.json()),
    ]);
    setRows(certs.certificates ?? []);
    setStudents((accounts.accounts ?? []).filter((account: { role: string }) => account.role === 'student'));
    setCourses(programs.programs ?? []);
    const branding = await fetch('/api/branding', { cache: 'no-store' }).then((response) => (response.ok ? response.json() : null));
    if (branding) setIdentity(branding);
  }, []);
  useEffect(() => { load(); }, [load]);

  const issue = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'issue-certificate', ...form, completionDate: form.completionDate || null }) });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? `Issued ${body.certificate?.number}.` : (body.message || 'The certificate was not issued.'));
    if (response.ok) load();
  };
  const visible = rows.filter((row) => row.studentName.toLowerCase().includes(query.trim().toLowerCase()) && (!courseId || row.courseId === courseId));

  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h2 className="text-lg font-semibold">Certificates</h2>
      <p className="text-sm text-muted-foreground">Issue a certificate only for a student who is enrolled in the course. Leave the completion date empty when it has not been recorded.</p>
      {(!identity.hasSeal || !identity.hasSignature) && (
        <p className="mt-3 rounded-lg border border-[#D9AD55] bg-[#F6F4EE] px-3 py-2 text-sm text-[#102B46]">
          The official certificate still needs {identity.hasSeal ? '' : 'an institute seal'}{!identity.hasSeal && !identity.hasSignature ? ' and ' : ''}{identity.hasSignature ? '' : 'an authorized signature'}. Upload them in Account Settings before treating a download as the final signed copy. Preview remains available.
        </p>
      )}
      <form onSubmit={issue} className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
        <select required className={field} value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })}>
          <option value="">Student</option>
          {students.map((student) => <option key={student.id} value={student.id}>{student.fullName}</option>)}
        </select>
        <select required className={field} value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })}>
          <option value="">Course</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        <input className={field} type="date" value={form.completionDate} onChange={(event) => setForm({ ...form, completionDate: event.target.value })} aria-label="Completion date" />
        <button className="rounded-lg bg-forest px-3 py-2 text-sm font-semibold text-white" type="submit">Issue certificate</button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <input className={field} placeholder="Search by student" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className={field} value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          <option value="">All courses</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </div>
      {notice && <p className="mt-3 text-sm">{notice}</p>}
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {visible.length === 0 && <li>No certificates match.</li>}
        {visible.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <span className="min-w-0">
              <span className="font-medium">{row.studentName}</span>
              <span className="text-muted-foreground"> · {row.courseTitle} · {row.number} · Issued {row.issueDate.slice(0, 10)}</span>
              {!row.completionDate && <span className="text-muted-foreground"> · Completion date not recorded</span>}
              <span className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${row.status === 'revoked' ? 'bg-red-50 text-red-700' : 'bg-[#E7F3F1] text-[#00543d]'}`}>{row.status === 'revoked' ? 'Revoked' : 'Issued'}</span>
            </span>
            <span className="flex gap-3">
              <button type="button" className="text-forest underline" onClick={() => setPreview(row)}>Preview</button>
              {row.status === 'issued' && <a className="text-forest underline" href={`/api/certificates/${row.id}`}>Download</a>}
              {row.status === 'issued' && <button type="button" className="text-forest underline" onClick={() => fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'revoke-certificate', id: row.id }) }).then(load)}>Revoke</button>}
            </span>
          </li>
        ))}
      </ul>
      {preview && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-6 max-w-4xl">
            <div className="mb-3 flex flex-wrap justify-end gap-3 text-sm">
              {preview.status === 'issued' && <a className="rounded-lg bg-forest px-3 py-2 font-semibold text-white" href={`/api/certificates/${preview.id}`}>Download PDF</a>}
              <button type="button" className="rounded-lg border border-white/40 bg-white px-3 py-2" onClick={() => setPreview(null)}>Close preview</button>
            </div>
            <CertificateDocument
              setupHints
              cert={{
                certificate_no: preview.number,
                student_name: preview.studentName,
                course_title: preview.courseTitle,
                issue_date: preview.issueDate,
                course_end: preview.completionDate ?? undefined,
                status: preview.status === 'revoked' ? 'revoked' : 'issued',
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export function StudentCertificates() {
  const [rows, setRows] = useState<{ id: string; number: string; courseTitle: string; status: string; issueDate: string; studentName: string; completionDate: string | null }[]>([]);
  const [preview, setPreview] = useState<(typeof rows)[number] | null>(null);
  useEffect(() => {
    fetch('/api/workspace?resource=certificates', { cache: 'no-store' }).then((response) => response.json()).then((body) => setRows(body.certificates ?? []));
  }, []);
  if (rows.length === 0) {
    return <p className="rounded-2xl border border-border bg-white p-5 text-sm">No certificate has been issued to you yet.</p>;
  }
  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h2 className="text-lg font-semibold">Issued certificates</h2>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <span>{row.courseTitle} · {row.number} · {row.status}</span>
            <span className="flex gap-3">
              <button type="button" className="text-forest underline" onClick={() => setPreview(row)}>Preview</button>
              {row.status === 'issued' && <a className="text-forest underline" href={`/api/certificates/${row.id}`}>Download</a>}
            </span>
          </li>
        ))}
      </ul>
      {preview && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-4">
          <div className="mx-auto my-6 max-w-4xl">
            <div className="mb-3 flex justify-end">
              <button type="button" className="rounded-lg bg-white px-3 py-2 text-sm" onClick={() => setPreview(null)}>Close preview</button>
            </div>
            <CertificateDocument
              cert={{
                certificate_no: preview.number,
                student_name: preview.studentName,
                course_title: preview.courseTitle,
                issue_date: preview.issueDate,
                course_end: preview.completionDate ?? undefined,
                status: preview.status === 'revoked' ? 'revoked' : 'issued',
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export function InstituteIdentity() {
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState('');
  const [missing, setMissing] = useState({ seal: true, signature: true });
  const [signatory, setSignatory] = useState({ signatoryName: '', signatoryDesignation: '' });

  useEffect(() => {
    fetch('/api/branding', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!body) return;
        setSignatory({ signatoryName: body.signatoryName || '', signatoryDesignation: body.signatoryDesignation || '' });
        setMissing({ seal: !body.hasSeal, signature: !body.hasSignature });
      })
      .catch(() => undefined);
  }, [version]);

  const upload = async (kind: 'seal' | 'signature', file: File | null, remove = false) => {
    const form = new FormData();
    form.set('kind', kind);
    if (remove) form.set('remove', '1');
    else if (file) form.set('file', file);
    const response = await fetch('/api/branding', { method: 'POST', body: form });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? (remove ? `${kind === 'seal' ? 'Seal' : 'Signature'} removed.` : `${kind === 'seal' ? 'Seal' : 'Signature'} saved.`) : (body.message || 'The image was not saved.'));
    if (response.ok) setVersion((value) => value + 1);
  };
  const saveSignatory = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = new FormData();
    form.set('kind', 'identity');
    form.set('signatoryName', signatory.signatoryName);
    form.set('signatoryDesignation', signatory.signatoryDesignation);
    const response = await fetch('/api/branding', { method: 'POST', body: form });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? 'Signatory details saved.' : (body.message || 'The signatory details were not saved.'));
  };
  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h2 className="text-lg font-semibold">Institute Identity / Certificate Authority</h2>
      <p className="text-sm text-muted-foreground">Upload the institute’s own seal and the authorised person’s signature. PNG or JPG, under 1.5 MB. A transparent PNG keeps the certificate background clean. These files are stored with the institute records and are used on every certificate.</p>
      {(['seal', 'signature'] as const).map((kind) => (
        <div key={kind} className="mt-4">
          <h3 className="font-medium">{kind === 'seal' ? 'Institute seal' : 'Authorized signature'}</h3>
          {missing[kind] ? (
            <p className="mt-2 text-sm text-muted-foreground">No {kind === 'seal' ? 'seal' : 'signature'} uploaded yet.</p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/branding?asset=${kind}&v=${version}`} alt={kind === 'seal' ? 'Current institute seal' : 'Current authorized signature'} className="mt-2 h-20 w-auto max-w-full object-contain" onError={() => setMissing((current) => ({ ...current, [kind]: true }))} />
          )}
          <label className="mt-2 block text-sm">
            {missing[kind] ? 'Upload' : 'Replace'} {kind === 'seal' ? 'seal' : 'signature'}
            <input className="mt-1 block text-sm" type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" onChange={(event) => { const file = event.target.files?.[0] ?? null; if (file) upload(kind, file); event.target.value = ''; }} />
          </label>
          {!missing[kind] && <button type="button" className="mt-1 text-sm text-forest underline" onClick={() => upload(kind, null, true)}>Remove</button>}
        </div>
      ))}
      <form onSubmit={saveSignatory} className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
        <label className="text-sm">Signatory name
          <input className={`${field} mt-1`} value={signatory.signatoryName} maxLength={80} onChange={(event) => setSignatory({ ...signatory, signatoryName: event.target.value })} placeholder="Name printed under the signature" />
        </label>
        <label className="text-sm">Signatory designation
          <input className={`${field} mt-1`} value={signatory.signatoryDesignation} maxLength={80} onChange={(event) => setSignatory({ ...signatory, signatoryDesignation: event.target.value })} placeholder="Director, Head of Training" />
        </label>
        <button className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white md:col-span-2 md:w-fit" type="submit">Save signatory details</button>
      </form>
      {notice && <p className="mt-3 text-sm">{notice}</p>}
    </section>
  );
}

export function RoleAccessPanel() {
  const [staff, setStaff] = useState<{ id: string; fullName: string; permissions?: Record<string, boolean> }[]>([]);
  const [selected, setSelected] = useState('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [access, setAccess] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState('');
  const staffKeys = [
    ['viewAssignedCourses', 'View assigned courses'],
    ['viewAllCourses', 'View all courses'],
    ['manageCourses', 'Create courses'],
    ['editCourses', 'Edit courses'],
    ['manageChapters', 'Manage chapters'],
    ['addChapters', 'Add chapters'],
    ['editChapters', 'Edit chapters'],
    ['publishChapters', 'Publish chapters'],
    ['uploadMaterials', 'Upload course materials'],
    ['viewEnrolledStudents', 'View enrolled student lists'],
    ['assignTeachingStaff', 'Assign teaching staff'],
    ['manageEnrolments', 'Manage enrolments'],
  ] as const;
  const studentKeys = [
    ['viewAvailableCourses', 'View available courses'],
    ['viewEnrolledCourses', 'View enrolled courses'],
    ['viewChapters', 'View permitted chapters'],
    ['viewMaterials', 'View course materials'],
    ['requestEnrolment', 'Request course enrolment'],
    ['viewOwnStudyHours', 'View own study hours'],
  ] as const;
  useEffect(() => {
    Promise.all([
      fetch('/api/accounts', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/workspace?resource=student-access', { cache: 'no-store' }).then((response) => response.json()),
    ]).then(([accounts, policy]) => {
      const people = (accounts.accounts ?? []).filter((account: { role: string }) => account.role === 'staff');
      setStaff(people);
      setAccess(policy.access ?? {});
      if (people[0]) { setSelected(people[0].id); setPermissions(people[0].permissions ?? {}); }
    });
  }, []);
  const saveStaff = async () => {
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'permissions', accountId: selected, permissions }) });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? 'Staff permissions saved.' : (body.message || 'Permissions were not saved.'));
  };
  const saveStudents = async () => {
    const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resource: 'student-access', access }) });
    setNotice(response.ok ? 'Student access saved.' : 'Student access was not saved.');
  };
  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h2 className="text-lg font-semibold">Role-Based Access</h2>
      <p className="text-sm text-muted-foreground">Only an administrator can change these rules. Staff and students cannot edit their own permissions.</p>
      <h3 className="mt-4 font-medium">Staff course permissions</h3>
      <select className={`${field} mt-2`} value={selected} onChange={(event) => { const person = staff.find((item) => item.id === event.target.value); setSelected(event.target.value); setPermissions(person?.permissions ?? {}); }}>
        {staff.map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}
      </select>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {staffKeys.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={Boolean(permissions[key])} onChange={(event) => setPermissions({ ...permissions, [key]: event.target.checked })} />{label}</label>
        ))}
      </div>
      <button type="button" className="mt-3 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white" onClick={saveStaff}>Save staff permissions</button>
      <h3 className="mt-5 font-medium">Student permissions</h3>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {studentKeys.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={access[key] !== false} onChange={(event) => setAccess({ ...access, [key]: event.target.checked })} />{label}</label>
        ))}
      </div>
      <button type="button" className="mt-3 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white" onClick={saveStudents}>Save student access</button>
      {notice && <p className="mt-3 text-sm">{notice}</p>}
    </section>
  );
}
