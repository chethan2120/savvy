'use client';

import React, { useCallback, useEffect, useState } from 'react';

type Course = { id: string; title: string };
type Chapter = { id: string; title: string };
type Material = {
  id: string;
  courseId: string;
  chapterId?: string | null;
  title: string;
  description: string;
  type: string;
  fileName?: string | null;
  externalUrl?: string | null;
  visibility: 'enrolled' | 'staff' | 'admin';
  createdAt: string;
};

const field = 'w-full rounded-lg border border-[#EAD9E0] bg-white px-3 py-2.5 text-sm';

export function InstituteMaterials({ courseId, chapters = [], readOnly = false }: { courseId?: string; chapters?: Chapter[]; readOnly?: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [rows, setRows] = useState<Material[]>([]);
  const [editing, setEditing] = useState<Material | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [chapterId, setChapterId] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [visibility, setVisibility] = useState<'enrolled' | 'staff' | 'admin'>('enrolled');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const response = await fetch(`/api/materials${courseId ? `?courseId=${encodeURIComponent(courseId)}` : ''}`, { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    setRows(body.materials ?? []);
    setCourses(body.courses ?? []);
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setSelectedCourse(courseId || '');
    setChapterId('');
    setExternalUrl('');
    setVisibility('enrolled');
    setFile(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData();
    if (editing) data.set('id', editing.id);
    data.set('title', title);
    data.set('description', description);
    data.set('courseId', courseId || selectedCourse);
    data.set('chapterId', chapterId);
    data.set('externalUrl', externalUrl);
    data.set('visibility', visibility);
    if (file) data.set('file', file);
    const response = await fetch('/api/materials', { method: 'POST', body: data });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setError(body.message || 'The material was not saved.'); return; }
    setNotice(editing ? 'Material updated.' : 'Material added.');
    reset();
    load();
  };

  const remove = async (row: Material) => {
    if (!window.confirm(`Delete “${row.title}”? The course itself will stay.`)) return;
    const response = await fetch('/api/materials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id }) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.message || 'The material was not deleted.'); return; }
    setNotice('Material deleted.');
    load();
  };

  const beginEdit = (row: Material) => {
    setEditing(row);
    setTitle(row.title);
    setDescription(row.description || '');
    setSelectedCourse(row.courseId);
    setChapterId(row.chapterId || '');
    setExternalUrl(row.externalUrl || '');
    setVisibility(row.visibility);
    setFile(null);
  };

  return (
    <section className="rounded-2xl border border-[#EAD9E0] bg-white p-5">
      <h2 className="text-lg font-semibold text-[#641B38]">Course material</h2>
      {!readOnly && <form onSubmit={save} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-xs font-semibold">Material title
          <input required className={`${field} mt-1 font-normal`} value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        {!courseId && (
          <label className="text-xs font-semibold">Course
            <select required className={`${field} mt-1 font-normal`} value={selectedCourse} onChange={(event) => setSelectedCourse(event.target.value)}>
              <option value="">Select a course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </label>
        )}
        {chapters.length > 0 && (
          <label className="text-xs font-semibold">Chapter
            <select className={`${field} mt-1 font-normal`} value={chapterId} onChange={(event) => setChapterId(event.target.value)}>
              <option value="">No chapter</option>
              {chapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.title}</option>)}
            </select>
          </label>
        )}
        <label className="text-xs font-semibold">Visibility
          <select className={`${field} mt-1 font-normal`} value={visibility} onChange={(event) => setVisibility(event.target.value as 'enrolled' | 'staff' | 'admin')}>
            <option value="enrolled">Enrolled students and staff</option>
            <option value="staff">Staff only</option>
            <option value="admin">Administrators only</option>
          </select>
        </label>
        <label className="text-xs font-semibold md:col-span-2">Description
          <textarea className={`${field} mt-1 font-normal`} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className="text-xs font-semibold">Upload file
          <input className="mt-1 block font-normal text-sm" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </label>
        <label className="text-xs font-semibold">External resource link
          <input className={`${field} mt-1 font-normal`} value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="https://" />
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button disabled={busy} className="rounded-full bg-[#B83268] px-4 py-2 text-sm font-semibold text-white" type="submit">{busy ? 'Saving…' : editing ? 'Save material' : '+ Add Material'}</button>
          {editing && <button type="button" className="rounded-full border border-[#EAD9E0] px-4 py-2 text-sm" onClick={reset}>Cancel</button>}
        </div>
      </form>}
      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
      {notice && <p className="mt-3 text-sm text-[#641B38]">{notice}</p>}
      <ul className="mt-5 flex flex-col gap-3">
        {rows.length === 0 && <li className="text-sm text-[#6B5A60]">No materials have been added.</li>}
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-[#EAD9E0] bg-[#FCF8F7] p-3 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#641B38]">{row.title}</p>
                <p className="text-xs text-[#6B5A60]">{courses.find((course) => course.id === row.courseId)?.title || 'Course'} · {row.type} · {row.visibility} · {new Intl.DateTimeFormat('en-GB').format(new Date(row.createdAt))}</p>
                {row.description && <p className="mt-1">{row.description}</p>}
              </div>
              <div className="flex gap-3 text-xs font-semibold">
                {row.externalUrl && <a className="text-[#B83268]" href={row.externalUrl} target="_blank" rel="noreferrer">Preview</a>}
                {row.fileName && <a className="text-[#B83268]" href={`/api/materials?id=${encodeURIComponent(row.id)}`}>Download</a>}
                {!readOnly && <button type="button" className="text-[#641B38]" onClick={() => beginEdit(row)}>Edit</button>}
                {!readOnly && <button type="button" className="text-red-700" onClick={() => remove(row)}>Delete</button>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
