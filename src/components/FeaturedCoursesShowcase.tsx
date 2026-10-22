'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CourseCard } from './CourseCard';
import { CourseGrid } from './CourseGrid';
import { Course } from '@/lib/types';

interface FeaturedCoursesShowcaseProps {
  courses: Course[];
}

/**
 * Featured courses told as a scroll story: the heading and the "View All Courses"
 * call to action stay pinned in the middle of the viewport while the course cards
 * drift past on alternating sides. Below the `lg` breakpoint it degrades to the
 * plain grid, and reduced-motion users get the grid too.
 */
export const FeaturedCoursesShowcase: React.FC<FeaturedCoursesShowcaseProps> = ({ courses }) => {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('[data-showcase-card]');
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 28 },
          {
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          }
        );
      });
    }, track);

    return () => ctx.revert();
  }, [courses.length]);

  return (
    <section className="site-container">
      {/* Mobile / tablet: plain grid with a normal header */}
      <div className="flex flex-col gap-10 lg:hidden">
        <div className="flex flex-col items-center text-center gap-4">
          <span className="accent-tag-pink">Featured Programs</span>
          <h2 className="text-h1 font-normal text-foreground">
            Industry-certified courses designed for professional growth
          </h2>
          <Link href="/course" className="pill-button-secondary text-xs py-3 px-6">
            View All Courses &rarr;
          </Link>
        </div>
        <CourseGrid courses={courses} />
      </div>

      {/* Desktop: pinned centre, cards scrolling past on alternating sides */}
      <div ref={track} className="hidden lg:block relative">
        {/* Pinned centre column. The absolute wrapper bounds the sticky element to
            this section, so it can never bleed into neighbouring sections.
            (No overflow-hidden here — it would break position: sticky.) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="sticky top-0 h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-5 text-center max-w-xl px-4">
              <span className="accent-tag-pink">Featured Programs</span>
              <h2 className="text-h1 font-normal text-foreground">
                Industry-certified courses designed for professional growth
              </h2>
              <Link href="/course" className="pill-button-secondary text-xs py-3 px-6 pointer-events-auto">
                View All Courses &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Card lanes. Cards sit above the centre text as they pass over it. */}
        <div className="relative z-20 flex flex-col gap-[26vh] py-[22vh]">
          {courses.map((course, i) => (
            <div
              key={course.id}
              data-showcase-card
              className={`w-[30%] max-w-[420px] ${i % 2 === 0 ? 'self-start' : 'self-end'}`}
            >
              <CourseCard course={course} priority={i < 2} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
