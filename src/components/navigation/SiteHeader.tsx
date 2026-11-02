'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown, Search, Menu, X, ArrowRight,
  ShieldCheck, Award, ShoppingBag, MessagesSquare,
  Briefcase, Compass, Mail
} from 'lucide-react';
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { onlineCourses } from '@/lib/academy-content';
import { gbpLabel, useShowCoursePrices } from '@/lib/public-price';
import { getCachedCategories, getCachedSession } from '@/lib/api-cache';
import { signOutPortal } from '@/lib/portal-auth';

interface CategoryCourseItem {
  id: string;
  slug: string;
  title: string;
  duration?: string;
  priceInr?: number | null;
  currency_prices?: { GBP?: number | null };
}

interface CategoryWithCourses {
  id: string;
  name: string;
  description?: string;
  courseCount: number;
  courses: CategoryCourseItem[];
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const showPrices = useShowCoursePrices();

  const [categories, setCategories] = useState<CategoryWithCourses[]>([]);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const contactCloseTimer = useRef<number | null>(null);
  const openContactMenu = () => {
    if (contactCloseTimer.current) window.clearTimeout(contactCloseTimer.current);
    setContactOpen(true);
  };
  const closeContactMenu = () => {
    if (contactCloseTimer.current) window.clearTimeout(contactCloseTimer.current);
    contactCloseTimer.current = window.setTimeout(() => setContactOpen(false), 220);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [userSession, setUserSession] = useState<{ role: string; fullName: string } | null>(null);

  const megaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Session check with immediate revalidation on route changes and auth events
  const checkSession = useCallback(() => {
    // If user is on the home page ('/'), automatically log out and reset session as requested:
    // "if i come to home page once then it should automatically logout so fix it"
    if (pathname === '/') {
      setUserSession(null);
      fetch('/api/auth/session', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then(async (data) => {
          if (data?.authenticated) {
            await signOutPortal();
          }
        })
        .catch(() => {});
      return;
    }

    fetch('/api/auth/session', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.account) {
          setUserSession({ role: data.account.role, fullName: data.account.fullName });
        } else {
          setUserSession(null);
        }
      })
      .catch(() => {
        setUserSession(null);
      });
  }, [pathname]);

  useEffect(() => {
    checkSession();
    window.addEventListener('auth-changed', checkSession);
    return () => window.removeEventListener('auth-changed', checkSession);
  }, [checkSession, pathname]);

