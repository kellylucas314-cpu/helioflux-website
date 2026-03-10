#!/usr/bin/env python3
"""
Big flip: cream default body, dark navy accent breaks.
Like martinpicard.energy uses green to break up cream/white.
"""
import re, shutil

SRC = 'index.html'
BACKUP = 'index-backup-pre-flip.html'

shutil.copy2(SRC, BACKUP)
print(f"Backed up to {BACKUP}")

with open(SRC, 'r') as f:
    html = f.read()

# ──────────────────────────────────────────────────────────
# 1. BODY DEFAULT → warm cream, dark text
# ──────────────────────────────────────────────────────────

html = html.replace(
    "background: var(--bg);\n      color: var(--white);",
    "background: #f5f0eb;\n      color: #16263A;"
)

# ──────────────────────────────────────────────────────────
# 2. CSS VARIABLES — add cream-mode vars
# ──────────────────────────────────────────────────────────

html = html.replace(
    "--border:  rgba(255,255,255,0.06);",
    "--border:  rgba(255,255,255,0.06);\n      --border-light: rgba(22,38,58,0.08);\n      --cream: #f5f0eb;\n      --cream-alt: #F7F6F2;\n      --navy: #0f1c2e;\n      --navy-mid: #162235;\n      --text-dark: #16263A;\n      --text-dark-muted: #4a5b6e;"
)

# ──────────────────────────────────────────────────────────
# 3. GENERIC SECTION — cream background, dark text by default
# ──────────────────────────────────────────────────────────

# The .section class is for all content sections
html = html.replace(
    ".section { padding: 160px 56px; max-width: 1200px; margin: 0 auto; }",
    ".section { padding: 160px 56px; max-width: 1200px; margin: 0 auto; color: var(--text-dark); }"
)

# Lead text: dark mode
html = html.replace(
    ".lead { font-size: 18px; color: rgba(255,255,255,.82); line-height: 1.85; font-weight: 300; }",
    ".lead { font-size: 18px; color: var(--text-dark-muted); line-height: 1.85; font-weight: 300; }"
)

# h2 default: dark text
html = html.replace(
    "h2 { font-family: var(--serif); font-size: clamp(44px, 5.5vw, 72px); font-weight: 300; line-height: 1.1; margin-bottom: 32px; letter-spacing: 0.01em; }",
    "h2 { font-family: var(--serif); font-size: clamp(44px, 5.5vw, 72px); font-weight: 300; line-height: 1.1; margin-bottom: 32px; letter-spacing: 0.01em; color: var(--text-dark); }"
)

# ──────────────────────────────────────────────────────────
# 4. DARK ACCENT SECTIONS — explicit dark backgrounds
#    (hero, stats, quote, carousel, press-logos, CTA, footer)
# ──────────────────────────────────────────────────────────

# Hero already has dark background via overlays — good

# Stats strip
html = html.replace(
    ".stats-strip { display: grid; grid-template-columns: repeat(5,1fr); background: var(--bg2);",
    ".stats-strip { display: grid; grid-template-columns: repeat(5,1fr); background: var(--navy);"
)
html = html.replace(
    ".stat { padding: 40px 32px; border-right: 1px solid var(--border); }",
    ".stat { padding: 40px 32px; border-right: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,.85); }"
)

# Quote section — dark accent break
# Already has dark background via gradient

# Carousel section — dark accent break
# Already set in section-theme

# Press logos
html = html.replace(
    ".press-logos { display: flex; justify-content: center; align-items: center; gap: 52px; flex-wrap: wrap; padding: 78px 56px; border-bottom: 1px solid var(--border); background: rgba(255,255,255,.04); }",
    ".press-logos { display: flex; justify-content: center; align-items: center; gap: 52px; flex-wrap: wrap; padding: 78px 56px; border-bottom: 1px solid rgba(255,255,255,0.06); background: var(--navy); }"
)

# Press cards
html = html.replace(
    ".press-card { background: var(--bg2); padding: 52px; color: var(--white); }",
    ".press-card { background: var(--navy-mid); padding: 52px; color: #fff; }"
)
html = html.replace(
    ".press-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: var(--border); margin-top: 0; overflow: hidden; }",
    ".press-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: rgba(255,255,255,0.06); margin-top: 0; overflow: hidden; }"
)

