'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calendar, User, ArrowRight, Tag, BookOpen, Clock } from 'lucide-react';
import { blogPostsData } from '@/lib/data';
import type { BlogPost } from '@/lib/types';
import { PageHeroBanner } from '@/components/common/PageHeroBanner';

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState<BlogPost[]>(() => blogPostsData);

  useEffect(() => {
    fetch('/api/articles', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          const mapped: BlogPost[] = data.articles.map((a: any) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            excerpt: a.excerpt,
            content: a.content,
            published_at: a.publishedAt || a.createdAt,
            author_name: a.author,
            category_name: a.category,
            featured_image: a.featuredImage || '/images/heroes/blogs-hero.jpg',
          }));
          setPosts(mapped);
        }
      })
      .catch(() => undefined);
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((post) => {
      if (post.category_name) set.add(post.category_name);
    });
    return ['All', ...Array.from(set)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCat =
        selectedCategory === 'All' || post.category_name === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.author_name.toLowerCase().includes(q) ||
        (post.category_name && post.category_name.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const showFeatured = !searchQuery && selectedCategory === 'All';
  const featured = showFeatured ? filteredPosts[0] : null;
  const displayPosts = showFeatured ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="bg-white pb-24">
      {/* Header with Consistent 16:9 Hero Image */}
      <PageHeroBanner
        variant="blogs"
        badgeText="Blogs"
        title="Insights on teaching, training and professional development"
        description="Read articles from Savvy Training Academy on qualifications, online teaching and the practical side of running training."
        imageSrc="/images/heroes/blogs-hero.jpg"
        imageAlt="A study desk with a notebook, books and a pen"
        actionHref="#articles"
        actionLabel="Read the articles"
        priority={true}
      />

      <div id="articles" className="site-container mt-10">
        {/* Search & Categories Filter */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAD9E0] shadow-xs mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#B83268] text-white shadow-xs'
                    : 'bg-white text-[#30262B] border border-[#EAD9E0] hover:border-[#B83268]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08B94]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EAD9E0] bg-white text-xs text-[#641B38] placeholder-[#A08B94] focus:outline-none focus:border-[#B83268] focus:ring-1 focus:ring-[#B83268]"
            />
          </div>
        </div>

        {/* Featured Article Card */}
        {featured && (
          <div className="bg-white rounded-3xl border border-[#EAD9E0] overflow-hidden shadow-xs mb-12 grid grid-cols-1 lg:grid-cols-2">
            <div className="bg-[#641B38] p-8 sm:p-12 text-white flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/20 backdrop-blur-xs">
                  <Tag className="w-3 h-3 text-amber-300" />
                  <span>{featured.category_name || 'Featured Guide'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                  <Link href={`/blogs/${featured.slug}`} className="hover:text-white/80 transition-colors">
                    {featured.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-white/90 mt-4 leading-relaxed line-clamp-3 font-normal">
                  {featured.excerpt}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/15 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-300" />
                    <span>{featured.author_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>{new Date(featured.published_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                  </div>
                </div>

                <Link
                  href={`/blogs/${featured.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-full transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Block for Featured Article */}
            <div className="relative bg-[#641B38] aspect-[16/10] lg:aspect-auto flex items-center justify-center p-8 overflow-hidden">
              <div className="absolute inset-0 bg-[#641B38] opacity-90" />
              <div className="relative z-10 text-center max-w-sm">
                <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Savvy Technical Publication
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Peer-Reviewed Inspection Methodology
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayPosts.map((post) => (
              <div
                key={post.id}
                className="group flex flex-col bg-white rounded-2xl border border-[#EAD9E0] overflow-hidden shadow-xs hover:shadow-lg hover:border-[#B83268]/40 transition-all duration-300"
              >
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    {post.category_name && (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-[#F8EDF1] border border-[#B83268]/20 text-[10px] font-bold text-[#B83268] mb-3">
                        {post.category_name}
                      </span>
                    )}

                    <h3 className="text-base font-bold text-[#641B38] group-hover:text-[#B83268] transition-colors leading-snug">
                      <Link href={`/blogs/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="text-xs text-[#30262B] mt-2.5 line-clamp-3 leading-relaxed font-normal">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#EAD9E0] flex items-center justify-between text-[11px] text-[#30262B]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#B83268]" />
                      <span>{post.author_name}</span>
                    </div>

                    <Link
                      href={`/blogs/${post.slug}`}
                      className="font-bold text-[#B83268] group-hover:text-[#641B38] transition-colors flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#EAD9E0] bg-white p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-10 h-10 text-[#A08B94] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#641B38]">No Articles Found</h3>
            <p className="text-xs text-[#30262B] mt-1 font-normal">Try searching for other technical terms or reset the category filter.</p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-full bg-[#B83268] text-white text-xs font-bold hover:bg-[#641B38] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
