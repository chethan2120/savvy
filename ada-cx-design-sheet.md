# Ada.cx — Complete Website Design Sheet

**Website studied:** https://www.ada.cx/  
**Study date:** 24 July 2026  
**Purpose:** A practical reference for recreating the visual language, page architecture, components, interaction patterns, and motion character of Ada's public marketing website.

> **Coverage note**
> This sheet documents every meaningful **page family and reusable template** across the current public site: homepage, platform, products/channels, industries, customer stories, resources, company pages, careers, and Ada Labs. Pages that only change editorial content—such as individual blog posts or customer stories—are represented by their shared detail-page template rather than repeated article by article.
>
> **Accuracy note**
> Colors, type scale, spacing, radii, page content structure, and visible controls are based on the live site and a current extracted design-system reference. Exact JavaScript animation curves and timings are not publicly exposed in the rendered page text. Motion values marked **reconstruction estimate** are therefore recommendations that reproduce the observed feel, not claims about Ada's source code.

---

## 1. Design in one sentence

Ada is a **calm editorial enterprise site presented like a daylight gallery**: warm off-white space, near-black typography, one regular-weight humanist sans-serif, flat bordered surfaces, blurred cinematic photography, and small bursts of forest green, periwinkle, pink, and butter yellow.

The site looks premium because it is restrained. It avoids the common “AI company” visual clichés of glowing grids, neon gradients, excessive glassmorphism, floating 3D objects, and crowded dashboards.

---

## 2. Brand character

### Core personality

- Assured, not aggressive.
- Sophisticated, but not luxury-fashion cold.
- Technical, but explained through outcomes and stories.
- Enterprise-ready, while retaining playful color punctuation.
- Human-centered rather than robot-centered.
- Editorial and spacious rather than dashboard-dense.
- Canadian identity appears as a small trust signal, not a visual theme.

### Visual tension that makes the brand memorable

Ada combines two seemingly opposite modes:

1. **Serious enterprise foundation** — charcoal text, thin borders, large proof points, customer metrics, security and trust content.
2. **Gentle optimism** — softly blurred landscapes, pastel accents, rounded pills, generous breathing room, conversational headings.

This balance should be preserved. Making the system darker, more futuristic, more gradient-heavy, or more saturated would lose the recognizable Ada character.

---

## 3. Site architecture

### Primary navigation

- Platform
  - Overview
  - Playbooks
  - Integrations
  - Trust & Safety
- Products / Channels
  - Voice
  - Messaging
  - Email
- Optimize
  - Vertical Playbooks
- Industries
  - Ecommerce
  - Financial Services
  - Gaming
  - Health Insurance
  - Property & Casualty Insurance
  - SaaS / Technology
  - Travel
- Customers
  - Customer stories
- Resources
  - Blog
  - Research
  - Events
  - Resource library
- Learn
  - Documentation
  - Ada Academy
- Why Ada
- Primary CTA: Speak to an expert

### Footer architecture

- Platform
- Channels
- Industries
- Resources
- Ada Labs
  - Overview
  - Applied AI research
  - Ada Labs blog
  - Applied AI careers
- Company
  - Why Ada
  - Careers
  - Media Center
  - Become a partner
  - Trust center
- AI-summary shortcuts
- Newsletter / insights signup
- Social links
- Terms, privacy, security, accessibility, and status

### Reusable page families

| Family | Representative pages | Main pattern |
|---|---|---|
| Brand landing | Homepage | Atmospheric hero, proof, operating model, industries, stories, platform, trust, insights |
| Platform overview | Platform | Product architecture, modules, integrations, demo, FAQs |
| Product capability | Playbooks | Hero demo, industry examples, alternating product UI, proof, FAQ |
| Catalog | Integrations | Search, filters, categorized integration cards |
| Enterprise assurance | Trust & Safety | Security narrative, governance, platform controls, trust proof |
| Service / operating model | Practice, Experts | Editorial hero, proof metrics, methodology or people, testimonials |
| Channel product | Voice, Messaging, Email | Channel hero, benefits, product media, playbooks, integrations, proof, FAQs |
| Industry solution | Seven industry pages | Industry hero, tuned capabilities, testimonial, use cases, accordions, resources |
| Customer index | Customer stories | Filterable two-column editorial card listing |
| Customer detail | Individual case studies | Brand hero, metric strip, long-form story, quotes, full-width imagery |
| Editorial index | Blog | Featured article, latest cards, category links, resource promotion, pagination |
| Editorial detail | Blog article | Metadata, headline, author, hero image, long-form article, table of contents |
| Resource index | Resource Library | Featured item, search, category chips, card grid, pagination |
| Resource detail | Guide/template/report | Metadata, headline, cover image, download CTA, summary and contents |
| Events | Events | Featured upcoming event followed by on-demand event library |
| Manifesto | Why Ada | Large narrative statements, principles, founder voice, strategic model |
| Employer brand | Careers | Mission, culture video, values, remote-work story, perks, photo wall, jobs CTA |
| Research sub-brand | Ada Labs | Minimal research navigation, papers/posts, research themes, future work |
| Utility | Legal, accessibility, privacy | Readable single-column content with shared global chrome |

---

# 4. Foundation tokens

## 4.1 Color palette

### Core colors

| Token | Hex | Primary use |
|---|---:|---|
| `forest-depth` | `#00543D` | Trust color, deep brand accent, dark colored actions, stat accent |
| `periwinkle` | `#ABCBF9` | Selected/action surface, conversion highlight, cool accent |
| `candy-pink` | `#FFBBFC` | Warm playful accent, stat bar, occasional soft surface |
| `butter` | `#FCE88B` | Warm accent, AI response/highlight, stat bar |
| `inkstone` | `#0A0B0C` | Headlines, body copy, dark buttons, borders, dark surfaces |
| `plum-ash` | `#392C38` | Secondary dark tint and subdued dark containers |
| `ash` | `#D8D8D8` | Dividers, disabled borders, low-emphasis decorative fills |
| `bone` | `#F9F9F9` | Main page canvas and quiet section surface |
| `paper` | `#FFFFFF` | Cards, forms, product mockups, raised surface tier |

