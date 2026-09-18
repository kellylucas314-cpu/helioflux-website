---
name: helioflux-web
description: HelioFlux investor website context, current site facts, and design guidelines. Load automatically when working on the HelioFlux website, index.html, science.html, team.html, press.html, or any HelioFlux web files.
---

# HelioFlux Website — Permanent Context

Repo: `helioflux-website`. Deploys to **helioflux.co** (CNAME in repo root, auto-deploy from `main`).
Last verified against the live site: 2026-07-26.

## Company

**HelioFlux** is a pre-clinical biophotonics company building ultra-early cancer detection. Cells emit ultra-weak photon emissions (UPEs); cancer cells emit a measurably different spectral pattern. **QSense™** (hardware, single-photon sensitivity) captures the signal, **LuminAI™** (software) classifies it against a validated cancer signature database.

- **Stage**: Pre-clinical. Validated in vitro, in vivo, and in living human subjects (brain). Raising a **pre-pilot round** for the first IRB-approved human study.
- **Near-term milestone**: First human study targeting **Q4 2026** with a Beverly Hills dermatology partner.
- **Contact / CTA target**: kelly.lucas@helioflux.co. Location: Manhattan Beach, CA.
- **Affiliation**: NVIDIA Inception Program member.

### People (current titles, verified in `team.html` and `index.html`)

| Person | Title |
|---|---|
| Dr. Nirosha J. Murugan | **Interim CEO**, Chief Scientist & Co-Founder |
| Kelly Lucas | President & Co-Founder |
| Jim Armstrong | **Interim CFO** |
| Glenn Lucas | **Interim CMO** |
| Dr. Michael Levin | Scientific Advisor |
| Dr. David Kaplan | Scientific Advisor |
| Justin Horn | Business Advisor |

Titles have changed more than once. **Always grep the HTML before quoting a title.** Notably: Nirosha is Interim CEO (not "just" Chief Scientist), the C-suite roles are all "Interim", and **Dr. Nicolas Rouleau is no longer on the site** (replaced by Justin Horn as Business Advisor).

## Primary Audience

Sophisticated investors: VCs, angels, family offices. Smart, skeptical, pattern-matching. The site must pass the "would I take a meeting" test within 10 seconds.

Kelly reviews on **mobile**. Test everything at 390px width before saying it's done.

## Site Structure

Four investor-facing pages, all linked from the nav:

- `index.html` (2,370 lines, single file, inline CSS + JS) — the main page, the one usually being edited
- `science.html` — mechanism, detection thresholds, published validation
- `team.html` — full bios, awards, advisory board
- `press.html` — coverage (Scientific American, NPR Radiolab, Cell Press, CBC News, LA Business Journal)

**Not linked from the nav, do not treat as live pages:**

- `brain.html` — "Kelly's Second Brain", an internal library page
- `data-story.html`, `data-story-v2/v3/v4.html` — interactive data-story explorations of the 2020 Cancers paper, unlinked experiments
- `study-2020.html` — long-form study explainer, unlinked
- `_archive/` — old one-off Python transform scripts and task notes

**There are no `index-v*.html` backup files and no backup convention in use.** Git is the history. Do not create dated backup copies; commit instead.

Support docs in the repo, both worth reading but both **now stale**, so verify against the HTML: `CONTENT-MAP.md` (dated March 3, 2026), `WEBSITE-AUDIT.md`, `FINAL-ACTION-REPORT.md`.

## index.html Section Order and IDs

Do not change section order or IDs.

1. `<nav id="nav">` + `.mobile-menu` (fixed, logo left, links right, "Request Deck" CTA, hamburger under 768px)
2. `.hero` — dark, starfield video loop + `#hero-canvas`, "Your cells emit light. We learned to read it."
3. `#problem` — cream `#F7F6F2`, survival gap stats + the scroll-driven cancer progression
4. `.bridge-band` — dark `#092743`, full-bleed microscopy video, "But there's a signal before there's a tumor."
5. `#solution` — cream `#F7F6F2`, inside `.cream-band` wrapper
6. `#two-systems` — cream `#F7F6F2`, QSense + LuminAI
7. `#platform` — dark `#092743`, horizontal carousel (`.h-section` / `#hTrack`), 2 panels: Skin Cancer Detection, Brain Health
8. `#credibility` — cream `#f5f0eb`, Nirosha anchor + team strip + press logos
9. `.cta-section#contact` — dark `#092743`
10. `<footer>` — dark

Five `<style>` blocks in `index.html`. Background/theme control lives in `<style id="section-theme">` (~line 1327). Others: main block (line 25), `#transition-gradients`, `#problem-progression`, `#press-logos-style`.

## Design Language

Read `brand_assets/brand-guide.md` before any visual decision. Summary:

**Colors** (these are the real hexes; the accent is NOT `#00C8F0`):

