import { NextResponse } from 'next/server';
import { getPublishedCourses } from '@/lib/courses';

export async function GET() {
  const { courses, error } = await getPublishedCourses();
  if (error) return NextResponse.json({ message: error, courses: [] }, { status: 503 });
  return NextResponse.json({
    courses: courses.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      duration: c.duration,
      fee: c.fee,
      category: c.category,
      categoryId: (c as any).categoryId,
      featured_image: c.featured_image,
      short_description: c.short_description,
      description: c.description,
      certification: c.certification,
      chapter_count: c.chapter_count,
      expected_hours: c.expected_hours,
      currency_prices: (c as any).currency_prices,
      price_inr: (c as any).price_inr,
      prerequisites: c.prerequisites,
      learning_outcomes: c.learning_outcomes,
      is_featured: c.is_featured,
      rating: c.rating,
    })),
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
