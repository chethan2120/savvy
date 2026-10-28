import { NextResponse } from 'next/server';
import { publicAccount } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export async function GET() {
  const account = currentAccount();
  if (!account) return NextResponse.json({ account: null }, { status: 401 });
  return NextResponse.json({ account: publicAccount(account) });
}
