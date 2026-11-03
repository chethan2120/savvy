'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, ShieldCheck, Award, Wrench, CheckCircle2 } from 'lucide-react';
import type { Course } from '@/lib/types';
import { gbpLabel, useShowCoursePrices } from '@/lib/public-price';
import { courseVisualBySrc } from '@/lib/course-visuals';
import { SavvyLogo } from '@/components/brand/SavvyLogo';

interface PopularCoursesSectionProps {
  courses: Course[];
  children?: React.ReactNode;
}

export function PopularCoursesSection({ courses, children }: PopularCoursesSectionProps) {
  const showPrices = useShowCoursePrices();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterTabs = ['All', ...Array.from(new Set(courses.map((course) => course.category).filter((name): name is string => Boolean(name))))];

  const filteredCourses = useMemo(() => {
    if (selectedFilter === 'All') return courses;
    return courses.filter((course) => course.category === selectedFilter);
  }, [courses, selectedFilter]);

  const toCard = (course: Course) => ({
    course,
    partner: course.category || 'Savvy Training Academy',
    title: course.title,
    badge: course.category?.split(' ')[0] || 'Course',
    type: course.training_mode || course.certification || 'Course',
    rating: course.rating && course.rating > 0 ? String(course.rating) : '',
    image: course.featured_image || '',
  });
  const teaching = courses.filter((course) => (course.category || '').toLowerCase().includes('teaching'));
  const online = courses.filter((course) => (course.category || '').toLowerCase().includes('online'));
  const other = courses.filter((course) => !teaching.includes(course) && !online.includes(course));

  const popularColumns = [
    { title: 'Teaching qualifications', href: '/teaching', items: teaching.slice(0, 2).map(toCard) },
    { title: 'Online courses', href: '/courses', items: online.slice(0, 2).map(toCard) },
    { title: 'More programmes', href: '/courses', items: (other.length ? other : courses).slice(0, 2).map(toCard) },
  ].filter((column) => column.items.length > 0);

  return (
    <>
    <section className="bg-white py-12 sm:py-16">
      <div className="site-container">
        {/* ========================================================= */}
        {/* 1. COURSERA EXACT: "New and popular" 3-Column Showcase    */}
        {/* ========================================================= */}
        <div className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#641B38] tracking-tight mb-6">
            New and popular
          </h2>

          <div className="reveal-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularColumns.map((col, colIdx) => {
              const panels = [
                'bg-[#F8EDF1] border-[#E8A6BC]',
                'bg-white border-[#EAD9E0]',
                'bg-[#FCF8F7] border-[#EAD9E0]',
              ];
              const panel = panels[colIdx % panels.length];
              return (
              <div
                key={colIdx}
                className={`${panel} rounded-[24px] p-4 sm:p-5 border flex flex-col justify-between`}
              >
                <div>
                  {/* Column Header Link with Arrow */}
                  <div className="mb-3.5">
                    <Link
                      href={col.href}
                      className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#641B38] hover:text-[#B83268] group transition-colors"
                    >
                      <span>{col.title}</span>
                      <ArrowRight className="w-4 h-4 text-[#641B38] group-hover:text-[#B83268] group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>

                  {/* Course Cards Inside Column */}
                  <div className="flex flex-col gap-3">
                    {col.items.map((item, itemIdx) => {
                      const courseTarget = item.course ? `/courses/${item.course.slug || item.course.id}` : '/courses';

                      return (
                        <Link
                          key={itemIdx}
                          href={courseTarget}
                          className="group flex items-center gap-3.5 rounded-2xl border border-[#EAD9E0] bg-white p-3 shadow-xs transition-all hover:shadow-md"
                        >
                          {/* Square Thumbnail with Badge Overlay */}
                          <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 bg-[#f4f7fb]">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={courseVisualBySrc(item.image)?.alt || item.title}
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#F8EDF1] text-xs font-bold text-[#B83268]">
                                {item.badge.slice(0, 2)}
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-[#B83268] text-[8px] font-extrabold text-white text-center py-0.5 uppercase tracking-wider">
                              {item.badge}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            {/* Partner Row */}
                            <div className="flex items-center gap-1 text-[11px] font-medium text-[#30262B] truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B83268]" />
                              <span className="truncate">{item.partner}</span>
                            </div>

                            {/* Course Title */}
                            <h3 className="text-xs sm:text-[13px] font-bold text-[#641B38] group-hover:text-[#B83268] transition-colors line-clamp-2 mt-0.5 leading-snug">
                              {item.title}
                            </h3>

                            {/* Format & Rating */}
                            <div className="flex items-center gap-1.5 text-[11px] text-[#30262B] mt-1">
                              <span>{item.type}</span>
                              {item.rating && (
                                <>
                                  <span>·</span>
                                  <div className="flex items-center gap-0.5 text-[#641B38] font-bold">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span>{item.rating}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
    {children}
    <section className="border-b border-[#EAD9E0] bg-white py-12 sm:py-16">
      <div className="site-container">
        {/* ========================================================= */}
        {/* 2. Full Course Catalogue Grid with Category Filter Tabs    */}
        {/* ========================================================= */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B83268]">
                Explore All Programmes
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#641B38] tracking-tight mt-1">
                Specialized Professional Certifications
              </h2>
            </div>

            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B83268] hover:text-[#641B38] transition-colors shrink-0"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Coursera-style Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedFilter === tab
                    ? 'bg-[#B83268] text-white shadow-xs'
                    : 'bg-white text-[#30262B] border border-[#EAD9E0] hover:border-[#B83268]/50 hover:text-[#641B38]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="reveal-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCourses.map((course) => {
              const price = showPrices ? gbpLabel(course) : null;

              return (
                <div
                  key={course.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#EAD9E0] border-t-4 border-t-[#B83268] bg-white shadow-sm transition-all duration-300 hover:border-[#B83268]/40 hover:shadow-md"
                >
                  {/* Course Image */}
                  <div className="relative aspect-[16/10] bg-[#3A2030] overflow-hidden flex items-center justify-center">
                    {course.featured_image ? (
                      <Image
                        src={course.featured_image}
                        alt={courseVisualBySrc(course.featured_image)?.alt || course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#641B38] flex flex-col justify-end p-5 text-white">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
                          {course.category || 'Certification'}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1 leading-snug line-clamp-1">
                          {course.title}
                        </h3>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-[#B83268] shadow-2xs z-10">
                      Professional Certificate
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                    <div>
                      {/* Organization Tag */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-[#EAD9E0] p-0.5 shrink-0 bg-white">
                          <SavvyLogo markClassName="w-full h-full object-contain" />
                        </div>
                        <span className="text-[11px] font-bold text-[#30262B] uppercase tracking-wider truncate">
                          Savvy Institute · UK Code Standards
                        </span>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-base font-bold text-[#641B38] group-hover:text-[#B83268] transition-colors leading-snug line-clamp-2 min-h-[44px]">
                        <Link href={`/courses/${course.slug || course.id}`}>
                          {course.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-[#30262B] line-clamp-2 mt-2 leading-relaxed font-normal">
                        {course.short_description || course.description}
                      </p>
                    </div>

                    {/* Price & Action Button */}
                    <div className="-mx-5 -mb-5 mt-5 flex items-center justify-between gap-3 border-t border-[#EAD9E0] bg-[#F8EDF1] px-5 py-4 sm:-mx-6 sm:-mb-6 sm:px-6">
                      {price && (
                      <div className="flex flex-col">
                        <span className="text-[10px] text-[#30262B] uppercase font-semibold">
                          Tuition Fee
                        </span>
                        <span className="text-base font-extrabold text-[#B83268]">
                          {price}
                        </span>
                      </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/courses/${course.slug || course.id}`}
                          className="px-3 py-1.5 rounded-lg border border-[#EAD9E0] text-xs font-semibold text-[#641B38] hover:border-[#B83268] hover:text-[#B83268] transition-colors"
                        >
                          Syllabus
                        </Link>
                        <Link
                          href={`/contact-us?course=${encodeURIComponent(course.slug || course.id)}&courseName=${encodeURIComponent(course.title)}`}
                          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#B83268] text-white text-xs font-bold hover:bg-[#641B38] transition-colors shadow-2xs"
                        >
                          <span>Enquire</span>
                          <ArrowRight className="w-3 h-3 text-white" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}