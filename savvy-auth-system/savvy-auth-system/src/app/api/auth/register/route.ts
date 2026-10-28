import { NextResponse } from 'next/server';
import { submitRegistration } from '@/lib/server/institute-db';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'The registration details could not be read.' }, { status: 400 });
  }
  const result = submitRegistration({
    fullName: String(body.fullName ?? ''),
    email: String(body.email ?? ''),
    phone: String(body.phone ?? ''),
    password: String(body.password ?? ''),
    courseInterest: String(body.courseInterest ?? ''),
  });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
  return NextResponse.json({
    ok: true,
    message: result.resent
      ? 'Your application was sent again and is awaiting administrator approval.'
      : 'Your account is awaiting administrator approval. You can sign in after an administrator approves it.',
  });
}
