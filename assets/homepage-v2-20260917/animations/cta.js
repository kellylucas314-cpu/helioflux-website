/* cta.js
   Quiet motion for the closing navy section of the HelioFlux homepage
   (section.cta-section#contact: "The science works. The next step is human
   data."). Styles in cta.css; this file draws the photon field, adds two
   decorative elements, and decides when the CSS animations may run.

   What it does:
   - Photon field. Inserts one canvas (class "hf-cta-photons", aria-hidden,
     pointer-events none) right after .cta-glow, filling the section at
     z-index 0, and gives every other direct child of the section the class
     "hf-cta-above" so the heading, lead and buttons sit above it. On the
     canvas a sparse field drifts slowly: 28 specks on screens wider than 768px,
     12 at 768px and under. Each is a dot of .6 to 1.6px, brand cyan for close
     to half and pale blue-white for the rest, moving 2 to 6px a second with a
     slight upward bias, fading in and out along a sine envelope over a 10 to
     20 second life, with a gentle twinkle. A third carry a wider soft cyan
     halo; the rest a tight faint one. It is the hero's visual language, calmer,
     and without the hero's pointer parallax. The backing store is scaled by
     devicePixelRatio capped at 2. Layout is read once per resize
     (ResizeObserver on the section), never per frame; a resize rescales the
     specks in place instead of respawning them.
   - Marks the primary button (.cta-actions .btn-cyan) with "hf-cta-btn" and
     appends an empty span (class "hf-cta-sweep", aria-hidden) inside it. The
     CSS runs the hover light sweep on that span and the idle breath ring on the
     button's ::before. No existing text or element is changed.
   - Keeps "hf-cta-run" on the section only while motion may run; the CSS
     breath follows that class.

   Where it attaches: section.cta-section#contact (falling back to #contact or
   the first .cta-section). If the section is missing the script does nothing,
   and nothing in it throws when the glow, the actions row, the button or the
   2d context is absent. It initializes at once when the document has already
   parsed, otherwise on DOMContentLoaded, and runs only once per section.

   How it pauses: the requestAnimationFrame loop stops (and "hf-cta-run" comes
   off) when the section leaves the screen (IntersectionObserver, any pixel),
   when the tab is hidden (visibilitychange) and when the visitor has paused
   motion on the site. The site signals that with the "helioflux:motion" event
   (detail.paused), but hero-motion.js also fires it with paused true whenever
   the hero merely scrolls out of view, which is always the case while this
   section shows. So, as the other homepage modules do, the hero's own pause
   button is consulted one microtask later: aria-pressed "true" on a button
   that is actually displayed means the visitor asked for stillness; otherwise
   the hero only left the screen and the field carries on. On resume the clock
   restarts from the next frame, so nothing jumps. prefers-reduced-motion:
   reduce draws nothing at all (the canvas is cleared and hidden, the ring and
   sweep are off), and a change in that preference either way is honored on
   the spot. */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    var COUNT_WIDE = 28;
    var COUNT_NARROW = 12;
    var CYAN = '0,169,214';
    var PALE = '216,238,255';
    var TAU = Math.PI * 2;
    var MAX_DT = .05;

    var doc = document;
    var section = doc.querySelector('section.cta-section#contact')
      || doc.getElementById('contact')
      || doc.querySelector('.cta-section');
    if (!section) return;
    if (section.getAttribute('data-hf-cta') === 'ready') return;
    section.setAttribute('data-hf-cta', 'ready');

    var glow = section.querySelector('.cta-glow');
    if (glow && glow.parentNode !== section) glow = null;
    var actions = section.querySelector('.cta-actions');
    var button = actions ? actions.querySelector('.btn-cyan') : null;

    var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var narrow = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
    var reduced = !!(reduce && reduce.matches);

    /* ---------- decorative elements ---------- */

    var canvas = doc.createElement('canvas');
    canvas.className = 'hf-cta-photons';
    canvas.setAttribute('aria-hidden', 'true');
    var ctx = null;
    try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
    if (glow && glow.parentNode === section) {
      section.insertBefore(canvas, glow.nextSibling);
    } else {
      section.insertBefore(canvas, section.firstChild);
    }

    var kids = section.children, k;
    for (k = 0; k < kids.length; k++) {
      if (kids[k] === canvas || kids[k] === glow) continue;
      kids[k].classList.add('hf-cta-above');
    }

    if (button) {
      button.classList.add('hf-cta-btn');
      if (!button.querySelector('.hf-cta-sweep')) {
        var sweep = doc.createElement('span');
        sweep.className = 'hf-cta-sweep';
        sweep.setAttribute('aria-hidden', 'true');
        button.appendChild(sweep);
      }
    }
    section.classList.add('hf-cta-ready');

    /* ---------- the field ---------- */

    var width = 0, height = 0;
    var particles = [];
    var elapsed = 0, previous = 0, request = 0, stampAt = -1;
    var inView = false, eventPaused = false, userPaused = false;

    function rand(a, b) { return a + Math.random() * (b - a); }
    function wanted() { return narrow && narrow.matches ? COUNT_NARROW : COUNT_WIDE; }

    function create(warm) {
      var life = rand(10, 20);
      var speed = rand(2, 5.4);
      var angle = Math.random() * TAU;
      return {
        life: life,
        age: warm ? Math.random() * life : 0,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - .6,
        size: rand(.6, 1.6),
        color: Math.random() < .45 ? CYAN : PALE,
        glow: Math.random() < .34,
        brightness: rand(.3, .66),
        phase: Math.random() * TAU,
        rate: rand(.55, 1.05)
      };
    }

    function clear() {
      if (ctx) ctx.clearRect(0, 0, width, height);
    }

    function draw(dt) {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      elapsed += dt;
      var i, q, envelope, twinkle, alpha, reach, haloColor, halo;
      for (i = 0; i < particles.length; i++) {
        q = particles[i];
        q.age += dt;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        if (q.age >= q.life || q.x < -30 || q.x > width + 30 || q.y < -30 || q.y > height + 30) {
          particles[i] = create(false);
          continue;
        }
        envelope = Math.pow(Math.sin(Math.PI * q.age / q.life), .85);
        twinkle = .8 + .2 * Math.sin(elapsed * q.rate + q.phase);
        alpha = q.brightness * envelope * twinkle;
        if (alpha < .012) continue;
        reach = q.size * (q.glow ? 9 : 4.5);
        haloColor = q.glow ? CYAN : q.color;
        halo = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, reach);
        halo.addColorStop(0, 'rgba(' + haloColor + ',' + (alpha * (q.glow ? .4 : .22)).toFixed(3) + ')');
        halo.addColorStop(1, 'rgba(' + haloColor + ',0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(q.x, q.y, reach, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(' + q.color + ',' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.size, 0, TAU);
        ctx.fill();
      }
      // A coarse clock on the element, four writes a second, for anyone checking
      // that the field is alive. Not read by anything here.
      var stamp = Math.floor(elapsed * 4);
      if (stamp !== stampAt) {
        stampAt = stamp;
        canvas.setAttribute('data-motion-time', elapsed.toFixed(2));
      }
    }

    function resize() {
      if (!ctx) return;
      var rect = section.getBoundingClientRect();
      var w = Math.round(rect.width), h = Math.round(rect.height);
      if (!w || !h) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var oldW = width, oldH = height;
      width = w;
      height = h;
      var i;
      if (oldW && oldH) {
        for (i = 0; i < particles.length; i++) {
          particles[i].x *= w / oldW;
          particles[i].y *= h / oldH;
        }
      }
      var n = wanted();
      while (particles.length > n) particles.pop();
      while (particles.length < n) particles.push(create(true));
      canvas.setAttribute('data-count', String(n));
      if (reduced) clear(); else draw(0);
    }

    function running() {
      return !!ctx && inView && !doc.hidden && !userPaused && !reduced && width > 0 && height > 0;
    }

    function tick(now) {
      request = 0;
      if (!running()) return;
      var dt = previous ? Math.min((now - previous) / 1000, MAX_DT) : 0;
      previous = now;
      draw(dt);
      request = window.requestAnimationFrame(tick);
    }

    function sync() {
      if (request) window.cancelAnimationFrame(request);
      request = 0;
      previous = 0;
      var run = running();
      section.classList.toggle('hf-cta-run', run);
      section.classList.toggle('hf-cta-reduced', reduced);
      if (reduced) clear();
      if (run) request = window.requestAnimationFrame(tick);
    }

    /* ---------- pausing conventions, shared with the other modules ---------- */

    function pauseButton() {
      return doc.querySelector('.cell-pause[aria-pressed]');
    }
    // Pressed, and something a visitor could actually have pressed. The current
    // stylesheet hides the hero's button, and hero-motion.js also presses it by
    // itself when the hero video's play() rejects. A control nobody can see
    // cannot carry the visitor's choice.
    function visitorPressed(control) {
      if (control.getAttribute('aria-pressed') !== 'true') return false;
      var cs = window.getComputedStyle(control);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    }
    function applyMotionEvent() {
      var control = pauseButton();
      if (!eventPaused) userPaused = false;
      else if (control) userPaused = visitorPressed(control);
      else userPaused = true;
      sync();
    }
    function afterCurrentTask(fn) {
      if (typeof Promise === 'function') Promise.resolve().then(fn);
      else window.setTimeout(fn, 0);
    }

    window.addEventListener('helioflux:motion', function (event) {
      eventPaused = !!(event && event.detail && event.detail.paused);
      afterCurrentTask(applyMotionEvent);
    });
    doc.addEventListener('visibilitychange', sync);

    var initialControl = pauseButton();
    if (initialControl && visitorPressed(initialControl)) userPaused = true;

    /* ---------- on screen or not ---------- */

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var i;
        for (i = 0; i < entries.length; i++) inView = entries[i].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(section);
    } else {
      inView = true;
    }

    /* ---------- size, now and later ---------- */

    if ('ResizeObserver' in window) {
      new ResizeObserver(function () { resize(); }).observe(section);
    } else {
      var resizeTimer = 0;
      window.addEventListener('resize', function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(resize, 120);
      });
    }
    resize();

    /* ---------- reduced motion, now and later ---------- */

    if (reduce) {
      var onReduce = function () {
        reduced = !!reduce.matches;
        if (!reduced) resize();
        sync();
      };
      if (typeof reduce.addEventListener === 'function') reduce.addEventListener('change', onReduce);
      else if (typeof reduce.addListener === 'function') reduce.addListener(onReduce);
    }

    sync();
  }
})();
