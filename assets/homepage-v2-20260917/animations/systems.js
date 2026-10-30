/* systems.js
   Motion for the QSense and LuminAI product cards on the HelioFlux homepage
   (#two-systems .hf-products-atlas; styles in systems.css).

   What it does:
   1. Entrance. When the atlas is a quarter on screen (IntersectionObserver,
      threshold .25, once) the two cards rise 18px into place over 700ms, the
      LuminAI card 90ms behind the QSense card. The cards sit inside a ".reveal"
      block that the page itself fades in, so the hidden start state is only set
      (class hf-sys-armed on the atlas) when that block already has class "in",
      or at the moment this observer fires; if the block is still fading, the
      rise waits for its "in" class (MutationObserver) so both land together. A
      2500ms guard shows the cards no matter what, so they can never be left
      invisible. With no IntersectionObserver the cards simply show.
   2. QSense sweep. One <span class="hf-sys-sweep"> is appended to the QSense
      .hf-product-media: a 1px cyan hairline with a soft glow that travels from
      the top of the art to the bottom over 1.8s (a CSS animation, started by
      adding "is-on"). It runs once, 400ms after the cards rise, and again each
      time a mouse (hover: hover and pointer: fine) enters the card; a sweep in
      flight is left to finish. The media height it travels is written to the
      custom property --hf-sys-media-h from a ResizeObserver, never per frame.
   3. LuminAI trace. One <svg class="hf-sys-trace"> is appended to the LuminAI
      .hf-product-media, bottom-left, 38% of the media width and 28px tall. A
      polyline of samples 2px apart scrolls left at 40px/s like a bedside
      monitor: a nearly flat baseline with a small cluster of spikes every 2.8s,
      and a 2px pale photon with a soft halo riding the newest sample at the
      right edge. The left 28% of the trace fades out through an SVG mask so the
      old signal dissolves rather than being cut. Per frame the script moves one
      <g> by a sub-pixel translate and repositions the dot; the points string is
      rebuilt only when a new sample enters (every 50ms). The viewBox matches the
      rendered size (one CSS px per unit), kept current by a ResizeObserver on
      the SVG; without ResizeObserver a debounced window resize is used.
   4. Hover is pure CSS (see systems.css); this script only adds the class
      hf-sys-card to both cards so those rules can take hold.

   Attaches to: #two-systems .hf-products-atlas, its .qs-card and .lum-card and
   their .hf-product-media boxes. It adds classes (hf-sys-card, hf-sys-armed,
   hf-sys-in, hf-sys-paused), a data-hf-systems attribute on the LuminAI media
   that names the trace state, and the two decorative nodes (aria-hidden, with
   pointer-events: none). No text and no existing element is changed or moved.
   Every lookup is guarded, so a missing card or media box just skips that part.

   How it pauses: the trace loop runs on requestAnimationFrame and only while
   the LuminAI media is on screen (IntersectionObserver, threshold 0), the tab is
   visible, and the visitor has not paused motion on the site. The site signals
   that with the "helioflux:motion" event (detail.paused), but hero-motion.js
   fires the same event with paused true whenever the hero merely scrolls out of
   view, which is always the case while these cards are showing, and whenever
   the hero video's play() rejects. So, as the other modules do, the hero's own
   pause button is consulted one microtask later: aria-pressed "true" on a
   button that is actually shown means the visitor asked for stillness;
   otherwise the hero only left the screen and the trace carries on. With no
   button on the page the event is taken at its word. A pause also holds the
   sweep in place (class hf-sys-paused, animation-play-state). The trace freezes
   where it is and resumes without a jump (frame time is capped at 50ms).
   prefers-reduced-motion: reduce shows the finished state: cards visible, no
   sweep, and the trace drawn once and left still; the preference is watched for
   changes in both directions. */

