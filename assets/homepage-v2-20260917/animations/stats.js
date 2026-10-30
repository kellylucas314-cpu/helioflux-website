/* stats.js
   Survival rings behind the two big survival numbers on the HelioFlux homepage
   (styles in stats.css).

   What it does: inside #survivalGapGrid, each .prob-gap-col gets one small SVG,
   inserted as the column's first child and positioned behind its number: a faint
   full track circle and a 2px progress arc that starts at 12 o'clock and runs
   clockwise. The early column's arc is brand cyan and covers 90% of the circle,
   the late column's arc is ink and covers 30%, an echo of ">90%" and "~30%". The
   ring radius is 1.05 times half the number's rendered height, measured once
   with getBoundingClientRect on .prob-gap-num and again on resize (ResizeObserver
   on the grid and both numbers, batched into one frame), never per frame. A 3px
   photon with a soft halo rides the leading end of the early arc while it draws
   and stays there, faint, afterward.

   Attaches to: #survivalGapGrid .prob-gap-col.early and .prob-gap-col.late. It
   adds class "hf-ring-host" to each column (position: relative plus isolation:
   isolate, so the SVG's z-index of -1 keeps it under the number and the labels)
   and data-hf-rings-ready on the grid. No text changes and no existing element
   is moved; the only new nodes are the two aria-hidden SVGs.

   When it draws: percent.js counts the digits up over 1200ms with a cubic
   ease-out and marks the grid data-percent-state="running" the instant it
   starts. A MutationObserver watches that attribute and starts the rings at the
   same instant with the same duration and easing, so arcs and digits move as one
   gesture. If percent.js is not driving the grid (it opts out on reduced motion,
   history navigation, hidden tabs and print), an IntersectionObserver at
   threshold .4 starts the rings once instead. Either way the draw happens once.

   How it pauses: the only motion is the 1200ms draw, run on requestAnimationFrame.
   While the grid is off-screen (IntersectionObserver, threshold 0) a draw in
   flight is held and resumes where it left off. When the tab is hidden, when the
   visitor has paused motion on the site, before print and on a bfcache restore,
   the rings jump to their finished state, as percent.js does with the digits.
   The site signals pausing with "helioflux:motion" (detail.paused), but
   hero-motion.js fires that with paused true whenever the hero merely scrolls out
   of view, which is always the case here, and also when the hero video cannot
   autoplay. So, as progress.js and headlines.js do, the hero's own pause button
   is consulted one microtask later; on top of that, only a button the visitor can
   see (not display: none) counts as a visitor's choice. The current stylesheets
   hide that button, so a pressed state on a hidden button can only mean the hero
   video did not autoplay, which is no reason to freeze a ring the digits are
   already counting beside. With no button on the page the event is taken at its
   word. prefers-reduced-motion: reduce renders the finished state at once, with
   no photon travel and no fades, and the preference is watched for changes. */

