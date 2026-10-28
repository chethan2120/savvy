'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Layers, ShieldCheck, Flame, Cpu, Wrench } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  courseCount: number;
}

interface CategoryShowcaseProps {
  categories: CategoryItem[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  const icons: Record<string, React.ReactNode> = {
    'cat-ndt': <Layers className="w-6 h-6 text-[#0056D2]" />,
    'cat-qaqc': <ShieldCheck className="w-6 h-6 text-[#0056D2]" />,
    'cat-hse': <Flame className="w-6 h-6 text-[#0056D2]" />,
    'cat-mep': <Cpu className="w-6 h-6 text-[#0056D2]" />,
  };

  const defaultIcon = <Wrench className="w-6 h-6 text-[#0056D2]" />;

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white border-b border-[#e2e8f0]">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0056D2]">
            Specialised Disciplines
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-semibold text-[#1F1F1F] tracking-tight mt-1.5 leading-tight">
            Explore Engineering Sectors &amp; Pathways
          </h2>
          <p className="text-sm sm:text-base text-[#565656] mt-3 text-balance leading-relaxed">
            Structured programmes aligned with global engineering codes, inspection requirements, and statutory safety standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/courses?category=${cat.id}`}
              className="group p-6 rounded-2xl bg-white border border-[#e2e8f0] hover:border-[#0056D2]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="h-12 w-12 rounded-xl bg-[#F0F5FF] border border-[#e2e8f0] flex items-center justify-center mb-5 group-hover:bg-[#EBF3FF] transition-colors">
                  {icons[cat.id] || defaultIcon}
                </div>

                <h3 className="text-base font-bold text-[#1F1F1F] group-hover:text-[#0056D2] transition-colors leading-snug">
                  {cat.name}
                </h3>

                <p className="text-xs text-[#565656] mt-2 leading-relaxed">
                  {cat.description || 'Comprehensive professional syllabus, code standards, and practical testing modules.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                <span className="font-semibold text-[#0056D2]">
                  {cat.courseCount} {cat.courseCount === 1 ? 'Programme' : 'Programmes'}
                </span>
                <span className="text-[#0056D2] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
