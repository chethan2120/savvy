'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { resolveRole, signOutPortal } from '@/lib/portal-auth';
import { friendlyError } from '@/lib/friendly-error';
import { formatStudy } from '@/lib/lessons';
import { Empty } from '@/components/portal/ui';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AccountProfile, CertifiedPrograms, PunchCard } from '@/components/dashboard/InstitutePanels';
import { LeaveForm } from '@/components/dashboard/Operations';
import { Loader2 } from 'lucide-react';

type StaffProfile = {
  id: string;
  full_name: string;
  email: string;
  can_attendance: boolean;
  can_videos: boolean;
  can_certificates: boolean;
  can_edit_courses: boolean;
};

type Tab = 'dashboard' | 'courses' | 'videos' | 'attendance' | 'progress' | 'certificates' | 'my-attendance' | 'profile';

const tabs: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'courses', label: 'Assigned Courses' },
  { id: 'videos', label: 'Course Videos' },
  { id: 'attendance', label: 'Student Attendance' },
  { id: 'progress', label: 'Student Progress' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'my-attendance', label: 'My Attendance' },
  { id: 'profile', label: 'My Profile' },
];

export default function StaffPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '');
      if ((tabs as { id: string }[]).some((item) => item.id === hash)) setTab(hash as Tab);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    resolveRole().then((role) => {
      setAuthed(role === 'staff');
      setChecking(false);
      if (role !== 'staff') window.location.replace('/login?role=staff');
    });
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const load = useCallback(async () => {
    const { supabaseTablesReady } = await import('@/lib/supabase-schema');
    if (!(await supabaseTablesReady())) return;
    const { data: me } = await supabase.from('staff').select('*').maybeSingle();
    setProfile((me as StaffProfile) ?? null);
    const { data: assigned } = await supabase.from('staff_courses').select('course_id, courses(id, title)');
    setCourses(((assigned as unknown as { courses?: { id: string; title: string } }[]) ?? [])
      .map((row) => row.courses)
      .filter((course): course is { id: string; title: string } => Boolean(course)));
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  const signOut = async () => {
    await signOutPortal();
    window.location.replace('/login');
  };

  if (checking || !authed) {
    return <div className="account-theme staff-dashboard min-h-screen flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> {checking ? 'Checking your session' : 'Redirecting to sign in'}</div>;
  }

  return (
    <div className="account-theme staff-dashboard flex min-h-screen flex-col pb-20">
      <DashboardHeader
        role="staff"
        fallbackName={profile?.full_name}
        onLogout={signOut}
        onProfile={() => setTab('profile')}
        onSettings={() => {
          setTab('profile');
          requestAnimationFrame(() => document.getElementById('account-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        }}
      />
      <div className="site-container grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 pt-8">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => { setTab(item.id); window.history.replaceState(null, '', `#${item.id}`); }} className={`px-3.5 py-2.5 rounded-lg text-xs text-left whitespace-nowrap ${tab === item.id ? 'bg-forest text-white' : 'text-[#102B46] hover:bg-white'}`}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex flex-col gap-4 min-w-0">
          {notice && <p className="text-xs border border-border rounded-lg px-3 py-2">{notice}</p>}
          {tab === 'dashboard' && (
            <div className="flex flex-col gap-4">
              <PunchCard />
              <div className="editorial-card bg-surface p-5 text-sm">
                <p>You are assigned to {courses.length} course{courses.length === 1 ? '' : 's'} in the class register.</p>
                <p className="text-xs text-muted-foreground mt-2">Attendance, videos, and certificates follow the permissions an administrator set on your account.</p>
              </div>
              <CertifiedPrograms mode="staff" />
            </div>
          )}
          {tab === 'courses' && <CertifiedPrograms mode="staff" />}
          {tab === 'videos' && <VideoManager courses={courses} allowed={Boolean(profile?.can_videos)} onNotice={setNotice} />}
          {tab === 'attendance' && <StaffAttendance courses={courses} allowed={Boolean(profile?.can_attendance)} onNotice={setNotice} />}
          {tab === 'progress' && <Progress courses={courses} />}
          {tab === 'certificates' && <IssueCertificate courses={courses} allowed={Boolean(profile?.can_certificates)} onNotice={setNotice} />}
          {tab === 'my-attendance' && (
            <div className="flex flex-col gap-4">
              <PunchCard />
              <MyAttendance staffId={profile?.id} onNotice={setNotice} />
            </div>
          )}
          {tab === 'profile' && (
            <div className="flex flex-col gap-4">
              <AccountProfile />
              <LeaveForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoManager({ courses, allowed, onNotice }: { courses: { id: string; title: string }[]; allowed: boolean; onNotice: (text: string) => void }) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<{ id: string; title: string; is_published?: boolean; storage_path?: string; sort_order: number }[]>([]);
  const [progress, setProgress] = useState('');

  const load = useCallback(async () => {
    if (!courseId) return;
    const { data } = await supabase.from('course_materials').select('id, title, is_published, storage_path, sort_order').eq('course_id', courseId).eq('type', 'video').order('sort_order');
    setRows(data ?? []);
  }, [courseId]);
  useEffect(() => { load(); }, [load]);

  if (!allowed) return <Empty label="You do not have permission to manage videos." />;

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !courseId || !title.trim()) return onNotice('Choose a course, title, and video file.');
    setProgress('Uploading…');
    const path = `${courseId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: uploadError } = await supabase.storage.from('course-materials').upload(path, file, { upsert: false });
    if (uploadError) {
      setProgress('');
      return onNotice(friendlyError(uploadError, 'file'));
    }
    const { error } = await supabase.from('course_materials').insert({
      course_id: courseId,
      type: 'video',
      title: title.trim(),
      description: description.trim() || null,
      storage_path: path,
      visibility: 'enrolled',
      is_published: false,
      sort_order: rows.length + 1,
    });
    setProgress('');
    if (error) return onNotice(friendlyError(error, 'lesson file'));
    setTitle('');
    setDescription('');
    setFile(null);
    onNotice('Video uploaded. Publish it before students can play it.');
    load();
  };

  const publish = async (row: { id: string; is_published?: boolean }) => {
    const { error } = await supabase.from('course_materials').update({ is_published: !row.is_published }).eq('id', row.id);
    if (error) return onNotice(friendlyError(error, 'lesson file'));
    load();
  };

  const remove = async (row: { id: string; storage_path?: string; title: string }) => {
    if (!window.confirm(`Remove ${row.title}?`)) return;
    if (row.storage_path) await supabase.storage.from('course-materials').remove([row.storage_path]);
    const { error } = await supabase.from('course_materials').delete().eq('id', row.id);
    if (error) return onNotice(friendlyError(error, 'lesson file'));
    load();
  };

  const move = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= rows.length) return;
    const copy = [...rows];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    await Promise.all(copy.map((row, order) => supabase.from('course_materials').update({ sort_order: order + 1 }).eq('id', row.id)));
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={upload} className="editorial-card bg-surface p-5 flex flex-col gap-3">
        <select aria-label="Course" className="bg-background border border-border rounded-lg px-3 py-2 text-sm" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        <input required aria-label="Video title" placeholder="Video title" className="bg-background border border-border rounded-lg px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input aria-label="Video description" placeholder="Description" className="bg-background border border-border rounded-lg px-3 py-2 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input required aria-label="Video file" type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button className="pill-button-forest text-xs py-2.5 self-start" type="submit">Upload video</button>
        {progress && <p className="text-xs text-muted-foreground">{progress}</p>}
      </form>
      {rows.length === 0 ? <Empty label="No videos for this course yet." hint="Students see a lesson only after you publish a completed upload." /> : rows.map((row, index) => (
        <div key={row.id} className="editorial-card bg-surface p-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">{row.title}</p>
            <p className="text-xs text-muted-foreground">{row.storage_path ? (row.is_published ? 'Published' : 'Uploaded, not published') : 'No file'}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="text-xs border border-border rounded-full px-3 py-1" onClick={() => move(index, -1)}>Up</button>
            <button type="button" className="text-xs border border-border rounded-full px-3 py-1" onClick={() => move(index, 1)}>Down</button>
            <button type="button" className="text-xs border border-border rounded-full px-3 py-1" onClick={() => publish(row)}>{row.is_published ? 'Unpublish' : 'Publish'}</button>
            <button type="button" className="text-xs border border-border rounded-full px-3 py-1" onClick={() => remove(row)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StaffAttendance({ courses, allowed, onNotice }: { courses: { id: string; title: string }[]; allowed: boolean; onNotice: (text: string) => void }) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<{ student_id: string; full_name: string; status: string }[]>([]);
  useEffect(() => {
    if (!courseId) return;
    supabase.from('enrollments').select('student_id, students(full_name)').eq('course_id', courseId).then(({ data }) => {
      setRows(((data as unknown as { student_id: string; students?: { full_name: string } }[]) ?? []).map((row) => ({
        student_id: row.student_id, full_name: row.students?.full_name ?? 'Student', status: 'present',
      })));
    });
  }, [courseId]);
  if (!allowed) return <Empty label="You do not have permission to mark attendance." />;
  const save = async () => {
    const { error } = await supabase.from('student_attendance').upsert(rows.map((row) => ({
      student_id: row.student_id, course_id: courseId, attendance_date: date, status: row.status,
    })), { onConflict: 'student_id,course_id,attendance_date' });
    onNotice(error ? friendlyError(error, 'records') : 'Attendance saved.');
  };
  return (
    <div className="editorial-card bg-surface p-5 flex flex-col gap-3">
      <select aria-label="Course" className="bg-background border border-border rounded-lg px-3 py-2 text-sm" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
      </select>
      <input aria-label="Date" type="date" className="bg-background border border-border rounded-lg px-3 py-2 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
      {rows.map((row, index) => (
        <label key={row.student_id} className="flex items-center justify-between gap-3 text-sm">
          {row.full_name}
          <select aria-label={`Status for ${row.full_name}`} value={row.status} onChange={(e) => setRows(rows.map((item, i) => i === index ? { ...item, status: e.target.value } : item))} className="bg-background border border-border rounded-lg px-2 py-1 text-xs">
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </label>
      ))}
      <button type="button" onClick={save} className="pill-button-forest text-xs py-2.5 self-start">Save attendance</button>
    </div>
  );
}

function Progress({ courses }: { courses: { id: string; title: string }[] }) {
  const [rows, setRows] = useState<{ name: string; course: string; seconds: number }[]>([]);
  useEffect(() => {
    const ids = courses.map((course) => course.id);
    if (!ids.length) return;
    supabase.from('learning_sessions').select('student_id, course_id, credited_seconds, students(full_name), courses(title)').in('course_id', ids).then(({ data }) => {
      const totals = new Map<string, { name: string; course: string; seconds: number }>();
      for (const row of (data as unknown as { student_id: string; course_id: string; credited_seconds: number; students?: { full_name: string }; courses?: { title: string } }[]) ?? []) {
        const key = `${row.student_id}:${row.course_id}`;
        const current = totals.get(key) ?? { name: row.students?.full_name ?? 'Student', course: row.courses?.title ?? 'Course', seconds: 0 };
        current.seconds += row.credited_seconds ?? 0;
        totals.set(key, current);
      }
      setRows([...totals.values()]);
    });
  }, [courses]);
  if (!rows.length) return <Empty label="No study time for your courses yet." />;
  return (
    <ul className="editorial-card bg-surface p-5 flex flex-col gap-2 text-sm">
      {rows.map((row) => <li key={`${row.name}-${row.course}`} className="flex justify-between gap-3"><span>{row.name} · {row.course}</span><span>{formatStudy(row.seconds)}</span></li>)}
    </ul>
  );
}

function IssueCertificate({ courses, allowed, onNotice }: { courses: { id: string; title: string }[]; allowed: boolean; onNotice: (text: string) => void }) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([]);
  const [studentId, setStudentId] = useState('');
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!courseId) return;
    supabase.from('enrollments').select('student_id, students(id, full_name)').eq('course_id', courseId).eq('status', 'active').then(({ data }) => {
      const list = ((data as unknown as { students?: { id: string; full_name: string } }[]) ?? []).map((row) => row.students).filter((student): student is { id: string; full_name: string } => Boolean(student));
      setStudents(list);
      setStudentId(list[0]?.id ?? '');
    });
  }, [courseId]);
  if (!allowed) return <Empty label="You do not have permission to issue certificates." />;
  const issue = async () => {
    const student = students.find((item) => item.id === studentId);
    const course = courses.find((item) => item.id === courseId);
    if (!student || !course) return;
    const { data: courseRow } = await supabase.from('courses').select('start_date, end_date, title').eq('id', courseId).maybeSingle();
    const certificate_no = `SAV-${new Date().getFullYear()}-${student.id.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    setPreview(`${student.full_name} · ${course.title} · ${certificate_no}`);
    const { error } = await supabase.from('certificates').insert({
      student_id: student.id,
      course_id: courseId,
      certificate_no,
      student_name: student.full_name,
      course_title: courseRow?.title ?? course.title,
      grade: 'Completed',
      issue_date: new Date().toISOString().slice(0, 10),
      course_start: courseRow?.start_date ?? null,
      course_end: courseRow?.end_date ?? null,
      instructor_name: 'Savvy Training Institute',
    });
    if (error) return onNotice(friendlyError(error, 'certificate'));
    await supabase.rpc('write_audit', { p_action: 'certificate.issue', p_entity: 'certificates', p_entity_id: certificate_no, p_detail: { student_id: student.id } });
    onNotice('Certificate issued.');
  };
  return (
    <div className="editorial-card bg-surface p-5 flex flex-col gap-3">
      <select aria-label="Course" className="bg-background border border-border rounded-lg px-3 py-2 text-sm" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
      </select>
      <select aria-label="Student" className="bg-background border border-border rounded-lg px-3 py-2 text-sm" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
        {students.map((student) => <option key={student.id} value={student.id}>{student.full_name}</option>)}
      </select>
      {preview && <p className="text-xs text-muted-foreground">Preview: {preview}</p>}
      <button type="button" onClick={issue} className="pill-button-forest text-xs py-2.5 self-start">Issue certificate</button>
    </div>
  );
}

function MyAttendance({ staffId, onNotice }: { staffId?: string; onNotice: (text: string) => void }) {
  const [rows, setRows] = useState<{ id: string; attendance_date: string; check_in?: string; check_out?: string; status: string }[]>([]);
  const load = useCallback(async () => {
    if (!staffId) return;
    const { data } = await supabase.from('staff_attendance').select('*').eq('staff_id', staffId).order('attendance_date', { ascending: false });
    setRows(data ?? []);
  }, [staffId]);
  useEffect(() => { load(); }, [load]);
  const today = new Date().toISOString().slice(0, 10);
  const current = rows.find((row) => row.attendance_date === today);
  const checkIn = async () => {
    const { error } = await supabase.from('staff_attendance').upsert({ staff_id: staffId, attendance_date: today, check_in: new Date().toISOString(), status: 'present' }, { onConflict: 'staff_id,attendance_date' });
    onNotice(error ? friendlyError(error, 'records') : 'Checked in.');
    load();
  };
  const checkOut = async () => {
    if (!current) return onNotice('Check in before you check out.');
    const { error } = await supabase.from('staff_attendance').update({ check_out: new Date().toISOString() }).eq('id', current.id);
    onNotice(error ? friendlyError(error, 'records') : 'Checked out.');
    load();
  };
  return (
    <div className="editorial-card bg-surface p-5 flex flex-col gap-3">
      <div className="flex gap-2">
        <button type="button" onClick={checkIn} className="pill-button-forest text-xs py-2.5">Check in</button>
        <button type="button" onClick={checkOut} className="pill-button-secondary text-xs py-2.5">Check out</button>
      </div>
      {rows.length === 0 ? <Empty label="No attendance recorded yet." /> : rows.map((row) => (
        <p key={row.id} className="text-xs flex justify-between gap-3 border-b border-border py-2">
          <span>{row.attendance_date} · {row.status}</span>
          <span>{row.check_in ? new Date(row.check_in).toLocaleTimeString() : '—'} – {row.check_out ? new Date(row.check_out).toLocaleTimeString() : '—'}</span>
        </p>
      ))}
    </div>
  );
}
