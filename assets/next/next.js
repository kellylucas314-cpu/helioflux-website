/* Shared behavior for the playground "next" pages. Small, dependency-free, reduced-motion aware. */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (toggle) toggle.querySelector('.label').textContent = open ? 'Close' : 'Menu';
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); toggle.focus(); } });
    matchMedia('(min-width: 861px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  // Desktop dropdowns: close on outside click and Escape
  const dropdowns = [...document.querySelectorAll('.nav-links details')];
  document.addEventListener('click', (e) => dropdowns.forEach((d) => { if (!d.contains(e.target)) d.open = false; }));
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    dropdowns.forEach((d) => { if (d.open) { d.open = false; d.querySelector('summary').focus(); } });
  });

  // Nav reads light-on-dark while a dark hero is under it
  const nav = document.querySelector('.site-nav');
  const darkHero = document.querySelector('[data-night-hero]');
  if (nav && darkHero && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => nav.classList.toggle('on-night', entry.isIntersecting), { rootMargin: `-${nav.offsetHeight}px 0px 0px 0px`, threshold: 0 });
    io.observe(darkHero);
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if (!reduce.matches && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }
})();
