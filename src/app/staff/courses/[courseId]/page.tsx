'use client';

import { useParams } from 'next/navigation';
import { CourseDetailPage } from '@/components/dashboard/Learning';

export default function StaffCoursePage() {
  const params = useParams<{ courseId: string }>();
  return <CourseDetailPage role="staff" courseId={String(params.courseId)} />;
}
