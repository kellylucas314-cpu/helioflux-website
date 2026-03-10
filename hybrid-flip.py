#!/usr/bin/env python3
"""
Hybrid: Keep dark hero exactly as-is. Flip everything below to cream-first.
Dark navy accent breaks for: quote, spectral, carousel, press, team, creds, CTA, footer.
Cream for: problem, peppercorn, two-systems, science/nirosha sections.
"""
import re, shutil

SRC = 'index.html'
shutil.copy2(SRC, 'index-backup-pre-hybrid.html')

with open(SRC, 'r') as f:
    html = f.read()

# ──────────────────────────────────────────────────────────
# 1. DO NOT TOUCH: hero, nav, stats — they stay dark as-is
# ──────────────────────────────────────────────────────────

# ──────────────────────────────────────────────────────────
# 2. Replace section-theme with hybrid cream+dark approach
# ──────────────────────────────────────────────────────────

section_theme_pattern = r'<style id="section-theme">.*?</style>'
match = re.search(section_theme_pattern, html, re.DOTALL)
if match:
    old_theme = match.group(0)
    new_theme = '''<style id="section-theme">
    /* ─── HYBRID: Dark hero, cream body, dark accent breaks ─── */

    /* === CREAM CONTENT SECTIONS === */
    #problem {
      background: #f5f0eb;
      color: #16263A;
    }
    #problem h2, #problem h3, #problem .lead { color: #16263A; }
    #problem .eyebrow { color: #00A9D6; opacity: 0.9; }
    #problem .crisis-callout { border-color: rgba(0,169,214,.3); background: rgba(0,169,214,.05); }
    #problem .crisis-callout-pct { color: #00A9D6; }
    #problem .crisis-callout-text { color: #16263A; }
    #problem .crisis-card { background: rgba(255,255,255,.6); }
    #problem .crisis-card-title { color: #16263A; }
    #problem .crisis-bullets li { color: #4a5b6e; }
    #problem .crisis-bullets li::before { background: rgba(0,169,214,.5); }

    /* Peppercorn — cream */
    .peppercorn {
      background: #f5f0eb;
      color: #16263A;
    }
    .peppercorn h3 { color: #16263A; }
    .peppercorn p { color: #4a5b6e; }
    .peppercorn strong { color: #16263A; }
    .peppercorn-tag { color: rgba(0,169,214,.7); }
    .peppercorn-inner { border-left-color: rgba(0,169,214,.3); }

    /* Two Systems — cream */
    #two-systems {
      background: #F7F6F2;
      color: #16263A;
    }
    #two-systems h2, #two-systems h3, #two-systems .lead { color: #16263A; }
    #two-systems .eyebrow { color: #00A9D6; opacity: 0.9; }
    #two-systems .solution-col { background: rgba(255,255,255,.55); }
    #two-systems .solution-name { color: #16263A; }
    #two-systems .solution-sub { color: #4a5b6e; }
    #two-systems .solution-features li { color: #4a5b6e; border-color: rgba(22,38,58,.08); }
    #two-systems .solution-features li span { color: #00A9D6; }
    #two-systems .solution-badge { color: #00A9D6; }
    #two-systems .solution-status { color: #6a7b8e; }
    #two-systems .solution-status strong { color: #00A9D6; }
    #two-systems .solution-grid { background: rgba(22,38,58,.06); }

    /* Science/Nirosha section — cream */
    .science-2col { color: #16263A; }
    .nirosha-wrap { color: #16263A; }
    .nirosha-wrap .ncred { background: rgba(22,38,58,.04); }
    .nirosha-wrap .ncred-label { color: #4a5b6e; }
    .nirosha-wrap .ncred-value { color: #16263A; }
    .nirosha-wrap .ncred-value strong { color: #00A9D6; }
    .cancer-type-tag { background: rgba(0,169,214,.06); border-color: rgba(0,169,214,.15); color: #4a5b6e; }

    /* Step blocks on cream */
    .step-block { background: rgba(255,255,255,.5); border-color: rgba(22,38,58,.06); }
    .step-block h3 { color: #16263A; }
    .step-block p { color: #4a5b6e; }

    /* Threshold on cream */
    .threshold-label { color: #4a5b6e; }
    .threshold-num.dim { color: rgba(22,38,58,.3); text-decoration-color: rgba(22,38,58,.08); }
    .threshold-unit { color: #4a5b6e; }
    .threshold-sub { color: #4a5b6e; }
    .threshold-divider { background: rgba(22,38,58,.1); }

    /* === DARK ACCENT BREAKS (navy, like Picard's green) === */

    /* Quote band */
    .quote-section { background: #0f1c2e !important; }

    /* Spectral split */
    .spectral-split { background: #0f1c2e; color: #fff; }
    .ss-side { background: #0f1c2e; }
    .ss-spectrum-row { background: rgba(255,255,255,0.04); }

    /* Carousel */
    .h-section { background: #0f1c2e; }
    .h-section-label { color: #fff; }
    .h-section-label h2 { color: #fff; }
    .h-panel h3 { color: #fff; }
    .h-panel p { color: rgba(255,255,255,.78); }
    .h-stat-num { color: var(--cyan); }
    .h-stat-label { color: rgba(255,255,255,.65); }

    /* Press */
    .press-logos { background: #0f1c2e; }

    /* Team */
    .team-grid { background: rgba(255,255,255,0.04); }

    /* Creds */
    .creds-strip { background: #0f1c2e; }

    /* CTA */
    .cta-section { background: #0f1c2e; }
    .cta-section h2 { color: #fff; }
    .cta-section .lead { color: rgba(255,255,255,.78); }

    /* QSense/LuminAI cards stay dark */
    .qs-card, .lum-card { background: #0f1c2e; color: #fff; }
    </style>'''
    html = html.replace(old_theme, new_theme)
    print("Applied hybrid section-theme")

