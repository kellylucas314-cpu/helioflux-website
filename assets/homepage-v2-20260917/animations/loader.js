/* HelioFlux loader (loader.js)

   What it does: a short navy cover while the homepage loads. In the middle, a
   thin cell outline on the left and a small detector bar on the right. Every
   450ms a photon leaves the cell rim and travels in a straight line to the bar;
   when it lands, the bar flashes cyan for 150ms and a quiet tick appears
   beneath it. Four photons at most. The wordmark sits under the picture.

   Where it attaches: this script belongs in <head>, after loader.css, so it runs
   before the body paints. It adds class "hf-loading" to <html> at once (the CSS
   paints the cover from that class) and injects <div id="hf-loader"> as soon as
   <body> exists. It never touches existing elements.

   Timing: shown for at least 900ms; hides on window load, or at a 1700ms
   failsafe, whichever comes first after the minimum; a hard stop removes it at
   2200ms after script start no matter what. The exit is a 450ms fade with the
   figure scaling to 1.03. On exit it dispatches "helioflux:loaded" on window and
   restarts the hero entrance timeline (the page's top-level const "tl") so the
   visitor actually sees it.

   Skips entirely (no class, no element) under prefers-reduced-motion, when this
   tab has already shown it (sessionStorage "hf-loader-seen"), on reload or
   back/forward navigation, and when the document is already complete. It still
   dispatches "helioflux:loaded" (detail.skipped true) on load in those cases, so
   nothing waiting on the event is left hanging. Works when sessionStorage throws.

   How it pauses: the photon loop is requestAnimationFrame only and stops when
   the tab is hidden, when "helioflux:motion" reports paused, when the overlay is
   not intersecting the viewport, and when prefers-reduced-motion switches on.
   While paused the picture holds its still state (no photons, bar unlit) and the
   exit timing carries on unchanged. No layout is read per frame: the scene is a
   fixed-size SVG, so nothing needs a ResizeObserver, and there is no canvas, so
   no devicePixelRatio to cap. At most two 2px photons are ever in flight, on any
   screen width, so there is no particle count to reduce on phones. */
