'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Award, BookOpen, Calendar, ChevronDown, FolderTree, GraduationCap, LogOut, Mail,
  Menu, Search, Settings, ShieldCheck, UserRound, Users, X,
} from 'lucide-react';
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { signOutPortal } from '@/lib/portal-auth';

type Counts = {
  registrations: number;
  applications: number;
  enrolments: number;
};

const groups = [
  {
    key: 'people',
    label: 'People',
    icon: Users,
    items: [
      ['accounts', 'User Management'],
      ['approvals', 'Students'],
      ['staff', 'Staff'],
    ],
  },
  {
    key: 'admissions',
    label: 'Admissions',
    icon: GraduationCap,
    items: [
      ['registrations', 'Registration Requests'],
      ['applications', 'Applications'],
      ['students', 'Enrolments'],
    ],
  },
  {
    key: 'learning',
    label: 'Learning',
    icon: BookOpen,
    items: [
      ['courseAdmin', 'Courses'],
      ['programs', 'Certified Programmes'],
      ['materials', 'Course Material'],
      ['attendance', 'Attendance'],
    ],
  },
  {
    key: 'credentials',
    label: 'Credentials',
    icon: Award,
    items: [['certificates', 'Certificates']],
  },
  {
    key: 'communication',
    label: 'Communication',
    icon: Mail,
    items: [
      ['contacts', 'Contact Info'],
      ['website', 'Website'],
      ['community', 'Community'],
      ['blogs', 'Articles'],
    ],
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: FolderTree,
    items: [['categories', 'Categories']],
  },
  {
    key: 'administration',
    label: 'Settings',
    icon: ShieldCheck,
    items: [
      ['settings', 'Account Settings'],
      ['profile', 'Profile Settings'],
      ['reports', 'Reports'],
      ['audit', 'Audit Logs'],
    ],
  },
] as const;

export function AdminChrome({
  active,
  onSelect,
  children,
}: {
  active: string;
  onSelect?: (tab: string) => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    people: true, admissions: true, learning: true, credentials: true, communication: true, categories: true, administration: true,
  });
  const [counts, setCounts] = useState<Counts>({ registrations: 0, applications: 0, enrolments: 0 });
  const [query, setQuery] = useState('');
  const [now, setNow] = useState<Date | null>(null);
  const [accountMenu, setAccountMenu] = useState(false);
  const [accountLabel, setAccountLabel] = useState({ name: 'Super Admin', email: '' });
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenu) return;
    const close = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) setAccountMenu(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountMenu(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountMenu]);

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((response) => response.json())
      .then((body) => {
        const account = body?.account;
        if (!account) return;
        setAccountLabel({
          name: account.role === 'admin' ? 'Super Admin' : (account.fullName || 'Account'),
          email: account.email || '',
        });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/workspace?resource=overview', { cache: 'no-store' }).then((response) => response.json()),
      fetch('/api/registrations', { cache: 'no-store' }).then((response) => response.json()),
    ]).then(([overview, registrations]) => {
      setCounts({
        registrations: Number(registrations?.pending ?? overview?.pendingRegistrations ?? 0),
        applications: Number(overview?.applicationsAwaiting ?? 0),
        enrolments: Number(overview?.pendingRequests ?? 0),
      });
    }).catch(() => undefined);
  }, [active]);

  const go = (tab: string) => {
    setOpen(false);
    if (onSelect) onSelect(tab);
    else router.push(`/admin#${tab}`);
  };

  const badge = (tab: string) => {
    const value = tab === 'registrations' ? counts.registrations : tab === 'applications' ? counts.applications : tab === 'students' ? counts.enrolments : 0;
    if (!value) return null;
    return <span className="rounded-full bg-[#F8EDF1] px-1.5 py-0.5 text-[10px] font-bold text-[#641B38]">{value}</span>;
  };

  return (
    <div className="account-theme admin-dashboard flex min-h-screen flex-col bg-[#FCF8F7]">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-[#EAD9E0] bg-white px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-lg border border-[#EAD9E0] p-2 lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((value) => !value)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/admin" className="flex items-center gap-2"><SavvyLogo /></Link>
        </div>
        <div className="relative mx-2 hidden max-w-xl flex-1 sm:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B5A60]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records, courses, applications, students..." className="w-full rounded-xl border border-[#EAD9E0] bg-[#FCF8F7] py-2 pl-10 pr-3 text-xs" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#EAD9E0] bg-[#FCF8F7] px-3 py-1.5 text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5 text-[#B83268]" />
            <span>{now ? new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(now) : ''}</span>
          </div>
          <div className="relative" ref={accountMenuRef}>
            <button type="button" aria-haspopup="menu" aria-expanded={accountMenu} aria-label="Account menu" onClick={() => setAccountMenu((value) => !value)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#641B38] text-xs font-bold text-white">SA</button>
            {accountMenu && (
              <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[#EAD9E0] bg-white shadow-xl">
                <div className="px-4 py-3">
                  <p className="text-sm font-bold text-[#30262B]">{accountLabel.name}</p>
                  {accountLabel.email && <p className="mt-0.5 text-xs text-[#6B5A60]">{accountLabel.email}</p>}
                </div>
                <div className="border-t border-[#EAD9E0]" />
                <button type="button" role="menuitem" className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#30262B] hover:bg-[#F8EDF1]" onClick={() => { setAccountMenu(false); go('profile'); }}>
                  <UserRound className="h-4 w-4" /> My Profile
                </button>
                <button type="button" role="menuitem" className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#30262B] hover:bg-[#F8EDF1]" onClick={() => { setAccountMenu(false); go('settings'); }}>
                  <Settings className="h-4 w-4" /> Account Settings
                </button>
                <div className="border-t border-[#EAD9E0]" />
                <button type="button" role="menuitem" className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-[#B83268] hover:bg-[#F8EDF1]" onClick={() => { setAccountMenu(false); signOutPortal().then(() => window.location.replace('/login')); }}>
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="relative flex flex-1">
        {open && <button type="button" aria-label="Close menu" className="fixed inset-0 top-16 z-20 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}
        <aside className={`${open ? 'fixed inset-y-16 left-0 z-30 flex w-72 shadow-2xl' : 'hidden'} lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 flex-col overflow-y-auto border-r border-[#EAD9E0] bg-white`}>
          <div className="flex flex-col gap-1 p-3">
            <button type="button" onClick={() => go('overview')} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold ${active === 'overview' ? 'bg-[#641B38] text-white' : 'hover:bg-[#F8EDF1]'}`}>
              <ShieldCheck className="h-4 w-4" /> Overview
            </button>
            {groups.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.key} className="mt-2">
                  <button type="button" onClick={() => setExpanded((current) => ({ ...current, [group.key]: !current[group.key] }))} className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#6B5A60]">
                    <span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5" />{group.label}</span>
                    <ChevronDown className={`h-3.5 w-3.5 ${expanded[group.key] ? '' : '-rotate-90'}`} />
                  </button>
                  {expanded[group.key] && (
                    <div className="mt-1 flex flex-col gap-0.5 pl-2">
                      {group.items.map(([tab, label]) => (
                        <button key={tab} type="button" onClick={() => go(tab)} className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium ${active === tab ? 'bg-[#641B38]/10 font-bold text-[#641B38]' : 'hover:bg-[#F8EDF1]'}`}>
                          <span>{label}</span>
                          {badge(tab)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-auto border-t border-[#EAD9E0] p-3 text-center text-[11px] text-[#6B5A60]">Designed and Maintained by WebNxt</p>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
