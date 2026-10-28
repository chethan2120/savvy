import { NextResponse } from 'next/server';
import { subscribeNewsletter } from '@/lib/server/institute-db';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email ?? '');

    if (!email || !email.includes('@')) {
      return NextResponse.json({ ok: false, message: 'Please provide a valid email address.' }, { status: 400 });
    }

    const result = subscribeNewsletter(email);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    return NextResponse.json({ ok: false, message: 'Unable to process subscription right now.' }, { status: 500 });
  }
}
