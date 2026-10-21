'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Testimonial } from '@/lib/types';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials?.length ?? 0;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Auto-advance. Pauses on hover/focus so a reader is never cut off mid-quote.
  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(handleNext, 6000);
    return () => window.clearInterval(id);
  }, [paused, count, handleNext, currentIndex]);

  if (count === 0) return null;

  const current = testimonials[currentIndex];

  return (
    <div
      className="relative max-w-4xl mx-auto bg-surface border border-border p-8 md:p-12 rounded-2xl shadow-subtle"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <Quote className="w-12 h-12 text-forest/20 mb-6" />

      {/* Keyed remount, no exit animation: an `AnimatePresence mode="wait"`
          exit would gate the swap on an animation completing. */}
      <motion.div
        key={current.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: current.rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-current" />
          ))}
        </div>

        <blockquote className="text-body-large md:text-xl text-foreground font-normal leading-relaxed italic">
          &ldquo;{current.quote}&rdquo;
        </blockquote>

        <div className="flex flex-col">
          <span className="font-semibold text-sm text-foreground">{current.student_name}</span>
          <span className="text-xs text-muted-foreground">{current.course_taken}</span>
        </div>
      </motion.div>

      {/* Controls sit outside AnimatePresence so they are not remounted — and
          therefore not re-animated — on every slide change. */}
      <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
        <div className="flex items-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === currentIndex}
              className={`h-1.5 rounded-full transition-all ${
                i === currentIndex ? 'w-6 bg-forest' : 'w-1.5 bg-border hover:bg-forest/40'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="w-10 h-10 rounded-full border border-border bg-background hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="w-10 h-10 rounded-full border border-border bg-background hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};
