/* platform.js
   Quiet motion for the dark "Proven in the lab. Heading to humans." carousel on
   the HelioFlux homepage (#platform). Styles in platform.css; this file only
   adds a few decorative spans, data attributes and classes, and decides when
   the CSS animations may run.

   What it does:
   - Prepends a 6px cyan dot (span.hf-plat-dot, aria-hidden) to the text of
     every status pill (.h-panel-status). The CSS pulses a thin ring out of it
     every 2.6s. No existing text or element is changed.
   - Marks the carousel arrows with data-hf-dir="prev" or "next" so the CSS can
     nudge each glyph 2px in its own direction on hover.
   - Entrance: adds "hf-plat-armed" to #platform (cards wait at opacity 0,
     translateY 20px) and then "hf-plat-in" to each card so it settles over
     700ms. Above 768px the cards sit side by side in the track, so all three
     enter together with a 100ms stagger as soon as 15% of the first card is
     on screen (the first card, not the section: the section opens with some
     350px of padding and heading, and a section-level trigger fired while the
     cards were still below the fold, so the entrance played unseen). At 768px
     and under the cards stack, so each card enters on its own as it scrolls
     in (cards that arrive in the same observer callback still stagger by
     100ms). Every card enters once. If IntersectionObserver is missing the
     cards are simply shown.
   - Keeps "hf-plat-run" on #platform only while the slow Ken Burns on the
     photos and the pulse rings may run.

   Where it attaches: #platform only. If the section is missing the script
   does nothing, and nothing in it throws when a card, pill or arrow is absent.
   Everything is CSS animation and transition; there is no per-frame
   JavaScript, no canvas and no layout read.

   How it pauses: "hf-plat-run" is removed (the CSS flips the animations to
   animation-play-state: paused, so they resume where they stopped) when
   #platform leaves the screen (IntersectionObserver), when the tab is hidden
   (visibilitychange) and when the visitor has paused motion on the site. The
   site signals that with the "helioflux:motion" event (detail.paused), but
   hero-motion.js also fires it with paused true whenever the hero merely
   scrolls out of view, which is always the case while this section shows. So,
   as bridge.js, progress.js and headlines.js do, the hero's own pause button is
   consulted one microtask later: aria-pressed "true" on a button that is
   actually displayed means the visitor asked for stillness; otherwise the hero
   only left the screen and the carousel carries on. prefers-reduced-motion:
   reduce gives the finished, still state (dots without rings, photos at rest,
   cards in place), and a change in that preference either way is honored on
   the spot. */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  function init() {
    var ENTER_MS = 700;
    var STAGGER_MS = 100;
    var CARD_THRESHOLD = 0.15;

    var doc = document;
    var section = doc.getElementById('platform');
    if (!section) return;
    if (section.getAttribute('data-hf-plat') === 'ready') return;
    section.setAttribute('data-hf-plat', 'ready');

    var track = doc.getElementById('hTrack') || section.querySelector('.h-track');
    var cards = toArray(track ? track.querySelectorAll('.h-panel') : section.querySelectorAll('.h-panel'));
    var pills = toArray(section.querySelectorAll('.h-panel-status'));
    var arrows = toArray(section.querySelectorAll('.h-arrow'));

    var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    var stacked = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
    var reduced = !!(reduce && reduce.matches);

    var inView = false;
    var eventPaused = false;
    var userPaused = false;
    var entered = 0;

    function toArray(list) {
      var out = [], k;
      if (!list) return out;
      for (k = 0; k < list.length; k++) out.push(list[k]);
      return out;
    }

    /* ---------- decorative dots in the status pills ---------- */

    pills.forEach(function (pill) {
      if (pill.querySelector('.hf-plat-dot')) return;
      var dot = doc.createElement('span');
      dot.className = 'hf-plat-dot';
      dot.setAttribute('aria-hidden', 'true');
      pill.insertBefore(dot, pill.firstChild);
    });

    /* ---------- arrow directions for the hover nudge ---------- */

    var prev = doc.getElementById('hPrev');
    var next = doc.getElementById('hNext');
    if (!prev && arrows.length) prev = arrows[0];
    if (!next && arrows.length > 1) next = arrows[arrows.length - 1];
    if (prev) prev.setAttribute('data-hf-dir', 'prev');
    if (next && next !== prev) next.setAttribute('data-hf-dir', 'next');

    /* ---------- run state (Ken Burns and pulse rings) ---------- */

    function sync() {
      var run = inView && !doc.hidden && !userPaused && !reduced;
      section.classList.toggle('hf-plat-run', run);
      section.classList.toggle('hf-plat-reduced', reduced);
    }

    /* ---------- pausing conventions, shared with the other modules ---------- */

    function pauseButton() {
      return doc.querySelector('.cell-pause[aria-pressed]');
    }
    // Pressed, and something a visitor could actually have pressed. The current
    // stylesheet hides the hero's button, and hero-motion.js also presses it by
    // itself when the hero video's play() rejects. A control nobody can see
    // cannot carry the visitor's choice.
    function visitorPressed(button) {
      if (button.getAttribute('aria-pressed') !== 'true') return false;
      var cs = window.getComputedStyle(button);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    }
    function applyMotionEvent() {
      var button = pauseButton();
      if (!eventPaused) userPaused = false;
      else if (button) userPaused = visitorPressed(button);
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

    var initialButton = pauseButton();
    if (initialButton && visitorPressed(initialButton)) userPaused = true;

    /* ---------- entrance ---------- */

    function enterCard(card, delayMs) {
      if (card.classList.contains('hf-plat-in')) return;
      entered++;
      var delay = reduced ? 0 : delayMs;
      if (delay) card.style.setProperty('--hf-plat-delay', delay + 'ms');
      card.classList.add('hf-plat-in');
      window.setTimeout(function () {
        card.style.removeProperty('--hf-plat-delay');
      }, ENTER_MS + delay + 80);
    }

    function enterAll() {
      cards.forEach(function (card, k) { enterCard(card, k * STAGGER_MS); });
    }

    function isStacked() {
      return !!(stacked && stacked.matches);
    }

    var rowObserver = null;
    var cardObserver = null;

    function stopEntranceObservers() {
      if (rowObserver) { rowObserver.disconnect(); rowObserver = null; }
      if (cardObserver) { cardObserver.disconnect(); cardObserver = null; }
    }

    if ('IntersectionObserver' in window && cards.length) {
      section.classList.add('hf-plat-armed');

      // Side by side (desktop): the whole row enters when the first card
      // shows. The first card is never clipped by the track at rest (it sits
      // at the left edge, narrower than the viewport), so its ratio is honest.
      rowObserver = new IntersectionObserver(function (entries) {
        var k;
        for (k = 0; k < entries.length; k++) {
          if (!entries[k].isIntersecting) continue;
          if (isStacked() && !reduced) continue;
          enterAll();
          stopEntranceObservers();
          return;
        }
      }, { threshold: CARD_THRESHOLD });
      rowObserver.observe(cards[0]);

      // Stacked (phones): each card enters as it scrolls in.
      cardObserver = new IntersectionObserver(function (entries) {
        var k, batch = 0;
        for (k = 0; k < entries.length; k++) {
          if (!entries[k].isIntersecting) continue;
          if (!isStacked() && !reduced) continue;
          enterCard(entries[k].target, batch * STAGGER_MS);
          batch++;
          if (cardObserver) cardObserver.unobserve(entries[k].target);
        }
        if (entered >= cards.length) stopEntranceObservers();
      }, { threshold: CARD_THRESHOLD, rootMargin: '0px 0px -4% 0px' });
      cards.forEach(function (card) { cardObserver.observe(card); });
    } else {
      cards.forEach(function (card) { card.classList.add('hf-plat-in'); });
    }

    /* ---------- on screen or not ---------- */

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var k;
        for (k = 0; k < entries.length; k++) inView = entries[k].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(section);
    } else {
      inView = true;
    }

    /* ---------- reduced motion, now and later ---------- */

    if (reduce) {
      var onReduce = function () {
        reduced = !!reduce.matches;
        if (reduced) {
          cards.forEach(function (card) { card.classList.add('hf-plat-in'); });
          stopEntranceObservers();
        }
        sync();
      };
      if (typeof reduce.addEventListener === 'function') reduce.addEventListener('change', onReduce);
      else if (typeof reduce.addListener === 'function') reduce.addListener(onReduce);
    }
    if (reduced) {
      cards.forEach(function (card) { card.classList.add('hf-plat-in'); });
      stopEntranceObservers();
    }

    sync();
  }
})();