# CTA section — dark accent
html = html.replace(
    ".cta-section { padding: 180px 56px; text-align: center; position: relative; overflow: hidden; }",
    ".cta-section { padding: 180px 56px; text-align: center; position: relative; overflow: hidden; background: var(--navy); color: #fff; }"
)
html = html.replace(
    ".cta-types { display: grid; grid-template-columns: repeat(4,1fr); gap: 2px; background: var(--border); max-width: 1000px; margin: 0 auto; }",
    ".cta-types { display: grid; grid-template-columns: repeat(4,1fr); gap: 2px; background: rgba(255,255,255,0.06); max-width: 1000px; margin: 0 auto; }"
)
html = html.replace(
    ".cta-type { background: var(--bg2); padding: 28px 24px; }",
    ".cta-type { background: var(--navy-mid); padding: 28px 24px; color: rgba(255,255,255,.85); }"
)

# Footer — dark
html = html.replace(
    "footer { background: var(--bg2); border-top: 1px solid var(--border); padding: 72px 56px;",
    "footer { background: var(--navy); border-top: 1px solid rgba(255,255,255,0.06); padding: 72px 56px; color: rgba(255,255,255,.85);"
)
html = html.replace(
    ".f-bottom { background: var(--bg2); border-top: 1px solid var(--border);",
    ".f-bottom { background: var(--navy); border-top: 1px solid rgba(255,255,255,0.06);"
)

# Team cards — dark accent section
html = html.replace(
    ".team-card { display: grid; grid-template-columns: 76px 1fr; gap: 28px; padding: 48px; background: var(--bg2); align-items: start; transition: background .3s; }",
    ".team-card { display: grid; grid-template-columns: 76px 1fr; gap: 28px; padding: 48px; background: var(--navy-mid); align-items: start; transition: background .3s; color: rgba(255,255,255,.85); }"
)
html = html.replace(
    ".team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: var(--border); margin-top: 40px; }",
    ".team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: rgba(255,255,255,0.06); margin-top: 40px; }"
)

# Creds strip — dark
html = html.replace(
    ".cred { padding: 32px 24px; text-align: center; border-right: 1px solid var(--border); background: var(--bg2); }",
    ".cred { padding: 32px 24px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06); background: var(--navy-mid); color: rgba(255,255,255,.85); }"
)
html = html.replace(
    ".creds-strip { display: grid; grid-template-columns: repeat(5,1fr); border-bottom: 1px solid var(--border); }",
    ".creds-strip { display: grid; grid-template-columns: repeat(5,1fr); border-bottom: 1px solid rgba(255,255,255,0.06); background: var(--navy); }"
)

# ──────────────────────────────────────────────────────────
# 5. CREAM SECTIONS — explicit light styling
#    (problem, two-systems, science areas, peppercorn)
# ──────────────────────────────────────────────────────────

# Problem section — already has cream in section-theme, but let's ensure text colors
# Peppercorn
html = html.replace(
    ".peppercorn-tag { font-size: 13px; letter-spacing: .22em; text-transform: uppercase; color: rgba(0,200,240,.5);",
    ".peppercorn-tag { font-size: 13px; letter-spacing: .22em; text-transform: uppercase; color: rgba(0,169,214,.7);"
)
html = html.replace(
    ".peppercorn h3 { font-family: var(--serif); font-size: clamp(26px, 3vw, 36px); font-weight: 300; line-height: 1.2; margin-bottom: 24px; }",
    ".peppercorn h3 { font-family: var(--serif); font-size: clamp(26px, 3vw, 36px); font-weight: 300; line-height: 1.2; margin-bottom: 24px; color: var(--text-dark); }"
)
html = html.replace(
    ".peppercorn p { font-size: 16px; color: var(--muted); line-height: 1.9; font-weight: 300; max-width: 680px; }",
    ".peppercorn p { font-size: 16px; color: var(--text-dark-muted); line-height: 1.9; font-weight: 300; max-width: 680px; }"
)
html = html.replace(
    ".peppercorn-inner { border-left: 2px solid rgba(0,200,240,.18);",
    ".peppercorn-inner { border-left: 2px solid rgba(0,169,214,.3);"
)

# Science 2col
html = html.replace(
    ".sci-caption p { font-size: 14px; color: var(--muted); font-style: italic; line-height: 1.65; }",
    ".sci-caption p { font-size: 14px; color: var(--text-dark-muted); font-style: italic; line-height: 1.65; }"
)

