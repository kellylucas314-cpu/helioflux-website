/* signature.js
   Live photon emission over the light-signature figure on the HelioFlux homepage
   (styles in signature.css).

   What it does: inside .hf-cellular-signals__media (the box holding the poster
   image and the looping video of normal cells on the left, atypical cells on the
   right, each with its waveform underneath) it adds one aria-hidden canvas and
   draws faint photons leaving the two cell clusters. The normal cells release one
   pale photon about every 0.9s, steady, small and slow, at one brightness. The
   atypical cells release irregular bursts of two to four brand-cyan photons,
   larger, faster and brighter, about one in seven carrying a tiny spark cross
   like the hero's specks. Every photon is a dot with a soft radial halo (6 to 9
   times its size), fading in and out over its life on a sine envelope. The two
   emitter ellipses are placed as fractions of the media box, measured from the
   880 x 696 video that fills it edge to edge (normal cells fill x .03 to .40,
   atypical cells x .66 to .99), and each side has a floor just above its
   waveform: photons fade out as they approach it and are retired below it, so
   both traces stay fully visible through every frame of the loop. Photon count
   is capped at 24, or 14 on screens up to 768px wide, where bursts are also a
   little sparser. Speeds are set for the 440px box the page shows and scale
   down with a narrower one, so the drift reads the same on a phone. The halos
   of the pale photons are drawn in cyan at low opacity because a pale halo on
   the page's cream paper would be invisible; the pale core stays pale.

   Attaches to: .hf-cellular-signals .hf-cellular-signals__media. No text or
   existing element is changed; the only new node is the canvas, which sits above
   the poster and the video and keeps working through the page's own
   poster-to-video swap. The wrapper gets data-hf-signature with the current
   state (running, offscreen, hidden, site-paused, reduced) and the canvas gets
   data-motion-time, both for inspection only.

   How it runs: requestAnimationFrame only, frame time clamped to 50ms. Layout is
   read once per size change through a ResizeObserver on the media box (never per
   frame); the canvas backing store uses devicePixelRatio capped at 2.

   How it pauses: it stops when the media box is off-screen (IntersectionObserver),
   when the tab is hidden, and when the visitor pauses motion on the site. The site
   signals that with the "helioflux:motion" event (detail.paused), but hero-motion.js
   fires the same event with paused true whenever the hero merely scrolls out of
   view, which is always the case while this figure is showing, and also whenever
   the hero video's play() rejects. So, as headlines.js and stats.js do, the hero's
   own pause button is consulted one microtask later: aria-pressed "true" on a
   button that is actually shown means the visitor asked for stillness; otherwise
   the hero only left the screen and the photons carry on. With no button on the
   page the event is taken at its word. Paused photons freeze in place and resume
   without a jump. prefers-reduced-motion: reduce draws nothing at all, and the
   preference is watched for changes. */

