import Link from 'next/link';
import { PageHero } from '@/components/PageHero';

export const metadata = {
  title: 'Career Pathways | Savvy Training Institute',
  description: 'Explore technical career pathways related to Savvy Training Institute courses.',
};

export default function CareerPathwaysPage() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      <PageHero
        breadcrumbs={[{ label: 'Career Pathways' }]}
        title="Explore technical career pathways"
        description="Course pages describe programme content and duration. Employment outcomes depend on each learner’s qualifications, experience, and employer requirements; course completion does not guarantee a job."
        media={{ type: 'image', src: '/images/hero-placement.png' }}
        mediaAlt="Technical workplace"
      />
      <section className="site-container">
        <div className="editorial-card flex flex-col gap-4 bg-surface p-8 md:p-12">
          <h2 className="text-h2 font-normal">Review programmes and requirements</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Compare current course summaries, fees, durations, eligibility criteria, and certificates in the course catalogue.
          </p>
          <Link href="/course" className="pill-button-forest self-start px-6 py-3 text-xs">View courses</Link>
        </div>
      </section>
    </div>
  );
}
