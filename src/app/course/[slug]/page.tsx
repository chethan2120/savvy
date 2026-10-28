import { redirect, notFound } from 'next/navigation';
import { getPublishedCourse } from '@/lib/courses';

interface CourseSlugPageProps {
  params: { slug: string };
}

export default async function LegacyCourseRoute({ params }: CourseSlugPageProps) {
  const course = await getPublishedCourse(params.slug);
  if (course) {
    redirect(`/courses/${course.slug || course.id}`);
  }
  notFound();
}
