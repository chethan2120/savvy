'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AnnouncementBanner } from '@/lib/types';

interface AnnouncementBarProps {
  banner?: AnnouncementBanner;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ banner }) => {
  const barRef = useRef<HTMLDivElement>(null);
  const isVisible = Boolean(banner && banner.is_active);

  // Publish the bar's height so full-viewport heroes below it can subtract the
  // non-sticky chrome and still land inside a single frame.
  useEffect(() => {
    const root = document.documentElement;
    const node = barRef.current;
    if (!isVisible || !node) {
      root.style.setProperty('--announce-h', '0px');
      return;
    }
    const setVar = () => root.style.setProperty('--announce-h', `${node.offsetHeight}px`);
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(node);
    return () => {
      ro.disconnect();
      root.style.setProperty('--announce-h', '0px');
    };
  }, [isVisible]);

  if (!banner || !isVisible) return null;

  return (
    <div ref={barRef} className="bg-[#0a0b0c] text-white py-2.5 px-4 text-xs font-medium border-b border-white/10">
      <div className="site-container flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-2.5 py-0.5 text-[10px] tracking-wide uppercase text-white font-semibold">
            <Sparkles className="w-3 h-3" /> Announcement
          </span>
          <span className="text-white/90 truncate">{banner.message}</span>
        </div>
        {banner.link_url && (
          <Link
            href={banner.link_url}
            className="hidden sm:inline-flex items-center gap-1 text-periwinkle hover:text-white transition-colors shrink-0 underline underline-offset-4"
          >
            {banner.link_text || 'Learn more'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
};
