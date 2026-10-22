'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, ArrowUpRight } from 'lucide-react';
import { defaultSettings } from '@/lib/data';
import { useCourseCatalog } from '@/lib/useCourseCatalog';
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { lockScroll, unlockScroll } from '@/lib/scroll-lock';

/**
 * Whether the page opened on a dark full-bleed hero, in which case the
 * unscrolled floating header needs white type instead of ink.
 *
 * The hero publishes `data-dark-hero` on <html> (see `DarkHeroFlag`) rather
 * than the header keeping a route list: the old list had gone stale — `/course`
 * had switched to a video hero and was rendering dark logo type on dark video.
 */
const useDarkHero = (pathname: string) => {
  const [darkHero, setDarkHero] = useState(false);

  useEffect(() => {
    const read = () => setDarkHero(document.documentElement.dataset.darkHero === 'true');
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-dark-hero'] });
    return () => mo.disconnect();
  }, [pathname]);

  return darkHero;
};

export const SiteHeader: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const pathname = usePathname();
  const { courses, loading: coursesLoading } = useCourseCatalog();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const hasDarkHero = useDarkHero(pathname);
  const overDarkHero = !isScrolled && hasDarkHero;

  useEffect(() => {
    let frame = 0;
    // Read layout inside rAF and only re-render on an actual state flip; the
    // raw listener fired setState on every one of ~100 scroll events a second.
    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setIsScrolled((prev) => {
          const next = window.scrollY > 20;
          return next === prev ? prev : next;
        });
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Publish the header height AND its live bottom edge in the viewport.
  //
  // `--header-h` is the height the homepage hero bleeds under. `--header-bottom`
  // is where the mobile drawer starts: the header is sticky under the
  // announcement bar, so before the page scrolls its bottom edge sits *below*
  // its own height — anchoring the drawer to the height alone drew it over the
  // logo and the close button, leaving no way to dismiss the menu.
  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const setVars = () => {
      const rect = node.getBoundingClientRect();
      const root = document.documentElement.style;
      root.setProperty('--header-h', `${node.offsetHeight}px`);
      root.setProperty('--header-bottom', `${Math.max(0, Math.round(rect.bottom))}px`);
    };
    setVars();
    const ro = new ResizeObserver(setVars);
    ro.observe(node);
    window.addEventListener('scroll', setVars, { passive: true });
    window.addEventListener('resize', setVars);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', setVars);
      window.removeEventListener('resize', setVars);
    };
  }, [isScrolled]);

  // Keyboard escape & outside click handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCoursesOpen(false);
        setIsMobileOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCoursesOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lock scroll while the drawer is open. `overflow: hidden` alone did not
  // hold: Lenis keeps its own rAF loop running and scrolled the page behind
  // the overlay.
  useEffect(() => {
    if (!isMobileOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isMobileOpen]);

  // A client-side navigation leaves the drawer and dropdown open over the new
  // page otherwise — the route changes but no component unmounts.
  useEffect(() => {
    setIsMobileOpen(false);
    setIsCoursesOpen(false);
  }, [pathname]);

  // Crossing into desktop with the drawer open would leave the body locked
  // against a menu that is no longer rendered.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1280px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMobileOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Focus returns to the toggle when the drawer closes, so keyboard and screen
  // reader users do not get dropped at the top of the document.
  useEffect(() => {
    if (isMobileOpen) {
      drawerRef.current?.focus();
    } else if (document.activeElement === document.body) {
      mobileToggleRef.current?.focus();
    }
  }, [isMobileOpen]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Courses', href: '/course', hasDropdown: true },
    { label: 'Admission', href: '/admission' },
    { label: 'Placements', href: '/placement' },
    { label: 'Blog', href: '/blog' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Contact Us', href: '/contact-us' },
  ];

  return (
    <>
    <header
      ref={headerRef}
      /* Above the drawer (z-55): the drawer opens *below* the header, and the
         close button lives in the header — it must stay clickable. */
      className={`sticky top-0 z-[60] transition-all duration-300 ${overDarkHero ? 'on-dark ' : ''}${
        isScrolled
          ? 'py-3.5 bg-surface border-b border-border shadow-subtle'
          : `py-5 backdrop-blur-md border-b ${
              overDarkHero ? 'bg-white/10 border-white/10' : 'bg-transparent border-transparent'
            }`
      }`}
    >
      <div className="site-container flex items-center justify-between gap-3">
        {/* Institute Brand Logo — sized up for brand recognition; the 44px mark
            read as an icon next to the nav rather than as the institute seal. */}
        <Link href="/" className="flex items-center shrink-0 group focus-visible:outline-2 focus-visible:outline-forest rounded-full" aria-label="Savvy Training Institute — home">
          <SavvyLogo tone={overDarkHero ? 'light' : 'ink'} className="transition-transform group-hover:scale-[1.02]" />
        </Link>

        {/* Desktop Navigation. `shrink-0` + `whitespace-nowrap`: the pill used to
            be squeezed between the logo and the CTA group at 1024–1280px, which
            is what ran "Admission" into "Contact Us". */}
        <nav className="hidden xl:flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface px-4 py-1.5 shadow-subtle">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

            if (link.hasDropdown) {
              return (
                <div key={link.href} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                    aria-expanded={isCoursesOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-1 whitespace-nowrap px-3.5 py-1.5 text-sm rounded-full transition-colors ${
                      isActive ? 'bg-foreground text-white font-medium' : 'text-foreground/80 hover:text-foreground hover:bg-black/5'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCoursesOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Accessible Courses Dropdown Menu */}
                  {isCoursesOpen && (
                    <div className="anim-pop-in absolute top-full left-0 mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-surface border border-border shadow-overlay p-3 z-50">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground px-3 py-1 font-semibold">
                        Certified Programs
                      </div>
                      <div className="hairline-divider my-1.5" />
                      <div className="flex flex-col gap-0.5">
                        {courses.length === 0 && <span className="px-3 py-2 text-xs text-muted-foreground">{coursesLoading ? 'Loading courses…' : 'No courses available'}</span>}
                        {courses.map((course, i) => (
                          <Link
                            key={course.id}
                            href={`/course/${course.slug}`}
                            onClick={() => setIsCoursesOpen(false)}
                            style={{ ['--i' as string]: i }}
                            className="anim-stagger-item flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-background transition-colors text-foreground group"
                          >
                            <span className="font-medium group-hover:text-forest">{course.title}</span>
                            <span className="text-[10px] text-muted-foreground bg-black/5 px-2 py-0.5 rounded-full">
                              {course.duration}
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="hairline-divider my-1.5" />
                      <Link
                        href="/course"
                        onClick={() => setIsCoursesOpen(false)}
                        className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold text-forest hover:underline"
                      >
                        View All Programs <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-3.5 py-1.5 text-sm rounded-full transition-colors ${
                  isActive ? 'bg-foreground text-white font-medium' : 'text-foreground/80 hover:text-foreground hover:bg-black/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Primary Header CTA. The secondary links only have room from `xl` up;
            below that the drawer carries them, so nothing is truncated. */}
        <div className="hidden xl:flex items-center gap-3 shrink-0">
          <Link
            href="/verify-certificate"
            className={`whitespace-nowrap text-xs font-medium transition-colors ${overDarkHero ? 'text-white/90 hover:text-white' : 'text-foreground/80 hover:text-forest'}`}
          >
            Verify Certificate
          </Link>
          <Link
            href="/login"
            className={`whitespace-nowrap text-xs font-medium transition-colors ${overDarkHero ? 'text-white/90 hover:text-white' : 'text-foreground/80 hover:text-forest'}`}
          >
            Login
          </Link>
          <Link href="/admission" className="pill-button-forest text-xs py-2.5 px-5 whitespace-nowrap">
            Apply Now
          </Link>
        </div>

        {/* Mobile Hamburger / Close Toggle */}
        <button
          ref={mobileToggleRef}
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-nav-drawer"
          className={`xl:hidden grid h-11 w-11 place-items-center rounded-full border transition-colors active:scale-95 ${
            overDarkHero && !isMobileOpen
              ? 'border-white/40 bg-white/10 text-white hover:bg-white/20'
              : 'border-border bg-surface text-foreground hover:bg-black/5'
          }`}
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
    </header>

      {/* Mobile drawer — a sibling of <header>, never a child. The unscrolled
          header carries `backdrop-blur`, and a filtered ancestor becomes the
          containing block for `position: fixed` descendants, which collapsed
          the drawer to the height of the header bar. */}
      {isMobileOpen && (
        <div
          id="mobile-nav-drawer"
          ref={drawerRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          /* Anchored to the header's live bottom edge, so the header — logo,
             brand type and the close button — is never covered by the drawer. */
          style={{ top: 'var(--header-bottom, var(--header-h, 65px))' }}
          /* Above the floating WhatsApp button (z-50), which would otherwise
             hover over the open menu. */
          /* Opaque on purpose — a translucent panel over the cinematic hero
             left the nav labels unreadable. */
          className="anim-drawer-in fixed inset-x-0 bottom-0 z-[55] bg-surface xl:hidden flex flex-col justify-between gap-6 overflow-y-auto overscroll-contain border-t border-border p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] focus:outline-none"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <div
                key={link.href}
                style={{ ['--i' as string]: i }}
                className="anim-stagger-item flex flex-col"
              >
                <Link
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`text-lg py-3 border-b border-border/50 font-normal flex items-center justify-between ${
                    pathname === link.href ? 'text-forest font-medium' : 'text-foreground'
                  }`}
                >
                  {link.label}
                  <ArrowUpRight className="w-4 h-4 opacity-40" />
                </Link>
                {link.hasDropdown && (
                  <div className="pl-4 py-2 flex flex-col gap-2 bg-background/50 rounded-xl my-1 border border-border/40">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold px-2">
                      Courses
                    </span>
                    {courses.length === 0 && <span className="px-2 text-sm text-muted-foreground">{coursesLoading ? 'Loading courses…' : 'No courses available'}</span>}
                    {courses.map((c) => (
                      <Link
                        key={c.id}
                        href={`/course/${c.slug}`}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex min-h-[40px] items-center rounded-lg px-2 text-sm text-foreground/80 transition-colors hover:text-forest active:bg-black/5"
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-border mt-auto">
            <Link
              href="/verify-certificate"
              onClick={() => setIsMobileOpen(false)}
              className="pill-button-secondary w-full text-center py-3 text-sm"
            >
              Verify / Regenerate Certificate
            </Link>
            <Link
              href="/login"
              onClick={() => setIsMobileOpen(false)}
              className="pill-button-secondary w-full text-center py-3 text-sm"
            >
              Login
            </Link>
            <Link
              href="/admission"
              onClick={() => setIsMobileOpen(false)}
              className="pill-button-forest w-full text-center py-3 text-sm"
            >
              Get Free Counselling
            </Link>
            {/* Tap-to-call: this is a phone-only surface. */}
            <a
              href={`tel:${defaultSettings.phone_primary.replace(/\s/g, '')}`}
              className="flex min-h-[44px] items-center justify-center text-center text-xs text-muted-foreground"
            >
              Call us: {defaultSettings.phone_primary}
            </a>
          </div>
        </div>
      )}
    </>
  );
};
