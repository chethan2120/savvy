import { refreshCourseCatalog, websiteCourses } from '@/lib/server/institute-db';
import type { Course } from '@/lib/types';

export async function getPublishedCourses(): Promise<{ courses: Course[]; fromDatabase: boolean; error?: string }> {
  await refreshCourseCatalog();
  return { courses: websiteCourses(), fromDatabase: false };
}

export async function getPublishedCourse(identifier: string): Promise<Course | null> {
  await refreshCourseCatalog();
  return websiteCourses().find((course) => course.slug === identifier || course.id === identifier) ?? null;
}
