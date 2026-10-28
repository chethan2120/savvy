'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabase';
import { signInAs } from '@/lib/portal-auth';
import { AlertCircle, Loader2, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';

/**
 * Sign-in card shared by both portals. It authenticates against the portal it
 * is rendered for, so a student account cannot open the admin portal and an
 * admin account cannot open the student portal.
 */
export const PortalLogin: React.FC<{
  role: 'admin' | 'staff' | 'student';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  otherPortalHref: string;
  otherPortalLabel: string;
  onSignedIn: () => void;
}> = ({ role, title, subtitle, icon, otherPortalHref, otherPortalLabel, onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string>('');

  const attempt = async (mail: string, pass: string, tag: string) => {
    setError('');
    setBusy(tag);
    const result = await signInAs(role, mail, pass);
    setBusy('');
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onSignedIn();
  };

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Both portals hide the site header/footer once signed in, so the
            sign-in screen is the only place left to get back to the marketing
            site — without this, the only way out was the browser Back button. */}
        <Link
          href="/"
          className="self-start flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to website home
        </Link>

        <div className="editorial-card bg-surface overflow-hidden">
          {/* Instrument-panel header: the portal names itself before anything else. */}
          <div className="bg-forest text-white px-6 py-5 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">{icon}</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.22em] text-white/60">
                {role === 'admin' ? 'Staff access' : 'Student access'}
              </span>
              <h1 className="text-lg font-normal">{title}</h1>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>

            {!isSupabaseConfigured && (
              <Banner tone="warn">Backend not connected. Configure Supabase to enable sign-in.</Banner>
            )}
            {error && <Banner tone="error">{error}</Banner>}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                attempt(email, password, 'form');
              }}
              className="flex flex-col gap-4"
            >
              <Field
                id={`${role}-email`}
                label="Email address or phone number"
                type="text"
                value={email}
                onChange={setEmail}
                placeholder="Enter your email or phone number"
                autoComplete="username"
              />
              <Field
                id={`${role}-password`}
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="submit" disabled={busy !== ''} className="pill-button-forest py-3 text-xs">
                {busy === 'form' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Signing in
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            Records stay private to your account.
          </span>
          <Link href={otherPortalHref} className="text-[11px] text-forest underline underline-offset-2">
            {otherPortalLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

function Field({
  id, label, type, value, onChange, placeholder, autoComplete,
}: {
  id: string; label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder?: string; autoComplete?: string;
}) {
  // A password field gets a reveal toggle: typing a password blind into a
  // portal is where most failed sign-ins come from.
  const isPassword = type === 'password';
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-foreground">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`w-full bg-background border border-border rounded-lg py-2.5 pl-3.5 text-sm text-foreground focus:outline-none focus:border-forest ${
            isPassword ? 'pr-11' : 'pr-3.5'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-forest rounded-r-lg"
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function Banner({ tone, children }: { tone: 'warn' | 'error'; children: React.ReactNode }) {
  const cls =
    tone === 'error'
      ? 'bg-red-50 border-red-200 text-red-700'
      : 'bg-yellow/20 border-border text-foreground';
  return (
    <div className={`flex items-start gap-2 p-3 text-xs rounded-xl border ${cls}`}>
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}
