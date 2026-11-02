import React from 'react';
import { listHomepageFaqs, listPublicFeedback, listPublicReviews, websiteCourses, listCategories } from '@/lib/server/institute-db';
import { categoryVisual } from '@/lib/course-visuals';
import { SectorTicker } from '@/components/common/SectorTicker';
import { CareerStrategyCall } from '@/components/home/CareerStrategyCall';
import { EditorialHero } from '@/components/home/EditorialHero';
import { PopularCoursesSection } from '@/components/home/PopularCoursesSection';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { WhySavvySection } from '@/components/home/WhySavvySection';
import { CertificateCtaSection } from '@/components/home/CertificateCtaSection';
import { FaqSection } from '@/components/home/FaqSection';
import Testimonial3 from '@/components/ui/testimonial-section-3';
import { Shield, BookOpen, Compass, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Dynamically split below-the-fold interactive components to minimize initial JavaScript bundle size
export const revalidate = 0;

export default async function HomePage() {
  const courses = websiteCourses();
  const rawCategories = listCategories().filter((cat) => cat.active);

  const categories = rawCategories.map((cat) => {
    const visual = categoryVisual(cat.id, cat.name);
    const sample = courses.find((course) => course.category === cat.name);
    const image = sample?.featured_image || visual?.src || '';
    return {
      id: cat.id,
      name: cat.name,
      description: cat.description,
      courseCount: courses.filter((c) => c.category === cat.name || (c as { categoryId?: string }).categoryId === cat.id).length,
      image,
      imageAlt: image && image === visual?.src ? visual.alt : (sample?.title || cat.name),
    };
  }).filter((cat) => cat.courseCount > 0);

  const testimonials = [
    ...listPublicReviews().map((review) => ({
      id: review.id,
      name: review.authorName,
      course: review.courseTitle,
      quote: review.body,
      rating: review.rating,
    })),
    ...listPublicFeedback().map((item) => ({
      id: item.id,
      name: item.name,
      course: item.courseTitle,
      quote: item.body,
      rating: item.rating,
    })),
  ];

  return (
    <div className="flex flex-col">
      {/* 1. Modern UK Editorial Hero Section */}
      <EditorialHero />

      <section className="border-b border-[#EAD9E0] bg-white py-12 sm:py-16">
        <div className="site-container">
          <h2 className="text-center text-[#641B38]">A calmer way to qualify</h2>
          <div className="reveal-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Industry Experts', 'Learn from experienced professionals.'],
              ['100% Online', 'Learn at your convenience.'],
              ['Recognised Certification', 'Enhance your career.'],
              ['Beauty Categories', 'Nails, brows, lashes and more.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-[#EAD9E0] bg-[#F8EDF1] p-6">
                <h3 className="text-lg text-[#641B38]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#30262B]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectorTicker />

      {/* 2. Popular / Best-Selling Courses (3 cards with Contact Us CTA pre-fill) */}
      <PopularCoursesSection courses={courses}>
        <CareerStrategyCall />
      </PopularCoursesSection>

      {/* 3. Category Showcase Grid */}
      <CategoryShowcase categories={categories} />

      {/* 4. Why Savvy? Institutional Strengths (Placed immediately after Category Showcase) */}
      <WhySavvySection />

      {/* Part 5. Coursera-Style Institutional & Enterprise Excellence Section */}
      <section className="py-20 sm:py-24 bg-white border-b border-[#EAD9E0]">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAD9E0] shadow-2xs mb-4">
                <span className="w-2 h-2 rounded-full bg-[#B83268]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#B83268]">
                  The Savvy Standard
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#641B38] tracking-tight mt-1 leading-snug">
                Learn it. Teach it. Certify it.
              </h2>
              <p className="text-sm sm:text-base text-[#30262B] mt-3 leading-relaxed font-normal">
                Savvy Training Academy helps professionals and businesses get their skills recognised. Earn a teaching qualification, take an online course, or get accredited to certify learners in your own right.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
                <div className="p-5 rounded-2xl bg-white border border-[#EAD9E0] shadow-xs hover:border-[#B83268]/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-[#F8EDF1] flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5 text-[#B83268]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#641B38]">Apply online</h3>
                  <p className="text-xs text-[#30262B] mt-1.5 leading-relaxed font-normal">
                    Tell Savvy about your business, the course you deliver and who it is for.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#EAD9E0] shadow-xs hover:border-[#B83268]/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-[#F8EDF1] flex items-center justify-center mb-3">
                    <Compass className="w-5 h-5 text-[#B83268]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#641B38]">Document review</h3>
                  <p className="text-xs text-[#30262B] mt-1.5 leading-relaxed font-normal">
                    Course manuals, lesson plans, assessment materials, insurance and your own qualifications are reviewed by Lisa.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#EAD9E0] shadow-xs hover:border-[#B83268]/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-[#F8EDF1] flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-[#B83268]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#641B38]">Written feedback</h3>
                  <p className="text-xs text-[#30262B] mt-1.5 leading-relaxed font-normal">
                    You receive written feedback on content, assessment and learner-safety before anything is approved.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#EAD9E0] shadow-xs hover:border-[#B83268]/50 transition-all">
                  <div className="h-10 w-10 rounded-xl bg-[#F8EDF1] flex items-center justify-center mb-3">
                    <Award className="w-5 h-5 text-[#B83268]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#641B38]">Certificate and logo</h3>
                  <p className="text-xs text-[#30262B] mt-1.5 leading-relaxed font-normal">
                    Once approved, the accreditation certificate and logo are ready to download from the account.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-[#641B38] bg-[#641B38] p-8 text-white shadow-sm sm:p-10">
                <div className="relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B83268] bg-white px-3 py-1 rounded-full shadow-2xs">
                    Savvy for Enterprise &amp; Teams
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-4 tracking-tight">
                    Build your training business
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 mt-3 leading-relaxed">
                    Lisa offers one-to-one guidance from a first idea through to a registered centre, including venue setup and awarding body registration.
                  </p>

                  <div className="flex flex-col gap-3 mt-6 text-xs text-white">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#E8A6BC]" />
                      <span>Business start-ups, pricing, insurance and launch planning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#E8A6BC]" />
                      <span>Regular mentorship sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#E8A6BC]" />
                      <span>Course prices are shown in pounds sterling when a price has been set</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center gap-4">
                    <Link
                      href="/mentorship"
                      className="px-6 py-3 rounded-full bg-white hover:bg-slate-100 text-[#B83268] text-xs font-bold transition-all shadow-sm"
                    >
                      Request mentorship
                    </Link>
                    <Link
                      href="/accreditation"
                      className="px-6 py-3 rounded-full border border-white text-white text-xs font-bold hover:bg-white/10"
                    >
                      Apply for Accreditation
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

      <Testimonial3 testimonials={testimonials} />
      <FaqSection faqs={listHomepageFaqs()} />
      <CertificateCtaSection />
    </div>
  );
}
