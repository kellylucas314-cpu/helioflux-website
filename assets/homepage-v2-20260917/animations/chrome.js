/* chrome.js
   Small finishing touches across the HelioFlux homepage (styles in chrome.css):

   (a) Eyebrow underlines. Every .eyebrow gets class "hf-eyebrow-in" the first
       time 60% of it is on screen (own IntersectionObserver, once), which lets the
       48px hairline under it draw in. An eyebrow whose line is left-anchored also
       gets "hf-eyebrow-left" so the line grows from the left.
   (b) Logo sweep. Once per page view, when the window event "helioflux:loaded"
       fires, the span inside nav a.logo ("Flux") gets class "hf-logo-sweep" for one
       900ms pass of light, then the class is removed. If the event never comes the
       sweep runs 900ms after DOMContentLoaded, or 4s later when the loader module
       is on the page (its cover would hide an early sweep). Skipped under reduced
       motion and in browsers without background-clip: text.
   (c) Nav link underline. Pure CSS on hover and focus; nothing to do here beyond
       the html class that switches the styles on.
   (d) Hero scroll cue photon. Pure CSS loop; this script pauses it (class
       "hf-chrome-paused" on <html>) when the tab is hidden, when the hero is off
       screen (IntersectionObserver), or when the site's "helioflux:motion" event
       reports paused. The cue lives in the hero, so hero-motion.js firing paused
       when the hero merely scrolls away is exactly the right time to stop it.
   (e) Press logos. Nothing is hidden up front. When a .press-logos row comes
       within 240px of the viewport its images get "hf-press-wait" (hidden, 10px
       low, no transition, so it snaps rather than fades out); when the row is 20%
       on screen each image gets "hf-press-enter" (the 600ms transition) and loses
       the wait class, 70ms apart. The 2500ms failsafe runs from the moment a row
       is armed, the same guard the product cards use, so a row that is never
       approached is never hidden and an armed row can wait at most 2.5s. The
       enter class and inline delays are cleared afterwards so the site's own
       250ms hover to opacity 1 is untouched.
   (f) Back-to-top ring. If #back-to-top exists, an <svg class="hf-btt-ring"> is
       appended inside it: a faint track and a 2px cyan arc whose dash offset
       follows the scrolled fraction of the page. Scroll events only ask for one
       animation frame; page and viewport heights are measured once per resize
       through a ResizeObserver on <html> and <body>, never per frame.

   Where it attaches: <html> gets "hf-chrome" at start and "hf-chrome-reduced"
   whenever prefers-reduced-motion: reduce is on (checked at start and on change).
   Only decorative nodes are added (aria-hidden, pointer-events none); no text or
   existing structure changes. Each piece is wrapped so a missing element or an
   unexpected error in one never stops the others, and nothing here throws.

   How it pauses: see (d); the other pieces are one-time entrances, hovers, or
   scroll-driven state, so there is no loop to stop. Under reduced motion the
   finished state is shown at once: every eyebrow marked in, no logo ever hidden,
   no sweep, no photon, and the ring updates without smoothing. */