# ──────────────────────────────────────────────────────────
# 3. Sections between hero and footer need cream background
#    Add a wrapper-level background for the content area
# ──────────────────────────────────────────────────────────

# The sections that should be cream need explicit backgrounds since body is dark.
# Rather than changing body background (which would affect hero), let's add
# background to the specific wrapper sections.

# Find the problem section and ensure it has full-width cream
# The .section class has max-width:1200px, so we need the parent to be cream.
# Let's add background to the sections that wrap them.

# Actually the simplest approach: just give each cream section a full-bleed background
# via a small additional style block

additional_css = '''<style id="cream-sections">
    /* Full-bleed cream backgrounds for content sections */
    /* These sections sit between dark hero/stats and dark accent breaks */
    
    /* Problem area (includes crisis cards) — full width cream */
    #problem { margin: 0; max-width: 100%; padding-left: 56px; padding-right: 56px; }
    #problem > * { max-width: 1200px; margin-left: auto; margin-right: auto; }
    
    /* Peppercorn — full width cream */
    .peppercorn { background: #f5f0eb; max-width: 100%; padding-left: 56px; padding-right: 56px; }
    .peppercorn > * { max-width: 1200px; margin-left: auto; margin-right: auto; }

    /* Science section between spectral and carousel */
    .science-section-wrap { background: #f5f0eb; }

    /* Nirosha section */
    .nirosha-section-wrap { background: #F7F6F2; }

    /* Nav always has dark tint so white logo works on cream */
    nav { background: rgba(10,14,26,0.5); backdrop-filter: blur(10px); }
    nav.scrolled { background: rgba(10,14,26,0.97); backdrop-filter: blur(28px); }

    @media (max-width: 768px) {
      #problem { padding-left: 24px; padding-right: 24px; }
      .peppercorn { padding-left: 24px; padding-right: 24px; }
    }
    </style>'''

# Insert before closing </head>
html = html.replace('</style>\n  </head>', f'</style>\n  {additional_css}\n  </head>', 1)

with open(SRC, 'w') as f:
    f.write(html)

print("✅ Hybrid flip complete!")
print("LOCKED: Hero + nav (untouched)")
print("Cream: problem, peppercorn, two-systems, science, nirosha")  
print("Dark breaks: stats, quote, spectral, carousel, press, team, creds, CTA, footer")
