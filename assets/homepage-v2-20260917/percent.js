/* Survival percentages: final values remain readable until their one-time entrance. */
(() => {
  'use strict';

  function init() {
    const grid = document.getElementById('survivalGapGrid');
    const early = document.getElementById('earlyNum');
    const late = document.getElementById('lateNum');
    if (!grid || !early || !late || grid.dataset.percentReady) return;
    grid.dataset.percentReady = 'true';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const print = window.matchMedia('print');
    const navigation = performance.getEntriesByType('navigation')[0];
    // Static source markup is the complete fallback, including on history restoration.
    if (reduced.matches || print.matches || document.hidden ||
        navigation?.type === 'back_forward' || !window.IntersectionObserver ||
        !window.requestAnimationFrame) return;

    const duration = 1200;
    let observer;
    let frame = 0;
    let deadline = 0;
    let started = false;
    let settled = false;
    let startTime = 0;

    const counters = [
      { element: early, prefix: '>', target: 90 },
      { element: late, prefix: '~', target: 30 }
    ].map(counter => {
      // The accessible text is constant; only its aria-hidden visual copy counts.
      const accessible = document.createElement('span');
      accessible.textContent = `${counter.prefix}${counter.target}%`;
      accessible.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
      accessible.dataset.percentAccessible = '';

      const visual = document.createElement('span');
      visual.setAttribute('aria-hidden', 'true');
      visual.dataset.percentVisual = '';
      visual.style.cssText = 'display:inline-flex;align-items:baseline;white-space:nowrap;font-variant-numeric:tabular-nums;';
      const digits = document.createElement('span');
      digits.dataset.percentDigits = '';
      digits.style.cssText = 'display:inline-block;width:2ch;text-align:right;';
      digits.textContent = String(counter.target);
      visual.append(counter.prefix, digits, '%');
      counter.element.replaceChildren(accessible, visual);
      return { ...counter, digits };
    });

    function render(progress) {
      counters.forEach(({ digits, target }) => {
        digits.textContent = String(Math.round(target * progress));
      });
    }

    function finish() {
      settled = true;
      cancelAnimationFrame(frame);
      clearTimeout(deadline);
      observer?.disconnect();
      render(1);
      grid.dataset.percentState = 'complete';
    }

    function tick(now) {
      if (settled) return;
      const progress = Math.min(1, Math.max(0, (now - startTime) / duration));
      render(1 - Math.pow(1 - progress, 3));
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    }

    function start() {
      if (started || settled) return;
      if (reduced.matches || print.matches || document.hidden) { finish(); return; }
      started = true;
      observer.disconnect();
      grid.dataset.percentState = 'running';
      startTime = performance.now();
      render(0);
      frame = requestAnimationFrame(tick);
      // A final-value safeguard if frame delivery is interrupted during a transition.
      deadline = window.setTimeout(finish, duration + 160);
    }

    grid.dataset.percentState = 'ready';
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) start();
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.12 });
    observer.observe(grid);

    document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
    window.addEventListener('pagehide', finish);
    window.addEventListener('pageshow', event => { if (event.persisted) finish(); });
    window.addEventListener('beforeprint', finish);
    reduced.addEventListener('change', event => { if (event.matches) finish(); });
    print.addEventListener('change', event => { if (event.matches) finish(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
