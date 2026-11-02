'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ArrowLeft, ExternalLink, ChevronRight, MessageCircle, HelpCircle } from 'lucide-react';
import { defaultSettings } from '@/lib/data';

interface FaqOption {
  id: number;
  label: string;
  response: string;
  actionText: string;
  actionHref: string;
  isWhatsAppAction?: boolean;
}

const FAQ_OPTIONS: FaqOption[] = [
  {
    id: 1,
    label: 'View Available Courses',
    response: 'Explore our available courses and find the programme that suits your technical interests.',
    actionText: 'Browse Courses',
    actionHref: '/courses',
  },
  {
    id: 2,
    label: 'Course Fees & Multi-Currency',
    response: 'Course fees vary by programme and can be viewed in INR, GBP, EUR, USD, and AED directly across our course catalogue.',
    actionText: 'Browse Courses for Fees',
    actionHref: '/courses',
  },
  {
    id: 3,
    label: 'Course Duration & Hours',
    response: 'Course duration and estimated study hours vary by programme. Select any course to view its comprehensive syllabus.',
    actionText: 'Select a Course',
    actionHref: '/courses',
  },
  {
    id: 4,
    label: 'Authorized Certifications',
    response: 'All credentials adhere to industry-standard codes (ASNT, ASME, ISO, CSWIP) and include online certificate verification.',
    actionText: 'Check Course Details',
    actionHref: '/courses',
  },
  {
    id: 5,
    label: 'Speak to Admissions Team',
    response: 'Our technical admissions coordinators are available to discuss upcoming batches, eligibility, and curriculum details.',
    actionText: 'Continue on WhatsApp',
    actionHref: '',
    isWhatsAppAction: true,
  },
];

// Official WhatsApp Vector Icon (recognizable green and white speech bubble with phone handset)
export function WhatsAppIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.838 11.838 0 005.713 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.411" />
    </svg>
  );
}

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<FaqOption | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');
  const widgetRef = useRef<HTMLDivElement>(null);
  const faqButtonRef = useRef<HTMLButtonElement>(null);

  // Load configured WhatsApp number from environment or website settings without fabricating
  useEffect(() => {
    const envNum = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultSettings?.whatsapp_number || '919000012345';
    setWhatsappNumber(envNum.trim());
  }, []);

  // Keyboard accessibility: Close widget on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        faqButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
  const prefilledText = 'Hello Savvy Training Institute, I would like more information about your courses.';
  const directWhatsappUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(prefilledText)}`
    : 'https://wa.me/?text=' + encodeURIComponent(prefilledText);

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3"
      aria-label="Support and Contact Actions"
    >
      {/* FAQ & Quick Answers Popup Modal (Separate Window) */}
      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="faq-support-title"
          aria-modal="true"
          className="mb-1 w-[calc(100vw-36px)] sm:w-[380px] max-w-[420px] rounded-2xl bg-white shadow-[0_16px_48px_rgba(0,0,0,0.22)] border border-[#E2E7EE] overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Header */}
          <div className="bg-[#641B38] text-white p-4 flex items-center justify-between border-b border-[#B83268]/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-sm border border-white/20">
                <HelpCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div id="faq-support-title" className="font-bold text-sm tracking-tight text-white leading-tight">
                  Savvy Institute Help &amp; FAQs
                </div>
                <span className="text-[11px] text-white/80 font-medium mt-0.5">Quick guidance and answers</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close FAQs"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat / FAQ Body */}
          <div className="p-4 bg-[#FAF9F5] min-h-[280px] max-h-[420px] overflow-y-auto flex flex-col gap-3 text-sm">
            <div className="flex flex-col gap-1.5 max-w-[90%] self-start">
              <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white border border-[#E8E2D6] text-[#243247] shadow-xs text-xs sm:text-[13px] leading-relaxed">
                Welcome to Savvy Training Institute. How can we assist you with our certifications today?
              </div>
              <span className="text-[10px] text-[#687587] pl-1 font-mono">Academic Support</span>
            </div>

            {/* State A: List of FAQs */}
            {!selectedOption && (
              <div className="flex flex-col gap-2 pt-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#687587] px-1">
                  Choose an enquiry topic:
                </div>
                {FAQ_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt)}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F3EFE6] border border-[#E8E2D6] hover:border-[#B83268]/40 text-xs sm:text-[13px] font-medium text-[#641B38] transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <span>{opt.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#B83268] transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* State B: Selected FAQ Answer */}
            {selectedOption && (
              <div className="flex flex-col gap-3 pt-1">
                <div className="self-end max-w-[85%] p-2.5 px-3.5 rounded-2xl rounded-tr-sm bg-[#B83268] text-white text-xs sm:text-[13px] font-medium shadow-xs">
                  {selectedOption.label}
                </div>

                <div className="self-start max-w-[92%] p-3.5 rounded-2xl rounded-tl-sm bg-white border border-[#E8E2D6] text-[#243247] text-xs sm:text-[13px] leading-relaxed shadow-xs">
                  {selectedOption.response}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  {selectedOption.isWhatsAppAction ? (
                    <a
                      href={directWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs sm:text-[13px] font-bold shadow-sm transition-all"
                    >
                      <WhatsAppIcon className="w-4 h-4 shrink-0" />
                      <span>Chat with Advisor on WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <Link
                      href={selectedOption.actionHref}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#B83268] hover:bg-[#641B38] text-white text-xs sm:text-[13px] font-bold shadow-sm transition-all"
                    >
                      <span>{selectedOption.actionText}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    onClick={() => setSelectedOption(null)}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-[#687587] hover:text-[#641B38] transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back to FAQ topics</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Buttons: Separated Cleanly */}
      <div className="flex flex-col items-end gap-2.5">
        {/* 1. SEPARATE Quick FAQ / Help Button */}
        <button
          ref={faqButtonRef}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close Quick FAQs' : 'Open Quick FAQs'}
          className="group flex items-center gap-2 py-2 px-3.5 rounded-full bg-[#B83268] hover:bg-[#641B38] text-white shadow-[0_4px_16px_rgba(184,50,104,0.35)] hover:shadow-lg transition-all text-xs font-bold cursor-pointer active:scale-95"
        >
          <HelpCircle className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Quick FAQs</span>
        </button>

        {/* 2. SEPARATE Direct WhatsApp Floating Button */}
        <a
          href={directWhatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Direct WhatsApp Chat with Savvy Training Institute"
          className="group relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white shadow-[0_6px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.65)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 fill-current transition-transform duration-200 group-hover:scale-110" />

          {/* Online green indicator */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
          </span>
        </a>
      </div>
    </div>
  );
}
