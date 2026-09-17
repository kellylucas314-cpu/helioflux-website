
(() => {
  const video = document.getElementById('homepage-cell');
  const button = document.querySelector('.cell-pause');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let userPaused = reduce.matches, visible = true;
  const sync = () => {
    const stopped = userPaused || !visible || document.hidden;
    window.dispatchEvent(new CustomEvent('helioflux:motion',{detail:{paused:stopped}}));
    if (stopped) video.pause();
    else video.play().catch(() => {userPaused = true; window.dispatchEvent(new CustomEvent('helioflux:motion',{detail:{paused:true}})); update();});
    update();
  };
  const update = () => {
    button.setAttribute('aria-pressed',String(userPaused));
    button.textContent = userPaused ? 'Play motion' : 'Pause motion';
    button.setAttribute('aria-label', userPaused ? 'Play cell animation' : 'Pause cell animation');
  };
  button.addEventListener('click', () => {userPaused = !userPaused; sync();});
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting;sync();},{threshold:.08}).observe(document.querySelector('.hero'));
  document.addEventListener('visibilitychange',sync);
  reduce.addEventListener('change', () => {userPaused=reduce.matches;sync();});
  sync();
})();
