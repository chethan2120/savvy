'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Wrench, Users, BookOpen, Award, Compass,
  ArrowRight, CheckCircle2, Building2
} from 'lucide-react';

export function WhySavvySection() {
  const strengths = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#0056D2]" />,
      title: 'Industry-Aligned Standards',
      description:
        'Syllabi calibrated strictly to international technical codes including ASNT SNT-TC-1A, ASME Sections V, VIII & IX, API, and ISO 9001 frameworks.',
      badge: 'Code Compliant',
    },
    {
      icon: <Wrench className="w-6 h-6 text-[#0056D2]" />,
      title: 'Hands-On Laboratory Mastery',
      description:
        'Intensive practical hours with calibrated ultrasonic flaw detectors, magnetic yokes, dye penetrants, and radiographic viewing screens on actual welded coupons.',
      badge: 'Practical Labs',
    },
    {
      icon: <Users className="w-6 h-6 text-[#0056D2]" />,
      title: 'Experienced Technical Faculty',
      description:
        'Mentorship led by seasoned inspection engineers bringing over a decade of cumulative refinery, pipeline, and structural fabrication site experience.',
      badge: 'Expert Faculty',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#0056D2]" />,
      title: 'Transparent Curricula & Hours',
      description:
        'Clearly defined chapter breakdowns, practical evaluation criteria, and structured prerequisites suitable for diploma, degree, and working technicians.',
      badge: 'Structured Study',
    },
    {
      icon: <Award className="w-6 h-6 text-[#0056D2]" />,
      title: 'Verifiable Institute Credentials',
      description:
        'Certificates issued upon successful examination with traceable credential numbers verifiable through authorized institute records.',
      badge: 'Verifiable',
    },
    {
      icon: <Compass className="w-6 h-6 text-[#0056D2]" />,
      title: 'Technical Career Guidance',
      description:
        'Focused interview preparation, CV orientation, and guidance aligned with hiring criteria across energy EPCs, third-party inspection firms, and MEP contractors.',
      badge: 'Career Focus',
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-[#e2e8f0]">
      <div className="site-container">
        {/* Section Header with Coursera-Style Outcome Metric */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2e8f0] shadow-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#0056D2]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#0056D2]">
              Invest In Your Career
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1F1F] tracking-tight">
            Why Professionals Choose Savvy
          </h2>

          <p className="text-sm sm:text-base text-[#565656] mt-4 leading-relaxed max-w-2xl font-normal">
            We deliver rigorous, laboratory-first technical education designed to bridge academic knowledge with the demanding realities of industrial inspection and quality engineering.
          </p>

          {/* Coursera-style Learner Outcome Metric Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 w-full max-w-2xl p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-[#e2e8f0] shadow-xs">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#0056D2]">89%</div>
              <div className="text-xs text-[#565656] mt-0.5 font-medium">Report career advancement within 6 months</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F]">10,000+</div>
              <div className="text-xs text-[#565656] mt-0.5 font-medium">Certified engineers &amp; technicians trained</div>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">98%</div>
              <div className="text-xs text-[#565656] mt-0.5 font-medium">Examination pass rate on first attempt</div>
            </div>
          </div>
        </div>

        {/* 6-Card Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {strengths.map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-7 border border-[#e2e8f0] shadow-xs hover:shadow-lg hover:border-[#0056D2]/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-xl bg-[#EBF3FF] border border-[#0056D2]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EBF3FF] text-[#0056D2]">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#565656] mt-2.5 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center gap-1.5 text-xs font-semibold text-[#0056D2] transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Institute Standard</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout Bar */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl bg-[#F8FAFC] border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#0056D2] text-white flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#1F1F1F]">
                Explore Our Technical Facilities &amp; Labs
              </h4>
              <p className="text-xs text-[#565656] mt-0.5">
                Schedule an in-person or virtual laboratory walkthrough with an academic advisor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/about-us"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#e2e8f0] text-xs font-semibold text-[#1F1F1F] hover:border-[#0056D2] hover:text-[#0056D2] text-center transition-colors bg-white hover:bg-slate-50"
            >
              Learn About Us
            </Link>
            <Link
              href="/contact-us"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419e] transition-colors shadow-sm"
            >
              <span>Enquire Today</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
