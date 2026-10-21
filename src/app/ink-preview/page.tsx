import React from 'react';
import { SavvyInkHero } from '@/components/hero/SavvyInkHero';

/** Always shows InkHero, even when the homepage switch is off. */
export default function InkPreviewPage() {
  return <SavvyInkHero />;
}
