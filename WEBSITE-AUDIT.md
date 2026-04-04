# HelioFlux Website Audit
**Date:** April 3, 2026  
**Files reviewed:** index.html, science.html, team.html, press.html  
**Scope:** Content flow, repetition, inconsistency, known TODO issues

---

## QUICK SUMMARY — CONFIRMED BUGS

| # | Issue | File(s) | Severity |
|---|-------|---------|----------|
| 1 | Duplicate back-to-back Nirosha quotes | index.html | Medium |
| 2 | "Leadership / Leadership" redundant eyebrow+heading | team.html | Medium |
| 3 | "Scientific Advisory Board / Scientific Advisory Board" same | team.html | Medium |
| 4 | "groundbreaking" banned word in press card | press.html | High |
| 5 | Kelly bio is too thin | team.html | Medium |
| 6 | Footer has "Manhattan Beach, CA" — absent on index.html only | science, team, press | Verify |
| 7 | Jim's title is "CFO" but bio reads like an advisor | team.html | High |
| 8 | No LinkedIn links on any individual team cards | team.html | Low |
| 9 | Grant amount: $1.3M (index.html) vs $1.6M (team.html) | index + team | High |
| 10 | Nirosha's title: "Interim CEO" only on team.html, omitted everywhere else | index + team | Medium |
| 11 | "Deep Dive / Technical deep dive" — NOT FOUND in current code | science.html | Resolved? |

---

## PAGE-BY-PAGE AUDIT

---

### INDEX.HTML

#### Content Flow
Strong. The narrative arc is: Problem (cancer caught late) → Science (cells emit light) → Scan (how it works) → Platform (what it detects) → Nirosha bio → Press → CTA. Logical and investor-facing. No major structural gaps.

#### Repetitions Within Page

**1. Back-to-back Nirosha quotes — CONFIRMED TODO ISSUE**

Two separate Nirosha quote displays appear in sequence with no meaningful content between them:

**Quote A** — in the `nirosha-quote-band` div inside the `#two-systems` section:
> *"These sensors were built to detect faint light from distant stars. We pointed them at the faint light coming off the human body, and built an AI that uses it to read the state of your cells and tell healthy tissue from cancer."*
> — `Dr. Nirosha Murugan, Chief Scientist & Co-Founder`

**Quote B** — immediately after, in the `nirosha-quote-photo` full-bleed overlay:
> *"The goal is not just to tell whether there's cancer in the body. It's to find it at very, very low densities."*
> — `Dr. Nirosha Murugan, Chief Scientist & Co-Founder`

These are not identical quotes but are two consecutive full-width Nirosha quote sections. The second one feels like a repeat beat — same speaker, same visual treatment, back-to-back. One should be cut or moved.

**2. "No blood draw. No biopsy. No radiation." — repeated 3 times on this page alone:**
- Hero subline: `"No blood draw. No biopsy. No radiation. Detects cancer 100-200x earlier than standard imaging."`
- Two-systems section body text: `"No blood draw. No biopsy. No radiation."` (as a standalone bold emphasis line)
- QSense card description: `"Non-invasive, radiation-free…"`

The first two instances are near-verbatim repetition. Consider keeping it in the hero and cutting it from the body text in #two-systems.

#### Inconsistencies

**3. Nirosha grant amount — CONFIRMED cross-page inconsistency**
- index.html (credibility section): `"$1.3M+ in active research grants"`
- team.html: `"Her lab has secured $1.6M in non-dilutive grants"`

Pick one number and use it everywhere.

**4. Nirosha's title — "Interim CEO" appears only on team.html**
- index.html (credibility section & both quote attributions): `"Chief Scientist & Co-Founder"`
- team.html: `"Interim CEO, Chief Scientist & Co-Founder"`

If she is Interim CEO, it should be reflected on the homepage too. If she's not, remove it from team.html.

**5. Footer missing "Manhattan Beach, CA"**
index.html footer only shows:
```
kelly.lucas@helioflux.co
```
While science.html, team.html, and press.html all show:
```
kelly.lucas@helioflux.co
Manhattan Beach, CA
```
Inconsistent footer content. Either add the location to index.html or remove it from the others (pending address verification — see TODO item below).

