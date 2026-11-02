import React from 'react';

/**
 * The institute seal. The enamel is burgundy; the gold, lettering and monogram stay.
 */
export const SavvyLogo: React.FC<{
  tone?: 'ink' | 'light';
  className?: string;
  markClassName?: string;
}> = ({ className = '', markClassName = 'h-12 w-12 shrink-0' }) => {
  return (
    <img
      src="/brand/logo.jpg"
      alt="Savvy Training Institute"
      width={48}
      height={48}
      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      className={`object-contain ${markClassName} ${className}`}
    />
  );
};