(function () {
  'use strict';

  var DURATION = 1200;        // same as percent.js
  var RADIUS_SCALE = 1.05;    // ring radius relative to half the number's height
  var STROKE = 2;
  var DOT_R = 1.5;            // 3px photon
  var HALO_R = 7;             // soft halo radius
  var PAD = HALO_R + STROKE + 3; // room around the ring inside its SVG box
  var THRESHOLD = 0.4;        // fallback trigger when percent.js is not driving
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SPECS = [
    { key: 'early', fill: 0.9, dot: true },
    { key: 'late', fill: 0.3, dot: false }
  ];

  function ease(t) { return 1 - Math.pow(1 - t, 3); } // the ease-out percent.js uses

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVG_NS, name);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, attrs[k]);
    }
    return el;
  }

  function init() {
    var grid = document.getElementById('survivalGapGrid');
    if (!grid || grid.dataset.hfRingsReady) return;
    grid.dataset.hfRingsReady = 'true';

    var reduce = null, print = null;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) { reduce = null; }
    try { print = window.matchMedia('print'); } catch (e) { print = null; }

    // Build one ring per column.
    var rings = [];
    for (var i = 0; i < SPECS.length; i++) {
      var spec = SPECS[i];
      var col = grid.querySelector('.prob-gap-col.' + spec.key);
      var num = col ? col.querySelector('.prob-gap-num') : null;
      if (!col || !num) continue;

      var svg = svgEl('svg', { 'class': 'hf-ring hf-ring--' + spec.key, 'aria-hidden': 'true', focusable: 'false' });
      var track = svgEl('circle', { 'class': 'hf-ring__track' });
      var arc = svgEl('circle', { 'class': 'hf-ring__arc' });
      svg.appendChild(track);
      svg.appendChild(arc);

      var dot = null;
      if (spec.dot) {
        var gradId = 'hf-ring-halo-' + spec.key + '-' + Math.floor(Math.random() * 1e9).toString(36);
        var defs = svgEl('defs', {});
        var grad = svgEl('radialGradient', { id: gradId });
        grad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': 'rgb(0,169,214)', 'stop-opacity': '.5' }));
        grad.appendChild(svgEl('stop', { offset: '45%', 'stop-color': 'rgb(0,169,214)', 'stop-opacity': '.2' }));
        grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': 'rgb(0,169,214)', 'stop-opacity': '0' }));
        defs.appendChild(grad);
        svg.insertBefore(defs, track);
        dot = svgEl('g', { 'class': 'hf-ring__dot' });
        dot.appendChild(svgEl('circle', { 'class': 'hf-ring__halo', r: HALO_R, fill: 'url(#' + gradId + ')' }));
        dot.appendChild(svgEl('circle', { 'class': 'hf-ring__core', r: DOT_R }));
        svg.appendChild(dot);
      }

      col.classList.add('hf-ring-host');
      col.insertBefore(svg, col.firstChild);
      rings.push({ spec: spec, col: col, num: num, svg: svg, track: track, arc: arc, dot: dot, r: 0, c: 0, half: 0 });
    }
    if (!rings.length) return;

    var state = 'idle';       // idle, running, paused (off-screen), done
    var progress = 0;         // eased progress, kept so a resize can redraw the current state
    var startTime = 0;
    var elapsed = 0;
    var frame = 0;
    var deadline = 0;
    var inView = true;
    var sitePaused = false;
    var eventPaused = false;
    var measurePending = false;
    var triggerObserver = null;
    var stateObserver = null;
    var viewObserver = null;

    function forEachSvg(fn) {
      for (var j = 0; j < rings.length; j++) fn(rings[j].svg);
    }

    /* ---- geometry: read once, written to attributes ---- */

    function measure() {
      measurePending = false;
      for (var j = 0; j < rings.length; j++) {
        var ring = rings[j];
        var cr = ring.col.getBoundingClientRect();
        var nr = ring.num.getBoundingClientRect();
        if (!nr.height || !nr.width) continue;
        var r = Math.max(6, (nr.height / 2) * RADIUS_SCALE);
        var size = Math.ceil(2 * (r + PAD));
        var half = size / 2;
        var cx = nr.left - cr.left + nr.width / 2;
        var cy = nr.top - cr.top + nr.height / 2;
        ring.r = r;
        ring.c = 2 * Math.PI * r;
        ring.half = half;
        ring.svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
        ring.svg.style.width = size + 'px';
        ring.svg.style.height = size + 'px';
        ring.svg.style.left = (cx - half).toFixed(2) + 'px';
        ring.svg.style.top = (cy - half).toFixed(2) + 'px';
        ring.track.setAttribute('cx', half);
        ring.track.setAttribute('cy', half);
        ring.track.setAttribute('r', r.toFixed(3));
        ring.arc.setAttribute('cx', half);
        ring.arc.setAttribute('cy', half);
        ring.arc.setAttribute('r', r.toFixed(3));
        ring.arc.setAttribute('transform', 'rotate(-90 ' + half + ' ' + half + ')');
        ring.arc.setAttribute('stroke-dasharray', ring.c.toFixed(3));
      }
      render(progress);
    }

    function scheduleMeasure() {
      if (measurePending) return;
      measurePending = true;
      window.requestAnimationFrame(measure);
    }

    /* ---- drawing ---- */

    function render(p) {
      for (var j = 0; j < rings.length; j++) {
        var ring = rings[j];
        if (!ring.c) continue;
        var frac = ring.spec.fill * p;
        ring.arc.setAttribute('stroke-dashoffset', (ring.c * (1 - frac)).toFixed(3));
        if (ring.dot) {
          var a = -Math.PI / 2 + Math.PI * 2 * frac;
          var x = ring.half + ring.r * Math.cos(a);
          var y = ring.half + ring.r * Math.sin(a);
          ring.dot.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')');
        }
      }
    }

    function stillRequired() {
      return !!((reduce && reduce.matches) || (print && print.matches) || document.hidden || sitePaused);
    }

    function stopFrames() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      window.clearTimeout(deadline);
      deadline = 0;
    }

    function disconnectTriggers() {
      if (triggerObserver) { triggerObserver.disconnect(); triggerObserver = null; }
      if (stateObserver) { stateObserver.disconnect(); stateObserver = null; }
      if (viewObserver) { viewObserver.disconnect(); viewObserver = null; }
    }

    // Natural end of the draw: the photon settles with its CSS fade.
    function complete() {
      state = 'done';
      stopFrames();
      progress = 1;
      render(1);
      forEachSvg(function (svg) { svg.classList.remove('is-drawing'); svg.classList.add('is-done'); });
      disconnectTriggers();
    }

    // Finished state at once, no travel and no fade.
    function finish() {
      if (state === 'done') return;
      state = 'done';
      stopFrames();
      progress = 1;
      render(1);
      forEachSvg(function (svg) { svg.classList.remove('is-drawing'); svg.classList.add('is-done'); svg.classList.add('is-still'); });
      disconnectTriggers();
    }

    function tick(now) {
      frame = 0;
      if (state !== 'running') return;
      var t = Math.min(1, Math.max(0, (now - startTime) / DURATION));
      progress = ease(t);
      render(progress);
      if (t < 1) frame = window.requestAnimationFrame(tick);
      else complete();
    }

    function armDeadline() {
      window.clearTimeout(deadline);
      // If frame delivery stalls mid-draw, settle on the finished state anyway.
      deadline = window.setTimeout(function () { if (state === 'running') complete(); }, DURATION - elapsed + 240);
    }

    function start() {
      if (state !== 'idle') return;
      if (stillRequired()) { finish(); return; }
      state = 'running';
      elapsed = 0;
      startTime = performance.now();
      forEachSvg(function (svg) { svg.classList.add('is-drawing'); });
      render(0);
      if (triggerObserver) { triggerObserver.disconnect(); triggerObserver = null; }
      if (!inView) { hold(); return; }
      frame = window.requestAnimationFrame(tick);
      armDeadline();
    }

    // Off-screen mid-draw: keep the place, stop the frames.
    function hold() {
      if (state !== 'running') return;
      state = 'paused';
      elapsed = performance.now() - startTime;
      stopFrames();
    }

    function resume() {
      if (state !== 'paused') return;
      if (stillRequired()) { finish(); return; }
      state = 'running';
      startTime = performance.now() - elapsed;
      frame = window.requestAnimationFrame(tick);
      armDeadline();
    }

    /* ---- site motion toggle ---- */

    function pauseButton() {
      return document.querySelector('.cell-pause[aria-pressed]');
    }

    function buttonShown(button) {
      try {
        var cs = window.getComputedStyle(button);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
      } catch (e) { return true; }
    }

    // One microtask after helioflux:motion, hero-motion.js has written the
    // visitor's own choice to its button; only a visible pressed button counts.
    function applyMotionEvent() {
      var button = pauseButton();
      if (!eventPaused) sitePaused = false;
      else if (!button) sitePaused = true;
      else sitePaused = button.getAttribute('aria-pressed') === 'true' && buttonShown(button);
      if (sitePaused && (state === 'running' || state === 'paused')) finish();
    }

    function afterCurrentTask(fn) {
      if (typeof Promise === 'function') Promise.resolve().then(fn);
      else window.setTimeout(fn, 0);
    }

    /* ---- triggers ---- */

    function watchPercent() {
      if (stateObserver || !('MutationObserver' in window)) return;
      stateObserver = new MutationObserver(function () {
        var value = grid.dataset.percentState;
        if (value === 'running' || value === 'complete') start();
        else if (value === 'ready' && triggerObserver) {
          // percent.js took over after this script started; follow it instead.
          triggerObserver.disconnect();
          triggerObserver = null;
        }
      });
      stateObserver.observe(grid, { attributes: true, attributeFilter: ['data-percent-state'] });
    }

    function watchIntersection() {
      if (!('IntersectionObserver' in window)) { start(); return; }
      triggerObserver = new IntersectionObserver(function (entries) {
        for (var k = 0; k < entries.length; k++) {
          if (entries[k].isIntersecting) { start(); return; }
        }
      }, { threshold: THRESHOLD });
      triggerObserver.observe(grid);
    }

    /* ---- wiring ---- */

    window.addEventListener('helioflux:motion', function (event) {
      eventPaused = !!(event && event.detail && event.detail.paused);
      afterCurrentTask(applyMotionEvent);
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) finish();
    });
    window.addEventListener('pagehide', finish);
    window.addEventListener('pageshow', function (event) { if (event && event.persisted) finish(); });
    window.addEventListener('beforeprint', finish);

    function onReduceChange() {
      forEachSvg(function (svg) { svg.classList.toggle('is-reduced', !!(reduce && reduce.matches)); });
      if (reduce && reduce.matches) finish();
    }
    if (reduce) {
      if (typeof reduce.addEventListener === 'function') reduce.addEventListener('change', onReduceChange);
      else if (typeof reduce.addListener === 'function') reduce.addListener(onReduceChange);
    }
    if (print) {
      var onPrint = function () { if (print.matches) finish(); };
      if (typeof print.addEventListener === 'function') print.addEventListener('change', onPrint);
      else if (typeof print.addListener === 'function') print.addListener(onPrint);
    }

    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(scheduleMeasure);
      ro.observe(grid);
      for (var m = 0; m < rings.length; m++) ro.observe(rings[m].num);
    } else {
      window.addEventListener('resize', scheduleMeasure, { passive: true });
    }
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(scheduleMeasure, function () {});
    }

    if ('IntersectionObserver' in window) {
      viewObserver = new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        if (inView) resume(); else hold();
      }, { threshold: 0 });
      viewObserver.observe(grid);
    }

    // Starting state of the site toggle, in case the hero already settled.
    var initialButton = pauseButton();
    if (initialButton && initialButton.getAttribute('aria-pressed') === 'true' && buttonShown(initialButton)) sitePaused = true;

    measure();

    if (reduce && reduce.matches) forEachSvg(function (svg) { svg.classList.add('is-reduced'); });

    // The same opt-outs percent.js applies: the digits stay static in these cases,
    // so the rings are static too and show the finished state.
    var navEntry = null;
    try { navEntry = performance.getEntriesByType('navigation')[0] || null; } catch (e) { navEntry = null; }
    if (stillRequired() || (navEntry && navEntry.type === 'back_forward')) { finish(); return; }

    var percentState = grid.dataset.percentState;
    if (percentState === 'complete') { finish(); return; }     // the digits already settled before this ran
    watchPercent();
    if (percentState === 'running') start();                   // join a count already in flight
    else if (percentState !== 'ready') watchIntersection();    // percent.js is not driving: own trigger at .4
  }

  function safeInit() {
    try { init(); } catch (e) { /* decorative only; never break the page */ }
  }

  if (document.readyState !== 'loading') safeInit();
  else document.addEventListener('DOMContentLoaded', safeInit, { once: true });
})();
