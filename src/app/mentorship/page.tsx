import { PageHeroBanner } from '@/components/common/PageHeroBanner';
import { MentorshipEnquiryForm } from '@/components/enquiries/EnquiryNotice';
import { mentorshipServices } from '@/lib/academy-content';

export const metadata = {
  title: 'Mentorship | Savvy Training Institute',
  description: 'One-to-one guidance from Lisa Zaman, from a first business idea through to a registered training centre.',
};

export default function MentorshipPage() {
  return (
    <div className="bg-white pb-20">
      <PageHeroBanner
        badgeText="Mentorship"
        title="From a first idea to a registered centre"
        description="One-to-one guidance from Lisa Zaman. Choose business start-up, regular mentorship, venue setup or awarding body registration."
        imageSrc="/images/heroes/about-hero.jpg"
        imageAlt="Savvy training workspace"
      />
      <section className="site-container py-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {mentorshipServices.map((item) => (
            <article key={item.title} className="rounded-2xl border border-[#EAD9E0] p-5">
              <h2 className="text-lg font-semibold text-[#641B38]">{item.title}</h2>
              <p className="mt-2 text-sm text-[#30262B]">{item.body}</p>
            </article>
          ))}
        </div>
        <MentorshipEnquiryForm />
      </section>
    </div>
  );
}
