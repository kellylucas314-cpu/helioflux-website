(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-cellular-signals]').forEach((figure) => {
    const video = figure.querySelector('.hf-cellular-signals__video');
    const button = figure.querySelector('.hf-cellular-signals__toggle');
    const label = button?.querySelector('[data-signal-toggle-label]');
    const icon = button?.querySelector('[data-signal-toggle-icon]');
    if (!video || !button || !label || !icon) return;
    let userPaused = false, visible = false, printing = false;
    let activated = false, ready = false, failed = false, blocked = false, pendingPlay = null;
    video.muted = true;
    const shouldPlay = () => !reducedMotion.matches && !printing && !document.hidden && visible && !userPaused && !failed && !blocked;
    const update = () => {
      const motionAllowed = !reducedMotion.matches && !printing && !failed;
      const wanted = shouldPlay();
      figure.classList.toggle('is-video-ready', motionAllowed && ready);
      figure.classList.toggle('is-running', wanted && !video.paused);
      button.hidden = !motionAllowed;
      const paused = userPaused || blocked;
      button.setAttribute('aria-pressed', String(paused));
      label.textContent = paused ? 'Play animation' : 'Pause animation';
      icon.setAttribute('d', paused ? 'M3 1.5 11 6 3 10.5Z' : 'M3 1.5H5V10.5H3ZM8 1.5H10V10.5H8Z');
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
    button.addEventListener('click', () => {
      if (blocked) { blocked = false; userPaused = false; } else userPaused = !userPaused;
      update();
    });
    document.addEventListener('visibilitychange', update);
    reducedMotion.addEventListener('change', update);
    window.addEventListener('beforeprint', () => { printing = true; update(); });
    window.addEventListener('afterprint', () => { printing = false; update(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0 }).observe(figure);
    } else visible = true;
    update();
  });
})();
