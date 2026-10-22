import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, Award, Shield, Users, Globe2, BookOpen, Layers, HelpCircle, QrCode, ShieldCheck, PlayCircle, MonitorPlay } from 'lucide-react';
import { defaultSettings } from '@/lib/data';
import { USE_INKHERO } from '@/config/hero';
import { CoinHero } from '@/components/hero/CoinHero';
import { SavvyInkHero } from '@/components/hero/SavvyInkHero';
import { KineticStatement } from '@/components/motion/KineticStatement';
import { Reveal } from '@/components/motion/Reveal';
import { RecognitionSection } from '@/components/RecognitionSection';
import { FeaturedCoursesShowcase } from '@/components/FeaturedCoursesShowcase';
import { InstructorCard } from '@/components/InstructorCard';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { Accordion } from '@/components/Accordion';
import { ContactForm } from '@/components/ContactForm';
import { PreEnrollmentOffers } from '@/components/PreEnrollmentOffers';
import { instructorsData, testimonialsData, blogPostsData, galleryData } from '@/lib/data';
import { getPublishedCourses } from '@/lib/courses';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { courses, error: courseError } = await getPublishedCourses();
  const featuredCourses = courses;
  const generalFAQs = [
    {
      id: 'faq1',
      question: 'What is Non-Destructive Testing (NDT)?',
      answer: 'NDT Level II course is a specialized educational program focused on teaching inspection techniques used to evaluate the properties of materials, welds, and structures without causing any damage. It is critical in aerospace, oil & gas, power, and manufacturing.',
    },
    {
      id: 'faq2',
      question: 'What is the difference between NDT Level I, Level II, and Level III?',
      answer: '• Level I: Performs basic calibrations and tests under supervision.\n• Level II: Calibrates equipment, conducts tests, interprets results, and supervises Level I technicians.\n• Level III: Establishes techniques, interprets codes, designs procedures, and manages NDT operations.',
    },
    {
      id: 'faq3',
      question: 'Does completing a course guarantee employment?',
      answer: 'No. Career outcomes depend on each learner’s qualifications, experience, and employer requirements.',
    },
    {
      id: 'faq4',
      question: 'What qualifications are required to join the NDT Level II course?',
      answer: 'Engineering graduates (B.Tech), Mechanical/Civil/Electrical Diploma holders, B.Sc graduates, ITI holders, or 12th pass students can enroll.',
    },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* USE_INKHERO in src/config/hero.ts. CoinHero and CinematicHero stay in the repo. */}
      {USE_INKHERO ? <SavvyInkHero /> : <CoinHero />}

      {/* Recognitions stay in the codebase and render only when Website Settings allows them. */}
      <RecognitionSection />

      {/* Pinned kinetic statement */}
      <KineticStatement eyebrow="Build technical capability" lines={['Learn', 'Practise']} />

      {/* Section D: Institute Introduction (Mission, Vision, Motto) */}
      <section className="site-container">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-start gap-3 max-w-3xl">
            <span className="accent-tag-periwinkle">About Our Institute</span>
            <h2 className="text-h1 font-normal text-foreground">
              Your launchpad to a brilliant and exciting technical career
            </h2>
            <p className="text-body-large text-muted-foreground leading-relaxed">
              Discover Savvy Training Institute&apos;s programmes in Non-Destructive Testing and Quality Assurance, with course details and eligibility information.
            </p>
          </div>

          <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="editorial-card p-8 flex flex-col gap-4 bg-surface">
              <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-normal text-foreground">Our Mission</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To empower individuals with practical knowledge and skills needed to excel in Non-Destructive Testing (NDT) and Quality Assurance / Quality Control (QA/QC), shaping industry-ready technical experts.
              </p>
            </div>

            <div className="editorial-card p-8 flex flex-col gap-4 bg-surface">
              <div className="w-12 h-12 rounded-2xl bg-periwinkle/30 text-foreground flex items-center justify-center">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-normal text-foreground">Our Vision</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To support technical learning in industrial testing through education, practice, and innovation.
              </p>
            </div>

            <div className="editorial-card p-8 flex flex-col gap-4 bg-surface">
              <div className="w-12 h-12 rounded-2xl bg-yellow/40 text-foreground flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-normal text-foreground">Our Motto</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Transforming aspiring individuals into certified professionals with secure futures. Our core values remain quality instruction, uncompromised integrity, and student success.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section E: Featured Courses */}
      {courseError ? (
        <p role="alert" className="site-container rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">{courseError}</p>
      ) : <FeaturedCoursesShowcase courses={featuredCourses} />}

      {/* Why choose Savvy Training Institute */}
      <section className="bg-surface py-20 border-y border-border">
        <div className="site-container flex flex-col gap-12">
          <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
            <span className="accent-tag-yellow">Why Choose Us</span>
            <h2 className="text-h1 font-normal text-foreground">
              Trustworthy and efficient industrial training
            </h2>
            <p className="text-sm text-muted-foreground">
              We bridge textbook theory and practical industrial application with modern lab infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-background flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-normal text-foreground">Interactive Learning</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hands-on flaw detection practice on actual test pieces using ultrasonic detectors, magnetic yokes, and film viewing screens.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-background flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-normal text-foreground">Expert Instructors</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Learn directly from ASNT Level III and CSWIP certified inspectors with over 10+ years of active field experience.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-background flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-normal text-foreground">Career pathways</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Explore the technical roles and industries related to each programme.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-background flex flex-col gap-3">
              <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center">
                <Globe2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-normal text-foreground">Online &amp; Classroom</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Flexible weekday and weekend batches available both in-person at the Bengaluru training centre and online for working engineers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-enrolment offers */}
      <PreEnrollmentOffers />

      {/* Online training + protected videos */}
      <section className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col gap-5">
            <span className="accent-tag-periwinkle self-start">Online Training</span>
            <h2 className="text-h1 font-normal text-foreground">Learn online, with course material that stays yours alone</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every enrolled student gets a private portal with recorded lessons, live batch links and downloadable-free
              study notes. Video lessons are streamed through short-lived private links and carry your enrolment ID as a
              watermark, so course content cannot be downloaded or passed around.
            </p>
            <ul className="flex flex-col gap-2.5 text-xs text-foreground">
              <li className="flex items-center gap-2"><MonitorPlay className="w-4 h-4 text-forest" /> Recorded + live online batches</li>
              <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-forest" /> Download and screen-share protection on all videos</li>
              <li className="flex items-center gap-2"><PlayCircle className="w-4 h-4 text-forest" /> Access only for students enrolled in that course</li>
            </ul>
            <Link href="/student" className="pill-button-forest text-xs py-3 px-6 self-start">Open Student Portal</Link>
          </div>

          <div className="editorial-card bg-surface p-8 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-forest" />
              <h3 className="text-xl font-normal text-foreground">Lost your certificate?</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter the Certificate Number or Enrolment ID issued by the institute to verify and regenerate a printable
              copy instantly. Every certificate also carries a QR code — one scan opens the same verification page.
            </p>
            <ul className="flex flex-col gap-2.5 text-xs text-foreground">
              <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-forest" /> Employer-friendly public verification</li>
              <li className="flex items-center gap-2"><QrCode className="w-4 h-4 text-forest" /> QR code printed on every certificate</li>
            </ul>
            <Link href="/verify-certificate" className="pill-button-forest text-xs py-3 px-6 self-start">
              Verify / Regenerate Certificate
            </Link>
          </div>
        </div>
      </section>

      <section className="site-container">
        <div className="editorial-card flex flex-col gap-4 bg-surface p-8 md:p-12">
          <span className="accent-tag-periwinkle self-start">Career pathways</span>
          <h2 className="text-h1 font-normal text-foreground">Build skills for your next step</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Course completion does not guarantee a job. Employment outcomes depend on qualifications, experience, and employer requirements.
          </p>
          <Link href="/course" className="pill-button-forest self-start px-6 py-3 text-xs">Explore courses</Link>
        </div>
      </section>

      {/* Section H: Training Process Timeline */}
      <section id="how-certification-works" className="site-container scroll-mt-28">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
            <span className="accent-tag-pink">Training Journey</span>
            <h2 className="text-h1 font-normal text-foreground">
              Your 6-step path to becoming a certified inspector
            </h2>
          </div>

          <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { step: '01', title: 'Counselling', desc: 'Talk with our expert to pick the right course for your background.' },
              { step: '02', title: 'Enrolment', desc: 'Complete registration and submit required documents.' },
              { step: '03', title: 'Classroom', desc: 'Master ASNT codes, standards, and inspection theory.' },
              { step: '04', title: 'Lab Work', desc: 'Practice flaw detection on actual test samples in our lab.' },
              { step: '05', title: 'Certification', desc: 'Pass examinations to earn ASNT Level II credentials.' },
              { step: '06', title: 'Next steps', desc: 'Review employer requirements for the roles related to your course.' },
            ].map((s, index) => (
              <div key={index} className="editorial-card p-6 flex flex-col gap-3 relative">
                <span className="text-3xl font-light text-forest">{s.step}</span>
                <h4 className="text-base font-normal text-foreground">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Section I: Instructors */}
      <section className="bg-surface py-20 border-y border-border">
        <div className="site-container flex flex-col gap-12">
          <div className="flex flex-col items-start gap-3">
            <span className="accent-tag-periwinkle">Faculty Leadership</span>
            <h2 className="text-h1 font-normal text-foreground">
              Meet our skilled instructors
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Esteemed for their deep technical expertise, ASNT Level III credentials, and dedication to student success.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructorsData.map((inst) => (
              <InstructorCard key={inst.id} instructor={inst} />
            ))}
          </div>
        </div>
      </section>

      {/* Section J: Testimonials */}
      <section className="site-container">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col items-center text-center gap-3">
            <span className="accent-tag-yellow">Student Reviews</span>
            <h2 className="text-h1 font-normal text-foreground">
              What our graduates say
            </h2>
          </div>

          <TestimonialCarousel testimonials={testimonialsData} />
        </div>
      </section>

      {/* Course prices and details come from the published catalogue. */}
      <section className="site-container">
        <div className="editorial-card flex flex-col items-start gap-4 bg-surface p-8 md:p-12">
          <span className="accent-tag-pink">Course catalogue</span>
          <h2 className="text-h1 font-normal text-foreground">Current courses and fees</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">View the live course catalogue for current prices, durations, and programme summaries.</p>
          <Link href="/course" className="pill-button-forest px-6 py-3 text-xs">Browse all courses</Link>
        </div>
      </section>
      {/* Section L: Student Gallery Preview */}
      <section className="bg-surface py-20 border-y border-border">
        <div className="site-container flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="accent-tag-periwinkle">Practical Exposure</span>
              <h2 className="text-h1 font-normal text-foreground">
                Our student training gallery
              </h2>
            </div>
            <Link href="/gallery" className="pill-button-secondary text-xs py-3 px-6 shrink-0">
              View Full Gallery &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {galleryData.slice(0, 4).map((g) => (
              <div key={g.id} className="editorial-card overflow-hidden relative aspect-[4/3] group">
                <Image
                  src={g.image_url}
                  alt={g.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 flex items-end">
                  <span className="text-xs text-white font-medium">{g.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section M: Frequently Asked Questions */}
      <section className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="accent-tag-yellow self-start">FAQ Assistance</span>
            <h2 className="text-h1 font-normal text-foreground">
              Frequently asked questions
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Find answers about NDT Level II certification, qualification criteria, and course durations.
            </p>

            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-3 mt-4">
              <HelpCircle className="w-8 h-8 text-forest" />
              <h4 className="text-base font-normal text-foreground">Still Have Questions?</h4>
              <p className="text-xs text-muted-foreground">Talk with our senior counsellors for immediate guidance.</p>
              <a href={`tel:${defaultSettings.phone_primary.replace(/\s/g, '')}`} className="text-xs font-semibold text-forest hover:underline">
                Call {defaultSettings.phone_primary} &rarr;
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Accordion items={generalFAQs} />
          </div>
        </div>
      </section>

      {/* Section N: Final Enrolment Form & Contact */}
      <section className="site-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <span className="accent-tag-pink self-start">Start Today</span>
            <h2 className="text-display font-normal text-foreground leading-tight">
              Ready to launch your technical inspection career?
            </h2>
            <p className="text-body-large text-muted-foreground leading-relaxed">
              Join Savvy Training Institute in Bengaluru and transform your career with hands-on lab training and international certification.
            </p>
            <div className="flex flex-col gap-3 text-xs text-foreground font-medium pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>ASNT Level II &amp; QA/QC Certified Program</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Employment outcomes are not guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest" />
                <span>Flexible Online &amp; Offline Batches</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
