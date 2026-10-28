'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Award, ShieldCheck } from 'lucide-react';

export function CertificateCtaSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-white border-b border-[#e2e8f0] overflow-hidden">
      <div className="site-container relative z-10 max-w-4xl mx-auto">
        {/* Enclosed White Card for Light Theme Consistency */}
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#e2e8f0] shadow-sm text-center relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(0,86,210,0.06)_0%,transparent_70%)] blur-2xl pointer-events-none"
          />

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2e8f0] mb-6 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0056D2]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#0056D2]">
              Excellence in Technical Education
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1F1F1F] mb-4 leading-tight">
            Ready to Take Your Next Step?
          </h2>

          {/* Supporting text */}
          <p className="text-base sm:text-lg text-[#565656] max-w-xl mx-auto leading-relaxed mb-10 font-normal">
            Discover the right course for your career goals and learn more about our internationally recognised technical certification programmes.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact-us"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0056D2] hover:bg-[#00419e] text-white text-sm sm:text-base font-bold shadow-[0_4px_16px_rgba(0,86,210,0.25)] transition-all duration-200 group"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0056D2] border-2 border-[#0056D2] text-sm sm:text-base font-semibold hover:bg-[#EBF3FF] transition-colors"
            >
              <span>Browse All Courses</span>
            </Link>
          </div>

          {/* Footnote reassurance */}
          <div className="mt-12 pt-8 border-t border-[#e2e8f0] flex flex-wrap items-center justify-center gap-6 text-xs text-[#565656]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0056D2]" />
              <span>Standardised Curriculum Verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#0056D2]" />
              <span>Official Institute Certification Documents</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
