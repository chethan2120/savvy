'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { teachingFeatures, teachingQualifications } from '@/lib/academy-content';
import type { CourseVisual } from '@/lib/course-visuals';

export function TeachingCatalogue({ images }: { images: Record<string, CourseVisual> }) {
  const [selected, setSelected] = useState(0);
  const course = teachingQualifications[selected];

  return (
    <section id="qualifications" className="site-container py-12 sm:py-16">
      <h2 className="text-[#1F1F1F]">Choose a teaching qualification</h2>
      <p className="mt-3 max-w-3xl text-[#565656]">
        Five qualifications, all completed online with live Zoom sessions. Select one on the left to read who it is for.
      </p>
      <div className="mt-8 overflow-hidden rounded-3xl border border-[#F0D5DE] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(16rem,22rem)_1fr]">
          <div className="border-b border-[#F0E2E7] bg-[#FBF6F8] p-3 sm:p-4 lg:border-b-0 lg:border-r" role="tablist" aria-label="Teaching qualifications">
            {teachingQualifications.map((item, index) => {
              const active = index === selected;
              return (
                <button
                  key={item.slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelected(index)}
                  className={`mb-2 flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors last:mb-0 ${
                    active
                      ? 'border-[#B14B6C] bg-white text-[#B14B6C] shadow-sm'
                      : 'border-transparent bg-transparent text-[#1F1F1F] hover:border-[#F0D5DE] hover:bg-white'
                  }`}
                >
                  <span className={`mt-0.5 inline-flex min-w-16 justify-center rounded-full px-2 py-1 text-sm font-semibold ${active ? 'bg-[#B14B6C] text-white' : 'bg-[#e7eef8] text-[#B14B6C]'}`}>
                    {item.level}
                  </span>
                  <span className="text-base font-semibold leading-snug">{item.title}</span>
                </button>
              );
            })}
          </div>
          <div key={course.slug} role="tabpanel" className="course-detail-in p-5 sm:p-8">
            <div className="grid gap-6 md:grid-cols-[11rem_1fr] md:items-start">
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-[#F0D5DE] bg-[#f4f8ff] md:aspect-square">
                {images[course.slug]?.src ? (
                  <Image
                    src={images[course.slug].src}
                    alt={images[course.slug].alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 240px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#B14B6C]">{course.level}</p>
                <h3 className="mt-1 text-[#1F1F1F]">{course.title}</h3>
                <p className="mt-4 text-[#1F1F1F]">{course.introduction}</p>
              </div>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#F0E2E7] p-4">
                <dt className="text-sm font-semibold text-[#B14B6C]">Who it is for</dt>
                <dd className="mt-1 text-[#1F1F1F]">{course.audience}</dd>
              </div>
              <div className="rounded-2xl border border-[#F0E2E7] p-4">
                <dt className="text-sm font-semibold text-[#B14B6C]">What you gain</dt>
                <dd className="mt-1 text-[#1F1F1F]">{course.gain}</dd>
              </div>
              <div className="rounded-2xl border border-[#F0E2E7] p-4 sm:col-span-2">
                <dt className="text-sm font-semibold text-[#B14B6C]">Study method</dt>
                <dd className="mt-1 text-[#1F1F1F]">{course.study}. Classes and one-to-one tutorials are joined from the portal.</dd>
              </div>
            </dl>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {teachingFeatures.map((item) => (
                <li key={item.title} className="rounded-xl bg-[#FBF6F8] px-4 py-3">
                  <p className="font-semibold text-[#1F1F1F]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#565656]">{item.body}</p>
                </li>
              ))}
            </ul>
            <Link
              href={`/contact-us?course=${encodeURIComponent(course.slug)}&courseName=${encodeURIComponent(course.title)}`}
              className="mt-6 inline-flex rounded-full bg-[#B14B6C] px-6 py-3 text-base font-semibold text-white"
            >
              Enquire Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