#### Minor Notes
- The "hero-accent" spans in the `<h1>` tag correctly use `<span>` not `<em>`. Good.
- Footnotes `¹ ²` are present at the bottom of index.html but absent from science.html, where the same claims appear. Consider whether the footnotes need to follow the claims.

---

### SCIENCE.HTML

#### Content Flow
Excellent. Most coherent page on the site. Flow: What it is → How it works → Physics → Detection threshold → Skin pilot → Animal evidence → Deep dive accordions → Published papers → CTA. Tells a complete investor/scientific story.

#### Repetitions Within Page

**6. "No blood draw. No biopsy. No radiation." appears twice:**
- How-it-works text overlay: `"No biopsy. No blood draw. No radiation. No waiting for the lab."` (note different ordering than homepage)
- Patient experience accordion: `"No needles. No contrast agents. No ionizing radiation. No preparation required."`

The second instance is a paraphrase, not a verbatim repeat. Acceptable since it's behind an accordion expand. But the ordering inconsistency is worth noting (see below).

**7. Published research section duplicates press.html — minor**
The three paper cards (92% in vitro, 90% in vivo, 20 human subjects) appear on both science.html and press.html with near-identical presentation. Cross-page repetition is intentional here, but worth being aware of.

#### Inconsistencies

**8. "No blood draw. No biopsy." ordering varies across site:**
- index.html hero: `"No blood draw. No biopsy. No radiation."`
- science.html how-it-works: `"No biopsy. No blood draw. No radiation. No waiting for the lab."`
- science.html patient accordion: `"No needles. No contrast agents. No ionizing radiation."`

The canonical version is clearly `"No blood draw. No biopsy. No radiation."` from the homepage. Science.html swaps the first two items. Should be standardized.

#### Known TODO Issue: "Deep Dive / Technical deep dive"
**NOT FOUND in current code.** The accordion section uses:
```
Eyebrow: "For the Curious"
h2: "Go deeper."
```
No "Deep Dive" or "Technical deep dive" heading exists in the file. This TODO item may already be resolved.

#### Minor Notes
- Meta description says "90-92% accuracy across peer-reviewed studies" — accurate (92% in vitro, 90% in vivo). Consistent with page body.
- The `~20Hz` frequency signature mentioned in The Physics section doesn't appear anywhere else on the site. Good that it's only here (technical depth appropriate for this page).
- Science page `<footer>` has "Manhattan Beach, CA" — see TODO item on footer location.

---

### TEAM.HTML

#### Content Flow
Good overall structure: Nirosha feature → Leadership grid → SAB → CTA. However, there are some structural issues with heading redundancy and thin content.

#### Repetitions Within Page

**9. "Leadership / Leadership" — CONFIRMED TODO ISSUE**

```html
<p class="eyebrow reveal">Leadership</p>
<h2 class="reveal" style="margin-bottom:48px;">Leadership</h2>
```

The eyebrow label and the `<h2>` are **identical**. This looks like a placeholder h2 was never replaced with a real heading. Fix: change the h2 to something meaningful, e.g., `"Building the company."` or `"The founding team."` or simply remove one of the two.

**10. "Scientific Advisory Board / Scientific Advisory Board" — same issue:**

```html
<p class="eyebrow reveal" style="color:#00A9D6;">Scientific Advisory Board</p>
<h2 class="reveal" style="color:#14263C;margin-bottom:48px;">Scientific Advisory Board</h2>
```

Exact same text in both eyebrow and h2. This TODO item wasn't flagged explicitly but follows the same pattern as the Leadership issue. Fix: differentiate the h2, e.g., `"World-class science, close to the work."` or just remove the redundant h2.

#### Inconsistencies

**11. Jim Armstrong's title vs. bio — CONFIRMED TODO ISSUE**

Title field (visible on card): `CFO`  
Bio text: *"Advises HelioFlux on capital strategy, milestone execution, and investor relationships."*

A CFO is an operator, not an advisor. The bio is written entirely in advisor language. His credentials (Forbes Midas List, PayPal investor, March Capital) suggest he's a board-level advisor or board member, not an operational CFO. The title needs to be one of:
- `Advisor & Board Member` (matches the bio language)
- `CFO & Board Member` (if he is genuinely the CFO)
- Remove "CFO" entirely if he's advisory only

This is potentially misleading to investors who expect a CFO to be running financials day-to-day.

