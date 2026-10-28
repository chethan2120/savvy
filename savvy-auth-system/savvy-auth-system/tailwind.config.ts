import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // Small Androids (360px) still get a two-up grid where the design
        // calls for one; this is the breakpoint that was missing.
        xs: "420px",
      },
      // Channel-triple vars (see globals.css) so `/opacity` modifiers such as
      // `bg-forest/10` and `border-border/50` actually resolve — with a bare
      // `var(--forest)` hex Tailwind emitted an invalid colour and the
      // utility did nothing.
      colors: {
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground-rgb) / <alpha-value>)",
        border: "rgb(var(--border-rgb) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong-rgb) / <alpha-value>)",
        forest: {
          DEFAULT: "rgb(var(--forest-rgb) / <alpha-value>)",
          hover: "#004230",
        },
        periwinkle: "rgb(var(--periwinkle-rgb) / <alpha-value>)",
        pink: "rgb(var(--pink-rgb) / <alpha-value>)",
        yellow: "rgb(var(--yellow-rgb) / <alpha-value>)",
        "industrial-blue": "rgb(var(--industrial-blue-rgb) / <alpha-value>)",
        "safety-orange": "rgb(var(--safety-orange-rgb) / <alpha-value>)",
      },
      fontSize: {
        hero: ["var(--hero)", { lineHeight: "0.94" }],
        kinetic: ["var(--kinetic)", { lineHeight: "0.92" }],
        "display-xl": ["var(--display-xl)", { lineHeight: "1.02" }],
        display: ["var(--display)", { lineHeight: "1.05" }],
        h1: ["var(--h1)", { lineHeight: "1.08" }],
        h2: ["var(--h2)", { lineHeight: "1.12" }],
        h3: ["var(--h3)", { lineHeight: "1.2" }],
        "body-large": ["var(--body-large)", { lineHeight: "1.6" }],
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
        card: "8px",
        nav: "32px",
        input: "6px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(10, 11, 12, 0.05)",
        card: "0 2px 8px rgba(10, 11, 12, 0.04)",
        overlay: "0 12px 32px rgba(10, 11, 12, 0.12)",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
        "out-soft": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.4, 0.64, 1)",
      },
      transitionDuration: {
        fast: "160ms",
        base: "280ms",
        slow: "520ms",
      },
      spacing: {
        "section-y": "var(--section-y)",
        gutter: "var(--gutter)",
        "header-h": "var(--header-h)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "none" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 520ms cubic-bezier(0.16, 1, 0.3, 1) both",
        marquee: "marquee 38s linear infinite",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
