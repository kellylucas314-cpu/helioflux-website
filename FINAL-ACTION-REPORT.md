HelioFlux Website — Final Action Report
Merged critique: design + marketing + scientific precision
Primary Audiences: Seed investors · Scientists March 3, 2026
What This Document Is
Two independent reviews of the HelioFlux website identified overlapping problems from
different angles — one focused on design, information architecture, and investor
psychology; the other on scientific precision, regulatory risk, and technical credibility. A
third evaluated the site through the lens of a GitHub Pages biotech teardown — what reads
as investor-grade vs. amateur. This document merges the best of all three into a single
cohesive plan.
Where the reviews disagreed, I used a simple filter: does the change make the site more
compelling to a seed investor doing 10-second diligence AND a scientist checking
your claims? If it fails either audience, it’s out.
The Quick Audit: Investor-Grade vs. Amateur
Investors scan a website in 30 seconds. They’re looking for risk reduction (team, data, IP)
and market size.
What already reads as investor-grade (keep and polish):
The “science first” approach — you lead with mechanism of action (oxidative stress,
photon emissions) rather than “magic cure.” The 01/02/03 logic is sound.
Press and validation logos — Scientific American and Cell Press are gold.
The survival rate delta (>90% vs ~30%) — strong, quantifiable hook.
Three peer-reviewed publications with an evidence trajectory (2018 → 2020 → 2025).
Named, branded products (QSense, LuminAI) — this is a platform, not a research
project.
What currently reads as amateur (fix immediately):
“Wall of text” team bios — 300+ word academic resumes where investors want 3 bullet
points.
Buried social proof — press logos and “What the world is saying” are near the bottom. If
you have validation, flash it early.
Invisible product flow — the relationship between hardware, software, and patient gets
lost in paragraphs.
The mailto: CTA — “Email Kelly” is high friction. It reads as a hobby project, not a
fundable company. Use a form + calendar link.
Content duplication — the same data appearing 2-3 times signals “nobody edited this.”
Flat typography — everything looks the same weight, so nothing stands out to a
scanning eye.
The Voice: “The Ambitious Realist”
Before getting into specific fixes, here’s the north star for every line of copy on this site:
Mechanism over metaphor — Lead with how it works, not how it feels. Don’t say “we read
the glow”; say “we analyze spectral power density of ultra-weak photon emissions.” BUT: a
strong tagline can still be poetic if the science immediately follows. “Your cells emit light” is
a hook. “Quantifying UPEs as a novel biomarker” is a caption. You need both — in the right
order.
Gap-focused framing — Frame the problem as a diagnostic resolution limit, not “cancer is
scary.” Investors fund solutions to engineering problems. Scientists respect specificity.
“Current imaging requires ~1 billion cells. We detect at 5–10 million.” That’s a 100x
resolution gap. That’s fundable.
Conservative precision — Avoid “all,” “never,” and “100%” in headlines. Use
“demonstrated,” “in preclinical models,” and “high sensitivity.” This sounds MORE confident
to sophisticated audiences because it sounds scientifically honest. A naive founder says
“100% detection rate.” A credible founder says “consistently differentiated malignant from
healthy tissue across all preclinical samples.”
Metaphors earn their place — The peppercorn metaphor is effective science
communication. It makes 5–10 million cells tangible. Keep it — but inside an accordion
where the audience is already engaged, not as a standalone section competing with your
data.
Section-by-Section Plan
1. HERO
What’s working: “Your cells emit light. We learned to read it.” is the best line on the site. It’s
poetic, memorable, and scientifically accurate. Seed investors remember taglines. Scientists
appreciate accuracy. Do NOT replace this with jargon.
What to fix:
The hero subtitle currently says “Non-Invasive Cancer Detection.” This is fine but generic —
it could describe liquid biopsy, AI imaging, or a dozen other companies.
Element
Current
Recommended
Title
Non-Invasive
Cancer
Detection
Non-Invasive Cancer Detection (keep — it’s clear)
Tagline
Your cells emit
light. We
learned to read
it.
 Keep exactly as-is
Subtitle
No blood draw.
No biopsy. No
radiation.
 Keep — this is doing real work for all audiences
