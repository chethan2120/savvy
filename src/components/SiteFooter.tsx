'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Youtube, Twitter, Instagram, ArrowUpRight } from 'lucide-react';
import { defaultSettings, coursesData } from '@/lib/data';
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { NewsletterForm } from './NewsletterForm';

export const SiteFooter: React.FC = () => {
  return (
    <footer className="bg-[#0a0b0c] text-white pt-16 pb-12 border-t border-white/10">
      <div className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          {/* Column 1: Identity & NAP */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center" aria-label="Savvy Training Institute — home">
              <SavvyLogo tone="light" />
            </Link>

            <p className="text-xs text-white/70 leading-relaxed">
              India&apos;s premier institute for Non-Destructive Testing (NDT Level II), QA/QC, Fire & Safety, HVAC, and Revit MEP training with 100% placement support.
            </p>

            <div className="flex flex-col gap-3 text-xs text-white/80 mt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <span>{defaultSettings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-forest shrink-0" />
                <a href={`tel:${defaultSettings.phone_primary}`} className="hover:text-white transition-colors">
                  {defaultSettings.phone_primary}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-forest shrink-0" />
                <a href={`mailto:${defaultSettings.email_primary}`} className="hover:text-white transition-colors">
                  {defaultSettings.email_primary}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Useful Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-white/70">
              <li><Link href="/" className="hover:text-white transition-colors flex items-center gap-1">Home</Link></li>
              <li><Link href="/about-us" className="hover:text-white transition-colors flex items-center gap-1">About Us</Link></li>
              <li><Link href="/course" className="hover:text-white transition-colors flex items-center gap-1">All Courses</Link></li>
              <li><Link href="/admission" className="hover:text-white transition-colors flex items-center gap-1">Admission & Fees</Link></li>
              <li><Link href="/placement" className="hover:text-white transition-colors flex items-center gap-1">Placements</Link></li>
              <li><Link href="/verify-certificate" className="hover:text-white transition-colors flex items-center gap-1">Verify / Regenerate Certificate</Link></li>
              <li><Link href="/student" className="hover:text-white transition-colors flex items-center gap-1">Student Portal</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1">Latest Articles</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors flex items-center gap-1">Student Gallery</Link></li>
              <li><Link href="/contact-us" className="hover:text-white transition-colors flex items-center gap-1">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Course Programs */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Programs
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs text-white/70">
              {coursesData.map((course) => (
                <li key={course.id}>
                  <Link href={`/course/${course.slug}`} className="hover:text-white transition-colors flex items-center justify-between group">
                    <span className="group-hover:translate-x-0.5 transition-transform">{course.title}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Subscribe Newsletter
            </h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Sign up for our latest news, batch announcements & industry articles. No spam.
            </p>

            <NewsletterForm />

            <div className="flex items-center gap-3 pt-2">
              <a href={defaultSettings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-full bg-white/5 hover:bg-forest text-white/80 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={defaultSettings.youtube_url} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="p-2 rounded-full bg-white/5 hover:bg-forest text-white/80 hover:text-white transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href={defaultSettings.twitter_url} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2 rounded-full bg-white/5 hover:bg-forest text-white/80 hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href={defaultSettings.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 rounded-full bg-white/5 hover:bg-forest text-white/80 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar — copyright left, links right (right padding keeps
            "Admin Portal" clear of the floating WhatsApp button), credit line
            centered on its own row underneath. */}
        <div className="pt-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pr-0 lg:pr-24 text-xs text-white/50">
            <p>© {new Date().getFullYear()} Savvy Training Institute. All Rights Reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/admin" className="hover:text-white transition-colors">Admin Portal</Link>
            </div>
          </div>
          <p className="text-center text-xs text-white/50">
            Design and Developed by{' '}
            <a
              href="https://webnxt.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/80 hover:text-white transition-colors"
            >
              WebNxt
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
