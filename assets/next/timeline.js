/* Research timeline behavior: overview chart, views, filters, search, reading rail, figure viewer.
   Without JavaScript the page shows the key moments, and the other milestones open from their folds. */
(() => {
  'use strict';
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const INDEX = window.TIMELINE_INDEX || [];
  const byId = Object.fromEntries(INDEX.map((m) => [m.id, m]));
  const articles = $$('.milestone');
  const eras = $$('.era');
  const content = $('.tl-content');
  const state = { view: 'key', filter: 'all', q: '' };
  // Key moments view: each run of other milestones sits in a fold (<details class="tl-more">) between the key ones,
  // so the page opens on the key moments and every other milestone is one tap away. The folds and the view are in the
  // HTML, so nothing moves when this script runs. Every milestone, a filter or a search opens every fold and hides
  // its button; going back to Key moments restores the folds the reader had open.
  const runs = $$('.tl-more');
  let folded = true;
  const onScreen = (a) => !a.hidden && !a.closest('.tl-more:not([open])');
  // Folds opened only for printing (the milestone runs and the primer); null when not printing.
  let printKeep = null;
  const printFolds = [...runs, ...$$('.primer-more')];
  // Every other fold on the page: each entry's "What the study shows", the primer, the Sources lists and "How to read
  // this history" (the top bar's menu is left out).
  const panels = $$('details').filter((d) => !d.classList.contains('tl-more') && !d.closest('.site-nav'));
  // Back, Forward and reload bring the reader back to the same view and the same open folds (kept in this page's own
  // history entry), so the browser returns them to the milestone they left. Without it the page came back with every
  // fold closed, and the old scroll offset landed on a different milestone in a different era. Every in-page jump (an
  // era link, a chart dot, an arrival from the Science page) makes or changes an entry, so each one is written too.
  const remember = () => {
    if (printKeep) return;
    const was = history.state && history.state.tl;
    // k names the entry, so the reader's place on it can be found again (marks, below).
    const k = (was && typeof was.k === 'string' && was.k) || Math.random().toString(36).slice(2, 10);
    const tl = { view: state.view, filter: state.filter, q: state.q, keep: runs.map((r) => (folded ? r.open : r.dataset.keep === 'true')), open: panels.flatMap((d, i) => (d.open ? [i] : [])), k };
    if (was && JSON.stringify(was) === JSON.stringify(tl)) return;
    try { history.replaceState(Object.assign({}, history.state, { tl }), ''); } catch (error) { /* history unavailable: nothing to remember */ }
  };
  // The reader's place on each entry of this page: the first milestone still on screen and how far from the top it
  // sat (or the scroll offset, above or below the milestones). Kept in memory as the reader scrolls; used by Back and
  // Forward inside the page (below). Chrome goes to the link in the address when the reader comes back to an entry
  // that has one, so a deep link to Allen 1972, reading on to Popp 1984, an era jump and Back landed on Allen, not Popp.
  const marks = {};
  const mark = () => {
    const k = history.state && history.state.tl && history.state.tl.k;
    if (!k) return;
    const a = articles.find((x) => onScreen(x) && x.getBoundingClientRect().bottom > 0);
    marks[k] = a ? { id: a.id, top: a.getBoundingClientRect().top, y: scrollY } : { y: scrollY };
  };
  const putBack = (m) => {
    const a = m.id ? document.getElementById(m.id) : null;
    const y = a && onScreen(a) ? scrollY + a.getBoundingClientRect().top - m.top : m.y;
    if (Math.abs(y - scrollY) < 1) return;
    // Instant even though the stylesheet asks for smooth scrolling (through the CSSOM, which the security policy allows).
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    scrollTo(0, y);
    root.style.scrollBehavior = '';
    if (!root.getAttribute('style')) root.removeAttribute('style');
  };
  // Image sizes follow the view. The page's HTML describes Key moments: each drawing at 152px on phones and at most
  // 330px beside the words; each paper figure as a 112px copy on phones. Every milestone (and printing) shows them at
  // full width. Changing the sizes makes the browser pick the matching file again.
  const SIZES = {
    plate: ['(max-width: 720px) 152px, (max-width: 1000px) 32vw, 330px', '(max-width: 640px) 83vw, (max-width: 1000px) 76vw, 630px'],
    paper: ['(max-width: 720px) 112px, 760px', '(max-width: 720px) 90vw, 760px'],
  };
  const sized = [...$$('.milestone .plate-img').map((img) => [img, SIZES.plate]), ...$$('.milestone figure[data-kind="paper"] .figure-button img[srcset]').map((img) => [img, SIZES.paper])];
  let briefSizes = true;
  const setSizes = (brief) => {
    if (brief === briefSizes) return;
    briefSizes = brief;
    sized.forEach(([img, s]) => { img.sizes = s[brief ? 0 : 1]; });
  };

  // ---------- Views, filters, search ----------
  const matches = (a) => {
    const f = state.filter;
    const kind = f === 'all' || (f === 'nirosha' && a.dataset.nirosha === 'true') || (f === 'human' && a.dataset.human === 'true') || (f === 'figures' && a.dataset.figure === 'true');
    if (!kind) return false;
    if (!state.q) return true;
    const hay = (a.dataset.search || '') + ' ' + (a.dataset.year || '') + ' ' + a.textContent.toLowerCase();
    return state.q.split(/\s+/).every((w) => hay.includes(w));
  };
  const result = $('#result-count');
  const empty = $('#tl-empty');
  const updateEraControls = () => {
    const narrowed = state.filter !== 'all' || !!state.q;
    eras.forEach((e) => {
      const all = $$('.milestone', e);
      const groups = $$('.tl-more', e);
      const hidden = folded ? groups.filter((r) => !r.open).reduce((n, r) => n + $$('.milestone', r).length, 0) : 0;
      const matched = all.filter((a) => !a.hidden).length;
      const count = $('.era-count', e);
      if (count) count.textContent = narrowed
        ? `${matched} of ${all.length} studies match` : hidden
          ? `${all.length - hidden} of ${all.length} studies shown · ${hidden} hidden`
          : `All ${all.length} studies shown`;
      const button = $('.era-expand', e);
      if (button) {
        button.hidden = narrowed || !folded || !groups.length;
        button.textContent = hidden
          ? `Show ${hidden} more ${hidden === 1 ? 'study' : 'studies'} from this period`
          : 'Collapse to highlights from this period';
        button.setAttribute('aria-expanded', String(hidden === 0));
        groups.forEach((r, i) => { if (!r.id) r.id = `era-${e.dataset.era}-more-${i + 1}`; });
        button.setAttribute('aria-controls', groups.map((r) => r.id).join(' '));
      }
      groups.forEach((r) => {
        const label = $('summary > span', r);
        const n = $$('.milestone', r).length;
        if (label && label.firstChild?.nodeType === Node.TEXT_NODE) {
          label.firstChild.nodeValue = `${r.open ? 'Hide' : 'Show'} ${n} ${n === 1 ? 'study' : 'studies'}${r.open ? '' : ' from this period'}, `;
        }
      });
    });
  };
  const apply = () => {
    const narrowed = state.filter !== 'all' || state.q;
    const fold = state.view === 'key' && !narrowed;
    if (fold !== folded) {
      runs.forEach((r) => { if (fold) r.open = r.dataset.keep === 'true'; else { r.dataset.keep = String(r.open); r.open = true; } });
      folded = fold;
    }
    content.classList.toggle('view-key', fold);
    // Key moments shows each entry in brief (words with the drawing beside them; its reading key moves into "What the
    // study shows" and the enlarged view). Every milestone shows each entry in full.
    content.classList.toggle('is-brief', state.view === 'key');
    setSizes(state.view === 'key');
    let shown = 0;
    articles.forEach((a) => { const ok = matches(a); a.hidden = !ok; if (ok) shown++; });
    eras.forEach((e) => {
      const all = $$('.milestone', e), n = all.filter((a) => !a.hidden).length;
      e.hidden = n === 0;
    });
    updateEraControls();
    empty.hidden = shown > 0;
    const keyCount = articles.filter((a) => a.dataset.key === 'true').length;
    let line;
    if (!narrowed) {
      line = state.view === 'key'
        ? `Showing ${keyCount} highlights. ${articles.length - keyCount} more studies are available within the periods below.`
        : `Showing all ${articles.length} studies in full.`;
    } else {
      const label = { nirosha: 'Dr. Murugan’s papers', human: 'Human research', figures: 'Milestones with original research figures', all: 'All milestones' }[state.filter];
      line = `${label}${state.q ? ` matching “${state.q}”` : ''}: ${shown} of ${articles.length}.`;
    }
    // The page loads with this line already written, so the live region is not rewritten (or announced) at start.
    if (result.textContent !== line) result.textContent = line;
    $$('.view-switch button').forEach((b) => b.setAttribute('aria-pressed', String(!narrowed && b.dataset.view === state.view)));
    $('[data-view="key"] .view-label').textContent = state.view === 'key' && !narrowed ? 'Highlights' : 'Collapse to highlights';
    $('[data-view="all"] .view-label').textContent = state.view === 'all' && !narrowed ? 'Everything shown' : 'Show everything';
    $$('.filter-chips button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === state.filter)));
    requestAnimationFrame(updateRail);
    remember();
  };
  $$('.view-switch button').forEach((b) => b.addEventListener('click', () => {
    state.view = b.dataset.view;
    state.filter = 'all'; state.q = ''; $('#search').value = '';
    apply();
  }));
  $$('.era-expand').forEach((b) => b.addEventListener('click', () => {
    const groups = $$('.tl-more', b.closest('.era'));
    const show = groups.some((r) => !r.open);
    groups.forEach((r) => { r.open = show; });
    updateEraControls();
    remember();
  }));
  $$('.filter-chips button').forEach((b) => b.addEventListener('click', () => { state.filter = b.dataset.filter; apply(); }));
  const search = $('#search');
  let timer = 0;
  search.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = search.value.trim().toLowerCase(); apply(); }, 120); });
  $('#clear-filters').addEventListener('click', () => { state.filter = 'all'; state.q = ''; search.value = ''; apply(); search.focus(); });
  const showNirosha = (e) => { if (e) e.preventDefault(); state.filter = 'nirosha'; apply(); $('#tools').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' }); };
  $('#curator-filter')?.addEventListener('click', showNirosha);
  $('#view-nirosha')?.addEventListener('click', showNirosha);

  // A milestone folded in Key moments opens with its fold (a chart dot, a deep link, Back or Forward).
  const reveal = (id, focus = true) => {
    const a = document.getElementById(id);
    if (!a || !a.classList.contains('milestone')) return;
    if (a.hidden) { state.filter = 'all'; state.q = ''; search.value = ''; apply(); }
    const run = a.closest('.tl-more');
    if (run && !run.open) run.open = true;
    a.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    if (focus) { const h = $('h3', a); h && h.focus({ preventScroll: true }); }
  };

  // ---------- The century at a glance ----------
  const glance = $('#glance');
  const tip = document.createElement('div'); tip.className = 'glance-tip'; tip.setAttribute('aria-hidden', 'true'); document.body.appendChild(tip);
  const drawGlance = () => {
    if (!glance || !INDEX.length) return;
    const NS = 'http://www.w3.org/2000/svg';
    const W = 1240, H = 170, x0 = 10, x1 = W - 10, Y0 = 1920, Y1 = 2028, axisY = 104;
    // Recent decades hold most of the milestones, so the scale widens after 1990 (marked on the axis).
    const SPLIT = 1990, SHARE = .42;
    const X = (y) => y <= SPLIT ? x0 + (y - Y0) / (SPLIT - Y0) * SHARE * (x1 - x0) : x0 + SHARE * (x1 - x0) + (y - SPLIT) / (Y1 - SPLIT) * (1 - SHARE) * (x1 - x0);
    const eraSpans = eras.map((e) => {
      const ys = INDEX.filter((m) => m.era === e.dataset.era).map((m) => m.year);
      const name = $('.era-name', e).textContent;
      const years = $('.era-years', e).textContent;
      const [a, b] = years.split(/[–-]/).map(Number);
      return { id: e.dataset.era, name, years, from: a || Math.min(...ys), to: (b || Math.max(...ys)) + 1 };
    });
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="The century at a glance. Select a year to jump to it.">`;
    eraSpans.forEach((s, i) => {
      const a = X(Math.max(s.from, Y0)), b = X(Math.min(s.to, Y1));
      svg += `<rect class="era-band${i % 2 ? ' alt' : ''}" data-era="${s.id}" x="${a}" y="0" width="${b - a}" height="${axisY}"/>`;
      // Narrow bands near the right edge carry their label right-aligned so it never spills past the chart.
      const tail = i === eraSpans.length - 1 && (b - a) < 150;
      const tx = tail ? b - 8 : a + 8, anchor = tail ? ' text-anchor="end"' : '';
      svg += `<text class="era-label" x="${tx}" y="20"${anchor}>${s.name}</text><text class="era-years" x="${tx}" y="36"${anchor}>${s.years}</text>`;
    });
    svg += `<line class="axis" x1="${x0}" y1="${axisY}" x2="${x1}" y2="${axisY}"/>`;
    // A decade label steps aside when a milestone stem would strike through it (the 2009 stem sits on "2010").
    const stems = INDEX.filter((m) => m.key || m.nirosha).map((m) => X(m.year + .5));
    [1920, 1940, 1960, 1980, 2000, 2010].forEach((d) => {
      const dx = X(d);
      const hit = stems.filter((s) => Math.abs(s - dx) < 16).sort((a, b) => Math.abs(a - dx) - Math.abs(b - dx))[0];
      const at = hit === undefined ? `class="decade" x="${dx}"` : hit <= dx ? `class="decade start" x="${hit + 5}"` : `class="decade end" x="${hit - 5}"`;
      svg += `<text ${at} y="${axisY + 22}">${d}</text>`;
    });
    const bx = X(SPLIT); svg += `<g class="axis-break"><rect x="${bx - 5}" y="${axisY - 6}" width="10" height="12" fill="#F7F6F2"/><line x1="${bx - 6}" y1="${axisY + 6}" x2="${bx - 1}" y2="${axisY - 6}"/><line x1="${bx + 1}" y1="${axisY + 6}" x2="${bx + 6}" y2="${axisY - 6}"/></g>`;
    // Stack same-year milestones
    const seen = {};
    const labelRows = [];
    INDEX.forEach((m) => {
      const n = (seen[m.year] = (seen[m.year] || 0) + 1) - 1;
      const x = X(m.year + .5);
      const y = axisY - 12 - n * 15;
      if (m.key || m.nirosha) {
        const r = m.key ? 6 : 5;
        // label rows alternate to avoid collisions
        let row = 0; while (labelRows.some((l) => l.row === row && Math.abs(l.x - x) < 34)) row++;
        labelRows.push({ x, row });
        const ly = axisY + 40 + row * 15;
        svg += `<a href="#${m.id}" data-id="${m.id}" aria-label="${m.label}: ${m.title.replace(/"/g, '&quot;')}"><line class="stem" x1="${x}" y1="${y + r}" x2="${x}" y2="${ly - 11}"/><circle class="dot${m.nirosha ? ' mur' : ''}" cx="${x}" cy="${y}" r="${r}"/><text class="dot-label" x="${x}" y="${ly}">${m.label}</text></a>`;
      } else {
        svg += `<a href="#${m.id}" data-id="${m.id}" aria-label="${m.label}: ${m.title.replace(/"/g, '&quot;')}"><line class="tick" x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 6}"/><rect x="${x - 12}" y="${y - 14}" width="24" height="28" fill="transparent"/></a>`;
      }
    });
    svg += `</svg>`;
    glance.innerHTML = svg;
    document.body.classList.add('has-chart');
    $$('a', glance).forEach((a) => {
      const m = byId[a.dataset.id];
      const show = (ev) => {
        tip.innerHTML = `<b>${m.label}${m.nirosha ? ' · Dr. Murugan' : ''}</b>${m.title}`;
        const r = (ev && ev.clientX) ? { x: ev.clientX, y: ev.clientY } : (() => { const b = a.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top }; })();
        tip.style.left = Math.min(innerWidth - 280, Math.max(12, r.x - 120)) + 'px';
        tip.style.top = (r.y - 74) + 'px';
        tip.classList.add('is-on');
      };
      const hide = () => tip.classList.remove('is-on');
      a.addEventListener('mouseenter', show); a.addEventListener('mousemove', show); a.addEventListener('mouseleave', hide);
      a.addEventListener('focus', () => show()); a.addEventListener('blur', hide);
      // The address takes the milestone's link; the view and folds this entry remembers are kept with it.
      a.addEventListener('click', (e) => { e.preventDefault(); hide(); history.replaceState(history.state, '', '#' + m.id); reveal(m.id); remember(); });
    });
  };
  drawGlance();

  // ---------- Reading rail ----------
  const railYear = $('#rail-year');
  const railLinks = $$('.rail-links a');
  const mbar = $('#tl-mobilebar'), mbEra = $('#mb-era'), mbYear = $('#mb-year'), mbJump = $('#mb-jump'), mbSheet = $('#mb-sheet');
  let lastYear = '';
  function updateRail() {
    const line = innerHeight * .33;
    let current = null;
    for (const a of articles) { if (!onScreen(a)) continue; const r = a.getBoundingClientRect(); if (r.top <= line) current = a; else break; }
    const first = articles.find(onScreen);
    current = current || first;
    if (!current) return;
    // After an era jump the era's heading sits above the reading line while its first entry is still below it, so the
    // last entry above the line belongs to the era before. Name the era being read, and its first year.
    let readingEra = null;
    for (const e of eras) { if (e.hidden) continue; if (e.getBoundingClientRect().top <= line) readingEra = e; else break; }
    if (readingEra && readingEra.dataset.era !== current.dataset.era) current = $$('.milestone', readingEra).find(onScreen) || current;
    const year = current.dataset.year;
    if (year !== lastYear && railYear) {
      railYear.textContent = year; lastYear = year;
      if (!reduce.matches) { railYear.classList.remove('tick'); void railYear.offsetWidth; railYear.classList.add('tick'); }
    }
    const eraId = current.dataset.era;
    railLinks.forEach((l) => {
      const e = document.getElementById('era-' + l.dataset.eraLink);
      const r = e.getBoundingClientRect();
      const p = e.hidden ? 0 : Math.max(0, Math.min(1, (line - r.top) / Math.max(1, r.height)));
      l.querySelector('.rail-progress b').style.setProperty('--p', p.toFixed(3));
      l.classList.toggle('is-current', l.dataset.eraLink === eraId);
      l.classList.toggle('is-done', p >= 1);
    });
    $$('.era-band', glance).forEach((b) => b.classList.toggle('is-current', b.dataset.era === eraId && content.getBoundingClientRect().top < line));
    if (mbar) {
      const inside = content.getBoundingClientRect().top < line && content.getBoundingClientRect().bottom > innerHeight * .5;
      mbar.classList.toggle('is-on', inside);
      mbar.setAttribute('aria-hidden', String(!inside));
      mbEra.textContent = $('.era-name', document.getElementById('era-' + eraId)).textContent;
      mbYear.textContent = year;
      if (!inside && !mbSheet.hidden) { mbSheet.hidden = true; mbJump.setAttribute('aria-expanded', 'false'); }
    }
  }
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; updateRail(); mark(); }); } }, { passive: true });
  addEventListener('resize', updateRail);
  runs.forEach((r) => r.addEventListener('toggle', () => { updateEraControls(); requestAnimationFrame(updateRail); remember(); }));
  panels.forEach((d) => d.addEventListener('toggle', remember));
  // Printing shows every milestone and the whole primer, as it did before the folds; the folds the reader had open
  // come back afterwards.
  // Printing shows each entry in full too, with its reading key, as Every milestone does.
  addEventListener('beforeprint', () => { if (!printKeep) printKeep = printFolds.map((r) => r.open); printFolds.forEach((r) => { r.open = true; }); content.classList.remove('is-brief'); setSizes(false); });
  addEventListener('afterprint', () => { if (printKeep) printFolds.forEach((r, i) => { r.open = printKeep[i]; }); printKeep = null; content.classList.toggle('is-brief', state.view === 'key'); setSizes(state.view === 'key'); remember(); });
  mbJump?.addEventListener('click', () => { const open = mbSheet.hidden; mbSheet.hidden = !open; mbJump.setAttribute('aria-expanded', String(open)); });
  mbSheet?.addEventListener('click', (e) => { if (e.target.closest('a')) { mbSheet.hidden = true; mbJump.setAttribute('aria-expanded', 'false'); } });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && mbSheet && !mbSheet.hidden) { mbSheet.hidden = true; mbJump.setAttribute('aria-expanded', 'false'); mbJump.focus(); } });
  // A tap on the page outside the open Eras sheet closes it, and only closes it: the same tap does not also open a
  // drawing or follow a link under the finger.
  let dismissedAt = -1;
  addEventListener('pointerdown', (e) => {
    if (mbSheet && !mbSheet.hidden && !e.target.closest('#mb-sheet, #mb-jump')) { mbSheet.hidden = true; mbJump.setAttribute('aria-expanded', 'false'); dismissedAt = e.timeStamp; }
  }, { passive: true });
  addEventListener('click', (e) => {
    if (dismissedAt >= 0 && e.timeStamp - dismissedAt < 700) { e.preventDefault(); e.stopPropagation(); }
    dismissedAt = -1;
  }, true);

  // ---------- Figure viewer ----------
  const dialog = $('#figure-dialog');
  const dImg = $('#dialog-image'), dVec = $('#dialog-vector'), dCap = $('#dialog-caption'), dTitle = $('#dialog-title');
  const dZoom = $('#dialog-zoom'), dClose = $('#dialog-close'), dContent = $('.dialog-content', dialog);
  let returnTo = null;
  $$('.figure-button').forEach((btn) => btn.addEventListener('click', () => {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    returnTo = btn;
    const fig = btn.closest('figure');
    dTitle.textContent = btn.dataset.title || 'Scientific figure';
    // A drawing is a lazy plate image with its labels on top (.plate-stack); a paper figure is a single image.
    const stack = $('.plate-stack', btn), img = stack ? null : $('img', btn), svg = $('svg', btn);
    dVec.innerHTML = '';
    // The web copy (its src), not the small copy a phone shows in Key moments.
    if (img) { dImg.hidden = false; dImg.src = img.src; dImg.alt = img.alt; dImg.dataset.full = img.dataset.full || ''; dVec.hidden = true; }
    else if (stack || svg) {
      dImg.hidden = true; dImg.removeAttribute('src'); dImg.dataset.full = '';
      const clone = (stack || svg).cloneNode(true);
      const cSvg = clone.matches('svg') ? clone : $('svg', clone);
      if (cSvg) { cSvg.removeAttribute('aria-labelledby'); cSvg.setAttribute('aria-label', btn.dataset.title || ''); }
      $$('[id]', clone).forEach((el) => el.removeAttribute('id'));
      const plate = $('.plate-img', clone);
      if (plate) { plate.loading = 'eager'; plate.sizes = '(max-width: 1320px) 80vw, 1060px'; }
      dVec.appendChild(clone); dVec.hidden = false;
    }
    // The enlarged view carries the drawing's or figure's reading key above its caption: in Key moments the key is
    // not shown under the small drawing.
    const cap = $('figcaption', fig), key = $('.linework-reading, .figure-reading-key', fig);
    dCap.replaceChildren();
    if (key) dCap.appendChild(key.cloneNode(true));
    if (cap) { const c = document.createElement('div'); c.className = 'dialog-note'; cap.childNodes.forEach((n) => c.appendChild(n.cloneNode(true))); dCap.appendChild(c); }
    dContent.classList.remove('is-zoomed'); dZoom.textContent = 'Zoom in';
    dialog.showModal();
  }));
  dZoom?.addEventListener('click', () => {
    const on = !dContent.classList.contains('is-zoomed');
    dContent.classList.toggle('is-zoomed', on); dZoom.textContent = on ? 'Zoom out' : 'Zoom in';
    // The page shows a web-sized copy of each paper figure; zooming in loads the full-resolution original.
    if (on && !dImg.hidden && dImg.dataset.full && dImg.getAttribute('src') !== dImg.dataset.full) dImg.src = dImg.dataset.full;
  });
  dClose?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog?.addEventListener('close', () => { returnTo && returnTo.focus(); });

  // ---------- Paper figures keep their size while they load ----------
  // A paper figure is a lazy image with no size until it arrives, so one loading above a jump target pushed the
  // target down (a jump to 2025 landed on the 2020 charts, about 1,500px short). Each now gets its final box at once:
  // its width and height attributes give the shape, and the stylesheet caps the height at 620px.
  $$('figure[data-kind="paper"] .figure-button img').forEach((img) => {
    const w = +img.getAttribute('width'), h = +img.getAttribute('height');
    if (w > 0 && h > 0) img.style.width = `min(100%, ${Math.floor(620 * w / h)}px)`;
  });

  // ---------- In-page links ----------
  // A jump to an era that a filter or search has hidden brings the whole record back first (as a chart dot does), and
  // a jump to a closed panel ("How to read the evidence"), or to anything inside a closed panel or fold (a milestone
  // folded in Key moments, a source in the closed Sources list), opens it. Returns true when the target had been hidden.
  const prepare = (id) => {
    const t = id ? document.getElementById(id) : null;
    if (!t) return false;
    for (let el = t; el; el = el.parentElement) if (el.matches('details') && !el.open) el.open = true;
    if (t.matches('.era') && t.hidden) { state.filter = 'all'; state.q = ''; search.value = ''; apply(); return true; }
    return false;
  };
  // Runs before the browser follows the link, so the target is already visible (or open) when the page scrolls to it.
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (a && !e.defaultPrevented) prepare(a.getAttribute('href').slice(1));
  });

  // ---------- Start ----------
  // Put back the view and folds this history entry remembers (Back, Forward, reload) before the first layout, so the
  // browser's own scroll restoration finds the milestone the reader left. Coming back that way does not jump to the
  // link in the address (an era, a chart dot, an arrival from the Science page): the reader may have read on from it,
  // and landing on it again lost their place. A deep link on a new visit still opens and lands on its target below.
  const saved = history.state && history.state.tl;
  let navType = 'navigate';
  try { const n = performance.getEntriesByType('navigation')[0]; if (n) navType = n.type; } catch (error) { /* older browser: a new visit */ }
  const returning = !!saved && (navType === 'back_forward' || navType === 'reload');
  if (saved) {
    if (saved.view === 'key' || saved.view === 'all') state.view = saved.view;
    if (['all', 'nirosha', 'human', 'figures'].includes(saved.filter)) state.filter = saved.filter;
    if (typeof saved.q === 'string') { state.q = saved.q; search.value = saved.q; }
    if (Array.isArray(saved.keep)) runs.forEach((r, i) => { r.open = !!saved.keep[i]; });
    if (Array.isArray(saved.open)) panels.forEach((d, i) => { const open = saved.open.includes(i); if (d.open !== open) d.open = open; });
  }
  apply();
  if (returning && location.hash) {
    // The browser still runs its own jump to the link in the address while the page loads. With the stylesheet's
    // smooth scrolling that jump became a glide that carried on after the browser had put the reader back, and ended
    // on the link (motion on only). Scrolling is instant until the page has loaded, so the reader's place wins.
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    const done = () => requestAnimationFrame(() => { root.style.scrollBehavior = ''; if (!root.getAttribute('style')) root.removeAttribute('style'); });
    if (document.readyState === 'complete') done(); else addEventListener('load', done, { once: true });
  }
  const startId = location.hash.slice(1), startEl = startId && !returning ? document.getElementById(startId) : null;
  if (startEl) {
    prepare(startId);
    // Web fonts that arrive after a deep link reflow the text above the target and push it down (about 270px on a slow
    // phone connection). Until the page and its fonts have loaded, each change in the page's height lands on the target
    // again, in the same frame the change is drawn, unless the reader has started to move around the page. The
    // correction is instant, so the heading never visibly moves; only a smooth jump still under way is steered instead.
    let moved = false, gliding = false, quiet = 0;
    const stop = () => { moved = true; };
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach((t) => addEventListener(t, stop, { passive: true, once: true }));
    // The smooth jump to the entry counts as under way until the page has not scrolled for 150ms.
    const glide = () => { clearTimeout(quiet); quiet = setTimeout(() => { gliding = false; }, 150); };
    addEventListener('scroll', () => { if (gliding) glide(); }, { passive: true });
    if (startEl.classList.contains('milestone')) setTimeout(() => { reveal(startId, false); if (!reduce.matches) { gliding = true; glide(); } }, 60);
    const land = () => {
      if (moved || location.hash.slice(1) !== startId || startEl.hidden) return;
      if (gliding) { startEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      // Instant even though the stylesheet asks for smooth scrolling (set through the CSSOM, which the security policy allows).
      const root = document.documentElement;
      root.style.scrollBehavior = 'auto';
      startEl.scrollIntoView({ block: 'start' });
      root.style.scrollBehavior = '';
      if (!root.getAttribute('style')) root.removeAttribute('style');
    };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(land) : null;
    if (ro) ro.observe(document.body);
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((r) => addEventListener('load', r, { once: true }));
    loaded.then(() => document.fonts && document.fonts.ready).then(() => { land(); setTimeout(() => ro && ro.disconnect(), 500); });
  }
  // Back and Forward inside the page: the entry now current carries the view and folds as they are. An entry this page
  // already wrote (it carries the view and folds) is one the reader has been on before: they go back to their place on
  // it, before the next frame is drawn, and the hash change that follows does not jump to its link again. A new link
  // still lands on its target, and an era that a filter now hides still brings the whole record back (10f, J2).
  let traversal = null;
  addEventListener('popstate', (e) => {
    const tl = e.state && e.state.tl;
    traversal = tl ? { hash: location.hash, at: e.timeStamp } : null;
    const m = tl && tl.k ? marks[tl.k] : null;
    const t = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    remember();
    if (m && !(t && t.matches('.era') && t.hidden)) requestAnimationFrame(() => putBack(m));
  });
  addEventListener('hashchange', (e) => {
    const id = location.hash.slice(1);
    const back = !!traversal && traversal.hash === location.hash && e.timeStamp - traversal.at < 1000;
    traversal = null;
    const t = id ? document.getElementById(id) : null;
    // Unless a filter now hides the era it names: then the whole record comes back and the page goes to it (as before).
    if (back && !(t && t.matches('.era') && t.hidden)) { remember(); return; }
    if (prepare(id)) t.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'start' });
    else reveal(id, false);
    remember();
  });
})();
