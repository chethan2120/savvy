import React from 'react';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { PreEnrollmentOffers } from '@/components/PreEnrollmentOffers';
import { placementsData, recruitersData, placementStats, defaultSettings } from '@/lib/data';
import {
  Briefcase, TrendingUp, Globe2, Building2, Phone, CheckCircle2, MapPin, GraduationCap, ArrowUpRight,
} from 'lucide-react';

export const metadata = {
  title: 'Placements | 10,000+ Students Placed in NDT, QA/QC & Safety Jobs',
  description:
    'Savvy Training Institute has placed 10,000+ students with 250+ hiring partners across India and the Gulf. See recent placements, recruiters, salary ranges and how our placement cell works.',
};

const process = [
  { step: '01', title: 'Skill Assessment', desc: 'Placement cell profiles every enrolled student on qualification, experience and preferred sector.' },
  { step: '02', title: 'Practical Certification', desc: 'Hands-on lab hours and industry-standard certification make the CV recruiter-ready.' },
  { step: '03', title: 'CV & Interview Prep', desc: 'CV rewriting workshops, technical mock interviews and HR rounds with our trainers.' },
  { step: '04', title: 'Recruiter Referrals', desc: 'Direct referrals to inspection agencies, EPC contractors and refineries hiring that month.' },
  { step: '05', title: 'Interview Drives', desc: 'On-campus and virtual drives, including Gulf employers hiring for overseas projects.' },
  { step: '06', title: 'Post-Joining Support', desc: 'Documentation, visa guidance for overseas roles, and lifetime re-placement assistance.' },
];

export default function PlacementPage() {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero */}
      <PageHero
        breadcrumbs={[{ label: 'Placements' }]}
        title={<>{placementStats.students_placed} students placed. That is the whole point.</>}
        description={
          <>
            Training is only half the job. Our dedicated placement cell works with{' '}
            {placementStats.hiring_partners} hiring partners across {placementStats.countries} countries to move
            certified graduates into inspection, QA/QC, safety and HVAC roles in India and the Gulf.
          </>
        }
        media={{ type: 'image', src: '/images/hero-placement.png' }}
        mediaAlt="Certified technicians walking through an industrial plant corridor"
        actions={
          <>
            <Link href="/admission" className="pill-button-forest text-xs py-3 px-6">
              Apply for Admission
            </Link>
            <a
              href={`tel:${defaultSettings.phone_primary.replace(/\s/g, '')}`}
              className="pill-button-secondary text-xs py-3 px-6 flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Call Placement Cell
            </a>
          </>
        }
      />

      {/* Placement numbers */}
      <section className="site-container">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <Stat icon={<GraduationCap className="w-5 h-5" />} value={placementStats.students_placed} label="Students Placed" />
          <Stat icon={<Briefcase className="w-5 h-5" />} value={placementStats.placement_support} label="Placement Support" />
          <Stat icon={<TrendingUp className="w-5 h-5" />} value={placementStats.highest_package} label="Highest Package" />
          <Stat icon={<Building2 className="w-5 h-5" />} value={placementStats.hiring_partners} label="Hiring Partners" />
          <Stat icon={<Globe2 className="w-5 h-5" />} value={placementStats.countries} label="Countries" />
        </div>
      </section>

      {/* Recent placements */}
      <section className="site-container flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-forest font-semibold">Recent Placements</span>
          <h2 className="text-headline font-normal text-foreground">Where our students landed</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {placementsData.map((p) => (
            <div key={p.id} className="editorial-card bg-surface p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.photo_url && (
                  <img src={p.photo_url} alt={p.student_name} className="w-12 h-12 rounded-full object-cover border border-border" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{p.student_name}</span>
                  <span className="text-[11px] text-muted-foreground">{p.course_title}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-foreground flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-forest" /> {p.job_role}
                </span>
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {p.company}
                </span>
                {p.location && (
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {p.location}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto pt-2">
                {p.package_lpa && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest/10 text-forest">{p.package_lpa}</span>
                )}
                <span className="text-[11px] text-muted-foreground">Placed {fmt(p.placed_on)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recruiters */}
      <section className="bg-surface py-14 border-y border-border">
        <div className="site-container flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-forest font-semibold">Hiring Partners</span>
            <h2 className="text-headline font-normal text-foreground">Companies that hire from us</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recruitersData.map((r) => (
              <div key={r.id} className="editorial-card bg-background p-4 flex flex-col gap-1 items-center text-center">
                <span className="text-xs font-semibold text-foreground">{r.name}</span>
                {r.industry && <span className="text-[10px] text-muted-foreground">{r.industry}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="site-container flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-forest font-semibold">How It Works</span>
          <h2 className="text-headline font-normal text-foreground">Our placement process</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {process.map((s) => (
            <div key={s.step} className="editorial-card bg-surface p-6 flex flex-col gap-2">
              <span className="text-2xl font-light text-forest">{s.step}</span>
              <h3 className="text-base font-normal text-foreground">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Support promise */}
      <section className="site-container">
        <div className="editorial-card bg-forest text-white p-10 flex flex-col gap-5">
          <h2 className="text-headline font-normal">100% Placement Assistance Guarantee</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              'Lifetime re-placement assistance for every certified graduate',
              'Dedicated placement officer assigned per batch',
              'Gulf & overseas job assistance including documentation',
              'Free CV building and technical interview preparation',
              'Regular on-campus and virtual recruiter drives',
              'Alumni network of 10,000+ working professionals',
            ].map((line) => (
              <li key={line} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> {line}
              </li>
            ))}
          </ul>
          <Link href="/admission" className="self-start pill-button-secondary text-xs py-3 px-6 flex items-center gap-1.5">
            Start your application <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <PreEnrollmentOffers />
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="editorial-card bg-surface p-6 flex flex-col items-center text-center gap-2">
      <span className="text-forest">{icon}</span>
      <span className="text-3xl font-light text-foreground tracking-tight">{value}</span>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
