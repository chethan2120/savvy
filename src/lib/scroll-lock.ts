'use client';

import type Lenis from 'lenis';

type LenisWindow = Window & { lenis?: Lenis };

/**
 * Scroll lock for modals and the mobile drawer.
 *
 * `overflow: hidden` on <body> alone is not enough here: Lenis drives scroll
 * on its own rAF loop and keeps moving the page behind an open overlay, and on
 * iOS Safari the body still rubber-bands. So we pause Lenis, freeze the body at
 * its current offset, and restore both on unlock.
 */

let savedScrollY = 0;
let lockCount = 0;

export function lockScroll(): void {
  if (typeof window === 'undefined') return;
  lockCount += 1;
  if (lockCount > 1) return;

  const lenis = (window as unknown as LenisWindow).lenis;
  lenis?.stop();

  savedScrollY = window.scrollY;
  const body = document.body;
  // Compensate for the scrollbar so the layout does not jump sideways.
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
}

export function unlockScroll(): void {
  if (typeof window === 'undefined') return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;

  const body = document.body;
  body.style.position = '';
  body.style.top = '';
  body.style.left = '';
  body.style.right = '';
  body.style.width = '';
  body.style.paddingRight = '';

  window.scrollTo(0, savedScrollY);
  const lenis = (window as unknown as LenisWindow).lenis;
  lenis?.scrollTo(savedScrollY, { immediate: true });
  lenis?.start();
}