Add
below
subtitle
(nothing)
“Biophotonic sensing at single-photon sensitivity ·
Detecting metabolic signatures of cancer at 100x lower
cell thresholds than standard imaging”
That added line gives the scientist the specificity they need (“biophotonic sensing,” “single-
photon sensitivity,” “metabolic signatures”) while giving the investor the magnitude (“100x
lower”). The tagline hooks you in; the technical line tells you it’s real.
Also add: A trust badge bar directly below the hero. Small, horizontal, unobtrusive: Canada
Research Chair · NVIDIA Inception · Patent Pending · 3 Peer-Reviewed Papers ·
Forbes Midas List CFO
This is the #1 highest-impact change for seed investors. They pattern-match in the first 10
seconds. These badges say “this is real” before anyone reads a word of body copy.
2. THE PROBLEM
Where both reviews agree: This section is 5x too long. Cut it to one screen.
Where they diverge: The marketing review says lead with an emotional quote (“Every two
minutes, someone is told they have cancer that could have been caught sooner”). The
scientific review says lead with the diagnostic resolution gap.
The merge: Do both. The emotional hook earns 3 more seconds of attention. The technical
framing earns respect. Stack them.
Recommended structure:
THE PROBLEM
"Every two minutes, someone is told they have cancer
 that could have been caught sooner."
THE DIAGNOSTIC RESOLUTION GAP
Current imaging requires mass. HelioFlux detects metabolism.
    >90%                     ~30%
 5-year survival          5-year survival
 when caught early        when caught late
