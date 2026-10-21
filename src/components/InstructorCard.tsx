'use client';

import React from 'react';
import Image from 'next/image';
import { Instructor } from '@/lib/types';

interface InstructorCardProps {
  instructor: Instructor;
}

export const InstructorCard: React.FC<InstructorCardProps> = ({ instructor }) => {
  return (
    <div className="editorial-card p-6 flex flex-col items-start gap-4">
      <div className="w-20 h-20 relative rounded-full overflow-hidden border-2 border-border shrink-0">
        <Image
          src={instructor.photo_url}
          alt={instructor.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] uppercase tracking-wider text-forest font-semibold">
          {instructor.role}
        </span>
        <h4 className="text-lg font-normal text-foreground leading-snug">
          {instructor.name}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-3">
          {instructor.bio}
        </p>
      </div>
    </div>
  );
};
