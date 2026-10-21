'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * Lenis smooth scrolling wired into the GSAP ScrollTrigger ticker.
 * Disabled entirely when the user prefers reduced motion.
 */
export const SmoothScroll: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (reduced !== false) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      // In-page anchors ride the same easing as the wheel and stop clear of
      // the sticky header instead of under it. (Lenis scrolls imperatively, so
      // the CSS `scroll-margin-top` fallback does not apply to these jumps.)
      anchors: { offset: -112 },
    });

    // Always land at the top of the page rather than a restored offset.
    history.scrollRestoration = 'manual';
    lenis.scrollTo(0, { immediate: true });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    (window as unknown as { lenis?: Lenis }).lenis = lenis;

    // Fonts, images and lazy sections settle after mount; re-measure so
    // scrubbed and sticky sections line up with where the content actually is.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const t = window.setTimeout(refresh, 600);

    // Mobile browsers fire resize when the URL bar collapses, which is exactly
    // when 100vh sections change height. Debounce so we re-measure once.
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refresh, 180);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    // A ScrollTrigger measured against images of unknown height is wrong until
    // they load; catch late arrivals without polling.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);

    return () => {
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(t);
      ro.disconnect();
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as unknown as { lenis?: Lenis }).lenis;
    };
  }, [reduced]);

  return <>{children}</>;
};
