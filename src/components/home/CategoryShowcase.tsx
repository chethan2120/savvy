'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  courseCount: number;
  image?: string;
  imageAlt?: string;
}

export function CategoryShowcase({ categories }: { categories: CategoryItem[] }) {
  return (
    <section className="border-b border-[#EAD9E0] bg-white py-12 sm:py-16 lg:py-24">
      <div className="site-container">
        <div className="mx-auto mb-10 max-w-3xl px-1 text-center sm:mb-14">
          <h2 className="text-[#641B38]">Browse the course categories</h2>
          <p className="mt-3 text-[#30262B]">
            Published courses are grouped by the categories managed in the admin course list.
          </p>
        </div>

        <div className="reveal-stagger mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/courses?category=${cat.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#EAD9E0] bg-white hover:border-[#B83268]/50"
            >
              <div className="relative aspect-[16/9] bg-[#F8EDF1]">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.imageAlt || cat.name} fill sizes="(max-width: 768px) 100vw, 420px" className="object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#641B38] group-hover:text-[#B83268]">{cat.name}</h3>
                  {cat.description && <p className="mt-2 text-[#30262B]">{cat.description}</p>}
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[#EAD9E0] pt-4 text-sm">
                  <span className="font-semibold text-[#B83268]">
                    {cat.courseCount} {cat.courseCount === 1 ? 'Programme' : 'Programmes'}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#B83268]">
                    Explore
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
