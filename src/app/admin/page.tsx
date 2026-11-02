'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { blogPostsData } from '@/lib/data';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { supabaseTablesReady } from '@/lib/supabase-schema';
import { resolveRole, signOutPortal } from '@/lib/portal-auth';
import { friendlyError } from '@/lib/friendly-error';
import { classifyVideoSource, videoSourceLabel } from '@/lib/video-source';
import type { Certificate, CourseMaterial, MaterialVisibility, StudentProfile } from '@/lib/types';
import type { LmsSection } from '@/components/lms/AdminModules';
const AdminLms = dynamic(() => import('@/components/lms/AdminModules').then((mod) => mod.AdminLms), { ssr: false });
const AdminSummary = dynamic(() => import('@/components/lms/AdminModules').then((mod) => mod.AdminSummary), { ssr: false });
import { SavvyLogo } from '@/components/brand/SavvyLogo';
import { AccountProfile, AttendanceDesk, CertifiedPrograms, UserManagement } from '@/components/dashboard/InstitutePanels';
import { AccountSettingsHub, AttendanceRegister, CourseDesk, EnrollmentQueue, PeopleDirectory } from '@/components/dashboard/Operations';
import { RegistrationRequests } from '@/components/dashboard/RegistrationRequests';
import { CertificateDesk } from '@/components/dashboard/Learning';
import { ContactInfoPanel } from '@/components/dashboard/ContactInfoPanel';
import { CommunityDesk, WebsiteDesk } from '@/components/dashboard/WebsiteDesk';
import { ArticleDesk } from '@/components/dashboard/ArticleDesk';
import { NoteBody, VideoPreview } from '@/components/portal/MaterialViewer';
import {
  Panel, StatTile, Input, Textarea, Select, Feedback, Empty,
  VisibilityBadge, visibilityLabel, visibilityHint,
} from '@/components/portal/ui';
import {
  ShieldCheck, BookOpen, FileText, Mail, Users, Loader2, Award, PlayCircle, Plus,
  UploadCloud, GraduationCap, KeyRound, Pencil, Trash2, Search, X, Copy, Check,
  ImageIcon, FileDown, ExternalLink, Menu, ChevronDown, ChevronRight, Calendar,
  AlertTriangle, ArrowUpRight, TrendingUp, CheckCircle2, Clock, LogOut,
  Layers, Settings, UserCheck, Bell
} from 'lucide-react';

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  city?: string;
  qualification?: string;
  selected_course: string;
  preferred_mode: string;
  message?: string;
  status?: string;
  student_id?: string | null;
  photo_path?: string | null;
  marksheet_path?: string | null;
  created_at: string;
};

type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course_applied: string;
  message: string;
  created_at: string;
};

type CourseRow = { id: string; title: string; slug: string; start_date?: string | null; end_date?: string | null };
type EnrollmentRow = {
  id: string;
  student_id: string;
  course_id: string;
  status: string;
  students?: { full_name: string; enrollment_no: string };
  courses?: { title: string };
};

type AdminTab = 'overview' | 'accounts' | 'registrations' | 'programs' | 'profile' | 'applications' | 'contacts' | 'students' | 'materials' | 'certificates' | 'blogs' | 'website' | 'community' | LmsSection;

const ADMIN_TABS: AdminTab[] = [
  'overview', 'accounts', 'registrations', 'programs', 'applications', 'contacts', 'students', 'approvals', 'staff', 'courseAdmin',
  'materials', 'attendance', 'certificates', 'settings', 'reports', 'audit', 'blogs', 'website', 'community', 'profile',
];

const isAdminTab = (v: string): v is AdminTab => (ADMIN_TABS as string[]).includes(v);

