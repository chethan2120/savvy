'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle, Mail, MapPin, Phone, Globe, User } from 'lucide-react';
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { getCachedCategories } from '@/lib/api-cache';
import { useCurrency, SUPPORTED_CURRENCIES, CURRENCY_CONFIGS, CurrencyCode } from '@/lib/currency';

interface CategoryItem {
  id: string;
  name: string;
  courseCount: number;
}

export function SiteFooter() {
  const { currency, setCurrency } = useCurrency();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setStatus('success');
        setMessage(data.message || 'Thank you for subscribing to our newsletter.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Subscription could not be processed.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again later.');
    }
  };

  return (
    <footer className="bg-white text-[#1F1F1F] pt-16 pb-10 border-t border-[#e2e8f0]">
      <div className="site-container">
        {/* 4-Column Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14 border-b border-[#e2e8f0]">
          {/* Column 1: Institute Identity */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-white shadow-xs border border-[#e2e8f0] p-0.5 flex items-center justify-center shrink-0">
                <SavvyLogo markClassName="h-full w-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-[#1F1F1F] leading-tight">
                  Savvy Training Institute
                </span>
                <span className="text-xs sm:text-[13px] font-bold text-[#0056D2] tracking-wider uppercase">
                  Technical Certification
                </span>
              </div>
            </div>

            <p className="text-sm text-[#565656] leading-relaxed mt-1 font-normal">
              Providing rigorous, industry-accredited technical training in Non-Destructive Testing (NDT), QA/QC Inspection, Health &amp; Safety, and Advanced MEP Engineering.
            </p>

            <div className="flex flex-col gap-2.5 pt-2 text-sm text-[#565656]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0056D2] shrink-0 mt-0.5" />
                <span>Training Centre, Bengaluru, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#0056D2] shrink-0" />
                <span>+91 90000 12345</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#0056D2] shrink-0" />
                <span>admissions@savvytraining.example</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#1F1F1F]">
              Quick Navigation
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[#565656] mt-1 font-normal">
              <li>
                <Link href="/" className="hover:text-[#0056D2] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-[#0056D2] transition-colors">
                  Explore Courses
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-[#0056D2] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="hover:text-[#0056D2] transition-colors">
                  Technical Insights &amp; Blogs
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-[#0056D2] transition-colors">
                  Contact Us &amp; Enquiries
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#0056D2] transition-colors">
                  Student &amp; Staff Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Course Categories (Dynamic from Backend) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#1F1F1F]">
              Course Categories
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[#565656] mt-1 font-normal">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/courses?category=${cat.id}`}
                    className="hover:text-[#0056D2] transition-colors flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-[#0056D2] font-bold">({cat.courseCount})</span>
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-sm text-[#565656]/60">Loading categories...</li>
              )}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#1F1F1F]">
              Stay Informed
            </h3>
            <p className="text-sm text-[#565656] leading-relaxed mt-1 font-normal">
              Subscribe for upcoming batch schedules, industry code updates, and professional certification notices.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5 mt-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-[#e2e8f0] text-sm text-[#1F1F1F] placeholder-[#8C9BAE] focus:outline-none focus:border-[#0056D2] focus:ring-1 focus:ring-[#0056D2] transition-colors shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#0056D2] text-white text-sm font-bold hover:bg-[#00419e] transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{status === 'loading' ? 'Subscribing...' : 'Subscribe'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              {status === 'success' && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Credits Bar: Left Copyright, Center WebNxt Watermark, Right Currency & Login */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#565656]">
          {/* Left: Copyright */}
          <div className="text-center md:text-left order-2 md:order-1">
            &copy; {new Date().getFullYear()} Savvy Training Institute. All rights reserved.
          </div>

          {/* Center: WebNxt Watermark */}
          <div className="text-center order-1 md:order-2 font-medium">
            Designed and Maintained by{' '}
            <a
              href="https://webnxt.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#0056D2] hover:underline"
            >
              WebNxt
            </a>
          </div>

          {/* Right: Currency Selector (Phone & Laptop) + Portal Login (Last Place) */}
          <div className="flex items-center gap-3 order-3">
            {/* Currency Selector (Works for phone & laptop) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2e8f0] bg-white text-xs font-semibold text-[#1F1F1F] shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-[#0056D2]" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                aria-label="Currency preference"
                className="bg-transparent text-xs font-semibold text-[#1F1F1F] border-none focus:outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {CURRENCY_CONFIGS[code].label}
                  </option>
                ))}
              </select>
            </div>

            {/* Login Option */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-bold transition-all shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
