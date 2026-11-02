import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Award, Users, BookOpen, Compass, CheckCircle2,
  ArrowRight, Check, Microscope, FileCheck, Layers, GraduationCap
} from 'lucide-react';
import { academyIntro } from '@/lib/academy-content';
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { PageHeroBanner } from '@/components/common/PageHeroBanner';
import { ExampleCertificate } from '@/components/about/ExampleCertificate';
import { LearningPortalSection } from '@/components/about/LearningPortalSection';
import { SectorTicker } from '@/components/common/SectorTicker';
import { CardsParallax, type iCardItem } from '@/components/ui/scroll-cards';

const approachCards: iCardItem[] = [
  {
    title: 'Get accredited',
    description: 'Businesses and trainers apply online, upload their course documents, and receive written feedback from Lisa.',
    tag: 'Phase 01',
    src: '/images/heroes/blogs-hero.jpg',
    link: '/accreditation',
    color: '#7A2E49',
    textColor: '#FFFFFF',
  },
  {
    title: 'Become a teacher',
    description: 'Regulated teaching qualifications are completed fully online, with live Zoom sessions from the portal.',
    tag: 'Phase 02',
    src: '/images/courses/award-in-education-and-training.jpg',
    link: '/teaching',
    color: '#B14B6C',
    textColor: '#FFFFFF',
  },
  {
    title: 'Learn a skill',
    description: 'Online courses in beauty, massage and hairdressing, with manuals, video demonstrations and a certificate on completion.',
    tag: 'Phase 03',
    src: '/images/courses/beauty-therapy-essentials.jpg',
    link: '/courses',
    color: '#7A2E49',
    textColor: '#FFFFFF',
  },
  {
    title: 'Build your business',
    description: 'One-to-one guidance from a first idea through to a registered centre, including venue setup and awarding body registration.',
    tag: 'Phase 04',
    src: '/images/courses/hairdressing-foundations.jpg',
    link: '/mentorship',
    color: '#B14B6C',
    textColor: '#FFFFFF',
  },
];

export const metadata = {
  title: 'About Us | Savvy Training Institute',
  description:
    'Savvy Training Academy was founded by Lisa Zaman, tutor and assessor. The academy offers teaching qualifications, online courses and accreditation.',
};

