# CLAUDE.md — HelioFlux Website

## FIRST: Always invoke the frontend-design skill before writing any frontend code.
Read `skills/frontend-design/SKILL.md` or `~/.openclaw/workspace/skills/frontend-design/SKILL.md` before touching CSS or HTML.

## Brand Assets
All brand assets are in `brand_assets/`. Read `brand_assets/brand-guide.md` before making any visual decisions.

## THE GOAL
Make this site look like it cost $15-20K from a design agency. The benchmark is https://www.martinpicard.energy — study its principles, don't copy it literally.

## WHAT MAKES MARTINPICARD.ENERGY LOOK EXPENSIVE

### 1. MASSIVE WHITESPACE
- Sections have enormous padding: 120-180px vertical padding on desktop
- Content is narrow (max-width ~720px for text, ~960px for wider elements)
- Nothing feels cramped. Everything breathes.
- On mobile: still generous (60-80px vertical padding minimum)

### 2. TYPOGRAPHY IS EVERYTHING
- Very large, confident headings (48-72px on desktop)
- Body text is generous size (18-20px) with relaxed line-height (1.7-1.8)
- Letter-spacing is slightly loose on headings
- Font weight variation creates hierarchy (light headings, regular body)
- **Our fonts: Plus Jakarta Sans (headings), DM Sans (body)** — DO NOT CHANGE

### 3. COLOR DISCIPLINE
- Primarily TWO tones: warm cream background + dark text
- Accent color used SPARINGLY (we use cyan #00A9D6)
- No gradients. No busy backgrounds. No noise.
- Dark sections (hero, CTA) use deep navy #0f1c2e or #16263A
- Light sections use warm cream #f5f0eb or #F7F6F2
- Text on light: #16263A (dark navy, NOT black)
- Text on dark: rgba(255,255,255,0.88) (soft white, NOT pure white)

### 4. SECTION RHYTHM
Dark hero → Light cream section → Dark quote band → Light cream section → Dark platform/carousel → Dark team → Dark press → Dark CTA → Dark footer

### 5. SUBTLE ANIMATIONS ONLY
- Fade-in on scroll (opacity 0→1, translateY 20px→0)
- No bouncing, no sliding, no attention-grabbing motion
- Elements appear gently as you scroll

### 6. IMAGES
- Full-bleed or generous sizing
- Subtle border-radius (8-12px)
- No borders, no shadows, no frames

### 7. BUTTONS & LINKS
- Primary CTA: filled, rounded (border-radius 50px), generous padding (16px 40px)
- Ghost/secondary: border only, same rounding
- Hover: subtle opacity or background shift, no dramatic transforms

### 8. NAVIGATION
- Clean, minimal, fixed top
- Logo left, links right
- Semi-transparent background that gets more opaque on scroll
- CTA button in nav (our "Request Deck")

## CRITICAL RULES

1. **DO NOT change ANY text content, copy, headlines, or section order**
2. **DO NOT add new JavaScript libraries**
3. **DO NOT remove existing GSAP/ScrollTrigger functionality**
4. **DO NOT change the HTML structure or section IDs**
5. **MOBILE FIRST** — Kelly reviews on mobile. Test everything at 390px width.
6. **NO em dashes anywhere in copy** — biggest AI tell
7. **Test locally before committing**
8. **Only push to GitHub when explicitly asked** — when Kelly says "push" (or equivalent), you have advance authorization to push directly to `main` without further confirmation. This is a single-developer site repo with auto-deploy from main; that is the standing workflow.

## SECTION BACKGROUNDS (reference)
- `#problem` section: background `#f5f0eb`, text `#16263A`
- `#two-systems` section: background `#F7F6F2`, text `#16263A`
- Quote/bridge bands: background `#0f1c2e` or `#2F4562`, text white
- Carousel (`.h-section`): STAYS DARK — cards need white/cyan text
- Team, press, CTA, footer: STAY DARK

## FILE STRUCTURE
- `index.html` — single-file site with inline CSS and JS
- `brand_assets/` — logo, brand guide, color palette
- `logo-concepts/` — logo SVG explorations (not yet used in site)
- Multiple `<style>` blocks in index.html — look for `<style id="section-theme">` for background control

## WHEN DONE
Signal completion: `openclaw system event --text 'Claude Code: [brief summary of what changed]' --mode now`
