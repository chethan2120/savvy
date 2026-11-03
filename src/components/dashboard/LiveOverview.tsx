'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

type Month = {
  key: string;
  label: string;
  shortLabel: string;
  year: number;
  month: number;
  students: number;
  enrolments: number;
  certificates: number;
  staff: number;
  requests: number;
};
type Overview = {
  students: number;
  activeStaff: number;
  publishedCourses: number;
  enrolments: number;
  certificates: number;
  pendingRegistrations: number;
  pendingRequests: number;
  applicationsAwaiting: number;
  months: Month[];
};

const number = new Intl.NumberFormat('en-GB');

export function LiveOverview({ onOpen }: { onOpen: (tab: string) => void }) {
  const [data, setData] = useState<Overview | null>(null);
  const [metric, setMetric] = useState<'enrolments' | 'students' | 'certificates' | 'staff' | 'requests'>('enrolments');
  const [period, setPeriod] = useState<'quarter' | 'six' | 'year'>('quarter');

  useEffect(() => {
    fetch('/api/workspace?resource=overview', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => { if (body) setData(body); })
      .catch(() => undefined);
  }, []);

  const counts = data ?? {
    students: 0, activeStaff: 0, publishedCourses: 0, enrolments: 0, certificates: 0,
    pendingRegistrations: 0, pendingRequests: 0, applicationsAwaiting: 0, months: [],
  };
  const cards = [
    ['Total Students', counts.students, 'approvals'],
    ['Pending Registrations', counts.pendingRegistrations, 'registrations'],
    ['Active Staff', counts.activeStaff, 'staff'],
    ['Published Courses', counts.publishedCourses, 'courseAdmin'],
    ['Active Enrolments', counts.enrolments, 'students'],
    ['Certificates Issued', counts.certificates, 'certificates'],
  ] as const;
  const attention = [
    counts.pendingRegistrations > 0 ? {
      title: `${number.format(counts.pendingRegistrations)} pending student registration${counts.pendingRegistrations === 1 ? '' : 's'}`,
      detail: 'Students awaiting admission review.',
      tab: 'registrations',
      action: 'Review',
    } : null,
    counts.pendingRequests > 0 ? {
      title: `${number.format(counts.pendingRequests)} enrolment request${counts.pendingRequests === 1 ? '' : 's'} awaiting review`,
      detail: 'Course enrolment requests that have not been approved.',
      tab: 'applications',
      action: 'Review',
    } : null,
    counts.applicationsAwaiting > 0 ? {
      title: `${number.format(counts.applicationsAwaiting)} application${counts.applicationsAwaiting === 1 ? '' : 's'} awaiting a login`,
      detail: 'Applications that still need an account.',
      tab: 'applications',
      action: 'Open',
    } : null,
  ].filter((item): item is { title: string; detail: string; tab: string; action: string } => Boolean(item));
  const months = counts.months ?? [];
  const currentYear = new Date().getFullYear();
  const visible = months.filter((month) => {
    if (period === 'quarter') return month.year === currentYear && month.month >= 10 && month.month <= 12;
    if (period === 'year') return month.year === currentYear;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 5, 1);
    const key = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}`;
    return month.key >= key && month.key <= `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  });
  const metricLabel = {
    enrolments: 'Students enrolled',
    students: 'New students',
    certificates: 'Certificates issued',
    staff: 'New staff',
    requests: 'Enrolment requests',
  }[metric];
  const peak = Math.max(1, ...visible.map((month) => month[metric] || 0));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map(([label, value, tab]) => (
          <button key={label} type="button" onClick={() => onOpen(tab)} className="flex flex-col rounded-2xl border border-[#EAD9E0] bg-white p-4 text-left hover:border-[#B83268]">
            <span className="text-[11px] font-semibold text-[#6B5A60]">{label}</span>
            <span className="mt-2 text-2xl font-bold text-[#30262B]">{number.format(value)}</span>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-[#EAD9E0] border-l-4 border-l-[#B83268] bg-[#FCF8F7] p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#B83268]" />
          <h3 className="text-sm font-bold text-[#641B38]">Requires attention</h3>
        </div>
        {attention.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-[#6B5A60]">Nothing needs attention.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {attention.map((item) => (
              <div key={item.title} className="flex items-center justify-between gap-3 rounded-xl border border-[#EAD9E0] bg-white p-3.5">
                <div>
                  <p className="text-xs font-bold">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-[#6B5A60]">{item.detail}</p>
                </div>
                <button type="button" onClick={() => onOpen(item.tab)} className="rounded-full bg-[#641B38] px-3 py-1.5 text-xs font-semibold text-white">{item.action}</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-[#EAD9E0] bg-white p-5">
        <div className="flex flex-col justify-between gap-3 border-b border-[#EAD9E0] pb-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-base font-bold text-[#641B38]">Institute overview</h2>
            <p className="text-xs text-[#6B5A60]">Monthly figures from the institute records. Empty months stay at zero.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="text-xs font-semibold text-[#6B5A60]">Show
              <select className="mt-1 block rounded-lg border border-[#EAD9E0] bg-white px-3 py-2 text-sm font-medium text-[#30262B]" value={metric} onChange={(event) => setMetric(event.target.value as typeof metric)}>
                <option value="enrolments">Students enrolled</option>
                <option value="students">New students</option>
                <option value="staff">New staff</option>
                <option value="certificates">Certificates issued</option>
                <option value="requests">Enrolment requests</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-[#6B5A60]">Period
              <select className="mt-1 block rounded-lg border border-[#EAD9E0] bg-white px-3 py-2 text-sm font-medium text-[#30262B]" value={period} onChange={(event) => setPeriod(event.target.value as typeof period)}>
                <option value="quarter">October, November and December</option>
                <option value="six">Last 6 months</option>
                <option value="year">This year</option>
              </select>
            </label>
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="mt-6 rounded-xl bg-[#FCF8F7] p-6 text-sm text-[#6B5A60]">No months are available for that filter.</p>
        ) : (
          <div className="mt-6" role="img" aria-label={`${metricLabel} by month`}>
            <div className="flex h-56 items-end gap-3">
              {visible.map((month) => {
                const value = month[metric] || 0;
                const height = value === 0 ? 4 : Math.max(12, Math.round((value / peak) * 180));
                return (
                  <div key={month.key} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs font-bold text-[#30262B]">{number.format(value)}</span>
                    <div className="w-full max-w-16 rounded-t-lg bg-[#641B38]" style={{ height }} title={`${month.label} ${month.year}: ${value}`} />
                    <span className="text-center text-xs font-semibold text-[#6B5A60]">{month.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
