import React from 'react';
import Image from 'next/image';

const accreditations = [
  { src: '/accreditations/asnt.png', name: 'ASNT — American Society for Nondestructive Testing' },
  { src: '/accreditations/twi.png', name: 'TWI — The Welding Institute (CSWIP)' },
  { src: '/accreditations/qci.png', name: 'QCI — Quality Council of India' },
  { src: '/accreditations/nabl.png', name: 'NABL Accreditation' },
  { src: '/accreditations/iso.png', name: 'ISO Certified' },
  { src: '/accreditations/msme.png', name: 'MSME Registered' },
  { src: '/accreditations/skill-india.png', name: 'Skill India' },
];

/**
 * Real recognition/affiliation marks carried over from the source site.
 * Presented as a calm, muted logo row — no autoplay motion.
 */
export const AccreditationStrip: React.FC = () => {
  return (
    <section aria-labelledby="accreditation-heading" className="site-container">
      <div className="flex flex-col items-center gap-8 py-4">
        <p
          id="accreditation-heading"
          className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium text-center"
        >
          Trusted standards &amp; recognitions our training aligns with
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {accreditations.map((a) => (
            <li key={a.src} className="shrink-0">
              <Image
                src={a.src}
                alt={a.name}
                width={112}
                height={112}
                sizes="112px"
                className="h-20 w-auto object-contain opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
