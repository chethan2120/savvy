import { NextResponse } from 'next/server';
import { createAccount, listAccounts, programs, refreshCourseCatalog, updateAccount, deleteAccount } from '@/lib/server/institute-db';
import { requireRole } from '@/lib/server/session';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can view accounts.' }, { status: 403 });
  await refreshCourseCatalog();
  return NextResponse.json({ accounts: listAccounts(), courses: programs() });
}

export async function POST(request: Request) {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can create accounts.' }, { status: 403 });
  await refreshCourseCatalog();
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

export async function DELETE(request: Request) {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can delete accounts.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ message: 'Account ID is required.' }, { status: 400 });

  const result = deleteAccount(id, { force: Boolean(body.force) });
  if (!result.ok) {
    return NextResponse.json({
      message: result.message,
      canDeactivate: result.canDeactivate,
    }, { status: 400 });
  }

  // Safely clean up corresponding Supabase Auth user on the server if configured
  if (isSupabaseConfigured && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      if (body.email) {
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        const targetUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === String(body.email).toLowerCase()
        );
        if (targetUser?.id) {
          await adminClient.auth.admin.deleteUser(targetUser.id);
        }
      }
    } catch (err) {
      console.warn('Supabase auth deletion warning:', err);
    }
  }

  return NextResponse.json({ ok: true, message: result.message });
}
