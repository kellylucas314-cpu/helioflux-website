#!/usr/bin/env python3
"""Fix Detection Gap + Bridge per Kelly's spec."""
import re

SRC = 'index.html'
with open(SRC, 'r') as f:
    html = f.read()

# ──────────────────────────────────────────────────────────
# 1. UNIFORM SECTION HEADERS — all h2 at same size
# ──────────────────────────────────────────────────────────

# Main h2 tag already: clamp(44px, 5.5vw, 72px) — too big, bring to 46px max
html = html.replace(
    "h2 { font-family: var(--serif); font-size: clamp(44px, 5.5vw, 72px); font-weight: 300; line-height: 1.1; margin-bottom: 32px; letter-spacing: 0.01em; color: var(--text-dark); }",
    "h2 { font-family: var(--serif); font-size: clamp(32px, 4.5vw, 46px); font-weight: 300; line-height: 1.15; margin-bottom: 32px; letter-spacing: 0.01em; color: var(--text-dark); }"
)

# prob-opener (currently italic Georgia, small) — make it match h2 size
html = html.replace(
    """.prob-opener { color: #14263C;
      font-family: Georgia, 'Playfair Display', serif;
      font-size: clamp(22px,2.8vw,38px); font-weight: 400; font-style: italic;
      color: #14263C; line-height: 1.5; max-width: 700px; margin: 0 auto 48px;
    }""",
    """.prob-opener { 
      font-family: var(--serif);
      font-size: clamp(32px, 4.5vw, 46px); font-weight: 300; font-style: normal;
      color: #14263C; line-height: 1.15; max-width: 700px; margin: 0 auto 36px;
    }"""
)

# prob-h2 (Bridge "HelioFlux closes that gap") — match same size
html = html.replace(
    """.prob-h2 {
      font-size: clamp(36px,4.5vw,42px); font-weight: 700; line-height: 1.15;
      margin: 16px auto 28px; max-width: 700px;
    }""",
    """.prob-h2 {
      font-size: clamp(32px, 4.5vw, 46px); font-weight: 300; line-height: 1.15;
      margin: 16px auto 28px; max-width: 700px;
    }"""
)

# ──────────────────────────────────────────────────────────
# 2. DETECTION GAP — kill duplicate label
# ──────────────────────────────────────────────────────────

# Remove "The Detection Gap" eyebrow label (it duplicates the header)
html = html.replace(
    '<span class="prob-eyebrow2 reveal">The Detection Gap</span>',
    '<!-- label removed: duplicated header -->'
)

# ──────────────────────────────────────────────────────────
# 3. DETECTION GAP — center ALL text
# ──────────────────────────────────────────────────────────

# Body text paragraphs have text-align:left inline — change to center
html = html.replace(
    'font-size:17px;color:#2A3F56;line-height:1.75;max-width:650px;margin:0 auto 36px;text-align:left;',
    'font-size:17px;color:#2A3F56;line-height:1.75;max-width:650px;margin:0 auto 36px;text-align:center;'
)
html = html.replace(
    'font-size:16px;color:#3A5068;line-height:1.7;max-width:650px;margin:0 auto 48px;text-align:left;',
    'font-size:16px;color:#3A5068;line-height:1.7;max-width:650px;margin:0 auto 48px;text-align:center;'
)

# ──────────────────────────────────────────────────────────
# 4. STAT LABELS — fix colors for cream background
# ──────────────────────────────────────────────────────────

# Remove radial gradient bloom behind stat numbers
html = html.replace(
    """    .prob-gap-col.early::before {
      content: ''; position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%); width: 220px; height: 160px;
      background: radial-gradient(ellipse, rgba(0,224,255,.1) 0%, transparent 70%);
      pointer-events: none;
    }
    .prob-gap-col.late::before {
      content: ''; position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%); width: 220px; height: 160px;
      background: radial-gradient(ellipse, rgba(255,107,107,.1) 0%, transparent 70%);
      pointer-events: none;
    }""",
    """    .prob-gap-col.early::before { display: none; }
    .prob-gap-col.late::before { display: none; }"""
)

# Fix stat label colors for cream background (were white for dark bg)
html = html.replace(
    ".prob-gap-survive { font-size: 18px; color: rgba(255,255,255,.85); margin-bottom: 0; }",
    ".prob-gap-survive { font-size: 16px; color: #2A3F56; margin-bottom: 2px; }"
)
html = html.replace(
    ".prob-gap-label { font-size: 15px; color: rgba(255,255,255,.7); margin-top: 4px; }",
    ".prob-gap-label { font-size: 14px; color: #5a6b7e; margin-top: 2px; }"
)

# ──────────────────────────────────────────────────────────
# 5. BRIDGE — "No blood draw" line BIGGER
# ──────────────────────────────────────────────────────────

# Currently: font-size:clamp(24px,3vw,32px) — bump it
html = html.replace(
    "font-size:clamp(24px,3vw,32px);font-weight:600;letter-spacing:.02em;color:#14263C;margin:28px 0 44px;",
    "font-size:clamp(28px,3.5vw,38px);font-weight:500;letter-spacing:.02em;color:#00A9D6;margin:32px 0 48px;"
)

# ──────────────────────────────────────────────────────────
# 6. BRIDGE — body text brighter
# ──────────────────────────────────────────────────────────

# The bridge body text color
html = html.replace(
    "font-size:19px;color:#2A3F56;margin-top:24px;line-height:1.75;max-width:650px;",
    "font-size:19px;color:#b8c7d4;margin-top:24px;line-height:1.75;max-width:650px;"
)

# ──────────────────────────────────────────────────────────
# 7. BRIDGE — softer transition from cream
# ──────────────────────────────────────────────────────────

# Add more padding at top of bridge/solution section
# Find the solution div and increase top padding
html = html.replace(
    '<div id="solution">\n  <div style="max-width:1200px;margin:0 auto;padding:140px 56px;">',
    '<div id="solution" style="background:#0f1c2e;position:relative;">\n  <div style="max-width:1200px;margin:0 auto;padding:160px 56px 140px;">'
)

# Add a gradient fade at the top of the solution section
# Insert a pseudo-element via a small style addition
gradient_transition = '''
    /* Cream→dark gradient transition before bridge */
    #solution::before {
      content: '';
      position: absolute;
      top: -60px; left: 0; right: 0;
      height: 60px;
      background: linear-gradient(to bottom, #f5f0eb, #0f1c2e);
      pointer-events: none;
    }
'''

# Insert before the section-theme style block
html = html.replace(
    '<style id="section-theme">',
    f'<style id="transition-gradients">{gradient_transition}</style>\n    <style id="section-theme">'
)

with open(SRC, 'w') as f:
    f.write(html)

print("✅ Detection Gap + Bridge fixes applied!")