### Recommended semantic aliases

```css
:root {
  --ada-bg: #f9f9f9;
  --ada-surface: #ffffff;
  --ada-text: #0a0b0c;
  --ada-text-muted: rgba(10, 11, 12, 0.68);
  --ada-border: rgba(10, 11, 12, 0.12);
  --ada-border-strong: rgba(10, 11, 12, 0.28);
  --ada-dark: #0a0b0c;
  --ada-green: #00543d;
  --ada-blue: #abcbf9;
  --ada-pink: #ffbbfc;
  --ada-yellow: #fce88b;
}
```

### Color behavior

- The accents are punctuation, not wallpaper.
- Accent colors commonly appear as small bars, pills, product-state highlights, selected controls, or one card in a rhythm.
- Main text remains near-black even when nearby accents are bright.
- Large sections mostly alternate between `bone` and `paper`.
- Dark surfaces are deliberate moments, not the default theme.
- There are no decorative button gradients.
- Never use all four accent colors at equal visual weight in one small component.

### Contrast hierarchy

1. Inkstone on paper/bone: primary reading relationship.
2. White on inkstone/forest: reverse contrast for calls to action and announcement bands.
3. Muted inkstone at approximately 60–72% opacity: descriptions and metadata.
4. Hairline inkstone at approximately 8–15% opacity: structural boundaries.

---

## 4.2 Typography

### Primary typeface

**Roobert**, regular weight (`400`) across almost the entire interface.

Suggested fallbacks:

```css
font-family: "Roobert", Inter, "DM Sans", Söhne, Arial, sans-serif;
```

### Defining rule

Hierarchy comes from **size, line length, and whitespace**, not bold-weight contrast. This is central to the Ada look.

### Type scale

| Role | Desktop size | Line height | Weight | Typical use |
|---|---:|---:|---:|---|
| Display XL | 72px | 1.00–1.05 | 400 | Homepage/manifesto hero |
| Display | 60px | 1.00–1.08 | 400 | Product and industry hero |
| H1 compact | 48px | 1.05–1.12 | 400 | Article, resource, secondary landing hero |
| H2 large | 36px | 1.10–1.18 | 400 | Major section title |
| H2 | 32px | 1.20–1.25 | 400 | Content sections and cards |
| H3 | 24px | 1.28–1.35 | 400 | Feature/card headings |
| Subheading | 20px | 1.35–1.45 | 400 | Intro copy, prominent labels |
| Large body | 18px | 1.50–1.58 | 400 | Hero description and article lead |
| Body | 16px | 1.48–1.60 | 400 | Standard copy |
| Small body | 15px | 1.45–1.55 | 400 | Navigation and card descriptions |
| Metadata | 14px | 1.40–1.50 | 400 | Dates, categories, utility text |
| Micro | 12px | 1.35–1.45 | 400 | Tags and compact UI |

### Responsive type guidance

```css
.hero-title {
  font-size: clamp(3rem, 6vw, 4.5rem);
  line-height: 1.03;
  font-weight: 400;
  letter-spacing: 0;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3.75rem);
  line-height: 1.08;
  font-weight: 400;
}
```

### Typography details

- Sentence case is dominant.
- Some brand/editorial headings use lowercase intentionally, especially Careers and manifesto-like sections.
- Letter spacing is generally natural; avoid aggressive negative tracking.
- Headlines are allowed to wrap into visually balanced, relatively short lines.
- Body columns are narrower than the grid allows—roughly 55–72 characters for long-form reading.
- Labels are quiet and functional rather than uppercase-heavy.

---

## 4.3 Spacing

### Base rhythm

- Base unit: `4px`
- Common element gap: `8–16px`
- Card padding: `24px`
- Major section separation: approximately `80px`
- Full landing-page bands often use `96–160px` vertical padding on desktop.
- Never compress a major content band below about `48px` vertical separation.

