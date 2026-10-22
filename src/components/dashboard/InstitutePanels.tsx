'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type Program = { id: string; slug: string; title: string; duration: string; image: string; href: string; categoryName?: string; fee?: string; certification?: string; eligibility?: string; expectedHours?: number | null; custom?: boolean };
type CourseLink = { id: string; accountId: string; courseId: string; status: 'enrolled' | 'requested' };
type Account = { id: string; fullName: string; email: string; phone: string; role: 'admin' | 'staff' | 'student'; status: 'active' | 'inactive' };
type AttendanceRow = {
  id: string; accountId: string; name: string; role: string; date: string;
  loginTime: string; logoutTime: string; punchIn: string; punchOut: string;
  duration: string; status: string; openPunch: boolean; openLogin?: boolean;
};
type Punch = { id: string; punchedInAt: string; punchedOutAt: string | null; punchInLabel?: string; punchOutLabel?: string };

const fieldClass = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-forest focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest';

export function AccountProfile() {
  const [account, setAccount] = useState<(Account & { hasPhoto?: boolean }) | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [photoVersion, setPhotoVersion] = useState(0);
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'ok' | 'error'>('ok');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/accounts/me', { cache: 'no-store' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!body?.account) return;
        setAccount(body.account);
        setFullName(body.account.fullName ?? '');
        setEmail(body.account.email ?? '');
        setPhone(body.account.phone ?? '');
      })
      .catch(() => undefined);
  }, []);

  const upload = async (file: File) => {
    setBusy(true);
    setMessage('');
    const data = new FormData();
    data.set('photo', file);
    const response = await fetch('/api/photos', { method: 'POST', body: data });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setTone('error');
      setMessage(body.message || 'Could not save the photo.');
      return;
    }
    setAccount((current) => current ? { ...current, hasPhoto: true } : current);
    setPhotoVersion((value) => value + 1);
    setTone('ok');
    setMessage('Profile photo saved.');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password && password !== confirm) {
      setTone('error');
      setMessage('The new password and confirmation do not match.');
      return;
    }
    setBusy(true);
    setMessage('');
    const response = await fetch('/api/accounts/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        password: password || undefined,
        currentPassword: currentPassword || undefined,
      }),
    });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setTone('error');
      setMessage(body.message || 'Could not save those changes.');
      return;
    }
    setAccount(body.account);
    setPassword('');
    setConfirm('');
    setCurrentPassword('');
    setTone('ok');
    setMessage('Your profile was saved.');
  };

  if (!account) {
    return <Skeleton label="Loading your profile" />;
  }

  return (
    <form id="account-settings" onSubmit={save} className="rounded-2xl border border-border bg-white p-5 flex flex-col gap-3 max-w-xl">
      <h2 className="text-lg font-semibold">Profile settings</h2>
      <div className="flex items-center gap-4">
        {account.hasPhoto ? (
          <img src={`/api/photos?v=${photoVersion}`} alt="" className="h-16 w-16 rounded-full object-cover border border-border" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-forest text-white grid place-items-center font-semibold">{account.fullName.slice(0, 1)}</div>
        )}
        <label className="text-xs font-semibold">
          Profile photo
          <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block font-normal" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); }} />
        </label>
      </div>
      <label className="text-xs font-semibold">Full name
        <input className={`${fieldClass} mt-1 font-normal`} value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </label>
      <label className="text-xs font-semibold">Phone number
        <input className={`${fieldClass} mt-1 font-normal`} value={phone} onChange={(event) => setPhone(event.target.value)} required />
      </label>
      <label className="text-xs font-semibold">Email address
        <input type="email" className={`${fieldClass} mt-1 font-normal`} value={email} onChange={(event) => setEmail(event.target.value)} required />
      </label>
      <label className="text-xs font-semibold">Current password
        <input type="password" className={`${fieldClass} mt-1 font-normal`} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
      </label>
      <label className="text-xs font-semibold">New password
        <input type="password" className={`${fieldClass} mt-1 font-normal`} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" />
      </label>
      <label className="text-xs font-semibold">Confirm new password
        <input type="password" className={`${fieldClass} mt-1 font-normal`} value={confirm} onChange={(event) => setConfirm(event.target.value)} autoComplete="new-password" />
      </label>
      <button type="submit" disabled={busy} className="pill-button-forest py-2.5 text-sm">{busy ? 'Saving' : 'Save changes'}</button>
      {message && <Notice tone={tone}>{message}</Notice>}
    </form>
  );
}

