import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHero } from '@/components/PageHero';
import { blogPostsData } from '@/lib/data';
import { User, Calendar, Share2, ArrowLeft } from 'lucide-react';

interface BlogDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return blogPostsData.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const post = blogPostsData.find((p) => p.slug === params.slug);
  if (!post) return {};

  return {
    title: `${post.title} | Savvy Training Institute Blog`,
    description: post.excerpt,
  };
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = blogPostsData.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="flex flex-col gap-12 pb-20">
      {/* Article Header */}
      <PageHero
        breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: post.title }]}
        meta={<span className="accent-tag-periwinkle">{post.category_name}</span>}
        title={post.title}
        description={
          <span className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {post.author_name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {post.published_at}
            </span>
          </span>
        }
        media={{ type: 'image', src: post.featured_image }}
        mediaAlt={post.title}
        compact
      />

      {/* Article Main Body */}
      <section className="site-container max-w-4xl">
        <div className="flex flex-col gap-8">
          <div className="prose prose-slate max-w-none text-body text-foreground/90 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>

          <div className="pt-8 border-t border-border flex items-center justify-between">
            <Link href="/blog" className="pill-button-secondary text-xs py-2.5 px-5 flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to All Articles
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Share2 className="w-4 h-4" /> Share Article
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