### Token scale

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-9: 36px;
  --space-10: 40px;
  --space-12: 48px;
  --space-18: 72px;
  --space-20: 80px;
  --space-24: 96px;
  --space-28: 112px;
  --space-30: 120px;
  --space-40: 160px;
  --space-44: 176px;
}
```

### Spacing character

The interface feels expensive mainly because it lets content breathe. A section should rarely contain more than one dominant idea. Use fewer elements with larger separation rather than shrinking everything into a dense block.

---

## 4.4 Shape and borders

| Element | Radius |
|---|---:|
| Inputs and compact controls | 4px |
| Cards and media panels | 8px |
| Navigation container / large control | 32px |
| Buttons, tags, chips | 9999px / full pill |

### Borders

- 1px hairline borders.
- Use inkstone at 8–15% opacity for quiet structure.
- Use 20–30% opacity for selected or interactive states.
- Dark buttons may use a slightly lighter inner/outer line, but not a shadow.

### Elevation

No conventional card shadows. Depth is created by:

1. Warm off-white page background.
2. White card surface.
3. Thin borders.
4. Overlap and cropping.
5. Dark image gradients where text sits over photography.

Avoid `box-shadow` unless it is nearly imperceptible and needed for an overlay menu. For static content cards, remove it entirely.

---

## 4.5 Grid and layout

### Desktop

- Maximum content width: approximately `1200px`.
- Centered container.
- Full-bleed background bands break outside the container.
- Common grid: 12 columns or a flexible equivalent.
- Standard side padding: `24–40px` depending on viewport.
- Hero: commonly 60/40 split or centered editorial composition.
- Stat section: four equal columns.
- Feature cards: three equal columns.
- Customer/resource lists: two columns with generous row gaps.
- Product detail sections: alternating 5/7 or 6/6 text-media splits.

### Tablet

- 24–32px outside padding.
- Four-column stats can become 2×2.
- Three-card grids become two columns.
- Alternating media sections preserve order but reduce visual offset.
- Hero generally becomes a wider text block over or above media.

### Mobile

- 16–20px outside padding.
- All primary grids become one column.
- Hero headline drops to approximately 44–52px.
- Navigation becomes a drawer/accordion.
- Horizontal marquees may remain clipped and continuously moving.
- Carousels expose part of the next card to communicate horizontal movement.
- Desktop decorative overlaps should flatten into normal document flow.
- Keep 48–72px between major mobile sections; do not make the mobile page visually cramped.

---

# 5. Imagery and art direction

## 5.1 Atmospheric hero photography

The signature image treatment is a heavily blurred landscape or environmental photograph. Examples include:

- Blue sky fading into a golden field and dark green foreground.
- Orange/pink sunset horizon above deep purple or near-black foreground.
- Strong diagonal or horizontal motion blur.
- Color and light remain recognizable, while literal subject detail disappears.

### How to reproduce

1. Start with cinematic landscape photography with clear color bands.
2. Crop very wide.
3. Apply strong Gaussian blur, roughly 30–80px depending on source resolution.
4. Slightly increase saturation but keep highlights soft.
5. Add an optional translucent neutral layer to reduce competing detail.
6. Use large typography directly over the atmosphere or place a white product-demo card over it.

### Avoid

- Abstract vector gradients pretending to be photography.
- Sharp stock images in the hero.
- Highly visible faces behind hero copy.
- Synthetic AI glow effects.

## 5.2 Editorial photography

Feature and people cards use:

- Real people working, presenting, or collaborating.
- Tight crops.
- Natural or cinematic light.
- Documentary rather than staged corporate-stock tone.
- Bottom dark gradient when text overlays the image.
- 8px card corners.

## 5.3 Product UI imagery

- Mostly white surfaces.
- Thin gray borders.
- Compact black text.
- Small 4px control radii.
- Black selected radios/toggles/icons.
- Butter-yellow conversational response bubbles.
- Occasional dark circular Ada mark.
- Screens are shown inside uncluttered, flat frames rather than realistic device mockups.

## 5.4 Logos

- Customer logos are monochrome or reduced contrast.
- Approximately 40–60px visual height.
- Even spacing and optical alignment matter more than identical bounding boxes.
- The strip should feel quiet, not like a sponsor wall.

## 5.5 Ada Labs imagery

Ada Labs behaves like a research publication rather than the main marketing site. Use technical diagrams, research visualizations, paper-like content cards, and minimal editorial imagery. Keep the interface quieter and more cerebral than the commercial site.

---

# 6. Global chrome

## 6.1 Announcement bar

### Anatomy

- Full width.
- Approximately 40px high on desktop.
- Dark inkstone background.
- White 14px text.
- Event/status label plus a short description.
- Right-side or inline pill link.
- Can disappear on selected pages such as Careers.

### Motion

- Entrance can be immediate or a subtle downward reveal.
- Avoid auto-rotating messages unless accessibility controls are provided.

## 6.2 Primary navigation

### Anatomy

- White surface.
- Approximately 64px height.
- Ada wordmark at left.
- Horizontal navigation centered/right.
- Dropdown chevrons.
- Utility/support access.
- Dark pill CTA with round arrow icon.
- Sticky behavior.

### Dropdown behavior

- Large, clean menu panels rather than tiny browser-like dropdowns.
- Link title plus concise explanatory copy for platform/resource links.
- Grouped columns for channels, industries, or learning resources.
- White panel with hairline border; shadow should be absent or extremely soft.
- Open state should not obscure the current page more than necessary.

### Mobile drawer

- Full or near-full viewport sheet.
- Section rows become accordions.
- Primary CTA remains visible.
- Large tap targets, at least 44px.
- Preserve the warm white/bone surface rather than introducing a separate dark mobile style.

## 6.3 Footer

### Structure

- Multi-column sitemap.
- Ada Labs gets its own cluster.
- AI-summary links appear as a contemporary utility feature.
- Newsletter or insights block.
- Mission statement.
- Social links.
- Legal row.

### Visual treatment

- Long, spacious, editorial footer rather than a compressed utility strip.
- Thin separators.
- Mostly bone/paper and inkstone.
- Text size 14–16px.
- Maintain clear grouping and generous column gutters.

## 6.4 Floating support widget

- Small rounded white card or circular launcher near the lower corner.
- Dark circular Ada icon.
- Must not overlap primary CTAs or mobile browser controls.
- Use a subtle border rather than a heavy shadow.

---

# 7. Core components

## 7.1 Buttons

### Primary dark

- Inkstone background.
- White text.
- Full pill radius.
- 12px vertical / 20–24px horizontal padding.
- Optional circular arrow at right.

### Primary accent

- Periwinkle, forest, or another single accent fill.
- Inkstone or white text according to contrast.
- Used sparingly for one conversion moment.

### Secondary outline

- Transparent or paper background.
- 1px hairline border.
- Inkstone text.
- Same pill geometry.

### Text/circular-arrow CTA

- Text paired with a bordered or filled circular arrow.
- Common on cards and section links.
- The circle is usually the visual punctuation rather than a large rectangular button.

### States

- Hover: slight background-tone shift and arrow translation.
- Active: compress to 98–99% scale.
- Focus-visible: 2px high-contrast outline with offset.
- Disabled: ash border/text; preserve readable contrast.

## 7.2 Pills and chips

Uses:

- Categories.
- Industry filters.
- Resource filters.
- Metadata.
- Selected tabs.

Style:

- Full pill.
- 12–14px text.
- 1px border.
- Selected state may become inkstone, forest, or periwinkle filled.
- Avoid many unrelated chip colors in one group.

## 7.3 Stat card

### Anatomy

- White surface.
- 8px radius.
- Hairline border or surface contrast.
- 4px colored bar at the left edge.
- Large numeric figure.
- Short explanation.

### Set behavior

A four-card row often maps the four accent colors across the sequence. The accents create rhythm, not category semantics unless explicitly labelled.

## 7.4 Logo marquee

- Duplicate logo sequence to create a seamless loop.
- Monochrome logos.
- Constant linear velocity.
- No easing at the loop point.
- Pause or reduce movement under `prefers-reduced-motion`.
- Often appears immediately after a hero and again near the final CTA.

## 7.5 Media feature card

- Full-bleed editorial image.
- 8px radius.
- Text over the lower image region or in a separate lower panel.
- Dark transparent-to-40% gradient behind white overlay text.
- Circular-arrow CTA.
- Hover may gently scale image without moving the card container.

## 7.6 Product UI panel

- White 8px-radius frame.
- Little or no outer chrome.
- Thin internal borders.
- Compact form controls.
- Realistic product state, not decorative filler.
- May sit over colored or photographic background.

## 7.7 Alternating text-media section

Common on channel and industry pages.

- Two-column grid.
- One side: small label, 32–48px heading, body, CTA.
- Other side: one or two layered product screenshots.
- Alternate image-left and image-right down the page.
- Maintain consistent media size so the page has a stable rhythm.

## 7.8 Testimonial card / carousel

- Large quote, often 24–36px.
- Person name, role, and brand.
- Optional portrait or full-bleed image.
- Customer metric can share the slide.
- Previous/next controls are compact circular arrows.
- Multiple stories can occupy a horizontal carousel.

## 7.9 Accordion

Uses:

- FAQs.
- Feature exploration.
- Industry capabilities.
- Live demo prompt groups.

Style:

- Full-width rows divided by hairlines.
- Plus/minus control aligned right.
- 18–24px question/feature title.
- Expanded content remains restrained in width.
- Related imagery can update beside the accordion on desktop.

## 7.10 Tabs

- Used for industries, playbooks, and category filters.
- Often pill-style or understated text tabs.
- Selection is shown through fill, underline, border, or a corresponding media update.
- Transition should preserve layout height where possible to prevent page jumping.

## 7.11 Search input

Especially important on Integrations and Resource Library pages.

- White surface.
- 4px radius.
- 1px ash/inkstone border.
- Search icon.
- Clear placeholder.
- Broad width—this is a primary page control, not a tiny header search.

## 7.12 Integration card

- Integration logo.
- Integration name.
- Short description.
- Category/tag pills.
- White/bone flat surface with hairline division.
- Grid or list supports filtering.
- Hover communicates clickability through border and arrow movement, not elevation.

## 7.13 Article/resource card

- Optional thumbnail.
- Category pill/link.
- Date and reading time.
- 24–32px title.
- Short excerpt.
- Divider between items.
- Cards may feel more like editorial rows than boxed tiles.

## 7.14 Video module

- Large image/poster or clean player frame.
- Explicit Play, Replay, Resume, and unmute controls.
- Avoid hidden autoplay audio.
- Video often acts as a proof/demo section between feature bands.

## 7.15 Audio / real-call demo

- A white demo card over the blurred hero.
- Customer/brand context.
- Play or “Listen to a real call” action.
- For Voice, an interactive live call demo can pair a named AI agent with prompt categories.
- Always show state: ready, connecting, active, ended, error.

---

# 8. Page-by-page design anatomy

## 8.1 Homepage

### Section order

1. Optional dark announcement bar.
2. Sticky white navigation.
3. Full-bleed blurred photographic hero.
4. Oversized headline: agentic customer experience positioning.
5. Supporting statement and Canadian/global trust line.
6. Floating real-call/product demo card.
7. Continuous enterprise logo strip.
8. Four-part proof/stat band.
9. ACX Operating Model explanation.
10. Industry solution cards.
11. Customer-story carousel with outcomes.
12. Platform architecture/capability section, often accordion-driven.
13. Trust & Safety grid.
14. Insights/resources grid.
15. Large final CTA.
16. Repeated logo proof and footer.

### Layout character

- Hero is the most visually atmospheric part of the commercial site.
- Content after the hero becomes increasingly structured and product-focused.
- Major section titles are large and often centered.
- Proof alternates between quantitative stats and human customer stories.
- The page intentionally moves from emotion → credibility → product system → trust → learning → conversion.

### Key recreation rule

Do not make every homepage section visually loud. The hero owns atmosphere. Later sections should become flatter, calmer, and more legible.

---

## 8.2 Platform Overview

### Section order

1. Product-platform hero.
2. Customer logos.
3. Testimonial carousel or proof block.
4. Outcome statistics.
5. High-level platform diagram.
6. Reasoning Engine.
7. Conversation Hub.
8. Performance Center.
9. Developer Toolkit.
10. Integrations logo marquee.
11. Product/video demonstration.
12. Additional feature cards.
13. Trust section.
14. FAQ accordion.
15. Final CTA.

### Design treatment

- More diagrammatic and product-architectural than the homepage.
- UI screenshots and system modules replace some of the cinematic photography.
- Still preserves spacious editorial headings and simple cards.

---

## 8.3 Playbooks

### Section order

1. Playbooks hero with product video/media.
2. Industry tabs or accordion.
3. Use-case-specific paired UI screenshots.
4. Alternating feature rows.
5. Customer testimonial.
6. Demo video.
7. FAQ.
8. Final conversion CTA.

### Interaction model

- Selecting an industry or use case updates related content/media.
- Screenshot transitions should crossfade and move a few pixels rather than hard swap.
- Keep controls visible and preserve media-frame height.

---

## 8.4 Integrations

### Section order

1. Simple capability hero.
2. Search field.
3. Category filter chips.
4. Integration card grid/list.
5. Empty/no-results state.
6. Developer or partner CTA.
7. Footer.

### Important states

- Default catalog.
- Search active.
- One or multiple filters selected.
- Loading.
- No matches.
- Integration detail or outbound-link state.

### Visual priority

The search/filter controls should be the visual anchor after the hero. Avoid overdecorating the catalog.

---

## 8.5 Trust & Safety

### Expected structure from the live navigation and platform pattern

1. Enterprise trust hero.
2. Security/compliance proof.
3. Governance and control model.
4. Data protection and privacy.
5. Reliability/operations.
6. Responsible AI / guardrails.
7. Trust-center links or certifications.
8. Customer proof.
9. FAQ.
10. Enterprise CTA.

### Visual treatment

- More restrained than industry pages.
- Use dark/forest sections selectively to signal confidence.
- Replace decorative storytelling with diagrams, structured control lists, and clear evidence.
- Never rely only on certification logos; explain what the controls mean for the buyer.

---

## 8.6 ACX Practice

### Section order

1. Editorial hero.
2. Logo strip and proof stats.
3. ACX operating-model narrative.
4. Blueprint.
5. Methodology.
6. Maturity model.
7. Benchmarks.
8. Academy.
9. Testimonials and imagery.
10. CTA.

### Style

Feels like a strategic consulting/service page. Use larger narrative copy, fewer product screenshots, and more frameworks.

---

## 8.7 ACX Experts

### Section order

1. People/service hero.
2. Logos and proof metrics.
3. Customer testimonials.
4. Consultant/expert profiles.
5. Quote cards.
6. Community/editorial image grid.
7. Partner logo marquee.
8. CTA.

### Style

Warmer and more human than the platform pages. Photography and individual expertise carry more weight than diagrams.

---

## 8.8 Voice

### Section order

1. Voice-specific hero.
2. Logo proof.
3. “Why enterprises choose” capability list with audio/video.
4. Testimonials.
5. Three alternating feature sections with layered media.
6. Voice product video.
7. Interactive live demo with named AI voice and prompt categories.
8. Feature accordion.
9. Playbooks block.
10. Integrations marquee.
11. Resources.
12. FAQ.
13. CTA.

### Motion/interaction emphasis

Voice is the most experiential product page. Audio states, waveform/progress feedback, call status, and microphone permissions must feel polished and trustworthy.

---

## 8.9 Messaging

### Section order

1. Messaging hero and proof logos.
2. Three alternating capability sections.
3. Testimonial.
4. Playbooks section.
5. Video.
6. Feature accordion.
7. Integrations.
8. Additional customer proof.
9. Resources.
10. FAQ.
11. CTA.

### Style

Messaging screenshots can be layered as conversation cards, but should remain inside the same flat, white, product-realistic system.

---

## 8.10 Email

### Section order

1. Email hero and proof.
2. Three key benefits.
3. Product/video demonstration.
4. Testimonial.
5. Capability accordion.
6. Integration strip.
7. Resources and FAQ.
8. CTA.

### UI treatment

Email UI can show thread, classification, action, and generated reply states. Preserve realistic density without letting the whole web page become dashboard-heavy.

---

## 8.11 Industry solution template

Used by Ecommerce, Financial Services, Gaming, Health Insurance, P&C Insurance, SaaS, and Travel.

### Shared section order

1. Industry-specific hero.
2. Relevant customer logo marquee.
3. “Fine-tuned for [industry]” introduction.
4. Three alternating feature sections with paired screenshots.
5. Customer testimonial.
6. Playbooks callout.
7. Use-case card grid, often four cards.
8. Feature/capability accordion with related media.
9. Trust, recognition, or second testimonial.
10. Resources tailored to the industry.
11. FAQ.
12. Final CTA and repeated proof strip.

### Per-industry art direction

- **Ecommerce:** product, order, return, subscription, or retail context; warm commercial imagery.
- **Financial Services:** trust, accuracy, account support, compliance; quieter and more authoritative.
- **Gaming:** energetic but not neon-casino cliché; emphasize multi-market complexity and high-stakes workflows.
- **Health Insurance:** clarity, empathy, coverage/member support, privacy.
- **P&C Insurance:** claims, policy, emergency response, regulated decisions.
- **SaaS/Technology:** product support, account admin, troubleshooting, integration.
- **Travel:** disruption, rebooking, multilingual service, time sensitivity; atmospheric travel imagery fits especially well.

### Template rule

Keep the structure consistent so every industry feels part of one platform. Personalize through copy, proof, use cases, logos, and imagery—not a completely new design system.

---

## 8.12 Customer story index

### Structure

1. Hero title and short proof statement.
2. Industry filter pills.
3. Two-column customer-story listing.
4. Each item contains image, category, large title, outcome excerpt, and “Learn more”.
5. Thin horizontal dividers.
6. Footer.

### Visual behavior

- More editorial list than conventional SaaS card wall.
- Generous whitespace between rows.
- Imagery has strong presence but titles and quantified outcomes remain primary.
- Filtering should animate layout changes without chaotic reordering.

---

## 8.13 Customer story detail

### Structure

1. Industry label.
2. Customer logo/hero image.
3. Customer name as H1.
4. Three-column result metrics.
5. Editorial story headline.
6. Long-form narrative.
7. Section headings at logical story turns.
8. Pull quotes with portrait/name/role.
9. Full-width or inline photography/product visuals.
10. Numbered or bulleted process explanation where useful.
11. Ending quote or forward-looking statement.
12. Shared global footer.

### Visual treatment

- Reads like a premium magazine case study.
- Metric strip creates immediate business proof before the long story.
- Pull quotes break the reading rhythm every few screens.
- Text column remains narrow while imagery can break wider.
- Do not box every paragraph; let typography and whitespace carry the story.

---

## 8.14 Blog index

### Structure

1. Editorial hero: “The Blog” label plus large positioning headline.
2. Featured/latest article with large visual treatment.
3. Several recent editorial rows/cards.
4. Featured category links.
5. Promotional resource block.
6. More article cards with category, date, reading time, title, and excerpt.
7. Pagination.
8. Footer.

### Style

- Strong magazine rhythm.
- Not all cards use identical boxes.
- Dividers and whitespace create hierarchy.
- Categories behave like a content taxonomy, not colorful tags.

---

## 8.15 Blog article detail

### Structure

1. Date, category, and reading time.
2. Large editorial H1.
3. Author identity and role.
4. Hero image.
5. Narrow long-form reading column.
6. H2/H3 hierarchy.
7. Bullets and numbered lists where useful.
8. Inline links.
9. Table of contents, commonly sticky or placed near article content.
10. Footer and related content.

### Typographic rules

- H1 approximately 48–60px desktop.
- Lead/body approximately 18px with relaxed line height.
- H2 approximately 30–36px.
- Paragraph spacing approximately 20–28px.
- Avoid bold-heavy prose; emphasis should be selective.

---

## 8.16 Resource Library index

### Structure

1. “The Resource Library” label.
2. Large hero heading.
3. Featured resource.
4. Prominent search input.
5. Category filter chips.
6. Resource card grid/list.
7. Pagination.
8. Newsletter/final CTA.

### Interaction states

- Search query reflected in the URL when possible.
- Clear filters action.
- Result count.
- Empty state with suggested categories.
- Accessible keyboard filtering.

---

## 8.17 Resource detail

### Structure

1. Date and resource type.
2. Large title.
3. Cover image/thumbnail.
4. Primary download or “View PDF” CTA.
5. Introductory summary.
6. “Who this is for”.
7. “What’s inside”.
8. “Why this matters”.
9. Optional form gate or secondary CTA.
10. Related resources.

### Style

This is a conversion-oriented editorial page. The content should remain readable even when a form or download action is present.

---

## 8.18 Events

### Structure

1. Events hero with large image.
2. Featured upcoming event.
3. Event details and registration CTA.
4. On-demand events section.
5. Cards/list with type, date, title, and thumbnail.
6. Pagination or filtering if the library grows.
7. Footer.

### Motion

Keep event cards calm. A small image zoom and arrow shift are enough; avoid conference-style animated backgrounds.

---

## 8.19 Why Ada

### Structure

1. Manifesto-like hero.
2. Mission statement.
3. Long narrative blocks.
4. Four principles or commitments.
5. Founder/executive quote.
6. Three-column ACX strategic model.
7. Large closing statement about the enterprise standard.
8. Canadian identity/signature.
9. CTA.

### Style

- Largest editorial typography outside the homepage.
- Fewer card grids.
- Statements can occupy almost the full viewport.
- Copy and cadence are the primary visual material.

---

## 8.20 Careers

### Structure

1. Lowercase editorial hero: build an extraordinary career.
2. Short mission statement and Canadian/global line.
3. Open-roles CTA.
4. Image pair or collage.
5. Company mission and scale narrative.
6. Culture video with replay/resume states.
7. Six company values.
8. Human approach to work / remote-work narrative.
9. Benefits and perks.
10. Final recruitment statement.
11. Large employee photo wall.
12. Repeated open-roles CTA.

### Visual character

- Warmest and most human page family.
- Lowercase headings add an approachable editorial tone.
- Real employee photography is essential.
- The photo wall supplies energy without changing the underlying color/type system.

---

## 8.21 Media Center and Partner pages

These pages should inherit the global design system and use one of two patterns:

### Media Center

- Editorial hero.
- Latest announcements/press releases.
- Press kit / brand assets.
- Company facts.
- Media contact.
- Coverage cards.

### Become a Partner

- Partnership value proposition hero.
- Partner types and benefits.
- Proof logos or stories.
- Program steps.
- Application/contact CTA.

Keep both pages flat, structured, and conversion-focused. Do not create a visually separate microsite unless the live brand establishes one.

---

## 8.22 Ada Labs

### Difference from the main site

Ada Labs is a research publication/sub-brand. Its information density and subject matter are more technical, while the presentation remains minimal and editorial.

### Structure

1. Compact research-specific navigation.
2. Research mission/intro.
3. Principles such as production-scale research, CX-specific problems, and hiring.
4. “Inside the lab” research list.
5. Each research item includes taxonomy, title, and concise result/abstract.
6. “What we’re working on” future research cards.
7. Hiring CTA.

### Visual guidance

- Use tighter editorial rows than the marketing homepage.
- Preserve large whitespace and regular-weight typography.
- Research categories should be understated.
- Technical results and numerical improvements can be emphasized with large type.
- Avoid turning the page into a code-editor aesthetic.

---

# 9. Motion and interaction system

## 9.1 Motion philosophy

The motion should feel like **quiet confidence**:

- Slow enough to feel intentional.
- Fast enough that interaction never feels delayed.
- Mostly opacity, small translation, clipping, crossfades, and gentle image scale.
- No elastic bounces.
- No particles.
- No aggressive 3D perspective.
- No endless decorative motion besides purposeful marquees or active media.

## 9.2 Observed interaction patterns

- Repeating customer-logo strips imply continuous horizontal marquees.
- FAQ and feature areas expose plus/minus accordion controls.
- Product/industry areas use tabs or accordion-like content switching.
- Customer testimonials group several stories, implying carousel navigation.
- Video modules explicitly support Play, Replay, Resume, and unmute states.
- Voice includes audio/live-call interactions.
- Customer, integration, blog, and resource indexes use filters, categories, search, or pagination.
- Sticky global navigation and dropdown menus are part of the browsing model.

## 9.3 Recommended reconstruction tokens

> The following values are **reconstruction estimates** chosen to match the visible character.

```css
:root {
  --motion-instant: 100ms;
  --motion-fast: 180ms;
  --motion-base: 300ms;
  --motion-slow: 600ms;
  --motion-cinematic: 900ms;

  --ease-standard: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
}
```

## 9.4 Page entrance

### Hero

- Background image: opacity 0 → 1 and scale 1.03 → 1 over 900ms.
- Headline: clip reveal or opacity/y from 24px over 600–800ms.
- Supporting copy: 80–140ms after headline.
- Demo card: opacity/y from 32px, 140–220ms after copy.
- Avoid animating every word independently.

### Standard sections

- Trigger when approximately 15–25% of the section enters viewport.
- Opacity 0 → 1.
- Translate Y 16–24px → 0.
- Duration 500–650ms.
- Stagger cards by 60–100ms.
- Animate once by default.

## 9.5 Logo marquee

```css
.marquee-track {
  animation: ada-marquee 36s linear infinite;
}

