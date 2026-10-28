import { NextResponse } from 'next/server';
import { listArticles, getArticleBySlug, saveArticle, deleteArticle } from '@/lib/server/institute-db';
import { requireRole } from '@/lib/server/session';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const query = searchParams.get('query') || undefined;
  const category = searchParams.get('category') || undefined;
  const admin = requireRole(['admin']);

  if (slug) {
    const article = getArticleBySlug(slug, { allowDraft: Boolean(admin) });
    if (!article) return NextResponse.json({ message: 'Article not found.' }, { status: 404 });
    return NextResponse.json({ article });
  }

  const articles = listArticles({
    onlyPublished: !admin,
    query,
    category,
  });

  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can create articles.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const result = saveArticle({
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    content: body.content,
    category: body.category,
    author: body.author,
    featuredImage: body.featuredImage,
    published: body.published,
  });

  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });

  revalidatePath('/blogs');
  if (result.article?.slug) {
    revalidatePath(`/blogs/${result.article.slug}`);
  }

  return NextResponse.json({ ok: true, article: result.article });
}

export async function PATCH(request: Request) {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can update articles.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ message: 'Article ID is required.' }, { status: 400 });

  const result = saveArticle({
    id,
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    content: body.content,
    category: body.category,
    author: body.author,
    featuredImage: body.featuredImage,
    published: body.published,
  });

  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });

  revalidatePath('/blogs');
  if (result.article?.slug) {
    revalidatePath(`/blogs/${result.article.slug}`);
  }

  return NextResponse.json({ ok: true, article: result.article });
}

export async function DELETE(request: Request) {
  const admin = requireRole(['admin']);
  if (!admin) return NextResponse.json({ message: 'Only an administrator can delete articles.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? '');
  if (!id) return NextResponse.json({ message: 'Article ID is required.' }, { status: 400 });

  const result = deleteArticle(id);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: 400 });

  revalidatePath('/blogs');

  return NextResponse.json({ ok: true, message: result.message });
}
