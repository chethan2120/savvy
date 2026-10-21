import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { MetricStrip } from '@/components/MetricStrip';
import { InstructorCard } from '@/components/InstructorCard';
import { instructorsData } from '@/lib/data';
import { ShieldCheck, Award, Briefcase, CheckCircle2, UserCheck, Wrench, Users } from 'lucide-react';

export const metadata = {
  title: 'About Us | Leading NDT & QA/QC Training Institute in India',
  description:
    'Learn about Savvy Training Institute – India’s top NDT Training Institute offering certified courses in NDT Level 2, QA QC, Fire & Safety, HVAC, and Revit MEP with 100% placement.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Full-bleed hero */}
      <PageHero
        breadcrumbs={[{ label: 'About Us' }]}
        title="About Savvy Training Institute"
        description="Empowering technical professionals and engineering graduates with practical Non-Destructive Testing and Quality Assurance skills since 2018."
        media={{ type: 'video', src: '/video/hero-about.mp4', poster: '/images/hero-factory.jpg' }}
      />

      {/* Main About Story */}
      <section className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="accent-tag-periwinkle self-start">Our Foundation</span>
            <h2 className="text-h1 font-normal text-foreground">
              Shaping future leaders in Non-Destructive Testing &amp; Engineering
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Welcome to Savvy Training Institute — a premier training hub dedicated to building technical expertise in Non-Destructive Testing (NDT Level II), Quality Assurance / Quality Control (QA/QC), HVAC, MEP, and Fire &amp; Safety engineering.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our mission is to deliver industry-relevant education that bridges textbook theory with practical lab applications. We provide 100% placement support in top oil &amp; gas refineries, aerospace manufacturers, power plants, and construction projects across India and abroad.
            </p>
          </div>

          <div className="lg:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-overlay">
            <Image
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1000&auto=format&fit=crop"
              alt="WWNDT Institute Practical Inspection Training"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Director's Message */}
      <section className="bg-surface py-20 border-y border-border">
        <div className="site-container">
          <div className="editorial-card p-8 md:p-14 bg-background border-border grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4 relative aspect-[3/4] rounded-2xl overflow-hidden border border-border">
              <Image
                src="/instructors/feroz-alam.jpg"
                alt="Feroz Alam - Director"
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="object-cover"
              />
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
              <span className="accent-tag-yellow self-start">Leadership Perspective</span>
              <h2 className="text-h1 font-normal text-foreground">
                Director&apos;s Message
              </h2>
              <blockquote className="text-sm md:text-base text-foreground font-normal leading-relaxed italic">
                &ldquo;At Savvy Training Institute, our vision is to build a skilled workforce ready to meet the evolving demands of the global industrial landscape. As Director, I take immense pride in our commitment to delivering quality training in NDT, QA/QC, HVAC, MEP, and Fire &amp; Safety. We believe education must go beyond textbooks — it should empower individuals with hands-on experience, confidence, and real-world skills.&rdquo;
              </blockquote>
              <div className="flex flex-col pt-2 border-t border-border">
                <span className="font-semibold text-base text-foreground">Feroz Alam</span>
                <span className="text-xs text-forest font-medium">Director, Savvy Training Institute</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Metric Strip */}
      <MetricStrip />

      {/* Services Provided: Training, Inspection, Manpower */}
      <section className="site-container">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
            <span className="accent-tag-pink">Core Capabilities</span>
            <h2 className="text-h1 font-normal text-foreground">
              Industrial Training, Inspection &amp; Manpower Supply
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="editorial-card p-8 flex flex-col gap-4 bg-surface">
              <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-normal text-foreground">Technical Training</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Specialized ASNT Level II and QA/QC training programs with hands-on lab sessions, mock exams, and guaranteed job placement support.
              </p>
            </div>

            <div className="editorial-card p-8 flex flex-col gap-4 bg-surface">
              <div className="w-12 h-12 rounded-2xl bg-periwinkle/30 text-foreground flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-normal text-foreground">Inspection Services</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Third-party NDT flaw detection, welding inspection, and quality control auditing for industrial plants, pipelines, and structural fabrications.
              </p>
            </div>

            <div className="editorial-card p-8 flex flex-col gap-4 bg-surface">
              <div className="w-12 h-12 rounded-2xl bg-yellow/40 text-foreground flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-normal text-foreground">Manpower Supply</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connecting top engineering contractors with certified Level II technicians, QA/QC inspectors, and Safety Officers for domestic and overseas projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admission Steps */}
      <section className="bg-surface py-20 border-y border-border">
        <div className="site-container flex flex-col gap-12">
          <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
            <span className="accent-tag-periwinkle">Simple Procedure</span>
            <h2 className="text-h1 font-normal text-foreground">
              Four steps to join Savvy Training Institute
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 'Step 1', title: 'Inquiry Form', desc: 'Submit the online inquiry form or call our counsellors.' },
              { step: 'Step 2', title: 'Campus & Lab Tour', desc: 'Schedule a visit to inspect our equipment and training facilities.' },
              { step: 'Step 3', title: 'Application', desc: 'Complete enrolment registration and select preferred batch mode.' },
              { step: 'Step 4', title: 'Acceptance', desc: 'Receive your acceptance letter, start classes, and begin your journey.' },
            ].map((st, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-border bg-background flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-forest">{st.step}</span>
                <h4 className="text-lg font-normal text-foreground">{st.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors Team */}
      <section className="site-container">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col items-start gap-3">
            <span className="accent-tag-yellow">Faculty Leadership</span>
            <h2 className="text-h1 font-normal text-foreground">Our Experienced Instructors</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructorsData.map((inst) => (
              <InstructorCard key={inst.id} instructor={inst} />
            ))}
          </div>
        </div>
      </section>

      {/* Final Enrolment Banner */}
      <section className="site-container">
        <div className="editorial-card p-10 md:p-14 bg-foreground text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-2xl">
            <h2 className="text-h2 font-normal text-white">Ready to start your journey?</h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Join certified NDT Level II &amp; QA/QC programs with 100% placement support in India and abroad.
            </p>
          </div>
          <Link href="/admission" className="pill-button-forest text-xs py-3.5 px-8 shrink-0">
            Apply Online Now
          </Link>
        </div>
      </section>
    </div>
  );
}
