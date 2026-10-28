'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { SiteFooter } from '@/components/navigation/SiteFooter';
import { CurrencyProvider } from '@/lib/currency';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dashboard pages and login screen manage their own full layouts
  const isDashboard =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/staff') ||
    pathname?.startsWith('/student') ||
    pathname === '/login';

  return (
    <CurrencyProvider>
      {!isDashboard && <SiteHeader />}
      <main id="main-content" className={!isDashboard ? 'min-h-[calc(100vh-80px)]' : ''}>
        {children}
      </main>
      {!isDashboard && <SiteFooter />}
    </CurrencyProvider>
  );
}
