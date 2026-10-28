'use client';

import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Inbox, Globe, Users, Lock } from 'lucide-react';
import type { MaterialVisibility } from '@/lib/types';

export function Panel({
  title, subtitle, action, children,
}: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="editorial-card bg-surface overflow-hidden">
      <header className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

/**
 * Dashboard tile. With `onClick` it becomes a real button that opens the
 * section it counts — the tiles looked clickable and were not, so a student
 * tapping "Video lessons" got nothing.
 */
export function StatTile({
  label, value, hint, onClick, active,
}: {
  label: string; value: number | string; hint?: string; onClick?: () => void; active?: boolean;
}) {
  const body = (
    <>
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{label}</span>
      <span className="text-2xl font-normal text-foreground tabular-nums">{value}</span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      {onClick && (
        <span className="text-[11px] text-forest font-medium flex items-center gap-1 mt-0.5">
          Open <ArrowRight className="w-3 h-3" />
        </span>
      )}
    </>
  );

  if (!onClick) {
    return <div className="editorial-card bg-surface px-5 py-4 flex flex-col gap-1">{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`editorial-card bg-surface px-5 py-4 flex flex-col gap-1 text-left transition-colors hover:border-forest focus-visible:outline-2 focus-visible:outline-forest ${
        active ? 'border-forest' : ''
      }`}
    >
      {body}
    </button>
  );
}

export function Input({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
      />
    </label>
  );
}

export function Textarea({
  label, value, onChange, placeholder, rows = 6,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest leading-relaxed"
      />
    </label>
  );
}

export function Select({
  label, value, onChange, options, placeholder = 'Select',
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-forest"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function Feedback({ msg, err }: { msg?: string; err?: string }) {
  if (!msg && !err) return null;
  return err ? (
    <div className="flex items-start gap-2 p-3 text-xs bg-red-50 rounded-xl border border-red-200 text-red-700">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{err}</span>
    </div>
  ) : (
    <div className="flex items-start gap-2 p-3 text-xs bg-forest/10 rounded-xl border border-forest/20 text-forest">
      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{msg}</span>
    </div>
  );
}

export function Empty({ label, hint, icon }: { label: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-12 px-6">
      <span className="text-muted-foreground">{icon ?? <Inbox className="w-7 h-7" />}</span>
      <p className="text-sm text-foreground">{label}</p>
      {hint && <p className="text-xs text-muted-foreground max-w-sm">{hint}</p>}
    </div>
  );
}

export const visibilityLabel: Record<MaterialVisibility, string> = {
  enrolled: 'Enrolled students',
  students: 'All students',
  public: 'Everyone',
};

export const visibilityHint: Record<MaterialVisibility, string> = {
  enrolled: 'Only students enrolled in this course can open it.',
  students: 'Any signed-in student can open it, enrolled or not.',
  public: 'Visible to anyone, including visitors browsing the course page.',
};

export function VisibilityBadge({ visibility }: { visibility: MaterialVisibility }) {
  const map = {
    enrolled: { icon: <Lock className="w-3 h-3" />, cls: 'bg-forest/10 text-forest' },
    students: { icon: <Users className="w-3 h-3" />, cls: 'bg-periwinkle/40 text-foreground' },
    public: { icon: <Globe className="w-3 h-3" />, cls: 'bg-yellow/40 text-foreground' },
  }[visibility];
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${map.cls}`}>
      {map.icon} {visibilityLabel[visibility]}
    </span>
  );
}
