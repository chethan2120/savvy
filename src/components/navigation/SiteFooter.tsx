'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { onlineCourses } from '@/lib/academy-content';

export function SiteFooter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
              Accreditation, teaching qualifications and professional courses by Lisa Zaman.
            </p>
            <p className="text-xs text-[#687587]">
              A postal address, phone number and email address are not published on the source website. Use the contact form to get in touch.
            </p>
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
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-[#0056D2] transition-colors">
                  Contact Us
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
              {onlineCourses.map((course) => (
                <li key={course.slug}>
                  <Link href={`/courses/${course.slug}`} className="hover:text-[#0056D2] transition-colors">
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#1F1F1F]">
              Stay Informed
            </h3>
            <p className="text-sm text-[#565656] leading-relaxed mt-1 font-normal">
              Subscribe for updates from Savvy Training Institute.
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
            {/* Login Option */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#0056D2] px-5 py-3 text-base font-semibold text-white hover:bg-[#00419e]"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
