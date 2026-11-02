import { readFileSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { getContactEnquiry, privateUploadPath } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

const TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

export async function GET(request: Request) {
  const account = currentAccount();
  if (!account || account.role !== 'admin') {
    return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id') || '';
  const name = url.searchParams.get('name') || '';
  const enquiry = getContactEnquiry(id);
  if (!enquiry) {
    return NextResponse.json({ ok: false, message: 'Enquiry not found.' }, { status: 404 });
  }

  const allowed = [enquiry.cvFile, ...(enquiry.attachments ?? [])].filter(Boolean) as string[];
  const fileName = name || enquiry.cvFile || '';
  if (!fileName || !allowed.includes(fileName)) {
    return NextResponse.json({ ok: false, message: 'That file is not attached to this enquiry.' }, { status: 404 });
  }

  const folder = enquiry.cvFile === fileName ? 'cvs' : 'accreditation';
  const full = privateUploadPath(folder, fileName);
  if (!full) {
    return NextResponse.json({ ok: false, message: 'The file is no longer stored.' }, { status: 404 });
  }

  const extension = path.extname(fileName).toLowerCase();
  return new NextResponse(readFileSync(full), {
    headers: {
      'Content-Type': TYPES[extension] || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
