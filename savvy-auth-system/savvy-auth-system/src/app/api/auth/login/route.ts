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
  let result;
  try {
    result = authenticate(identifier, password, role);
  } catch (error) {
    console.error('Sign-in could not be completed.', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ ok: false, message: 'Sign-in failed. Try again.' }, { status: 500 });
  }
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
  let token: string;
  try {
    token = signSession(result.account);
  } catch (error) {
    console.error('Sign-in session could not be created.', error instanceof Error ? error.message : 'unknown error');
    const missingSecret = error instanceof Error && error.message === 'SESSION_SECRET is not configured';
    return NextResponse.json({
      ok: false,
      message: missingSecret
        ? 'Sign-in is not available until the server session key is configured.'
        : 'Sign-in failed. Try again.',
    }, { status: missingSecret ? 503 : 500 });
  }
  const response = NextResponse.json({ ok: true, account: publicAccount(result.account) });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
