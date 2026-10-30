/* headlines.js
   Word-by-word mask reveal for the big section headings on the HelioFlux
   homepage (styles in headlines.css).

   What it does: walks the text nodes of each target heading, splits them on
   ordinary whitespace and wraps every word as
     <span class="hf-w"><span class="hf-wi" style="--i:n">word</span></span>
   leaving the original whitespace text nodes between the wrappers, so the
   visible text is byte for byte what it was. Existing children (em, span, br)
   are kept in place with their classes and inline styles; only the text inside
   them is wrapped. --i counts words across the whole heading and drives the
   45ms stagger in the CSS. An IntersectionObserver (threshold .35, once) adds
   class "hf-in" to the heading when just over a third of it is on screen, and
   the words rise into place.

   Attaches to: #problem .prob-opener, #solution h2, #two-systems h2,
   #two-systems .hf-products-heading, #platform .h-section-label h2,
   #credibility h2, .cta-section h2. Never the hero h1 or the tumor story
   heading (.hf-growth-heading h2). Headings that are, or sit inside, the page's
   own ".reveal" elements keep that fade as well: the words only ever rise inside
   a box that is fading in or has already faded in, so either order reads fine.

   How it pauses: there is no loop, so pausing means no travel. When a heading
   crosses the threshold while the tab is hidden or while the visitor has paused
   motion, it gets "hf-still" along with "hf-in" and the words appear in place.
   While the site is paused, "hf-headlines-paused" on <html> drops the
   transitions for everything, so a reveal already in flight settles at once.
   The site signals pausing with "helioflux:motion" (detail.paused), but
   hero-motion.js fires the same event with paused true whenever the hero
   merely scrolls out of view, which is always true for these headings. So, as
   progress.js does, the hero's own pause button is consulted one microtask
   later: aria-pressed "true" on a button that is actually shown means the
   visitor asked for stillness; otherwise the hero only left the screen and the
   reveal carries on. The "actually shown" part goes one step further than
   progress.js: hero-motion.js also presses its button by itself whenever the
   hero video's play() rejects, including the AbortError its own pause() causes
   when the visitor scrolls past the hero before playback starts, and the
   current stylesheet hides that button. A control nobody can see cannot have
   been pressed by the visitor, so a hidden pressed button does not stop the
   headings. With no button on the page the event is taken at its word.
   prefers-reduced-motion: reduce at start means nothing is wrapped at all and
   the headings stay exactly as served. If the preference switches off later the
   wrapping happens then; if it switches on later the CSS holds the finished
   state and the observer keeps marking headings "hf-in" so nothing re-hides. */

