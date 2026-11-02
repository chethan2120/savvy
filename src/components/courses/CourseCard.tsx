'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import type { Course } from '@/lib/types';
import { gbpLabel, useShowCoursePrices } from '@/lib/public-price';
import { courseVisualBySrc } from '@/lib/course-visuals';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const showPrices = useShowCoursePrices();
  const price = showPrices ? gbpLabel(course) : null;
  const [imgError, setImgError] = useState(false);

  const hasImage = Boolean(course.featured_image) && !imgError;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[#F0E2E7] overflow-hidden shadow-xs hover:shadow-lg hover:border-[#B14B6C]/50 transition-all duration-300">
      {/* Course Image */}
      <div className="relative aspect-[16/10] bg-[#3A2030] overflow-hidden flex items-center justify-center">
        {hasImage ? (
          <Image
            src={course.featured_image!}
            alt={courseVisualBySrc(course.featured_image)?.alt || course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          /* Fallback pattern only when no image exists or load fails */
          <div className="absolute inset-0 bg-gradient-to-tr from-[#7A2E49] to-[#B14B6C] flex flex-col justify-end p-5 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F59E0B]">
              {course.category || 'Certification Programme'}
            </span>
            <h3 className="text-base font-bold text-white mt-1 leading-snug line-clamp-1">
              {course.title}
            </h3>
          </div>
        )}

        {/* Category Pill Tag */}
        {course.category && (
          <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[10px] font-bold text-[#B14B6C] shadow-sm z-10">
            {course.category}
          </div>
        )}

        {/* Featured Tag (Only when verified in backend) */}
        {course.is_featured && (
          <div className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-full bg-[#F59E0B] text-[10px] font-bold text-white shadow-sm z-10">
            Featured
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B14B6C] uppercase tracking-wider mb-1.5">
            <span>Savvy Institute</span>
            <span>•</span>
            <span>UK Code Standards</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#1F1F1F] group-hover:text-[#B14B6C] transition-colors leading-snug">
            <Link href={`/courses/${course.slug || course.id}`}>
              {course.title}
            </Link>
          </h3>

          <p className="text-xs text-[#565656] line-clamp-2 mt-2 leading-relaxed font-normal">
            {course.short_description || course.description}
          </p>

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-[#F0E2E7] text-xs text-[#1F1F1F]">
            {course.duration && (
              <div className="flex items-center gap-1.5 text-[#565656]">
                <Clock className="w-3.5 h-3.5 text-[#B14B6C]" />
                <span>{course.duration}</span>
              </div>
            )}
            {course.certification && (
              <div className="flex items-center gap-1.5 text-[#565656] line-clamp-1">
                <Award className="w-3.5 h-3.5 text-[#B14B6C]" />
                <span className="truncate max-w-[180px]">{course.certification}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-6 pt-4 border-t border-[#F0E2E7] flex items-center justify-between gap-3">
          {price && (
          <div className="flex flex-col">
            <span className="text-[10px] text-[#565656] uppercase font-semibold">
              Tuition Fee
            </span>
            <span className="text-base font-bold text-[#B14B6C]">
              {price}
            </span>
          </div>
          )}

          <Link
            href={`/courses/${course.slug || course.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#B14B6C] text-white text-xs font-bold hover:bg-[#8E3854] transition-colors shadow-sm"
          >
            <span>View Course</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