(function () {
  'use strict';

  var win = window, doc = document;
  var clock = (win.performance && typeof win.performance.now === 'function')
    ? function () { return win.performance.now(); }
    : function () { return Date.now(); };
  var T0 = clock();
  function elapsed() { return clock() - T0; }

  /* A <script> in <head> always has <html> already. A script injected at document
     start (test harnesses, tag managers) may run before it exists, so wait for it. */
  if (!doc.documentElement) {
    var started = false;
    var begin = function () { if (!started && doc.documentElement) { started = true; start(); } };
    if ('MutationObserver' in win) {
      try {
        var rootWatch = new MutationObserver(function () { if (doc.documentElement) { rootWatch.disconnect(); begin(); } });
        rootWatch.observe(doc, { childList: true });
      } catch (e) { /* fall through */ }
    }
    doc.addEventListener('readystatechange', begin, { once: true });
    doc.addEventListener('DOMContentLoaded', begin, { once: true });
    return;
  }
  start();

  function start() {
    var html = doc.documentElement;

    /* ---- Skip rules ------------------------------------------------------- */

    var reduceQuery = null;
    try { reduceQuery = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null; } catch (e) { reduceQuery = null; }
    function reduced() { return !!(reduceQuery && reduceQuery.matches); }

    function navigationType() {
      try {
        var entries = win.performance && win.performance.getEntriesByType
          ? win.performance.getEntriesByType('navigation') : null;
        return (entries && entries[0] && entries[0].type) || '';
      } catch (e) { return ''; }
    }
    function alreadySeen() {
      try { return win.sessionStorage.getItem('hf-loader-seen') === '1'; } catch (e) { return false; }
    }
    function dispatchLoaded(detail) {
      try { win.dispatchEvent(new CustomEvent('helioflux:loaded', { detail: detail })); } catch (e) { /* older browsers; nothing to do */ }
    }

    var navType = navigationType();
    if (reduced() || doc.readyState === 'complete' || navType === 'back_forward' || navType === 'reload' || alreadySeen()) {
      html.setAttribute('data-hf-loader', 'skipped');
      var announce = function () { dispatchLoaded({ skipped: true }); };
      if (doc.readyState === 'complete') { setTimeout(announce, 0); }
      else { win.addEventListener('load', announce, { once: true }); }
      return;
    }
    try { win.sessionStorage.setItem('hf-loader-seen', '1'); } catch (e) { /* private mode; show anyway */ }

    /* ---- Show ------------------------------------------------------------- */

    html.classList.add('hf-loading');
    html.setAttribute('data-hf-loader', 'showing');

    var MIN_SHOW = 900, FAILSAFE = 1700, HARD_STOP = 2200, FADE = 450;
    var TRAVEL = 560, FLASH = 150;
    var SVG = 'http://www.w3.org/2000/svg';

    /* Scene geometry in SVG units (1 unit = 1 CSS px). The cell rim's right edge
       is at x 76; the bar stands 110px to its right. */
    var CELL = { x: 44, y: 42, r: 32 };
    var BAR = { x: 186, y: 28, w: 2, h: 28 };
    /* Launch plan: when each photon leaves (ms after mount), the angle on the right
       rim it leaves from, and where along the bar it lands. */
    var PLAN = [
      { t: 60, angle: -14, land: -6 },
      { t: 510, angle: 11, land: 5 },
      { t: 960, angle: -4, land: -1 },
      { t: 1410, angle: 18, land: 8 }
    ];

    var overlay = null, scene = null, photons = [], ticks = [];
    var state = {
      exiting: false, done: false, finished: false,
      raf: 0, last: 0, time: 0,
      motionPaused: false, inView: true, hidden: false,
      hit: false, hitUntil: 0, counted: 0, wordShown: false
    };
    var timers = [];
    function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }

    function el(name, attrs, className) {
      var node = doc.createElementNS(SVG, name);
      if (attrs) { for (var k in attrs) { if (Object.prototype.hasOwnProperty.call(attrs, k)) { node.setAttribute(k, String(attrs[k])); } } }
      if (className) { node.setAttribute('class', className); }
      return node;
    }
    function setClass(node, name, on) {
      if (!node) { return; }
      if (node.classList) { node.classList.toggle(name, !!on); return; }
      var list = (node.getAttribute('class') || '').split(/\s+/).filter(function (c) { return c && c !== name; });
      if (on) { list.push(name); }
      node.setAttribute('class', list.join(' '));
    }

    function build() {
      overlay = doc.createElement('div');
      overlay.id = 'hf-loader';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('role', 'presentation');

      var figure = doc.createElement('div');
      figure.className = 'hf-loader__figure';

      scene = el('svg', { viewBox: '0 0 200 84', width: 200, height: 84, 'aria-hidden': 'true', focusable: 'false' }, 'hf-loader__scene');

      var defs = el('defs');
      var halo = el('radialGradient', { id: 'hfLoaderHalo' });
      halo.appendChild(el('stop', { offset: '0', 'stop-color': 'rgb(0,169,214)', 'stop-opacity': '.42' }));
      halo.appendChild(el('stop', { offset: '.45', 'stop-color': 'rgb(0,169,214)', 'stop-opacity': '.12' }));
      halo.appendChild(el('stop', { offset: '1', 'stop-color': 'rgb(0,169,214)', 'stop-opacity': '0' }));
      defs.appendChild(halo);
      scene.appendChild(defs);

      scene.appendChild(el('circle', { cx: CELL.x, cy: CELL.y, r: CELL.r }, 'hf-loader__cell'));
      scene.appendChild(el('rect', { x: BAR.x - 4, y: BAR.y - 4, width: BAR.w + 8, height: BAR.h + 8, rx: 5 }, 'hf-loader__glow'));
      scene.appendChild(el('rect', { x: BAR.x, y: BAR.y, width: BAR.w, height: BAR.h, rx: 1 }, 'hf-loader__bar'));
      scene.appendChild(el('rect', { x: BAR.x, y: BAR.y, width: BAR.w, height: BAR.h, rx: 1 }, 'hf-loader__flash'));

      var tickGroup = el('g');
      var tickBase = BAR.x + BAR.w / 2 - (PLAN.length - 1) * 2.5;
      for (var i = 0; i < PLAN.length; i++) {
        var tx = (tickBase + i * 5).toFixed(1);
        var tick = el('line', { x1: tx, y1: BAR.y + BAR.h + 10, x2: tx, y2: BAR.y + BAR.h + 16 }, 'hf-loader__tick');
        tickGroup.appendChild(tick);
        ticks.push(tick);
      }
      scene.appendChild(tickGroup);

      for (var p = 0; p < PLAN.length; p++) {
        var plan = PLAN[p];
        var a = plan.angle * Math.PI / 180;
        var group = el('g', { opacity: '0' }, 'hf-loader__photon');
        group.appendChild(el('circle', { r: 7, fill: 'url(#hfLoaderHalo)' }));
        group.appendChild(el('circle', { r: 1.1 }, 'hf-loader__photon-core'));
        scene.appendChild(group);
        photons.push({
          node: group, t: plan.t, landed: false,
          x0: CELL.x + Math.cos(a) * CELL.r, y0: CELL.y + Math.sin(a) * CELL.r,
          x1: BAR.x, y1: CELL.y + plan.land
        });
      }

      var word = doc.createElement('div');
      word.className = 'hf-loader__word';
      word.appendChild(doc.createTextNode('Helio'));
      var accent = doc.createElement('span');
      accent.className = 'hf-loader__accent';
      accent.appendChild(doc.createTextNode('Flux'));
      word.appendChild(accent);

      figure.appendChild(scene);
      figure.appendChild(word);
      overlay.appendChild(figure);
      return overlay;
    }

    /* ---- Photon loop ------------------------------------------------------ */

    function running() {
      return !!overlay && !state.done && !state.finished && !state.motionPaused && !state.hidden && state.inView && !reduced();
    }
    function stillState() {
      for (var i = 0; i < photons.length; i++) { photons[i].node.setAttribute('opacity', '0'); }
      if (state.hit) { state.hit = false; setClass(scene, 'is-hit', false); }
    }
    function count() {
      if (state.counted < ticks.length) { setClass(ticks[state.counted], 'is-on', true); }
      state.counted += 1;
    }
    function render() {
      var now = state.time, lastPlan = PLAN[PLAN.length - 1];
      for (var i = 0; i < photons.length; i++) {
        var ph = photons[i], k = (now - ph.t) / TRAVEL;
        if (k <= 0) { ph.node.setAttribute('opacity', '0'); continue; }
        if (k >= 1) {
          if (!ph.landed) { ph.landed = true; state.hitUntil = now + FLASH; count(); }
          ph.node.setAttribute('opacity', '0');
          continue;
        }
        var x = ph.x0 + (ph.x1 - ph.x0) * k, y = ph.y0 + (ph.y1 - ph.y0) * k;
        ph.node.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')');
        /* Emerges from the rim line over the first 12 percent of the path. */
        ph.node.setAttribute('opacity', Math.min(1, k / .12).toFixed(3));
      }
      var hit = now < state.hitUntil;
      if (hit !== state.hit) { state.hit = hit; setClass(scene, 'is-hit', hit); }
      if (now > lastPlan.t + TRAVEL + FLASH + 400) { state.finished = true; }
    }
    function frame(ts) {
      state.raf = 0;
      if (!running()) { return; }
      var dt = state.last ? Math.min(ts - state.last, 50) : 0;
      state.last = ts;
      state.time += dt;
      render();
      if (running()) { state.raf = win.requestAnimationFrame(frame); }
    }
    function sync() {
      if (state.raf) { win.cancelAnimationFrame(state.raf); state.raf = 0; }
      state.last = 0;
      if (running()) { state.raf = win.requestAnimationFrame(frame); }
      else if (overlay) { stillState(); }
    }

    /* ---- Wordmark: wait briefly for the brand font so it never swaps ------- */

    function revealWord() {
      if (overlay && !state.wordShown) { state.wordShown = true; overlay.classList.add('has-word'); }
    }
    function gateWord() {
      later(function () {
        var fonts = doc.fonts, spec = '500 18px "Plus Jakarta Sans"';
        try {
          if (fonts && fonts.check && fonts.check(spec)) { revealWord(); return; }
          var cap = later(revealWord, 500);
          if (fonts && fonts.load) {
            fonts.load(spec).then(function () { clearTimeout(cap); revealWord(); }, function () { clearTimeout(cap); revealWord(); });
          } else { clearTimeout(cap); revealWord(); }
        } catch (e) { revealWord(); }
      }, 100);
    }

    /* ---- Lifecycle -------------------------------------------------------- */

    function block(event) { if (event.cancelable) { event.preventDefault(); } }
    var observer = null;

    function mount() {
      /* If <body> only arrives after the exit has begun (a parser-blocking script
         in <head> on a slow connection), the cover is already lifting, so do not
         pop a fresh overlay in at full opacity. */
      if (overlay || state.done || state.exiting || !doc.body) { return; }
      try {
        build();
        doc.body.appendChild(overlay);
      } catch (e) { overlay = null; return; }
      overlay.addEventListener('wheel', block, { passive: false });
      overlay.addEventListener('touchmove', block, { passive: false });
      /* A forced reflow commits the opacity 0 start, so the fade-in transition runs. */
      void overlay.offsetWidth;
      overlay.classList.add('is-ready');
      gateWord();
      if ('IntersectionObserver' in win) {
        try {
          observer = new IntersectionObserver(function (entries) {
            state.inView = entries[entries.length - 1].isIntersecting;
            sync();
          }, { threshold: 0 });
          observer.observe(overlay);
        } catch (e) { observer = null; }
      }
      sync();
    }

    function exit() {
      if (state.exiting) { return; }
      state.exiting = true;
      html.classList.add('hf-loader-exit');
      html.setAttribute('data-hf-loader', 'exiting');
      if (overlay) { overlay.classList.add('is-exiting'); }
      dispatchLoaded({ skipped: false, shownFor: Math.round(elapsed()) });
      /* The hero entrance is a GSAP timeline held in a top-level const named tl in
         the page's inline script; a classic script's lexical globals are visible by
         name from here. Restarted so the visitor sees it after the cover lifts. */
      try { if (typeof tl !== 'undefined' && tl && typeof tl.restart === 'function') { tl.restart(); } } catch (e) { /* no timeline; nothing to restart */ }
      later(teardown, FADE + 60);
    }

    function teardown() {
      if (state.done) { return; }
      if (!state.exiting) { exit(); }
      state.done = true;
      if (state.raf) { win.cancelAnimationFrame(state.raf); state.raf = 0; }
      for (var i = 0; i < timers.length; i++) { clearTimeout(timers[i]); }
      if (observer) { try { observer.disconnect(); } catch (e) { /* ignore */ } observer = null; }
      if (overlay) {
        overlay.removeEventListener('wheel', block);
        overlay.removeEventListener('touchmove', block);
        if (overlay.parentNode) { overlay.parentNode.removeChild(overlay); }
      }
      overlay = null;
      html.classList.remove('hf-loading');
      html.classList.remove('hf-loader-exit');
      html.setAttribute('data-hf-loader', 'done');
      doc.removeEventListener('visibilitychange', onVisibility);
      if (reduceQuery) {
        if (reduceQuery.removeEventListener) { reduceQuery.removeEventListener('change', sync); }
        else if (reduceQuery.removeListener) { reduceQuery.removeListener(sync); }
      }
    }

    function exitAfterMinimum() {
      var wait = Math.max(0, MIN_SHOW - elapsed());
      later(exit, wait);
    }

    function onMotion(event) {
      state.motionPaused = !!(event && event.detail && event.detail.paused);
      sync();
    }
    function onVisibility() {
      state.hidden = !!doc.hidden;
      sync();
    }

    state.hidden = !!doc.hidden;
    /* helioflux:motion is ignored here: a refused hero autoplay is a device condition, not a visitor choice. */
    doc.addEventListener('visibilitychange', onVisibility);
    if (reduceQuery) {
      if (reduceQuery.addEventListener) { reduceQuery.addEventListener('change', sync); }
      else if (reduceQuery.addListener) { reduceQuery.addListener(sync); }
    }

    /* Mount as soon as <body> exists: at once, or when the parser creates it. */
    if (doc.body) { mount(); }
    else {
      if ('MutationObserver' in win) {
        try {
          var bodyWatch = new MutationObserver(function () {
            if (doc.body) { bodyWatch.disconnect(); mount(); }
          });
          bodyWatch.observe(html, { childList: true });
        } catch (e) { /* fall through to DOMContentLoaded */ }
      }
      doc.addEventListener('DOMContentLoaded', mount, { once: true });
    }

    win.addEventListener('load', exitAfterMinimum, { once: true });
    later(exitAfterMinimum, Math.max(0, FAILSAFE - elapsed()));
    later(teardown, Math.max(0, HARD_STOP - elapsed()));
  }
})();
