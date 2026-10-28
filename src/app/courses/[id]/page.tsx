import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import {
  Clock, Award, BookOpen, CheckCircle2, ChevronRight,
  ShieldCheck, ArrowRight, Lock, UserCheck, Layers, FileText
} from 'lucide-react';
import { getPublishedCourse } from '@/lib/courses';
import { websiteCourses } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';
import { CourseDetailsClient } from './CourseDetailsClient';

export const revalidate = 60; // 60s cache with background revalidation

interface CourseDetailsPageProps {
  params: { id: string };
}

export default async function CourseDetailsPage({ params }: CourseDetailsPageProps) {
  const identifier = decodeURIComponent(params.id);
  const course = await getPublishedCourse(identifier);

  if (!course) {
    notFound();
  }

  // Canonical SEO redirect: If accessed via internal ID like 'c2', redirect to clean slug URL
  if (course.slug && identifier === course.id && identifier !== course.slug) {
    redirect(`/courses/${course.slug}`);
  }

  // Check authenticated viewer session
  const viewer = currentAccount();

  // Related courses in the same category
  const allCourses = websiteCourses();
  const relatedCourses = allCourses
    .filter((c) => c.id !== course.id && (c.category === course.category || !course.category))
    .slice(0, 3);

  return (
    <CourseDetailsClient
      course={course}
      relatedCourses={relatedCourses}
      viewerRole={viewer?.role ?? null}
      viewerName={viewer?.fullName ?? null}
      viewerId={viewer?.id ?? null}
    />
  );
}