@keyframes ada-marquee {
  to { transform: translateX(-50%); }
}
```

Guidance:

- Duplicate the exact content sequence.
- Use 28–48px inter-logo gaps on mobile and 56–96px desktop.
- Duration 30–45s depending on total width.
- Pause on hover only when logos are interactive.
- Under reduced motion, show a static wrapping row or manually scrollable strip.

## 9.6 Button microinteraction

- Background/color transition: 180ms.
- Arrow translate X by 3–5px.
- Circular arrow may rotate by 15–30° on hover, not a full spin.
- Active scale: `0.985` for 80–100ms.
- Keep text stable; do not change button width.

## 9.7 Image card hover

- Image scale `1` → `1.025–1.04` over 500–700ms.
- Gradient opacity can increase slightly.
- Arrow translates 3px.
- Container stays fixed to avoid layout jitter.

## 9.8 Accordion

- Plus rotates to minus/cross over 200–250ms.
- Content height expands over 300–400ms.
- Content opacity 0 → 1 with a slight 8px downward-to-neutral movement.
- Keep focus on the trigger.
- Do not animate to/from `height: auto` without a measured-height technique.

## 9.9 Tabs and dynamic media

- Selected control fill/border: 180–250ms.
- Text content: crossfade 200–300ms.
- Media: opacity 0 and x/y shift 10–16px → neutral over 350–450ms.
- Prevent the media container from collapsing during a switch.

## 9.10 Carousel

- Slide movement: 450–650ms.
- Use standard ease, not spring/bounce.
- Show previous/next circular controls.
- Support drag/swipe on touch.
- Announce slide changes to screen readers.
- Autoplay is not recommended for text-heavy testimonials.

## 9.11 Video and audio

- Poster-to-player fade: 250–350ms.
- Controls must remain discoverable.
- Never autoplay audible content.
- Provide captions/transcript for video and transcript for real-call examples.
- Show loading, buffering, permission denied, and playback error states.

## 9.12 Sticky navigation

- Sticky from page start or after announcement bar.
- On scroll down, nav may compress by 4–8px or hide only if reappearing immediately on reverse scroll.
- Use a subtle bottom border after leaving the hero.
- Avoid a heavy shadow.

## 9.13 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

For essential state transitions, replace motion with an immediate state change rather than hiding functionality.

---

# 10. Content design and voice

## Headline style

- Outcome-led.
- Declarative.
- Often conversational rather than keyword-stuffed.
- Uses “agentic customer experience” consistently as a category frame.
- Hero copy is short enough to function as visual design.

## Section introductions

- One major idea.
- Usually one short paragraph after the title.
- Avoid long feature lists directly beneath the heading.

## Proof language

- Quantified outcomes.
- Customer names and roles.
- Operational details.
- Industry-specific complexity.
- Trust, scale, resolution, cost-to-serve, multilingual, and performance themes.

## CTA language

- Speak to an expert.
- Learn more.
- Read story.
- View/open roles.
- Listen to a real call.
- Watch/replay/resume video.
- View/download resource.

CTAs are specific, calm, and action-oriented. Avoid hype such as “Revolutionize now” or “Unleash the future”.

---

# 11. Accessibility requirements

The visual system can be accessible, but the recreation must explicitly address the following:

## Typography and contrast

- Keep body copy at 16px where practical.
- Verify muted text against bone and paper.
- Do not rely on pale accent colors for small text.
- Preserve readable line lengths.

## Keyboard

- All dropdowns, accordions, tabs, carousels, filters, audio, video, and live demos must be keyboard operable.
- Focus-visible state must be obvious and not clipped by rounded containers.
- Escape closes menus/dialogs.

## Motion

- Honor `prefers-reduced-motion`.
- Avoid scroll-jacking.
- Avoid automatically advancing text carousels.
- Provide pause controls for continuously moving content when required.

## Media

- Captions for video.
- Transcript for audio and call demos.
- Clear play/pause/state labels.
- No autoplay audio.

## Images

- Descriptive alt text for editorial/customer imagery.
- Empty alt for purely atmospheric blurred backgrounds.
- Logos need accessible brand names when they convey proof.

## Dynamic filters and search

- Announce result counts.
- Preserve focus after filtering.
- Use real buttons for chips.
- Expose selected state with `aria-pressed` or the appropriate tab pattern.

## Forms

- Persistent labels, not placeholder-only fields.
- Clear error messaging.
- Error summary for long forms.
- Minimum 44×44px touch targets.

---

# 12. Implementation blueprint

## Suggested component tree

```text
AppShell
├── AnnouncementBar
├── Header
│   ├── Logo
│   ├── DesktopNav
│   ├── MegaMenu
│   ├── HeaderActions
│   └── MobileNavDrawer
├── Main
│   ├── AtmosphericHero
│   ├── EditorialHero
│   ├── LogoMarquee
│   ├── StatGrid
│   ├── SectionIntro
│   ├── AlternatingFeature
│   ├── MediaCardGrid
│   ├── ProductDemoPanel
│   ├── TestimonialCarousel
│   ├── TabsWithMedia
│   ├── FeatureAccordion
│   ├── IntegrationCatalog
│   ├── FilterBar
│   ├── EditorialCardList
│   ├── ArticleBody
│   ├── ResourceDownloadHero
│   ├── VideoPlayer
│   ├── AudioCallDemo
│   ├── TrustGrid
│   └── FinalCTA
├── SupportWidget
└── Footer
```

## Suggested content models

### Feature

```ts
type Feature = {
  eyebrow?: string;
  title: string;
  body: string;
  cta?: { label: string; href: string };
  media: Media;
  align?: "media-left" | "media-right";
};
```

### Testimonial

```ts
type Testimonial = {
  quote: string;
  author: string;
  role: string;
  company: string;
  portrait?: Image;
  metrics?: Array<{ value: string; label: string }>;
};
```

### Editorial card

```ts
type EditorialCard = {
  type: "article" | "resource" | "event" | "case-study";
  category?: string;
  date?: string;
  readTime?: string;
  title: string;
  excerpt?: string;
  image?: Image;
  href: string;
};
```

## Suggested CSS primitives

```css
.container {
  width: min(100% - 48px, 1200px);
  margin-inline: auto;
}

