'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search, Filter, X, RefreshCw, BookOpen, Clock,
  ArrowUpDown, SlidersHorizontal, ChevronRight
} from 'lucide-react';
import type { Course } from '@/lib/types';
import { CourseCard } from '@/components/courses/CourseCard';
import { CareerStrategyCall } from '@/components/home/CareerStrategyCall';
import { getCachedCourses, getCachedCategories } from '@/lib/api-cache';

interface CategoryItem {
  id: string;
  name: string;
  courseCount: number;
}

function CoursesCatalogueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state initialized from URL search params
  const initialQuery = searchParams.get('query') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('featured');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // Sync state if URL searchParams change
  useEffect(() => {
    if (searchParams.get('query') != null) {
      setSearchQuery(searchParams.get('query') || '');
    }
    if (searchParams.get('category') != null) {
      setSelectedCategory(searchParams.get('category') || 'all');
    }
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [coursesData, categoriesData] = await Promise.all([
        getCachedCourses(),
        getCachedCategories(),
      ]);

      setCourses(coursesData.courses || []);
      setCategories(categoriesData.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let result = [...courses];

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((c) => {
        const catObj = categories.find((cat) => cat.id === selectedCategory);
        return (
          (c as any).categoryId === selectedCategory ||
          (catObj && c.category === catObj.name) ||
          c.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.short_description?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          (c.prerequisites && c.prerequisites.some((p) => p.toLowerCase().includes(q))) ||
          (c.learning_outcomes && c.learning_outcomes.some((o) => o.toLowerCase().includes(q)))
      );
    }

    // Sort
    if (sortBy === 'name-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const priceA = a.currency_prices?.GBP ?? 99999999;
        const priceB = b.currency_prices?.GBP ?? 99999999;
        return priceA - priceB;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const priceA = a.currency_prices?.GBP ?? 0;
        const priceB = b.currency_prices?.GBP ?? 0;
        return priceB - priceA;
      });
    } else {
      // 'featured'
      result.sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (a.sort_order || 100) - (b.sort_order || 100);
      });
    }

    return result;
  }, [courses, categories, selectedCategory, searchQuery, sortBy]);

  // Pagination
  const totalCourses = filteredAndSorted.length;
  const totalPages = Math.ceil(totalCourses / itemsPerPage) || 1;
  const paginatedCourses = filteredAndSorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('featured');
    setPage(1);
    router.push('/courses');
  };

  return (
    <div className="py-12 sm:py-16 bg-white border-b border-[#F0E2E7]">
      <div className="site-container">
        {/* Header Breadcrumb & Title */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs text-[#565656] mb-2 font-medium">
            <span>Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#B14B6C] font-bold">Explore Courses</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1F1F] tracking-tight">
            Professional Course Catalogue
          </h1>
          <p className="text-sm sm:text-base text-[#565656] mt-3 leading-relaxed font-normal">
            Discover verified technical qualifications structured around global ASME, ASNT, ISO and British standards. Real instrumentation training and digital credentials.
          </p>
        </div>

        {/* Search, Filter & Currency Controls Bar */}
        <div className="bg-white rounded-2xl p-5 border border-[#F0E2E7] shadow-xs mb-10 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A08B94]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search courses by name, code or technical discipline..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#F0E2E7] bg-white text-sm text-[#1F1F1F] placeholder-[#A08B94] focus:outline-none focus:border-[#B14B6C] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A08B94] hover:text-[#B14B6C]"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown & Currency Selector */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort by */}
              <div className="flex items-center gap-2 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#A08B94]" />
                <label htmlFor="course-sort-select" className="sr-only">
                  Sort courses
                </label>
                <select
                  id="course-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-xl border border-[#F0E2E7] bg-white text-xs font-semibold text-[#1F1F1F] focus:outline-none cursor-pointer"
                >
                  <option value="featured">Recommended / Featured</option>
                  <option value="name-asc">Title: A to Z</option>
                  <option value="name-desc">Title: Z to A</option>
                  <option value="price-asc">Tuition: Low to High</option>
                  <option value="price-desc">Tuition: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-[#F0E2E7] no-scrollbar">
            <span className="text-xs font-bold text-[#565656] shrink-0 mr-1">
              Category:
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#B14B6C] text-white shadow-xs'
                  : 'bg-white text-[#565656] border border-[#F0E2E7] hover:border-[#B14B6C]/50'
              }`}
            >
              All Courses ({courses.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#B14B6C] text-white shadow-xs'
                    : 'bg-white text-[#565656] border border-[#F0E2E7] hover:border-[#B14B6C]/50'
                }`}
              >
                {cat.name} ({cat.courseCount})
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchQuery || selectedCategory !== 'all') && (
          <div className="flex items-center justify-between gap-4 mb-6 text-xs text-[#565656]">
            <div>
              Showing {filteredAndSorted.length} matching result
              {filteredAndSorted.length === 1 ? '' : 's'}
              {searchQuery && <span> for &ldquo;{searchQuery}&rdquo;</span>}
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#B14B6C] font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#F0E2E7] overflow-hidden p-6 flex flex-col gap-4 animate-pulse"
              >
                <div className="aspect-[16/10] bg-slate-100 rounded-xl" />
                <div className="h-5 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
                <div className="mt-4 pt-4 border-t border-[#F0E2E7] flex justify-between items-center">
                  <div className="h-4 bg-slate-100 rounded w-20" />
                  <div className="h-8 bg-slate-100 rounded-full w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && !loading && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center max-w-lg mx-auto">
            <h3 className="text-base font-bold text-rose-800">
              Unable to Load Courses
            </h3>
            <p className="text-xs text-rose-600 mt-2">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#B14B6C] text-white text-xs font-bold hover:bg-[#8E3854] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAndSorted.length === 0 && (
          <div className="rounded-2xl border border-[#F0E2E7] bg-white p-14 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-[#A08B94] mx-auto mb-4" />
            <h3 className="text-base font-bold text-[#1F1F1F]">
              No Courses Found
            </h3>
            <p className="text-xs text-[#565656] mt-2 leading-relaxed">
              We could not find any active courses matching your criteria. Try adjusting your search term or category filter.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 px-5 py-2.5 rounded-full bg-[#B14B6C] text-white text-xs font-bold hover:bg-[#8E3854] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {!loading && !error && filteredAndSorted.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-[#F0E2E7] bg-white text-xs font-semibold text-[#1F1F1F] disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPage(idx + 1)}
                    className={`h-9 w-9 rounded-lg text-xs font-bold transition-colors ${
                      page === idx + 1
                        ? 'bg-[#B14B6C] text-white'
                        : 'border border-[#F0E2E7] bg-white text-[#1F1F1F] hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-[#F0E2E7] bg-white text-xs font-semibold text-[#1F1F1F] disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <>
      <Suspense fallback={<div className="site-container py-20 text-center text-sm text-[#687587]">Loading course catalogue...</div>}>
        <CoursesCatalogueContent />
      </Suspense>
      <CareerStrategyCall />
    </>
  );
}