(function () {
  'use strict';

  var TARGETS = [
    '#problem .prob-opener',
    '#solution h2',
    '#two-systems h2',
    '#two-systems .hf-products-heading',
    '#platform .h-section-label h2',
    '#credibility h2',
    '.cta-section h2'
  ];
  var EXCLUDE = '.hero, .hf-growth-heading';
  var THRESHOLD = 0.35;
  var WORD_SPLIT = /([ \t\n\r\f]+)/; // plain whitespace only; a non-breaking space stays inside its word

  function init() {
    var doc = document;
    var html = doc.documentElement;
    if (!html || !doc.body) return;

    var reduce = null;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) { reduce = null; }

    var headings = [];      // wrapped headings, in document order
    var observer = null;
    var wrapped = false;
    var userPaused = false;
    var eventPaused = false;

    /* Wrap every word of one heading. Text nodes are collected first, then
       replaced, so the walk never sees its own insertions. */
    function wrapHeading(el) {
      if (!el || el.getAttribute('data-hf-headline') === 'words') return false;
      var walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
      var nodes = [];
      var n;
      while ((n = walker.nextNode())) {
        if (!n.nodeValue || !/\S/.test(n.nodeValue)) continue;
        var p = n.parentNode;
        if (!p || p.nodeType !== 1) continue;
        var tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || p.classList.contains('hf-wi')) continue;
        nodes.push(n);
      }
      if (!nodes.length) return false;

      var index = 0;
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var parts = node.nodeValue.split(WORD_SPLIT);
        var frag = doc.createDocumentFragment();
        for (var j = 0; j < parts.length; j++) {
          var part = parts[j];
          if (part === '') continue;
          if (j % 2 === 1) {
            frag.appendChild(doc.createTextNode(part));
            continue;
          }
          var outer = doc.createElement('span');
          outer.className = 'hf-w';
          var inner = doc.createElement('span');
          inner.className = 'hf-wi';
          inner.style.setProperty('--i', String(index++));
          inner.appendChild(doc.createTextNode(part));
          outer.appendChild(inner);
          frag.appendChild(outer);
        }
        node.parentNode.replaceChild(frag, node);
      }
      el.setAttribute('data-hf-headline', 'words');
      el.setAttribute('data-hf-words', String(index));
      return true;
    }

    function stillNow() {
      return userPaused || !!doc.hidden;
    }

    function show(el) {
      if (el.classList.contains('hf-in')) return;
      if (stillNow()) el.classList.add('hf-still');
      el.classList.add('hf-in');
    }

    function onIntersect(entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (!entry.isIntersecting || entry.intersectionRatio < THRESHOLD) continue;
        show(entry.target);
        if (observer) observer.unobserve(entry.target);
      }
    }

    function collect() {
      var found = [];
      for (var i = 0; i < TARGETS.length; i++) {
        var list;
        try { list = doc.querySelectorAll(TARGETS[i]); } catch (e) { list = []; }
        for (var j = 0; j < list.length; j++) {
          var el = list[j];
          if (el.closest && el.closest(EXCLUDE)) continue;
          if (found.indexOf(el) === -1) found.push(el);
        }
      }
      return found;
    }

    function setup() {
      if (wrapped) return;
      wrapped = true;
      var list = collect();
      for (var i = 0; i < list.length; i++) {
        try { if (wrapHeading(list[i])) headings.push(list[i]); } catch (e) { /* leave that heading as served */ }
      }
      if (!headings.length) return;

      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(onIntersect, { threshold: THRESHOLD });
        for (var k = 0; k < headings.length; k++) observer.observe(headings[k]);
      } else {
        for (var m = 0; m < headings.length; m++) {
          headings[m].classList.add('hf-still');
          headings[m].classList.add('hf-in');
        }
      }
    }

    function pauseButton() {
      return doc.querySelector('.cell-pause[aria-pressed]');
    }

    /* Pressed, and something a visitor could actually have pressed. The site's
       stylesheet currently hides the button, and hero-motion.js also marks it
       pressed on its own when the hero video's play() rejects (autoplay refused,
       or its own pause() interrupting a play() that had not started yet because
       the visitor scrolled past the hero quickly). A control nobody can see
       cannot carry the visitor's choice, so in that case the event is read as
       what it is: the hero left the screen, or a video did not start. */
    function visitorPressed(button) {
      if (button.getAttribute('aria-pressed') !== 'true') return false;
      var cs = window.getComputedStyle(button);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    }

    // One microtask after helioflux:motion, hero-motion.js has written the
    // visitor's own choice to its button; that is the state that matters here.
    function applyMotionEvent() {
      var button = pauseButton();
      if (!eventPaused) userPaused = false;
      else if (button) userPaused = visitorPressed(button);
      else userPaused = true;
      html.classList.toggle('hf-headlines-paused', userPaused);
    }

    function afterCurrentTask(fn) {
      if (typeof Promise === 'function') Promise.resolve().then(fn);
      else window.setTimeout(fn, 0);
    }

    window.addEventListener('helioflux:motion', function (event) {
      eventPaused = !!(event && event.detail && event.detail.paused);
      afterCurrentTask(applyMotionEvent);
    });

    if (reduce) {
      var onReduce = function () {
        if (!reduce.matches && !wrapped) setup();
      };
      if (typeof reduce.addEventListener === 'function') reduce.addEventListener('change', onReduce);
      else if (typeof reduce.addListener === 'function') reduce.addListener(onReduce);
    }

    var initialButton = pauseButton();
    if (initialButton && visitorPressed(initialButton)) {
      userPaused = true;
      html.classList.add('hf-headlines-paused');
    }

    if (reduce && reduce.matches) return; // reduced motion: headings stay as served
    setup();
  }

  function safeInit() {
    try { init(); } catch (e) { /* decorative only; never break the page */ }
  }

  if (document.readyState !== 'loading') safeInit();
  else document.addEventListener('DOMContentLoaded', safeInit, { once: true });
})();
