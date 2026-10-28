'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

type RegistrationStatus = 'pending' | 'approved' | 'rejected';
type RequestRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  courseInterest: string;
  createdAt: string;
  reviewedAt: string | null;
  status: RegistrationStatus;
};

const PAGE_SIZE = 8;

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function RegistrationRequests({ onPending }: { onPending?: (count: number) => void }) {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | RegistrationStatus>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<RequestRow | null>(null);
  const [busyId, setBusyId] = useState('');
  const [notice, setNotice] = useState('');
  const [tone, setTone] = useState<'ok' | 'error'>('ok');

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/registrations', { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setTone('error');
      setNotice(body.message || 'Registration requests could not be loaded.');
      setLoading(false);
      return;
    }
    setRows(body.requests ?? []);
    onPending?.(body.pending ?? 0);
    setLoading(false);
  }, [onPending]);

  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = status === 'all' || row.status === status;
      const hay = `${row.fullName} ${row.email} ${row.phone} ${row.courseInterest}`.toLowerCase();
      return matchesStatus && hay.includes(needle);
    });
  }, [rows, query, status]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const slice = visible.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pending = rows.filter((row) => row.status === 'pending').length;

  const review = async (row: RequestRow, action: 'approve' | 'reject') => {
    setBusyId(row.id);
    setNotice('');
    const response = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, action }),
    });
    const body = await response.json().catch(() => ({}));
    setBusyId('');
    if (!response.ok) {
      setTone('error');
      setNotice(body.message || 'The request was not updated.');
      await load();
      return;
    }
    setTone('ok');
    setNotice(action === 'approve' ? `${row.fullName} can now sign in.` : `${row.fullName}'s request was rejected.`);
    setSelected(null);
    await load();
  };

  return (
    <section className="rounded-2xl border border-border bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Registration Requests</h2>
          <p className="text-sm text-muted-foreground">New student accounts wait here until you approve or reject them. {pending} pending.</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
          placeholder="Search name, email, or phone"
          value={query}
          onChange={(event) => { setQuery(event.target.value); setPage(1); }}
          aria-label="Search registration requests"
        />
        <select
          className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          value={status}
          aria-label="Filter by status"
          onChange={(event) => { setStatus(event.target.value as 'all' | RegistrationStatus); setPage(1); }}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {notice && (
        <p role="status" className={`mt-3 rounded-lg border px-3 py-2 text-sm ${tone === 'ok' ? 'border-[#087F73]/30 bg-[#E7F3F1]' : 'border-red-200 bg-red-50 text-red-700'}`}>{notice}</p>
      )}
      {loading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading requests</p>
      ) : slice.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">No registration requests match.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-medium">User name</th>
                <th className="py-2 pr-3 font-medium">Email address</th>
                <th className="py-2 pr-3 font-medium">Phone number</th>
                <th className="py-2 pr-3 font-medium">Registration date</th>
                <th className="py-2 pr-3 font-medium">Request status</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="py-3 pr-3 font-medium">{row.fullName}</td>
                  <td className="py-3 pr-3">{row.email}</td>
                  <td className="py-3 pr-3">{row.phone || '—'}</td>
                  <td className="py-3 pr-3 whitespace-nowrap">{formatWhen(row.createdAt)}</td>
                  <td className="py-3 pr-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${row.status === 'approved' ? 'bg-[#E7F3F1] text-[#00543d]' : row.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-[#F6F4EE] text-[#102B46]'}`}>{row.status}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="text-[#087F73] underline" onClick={() => setSelected(row)}>View</button>
                      {row.status === 'pending' && (
                        <>
                          <button type="button" className="text-[#087F73] underline disabled:opacity-50" disabled={busyId === row.id} onClick={() => review(row, 'approve')}>{busyId === row.id ? 'Saving' : 'Approve'}</button>
                          <button type="button" className="text-red-700 underline disabled:opacity-50" disabled={busyId === row.id} onClick={() => review(row, 'reject')}>Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <button type="button" className="underline disabled:opacity-40" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
          <span className="text-muted-foreground">Page {currentPage} of {pages}</span>
          <button type="button" className="underline disabled:opacity-40" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg" role="dialog" aria-labelledby="registration-title">
            <h3 id="registration-title" className="text-lg font-semibold">{selected.fullName}</h3>
            <dl className="mt-3 grid grid-cols-1 gap-2 text-sm">
              <div><dt className="text-muted-foreground">Email</dt><dd>{selected.email}</dd></div>
              <div><dt className="text-muted-foreground">Phone</dt><dd>{selected.phone || 'Not provided'}</dd></div>
              <div><dt className="text-muted-foreground">Course of interest</dt><dd>{selected.courseInterest || 'Not provided'}</dd></div>
              <div><dt className="text-muted-foreground">Registered</dt><dd>{formatWhen(selected.createdAt)}</dd></div>
              <div><dt className="text-muted-foreground">Status</dt><dd className="capitalize">{selected.status}</dd></div>
              {selected.reviewedAt && <div><dt className="text-muted-foreground">Reviewed</dt><dd>{formatWhen(selected.reviewedAt)}</dd></div>}
            </dl>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" className="rounded-lg border border-border px-3 py-2 text-sm" onClick={() => setSelected(null)}>Close</button>
              {selected.status === 'pending' && (
                <>
                  <button type="button" className="rounded-lg bg-[#087F73] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={busyId === selected.id} onClick={() => review(selected, 'approve')}>Approve</button>
                  <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 disabled:opacity-50" disabled={busyId === selected.id} onClick={() => review(selected, 'reject')}>Reject</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
