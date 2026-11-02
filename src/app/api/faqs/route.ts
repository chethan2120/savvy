import { NextResponse } from 'next/server';
import { listHomepageFaqs, saveHomepageFaqs } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, faqs: listHomepageFaqs() });
}

export async function POST(request: Request) {
  const account = currentAccount();
  if (!account || account.role !== 'admin') {
    return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.faqs) ? body.faqs : null;
  if (!items) return NextResponse.json({ ok: false, message: 'Send the FAQ list to save.' }, { status: 400 });
  const faqs = items.map((item: { id?: unknown; question?: unknown; answer?: unknown }) => ({
    id: typeof item?.id === 'string' ? item.id : '',
    question: typeof item?.question === 'string' ? item.question : '',
    answer: typeof item?.answer === 'string' ? item.answer : '',
  }));
  const result = saveHomepageFaqs(faqs);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
