'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'What are the general eligibility criteria for enrolling in courses at Savvy?',
      answer:
        'Eligibility depends on the specific course. Technical programs such as NDT Level II, QA/QC, and HVAC are primarily structured for diploma holders, engineering graduates (Mechanical, Civil, Electrical), B.Sc candidates, and ITI technicians. Foundational safety diplomas also accept 10th and 12th pass applicants. Specific requirements are detailed on each individual course page.',
      category: 'Admissions & Eligibility',
    },
    {
      question: 'What is the typical duration and schedule for batches?',
      answer:
        'Course durations range from 30 days (intensive short-format courses like HVAC and Revit MEP) to 45 days (NDT Level II comprehensive certification) and up to 1 year for extended Fire & Industrial Safety diplomas. We operate both regular weekday batches (Monday to Friday) and dedicated weekend batches for working professionals.',
      category: 'Schedules & Batches',
    },
    {
      question: 'How is the practical laboratory training conducted?',
      answer:
        'Our training is laboratory-first. Students spend dedicated hours operating calibrated testing gear in our Bengaluru facility, including Ultrasonic Flaw Detectors, Radiographic Film Illuminators, Magnetic Particle Yokes, and Dye Penetrant lines on real industrial weld coupons with simulated defects.',
      category: 'Practical Training',
    },
    {
      question: 'What certificates are issued upon completion, and how can they be verified?',
      answer:
        'Depending on the course track, students receive official certification such as ASNT Level II credentials (VT, LPT, MPT, UT, RT, RTFI), QA/QC Inspection certificates, or Autodesk Revit MEP credentials. Every certificate issued includes a secure issue number traceable through authorized institute verification records.',
      category: 'Certifications',
    },
    {
      question: 'What currencies are supported for course tuition fees?',
      answer:
        'We support multi-currency fee schedules including Indian Rupees (INR ₹), British Pounds (GBP £), US Dollars (USD $), and UAE Dirhams (AED د.إ) to accommodate domestic and international applicants. Tuition can be paid via authorized bank transfers and digital payment channels without hidden charges.',
      category: 'Fees & Payments',
    },
    {
      question: 'How do I register or reserve a seat for an upcoming batch?',
      answer:
        'You can submit an enquiry directly through our website by choosing your course of interest on the Contact Us page. An academic advisor will reach out with the batch calendar, seat availability, fee breakdown, and registration instructions.',
      category: 'Registration',
    },
    {
      question: 'Does completing a course guarantee immediate employment?',
      answer:
        'No educational institution can legitimately guarantee employment. Savvy provides comprehensive placement assistance, CV preparation, technical interview guidance, and connects candidates with our verified recruiting network across oil & gas, fabrication, and EPC sectors, but ultimate hiring depends on candidate performance and employer standards.',
      category: 'Career Guidance',
    },
    {
      question: 'Can I switch between classroom training and hybrid learning?',
      answer:
        'Yes. Students can attend theoretical modules and code lectures through our digital portal while completing hands-on flaw detection and laboratory assessments on campus during designated practical weeks.',
      category: 'Learning Format',
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="py-20 sm:py-24 bg-white border-b border-[#e2e8f0]" id="faq">
      <div className="site-container max-w-4xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e2e8f0] text-xs font-bold text-[#0056D2] mb-4 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#0056D2]" />
            <span>Admissions &amp; Academic FAQs</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1F1F1F] tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-sm sm:text-base text-[#565656] mt-4 leading-relaxed max-w-2xl font-normal">
            Find answers to common questions about eligibility, course formats, laboratory training, certifications, and fee schedules.
          </p>
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#0056D2] bg-white shadow-sm ring-1 ring-[#0056D2]/20'
                    : 'border-[#e2e8f0] bg-white hover:border-[#0056D2]/40'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0056D2]"
                >
                  <div className="flex flex-col gap-1 pr-2">
                    {faq.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0056D2]">
                        {faq.category}
                      </span>
                    )}
                    <span className="text-sm sm:text-base font-bold text-[#1F1F1F] leading-snug">
                      {faq.question}
                    </span>
                  </div>

                  <div
                    className={`h-8 w-8 rounded-full border border-[#e2e8f0] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-[#0056D2] text-white border-[#0056D2]' : 'bg-white text-[#0056D2]'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-1 text-xs sm:text-sm text-[#565656] leading-relaxed border-t border-[#e2e8f0]">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#003e9a] via-[#0056D2] to-[#0284c7] text-white border border-[#0056D2]/30 shadow-[0_8px_30px_rgba(0,86,210,0.2)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0056D2] bg-white px-3 py-0.5 rounded-full shadow-xs">
              Have a Specific Question?
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-3">
              Speak with Our Academic Coordination Team
            </h3>
            <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-xl">
              If your question isn’t covered here, our admissions coordinators can provide detailed syllabus brochures and course guidance.
            </p>
          </div>

          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#0056D2] text-xs font-bold hover:bg-[#f3f5fb] transition-colors shrink-0 shadow-md"
          >
            <span>Ask a Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
