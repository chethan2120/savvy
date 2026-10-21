import React, { useId } from 'react';

/**
 * Original Savvy Training Institute mark: a shield, an inspection lens, and
 * the wordmark. Transparent background so it reads on the light header and on
 * the dark footer. Not a copy of any other institute's emblem.
 */
export const SavvyMark: React.FC<{ className?: string; title?: string }> = ({
  className = 'w-14 h-14',
  title = 'Savvy Training Institute',
}) => {
  const raw = useId().replace(/:/g, '');
  const shield = `savvy-shield-${raw}`;
  const lens = `savvy-lens-${raw}`;
  return (
  <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
    <defs>
      <linearGradient id={shield} x1="12" y1="4" x2="52" y2="60" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0f766e" />
        <stop offset="1" stopColor="#134e4a" />
      </linearGradient>
      <linearGradient id={lens} x1="18" y1="16" x2="46" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e3a5f" />
        <stop offset="1" stopColor="#0b2545" />
      </linearGradient>
    </defs>
    <path
      d="M32 4 52 12v16c0 12.2-8.2 22.4-20 26C20.2 50.4 12 40.2 12 28V12L32 4Z"
      fill={`url(#${shield})`}
    />
    <path
      d="M32 8.5 48 15v13c0 10-6.7 18.4-16 21.4C22.7 46.4 16 38 16 28V15L32 8.5Z"
      fill="none"
      stroke="#d6b25e"
      strokeWidth="1.2"
      opacity="0.85"
    />
    <circle cx="31" cy="28" r="11" fill="none" stroke={`url(#${lens})`} strokeWidth="3.2" />
    <circle cx="31" cy="28" r="8.2" fill="#0b2545" />
    <path d="M26.5 32.5V24h3.2v5.2h2.6V24H36v8.5h-2.2v-2.1h-5.1v2.1H26.5Z" fill="#f4f7fb" />
    <path d="M27.2 23.2h8.6" stroke="#d6b25e" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M39.2 36.2 45.5 42.6" stroke="#0b2545" strokeWidth="3.4" strokeLinecap="round" />
    <circle cx="46.6" cy="43.8" r="2.1" fill="#d6b25e" />
  </svg>
  );
};

export const SavvyLogo: React.FC<{
  tone?: 'ink' | 'light';
  className?: string;
  markClassName?: string;
}> = ({ tone = 'ink', className = '', markClassName = 'w-12 h-12 lg:w-14 lg:h-14 shrink-0' }) => {
  const name = tone === 'light' ? 'text-white' : 'text-[#0b2545]';
  const sub = tone === 'light' ? 'text-white/75' : 'text-[#0f766e]';
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <SavvyMark className={markClassName} />
      <span className="flex flex-col">
        <span className={`font-semibold text-lg tracking-tight leading-none ${name}`}>SAVVY</span>
        <span className={`text-[11px] tracking-[0.14em] font-medium mt-1 uppercase ${sub}`}>
          Training Institute
        </span>
      </span>
    </span>
  );
};
