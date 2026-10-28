import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { supabaseTablesReady } from '@/lib/supabase-schema';
import { refreshCourseCatalog, websiteCourses } from '@/lib/server/institute-db';
import type { Course } from '@/lib/types';

/**
 * The public catalogue is the admin course store. Supabase rows are added
 * only when that table exists and the slug is not already in the local store.
 */
export async function getPublishedCourses(): Promise<{ courses: Course[]; fromDatabase: boolean; error?: string }> {
  await refreshCourseCatalog();
  const local = websiteCourses();
  if (!isSupabaseConfigured || !(await supabaseTablesReady())) {
    return { courses: local, fromDatabase: false };
  }
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('sort_order');
  if (error || !data) {
    console.error('Published course catalogue could not be loaded.', error?.message ?? 'No course data returned.');
    return { courses: local, fromDatabase: false };
  }
  const slugs = new Set(local.map((course) => course.slug));
  const remote = (data as Course[]).filter((course) => course.archived !== true && !slugs.has(course.slug));
  return { courses: [...local, ...remote], fromDatabase: true };
}

export async function getPublishedCourse(slug: string): Promise<Course | null> {
  await refreshCourseCatalog();
  const local = websiteCourses().find((course) => course.slug === slug);
  if (local) return local;
  if (!isSupabaseConfigured || !(await supabaseTablesReady())) return null;
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (error) {
    console.error('Published course could not be loaded.', error.message);
    return null;
  }
  const course = data as Course | null;
  if (!course || course.archived) return null;
  const [{ data: modules }, { data: faqs }] = await Promise.all([
    supabase.from('course_modules').select('*').eq('course_id', course.id).order('sort_order'),
    supabase.from('course_faqs').select('*').eq('course_id', course.id).order('sort_order'),
  ]);
  return { ...course, modules: modules ?? [], faqs: faqs ?? [] } as Course;
}
