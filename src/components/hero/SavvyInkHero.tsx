'use client';

import React, { useEffect } from 'react';
import InkHero from '@/components/ui/ink-hero';

/**
 * Savvy copy on the shared InkHero. The institute header stays in SiteChrome,
 * so this hero does not render InkHero's own navigation.
 */
export const SavvyInkHero: React.FC = () => {
  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.darkHero;
    };
  }, []);

  return (
    <div style={{ marginTop: 'calc(-1 * var(--header-h, 0px))' }}>
      <InkHero
        showNav={false}
        image={{
          src: '/images/library/inspection.jpg',
          alt: 'Inspection of industrial piping and welded joints.',
        }}
        eyebrow="Professional Certification"
        headline={'Advance your career\nin inspection & quality'}
        caption="ASNT Level II · QA/QC · Fire & Safety"
        cta={{ label: 'View Courses', href: '/course' }}
        inkColor="#102B46"
        ease="ink"
        travel={300}
        onStation={(station) => {
          if (station >= 1) document.documentElement.dataset.darkHero = 'true';
          else delete document.documentElement.dataset.darkHero;
        }}
        scrollTo={(y) => {
          const lenis = (window as unknown as { lenis?: { scrollTo: (target: number, opts?: { duration?: number }) => void } }).lenis;
          if (lenis) lenis.scrollTo(y, { duration: 1.1 });
          else window.scrollTo({ top: y, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
