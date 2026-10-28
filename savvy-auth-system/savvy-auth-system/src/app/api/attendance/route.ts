import { NextResponse } from 'next/server';
import { attendanceRows, historyFor, punchIn, punchOut, punchesFor, todayKey, formatInstituteTime } from '@/lib/server/institute-db';
import { currentAccount, requireRole } from '@/lib/server/session';

export async function GET(request: Request) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to view attendance.' }, { status: 401 });
  const url = new URL(request.url);
  if (account.role === 'admin' && url.searchParams.get('accountId')) {
    return NextResponse.json(historyFor(url.searchParams.get('accountId')!));
  }
  if (account.role !== 'admin') {
    const mine = punchesFor(account.id).map((row) => ({
      ...row,
      punchInLabel: formatInstituteTime(row.punchedInAt),
      punchOutLabel: formatInstituteTime(row.punchedOutAt),
    }));
    return NextResponse.json({ punches: mine, today: todayKey() });
  }
  const rows = attendanceRows({
    date: url.searchParams.get('date') || undefined,
    role: url.searchParams.get('role') || undefined,
    name: url.searchParams.get('name') || undefined,
    status: url.searchParams.get('status') || undefined,
  });
  if (url.searchParams.get('format') === 'csv') {
    const header = 'Name,Role,Date,Login Time,Logout Time,Punch-In,Punch-Out,Total Duration,Status';
    const lines = rows.map((row) => [row.name, row.role, row.date, row.loginTime, row.logoutTime || (row.status === 'In Progress' ? 'In Progress' : ''), row.punchIn, row.punchOut, row.duration, row.status]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
    return new NextResponse([header, ...lines].join('\n'), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="attendance.csv"' },
    });
  }
  const today = todayKey();
  const todayRows = attendanceRows({ date: today });
  return NextResponse.json({
    rows,
    today,
    summary: {
      records: todayRows.length,
      inProgress: todayRows.filter((row) => row.openPunch).length,
      present: todayRows.filter((row) => row.status === 'Present').length,
    },
  });
}

export async function POST(request: Request) {
  const account = requireRole(['student', 'staff']);
  if (!account) return NextResponse.json({ message: 'Only a signed-in student or staff member can punch attendance.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const result = body.action === 'punch-out' ? punchOut(account.id) : body.action === 'punch-in' ? punchIn(account.id) : null;
  if (!result) return NextResponse.json({ message: 'Choose punch-in or punch-out.' }, { status: 400 });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 409 });
  return NextResponse.json({ record: result.record, today: todayKey() });
}
