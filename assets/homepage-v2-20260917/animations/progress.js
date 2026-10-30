/* progress.js
   Scroll-progress hairline for the HelioFlux homepage. Builds one fixed element at
   the top of the viewport (see progress.css): a 2px cyan line whose length is the
   scrolled fraction of the page, with a small photon at its leading edge.

   Attaches to: <body>. It appends <div class="hf-progress" aria-hidden="true"> with
   a bar and a dot inside. It touches no existing element and changes no text.

   How it updates: a passive scroll listener only asks for one animation frame; the
   frame reads scrollY, then writes two transforms (scaleX on the bar, translate3d
   on the dot). The page height and viewport height are measured once per resize
   through a ResizeObserver on <html> and <body> plus the window resize event, never
   per frame. The line fades in once the visitor is past 70% of one viewport height
   and fades out below 45% (a little hysteresis so it never flickers at the edge).
   The dot hides when the fraction passes .985 so its halo never extends past the
   right edge of the viewport.

   How it pauses: the only continuous motion is the halo's CSS breath. It is paused
   (class "is-paused") when the tab is hidden, when the bar is off-screen according
   to an IntersectionObserver, and when the visitor pauses motion on the site. The
   site signals that with "helioflux:motion" (detail.paused true), but hero-motion.js
   fires the same event with paused true whenever the hero merely scrolls out of
   view, which is always the case once this bar is showing. So on that event the
   hero's own pause button is consulted (its aria-pressed is set right after the
   dispatch): pressed means the visitor asked for stillness and the breath stops;
   not pressed means the hero only left the screen and the breath continues. With
   no button on the page the event is taken at its word. Scroll tracking itself
   keeps working in every state, because the line is information, not decoration.
   prefers-reduced-motion: reduce removes the fade and the breath (class
   "is-reduced", mirrored in CSS) and is re-checked when the preference changes. */

(function () {
  'use strict';

  var SHOW_AT = 0.7;   // fraction of one viewport height before the line appears
  var HIDE_AT = 0.45;  // fraction below which it fades out again
  var DOT_END = 0.985; // fraction past which the photon hides, at the latest
  var HALO = 10;       // halo radius in px at the top of its breath; keeps it inside 100vw

  function init() {
    var body = document.body;
    var docEl = document.documentElement;
    if (!body || !docEl) return;

    var root = body.querySelector(':scope > .hf-progress');
    if (!root) {
      root = document.createElement('div');
      root.className = 'hf-progress';
      root.setAttribute('aria-hidden', 'true');
      var bar = document.createElement('div');
      bar.className = 'hf-progress__bar';
      var dot = document.createElement('div');
      dot.className = 'hf-progress__dot';
      root.appendChild(bar);
      root.appendChild(dot);
      body.appendChild(root);
    }
    var barEl = root.querySelector('.hf-progress__bar');
    var dotEl = root.querySelector('.hf-progress__dot');
    if (!barEl || !dotEl) return;

    var reduce = null;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) { reduce = null; }

    var trackWidth = 0;   // width of the bar in CSS px, read once per resize
    var viewport = 0;     // viewport height, read once per resize
    var maxScroll = 1;    // scrollHeight minus viewport, read once per resize
    var dotEnd = DOT_END; // where the photon hides for this track width
    var shown = false;
    var atEnd = false;
    var userPaused = false;
    var eventPaused = false;
    var inView = true;
    var frame = 0;
    var measurePending = false;

    function setPaused() {
      var paused = userPaused || document.hidden || !inView;
      root.classList.toggle('is-paused', paused);
    }

    function pauseButton() {
      return document.querySelector('.cell-pause[aria-pressed]');
    }

    // Runs one microtask after a helioflux:motion event, by which time hero-motion.js
    // has written the visitor's choice to its button.
    function applyMotionEvent() {
      var button = pauseButton();
      if (!eventPaused) userPaused = false;
      else if (button) userPaused = button.getAttribute('aria-pressed') === 'true';
      else userPaused = true;
      setPaused();
    }

    function afterCurrentTask(fn) {
      if (typeof Promise === 'function') Promise.resolve().then(fn);
      else window.setTimeout(fn, 0);
    }

    function setReduced() {
      root.classList.toggle('is-reduced', !!(reduce && reduce.matches));
    }

    function measure() {
      measurePending = false;
      viewport = docEl.clientHeight || window.innerHeight || 1;
      maxScroll = Math.max(1, docEl.scrollHeight - viewport);
      trackWidth = root.getBoundingClientRect().width || docEl.clientWidth || 0;
      // On a 390px screen .985 would still leave the halo a pixel past the edge, so
      // the cutoff moves in by one halo radius; wide screens keep the .985 ceiling.
      dotEnd = trackWidth > HALO ? Math.min(DOT_END, 1 - HALO / trackWidth) : DOT_END;
      render();
    }

    function scheduleMeasure() {
      if (measurePending) return;
      measurePending = true;
      // One measurement per resize burst, taken on the next frame after layout.
      window.requestAnimationFrame(measure);
    }

    function render() {
      frame = 0;
      if (document.hidden) return;
      var y = window.scrollY || window.pageYOffset || 0;
      var p = y / maxScroll;
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      barEl.style.transform = 'scaleX(' + p.toFixed(5) + ')';
      dotEl.style.transform = 'translate3d(' + (p * trackWidth).toFixed(2) + 'px, 0, 0)';

      var end = p > dotEnd;
      if (end !== atEnd) { atEnd = end; root.classList.toggle('is-end', end); }

      var threshold = y / viewport;
      var next = shown ? threshold > HIDE_AT : threshold > SHOW_AT;
      if (next !== shown) { shown = next; root.classList.toggle('is-on', next); }
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(render);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });
    window.addEventListener('load', scheduleMeasure);
    window.addEventListener('helioflux:motion', function (event) {
      eventPaused = !!(event && event.detail && event.detail.paused);
      afterCurrentTask(applyMotionEvent);
    });
    document.addEventListener('visibilitychange', function () {
      setPaused();
      if (!document.hidden) onScroll();
    });
    if (reduce) {
      var onReduce = function () { setReduced(); onScroll(); };
      if (typeof reduce.addEventListener === 'function') reduce.addEventListener('change', onReduce);
      else if (typeof reduce.addListener === 'function') reduce.addListener(onReduce);
    }

    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(scheduleMeasure);
      ro.observe(docEl);
      ro.observe(body);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[entries.length - 1].isIntersecting;
        setPaused();
      }, { threshold: 0 }).observe(root);
    }

    // If the script loads after the hero has already settled (autoplay refused, or
    // the visitor paused before this ran), start from the button's current state.
    var initialButton = pauseButton();
    if (initialButton && initialButton.getAttribute('aria-pressed') === 'true') userPaused = true;

    setReduced();
    setPaused();
    measure();
  }

  function safeInit() {
    try { init(); } catch (e) { /* decorative only; never break the page */ }
  }

  if (document.readyState !== 'loading') safeInit();
  else document.addEventListener('DOMContentLoaded', safeInit, { once: true });
})();