**12. Kelly bio is thin — CONFIRMED TODO ISSUE**

Kelly's current bio:
> *"Co-founded HelioFlux after seeing the technology presented at a quantum biology conference. B.A. Biology (UNC Chapel Hill), MBA (Indiana University Kelley School). Former Research Associate at UNC Lineberger Cancer Center. Leads fundraising, investor relations, and go-to-market strategy."*

Compared to Nirosha's full-page feature and even Glenn's 3-sentence bio with specific credits, Kelly's reads like a draft. Missing: any mention of her specific fundraising achievements ($112K raised, StartEngine campaign), her investor network, her science-to-business translation role, or what makes her uniquely suited to commercialize this technology. Should be expanded to at least 5-7 sentences.

**13. Nirosha's grant amount — $1.6M here vs. $1.3M on homepage**
(Same issue as #3 above — noting here for team.html context.)

team.html: `"Her lab has secured $1.6M in non-dilutive grants"`  
index.html: `"$1.3M+ in active research grants"`

One of these is wrong.

**14. Glenn Lucas title inconsistency (website vs. internal notes)**

team.html: `"Chief Strategy Officer"`  
USER.md reference: `"Glenn Lucas - Interim CMO"`

If his actual role is "Interim CMO," the website should reflect that. A CSO and a CMO are different roles. If his title has changed, needs updating.

**15. No LinkedIn links on team cards — CONFIRMED TODO ISSUE**

None of the six team cards (Kelly, Jim, Glenn, Levin, Kaplan, Rouleau) include individual LinkedIn profile links. Footer has a company LinkedIn link only. For an investor-facing site, individual LinkedIn links are expected on team members. Should add `<a href="[linkedin_url]">LinkedIn ↗</a>` to each card.

**16. Footer "Manhattan Beach, CA" — present, needs verification**
```
kelly.lucas@helioflux.co
Manhattan Beach, CA
```
USER.md says Kelly is in Los Angeles (staying with parents). Whether the company's registered address is Manhattan Beach, CA needs confirmation. If it's not the legal address, it shouldn't be on the website.

---

### PRESS.HTML

#### Content Flow
Clean and functional. Structure: Header → Media Coverage (4 cards) → Published Papers (3 cards) → CTA. No flow issues.

#### Repetitions

**17. Published papers duplicated from science.html**
The three paper cards are essentially identical to those on science.html (same stats, same journal info, same links). The only difference is the visual style (dark bg on press.html, cream bg on science.html). This is intentional cross-linking, not a bug, but worth noting — keep them in sync if paper info changes.

**18. NVIDIA Inception Program mentioned twice across site**
- press.html header: `"NVIDIA Inception Program Member"` (as a cyan uppercase line)
- index.html press strip: `"NVIDIA Inception Program Member"` (same treatment)

Fine on separate pages but is redundant within a single investor session. Not a bug.

#### Known TODO Issue: "Groundbreaking" — CONFIRMED

**19. Press card for Scientific American:**
```html
<h3 class="press-headline">Biophoton research highlighted as potentially groundbreaking</h3>
```

"Groundbreaking" is a banned word — generic importance language that says nothing specific. Replace with something concrete, e.g.:
- `"Biophoton cancer detection research featured as a new frontier in early diagnosis"`
- Or quote from the actual article if available

Note: The qualifier "potentially" before "groundbreaking" doesn't redeem the banned word.

**20. No actual article headline used**
The SciAm headline `"Biophoton research highlighted as potentially groundbreaking"` doesn't appear to be the actual article headline (which is "Your brain is glowing and scientists can't figure out why" based on the href URL). The press card should use the actual article title, not a paraphrase.

#### Minor Notes
- The LA Business Journal `href` links to `https://labusinessjournal.com` (just the homepage) rather than a specific article. Should link to the actual article or add a note if it's paywalled.
- NPR Radiolab URL `https://radiolab.org/podcast/the-spark-of-life` — this is worth verifying it resolves to a live page.
- The footer has "Manhattan Beach, CA" — same as science.html and team.html.

---

## CROSS-PAGE CONSISTENCY ISSUES

### Stats & Numbers

| Claim | index.html | science.html | team.html | press.html |
|-------|-----------|-------------|---------|-----------|
| Detection threshold | "100-200x earlier" | "5-10M cells vs 1B+" | — | — |
| Grant amount | "$1.3M+" | — | "$1.6M" | — |
| Accuracy | (not cited) | "90-92%" (meta desc) | — | "90%" / "92%" |
| Papers | "Three peer-reviewed papers" (CTA) | 3 papers listed | — | 3 papers listed |
| Animal models | "47 living subjects" (carousel) | "47 live animal models" | — | "47 animal models" |
| Brain study subjects | "20 living subjects" | "20 living human subjects" | — | "20" |

**Action needed:** Fix $1.3M vs $1.6M discrepancy.

### Taglines & Phrases

| Phrase | index.html | science.html | team.html | press.html |
|--------|-----------|-------------|---------|-----------|
| "Your cells emit light. We learned to read it." | Hero h1 + footer | Footer only | Footer only | Footer only |
| "No blood draw. No biopsy. No radiation." | Hero + #two-systems | How-it-works (reordered) | — | — |
| "15 minutes" scan time | QSense card | How it works, accordion | — | — |
| "NVIDIA Inception Program Member" | Press strip | — | — | Header |

### Nirosha's Title

| Location | Title Used |
|----------|-----------|
| index.html — credibility bio | "Chief Scientist & Co-Founder" |
| index.html — both quote attributions | "Chief Scientist & Co-Founder" |
| team.html — featured bio | "Interim CEO, Chief Scientist & Co-Founder" |
| science.html — no title mention | — |

**Action needed:** Decide if she is Interim CEO or not, and make all pages consistent.

### Footer Location

| Page | Footer Location |
|------|----------------|
| index.html | *(absent)* |
| science.html | "Manhattan Beach, CA" |
| team.html | "Manhattan Beach, CA" |
| press.html | "Manhattan Beach, CA" |

**Action needed:** Either add location to index.html footer or verify address correctness. Index.html is the odd one out.

---

## PRIORITIZED FIX LIST

### 🔴 Fix Immediately (investor-facing accuracy issues)

1. **Grant amount**: Standardize to one number across all pages. Confirm with Nirosha: $1.3M or $1.6M?
2. **Jim's title**: Change "CFO" to "Advisor & Board Member" (or whichever is accurate) — calling an advisor a CFO is a credibility risk with investors.
3. **"Groundbreaking"** on press.html Scientific American card — replace with the actual article headline or a concrete paraphrase.

### 🟡 Fix Soon (UX / clarity issues)

4. **Duplicate Nirosha quotes** on homepage — remove or reposition one of the two back-to-back Nirosha quote sections.
5. **"Leadership / Leadership"** heading on team.html — write a real h2.
6. **"Scientific Advisory Board / Scientific Advisory Board"** heading on team.html — write a real h2.
7. **Nirosha's "Interim CEO" title** — make consistent across all pages.
8. **Kelly bio** on team.html — expand to 5-7 sentences; add fundraising context.
9. **"No blood draw" ordering** — standardize to `"No blood draw. No biopsy. No radiation."` everywhere.

### 🟢 Fix When Possible (polish)

10. **LinkedIn links** on individual team cards — add profile URLs for all 6 team members.
11. **Footer location** — add "Manhattan Beach, CA" to index.html footer if verified, or confirm with Kelly that the address is correct.
12. **LA Business Journal link** — update to direct article URL.
13. **Glenn's title** — reconcile "Chief Strategy Officer" (website) vs "Interim CMO" (internal).
14. **SciAm article headline** — replace paraphrase with actual article title from the linked URL.
15. **"No blood draw"** repetition on homepage — cut the standalone line in #two-systems section since it already appears in the hero.

---

## NOT-AN-ISSUE (reviewed, no action needed)

- Detection threshold math: "100-200x" claim on homepage is consistent with "5-10M vs 1B cells" on science page. ✅
- Three published papers are intentionally on both science.html and press.html (different audiences). ✅
- NVIDIA mention on both pages is fine (different pages, different audiences). ✅
- Animal model count "47" is consistent across index and science pages. ✅
- "Deep Dive / Technical deep dive" duplicate heading flagged in TODO — **not present in current science.html**. Eyebrow is "For the Curious" and h2 is "Go deeper." Either already fixed or the TODO referred to an older version. ✅ (Resolved)
