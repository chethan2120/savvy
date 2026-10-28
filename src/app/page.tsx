import React from 'react';
import dynamic from 'next/dynamic';
import { websiteCourses, listCategories } from '@/lib/server/institute-db';
import { testimonialsData } from '@/lib/data';
import { EditorialHero } from '@/components/home/EditorialHero';
import { PopularCoursesSection } from '@/components/home/PopularCoursesSection';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { WhySavvySection } from '@/components/home/WhySavvySection';
import { CertificateCtaSection } from '@/components/home/CertificateCtaSection';
import { Shield, BookOpen, Users, Compass, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Dynamically split below-the-fold interactive components to minimize initial JavaScript bundle size
const StrategyCallSection = dynamic(
  () => import('@/components/home/StrategyCallSection').then((m) => m.StrategyCallSection),
  { ssr: true }
);

const TestimonialsCarousel = dynamic(
  () => import('@/components/home/TestimonialsCarousel').then((m) => m.TestimonialsCarousel),
  { ssr: true }
);

const FaqSection = dynamic(
  () => import('@/components/home/FaqSection').then((m) => m.FaqSection),
  { ssr: true }
);

const AdmissionsHubSection = dynamic(
  () => import('@/components/home/AdmissionsHubSection').then((m) => m.AdmissionsHubSection),
  { ssr: true }
);

// High-performance Incremental Static Regeneration (revalidates every 60s)
export const revalidate = 60;

export default async function HomePage() {
  const courses = websiteCourses();
  const rawCategories = listCategories().filter((cat) => cat.active);

  const categories = rawCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    courseCount: courses.filter((c) => c.category === cat.name || (c as any).categoryId === cat.id).length,
  }));

  return (
    <div className="flex flex-col">
      {/* 1. Modern UK Editorial Hero Section */}
      <EditorialHero />

      <section className="bg-white border-b border-[#e2e8f0] py-7 sm:py-8">
        <div className="site-container">
          <h2 className="text-lg sm:text-2xl font-bold text-[#1F1F1F] tracking-tight">
            Calibrated to the codes industry hires for
          </h2>
          <div className="mt-4 flex items-center gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory">
            {['ASME', 'ASNT SNT-TC-1A', 'ISO 9712', 'TWI CSWIP', 'ASHRAE', 'IOSH', 'API'].map((code) => (
              <span
                key={code}
                className="shrink-0 snap-start inline-flex items-center px-4 py-2 rounded-full border border-[#e2e8f0] bg-white text-sm font-semibold text-[#1F1F1F] shadow-2xs"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Popular / Best-Selling Courses (3 cards with Contact Us CTA pre-fill) */}
      <PopularCoursesSection courses={courses} />

      {/* 3. Category Showcase Grid */}
      <CategoryShowcase categories={categories} />

      {/* 4. Why Savvy? Institutional Strengths (Placed immediately after Category Showcase) */}
      <WhySavvySection />

      {/* Part 5. Coursera-Style Institutional & Enterprise Excellence Section */}
      <section className="py-20 sm:py-24 bg-white border-b border-[#e2e8f0]">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e2e8f0] shadow-2xs mb-4">
                <span className="w-2 h-2 rounded-full bg-[#0056D2]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2]">
                  The Savvy Standard
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F1F1F] tracking-tight mt-1 leading-snug">
                Designed for International Professional &amp; Enterprise Excellence
              </h2>
              <p className="text-sm sm:text-base text-[#565656] mt-3 leading-relaxed font-normal">
                Savvy Training Institute delivers structured, laboratory-intensive technical instruction calibrated to the requirements of heavy manufacturing, infrastructure, oil &amp; gas, and energy engineering sectors.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
                <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#0056D2]/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-[#EBF3FF] flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5 text-[#0056D2]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1F1F1F]">Code Compliant</h3>
                  <p className="text-xs text-[#565656] mt-1.5 leading-relaxed font-normal">
                    Curriculum structured around ASNT SNT-TC-1A, ASME Boiler &amp; Pressure Vessel codes, and ISO quality frameworks.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#0056D2]/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-[#EBF3FF] flex items-center justify-center mb-3">
                    <Compass className="w-5 h-5 text-[#0056D2]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1F1F1F]">Real Instrumentation</h3>
                  <p className="text-xs text-[#565656] mt-1.5 leading-relaxed font-normal">
                    Direct access to ultrasonic flaw detectors, radiographic film readers, magnetic yokes, and Autodesk Revit MEP tools.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#0056D2]/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-[#EBF3FF] flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-[#0056D2]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1F1F1F]">Transparent Curricula</h3>
                  <p className="text-xs text-[#565656] mt-1.5 leading-relaxed font-normal">
                    Clear chapter breakdowns, estimated study hours, and defined prerequisites for every technical level.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs hover:border-[#0056D2]/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-[#EBF3FF] flex items-center justify-center mb-3">
                    <Award className="w-5 h-5 text-[#0056D2]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1F1F1F]">Verifiable Credentials</h3>
                  <p className="text-xs text-[#565656] mt-1.5 leading-relaxed font-normal">
                    Digital certificates with secure issue numbers verifiable through authorized portal lookups.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-[#003e9a] via-[#0056D2] to-[#0284c7] p-8 sm:p-10 text-white relative overflow-hidden shadow-xl border border-white/20">
                <div className="relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0056D2] bg-white px-3 py-1 rounded-full shadow-2xs">
                    Savvy for Enterprise &amp; Teams
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-4 tracking-tight">
                    Upskill Your Engineering Workforce
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 mt-3 leading-relaxed">
                    Custom corporate training batches, on-site ASME/ISO qualification, and third-party inspection readiness for EPC contractors and manufacturing plants.
                  </p>

                  <div className="flex flex-col gap-3 mt-6 text-xs text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Dedicated enterprise laboratory batches &amp; custom schedules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>On-premise NDT Level II &amp; QA/QC qualification workshops</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Multi-currency corporate billing (GBP £, USD $, INR ₹, AED)</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center gap-4">
                    <Link
                      href="/contact-us"
                      className="px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-[#0056D2] text-xs font-bold transition-all shadow-sm"
                    >
                      Request Corporate Proposal
                    </Link>
                    <Link
                      href="/about-us"
                      className="text-xs text-white/90 hover:text-white font-semibold underline underline-offset-4 transition-colors"
                    >
                      Learn more about Savvy
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Part 6. 40-Minute FREE Strategy Call Section (Inspired by Reference Layout) */}
      <StrategyCallSection />

      {/* Part 7. Authentic Testimonials Carousel */}
      <TestimonialsCarousel testimonials={testimonialsData} />

      {/* Part 8. Certificate Call-to-Action Section */}
      <CertificateCtaSection />

      {/* Part 9. Frequently Asked Questions */}
      <FaqSection />

      {/* Part 10. Admissions Hub & Upcoming Batches */}
      <AdmissionsHubSection />
    </div>
  );
}