.section {
  padding-block: clamp(72px, 9vw, 120px);
}

.card {
  background: var(--ada-surface);
  border: 1px solid var(--ada-border);
  border-radius: 8px;
}

.pill {
  border-radius: 9999px;
}

.hairline {
  border-color: var(--ada-border);
}
```

## Performance guidance

- Serve modern AVIF/WebP imagery.
- Use responsive `srcset` for wide blurred heroes and editorial cards.
- Blur can be baked into the image rather than applying an expensive live CSS filter.
- Lazy-load below-the-fold media.
- Preload the hero image and primary font subset.
- Defer third-party chat and analytics until after critical interaction readiness where possible.
- Avoid multiple simultaneous scroll observers per component; centralize reveal logic.

---

# 13. Do and do not

## Do

- Use one regular-weight type family across the interface.
- Build hierarchy with large size jumps and space.
- Keep the canvas warm off-white.
- Put content on clean white surfaces.
- Use thin near-black borders instead of shadows.
- Use one accent at a time.
- Make hero photography atmospheric and blurred.
- Use real customer proof and quantified outcomes.
- Alternate editorial storytelling with product UI.
- Keep motion subtle and directional.
- Preserve long-form readability on case studies and articles.

## Do not

- Add neon AI gradients to every section.
- Use bold or extra-bold headings throughout.
- Add floating glass cards with large shadows.
- Turn cards into highly rounded 24–32px bubbles.
- Use icons as a substitute for meaningful imagery everywhere.
- Make accents the primary text color.
- Animate every word, card, and background simultaneously.
- Use generic robot illustrations.
- Make every page template completely different.
- Compress mobile spacing until the editorial character disappears.

---

# 14. Reconstruction checklist

## Global

- [ ] Warm `#F9F9F9` canvas is present.
- [ ] White surface tier is clearly distinguishable without shadow.
- [ ] Roobert or a close humanist-geometric fallback is used at weight 400.
- [ ] Content max width is approximately 1200px.
- [ ] Cards use 8px radius; inputs 4px; actions are pills.
- [ ] Hairline borders define regions.
- [ ] Header and footer information architecture match the page system.

