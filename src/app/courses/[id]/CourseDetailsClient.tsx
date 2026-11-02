'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Clock, Award, BookOpen, CheckCircle2, ChevronRight,
  ShieldCheck, ArrowRight, Lock, UserCheck, Layers, FileText,
  GraduationCap, MessageSquare, Star, Check
} from 'lucide-react';
import type { Course } from '@/lib/types';
import { gbpLabel, useShowCoursePrices } from '@/lib/public-price';
import { courseVisualBySrc } from '@/lib/course-visuals';

interface CourseDetailsClientProps {
  course: Course;
  relatedCourses: Course[];
  viewerRole: string | null;
  viewerName: string | null;
  viewerId: string | null;
}

export function CourseDetailsClient({
  course,
  relatedCourses,
  viewerRole,
  viewerName,
}: CourseDetailsClientProps) {
  const showPrices = useShowCoursePrices();
  const price = showPrices ? gbpLabel(course) : null;

  // Authenticated state: optionally load authorized workspace chapters if logged in
  const [authorizedChapters, setAuthorizedChapters] = useState<any[] | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (viewerRole) {
      fetch(`/api/workspace?resource=course&id=${encodeURIComponent(course.id)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.ok) {
            setAuthorizedChapters(data.chapters || []);
            setIsEnrolled(Boolean(data.enrolled));
          }
        })
        .catch(() => {});
    }
  }, [viewerRole, course.id]);

  const modules = authorizedChapters && authorizedChapters.length > 0
    ? authorizedChapters.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description || c.objectives,
        study_hours: c.studyHours,
        content: c.content,
      }))
    : (course.modules ?? []);

  const totalStudyHours = course.expected_hours || modules.reduce((acc, m) => acc + (m.study_hours || 0), 0) || null;

  return (
    <div className="bg-white pb-24">
      {/* ========================================================= */}
      {/* EXCITING EDITORIAL HERO SECTION                            */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#003e9a] via-[#0056D2] to-[#0284c7] text-white pt-8 pb-16 lg:pt-10 lg:pb-20 border-b border-[#0056D2]/30">
        {/* Theme Architectural Plus Grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18 14v8M14 18h8' stroke='%23324f9a' stroke-width='1.2' stroke-linecap='round' stroke-opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Dynamic Glow Accents */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,86,210,0.35)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute bottom-[0%] left-[5%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(19,201,170,0.18)_0%,transparent_70%)] blur-3xl" />
        </div>

        <div className="site-container relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-white/70 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <Link href="/courses" className="hover:text-white transition-colors">
              Explore Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[#f4f5fc] font-semibold truncate max-w-xs">{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content (Title, 2 Lines, Duration, Study Hours, Enquire Buttons, 2 Points) */}
            <div className="lg:col-span-7 flex flex-col items-start justify-center">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
                {course.category && (
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white uppercase tracking-wider">
                    {course.category}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0056D2]/80 border border-white/20 text-xs font-semibold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Code Compliant Curriculum</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-xs font-bold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>4.9 / 5.0 Rating</span>
                </span>
              </div>

              {/* Course Title */}
              <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-3">
                {course.title}
              </h1>

              {/* 2 Lines Below Course Title */}
              <p className="text-base sm:text-lg text-white/85 leading-relaxed font-normal max-w-xl line-clamp-2 mb-6">
                {course.short_description || course.description}
              </p>

              {/* Metadata Pills: Duration, Study Hours, Tuition Fee with Currency Selector */}
              <div className="flex flex-wrap items-center gap-2.5 mb-6">
                {course.duration && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs sm:text-sm text-white font-medium">
                    <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Duration: <strong className="font-bold text-white">{course.duration}</strong></span>
                  </div>
                )}

                {totalStudyHours && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs sm:text-sm text-white font-medium">
                    <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Study Hours: <strong className="font-bold text-white">{totalStudyHours} hrs</strong></span>
                  </div>
                )}

                {price && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 text-xs sm:text-sm text-white font-medium">
                  <span className="text-white/70 text-[11px] uppercase tracking-wider font-bold">Fee:</span>
                  <strong className="text-white font-bold text-sm sm:text-base">{price}</strong>
                </div>
                )}
              </div>

              {/* Action Buttons: Enquire for Upcoming Batch & Enquire via WhatsApp */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto mb-5">
                <Link
                  href={`/contact-us?course=${encodeURIComponent(course.slug || course.id)}&courseName=${encodeURIComponent(course.title)}`}
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-white hover:bg-[#f3f5fb] text-[#0056D2] text-sm font-bold shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-lg transition-all active:scale-98"
                >
                  <span>Enquire for Upcoming Batch</span>
                  <ArrowRight className="w-4 h-4 text-[#0056D2]" />
                </Link>

                <Link
                  href={`https://wa.me/919000012345?text=Hello%2C%20I%20am%20interested%20in%20enrolling%20in%20${encodeURIComponent(course.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm font-bold transition-all active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Enquire via WhatsApp</span>
                </Link>
              </div>

              {/* 2 Points Below Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-white/80 pt-2 border-t border-white/15 w-full max-w-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{course.training_mode || 'Study method listed with the course'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{course.duration || 'Duration listed with the course'}</span>
                </div>
              </div>
            </div>

            {/* Right: Featured Course Image */}
            <div className="lg:col-span-5 w-full">
              <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.35)] bg-[#003e9a]/50 group">
                {course.featured_image ? (
                <Image
                  src={course.featured_image}
                  alt={courseVisualBySrc(course.featured_image)?.alt || course.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                {/* Overlay Badges */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#0056D2] shadow-sm">
                    {course.category || 'Savvy Training Academy'}
                  </span>
                </div>

                {course.certification && (
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center gap-3">
                    <Award className="w-5 h-5 text-amber-300 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-white/70 block">Certificate</span>
                      <strong className="text-xs font-semibold text-white truncate block">{course.certification}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN COURSE CONTENT BODY                                  */}
      {/* ========================================================= */}
      <div className="site-container mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* 1. Course Overview & Description */}
          <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] mb-4">
              Programme Overview
            </h2>
            <div className="prose prose-sm sm:prose text-[#565656] leading-relaxed max-w-none whitespace-pre-line">
              {course.description || course.short_description}
            </div>
          </section>

          {/* 2. Prerequisites & Learning Outcomes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prerequisites */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs">
              <h3 className="text-base sm:text-lg font-bold text-[#1F1F1F] mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#0056D2]" />
                <span>Prerequisites</span>
              </h3>
              {course.prerequisites && course.prerequisites.length > 0 ? (
                <ul className="flex flex-col gap-3 text-sm text-[#565656]">
                  {course.prerequisites.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-[#0056D2] mt-2 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#565656] leading-relaxed">
                  {course.eligibility || 'Diploma / Engineering Degree or equivalent technical background.'}
                </p>
              )}
            </section>

            {/* Learning Outcomes */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs">
              <h3 className="text-base sm:text-lg font-bold text-[#1F1F1F] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0056D2]" />
                <span>Learning Outcomes</span>
              </h3>
              {course.learning_outcomes && course.learning_outcomes.length > 0 ? (
                <ul className="flex flex-col gap-3 text-sm text-[#565656]">
                  {course.learning_outcomes.map((out, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#565656] leading-relaxed">
                  Attain proficiency in standard testing codes, calibration procedures, and certified inspection reports.
                </p>
              )}
            </section>
          </div>

          {/* 3. Detailed Syllabus Chapters Breakdown */}
          <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e2e8f0]">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#1F1F1F]">
                  Curriculum &amp; Chapters
                </h3>
                <p className="text-xs text-[#565656] mt-1">
                  Structured syllabus following international engineering codes and hands-on lab modules.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#EBF3FF] text-[#0056D2] border border-[#0056D2]/20 self-start sm:self-auto shadow-2xs">
                {modules.length} Modules Total
              </span>
            </div>

            {modules.length > 0 ? (
              <div className="divide-y divide-[#e2e8f0]">
                {modules.map((mod, index) => (
                  <div key={mod.id || index} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-[#EBF3FF] text-xs font-bold text-[#0056D2] shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="text-base font-bold text-[#1F1F1F]">
                            {mod.title}
                          </h4>
                          {mod.description && (
                            <p className="text-sm text-[#565656] mt-1.5 leading-relaxed">
                              {mod.description}
                            </p>
                          )}
                          {(mod as any).content && (
                            <div className="mt-3 text-sm bg-slate-50 p-3.5 rounded-xl border border-[#e2e8f0] text-[#1F1F1F]">
                              {(mod as any).content}
                            </div>
                          )}
                        </div>
                      </div>

                      {mod.study_hours && (
                        <div className="text-xs font-semibold text-[#565656] shrink-0 whitespace-nowrap bg-white px-2.5 py-1 rounded-md border border-[#e2e8f0]">
                          {mod.study_hours} hrs
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#565656] italic">
                Detailed chapter breakdown is currently being published by the academic committee.
              </p>
            )}
          </section>

          {/* 4. Frequently Asked Questions */}
          {course.faqs && course.faqs.length > 0 && (
            <section className="bg-white rounded-3xl p-8 border border-[#e2e8f0] shadow-xs">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1F1F1F] mb-6">
                Frequently Asked Questions
              </h2>
              <div className="flex flex-col gap-4">
                {course.faqs.map((faq) => (
                  <div key={faq.id} className="p-4 rounded-2xl bg-white border border-[#e2e8f0]">
                    <h4 className="text-sm font-bold text-[#1F1F1F]">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-[#565656] mt-1.5 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDEBAR: Related Programmes & Interested Section     */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Institute Accreditation Notice */}
          <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-[#EBF3FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#0056D2]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F1F1F]">Savvy Institute Assurance</h4>
                <span className="text-[11px] text-[#0056D2] font-semibold">Quality &amp; Code Integrity</span>
              </div>
            </div>
            <p className="text-xs text-[#565656] leading-relaxed">
              All courses are conducted in adherence to verified technical codes (ASNT, ASME, ISO). No unsupported guarantees or non-standard claims are made.
            </p>
          </div>

          {/* Related Programmes */}
          {relatedCourses.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-xs">
              <h3 className="text-base font-bold text-[#1F1F1F] mb-4">
                Related Programmes
              </h3>
              <div className="flex flex-col gap-3">
                {relatedCourses.map((rel) => {
                  const relPrice = showPrices ? gbpLabel(rel) : null;
                  return (
                    <Link
                      key={rel.id}
                      href={`/courses/${rel.slug || rel.id}`}
                      className="group p-3.5 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#0056D2]/50 hover:shadow-xs transition-all"
                    >
                      <h4 className="text-xs font-bold text-[#1F1F1F] group-hover:text-[#0056D2] line-clamp-1">
                        {rel.title}
                      </h4>
                      <p className="text-[11px] text-[#565656] line-clamp-1 mt-1">
                        {rel.duration} · {rel.certification || 'Certification'}
                      </p>
                      <div className="mt-2 pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                        {relPrice && <span className="font-bold text-[#0056D2]">{relPrice}</span>}
                        <span className="text-[#0056D2] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold text-[11px]">
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* USER REQUESTED: "Interested in this Course?" SECTION        */}
          {/* Placed below Related Programmes                           */}
          {/* ========================================================= */}
          <div className="bg-gradient-to-br from-[#003e9a] via-[#0056D2] to-[#0284c7] rounded-3xl p-6 sm:p-7 text-white shadow-[0_12px_36px_rgba(0,86,210,0.25)] border border-[#0056D2]/40 relative overflow-hidden">
            {/* Ambient shimmer */}
            <div
              aria-hidden="true"
              className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none"
            />

            <div className="relative z-10 flex flex-col gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-xs self-start">
                <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                <span>Admissions Enquiries</span>
              </span>

              <h3 className="text-xl font-bold tracking-tight text-white leading-snug">
                Interested in this course?
              </h3>

              <p className="text-xs sm:text-[13px] text-white/85 leading-relaxed">
                Ask about the syllabus, the next Zoom sessions, or how to enrol.
              </p>

              {/* Selected Course Visual Badge */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 my-1 text-xs">
                <span className="text-white/70 block text-[10px] uppercase font-bold tracking-wider">
                  Target Qualification:
                </span>
                <strong className="text-white block mt-0.5 text-sm font-semibold line-clamp-1">
                  {course.title}
                </strong>
              </div>

              {/* Instant Redirect to Contact Us with Course Marked */}
              <Link
                href={`/contact-us?course=${encodeURIComponent(course.slug || course.id)}&courseName=${encodeURIComponent(course.title)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-[#f3f5fb] text-[#0056D2] text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98 group mt-1"
              >
                <span>Express Interest &amp; Enquire Now</span>
                <ArrowRight className="w-4 h-4 text-[#0056D2] group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/75 mt-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automatically pre-selects course on enquiry form</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
