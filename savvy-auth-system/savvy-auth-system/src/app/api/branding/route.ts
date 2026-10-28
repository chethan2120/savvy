import { NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { brandingFile, brandingState, publicIdentity, setBranding, setSignatory } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

const TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
};

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

export async function GET(request: Request) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to view institute assets.' }, { status: 401 });
  const asset = new URL(request.url).searchParams.get('asset');
  if (asset !== 'seal' && asset !== 'signature') return NextResponse.json(publicIdentity(brandingState()));
  const file = brandingFile(asset);
  if (!file || !existsSync(file)) return new NextResponse(null, { status: 404 });
  const ext = path.extname(file).toLowerCase();
  return new NextResponse(readFileSync(file), {
    headers: { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'private, no-store' },
  });
}

export async function POST(request: Request) {
  const account = currentAccount();
  if (!account || account.role !== 'admin') {
    return NextResponse.json({ message: 'Only an administrator can update the institute seal or signature.' }, { status: 403 });
  }
  const form = await request.formData().catch(() => null);
  const kind = form?.get('kind');
  if (kind === 'identity') {
    const name = String(form?.get('signatoryName') ?? '').trim();
    const designation = String(form?.get('signatoryDesignation') ?? '').trim();
    if (name.length > 80 || designation.length > 80) {
      return NextResponse.json({ message: 'The signatory name and designation must be 80 characters or fewer.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, identity: setSignatory(name, designation) });
  }
  if (kind !== 'seal' && kind !== 'signature') return NextResponse.json({ message: 'Choose the seal or the signature.' }, { status: 400 });
  if (form?.get('remove') === '1') {
    const current = brandingFile(kind);
    if (current && existsSync(current)) unlinkSync(current);
    setBranding(kind, null);
    return NextResponse.json({ ok: true, identity: publicIdentity() });
  }
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ message: 'Choose an image.' }, { status: 400 });
  if (file.type === 'image/webp') {
    return NextResponse.json({ message: 'WebP cannot be embedded in the certificate PDF. Upload a PNG or JPG. A transparent PNG is preferred.' }, { status: 400 });
  }
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ message: 'Upload a PNG or JPG image. A transparent PNG is preferred for the seal and signature.' }, { status: 400 });
  if (file.size <= 0) return NextResponse.json({ message: 'That file is empty.' }, { status: 400 });
  if (file.size > 1_500_000) return NextResponse.json({ message: 'That image is too large. Choose one under 1.5 MB.' }, { status: 400 });
  const dir = path.join(process.cwd(), 'data', 'branding');
  mkdirSync(dir, { recursive: true });
  const filename = `${kind}${ext}`;
  for (const old of ['.png', '.jpg']) {
    const previous = path.join(dir, `${kind}${old}`);
    if (old !== ext && existsSync(previous)) unlinkSync(previous);
  }
  writeFileSync(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  setBranding(kind, filename);
  return NextResponse.json({ ok: true, identity: publicIdentity() });
}
