import { NextResponse } from 'next/server';
import { closeOpenLogin, SESSION_COOKIE } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export async function POST() {
  const account = currentAccount();
  if (account) closeOpenLogin(account.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
