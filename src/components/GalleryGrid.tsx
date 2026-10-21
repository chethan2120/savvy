'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GalleryItem } from '@/lib/types';
import { GalleryLightbox } from './GalleryLightbox';
import { Maximize2 } from 'lucide-react';

interface GalleryGridProps {
  items: GalleryItem[];
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="flex flex-col gap-8">
      {/* Filter Category Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs rounded-full font-medium transition-colors ${
                isSelected
                  ? 'bg-foreground text-white'
                  : 'bg-surface border border-border text-foreground/80 hover:border-foreground'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Gallery Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setLightboxIndex(index)}
            className="editorial-card overflow-hidden group cursor-pointer relative aspect-[4/3]"
          >
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
              <div className="self-end p-2 rounded-full bg-white/20 backdrop-blur-md">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-[10px] text-white/70 uppercase tracking-wider">{item.category}</span>
                <h4 className="text-xs font-medium text-white line-clamp-1">{item.title}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Popup */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          items={filteredItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </div>
  );
};
