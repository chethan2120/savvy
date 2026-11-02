'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';

interface PageHeroBannerProps {
  badgeText: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  priority?: boolean;
  variant?: 'default' | 'about' | 'blogs' | 'contact';
  actionHref?: string;
  actionLabel?: string;
  visual?: React.ReactNode;
}

export function PageHeroBanner({
  badgeText,
  title,
  description,
  imageSrc,
  imageAlt,
  priority = true,
  variant = 'default',
  actionHref,
  actionLabel,
  visual,
}: PageHeroBannerProps) {
  if (variant !== 'default') {
    const light = variant !== 'blogs';
    return (
      <section data-no-reveal className={`${light ? 'bg-[#F8EDF1]' : 'bg-[#F8EDF1]'} border-b border-[#EAD9E0] py-12 sm:py-16`}>
        <div className={`site-container grid items-center gap-8 ${variant === 'blogs' ? 'lg:grid-cols-[1.2fr_0.8fr]' : 'lg:grid-cols-2'}`}>
          <div>
            <p className="text-sm font-semibold text-[#B83268]">{badgeText}</p>
            <h1 className="mt-3 max-w-3xl text-[#641B38]">{title}</h1>
            <p className="mt-4 max-w-2xl text-[#30262B]">{description}</p>
            {actionHref && actionLabel && (
              <a href={actionHref} className="mt-6 inline-flex rounded-full bg-[#B83268] px-5 py-3 text-base font-semibold text-white">{actionLabel}</a>
            )}
          </div>
          {visual ? (
            <div className="w-full">{visual}</div>
          ) : (
            <div className={`relative overflow-hidden rounded-3xl border border-[#EAD9E0] bg-white ${variant === 'blogs' ? 'aspect-[5/4]' : 'aspect-[4/3]'}`}>
              {imageSrc && (
                <Image src={imageSrc} alt={imageAlt || ''} fill priority={priority} sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
              )}
            </div>
          )}
        </div>
      </section>
    );
  }
  return (
    <section data-no-reveal className="bg-[#641B38] text-white py-12 sm:py-16 lg:py-20 border-b border-[#B83268]/30 relative overflow-hidden">
      {/* Subtle ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_70%)] blur-3xl pointer-events-none"
      />

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (7 cols on desktop): Text content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white mb-5 anim-pop-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="tracking-wider uppercase">{badgeText}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] max-w-2xl">
              {title}
            </h1>

            {/* Supporting description */}
            <p className="text-sm sm:text-base lg:text-[17px] text-white/85 mt-5 leading-relaxed max-w-xl font-normal">
              {description}
            </p>

            {/* Institutional Quality Assurance Indicator */}
            <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs text-white/70 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Learn it. Teach it. Certify it.</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols on desktop): Hero Image */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-[#641B38] aspect-[4/3] group">
              {imageSrc && (
              <Image
                src={imageSrc}
                alt={imageAlt || ''}
                fill
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 550px"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              )}
              {/* Clean edge highlight without any dull tint */}
              <div
                aria-hidden="true"
                className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-2xl sm:rounded-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