## Hero

- [ ] Background is photographic and strongly blurred where atmospheric style is used.
- [ ] Headline is 48–72px depending on template.
- [ ] Copy is short and visually balanced.
- [ ] One dominant CTA or demo card is present.
- [ ] Hero motion is slow and restrained.

## Content sections

- [ ] Each section has one main idea.
- [ ] Major section spacing is at least 80px desktop.
- [ ] Product media is realistic rather than decorative.
- [ ] Proof appears through logos, metrics, testimonials, or stories.
- [ ] Accent colors are limited and purposeful.

## Interaction

- [ ] Hover states use color, border, arrow movement, or slight image zoom—not shadows.
- [ ] Accordions and tabs are keyboard accessible.
- [ ] Carousel is swipeable and screen-reader aware.
- [ ] Search/filter states include empty and loading views.
- [ ] Video/audio includes explicit controls and transcripts/captions.
- [ ] Reduced motion is supported.

## Responsive

- [ ] Four-column stats become 2×2 then 1-column.
- [ ] Three-card grids become 2 then 1.
- [ ] Alternating feature rows stack logically.
- [ ] Mobile navigation preserves the full hierarchy.
- [ ] Long headings scale with `clamp()`.
- [ ] Mobile spacing remains generous.

---

# 15. Source pages inspected

