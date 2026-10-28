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
  // Request form. Every deck and contact link keeps its mailto as the no-JS fallback; with JS it opens this form,
  // which posts to FormSubmit and lands in connect@helioflux.co (Kelly, Oct 28: a form, not a calendar).
  const EMAIL = 'connect@helioflux.co';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL;
  const COPY = {
    deck: { title: 'Request the investor deck', intro: 'Tell us a little about you and we’ll email you the deck.', note: 'How did you hear about HelioFlux?', send: 'Send request', subject: 'Investor deck request' },
    talk: { title: 'Start a conversation', intro: 'Tell us what you’d like to talk about and we’ll reply by email.', note: 'Message', send: 'Send message', subject: 'New message' }
  };
  if (window.HTMLDialogElement && window.fetch) {
    const dialog = document.createElement('dialog');
    dialog.className = 'ask';
    dialog.setAttribute('aria-labelledby', 'ask-title');
    dialog.innerHTML = `
      <button class="ask-close" type="button" aria-label="Close"></button>
      <form class="ask-form" novalidate>
        <h2 class="ask-title" id="ask-title"></h2>
        <p class="ask-intro"></p>
        <label class="ask-field"><span>Name</span><input name="name" autocomplete="name" required></label>
        <label class="ask-field"><span>Email</span><input name="email" type="email" autocomplete="email" inputmode="email" required></label>
        <label class="ask-field"><span>Organization <em>optional</em></span><input name="organization" autocomplete="organization"></label>
        <label class="ask-field"><span class="ask-note-label"></span><textarea name="note" rows="3"></textarea></label>
        <input class="ask-honey" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
        <p class="ask-error" role="alert" hidden></p>
        <button class="button ask-send" type="submit"><span class="ask-send-label"></span><span class="arrow" aria-hidden="true">→</span></button>
        <p class="ask-direct">Prefer email? <a href="mailto:${EMAIL}">${EMAIL}</a> <button class="ask-copy" type="button">Copy</button></p>
      </form>
      <div class="ask-done" hidden tabindex="-1">
        <h2 class="ask-title">Thank you.</h2>
        <p class="ask-intro">Your note is in. We’ll reply to <strong class="ask-done-email"></strong> soon.</p>
        <button class="button button-quiet ask-finish" type="button">Close</button>
      </div>`;
    document.body.append(dialog);
    const form = dialog.querySelector('.ask-form'), done = dialog.querySelector('.ask-done');
    const error = dialog.querySelector('.ask-error'), send = dialog.querySelector('.ask-send');
    const note = form.elements.note;
    let kind = 'deck';

    const open = (next) => {
      kind = COPY[next] ? next : 'deck';
      const c = COPY[kind];
      form.hidden = false; done.hidden = true; error.hidden = true;
      dialog.querySelectorAll('.ask-title')[0].textContent = c.title;
      form.querySelector('.ask-intro').textContent = c.intro;
      form.querySelector('.ask-note-label').innerHTML = kind === 'talk' ? c.note : `${c.note} <em>optional</em>`;
      form.querySelector('.ask-send-label').textContent = c.send;
      note.required = kind === 'talk';
      note.rows = kind === 'talk' ? 4 : 2;
      dialog.showModal();
      // On a phone, leave focus on the close button so the keyboard doesn't cover the sheet before it is read.
      if (matchMedia('(pointer: fine)').matches) form.elements.name.focus();
    };
    const close = () => dialog.close();
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-form]');
      if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      open(link.dataset.form);
    });
    dialog.querySelector('.ask-close').addEventListener('click', close);
    dialog.querySelector('.ask-finish').addEventListener('click', close);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });   // a tap on the backdrop
    dialog.querySelector('.ask-copy').addEventListener('click', async (e) => {
      const b = e.currentTarget;
      try { await navigator.clipboard.writeText(EMAIL); b.textContent = 'Copied'; }
      catch { getSelection().selectAllChildren(dialog.querySelector('.ask-direct a')); b.textContent = 'Selected'; }
      setTimeout(() => { b.textContent = 'Copy'; }, 2200);
    });
    const fail = (text) => {
      error.innerHTML = text;
      error.hidden = false;
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      error.hidden = true;
      const bad = [...form.elements].find((el) => el.willValidate && !el.checkValidity());
      if (bad) {
        fail(bad.name === 'email' && bad.value ? 'Please check your email address.' : `Please add your ${bad.name === 'note' ? 'message' : bad.name}.`);
        bad.focus();
        return;
      }
      const f = form.elements, c = COPY[kind];
      const who = [f.name.value.trim(), f.organization.value.trim()].filter(Boolean).join(', ');
      const body = {
        name: f.name.value.trim(), email: f.email.value.trim(), organization: f.organization.value.trim() || '(not given)',
        [kind === 'talk' ? 'message' : 'heard_about_us']: note.value.trim() || '(not given)',
        page: location.href.split('#')[0], _url: location.href.split('#')[0], _replyto: f.email.value.trim(),
        _subject: `HelioFlux: ${c.subject} from ${who}`, _template: 'table', _captcha: 'false', _honey: f._honey.value
      };
      send.disabled = true;
      form.querySelector('.ask-send-label').textContent = 'Sending…';
      try {
        const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || res.status);
        done.querySelector('.ask-done-email').textContent = body.email;
        form.reset();
        form.hidden = true; done.hidden = false; done.focus();
      } catch (err) {
        fail(`That didn’t send. Please email <a href="mailto:${EMAIL}">${EMAIL}</a> instead, and sorry for the trouble.`);
      } finally {
        send.disabled = false;
        form.querySelector('.ask-send-label').textContent = c.send;
      }
    });
    // A shared link can open the form directly: helioflux.co/#request-deck or #get-in-touch
    const fromHash = () => { if (location.hash === '#request-deck') open('deck'); else if (location.hash === '#get-in-touch') open('talk'); };
    fromHash(); addEventListener('hashchange', fromHash);
  }
})();