# Step blocks — these are on cream now
html = html.replace(
    ".step-block { padding: 52px 36px; background: rgba(255,255,255,.02); border: 1px solid var(--border); }",
    ".step-block { padding: 52px 36px; background: rgba(255,255,255,.5); border: 1px solid var(--border-light); }"
)
html = html.replace(
    ".step-block h3 { font-size: 16px; font-weight: 500; margin-bottom: 12px; }",
    ".step-block h3 { font-size: 16px; font-weight: 500; margin-bottom: 12px; color: var(--text-dark); }"
)
html = html.replace(
    ".step-block p { font-size: 16px; color: var(--muted); line-height: 1.8; font-weight: 300; }",
    ".step-block p { font-size: 16px; color: var(--text-dark-muted); line-height: 1.8; font-weight: 300; }"
)

# ──────────────────────────────────────────────────────────
# 6. THRESHOLD COMPARE — now on cream background
# ──────────────────────────────────────────────────────────

html = html.replace(
    ".threshold-divider { background: var(--border); height: 100%; min-height: 180px; }",
    ".threshold-divider { background: var(--border-light); height: 100%; min-height: 180px; }"
)
html = html.replace(
    ".threshold-label { font-size: 13px; letter-spacing: .22em; text-transform: uppercase; color: var(--muted);",
    ".threshold-label { font-size: 13px; letter-spacing: .22em; text-transform: uppercase; color: var(--text-dark-muted);"
)
html = html.replace(
    ".threshold-num.dim { color: rgba(255,255,255,.6); text-decoration: line-through; text-decoration-color: rgba(255,255,255,.08); }",
    ".threshold-num.dim { color: rgba(22,38,58,.35); text-decoration: line-through; text-decoration-color: rgba(22,38,58,.1); }"
)
html = html.replace(
    ".threshold-unit { font-size: 13px; color: var(--muted);",
    ".threshold-unit { font-size: 13px; color: var(--text-dark-muted);"
)
html = html.replace(
    ".threshold-sub { font-size: 14px; color: rgba(255,255,255,.55);",
    ".threshold-sub { font-size: 14px; color: var(--text-dark-muted);"
)

# ──────────────────────────────────────────────────────────
# 7. SPECTRAL SPLIT — dark accent break (like Picard's green)
# ──────────────────────────────────────────────────────────

html = html.replace(
    ".spectral-split { padding: 100px 56px 80px; max-width: 1200px; margin: 0 auto; }",
    ".spectral-split { padding: 100px 56px 80px; max-width: 1200px; margin: 0 auto; background: var(--navy); color: #fff; }"
)
# But spectral-split has max-width — need a wrapper approach. Let's use section-theme instead.

# SS side already has bg override

# ──────────────────────────────────────────────────────────
# 8. SECTION-THEME — update for cream-first approach
# ──────────────────────────────────────────────────────────

