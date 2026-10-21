'use client';

import React, { useEffect, useState } from 'react';
import { AccreditationStrip } from '@/components/AccreditationStrip';
import { Reveal } from '@/components/motion/Reveal';
import { loadWebsiteSettings } from '@/lib/website-settings';

/**
 * The recognition row stays in the codebase. It renders only when Website
 * Settings turns it on, so a hidden section does not leave a gap.
 */
export const RecognitionSection: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let alive = true;
    loadWebsiteSettings().then((settings) => {
      if (alive) setShow(settings.show_recognitions);
    }).catch((error: unknown) => {
      console.error(error);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!show) return null;
  return (
    <Reveal>
      <AccreditationStrip />
    </Reveal>
  );
};
