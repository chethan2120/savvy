# Asset Inventory

Tracks every visual asset used in the rebuild, its purpose, source, and ownership status.

## 1. Brand & identity
| Asset | Path / Location | Source | Notes |
|---|---|---|---|
| Savvy Training Institute logo | `public/brand/logo.svg` and `SavvyLogo` | Site header, footer, and certificates | The old globe mark has been removed. |

## 1b. Real accreditation / recognition marks ✅ migrated
Genuine approval logos carried over from the source site — used in `AccreditationStrip.tsx` on the homepage.

| Mark | Path |
|---|---|
| ASNT, TWI (CSWIP), QCI, NABL, ISO, MSME, Skill India | `public/accreditations/{asnt,twi,qci,nabl,iso,msme,skill-india}.png` |

## 1c. Real photography ✅ migrated
| Asset | Path | Used in |
|---|---|---|
| Industrial inspection hero | `public/images/hero-factory.jpg` | `EditorialHero` |
| Field engineer | `public/images/engineer.jpg` | QA/QC course card, placement section |
| HVAC servicing | `public/images/hvac.jpg` | HVAC course card |
| NDT training banner | `public/images/ndt-training.webp` | NDT Level II course card |
| Director Feroz Alam | `public/instructors/feroz-alam.jpg` | Instructor card |

## 2. Photography (currently placeholders) 🟡
All photographic imagery is sourced from **Unsplash** (free licence, `images.unsplash.com`) as a stand-in for real SAV lab/classroom/site photos. These are **not** owned SAV assets.

| Usage | Where | Current source |
|---|---|---|
| Hero, NDT course, several blog/gallery tiles | `EditorialHero.tsx`, `data.ts` | `photo-1581092160607-ee22621dd758` (inspection lab) |
| Piping / weld / HVAC / placement | `data.ts` | `photo-1621905251189-08b45d6a269e` |
| Fire & Safety | `data.ts` | `photo-1509062522246-3755977927d7` |
| Revit / BIM | `data.ts` | `photo-1503387762-592deb58ef4e` |
| Instructor portraits | `data.ts` | Unsplash portrait IDs (placeholder faces) |

**Known limitation:** a few Unsplash IDs repeat across cards, so some course/gallery images look similar. This is intentional (only verified-loading IDs were used to avoid broken images) and should be resolved during real-asset migration.

## 3. Migration required ⛔
To satisfy the brief's "use existing SAV images / migrate owned assets to `public/`" requirement:
1. Obtain the institute's real photo library (lab sessions, equipment, site visits, graduation, instructor headshots) and the official logo.
2. Place optimised WebP/AVIF versions under `public/images/…`.
3. Swap the Unsplash URLs in `src/lib/data.ts` and `EditorialHero.tsx` for local paths.
4. **Instructor photos especially** should be replaced with real headshots — placeholder faces must not represent real named people (Feroz Alam, Tabrej Alam, Md Javed, Deepak Kumar) in production.

## 4. New original graphics
| Asset | Status | Notes |
|---|---|---|
| **Ultrasonic A-scan waveform** motif | ✅ `src/components/TechnicalGraphic.tsx` | Original inline SVG: inspection grid + animated line-draw waveform + pulsing flaw echo. Decorative (`aria-hidden`); animation disabled under `prefers-reduced-motion`. Used as the "UT A-Scan" readout accent on the hero image. |
| Blurred pastel hero backdrop | ✅ In `EditorialHero.tsx` | CSS-only radial colour blobs (periwinkle/yellow/pink) — original, lightweight, decorative. |

## 5. Licensing summary
- Unsplash images: free to use under the Unsplash licence, but they depict unrelated people/scenes — replace before public launch.
- No proprietary Ada assets, logos, or illustrations were copied. Only Ada's visual *principles* (layout, type, restraint, pill nav) were reinterpreted.