export default function AboutUsPage() {
  return (
    <div className="bg-white pb-24">
      <PageHeroBanner
        variant="about"
        badgeText="About us"
        title="A founder-led training institute"
        description={academyIntro.lead}
        actionHref="#founder"
        actionLabel="Meet the founder"
        imageSrc="/images/heroes/about-institute.jpg"
        imageAlt="Adult learners in a bright training library"
        priority={true}
      />

      <section id="founder" className="py-16 bg-white border-b border-[#F0E2E7]">
        <div className="site-container">
          <p className="text-sm font-semibold text-[#B14B6C]">Meet the founder</p>
          <h2 className="mt-2 text-[#1F1F1F]">Lisa Zaman is the founder, tutor and assessor.</h2>
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-[#F0E2E7] bg-white p-8 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#B14B6C] text-2xl font-semibold tracking-wide text-white" aria-hidden="true">
                  LZ
                </div>
                <div>
                  <h3 className="text-[#1F1F1F]">Lisa Zaman</h3>
                  <p className="text-sm font-semibold text-[#B14B6C]">Founder, tutor and assessor</p>
                </div>
              </div>
              <p className="mt-5 text-base leading-relaxed text-[#565656]">{academyIntro.founderIntro}</p>
            </div>
            <ExampleCertificate />
          </div>
        </div>
      </section>

      <LearningPortalSection />

      {/* Institute Overview & Mission */}
      <section className="py-20 bg-white border-b border-[#F0E2E7]">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#F0E2E7] shadow-2xs mb-4">
                <span className="w-2 h-2 rounded-full bg-[#B14B6C]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#B14B6C]">
                  Our Purpose
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F1F1F] tracking-tight mt-1 leading-snug">
                Four ways to work with Savvy
              </h2>
              <p className="text-sm sm:text-base text-[#565656] mt-4 leading-relaxed font-normal">
                Get accredited as a business or trainer, become a teacher through a regulated qualification, learn a beauty, massage or hairdressing skill, or build a training business with one-to-one guidance.
              </p>
              <p className="text-sm text-[#565656] mt-3 leading-relaxed font-normal">
                Teaching qualifications are fully online with live Zoom sessions. Online courses include manuals, video demonstrations and a certificate on completion.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F1F1F]">Get accredited</h4>
                    <p className="text-[11px] text-[#565656] mt-0.5 font-normal">Apply online and receive written feedback from Lisa.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F1F1F]">Become a teacher</h4>
                    <p className="text-[11px] text-[#565656] mt-0.5 font-normal">Regulated qualifications, completed fully online.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F1F1F]">Learn a skill</h4>
                    <p className="text-[11px] text-[#565656] mt-0.5 font-normal">Beauty, massage and hairdressing courses.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1F1F1F]">Build your business</h4>
                    <p className="text-[11px] text-[#565656] mt-0.5 font-normal">Start-up, mentorship, venue and registration support.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seal & Values Box */}
            <div className="rounded-3xl bg-white border border-[#F0E2E7] shadow-sm p-8 sm:p-10 flex flex-col items-center text-center">
              <div className="h-28 w-28 rounded-full overflow-hidden bg-white p-2 border border-[#F0E2E7] shadow-md mb-6">
                <SavvyLogo markClassName="h-full w-full object-contain" />
              </div>
              <h3 className="text-lg font-bold text-[#1F1F1F]">
                Savvy Training Institute
              </h3>
              <p className="text-xs text-[#B14B6C] font-bold uppercase tracking-wider mt-1">
                Founded by Lisa Zaman
              </p>
              <p className="text-xs text-[#565656] max-w-sm mt-3 leading-relaxed font-normal">
                The source website does not publish an address. Use the contact form to reach the academy.
              </p>

              <div className="mt-8 pt-6 border-t border-[#F0E2E7] w-full flex items-center justify-around text-center text-xs">
                <div>
                  <div className="text-xl font-extrabold text-[#B14B6C]">5</div>
                  <div className="text-[11px] text-[#565656] mt-0.5 font-medium">Teaching qualifications</div>
                </div>
                <div className="h-8 w-px bg-[#F0E2E7]" />
                <div>
                  <div className="text-xl font-extrabold text-[#B14B6C]">6</div>
                  <div className="text-[11px] text-[#565656] mt-0.5 font-medium">Online courses</div>
                </div>
                <div className="h-8 w-px bg-[#F0E2E7]" />
                <div>
                  <div className="text-xl font-extrabold text-[#B14B6C]">4</div>
                  <div className="text-[11px] text-[#565656] mt-0.5 font-medium">Shop resources</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectorTicker />

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-[#7A2E49] via-[#B14B6C] to-[#E7A0B6] text-white">
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#B14B6C] text-xs font-bold hover:bg-[#f3f5fb] transition-colors shrink-0 shadow-md"
          >
            <span>Speak With an Advisor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Our Approach to Technical Training (Interactive Parallax Scroll Feature) */}
      <section className="py-20 sm:py-24 bg-white border-b border-[#F0E2E7]">
        <div className="site-container">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#B14B6C]">
              How the academy works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1F1F] tracking-tight mt-2 leading-snug">
              Learn it. Teach it. Certify it.
            </h2>
            <p className="text-base sm:text-lg text-[#565656] mt-3 leading-relaxed font-normal">
              The four paths published by Savvy Training Academy.
            </p>
          </div>

          {/* Sticky Parallax Scroll Cards */}
          <CardsParallax items={approachCards} />

          {/* Action Row */}
          <div className="mt-14 text-center flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/courses"
              className="px-8 py-3.5 rounded-full bg-[#B14B6C] text-white text-sm font-bold hover:bg-[#8E3854] transition-colors shadow-sm"
            >
              Explore Course Syllabi
            </Link>
            <Link
              href="/contact-us"
              className="px-8 py-3.5 rounded-full border-2 border-[#B14B6C] text-[#B14B6C] text-sm font-bold hover:bg-[#FBEAF0] transition-colors"
            >
              Contact Course Advisor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
