import { NextResponse } from 'next/server';
import { publicAccount, updateOwnAccount } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export async function GET() {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to view your profile.' }, { status: 401 });
  return NextResponse.json({ account: publicAccount(account) });
}

export async function PATCH(request: Request) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to update your profile.' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const result = updateOwnAccount(account.id, {
    fullName: body.fullName !== undefined ? String(body.fullName) : undefined,
    email: body.email !== undefined ? String(body.email) : undefined,
    phone: body.phone !== undefined ? String(body.phone) : undefined,
    password: body.password ? String(body.password) : undefined,
    currentPassword: body.currentPassword ? String(body.currentPassword) : undefined,
  });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
  return NextResponse.json({ account: result.account });
}
