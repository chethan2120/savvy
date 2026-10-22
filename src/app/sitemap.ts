import { MetadataRoute } from 'next';
import { blogPostsData } from '@/lib/data';
import { getPublishedCourses } from '@/lib/courses';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://savvytraining.example';
  const { courses } = await getPublishedCourses();

  const staticRoutes = [
    '',
    '/about-us',
    '/course',
    '/admission',
    '/placement',
    '/verify-certificate',
    '/blog',
    '/gallery',
    '/contact-us',
    '/privacy-policy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const courseRoutes = courses.map((course) => ({
    url: `${baseUrl}/course/${course.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const blogRoutes = blogPostsData.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.published_at).toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...courseRoutes, ...blogRoutes];
}
