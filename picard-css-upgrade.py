#!/usr/bin/env python3
"""
Picard-level design elevation for HelioFlux website.
CSS-only changes — no text/content modifications.
"""
import re, shutil

SRC = 'index.html'
BACKUP = 'index-backup-pre-picard.html'

# Back up
shutil.copy2(SRC, BACKUP)
print(f"Backed up to {BACKUP}")

with open(SRC, 'r') as f:
    html = f.read()

# ──────────────────────────────────────────────────────────
# 1. SECTION PADDING — the #1 thing that makes sites feel expensive
# ──────────────────────────────────────────────────────────

# Generic section padding: 148px → 160px (already generous, bump slightly)
html = html.replace(
    '.section { padding: 148px 56px;',
    '.section { padding: 160px 56px;'
)

# Section-bg inner padding
html = html.replace(
    '.section-bg .section-inner { max-width: 1200px; margin: 0 auto; padding: 96px 56px; }',
    '.section-bg .section-inner { max-width: 1200px; margin: 0 auto; padding: 140px 56px; }'
)

# CTA section padding
html = html.replace(
    '.cta-section { padding: 160px 56px;',
    '.cta-section { padding: 180px 56px;'
)

# Quote section padding  
html = html.replace(
    'padding: 120px 56px; text-align: center; position: relative; overflow: hidden;\n      background: linear-gradient',
    'padding: 140px 56px; text-align: center; position: relative; overflow: hidden;\n      background: linear-gradient'
)

# ──────────────────────────────────────────────────────────
# 2. TYPOGRAPHY — lighter weights, better spacing
# ──────────────────────────────────────────────────────────

# h2: lighter weight, more letter-spacing
html = html.replace(
    "h2 { font-family: var(--serif); font-size: clamp(44px, 5.5vw, 72px); font-weight: 300; line-height: 1.1; margin-bottom: 28px; }",
    "h2 { font-family: var(--serif); font-size: clamp(44px, 5.5vw, 72px); font-weight: 300; line-height: 1.1; margin-bottom: 32px; letter-spacing: 0.01em; }"
)

# Body/lead text: bump line-height
html = html.replace(
    ".lead { font-size: 17px; color: rgba(255,255,255,.78); line-height: 1.85; font-weight: 300; }",
    ".lead { font-size: 18px; color: rgba(255,255,255,.82); line-height: 1.85; font-weight: 300; }"
)

# Eyebrow: more spacing, slightly smaller
html = html.replace(
    ".eyebrow { font-size: 14px; letter-spacing: .16em; text-transform: uppercase; color: var(--cyan); margin-bottom: 24px; }",
    ".eyebrow { font-size: 13px; letter-spacing: .2em; text-transform: uppercase; color: var(--cyan); margin-bottom: 28px; opacity: 0.8; }"
)

# Hero sub: slightly larger, more readable
html = html.replace(
    ".hero-sub { font-size: 18px; color: rgba(255,255,255,.75); line-height: 1.8; max-width: 500px; margin-bottom: 48px; font-weight: 300; opacity: 0; }",
    ".hero-sub { font-size: 19px; color: rgba(255,255,255,.78); line-height: 1.8; max-width: 520px; margin-bottom: 52px; font-weight: 300; opacity: 0; }"
)

# ──────────────────────────────────────────────────────────
# 3. BUTTONS — rounder, more generous padding (Picard style)
# ──────────────────────────────────────────────────────────

# Primary CTA button
html = html.replace(
    ".btn-cyan { padding: 14px 40px; background: var(--cyan); color: var(--bg); font-size: 14px; letter-spacing: .1em; text-transform: uppercase; text-decoration: none; font-weight: 500; transition: all .3s; display: inline-block; }",
    ".btn-cyan { padding: 16px 44px; background: var(--cyan); color: var(--bg); font-size: 13px; letter-spacing: .12em; text-transform: uppercase; text-decoration: none; font-weight: 600; transition: all .3s; display: inline-block; border-radius: 4px; }"
)

# Nav CTA
html = html.replace(
    ".nav-cta { padding: 12px 32px; background: var(--cyan); color: var(--bg); font-size: 13px; letter-spacing: .1em; text-transform: uppercase; text-decoration: none; font-weight: 600; transition: all .3s; }",
    ".nav-cta { padding: 12px 32px; background: var(--cyan); color: var(--bg); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; text-decoration: none; font-weight: 600; transition: all .3s; border-radius: 4px; }"
)