# Replace the entire section-theme block
section_theme_pattern = r'<style id="section-theme">.*?</style>'
match = re.search(section_theme_pattern, html, re.DOTALL)
if match:
    old_theme = match.group(0)
    new_theme = '''<style id="section-theme">
    /* ─── CREAM-FIRST DESIGN: body is cream, dark sections are accent breaks ─── */

    /* === CREAM SECTIONS (default — most content lives here) === */
    #problem { background: #f5f0eb; color: #16263A; }
    #problem h2, #problem h3, #problem .lead { color: #16263A; }
    #problem .eyebrow { color: #00A9D6; opacity: 0.9; }
    #problem .crisis-callout { border-color: rgba(0,169,214,.3); background: rgba(0,169,214,.05); }
    #problem .crisis-callout-pct { color: #00A9D6; }
    #problem .crisis-callout-text { color: #16263A; }
    #problem .crisis-card { background: rgba(255,255,255,.6); }
    #problem .crisis-card-title { color: #16263A; }
    #problem .crisis-bullets li { color: #4a5b6e; }
    #problem .crisis-bullets li::before { background: rgba(0,169,214,.5); }

    #two-systems { background: #F7F6F2; color: #16263A; }
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

    /* === DARK ACCENT SECTIONS (navy breaks, like Picard's green) === */
    
    /* Hero — dark (already handled by hero overlays) */
    
    /* Stats strip — dark */
    .stats-strip { background: #0f1c2e; }
    
    /* Quote band — dark accent break */
    .quote-section { background: #0f1c2e !important; }
    
    /* Spectral split — dark */
    .spectral-split { background: #0f1c2e; }
    .ss-side { background: #0f1c2e; }
    .ss-spectrum-row { background: rgba(255,255,255,0.04); }

    /* Carousel — dark accent break */
    .h-section { background: #0f1c2e; }
    .h-section-label { color: #fff; }
    .h-section-label .eyebrow { color: var(--cyan); }
    .h-section-label h2 { color: #fff; }
    .h-track { background: transparent; }
    .h-panel { color: rgba(255,255,255,.88); }
    .h-panel h3 { color: #fff; }
    .h-panel p { color: rgba(255,255,255,.78); }
    .h-panel .h-panel-pub { color: rgba(255,255,255,.6); }
    .h-stat-num { color: var(--cyan); }
    .h-stat-label { color: rgba(255,255,255,.65); }

    /* Nirosha section on cream — override text colors */
    .nirosha-wrap .ncred { background: rgba(22,38,58,.06); }
    .nirosha-wrap .ncred-label { color: #4a5b6e; }
    .nirosha-wrap .ncred-value { color: #16263A; }
    .nirosha-wrap .ncred-value strong { color: #00A9D6; }
    .cancer-type-tag { background: rgba(0,169,214,.06); border-color: rgba(0,169,214,.15); color: #4a5b6e; }

    /* Press — dark accent break */
    .press-logos { background: #0f1c2e; }
    .press-cards { background: rgba(255,255,255,0.04); }

    /* Creds — dark */
    .creds-strip { background: #0f1c2e; }
    
    /* Team — dark accent section */
    .team-grid { background: rgba(255,255,255,0.04); }

    /* CTA — dark accent */
    .cta-section { background: #0f1c2e; color: #fff; }
    .cta-section h2 { color: #fff; }
    .cta-section .lead { color: rgba(255,255,255,.78); }

    /* Footer — dark */
    footer { background: #0f1c2e; color: rgba(255,255,255,.85); }
    .f-bottom { background: #0f1c2e; }

    /* QSense/LuminAI cards stay dark even in cream sections */
    .qs-card, .lum-card { background: #0f1c2e; color: #fff; }
    </style>'''
    html = html.replace(old_theme, new_theme)
    print("Replaced section-theme with cream-first design")

# ──────────────────────────────────────────────────────────
# 9. EYEBROW on cream — needs dark-friendly color
# ──────────────────────────────────────────────────────────

# Default eyebrow is cyan — works on both cream and dark

# ──────────────────────────────────────────────────────────
# 10. SECTION-BG areas — fix for cream default
# ──────────────────────────────────────────────────────────

html = html.replace(
    ".section-bg { background: var(--bg-alt); max-width: 100%; }",
    ".section-bg { background: #0f1c2e; max-width: 100%; color: rgba(255,255,255,.85); }"
)

# ──────────────────────────────────────────────────────────
# 11. BORDER COLORS — light borders for cream sections
# ──────────────────────────────────────────────────────────

# Problem grid gap — light border
html = html.replace(
    ".problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 124px; align-items: center; }",
    ".problem-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 100px; align-items: center; }"
)

# Scroll cue on hero — keep white
# Nav — keep dark since hero is dark

# ──────────────────────────────────────────────────────────
# 12. HEADING WEIGHT — lighter for Picard feel
# ──────────────────────────────────────────────────────────

html = html.replace(
    "font-size: clamp(52px, 7.5vw, 96px); font-weight: 480;",
    "font-size: clamp(52px, 7.5vw, 96px); font-weight: 420;"
)

# ──────────────────────────────────────────────────────────
# 13. BODY LINE HEIGHT and general text
# ──────────────────────────────────────────────────────────

# Peppercorn strong
html = html.replace(
    ".peppercorn strong { color: rgba(255,255,255,.75); font-weight: 400; }",
    ".peppercorn strong { color: var(--text-dark); font-weight: 500; }"
)

# Science caption border
html = html.replace(
    ".sci-caption { padding: 16px 20px; border-left: 2px solid rgba(0,200,240,.2);",
    ".sci-caption { padding: 16px 20px; border-left: 2px solid rgba(0,169,214,.3);"
)

with open(SRC, 'w') as f:
    f.write(html)

print("✅ CREAM-FIRST FLIP COMPLETE!")
print("Body: warm cream (#f5f0eb)")
print("Dark accent breaks: hero, stats, quote, spectral, carousel, press, team, creds, CTA, footer")
print("Cream content: problem, two-systems, peppercorn, science, nirosha")
