import { NextResponse } from 'next/server';
import { authenticate, publicAccount, SESSION_COOKIE, signSession } from '@/lib/server/institute-db';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const identifier = String(body.identifier ?? '').trim();
  const password = String(body.password ?? '');
  const role = body.role;
  if (!identifier || !password) {
    return NextResponse.json({ ok: false, message: 'Enter your email or phone number and your password.' }, { status: 400 });
  }
  if (role !== 'admin' && role !== 'staff' && role !== 'student') {
    return NextResponse.json({ ok: false, message: 'Select Admin, Staff, or Student.' }, { status: 400 });
  }
  const result = authenticate(identifier, password, role);
  if (!result.ok) {
    const message = result.code === 'wrong-role'
      ? 'That account uses a different role. Choose the matching option.'
      : result.code === 'pending'
        ? 'Your account is awaiting administrator approval. You can sign in after it is approved.'
        : result.code === 'rejected'
          ? 'This application was not approved. You can submit it again from the student registration form.'
          : result.code === 'inactive'
            ? 'This account is deactivated. An administrator can activate it again.'
            : result.code === 'unknown'
              ? 'unknown'
              : 'That email or phone number and password do not match. Check both and try again.';
    return NextResponse.json({ ok: false, code: result.code, message }, { status: result.code === 'unknown' ? 404 : 401 });
  }
  const response = NextResponse.json({ ok: true, account: publicAccount(result.account) });
  response.cookies.set(SESSION_COOKIE, signSession(result.account), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
