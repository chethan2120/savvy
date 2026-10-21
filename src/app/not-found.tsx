import React from 'react';
import Link from 'next/link';
import { ArrowLeft, GraduationCap } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 gap-6">
      <div className="w-16 h-16 rounded-full bg-forest/10 text-forest flex items-center justify-center">
        <GraduationCap className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-light text-foreground">404</h1>
      <h2 className="text-2xl font-normal text-foreground">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
        The page you are looking for does not exist or has been moved. Explore our training programs or return home.
      </p>
      <Link href="/" className="pill-button-forest text-xs py-3 px-6 flex items-center gap-2">
        <ArrowLeft className="w-3.5 h-3.5" /> Return to Home
      </Link>
    </div>
  );
}
