import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Award, Users, BookOpen, Compass, CheckCircle2,
  ArrowRight, Building, Check, Microscope, FileCheck, Layers, GraduationCap
} from 'lucide-react';
import { instructorsData, recruitersData } from '@/lib/data';
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { PageHeroBanner } from '@/components/common/PageHeroBanner';
import { CardsParallax, type iCardItem } from '@/components/ui/scroll-cards';

const approachCards: iCardItem[] = [
  {
    title: 'Code Foundations',
    description: 'Rigorous immersion in ASME, ASNT SNT-TC-1A, API, and ISO specifications. Students master core physics, wave mechanics, and radiation safety limits.',
    tag: 'Phase 01',
    src: '/images/heroes/blogs-hero.jpg',
    link: '/courses',
    color: '#003e9a',
    textColor: '#FFFFFF',
  },
  {
    title: 'Instrument Calibration',
    description: 'Direct equipment calibration using international V1/V2 reference blocks, DAC curves, magnetic field strength yokes, and film densitometers.',
    tag: 'Phase 02',
    src: '/images/heroes/about-hero.jpg',
    link: '/courses',
    color: '#0056D2',
    textColor: '#FFFFFF',
  },
  {
    title: 'Flaw Characterization',
    description: 'Testing actual welded plates, pipes, and structural steel samples containing authentic defects: porosity, slag, incomplete fusion, and cracks.',
    tag: 'Phase 03',
    src: '/images/course/ndt-level-2-course.png',
    link: '/courses',
    color: '#003e9a',
    textColor: '#FFFFFF',
  },
  {
    title: 'Practical Evaluation',
    description: 'Drafting industrial NDT inspection reports, calculating acceptance thresholds against codes, and passing rigorous practical qualification exams.',
    tag: 'Phase 04',
    src: '/images/course/qa-and-qc-course.png',
    link: '/courses',
    color: '#0056D2',
    textColor: '#FFFFFF',
  },
];

export const metadata = {
  title: 'About Us | Savvy Training Institute',
  description:
    'Learn about Savvy Training Institute, our leadership, practical engineering methodology, and technical certification courses in NDT, QA/QC, HSE, and MEP.',
};

