'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';

type RevealVariant = 'up' | 'left' | 'right' | 'scale' | 'fade' | 'mask';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger direct children instead of animating the block as one unit. */
  stagger?: boolean;
  delay?: number;
  /** Motion shape. `mask` wipes the block up from behind a clip edge. */
  variant?: RevealVariant;
  /** Viewport position that fires the reveal. Lower = later. */
  start?: string;
}

const VARIANT_FROM: Record<RevealVariant, gsap.TweenVars> = {
  up: { opacity: 0, y: 34 },
  left: { opacity: 0, x: -40 },
  right: { opacity: 0, x: 40 },
  scale: { opacity: 0, scale: 0.94, y: 18 },
  fade: { opacity: 0 },
  mask: { opacity: 0, y: 46, clipPath: 'inset(100% 0% 0% 0%)' },
};

const VARIANT_TO: Record<RevealVariant, gsap.TweenVars> = {
  up: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1, y: 0 },
  fade: { opacity: 1 },
  mask: { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' },
};

/** Scroll-triggered entrance used to give every section the same motion language. */
export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  stagger = false,
  delay = 0,
  variant = 'up',
  start = 'top 85%',
}) => {
  const el = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    // `null` means the preference has not resolved yet — wait a tick rather
    // than guessing and animating something the user asked us not to.
    if (reduced === null) return;

    const node = el.current;
    if (!node) return;

    if (reduced) {
      node.classList.remove('reveal-hidden');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      node.classList.remove('reveal-hidden');

      const targets: gsap.TweenTarget = stagger ? Array.from(node.children) : node;

      gsap.fromTo(targets, VARIANT_FROM[variant], {
        ...VARIANT_TO[variant],
        duration: variant === 'mask' ? 1 : 0.85,
        ease: 'power3.out',
        delay,
        stagger: stagger ? 0.09 : 0,
        // Promote to its own layer for the tween, then hand the memory back —
        // a page with 30 permanent `will-change` layers janks on mid phones.
        willChange: 'transform, opacity',
        onComplete: () => gsap.set(targets, { willChange: 'auto', clearProps: 'clipPath' }),
        scrollTrigger: { trigger: node, start, once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [stagger, delay, variant, start, reduced]);

  return (
    <div ref={el} className={`reveal-hidden ${className ?? ''}`}>
      {children}
    </div>
  );
};