  // Fetch dynamic categories
  useEffect(() => {
    let mounted = true;
    getCachedCategories()
      .then((data) => {
        if (mounted && data?.categories) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Scroll listener for subtle elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMegaOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnterMega = () => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current);
    setIsMegaOpen(true);
  };

  const handleMouseLeaveMega = () => {
    megaTimeoutRef.current = setTimeout(() => {
      setIsMegaOpen(false);
    }, 200);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (courseSearch.trim()) {
      router.push(`/courses?query=${encodeURIComponent(courseSearch.trim())}`);
      setIsMegaOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore Courses', href: '/courses', isMega: true },
    { label: 'Teaching', href: '/teaching' },
    { label: 'About Us', href: '/about-us' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'Contact Us', href: '/contact-us' },
  ];

  const onlineSlugs = new Set<string>(onlineCourses.map((course) => course.slug));
  const catalogueCourses = categories.flatMap((cat) =>
    cat.courses
      .filter((course) => onlineSlugs.has(course.slug))
      .filter((course) => !courseSearch.trim() || course.title.toLowerCase().includes(courseSearch.toLowerCase()))
      .map((course) => ({ ...course, categoryName: cat.name, summary: onlineCourses.find((item) => item.slug === course.slug)?.summary || '' }))
  );

  return (
    <>
      {/* Coursera-Style Top Utility Bar */}
      <div className="bg-[#0b1a30] text-white text-[11px] font-semibold hidden md:block border-b border-white/10">
        <div className="site-container flex items-center justify-between h-9">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white border-b-2 border-white pb-0.5 font-bold">
              For Individuals
            </Link>
            <Link href="/accreditation" className="text-white/70 hover:text-white transition-colors pb-0.5">
              Accreditation
            </Link>
            <Link href="/teaching" className="text-white/70 hover:text-white transition-colors pb-0.5">
              Teaching
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-white/75 text-[11px] shrink-0">
            <span>Accreditation, teaching qualifications and professional courses</span>
          </div>
        </div>
      </div>

      <header
        ref={headerRef}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#e2e8f0]'
            : 'bg-white border-b border-[#e2e8f0]'
        }`}
      >
        <div className="site-container h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Institute Logo & Name + Coursera-style Explore Button + Certifications */}
          <div className="flex items-center gap-4 xl:gap-5 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none min-w-0">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full overflow-hidden bg-white shadow-xs border border-[#e2e8f0] p-0.5 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <SavvyLogo markClassName="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-[15px] sm:text-[17px] lg:text-[19px] tracking-tight text-[#1F1F1F] leading-none truncate">
                  Savvy Training Institute
                </span>
                <span className="hidden xs:block text-[10px] lg:text-[11px] font-semibold text-[#0056D2] tracking-wider uppercase mt-1">
                  Professional Certification
                </span>
              </div>
            </Link>

            {/* Coursera-style Explore Dropdown Button */}
            <div
              className="relative hidden lg:block"
              onMouseEnter={handleMouseEnterMega}
              onMouseLeave={handleMouseLeaveMega}
            >
              <button
                type="button"
                onClick={(event) => setIsMegaOpen(event.detail === 0 ? !isMegaOpen : true)}
                aria-expanded={isMegaOpen}
                aria-haspopup="true"
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setIsMegaOpen(false);
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setIsMegaOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold transition-all shadow-2xs"
              >
                <span>Explore Courses</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMegaOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Degrees / Certifications link matching screenshot */}
          </div>

          {/* Center: Coursera-style Search Input Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-sm xl:max-w-md mx-2 group"
          >
            <div className="relative flex items-center w-full bg-white rounded-full border border-[#e2e8f0] hover:border-[#0056D2]/60 focus-within:border-[#0056D2] focus-within:ring-2 focus-within:ring-[#0056D2]/15 transition-all p-1 pl-4 shadow-2xs">
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="What do you want to learn?"
                className="w-full bg-transparent text-xs text-[#1F1F1F] placeholder-[#8C9BAE] focus:outline-none pr-2"
              />
              <button
                type="submit"
                aria-label="Search programmes"
                className="shrink-0 w-8 h-8 rounded-full bg-[#0056D2] hover:bg-[#00419e] text-white flex items-center justify-center transition-all shadow-xs"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Navigation Links (Coursera Style) */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.filter((l) => !l.isMega && l.href !== '/').map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              if (link.href === '/contact-us') {
                const contactActive = ['/contact-us', '/careers', '/mentorship'].some((href) => pathname === href);
                return (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={openContactMenu}
                    onMouseLeave={closeContactMenu}
                  >
                    <button
                      type="button"
                      aria-expanded={contactOpen}
                      aria-haspopup="menu"
                      onClick={(event) => setContactOpen(event.detail === 0 ? !contactOpen : true)}
                      onKeyDown={(event) => {
                        if (event.key === 'Escape') setContactOpen(false);
                        if (event.key === 'ArrowDown') {
                          event.preventDefault();
                          setContactOpen(true);
                        }
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        contactActive ? 'text-[#0056D2] bg-[#F0F5FF]' : 'text-[#565656] hover:text-[#0056D2] hover:bg-[#F0F5FF]'
                      }`}
                    >
                      Contact Us
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${contactOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {contactOpen && (
                      <div role="menu" className="absolute right-0 top-full z-50 w-[22rem] pt-2">
                      <div className="rounded-2xl border border-[#e2e8f0] bg-white p-3 shadow-xl">
                        {[
                          { label: 'Career', href: '/careers', text: 'Send your specialism, location and CV.', icon: Briefcase },
                          { label: 'Mentorship', href: '/mentorship', text: 'Ask about starting, running or registering a business.', icon: Compass },
                          { label: 'Contact Us', href: '/contact-us', text: 'Send a course or shop enquiry.', icon: Mail },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            role="menuitem"
                            href={item.href}
                            onClick={() => setContactOpen(false)}
                            className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-[#F0F5FF]"
                          >
                            <item.icon className="mt-0.5 h-5 w-5 text-[#0056D2]" />
                            <span>
                              <span className="block text-sm font-semibold text-[#1F1F1F]">{item.label}</span>
                              <span className="mt-0.5 block text-sm text-[#565656]">{item.text}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'text-[#0056D2] bg-[#F0F5FF]'
                      : 'text-[#565656] hover:text-[#0056D2] hover:bg-[#F0F5FF]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {/* Portal / Login button */}
            {userSession ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/${userSession.role}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419e] transition-all shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Dashboard ({userSession.role})</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await signOutPortal();
                    setUserSession(null);
                    window.location.href = '/';
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#565656] hover:text-[#0056D2] hover:border-[#0056D2] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-lg bg-[#0056D2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00419e]"
                >
                  Login
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all active:scale-95 duration-200"
                >
                  <span>Join for Free</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right: Hamburger Button Pinned to Right Hand Top */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#1F1F1F] hover:bg-[#F0F5FF] focus:outline-none focus:ring-2 focus:ring-[#0056D2] transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Explore Courses Compact Mega Menu */}
        {isMegaOpen && (
          <div
            ref={megaMenuRef}
            onMouseEnter={handleMouseEnterMega}
            onMouseLeave={handleMouseLeaveMega}
            className="hidden lg:block absolute top-full left-0 w-full bg-white border-b border-[#e2e8f0] shadow-xl anim-pop-in"
          >
            <div className="site-container py-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#0056D2]">Courses taught by Lisa Zaman</p>
                  <p className="mt-1 text-sm text-[#565656]">Six online courses, with manuals and video demonstrations.</p>
                </div>
                <Link href="/courses" onClick={() => setIsMegaOpen(false)} className="inline-flex items-center gap-1 text-sm font-semibold text-[#0056D2]">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {catalogueCourses.map((course) => {
                  const price = showPrices ? gbpLabel(course) : null;
                  return (
                    <Link key={course.id} href={`/courses/${course.slug}`} onClick={() => setIsMegaOpen(false)} className="rounded-xl border border-[#e2e8f0] p-3 hover:border-[#0056D2]">
                      <span className="block text-sm font-semibold text-[#1F1F1F]">{course.title}</span>
                      <span className="mt-1 block text-sm text-[#565656]">{course.summary}</span>
                      {price && <span className="mt-2 block text-sm font-semibold text-[#0056D2]">{price}</span>}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-5 grid gap-3 border-t border-[#e2e8f0] pt-5 md:grid-cols-3">
                {[
                  { href: '/accreditation', title: 'Accreditation Certification', text: 'Apply for your training to be accredited.', icon: Award },
                  { href: '/shop', title: 'Shop', text: 'Manuals, forms and trainer resources.', icon: ShoppingBag },
                  { href: '/community', title: 'Student Community', text: 'Feedback and discussions, reviewed before publication.', icon: MessagesSquare },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsMegaOpen(false)} className="flex gap-3 rounded-xl p-3 hover:bg-[#F0F5FF]">
                    <item.icon className="h-5 w-5 shrink-0 text-[#0056D2]" />
                    <span>
                      <span className="block text-sm font-semibold text-[#1F1F1F]">{item.title}</span>
                      <span className="mt-1 block text-sm text-[#565656]">{item.text}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className={`fixed inset-x-0 w-full bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between sm:left-auto sm:right-0 sm:max-w-sm top-16 h-[calc(100dvh-4rem)] sm:top-20 sm:h-[calc(100dvh-5rem)] ${
              isScrolled ? '' : 'md:top-[7.25rem] md:h-[calc(100dvh-7.25rem)]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-5">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687587]" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#e3e3e3] bg-[#F0F5FF] text-sm text-[#1F1F1F]"
                />
              </form>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-1 text-[16px] font-medium">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-[16px] ${pathname === '/' ? 'text-[#0056D2] font-bold bg-[#F0F5FF]' : 'text-[#1F1F1F]'}`}
                >
                  Home
                </Link>

                {/* Mobile Explore Courses Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setMobileCategoryOpen(mobileCategoryOpen === 'explore' ? null : 'explore')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-[#1F1F1F] font-medium text-[16px]"
                  >
                    <span>Explore Courses</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoryOpen === 'explore' ? 'rotate-180' : ''}`} />
                  </button>

                  {mobileCategoryOpen === 'explore' && (
                    <div className="pl-4 pr-2 py-2 flex flex-col gap-3 bg-[#F0F5FF] rounded-xl my-1 max-h-72 overflow-y-auto">
                      <Link href="/courses" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#1F1F1F]">Courses</Link>
                      {catalogueCourses.map((course) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.slug || course.id}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[13px] text-[#565656] hover:text-[#0056D2] pl-2"
                        >
                          {course.title}
                        </Link>
                      ))}
                      <Link href="/accreditation" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#1F1F1F]">Accreditation Certification</Link>
                      <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#1F1F1F]">Shop</Link>
                      <Link href="/community" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-[#1F1F1F]">Student Community</Link>
                    </div>
                  )}
                </div>

                <Link
                  href="/teaching"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-[16px] ${pathname === '/teaching' ? 'text-[#0056D2] font-bold bg-[#F0F5FF]' : 'text-[#1F1F1F]'}`}
                >
                  Teaching
                </Link>
                <Link
                  href="/about-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-[16px] ${pathname === '/about-us' ? 'text-[#0056D2] font-bold bg-[#F0F5FF]' : 'text-[#1F1F1F]'}`}
                >
                  About Us
                </Link>
                <Link
                  href="/blogs"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-[16px] ${pathname === '/blogs' ? 'text-[#0056D2] font-bold bg-[#F0F5FF]' : 'text-[#1F1F1F]'}`}
                >
                  Blogs
                </Link>
                <div>
                  <button
                    type="button"
                    onClick={() => setMobileCategoryOpen(mobileCategoryOpen === 'contact' ? null : 'contact')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-[#1F1F1F] font-medium text-[16px]"
                  >
                    <span>Contact Us</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoryOpen === 'contact' ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileCategoryOpen === 'contact' && (
                    <div className="flex flex-col gap-1 rounded-xl bg-[#F0F5FF] px-4 py-2">
                      <Link href="/careers" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-[#1F1F1F]"><strong className="font-semibold">Career</strong><span className="block text-[#565656]">Send your specialism, location and CV.</span></Link>
                      <Link href="/mentorship" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-[#1F1F1F]"><strong className="font-semibold">Mentorship</strong><span className="block text-[#565656]">Ask about starting or registering a business.</span></Link>
                      <Link href="/contact-us" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-[#1F1F1F]"><strong className="font-semibold">Contact Us</strong><span className="block text-[#565656]">Send a course or shop enquiry.</span></Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Mobile Footer Area */}
            <div className="pt-6 border-t border-[#e3e3e3] flex flex-col gap-3">
              {userSession ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/${userSession.role}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-full bg-[#0056D2] text-white text-sm font-semibold"
                  >
                    Go to {userSession.role.toUpperCase()} Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOutPortal();
                      setUserSession(null);
                      setMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="w-full text-center py-2 rounded-full border border-[#e3e3e3] text-xs font-medium text-[#565656]"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#0056D2] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#00419e]"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
