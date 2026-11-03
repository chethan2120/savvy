'use client';

import React, { useCallback, useEffect, useState } from 'react';

type Course = { id: string; title: string; categoryId?: string };
type Category = { id: string; name: string; description: string; active: boolean; parentId?: string | null; courseCount: number };

const field = 'w-full rounded-lg border border-[#EAD9E0] bg-white px-3 py-2.5 text-sm';

export function CategoryDesk() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const response = await fetch('/api/workspace?resource=categories', { cache: 'no-store' });
    const body = await response.json();
    setCategories(body.categories ?? []);
    setCourses(body.courses ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const response = await fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'category', id: editing?.id, name, description, parentId: parentId || null, active: true }),
    });
    const body = await response.json();
    if (!response.ok) { setError(body.message || 'The category was not saved.'); return; }
    setNotice(editing ? 'Category updated.' : 'Category added.');
    setEditing(null);
    setName('');
    setDescription('');
    setParentId('');
    load();
  };

  const remove = async (category: Category) => {
    const linked = courses.filter((course) => course.categoryId === category.id);
    if (linked.length && !window.confirm(`${category.name} has ${linked.length} course(s). They must be reassigned before deletion. Continue to check?`)) return;
    if (!linked.length && !window.confirm(`Delete ${category.name}? Courses will not be deleted.`)) return;
    const response = await fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: 'delete-category', id: category.id }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.courses?.length ? `${body.message} ${body.courses.join(', ')}` : (body.message || 'The category was not deleted.'));
      return;
    }
    setNotice('Category deleted. No courses were removed.');
    load();
  };

  return (
    <section className="rounded-2xl border border-[#EAD9E0] bg-white p-5">
      <h2 className="text-lg font-semibold text-[#641B38]">Categories</h2>
      <p className="mt-1 text-sm text-[#30262B]">Manage the categories already used by the course catalogue.</p>
      <form onSubmit={save} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-xs font-semibold">Category name
          <input required className={`${field} mt-1 font-normal`} value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="text-xs font-semibold">Parent category
          <select className={`${field} mt-1 font-normal`} value={parentId} onChange={(event) => setParentId(event.target.value)}>
            <option value="">No parent</option>
            {categories.filter((category) => category.id !== editing?.id).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold md:col-span-2">Description
          <textarea className={`${field} mt-1 font-normal`} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <div className="flex gap-2">
          <button className="rounded-full bg-[#B83268] px-4 py-2 text-sm font-semibold text-white" type="submit">{editing ? 'Save category' : '+ Add Category'}</button>
          {editing && <button type="button" className="rounded-full border border-[#EAD9E0] px-4 py-2 text-sm" onClick={() => { setEditing(null); setName(''); setDescription(''); setParentId(''); }}>Cancel</button>}
        </div>
      </form>
      {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
      {notice && <p className="mt-3 text-sm text-[#641B38]">{notice}</p>}
      <div className="mt-6 flex flex-col gap-4">
        {categories.map((category) => {
          const linked = courses.filter((course) => course.categoryId === category.id);
          return (
            <article key={category.id} className="rounded-2xl border border-[#EAD9E0] bg-[#FCF8F7] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[#641B38]">{category.name}</h3>
                  {category.description && <p className="mt-1 text-sm text-[#30262B]">{category.description}</p>}
                  <p className="mt-1 text-xs text-[#6B5A60]">{linked.length} course{linked.length === 1 ? '' : 's'}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  <button type="button" className="font-semibold text-[#B83268]" onClick={() => { setEditing(category); setName(category.name); setDescription(category.description || ''); setParentId(category.parentId || ''); }}>Edit</button>
                  <button type="button" className="font-semibold text-red-700" onClick={() => remove(category)}>Delete</button>
                </div>
              </div>
              <ul className="mt-3 text-sm">
                {linked.length === 0 && <li className="text-[#6B5A60]">No courses are assigned to this category.</li>}
                {linked.map((course) => <li key={course.id}>• {course.title}</li>)}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
