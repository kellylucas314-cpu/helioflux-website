/* Homepage on the "next" system: the scan steps play once as they scroll into view
   (all four together in a row, one by one when stacked). Reduced motion and no JS show them still. */
(() => {
  const list = document.querySelector('.hf-scan-steps');
  if (!list) return;
  const steps = [...list.children];
  const show = (els) => els.forEach((el) => el.classList.add('in'));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { show(steps); return; }
  const stacked = matchMedia('(max-width: 760px)').matches;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    if (stacked) { show([e.target]); io.unobserve(e.target); }
    else { show(steps); io.disconnect(); }
  }), { threshold: stacked ? 0.6 : 0.35 });
  (stacked ? steps : [list]).forEach((el) => io.observe(el));
})();

/* The bridge band: the microscope film loads when the band is near and plays only while it is on screen. */
(() => {
  const film = document.querySelector('[data-bridge-film]');
  if (!film || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  film.muted = true;
  let loaded = false;
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) { film.pause(); return; }
    if (!loaded) { loaded = true; film.querySelectorAll('source[data-src]').forEach((s) => { s.src = s.dataset.src; }); film.load(); }
    film.play().catch(() => {});
  }, { rootMargin: '200px 0px' }).observe(film.closest('.home-bridge'));
})();

/* The microscope photo drifts a little slower than the page while it is on screen, as on the live site. */
(() => {
  const img = document.querySelector('.home-photo-break img[data-parallax]');
  if (!img || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const box = img.parentElement;
  let frame = 0, active = false;
  const place = () => {
    frame = 0;
    const r = box.getBoundingClientRect(), h = innerHeight;
    const t = Math.min(1, Math.max(0, (h - r.top) / (h + r.height)));
    img.style.transform = 'translate3d(0,' + (60 - 120 * t).toFixed(1) + 'px,0)';
  };
  const queue = () => { if (active && !frame) frame = requestAnimationFrame(place); };
  new IntersectionObserver(([e]) => { active = e.isIntersecting; queue(); }).observe(box);
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  place();
})();

/* "Where we're starting": the arrows step one panel and the dots follow the scroll, so a swipe and a click agree. */
(() => {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;
  const track = root.querySelector('.hc-track');
  const panels = [...track.children];
  const dots = [...root.querySelectorAll('.hc-dots span')];
  const prev = root.querySelector('[data-carousel-prev]');
  const next = root.querySelector('[data-carousel-next]');
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0, frame = 0;
  const sync = () => {
    frame = 0;
    const max = track.scrollWidth - track.clientWidth - 2;
    const step = panels[1] ? panels[1].offsetLeft - panels[0].offsetLeft : track.clientWidth;
    index = track.scrollLeft >= max ? panels.length - 1 : Math.min(panels.length - 1, Math.round(track.scrollLeft / step));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  };
  const go = (i) => {
    const to = panels[Math.max(0, Math.min(panels.length - 1, i))];
    track.scrollTo({ left: to.offsetLeft - panels[0].offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
  };
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  });
  track.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(sync); }, { passive: true });
  addEventListener('resize', sync);
  sync();
})();
