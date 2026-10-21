'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PageHero } from '@/components/PageHero';
import { blogPostsData } from '@/lib/data';
import { ArrowUpRight, Calendar, User, Search } from 'lucide-react';

export default function BlogListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'NDT Techniques', 'QA/QC Inspection', 'Career Advice'];

  const filteredPosts = blogPostsData.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'All') return matchesSearch;
    return matchesSearch && post.category_name === selectedCategory;
  });

  const featuredPost = blogPostsData[0];

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Top Banner */}
      <PageHero
        breadcrumbs={[{ label: 'Blog' }]}
        title={<>Latest Articles &amp; Insights</>}
        description="Stay updated with expert articles on Non-Destructive Testing techniques, quality control standards, welding inspection, and career growth tips."
        media={{ type: 'image', src: '/images/hero-blog.png' }}
        mediaAlt="Close-up of a ground weld bead on a steel plate"
      />

      {/* Featured Article Card */}
      {featuredPost && (
        <section className="site-container">
          <div className="editorial-card p-8 md:p-12 bg-surface border-border grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <span className="accent-tag-periwinkle self-start">{featuredPost.category_name}</span>
              <h2 className="text-h1 font-normal text-foreground group-hover:text-forest transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-forest" /> {featuredPost.author_name}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-forest" /> {featuredPost.published_at}</span>
              </div>
              <Link href={`/blog/${featuredPost.slug}`} className="pill-button-forest text-xs py-3 px-6 self-start mt-2">
                Read Featured Article &rarr;
              </Link>
            </div>

            <div className="lg:col-span-6 relative aspect-[16/9] rounded-xl overflow-hidden border border-border">
              <Image
                src={featuredPost.featured_image}
                alt={featuredPost.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </section>
      )}

      {/* Search & Category Filter */}
      <section className="site-container">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border">
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-background border border-border rounded-full pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-forest"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-foreground text-white'
                    : 'bg-background border border-border text-foreground/80 hover:border-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="site-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div key={post.id} className="editorial-card flex flex-col overflow-hidden group">
              <div className="aspect-[16/9] relative overflow-hidden bg-muted-foreground/10">
                <Image
                  src={post.featured_image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex flex-col flex-grow justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] text-forest font-semibold uppercase tracking-wider">
                    {post.category_name}
                  </span>
                  <h3 className="text-lg font-normal text-foreground group-hover:text-forest transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                  <span className="text-[11px] text-muted-foreground">{post.published_at}</span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-foreground group-hover:text-forest transition-colors"
                  >
                    Read Article <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
