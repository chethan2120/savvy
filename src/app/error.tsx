'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 gap-4">
      <h2 className="text-2xl font-normal text-foreground">Something went wrong</h2>
      <p className="text-xs text-muted-foreground max-w-sm">
        An unexpected application error occurred. Please try again or return to homepage.
      </p>
      <div className="flex gap-4">
        <button onClick={() => reset()} className="pill-button-forest text-xs py-2.5 px-5">
          Try Again
        </button>
        <Link href="/" className="pill-button-secondary text-xs py-2.5 px-5">
          Return Home
        </Link>
      </div>
    </div>
  );
}
