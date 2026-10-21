import { NextResponse } from 'next/server';
import { listRegistrationRequests, reviewRegistration } from '@/lib/server/institute-db';
import { requireRole } from '@/lib/server/session';

export async function GET() {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can view registration requests.' }, { status: 403 });
  const requests = listRegistrationRequests();
  return NextResponse.json({
    requests,
    pending: requests.filter((item) => item.status === 'pending').length,
  });
}

export async function POST(request: Request) {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can review registration requests.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const id = String(body?.id ?? '');
  const action = body?.action;
  if (!id || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ message: 'Choose a request to approve or reject.' }, { status: 400 });
  }
  const result = reviewRegistration(id, action === 'approve' ? 'approved' : 'rejected');
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 409 });
  return NextResponse.json({ ok: true, status: result.status });
}
