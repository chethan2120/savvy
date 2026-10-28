import { NextResponse } from 'next/server';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import path from 'path';
import { setCourseImage, staffAllows } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

const TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
};

export async function POST(request: Request) {
  const account = currentAccount();
  if (!account || (account.role !== 'admin' && !(account.role === 'staff' && staffAllows(account, 'manageCourses')))) {
    return NextResponse.json({ message: 'You do not have permission to update course images.' }, { status: 403 });
  }
  const form = await request.formData().catch(() => null);
  const courseId = String(form?.get('courseId') ?? '').replace(/[^a-zA-Z0-9-]/g, '');
  const file = form?.get('file');
  if (!courseId) return NextResponse.json({ message: 'Choose a course before uploading an image.' }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ message: 'Choose an image.' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ message: 'Upload a PNG or JPG image.' }, { status: 400 });
  if (file.size <= 0) return NextResponse.json({ message: 'That file is empty.' }, { status: 400 });
  if (file.size > 1_500_000) return NextResponse.json({ message: 'That image is too large. Choose one under 1.5 MB.' }, { status: 400 });
  const dir = path.join(process.cwd(), 'data', 'course-images');
  mkdirSync(dir, { recursive: true });
  for (const old of ['.png', '.jpg', '.jpeg']) {
    const previous = path.join(dir, `${courseId}${old}`);
    if (old !== ext && existsSync(previous)) unlinkSync(previous);
  }
  writeFileSync(path.join(dir, `${courseId}${ext}`), Buffer.from(await file.arrayBuffer()));
  const saved = setCourseImage(courseId, `/api/course-images/${courseId}`);
  if (!saved.ok) return NextResponse.json({ message: saved.message }, { status: 404 });
  return NextResponse.json({ ok: true, image: `/api/course-images/${courseId}` });
}
