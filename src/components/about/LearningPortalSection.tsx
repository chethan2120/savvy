'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, Link2, NotebookPen, Video } from 'lucide-react';
import { CareerStrategyCall } from '@/components/home/CareerStrategyCall';

type PortalItem = {
  id: string;
  kind: 'info' | 'zoom' | 'schedule' | 'update';
  title: string;
  detail: string;
  zoomUrl?: string;
  startsAt?: string;
};

const icons = {
  info: NotebookPen,
  zoom: Video,
  schedule: CalendarDays,
  update: Link2,
};

function when(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: value.includes('T') ? 'short' : undefined,
  }).format(date);
}

export function LearningPortalSection() {
  const [items, setItems] = useState<PortalItem[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    fetch('/api/portal', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  return (
    <section className="border-b border-[#EAD9E0] bg-[#F8EDF1] py-16">
      <div className="site-container">
        {state === 'ready' && items.length === 0 ? (
          <CareerStrategyCall embedded />
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#B83268]">Learning Portal</p>
            <h2 className="mt-2 max-w-2xl text-[#641B38]">Everything for your course in one place</h2>
            <p className="mt-3 max-w-2xl text-[#30262B]">
              Course information, Zoom sessions, schedules and updates published by the institute.
            </p>
          </>
        )}
        {state === 'loading' && <p className="mt-8 text-[#30262B]">Loading the learning portal…</p>}
        {state === 'error' && <p className="mt-8 text-red-700" role="alert">The learning portal could not be loaded.</p>}
        <div className={`mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 ${items.length === 0 ? 'hidden' : ''}`}>
          {items.map((item) => {
            const Icon = icons[item.kind] || NotebookPen;
            return (
              <article key={item.id} className="rounded-2xl border border-[#EAD9E0] bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8EDF1] text-[#B83268]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#B83268]">{item.kind}</p>
                    <h3 className="text-[#641B38]">{item.title}</h3>
                  </div>
                </div>
                {item.startsAt && <p className="mt-4 text-sm text-[#30262B]">{when(item.startsAt)}</p>}
                {item.detail && <p className="mt-3 text-[#641B38]">{item.detail}</p>}
                {item.zoomUrl && (
                  <a href={item.zoomUrl} className="mt-4 inline-flex text-[#B83268] underline" target="_blank" rel="noreferrer">
                    Open the Zoom link
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
