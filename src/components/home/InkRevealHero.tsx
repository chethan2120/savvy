'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Award, CheckCircle2 } from 'lucide-react';

export function InkRevealHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Scroll listener for paper -> wash -> print transformation
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.min(Math.max((windowHeight - rect.top) / (windowHeight + rect.height), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generative fluid ink wash canvas simulation (starts automatically on page load)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for procedural ink wash & gold dispersion
    interface InkDrop {
      x: number;
      y: number;
      radius: number;
      baseRadius: number;
      color: string;
      alpha: number;
      angle: number;
      speed: number;
      expansion: number;
    }

    const pigments = [
      { r: 16, g: 43, b: 78, a: 0.12 },   // Primary Navy (#102B4E)
      { r: 10, g: 27, b: 48, a: 0.14 },   // Deep Navy (#0A1B30)
      { r: 200, g: 164, b: 93, a: 0.09 }, // Warm Gold (#C8A45D)
      { r: 220, g: 185, b: 120, a: 0.07 },// Light Gold
      { r: 40, g: 80, b: 125, a: 0.08 },  // Mineral Azure
    ];

    const drops: InkDrop[] = Array.from({ length: 8 }, (_, i) => {
      const pig = pigments[i % pigments.length];
      return {
        x: width * (0.2 + 0.6 * Math.random()),
        y: height * (0.15 + 0.7 * Math.random()),
        baseRadius: 60 + Math.random() * 140,
        radius: 60 + Math.random() * 140,
        color: `rgba(${pig.r}, ${pig.g}, ${pig.b}`,
        alpha: pig.a,
        angle: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.004,
        expansion: 0.8 + Math.random() * 0.4,
      };
    });

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Paper grain background wash
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(0.5, '#F7F8FA');
      bgGrad.addColorStop(1, '#EEF2F6');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Evolution factor starts active immediately on mount (baseline 0.45)
      const stage = 0.45 + Math.min(scrollProgress * 1.1, 0.55);

      ctx.save();
      // Render generative fluid ink dispersion layers
      drops.forEach((drop, idx) => {
        drop.angle += drop.speed;
        const driftX = Math.cos(drop.angle + time + idx) * 35;
        const driftY = Math.sin(drop.angle * 0.8 + time) * 30;

        const currentRadius = drop.baseRadius * (1 + stage * 0.6 * drop.expansion);
        const currentAlpha = Math.min(drop.alpha * (0.7 + stage * 0.8), 0.28);

        const radial = ctx.createRadialGradient(
          drop.x + driftX,
          drop.y + driftY,
          currentRadius * 0.1,
          drop.x + driftX,
          drop.y + driftY,
          currentRadius
        );

        radial.addColorStop(0, `${drop.color}, ${currentAlpha})`);
        radial.addColorStop(0.45, `${drop.color}, ${currentAlpha * 0.55})`);
        radial.addColorStop(0.85, `${drop.color}, ${currentAlpha * 0.15})`);
        radial.addColorStop(1, `${drop.color}, 0)`);

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(drop.x + driftX, drop.y + driftY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle fine gold filaments / contours in wash state
      ctx.strokeStyle = `rgba(200, 164, 93, ${0.08 + stage * 0.08})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const cy = height * (0.3 + i * 0.16);
        ctx.moveTo(width * 0.1, cy);
        for (let x = width * 0.1; x <= width * 0.9; x += 30) {
          const wave = Math.sin((x * 0.005) + time + i) * (20 + stage * 30);
          ctx.lineTo(x, cy + wave);
        }
      }
      ctx.stroke();

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollProgress, prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col justify-start overflow-hidden bg-[#F7F8FA] border-b border-[#E2E7EE]"
    >
      {/* Background Generative Flow + Ink Reveal Canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* 1. Soft warm-gold ambient glow (gently moves left-to-right 12-18s) */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Primary warm-gold glow orb moving left-to-right (16s) */}
        <div
          className="absolute -top-[10%] left-[5%] w-[580px] h-[580px] sm:w-[720px] sm:h-[720px] rounded-full bg-[radial-gradient(circle,rgba(200,164,93,0.18)_0%,rgba(200,164,93,0.06)_45%,transparent_70%)] blur-3xl hero-glow-primary"
        />
        {/* Secondary navy-gold ambient orb drifting gently (14s) */}
        <div
          className="absolute top-[30%] -right-[5%] w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] rounded-full bg-[radial-gradient(circle,rgba(16,43,78,0.12)_0%,rgba(200,164,93,0.10)_45%,transparent_70%)] blur-3xl hero-glow-secondary"
        />
        {/* Subtle center floating light shimmer effect (12s) */}
        <div
          className="absolute top-[20%] left-[20%] right-[20%] h-[450px] rounded-full bg-[radial-gradient(ellipse,rgba(200,164,93,0.12)_0%,transparent_65%)] blur-3xl hero-light-shimmer"
        />
      </div>

      {/* 2. Flowing gold contour lines behind hero heading (14-20s continuous movement) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0 opacity-80"
      >
        <svg
          viewBox="0 0 1440 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full min-w-[1100px] object-cover scale-105"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="goldContourGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C8A45D" stopOpacity="0.04" />
              <stop offset="25%" stopColor="#C8A45D" stopOpacity="0.38" />
              <stop offset="50%" stopColor="#C8A45D" stopOpacity="0.6" />
              <stop offset="75%" stopColor="#C8A45D" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#C8A45D" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="goldContourGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#102B4E" stopOpacity="0.03" />
              <stop offset="35%" stopColor="#C8A45D" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#102B4E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#C8A45D" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Contour wave group 1: animated with flowingContourWave1 (16s) */}
          <g className="hero-contour-1">
            <path
              d="M-100 240 C 240 160, 480 320, 800 220 C 1120 120, 1320 280, 1600 200"
              stroke="url(#goldContourGrad1)"
              strokeWidth="1.8"
              strokeDasharray="8 4"
            />
            <path
              d="M-80 300 C 260 220, 520 380, 840 280 C 1160 180, 1340 340, 1620 260"
              stroke="url(#goldContourGrad1)"
              strokeWidth="2.2"
            />
            <path
              d="M-120 360 C 220 280, 500 440, 820 340 C 1140 240, 1360 400, 1580 320"
              stroke="url(#goldContourGrad1)"
              strokeWidth="1.6"
              strokeDasharray="6 3"
            />
          </g>

          {/* Contour wave group 2: animated with flowingContourWave2 (19s) */}
          <g className="hero-contour-2">
            <path
              d="M-100 180 C 300 260, 600 140, 920 240 C 1240 340, 1420 180, 1650 240"
              stroke="url(#goldContourGrad2)"
              strokeWidth="1.8"
            />
            <path
              d="M-60 420 C 320 340, 620 480, 960 380 C 1260 280, 1440 440, 1680 360"
              stroke="url(#goldContourGrad2)"
              strokeWidth="2.0"
              strokeDasharray="10 5"
            />
            <path
              d="M-90 480 C 340 400, 640 540, 980 440 C 1280 340, 1460 500, 1700 420"
              stroke="url(#goldContourGrad1)"
              strokeWidth="1.4"
            />
          </g>
        </svg>
      </div>

      {/* Fallback & overlay gradient scrim for clean text contrast */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-[#F7F8FA]/90 pointer-events-none z-0"
      />

      {/* Hero Content Container — compact top padding to eliminate header gap */}
      <div className="site-container relative z-10 pt-5 pb-14 sm:pt-7 sm:pb-16 lg:pt-8 lg:pb-20 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Eyebrow Badge (Desktop: 16px, Mobile: 12-13px) */}
        <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/95 border border-[#C8A45D]/40 shadow-subtle mb-6 sm:mb-8 anim-pop-in">
          <span className="w-2 h-2 rounded-full bg-[#C8A45D] shrink-0" />
          <span className="font-mono text-[12px] sm:text-[13px] md:text-[14px] lg:text-[16px] font-bold tracking-widest uppercase text-[#102B4E]">
            Professional Development &amp; Certification
          </span>
        </div>

        {/* Main Headline (Desktop: 76-88px in 2 lines, Mobile: 40-46px) */}
        <h1 className="font-serif text-[40px] xs:text-[44px] sm:text-[54px] md:text-[68px] lg:text-[78px] xl:text-[84px] font-bold tracking-tight text-[#0A1B30] leading-[1.08] mb-6 sm:mb-8 text-center max-w-5xl mx-auto">
          <span className="block">Build Your Expertise.</span>
          <span className="block text-[#102B4E] mt-1 sm:mt-2">
            Define Your Future.
          </span>
        </h1>

        {/* Supporting Text (Desktop: 23px, Mobile: 17-18px) */}
        <p className="text-[17px] sm:text-[18px] md:text-[20px] lg:text-[23px] text-[#243247]/90 max-w-3xl font-normal leading-[1.5] mb-10 sm:mb-12 text-center mx-auto">
          Explore professional courses designed to develop practical knowledge, strengthen your expertise and support your next career step.
        </p>

        {/* Primary & Secondary Call To Actions (Desktop: 18px, Mobile: 16px) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full sm:w-auto mb-14 sm:mb-16">
          <Link
            href="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-9 sm:py-4.5 rounded-full bg-[#102B4E] text-white text-[16px] md:text-[18px] font-bold shadow-card hover:bg-[#0A1B30] hover:shadow-overlay transition-all duration-200 group"
          >
            <span>Explore Courses</span>
            <ArrowRight className="w-4.5 h-4.5 text-[#C8A45D] transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <Link
            href="/contact-us"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 sm:px-9 sm:py-4.5 rounded-full bg-white text-[#102B4E] border-2 border-[#102B4E] text-[16px] md:text-[18px] font-bold hover:bg-[#F7F8FA] transition-all duration-200"
          >
            <span>Contact Us</span>
          </Link>
        </div>

        {/* Feature Highlights (Bottom feature headings: 17px/15px, descriptions: 15px/13-14px) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 pt-10 sm:pt-12 border-t border-[#E2E7EE]/90 w-full max-w-4xl text-left">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-[#102B4E]/10 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-[#102B4E]" />
            </div>
            <div>
              <h4 className="text-[15px] sm:text-[16px] lg:text-[17px] font-bold text-[#102B4E]">
                Rigorous Curriculum
              </h4>
              <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-[#687587] mt-1 leading-snug">
                ASNT, ASME, ISO &amp; British inspection standard alignment.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-[#C8A45D]/15 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-5 h-5 text-[#C8A45D]" />
            </div>
            <div>
              <h4 className="text-[15px] sm:text-[16px] lg:text-[17px] font-bold text-[#102B4E]">
                Hands-On Practical Labs
              </h4>
              <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-[#687587] mt-1 leading-snug">
                Industrial flaw detectors, radiographic film &amp; 3D BIM modelling.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-[#102B4E]/10 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-5 h-5 text-[#102B4E]" />
            </div>
            <div>
              <h4 className="text-[15px] sm:text-[16px] lg:text-[17px] font-bold text-[#102B4E]">
                Verified Certification
              </h4>
              <p className="text-[13px] sm:text-[14px] lg:text-[15px] text-[#687587] mt-1 leading-snug">
                Authenticated certificate documents with secure verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