# ──────────────────────────────────────────────────────────
# 4. SECTION BACKGROUNDS — ensure cream sections work properly
# ──────────────────────────────────────────────────────────

# Find and enhance the section-theme style block
# Make sure cream sections have proper text colors
section_theme_pattern = r'<style id="section-theme">(.*?)</style>'
match = re.search(section_theme_pattern, html, re.DOTALL)
if match:
    old_theme = match.group(0)
    new_theme = '''<style id="section-theme">
    /* ─── SECTION THEME: Alternating light/dark backgrounds ─── */
    /* Cream/light sections */
    #problem { background: #f5f0eb !important; }
    #problem, #problem h2, #problem h3, #problem p, #problem .lead,
    #problem .crisis-callout-text, #problem .crisis-card-title,
    #problem .crisis-bullets li { color: #16263A !important; }
    #problem .eyebrow { color: #00A9D6 !important; opacity: 0.9 !important; }
    #problem .crisis-callout { border-color: rgba(0,169,214,.35) !important; background: rgba(0,169,214,.06) !important; }
    #problem .crisis-callout-pct { color: #00A9D6 !important; }
    #problem .crisis-card { background: rgba(255,255,255,.7) !important; }
    #problem .crisis-bullets li::before { background: rgba(0,169,214,.5) !important; }
    #problem .crisis-bullets li { color: #2d3e52 !important; }

    #two-systems { background: #F7F6F2 !important; }
    #two-systems, #two-systems h2, #two-systems h3, #two-systems p, #two-systems .lead,
    #two-systems .solution-name, #two-systems .solution-sub { color: #16263A !important; }
    #two-systems .eyebrow { color: #00A9D6 !important; opacity: 0.9 !important; }
    #two-systems .solution-col { background: rgba(255,255,255,.65) !important; }
    #two-systems .solution-features li { color: #2d3e52 !important; border-color: rgba(22,38,58,.1) !important; }
    #two-systems .solution-features li span { color: #00A9D6 !important; }
    #two-systems .solution-badge { color: #00A9D6 !important; }
    #two-systems .solution-status { color: #5a6b7d !important; }
    #two-systems .solution-status strong { color: #00A9D6 !important; }

    /* Dark cards inside light sections */
    .qs-card, .lum-card { background: #0f1c2e !important; color: #fff !important; }

    /* Carousel — MUST stay dark */
    .h-section { background: var(--bg) !important; }
    .h-track { background: transparent !important; }
    .h-panel { background: transparent !important; }
    .h-panel, .h-panel h3, .h-panel p, .h-panel .h-panel-pub { color: rgba(255,255,255,.88) !important; }
    .h-panel h3 { color: #fff !important; }
    .h-stat-num { color: var(--cyan) !important; }
    .h-stat-label { color: rgba(255,255,255,.65) !important; }

    /* Quote band */
    .quote-section { background: #0f1c2e !important; }

    /* Stats strip */
    .stats-strip { background: rgba(15,28,46,.95) !important; }
    .stat-num { color: var(--cyan) !important; }

    /* Problem → Two Systems transition: dark divider */
    .spectral-split { background: var(--bg) !important; }
    .ss-side { background: var(--bg) !important; }

    /* Detection threshold section stays dark-on-dark */
    .threshold-compare { color: rgba(255,255,255,.88) !important; }
    </style>'''
    html = html.replace(old_theme, new_theme)
    print("Replaced section-theme block")

# ──────────────────────────────────────────────────────────
# 5. HERO — more breathing room, refined spacing
# ──────────────────────────────────────────────────────────

# Hero padding
html = html.replace(
    "padding: 80px 56px;\n      overflow: hidden;",
    "padding: 100px 56px 120px;\n      overflow: hidden;"
)

# Hero headline: slightly more margin below
html = html.replace(
    ".hero h1 { font-family: var(--serif); font-size: clamp(56px, 7.8vw, 102px); font-weight: 520; line-height: 1.03; color: var(--white); margin-bottom: 32px; opacity: 0; letter-spacing: -0.012em; }",
    ".hero h1 { font-family: var(--serif); font-size: clamp(52px, 7.5vw, 96px); font-weight: 480; line-height: 1.05; color: var(--white); margin-bottom: 36px; opacity: 0; letter-spacing: -0.01em; }"
)

# ──────────────────────────────────────────────────────────
# 6. IMAGES — subtle border-radius
# ──────────────────────────────────────────────────────────

