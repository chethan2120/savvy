import React from 'react';

/**
 * Original decorative SVG motif: an ultrasonic A-scan waveform over a fine
 * inspection grid — a nod to NDT flaw detection. Purely decorative
 * (aria-hidden). Line-draw + pulse animations are defined in globals.css and
 * are disabled under prefers-reduced-motion.
 */
export const TechnicalGraphic: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* fine inspection grid */}
      <g stroke="var(--forest)" strokeOpacity="0.14" strokeWidth="1">
        {[0, 32, 64, 96, 128].map((y) => (
          <line key={`h${y}`} x1="8" y1={16 + y} x2="312" y2={16 + y} />
        ))}
        {[8, 52, 96, 140, 184, 228, 272, 312].map((x) => (
          <line key={`v${x}`} x1={x} y1="16" x2={x} y2="144" />
        ))}
      </g>

      {/* baseline */}
      <line x1="8" y1="80" x2="312" y2="80" stroke="var(--forest)" strokeOpacity="0.3" strokeWidth="1" />

      {/* ultrasonic A-scan waveform (line-draws on view) */}
      <path
        className="tg-wave"
        d="M8 80 L60 80 L72 40 L84 118 L96 62 L108 80 L180 80 L196 30 L210 128 L224 70 L236 80 L312 80"
        stroke="var(--forest)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* flaw echo marker */}
      <circle className="tg-pulse" cx="203" cy="80" r="4" fill="var(--safety-orange)" />
      <circle cx="203" cy="80" r="9" stroke="var(--safety-orange)" strokeOpacity="0.4" strokeWidth="1" fill="none" />
    </svg>
  );
};
