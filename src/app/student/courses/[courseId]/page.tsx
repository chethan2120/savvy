'use client';

import { useParams } from 'next/navigation';
import { CourseDetailPage } from '@/components/dashboard/Learning';

export default function StudentCoursePage() {
  const params = useParams<{ courseId: string }>();
  return <CourseDetailPage role="student" courseId={String(params.courseId)} />;
}