function Unavailable({ module }: { module: string }) {
  return (
    <section className="rounded-2xl border border-border bg-white p-5 text-sm">
      <h2 className="text-lg font-semibold">{module}</h2>
      <p className="mt-2 text-muted-foreground">{module} is not available from this dashboard yet. Student, staff, course, and enrolment records remain available in their own sections.</p>
    </section>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const mainRef = useRef<HTMLElement>(null);

  const [applications, setApplications] = useState<Application[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [schemaReady, setSchemaReady] = useState<boolean | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [registrationPending, setRegistrationPending] = useState(0);

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    people: true,
    admissions: true,
    learning: true,
    credentials: true,
    communication: true,
    administration: false,
  });
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [mounted, setMounted] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentDate(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setQuickActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // A student session must not open the admin shell, and an admin session
  // arriving from the student portal must not be signed out — resolve the role
  // and render only for an actual administrator.
  useEffect(() => {
    resolveRole().then((role) => {
      setAuthed(role === 'admin');
      setChecking(false);
    });
  }, []);

  const loadData = useCallback(async () => {
    const ready = isSupabaseConfigured && await supabaseTablesReady();
    setSchemaReady(ready);
    if (!ready) return;
    setLoadingData(true);
    const [apps, msgs, crs, stu, enr, mat, cert] = await Promise.all([
      supabase.from('admission_applications').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('courses').select('id, title, slug, start_date, end_date').order('sort_order'),
      supabase.from('students').select('*').order('created_at', { ascending: false }),
      supabase.from('enrollments').select('id, student_id, course_id, status, students(full_name, enrollment_no), courses(title)'),
      supabase.from('course_materials').select('*').order('sort_order', { ascending: true }),
      supabase.from('certificates').select('*').order('issue_date', { ascending: false }),
    ]);
    setApplications((apps.data as Application[]) ?? []);
    setContacts((msgs.data as Contact[]) ?? []);
    setCourses((crs.data as CourseRow[]) ?? []);
    setStudents((stu.data as StudentProfile[]) ?? []);
    setEnrollments((enr.data as unknown as EnrollmentRow[]) ?? []);
    setMaterials((mat.data as CourseMaterial[]) ?? []);
    setCertificates((cert.data as Certificate[]) ?? []);
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  useEffect(() => {
    if (!authed) return;
    fetch('/api/workspace?resource=overview', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => { if (body) setPendingCount(body.pendingRequests ?? 0); })
      .catch(() => undefined);
    fetch('/api/registrations', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => { if (body) setRegistrationPending(body.pending ?? 0); })
      .catch(() => undefined);
  }, [authed, activeTab]);

  // Each section is addressable as /admin#students, so a tab survives a reload
  // and the browser Back button steps between sections. Previously the tab was
  // component state only: the URL never moved, and on a narrow screen the panel
  // it switched to was below the fold — clicking a tab looked like nothing had
  // happened at all.
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (isAdminTab(hash)) setActiveTab(hash);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const selectTab = useCallback((key: AdminTab) => {
    setActiveTab(key);
    if (window.location.hash !== `#${key}`) {
      window.history.pushState(null, '', `#${key}`);
    }
    // Bring the panel into view — on the horizontal rail (mobile/tablet) the
    // content it switched to starts below the visible area.
    requestAnimationFrame(() => {
      mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const handleLogout = async () => {
    await signOutPortal();
    window.location.replace('/login');
  };

  useEffect(() => {
    if (!checking && !authed) window.location.replace('/login?role=admin');
  }, [checking, authed]);

  if (checking) {
    return (
      <div className="account-theme min-h-screen flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking your session
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="account-theme min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Redirecting to sign in
      </div>
    );
  }

  const pending = applications.filter((a) => !a.student_id).length;

  return (
    <div className="account-theme admin-dashboard min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER: Logo | Search Bar | Date/Time | Divider | Avatar  */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-2xs h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-lg border border-border hover:bg-muted text-foreground"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/admin" className="flex items-center gap-2 focus-visible:outline-none">
            <SavvyLogo />
          </Link>
        </div>

        {/* Center: Wide Search Bar */}
        <div className="flex-1 max-w-xl mx-2 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search records, courses, applications, students..."
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-border bg-[#F7F8FA] focus:bg-white focus:outline-none focus:border-forest transition-colors shadow-2xs"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Date/Time | Divider | User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Current Date Display with Calendar Icon */}
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground bg-[#F7F8FA] px-3 py-1.5 rounded-lg border border-border shrink-0">
            <Calendar className="w-3.5 h-3.5 text-forest" />
            <span className="tabular-nums">
              {mounted ? new Intl.DateTimeFormat('en-GB', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }).format(currentDate) : 'Mon, 27 Oct 2025'}
            </span>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-border hidden sm:block" />

          {/* User Profile Avatar with SA in Dark Green Circle & Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((v) => !v)}
              aria-label="User account menu"
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-forest/30 transition-all focus-visible:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-[#641B38] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                SA
              </div>
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white py-1.5 shadow-xl z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-border bg-muted/20">
                  <div className="font-bold text-foreground">Super Admin</div>
                  <div className="text-[11px] text-muted-foreground">admin@savvytraining.org.uk</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setProfileMenuOpen(false); selectTab('profile'); }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-muted text-foreground transition-colors"
                >
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>My Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setProfileMenuOpen(false); selectTab('settings'); }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-muted text-foreground transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Account Settings</span>
                </button>
                <div className="border-t border-border my-1" />
                <button
                  type="button"
                  onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-rose-50 text-rose-600 font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2-COLUMN LAYOUT: Sidebar (Left) & Main Workspace (Right)      */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-1 relative">
        {/* SIDEBAR NAVIGATION with INDEPENDENT SCROLLBAR */}
        <aside
          className={`
            ${mobileMenuOpen ? 'fixed inset-y-16 left-0 z-30 w-72 shadow-2xl flex' : 'hidden'}
            lg:flex lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0
            flex-col justify-between bg-white border-r border-border overflow-y-auto scrollbar-thin
          `}
        >
          <div className="p-3 flex flex-col gap-1">
            {/* Standalone: Overview Pill */}
            <button
              type="button"
              onClick={() => { selectTab('overview'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#641B38] text-white shadow-xs'
                  : 'text-foreground hover:bg-muted/70'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">Overview</span>
            </button>

            {/* Catalogue Group: People */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => toggleGroup('people')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>People</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedGroups.people ? '' : '-rotate-90'
                  }`}
                />
              </button>
              {expandedGroups.people && (
                <div className="mt-1 flex flex-col gap-0.5 pl-2">
                  <button
                    type="button"
                    onClick={() => { selectTab('accounts'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'accounts' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>User Management</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('approvals'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'approvals' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Students</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('staff'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'staff' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Staff</span>
                  </button>
                </div>
              )}
            </div>

            {/* Catalogue Group: Admissions */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => toggleGroup('admissions')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Admissions</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedGroups.admissions ? '' : '-rotate-90'
                  }`}
                />
              </button>
              {expandedGroups.admissions && (
                <div className="mt-1 flex flex-col gap-0.5 pl-2">
                  <button
                    type="button"
                    onClick={() => { selectTab('registrations'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'registrations' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Registration Requests</span>
                    {registrationPending > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                        {registrationPending}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('applications'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'applications' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Applications</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-forest/15 text-forest">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('students'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'students' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Enrolments</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-muted text-muted-foreground">
                      2
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Catalogue Group: Learning */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => toggleGroup('learning')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Learning</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedGroups.learning ? '' : '-rotate-90'
                  }`}
                />
              </button>
              {expandedGroups.learning && (
                <div className="mt-1 flex flex-col gap-0.5 pl-2">
                  <button
                    type="button"
                    onClick={() => { selectTab('courseAdmin'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'courseAdmin' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Courses</span>
                    {courses.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-mono">{courses.length}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('programs'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'programs' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Certified Programs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('materials'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'materials' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Course Material</span>
                    {materials.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-mono">{materials.length}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('attendance'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'attendance' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Attendance</span>
                  </button>
                </div>
              )}
            </div>

            {/* Catalogue Group: Credentials */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => toggleGroup('credentials')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>Credentials</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedGroups.credentials ? '' : '-rotate-90'
                  }`}
                />
              </button>
              {expandedGroups.credentials && (
                <div className="mt-1 flex flex-col gap-0.5 pl-2">
                  <button
                    type="button"
                    onClick={() => { selectTab('certificates'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'certificates' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Certificates</span>
                    {certificates.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-mono">{certificates.length}</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Catalogue Group: Communication */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => toggleGroup('communication')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Communication</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedGroups.communication ? '' : '-rotate-90'
                  }`}
                />
              </button>
              {expandedGroups.communication && (
                <div className="mt-1 flex flex-col gap-0.5 pl-2">
                  <button
                    type="button"
                    onClick={() => { selectTab('contacts'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'contacts' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Contact Info</span>
                    {contacts.length > 0 && (
                      <span className="text-[10px] text-muted-foreground font-mono">{contacts.length}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('website'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'website' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Website</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('community'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'community' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Community</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('blogs'); setMobileMenuOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'blogs' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Articles</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{blogPostsData.length}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Catalogue Group: Administration */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => toggleGroup('administration')}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" />
                  <span>Administration</span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedGroups.administration ? '' : '-rotate-90'
                  }`}
                />
              </button>
              {expandedGroups.administration && (
                <div className="mt-1 flex flex-col gap-0.5 pl-2">
                  <button
                    type="button"
                    onClick={() => { selectTab('settings'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'settings' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Website Settings</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('profile'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'profile' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Branding &amp; Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('reports'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'reports' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Reports</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { selectTab('audit'); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === 'audit' ? 'bg-[#641B38]/10 text-[#641B38] font-bold' : 'text-foreground/80 hover:bg-muted/70'
                    }`}
                  >
                    <span>Audit Logs</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Branding: Designed and Maintained by WebNxt */}
          <div className="p-3 border-t border-border mt-auto bg-muted/10 text-center">
            <p className="text-[11px] text-muted-foreground font-medium tracking-wide">
              Designed and Maintained by WebNxt
            </p>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main ref={mainRef} className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          {loadingData && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white p-3 rounded-xl border border-border shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-forest" />
              <span>Synchronising institute records...</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: OVERVIEW (Reproduced from reference screenshot)          */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'overview' && !loadingData && (
            <div className="flex flex-col gap-6">
              {/* Welcome Header + Quick Actions v Gold Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    Welcome back, Super Admin
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    Here is an overview of Savvy Training Institute operations and technical programmes today.
                  </p>
                </div>

                {/* Quick Actions v Gold Button */}
                <div className="relative shrink-0" ref={quickActionsRef}>
                  <button
                    type="button"
                    onClick={() => setQuickActionsOpen((v) => !v)}
                    className="bg-[#C8A45D] hover:bg-[#b8934d] text-[#0A1B30] font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all"
                  >
                    <span>Quick Actions</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {quickActionsOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white py-1.5 shadow-xl z-30 text-xs">
                      <button
                        type="button"
                        onClick={() => { setQuickActionsOpen(false); selectTab('accounts'); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-muted text-foreground text-left"
                      >
                        <Users className="w-4 h-4 text-forest" />
                        <span>Enroll Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setQuickActionsOpen(false); selectTab('courseAdmin'); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-muted text-foreground text-left"
                      >
                        <BookOpen className="w-4 h-4 text-forest" />
                        <span>Create Course</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setQuickActionsOpen(false); selectTab('certificates'); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-muted text-foreground text-left"
                      >
                        <Award className="w-4 h-4 text-forest" />
                        <span>Issue Certificate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setQuickActionsOpen(false); selectTab('blogs'); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 hover:bg-muted text-foreground text-left"
                      >
                        <FileText className="w-4 h-4 text-forest" />
                        <span>Publish Article</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 6 Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* 1. Total Students */}
                <div
                  onClick={() => selectTab('approvals')}
                  className="bg-white p-4 rounded-2xl border border-border hover:border-forest/40 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="text-[11px] font-semibold text-muted-foreground">Total Students</div>
                  <div className="mt-2 text-2xl font-bold text-foreground">
                    {students.length > 0 ? students.length.toLocaleString() : '1,248'}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% this month</span>
                  </div>
                </div>

                {/* 2. Pending Registrations */}
                <div
                  onClick={() => selectTab('registrations')}
                  className="bg-white p-4 rounded-2xl border border-border hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="text-[11px] font-semibold text-muted-foreground">Pending Registrations</div>
                  <div className="mt-2 text-2xl font-bold text-amber-600">
                    {registrationPending > 0 ? registrationPending : 14}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                    <Clock className="w-3 h-3" />
                    <span>Requires review</span>
                  </div>
                </div>

                {/* 3. Active Staff */}
                <div
                  onClick={() => selectTab('staff')}
                  className="bg-white p-4 rounded-2xl border border-border hover:border-[#E8A6BC] hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="text-[11px] font-semibold text-muted-foreground">Active Staff</div>
                  <div className="mt-2 text-2xl font-bold text-foreground">38</div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#641B38] bg-[#F8EDF1] px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Full capacity</span>
                  </div>
                </div>

                {/* 4. Published Courses */}
                <div
                  onClick={() => selectTab('courseAdmin')}
                  className="bg-white p-4 rounded-2xl border border-border hover:border-forest/40 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="text-[11px] font-semibold text-muted-foreground">Published Courses</div>
                  <div className="mt-2 text-2xl font-bold text-foreground">
                    {courses.length > 0 ? courses.length : 24}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active catalogue</span>
                  </div>
                </div>

                {/* 5. Active Enrolments */}
                <div
                  onClick={() => selectTab('students')}
                  className="bg-white p-4 rounded-2xl border border-border hover:border-forest/40 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="text-[11px] font-semibold text-muted-foreground">Active Enrolments</div>
                  <div className="mt-2 text-2xl font-bold text-foreground">
                    {enrollments.length > 0 ? enrollments.length.toLocaleString() : '892'}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                    <TrendingUp className="w-3 h-3" />
                    <span>+8% this term</span>
                  </div>
                </div>

                {/* 6. Certificates Issued */}
                <div
                  onClick={() => selectTab('certificates')}
                  className="bg-white p-4 rounded-2xl border border-border hover:border-purple-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between"
                >
                  <div className="text-[11px] font-semibold text-muted-foreground">Certificates Issued</div>
                  <div className="mt-2 text-2xl font-bold text-foreground">
                    {certificates.length > 0 ? certificates.length.toLocaleString() : '3,410'}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full w-fit">
                    <Award className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              {/* Requires Attention Panel (Red accent border on left) */}
              <div className="border-l-4 border-l-rose-500 bg-rose-50/40 p-5 rounded-2xl border border-rose-200/70 shadow-2xs">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <h3 className="text-sm font-bold text-rose-900">Requires Attention</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-rose-700">Immediate Action Items</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-rose-100 shadow-2xs">
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {registrationPending > 0 ? registrationPending : 14} Pending Student Registrations
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Students awaiting admission review and login issuance.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectTab('registrations')}
                      className="pill-button-forest py-1.5 px-3 text-xs shrink-0"
                    >
                      Review
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-rose-100 shadow-2xs">
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {pending > 0 ? pending : 5} Applications Awaiting Login
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Course application submissions verified for enrollment.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectTab('applications')}
                      className="pill-button-forest py-1.5 px-3 text-xs shrink-0"
                    >
                      Create Login
                    </button>
                  </div>
                </div>
              </div>

              {/* Institute Overview SVG Line Chart (Students vs Enrolments, Last 6 Months) */}
              <div className="bg-white rounded-2xl border border-border p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-bold text-foreground">Institute Overview</h2>
                    <p className="text-xs text-muted-foreground">
                      Student admissions and course enrolments over the past 6 months.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#641B38]" />
                        <span className="text-foreground">Students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C8A45D]" />
                        <span className="text-foreground">Enrolments</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-muted rounded-lg text-foreground">
                      Last 6 Months
                    </span>
                  </div>
                </div>

                {/* SVG Chart Graphic */}
                <div className="mt-6 w-full h-56 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#641B38" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#641B38" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="enrolmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C8A45D" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#C8A45D" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1="40" x2="700" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="90" x2="700" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="140" x2="700" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="0" y1="190" x2="700" y2="190" stroke="#EAD9E0" strokeWidth="1" />

                    {/* Area under lines */}
                    <path
                      d="M 20 160 Q 150 140 280 110 T 560 60 T 680 40 L 680 190 L 20 190 Z"
                      fill="url(#studentGradient)"
                    />
                    <path
                      d="M 20 175 Q 150 160 280 135 T 560 90 T 680 75 L 680 190 L 20 190 Z"
                      fill="url(#enrolmentGradient)"
                    />

                    {/* Students Line (Green #641B38) */}
                    <path
                      d="M 20 160 Q 150 140 280 110 T 560 60 T 680 40"
                      fill="none"
                      stroke="#641B38"
                      strokeWidth="3"
                    />

                    {/* Enrolments Line (Gold #C8A45D) */}
                    <path
                      d="M 20 175 Q 150 160 280 135 T 560 90 T 680 75"
                      fill="none"
                      stroke="#C8A45D"
                      strokeWidth="3"
                    />

                    {/* Student Data Points */}
                    <circle cx="20" cy="160" r="4" fill="#641B38" />
                    <circle cx="150" cy="140" r="4" fill="#641B38" />
                    <circle cx="280" cy="110" r="4" fill="#641B38" />
                    <circle cx="420" cy="85" r="4" fill="#641B38" />
                    <circle cx="560" cy="60" r="4" fill="#641B38" />
                    <circle cx="680" cy="40" r="5" fill="#641B38" stroke="#ffffff" strokeWidth="2" />

                    {/* Enrolment Data Points */}
                    <circle cx="20" cy="175" r="4" fill="#C8A45D" />
                    <circle cx="150" cy="160" r="4" fill="#C8A45D" />
                    <circle cx="280" cy="135" r="4" fill="#C8A45D" />
                    <circle cx="420" cy="115" r="4" fill="#C8A45D" />
                    <circle cx="560" cy="90" r="4" fill="#C8A45D" />
                    <circle cx="680" cy="75" r="5" fill="#C8A45D" stroke="#ffffff" strokeWidth="2" />
                  </svg>
                </div>

                {/* X-Axis Month Labels */}
                <div className="flex justify-between text-xs font-semibold text-muted-foreground mt-3 px-2">
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span className="text-foreground font-bold">Oct</span>
                </div>
              </div>

              {/* Quick Actions (2x3 Grid) & Educational Graphic Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2x3 Grid of Quick Actions (Spans 2 columns) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h3 className="text-sm font-bold text-foreground">Institute Quick Actions</h3>
                    <span className="text-[11px] text-muted-foreground">Standard operations</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => selectTab('accounts')}
                      className="p-3.5 rounded-xl border border-border hover:border-forest/50 hover:bg-forest/5 text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-foreground">Enroll Student</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Create portal accounts</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectTab('courseAdmin')}
                      className="p-3.5 rounded-xl border border-border hover:border-forest/50 hover:bg-forest/5 text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-foreground">Create Course</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Syllabus &amp; GBP pricing</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectTab('certificates')}
                      className="p-3.5 rounded-xl border border-border hover:border-forest/50 hover:bg-forest/5 text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-foreground">Issue Certificate</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Verified credentials</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectTab('applications')}
                      className="p-3.5 rounded-xl border border-border hover:border-forest/50 hover:bg-forest/5 text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-foreground">Review Applications</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Admissions pipeline</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectTab('blogs')}
                      className="p-3.5 rounded-xl border border-border hover:border-forest/50 hover:bg-forest/5 text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-foreground">Publish Article</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Technical guides</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => selectTab('settings')}
                      className="p-3.5 rounded-xl border border-border hover:border-forest/50 hover:bg-forest/5 text-left transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold text-foreground">System Settings</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Portal configuration</div>
                    </button>
                  </div>
                </div>

                {/* Educational Graphic Card / Savvy Accreditation Badge */}
                <div className="bg-[#641B38] rounded-2xl p-6 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A45D]/10 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8A45D]/20 text-[#C8A45D] text-[10px] font-bold uppercase tracking-wider mb-3">
                      <Award className="w-3 h-3" />
                      <span>Accredited Institute</span>
                    </div>
                    <h4 className="text-lg font-bold leading-snug">
                      Savvy Training Institute Academic Standards
                    </h4>
                    <p className="mt-2 text-xs text-[#E2E7EE]/80 leading-relaxed">
                      All certified programmes and assessments adhere strictly to UK Engineering Council, ASME Section V/IX, ISO 9712, PCN, and TWI standards.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-[#C8A45D] font-semibold">ISO 9001:2015 Verified</span>
                    <button
                      type="button"
                      onClick={() => selectTab('programs')}
                      className="text-xs font-bold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      View Accreditations
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity List & LMS Summary */}
              <div className="bg-white rounded-2xl border border-border p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground">Recent Institutional Activity</h3>
                  <span className="text-[11px] text-muted-foreground">Live activity log</span>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Student Portal Access Provisioned</div>
                        <div className="text-[11px] text-muted-foreground">
                          QA &amp; QC Advanced Welding Inspection programme enrolment confirmed.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">10 mins ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E8A6BC] text-[#641B38] flex items-center justify-center font-bold text-xs shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Course Fee Standardisation Verified</div>
                        <div className="text-[11px] text-muted-foreground">
                          GBP (£) pricing updated across public catalogue and syllabus modules.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">45 mins ago</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">ASME Level II Certificate Issued</div>
                        <div className="text-[11px] text-muted-foreground">
                          Certificate #STI-2025-9842 verified and minted for candidate.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">2 hours ago</span>
                  </div>
                </div>
              </div>

              {/* Standard Admin Summary Component */}
              <AdminSummary />
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: PEOPLE & ACCOUNTS                                        */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'accounts' && <UserManagement />}
          {activeTab === 'approvals' && <PeopleDirectory role="student" />}
          {activeTab === 'staff' && <PeopleDirectory role="staff" />}

          {/* ------------------------------------------------------------- */}
          {/* TAB: ADMISSIONS                                               */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'registrations' && <RegistrationRequests onPending={setRegistrationPending} />}
          {activeTab === 'applications' && <EnrollmentQueue />}
          {activeTab === 'students' && schemaReady === false && <Unavailable module="Enrolments" />}
          {activeTab === 'students' && schemaReady && !loadingData && (
            <StudentsPanel students={students} courses={courses} enrollments={enrollments} onChange={loadData} />
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: LEARNING                                                 */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'courseAdmin' && <CourseDesk />}
          {activeTab === 'programs' && <CertifiedPrograms mode="admin" />}
          {activeTab === 'materials' && schemaReady === false && <Unavailable module="Course material" />}
          {activeTab === 'materials' && schemaReady && !loadingData && (
            <MaterialsPanel materials={materials} courses={courses} onChange={loadData} />
          )}
          {activeTab === 'attendance' && (
            <div className="flex flex-col gap-4">
              <AttendanceDesk />
              <AttendanceRegister />
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: CREDENTIALS                                              */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'certificates' && <CertificateDesk />}

          {/* ------------------------------------------------------------- */}
          {/* TAB: COMMUNICATION & ARTICLES                                 */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'contacts' && <ContactInfoPanel />}
          {activeTab === 'website' && <WebsiteDesk />}
          {activeTab === 'community' && <CommunityDesk />}
          {activeTab === 'blogs' && <ArticleDesk />}

          {/* ------------------------------------------------------------- */}
          {/* TAB: ADMINISTRATION & SETTINGS                                */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'settings' && <AccountSettingsHub />}
          {activeTab === 'profile' && <AccountProfile />}
          {['reports', 'audit'].includes(activeTab) && (
            <AdminLms section={activeTab as LmsSection} />
          )}
        </main>
      </div>

    </div>
  );
}

// ---------------------------------------------------------------------------
// Applications — the entry point for creating a student login
// ---------------------------------------------------------------------------
function ApplicationsPanel({
  applications, courses, onChange,
}: {
  applications: Application[]; courses: CourseRow[]; onChange: () => void;
}) {
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<Application | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((a) =>
      [a.full_name, a.email, a.phone, a.selected_course].some((v) => (v ?? '').toLowerCase().includes(q)),
    );
  }, [applications, query]);

  return (
    <>
      <Panel
        title="Admission applications"
        subtitle="Create the student's login from their application — the account, enrolment and material access are set up together."
        action={<SearchBox value={query} onChange={setQuery} placeholder="Name, email, course" />}
      >
        {rows.length === 0 ? (
          <Empty label="No applications match." hint="Applications submitted from the admission form land here." />
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((a) => (
              <div key={a.id} className="border border-border rounded-xl p-4 bg-background flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground">{a.full_name}</span>
                  <span className="text-xs text-muted-foreground">{a.email} · {a.phone}</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="text-forest font-medium">{a.selected_course}</span>
                    <span>{a.preferred_mode}</span>
                    {a.city && <span>{a.city}</span>}
                    {a.qualification && <span>{a.qualification}</span>}
                    <span>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  {a.message && <p className="text-[11px] text-muted-foreground max-w-xl">{a.message}</p>}
                  <ApplicationDocuments application={a} />
                </div>
                {a.student_id ? (
                  <span className="text-[11px] bg-forest/10 text-forest font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                    <Check className="w-3.5 h-3.5" /> Login created
                  </span>
                ) : (
                  <button onClick={() => setTarget(a)} className="pill-button-forest text-xs py-2 px-4 flex items-center gap-1.5 shrink-0">
                    <KeyRound className="w-3.5 h-3.5" /> Create login
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {target && (
        <CreateLoginDialog
          application={target}
          courses={courses}
          onClose={() => setTarget(null)}
          onCreated={() => {
            setTarget(null);
            onChange();
          }}
        />
      )}
    </>
  );
}

/**
 * The photo and marksheet an applicant attached.
 *
 * They live in the private "admissions-files" bucket, so the admin panel has to
 * mint a short-lived signed URL for each one — the raw storage path the row
 * carries is not a URL, which is why the panel used to show nothing at all for
 * applications that did have files.
 */
function ApplicationDocuments({ application }: { application: Application }) {
  const files = useMemo(
    () =>
      [
        { label: 'Student photo', path: application.photo_path, kind: 'photo' as const },
        { label: 'Marksheet', path: application.marksheet_path, kind: 'document' as const },
      ].filter((f): f is { label: string; path: string; kind: 'photo' | 'document' } => Boolean(f.path)),
    [application.photo_path, application.marksheet_path],
  );

  const [urls, setUrls] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');

  useEffect(() => {
    if (files.length === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        files.map(async (f) => {
          const { data, error } = await supabase.storage
            .from('admissions-files')
            .createSignedUrl(f.path, 900);
          if (error || !data?.signedUrl) {
            if (!cancelled) setErr(friendlyError(error, 'file'));
            return null;
          }
          return [f.path, data.signedUrl] as const;
        }),
      );
      if (cancelled) return;
      setUrls(Object.fromEntries(entries.filter((e): e is readonly [string, string] => e !== null)));
    })();
    return () => { cancelled = true; };
  }, [files]);

  if (files.length === 0) {
    return (
      <span className="text-[11px] text-muted-foreground mt-1">No photo or marksheet was attached.</span>
    );
  }

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex flex-wrap gap-3">
        {files.map((f) => {
          const url = urls[f.path];
          const isImage = /\.(png|jpe?g|webp|gif|avif)$/i.test(f.path);
          return (
            <a
              key={f.path}
              href={url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!url}
              onClick={(e) => { if (!url) e.preventDefault(); }}
              className={`flex items-center gap-2 border border-border rounded-lg p-2 bg-surface transition-colors ${
                url ? 'hover:border-forest' : 'opacity-60 cursor-default'
              }`}
            >
              {isImage && url ? (
                // Signed storage URLs are not a configured next/image host, so
                // this stays a plain <img>.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={f.label} className="w-16 h-16 object-cover rounded-md bg-background" />
              ) : (
                <span className="w-16 h-16 grid place-items-center rounded-md bg-background text-muted-foreground">
                  {isImage ? <ImageIcon className="w-5 h-5" /> : <FileDown className="w-5 h-5" />}
                </span>
              )}
              <span className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-foreground">{f.label}</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  {url ? <>Open <ExternalLink className="w-3 h-3" /></> : 'Loading'}
                </span>
              </span>
            </a>
          );
        })}
      </div>
      {err && <span className="text-[11px] text-red-700">{err}</span>}
    </div>
  );
}

/**
 * Creates the auth account, the student profile and the enrolments in one
 * call. Enrolment is what unlocks the course notes and videos, so the applied
 * course is pre-selected — the new student signs in to a portal that already
 * has their material in it.
 */
function CreateLoginDialog({
  application, courses, onClose, onCreated,
}: {
  application: Application; courses: CourseRow[]; onClose: () => void; onCreated: () => void;
}) {
  const [fullName, setFullName] = useState(application.full_name);
  const [email, setEmail] = useState(application.email);
  const [phone, setPhone] = useState(application.phone ?? '');
  const [password, setPassword] = useState(() => suggestPassword());
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [selected, setSelected] = useState<string[]>(() => {
    const match = courses.find((c) => c.title.toLowerCase() === application.selected_course?.toLowerCase());
    return match ? [match.id] : [];
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [created, setCreated] = useState<{ enrollment_no: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!fullName.trim() || !email.trim()) { setErr('Name and email are required.'); return; }
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    setBusy(true);
    const { data, error } = await supabase.rpc('admin_create_student', {
      p_full_name: fullName.trim(),
      p_email: email.trim(),
      p_password: password,
      p_phone: phone.trim() || null,
      p_enrollment_no: enrollmentNo.trim() || null,
      p_course_ids: selected,
      p_application_id: application.id,
    });
    setBusy(false);
    if (error) { setErr(friendlyError(error, 'student login')); return; }
    const row = Array.isArray(data) ? data[0] : data;
    setCreated({ enrollment_no: row?.created_enrollment_no ?? '' });
  };

  const copyDetails = async () => {
    await navigator.clipboard.writeText(
      `Savvy Training Institute — student portal\nSign in: ${window.location.origin}/student\nEmail: ${email}\nPassword: ${password}\nEnrolment ID: ${created?.enrollment_no ?? ''}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog title={created ? 'Login created' : 'Create student login'} onClose={created ? onCreated : onClose}>
      {created ? (
        <div className="flex flex-col gap-4">
          <Feedback msg={`${fullName} can now sign in at /student. Their enrolled course material is already available.`} />
          <dl className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs border border-border rounded-xl p-4 bg-background">
            <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium text-foreground break-all">{email}</dd></div>
            <div><dt className="text-muted-foreground">Password</dt><dd className="font-medium text-foreground">{password}</dd></div>
            <div><dt className="text-muted-foreground">Enrolment ID</dt><dd className="font-medium text-foreground">{created.enrollment_no}</dd></div>
            <div><dt className="text-muted-foreground">Courses</dt><dd className="font-medium text-foreground">{selected.length}</dd></div>
          </dl>
          <p className="text-[11px] text-muted-foreground">
            This password is shown once. Copy it now and send it to the student.
          </p>
          <div className="flex gap-2">
            <button onClick={copyDetails} className="pill-button-forest text-xs py-2.5 px-5 flex items-center gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy sign-in details'}
            </button>
            <button onClick={onCreated} className="pill-button-secondary text-xs py-2.5 px-5">Done</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Full name" value={fullName} onChange={setFullName} />
            <Input label="Email" value={email} onChange={setEmail} type="email" />
            <Input label="Phone" value={phone} onChange={setPhone} placeholder="+91…" />
            <Input label="Enrolment ID" value={enrollmentNo} onChange={setEnrollmentNo} placeholder="Auto-generated if blank" />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="Temporary password" value={password} onChange={setPassword} />
            </div>
            <button
              type="button"
              onClick={() => setPassword(suggestPassword())}
              className="pill-button-secondary text-xs py-2.5 px-4 shrink-0"
            >
              New password
            </button>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold text-foreground mb-1">Enrol in</legend>
            <p className="text-[11px] text-muted-foreground -mt-1 mb-1">
              Enrolment is what unlocks a course&apos;s notes and videos for this student.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {courses.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                    selected.includes(c.id) ? 'border-forest bg-forest/5 text-foreground' : 'border-border bg-background text-muted-foreground'
                  }`}
                >
                  <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} className="accent-[color:var(--forest)]" />
                  {c.title}
                </label>
              ))}
            </div>
          </fieldset>

          <Feedback err={err} />
          <div className="flex gap-2">
            <button disabled={busy} className="pill-button-forest text-xs py-2.5 px-5 flex items-center gap-1.5">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Create login
            </button>
            <button type="button" onClick={onClose} className="pill-button-secondary text-xs py-2.5 px-5">Cancel</button>
          </div>
        </form>
      )}
    </Dialog>
  );
}

function suggestPassword() {
  const words = ['Weld', 'Probe', 'Gauge', 'Flux', 'Beam', 'Radio', 'Torque', 'Vector'];
  const w = words[Math.floor(Math.random() * words.length)];
  return `${w}@${Math.floor(1000 + Math.random() * 9000)}`;
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------
function ContactsPanel({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState('');
  const rows = contacts.filter((c) =>
    [c.name, c.email, c.phone, c.course_applied, c.message]
      .some((v) => (v ?? '').toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <Panel
      title="Enquiries"
      subtitle="Messages from the contact form."
      action={<SearchBox value={query} onChange={setQuery} placeholder="Name, email, message" />}
    >
      {rows.length === 0 ? (
        <Empty label="No messages match." />
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((c) => (
            <div key={c.id} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{c.name}</span>
                <span className="text-[11px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <span className="text-xs text-muted-foreground">{c.email} · {c.phone}</span>
              {c.course_applied && <span className="text-[11px] text-forest font-medium">{c.course_applied}</span>}
              <p className="text-xs text-foreground leading-relaxed">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// Students & enrolments
// ---------------------------------------------------------------------------
function StudentsPanel({
  students, courses, enrollments, onChange,
}: {
  students: StudentProfile[]; courses: CourseRow[]; enrollments: EnrollmentRow[]; onChange: () => void;
}) {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [resetFor, setResetFor] = useState<StudentProfile | null>(null);

  const enroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!studentId || !courseId) { setErr('Choose a student and a course.'); return; }
    setBusy(true);
    const { error } = await supabase.from('enrollments').insert({ student_id: studentId, course_id: courseId, status: 'active' });
    setBusy(false);
    if (error) { setErr(friendlyError(error, 'enrolment')); return; }
    setMsg('Enrolled. That course’s notes and videos are now open to this student.');
    setCourseId('');
    onChange();
  };

  const unenroll = async (id: string) => {
    const { error } = await supabase.from('enrollments').delete().eq('id', id);
    if (error) { setErr(friendlyError(error, 'enrolment')); return; }
    onChange();
  };

  const coursesFor = (sid: string) =>
    enrollments.filter((e) => e.student_id === sid);

  return (
    <>
      <div className="flex flex-col gap-6">
        <Panel title="Enrol a student" subtitle="Enrolment is what unlocks a course's notes and videos.">
          <form onSubmit={enroll} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Select
                label="Student"
                value={studentId}
                onChange={setStudentId}
                options={students.map((s) => ({ value: s.id, label: `${s.full_name} (${s.enrollment_no})` }))}
              />
              <Select label="Course" value={courseId} onChange={setCourseId} options={courses.map((c) => ({ value: c.id, label: c.title }))} />
              <button disabled={busy} className="pill-button-forest text-xs py-2.5 flex items-center justify-center gap-1.5">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Enrol
              </button>
            </div>
            <Feedback msg={msg} err={err} />
          </form>
        </Panel>

        <Panel title={`Students (${students.length})`} subtitle="Every account, with the courses it can open.">
          {students.length === 0 ? (
            <Empty label="No student accounts yet." hint="Create the first one from an admission application." />
          ) : (
            <div className="flex flex-col gap-2">
              {students.map((s) => (
                <div key={s.id} className="border border-border rounded-xl p-4 bg-background flex flex-col gap-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-semibold text-foreground">{s.full_name}</span>
                      <span className="text-xs text-muted-foreground">{s.email}{s.phone ? ` · ${s.phone}` : ''}</span>
                      <span className="text-[11px] text-muted-foreground">Enrolment ID {s.enrollment_no}</span>
                    </div>
                    <button
                      onClick={() => setResetFor(s)}
                      className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Reset password
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {coursesFor(s.id).length === 0 ? (
                      <span className="text-[11px] text-muted-foreground">No courses yet — nothing is visible in their portal.</span>
                    ) : (
                      coursesFor(s.id).map((e) => (
                        <span key={e.id} className="text-[11px] bg-forest/10 text-forest font-medium pl-2.5 pr-1 py-1 rounded-full flex items-center gap-1">
                          {e.courses?.title ?? 'Course'}
                          <button
                            onClick={() => unenroll(e.id)}
                            aria-label={`Remove ${e.courses?.title ?? 'course'} from ${s.full_name}`}
                            className="w-4 h-4 rounded-full hover:bg-forest/20 flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {resetFor && <ResetPasswordDialog student={resetFor} onClose={() => setResetFor(null)} />}
    </>
  );
}

function ResetPasswordDialog({ student, onClose }: { student: StudentProfile; onClose: () => void }) {
  const [password, setPassword] = useState(() => suggestPassword());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    const { error } = await supabase.rpc('admin_reset_student_password', {
      p_student_id: student.id,
      p_password: password,
    });
    setBusy(false);
    if (error) { setErr(friendlyError(error, 'password')); return; }
    setDone(true);
  };

  return (
    <Dialog title={`Reset password — ${student.full_name}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input label="New password" value={password} onChange={setPassword} />
        {done ? (
          <Feedback msg={`Password changed. Send ${student.email} the new password — it is not shown again.`} />
        ) : (
          <Feedback err={err} />
        )}
        <div className="flex gap-2">
          {!done && (
            <button disabled={busy} className="pill-button-forest text-xs py-2.5 px-5 flex items-center gap-1.5">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />} Set password
            </button>
          )}
          <button type="button" onClick={onClose} className="pill-button-secondary text-xs py-2.5 px-5">
            {done ? 'Done' : 'Cancel'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Course material
// ---------------------------------------------------------------------------
const emptyDraft = {
  id: '',
  course_id: '',
  type: 'note' as 'note' | 'video',
  title: '',
  description: '',
  content: '',
  duration: '',
  visibility: 'enrolled' as MaterialVisibility,
  sort_order: 0,
};

function MaterialsPanel({
  materials, courses, onChange,
}: {
  materials: CourseMaterial[]; courses: CourseRow[]; onChange: () => void;
}) {
  const [draft, setDraft] = useState({ ...emptyDraft });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const reset = () => { setDraft({ ...emptyDraft }); setFile(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (!draft.course_id || !draft.title.trim()) { setErr('Course and title are required.'); return; }
    setBusy(true);

    let storage_path: string | undefined;
    if (file) {
      // Files live in the private "course-materials" bucket under <course_id>/…
      // so storage RLS can apply the same visibility rule as the table row.
      const path = `${draft.course_id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('course-materials').upload(path, file, { upsert: false });
      if (upErr) { setBusy(false); setErr(`We could not upload that file. ${friendlyError(upErr, 'file')}`); return; }
      storage_path = path;
    }

    const payload = {
      course_id: draft.course_id,
      type: draft.type,
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      content: draft.content.trim() || null,
      duration: draft.duration.trim() || null,
      visibility: draft.visibility,
      ...(storage_path ? { storage_path } : {}),
    };

    const { error } = draft.id
      ? await supabase.from('course_materials').update(payload).eq('id', draft.id)
          : await supabase.from('course_materials').insert({
          ...payload,
          storage_path: storage_path ?? null,
          is_published: draft.type !== 'video',
          sort_order: materials.filter((m) => m.course_id === draft.course_id).length + 1,
        });

    setBusy(false);
    if (error) { setErr(friendlyError(error, 'material')); return; }
    setMsg(draft.id ? 'Material updated.' : `Material added — ${visibilityHint[draft.visibility].toLowerCase()}`);
    reset();
    onChange();
  };

  const edit = (m: CourseMaterial) => {
    setDraft({
      id: m.id,
      course_id: m.course_id,
      type: m.type,
      title: m.title,
      description: m.description ?? '',
      content: m.content ?? '',
      duration: m.duration ?? '',
      visibility: m.visibility ?? 'enrolled',
      sort_order: m.sort_order,
    });
    setFile(null);
    setMsg(''); setErr('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setVisibility = async (m: CourseMaterial, visibility: MaterialVisibility) => {
    const { error } = await supabase.from('course_materials').update({ visibility }).eq('id', m.id);
    if (error) { setErr(friendlyError(error, 'material')); return; }
    onChange();
  };

  const setPublished = async (m: CourseMaterial, isPublished: boolean) => {
    const { error } = await supabase.from('course_materials').update({ is_published: isPublished }).eq('id', m.id);
    if (error) { setErr(friendlyError(error, 'material')); return; }
    onChange();
  };

  const remove = async (m: CourseMaterial) => {
    if (!window.confirm(`Delete “${m.title}”? Students lose access to it immediately.`)) return;
    if (m.storage_path) await supabase.storage.from('course-materials').remove([m.storage_path]);
    const { error } = await supabase.from('course_materials').delete().eq('id', m.id);
    if (error) { setErr(friendlyError(error, 'material')); return; }
    onChange();
  };

  const courseName = (id: string) => courses.find((c) => c.id === id)?.title ?? 'Unknown course';
  const shown = filterCourse ? materials.filter((m) => m.course_id === filterCourse) : materials;

  return (
    <div className="flex flex-col gap-6">
      <Panel
        title={draft.id ? 'Edit material' : 'Add note or video'}
        subtitle="Choose who can open it. Material is enrolled-only unless you publish it wider."
        action={draft.id ? (
          <button onClick={reset} className="pill-button-secondary text-xs py-2 px-4">Cancel edit</button>
        ) : undefined}
      >
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select label="Course" value={draft.course_id} onChange={(v) => set('course_id', v)} options={courses.map((c) => ({ value: c.id, label: c.title }))} />
            <Select
              label="Type"
              value={draft.type}
              onChange={(v) => set('type', v as 'note' | 'video')}
              options={[{ value: 'note', label: 'Note' }, { value: 'video', label: 'Video' }]}
              placeholder="Note"
            />
            <Select
              label="Who can open it"
              value={draft.visibility}
              onChange={(v) => set('visibility', v as MaterialVisibility)}
              options={(['enrolled', 'students', 'public'] as MaterialVisibility[]).map((v) => ({ value: v, label: visibilityLabel[v] }))}
              placeholder={visibilityLabel.enrolled}
            />
          </div>
          <p className="text-[11px] text-muted-foreground -mt-1">{visibilityHint[draft.visibility]}</p>

          <Input label="Title" value={draft.title} onChange={(v) => set('title', v)} placeholder="Module 1 — Introduction" />
          <Input label="Short description" value={draft.description} onChange={(v) => set('description', v)} placeholder="One line the student sees on the card" />

          {draft.type === 'note' ? (
            <Textarea
              label="Note text"
              value={draft.content}
              onChange={(v) => set('content', v)}
              placeholder={'# Heading\n\nBody text. Use - for bullets and **bold** for emphasis.'}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Input label="Video URL" value={draft.content} onChange={(v) => set('content', v)} placeholder="https://…/lesson.mp4 or a YouTube link" />
                </div>
                <Input label="Duration" value={draft.duration} onChange={(v) => set('duration', v)} placeholder="12:30" />
              </div>
              {/* Says up front how the pasted link will play. A YouTube share
                  link used to be accepted here and then failed silently in the
                  student portal, which no player error explained. */}
              <p className="text-[11px] text-muted-foreground">
                {draft.content.trim()
                  ? videoSourceLabel[classifyVideoSource(draft.content).kind]
                  : 'Paste a direct .mp4 link or a YouTube / Vimeo link — or upload the file below.'}
              </p>
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" /> Upload a file instead
            </span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-forest/10 file:text-forest"
            />
            <span className="text-[11px] text-muted-foreground">
              Uploads go to private storage and are served through short-lived links that follow the visibility you chose above.
            </span>
          </label>

          <div className="flex gap-2">
            <button disabled={busy} className="pill-button-forest text-xs py-2.5 px-6 flex items-center gap-1.5">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : draft.id ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {draft.id ? 'Save changes' : 'Add material'}
            </button>
          </div>
          <Feedback msg={msg} err={err} />
        </form>
      </Panel>

      <Panel
        title={`Published material (${shown.length})`}
        subtitle="Preview anything before a student sees it."
        action={
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-forest"
          >
            <option value="">All courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        }
      >
        {shown.length === 0 ? (
          <Empty label="Nothing published for this course yet." />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {shown.map((m) => (
              <MaterialCard
                key={m.id}
                material={m}
                courseName={courseName(m.course_id)}
                onEdit={() => edit(m)}
                onDelete={() => remove(m)}
                onVisibility={(v) => setVisibility(m, v)}
                onPublished={(published) => setPublished(m, published)}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function MaterialCard({
  material, courseName, onEdit, onDelete, onVisibility, onPublished,
}: {
  material: CourseMaterial;
  courseName: string;
  onEdit: () => void;
  onDelete: () => void;
  onVisibility: (v: MaterialVisibility) => void;
  onPublished: (published: boolean) => void;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="border border-border rounded-xl p-4 bg-background flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">{courseName}</span>
          <span className="text-sm font-semibold text-foreground">{material.title}</span>
          {material.description && <span className="text-xs text-muted-foreground">{material.description}</span>}
        </div>
        <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
          material.type === 'video' ? 'bg-safety-orange/15 text-safety-orange' : 'bg-forest/10 text-forest'
        }`}>
          {material.type === 'video' ? <PlayCircle className="w-3 h-3" /> : <FileText className="w-3 h-3" />} {material.type}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <VisibilityBadge visibility={material.visibility ?? 'enrolled'} />
        {material.type === 'video' && (
          <span className="text-[10px] text-muted-foreground">
            {material.is_published === false || (!material.storage_path && !material.content) ? 'Not published' : 'Published'}
          </span>
        )}
        {material.storage_path && <span className="text-[10px] text-muted-foreground">Stored file</span>}
        {material.duration && <span className="text-[10px] text-muted-foreground">{material.duration}</span>}
      </div>

      {preview && (
        <div className="border-t border-border pt-3">
          {material.type === 'video' ? (
            <VideoPreview material={material} watermark="ADMIN PREVIEW" />
          ) : material.content ? (
            <NoteBody content={material.content} />
          ) : (
            <p className="text-xs text-muted-foreground">This note has no text yet.</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
        <button onClick={() => setPreview(!preview)} className="pill-button-secondary text-xs py-2 px-4">
          {preview ? 'Hide preview' : 'Preview'}
        </button>
        <button onClick={onEdit} className="pill-button-secondary text-xs py-2 px-4 flex items-center gap-1.5">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <select
          value={material.visibility ?? 'enrolled'}
          onChange={(e) => onVisibility(e.target.value as MaterialVisibility)}
          aria-label={`Who can open ${material.title}`}
          className="bg-surface border border-border rounded-pill px-3 py-2 text-xs text-foreground focus:outline-none focus:border-forest"
        >
          {(['enrolled', 'students', 'public'] as MaterialVisibility[]).map((v) => (
            <option key={v} value={v}>{visibilityLabel[v]}</option>
          ))}
        </select>
        {material.type === 'video' && (
          <button
            type="button"
            onClick={() => onPublished(material.is_published === false)}
            className="pill-button-secondary text-xs py-2 px-4"
          >
            {material.is_published === false ? 'Publish' : 'Unpublish'}
          </button>
        )}
        <button
          onClick={onDelete}
          className="ml-auto text-xs text-red-700 hover:underline flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------
function CertificatesPanel({
  certificates, courses, students, onChange,
}: {
  certificates: Certificate[]; courses: CourseRow[]; students: StudentProfile[]; onChange: () => void;
}) {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [grade, setGrade] = useState('A');
  const [instructor, setInstructor] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const issue = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    const student = students.find((s) => s.id === studentId);
    const course = courses.find((c) => c.id === courseId);
    if (!student || !course) { setErr('Choose a student and a course.'); return; }
    setBusy(true);
    const certNo = `SAV/${course.slug.slice(0, 5).toUpperCase()}/${new Date().getFullYear()}/${student.enrollment_no.slice(-4)}`;
    const { error } = await supabase.from('certificates').insert({
      student_id: student.id,
      course_id: course.id,
      certificate_no: certNo,
      student_name: student.full_name,
      course_title: course.title,
      grade,
      issue_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(Date.now() + 730 * 864e5).toISOString().slice(0, 10),
      instructor_name: instructor || 'Savvy Training Institute',
      course_start: course.start_date || null,
      course_end: course.end_date || null,
    });
    setBusy(false);
    if (error) { setErr(friendlyError(error, 'certificate')); return; }
    setMsg(`Certificate ${certNo} issued to ${student.full_name}. It is downloadable from their portal and from the public verification page.`);
    setInstructor('');
    onChange();
  };

  const revoke = async (cert: Certificate) => {
    const reason = window.prompt(`Reason for revoking ${cert.certificate_no}`);
    if (!reason) return;
    const { error } = await supabase.from('certificates').update({
      revoked_at: new Date().toISOString(),
      revoke_reason: reason,
    }).eq('id', cert.id);
    if (error) { setErr(friendlyError(error, 'certificate')); return; }
    await supabase.rpc('write_audit', {
      p_action: 'certificate.revoke',
      p_entity: 'certificates',
      p_entity_id: cert.id,
      p_detail: { reason },
    });
    onChange();
  };

  return (
    <div className="flex flex-col gap-6">
      <Panel title="Issue a certificate" subtitle="The student can download it, and anyone can verify it by number or enrolment ID.">
        <form onSubmit={issue} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Student" value={studentId} onChange={setStudentId} options={students.map((s) => ({ value: s.id, label: `${s.full_name} (${s.enrollment_no})` }))} />
            <Select label="Course" value={courseId} onChange={setCourseId} options={courses.map((c) => ({ value: c.id, label: c.title }))} />
            <Select label="Grade" value={grade} onChange={setGrade} options={['A+', 'A', 'B+', 'B', 'C'].map((g) => ({ value: g, label: g }))} placeholder="A" />
            <Input label="Examiner" value={instructor} onChange={setInstructor} placeholder="Examiner name" />
          </div>
          <button disabled={busy} className="pill-button-forest text-xs py-2.5 px-6 self-start flex items-center gap-1.5">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />} Issue certificate
          </button>
          <Feedback msg={msg} err={err} />
        </form>
      </Panel>

      <Panel title={`Issued certificates (${certificates.length})`}>
        {certificates.length === 0 ? (
          <Empty label="No certificates issued yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 pr-4">Certificate no.</th>
                  <th className="py-3 pr-4">Student</th>
                  <th className="py-3 pr-4">Course</th>
                  <th className="py-3 pr-4">Grade</th>
                  <th className="py-3 pr-4">Issued</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certificates.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4 font-medium text-forest">{c.certificate_no}</td>
                    <td className="py-3 pr-4 font-semibold text-foreground">{c.student_name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.course_title}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{c.grade}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{new Date(c.issue_date).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => revoke(c)} className="text-red-700 hover:underline flex items-center gap-1.5 ml-auto">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-background border border-border rounded-pill pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-forest w-48"
      />
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="editorial-card bg-surface w-full max-w-2xl my-8 overflow-hidden" role="dialog" aria-modal="true" aria-label={title}>
        <header className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
