import { NextResponse } from 'next/server';
import { saveWebsiteSettings, websiteSettings } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export async function GET() {
  try {
    return NextResponse.json(websiteSettings());
  } catch (error) {
    console.error('Website settings could not be read.', error instanceof Error ? error.message : 'read failed');
    return NextResponse.json({ show_recognitions: false, institute_name: 'Savvy Training Institute' });
  }
}

export async function POST(request: Request) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in as an administrator to update website settings.' }, { status: 401 });
  if (account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can update website settings.' }, { status: 403 });
  const body = await request.json().catch(() => null) as { show_recognitions?: unknown; institute_name?: unknown; default_currency?: unknown } | null;
  if (!body) {
    return NextResponse.json({ message: 'Invalid payload.' }, { status: 400 });
  }
  const result = saveWebsiteSettings({
    show_recognitions: typeof body.show_recognitions === 'boolean' ? body.show_recognitions : undefined,
    institute_name: typeof body.institute_name === 'string' ? body.institute_name : undefined,
    default_currency: typeof body.default_currency === 'string' ? (body.default_currency as any) : undefined,
  });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
  return NextResponse.json(result.settings);
}