(function () {
  'use strict';

  var ENTRANCE_THRESHOLD = 0.25;
  var ENTRANCE_GUARD_MS = 2500;
  var SWEEP_DELAY_MS = 400;        // after the cards start rising
  var TRACE_SPEED = 40;            // px per second
  var TRACE_SPACING = 2;           // px between samples
  var TRACE_H = 28;                // px, matches systems.css
  var TRACE_BASE = 20;             // baseline y inside the 28px box
  var CLUSTER_PERIOD = 2.8;        // seconds between spike clusters
  var MAX_DT = 0.05;               // seconds; a long gap resumes gently
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SPIKES = [                   // the cluster: three spikes and one undershoot
    { at: 0.30, amp: 13, half: 0.07 },
    { at: 0.38, amp: -2.4, half: 0.045 },
    { at: 0.47, amp: 8, half: 0.06 },
    { at: 0.61, amp: 4.5, half: 0.05 }
  ];

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVG_NS, name);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, attrs[k]);
    }
    return el;
  }

  function media(query) {
    try { return window.matchMedia(query); } catch (e) { return null; }
  }

  function onMediaChange(mq, fn) {
    if (!mq) return;
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', fn);
    else if (typeof mq.addListener === 'function') mq.addListener(fn);
  }

  function afterCurrentTask(fn) {
    if (typeof Promise === 'function') Promise.resolve().then(fn);
    else window.setTimeout(fn, 0);
  }

  function init() {
    var atlas = document.querySelector('#two-systems .hf-products-atlas');
    if (!atlas || atlas.getAttribute('data-hf-systems-ready')) return;
    atlas.setAttribute('data-hf-systems-ready', 'true');

    var qs = atlas.querySelector('.qs-card');
    var lum = atlas.querySelector('.lum-card');
    var cards = [];
    if (qs) cards.push(qs);
    if (lum) cards.push(lum);
    if (!cards.length) return;
    for (var i = 0; i < cards.length; i++) cards[i].classList.add('hf-sys-card');

    var qsMedia = qs ? qs.querySelector('.hf-product-media') : null;
    var lumMedia = lum ? lum.querySelector('.hf-product-media') : null;

    var reduce = media('(prefers-reduced-motion: reduce)');
    var fine = media('(hover: hover) and (pointer: fine)');
    function reduced() { return !!(reduce && reduce.matches); }

    var sitePaused = false, eventPaused = false;

    /* ---------------- 1. Entrance ---------------- */

    var parentReveal = null;
    try { parentReveal = atlas.closest ? atlas.closest('.reveal') : null; } catch (e) { parentReveal = null; }
    var armed = false, shown = false, guard = 0, parentWatch = null;

    function parentIn() {
      if (!parentReveal) return true;
      if (!document.body || !document.body.classList.contains('js-ready')) return true;
      return parentReveal.classList.contains('in');
    }

    function arm() {
      if (armed || shown || reduced()) return;
      armed = true;
      atlas.classList.add('hf-sys-armed');
      guard = window.setTimeout(show, ENTRANCE_GUARD_MS);
    }

    function show() {
      if (shown) return;
      shown = true;
      if (guard) { window.clearTimeout(guard); guard = 0; }
      if (parentWatch) { parentWatch.disconnect(); parentWatch = null; }
      if (armed) {
        // The hidden state must be painted before the rise, or there is no transition.
        void atlas.offsetWidth;
        atlas.classList.add('hf-sys-in');
      }
      window.setTimeout(runSweep, SWEEP_DELAY_MS);
    }

    // Called once, when the atlas is a quarter on screen.
    function onEnter() {
      if (shown) return;
      if (parentIn()) { arm(); show(); return; }
      // The page is still fading the parent in: hide the cards now (the parent
      // hides them anyway) and rise together with it when "in" arrives.
      arm();
      if (parentReveal && 'MutationObserver' in window) {
        parentWatch = new MutationObserver(function () {
          if (parentReveal.classList.contains('in')) show();
        });
        parentWatch.observe(parentReveal, { attributes: true, attributeFilter: ['class'] });
      } else {
        show();
      }
      if (!armed && !guard) guard = window.setTimeout(show, ENTRANCE_GUARD_MS);
    }

    if (parentIn()) arm();

    if ('IntersectionObserver' in window) {
      var enterObs = new IntersectionObserver(function (entries) {
        for (var j = 0; j < entries.length; j++) {
          if (entries[j].isIntersecting) { enterObs.disconnect(); onEnter(); return; }
        }
      }, { threshold: ENTRANCE_THRESHOLD });
      enterObs.observe(atlas);
    } else {
      show();
    }

    /* ---------------- 2. QSense sweep ---------------- */

    var sweep = null, sweeping = false;
    if (qsMedia) {
      sweep = document.createElement('span');
      sweep.className = 'hf-sys-sweep';
      sweep.setAttribute('aria-hidden', 'true');
      qsMedia.appendChild(sweep);
      var sweepDone = function () { sweep.classList.remove('is-on'); sweeping = false; };
      sweep.addEventListener('animationend', sweepDone);
      sweep.addEventListener('animationcancel', sweepDone);
      /* Hover replay retired by art direction: the scan runs once, after the cards rise. */
    }

    function runSweep() {
      if (!sweep || sweeping || reduced() || document.hidden || sitePaused) return;
      sweeping = true;
      sweep.classList.remove('is-on');
      void sweep.offsetWidth;
      sweep.classList.add('is-on');
    }

    /* ---------------- 3. LuminAI trace ---------------- */

    var trace = null;
    if (lumMedia) trace = buildTrace(lumMedia);

    function buildTrace(host) {
      var uid = Math.floor(Math.random() * 1e9).toString(36);
      var svg = svgEl('svg', {
        'class': 'hf-sys-trace', 'aria-hidden': 'true', focusable: 'false',
        viewBox: '0 0 160 ' + TRACE_H
      });
      var defs = svgEl('defs', {});
      var fade = svgEl('linearGradient', { id: 'hf-sys-fade-' + uid, x1: '0', y1: '0', x2: '1', y2: '0' });
      fade.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '0' }));
      fade.appendChild(svgEl('stop', { offset: '0.28', 'stop-color': '#fff', 'stop-opacity': '1' }));
      fade.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '1' }));
      var mask = svgEl('mask', { id: 'hf-sys-mask-' + uid, maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '160', height: TRACE_H });
      var maskRect = svgEl('rect', { x: '0', y: '0', width: '160', height: TRACE_H, fill: 'url(#hf-sys-fade-' + uid + ')' });
      mask.appendChild(maskRect);
      var halo = svgEl('radialGradient', { id: 'hf-sys-halo-' + uid });
      halo.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'rgb(0,169,214)', 'stop-opacity': '.55' }));
      halo.appendChild(svgEl('stop', { offset: '0.45', 'stop-color': 'rgb(0,169,214)', 'stop-opacity': '.2' }));
      halo.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'rgb(0,169,214)', 'stop-opacity': '0' }));
      defs.appendChild(fade);
      defs.appendChild(mask);
      defs.appendChild(halo);
      svg.appendChild(defs);

      var masked = svgEl('g', { mask: 'url(#hf-sys-mask-' + uid + ')' });
      var scroll = svgEl('g', { 'class': 'hf-sys-trace__scroll' });
      var line = svgEl('polyline', { 'class': 'hf-sys-trace__line', points: '' });
      scroll.appendChild(line);
      masked.appendChild(scroll);
      svg.appendChild(masked);
      var haloDot = svgEl('circle', { 'class': 'hf-sys-trace__halo', r: '5', fill: 'url(#hf-sys-halo-' + uid + ')' });
      var core = svgEl('circle', { 'class': 'hf-sys-trace__core', r: '1.5' });
      svg.appendChild(haloDot);
      svg.appendChild(core);
      host.appendChild(svg);

      return { host: host, svg: svg, maskRect: maskRect, mask: mask, scroll: scroll, line: line, halo: haloDot, core: core, W: 0 };
    }

    // Signal model: shared by the live loop and the static (reduced motion) draw.
    var ys = [], count = 0, offset = 0, clock = 0;
    var noise = 0, noiseTarget = 0, noiseLeft = 0;
    var dtSample = TRACE_SPACING / TRACE_SPEED;
    var stillDrawn = false;          // the reduced-motion still frame is drawn once per layout

    function sampleAt(t) {
      if (noiseLeft <= 0) { noiseTarget = (Math.random() - 0.5) * 1.3; noiseLeft = 3 + Math.floor(Math.random() * 5); }
      noiseLeft--;
      noise += (noiseTarget - noise) * 0.35;
      var phase = t % CLUSTER_PERIOD;
      var spike = 0;
      for (var s = 0; s < SPIKES.length; s++) {
        var d = Math.abs(phase - SPIKES[s].at);
        if (d < SPIKES[s].half) spike += SPIKES[s].amp * (1 - d / SPIKES[s].half);
      }
      var y = TRACE_BASE - spike + noise;
      return y < 2 ? 2 : y > TRACE_H - 2 ? TRACE_H - 2 : y;
    }

    // Fill the buffer so a spike cluster sits a little past the middle, and the
    // clock continues from there; the first frame already shows a living trace.
    function seed(n) {
      ys.length = 0;
      noise = 0; noiseLeft = 0;
      var t0 = CLUSTER_PERIOD + SPIKES[0].at - 0.55 * n * dtSample;
      t0 -= 0.5 * dtSample;
      for (var k = 0; k < n; k++) ys.push(sampleAt(t0 + k * dtSample));
      count = n;
      clock = t0 + n * dtSample;
      offset = 0;
    }

    function layoutTrace(w) {
      if (!trace) return;
      w = Math.max(0, Math.round(w));
      if (w === trace.W) return;
      trace.W = w;
      if (w <= 0) return;
      trace.svg.setAttribute('viewBox', '0 0 ' + w + ' ' + TRACE_H);
      trace.mask.setAttribute('width', w);
      trace.maskRect.setAttribute('width', w);
      seed(Math.ceil(w / TRACE_SPACING) + 2);
      writePoints();
      paint();
      stillDrawn = true;
    }

    function writePoints() {
      var parts = new Array(count);
      for (var k = 0; k < count; k++) parts[k] = (k * TRACE_SPACING) + ',' + ys[k].toFixed(2);
      trace.line.setAttribute('points', parts.join(' '));
    }

    function advance(dt) {
      offset += TRACE_SPEED * dt;
      var added = false;
      while (offset >= TRACE_SPACING) {
        offset -= TRACE_SPACING;
        ys.shift();
        ys.push(sampleAt(clock));
        clock += dtSample;
        added = true;
      }
      if (added) writePoints();
    }

    function paint() {
      if (!trace || trace.W <= 0) return;
      trace.scroll.setAttribute('transform', 'translate(' + (-offset).toFixed(2) + ' 0)');
      // The photon rides the trace at the right edge of the box.
      var pos = (trace.W + offset) / TRACE_SPACING;
      var k = Math.floor(pos);
      if (k >= count - 1) k = count - 2;
      var f = pos - k;
      var y = ys[k] + (ys[k + 1] - ys[k]) * f;
      var cx = trace.W.toFixed(1), cy = y.toFixed(2);
      trace.halo.setAttribute('cx', cx); trace.halo.setAttribute('cy', cy);
      trace.core.setAttribute('cx', cx); trace.core.setAttribute('cy', cy);
    }

    /* ---------------- run state ---------------- */

    var inView = false, frame = 0, previous = 0;

    function running() {
      return !!trace && trace.W > 0 && inView && !document.hidden && !sitePaused && !reduced();
    }

    function tick(now) {
      frame = 0;
      if (!running()) return;
      var dt = previous ? Math.min((now - previous) / 1000, MAX_DT) : 0;
      previous = now;
      advance(dt);
      paint();
      stillDrawn = false;
      frame = window.requestAnimationFrame(tick);
    }

    function sync() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0; previous = 0;
      var hold = document.hidden || sitePaused;
      atlas.classList.toggle('hf-sys-paused', hold);
      if (!trace) return;
      var state = reduced() ? 'reduced' : trace.W <= 0 ? 'unsized' : !inView ? 'offscreen' :
        document.hidden ? 'hidden' : sitePaused ? 'site-paused' : 'running';
      trace.host.setAttribute('data-hf-systems', state);
      if (reduced()) {
        // The finished, static state: one still trace with a cluster in view,
        // drawn once per layout so it does not change shape each time the card
        // scrolls into view or the tab comes back.
        if (trace.W > 0 && !stillDrawn) { seed(count); writePoints(); paint(); stillDrawn = true; }
        return;
      }
      if (!running()) return;
      frame = window.requestAnimationFrame(tick);
    }

    /* ---------------- site pause ---------------- */

    function pauseButton() {
      return document.querySelector('.cell-pause[aria-pressed]');
    }

    function visitorPressed(button) {
      if (button.getAttribute('aria-pressed') !== 'true') return false;
      try {
        var cs = window.getComputedStyle(button);
        return cs.display !== 'none' && cs.visibility !== 'hidden';
      } catch (e) { return true; }
    }

    // One microtask after helioflux:motion, hero-motion.js has written the
    // visitor's own choice to its button; that is the state that matters here.
    function applyMotionEvent() {
      var button = pauseButton();
      if (!eventPaused) sitePaused = false;
      else if (!button) sitePaused = true;
      else sitePaused = visitorPressed(button);
      sync();
    }

    /* ---------------- wiring ---------------- */

    window.addEventListener('helioflux:motion', function (event) {
      eventPaused = !!(event && event.detail && event.detail.paused);
      afterCurrentTask(applyMotionEvent);
    });
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pageshow', sync);
    onMediaChange(reduce, function () {
      if (reduced() && !shown) {
        // Reduced motion arrived before the rise: the cards simply show, and
        // stay shown if the preference is switched back later.
        shown = true;
        armed = false;
        atlas.classList.remove('hf-sys-armed');
        if (guard) { window.clearTimeout(guard); guard = 0; }
        if (parentWatch) { parentWatch.disconnect(); parentWatch = null; }
      }
      sync();
    });

    if (trace) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          inView = entries[entries.length - 1].isIntersecting;
          sync();
        }, { threshold: 0 }).observe(trace.host);
      } else {
        inView = true;
      }
    }

    // Layout is read in observer callbacks (or a debounced resize), never per frame.
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function (entries) {
        for (var e = 0; e < entries.length; e++) {
          var entry = entries[e];
          if (trace && entry.target === trace.svg) {
            var w = entry.contentRect ? entry.contentRect.width : trace.svg.getBoundingClientRect().width;
            var had = trace.W > 0;
            layoutTrace(w);
            if (!had && trace.W > 0) sync();
          } else if (qsMedia && entry.target === qsMedia) {
            var h = entry.contentRect ? entry.contentRect.height : qsMedia.getBoundingClientRect().height;
            if (h > 0) qsMedia.style.setProperty('--hf-sys-media-h', Math.round(h) + 'px');
          }
        }
      });
      if (trace) ro.observe(trace.svg);
      if (qsMedia) ro.observe(qsMedia);
    } else {
      var measure = function () {
        if (trace) {
          var had = trace.W > 0;
          layoutTrace(trace.svg.getBoundingClientRect().width);
          if (!had && trace.W > 0) sync();
        }
        if (qsMedia) {
          var h = qsMedia.getBoundingClientRect().height;
          if (h > 0) qsMedia.style.setProperty('--hf-sys-media-h', Math.round(h) + 'px');
        }
      };
      var resizeTimer = 0;
      window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(measure, 150);
      });
      measure();
    }

    // A visitor who pressed the hero's pause button before this script ran has
    // already asked for stillness; the event that said so has come and gone.
    var initialButton = pauseButton();
    if (initialButton && visitorPressed(initialButton)) sitePaused = true;

    sync();
  }

  if (document.readyState !== 'loading') {
    try { init(); } catch (e) { /* never let a decoration break the page */ }
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      try { init(); } catch (e) { /* never let a decoration break the page */ }
    });
  }
})();
