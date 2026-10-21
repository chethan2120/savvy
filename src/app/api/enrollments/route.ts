import { NextResponse } from 'next/server';
import { assignCourse, requestEnrollment } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export async function POST(request: Request) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const courseId = String(body.courseId ?? '');
  if (account.role === 'admin') {
    const result = assignCourse(String(body.accountId ?? ''), courseId);
    if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  if (account.role !== 'student') {
    return NextResponse.json({ message: 'Students request enrollment. Administrators assign courses.' }, { status: 403 });
  }
  const result = requestEnrollment(account.id, courseId);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 409 });
  return NextResponse.json({ ok: true });
}
