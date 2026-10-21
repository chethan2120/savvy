'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** 'light' for use over dark hero media. */
  tone?: 'dark' | 'light';
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, tone = 'dark' }) => {
  const light = tone === 'light';

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-xs py-2 ${
        light ? 'text-white/70' : 'text-muted-foreground'
      }`}
    >
      <Link
        href="/"
        className={`flex items-center gap-1 transition-colors ${
          light ? 'hover:text-white' : 'hover:text-foreground'
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className={`w-3 h-3 shrink-0 ${light ? 'text-white/40' : 'text-border'}`} />
          {item.href ? (
            <Link
              href={item.href}
              className={`transition-colors ${light ? 'hover:text-white' : 'hover:text-foreground'}`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`font-medium truncate max-w-[200px] ${light ? 'text-white' : 'text-foreground'}`}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
