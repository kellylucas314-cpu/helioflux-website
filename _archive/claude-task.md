Read CLAUDE.md and brand_assets/brand-guide.md first. Then read the frontend-design skill at /home/kellybot/.openclaw/workspace/skills/frontend-design/SKILL.md.

Your task: Do a comprehensive design elevation pass on index.html. This is a real biotech startup website for HelioFlux and it needs to look spectacular — like it cost $15-20K from a design agency.

FIRST: Make a backup: cp index.html index-backup-pre-spectacular.html

Specific improvements to make:

1. SPACING — The #1 upgrade. Add massive breathing room everywhere:
   - Section padding: 140px top/bottom desktop, 80px mobile
   - Increase gaps between headline, subhead, body, CTA
   - More generous max-width containers

2. TYPOGRAPHY — Tighten the hierarchy:
   - Section eyebrows: 11px, uppercase, letter-spacing 0.18em, opacity 0.5
   - H2 headings: clamp(36px, 5vw, 56px), weight 300, letter-spacing 0.01em
   - Body: 19px, line-height 1.75
   - Stat numbers: larger, more dramatic (clamp(48px, 6vw, 72px))

3. SURVIVAL STATS VISUAL — Build an icon-array in the Problem section:
   After "Cancer is caught too late." and before "But what if cancer gives itself away...", add a two-column visual:
   - Left column: "Early Detection" label + 10 SVG person icons (9 cyan #00A9D6 + 1 dark #1a2a3a) + ">90% 5-year survival" stat
   - Right column: "Late Detection" label + 10 SVG person icons (3 cyan + 7 dark) + "~30% 5-year survival" stat
   - Small caption: "Source: SEER Cancer Statistics"
   - Sits on cream background, centered, max-width 640px
   - This replaces the existing stat numbers block if one exists

4. HERO POLISH — Do not change any copy. Only refine spacing and ensure "light." stays cyan.

5. PROBLEM SECTION — Add this line between "Cancer is caught too late." and the paragraph that starts "Every 60 seconds...":
   Text: "Before a tumor is visible. Before symptoms appear. Before it's too late."
   Style: italic, ~20px, opacity 0.7, margin-bottom 32px, color #16263A

6. DARK SECTIONS — Ensure all dark sections use consistent #0f1c2e background.

7. NIROSHA BIO — Reorder her credentials: Canada Research Chair first, then Levin lab / Harvard Wyss, then publication count, then grants. Final two sentences stay exactly as written: "She built this science. HelioFlux is how it reaches the world."

8. MOBILE — Verify padding and font sizes are reasonable at 390px width.

RULES:
- Do NOT change any other copy, section order, or HTML structure
- Do NOT add new JS libraries
- Do NOT push to GitHub

When done:
git add -A && git commit -m "design: spectacular elevation pass — spacing, typography, survival stats visual, polish"

Then signal completion:
openclaw system event --text "Claude Code done: spectacular design pass complete. Ready for Kelly review." --mode now
