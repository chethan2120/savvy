'use client';

import React from 'react';
import type { Testimonial } from '@/lib/types';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

// Fallback high-quality avatars for student testimonials
const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
];

export function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const mapped = testimonials.map((t, idx) => ({
    author: {
      name: (t as any).name || t.student_name || 'Engineering Alumnus',
      handle: (t as any).role
        ? `${(t as any).role} · ${(t as any).company || 'Savvy Alumnus'}`
        : `${t.course_taken || 'Technical Certification'} Alumnus`,
      avatar: (t as any).avatar_url || t.photo_url || AVATARS[idx % AVATARS.length],
    },
    text: (t as any).content || t.quote || '',
  }));

  return (
    <TestimonialsSection
      title="Trusted by Engineers & Technicians"
      description="Hear directly from certified alumni working across infrastructure, oil & gas, manufacturing, and MEP engineering sectors globally."
      badge="Verified Student Feedback"
      testimonials={mapped}
    />
  );
}