The following live areas were used to identify structure and recurring patterns:

- https://www.ada.cx/
- https://www.ada.cx/platform/
- https://www.ada.cx/playbooks/
- https://www.ada.cx/integrations/
- https://www.ada.cx/voice/
- https://www.ada.cx/messaging/
- https://www.ada.cx/email/
- https://www.ada.cx/industries/ecommerce/
- https://www.ada.cx/industries/financial-services/
- https://www.ada.cx/industries/gaming/
- https://www.ada.cx/industries/health-insurance/
- https://www.ada.cx/industries/property-casualty-insurance/
- https://www.ada.cx/industries/saas/
- https://www.ada.cx/industries/travel/
- https://www.ada.cx/case-studies/
- https://www.ada.cx/case-study/greenfeatheronline/
- https://www.ada.cx/blog/
- https://www.ada.cx/blog/your-ai-agent-should-speak-your-language/
- https://www.ada.cx/events/
- https://www.ada.cx/resources/
- https://www.ada.cx/resources/template/rfp-template-choosing-ai-technology-for-enterprise-customer-service/
- https://www.ada.cx/why-ada/
- https://www.ada.cx/careers/
- https://www.ada.cx/labs/

Additional design-token cross-check:

- https://styles.refero.design/style/f23e132d-3bfb-498d-a2e4-6d069b4dbc59

---

# 16. Final essence

To make a new site feel recognizably inspired by Ada without making it a literal clone:

1. Begin with a warm off-white editorial canvas.
2. Use one humanist sans-serif at regular weight.
3. Make headings dramatically larger than body copy.
4. Use flat white cards, thin borders, and restrained 8px corners.
5. Reserve forest, periwinkle, pink, and butter for small moments.
6. Create one cinematic blurred-photography hero.
7. Alternate human proof with authentic product UI.
8. Animate with fades, small translations, crossfades, and slow image movement.
9. Keep every page within the same small family of reusable templates.
10. Let space and credible content—not decorative effects—create the premium feeling.
