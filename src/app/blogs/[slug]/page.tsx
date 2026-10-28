import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Tag, BookOpen, Share2, ArrowRight } from 'lucide-react';
import { blogPostsData } from '@/lib/data';
import { getArticleBySlug, listArticles } from '@/lib/server/institute-db';

interface BlogDetailsPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogDetailsPageProps) {
  const dynamicArticle = getArticleBySlug(params.slug);
  const fallback = blogPostsData.find((b) => b.slug === params.slug);
  const post = dynamicArticle || fallback;

  if (!post || (dynamicArticle && !dynamicArticle.published)) {
    return { title: 'Article Not Found | Savvy Training Institute' };
  }
  return {
    title: `${post.title} | Savvy Training Institute`,
    description: post.excerpt,
  };
}

export default function BlogDetailsPage({ params }: BlogDetailsPageProps) {
  const dynamicArticle = getArticleBySlug(params.slug);
  const fallback = blogPostsData.find((b) => b.slug === params.slug);

  // If dynamic article exists, check published status
  if (dynamicArticle && !dynamicArticle.published) {
    notFound();
  }

  const post = dynamicArticle
    ? {
        id: dynamicArticle.id,
        title: dynamicArticle.title,
        slug: dynamicArticle.slug,
        excerpt: dynamicArticle.excerpt,
        content: dynamicArticle.content,
        published_at: dynamicArticle.createdAt,
        author_name: dynamicArticle.author,
        category_name: dynamicArticle.category,
      }
    : fallback;

  if (!post) {
    notFound();
  }

  const allArticles = listArticles({ onlyPublished: true });
  const related = (allArticles.length > 0 ? allArticles : blogPostsData)
    .filter((b) => b.id !== post.id)
    .slice(0, 2)
    .map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      category_name: 'category' in b ? (b as any).category : (b as any).category_name,
      published_at: 'createdAt' in b ? (b as any).createdAt : (b as any).published_at,
    }));

  return (
    <div className="bg-white pb-24">
      {/* Article Header */}
      <section className="bg-gradient-to-br from-[#003e9a] via-[#0056D2] to-[#0284c7] text-white pt-12 pb-16 border-b border-[#0056D2]/30">
        <div className="site-container max-w-3xl">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs text-white/85 hover:text-white hover:underline mb-6 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Technical Articles</span>
          </Link>

          {post.category_name && (
            <div className="inline-block px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-white mb-4 ml-3">
              {post.category_name}
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-white/80 border-t border-white/15 pt-4">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-white" />
              <span>Written by <strong className="text-white">{post.author_name}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-white" />
              <span>{new Date(post.published_at).toLocaleDateString('en-GB', { dateStyle: 'long' })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <div className="site-container max-w-3xl mt-12">
        <article className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e2e8f0] shadow-xs">
          <div className="prose prose-sm sm:prose lg:prose-lg text-[#565656] leading-relaxed max-w-none whitespace-pre-line font-normal">
            {post.content}
          </div>

          {/* Author Box */}
          <div className="mt-12 pt-8 border-t border-[#e2e8f0] flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#0056D2] text-white font-bold text-lg flex items-center justify-center shrink-0">
              {post.author_name.slice(0, 1)}
            </div>
            <div>
              <div className="text-xs text-[#8C9BAE]">Article Contributor</div>
              <div className="text-sm font-bold text-[#1F1F1F]">{post.author_name}</div>
              <div className="text-xs text-[#565656] mt-0.5">Faculty, Savvy Training Institute</div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="mt-14">
            <h3 className="text-lg font-bold text-[#1F1F1F] mb-6">
              Related Technical Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blogs/${item.slug}`}
                  className="group p-6 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#0056D2]/40 hover:shadow-xs transition-all"
                >
                  <span className="text-[10px] font-bold text-[#0056D2] uppercase tracking-wider">
                    {item.category_name}
                  </span>
                  <h4 className="text-sm font-bold text-[#1F1F1F] group-hover:text-[#0056D2] mt-1 leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#565656]">
                    <span>{new Date(item.published_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                    <span className="text-[#0056D2] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
