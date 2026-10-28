'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { InstituteIdentity, RoleAccessPanel } from '@/components/dashboard/Learning';

type Person = { id: string; fullName: string; email: string; phone: string; role: string; status: string; createdAt: string; permissions?: Record<string, boolean> };
type Course = {
  id: string; title: string; duration: string; categoryId: string; categoryName: string; href: string;
  description?: string; shortDescription?: string; custom?: boolean; fee?: string; priceInr?: number | null;
  expectedHours?: number | null; manualStudyHours?: number | null; manualChapterCount?: number | null; chapterCount?: number; image?: string;
  certification?: string; prerequisites?: string[]; outcomes?: string[]; visible?: boolean;
};
type Category = { id: string; name: string; description: string; active: boolean; courseCount: number };
type RequestRow = { id: string; studentName: string; courseTitle: string; categoryName: string; status: string; createdAt: string; reason?: string | null };
type Mark = { id: string; name: string; role: string; date: string; status: string; courseTitle: string; markedByName: string };

const field = 'w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm focus:border-forest focus:outline-none';

async function post(body: object) {
  const response = await fetch('/api/workspace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, payload };
}

export function PeopleDirectory({ role }: { role: 'student' | 'staff' }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [links, setLinks] = useState<{ accountId: string; courseId: string; status: string; courseTitle?: string }[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<Person | null>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const [accounts, programs] = await Promise.all([
      fetch('/api/accounts', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/programs', { cache: 'no-store' }).then((response) => response.json()),
    ]);
    setPeople((accounts.accounts ?? []).filter((account: Person) => account.role === role));
    setCourses(programs.programs ?? []);
  }, [role]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selected) return;
    fetch('/api/workspace?resource=requests', { cache: 'no-store' }).then((response) => response.json()).then((body) => {
      setLinks((body.requests ?? []).filter((row: { accountId: string }) => row.accountId === selected.id));
    }).catch(() => undefined);
  }, [selected]);

  const rows = people.filter((person) => {
    const hay = `${person.fullName} ${person.email} ${person.phone}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase()) && (status === 'all' || person.status === status);
  });

  const toggle = async (person: Person) => {
    const next = person.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`${next === 'inactive' ? 'Deactivate' : 'Activate'} ${person.fullName}?`)) return;
    const response = await fetch('/api/accounts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: person.id, status: next }) });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? `${person.fullName} is now ${next}.` : body.message);
    load();
  };

  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{role === 'student' ? 'Students' : 'Staff'}</h2>
          <p className="text-sm text-muted-foreground">{rows.length} {role} account{rows.length === 1 ? '' : 's'}</p>
        </div>
        <div className="flex gap-2">
          <input className={field} placeholder="Search name, email, or phone" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className={field} value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      {notice && <p className="mt-3 rounded-lg border border-forest/30 bg-forest/10 px-3 py-2 text-sm">{notice}</p>}
      {rows.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No {role} accounts match that search.</p> : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>{['Name', 'Email', 'Phone', 'Joined', 'Status', 'Actions'].map((heading) => <th key={heading} className="py-2 pr-3">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((person) => (
                <tr key={person.id} className="border-t border-border">
                  <td className="py-3 pr-3">{person.fullName}</td>
                  <td className="py-3 pr-3">{person.email}</td>
                  <td className="py-3 pr-3">{person.phone}</td>
                  <td className="py-3 pr-3">{person.createdAt.slice(0, 10)}</td>
                  <td className="py-3 pr-3 capitalize">{person.status}</td>
                  <td className="py-3">
                    <button type="button" className="mr-3 text-forest underline" onClick={() => setSelected(person)}>View</button>
                    <button type="button" className="text-forest underline" onClick={() => toggle(person)}>{person.status === 'active' ? 'Deactivate' : 'Activate'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selected && (
        <div className="mt-4 rounded-xl border border-border bg-[#f7faf9] p-4 text-sm">
          <div className="flex justify-between gap-3">
            <h3 className="font-semibold">{selected.fullName}</h3>
            <button type="button" className="text-forest" onClick={() => setSelected(null)}>Close</button>
          </div>
          <p>{selected.email} · {selected.phone}</p>
          <p className="mt-2 font-medium">Courses</p>
          <ul className="mt-1">
            {links.length === 0 && <li className="text-muted-foreground">No course records for this account.</li>}
            {links.map((link) => <li key={`${link.courseTitle}-${link.status}`}>{link.courseTitle} · {link.status}</li>)}
          </ul>
          {role === 'staff' && <PermissionEditor person={selected} onSaved={(message) => { setNotice(message); load(); }} />}
        </div>
      )}
      <p className="sr-only">{courses.length}</p>
    </section>
  );
}

function PermissionEditor({ person, onSaved }: { person: Person; onSaved: (message: string) => void }) {
  const [permissions, setPermissions] = useState(person.permissions ?? {});
  const keys = [
    ['viewAssignedCourses', 'View assigned courses'],
    ['viewAllCourses', 'View all courses'],
    ['manageCourses', 'Create courses'],
    ['editCourses', 'Edit courses'],
    ['manageChapters', 'Manage chapters'],
    ['addChapters', 'Add chapters'],
    ['editChapters', 'Edit chapters'],
    ['publishChapters', 'Publish chapters'],
    ['uploadMaterials', 'Upload course materials'],
    ['viewStudents', 'View student records'],
    ['viewEnrolledStudents', 'View enrolled student lists'],
    ['assignTeachingStaff', 'Assign teaching staff'],
    ['manageEnrolments', 'Manage enrolments'],
    ['viewEnrollments', 'View enrolment requests'],
    ['markAttendance', 'Mark student attendance'],
    ['manageAnnouncements', 'Manage announcements'],
  ] as const;
  const save = async () => {
    const result = await post({ resource: 'permissions', accountId: person.id, permissions });
    onSaved(result.ok ? 'Permissions saved.' : (result.payload.message || 'Permissions were not saved.'));
  };
  return (
    <div className="mt-3">
      <p className="font-medium">Permissions</p>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {keys.map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={Boolean(permissions[key])} onChange={(event) => setPermissions({ ...permissions, [key]: event.target.checked })} />
            {label}
          </label>
        ))}
      </div>
      <button type="button" className="pill-button-forest mt-3 px-4 py-2 text-sm" onClick={save}>Save permissions</button>
    </div>
  );
}

export function EnrollmentQueue() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [filter, setFilter] = useState('requested');
  const [notice, setNotice] = useState('');
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    const response = await fetch('/api/workspace?resource=requests', { cache: 'no-store' });
    const body = await response.json();
    setRows(body.requests ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const visible = rows.filter((row) => filter === 'all' || row.status === filter);
  const review = async (id: string, decision: 'approved' | 'rejected') => {
    const result = await post({ resource: 'review-enrollment', id, decision, reason });
    setNotice(result.ok ? `Request ${decision}.` : (result.payload.message || 'The request was not updated.'));
    if (result.ok) load();
  };

  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Enrolment requests</h2>
          <p className="text-sm text-muted-foreground">Requests stay here after a refresh. Approving adds the course to the student.</p>
        </div>
        <select className={field} value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="requested">Pending</option>
          <option value="enrolled">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>
      {notice && <p className="mt-3 text-sm">{notice}</p>}
      {visible.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No enrolment requests with that status.</p> : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground"><tr>{['Student', 'Course', 'Category', 'Requested', 'Status', 'Actions'].map((heading) => <th key={heading} className="py-2 pr-3">{heading}</th>)}</tr></thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="py-3 pr-3">{row.studentName}</td>
                  <td className="py-3 pr-3">{row.courseTitle}</td>
                  <td className="py-3 pr-3">{row.categoryName}</td>
                  <td className="py-3 pr-3">{row.createdAt.slice(0, 10)}</td>
                  <td className="py-3 pr-3 capitalize">{row.status === 'requested' ? 'Pending' : row.status}</td>
                  <td className="py-3">
                    {row.status === 'requested' && (
                      <span className="flex gap-3">
                        <button type="button" className="text-forest underline" onClick={() => review(row.id, 'approved')}>Approve</button>
                        <button type="button" className="text-forest underline" onClick={() => review(row.id, 'rejected')}>Reject</button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <label className="mt-3 block text-xs font-semibold">Rejection reason
        <input className={`${field} mt-1 font-normal`} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Optional reason shown to the student" />
      </label>
    </section>
  );
}

export function CourseDesk() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const blank = { id: '', title: '', shortDescription: '', description: '', duration: '', price: '', studyHours: '', chapterCount: '', categoryId: '', certificate: '', prerequisites: '', outcomes: '', visible: true };
  const [course, setCourse] = useState(blank);
  const [image, setImage] = useState<File | null>(null);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    const response = await fetch('/api/workspace?resource=categories', { cache: 'no-store' });
    const body = await response.json();
    setCategories(body.categories ?? []);
    setCourses(body.courses ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const addCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await post({ resource: 'category', name, description, active: true });
    setNotice(result.ok ? 'Category saved.' : result.payload.message);
    if (result.ok) { setName(''); setDescription(''); load(); }
  };
  const addCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await post({
      resource: 'course',
      id: course.id || undefined,
      title: course.title,
      shortDescription: course.shortDescription,
      description: course.description,
      duration: course.duration,
      priceInr: course.price,
      studyHours: course.studyHours,
      manualChapterCount: course.chapterCount,
      categoryId: course.categoryId,
      certificate: course.certificate,
      prerequisites: course.prerequisites,
      outcomes: course.outcomes,
      visible: course.visible,
    });
    if (!result.ok) { setNotice(result.payload.message); return; }
    const courseId = course.id || result.payload.course?.id;
    if (image && courseId) {
      const form = new FormData();
      form.set('courseId', courseId);
      form.set('file', image);
      const upload = await fetch('/api/course-images', { method: 'POST', body: form });
      const uploaded = await upload.json().catch(() => ({}));
      if (!upload.ok) { setNotice(uploaded.message || 'The course was saved, but the image was not.'); load(); return; }
    }
    setNotice(course.id ? 'Course updated.' : 'Course saved. It is now on the website.');
    setCourse(blank);
    setImage(null);
    load();
  };
  const editCourse = (item: Course) => {
    setCourse({
      id: item.id,
      title: item.title,
      shortDescription: item.shortDescription || '',
      description: item.description || '',
      duration: item.duration,
      price: item.priceInr != null ? String(item.priceInr) : '',
      studyHours: item.manualStudyHours != null ? String(item.manualStudyHours) : '',
      chapterCount: item.manualChapterCount != null ? String(item.manualChapterCount) : '',
      categoryId: item.categoryId || '',
      certificate: item.certification || '',
      prerequisites: (item.prerequisites ?? []).join('\n'),
      outcomes: (item.outcomes ?? []).join('\n'),
      visible: item.visible !== false,
    });
    setImage(null);
    document.getElementById('courseAdmin')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const move = async (courseId: string, categoryId: string) => {
    const result = await post({ resource: 'assign-category', courseId, categoryId });
    setNotice(result.ok ? 'Course moved.' : result.payload.message);
    if (result.ok) load();
  };

  const visible = courses.filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()));
  const groups = useMemo(() => {
    const names = ['Uncategorised', ...categories.map((item) => item.name)];
    return names.map((label) => ({ label, courses: visible.filter((course) => (course.categoryName || 'Uncategorised') === label) })).filter((group) => group.courses.length);
  }, [categories, visible]);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-lg font-semibold">Manage categories</h2>
        <form onSubmit={addCategory} className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
          <input required className={field} placeholder="Category name" value={name} onChange={(event) => setName(event.target.value)} />
          <input className={field} placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
          <button className="pill-button-forest py-2.5 text-sm" type="submit">Add category</button>
        </form>
        <ul className="mt-3 text-sm">{categories.map((category) => <li key={category.id}>{category.name} · {category.courseCount} course{category.courseCount === 1 ? '' : 's'} · {category.active ? 'Active' : 'Inactive'}</li>)}</ul>
      </section>
      <section id="courseAdmin" className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-lg font-semibold">{course.id ? 'Edit course' : 'Add a course'}</h2>
        <p className="mt-1 text-sm text-muted-foreground">Price is stored in rupees. Chapter hours replace the study-hours total once a chapter records them.</p>
        <form onSubmit={addCourse} className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          <input required className={field} placeholder="Course name" value={course.title} onChange={(event) => setCourse({ ...course, title: event.target.value })} />
          <input className={field} placeholder="Short description" value={course.shortDescription} onChange={(event) => setCourse({ ...course, shortDescription: event.target.value })} />
          <textarea className={`${field} md:col-span-2 min-h-24`} placeholder="Description" value={course.description} onChange={(event) => setCourse({ ...course, description: event.target.value })} />
          <input className={field} placeholder="Duration" value={course.duration} onChange={(event) => setCourse({ ...course, duration: event.target.value })} />
          <input className={field} inputMode="numeric" placeholder="Price in rupees" value={course.price} onChange={(event) => setCourse({ ...course, price: event.target.value })} />
          <input className={field} inputMode="numeric" placeholder="Study hours until chapters have hours" value={course.studyHours} onChange={(event) => setCourse({ ...course, studyHours: event.target.value })} />
          <input className={field} inputMode="numeric" placeholder="Chapter count until chapters exist" value={course.chapterCount} onChange={(event) => setCourse({ ...course, chapterCount: event.target.value })} />
          <select required={!course.id} className={field} value={course.categoryId} onChange={(event) => setCourse({ ...course, categoryId: event.target.value })}>
            <option value="">{course.id ? 'Keep current category' : 'Category'}</option>
            {categories.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <input className={field} placeholder="Certificate name" value={course.certificate} onChange={(event) => setCourse({ ...course, certificate: event.target.value })} />
          <textarea className={`${field} min-h-20`} placeholder="Prerequisites, one per line" value={course.prerequisites} onChange={(event) => setCourse({ ...course, prerequisites: event.target.value })} />
          <textarea className={`${field} min-h-20`} placeholder="Learning outcomes, one per line" value={course.outcomes} onChange={(event) => setCourse({ ...course, outcomes: event.target.value })} />
          <label className="text-sm">Course image (PNG or JPG)
            <input className={`${field} mt-1`} type="file" accept="image/png,image/jpeg" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={course.visible} onChange={(event) => setCourse({ ...course, visible: event.target.checked })} /> Visible on the website</label>
          <div className="flex gap-2">
            <button className="pill-button-forest py-2.5 text-sm" type="submit">{course.id ? 'Save course' : 'Add course'}</button>
            {course.id && <button className="rounded-full border border-border px-4 py-2.5 text-sm" type="button" onClick={() => { setCourse(blank); setImage(null); }}>Cancel</button>}
          </div>
        </form>
      </section>
      <section className="rounded-2xl border border-border bg-white p-5">
        <div className="flex justify-between gap-3">
          <h2 className="text-lg font-semibold">Courses</h2>
          <input className={field} placeholder="Search courses" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        {notice && <p className="mt-3 text-sm">{notice}</p>}
        {groups.map((group) => (
          <div key={group.label} className="mt-4">
            <h3 className="font-semibold">{group.label}</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {group.courses.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{item.title} · {item.duration}{item.fee ? ` · ${item.fee}` : ''} · {item.chapterCount ?? 0} chapters{item.visible === false ? ' · Hidden' : ''}</span>
                  <span className="flex items-center gap-2">
                    <button type="button" className="text-forest underline" onClick={() => editCourse(item)}>Edit</button>
                    <Link className="text-forest underline" href={`/admin/courses/${item.id}`}>View Course</Link>
                    {item.href && item.visible !== false && <a className="text-forest underline" href={item.href}>View on Website</a>}
                    <select className="rounded-lg border border-border px-2 py-1" value={item.categoryId} onChange={(event) => move(item.id, event.target.value)}>
                      <option value="">Uncategorised</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}

export function AttendanceRegister() {
  const [people, setPeople] = useState<Person[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [role, setRole] = useState<'student' | 'staff'>('student');
  const [accountId, setAccountId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [personQuery, setPersonQuery] = useState('');
  const [notice, setNotice] = useState('');

  const loadPeople = useCallback(async () => {
    const response = await fetch('/api/workspace?resource=directory', { cache: 'no-store' });
    const body = await response.json();
    setPeople(body.people ?? []);
  }, []);
  const loadMarks = useCallback(async () => {
    const params = new URLSearchParams({ resource: 'marks', role });
    if (accountId) params.set('accountId', accountId);
    if (date) params.set('date', date);
    if (courseId) params.set('courseId', courseId);
    const response = await fetch(`/api/workspace?${params.toString()}`, { cache: 'no-store' });
    const body = await response.json();
    setMarks(body.marks ?? []);
    setCourses(body.courses ?? []);
  }, [role, accountId, date, courseId]);
  useEffect(() => { loadPeople(); }, [loadPeople]);
  useEffect(() => { loadMarks(); }, [loadMarks]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await post({ resource: 'mark', accountId, courseId, date, status });
    setNotice(result.ok ? 'Attendance saved.' : (result.payload.message || 'Attendance was not saved.'));
    if (result.ok) loadMarks();
  };
  const options = people.filter((person) => person.role === role && person.fullName.toLowerCase().includes(personQuery.trim().toLowerCase()));

  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h2 className="text-lg font-semibold">{role === 'student' ? 'Student attendance' : 'Staff attendance'}</h2>
      <form onSubmit={save} className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
        <select className={field} value={role} onChange={(event) => { setRole(event.target.value as 'student' | 'staff'); setAccountId(''); }}>
          <option value="student">Student attendance</option>
          <option value="staff">Staff attendance</option>
        </select>
        <input className={field} placeholder={`Search ${role} name`} value={personQuery} onChange={(event) => setPersonQuery(event.target.value)} />
        <select required className={field} value={accountId} onChange={(event) => setAccountId(event.target.value)}>
          <option value="">Select {role}</option>
          {options.map((person) => <option key={person.id} value={person.id}>{person.fullName}</option>)}
        </select>
        <select className={field} value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          <option value="">All courses</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        <input required type="date" className={field} value={date} onChange={(event) => setDate(event.target.value)} />
        <select className={field} value={status} onChange={(event) => setStatus(event.target.value as 'present' | 'absent' | 'late')}>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
        <button className="pill-button-forest py-2.5 text-sm" type="submit">Save attendance</button>
      </form>
      {notice && <p className="mt-3 text-sm">{notice}</p>}
      {marks.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">No attendance marks match these filters. Missing dates are not treated as absent.</p> : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground"><tr>{['Date', 'Name', 'Course', 'Status', 'Marked by'].map((heading) => <th key={heading} className="py-2 pr-3">{heading}</th>)}</tr></thead>
            <tbody>
              {marks.map((mark) => (
                <tr key={mark.id} className="border-t border-border">
                  <td className="py-3 pr-3">{mark.date}</td>
                  <td className="py-3 pr-3">{mark.name}</td>
                  <td className="py-3 pr-3">{mark.courseTitle || '—'}</td>
                  <td className="py-3 pr-3 capitalize">{mark.status}</td>
                  <td className="py-3 pr-3">{mark.markedByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function AccountSettingsHub() {
  const [notifications, setNotifications] = useState<{ id: string; title: string; body: string; read: boolean; createdAt: string }[]>([]);
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; body: string; audience: string; published: boolean }[]>([]);
  const [leave, setLeave] = useState<{ id: string; name: string; startDate: string; endDate: string; reason: string; status: string }[]>([]);
  const [draft, setDraft] = useState({ title: '', body: '', audience: 'both' });
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const [notes, posts, leaveRows] = await Promise.all([
      fetch('/api/workspace?resource=notifications', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/workspace?resource=announcements', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/workspace?resource=leave', { cache: 'no-store' }).then((response) => response.json()),
    ]);
    setNotifications(notes.notifications ?? []);
    setAnnouncements(posts.announcements ?? []);
    setLeave(leaveRows.leave ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const publish = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await post({ resource: 'announcement', ...draft, published: true });
    setNotice(result.ok ? 'Announcement published.' : result.payload.message);
    if (result.ok) { setDraft({ title: '', body: '', audience: 'both' }); load(); }
  };
  const review = async (id: string, decision: 'approved' | 'rejected') => {
    const result = await post({ resource: 'review-leave', id, decision });
    setNotice(result.ok ? `Leave ${decision}.` : result.payload.message);
    if (result.ok) load();
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-border bg-white p-5">
        <div className="flex justify-between"><h2 className="text-lg font-semibold">Notifications</h2><button type="button" className="text-sm text-forest" onClick={() => post({ resource: 'read-notifications' }).then(load)}>Mark all read</button></div>
        {notifications.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No notifications yet.</p> : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">{notifications.slice(0, 8).map((item) => <li key={item.id} className="rounded-lg border border-border px-3 py-2"><strong>{item.title}</strong> {!item.read && <span className="text-forest"> · Unread</span>}<p>{item.body}</p></li>)}</ul>
        )}
      </section>
      <section className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-lg font-semibold">Announcements</h2>
        <form onSubmit={publish} className="mt-3 grid grid-cols-1 gap-2">
          <input required className={field} placeholder="Title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          <textarea required className={field} placeholder="Message" value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} />
          <select className={field} value={draft.audience} onChange={(event) => setDraft({ ...draft, audience: event.target.value })}>
            <option value="both">Staff and students</option>
            <option value="staff">Staff</option>
            <option value="students">Students</option>
          </select>
          <button className="pill-button-forest py-2.5 text-sm" type="submit">Publish announcement</button>
        </form>
        <ul className="mt-3 text-sm">{announcements.map((item) => <li key={item.id}>{item.title} · {item.audience}</li>)}</ul>
      </section>
      <section className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-lg font-semibold">Leave requests</h2>
        {leave.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No leave requests.</p> : leave.map((item) => (
          <div key={item.id} className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
            <span>{item.name}: {item.startDate} to {item.endDate} · {item.reason} · {item.status}</span>
            {item.status === 'pending' && <span className="flex gap-3"><button type="button" className="text-forest underline" onClick={() => review(item.id, 'approved')}>Approve</button><button type="button" className="text-forest underline" onClick={() => review(item.id, 'rejected')}>Reject</button></span>}
          </div>
        ))}
      </section>
      <InstituteIdentity />
      <RoleAccessPanel />
      {notice && <p className="text-sm">{notice}</p>}
    </div>
  );
}

export function LeaveForm() {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [rows, setRows] = useState<{ id: string; startDate: string; endDate: string; status: string }[]>([]);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    const response = await fetch('/api/workspace?resource=leave', { cache: 'no-store' });
    const body = await response.json();
    setRows(body.leave ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await post({ resource: 'leave', ...form });
    setNotice(result.ok ? 'Leave request submitted.' : result.payload.message);
    if (result.ok) load();
  };
  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <h2 className="text-lg font-semibold">Leave</h2>
      <form onSubmit={submit} className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        <input required type="date" className={field} value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
        <input required type="date" className={field} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
        <input required className={`${field} md:col-span-2`} placeholder="Reason" value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
        <button className="pill-button-forest py-2.5 text-sm" type="submit">Request leave</button>
      </form>
      {notice && <p className="mt-2 text-sm">{notice}</p>}
      <ul className="mt-3 text-sm">{rows.map((row) => <li key={row.id}>{row.startDate} to {row.endDate} · {row.status}</li>)}</ul>
    </section>
  );
}
