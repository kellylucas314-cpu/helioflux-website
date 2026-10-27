/* Science page behavior. Everything here is illustrative; nothing is measured data. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // 1. The approved hero film and light overlay (scripts reused unchanged from the Sep 17 Science page).
  const canvas = document.querySelector('#signal-canvas');
  const poster = document.querySelector('.measurement-poster');
  const toggle = document.querySelector('#motion-toggle');
  if (canvas && window.installSignalAnimation) {
    try {
      canvas.hidden = false;
      const controller = window.installSignalAnimation();
      if (controller) { poster.hidden = false; toggle.hidden = false; } else canvas.hidden = true;
    } catch (error) { canvas.hidden = true; console.error('Measurement illustration unavailable', error); }
  }

  // 2. Page map: mark the section being read.
  const links = [...document.querySelectorAll('.page-map a')];
  const targets = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (targets.length && 'IntersectionObserver' in window) {
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, bestTop = Infinity;
      targets.forEach((t) => { const r = t.getBoundingClientRect(); if (r.top < innerHeight * .45 && r.bottom > innerHeight * .2 && Math.abs(r.top) < bestTop) { best = t.id; bestTop = Math.abs(r.top); } });
      links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === '#' + best));
    }, { threshold: [0, .1, .25, .5, .75, 1] });
    targets.forEach((t) => io.observe(t));
  }

  // 3. Explorable: the same light, counted versus sorted by color.
  const fig = document.querySelector('#explorable');
  if (fig) {
    const buttons = [...fig.querySelectorAll('.segmented button')];
    const caption = fig.querySelector('.explorable-caption');
    const image = fig.querySelector('.explorable-image');
    const text = {
      count: 'Counting every photon, the totals are close but not identical.',
      sort: 'Sorted by color, the cancer cells lean weakly toward shorter, violet-to-ultraviolet light and the non-cancer cells toward near-infrared, as in the 2018 study.'
    };
    const alt = {
      count: 'An orderly monolayer of non-cancer cells and a crowded irregular culture of cancer cells have similar but visibly different total-light readouts.',
      sort: 'The same visibly different cell cultures have different three-band spectral readouts: non-cancer cells lean toward near-infrared and cancer cells toward shorter, violet-to-ultraviolet wavelengths, the weak trend seen in the 2018 study.'
    };
    const setMode = (mode) => {
      fig.dataset.mode = mode;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
      caption.textContent = text[mode];
      image.src = mode === 'sort' ? image.dataset.sortSrc : image.dataset.countSrc;
      image.alt = alt[mode];
    };
    let touched = false;
    buttons.forEach((b) => b.addEventListener('click', () => { touched = true; setMode(b.dataset.mode); }));
    setMode(reduce.matches ? 'sort' : 'count');
    // Show the takeaway without asking for a click: sort once, after it has been in view for a moment. If the reader
    // scrolls on before then (or a jump link carries the page past it), wait for the next visit: the longer sorted
    // caption must not grow the page above wherever they landed.
    if (!reduce.matches && 'IntersectionObserver' in window) {
      let timer = 0;
      const once = new IntersectionObserver(([e]) => {
        clearTimeout(timer);
        if (e.intersectionRatio < .6) return;
        timer = setTimeout(() => { once.disconnect(); if (!touched) setMode('sort'); }, 2600);
      }, { threshold: .6 });
      once.observe(fig);
    }
  }
})();
