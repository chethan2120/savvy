'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.getElementById('main-content');
    if (!root) return;
    const main: HTMLElement = root;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    function watch(node: Element) {
      if (seen.has(node) || node.closest('[data-no-reveal]')) return;
      seen.add(node);
      if (reduced) {
        node.classList.add('is-visible');
        return;
      }
      observer.observe(node);
    }

    function scan() {
      main.querySelectorAll('section').forEach(watch);
    }

    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(main, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
