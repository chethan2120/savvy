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
  const body = await request.json().catch(() => null) as { show_recognitions?: unknown; institute_name?: unknown } | null;
  if (!body || typeof body.show_recognitions !== 'boolean' || typeof body.institute_name !== 'string') {
    return NextResponse.json({ message: 'Send show_recognitions as true or false and an institute name.' }, { status: 400 });
  }
  const result = saveWebsiteSettings({ show_recognitions: body.show_recognitions, institute_name: body.institute_name });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
  return NextResponse.json(result.settings);
}
