(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-cellular-signals]').forEach((figure) => {
    const video = figure.querySelector('.hf-cellular-signals__video');
    if (!video) return;
    let visible = false, printing = false;
    let activated = false, ready = false, failed = false, blocked = false, pendingPlay = null;
    video.muted = true;
    const shouldPlay = () => !reducedMotion.matches && !printing && !document.hidden && visible && !failed && !blocked;
    const update = () => {
      const motionAllowed = !reducedMotion.matches && !printing && !failed;
      const wanted = shouldPlay();
      figure.classList.toggle('is-video-ready', motionAllowed && ready);
      figure.classList.toggle('is-running', wanted && !video.paused);
      if (!wanted) { video.pause(); return; }
      if (!activated) {
        activated = true;
        video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
        video.load();
      }
      if (video.paused && !pendingPlay) {
        pendingPlay = video.play();
        if (pendingPlay) pendingPlay.then(() => {
          if (!shouldPlay()) video.pause();
        }).catch(error => {
          if (shouldPlay() && error.name !== 'AbortError') blocked = true;
        }).finally(() => { pendingPlay = null; update(); });
      }
    };
    video.addEventListener('loadeddata', () => { ready = true; update(); });
    video.addEventListener('playing', () => { ready = true; update(); });
    video.addEventListener('error', () => { failed = true; update(); });
    document.addEventListener('visibilitychange', update);
    const retry = () => { if (blocked) { blocked = false; update(); } };
    window.addEventListener('click', retry, { passive: true }); window.addEventListener('touchend', retry, { passive: true });
    reducedMotion.addEventListener('change', update);
    window.addEventListener('beforeprint', () => { printing = true; update(); });
    window.addEventListener('afterprint', () => { printing = false; update(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { rootMargin: '300px 0px' }).observe(figure);
    } else visible = true;
    update();
  });
})();
