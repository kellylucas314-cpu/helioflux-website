(() => {
  // The hero cell plays while the hero is on screen. Reduced motion keeps the poster still; there is no pause button (Kelly, Oct 28).
  const video = document.getElementById('homepage-cell');
  const hero = document.querySelector('.hero');
  if (!video || !hero) return;
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  let blocked = false, visible = true;
  const sync = () => {
    const stopped = reduce.matches || blocked || !visible || document.hidden;
    window.dispatchEvent(new CustomEvent('helioflux:motion',{detail:{paused:stopped}}));
    if (stopped) video.pause();
    else video.play().catch(() => {blocked = true; window.dispatchEvent(new CustomEvent('helioflux:motion',{detail:{paused:true}}));});
  };
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting;sync();},{threshold:.08}).observe(hero);
  document.addEventListener('visibilitychange',sync);
  reduce.addEventListener('change',sync);
  // If the phone refused to autoplay (Low Power Mode), the first tap anywhere starts it.
  const retry = () => {if (blocked) {blocked = false; sync();}};
  addEventListener('click',retry,{passive:true}); addEventListener('touchend',retry,{passive:true});
  sync();
})();
