import { NextResponse } from 'next/server';
import { deletePortalItem, listPortalItems, savePortalItem } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const manage = new URL(request.url).searchParams.get('manage') === '1';
  const account = currentAccount();
  if (manage && account?.role !== 'admin') {
    return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
  }
  return NextResponse.json({ ok: true, items: listPortalItems(manage) });
}

export async function POST(request: Request) {
  const account = currentAccount();
  if (account?.role !== 'admin') {
    return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const result = savePortalItem(body || {});
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

export async function DELETE(request: Request) {
  const account = currentAccount();
  if (account?.role !== 'admin') {
    return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
  }
  const id = new URL(request.url).searchParams.get('id') || '';
  const result = deletePortalItem(id);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
