import { NextResponse } from 'next/server';
import { getPublishedCourses } from '@/lib/courses';

export async function GET() {
  const { courses, error } = await getPublishedCourses();
  if (error) return NextResponse.json({ message: error, courses: [] }, { status: 503 });
  return NextResponse.json({
    courses: courses.map(({ id, slug, title, duration, fee, category, featured_image, short_description, certification, chapter_count, expected_hours }) => ({
      id, slug, title, duration, fee, category, featured_image, short_description, certification, chapter_count, expected_hours,
    })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}
