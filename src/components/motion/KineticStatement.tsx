'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface KineticStatementProps {
  lines: string[];
  /** Small eyebrow above the statement. */
  eyebrow?: string;
}

/**
 * Oversized-type section held in place with CSS `position: sticky` while the
 * outer track scrolls past. Each line scales and slides through the viewport,
 * jeton-style kinetic typography. Sticky is used instead of a ScrollTrigger pin
 * so no pin-spacer measurement can drift against Lenis smooth scrolling.
 */
export const KineticStatement: React.FC<KineticStatementProps> = ({ lines, eyebrow }) => {
  const track = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-kinetic-line]',
        { yPercent: 90, opacity: 0, scale: 0.82 },
        {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          ease: 'power2.out',
          stagger: 0.3,
          scrollTrigger: {
            trigger: track.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
          },
        }
      );
    }, track);

    return () => ctx.revert();
  }, []);

  return (
    // svh, not vh: on mobile the URL bar collapse changes vh mid-scroll and the
    // sticky panel jumps against the scrub. The track is shorter on phones so
    // the statement does not hold the viewport hostage for two screens.
    <section ref={track} className="relative h-[180svh] bg-background md:h-[220svh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="site-container flex flex-col items-center gap-3 text-center">
          {eyebrow ? (
            <span className="tag-pill mb-4 uppercase tracking-[0.18em]">{eyebrow}</span>
          ) : null}
          {lines.map((line) => (
            <span
              key={line}
              data-kinetic-line
              className="text-kinetic block max-w-full break-words font-normal leading-[0.92] tracking-tight text-forest"
            >
              {line}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
