'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { supabaseTablesReady } from '@/lib/supabase-schema';
import { friendlyError } from '@/lib/friendly-error';
import { formatStudy } from '@/lib/lessons';
import { coursesData } from '@/lib/data';
import { Panel, StatTile, Empty } from '@/components/portal/ui';
import { Loader2 } from 'lucide-react';

export type LmsSection =
  | 'approvals'
  | 'staff'
  | 'courseAdmin'
  | 'attendance'
  | 'study'
  | 'settings'
  | 'reports'
  | 'audit';

type StudentRow = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  enrollment_no: string;
  account_status: string;
  suspended_until?: string | null;
  course_interest?: string | null;
};

type StaffRow = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  account_status: string;
  can_attendance: boolean;
  can_videos: boolean;
  can_certificates: boolean;
  can_edit_courses: boolean;
};

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  duration?: string;
  fee?: string;
  expected_hours?: number | null;
  category?: string | null;
  attribution?: string | null;
  featured_image?: string;
  published?: boolean;
  archived?: boolean;
  certification?: string;
  eligibility?: string;
  training_mode?: string;
};

const inputClass = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-forest';

export function AdminLms({ section }: { section: LmsSection }) {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => { supabaseTablesReady().then(setReady); }, []);
  if (ready === null) return <p className="text-sm text-muted-foreground">Loading records</p>;
  if (!ready) {
    return <p className="rounded-xl border border-border bg-white p-5 text-sm">Reports and audit history are not available in this dashboard yet. Student, staff, course, and enrolment records remain available in their own sections.</p>;
  }
  if (section === 'approvals') return <Approvals />;
  if (section === 'staff') return <StaffAdmin />;
  if (section === 'courseAdmin') return <CourseAdmin />;
  if (section === 'attendance') return <AttendanceAdmin />;
  if (section === 'study') return <StudyAdmin />;
  if (section === 'settings') return <SettingsAdmin />;
  if (section === 'reports') return <ReportsAdmin />;
  return <AuditAdmin />;
}

export function AdminSummary() {
  const [stats, setStats] = useState<Record<string, number>>({});
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!(await supabaseTablesReady())) {
        const overview = await fetch('/api/workspace?resource=overview', { cache: 'no-store' }).then((response) => response.ok ? response.json() : null);
        if (!alive || !overview) return;
        setStats({
          students: overview.students ?? 0,
          pending: overview.pendingRequests ?? 0,
          active: overview.students ?? 0,
          staff: overview.staff ?? 0,
          courses: overview.courses ?? 0,
          published: overview.courses ?? 0,
          certs: 0,
          present: 0,
        });
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      const [students, pending, active, staff, courses, published, certs, attendance] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('account_status', 'pending'),
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('account_status', 'active'),
        supabase.from('staff').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('published', true).eq('archived', false),
        supabase.from('certificates').select('id', { count: 'exact', head: true }),
        supabase.from('student_attendance').select('id', { count: 'exact', head: true }).eq('attendance_date', today).eq('status', 'present'),
      ]);
      if (!alive) return;
      setStats({
        students: students.count ?? 0,
        pending: pending.count ?? 0,
        active: active.count ?? 0,
        staff: staff.count ?? 0,
        courses: courses.count ?? 0,
        published: published.count ?? 0,
        certs: certs.count ?? 0,
        present: attendance.count ?? 0,
      });
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatTile label="Total students" value={stats.students ?? '—'} />
      <StatTile label="Pending approvals" value={stats.pending ?? '—'} />
      <StatTile label="Active students" value={stats.active ?? '—'} />
      <StatTile label="Staff" value={stats.staff ?? '—'} />
      <StatTile label="Courses" value={stats.courses ?? '—'} />
      <StatTile label="Published courses" value={stats.published ?? '—'} />
      <StatTile label="Certificates" value={stats.certs ?? '—'} />
      <StatTile label="Present today" value={stats.present ?? '—'} hint="Student attendance" />
    </div>
  );
}

