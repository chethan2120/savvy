'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown, Search, Menu, X, ArrowRight,
  BookOpen, Globe, User, ExternalLink, ShieldCheck
} from 'lucide-react';
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { useCurrency, SUPPORTED_CURRENCIES, CURRENCY_CONFIGS, CurrencyCode } from '@/lib/currency';
import { getCachedCategories, getCachedSession } from '@/lib/api-cache';
import { signOutPortal } from '@/lib/portal-auth';

interface CategoryCourseItem {
  id: string;
  slug: string;
  title: string;
  duration?: string;
  priceInr?: number | null;
  currency_prices?: Partial<Record<CurrencyCode, number | null>>;
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
  const { currency, setCurrency, getCoursePriceDisplay } = useCurrency();

  const [categories, setCategories] = useState<CategoryWithCourses[]>([]);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [userSession, setUserSession] = useState<{ role: string; fullName: string } | null>(null);

  const megaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

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
    { label: 'About Us', href: '/about-us' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'Contact Us', href: '/contact-us' },
  ];

  const filteredCategories = categories.filter((cat) => {
    if (!courseSearch.trim()) return true;
    const q = courseSearch.toLowerCase();
    const matchCat = cat.name.toLowerCase().includes(q);
    const matchCourse = cat.courses.some((c) => c.title.toLowerCase().includes(q));
    return matchCat || matchCourse;
  });

  return (
    <>
      {/* Coursera-Style Top Utility Bar */}
      <div className="bg-[#0b1a30] text-white text-[11px] font-semibold hidden md:block border-b border-white/10">
        <div className="site-container flex items-center justify-between h-9">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white border-b-2 border-white pb-0.5 font-bold">
              For Individuals
            </Link>
            <Link href="/about-us" className="text-white/70 hover:text-white transition-colors pb-0.5">
              For Businesses
            </Link>
            <Link href="/courses" className="text-white/70 hover:text-white transition-colors pb-0.5">
              For Universities
            </Link>
            <Link href="/contact-us" className="text-white/70 hover:text-white transition-colors pb-0.5">
              For Governments
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-white/75 text-[11px] shrink-0">
            <span>UK Standards · ASME &amp; ASNT Calibration</span>
          </div>
        </div>
      </div>

      <header
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
              className="relative hidden md:block"
              onMouseEnter={handleMouseEnterMega}
              onMouseLeave={handleMouseLeaveMega}
            >
              <button
                type="button"
                onClick={() => setIsMegaOpen(!isMegaOpen)}
                aria-expanded={isMegaOpen}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold transition-all shadow-2xs"
              >
                <span>Explore</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMegaOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>

            {/* Degrees / Certifications link matching screenshot */}
            <Link
              href="/courses"
              className="hidden xl:inline-block text-xs font-semibold text-[#565656] hover:text-[#0056D2] transition-colors"
            >
              Certifications
            </Link>
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
                placeholder="What do you want to learn? (e.g. NDT, QA/QC, ASME...)"
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

          {/* Right: Currency Switcher & Auth CTA (Coursera Style) */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {/* Currency selector */}
            <div className="relative group">
              <label htmlFor="currency-select-header" className="sr-only">
                Select currency
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] bg-white text-xs font-semibold text-[#1F1F1F] hover:border-[#0056D2] transition-colors cursor-pointer shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-[#565656]" />
                <select
                  id="currency-select-header"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="bg-transparent text-xs font-semibold text-[#1F1F1F] border-none focus:outline-none cursor-pointer pr-1"
                >
                  {SUPPORTED_CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {CURRENCY_CONFIGS[code].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                  className="px-3 py-2 text-xs font-bold text-[#0056D2] hover:text-[#00419e] hover:bg-[#F0F5FF] rounded-lg transition-colors"
                >
                  Log In
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
            <div className="site-container py-4">
              {/* Header inside mega-menu: search + quick link */}
              <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-[#e2e8f0]">
                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9BAE]" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search courses or skills..."
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-[#e2e8f0] bg-white text-xs sm:text-sm text-[#1F1F1F] placeholder-[#8C9BAE] focus:outline-none focus:border-[#0056D2] transition-colors"
                  />
                </form>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-[#565656]">
                    Explore verified professional development pathways
                  </span>
                  <Link
                    href="/courses"
                    onClick={() => setIsMegaOpen(false)}
                    className="inline-flex items-center gap-1.5 text-[#0056D2] hover:text-[#00419e] transition-colors"
                  >
                    <span>View All Programmes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* 3-Column Categories & Courses Grid (Compact) */}
              <div className="grid grid-cols-3 gap-6 pt-4 max-h-[46vh] overflow-y-auto pr-2">
                {(showAllCategories ? filteredCategories : filteredCategories.slice(0, 5)).map((cat) => (
                  <div key={cat.id} className="flex flex-col">
                    <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-[#e2e8f0]">
                      <Link
                        href={`/courses?category=${cat.id}`}
                        onClick={() => setIsMegaOpen(false)}
                        className="font-bold text-sm text-[#1F1F1F] hover:text-[#0056D2] transition-colors flex items-center gap-1.5"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[11px] font-normal text-[#8C9BAE]">
                          ({cat.courseCount})
                        </span>
                      </Link>
                      <Link
                        href={`/courses?category=${cat.id}`}
                        onClick={() => setIsMegaOpen(false)}
                        className="text-xs text-[#0056D2] hover:underline font-semibold shrink-0"
                      >
                        See All
                      </Link>
                    </div>

                    <ul className="flex flex-col gap-2">
                      {cat.courses.slice(0, 5).map((course) => {
                        const priceInfo = getCoursePriceDisplay(course, currency);
                        return (
                          <li key={course.id}>
                            <Link
                              href={`/courses/${course.slug || course.id}`}
                              onClick={() => setIsMegaOpen(false)}
                              className="group block p-2 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div className="text-xs font-semibold text-[#1F1F1F] group-hover:text-[#0056D2] line-clamp-1">
                                {course.title}
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-[#565656] mt-1">
                                <span>{course.duration || 'Flexible study'}</span>
                                <span className="font-semibold text-[#0056D2]">
                                  {priceInfo.formatted}
                                </span>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                      {cat.courses.length === 0 && (
                        <li className="text-xs text-[#687587] italic p-2">
                          Programmes coming soon
                        </li>
                      )}
                    </ul>
                  </div>
                ))}

                {/* Additional categories discovery tile if > 5 categories exist */}
                {filteredCategories.length > 5 && !showAllCategories && (
                  <div className="flex flex-col justify-center items-center text-center p-6 rounded-xl border border-dashed border-[#0056D2]/40 bg-white hover:bg-slate-50 transition-colors">
                    <span className="text-xs font-bold text-[#1F1F1F]">
                      +{filteredCategories.length - 5} More Categories Available
                    </span>
                    <p className="text-[11px] text-[#565656] mt-1 mb-3">
                      Explore specialized courses across all engineering disciplines.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAllCategories(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#0056D2] text-white hover:bg-[#00419e] transition-colors shadow-sm"
                    >
                      <span>View All {filteredCategories.length} Categories</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {filteredCategories.length > 5 && showAllCategories && (
                  <div className="flex flex-col justify-center items-center text-center p-6 rounded-xl border border-dashed border-[#e2e8f0] bg-white">
                    <button
                      type="button"
                      onClick={() => setShowAllCategories(false)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-[#0056D2] text-[#0056D2] hover:bg-[#0056D2] hover:text-white transition-colors"
                    >
                      <span>Show First 5 Categories</span>
                      <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                )}
              </div>

              {/* Footer bar of mega-menu */}
              <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#8C9BAE]">
                <span>
                  Showing {showAllCategories ? filteredCategories.length : Math.min(5, filteredCategories.length)} of {filteredCategories.length} categories. All certifications are issued upon completion of coursework and assessments.
                </span>
                <div className="flex items-center gap-4">
                  {filteredCategories.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="font-semibold text-[#0056D2] hover:underline"
                    >
                      {showAllCategories ? 'Collapse Categories' : `View All ${filteredCategories.length} Categories`}
                    </button>
                  )}
                  <Link
                    href="/courses"
                    onClick={() => setIsMegaOpen(false)}
                    className="font-semibold text-[#0056D2] hover:text-[#00419e] flex items-center gap-1"
                  >
                    Browse Complete Catalogue ({categories.reduce((acc, c) => acc + c.courseCount, 0)} courses)
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed top-20 right-0 w-full max-w-sm h-[calc(100vh-5rem)] bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
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
                    onClick={() => setMobileCategoryOpen(mobileCategoryOpen ? null : 'open')}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-[#1F1F1F] font-medium text-[16px]"
                  >
                    <span>Explore Courses</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${mobileCategoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {mobileCategoryOpen && (
                    <div className="pl-4 pr-2 py-2 flex flex-col gap-3 bg-[#F0F5FF] rounded-xl my-1">
                      <Link
                        href="/courses"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs font-bold text-[#0056D2] flex items-center gap-1"
                      >
                        <span>All Courses</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      {categories.map((cat) => (
                        <div key={cat.id} className="flex flex-col gap-1">
                          <Link
                            href={`/courses?category=${cat.id}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-xs font-semibold text-[#1F1F1F]"
                          >
                            {cat.name} ({cat.courseCount})
                          </Link>
                          {cat.courses.slice(0, 3).map((course) => (
                            <Link
                              key={course.id}
                              href={`/courses/${course.slug || course.id}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-[11px] text-[#565656] hover:text-[#0056D2] pl-2 py-0.5 line-clamp-1"
                            >
                              • {course.title}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                <Link
                  href="/contact-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-[16px] ${pathname === '/contact-us' ? 'text-[#0056D2] font-bold bg-[#F0F5FF]' : 'text-[#1F1F1F]'}`}
                >
                  Contact Us
                </Link>
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
                  className="w-full text-center py-2.5 rounded-full border-2 border-[#0056D2] text-[#0056D2] text-sm font-bold hover:bg-[#0056D2] hover:text-white transition-colors"
                >
                  Student &amp; Staff Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
