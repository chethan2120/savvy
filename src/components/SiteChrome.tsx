'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { defaultBanner } from '@/lib/data';

/**
 * Marketing chrome — announcement bar, header, footer, WhatsApp button.
 *
 * The student and admin portals are workspaces, not marketing pages: the site
 * nav there only offers ways to leave, and the floating WhatsApp button sat on
 * top of portal content. Both portals render bare, with their own header strip
 * and sign-out control.
 */
const PORTAL_ROUTES = ['/student', '/admin', '/staff'];

export const SiteChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() ?? '/';
  const isLogin = pathname === '/login';
  const isPortal = PORTAL_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isPortal) {
    return (
      <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
        {children}
      </main>
    );
  }

  return (
    <>
      {!isLogin && <AnnouncementBar banner={defaultBanner} />}
      {!isLogin && <SiteHeader />}
      <main id="main-content" tabIndex={-1} className="flex-grow focus:outline-none">
        {children}
      </main>
      {!isLogin && <SiteFooter />}
      {!isLogin && <WhatsAppButton />}
    </>
  );
};