export default function AboutUsPage() {
  return (
    <div className="bg-white pb-24">
      {/* Editorial Hero Header with Verified 16:9 Laboratory Visual */}
      <PageHeroBanner
        badgeText="Dedicated Technical Training Centre"
        title="Engineering Excellence Through Practical Mastery"
        description="Savvy Training Institute is a specialized technical institute based in Bengaluru, India, preparing engineers and technicians for critical industrial inspection and quality assurance roles across the globe."
        imageSrc="/images/heroes/about-hero.jpg"
        imageAlt="Savvy Training Institute advanced metrology and precision ultrasonic inspection engineering laboratory"
        priority={true}
      />

      {/* Institute Overview & Mission */}
      <section className="py-20 bg-white border-b border-[#e2e8f0]">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e2e8f0] shadow-2xs mb-4">
                <span className="w-2 h-2 rounded-full bg-[#0056D2]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">
                  Our Purpose
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F1F1F] tracking-tight mt-1 leading-snug">
                Bridging Academic Engineering with Real-World Industrial Inspection
              </h2>
              <p className="text-sm sm:text-base text-[#565656] mt-4 leading-relaxed font-normal">
                Modern fabrication, petrochemical plants, infrastructure projects, and aerospace operations demand technicians and inspectors who understand not only theory, but also calibrated instruments, strict international codes, and safety protocols.
              </p>
              <p className="text-sm text-[#565656] mt-3 leading-relaxed font-normal">
                At Savvy, our courses are built from the ground up to replace rote memorization with intensive hands-on flaw detection, code interpretation, and digital simulation tools.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F1F1F]">Code-Aligned Syllabi</h4>
                    <p className="text-[11px] text-[#565656] mt-0.5 font-normal">ASNT, ASME, API, AWS, and ISO compliant modules.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F1F1F]">Laboratory First</h4>
                    <p className="text-[11px] text-[#565656] mt-0.5 font-normal">Ultrasonic, magnetic, dye penetrant &amp; radiographic setups.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F1F1F]">Practical Evaluation</h4>
                    <p className="text-[11px] text-[#565656] mt-0.5 font-normal">Defect assessment on actual welded coupons and pipes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F1F1F]">Verifiable Credentials</h4>
                    <p className="text-[11px] text-[#565656] mt-0.5 font-normal">Documented certificates with secure digital validation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seal & Values Box */}
            <div className="rounded-3xl bg-white border border-[#e2e8f0] shadow-sm p-8 sm:p-10 flex flex-col items-center text-center">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-white p-2 border border-[#e2e8f0] shadow-md mb-6">
                <SavvyLogo markClassName="h-full w-full object-contain" />
              </div>
              <h3 className="text-lg font-bold text-[#1F1F1F]">
                Savvy Training Institute
              </h3>
              <p className="text-xs text-[#0056D2] font-bold uppercase tracking-wider mt-1">
                Bengaluru Training Centre
              </p>
              <p className="text-xs text-[#565656] max-w-sm mt-3 leading-relaxed font-normal">
                Operating with transparent course schedules, verified instructors, and comprehensive student attendance tracking across classroom and digital portals.
              </p>

              <div className="mt-8 pt-6 border-t border-[#e2e8f0] w-full flex items-center justify-around text-center text-xs">
                <div>
                  <div className="text-xl font-extrabold text-[#0056D2]">6+</div>
                  <div className="text-[11px] text-[#565656] mt-0.5 font-medium">Core Disciplines</div>
                </div>
                <div className="h-8 w-px bg-[#e2e8f0]" />
                <div>
                  <div className="text-xl font-extrabold text-[#0056D2]">100%</div>
                  <div className="text-[11px] text-[#565656] mt-0.5 font-medium">Practical Labs</div>
                </div>
                <div className="h-8 w-px bg-[#e2e8f0]" />
                <div>
                  <div className="text-xl font-extrabold text-[#0056D2]">ASNT / ISO</div>
                  <div className="text-[11px] text-[#565656] mt-0.5 font-medium">Code Standards</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Technical Instructors */}
      <section className="py-20 bg-white border-b border-[#e2e8f0]">
        <div className="site-container">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">
              Academic Faculty
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F1F1F] tracking-tight mt-1.5">
              Institute Leadership &amp; Senior Instructors
            </h2>
            <p className="text-sm text-[#565656] mt-2 font-normal">
              Seasoned inspection engineers bringing decades of cumulative site, refinery, and laboratory experience into the classroom.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructorsData.map((instructor) => (
              <div
                key={instructor.id}
                className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-xs hover:border-[#0056D2]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-16 w-16 rounded-full bg-[#0056D2] text-white font-extrabold text-xl flex items-center justify-center mb-4 shadow-xs">
                    {instructor.name.slice(0, 1)}
                  </div>
                  <h3 className="text-base font-bold text-[#1F1F1F]">
                    {instructor.name}
                  </h3>
                  <div className="text-xs font-semibold text-[#0056D2] mt-0.5">
                    {instructor.role}
                  </div>
                  <p className="text-xs text-[#565656] mt-3 leading-relaxed font-normal">
                    {instructor.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industrial Recruiting Standards & Affiliations */}
      <section className="py-20 bg-white border-b border-[#e2e8f0]">
        <div className="site-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">
              Industry Alignment
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F1F1F] tracking-tight mt-1.5">
              Targeted Industrial Sectors
            </h2>
            <p className="text-sm text-[#565656] mt-2 font-normal">
              Our curriculum prepares candidates for requirements typical of leading inspection firms, energy EPCs, and heavy manufacturing organizations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recruitersData.map((recruiter) => (
              <div
                key={recruiter.id}
                className="p-4 rounded-xl border border-[#e2e8f0] bg-white hover:border-[#0056D2]/30 shadow-2xs flex flex-col items-center justify-center text-center text-xs transition-all"
              >
                <Building className="w-5 h-5 text-[#0056D2] mb-2" />
                <span className="font-bold text-[#1F1F1F]">{recruiter.name}</span>
                <span className="text-[10px] text-[#565656] mt-1">{recruiter.industry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-[#003e9a] via-[#0056D2] to-[#0284c7] text-white">
        <div className="site-container flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Have Questions About Savvy or Our Program Syllabi?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1 font-normal">
              Contact our training coordinators for verified course brochures and batch calendars.
            </p>
          </div>
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0056D2] text-xs font-bold hover:bg-[#f3f5fb] transition-colors shrink-0 shadow-md"
          >
            <span>Speak With an Advisor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Our Approach to Technical Training (Interactive Parallax Scroll Feature) */}
      <section className="py-20 sm:py-24 bg-white border-b border-[#e2e8f0]">
        <div className="site-container">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#0056D2]">
              Academic &amp; Laboratory Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1F1F] tracking-tight mt-2 leading-snug">
              Our Approach to Technical Training
            </h2>
            <p className="text-base sm:text-lg text-[#565656] mt-3 leading-relaxed font-normal">
              We translate theoretical engineering codes into reliable industrial inspection capability through a proven four-phase pedagogical model.
            </p>
          </div>

          {/* Sticky Parallax Scroll Cards */}
          <CardsParallax items={approachCards} />

          {/* Action Row */}
          <div className="mt-14 text-center flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/courses"
              className="px-8 py-3.5 rounded-full bg-[#0056D2] text-white text-sm font-bold hover:bg-[#00419e] transition-colors shadow-sm"
            >
              Explore Course Syllabi
            </Link>
            <Link
              href="/contact-us"
              className="px-8 py-3.5 rounded-full border-2 border-[#0056D2] text-[#0056D2] text-sm font-bold hover:bg-[#EBF3FF] transition-colors"
            >
              Contact Course Advisor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
