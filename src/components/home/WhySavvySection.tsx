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
      icon: <Award className="w-6 h-6 text-[#0056D2]" />,
      title: 'Get accredited',
      description: 'Businesses and trainers can apply to certify learners in their own right. Lisa reviews content, assessment and learner-safety standards.',
      badge: 'Accreditation',
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#0056D2]" />,
      title: 'Become a teacher',
      description: 'Regulated teaching qualifications are completed fully online, with live Zoom sessions from the portal.',
      badge: 'Teaching',
    },
    {
      icon: <Users className="w-6 h-6 text-[#0056D2]" />,
      title: 'Learn a skill',
      description: 'Online courses in beauty, massage and hairdressing include manuals, video demonstrations and a certificate on completion.',
      badge: 'Online',
    },
    {
      icon: <Compass className="w-6 h-6 text-[#0056D2]" />,
      title: 'Build your business',
      description: 'One-to-one support covers business start-ups, regular mentorship, venue setup and awarding body registration.',
      badge: 'Mentorship',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#0056D2]" />,
      title: 'Tutor feedback',
      description: 'Teaching learners upload assignments, download briefs, and receive written feedback from their tutor.',
      badge: 'Study',
    },
    {
      icon: <Building2 className="w-6 h-6 text-[#0056D2]" />,
      title: 'Separate logins',
      description: 'Tutors and students each have a secure login and their own dashboard.',
      badge: 'Portal',
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
            Savvy Training Academy helps professionals and businesses get their skills recognised, through teaching qualifications, practical online courses and accreditation.
          </p>
        </div>

        {/* 6-Card Feature Grid */}
        <div className="reveal-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                Meet the founder
              </h4>
              <p className="text-xs text-[#565656] mt-0.5">
                Lisa Zaman is the founder, tutor and assessor.
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
