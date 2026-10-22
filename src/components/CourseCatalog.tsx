'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Course } from '@/lib/types';
import { CourseGrid } from '@/components/CourseGrid';

export function CourseCatalog({ courses, error }: { courses: Course[]; error?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = useMemo(() => ['All', ...Array.from(new Set(courses.map((course) => course.category?.trim()).filter((value): value is string => Boolean(value))))], [courses]);
  const filteredCourses = useMemo(() => courses.filter((course) => {
    const query = searchQuery.trim().toLocaleLowerCase();
    const matchesQuery = !query || [course.title, course.short_description, course.description, course.category]
      .some((value) => value?.toLocaleLowerCase().includes(query));
    return matchesQuery && (selectedCategory === 'All' || course.category === selectedCategory);
  }), [courses, searchQuery, selectedCategory]);

  return (
    <section className="site-container" aria-label="Course catalogue">
      {error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-900">{error}</div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
            <label className="relative w-full max-w-md">
              <span className="sr-only">Search courses</span>
              <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search courses, skills or topics" className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm focus:border-forest focus:outline-none" />
            </label>
            <div className="flex flex-wrap gap-2" aria-label="Filter by category">
              {categories.map((category) => (
                <button key={category} type="button" aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)} className={`rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${selectedCategory === category ? 'bg-foreground text-white' : 'border border-border bg-background text-foreground/80 hover:border-foreground'}`}>
                  {category}
                </button>
              ))}
            </div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">{filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}</p>
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface py-16 text-center text-sm text-muted-foreground">There are no published courses to display yet.</div>
          ) : <CourseGrid courses={filteredCourses} />}
        </>
      )}
    </section>
  );
}
