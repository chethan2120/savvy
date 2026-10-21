'use client';

import React from 'react';
import { defaultSettings } from '@/lib/data';

export const WhatsAppButton: React.FC = () => {
  const whatsappUrl = `https://wa.me/${defaultSettings.whatsapp_number}?text=${encodeURIComponent(
    'Hello Savvy Training Institute, I would like to inquire about NDT Level 2 and QA/QC courses.'
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      /* Offset by the home-indicator inset so it is not half-swallowed on
         iPhones, and kept clear of the desktop scrollbar. */
      className="group fixed bottom-[max(4.5rem,calc(env(safe-area-inset-bottom)+3rem))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-overlay transition-transform duration-300 ease-spring hover:bg-[#20ba5a] hover:scale-110 active:scale-95 motion-safe:animate-[anim-pop-in_500ms_var(--ease-spring)_400ms_both]"
    >
      {/* Attention pulse, hover only — a permanently pulsing element next to
          body copy is a distraction and an a11y complaint. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[#25D366] opacity-0 transition-opacity duration-300 motion-safe:group-hover:animate-ping motion-safe:group-hover:opacity-60"
      />
      <svg viewBox="0 0 24 24" className="relative h-8 w-8 fill-white">
        <path d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.766.462 3.484 1.34 5.002L2 22l5.13-1.326A9.958 9.958 0 0 0 12.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.2a8.19 8.19 0 0 1-4.176-1.144l-.3-.178-3.043.787.812-2.968-.196-.305A8.19 8.19 0 1 1 20.2 12c0 4.522-3.674 8.2-8.196 8.2zm4.492-6.137c-.246-.123-1.457-.72-1.683-.802-.226-.082-.39-.123-.554.123-.164.246-.636.802-.78.967-.144.164-.287.185-.533.062-.246-.123-1.038-.383-1.977-1.221-.731-.652-1.224-1.457-1.367-1.703-.144-.246-.015-.379.108-.501.111-.11.246-.287.37-.431.123-.144.164-.246.246-.41.082-.164.041-.308-.02-.431-.062-.123-.554-1.335-.76-1.828-.2-.48-.404-.415-.554-.423l-.472-.008a.906.906 0 0 0-.657.308c-.226.246-.862.842-.862 2.054s.883 2.384 1.006 2.549c.123.164 1.738 2.654 4.211 3.722.588.254 1.047.406 1.405.52.59.188 1.127.161 1.552.098.473-.071 1.457-.596 1.663-1.171.205-.576.205-1.07.144-1.172-.062-.102-.226-.164-.472-.287z"/>
      </svg>
    </a>
  );
};