Standard imaging (CT/MRI) requires ~1 billion cells to visualize
a tumor. Between cellular onset and visible mass, there is a
diagnostic blind spot — often lasting years.
Sources: ACS 2026 · SEER 2015-2021
What this does differently:
The quote hooks EVERY audience (investors are human too)
“The Diagnostic Resolution Gap” reframes the problem as an engineering challenge, not
a public health PSA — this is what makes it fundable
“Current imaging requires mass. HelioFlux detects metabolism.” is a one-line thesis that
a seed investor will remember after 50 other pitches that week
The >90% / ~30% visual is simple and devastating
The “blind spot” framing sets up your solution perfectly
DELETE everything else currently in this section: The 40% stat, the “1 in 5” line
(outdated), the 4 expandable cards, the “Why Current Screening Fails” header and intro.
Move the card content (cost, access, screening gaps) into Accordion 04.
Consider adding a visual “gap” graphic (Phase 2): Below the two numbers, a simple
comparative visual makes the resolution gap tangible:
Standard Imaging          HelioFlux
~1 billion cells          5–10 million cells
~1 cm mass                ~2–3 mm
Stage III/IV              Pre-symptomatic
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                ← 100x detection gap →
Investors buy the delta between those two points. Make it visible, not just described. This
doesn’t need to be fancy — two columns and a line is enough.
3. TRANSITION → SOLUTION
Current: “What if we could detect cancer at the cellular level — before a tumor ever forms?”
The scientific critique flags a real issue here: “Before a tumor ever forms” is imprecise. If
you have 5–10 million malignant cells, a tumor HAS formed — it’s just microscopic. Saying
“before a tumor forms” implies prediction, which is a harder regulatory claim than detection.
A scientist will catch this immediately.
Recommended fix:
“What if we could detect cancer at the cellular level — before it becomes visible to any
scan?”
Same emotional punch. Scientifically accurate. No regulatory exposure.
Solution headline:
Current
Issue
Recommended
“HelioFlux
detects cancer
before tumors
form.”
Implies
prediction;
imprecise about
tumor formation
“HelioFlux detects malignant cell populations at
thresholds 100x below standard imaging — in
published, peer-reviewed studies.”
This is tighter, more specific, and anchored to evidence. A seed investor reads “100x below
standard imaging” and thinks “that’s a real technical moat.” A scientist reads “published,
peer-reviewed” and thinks “I can verify this.”
Also delete:
The Dr. Murugan quote → moves to Team section
The “Our Advantages” 6-card section → delete entirely (redundant with the technology
description)
Placeholder images (“Image coming — replacing with Canva export”) → delete
immediately
4. HOW IT WORKS (QSense + LuminAI)
The “invisible product” problem: The current section describes QSense and LuminAI in
paragraphs, but the relationship between the hardware, the software, and the patient gets
lost in the text. An investor scanning this section should be able to see the product flow in 2
seconds: sensor touches patient → captures photons → AI analyzes → result. Right now that
chain is buried.
Layout fix — 3-column grid instead of stacked cards:
Column 1: The Physics
Column 2: The Sensor
Column 3: The AI
Icon/visual of cell
Photo of QSense device
Icon of analysis/chip
“Oxidative Stress Signal”
“Single-Photon Sensitivity”
“Spectral Analysis”
2 sentences max
2 sentences max
2 sentences max
This makes the three-step logic (biology → hardware → software) scannable at a glance.
Nobody reads paragraphs on the first pass — they scan headers. The current 01/02 card
structure is sound but can be made more visual and scannable.
Scientific precision fixes:
Current
Recommended
“All living cells emit faint light
signals. But cancer cells emit
distinct patterns and
wavelengths — different from
healthy cells.”
“All living cells emit ultra-weak photon emissions (UPEs)
as a byproduct of oxidative metabolism. In malignant
tissue, metabolic dysregulation causes a distinct,
measurable shift in emission intensity and spectral
shape.”
“AI processes the captured
signals instantly, analyzing
“LuminAI processes raw photon data via spectral power
photon patterns against a
validated cancer signature
database.”
density analysis, distinguishing the inverted emission
signature of metabolically stressed cells from healthy
tissue.”
Why this matters: The current copy is accessible but vague. The rewrite is accessible AND
precise. A scientist reads “spectral power density analysis” and knows you understand your
own technology. An investor reads the same thing and sees technical depth, not just
marketing claims.
Design fixes:
Body text minimum 16px
“~15 minutes” should be a prominent callout, not buried in a paragraph
Ensure QSense and LuminAI cards have clearly distinct H3 headers (22-26px) vs. body
text (16-18px)
5. EXPLORE THE SCIENCE (4 Accordions)
Both reviews agree: The accordion structure is strong. It’s the correct progressive
disclosure pattern — casual visitors skim, scientists and investors click to go deeper.
The critical fix: These accordions must become the SINGLE SOURCE OF TRUTH for all
deep science content. Delete every standalone duplicate below them.
Content consolidation:
Accordion
What to move IN
What to delete as standalone
01 — How cells
reveal cancer
Emission signature explanation
text
Standalone emission section (keep
squiggly visual only)
03 — Published
validation
Day 0→Day 19 timeline
Standalone timeline section
04 — How it
compares
Peppercorn metaphor + “Why
Screening Fails” cards
Standalone peppercorn section +
SVG chart
Scientific precision fix for Accordion 03:
The “100% detection rate” stat needs context. Currently it’s displayed as a big hero number.
Here’s the issue: no diagnostic is 100% effective. Placing this prominently suggests a lack
of regulatory maturity to any scientist or experienced biotech investor. The stat IS accurate
(in vitro, n=30, 2018 study), but the presentation matters.
Current
Recommended
100% Cancer samples
identified · 2018 in vitro ·
n=30
100% sensitivity in vitro · n=30 · 6 cell lines · Murugan et al.
2018. All malignant samples correctly differentiated from healthy
tissue.
The difference: “100% Cancer detection rate” sounds like a marketing claim. “100%
sensitivity, in vitro, n=30” sounds like a data readout. Same fact, completely different
credibility signal. The n=30 and “in vitro” qualifiers MUST stay visually proximate to the
number — never let “100%” float without its context.
For Accordion 04, consider adding the “resolution gap” framing:
The fundamental limitation is the cellular detection threshold. Standard imaging sees
anatomy. Liquid biopsy reads circulating DNA. HelioFlux reads metabolic activity directly
— at the point of cellular onset, before mass or circulating markers are present.
6. THE SQUIGGLY LINE
Both reviews agree: Keep the visual, cut the text. It becomes a full-width visual divider —
no explanation, no photo, no caption. The warm amber (healthy) vs. cool cyan (malignant)
ribbons are visually distinctive and scientifically meaningful. Let them breathe as a brand
moment.
7. WHAT IT CAN DETECT (3 Application Cards)
Skin Cancer card:
Keep status badge: Validated · Functional Prototype · Pilot Q3 2026
Don’t re-list every stat from the 2020 study (it’s in Accordion 03)
One strong sentence + publication references + status
Brain Health card — both reviews flag the stat badges:
Current
Issue
Fix
20 Human Subjects
 Fine
