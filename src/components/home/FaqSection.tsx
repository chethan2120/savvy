'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type PublicFaq = {
  id: string;
  question: string;
  answer: string;
};

export function FaqSection({ faqs }: { faqs: PublicFaq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="border-b border-[#EAD9E0] bg-white py-16 sm:py-20" id="faq">
      <div className="site-container max-w-3xl">
        <h2 className="text-[#641B38]">Frequently Asked Questions</h2>
        <p className="mt-3 text-[#30262B]">
          Answers use the teaching, online course, accreditation and portal information already published on this site.
        </p>
        {faqs.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-[#EAD9E0] bg-[#F8EDF1] px-5 py-6 text-[#30262B]">
            Questions will appear here once they are published.
          </p>
        ) : (
          <div className="reveal-stagger mt-8 flex flex-col gap-3">
            {faqs.map((faq) => {
              const open = openId === faq.id;
              return (
                <div key={faq.id} className={`overflow-hidden rounded-2xl border bg-white ${open ? 'border-[#B83268]' : 'border-[#EAD9E0]'}`}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-${faq.id}`}
                    onClick={() => setOpenId(open ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="text-base font-semibold text-[#641B38]">{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-[#B83268] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {open && (
                    <div id={`faq-${faq.id}`} className="border-t border-[#EAD9E0] px-5 py-4 text-[#641B38]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
