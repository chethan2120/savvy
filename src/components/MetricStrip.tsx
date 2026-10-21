'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 10000, suffix: '+', label: 'Students Placed' },
  { value: 100, suffix: '%', label: 'Placement Support' },
  { value: 250, suffix: '+', label: 'Hiring Partners' },
  { value: 12, suffix: '+', label: 'Countries Placed In' },
];

const DURATION = 1600;

/** Counts 0 → target with an ease-out curve once it scrolls into view. */
const CountUp: React.FC<{ target: number; suffix: string; delay: number }> = ({
  target,
  suffix,
  delay,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let frame = 0;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start - delay;

      if (elapsed < 0) {
        frame = requestAnimationFrame(step);
        return;
      }

      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));

      if (t < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, delay]);

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString('en-US')}
      {suffix}
    </span>
  );
};

export const MetricStrip: React.FC = () => {
  return (
    <section className="py-12 bg-surface border-y border-border">
      <div className="site-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-border">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex flex-col items-center text-center ${index > 0 ? 'pt-6 md:pt-0' : ''}`}
            >
              <span className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
                <CountUp target={stat.value} suffix={stat.suffix} delay={index * 120} />
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-2">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