Keep
First
Milestone, not metric —
→ 2025 (published year) or
Photoencephalography
category error
iScience
75% Chemo patients
affected
Problem prevalence, not
HelioFlux result
→ Next: chemo brain
monitoring pilot
Metabolic card:
Purple text → change to white/gray (currently unreadable)
Use a subtle “Research Frontier” badge to differentiate status
Scientific precision fix for this section’s header:
Current
Recommended
“One science. Many applications.”
“One platform. Multiple validated applications.”
“Many applications” overpromises for a company with 3 published studies. “Multiple
validated applications” is precise and still impressive.
8. THE TEAM
Move the Murugan quote here (from the Transition section). Style it as a full-width quote
block above her bio. It’s a powerful statement that lands hardest when paired with her
credentials.
Add the image Kelly flagged for placement before the Team section.
Fix the “wall of text” bios. The current bios are full academic resumes — Nirosha’s is 300+
words. Investors won’t read it. They’re checking three things: credential, relevant field, and
why-this-person. Scientists check institution + publication record. Neither needs a
biography.
Recommended format — “Snapshot” bios:
For each team member, the default view should be:
Photo + Name + Title
2-3 bullet points max (the absolute strongest credentials)
“Read full bio ↓” expandable for the detailed version
Example — Nirosha:
Dr. Nirosha Murugan · Chief Scientist & Co-Founder
Canada Research Chair in Tissue Biophysics · Wilfrid Laurier University
Pioneered biophotonic cancer detection at Tufts (Levin Lab) · Harvard Wyss Fellow
40+ peer-reviewed publications (Science Advances, Nature Reviews Bioengineering)
[Read full bio ↓]
Example — Jim:
Jim Armstrong · CFO
Multiple Forbes Midas List honoree
Pre-launch investor in PayPal, NetZero, CarsDirect
Co-founded Clearstone Venture Partners + March Capital [Read full bio ↓]
The full bios you already have are strong — don’t delete them. Just put them behind a click.
The snapshot format respects the investor’s 30-second scan while keeping the depth
available for the scientist who wants it. This is the same progressive disclosure pattern as
the science accordions.
9. PRESS & PUBLISHED RESEARCH
Both reviews agree: keep this section. It’s one of the strongest on the site.
Scientific American, NPR Radiolab, Cell Press, CBC — this is institutional-tier press coverage
that most pre-clinical companies can’t touch. The three publications (Elsevier 2018, MDPI
2020, Cell Press 2025) provide a clear evidence trajectory.
Design fixes only:
Override visited-link purple → all links should be consistent cyan or white regardless of
visit state
Ensure press card text is minimum 16px
The “In Their Words” quotes are strong — keep as-is
10. AFTER PRESS — DELETE EVERYTHING THROUGH REGULATORY
STRATEGY
Delete (for now): Credential badges (repeated from bios), “How It Started” narrative,
Getting to Market roadmap, Business Model, Competitive Position, Regulatory Strategy
(Phase 1 & 2).
Why: This is pitch deck material on a marketing website. Seed investors will see this in your
deck. Having it here makes the page too long AND signals the team doesn’t distinguish
between a website and a data room. Save all of it for a future “For Investors” page.
Keep: Press section → “In Their Words” quotes → Contact/CTA. Clean ending.
11. CONTACT / CTA
“The science is real. Let’s talk.” is a strong closer. The four pathways (Investors, Clinical
Partners, Research, Press) are well-structured.
Fix the mailto: links. The current “Request Investor Deck” and “Schedule a conversation”
both open a mailto: to kelly.lucas@helioflux.co. This is high-friction and reads as amateur —
it signals “side project,” not “fundable company.” Investors are used to clicking and booking,
not composing an email from scratch.
Recommended fix:
“Request Investor Deck” → Link to a short Typeform, Tally, or Google Form (Name,
Organization, How you heard about us). This also captures lead data you can track.
“Schedule a Conversation” → Link to a Calendly or Cal.com booking page. Zero
friction. The investor clicks, picks a time, done.
Add a sticky nav CTA. The “Partner With Us” button is in the top nav and at the bottom of
the page — but it disappears from view once you scroll past the hero. Add a persistent
“Request Deck” or “Contact” button that stays visible in the top-right of the nav bar as the
user scrolls. Capture the impulse the moment they see data they like — don’t make them
scroll back up.
The Narrative Arc — Quick-Reference Wireframe
Don’t make investors hunt for the logic. Force them through this specific flow. This is the
final scroll order with the role each section plays in the investor’s 30-second scan:
#
Section
Investor Reads As
Duration
1
Hero — Value prop + device image + “Request
Deck” CTA
“What does this
company do?”
3 sec
2
Trust Bar — CRC, NVIDIA, Patent, 3 Papers,
Forbes Midas List CFO
“Is it real?”
2 sec
3
The Problem — Quote + resolution gap visual
(1B cells vs 5M cells)
“Is this a big
market?”
5 sec
4
The Solution — 3-column grid: Physics,
Sensor, AI
“How does it work?”
5 sec
5
Explore the Science — 4 accordions
(progressive disclosure)
“Show me the data”
Click if
interested
6
Squiggly Line — Visual divider, no text
(breathing room)
1 sec
7
Applications — 3 cards: Skin Cancer, Brain,
Metabolic
“What’s the
roadmap?”
5 sec
8
The Team — Snapshot bios with expandable
full bios
“Who’s behind this?”
5 sec
9
Press and Research — Logos + publication
cards + quotes
“Who else
believes?”
5 sec
10
Contact/CTA — Form + Calendly + four
pathways
“How do I get
involved?”
done
Total invested attention to reach the CTA: ~30 seconds of scanning. Everything beyond
this is progressive disclosure for people who are already interested.
The key principle: every section answers the next question the investor has. If you scramble
the order, you lose them. If you repeat content between sections, you lose them. If any
section takes more than one screen, you lose them — with the exception of the accordions,
which are opt-in depth.
Credibility & Regulatory Risk Table
Risk
Where
Issue
Fix
Priority
Outdated
survival stat
Problem
section
“<20%” is
outdated (actual:
~30-35%)
Change to ~30%, cite
ACS/SEER
 Do
