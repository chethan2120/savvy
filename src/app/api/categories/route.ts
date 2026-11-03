import { NextResponse } from 'next/server';
import { listCategories, allCourses, isLegacyProgram } from '@/lib/server/institute-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = listCategories().filter((cat) => cat.active);
  const courses = allCourses().filter((c) => c.visible && c.active && !isLegacyProgram(c.id));

  const categoriesWithCourses = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    courseCount: courses.filter((c) => c.categoryId === cat.id).length,
    courses: courses
      .filter((c) => c.categoryId === cat.id)
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        duration: c.duration,
        image: c.image,
        currency_prices: c.currency_prices,
        priceInr: c.priceInr,
      })),
  }));

  return NextResponse.json({
    categories: categoriesWithCourses,
    totalCategories: categories.length,
    totalCourses: courses.length,
  }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