function Notice({ text }: { text: string }) {
  if (!text) return null;
  return <p role="status" className="text-xs rounded-lg border border-border bg-background px-3 py-2">{text}</p>;
}

function Approvals() {
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [notice, setNotice] = useState('');
  const [suspendDate, setSuspendDate] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (error) setNotice(friendlyError(error, 'records'));
    else setRows((data as StudentRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => rows.filter((row) => {
    const hay = `${row.full_name} ${row.email} ${row.course_interest ?? ''}`.toLowerCase();
    const matchesQuery = hay.includes(query.trim().toLowerCase());
    const matchesStatus = status === 'all' || row.account_status === status;
    return matchesQuery && matchesStatus;
  }), [rows, query, status]);

  const setAccount = async (row: StudentRow, account_status: string, until?: string | null) => {
    const { error } = await supabase.from('students').update({
      account_status,
      suspended_until: account_status === 'suspended' ? until || null : null,
    }).eq('id', row.id);
    if (error) return setNotice(friendlyError(error, 'account'));
    await supabase.rpc('write_audit', {
      p_action: `student.${account_status}`,
      p_entity: 'students',
      p_entity_id: row.id,
      p_detail: { until: until ?? null },
    });
    setNotice(`${row.full_name} is now ${account_status}.`);
    load();
  };

  const remove = async (row: StudentRow) => {
    if (!window.confirm(`Delete ${row.full_name}'s account? This cannot be undone.`)) return;
    const { error } = await supabase.rpc('admin_delete_user', { p_user_id: row.id });
    if (error) return setNotice(friendlyError(error, 'account'));
    setNotice('Account deleted.');
    load();
  };

  return (
    <Panel title="Students" subtitle="Approve registrations and control who can sign in." action={
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" aria-label="Search students" className={inputClass} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className={inputClass}>
          {['all', 'pending', 'active', 'rejected', 'disabled', 'suspended'].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>
    }>
      <div className="flex flex-col gap-3">
        <Notice text={notice} />
        <label className="text-xs flex items-center gap-2">
          Suspension date
          <input type="date" value={suspendDate} onChange={(e) => setSuspendDate(e.target.value)} className={inputClass} />
        </label>
        {visible.length === 0 ? <Empty label="No students match this filter." /> : visible.map((row) => (
          <div key={row.id} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{row.full_name}</p>
                <p className="text-xs text-muted-foreground">{row.email} · {row.phone || 'No phone'} · {row.course_interest || 'No course chosen'}</p>
                <p className="text-[11px] uppercase tracking-wide text-forest mt-1">{row.account_status}{row.suspended_until ? ` until ${row.suspended_until}` : ''}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Mini onClick={() => setAccount(row, 'active')}>Approve</Mini>
                <Mini onClick={() => setAccount(row, 'rejected')}>Reject</Mini>
                <Mini onClick={() => setAccount(row, 'disabled')}>Disable</Mini>
                <Mini onClick={() => setAccount(row, 'suspended', suspendDate || null)}>Suspend</Mini>
                <Mini onClick={() => setAccount(row, 'active')}>Reactivate</Mini>
                <Mini onClick={() => remove(row)}>Delete</Mini>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function StaffAdmin() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', phone: '',
    can_attendance: true, can_videos: true, can_certificates: false, can_edit_courses: false, course_id: '',
  });

  const load = async () => {
    const [{ data: staff }, { data: courseRows }] = await Promise.all([
      supabase.from('staff').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('id, title, slug').order('sort_order'),
    ]);
    setRows((staff as StaffRow[]) ?? []);
    setCourses((courseRows as CourseRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    const { error } = await supabase.rpc('admin_create_staff', {
      p_full_name: form.full_name,
      p_email: form.email,
      p_password: form.password,
      p_phone: form.phone || null,
      p_can_attendance: form.can_attendance,
      p_can_videos: form.can_videos,
      p_can_certificates: form.can_certificates,
      p_can_edit_courses: form.can_edit_courses,
      p_course_ids: form.course_id ? [form.course_id] : [],
    });
    if (error) return setNotice(friendlyError(error, 'account'));
    setNotice('Staff account created.');
    setForm({ ...form, full_name: '', email: '', password: '', phone: '' });
    load();
  };

  const patch = async (row: StaffRow, changes: Partial<StaffRow>) => {
    const { error } = await supabase.from('staff').update(changes).eq('id', row.id);
    if (error) return setNotice(friendlyError(error, 'account'));
    await supabase.rpc('write_audit', { p_action: 'staff.update', p_entity: 'staff', p_entity_id: row.id, p_detail: changes });
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Create staff" subtitle="Only administrators can create staff. Staff cannot create administrators.">
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required placeholder="Full name" aria-label="Staff full name" className={inputClass} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input required type="email" placeholder="Email" aria-label="Staff email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="password" minLength={8} placeholder="Temporary password" aria-label="Staff password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Phone" aria-label="Staff phone" className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select aria-label="Assigned course" className={inputClass} value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
            <option value="">No course yet</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <div className="flex flex-wrap gap-3 text-xs items-center">
            <Check label="Attendance" checked={form.can_attendance} onChange={(v) => setForm({ ...form, can_attendance: v })} />
            <Check label="Videos" checked={form.can_videos} onChange={(v) => setForm({ ...form, can_videos: v })} />
            <Check label="Certificates" checked={form.can_certificates} onChange={(v) => setForm({ ...form, can_certificates: v })} />
            <Check label="Edit courses" checked={form.can_edit_courses} onChange={(v) => setForm({ ...form, can_edit_courses: v })} />
          </div>
          <button className="pill-button-forest text-xs py-2.5 md:col-span-2" type="submit">Create staff account</button>
          <Notice text={notice} />
        </form>
      </Panel>
      <Panel title="Staff accounts">
        <div className="flex flex-col gap-3">
          {rows.length === 0 ? <Empty label="No staff accounts yet." /> : rows.map((row) => (
            <div key={row.id} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-2">
              <p className="text-sm font-semibold">{row.full_name}</p>
              <p className="text-xs text-muted-foreground">{row.email} · {row.account_status}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Mini onClick={() => patch(row, { account_status: 'active', can_attendance: row.can_attendance })}>Enable</Mini>
                <Mini onClick={() => patch(row, { account_status: 'disabled' })}>Disable</Mini>
                <Mini onClick={() => patch(row, { account_status: 'suspended' })}>Suspend</Mini>
                <Mini onClick={() => patch(row, { can_certificates: !row.can_certificates })}>
                  {row.can_certificates ? 'Revoke certificates' : 'Allow certificates'}
                </Mini>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function CourseAdmin() {
  const [rows, setRows] = useState<CourseRow[]>([]);
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState<CourseRow | null>(null);
  const blank: CourseRow = {
    id: '', title: '', slug: '', short_description: '', description: '', duration: '', fee: '',
    expected_hours: 40, category: '', attribution: '', featured_image: '', published: false, archived: false,
    certification: '', eligibility: 'As published by the institute', training_mode: 'Classroom & Online',
  };
  const [form, setForm] = useState<CourseRow>(blank);

  const load = async () => {
    const { data, error } = await supabase.from('courses').select('*').order('sort_order');
    if (error) setNotice(friendlyError(error, 'course'));
    else setRows((data as CourseRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      short_description: form.short_description || form.title,
      description: form.description || form.short_description || form.title,
      duration: form.duration || 'To be announced',
      fee: form.fee || 'Contact office',
      expected_hours: Number(form.expected_hours) || 40,
      category: form.category || null,
      attribution: form.attribution || null,
      featured_image: form.featured_image || coursesData[0]?.featured_image || '',
      published: Boolean(form.published) && !form.archived,
      archived: Boolean(form.archived),
      certification: form.certification || form.title,
      eligibility: form.eligibility || 'As published by the institute',
      training_mode: form.training_mode || 'Classroom & Online',
    };
    const query = editing
      ? supabase.from('courses').update(payload).eq('id', editing.id)
      : supabase.from('courses').insert(payload);
    const { error } = await query;
    if (error) return setNotice(friendlyError(error, 'course'));
    await supabase.rpc('write_audit', { p_action: editing ? 'course.update' : 'course.create', p_entity: 'courses', p_entity_id: editing?.id ?? payload.slug, p_detail: { published: payload.published } });
    setNotice(editing ? 'Course updated.' : 'Course created.');
    setEditing(null);
    setForm(blank);
    load();
  };

  const toggle = async (row: CourseRow) => {
    const published = !row.published;
    const { error } = await supabase.from('courses').update({ published, archived: published ? false : row.archived }).eq('id', row.id);
    if (error) return setNotice(friendlyError(error, 'course'));
    await supabase.rpc('write_audit', { p_action: published ? 'course.publish' : 'course.unpublish', p_entity: 'courses', p_entity_id: row.id, p_detail: {} });
    load();
  };

  const remove = async (row: CourseRow) => {
    const { count } = await supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('course_id', row.id);
    if ((count ?? 0) > 0) {
      if (!window.confirm(`${row.title} has enrolments. Archive it instead of deleting?`)) return;
      const { error } = await supabase.from('courses').update({ archived: true, published: false }).eq('id', row.id);
      if (error) return setNotice(friendlyError(error, 'course'));
      setNotice('Course archived. It is hidden from the public catalog.');
    } else if (window.confirm(`Delete ${row.title}?`)) {
      const { error } = await supabase.from('courses').delete().eq('id', row.id);
      if (error) return setNotice(friendlyError(error, 'course'));
      setNotice('Course deleted.');
    } else return;
    await supabase.rpc('write_audit', { p_action: 'course.remove', p_entity: 'courses', p_entity_id: row.id, p_detail: {} });
    load();
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel title={editing ? 'Edit course' : 'New course'} subtitle="Publishing a course shows it on the public catalog. Turning it off hides it.">
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required aria-label="Course title" placeholder="Title" className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input aria-label="Course slug" placeholder="Slug" className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <textarea aria-label="Short description" placeholder="Short description" className={inputClass} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
          <textarea aria-label="Attribution" placeholder="Attribution — leave blank unless a third party owns this credential" className={inputClass} value={form.attribution ?? ''} onChange={(e) => setForm({ ...form, attribution: e.target.value })} />
          <input aria-label="Duration" placeholder="Duration" className={inputClass} value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          <input aria-label="Expected study hours" type="number" min={1} placeholder="Expected hours" className={inputClass} value={form.expected_hours ?? 40} onChange={(e) => setForm({ ...form, expected_hours: Number(e.target.value) })} />
          <input aria-label="Category" placeholder="Category" className={inputClass} value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input aria-label="Fee" placeholder="Fee" className={inputClass} value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} />
          <label className="text-xs flex items-center gap-2">
            <input type="checkbox" checked={Boolean(form.published)} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            Published on the website
          </label>
          <button className="pill-button-forest text-xs py-2.5" type="submit">{editing ? 'Save course' : 'Create course'}</button>
          <Notice text={notice} />
        </form>
      </Panel>
      <Panel title="Course visibility">
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.id} className="border border-border rounded-xl p-4 bg-background flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.archived ? 'Archived' : row.published ? 'Visible on the website' : 'Hidden'}{row.attribution ? ` · ${row.attribution}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" aria-pressed={Boolean(row.published)} onClick={() => toggle(row)} className={`text-xs px-3 py-1.5 rounded-full border ${row.published ? 'bg-forest text-white border-forest' : 'border-border'}`}>
                  {row.published ? 'ON' : 'OFF'}
                </button>
                <Mini onClick={() => { setEditing(row); setForm(row); }}>Edit</Mini>
                <Mini onClick={() => remove(row)}>Delete</Mini>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function AttendanceAdmin() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<{ student_id: string; full_name: string; status: string; note: string }[]>([]);
  const [staffRows, setStaffRows] = useState<{ id: string; full_name: string; attendance_date: string; check_in?: string; check_out?: string; status: string }[]>([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    supabase.from('courses').select('id, title, slug').order('sort_order').then(({ data }) => {
      const list = (data as CourseRow[]) ?? [];
      setCourses(list);
      if (list[0]) setCourseId(list[0].id);
    });
    supabase.from('staff_attendance').select('id, attendance_date, check_in, check_out, status, staff(full_name)').order('attendance_date', { ascending: false }).limit(30).then(({ data }) => {
      setStaffRows(((data as unknown as { id: string; attendance_date: string; check_in?: string; check_out?: string; status: string; staff?: { full_name: string } }[]) ?? []).map((row) => ({
        id: row.id, full_name: row.staff?.full_name ?? 'Staff', attendance_date: row.attendance_date, check_in: row.check_in, check_out: row.check_out, status: row.status,
      })));
    });
  }, []);

  useEffect(() => {
    if (!courseId) return;
    supabase.from('enrollments').select('student_id, students(full_name)').eq('course_id', courseId).then(async ({ data }) => {
      const enrolled = ((data as unknown as { student_id: string; students?: { full_name: string } }[]) ?? []).map((row) => ({
        student_id: row.student_id,
        full_name: row.students?.full_name ?? 'Student',
        status: 'present',
        note: '',
      }));
      const { data: existing } = await supabase.from('student_attendance').select('student_id, status, note').eq('course_id', courseId).eq('attendance_date', date);
      const known = new Map((existing ?? []).map((row) => [row.student_id, row]));
      setStudents(enrolled.map((row) => known.has(row.student_id) ? { ...row, status: known.get(row.student_id)!.status, note: known.get(row.student_id)!.note ?? '' } : row));
    });
  }, [courseId, date]);

  const save = async () => {
    const payload = students.map((row) => ({
      student_id: row.student_id,
      course_id: courseId,
      attendance_date: date,
      status: row.status,
      note: row.note || null,
    }));
    const { error } = await supabase.from('student_attendance').upsert(payload, { onConflict: 'student_id,course_id,attendance_date' });
    setNotice(error ? friendlyError(error, 'records') : 'Attendance saved.');
  };

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Student attendance" subtitle="One record per student, course, and date.">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <select aria-label="Course" className={inputClass} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
            <input aria-label="Attendance date" type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {students.length === 0 ? <Empty label="No enrolled students for this course." /> : students.map((row, index) => (
            <div key={row.student_id} className="grid grid-cols-1 md:grid-cols-[1fr_140px_1fr] gap-2 items-center">
              <span className="text-sm">{row.full_name}</span>
              <select aria-label={`Status for ${row.full_name}`} className={inputClass} value={row.status} onChange={(e) => setStudents(students.map((item, i) => i === index ? { ...item, status: e.target.value } : item))}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
              <input aria-label={`Note for ${row.full_name}`} placeholder="Optional note" className={inputClass} value={row.note} onChange={(e) => setStudents(students.map((item, i) => i === index ? { ...item, note: e.target.value } : item))} />
            </div>
          ))}
          <button type="button" onClick={save} className="pill-button-forest text-xs py-2.5 self-start">Save attendance</button>
          <Notice text={notice} />
        </div>
      </Panel>
      <Panel title="Staff attendance">
        {staffRows.length === 0 ? <Empty label="No staff attendance yet." /> : (
          <ul className="flex flex-col gap-2 text-xs">
            {staffRows.map((row) => (
              <li key={row.id} className="flex justify-between gap-3 border-b border-border py-2">
                <span>{row.full_name}</span>
                <span>{row.attendance_date} · {row.status} · {row.check_in ? new Date(row.check_in).toLocaleTimeString() : '—'} to {row.check_out ? new Date(row.check_out).toLocaleTimeString() : '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function StudyAdmin() {
  const [rows, setRows] = useState<{ student_id: string; course_id: string; seconds: number }[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    Promise.all([
      supabase.from('learning_sessions').select('student_id, course_id, credited_seconds'),
      supabase.from('students').select('id, full_name'),
      supabase.from('courses').select('id, title'),
    ]).then(([sessions, students, courses]) => {
      const totals = new Map<string, { student_id: string; course_id: string; seconds: number }>();
      for (const row of sessions.data ?? []) {
        const key = `${row.student_id}:${row.course_id}`;
        const current = totals.get(key) ?? { student_id: row.student_id, course_id: row.course_id, seconds: 0 };
        current.seconds += row.credited_seconds ?? 0;
        totals.set(key, current);
      }
      setRows([...totals.values()]);
      const map: Record<string, string> = {};
      for (const student of students.data ?? []) map[student.id] = student.full_name;
      for (const course of courses.data ?? []) map[course.id] = course.title;
      setNames(map);
    });
  }, []);
  return (
    <Panel title="Study hours" subtitle="Active tracked time only. Idle and hidden tabs are not counted.">
      {rows.length === 0 ? <Empty label="No study time has been recorded yet." /> : (
        <ul className="flex flex-col gap-2 text-sm">
          {rows.map((row) => (
            <li key={`${row.student_id}-${row.course_id}`} className="flex justify-between gap-3 border-b border-border py-2">
              <span>{names[row.student_id] ?? 'Student'} · {names[row.course_id] ?? 'Course'}</span>
              <span>{formatStudy(row.seconds)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function SettingsAdmin() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('Savvy Training Institute');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let alive = true;
    (async () => {
      if (await supabaseTablesReady()) {
        const { data, error } = await supabase.from('website_settings').select('show_recognitions, institute_name').eq('id', 1).maybeSingle();
        if (!alive || error || !data) return;
        setShow(Boolean(data.show_recognitions));
        setName(data.institute_name || 'Savvy Training Institute');
        return;
      }
      const response = await fetch('/api/website-settings', { cache: 'no-store' });
      const data = await response.json().catch(() => null);
      if (!alive || !response.ok || !data) return;
      setShow(data.show_recognitions === true);
      setName(data.institute_name || 'Savvy Training Institute');
    })();
    return () => { alive = false; };
  }, []);
  const save = async () => {
    if (await supabaseTablesReady()) {
      const { error } = await supabase.from('website_settings').update({ show_recognitions: show, institute_name: name, updated_at: new Date().toISOString() }).eq('id', 1);
      setNotice(error ? friendlyError(error, 'records') : 'Website settings saved.');
      if (!error) await supabase.rpc('write_audit', { p_action: 'settings.update', p_entity: 'website_settings', p_entity_id: '1', p_detail: { show_recognitions: show } });
      return;
    }
    const response = await fetch('/api/website-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_recognitions: show, institute_name: name }),
    });
    const data = await response.json().catch(() => null);
    setNotice(response.ok ? 'Website settings saved.' : (data?.message || 'Website settings could not be saved.'));
  };
  return (
    <Panel title="Website settings" subtitle="These changes appear on the public site without a new deployment.">
      <div className="flex flex-col gap-3 max-w-md">
        <label className="text-xs flex items-center justify-between gap-3 border border-border rounded-lg px-3 py-2">
          <span>Show “Trusted standards & recognitions”</span>
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} aria-label="Show recognitions section" />
        </label>
        <input aria-label="Institute display name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" onClick={save} className="pill-button-forest text-xs py-2.5 self-start">Save settings</button>
        <Notice text={notice} />
      </div>
    </Panel>
  );
}

function ReportsAdmin() {
  return (
    <Panel title="Reports" subtitle="Live counts from the institute database.">
      <AdminSummary />
    </Panel>
  );
}

function AuditAdmin() {
  const [rows, setRows] = useState<{ id: string; action: string; entity?: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from('audit_logs').select('id, action, entity, created_at').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      setRows(data ?? []);
      setLoading(false);
    });
  }, []);
  return (
    <Panel title="Audit log">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : rows.length === 0 ? <Empty label="No audited changes yet." /> : (
        <ul className="flex flex-col gap-2 text-xs">
          {rows.map((row) => (
            <li key={row.id} className="flex justify-between gap-3 border-b border-border py-2">
              <span>{row.action} · {row.entity}</span>
              <span className="text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Mini({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="text-[11px] px-2.5 py-1.5 rounded-full border border-border hover:border-forest">{children}</button>;
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
