'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { GalleryItem } from '@/lib/types';

interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const GalleryLightbox: React.FC<GalleryLightboxProps> = ({
  items,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  const item = items[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % items.length);
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + items.length) % items.length);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [currentIndex, items.length, onClose, onNavigate]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Lightbox View"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 animate-in fade-in duration-200"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between text-white z-10">
        <div className="flex flex-col">
          <span className="text-xs text-white/60">{item.category}</span>
          <h4 className="text-base font-normal">{item.title}</h4>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Lightbox"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Image */}
      <div className="relative flex-grow my-4 flex items-center justify-center">
        <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between text-white z-10 max-w-5xl mx-auto w-full pt-2">
        <span className="text-xs text-white/50">
          {currentIndex + 1} of {items.length}
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate((currentIndex - 1 + items.length) % items.length)}
            aria-label="Previous Image"
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigate((currentIndex + 1) % items.length)}
            aria-label="Next Image"
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
