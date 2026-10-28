'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, CheckCircle2, PhoneCall, ShieldCheck, BookOpen } from 'lucide-react';

export function AdmissionsHubSection() {
  return (
    <section className="py-20 sm:py-24 bg-white border-b border-[#e2e8f0] relative overflow-hidden">
      <div className="site-container max-w-5xl">
        <div className="p-8 sm:p-14 rounded-3xl bg-white border border-[#e2e8f0] shadow-sm relative overflow-hidden">
          {/* Decorative ambient accent */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(25,57,141,0.06)_0%,transparent_70%)] blur-2xl pointer-events-none"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-xs font-bold text-[#0056D2] mb-4 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-[#0056D2]" />
                <span>Next Intake Schedules Open</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F1F1F] tracking-tight leading-tight">
                Admissions Consultation &amp; Upcoming Batches
              </h2>

              <p className="text-sm sm:text-base text-[#565656] mt-3 leading-relaxed font-normal">
                Connect directly with our admissions and training coordination team to reserve your seat in upcoming NDT Level II, QA/QC, and MEP engineering batches.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-xs text-[#1F1F1F]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0056D2] shrink-0" />
                  <span>Flexible weekday &amp; weekend timings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0056D2] shrink-0" />
                  <span>Hands-on calibrated lab assessments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0056D2] shrink-0" />
                  <span>ASNT, ASME &amp; ISO code adherence</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0056D2] shrink-0" />
                  <span>Verifiable digital credentials</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0056D2] hover:bg-[#00419e] text-white text-sm font-bold shadow-[0_4px_16px_rgba(0,86,210,0.25)] transition-all"
                >
                  <span>Enquire for Next Batch</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Link>

                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-[#EBF3FF] text-[#0056D2] border-2 border-[#0056D2] text-sm font-semibold transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explore Courses</span>
                </Link>
              </div>
            </div>

            {/* Right Stat / Contact Card */}
            <div className="lg:col-span-5 w-full">
              <div className="p-6 sm:p-8 rounded-2xl bg-[#F8FAFC] border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBF3FF] flex items-center justify-center text-[#0056D2] shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#565656]">
                      Admissions Helpline
                    </span>
                    <div className="text-base font-bold text-[#1F1F1F]">
                      +91 90000 12345
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#e2e8f0] pt-4 flex flex-col gap-2 text-xs text-[#565656]">
                  <div>
                    <strong className="text-[#1F1F1F]">Training Centre:</strong> Bengaluru, Karnataka, India
                  </div>
                  <div>
                    <strong className="text-[#1F1F1F]">Batch Formats:</strong> Full-Time Classroom &amp; Hybrid Online
                  </div>
                  <div>
                    <strong className="text-[#1F1F1F]">Certifications:</strong> ASNT SNT-TC-1A, QA/QC, CSWIP Prep, BIM Revit
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
