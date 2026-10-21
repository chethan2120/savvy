'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { friendlyError } from '@/lib/friendly-error';
import { formatStudy } from '@/lib/lessons';
import { Empty } from '@/components/portal/ui';
import type { StudentProfile } from '@/lib/types';

export function StudentStudy({
  studentId,
  courses,
}: {
  studentId?: string;
  courses: { course_id: string; title: string; expected_hours?: number }[];
}) {
  const [seconds, setSeconds] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!studentId) return;
    supabase.from('learning_sessions').select('course_id, credited_seconds').eq('student_id', studentId).then(({ data }) => {
      const totals: Record<string, number> = {};
      for (const row of data ?? []) totals[row.course_id] = (totals[row.course_id] ?? 0) + (row.credited_seconds ?? 0);
      setSeconds(totals);
    });
  }, [studentId]);

  const total = Object.values(seconds).reduce((sum, value) => sum + value, 0);
  if (!courses.length && total === 0) return <Empty label="Study time appears after you start a published lesson." />;

  return (
    <div className="editorial-card bg-surface p-5 flex flex-col gap-3">
      <p className="text-sm">Study time: {formatStudy(total)}</p>
      {courses.map((course) => {
        const tracked = seconds[course.course_id] ?? 0;
        const expected = course.expected_hours && course.expected_hours > 0 ? course.expected_hours : 40;
        const progress = Math.min(100, Math.round((tracked / (expected * 3600)) * 100));
        return (
          <div key={course.course_id} className="border border-border rounded-xl p-4 bg-background text-sm">
            <p className="font-semibold">{course.title}</p>
            <p className="text-xs text-muted-foreground mt-1">Study time: {formatStudy(tracked)}</p>
            <p className="text-xs text-muted-foreground">Expected hours: {expected} hours</p>
            <p className="text-xs text-muted-foreground">Progress: {progress}%</p>
          </div>
        );
      })}
    </div>
  );
}

export function StudentAttendance({ studentId }: { studentId?: string }) {
  const [rows, setRows] = useState<{ id: string; attendance_date: string; status: string; course_id: string }[]>([]);
  useEffect(() => {
    if (!studentId) return;
    supabase.from('student_attendance').select('id, attendance_date, status, course_id').eq('student_id', studentId).order('attendance_date', { ascending: false }).then(({ data }) => {
      setRows(data ?? []);
    });
  }, [studentId]);

  const present = rows.filter((row) => row.status === 'present').length;
  const absent = rows.filter((row) => row.status === 'absent').length;
  const late = rows.filter((row) => row.status === 'late').length;
  const percent = rows.length ? Math.round(((present + late) / rows.length) * 100) : 0;

  if (!rows.length) return <Empty label="No attendance has been recorded for you yet." />;
  return (
    <div className="editorial-card bg-surface p-5 flex flex-col gap-3 text-sm">
      <p>Present {present} · Absent {absent} · Late {late} · {percent}%</p>
      {rows.map((row) => (
        <p key={row.id} className="text-xs flex justify-between border-b border-border py-2">
          <span>{row.attendance_date}</span>
          <span className="capitalize">{row.status}</span>
        </p>
      ))}
    </div>
  );
}

export function StudentProfilePanel({ profile, onSaved }: { profile: StudentProfile | null; onSaved: () => void }) {
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [notice, setNotice] = useState('');
  useEffect(() => setPhone(profile?.phone ?? ''), [profile?.phone]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;
    const { error } = await supabase.from('students').update({ phone }).eq('id', profile.id);
    setNotice(error ? friendlyError(error, 'account') : 'Profile saved.');
    if (!error) onSaved();
  };
  if (!profile) return <Empty label="Your profile is not available yet." />;
  return (
    <form onSubmit={save} className="editorial-card bg-surface p-5 flex flex-col gap-3 max-w-md">
      <p className="text-sm font-semibold">{profile.full_name}</p>
      <p className="text-xs text-muted-foreground">{profile.email}</p>
      <p className="text-xs text-muted-foreground">Enrolment {profile.enrollment_no}</p>
      <p className="text-xs capitalize">Status: {profile.account_status ?? 'active'}</p>
      <label className="text-xs flex flex-col gap-1">
        Mobile number
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-sm" />
      </label>
      <button className="pill-button-forest text-xs py-2.5 self-start" type="submit">Save profile</button>
      {notice && <p className="text-xs">{notice}</p>}
    </form>
  );
}
