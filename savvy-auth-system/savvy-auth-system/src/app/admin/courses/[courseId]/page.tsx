'use client';

import { useParams } from 'next/navigation';
import { CourseDetailPage } from '@/components/dashboard/Learning';

export default function AdminCoursePage() {
  const params = useParams<{ courseId: string }>();
  return <CourseDetailPage role="admin" courseId={String(params.courseId)} />;
}
