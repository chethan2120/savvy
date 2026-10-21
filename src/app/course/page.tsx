'use client';

import React, { useEffect, useState } from 'react';
import { PageHero } from '@/components/PageHero';
import { CourseGrid } from '@/components/CourseGrid';
import { coursesData } from '@/lib/data';
import { supabaseTablesReady } from '@/lib/supabase-schema';
import type { Course } from '@/lib/types';
import { Search } from 'lucide-react';

export default function CourseListingPage() {
  const [catalog, setCatalog] = useState<Course[]>(coursesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    supabaseTablesReady().then((ready) => {
      if (!ready) return;
      import('@/lib/supabase').then(({ supabase }) => {
        supabase.from('courses').select('*').eq('published', true).order('sort_order').then(({ data, error }) => {
          if (!error && data) setCatalog((data as Course[]).filter((course) => course.archived !== true));
        });
      });
    });
  }, []);

  const categories = ['All', 'NDT', 'QA/QC', 'HVAC', 'Safety', 'BIM / Revit'];

  const filteredCourses = catalog.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.short_description.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'NDT') return matchesSearch && course.slug.includes('ndt');
    if (selectedFilter === 'QA/QC') return matchesSearch && (course.slug.includes('qa') || course.slug.includes('cswip'));
    if (selectedFilter === 'HVAC') return matchesSearch && course.slug.includes('hvac');
    if (selectedFilter === 'Safety') return matchesSearch && course.slug.includes('safety');
    if (selectedFilter === 'BIM / Revit') return matchesSearch && course.slug.includes('revit');

    return matchesSearch;
  });

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Full-bleed hero */}
      <PageHero
        breadcrumbs={[{ label: 'Courses' }]}
        title="Certified Training Programs"
        description={
          <>
            Explore industry-focused courses in Non-Destructive Testing (NDT Level II), QA/QC, Fire &amp;
            Safety, HVAC, Revit MEP, and CSWIP welding inspection with 100% placement support.
          </>
        }
        media={{
          type: 'video',
          src: '/video/hero-course.mp4',
          poster: '/images/course/ndt-level-2-course.png',
        }}
      />

      {/* Search & Filter Controls */}
      <section className="site-container">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by name or skill..."
              aria-label="Search courses"
              className="w-full bg-background border border-border rounded-full pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-forest"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  selectedFilter === cat
                    ? 'bg-foreground text-white'
                    : 'bg-background border border-border text-foreground/80 hover:border-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Course Cards Grid */}
      <section className="site-container">
        <CourseGrid courses={filteredCourses} />
      </section>
    </div>
  );
}
