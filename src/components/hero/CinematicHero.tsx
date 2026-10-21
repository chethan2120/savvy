'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Fraunces } from 'next/font/google';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { DarkHeroFlag } from '../DarkHeroFlag';

const display = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
});

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

/**
 * Real photographs, stored locally. Licences verified on Wikimedia Commons.
 * 1. GE USM 35 ultrasonic flaw detector — Plenumchamber — public domain
 *    https://commons.wikimedia.org/wiki/File:GE_USM_35X_DAC_LEMO_type_NDT_tool.jpg
 * 2. Outside micrometer — Nicolas Buffler — CC BY 2.0
 *    https://commons.wikimedia.org/wiki/File:Outside_micrometer_(22112611469).jpg
 * 3. AFEX fire suppression system — ACoulter6031 — CC BY-SA 4.0
 *    https://commons.wikimedia.org/wiki/File:AFEX_Fire_Suppression_System_Installed_on_Mobile_Vehicle.jpg
 * 4. Refinery piping and tank — Carl Young — CC BY-SA 4.0
 *    https://commons.wikimedia.org/wiki/File:Refinery_Tanks_3.jpg
 */
const slides = [
  {
    id: 'ndt',
    src: '/images/hero/ndt.webp',
    mobile: '/images/hero/ndt-sm.webp',
    width: 1600,
    height: 1200,
    position: 'object-[center_42%] md:object-center',
    label: 'Ultrasonic inspection instrument',
  },
  {
    id: 'quality',
    src: '/images/hero/quality.webp',
    mobile: '/images/hero/quality-sm.webp',
    width: 1280,
    height: 853,
    position: 'object-[42%_center] md:object-[58%_center]',
    label: 'Precision micrometer',
  },
  {
    id: 'safety',
    src: '/images/hero/safety.webp',
    mobile: '/images/hero/safety-sm.webp',
    width: 1280,
    height: 960,
    position: 'object-[46%_40%] md:object-[68%_center]',
    label: 'Industrial fire suppression equipment',
  },
  {
    id: 'plant',
    src: '/images/hero/plant.webp',
    mobile: '/images/hero/plant-sm.webp',
    width: 1280,
    height: 849,
    position: 'object-center md:object-[72%_58%]',
    label: 'Industrial piping and storage tank',
  },
] as const;

export const CinematicHero: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollYProgress } = useScroll({
    target: root,
    offset: ['start start', 'end start'],
  });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -42]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (reduce || held || hidden) return undefined;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [reduce, held, hidden, active]);

  const show = (index: number) => {
    setActive((index + slides.length) % slides.length);
  };

  const release = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
  };

  return (
    <section
      ref={root}
      className="on-dark relative min-h-[40rem] w-full overflow-hidden bg-[#071018] sm:min-h-[44rem] md:min-h-[calc(100svh-var(--announce-h,0px))]"
      style={{ marginTop: 'calc(-1 * var(--header-h, 0px))' }}
      aria-roledescription="carousel"
      aria-label="Inspection and industrial training"
    >
      <DarkHeroFlag />

      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((slide, index) => (
          <picture key={slide.id}>
            <source media="(max-width: 767px)" srcSet={slide.mobile} />
            <img
              src={slide.src}
              alt=""
              width={slide.width}
              height={slide.height}
              className={`absolute inset-0 h-full w-full object-cover ${slide.position} ${reduce ? '' : 'transition-opacity duration-[900ms] ease-in-out'} ${index === active ? 'opacity-100' : 'opacity-0'}`}
              fetchPriority={index === 0 ? 'high' : 'low'}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </picture>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#071018_0%,rgba(7,16,24,0.9)_46%,rgba(7,16,24,0.55)_100%)] md:bg-[linear-gradient(100deg,#071018_0%,rgba(7,16,24,0.94)_32%,rgba(7,16,24,0.72)_52%,rgba(7,16,24,0.28)_74%,rgba(7,16,24,0.08)_100%)]"
        aria-hidden="true"
      />

      <div
        className="site-container relative z-[2] flex min-h-[40rem] flex-col justify-center sm:min-h-[44rem] md:min-h-[calc(100svh-var(--announce-h,0px))]"
        style={{ paddingTop: 'var(--header-h, 0px)' }}
      >
        <motion.div
          className="max-w-2xl py-12 sm:py-16 lg:py-24"
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <motion.h1
            className={`${display.className} max-w-[12ch] text-[1.95rem] font-medium leading-[1.12] tracking-[-0.025em] text-[#f4f1ea] min-[375px]:max-w-[14ch] min-[375px]:text-[2.25rem] sm:text-[2.75rem] md:text-5xl lg:text-[3.6rem] min-[1441px]:text-[4.05rem]`}
            custom={0.12}
            initial={reduce ? false : 'hidden'}
            animate="show"
            variants={fadeUp}
          >
            Advance your career in inspection &amp; quality
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-[#f7f4ee] sm:mt-6 sm:text-base md:text-lg"
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
              className="inline-flex w-full items-center justify-center rounded-md bg-[#102B46] px-6 py-3.5 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-[#183654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4f1ea] sm:w-auto"
            >
              View Courses
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/#how-certification-works"
              className="inline-flex w-full items-center justify-center rounded-md border border-[#f4f1ea]/50 px-6 py-3.5 text-sm font-medium text-[#f4f1ea] transition hover:border-[#f4f1ea] hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4f1ea] sm:w-auto"
            >
              How Certification Works
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </motion.div>

          <div
            className="mt-8 flex w-full flex-wrap items-center gap-1 max-sm:max-w-[calc(100%-3.5rem)]"
            role="group"
            aria-label="Photograph controls"
            onMouseEnter={() => setHeld(true)}
            onMouseLeave={() => setHeld(false)}
            onFocus={() => setHeld(true)}
            onBlur={release}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                event.preventDefault();
                show(active + 1);
              }
              if (event.key === 'ArrowLeft') {
                event.preventDefault();
                show(active - 1);
              }
            }}
          >
            <button
              type="button"
              className="inline-flex h-11 w-10 items-center justify-center rounded-md text-[#f4f1ea]/80 transition hover:bg-white/10 hover:text-[#f4f1ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4f1ea] sm:w-11"
              aria-label="Previous photograph"
              onClick={() => show(active - 1)}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                className="inline-flex h-11 w-6 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4f1ea] sm:w-8"
                aria-label={`Show ${slide.label}`}
                aria-current={index === active ? 'true' : undefined}
                onClick={() => show(index)}
              >
                <span className={`block h-1 rounded-full transition-[width,background-color] duration-300 ${index === active ? 'w-6 bg-[#f4f1ea]' : 'w-2 bg-[#f4f1ea]/45'}`} />
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-11 w-10 items-center justify-center rounded-md text-[#f4f1ea]/80 transition hover:bg-white/10 hover:text-[#f4f1ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4f1ea] sm:w-11"
              aria-label="Next photograph"
              onClick={() => show(active + 1)}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="sr-only">
            Photographs: ultrasonic flaw detector by Plenumchamber, public domain; micrometer by Nicolas Buffler, CC BY 2.0; fire suppression system by ACoulter6031, CC BY-SA 4.0; refinery piping by Carl Young, CC BY-SA 4.0. All from Wikimedia Commons.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
