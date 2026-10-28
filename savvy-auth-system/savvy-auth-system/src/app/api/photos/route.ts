import { NextResponse } from 'next/server';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { photoFile, setPhoto } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

const TYPES: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

export async function GET() {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to view your photo.' }, { status: 401 });
  const file = photoFile(account.id);
  if (!file || !existsSync(file)) return new NextResponse(null, { status: 404 });
  const ext = path.extname(file);
  const type = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return new NextResponse(readFileSync(file), { headers: { 'Content-Type': type, 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to update your photo.' }, { status: 401 });
  const form = await request.formData().catch(() => null);
  const file = form?.get('photo');
  if (!(file instanceof File)) return NextResponse.json({ message: 'Choose an image.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ message: 'Upload a JPG, PNG, or WebP image.' }, { status: 400 });
  if (file.size > 1_500_000) return NextResponse.json({ message: 'That image is too large. Choose one under 1.5 MB.' }, { status: 400 });
  const dir = path.join(process.cwd(), 'data', 'photos');
  mkdirSync(dir, { recursive: true });
  const filename = `${account.id}${ext}`;
  writeFileSync(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  setPhoto(account.id, filename);
  return NextResponse.json({ ok: true });
}
