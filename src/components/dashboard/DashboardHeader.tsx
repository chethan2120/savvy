'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LogOut, Settings, UserRound } from 'lucide-react';
import { SavvyLogo } from '@/components/brand/SavvyLogo';

const homes = { admin: '/admin', staff: '/staff', student: '/student' } as const;

export function DashboardHeader({
  role,
  fallbackName,
  onLogout,
  onProfile,
  onSettings,
}: {
  role: 'admin' | 'staff' | 'student';
  fallbackName?: string | null;
  onLogout: () => void;
  onProfile: () => void;
  onSettings: () => void;
}) {
  const [name, setName] = useState(fallbackName || '');
  const [photo, setPhoto] = useState(false);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled && body?.account?.fullName) setName(body.account.fullName);
        if (!cancelled && body?.account?.hasPhoto) setPhoto(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (fallbackName) setName(fallbackName);
  }, [fallbackName]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const subtitle = role === 'admin'
    ? "Here's an overview of your institute today."
    : role === 'staff'
      ? "Here's your teaching and attendance overview."
      : 'Ready to continue your learning today?';
  const initials = (name || 'Account')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'A';

  return (
    <header className="bg-white border-b border-border">
      <div className="site-container flex items-center justify-between gap-4 py-4">
        <Link href={homes[role]} aria-label="Dashboard home" className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">
          <SavvyLogo />
        </Link>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
            onClick={() => setOpen((value) => !value)}
            className="w-11 h-11 rounded-full bg-forest text-white text-sm font-semibold hover:bg-forest/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest overflow-hidden"
          >
            {photo ? <img src="/api/photos" alt="" className="h-full w-full object-cover" /> : initials}
          </button>
          {open && (
            <div role="menu" className="absolute right-0 z-30 mt-2 w-56 rounded-xl border border-border bg-white py-1 shadow-lg">
              <MenuItem icon={<UserRound className="w-4 h-4" />} label="My Profile" onClick={() => { setOpen(false); onProfile(); }} />
              <MenuItem icon={<Settings className="w-4 h-4" />} label="Account Settings" onClick={() => { setOpen(false); onSettings(); }} />
              <MenuItem icon={<LogOut className="w-4 h-4" />} label="Logout" onClick={() => { setOpen(false); onLogout(); }} />
            </div>
          )}
        </div>
      </div>
      <div className="site-container pb-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">{greeting}, {name || 'there'}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest">
      {icon}
      {label}
    </button>
  );
}
