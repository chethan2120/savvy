import React from 'react';
import {
  Briefcase, Dumbbell, GraduationCap, HeartPulse, Scissors, Sparkles, Hand, UtensilsCrossed,
} from 'lucide-react';
import { accreditationSectors } from '@/lib/academy-content';

const icons = {
  'Beauty & aesthetics': Sparkles,
  Hair: Scissors,
  'Holistic & massage': Hand,
  Fitness: Dumbbell,
  'Health & social care': HeartPulse,
  Hospitality: UtensilsCrossed,
  'Business skills': Briefcase,
  Education: GraduationCap,
} as const;

export function SectorTicker({ title = 'Sectors welcomed for accreditation' }: { title?: string }) {
  const labels = [...accreditationSectors, ...accreditationSectors];
  return (
    <section className="border-b border-[#EAD9E0] bg-white py-10 sm:py-14">
      <div className="site-container">
        <h2 className="text-[#641B38]">{title}</h2>
        <p className="mt-3 max-w-3xl text-[#30262B]">
          Savvy welcomes training providers and professionals across these sectors for accreditation.
        </p>
        <div className="sector-ticker mt-6" tabIndex={0}>
          <div className="sector-ticker-track">
            {labels.map((label, index) => {
              const Icon = icons[label];
              return (
                <span key={`${label}-${index}`} className="sector-chip">
                  <Icon className="h-5 w-5 shrink-0 text-[#B83268]" aria-hidden="true" />
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