(function () {
  'use strict';

  var win = window, doc = document;
  var root = doc.documentElement; // re-read in init(), in case this ran before <html> existed

  var EYEBROW_THRESHOLD = 0.6;
  var PRESS_THRESHOLD = 0.2;
  var PRESS_APPROACH = 240;    // px outside the viewport at which a press row is armed (hidden)
  var PRESS_STAGGER = 70;      // ms between logos
  var PRESS_DURATION = 600;    // ms, matches chrome.css
  var PRESS_FAILSAFE = 2500;   // ms from arming after which an armed row shows no matter what
  var SWEEP_DELAY = 900;       // ms after DOMContentLoaded when no loaded event comes
  var SWEEP_DELAY_LOADER = 4000; // ms, when the loader module's cover is up
  var SWEEP_CLEANUP = 1300;    // ms, removes the sweep class even if animationend is lost

  var reduceQuery = null;
  try { reduceQuery = win.matchMedia ? win.matchMedia('(prefers-reduced-motion: reduce)') : null; } catch (e) { reduceQuery = null; }
  function reduced() { return !!(reduceQuery && reduceQuery.matches); }

  var onReduceHandlers = [];
  function whenReduced(fn) { onReduceHandlers.push(fn); }

  function toArray(list) { return Array.prototype.slice.call(list || []); }

  function attempt(fn) {
    try { fn(); } catch (e) { /* decorative only; never break the page */ }
  }

  function afterCurrentTask(fn) {
    if (typeof Promise === 'function') Promise.resolve().then(fn);
    else win.setTimeout(fn, 0);
  }

  /* ---- (a) Eyebrow underlines ------------------------------------------- */
  function initEyebrows() {
    var eyebrows = toArray(doc.querySelectorAll('.eyebrow'));
    if (!eyebrows.length) return;

    function markIn(el) { el.classList.add('hf-eyebrow-in'); }

    // Anchor the draw to the left when the hairline sits flush left (its margin-left
    // resolves to 0 while margin-right carries the slack). Read once at startup.
    eyebrows.forEach(function (el) {
      try {
        var style = win.getComputedStyle(el, '::after');
        var left = parseFloat(style.marginLeft) || 0;
        var right = parseFloat(style.marginRight) || 0;
        if (left === 0 && right > 0) el.classList.add('hf-eyebrow-left');
      } catch (e) { /* keep the center origin */ }
    });

    if (reduced() || !('IntersectionObserver' in win)) {
      eyebrows.forEach(markIn);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio >= EYEBROW_THRESHOLD - 0.01) {
          markIn(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: EYEBROW_THRESHOLD });
    eyebrows.forEach(function (el) { io.observe(el); });

    whenReduced(function () {
      io.disconnect();
      eyebrows.forEach(markIn);
    });
  }

  /* ---- (b) Logo sweep ----------------------------------------------------- */
  function supportsClipText() {
    try {
      return !!(win.CSS && typeof win.CSS.supports === 'function' &&
        (win.CSS.supports('-webkit-background-clip', 'text') || win.CSS.supports('background-clip', 'text')));
    } catch (e) { return false; }
  }

  function initLogoSweep() {
    var span = doc.querySelector('nav a.logo > span') || doc.querySelector('nav .logo span');
    if (!span) return;

    var done = false;
    var timer = 0;

    function cleanup() {
      span.classList.remove('hf-logo-sweep');
      span.removeEventListener('animationend', cleanup);
    }

    function run() {
      if (done) return;
      done = true;
      win.removeEventListener('helioflux:loaded', run);
      if (timer) { win.clearTimeout(timer); timer = 0; }
      if (reduced() || doc.hidden || !supportsClipText()) return;
      span.addEventListener('animationend', cleanup);
      span.classList.add('hf-logo-sweep');
      win.setTimeout(cleanup, SWEEP_CLEANUP);
    }

    win.addEventListener('helioflux:loaded', run);

    function arm() {
      if (done || timer) return;
      var loaderUp = root.classList.contains('hf-loading') || !!doc.getElementById('hf-loader');
      timer = win.setTimeout(run, loaderUp ? SWEEP_DELAY_LOADER : SWEEP_DELAY);
    }
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', arm, { once: true });
    else arm();
  }

  /* ---- (d) Hero scroll cue photon ----------------------------------------- */
  function initScrollCue() {
    var line = doc.querySelector('.scroll-cue .scroll-line');
    if (!line) return;
    var hero = (line.closest && line.closest('.hero')) || line.parentElement;

    var inView = true;
    var eventPaused = false;

    function apply() {
      var paused = !!doc.hidden || !inView || eventPaused;
      root.classList.toggle('hf-chrome-paused', paused);
    }

    doc.addEventListener('visibilitychange', apply);
    win.addEventListener('helioflux:motion', function (event) {
      eventPaused = !!(event && event.detail && event.detail.paused);
      afterCurrentTask(apply);
    });
    if ('IntersectionObserver' in win && hero) {
      new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        apply();
      }, { threshold: 0 }).observe(hero);
    }
    apply();
  }

  /* ---- (e) Press logos ---------------------------------------------------- */
  function initPressLogos() {
    var rows = toArray(doc.querySelectorAll('.press-logos'));
    if (!rows.length) return;
    // Without an observer nothing is ever hidden, so there is nothing to do.
    if (reduced() || !('IntersectionObserver' in win)) return;

    // Nothing is hidden up front. A row is armed (its logos snap to the waiting
    // state, whose rule has no transition) only when it comes within
    // PRESS_APPROACH of the viewport, and shown with the stagger once it is
    // PRESS_THRESHOLD on screen. The entrance transition is attached at show
    // time, in the same frame the wait class comes off, so it only ever plays
    // the way in. The guard runs from arming, like the product cards: a row that
    // is never approached is never hidden, and an armed row waits at most
    // PRESS_FAILSAFE before it shows no matter what.
    var groups = [];
    rows.forEach(function (row) {
      var imgs = toArray(row.querySelectorAll('img'));
      if (imgs.length) groups.push({ row: row, imgs: imgs, armed: false, shown: false, guard: 0 });
    });
    if (!groups.length) return;

    function find(target) {
      for (var i = 0; i < groups.length; i++) if (groups[i].row === target) return groups[i];
      return null;
    }

    function arm(group) {
      if (group.armed || group.shown) return;
      group.armed = true;
      group.imgs.forEach(function (img) { img.classList.add('hf-press-wait'); });
      group.guard = win.setTimeout(function () { show(group, false); }, PRESS_FAILSAFE);
    }

    function settle(imgs) {
      // Hand the hover transition back to the site once the entrance has played.
      win.setTimeout(function () {
        imgs.forEach(function (img) {
          img.style.transitionDelay = '';
          img.classList.remove('hf-press-enter');
        });
      }, PRESS_DURATION + PRESS_STAGGER * imgs.length + 80);
    }

    function show(group, instant) {
      if (group.shown) return;
      group.shown = true;
      if (group.guard) { win.clearTimeout(group.guard); group.guard = 0; }
      approach.unobserve(group.row);
      enter.unobserve(group.row);
      if (!instant) {
        if (!group.armed) {
          group.armed = true;
          group.imgs.forEach(function (img) { img.classList.add('hf-press-wait'); });
        }
        // Approach and entry often arrive in the same task (a jump scroll, or the
        // row already on screen at startup), so the waiting state may not have
        // been painted yet. One forced style flush, once per row, commits it so
        // the entrance has somewhere to start from instead of snapping.
        void group.row.offsetWidth;
        group.imgs.forEach(function (img, i) {
          img.style.transitionDelay = (i * PRESS_STAGGER) + 'ms';
          img.classList.add('hf-press-enter');
        });
        settle(group.imgs);
      }
      group.imgs.forEach(function (img) { img.classList.remove('hf-press-wait'); });
    }

    var approach = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var g = find(entry.target);
        if (g && entry.isIntersecting) arm(g);
      });
    }, { threshold: 0, rootMargin: PRESS_APPROACH + 'px 0px' });

    var enter = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var g = find(entry.target);
        if (g && entry.isIntersecting) show(g, false);
      });
    }, { threshold: PRESS_THRESHOLD });

    groups.forEach(function (g) { approach.observe(g.row); enter.observe(g.row); });

    whenReduced(function () {
      approach.disconnect();
      enter.disconnect();
      groups.forEach(function (g) { show(g, true); });
    });
  }

  /* ---- (f) Back-to-top ring ----------------------------------------------- */
  function initBackToTop() {
    var btt = doc.getElementById('back-to-top');
    if (!btt) return;
    if (btt.querySelector('.hf-btt-ring')) return;

    var NS = 'http://www.w3.org/2000/svg';
    var SIZE = 54, R = 26;
    var C = 2 * Math.PI * R;

    var svg = doc.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'hf-btt-ring');
    svg.setAttribute('viewBox', '0 0 ' + SIZE + ' ' + SIZE);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');

    var track = doc.createElementNS(NS, 'circle');
    track.setAttribute('class', 'hf-btt-ring__track');
    track.setAttribute('cx', SIZE / 2);
    track.setAttribute('cy', SIZE / 2);
    track.setAttribute('r', R);

    var arc = doc.createElementNS(NS, 'circle');
    arc.setAttribute('class', 'hf-btt-ring__arc');
    arc.setAttribute('cx', SIZE / 2);
    arc.setAttribute('cy', SIZE / 2);
    arc.setAttribute('r', R);
    arc.setAttribute('stroke-dasharray', C.toFixed(3));
    arc.setAttribute('stroke-dashoffset', C.toFixed(3));

    svg.appendChild(track);
    svg.appendChild(arc);
    btt.appendChild(svg);

    var maxScroll = 1;
    var frame = 0;
    var measurePending = false;
    var last = -1;

    function render() {
      frame = 0;
      if (doc.hidden) return;
      var y = win.scrollY || win.pageYOffset || 0;
      var p = y / maxScroll;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      var rounded = Math.round(p * 1000) / 1000;
      if (rounded === last) return;
      last = rounded;
      arc.style.strokeDashoffset = (C * (1 - rounded)).toFixed(3);
    }

    function onScroll() {
      if (frame) return;
      frame = win.requestAnimationFrame(render);
    }

    function measure() {
      measurePending = false;
      var viewport = root.clientHeight || win.innerHeight || 1;
      maxScroll = Math.max(1, root.scrollHeight - viewport);
      last = -1;
      render();
    }

    function scheduleMeasure() {
      if (measurePending) return;
      measurePending = true;
      win.requestAnimationFrame(measure);
    }

    win.addEventListener('scroll', onScroll, { passive: true });
    win.addEventListener('resize', scheduleMeasure, { passive: true });
    win.addEventListener('load', scheduleMeasure);
    doc.addEventListener('visibilitychange', function () { if (!doc.hidden) onScroll(); });
    if ('ResizeObserver' in win) {
      var ro = new ResizeObserver(scheduleMeasure);
      ro.observe(root);
      if (doc.body) ro.observe(doc.body);
    }
    measure();
  }

  /* ---- Startup ------------------------------------------------------------ */
  function setReduced() {
    root.classList.toggle('hf-chrome-reduced', reduced());
  }

  function init() {
    root = doc.documentElement;
    if (!root) return;
    root.classList.add('hf-chrome');
    setReduced();

    attempt(initEyebrows);
    attempt(initLogoSweep);
    attempt(initScrollCue);
    attempt(initPressLogos);
    /* initBackToTop retired by art direction (ring duplicated the progress hairline). */

    if (reduceQuery) {
      var onChange = function () {
        setReduced();
        if (reduced()) {
          var handlers = onReduceHandlers.slice();
          onReduceHandlers.length = 0;
          handlers.forEach(attempt);
        }
      };
      if (typeof reduceQuery.addEventListener === 'function') reduceQuery.addEventListener('change', onChange);
      else if (typeof reduceQuery.addListener === 'function') reduceQuery.addListener(onChange);
    }
  }

  function safeInit() {
    try { init(); } catch (e) { /* decorative only; never break the page */ }
  }

  if (doc.readyState !== 'loading') safeInit();
  else doc.addEventListener('DOMContentLoaded', safeInit, { once: true });
})();
