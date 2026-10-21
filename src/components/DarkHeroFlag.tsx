'use client';

import { useEffect } from 'react';

/**
 * Marks the document while a dark full-bleed hero is mounted, so the floating
 * header can switch to white type.
 *
 * This replaces the hand-maintained route list the header used to carry: that
 * list silently went stale whenever a page switched its hero `media` from
 * `image` to `video`, leaving ink-on-video navigation. The hero itself is the
 * only thing that actually knows how dark it is, so it is the thing that says.
 */
export const DarkHeroFlag: React.FC = () => {
  useEffect(() => {
    document.documentElement.dataset.darkHero = 'true';
    return () => {
      delete document.documentElement.dataset.darkHero;
    };
  }, []);

  return null;
};
