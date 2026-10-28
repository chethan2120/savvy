'use client';

import { useEffect, useState } from 'react';

export type PublicCourse = {
  id: string;
  slug: string;
  title: string;
  duration: string;
  fee: string;
  category?: string | null;
  featured_image?: string;
};

export function useCourseCatalog() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/public-courses', { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || 'Courses could not be loaded.');
        if (active) setCourses(body.courses ?? []);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Courses could not be loaded.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { courses, loading, error };
}
