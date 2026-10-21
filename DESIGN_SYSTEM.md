# World Wide NDT Institute — Design System

This design system translates the calm, editorial, daylight-gallery visual language of **Ada.cx** into a high-credibility identity for **World Wide NDT Institute & Services**.

---

## 1. Visual Philosophy & Core Tokens

### Palette
```css
:root {
  /* Surface hierarchy */
  --background: #f9f9f9;         /* Warm daylight off-white canvas */
  --surface: #ffffff;            /* Paper white content cards */
  --foreground: #0a0b0c;         /* High-contrast near-black typography */
  --muted-foreground: rgba(10, 11, 12, 0.66); /* Subdued copy */

  /* Hairline structure */
  --border: rgba(10, 11, 12, 0.12);        /* Quiet structural boundaries */
  --border-strong: rgba(10, 11, 12, 0.28); /* Focused & active borders */

  /* Brand & Accent Punctuation */
  --forest: #00543d;             /* Primary trust color (NDT certification) */
  --periwinkle: #abcbf9;         /* Selection & CTA highlight */
  --pink: #ffbbfc;               /* Soft highlight tag */
  --yellow: #fce88b;             /* Student highlight callout */
  --industrial-blue: #345b76;     /* Technical engineering marker */
  --safety-orange: #e7672e;      /* Industrial safety accent */
}
```

### Typography Scale
Humanist typography with `Inter` / `Manrope` at regular weight (`400`), hierarchy created through scale, line length, and whitespace rather than aggressive bold weights.

```css
--display-xl: clamp(3.2rem, 6.5vw, 6rem);    /* Hero statement */
--display: clamp(2.5rem, 5vw, 4.5rem);       /* Major page titles */
--h1: clamp(2rem, 3.8vw, 3.5rem);            /* Section titles */
--h2: clamp(1.6rem, 2.8vw, 2.5rem);          /* Card group headings */
--h3: clamp(1.25rem, 2vw, 1.75rem);          /* Component headings */
--body-large: clamp(1.05rem, 1.25vw, 1.25rem); /* Hero lead */
--body: 1rem;                                /* Main body */
--small: 0.875rem;                           /* Metadata & utility */
```

### Motion Design Timings & Curves
- **Micro interactions**: 160ms `cubic-bezier(0.22, 1, 0.36, 1)`
- **Dropdowns & Cards**: 280ms `cubic-bezier(0.22, 1, 0.36, 1)`
- **Editorial Section Reveals**: 600ms `cubic-bezier(0.22, 1, 0.36, 1)`
- **Hero Reveal Sequence**: 900ms total stagger

---

## 2. Layout & Grid System
- Max width: `1440px` centered with fluid `padding-inline` (1rem mobile, 2.5rem tablet, 4rem desktop).
- 12-column desktop grid, collapsing cleanly to 1 column on mobile screens under 768px.
- Spacing rhythm: `80px–120px` vertical section separation.

---

## 3. Surface & Card Architecture
- No heavy drop shadows. Depth achieved via white paper `#FFFFFF` floating over daylight background `#F9F9F9` with fine 1px charcoal border `rgba(10, 11, 12, 0.12)`.
- Pill shapes for buttons and status badges (`rounded-full`).
- Moderate radii (`8px`) for photographic cards and module containers.
