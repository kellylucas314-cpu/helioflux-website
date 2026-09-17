/* Progressive enhancement: native details navigation also works without JS. */
(() => {
  'use strict';

  const init = () => {
    const menus = [...document.querySelectorAll('details.hf-science-menu')];
    if (!menus.length || document.documentElement.dataset.hfScienceNavigation) return;
    document.documentElement.dataset.hfScienceNavigation = 'ready';

    const close = (menu, restoreFocus = false) => {
      menu.open = false;
      if (restoreFocus) menu.querySelector(':scope > summary')?.focus();
    };

    // A single disclosure stays open. Do not turn these ordinary links into
    // an ARIA application menu: native Tab / Shift+Tab remain predictable.
    menus.forEach(menu => {
      menu.addEventListener('toggle', () => {
        if (menu.open) menus.forEach(other => {
          if (other !== menu && other.open) close(other);
        });
      });
      menu.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !menu.open) return;
        event.preventDefault();
        event.stopPropagation();
        close(menu, true);
      });
      menu.querySelectorAll('.hf-science-options > a').forEach(link => {
        link.addEventListener('click', () => close(menu));
      });
    });

    const closeOutside = target => menus.forEach(menu => {
      if (menu.open && !menu.contains(target)) close(menu);
    });
    document.addEventListener('click', event => closeOutside(event.target));
    document.addEventListener('focusin', event => closeOutside(event.target));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
