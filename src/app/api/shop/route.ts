import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import {
  deleteShopProduct,
  listShopProducts,
  privateUploadPath,
  savePrivateUpload,
  saveShopProduct,
} from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

function adminOnly() {
  const account = currentAccount();
  if (!account || account.role !== 'admin') return null;
  return account;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fileId = url.searchParams.get('file');
  if (fileId) {
    if (!adminOnly()) {
      return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
    }
    const product = listShopProducts(true).find((item) => item.id === fileId);
    if (!product?.fileName) {
      return NextResponse.json({ ok: false, message: 'No file is stored for this product.' }, { status: 404 });
    }
    const full = privateUploadPath('shop', product.fileName);
    if (!full) return NextResponse.json({ ok: false, message: 'The file is no longer stored.' }, { status: 404 });
    return new NextResponse(readFileSync(full), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${path.basename(product.fileName)}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  const manage = url.searchParams.get('manage') === '1';
  if (manage && !adminOnly()) {
    return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
  }
  return NextResponse.json({ ok: true, products: listShopProducts(manage) });
}

export async function POST(request: Request) {
  if (!adminOnly()) {
    return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
  }
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ ok: false, message: 'Invalid product.' }, { status: 400 });
    const result = saveShopProduct({
      id: body.id ? String(body.id) : undefined,
      title: String(body.title || ''),
      format: body.format != null ? String(body.format) : undefined,
      includes: Array.isArray(body.includes) ? body.includes.map(String) : String(body.includes || '').split('\n'),
      priceGbp: body.priceGbp === '' || body.priceGbp == null ? null : Number(body.priceGbp),
      published: body.published !== false && body.published !== 'false',
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  const form = await request.formData();
  const file = form.get('file');
  let fileName: string | null | undefined;
  if (file instanceof File && file.size > 0) {
    const saved = savePrivateUpload('shop', randomBytes(8).toString('hex'), file.name, Buffer.from(await file.arrayBuffer()));
    if (!saved.ok) return NextResponse.json({ ok: false, message: saved.message }, { status: 400 });
    fileName = saved.fileName;
  }
  const priceRaw = String(form.get('priceGbp') || '');
  const result = saveShopProduct({
    id: form.get('id') ? String(form.get('id')) : undefined,
    title: String(form.get('title') || ''),
    format: String(form.get('format') || ''),
    includes: String(form.get('includes') || '').split('\n'),
    priceGbp: priceRaw === '' ? null : Number(priceRaw),
    published: String(form.get('published') || 'true') !== 'false',
    fileName,
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}

export async function DELETE(request: Request) {
  if (!adminOnly()) {
    return NextResponse.json({ ok: false, message: 'Administrator access is required.' }, { status: 403 });
  }
  const id = new URL(request.url).searchParams.get('id') || '';
  const result = deleteShopProduct(id);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
