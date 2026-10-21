import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { supabaseTablesReady } from '@/lib/supabase-schema';
import { coursesData } from '@/lib/data';
import type { Course } from '@/lib/types';

/**
 * Published courses from Supabase when the courses table exists.
 * The site catalog is used when that table is not installed.
 */
export async function getPublishedCourses(): Promise<{ courses: Course[]; fromDatabase: boolean }> {
  if (!isSupabaseConfigured || !(await supabaseTablesReady())) return { courses: coursesData, fromDatabase: false };
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('sort_order');
  if (error || !data) return { courses: coursesData, fromDatabase: false };
  return {
    courses: (data as Course[]).filter((course) => course.archived !== true),
    fromDatabase: true,
  };
}

export async function getPublishedCourse(slug: string): Promise<Course | null> {
  const local = coursesData.find((course) => course.slug === slug) ?? null;
  if (!isSupabaseConfigured || !(await supabaseTablesReady())) return local;
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (error) return local;
  const course = data as Course | null;
  if (course?.archived) return null;
  return course;
}

