'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Users, BookOpen, Award, Compass,
  ArrowRight, CheckCircle2, Building2
} from 'lucide-react';

export function WhySavvySection() {
  const strengths = [
    {
      icon: <Award className="w-6 h-6 text-[#B83268]" />,
      title: 'Get accredited',
      description: 'Businesses and trainers can apply to certify learners in their own right. Lisa reviews content, assessment and learner-safety standards.',
      badge: 'Accreditation',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#B83268]" />,
      title: 'Become a teacher',
      description: 'Regulated teaching qualifications are completed fully online, with live Zoom sessions from the portal.',
      badge: 'Teaching',
    },
    {
      icon: <Users className="w-6 h-6 text-[#B83268]" />,
      title: 'Learn a skill',
      description: 'Online courses in beauty, massage and hairdressing include manuals, video demonstrations and a certificate on completion.',
      badge: 'Online',
    },
    {
      icon: <Compass className="w-6 h-6 text-[#B83268]" />,
      title: 'Build your business',
      description: 'One-to-one support covers business start-ups, regular mentorship, venue setup and awarding body registration.',
      badge: 'Mentorship',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#B83268]" />,
      title: 'Tutor feedback',
      description: 'Teaching learners upload assignments, download briefs, and receive written feedback from their tutor.',
      badge: 'Study',
    },
    {
      icon: <Building2 className="w-6 h-6 text-[#B83268]" />,
      title: 'Separate logins',
      description: 'Tutors and students each have a secure login and their own dashboard.',
      badge: 'Portal',
    },
  ];

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-[#EAD9E0]">
      <div className="site-container">
        {/* Section Header with Coursera-Style Outcome Metric */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EAD9E0] shadow-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-[#B83268]" />
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#B83268]">
              Invest In Your Career
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#641B38] tracking-tight">
            Why Professionals Choose Savvy
          </h2>

          <p className="text-sm sm:text-base text-[#30262B] mt-4 leading-relaxed max-w-2xl font-normal">
            Savvy Training Academy helps professionals and businesses get their skills recognised, through teaching qualifications, practical online courses and accreditation.
          </p>
        </div>

        {/* 6-Card Feature Grid */}
        <div className="reveal-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {strengths.map((item, index) => (
            <div
              key={index}
              className="group flex flex-col justify-between rounded-2xl border border-[#EAD9E0] border-t-4 border-t-[#641B38] bg-white p-7 shadow-sm transition-all duration-300 hover:border-[#B83268]/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="h-12 w-12 rounded-xl bg-[#F8EDF1] border border-[#B83268]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F8EDF1] text-[#B83268]">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#641B38] group-hover:text-[#B83268] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#30262B] mt-2.5 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAD9E0] flex items-center gap-1.5 text-xs font-semibold text-[#B83268] transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B83268]" />
                <span>Verified Institute Standard</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 rounded-2xl border border-[#EAD9E0] bg-[#F8EDF1] p-6 shadow-xs sm:mt-16 sm:flex-row sm:p-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#B83268] text-white flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#641B38]">
                Meet the founder
              </h4>
              <p className="text-xs text-[#30262B] mt-0.5">
                Lisa Zaman is the founder, tutor and assessor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/about-us"
              className="w-full rounded-full border border-[#EAD9E0] bg-white px-5 py-2.5 text-center text-xs font-semibold text-[#641B38] transition-colors hover:border-[#B83268] hover:bg-[#FCF8F7] hover:text-[#B83268] sm:w-auto"
            >
              Learn About Us
            </Link>
            <Link
              href="/contact-us"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#B83268] text-white text-xs font-bold hover:bg-[#641B38] transition-colors shadow-sm"
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
