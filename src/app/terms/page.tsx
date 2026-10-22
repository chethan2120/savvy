import React from 'react';
import { PageHero } from '@/components/PageHero';

export const metadata = {
  title: 'Terms of Service | Savvy Training Institute',
  description: 'Terms and conditions for enrolment, course attendance, and certification at Savvy Training Institute.',
};

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      <PageHero
        breadcrumbs={[{ label: 'Terms of Service' }]}
        title="Terms of Service"
        description="Last updated: July 24, 2026"
        media={{ type: 'image', src: '/images/hero-legal.png' }}
        mediaAlt="Layered document edges"
        compact
      />

      <section className="site-container max-w-4xl">
        <div className="editorial-card p-8 md:p-12 bg-surface flex flex-col gap-6 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-normal text-foreground">1. Admission &amp; Eligibility</h2>
          <p>
            Enrolment in NDT Level II and QA/QC programs requires compliance with prerequisite qualifications (Engineering Degree, Diploma, B.Sc, ITI, or 12th Pass). Students must provide truthful documents during application.
          </p>

          <h2 className="text-xl font-normal text-foreground">2. Certification Requirements</h2>
          <p>
            ASNT Level II and QA/QC certificates are awarded upon successful completion of required theory modules, practical flaw detection examinations, and minimum attendance standards as specified by written practice (ASNT SNT-TC-1A).
          </p>

          <h2 className="text-xl font-normal text-foreground">3. Placement Assistance</h2>
          <p>
            Completing a course does not guarantee employment. Career outcomes depend on each learner’s qualifications, experience, and employer requirements.
          </p>
        </div>
      </section>
    </div>
  );
}