| Name | Hex | Use |
|---|---|---|
| Navy primary | `#0f1c2e` | Hero, CTA, footer |
| Navy deep | `#092743` | Bridge band, platform, CTA sections |
| Navy secondary | `#16263A` | Text on light backgrounds |
| Warm cream | `#f5f0eb` | `#credibility` |
| Off-white | `#F7F6F2` | `#problem`, `#solution`, `#two-systems` |
| Cyan accent | `#00A9D6` | Accent ONLY, sparingly |
| Cyan glow | `#00c9c8` | Logo teal, emission effects |
| Soft white | `rgba(255,255,255,.88)` | Text on dark |
| Muted white | `rgba(255,255,255,.55)` | Secondary text on dark |
| Body on cream | `#3A5068` | Paragraph text in light sections |

**Fonts** — CSS variables `--serif` and `--sans`. **`--serif` is a misnomer: it is Plus Jakarta Sans, not a serif.** `--sans` is DM Sans. Preserve both variable names, never swap in an actual serif (Glenn hates serifs).

- Headings: Plus Jakarta Sans, weight 300-400, light and confident, never bold
- Body: DM Sans, 18-20px, line-height 1.7-1.8
- Eyebrows: uppercase, letter-spacing .15em, 11-13px, muted

**Layout**: The design reference is **martinpicard.energy** (spacing, whitespace, type hierarchy), plus linear.app and stripe.com. Section padding 120-180px vertical on desktop, 60-80px minimum on mobile. Text max-width ~720px, wider elements ~960-1200px. Buttons `border-radius:50px`, padding `16px 40px`. Images get 8-12px radius, no borders, no frames.

**Note the site is a HYBRID light/dark rhythm, not all-dark.** The older "cinematic dark throughout" framing is out of date. Cream content sections carry most of the reading; dark bands punctuate. The `#platform` carousel, team strip, press, CTA, and footer stay dark because their text is white/cyan.

**Tone**: "The Ambitious Realist". Mechanism over metaphor, conservative precision, warm but not soft. Urgent but measured. Avoid clinical coldness, startup clichés ("disruptive", "revolutionary"), template energy.

**Never**: em dashes, gradients (except the existing spectrum bar and vignettes), heavy drop shadows, orange, serif type, bouncy animation, pure black `#000`, pure white `#fff` for text on dark.

## JavaScript Stack

Three CDN libraries, already loaded. **Do not add more, do not remove these:**

- GSAP 3.12.5 + ScrollTrigger
- Lenis 1.0.42 (smooth scroll, wired into the GSAP ticker)

Two scripts are deliberately **isolated** so they survive if the animation libs fail to load. Do not merge them into the main script block:

1. **Hamburger menu** (~line 1461), runs independently of GSAP/Lenis
2. **Progression scroll** (~line 2218)

### The progression scroll (the fragile part)

`#probProgression` in the `#problem` section scrubs a **234-frame WebP sequence** (`assets/progression-video/f-001.webp` … `f-234.webp`) onto `#probProgCanvas` while ScrollTrigger pins the block, cross-fading seven HTML captions from single cell to Stage I.

This has been reworked repeatedly (canvas → video element → back to canvas). Before touching it, read the inline comments: `PHASE_BOUNDS`, `ANIM_END`, and the frame-to-caption landmark map were all derived empirically by inspecting actual frames, not by math. Changing one number desynchronizes captions from the visuals. `FRAME_VER` is a cache-bust suffix.

ScrollTrigger handles pinning via transform because `<html>` has `overflow-x:hidden`, which breaks `position:sticky`.

## Scientific Accuracy Rules (CRITICAL)

- **92%** accuracy is **in vitro** (30 samples, 6 cell lines, 2018, Biochemistry & Biophysics Reports)
- **90%** accuracy is **in vivo** (47 living mice, 13 cancer types, 2020, Cancers/MDPI)
- **100%** figure is the 2018 in-vitro cancer detection rate. Never state it without the in-vitro qualifier.
- **iScience / Cell Press 2025** is the human brain (photoencephalography vs EEG) study, not cancer
- Detection threshold: **5-10 million cells** (~2-3mm), vs ~50-100M for liquid biopsy and 1B+ for standard imaging
- Never present in-vitro or animal data as clinical validation. Pre-clinical is the honest framing.
- The site carries a disclaimer: "HelioFlux is in research validation. Not FDA cleared. Not intended to diagnose or treat any disease." Keep it.

## Locked Copy (never change)

- "Your cells emit light. We learned to read it."
- "No blood draw. No biopsy. No radiation."
- "Cancer is caught too late."
- "But there's a signal before there's a tumor."
- "The science works. The next step is human data."
- "She built this science. HelioFlux is how it reaches the world."

More broadly: **do not change text content, copy, headlines, or section order** unless explicitly asked.

## Working Rules

1. Read `skills/frontend-design/SKILL.md` before writing frontend code
2. Read `brand_assets/brand-guide.md` before visual decisions
3. Mobile first, test at 390px
4. Test locally before committing
5. Only push when Kelly asks. When she says "push", direct-to-`main` is pre-authorized (single-developer repo, auto-deploy from main)
6. On completion signal: `openclaw system event --text 'Claude Code: [brief summary]' --mode now`
