import { NextResponse } from 'next/server';
import { closeOpenLogin, SESSION_COOKIE } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

function performLogout() {
  const account = currentAccount();
  if (account) closeOpenLogin(account.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}

export async function POST() {
  return performLogout();
}

export async function GET() {
  return performLogout();
}
