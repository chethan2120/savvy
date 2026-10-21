'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Clock, Star, Award, CheckCircle } from 'lucide-react';
import { Course } from '@/lib/types';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <article className="editorial-card group flex h-full flex-col overflow-hidden">
      {/* Course Image */}
      <div className="aspect-[16/9] relative overflow-hidden bg-muted-foreground/10">
        <Image
          src={course.featured_image}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-editorial motion-safe:group-hover:scale-[1.06]"
        />
        {/* Ink wash on hover so the white pills keep contrast over bright
            photography. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="accent-tag-periwinkle text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-subtle">
            {course.duration}
          </span>
          {course.placement_support && (
            <span className="bg-forest text-white text-[10px] font-medium px-2.5 py-1 rounded-full shadow-subtle flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> 100% Placement
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Star className="w-3.5 h-3.5 fill-current" /> {course.rating.toFixed(1)} / 5.0
            </span>
            <span className="font-semibold text-foreground bg-black/5 px-2.5 py-0.5 rounded-full">
              {course.fee}
            </span>
          </div>

          <h3 className="text-xl font-normal text-foreground group-hover:text-forest transition-colors leading-tight">
            {course.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {course.short_description}
          </p>
        </div>

        {/* Footer Meta & Action */}
        <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
          <span className="text-[11px] text-muted-foreground truncate max-w-[180px] flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-forest shrink-0" />
            <span className="truncate">{course.certification}</span>
          </span>

          {/* `stretched-link` makes the whole card tappable — a 44px text link
              in the corner was the only hit area on phones. */}
          <Link
            href={`/course/${course.slug}`}
            className="stretched-link inline-flex items-center gap-1 text-xs font-semibold text-foreground transition-colors group-hover:text-forest"
          >
            Details
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span className="sr-only"> about {course.title}</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
