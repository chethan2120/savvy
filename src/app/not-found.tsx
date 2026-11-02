import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Compass, Search } from 'lucide-react';
import { SavvyLogo } from '@/components/brand/SavvyLogo';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-white relative overflow-hidden py-16 px-4 sm:px-6">
      {/* Decorative ambient background glows */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(184,50,104,0.08)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(184,50,104,0.05)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="site-container max-w-xl text-center relative z-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-[#EAD9E0] shadow-[0_8px_24px_rgba(0,0,0,0.06)] mb-6">
          <SavvyLogo markClassName="h-12 w-12 object-contain" />
        </div>

        <div className="text-sm font-bold tracking-widest uppercase text-[#B83268] mb-2 font-mono">
          Error 404
        </div>

        <h1 className="font-sans text-3xl sm:text-5xl font-extrabold text-[#641B38] tracking-tight leading-tight mb-4">
          Page Not Found
        </h1>

        <p className="text-base sm:text-lg text-[#30262B] max-w-md mx-auto leading-relaxed mb-8">
          Sorry, the page you’re looking for doesn’t exist or may have been moved.
        </p>

        {/* Action buttons strictly navigating to / and /courses */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#B83268] hover:bg-[#641B38] text-white text-sm sm:text-base font-semibold shadow-md transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#F8EDF1] hover:bg-[#dbeaff] text-[#B83268] border border-[#B83268]/30 text-sm sm:text-base font-semibold shadow-xs transition-all duration-200"
          >
            <BookOpen className="w-4 h-4 text-[#B83268]" />
            <span>Explore Courses</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
