'use client';

import React from 'react';
import { CourseCard } from './CourseCard';
import { Course } from '@/lib/types';

interface CourseGridProps {
  courses: Course[];
}

export const CourseGrid: React.FC<CourseGridProps> = ({ courses }) => {
  if (courses.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-2xl bg-surface">
        <p className="text-sm">No courses matching your search filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
};
