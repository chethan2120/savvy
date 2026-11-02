import { cn } from "@/lib/utils";
import { TestimonialCard, TestimonialAuthor } from "@/components/ui/testimonial-card";

interface TestimonialsSectionProps {
  title: string;
  description: string;
  badge?: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

export function TestimonialsSection({
  title,
  description,
  badge = "Verified Student Feedback",
  testimonials,
  className,
}: TestimonialsSectionProps) {
  return (
    <section
      className={cn(
        "bg-white text-foreground border-b border-[#e3e3e3]",
        "py-16 sm:py-24 px-0 overflow-hidden relative",
        className
      )}
    >
      <div className="mx-auto flex max-w-container flex-col items-center gap-6 text-center sm:gap-12">
        <div className="flex flex-col items-center gap-2.5 px-4 sm:gap-3 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B83268]">
            {badge}
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#641B38] leading-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-[#30262B] max-w-2xl leading-relaxed font-normal">
            {description}
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden pt-4">
          <div className="group flex overflow-hidden p-2 [--gap:1.25rem] [gap:var(--gap)] flex-row [--duration:35s]">
            <div className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row group-hover:[animation-play-state:paused]">
              {[...Array(3)].map((_, setIndex) => (
                testimonials.map((testimonial, i) => (
                  <TestimonialCard
                    key={`${setIndex}-${i}`}
                    {...testimonial}
                  />
                ))
              ))}
            </div>
          </div>

          {/* Left & Right gradient edge fades for smooth marquee transition */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-28 bg-gradient-to-r from-white to-transparent sm:block z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-28 bg-gradient-to-l from-white to-transparent sm:block z-10" />
        </div>
      </div>
    </section>
  );
}
