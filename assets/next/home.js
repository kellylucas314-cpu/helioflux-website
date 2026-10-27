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
