import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { accountCourses, deleteCourseMaterial, listCourseMaterials, programs, saveCourseMaterial, staffAllows } from '@/lib/server/institute-db';
import { currentAccount } from '@/lib/server/session';

const folder = path.join(process.cwd(), 'data', 'private', 'materials');
const allowed = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'png', 'jpg', 'jpeg', 'webp']);

function kind(name: string): 'pdf' | 'document' | 'slides' | 'other' {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'ppt' || ext === 'pptx') return 'slides';
  if (ext === 'doc' || ext === 'docx' || ext === 'txt') return 'document';
  return 'other';
}

function visibleTo(account: NonNullable<ReturnType<typeof currentAccount>>, material: { courseId: string; visibility: string }) {
  if (account.role === 'admin') return true;
  if (material.visibility === 'admin') return false;
  if (account.role === 'staff') return material.visibility === 'staff' || material.visibility === 'enrolled';
  const enrolled = accountCourses(account.id).some((row) => row.accountId === account.id && row.courseId === material.courseId && row.status === 'enrolled');
  return enrolled && material.visibility === 'enrolled';
}

export async function GET(request: Request) {
  const account = currentAccount();
  if (!account) return NextResponse.json({ message: 'Sign in to continue.' }, { status: 401 });
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) {
    const courseId = url.searchParams.get('courseId') || undefined;
    const materials = listCourseMaterials(courseId).filter((item) => visibleTo(account, item));
    return NextResponse.json({ materials, courses: account.role === 'student' ? [] : programs() });
  }
  const material = listCourseMaterials().find((item) => item.id === id);
  if (!material?.storageName || !visibleTo(account, material)) return NextResponse.json({ message: 'That file was not found.' }, { status: 404 });
  const filePath = path.join(folder, material.storageName);
  if (!existsSync(filePath)) return NextResponse.json({ message: 'That file was not found.' }, { status: 404 });
  const bytes = readFileSync(filePath);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${material.fileName || 'material'}"`,
    },
  });
}

export async function POST(request: Request) {
  const account = currentAccount();
  if (!account || (account.role !== 'admin' && !(account.role === 'staff' && staffAllows(account, 'uploadMaterials')))) {
    return NextResponse.json({ message: 'You do not have permission to add material.' }, { status: 403 });
  }
  const form = await request.formData();
  const title = String(form.get('title') ?? '');
  const courseId = String(form.get('courseId') ?? '');
  const chapterId = String(form.get('chapterId') ?? '');
  const description = String(form.get('description') ?? '');
  const externalUrl = String(form.get('externalUrl') ?? '');
  const visibility = String(form.get('visibility') ?? 'enrolled');
  const id = String(form.get('id') ?? '');
  const file = form.get('file');
  let fileName: string | null = null;
  let storageName: string | null = null;
  if (file instanceof File && file.size > 0) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowed.has(ext)) return NextResponse.json({ message: 'Upload a PDF, DOCX, PPTX, or another supported file.' }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ message: 'Files must be 20 MB or smaller.' }, { status: 400 });
    mkdirSync(folder, { recursive: true });
    storageName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    fileName = file.name;
    writeFileSync(path.join(folder, storageName), Buffer.from(await file.arrayBuffer()));
  }
  const result = saveCourseMaterial({
    id: id || undefined,
    courseId,
    chapterId: chapterId || null,
    title,
    description,
    externalUrl,
    visibility: visibility === 'staff' || visibility === 'admin' ? visibility : 'enrolled',
    type: fileName ? kind(fileName) : (externalUrl ? 'link' : undefined),
    fileName: fileName ?? undefined,
    storageName: storageName ?? undefined,
  });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
  return NextResponse.json({ material: result.material });
}

export async function DELETE(request: Request) {
  const account = currentAccount();
  if (!account || account.role !== 'admin') return NextResponse.json({ message: 'Only an administrator can delete material.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const result = deleteCourseMaterial(String(body.id ?? ''));
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });
  if (result.material.storageName) {
    const filePath = path.join(folder, result.material.storageName);
    if (existsSync(filePath)) unlinkSync(filePath);
  }
  return NextResponse.json({ ok: true });
}
