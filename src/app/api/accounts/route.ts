import { NextResponse } from 'next/server';
import { createAccount, listAccounts, programs, updateAccount } from '@/lib/server/institute-db';
import { requireRole } from '@/lib/server/session';

export async function GET() {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can view accounts.' }, { status: 403 });
  return NextResponse.json({ accounts: listAccounts(), courses: programs() });
}

export async function POST(request: Request) {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can create accounts.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const fullName = String(body.fullName ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const role = body.role;
  const password = String(body.password ?? '');
  const status = body.status === 'inactive' ? 'inactive' : 'active';
  const courseId = body.courseId ? String(body.courseId) : undefined;
  if (!fullName || !email.includes('@') || phone.replace(/\D/g, '').length < 8) {
    return NextResponse.json({ message: 'Enter a name, a valid email, and a phone number.' }, { status: 400 });
  }
  if (role !== 'staff' && role !== 'student') {
    return NextResponse.json({ message: 'Choose Staff or Student. Administrator accounts are not created from this form.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ message: 'Set a password of at least 8 characters.' }, { status: 400 });
  }
  const result = createAccount({ fullName, email, phone, role, password, status, courseId });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 409 });
  return NextResponse.json({ account: result.account });
}

export async function PATCH(request: Request) {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can update accounts.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? '');
  const result = updateAccount(id, {
    fullName: body.fullName ? String(body.fullName) : undefined,
    email: body.email ? String(body.email) : undefined,
    phone: body.phone ? String(body.phone) : undefined,
    status: body.status === 'active' || body.status === 'inactive' ? body.status : undefined,
    password: body.password ? String(body.password) : undefined,
  });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
  return NextResponse.json({ account: result.account });
}