export function UserManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [notice, setNotice] = useState('');
  const [tone, setTone] = useState<'ok' | 'error'>('ok');
  const [editing, setEditing] = useState<(Account & { password?: string }) | null>(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'student', password: '', status: 'active', courseId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/accounts', { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setTone('error');
      setNotice(body.message || 'Accounts could not be loaded.');
      return;
    }
    setAccounts(body.accounts ?? []);
    setPrograms(body.courses ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => accounts.filter((account) => {
    const haystack = `${account.fullName} ${account.email} ${account.phone}`.toLowerCase();
    if (query && !haystack.includes(query.trim().toLowerCase())) return false;
    if (role !== 'all' && account.role !== role) return false;
    if (status !== 'all' && account.status !== status) return false;
    return true;
  }), [accounts, query, role, status]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice('');
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setTone('error');
      setNotice(body.message || 'The account was not created.');
      return;
    }
    setForm({ fullName: '', email: '', phone: '', role: 'student', password: '', status: 'active', courseId: '' });
    setTone('ok');
    setNotice(`${body.account.fullName} can sign in with the password you set.`);
    load();
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const response = await fetch('/api/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setTone('error');
      setNotice(body.message || 'The account was not updated.');
      return;
    }
    setEditing(null);
    setTone('ok');
    setNotice('Account updated.');
    load();
  };

  const toggleStatus = async (account: Account) => {
    const next = account.status === 'active' ? 'inactive' : 'active';
    const verb = next === 'inactive' ? 'Deactivate' : 'Activate';
    if (!window.confirm(`${verb} ${account.fullName}?`)) return;
    const response = await fetch('/api/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: account.id, status: next }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setTone('error');
      setNotice(body.message || 'Status was not changed.');
      return;
    }
    setTone('ok');
    setNotice(`${account.fullName} is now ${next}.`);
    load();
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-lg font-semibold">Create New Account</h2>
        <p className="mt-1 text-xs text-muted-foreground">Create a staff or student account. Administrator accounts are not created from this form.</p>
        <form onSubmit={create} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required className={fieldClass} placeholder="Full name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
          <input required type="email" className={fieldClass} placeholder="Email address" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input required className={fieldClass} placeholder="Phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <select className={fieldClass} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option value="staff">Create Staff Account</option>
            <option value="student">Create Student Account</option>
          </select>
          <select className={fieldClass} value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })}>
            <option value="">Assigned course (optional)</option>
            {programs.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <select className={fieldClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input required minLength={8} type="password" className={fieldClass} placeholder="Password (at least 8 characters)" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <button type="submit" className="pill-button-forest py-2.5 text-sm">Create account</button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">View All Accounts</h2>
            <p className="text-xs text-muted-foreground">Search and filter staff and student accounts.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className={fieldClass} placeholder="Search name, email, or phone" value={query} onChange={(event) => setQuery(event.target.value)} />
            <select className={fieldClass} value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="all">All roles</option>
              <option value="staff">Staff</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <select className={fieldClass} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        {notice && <div className="mt-3"><Notice tone={tone}>{notice}</Notice></div>}
        {loading ? <Skeleton label="Loading accounts" /> : rows.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No accounts match that search.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Phone</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((account) => (
                  <tr key={account.id} className="border-t border-border">
                    <td className="py-3 pr-3">{account.fullName}</td>
                    <td className="py-3 pr-3">{account.email}</td>
                    <td className="py-3 pr-3">{account.phone}</td>
                    <td className="py-3 pr-3 capitalize">{account.role}</td>
                    <td className="py-3 pr-3 capitalize">{account.status}</td>
                    <td className="py-3">
                      {account.role === 'admin' ? (
                        <span className="text-xs text-muted-foreground">Protected</span>
                      ) : (
                        <span className="flex flex-wrap gap-2">
                          <button type="button" className="text-xs text-forest underline" onClick={() => setEditing({ ...account, password: '' })}>Edit</button>
                          <button type="button" className="text-xs text-forest underline" onClick={() => toggleStatus(account)}>
                            {account.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <form onSubmit={saveEdit} className="rounded-2xl border border-border bg-white p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <h2 className="md:col-span-2 text-lg font-semibold">Edit {editing.fullName}</h2>
          <input className={fieldClass} value={editing.fullName} onChange={(event) => setEditing({ ...editing, fullName: event.target.value })} />
          <input className={fieldClass} value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} />
          <input className={fieldClass} value={editing.phone} onChange={(event) => setEditing({ ...editing, phone: event.target.value })} />
          <input type="password" className={fieldClass} placeholder="Reset password (leave blank to keep)" value={editing.password ?? ''} onChange={(event) => setEditing({ ...editing, password: event.target.value })} />
          <div className="flex gap-2">
            <button type="submit" className="pill-button-forest px-4 py-2 text-sm">Save</button>
            <button type="button" className="rounded-full border border-border px-4 py-2 text-sm" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AttendanceDesk() {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [summary, setSummary] = useState({ records: 0, inProgress: 0, present: 0 });
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date: '', role: 'all', name: '', status: 'all' });
  const [history, setHistory] = useState<{ account?: { fullName: string }; logins: { id: string; loginLabel: string; logoutLabel: string }[]; punches: { id: string; punchInLabel: string; punchOutLabel: string; duration: string }[] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.role !== 'all') params.set('role', filters.role);
    if (filters.name) params.set('name', filters.name);
    if (filters.status !== 'all') params.set('status', filters.status);
    const response = await fetch(`/api/attendance?${params.toString()}`, { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) return;
    setRows(body.rows ?? []);
    setSummary(body.summary ?? { records: 0, inProgress: 0, present: 0 });
    setToday(body.today ?? '');
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openHistory = async (accountId: string) => {
    const response = await fetch(`/api/attendance?accountId=${accountId}`, { cache: 'no-store' });
    if (response.ok) setHistory(await response.json());
  };

  const exportHref = `/api/attendance?format=csv&date=${encodeURIComponent(filters.date)}&role=${encodeURIComponent(filters.role)}&name=${encodeURIComponent(filters.name)}&status=${encodeURIComponent(filters.status)}`;

  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Attendance Management</h2>
          <p className="text-xs text-muted-foreground">Login and logout are separate from classroom punch-in and punch-out. Times use Asia/Kolkata.</p>
        </div>
        <a href={exportHref} className="text-sm text-forest underline">Export CSV</a>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Summary label="Today's records" value={summary.records} hint={today} />
        <Summary label="Present today" value={summary.present} />
        <button type="button" onClick={() => setFilters({ ...filters, status: 'open', date: today })} className="rounded-xl border border-border bg-background p-4 text-left hover:border-forest">
          <span className="block text-xs text-muted-foreground">Not punched out</span>
          <span className="text-2xl font-semibold">{summary.inProgress}</span>
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input type="date" className={fieldClass} value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
        <select className={fieldClass} value={filters.role} onChange={(event) => setFilters({ ...filters, role: event.target.value })}>
          <option value="all">All roles</option>
          <option value="staff">Staff</option>
          <option value="student">Student</option>
        </select>
        <input className={fieldClass} placeholder="Name" value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} />
        <select className={fieldClass} value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="all">All statuses</option>
          <option value="Present">Present</option>
          <option value="In Progress">In Progress</option>
          <option value="open">Not punched out</option>
        </select>
      </div>
      {loading ? <Skeleton label="Loading attendance" /> : rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No recorded attendance matches these filters.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {['Name', 'Role', 'Date', 'Login Time', 'Logout Time', 'Punch-In', 'Punch-Out', 'Total Duration', 'Status'].map((heading) => (
                  <th key={heading} className="py-2 pr-3">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="py-3 pr-3">
                    <button type="button" className="text-forest underline" onClick={() => openHistory(row.accountId)}>{row.name}</button>
                  </td>
                  <td className="py-3 pr-3 capitalize">{row.role}</td>
                  <td className="py-3 pr-3">{row.date}</td>
                  <td className="py-3 pr-3">{row.loginTime || '—'}</td>
                  <td className="py-3 pr-3">{row.logoutTime || (row.openLogin ? 'In Progress' : '—')}</td>
                  <td className="py-3 pr-3">{row.punchIn || '—'}</td>
                  <td className="py-3 pr-3">{row.punchOut || (row.openPunch ? 'In Progress' : '—')}</td>
                  <td className="py-3 pr-3">{row.duration || '—'}</td>
                  <td className="py-3 pr-3">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {history?.account && (
        <div className="mt-5 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold">Attendance history · {history.account.fullName}</h3>
            <button type="button" className="text-xs text-forest" onClick={() => setHistory(null)}>Close</button>
          </div>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {history.punches.length === 0 && history.logins.length === 0 && <li className="text-muted-foreground">No history recorded.</li>}
            {history.punches.map((row) => (
              <li key={row.id}>Punch {row.punchInLabel} → {row.punchOutLabel || 'In Progress'} · {row.duration}</li>
            ))}
            {history.logins.map((row) => (
              <li key={row.id}>Login {row.loginLabel} → {row.logoutLabel || 'In Progress'}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function CertifiedPrograms({
  mode,
}: {
  mode: 'admin' | 'staff' | 'student';
}) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [links, setLinks] = useState<CourseLink[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [roster, setRoster] = useState<{ id: string; fullName: string; courseIds: string[] }[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assignAccount, setAssignAccount] = useState('');
  const [assignCourse, setAssignCourse] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch('/api/programs', { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) return;
    setPrograms(body.programs ?? []);
    setLinks(body.links ?? []);
    setCounts(body.counts ?? {});
    setRoster(body.roster ?? []);
    if (mode === 'admin') {
      const accountsResponse = await fetch('/api/accounts', { cache: 'no-store' });
      if (accountsResponse.ok) {
        const accountsBody = await accountsResponse.json();
        setAccounts((accountsBody.accounts ?? []).filter((account: Account) => account.role !== 'admin'));
      }
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const visible = programs.filter((course) => course.title.toLowerCase().includes(query.trim().toLowerCase()));
  const mine = (courseId: string) => links.find((link) => link.courseId === courseId);
  const enrolled = programs.filter((course) => mine(course.id)?.status === 'enrolled');
  const assigned = mode === 'staff' ? enrolled : enrolled;

  const request = async (courseId: string) => {
    const response = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? 'Enrollment request saved.' : (body.message || 'Could not save the request.'));
    if (response.ok) load();
  };

  const assign = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: assignAccount, courseId: assignCourse }),
    });
    const body = await response.json().catch(() => ({}));
    setNotice(response.ok ? 'Course assigned.' : (body.message || 'Could not assign that course.'));
    if (response.ok) load();
  };

  if (loading) return <Skeleton label="Loading certified programs" />;

  return (
    <div className="flex flex-col gap-6">
      {notice && <Notice tone={notice.includes('not') || notice.includes('already') || notice.includes('Could') ? 'error' : 'ok'}>{notice}</Notice>}
      {mode !== 'admin' && (
        <section>
          <h2 className="text-lg font-semibold">{mode === 'student' ? 'Enrolled Courses' : 'Assigned Courses'}</h2>
          {assigned.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">{mode === 'student' ? 'You are not enrolled in a course yet. Approved requests appear here.' : 'No courses are assigned to you yet.'}</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              {assigned.map((course) => (
                <CourseCard key={course.id} course={course} status="Enrolled" mode={mode} count={mode === 'student' ? undefined : counts[course.id]} />
              ))}
            </div>
          )}
          {mode === 'staff' && (
            <div className="mt-4 rounded-2xl border border-border bg-white p-4">
              <h3 className="font-semibold text-sm">Assigned students</h3>
              {roster.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No students are enrolled in your assigned courses yet.</p> : (
                <ul className="mt-2 text-sm">{roster.map((student) => <li key={student.id}>{student.fullName}</li>)}</ul>
              )}
            </div>
          )}
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{mode === 'student' ? 'Should Enroll' : 'Certified Programs'}</h2>
            <p className="text-xs text-muted-foreground">{mode === 'student' ? 'Explore published courses and request enrolment.' : 'Published courses from the website catalogue.'}</p>
          </div>
          <div className="flex items-center gap-3">
            <input className={fieldClass} placeholder="Search programs" value={query} onChange={(event) => setQuery(event.target.value)} />
            <Link href="/course" className="text-sm text-forest whitespace-nowrap underline">View All Programs</Link>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(mode === 'student' ? visible.filter((course) => mine(course.id)?.status !== 'enrolled') : visible).map((course) => {
            const link = mine(course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                mode={mode}
                count={mode === 'student' ? undefined : counts[course.id]}
                status={mode === 'student' ? (link?.status === 'enrolled' ? 'Enrolled' : link?.status === 'requested' ? 'Request Pending' : link?.status === 'rejected' ? 'Rejected' : 'Available') : undefined}
                action={mode === 'student' && link?.status === 'requested' ? <span className="text-sm text-muted-foreground">Request Pending</span> : mode === 'student' && link?.status !== 'enrolled' ? <button type="button" className="rounded-lg border border-border px-3 py-2 text-sm" onClick={() => request(course.id)}>Request enrolment</button> : null}
              />
            );
          })}
        </div>
        {visible.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No programs match that search.</p>}
      </section>

      {mode === 'admin' && (
        <form onSubmit={assign} className="rounded-2xl border border-border bg-white p-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          <h3 className="md:col-span-3 font-semibold">Assign a student or staff member</h3>
          <select required className={fieldClass} value={assignAccount} onChange={(event) => setAssignAccount(event.target.value)}>
            <option value="">Account</option>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.fullName} · {account.role}</option>)}
          </select>
          <select required className={fieldClass} value={assignCourse} onChange={(event) => setAssignCourse(event.target.value)}>
            <option value="">Course</option>
            {programs.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
          <button type="submit" className="pill-button-forest py-2.5 text-sm">Assign course</button>
        </form>
      )}
    </div>
  );
}

export function PunchCard() {
  const [punches, setPunches] = useState<Punch[]>([]);
  const [today, setToday] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'ok' | 'error'>('ok');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch('/api/attendance', { cache: 'no-store' });
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) return;
    setPunches(body.punches ?? []);
    setToday(body.today ?? '');
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const open = punches.find((row) => !row.punchedOutAt);
  const todayPunch = punches.find((row) => kolkataDate(row.punchedInAt) === today);
  const completed = Boolean(todayPunch?.punchedOutAt && !open);

  const act = async (action: 'punch-in' | 'punch-out') => {
    setBusy(true);
    setMessage('');
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) {
      setTone('error');
      setMessage(body.message || 'Attendance was not recorded.');
      return;
    }
    setTone('ok');
    setMessage(action === 'punch-in' ? 'Punch-in recorded.' : 'Punch-out recorded.');
    load();
  };

  const clock = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).format(now);
  const dateLabel = today || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);

  return (
    <section className="rounded-2xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Today&apos;s attendance</h2>
          <p className="text-sm text-muted-foreground">{dateLabel} · {clock}</p>
          {loading ? <p className="mt-3 text-sm text-muted-foreground">Loading attendance</p> : (
            <p className="mt-3 text-sm">
              Status: <strong>{open ? 'Present / In Progress' : completed ? 'Completed' : 'Not Started'}</strong>
            </p>
          )}
          {open && <p className="text-sm mt-1">Punch-in {open.punchInLabel} · Elapsed {elapsed(open.punchedInAt, now)}</p>}
          {completed && todayPunch && (
            <p className="text-sm mt-1">Punch-in {todayPunch.punchInLabel} · Punch-out {todayPunch.punchOutLabel} · {elapsed(todayPunch.punchedInAt, new Date(todayPunch.punchedOutAt!))}</p>
          )}
        </div>
        {!loading && (
          open ? (
            <button type="button" disabled={busy} onClick={() => act('punch-out')} className="min-w-40 rounded-2xl bg-forest px-6 py-4 text-base font-semibold text-white hover:bg-forest/90 disabled:opacity-60">
              {busy ? 'Saving' : 'Punch Out'}
            </button>
          ) : (
            <button type="button" disabled={busy || Boolean(completed)} onClick={() => act('punch-in')} className="min-w-40 rounded-2xl bg-forest px-6 py-4 text-base font-semibold text-white hover:bg-forest/90 disabled:opacity-60">
              {busy ? 'Saving' : 'Punch In'}
            </button>
          )
        )}
      </div>
      {message && <div className="mt-3"><Notice tone={tone}>{message}</Notice></div>}
      <div className="mt-5">
        <h3 className="text-sm font-semibold">Attendance history</h3>
        {punches.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No attendance records yet.</p> : (
          <ul className="mt-2 flex flex-col gap-2 text-sm">
            {punches.map((row) => (
              <li key={row.id} className="rounded-lg border border-border px-3 py-2">
                {row.punchInLabel} → {row.punchOutLabel || 'In Progress'}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CourseCard({
  course, status, count, action, mode,
}: {
  course: Program;
  status?: string;
  count?: number;
  action?: React.ReactNode;
  mode: 'admin' | 'staff' | 'student';
}) {
  const href = mode === 'admin' ? `/admin/courses/${course.id}` : mode === 'staff' ? `/staff/courses/${course.id}` : `/student/courses/${course.id}`;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-forest">
      <img src={course.image} alt="" width={640} height={360} loading="eager" decoding="async" className="h-40 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold leading-snug">{course.title}</h3>
        <p className="text-xs text-muted-foreground">{course.categoryName || 'Uncategorised'}</p>
        <p className="text-sm text-muted-foreground">{course.duration}</p>
        {course.fee && <p className="text-sm font-semibold">{course.fee}</p>}
        {status && <p className="text-xs">Enrollment status: {status}</p>}
        {typeof count === 'number' && <p className="text-xs text-muted-foreground">{`${count} student ${count === 1 ? 'enrollment' : 'enrollments'}`}</p>}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Link href={href} className="inline-flex rounded-lg bg-forest px-3 py-2 text-sm font-semibold text-white">View Course</Link>
          {action}
        </div>
      </div>
    </article>
  );
}

function kolkataDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

function elapsed(start: string, end: Date) {
  const minutes = Math.max(0, Math.floor((end.getTime() - new Date(start).getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="capitalize">{value}</dd>
    </div>
  );
}

function Summary({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold">{value}</span>
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}

function Notice({ tone, children }: { tone: 'ok' | 'error'; children: React.ReactNode }) {
  return (
    <p role="status" className={`rounded-lg border px-3 py-2 text-sm ${tone === 'ok' ? 'border-forest/30 bg-forest/10' : 'border-safety-orange/40 bg-yellow/20'}`}>{children}</p>
  );
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground" aria-busy="true">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}
