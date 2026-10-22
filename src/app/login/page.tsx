'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { signInAs, type SignInRole } from '@/lib/portal-auth';
import { useCourseCatalog } from '@/lib/useCourseCatalog';
import { friendlyError } from '@/lib/friendly-error';
import { SavvyLogo } from '@/components/brand/SavvyLogo';

const roles: { id: SignInRole; label: string; hint: string; href: string; icon: React.ReactNode }[] = [
  { id: 'admin', label: 'Admin', hint: 'Institute administration', href: '/admin', icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 'staff', label: 'Staff', hint: 'Courses, attendance, certificates', href: '/staff', icon: <UserRound className="w-5 h-5" /> },
  { id: 'student', label: 'Student', hint: 'Lessons, attendance, certificates', href: '/student', icon: <GraduationCap className="w-5 h-5" /> },
];

export default function LoginPage() {
  const router = useRouter();
  const { courses, loading: coursesLoading } = useCourseCatalog();
  const [role, setRole] = useState<SignInRole | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'error' | 'ok'>('error');

  useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get('role');
    if (selected === 'admin' || selected === 'staff' || selected === 'student') setRole(selected);
  }, []);

  useEffect(() => {
    if (courses.length && !courses.some((item) => item.title === course)) setCourse(courses[0].title);
  }, [courses, course]);

  const resetNotice = () => setMessage('');

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    resetNotice();
    if (!role) {
      setTone('error');
      setMessage('Select Admin, Staff, or Student to continue.');
      return;
    }
    if (!email.trim() || !password) {
      setTone('error');
      setMessage(!email.trim() ? 'Enter your email or phone number.' : 'Enter your password.');
      return;
    }
    setBusy(true);
    const result = await signInAs(role, email, password);
    setBusy(false);
    if (!result.ok) {
      setTone('error');
      setMessage(result.message);
      return;
    }
    router.push(roles.find((item) => item.id === role)?.href ?? '/');
  };

  const signUp = async (event: React.FormEvent) => {
    event.preventDefault();
    resetNotice();
    if (!fullName.trim()) return fail('Enter your full name.');
    if (!email.includes('@')) return fail('Enter a valid email address.');
    if (phone.trim().length < 8) return fail('Enter a mobile number.');
    if (password.length < 8) return fail('Use a password of at least 8 characters.');
    if (password !== confirm) return fail('The passwords do not match.');

    setBusy(true);
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        courseInterest: course,
      }),
    });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return fail(body.message || 'The registration could not be saved.');
    setTone('ok');
    setMessage(body.message || 'Your account is awaiting administrator approval. You can sign in after an administrator approves it.');
    setMode('signin');
    setPassword('');
    setConfirm('');
  };

  const forgot = async (event: React.FormEvent) => {
    event.preventDefault();
    resetNotice();
    if (!email.includes('@')) return fail('Enter the email address on the account.');
    if (!isSupabaseConfigured) return fail('Password reset needs the Supabase project to be connected.');
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setBusy(false);
    if (error) return fail(friendlyError(error, 'account'));
    setTone('ok');
    setMessage('If that email has an account, a reset link is on its way. Check your inbox.');
  };

  function fail(text: string) {
    setTone('error');
    setMessage(text);
  }

  return (
    <div className="account-theme auth-layout min-h-screen overflow-x-hidden bg-[#F6F4EE] text-[#102B46]">
      <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        <section className="auth-panel relative flex min-h-[20rem] items-center overflow-hidden px-6 py-14 text-white sm:px-10 lg:min-h-screen lg:px-12">
          <div className="absolute inset-0 bg-[#102B46]" />
          <img src="/images/hero-factory.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[center_20%] opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#102B46]/92 via-[#102B46]/78 to-[#102B46]/88" />
          <Link href="/" className="absolute left-6 top-5 z-10 inline-flex items-center gap-1.5 text-sm text-white hover:text-[#D9AD55] sm:left-10">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <div className="relative z-10 flex w-full max-w-lg flex-col gap-6">
            <SavvyLogo tone="light" markClassName="h-32 w-32 shrink-0 sm:h-40 sm:w-40" />
            <div className="h-0.5 w-14 bg-[#D9AD55]" />
            <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">SAVVY TRAINING INSTITUTE</h1>
              <p className="text-sm leading-relaxed text-white/85 sm:text-base">
                Empowering the next generation of NDT professionals through industry-focused training, practical expertise, and internationally recognized certification preparation.
              </p>
            </div>
            <ul className="flex flex-col gap-3 text-sm text-white">
              {[
                'Industry-focused NDT training.',
                'Expert guidance and practical learning.',
                'Career development and certification preparation.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D9AD55]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#D9AD55]">SKILLS TODAY | SAFER TOMORROW</p>
          </div>
        </section>

        <section className="flex min-w-0 items-center justify-center bg-[#F6F4EE] px-4 py-8 sm:px-8">
          <div className="w-full max-w-md rounded-2xl border border-[#E2E6EA] bg-white p-5 shadow-[0_18px_50px_rgba(16,43,70,0.08)] sm:p-8">
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Account role">
              {roles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={role === item.id}
                  onClick={() => {
                    setRole(item.id);
                    setMode('signin');
                    resetNotice();
                  }}
                  className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl border px-1 py-3 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F73] ${
                    role === item.id
                      ? 'border-[#087F73] bg-[#087F73] text-white shadow-sm'
                      : 'border-[#E2E6EA] bg-white text-[#102B46] hover:border-[#087F73]'
                  }`}
                >
                  {item.icon}
                  <span className="text-[11px] font-semibold sm:text-xs">{item.label}</span>
                </button>
              ))}
            </div>

            {mode === 'signin' && (
              <form onSubmit={signIn} className="mt-5 flex flex-col gap-3">
                <Field label="Email address or phone number" type="text" value={email} onChange={setEmail} autoComplete="username" placeholder="Enter your email or phone number" icon={<Mail className="h-4 w-4" />} />
                <PasswordField label="Password" value={password} onChange={setPassword} shown={showPassword} onToggle={() => setShowPassword((v) => !v)} placeholder="Enter your password" />
                <button type="submit" disabled={busy} className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087F73] py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F73] disabled:opacity-60">
                  {busy ? <Spinner label="Signing in" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                </button>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <button type="button" className="text-[#087F73]" onClick={() => { setMode('forgot'); resetNotice(); }}>
                    Forgot password?
                  </button>
                  <button type="button" className="text-[#087F73]" onClick={() => { setRole('student'); setMode('signup'); resetNotice(); }}>
                    Create new account
                  </button>
                </div>
              </form>
            )}

            {role === 'student' && mode === 'signup' && (
              <form onSubmit={signUp} className="flex flex-col gap-3 mt-5">
                <Field label="Full name" value={fullName} onChange={setFullName} autoComplete="name" />
                <Field label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <Field label="Mobile number" value={phone} onChange={setPhone} autoComplete="tel" />
                <label className="flex flex-col gap-1 text-xs">
                  <span className="font-semibold text-foreground">Course of interest</span>
                  <select value={course} onChange={(e) => setCourse(e.target.value)} disabled={coursesLoading || courses.length === 0} className="bg-background border border-border rounded-lg px-3 py-2.5 text-sm">
                    {courses.length === 0 && <option value="">{coursesLoading ? 'Loading courses…' : 'Courses unavailable'}</option>}
                    {courses.map((item) => (
                      <option key={item.id} value={item.title}>{item.title}</option>
                    ))}
                  </select>
                </label>
                <PasswordField label="Password" value={password} onChange={setPassword} shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                <PasswordField label="Confirm password" value={confirm} onChange={setConfirm} shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
                <button type="submit" disabled={busy} className="pill-button-forest py-3 text-sm">
                  {busy ? <Spinner label="Creating account" /> : 'Create account'}
                </button>
                <button type="button" className="text-[11px] text-forest" onClick={() => { setMode('signin'); resetNotice(); }}>
                  Already approved? Sign in
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={forgot} className="flex flex-col gap-3 mt-5">
                <Field label="Email address" type="email" value={email} onChange={setEmail} autoComplete="email" />
                <button type="submit" disabled={busy} className="pill-button-forest py-3 text-sm">
                  {busy ? <Spinner label="Sending" /> : 'Send reset link'}
                </button>
                <button type="button" className="text-[11px] text-forest" onClick={() => { setMode('signin'); resetNotice(); }}>
                  Back to sign in
                </button>
              </form>
            )}

            {message && (
              <p role="alert" className={`text-xs rounded-lg border px-3 py-2 mt-4 ${tone === 'ok' ? 'border-forest/30 bg-forest/10 text-foreground' : 'border-safety-orange/40 bg-yellow/20 text-foreground'}`}>
                {message}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', autoComplete, placeholder, icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="font-semibold text-[#102B46]">{label}</span>
      <span className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">{icon}</span>}
        <input
          type={type}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-xl border border-[#E2E6EA] bg-white py-2.5 text-sm text-[#102B46] focus:border-[#087F73] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#087F73] ${icon ? 'pl-10 pr-3' : 'px-3'}`}
        />
      </span>
    </label>
  );
}

function PasswordField({
  label, value, onChange, shown, onToggle, placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  shown: boolean;
  onToggle: () => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-semibold text-[#102B46]">{label}</span>
      <span className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <input
          type={shown ? 'text' : 'password'}
          value={value}
          autoComplete="current-password"
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-[#E2E6EA] bg-white py-2.5 pl-10 pr-10 text-sm text-[#102B46] focus:border-[#087F73] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#087F73]"
        />
        <button type="button" onClick={onToggle} aria-label={shown ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded text-[#64748B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#087F73]">
          {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </span>
    </label>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" /> {label}
    </span>
  );
}
