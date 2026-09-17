/* Scoped enhancements for the homepage's existing menu, applications and film.
   Existing menu/carousel click handlers remain the single owners of selection. */
(() => {
  'use strict';
  if (document.documentElement.dataset.hfHomeUsability) return;
  document.documentElement.dataset.hfHomeUsability = 'ready';
  if (!window.gsap || !window.ScrollTrigger)
    document.documentElement.classList.add('hf-home-static');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = el => {
    if (!el || !el.getClientRects().length || getComputedStyle(el).visibility === 'hidden' ||
        el.closest('[inert]')) return false;
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS' && !parent.open &&
          !parent.querySelector(':scope > summary')?.contains(el)) return false;
    }
    return true;
  };
  const focusables = root => [...root.querySelectorAll(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]'
  )].filter(el => el.tabIndex >= 0 && visible(el));

  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (hamburger && menu) {
    let open = false;
    let returnTo = hamburger;
    const inertBefore = new Map();
    const nav = hamburger.closest('nav');
    const isolate = () => {
      const others = [...document.body.children].filter(el =>
        el !== menu && el !== nav && !['SCRIPT','STYLE','LINK'].includes(el.tagName));
      if (nav) others.push(...[...nav.children].filter(el => !el.contains(hamburger)));
      others.forEach(el => { inertBefore.set(el, el.inert); el.inert = true; });
    };
    const restore = () => {
      inertBefore.forEach((wasInert, el) => { el.inert = wasInert; });
      inertBefore.clear();
    };
    const close = () => {
      // Reuse the original isolated handler; never add a second click toggle.
      if (menu.classList.contains('open')) hamburger.click();
    };
    const sync = () => {
      if (!visible(hamburger) && menu.classList.contains('open')) close();
      const next = menu.classList.contains('open') && visible(hamburger);
      hamburger.setAttribute('aria-controls', menu.id);
      hamburger.setAttribute('aria-expanded', String(next));
      hamburger.setAttribute('aria-label', next ? 'Close menu' : 'Open menu');
      menu.setAttribute('role', 'dialog');
      menu.setAttribute('aria-label', 'Main navigation');
      if (next) {
        menu.inert = false;
        menu.removeAttribute('aria-hidden');
        menu.setAttribute('aria-modal', 'true');
        if (!open) {
          returnTo = document.activeElement;
          isolate();
          open = true;
          (focusables(menu)[0] || hamburger).focus({preventScroll:true});
        }
      } else {
        const wasOpen = open;
        open = false;
        restore();
        if (wasOpen) {
          const target = visible(returnTo) ? returnTo :
            visible(hamburger) ? hamburger : nav?.querySelector('.logo');
          target?.focus({preventScroll:true});
          menu.querySelectorAll('details[open]').forEach(el => { el.open = false; });
        }
        menu.removeAttribute('aria-modal');
        menu.setAttribute('aria-hidden', 'true');
        menu.inert = true;
      }
    };
    new MutationObserver(sync).observe(menu, {attributes:true, attributeFilter:['class']});
    addEventListener('resize', sync, {passive:true});
    document.addEventListener('keydown', event => {
      if (!open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === 'Tab') {
        const items = [...focusables(menu), hamburger].filter(visible);
        const at = items.indexOf(document.activeElement);
        event.preventDefault();
        const next = at < 0 ? 0 : (at + (event.shiftKey ? -1 : 1) + items.length) % items.length;
        items[next]?.focus();
      }
    }, true);
    document.addEventListener('focusin', event => {
      if (open && !menu.contains(event.target) && event.target !== hamburger)
        (focusables(menu)[0] || hamburger).focus({preventScroll:true});
    });
    sync();
  }

  const section = document.getElementById('hSection');
  const track = document.getElementById('hTrack');
  if (section && track) {
    const panels = [...track.querySelectorAll('.h-panel')];
    const dots = [...section.querySelectorAll('.h-dot')];
    const print = matchMedia('print');
    const isStacked = () => print.matches || getComputedStyle(track).flexDirection === 'column' ||
      getComputedStyle(track).display === 'block';
    const selection = () => Math.max(0, dots.findIndex(dot => dot.classList.contains('active')));
    const sync = (instant = false) => {
      const stacked = isStacked();
      const selected = selection();
      if (instant || reduced.matches || stacked) track.style.transition = 'none';
      const offset = stacked ? 0 : panels[selected].offsetLeft - panels[0].offsetLeft;
      track.style.transform = 'translateX(' + (-offset) + 'px)';
      section.setAttribute('role', 'region');
      section.setAttribute('aria-label', 'Applications');
      section.toggleAttribute('data-hf-stacked', stacked);
      panels.forEach((panel, index) => {
        const hidden = !stacked && index !== selected;
        if (hidden && panel.contains(document.activeElement)) {
          const next = document.getElementById('hNext');
          const prev = document.getElementById('hPrev');
          (next && !next.disabled ? next : prev)?.focus({preventScroll:true});
        }
        panel.inert = hidden;
        if (hidden) panel.setAttribute('aria-hidden', 'true');
        else panel.removeAttribute('aria-hidden');
        panel.setAttribute('role', 'group');
        panel.setAttribute('aria-label', (index + 1) + ' of ' + panels.length);
      });
    };
    dots.forEach(dot => new MutationObserver(() => sync()).observe(dot,
      {attributes:true,attributeFilter:['class']}));
    const resize = new ResizeObserver(() => sync(true));
    resize.observe(section);
    panels.forEach(panel => resize.observe(panel));
    reduced.addEventListener('change', () => sync(true));
    print.addEventListener('change', () => sync(true));
    addEventListener('beforeprint', () => sync(true));
    addEventListener('afterprint', () => sync(true));
    sync(true);
  }

  const video = document.querySelector('.bridge-band video');
  const toggle = document.querySelector('.hf-bridge-toggle');
  if (video && toggle) {
    let inView = false;
    let intention = null; // Null follows the visitor's motion preference.
    let loaded = false;
    let generation = 0;
    const permitted = () => intention === true || (intention === null && !reduced.matches);
    const shouldPlay = () => permitted() && inView && !document.hidden;
    const label = () => {
      toggle.textContent = video.paused ? 'Play background video' : 'Pause background video';
      toggle.setAttribute('aria-label', toggle.textContent);
    };
    const sync = () => {
      const run = ++generation;
      if (!shouldPlay()) { video.pause(); label(); return; }
      if (!loaded) {
        video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; });
        video.load();
        loaded = true;
      }
      const promise = video.play();
      promise?.then(() => {
        if (run !== generation) return;
        if (!shouldPlay()) video.pause();
        label();
      }).catch(label);
    };
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      intention = video.paused;
      sync();
    });
    video.addEventListener('play', label);
    video.addEventListener('pause', label);
    new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      sync();
    }, {threshold:0.01}).observe(video.closest('.bridge-band'));
    document.addEventListener('visibilitychange', sync);
    reduced.addEventListener('change', () => { intention = null; sync(); });
    label();
  }

  // Legacy initialization precedes this anchor's markup and therefore misses it.
  const topLink = document.getElementById('back-to-top');
  if (topLink) {
    const sync = () => {
      const show = scrollY > 400;
      topLink.classList.toggle('visible', show);
      topLink.tabIndex = show ? 0 : -1;
      if (show) topLink.removeAttribute('aria-hidden');
      else topLink.setAttribute('aria-hidden', 'true');
    };
    addEventListener('scroll', sync, {passive:true});
    topLink.addEventListener('click', event => {
      event.preventDefault();
      scrollTo({top:0, behavior:reduced.matches ? 'instant' : 'smooth'});
      document.querySelector('nav .logo')?.focus({preventScroll:true});
    });
    sync();
  }
})();
