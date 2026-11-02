"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type ApprovedTestimonial = {
  id: string;
  name: string;
  course?: string;
  quote: string;
  rating?: number;
  image?: string;
  sample?: boolean;
};

/** Editable layout preview only. Not stored, approved, or shown as verified reviews. */
export const sampleTestimonials: ApprovedTestimonial[] = [
  {
    id: "sample-rahul",
    name: "Rahul S.",
    course: "NDT Level II",
    quote: "The practical training helped me understand NDT inspection concepts and prepare confidently for my career.",
    sample: true,
  },
  {
    id: "sample-priya",
    name: "Priya M.",
    course: "QA & QC",
    quote: "The QA & QC course gave me the technical knowledge and confidence I needed to pursue new opportunities.",
    sample: true,
  },
  {
    id: "sample-arjun",
    name: "Arjun K.",
    course: "Fire & Safety",
    quote: "The trainers explained complex inspection concepts in a simple and practical way. The learning experience was excellent.",
    sample: true,
  },
  {
    id: "sample-sneha",
    name: "Sneha R.",
    course: "NDT Level II",
    quote: "The hands-on training and guidance helped me improve my technical skills and professional confidence.",
    sample: true,
  },
  {
    id: "sample-kiran",
    name: "Kiran P.",
    course: "QA & QC",
    quote: "A great learning environment with supportive trainers and practical knowledge that I can apply in my career.",
    sample: true,
  },
];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "S";
}

function safeImage(src?: string) {
  if (!src) return "";
  if (src.startsWith("/")) return src;
  try {
    const url = new URL(src);
    if (url.protocol === "https:" && url.hostname === "images.unsplash.com") return src;
  } catch {
    return "";
  }
  return "";
}

export default function Testimonial3({ testimonials }: { testimonials: ApprovedTestimonial[] }) {
  const approved = testimonials.filter((item) => item.quote.trim() && item.name.trim());
  const isPreview = approved.length === 0;
  const items = isPreview ? sampleTestimonials : approved;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const count = items.length;

  const handleNext = useCallback(() => {
    if (count < 2) return;
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count < 2) return;
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (currentIndex >= count) setCurrentIndex(0);
  }, [currentIndex, count]);

  const visibleItems = useMemo(() => {
    if (count === 0) return [];
    if (count < 3) {
      return [{ ...items[currentIndex], position: "center" as const }];
    }
    const leftIndex = (currentIndex - 1 + count) % count;
    const rightIndex = (currentIndex + 1) % count;
    return [
      { ...items[leftIndex], position: "left" as const },
      { ...items[currentIndex], position: "center" as const },
      { ...items[rightIndex], position: "right" as const },
    ];
  }, [count, currentIndex, items]);

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") handlePrev();
    if (event.key === "ArrowRight") handleNext();
  }

  return (
    <section
      className="w-full overflow-hidden border-b border-[#e2e8f0] bg-[#f7f9fc] py-16 sm:py-20"
      aria-label={isPreview ? "Testimonials sample preview" : "Testimonials"}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="site-container text-center">
        <h2 className="text-[#1F1F1F]">Testimonials</h2>
        <p className="mx-auto mt-3 max-w-2xl text-[#565656]">
          Hear from students who have advanced their careers with Savvy.
        </p>
        {isPreview && (
          <p className="mx-auto mt-3 max-w-2xl text-sm font-semibold text-[#0056D2]">
            Sample preview. These quotes are not verified student reviews.
          </p>
        )}
      </div>

      {count === 0 ? null : (
        <>
          <div className="relative mx-auto mt-10 flex w-full max-w-7xl items-stretch justify-center px-4">
            <div className="flex w-full flex-row items-stretch justify-center">
              {visibleItems.map((item, index) => {
                const isCenter = item.position === "center";
                const image = safeImage(item.image);
                const rating = item.rating && item.rating >= 1 && item.rating <= 5 ? item.rating : null;
                return (
                  <React.Fragment key={`${item.id}-${item.position}`}>
                    {index > 0 && (
                      <div className="relative hidden w-5 shrink-0 lg:block">
                        <div className="absolute inset-0 h-full w-full bg-[repeating-linear-gradient(315deg,currentColor_0,currentColor_1px,transparent_0,transparent_50%)] bg-[length:10px_10px] text-[#d7e3f4] opacity-80" />
                      </div>
                    )}
                    <motion.div
                      layout
                      initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
                      animate={{ opacity: isCenter ? 1 : 0.86, scale: isCenter ? 1 : 0.97 }}
                      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 28 }}
                      style={{ willChange: "transform, opacity" }}
                      className={cn(
                        "relative flex w-full max-w-full shrink-0 flex-col justify-between overflow-hidden rounded-3xl border p-8 lg:w-[300px]",
                        isCenter
                          ? "z-20 border-[#0056D2] bg-[#0056D2] text-white"
                          : "z-0 hidden border-[#d7e3f4] bg-white text-[#565656] lg:flex",
                      )}
                    >
                      {!isCenter && item.position === "left" && (
                        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-white/70 via-white/25 to-transparent" />
                      )}
                      {!isCenter && item.position === "right" && (
                        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-l from-white/70 via-white/25 to-transparent" />
                      )}
                      {item.sample && (
                        <p className={cn("mb-4 text-xs font-semibold uppercase tracking-wide", isCenter ? "text-blue-100" : "text-[#0056D2]")}>
                          Sample
                        </p>
                      )}
                      <blockquote className={cn("mb-8 text-xl font-medium md:text-[1.35rem]", !isCenter && "opacity-80")}>
                        “{item.quote}”
                      </blockquote>
                      {rating && (
                        <p className={cn("mb-4 flex gap-1", isCenter ? "text-white" : "text-[#0056D2]")} aria-label={`${rating} out of 5 stars`}>
                          {Array.from({ length: rating }, (_, star) => (
                            <Star key={star} className="h-4 w-4 fill-current" aria-hidden="true" />
                          ))}
                        </p>
                      )}
                      <div className="mt-auto flex items-center gap-4">
                        <div className={cn("relative flex h-12 w-12 items-center justify-center overflow-hidden border-2", isCenter ? "border-white" : "border-[#0056D2]")}>
                          {image ? (
                            <Image src={image} alt="" width={48} height={48} loading="lazy" sizes="48px" className="object-cover object-top" />
                          ) : (
                            <span className={cn("text-sm font-semibold", isCenter ? "text-white" : "text-[#0056D2]")} aria-hidden="true">
                              {initials(item.name)}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className={cn("text-lg font-bold", isCenter ? "text-white" : "text-[#1F1F1F]")}>{item.name}</span>
                          {item.course && <span className={cn("text-sm", isCenter ? "text-blue-100" : "text-[#565656]")}>{item.course}</span>}
                        </div>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          {count > 1 && (
            <div className="mt-12 flex items-center justify-center gap-6">
              <button type="button" onClick={handlePrev} className="group rounded-full p-2 transition-colors hover:bg-white" aria-label="Previous testimonial">
                <ArrowLeft className="h-6 w-6 text-[#8C9BAE] transition-colors group-hover:text-[#0056D2]" />
              </button>
              <button type="button" onClick={handleNext} className="group rounded-full p-2 transition-colors hover:bg-white" aria-label="Next testimonial">
                <ArrowRight className="h-6 w-6 text-[#8C9BAE] transition-colors group-hover:text-[#0056D2]" />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
