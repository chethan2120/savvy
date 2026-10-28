import React from 'react';

/**
 * The institute seal, used as supplied. The artwork already carries the name,
 * so the component does not add a second wordmark or recolour the file.
 */
export const SavvyLogo: React.FC<{
  tone?: 'ink' | 'light';
  className?: string;
  markClassName?: string;
}> = ({ className = '', markClassName = 'h-20 w-20 shrink-0' }) => {
  return (
    <img
      src="/brand/logo.jpg"
      alt="Savvy Training Institute"
      width={512}
      height={512}
      className={`object-contain ${markClassName} ${className}`}
    />
  );
};
