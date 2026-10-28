import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = params.id.replace(/[^a-zA-Z0-9-]/g, '');
  if (!id) return new NextResponse(null, { status: 404 });
  const dir = path.join(process.cwd(), 'data', 'course-images');
  const file = ['.png', '.jpg', '.jpeg'].map((ext) => path.join(dir, `${id}${ext}`)).find((candidate) => existsSync(candidate));
  if (!file) return new NextResponse(null, { status: 404 });
  const ext = path.extname(file).toLowerCase();
  return new NextResponse(readFileSync(file), {
    headers: { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'public, max-age=3600' },
  });
}
