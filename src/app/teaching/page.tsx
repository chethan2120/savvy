import { PageHeroBanner } from '@/components/common/PageHeroBanner';
import { TeachingCatalogue } from '@/components/teaching/TeachingCatalogue';
import { teachingQualifications } from '@/lib/academy-content';
import { courseVisual } from '@/lib/course-visuals';
import { websiteCourses } from '@/lib/server/institute-db';

export const revalidate = 0;

export const metadata = {
  title: 'Teaching qualifications | Savvy Training Institute',
  description: 'Regulated teaching qualifications, completed fully online with live Zoom sessions.',
};

export default function TeachingPage() {
  const courses = websiteCourses();
  const images = Object.fromEntries(teachingQualifications.map((item) => {
    const published = courses.find((course) => course.slug === item.slug);
    const visual = courseVisual(item.slug);
    return [item.slug, {
      src: published?.featured_image || visual?.src || '',
      alt: visual?.alt || item.title,
    }];
  }));

  return (
    <div className="bg-white pb-20">
      <PageHeroBanner
        variant="about"
        badgeText="Teaching"
        title="Teaching qualifications for people who want to teach"
        description="Compare the five regulated teaching qualifications. Each one is completed online, with live Zoom sessions, assignment upload and written tutor feedback."
        imageSrc="/images/courses/award-in-education-and-training.jpg"
        imageAlt="A tutor working with adult learners in a classroom"
        actionHref="#qualifications"
        actionLabel="View qualifications"
      />
      <TeachingCatalogue images={images} />
    </div>
  );
}
