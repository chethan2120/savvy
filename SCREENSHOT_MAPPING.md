# Screenshot Mapping

How the two evidence directories informed the rebuild.

## `content_screenshots/` (55 images) — WWNDT source of truth
Screenshots of the current https://wwndtis.in/ site. Used to preserve real business content, not visual style.

| Captured content | Extracted into |
|---|---|
| Header: HOME · ABOUT US · COURSE · ADMISSION · BLOG · GALLERY · CONTACT US + social icons | `SiteHeader.tsx` nav model (labels kept; presentation restyled) |
| Hero "Join NDT Level II & QA/QC Courses", Apply Now / Learn Now | `EditorialHero.tsx` headline + CTA intent |
| Course list: NDT Level II, QA/QC, Fire & Safety, HVAC, Revit MEP, CSWIP 3.1 — durations, fees, certifications, eligibility | `src/lib/data.ts` `coursesData` |
| Course detail modules, FAQs, placement claims | `coursesData[].modules / faqs`, course detail page |
| Instructors (Feroz Alam, Tabrej Alam, Md Javed, Deepak Kumar) + roles/bios | `instructorsData` |
| Testimonials (Shadab, Vikash, Rohit, Sanjay) + Hindi placement quote | `testimonialsData`, home placement section |
| Stats (student count, awards, instructors) — **conflicting across pages** | Reconciled in `CONTENT_ISSUES.md`; `MetricStrip.tsx` |
| Contact: phone(s), emails, Noida address, WhatsApp, social URLs | `defaultSettings` in `data.ts`, `SiteFooter`, `contact-us` |
| Blog posts (NDT methods, RT guide, Level II certification guide) | `blogPostsData` |
| Announcement / batch messaging | `defaultBanner`, `AnnouncementBar.tsx` |
| Typos ("Instructers", "achived", "Sucessfull") and keyword-stuffing | Corrected — logged in `CONTENT_ISSUES.md` |

## `design_screenshots/` (63 images) — Ada.cx direction
Screenshots of https://www.ada.cx/. Used to derive visual language only — never brand, copy, or proprietary illustration.

| Observed pattern | Applied as |
|---|---|
| Dark full-width announcement bar with inline CTA | `AnnouncementBar.tsx` |
| Floating white **pill navigation** with rounded container, dropdown, arrow-pill CTA | `SiteHeader.tsx` |
| Giant regular/light-weight display headline, generous whitespace | `--display` type scale, `EditorialHero` |
| Blurred atmospheric hero backdrop | CSS radial pastel blobs (original reinterpretation) |
| Periwinkle / pink / yellow pastel accent pills on off-white | `--periwinkle/--pink/--yellow` tokens, `accent-tag-*` |
| Fine hairline borders, minimal shadow, paper-white cards over off-white | `.editorial-card`, `.hairline-divider`, surface tokens |
| Rounded arrow buttons, hover arrow nudge | `.pill-button-*`, hero CTA `group-hover:translate-x` |
| Calm section reveals on scroll | Framer Motion `whileInView` reveals |
| Editorial asymmetric split layouts (text ↔ image) | Hero, placement, FAQ, final-CTA sections |

## Responsive comparison
Where content/design screenshots showed desktop vs. narrower states, layouts were built mobile-first and verified at the pane's tablet width (nav collapses to an accessible hamburger overlay below the desktop breakpoint). A full multi-width sweep (320 → 1920) is listed as outstanding in `IMPLEMENTATION_PLAN.md`.
