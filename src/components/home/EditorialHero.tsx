'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { SavvyLogo } from '@/components/brand/SavvyLogo';

export function EditorialHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [slideOffset, setSlideOffset] = useState(0);

  // Coursera hero has 3 slide positions for smooth multi-card peeking carousel
  const totalSlides = 3;

  // Auto-slide every 6 seconds unless user is hovering
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  // Update pixel offset dynamically whenever currentSlide changes or window resizes
  useEffect(() => {
    const updateOffset = () => {
      if (!trackRef.current) return;
      const cards = trackRef.current.children;
      if (cards.length > currentSlide) {
        const targetCard = cards[currentSlide] as HTMLElement;
        setSlideOffset(targetCard.offsetLeft);
      }
    };

    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section
      data-no-reveal
      className="bg-white pt-4 pb-6 sm:pb-10 border-b border-[#e2e8f0] relative overflow-x-clip font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="site-container relative">
        {/* Carousel Viewport Container */}
        <div className="relative overflow-hidden">
          {/* Slider Track with Dynamic Pixel Offset */}
          <div
            ref={trackRef}
            className="flex gap-4 sm:gap-5 transition-transform duration-500 ease-in-out items-stretch"
            style={{
              transform: `translateX(-${slideOffset}px)`,
            }}
          >
            {/* ========================================================= */}
            {/* CARD 1: Light mint → lime → spring green banner          */}
            {/* ========================================================= */}
            <div className="w-full sm:w-[500px] lg:w-[calc(50%-12px)] xl:w-[580px] shrink-0 rounded-[28px] bg-[linear-gradient(148deg,#f7fee7_0%,#d9f99d_22%,#86efac_58%,#4ade80_100%)] text-[#14532d] p-0 flex items-stretch relative overflow-hidden shadow-[0_18px_40px_rgba(74,222,128,0.28)] border border-white/70 h-auto sm:h-[340px]">
              <div
                aria-hidden="true"
                className="absolute -right-8 -top-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.72)_0%,transparent_68%)] blur-2xl pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -left-10 -bottom-20 w-64 h-64 rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.45)_0%,transparent_70%)] blur-2xl pointer-events-none"
              />

              <div className="relative z-10 w-full flex flex-col sm:flex-row items-stretch">
                <div className="relative z-30 w-full sm:w-[54%] flex flex-col justify-center text-left p-6 sm:p-7 lg:p-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-[#14532d] tracking-tight leading-[1.18] mb-2 font-sans">
                      Learn it. Teach it. Certify it.
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#166534] leading-[1.4] mb-5 font-normal font-sans line-clamp-3">
                      Teaching qualifications, online beauty, massage and hairdressing courses, and accreditation to certify your own learners.
                    </p>
                  </div>

                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#047857] hover:bg-[#065f46] text-white text-[13px] font-semibold tracking-normal shadow-xs transition-all hover:gap-3 group w-fit"
                  >
                    <span>Explore courses</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="relative w-full h-48 min-h-48 shrink-0 overflow-hidden sm:h-auto sm:min-h-full sm:w-[46%]">
                  <Image
                    src="/images/heroes/about-hero.jpg"
                    alt="Engineering inspection lab"
                    fill
                    sizes="320px"
                    className="object-cover object-center"
                    priority
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-md">
                    <span className="min-w-0 truncate text-[11px] font-bold text-[#14532d]">Lisa Zaman</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#047857]">
                      <Award className="w-3 h-3" />
                      Founder, tutor and assessor
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CARD 2: Pure White Banner (Coursera Google Card Match)    */}
            {/* ========================================================= */}
            <div className="w-full sm:w-[500px] lg:w-[calc(50%-12px)] xl:w-[580px] shrink-0 rounded-[28px] bg-white text-[#1F1F1F] p-0 flex items-stretch relative overflow-hidden shadow-xs border border-[#e2e8f0] h-auto sm:h-[340px]">
              <div className="relative z-10 w-full flex flex-col sm:flex-row items-stretch">
                <div className="relative z-30 w-full sm:w-[54%] flex flex-col justify-center text-left p-6 sm:p-7 lg:p-8">
                  <div>
                    {/* Partner Header Crest */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-5 w-5 rounded-full overflow-hidden border border-[#e2e8f0] p-0.5 bg-white shadow-2xs shrink-0">
                        <SavvyLogo markClassName="h-full w-full object-contain" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0056D2] font-sans">
                        Teaching qualifications
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-[22px] lg:text-[23px] font-bold text-[#1F1F1F] tracking-tight leading-[1.18] mb-2 font-sans line-clamp-3">
                      Become a teacher, fully online
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#565656] leading-[1.4] mb-5 font-normal font-sans line-clamp-2">
                      Level 3 to Level 5 teaching qualifications, plus assessing and internal quality assurance, with live Zoom sessions.
                    </p>
                  </div>

                  <Link
                    href="/teaching"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0056D2] hover:bg-[#00419e] text-white text-[13px] font-semibold tracking-normal shadow-xs transition-all hover:gap-3 group w-fit"
                  >
                    <span>View qualifications</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="relative w-full h-48 min-h-48 shrink-0 overflow-hidden sm:h-auto sm:min-h-full sm:w-[46%] bg-[#f4f7fb]">
                  <Image
                    src="/images/courses/award-in-education-and-training.jpg"
                    alt="A trainer speaking with adult learners in a classroom"
                    fill
                    sizes="320px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CARD 3: Vibrant Coursera Electric Blue Enterprise Card    */}
            {/* ========================================================= */}
            <div className="w-full sm:w-[500px] lg:w-[calc(50%-12px)] xl:w-[580px] shrink-0 rounded-[28px] bg-[linear-gradient(128deg,#6D28D9_0%,#7C3AED_36%,#2563EB_70%,#06B6D4_100%)] text-white p-0 flex items-stretch relative overflow-hidden shadow-[0_18px_40px_rgba(124,58,237,0.28)] border border-white/25 h-auto sm:h-[340px]">
              <div
                aria-hidden="true"
                className="absolute -right-8 -top-16 w-72 h-72 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.45)_0%,transparent_65%)] blur-2xl pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -right-6 -bottom-12 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.4)_0%,transparent_68%)] blur-2xl pointer-events-none"
              />

              <div className="relative z-10 w-full flex flex-col sm:flex-row items-stretch">
                <div className="relative z-30 w-full sm:w-[54%] flex flex-col justify-center text-left p-6 sm:p-7 lg:p-8">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2] bg-white px-2.5 py-0.5 rounded-full mb-2 inline-block font-sans shadow-2xs">
                      Savvy for Business
                    </span>
                    <h2 className="text-xl sm:text-2xl lg:text-[25px] font-bold text-white tracking-tight leading-[1.18] mb-2 font-sans line-clamp-2">
                      Certify your training in your own right
                    </h2>
                    <p className="text-xs sm:text-[13px] text-white/90 leading-[1.4] mb-5 font-normal font-sans line-clamp-2">
                      Private companies and individuals can apply. Every sector is welcome, from beauty and hair to education and business skills.
                    </p>
                  </div>

                  <Link
                    href="/accreditation"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-100 text-[#0056D2] text-[13px] font-semibold tracking-normal shadow-xs transition-all hover:gap-3 group w-fit"
                  >
                    <span>Apply for accreditation</span>
                    <ArrowRight className="w-4 h-4 text-[#0056D2] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="relative w-full h-48 min-h-48 shrink-0 overflow-hidden sm:h-auto sm:min-h-full sm:w-[46%]">
                  <Image
                    src="/images/courses/internal-quality-assurance.jpg"
                    alt="An assessor reviewing training assessment folders"
                    fill
                    sizes="320px"
                    className="object-cover object-center"
                  />
                  <div className="absolute bottom-3 left-3 right-3 px-2.5 py-1.5 rounded-full bg-white/95 text-[10px] font-bold text-[#0056D2] flex items-center justify-center gap-1 shadow-md">
                    <ShieldCheck className="w-3 h-3 text-[#0056D2]" />
                    <span>Reviewed by Lisa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* CARD 4: Verifiable Credentials & Digital Recognition     */}
            {/* ========================================================= */}
            <div className="w-full sm:w-[500px] lg:w-[calc(50%-12px)] xl:w-[580px] shrink-0 rounded-[28px] bg-white text-[#1F1F1F] p-6 sm:p-7 lg:p-8 flex items-center relative overflow-hidden shadow-xs border border-[#e2e8f0] h-auto sm:h-[340px]">
              <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative z-30 w-full sm:w-[58%] flex flex-col justify-between h-full pr-1 sm:pr-3 text-left">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Award className="w-4 h-4 text-[#0056D2]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0056D2] font-sans">
                        Authorized Credentials
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-[22px] lg:text-[23px] font-bold text-[#1F1F1F] tracking-tight leading-[1.18] mb-2 font-sans line-clamp-2">
                      Certificate and logo after approval
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#565656] leading-[1.4] mb-5 font-normal font-sans line-clamp-2">
                      Once an accreditation application is approved, the certificate and logo are ready to download from the account. The sample shown on the source site is an example only.
                    </p>
                  </div>

                  <Link
                    href="/accreditation"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0056D2] hover:bg-[#00419e] text-white text-[13px] font-semibold tracking-normal shadow-xs transition-all hover:gap-3 group w-fit"
                  >
                    <span>Start an application</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="flex w-full sm:w-[42%] relative items-center justify-center shrink-0 mt-4 sm:mt-0">
                  <div className="relative w-full sm:w-36 sm:h-36 lg:w-40 lg:h-40 min-h-[7.5rem] rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-md bg-slate-50 flex flex-col items-center justify-center p-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#EBF3FF] border border-[#0056D2]/20 flex items-center justify-center mb-2">
                      <FileCheck className="w-5 h-5 text-[#0056D2]" />
                    </div>
                    <span className="text-xs font-bold text-[#1F1F1F]">Example only</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Not an issued certificate</span>
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#0056D2]">
                      <span>Check Registry</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {currentSlide < totalSlides - 1 && (
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="hidden sm:flex absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white hover:bg-slate-50 text-[#0056D2] border border-[#e2e8f0] shadow-md items-center justify-center transition-all z-20 hover:scale-105 active:scale-95 cursor-pointer"
              style={{ right: 12, left: 'auto' }}
            >
              <ChevronRight className="w-5 h-5 text-[#0056D2]" />
            </button>
          )}

          {currentSlide > 0 && (
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="hidden sm:flex absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white hover:bg-slate-50 text-[#0056D2] border border-[#e2e8f0] shadow-md items-center justify-center transition-all z-20 hover:scale-105 active:scale-95 cursor-pointer"
              style={{ left: 12, right: 'auto' }}
            >
              <ChevronLeft className="w-5 h-5 text-[#0056D2]" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-1 sm:justify-start sm:gap-1.5">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            disabled={currentSlide === 0}
            className="sm:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0056D2] shadow-sm disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={currentSlide === idx ? 'true' : undefined}
              className="carousel-dot inline-flex h-11 w-8 shrink-0 items-center justify-center"
            >
              <span
                className={`block rounded-full ${
                  currentSlide === idx ? 'h-2 w-7 bg-[#0056D2]' : 'h-2.5 w-2.5 bg-slate-300'
                }`}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            disabled={currentSlide === totalSlides - 1}
            className="sm:hidden inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#0056D2] shadow-sm disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