# Science images
html = html.replace(
    ".sci-img img { width: 100%; height: 440px; object-fit: cover; display: block; }",
    ".sci-img img { width: 100%; height: 440px; object-fit: cover; display: block; border-radius: 8px; }"
)

# Nirosha image frame
html = html.replace(
    ".nirosha-img-frame { position: relative; overflow: hidden; }",
    ".nirosha-img-frame { position: relative; overflow: hidden; border-radius: 8px; }"
)

# ──────────────────────────────────────────────────────────
# 7. PRESS — cleaner cards
# ──────────────────────────────────────────────────────────

# Press card padding increase
html = html.replace(
    ".press-card { background: var(--bg2); padding: 44px; color: var(--white); }",
    ".press-card { background: var(--bg2); padding: 52px; color: var(--white); }"
)

# ──────────────────────────────────────────────────────────
# 8. TEAM — more generous spacing
# ──────────────────────────────────────────────────────────

html = html.replace(
    ".team-card { display: grid; grid-template-columns: 76px 1fr; gap: 24px; padding: 40px; background: var(--bg2); align-items: start; transition: background .3s; }",
    ".team-card { display: grid; grid-template-columns: 76px 1fr; gap: 28px; padding: 48px; background: var(--bg2); align-items: start; transition: background .3s; }"
)

# ──────────────────────────────────────────────────────────
# 9. FOOTER — more refined
# ──────────────────────────────────────────────────────────

html = html.replace(
    "footer { background: var(--bg2); border-top: 1px solid var(--border); padding: 60px 56px;",
    "footer { background: var(--bg2); border-top: 1px solid var(--border); padding: 72px 56px;"
)

# ──────────────────────────────────────────────────────────
# 10. NAV — slightly more refined
# ──────────────────────────────────────────────────────────

html = html.replace(
    "nav.scrolled { background: rgba(10,14,26,0.9); backdrop-filter: blur(24px); padding: 18px 56px; border-bottom-color: var(--border); }",
    "nav.scrolled { background: rgba(10,14,26,0.92); backdrop-filter: blur(28px); padding: 18px 56px; border-bottom-color: var(--border); }"
)

# ──────────────────────────────────────────────────────────
# 11. REVEAL ANIMATION — more subtle (Picard-style)
# ──────────────────────────────────────────────────────────

html = html.replace(
    ".js-ready .reveal { opacity: 0; transform: translateY(28px); }",
    ".js-ready .reveal { opacity: 0; transform: translateY(20px); }"
)

# ──────────────────────────────────────────────────────────
# 12. MOBILE RESPONSIVE — ensure padding stays generous
# ──────────────────────────────────────────────────────────

# Find existing mobile section padding override and make it more generous
# Look for the mobile media query section padding
html = html.replace(
    ".section { padding: 80px 24px; }",
    ".section { padding: 72px 24px; }"
)

# ──────────────────────────────────────────────────────────
# 13. BODY BASE — refined defaults
# ──────────────────────────────────────────────────────────

# Default body line height
html = html.replace(
    "font-family: var(--sans);\n      -webkit-font-smoothing: antialiased;",
    "font-family: var(--sans);\n      line-height: 1.7;\n      -webkit-font-smoothing: antialiased;"
)

# ──────────────────────────────────────────────────────────
# 14. PEPPERCORN/BRIDGE — more breathing room
# ──────────────────────────────────────────────────────────

html = html.replace(
    ".peppercorn { padding: 0 56px 120px;",
    ".peppercorn { padding: 0 56px 140px;"
)

# ──────────────────────────────────────────────────────────
# 15. SOLUTION GRID — more internal padding
# ──────────────────────────────────────────────────────────

html = html.replace(
    ".solution-col { background: var(--bg2); padding: 56px 48px; }",
    ".solution-col { background: var(--bg2); padding: 64px 52px; }"
)

# ──────────────────────────────────────────────────────────
# 16. CRISIS CARDS — more padding
# ──────────────────────────────────────────────────────────

html = html.replace(
    ".crisis-card { background: var(--bg2); padding: 40px 44px; }",
    ".crisis-card { background: var(--bg2); padding: 48px 48px; }"
)

# ──────────────────────────────────────────────────────────
# 17. STEP BLOCKS — more generous
# ──────────────────────────────────────────────────────────

html = html.replace(
    ".step-block { padding: 44px 32px;",
    ".step-block { padding: 52px 36px;"
)

# Write output
with open(SRC, 'w') as f:
    f.write(html)

print("✅ Picard-level design elevation applied!")
print("Changes: spacing, typography, buttons, section backgrounds, reveal animation, image radius")
