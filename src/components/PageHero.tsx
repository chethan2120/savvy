import React from 'react';
import Image from 'next/image';
import { Breadcrumbs } from './Breadcrumbs';
import { DarkHeroFlag } from './DarkHeroFlag';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type HeroMedia =
  | { type: 'video'; src: string; poster: string }
  | { type: 'image'; src: string };

interface PageHeroProps {
  breadcrumbs: BreadcrumbItem[];
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Small pills shown under the headline (duration, fee, category, …). */
  meta?: React.ReactNode;
  /** Buttons / links rendered under the description. */
  actions?: React.ReactNode;
  media: HeroMedia;
  /** Alt text for the background media. Decorative by default. */
  mediaAlt?: string;
  /** Narrower measure for long-form pages (blog article, legal). */
  compact?: boolean;
}

const Kicker: React.FC<{ tone: 'dark' | 'light' }> = ({ tone }) => (
  <div className="flex items-center gap-4">
    <span
      aria-hidden="true"
      className={`h-px w-10 ${tone === 'light' ? 'bg-white/50' : 'bg-[var(--forest)]'}`}
    />
    <span
      className={`text-micro uppercase tracking-[0.28em] ${
        tone === 'light' ? 'text-white/70' : 'text-[var(--forest)]'
      }`}
    >
      Savvy
    </span>
  </div>
);

/**
 * Hero for every page except the home page. The media decides the form:
 *
 * - **Video** plays full-bleed behind the type, bleeding up under the sticky
 *   header. Motion works as atmosphere, so it belongs in the background where
 *   it can't compete with the headline.
 * - **Image** sits in its own framed panel beside the type, on the daylight
 *   page background. A still is a piece of evidence — a course photo, a
 *   facility shot — so it reads better as a section element than as wallpaper.
 *
 * `compact` collapses the split to a single measure for long-form pages.
 */
export const PageHero: React.FC<PageHeroProps> = ({
  breadcrumbs,
  title,
  description,
  meta,
  actions,
  media,
  mediaAlt = '',
  compact = false,
}) => {
  /* ---------------------------------------------------------------- video */
  if (media.type === 'video') {
    return (
      <section className="on-dark relative isolate -mt-[var(--header-h)] flex h-[calc(100svh-var(--announce-h,0px))] min-h-[36rem] flex-col justify-end overflow-hidden bg-[#06110d] pt-[var(--header-h)]">
        <DarkHeroFlag />
        <video
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          src={media.src}
          poster={media.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#06110d]/92 via-[#06110d]/70 to-[#06110d]/35"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06110d]/85 via-transparent to-[#06110d]/45"
        />
        <div aria-hidden="true" className="hero-grain absolute inset-0 -z-10" />

        <div className="site-container relative flex flex-col pt-10 pb-20 md:pb-24">
          <div className={`mt-auto pt-16 md:pt-24 ${compact ? 'max-w-4xl' : 'max-w-4xl'}`}>
            <Kicker tone="light" />

            <h1 className="mt-6 text-display-xl font-normal tracking-tight text-white">{title}</h1>

            {meta && <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">{meta}</div>}

            {description && (
              <p className="mt-7 max-w-2xl text-body-large leading-relaxed text-white/75">
                {description}
              </p>
            )}

            {actions && <div className="mt-9 flex flex-wrap items-center gap-3">{actions}</div>}
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------------------------------------- image */
  return (
    // `lg:overflow-hidden` here used to clip whatever didn't fit inside the
    // one-viewport target height — on a page like Placements, where the
    // headline runs three lines, that cut the action buttons clean off the
    // bottom. The target height is now a floor (`min-h`), not a hard cap, so
    // long copy grows the section instead of being cropped.
    <section className="relative isolate pt-4 md:pt-6">
      <div className="site-container flex h-full flex-col">
        <div className="shrink-0">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        <div
          className={
            compact
              ? 'mt-8 flex flex-col gap-10'
              : 'mt-6 grid grid-cols-1 gap-10 pb-6 lg:grid-cols-12 lg:items-stretch lg:gap-16 lg:pb-10'
          }
        >
          {/* Type column */}
          <div className={compact ? 'max-w-4xl' : 'lg:col-span-7'}>
            <Kicker tone="dark" />

            <h1 className="mt-6 text-display-xl font-normal tracking-tight text-foreground">
              {title}
            </h1>

            {meta && <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">{meta}</div>}

            {description && (
              <p className="mt-7 max-w-2xl text-body-large leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}

            {actions && <div className="mt-9 flex flex-wrap items-center gap-3">{actions}</div>}
          </div>

          {/* Media column — a fixed aspect ratio so every hero frames its
              image the same way, regardless of how much text/actions sit
              next to it (letting height track the text column stretched
              short pages into a tall dark crop, and long ones into a
              near-square). */}
          <div className={compact ? '' : 'lg:col-span-5'}>
            <div className="relative overflow-hidden rounded-[10px] border border-border bg-[#06110d]">
              <div
                className={
                  compact
                    ? 'relative aspect-[16/9] md:aspect-[21/6]'
                    : 'relative aspect-[16/10]'
                }
              >
                <Image
                  src={media.src}
                  alt={mediaAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#06110d]/35 via-transparent to-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {compact && <div className="hairline-divider mt-16 md:mt-20" />}
      </div>
    </section>
  );
};
