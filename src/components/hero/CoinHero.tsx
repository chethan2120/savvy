'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const display = Fraunces({ subsets: ['latin'], weight: ['500', '600'] });

const CoinScene = dynamic(() => import('./CoinScene').then((mod) => mod.CoinScene), {
  ssr: false,
  loading: () => <CoinFallback />,
});

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Still composition used while the 3D chunk loads, and on devices without WebGL. */
export const CoinFallback: React.FC = () => (
  <div className="absolute inset-0" aria-hidden="true">
    <div className="absolute left-[18%] top-[22%] h-[28%] w-[46%] rounded-2xl bg-white shadow-[0_18px_40px_rgba(120,150,130,0.18)]" />
    <div className="absolute bottom-[16%] right-[8%] h-[34%] w-[28%] rounded-2xl bg-[#fbfaf7] shadow-[0_16px_36px_rgba(120,150,130,0.16)] ring-1 ring-[#d7ebdf]" />
    <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[18px] border-[#f7f4ee] shadow-[0_20px_50px_rgba(90,120,100,0.16)] [transform:translate(-50%,-50%)_rotateX(62deg)]" />
    <div className="absolute left-[62%] top-[18%] h-14 w-14 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f3e2b0,#d4a84b_55%,#a67c32)] shadow-md" />
  </div>
);

export const CoinHero: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  const angleRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [onScreen, setOnScreen] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [graphics, setGraphics] = useState<'unknown' | 'webgl' | 'fallback'>('unknown');
  const [quality, setQuality] = useState<'high' | 'low'>('high');

  useEffect(() => {
    setGraphics(webglAvailable() ? 'webgl' : 'fallback');
    const fine = window.matchMedia('(min-width: 1025px) and (pointer: fine)');
    const apply = () => setQuality(fine.matches ? 'high' : 'low');
    apply();
    fine.addEventListener('change', apply);
    return () => fine.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const node = root.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.08 });
    observer.observe(node);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const animate = !reduce && onScreen && !hidden && graphics === 'webgl';

  return (
    <section
      ref={root}
      className="relative w-full overflow-hidden bg-[#f6f4ee] min-[1025px]:min-h-[calc(100svh-var(--announce-h,0px))]"
      style={{ marginTop: 'calc(-1 * var(--header-h, 0px))' }}
      aria-label="Savvy Training Institute"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_74%_46%,rgba(198,228,208,0.72),transparent_58%)]"
        aria-hidden="true"
      />
      <div
        className="site-container relative z-[1] grid min-h-full items-center gap-6 min-[1025px]:min-h-[calc(100svh-var(--header-h,0px)-var(--announce-h,0px))] min-[1025px]:grid-cols-[minmax(0,26rem)_minmax(16rem,1fr)] min-[1025px]:gap-4 min-[1280px]:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]"
        style={{ paddingTop: 'var(--header-h, 0px)' }}
      >
        <motion.div className="max-w-2xl py-10 sm:py-14 min-[1025px]:py-20">
          <motion.h1
            className={`${display.className} max-w-[12ch] text-[1.95rem] font-medium leading-[1.12] tracking-[-0.025em] text-[#102B46] min-[375px]:max-w-[14ch] min-[375px]:text-[2.25rem] sm:text-[2.75rem] md:text-5xl min-[1280px]:text-[3.6rem] min-[1441px]:text-[4.05rem]`}
            custom={0.12}
            initial={reduce ? false : 'hidden'}
            animate="show"
            variants={fadeUp}
          >
            Advance your career in inspection &amp; quality
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-[#3e5163] sm:mt-6 sm:text-base md:text-lg"
            custom={0.3}
            initial={reduce ? false : 'hidden'}
            animate="show"
            variants={fadeUp}
          >
            Professional certification courses in ASNT Level II, QA/QC and Fire &amp; Safety. Study at your own pace. Earn a recognised certificate.
          </motion.p>
          <motion.div
            className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center"
            custom={0.46}
            initial={reduce ? false : 'hidden'}
            animate="show"
            variants={fadeUp}
          >
            <Link
              href="/course"
              className="inline-flex w-full items-center justify-center rounded-md bg-[#102B46] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#183654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102B46] sm:w-auto"
            >
              View Courses
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/#how-certification-works"
              className="inline-flex w-full items-center justify-center rounded-md border border-[#102B46]/35 px-6 py-3.5 text-sm font-medium text-[#102B46] transition hover:border-[#102B46] hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102B46] sm:w-auto"
            >
              How Certification Works
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>

        <div className="relative mx-auto h-[74vw] max-h-[26rem] min-h-[16.5rem] w-full min-[481px]:h-[24rem] min-[1025px]:mx-0 min-[1025px]:h-[34rem] min-[1025px]:max-h-none min-[1441px]:h-[38rem]">
          <span ref={angleRef} className="sr-only" data-angle="0" data-spin="0">
            Decorative gold coin moving around a ring
          </span>
          {graphics === 'webgl' ? (
            <CoinScene animate={animate} pose={reduce ? 1.15 : null} quality={quality} angleRef={angleRef} />
          ) : (
            <CoinFallback />
          )}
        </div>
      </div>
    </section>
  );
};
