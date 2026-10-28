import { NextResponse } from 'next/server';
import { publicAccount } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export async function GET() {
  const account = currentAccount();
  if (!account) {
    return NextResponse.json({ authenticated: false, account: null }, { status: 200 });
  }
  return NextResponse.json({ authenticated: true, account: publicAccount(account) }, { status: 200 });
}
