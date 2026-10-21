import React from 'react';
import { PageHero } from '@/components/PageHero';
import { GalleryGrid } from '@/components/GalleryGrid';
import { galleryData } from '@/lib/data';

export const metadata = {
  title: 'Student & Lab Training Gallery | Savvy Training Institute',
  description:
    'Explore photos of our NDT laboratory testing sessions, flaw detection equipment, practical weld inspections, classroom lectures, and student certification events.',
};

export default function GalleryPage() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Full-bleed hero */}
      <PageHero
        breadcrumbs={[{ label: 'Gallery' }]}
        title={<>Institute &amp; Lab Gallery</>}
        description="Real photos from our training labs, ultrasonic flaw detection practicals, site visits, classroom lectures, and student graduation ceremonies."
        media={{ type: 'image', src: '/images/hero-gallery.png' }}
        mediaAlt="Savvy Training Institute training laboratory interior"
      />

      {/* Gallery Section */}
      <section className="site-container">
        <GalleryGrid items={galleryData} />
      </section>
    </div>
  );
}