(function () {
  'use strict';

  var CYAN = '0,169,214';
  var PALE = '216,238,255';
  var PAD = 20;          // canvas bleed past the media box, px (matches signature.css)
  var MAX_DPR = 2;
  var MAX_DT = 0.05;     // seconds; no catch-up jump after a pause
  var TAU = Math.PI * 2;
  var DESIGN_WIDTH = 440; // px; the media box width the speeds were tuned at
  var SPARK_SHARE = 0.14; // share of cancer photons that carry a spark cross

  /* Emitters, as fractions of the media box. cx and cy are fractions of the box
     width and height; rx and ry are both fractions of the width so the ellipse
     keeps its shape (the box has a fixed 880:696 ratio). floor is the fraction
     of the height below which no photon is drawn. Measured across the video
     loop: normal cells fill x .03 to .40, y .22 to .70, and the bell beneath
     them peaks at .66 at its tallest; atypical cells fill x .66 to .99,
     y .22 to .72, and the disrupted trace's highest peaks reach .61. */
  var EMITTERS = {
    normal: { cx: 0.21, cy: 0.45, rx: 0.17, ry: 0.18, floor: 0.67 },
    cancer: { cx: 0.825, cy: 0.40, rx: 0.15, ry: 0.13, floor: 0.57 }
  };

  function rand(a, b) { return a + Math.random() * (b - a); }
  function smooth(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }

  function init() {
    var figure = document.querySelector('.hf-cellular-signals');
    var media = figure && figure.querySelector('.hf-cellular-signals__media');
    if (!media || media.getAttribute('data-hf-signature')) return;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    media.setAttribute('data-hf-signature', 'init');
    canvas.className = 'hf-signature-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    // Layout lives in signature.css; these inline values only keep the canvas out
    // of the way should the stylesheet ever be missing. No display here, so the
    // stylesheet's reduced-motion and print rules can hide it.
    canvas.style.cssText = 'position:absolute;top:' + (-PAD) + 'px;left:' + (-PAD) +
      'px;pointer-events:none;z-index:2;';
    media.appendChild(canvas);

    var reduce = null;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) { reduce = null; }
    function reduced() { return !!(reduce && reduce.matches); }

    var W = 0, H = 0, dpr = 1, mobile = false, cap = 24, scale = 1;
    var photons = [], pending = [];
    var elapsed = 0, nextNormal = 0, nextBurst = 0, seeded = false;
    var inView = false, sitePaused = false, eventPaused = false;
    var frame = 0, previous = 0;

    /* ---- size ---- */

    function size(w, h) {
      var ratioX = W > 0 ? w / W : 1, ratioY = H > 0 ? h / H : 1;
      W = w; H = h;
      var viewport = window.innerWidth || document.documentElement.clientWidth || 1024;
      mobile = viewport <= 768;
      cap = mobile ? 14 : 24;
      // Drift speeds were set for the 440px box; a narrower box slows them to match.
      scale = Math.max(0.6, Math.min(1, W / DESIGN_WIDTH));
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      var cw = W + PAD * 2, ch = H + PAD * 2;
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(ch * dpr));
      canvas.style.width = cw + 'px';
      canvas.style.height = ch + 'px';
      // Draw in CSS pixels of the media box, origin at its top-left corner.
      ctx.setTransform(dpr, 0, 0, dpr, PAD * dpr, PAD * dpr);
      // Keep live photons over the same part of the artwork.
      for (var i = 0; i < photons.length; i++) {
        var p = photons[i];
        p.x *= ratioX; p.y *= ratioY; p.vx *= ratioX; p.vy *= ratioY;
      }
      paint();
    }

    function measure() {
      var r = media.getBoundingClientRect();
      size(r.width, r.height);
      sync();
    }

    /* ---- photons ---- */

    function spawn(kind, age) {
      if (photons.length >= cap || W <= 0) return;
      var g = EMITTERS[kind], normal = kind === 'normal';
      var floorY = g.floor * H, tries = 4, a, k, x, y;
      do {
        a = Math.random() * TAU;
        k = rand(0.5, 1);
        x = g.cx * W + Math.cos(a) * g.rx * W * k;
        y = g.cy * H + Math.sin(a) * g.ry * W * k;
      } while (y > floorY - 0.05 * H && --tries > 0);
      if (y > floorY - 0.05 * H) return;
      // Outward from the cluster center, with a little lift so the light rises
      // off the cells rather than sinking toward the traces.
      var dx = x - g.cx * W, dy = y - g.cy * H, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var speed = normal ? rand(8, 13) : rand(16, 26);
      var lift = normal ? 2 : 4;
      var p = {
        kind: kind,
        x: x, y: y,
        vx: dx / len * speed,
        vy: dy / len * speed - lift,
        size: normal ? 1.4 : rand(1.6, 2.4),
        life: normal ? rand(3, 4) : rand(1.5, 2.4),
        age: age || 0,
        bright: normal ? 0.7 : rand(0.7, 0.9),
        halo: normal ? 10 : rand(6, 9),
        spark: false,
        phase: Math.random() * TAU
      };
      p.x += p.vx * p.age;
      p.y += p.vy * p.age;
      photons.push(p);
    }

    // A few photons already mid-flight the first time the figure runs, so it
    // never shows an empty beat before the first emission.
    function seed() {
      seeded = true;
      var i, p;
      for (i = 0; i < 3; i++) {
        spawn('normal', 0);
        p = photons[photons.length - 1];
        if (p && p.kind === 'normal') { p.age = Math.random() * p.life * 0.8; }
      }
      for (i = 0; i < 3; i++) {
        spawn('cancer', 0);
        p = photons[photons.length - 1];
        if (p && p.kind === 'cancer') { p.age = Math.random() * p.life * 0.6; }
      }
      nextNormal = elapsed + rand(0.3, 0.9);
      nextBurst = elapsed + rand(0.3, 1.0);
    }

    function schedule() {
      if (elapsed >= nextNormal) {
        spawn('normal', 0);
        nextNormal = elapsed + (mobile ? 1.15 : 0.9) + rand(-0.07, 0.07);
      }
      if (elapsed >= nextBurst) {
        var n = mobile ? 2 : 2 + Math.floor(Math.random() * 2);
        for (var i = 0; i < n; i++) pending.push(elapsed + i * rand(0.03, 0.1));
        nextBurst = elapsed + rand(0.7, 2.2);
      }
      for (var j = pending.length - 1; j >= 0; j--) {
        if (pending[j] <= elapsed) { pending.splice(j, 1); spawn('cancer', 0); }
      }
    }

    function step(dt) {
      elapsed += dt;
      schedule();
      for (var i = photons.length - 1; i >= 0; i--) {
        var p = photons[i];
        p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.age >= p.life || p.y > EMITTERS[p.kind].floor * H ||
            p.x < -PAD || p.x > W + PAD || p.y < -PAD) {
          photons.splice(i, 1);
        }
      }
    }

    function paint() {
      ctx.clearRect(-PAD, -PAD, W + PAD * 2, H + PAD * 2);
      if (reduced()) return;
      for (var i = 0; i < photons.length; i++) {
        var p = photons[i], normal = p.kind === 'normal';
        var envelope = Math.pow(Math.sin(Math.PI * p.age / p.life), 0.85);
        // Fade out above the waveform floor and across the bleed zone at the edges.
        var fade = smooth((EMITTERS[p.kind].floor * H - p.y) / (H * 0.06));
        fade *= smooth((p.x + PAD) / PAD) * smooth((W + PAD - p.x) / PAD) * smooth((p.y + PAD) / PAD);
        var flicker = normal ? 1 : 0.88 + 0.12 * Math.sin(elapsed * 5.5 + p.phase);
        var alpha = p.bright * envelope * fade * flicker;
        if (alpha <= 0.005) continue;
        var reach = p.size * p.halo;
        var haloAlpha = alpha * (normal ? 0.42 : 0.36);
        var halo = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, reach);
        halo.addColorStop(0, 'rgba(' + CYAN + ',' + haloAlpha.toFixed(3) + ')');
        halo.addColorStop(1, 'rgba(' + CYAN + ',0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(p.x, p.y, reach, 0, TAU); ctx.fill();
        var color = normal ? PALE : CYAN;
        ctx.fillStyle = 'rgba(' + color + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
        if (p.spark && alpha > 0.5) {
          ctx.strokeStyle = 'rgba(' + CYAN + ',' + (alpha * 0.35).toFixed(3) + ')';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 3, p.y); ctx.lineTo(p.x + p.size * 3, p.y);
          ctx.moveTo(p.x, p.y - p.size * 3); ctx.lineTo(p.x, p.y + p.size * 3);
          ctx.stroke();
        }
      }
    }

    /* ---- run state ---- */

    function running() {
      return inView && !document.hidden && !sitePaused && !reduced() && W > 0 && H > 0;
    }

    function tick(now) {
      frame = 0;
      if (!running()) return;
      var dt = previous ? Math.min((now - previous) / 1000, MAX_DT) : 0;
      previous = now;
      step(dt);
      paint();
      canvas.setAttribute('data-motion-time', elapsed.toFixed(3));
      frame = window.requestAnimationFrame(tick);
    }

    function sync() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0; previous = 0;
      var state = reduced() ? 'reduced' : W <= 0 ? 'unsized' : !inView ? 'offscreen' :
        document.hidden ? 'hidden' : sitePaused ? 'site-paused' : 'running';
      media.setAttribute('data-hf-signature', state);
      if (reduced()) {
        photons.length = 0; pending.length = 0; seeded = false;
        paint(); // clears the canvas: the finished, static state is the artwork alone
        return;
      }
      if (!running()) return;
      if (!seeded) seed();
      frame = window.requestAnimationFrame(tick);
    }

    /* ---- site motion toggle ---- */

    function pauseButton() {
      return document.querySelector('.cell-pause[aria-pressed]');
    }

    // Pressed, and something a visitor could actually have pressed. A control
    // nobody can see cannot carry the visitor's choice.
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

    function afterCurrentTask(fn) {
      if (typeof Promise === 'function') Promise.resolve().then(fn);
      else window.setTimeout(fn, 0);
    }

    /* ---- wiring ---- */

    window.addEventListener('helioflux:motion', function (event) {
      eventPaused = !!(event && event.detail && event.detail.paused);
      afterCurrentTask(applyMotionEvent);
    });
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pageshow', sync);
    if (reduce) {
      if (typeof reduce.addEventListener === 'function') reduce.addEventListener('change', sync);
      else if (typeof reduce.addListener === 'function') reduce.addListener(sync);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(media);
    } else {
      inView = true;
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(function (entries) {
        var rect = entries[entries.length - 1].contentRect;
        size(rect.width, rect.height);
        sync();
      }).observe(media);
    } else {
      window.addEventListener('resize', measure, { passive: true });
      window.addEventListener('load', measure);
    }
    // A zoom change alters devicePixelRatio without resizing the box.
    window.addEventListener('resize', function () {
      if (Math.min(window.devicePixelRatio || 1, MAX_DPR) !== dpr && W > 0) size(W, H);
    }, { passive: true });

    measure();
  }

  function safeInit() {
    try { init(); } catch (e) { /* decorative only; never break the page */ }
  }

  if (document.readyState !== 'loading') safeInit();
  else document.addEventListener('DOMContentLoaded', safeInit, { once: true });
})();
