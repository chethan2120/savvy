'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export type PublicTestimonial = {
  id: string;
  name: string;
  course?: string;
  quote: string;
  rating?: number;
};

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('') || 'S';
}

export function StudentTestimonials({ testimonials }: { testimonials: PublicTestimonial[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const count = testimonials.length;
  const current = testimonials[index];

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || count < 2) return;
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % count);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, count]);

  function go(step: number) {
    if (count < 2) return;
    setIndex((value) => (value + step + count) % count);
  }

  function onTouchEnd(startX: number, endX: number) {
    const delta = endX - startX;
    if (delta > 48) go(-1);
    if (delta < -48) go(1);
  }

  return (
    <section className="border-b border-[#EAD9E0] bg-[#F8EDF1] py-16 sm:py-20" aria-label="Testimonials">
      <div className="site-container max-w-4xl">
        <h2 className="text-[#641B38]">Testimonials</h2>
        <p className="mt-3 max-w-2xl text-[#30262B]">
          Only comments that have been approved are shown here.
        </p>
        {count === 0 || !current ? (
          <p className="mt-8 rounded-3xl border border-[#EAD9E0] bg-white px-6 py-10 text-[#30262B]">
            Approved student comments will appear here.
          </p>
        ) : (
          <div
            className="relative mt-8"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <TestimonialCard
              key={current.id}
              item={current}
              reducedMotion={reducedMotion}
              onSwipe={onTouchEnd}
            />
            {count > 1 && (
              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button type="button" onClick={() => go(-1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAD9E0] bg-white text-[#B83268]" aria-label="Previous testimonial">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => go(1)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAD9E0] bg-white text-[#B83268]" aria-label="Next testimonial">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex gap-2" role="tablist" aria-label="Testimonial pages">
                  {testimonials.map((item, itemIndex) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={`Show testimonial ${itemIndex + 1}`}
                      aria-current={itemIndex === index}
                      onClick={() => setIndex(itemIndex)}
                      className={`h-2.5 rounded-full ${itemIndex === index ? 'w-8 bg-[#B83268]' : 'w-2.5 bg-[#c5d4ea]'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialCard({
  item,
  reducedMotion,
  onSwipe,
}: {
  item: PublicTestimonial;
  reducedMotion: boolean;
  onSwipe: (startX: number, endX: number) => void;
}) {
  const [startX, setStartX] = useState<number | null>(null);
  const rating = item.rating && item.rating >= 1 && item.rating <= 5 ? item.rating : null;
  return (
    <article
      className={`rounded-3xl border border-[#EAD9E0] bg-white p-6 shadow-sm sm:p-8 ${reducedMotion ? '' : 'course-detail-in'}`}
      onTouchStart={(event) => setStartX(event.changedTouches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (startX == null) return;
        onSwipe(startX, event.changedTouches[0]?.clientX ?? startX);
        setStartX(null);
      }}
    >
      <div className="flex items-center gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F8EDF1] text-sm font-semibold text-[#B83268]" aria-hidden="true">
          {initials(item.name)}
        </span>
        <div>
          <p className="text-lg font-semibold text-[#641B38]">{item.name}</p>
          {item.course && <p className="text-sm text-[#30262B]">{item.course}</p>}
        </div>
      </div>
      {rating && (
        <p className="mt-4 flex items-center gap-1 text-[#B83268]" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: rating }, (_, star) => (
            <Star key={star} className="h-4 w-4 fill-[#B83268]" aria-hidden="true" />
          ))}
        </p>
      )}
      <p className="mt-4 text-base leading-relaxed text-[#641B38]">{item.quote}</p>
    </article>
  );
}