now
Inconsistent
grant figure
Site vs.
docs
$1.3M on site,
$1.6M elsewhere
Verify, standardize
everywhere
 Do
now
“1 in 5
Problem
Now ~1 in 3
Delete the line
 Do
survive”
section
now
Placeholder
images
Solution
section
“Image coming” alt
text visible
Remove immediately
 Do
now
“Before a
tumor
forms”
Solution
headline
Imprecise — 5-
10M cells IS a
microscopic tumor
→ “before it becomes visible
to any scan”
 Do
now
“100%
detection
rate”
Skin
Cancer
card +
Accordion
No diagnostic is
100% —
presentation
implies clinical
maturity
Reframe: “100% sensitivity,
in vitro, n=30” — keep
qualifiers proximate
This
week
“First” stat
badge
Brain
Health
card
Milestone ≠ metric
— category error
for scientists
→ “2025” or “iScience”
This
week
“75%” stat
badge
Brain
Health
card
Problem
prevalence, not a
HelioFlux result
→ “Next: chemo brain
monitoring pilot”
This
week
“Detects
cancer
before
tumors
form”
Solution
headline
Could read as
clinical claim for
research-stage
company
→ “Detects malignant cell
populations at 100x lower
thresholds — in published
studies”
This
week
Footer
disclaimer
placement
Footer
Present but far
from above-the-
fold claims
Consider adding a subtle
“Preclinical · Not FDA
cleared” tag near the hero
or solution section
Soon
Design System (Key Points)
The Investor Scan Reality
Investors scan a deck in 2 minutes and a website in 30 seconds. They’re looking for three
things: risk reduction (team, data, IP), market size, and whether this feels like a real
company. Every design decision below serves that 30-second scan.
Typography — 6 Levels
The current site has ~2-3 text levels that blur together. Implement clear visual distinction:
Level
Size
Weight
Color
Use
Label
12-
13px
Semibold, UPPERCASE,
letter-spaced
Cyan or 50%
white
THE PROBLEM · OUR
SOLUTION
H1
48-
64px
Bold
White
Hero headline (used
once)
H2
36-
42px
Bold
White
Section headlines
H3
22-
26px
Semibold
White
Card titles, accordion
headers
Body
16-
18px
Regular
85% white
Paragraph text
Caption
13-
14px
Regular
50% white
Sources, citations
Color — Add Warmth
Current palette is monochrome dark (navy + cyan + white). Add amber/gold as a warm
second accent — you already have it in the squiggly line animation (healthy tissue = amber).
Extend it to callout borders, “Validated” badges, and section dividers. This shifts the
emotional register from “cold tech demo” to “serious science with human stakes.”
Rhythm — Add Visual Breaks
The site is one continuous dark scroll with no resting points. Add thin section divider lines
(1px, 10% white opacity) between every major section. Add 80-120px vertical padding
between sections. Add 2-3 full-width quote blocks as breathing moments.
CSS / Developer Checklist
Hand this to Kip or whoever is touching the code. These are the specific implementation
details that separate “professional biotech site” from “GitHub Pages project.”
Typography & Readability
Primary font: Clean sans-serif (Inter, DM Sans, or similar). No more than 2 weights
(Regular, Bold).
H1 hero: 48-64px desktop, 36px mobile. Line-height 1.1 (tight).
H2 section headers: 32-42px. Always 40px+ padding above to clearly separate from
previous section.
Body text: 16px minimum, never 14px. Line-height 1.5 or 1.6.
Max line length: 60-75 characters per line. Use max-width: 800px  on text containers —
don’t let paragraphs span full screen width.
Spacing & Grid
Use an 8pt grid: all margins and paddings should be multiples of 8 (16px, 24px, 32px,
64px, 80px, 120px).
Section padding: minimum 80-100px top/bottom for major sections.
Card internal padding: at least 24px on all sides.
Between section label and headline: 16-24px.
Between headline and body text: 24-32px.
Visual Polish
Button styles: No default HTML buttons. Use padding: 12px 24px , border-radius:
4px , high-contrast colors (deep blue bg, white text or cyan bg, dark text).
Images: Consistent treatment — either border-radius: 8px  on all photos or sharp
edges on all. Use object-fit: cover  so nothing stretches.
Override a:visited  color in press section — no purple visited links on dark
backgrounds.
All stat numbers (100%, 47, 13, 20) should be visually distinct from body text — larger,
bolder, or in the accent color.
Mobile
Stack all multi-column layouts vertically below 768px.
All tap targets (buttons, links) minimum 44px tall.
Test horizontal scroll sections on mobile — these often break.
Hero text should be readable without zooming on a phone screen.
Execution Plan
NEXT 2 HOURS — No-Design Quick Wins
1. Fix survival stat: “<20%” → “~30%”, delete “Only 1 in 5” line (5 min)
2. Remove placeholder images from Solution section (5 min)
3. Fix purple text on Metabolic card → white (5 min)
4. Override visited-link color on press links → cyan (5 min)
5. Delete the “Our Advantages” 6-card section (10 min)
6. Verify and fix grant figure ($1.3M vs $1.6M) (10 min)
7. Bump all body text to 16px minimum (20 min)
8. Make “Non-invasive. No imaging…” line 16-18px, white, with padding (10 min)
9. Delete standalone duplicate sections below accordions (SVG chart, peppercorn section,
timeline, emission text). Keep squiggly line visual only. (30 min)
10. Fix “before a tumor ever forms” → “before it becomes visible to any scan” (5 min)
11. Replace mailto: links with a form (Tally/Typeform) and calendar link (Calendly) (15 min)
Result: Site is 40% shorter, factually accurate, free of credibility risks.
NEXT 2 DAYS — Structural + Precision Overhaul
1. Rewrite Problem section → quote + resolution gap framing + two numbers + visual gap
graphic (2 hours)
2. Rewrite Solution headline → evidence-anchored version (10 min)
3. Redesign How It Works as 3-column grid (Physics / Sensor / AI) + tighten copy with
scientific precision (2 hours)
4. Add trust badge bar below hero (CRC, NVIDIA, Patent, Papers, Forbes) (2 hours)
5. Implement 6-level type hierarchy in CSS + 8pt grid spacing + max-width: 800px  on text
blocks (3 hours)
6. Add section divider lines + increase vertical padding to 80-120px (2 hours)
7. Move Murugan quote to Team section as full-width quote block (1 hour)
8. Convert team bios to “snapshot” format — photo + 2-3 bullet points + expandable “Read
full bio” (2 hours)
9. Fix Brain Health stat badges (First → 2025, 75% → pilot language) (30 min)
10. Reframe “100% detection rate” → “100% sensitivity, in vitro, n=30” with proximate
qualifiers (30 min)
11. Delete post-Team investor deck content (roadmap, business model, regulatory) (30 min)
12. Add 2-3 full-width quote blocks as visual pauses (2 hours)
13. Add amber/gold as second accent color (2 hours)
14. Add sticky “Request Deck” button in top nav that persists on scroll (1 hour)
15. Change section header to “One platform. Multiple validated applications.” (5 min)
Result: A site that reads like a Series A company — precise enough for scientists,
compelling enough for investors, and visually polished enough to beat Picard.
What NOT to Change (Overblown Critiques, Filtered Out)
A few recommendations from the scientific review were too aggressive. Here’s what I’d push
back on and why:
Don’t replace “Your cells emit light. We learned to read it.” The scientific critique
suggested replacing this with “Quantifying ultra-weak photon emissions (UPEs) as a novel
biomarker for metabolic stress.” That reads like a journal abstract, not a homepage. The
tagline is the single most memorable line on the site. Even sophisticated investors respond
to a great hook — you just need the technical substance immediately below it. Keep the
poetry. Add the precision underneath.
Don’t kill the peppercorn metaphor. The critique called it a “kitchen spice finder.” That’s
unfair. The peppercorn/pea comparison is effective science communication — it makes the
5-10M vs 1B cell count tangible for every audience. The issue was never the metaphor itself;
it was that it appeared as a standalone section AND inside an accordion. Consolidate it into
Accordion 04 where the engaged reader will find it. It earns its place there.
Don’t rewrite the hero as a journal abstract. The critique suggested: “Non-Invasive
Metabolic Profiling via Ultra-Weak Photon Emissions” as the hero headline. This would tank
engagement for every audience including scientists. Even researchers don’t want to read a
Methods section as a homepage. “Non-Invasive Cancer Detection” is clear, accurate, and
immediately tells you what the company does. The technical depth lives one scroll below.
Don’t strip ALL emotional framing from the Problem section. The critique implied that
seed investors don’t need emotional hooks. That’s wrong. Seed investors are human beings
making gut-level conviction bets on pre-revenue companies. “Every two minutes, someone
is told they have cancer that could have been caught sooner” is a hook that works on
EVERY audience — it earns the 3 extra seconds of attention that lets your technical framing
land. The fix is to pair the emotional hook with the resolution gap framing, not replace one
with the other.
Don’t remove all data visualizations in favor of pure text. The comparison between
HelioFlux (5-10M cells), Liquid Biopsy (50-100M), and Standard Imaging (1B+) is powerful
as a visual — it just needs to live inside Accordion 04, not as an amateur SVG standalone.
Keep the data, fix the presentation.
The Bottom Line
Your substance is ahead of where your presentation is. Three peer-reviewed papers, tier-1
press, a named hardware/software platform, a Tufts/Harvard science lineage, and a Forbes
Midas List CFO — most seed-stage biotechs have maybe one of those. You have all five.
The site needs two things: scientific precision (fix the stats, tighten the claims, reframe
“100%” as a data readout not a marketing promise) and visual hierarchy (trust badges
above the fold, clear type scale, section dividers, breathing room). Neither requires a
redesign — they require editing.
The 2-hour plan removes every credibility risk. The 2-day plan closes the gap with Picard.
The substance advantage is already yours.

