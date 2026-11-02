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

  const totalSlides = 3;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

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
      className="relative overflow-x-clip border-b border-[#EAD9E0] bg-[#FCF8F7] pb-6 pt-4 font-sans sm:pb-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="site-container relative">
        <div className="relative overflow-hidden">
          <div
            ref={trackRef}
            className="flex items-stretch gap-4 transition-transform duration-500 ease-in-out sm:gap-5"
            style={{ transform: `translateX(-${slideOffset}px)` }}
          >
            <div className="relative flex h-auto shrink-0 items-stretch overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(148deg,#FCF8F7_0%,#F8EDF1_42%,#E8A6BC_100%)] p-0 text-[#641B38] shadow-[0_16px_36px_rgba(100,27,56,0.12)] sm:h-[340px] w-full sm:w-[500px] lg:w-[calc(50%-12px)] xl:w-[580px]">
              <div className="relative z-10 flex w-full flex-col items-stretch sm:flex-row">
                <div className="relative z-30 flex w-full flex-col justify-center p-6 text-left sm:w-[54%] sm:p-7 lg:p-8">
                  <div>
                    <h2 className="mb-2 font-sans text-xl font-bold leading-[1.18] tracking-tight text-[#641B38] sm:text-2xl lg:text-[25px]">
                      Learn it. Teach it. Certify it.
                    </h2>
                    <p className="mb-5 line-clamp-3 font-sans text-xs font-normal leading-[1.4] text-[#30262B] sm:text-[13px]">
                      Teaching qualifications, online beauty, massage and hairdressing courses, and accreditation to certify your own learners.
                    </p>
                  </div>
                  <Link
                    href="/courses"
                    className="group inline-flex w-fit items-center gap-2 rounded-full bg-[#B83268] px-5 py-2.5 text-[13px] font-semibold text-white shadow-xs transition-all hover:gap-3 hover:bg-[#641B38]"
                  >
                    <span>Explore courses</span>
                    <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="relative h-48 min-h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:min-h-full sm:w-[46%]">
                  <Image
                    src="/images/courses/beauty-therapy-essentials.jpg"
                    alt="A beauty therapist consulting with a client during training"
                    fill
                    sizes="320px"
                    className="object-cover object-center"
                    priority
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-md">
                    <span className="min-w-0 truncate text-[11px] font-bold text-[#641B38]">Lisa Zaman</span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#B83268]">
                      <Award className="h-3 w-3" />
                      Founder, tutor and assessor
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex h-auto shrink-0 items-stretch overflow-hidden rounded-[28px] border border-[#EAD9E0] bg-white p-0 text-[#30262B] shadow-xs sm:h-[340px] w-full sm:w-[500px] lg:w-[calc(50%-12px)] xl:w-[580px]">
              <div className="relative z-10 flex w-full flex-col items-stretch sm:flex-row">
                <div className="relative z-30 flex w-full flex-col justify-center p-6 text-left sm:w-[54%] sm:p-7 lg:p-8">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full border border-[#EAD9E0] bg-white p-0.5">
                        <SavvyLogo markClassName="h-full w-full object-contain" />
                      </div>
                      <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#B83268]">
                        Teaching qualifications
                      </span>
                    </div>
                    <h2 className="mb-2 line-clamp-3 font-sans text-xl font-bold leading-[1.18] tracking-tight text-[#641B38] sm:text-[22px] lg:text-[23px]">
                      Become a teacher, fully online
                    </h2>
                    <p className="mb-5 line-clamp-2 font-sans text-xs font-normal leading-[1.4] text-[#30262B] sm:text-[13px]">
                      Level 3 to Level 5 teaching qualifications, plus assessing and internal quality assurance, with live Zoom sessions.
                    </p>
                  </div>
                  <Link
                    href="/teaching"
                    className="group inline-flex w-fit items-center gap-2 rounded-full bg-[#B83268] px-5 py-2.5 text-[13px] font-semibold text-white shadow-xs transition-all hover:gap-3 hover:bg-[#641B38]"
                  >
                    <span>View qualifications</span>
                    <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="relative h-48 min-h-48 w-full shrink-0 overflow-hidden bg-[#F8EDF1] sm:h-auto sm:min-h-full sm:w-[46%]">
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

            <div className="relative flex h-auto shrink-0 items-stretch overflow-hidden rounded-[28px] border border-white/20 bg-[linear-gradient(128deg,#641B38_0%,#7A2344_58%,#B83268_100%)] p-0 text-white shadow-[0_16px_36px_rgba(100,27,56,0.22)] sm:h-[340px] w-full sm:w-[500px] lg:w-[calc(50%-12px)] xl:w-[580px]">
              <div className="relative z-10 flex w-full flex-col items-stretch sm:flex-row">
                <div className="relative z-30 flex w-full flex-col justify-center p-6 text-left sm:w-[54%] sm:p-7 lg:p-8">
                  <div>
                    <span className="mb-2 inline-block rounded-full bg-white px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#641B38]">
                      Savvy for Business
                    </span>
                    <h2 className="mb-2 line-clamp-2 font-sans text-xl font-bold leading-[1.18] tracking-tight text-white sm:text-2xl lg:text-[25px]">
                      Certify your training in your own right
                    </h2>
                    <p className="mb-5 line-clamp-2 font-sans text-xs font-normal leading-[1.4] text-white/90 sm:text-[13px]">
                      Private companies and individuals can apply. Every sector is welcome, from beauty and hair to education and business skills.
                    </p>
                  </div>
                  <Link
                    href="/accreditation"
                    className="group inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-semibold text-[#641B38] shadow-xs transition-all hover:gap-3 hover:bg-[#F8EDF1]"
                  >
                    <span>Apply for accreditation</span>
                    <ArrowRight className="h-4 w-4 text-[#641B38] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="relative h-48 min-h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:min-h-full sm:w-[46%]">
                  <Image
                    src="/images/courses/hairdressing-foundations.jpg"
                    alt="A hairdresser training a cut in a salon"
                    fill
                    sizes="320px"
                    className="object-cover object-center"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-[#641B38] shadow-md">
                    <ShieldCheck className="h-3 w-3 text-[#B83268]" />
                    <span>Reviewed by Lisa</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex h-auto shrink-0 items-center overflow-hidden rounded-[28px] border border-[#EAD9E0] bg-white p-6 text-[#30262B] shadow-xs sm:h-[340px] sm:p-7 lg:p-8 w-full sm:w-[500px] lg:w-[calc(50%-12px)] xl:w-[580px]">
              <div className="relative z-10 flex w-full flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="relative z-30 flex h-full w-full flex-col justify-between pr-1 text-left sm:w-[58%] sm:pr-3">
                  <div>
                    <div className="mb-2 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-[#B83268]" />
                      <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#B83268]">
                        Authorized Credentials
                      </span>
                    </div>
                    <h2 className="mb-2 line-clamp-2 font-sans text-xl font-bold leading-[1.18] tracking-tight text-[#641B38] sm:text-[22px] lg:text-[23px]">
                      Certificate and logo after approval
                    </h2>
                    <p className="mb-5 line-clamp-2 font-sans text-xs font-normal leading-[1.4] text-[#30262B] sm:text-[13px]">
                      Once an accreditation application is approved, the certificate and logo are ready to download from the account. The sample shown on the source site is an example only.
                    </p>
                  </div>
                  <Link
                    href="/accreditation"
                    className="group inline-flex w-fit items-center gap-2 rounded-full bg-[#B83268] px-5 py-2.5 text-[13px] font-semibold text-white shadow-xs transition-all hover:gap-3 hover:bg-[#641B38]"
                  >
                    <span>Start an application</span>
                    <ArrowRight className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="relative mt-4 flex w-full shrink-0 items-center justify-center sm:mt-0 sm:w-[42%]">
                  <div className="relative flex min-h-[7.5rem] w-full flex-col items-center justify-center rounded-2xl border border-[#EAD9E0] bg-[#F8EDF1] p-3 text-center shadow-md sm:h-36 sm:w-36 lg:h-40 lg:w-40">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border border-[#B83268]/20 bg-white">
                      <FileCheck className="h-5 w-5 text-[#B83268]" />
                    </div>
                    <span className="text-xs font-bold text-[#641B38]">Example only</span>
                    <span className="mt-0.5 text-[10px] text-[#30262B]">Not an issued certificate</span>
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#B83268]">
                      <span>Check Registry</span>
                      <ExternalLink className="h-2.5 w-2.5" />
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
              className="absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#EAD9E0] bg-white text-[#B83268] shadow-md transition-all hover:scale-105 hover:bg-[#F8EDF1] active:scale-95 sm:flex"
              style={{ right: 12, left: 'auto' }}
            >
              <ChevronRight className="h-5 w-5 text-[#B83268]" />
            </button>
          )}

          {currentSlide > 0 && (
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#EAD9E0] bg-white text-[#B83268] shadow-md transition-all hover:scale-105 hover:bg-[#F8EDF1] active:scale-95 sm:flex"
              style={{ left: 12, right: 'auto' }}
            >
              <ChevronLeft className="h-5 w-5 text-[#B83268]" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-1 sm:justify-start sm:gap-1.5">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            disabled={currentSlide === 0}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#EAD9E0] bg-white text-[#B83268] shadow-sm disabled:opacity-40 sm:hidden"
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
                  currentSlide === idx ? 'h-2 w-7 bg-[#B83268]' : 'h-2.5 w-2.5 bg-[#E8A6BC]'
                }`}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            disabled={currentSlide === totalSlides - 1}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#EAD9E0] bg-white text-[#B83268] shadow-sm disabled:opacity-40 sm:hidden"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
