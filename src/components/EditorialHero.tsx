'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Award, Briefcase, ChevronRight } from 'lucide-react';
import { TechnicalGraphic } from './TechnicalGraphic';

export const EditorialHero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Ada-inspired daylight soft blurred background punctuation */}
      <div className="blur-hero-bg">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-periwinkle/30" />
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-yellow/30" />
        <div className="absolute bottom-[-10%] left-[40%] w-[600px] h-[400px] rounded-full bg-pink/20" />
      </div>

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col items-start gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-foreground shadow-subtle">
              <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
              <span>Best NDT Training Institute in India</span>
            </div>

            <h1 className="text-display leading-[1.03] tracking-tight font-normal text-foreground">
              Master industrial inspection with <span className="underline decoration-forest/30 decoration-2 underline-offset-8">ASNT Level II</span> &amp; QA/QC certification.
            </h1>

            <p className="text-body-large text-muted-foreground max-w-2xl leading-relaxed">
              Savvy Training Institute offers technical training programmes in inspection, quality assurance, HVAC and related fields.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/admission" className="pill-button-forest text-sm px-7 py-3.5 shadow-subtle group">
                Apply for Course
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/course" className="pill-button-secondary text-sm px-7 py-3.5">
                Explore All Programs
              </Link>
            </div>

            {/* Trust Markers */}
            <div className="hairline-divider my-4" />
            <div className="grid grid-cols-3 gap-6 text-xs text-foreground/80 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                <span>Career pathways</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-forest shrink-0" />
                <span>ASNT Level II Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-forest shrink-0" />
                <span>Global Alumni Network</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Photographic Framing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border bg-surface shadow-overlay group">
              <div className="aspect-[4/3] relative">
                <Image
                  src="/images/hero-factory.jpg"
                  alt="Savvy Training Institute trainees inspecting industrial components on site"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>

              {/* Original technical readout accent */}
              <div className="absolute top-3 left-3 w-36 rounded-lg bg-surface/85 backdrop-blur-md border border-border/70 p-2 shadow-subtle">
                <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5 px-0.5">
                  UT A-Scan
                </span>
                <TechnicalGraphic className="w-full h-auto" />
              </div>

              {/* Overlapping Glassmorphism Card */}
              <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-4 rounded-xl border border-border/80 shadow-subtle flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Featured Batch</span>
                  <h4 className="text-xs font-semibold text-foreground mt-0.5">NDT Level II + QA/QC Combo</h4>
                  <p className="text-[11px] text-muted-foreground">Classroom &amp; Practical Lab Training</p>
                </div>
                <Link href="/course/ndt-level-2-course" className="w-8 h-8 rounded-full bg-foreground text-white flex items-center justify-center hover:bg-forest transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
