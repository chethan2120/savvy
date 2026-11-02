import { PageHeroBanner } from '@/components/common/PageHeroBanner';
import { CareerEnquiryForm } from '@/components/enquiries/EnquiryNotice';
import { careerSteps } from '@/lib/academy-content';

export const metadata = {
  title: 'Careers | Savvy Training Institute',
  description: 'Salons, spas, clinics and training centres use Savvy to find staff. Submit your CV with your specialism, location and availability.',
};

export default function CareersPage() {
  return (
    <div className="bg-white pb-20">
      <PageHeroBanner
        badgeText="Careers"
        title="Employers are looking for your skills"
        description="Salons, spas, clinics and training centres ask Savvy for staff. Upload your CV with your specialism, location and availability. Your details are only shared with employers you are matched with."
        imageSrc="/images/heroes/about-hero.jpg"
        imageAlt="Savvy training workspace"
      />
      <section className="site-container py-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ol className="flex flex-col gap-4">
          {careerSteps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-[#F0E2E7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#B14B6C]">Step {index + 1}</p>
              <h2 className="mt-1 text-lg font-semibold text-[#1F1F1F]">{step.title}</h2>
              <p className="mt-1 text-sm text-[#565656]">{step.body}</p>
            </li>
          ))}
        </ol>
        <CareerEnquiryForm />
      </section>
    </div>
  );
}
