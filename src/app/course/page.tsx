import { PageHero } from '@/components/PageHero';
import { CourseCatalog } from '@/components/CourseCatalog';
import { getPublishedCourses } from '@/lib/courses';

export const dynamic = 'force-dynamic';

export default async function CourseListingPage() {
  const { courses, error } = await getPublishedCourses();

  return (
    <div className="flex flex-col gap-12 pb-20">
      <PageHero
        breadcrumbs={[{ label: 'Courses' }]}
        title="Certified Training Programmes"
        description="Explore Savvy Training Institute's current programmes, course fees and learning details."
        media={{ type: 'video', src: '/video/hero-course.mp4', poster: '/images/course/ndt-level-2-course.png' }}
      />
      <CourseCatalog courses={courses} error={error} />
    </div>
  );
}
