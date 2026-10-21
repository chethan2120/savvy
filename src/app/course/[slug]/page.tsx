import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { Accordion } from '@/components/Accordion';
import { ContactForm } from '@/components/ContactForm';
import { getPublishedCourse, getPublishedCourses } from '@/lib/courses';
import { Clock, Award, CheckCircle, ShieldCheck, BookOpen, ChevronRight, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface CourseDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const course = await getPublishedCourse(params.slug);
  if (!course) return {};

  return {
    title: `${course.title} | Savvy Training Institute`,
    description: course.short_description,
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const course = await getPublishedCourse(params.slug);

  if (!course) {
    notFound();
  }

  const { courses } = await getPublishedCourses();
  const otherCourses = courses.filter((c) => c.id !== course.id);

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Full-bleed hero */}
      <PageHero
        breadcrumbs={[{ label: 'Courses', href: '/course' }, { label: course.title }]}
        meta={
          <>
            <span className="accent-tag-periwinkle">{course.duration}</span>
            <span className="accent-tag-yellow">Fee: {course.fee}</span>
            {course.placement_support && (
              <span className="bg-forest text-white text-[10px] font-medium px-2.5 py-1 rounded-full">
                100% Job Placement Assistance
              </span>
            )}
          </>
        }
        title={course.title}
        description={course.short_description}
        media={{ type: 'image', src: course.featured_image }}
        mediaAlt={course.title}
      />

      {/* Main Content Grid */}
      <section className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Main Column */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-surface border border-border">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Duration</span>
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-forest" /> {course.duration}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Course Fee</span>
                <span className="text-sm font-semibold text-foreground">{course.fee}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Training Mode</span>
                <span className="text-sm font-semibold text-foreground">{course.training_mode}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Placement</span>
                <span className="text-sm font-semibold text-forest flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> 100% Support
                </span>
              </div>
            </div>

            {/* Course Overview */}
            <div className="flex flex-col gap-4">
              <h2 className="text-h2 font-normal text-foreground">Course Overview</h2>
              <div className="prose prose-slate text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {course.description}
              </div>
            </div>

            {/* Eligibility & Certification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="editorial-card p-6 flex flex-col gap-3 bg-surface">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <BookOpen className="w-4 h-4 text-forest" /> Eligibility Criteria
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{course.eligibility}</p>
              </div>

              <div className="editorial-card p-6 flex flex-col gap-3 bg-surface">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                  <Award className="w-4 h-4 text-forest" /> Certificate Issued
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{course.certification}</p>
              </div>
            </div>

            {/* Modules / Curriculum */}
            {course.modules && course.modules.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-h2 font-normal text-foreground">What You Will Learn (Curriculum)</h2>
                <div className="flex flex-col gap-3">
                  {course.modules.map((m, idx) => (
                    <div key={m.id} className="editorial-card p-5 flex flex-col gap-1.5 bg-surface">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="w-6 h-6 rounded-full bg-forest/10 text-forest text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        {m.title}
                      </div>
                      {m.description && (
                        <p className="text-xs text-muted-foreground pl-8 leading-relaxed">{m.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course FAQs */}
            {course.faqs && course.faqs.length > 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-h2 font-normal text-foreground">Course FAQs</h2>
                <Accordion items={course.faqs} />
              </div>
            )}

            {/* Enquiry Form */}
            <div className="flex flex-col gap-6 pt-4 border-t border-border">
              <h2 className="text-h2 font-normal text-foreground">Enquire About This Course</h2>
              <ContactForm />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Quick Action Box */}
            <div className="editorial-card p-6 flex flex-col gap-5 bg-surface sticky top-24">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Course Admission</span>
                <span className="text-2xl font-light text-foreground">{course.fee}</span>
              </div>

              <Link href="/admission" className="pill-button-forest text-xs py-3.5 text-center">
                Apply for Course Now
              </Link>

              <a href="tel:7290095961" className="pill-button-secondary text-xs py-3 text-center flex items-center justify-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Call Counsellor
              </a>

              <div className="hairline-divider" />

              {/* Other Courses Links */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-foreground">Other Specialized Courses</span>
                <div className="flex flex-col gap-2">
                  {otherCourses.map((oc) => (
                    <Link
                      key={oc.id}
                      href={`/course/${oc.slug}`}
                      className="text-xs text-muted-foreground hover:text-forest flex items-center justify-between py-1.5 border-b border-border/50 group"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">{oc.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-border group-hover:text-forest" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
