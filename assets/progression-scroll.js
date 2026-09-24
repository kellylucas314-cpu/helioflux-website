/* Scroll position chooses a story beat; that beat chooses BOTH its frame and caption.
   Source landmarks were inspected in assets/progression-video (one-based filenames).
   These are illustrative visual beats, not measured biological/clinical stages. */
(() => {
  const STAGES = [
    { from: 1,   to: 10,  weight: 1 },
    { from: 11,  to: 19,  weight: 1 },
    { from: 20,  to: 33,  weight: 1 },
    { from: 34,  to: 43,  weight: 1 },
    { from: 44,  to: 86,  weight: 1.2 },
    { from: 87,  to: 149, weight: 1.2 },
    // The remaining source footage mostly wobbles around this mature-tumor image.
    // Stop growing here and give the longer conclusion its own reading space.
    { from: 150, to: 150, weight: 1.25 }
  ];
  const TOTAL_WEIGHT = STAGES.reduce((sum, stage) => sum + stage.weight, 0);
  function sample(progress) {
    const position = Math.max(0, Math.min(1, progress)) * TOTAL_WEIGHT;
    let start = 0;
    for (let phase = 0; phase < STAGES.length; phase++) {
      const stage = STAGES[phase];
      if (position < start + stage.weight || phase === STAGES.length - 1) {
        const local = Math.max(0, Math.min(1, (position - start) / stage.weight));
        return { phase, frame: stage.from + Math.min(stage.to - stage.from,
          Math.floor(local * (stage.to - stage.from + 1))) };
      }
      start += stage.weight;
    }
  }
  // Keep the timing model independently testable without a browser or animation library.
  if (typeof module !== 'undefined' && module.exports) module.exports = { STAGES, TOTAL_WEIGHT, sample };
  if (typeof document === 'undefined') return;

  const block = document.getElementById('probProgression');
  const canvas = document.getElementById('probProgCanvas');
  if (!block || !canvas || !window.gsap || !window.ScrollTrigger) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;
  const phases = Array.from(block.querySelectorAll('.phase'));
  const pin = block.querySelector('.prob-prog-pin');
  const frames = new Map();
  const pending = new Map();
  let currentProgress = 0;
  let lastFrame = -1;
  let queued = false;
  let enabled = false;
  let loadingStarted = false;
  const framePath = i => `assets/progression-video/f-${String(i).padStart(3, '0')}.webp`;

  function render() {
    queued = false;
    if (!enabled) return;
    const target = sample(currentProgress);
    const stage = STAGES[target.phase];
    // A slow/missing frame can only fall back WITHIN the same story beat.
    // Never advance text over an image from an earlier beat.
    let frame = target.frame;
    if (!frames.has(frame)) {
      frame = [...frames.keys()].filter(i => i >= stage.from && i <= stage.to)
        .sort((a, b) => Math.abs(a - target.frame) - Math.abs(b - target.frame))[0];
    }
    const img = frames.get(frame);
    if (!img) return;
    if (lastFrame !== frame) {
      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      lastFrame = frame;
    }
    phases.forEach((el, i) => {
      el.classList.toggle('active', i === target.phase);
      el.setAttribute('aria-hidden', String(i !== target.phase));
    });
    block.dataset.frame = String(frame);
    block.dataset.phase = String(target.phase);
  }
  function requestRender() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(render);
  }
  function loadFrame(i) {
    if (pending.has(i)) return pending.get(i);
    const promise = (async () => {
      const img = new Image();
      img.decoding = 'async';
      img.src = framePath(i);
      try {
        await img.decode();
        if (img.naturalWidth) frames.set(i, img);
      } catch (_) { /* Keep the readable HTML fallback if a milestone is unavailable. */ }
      requestRender(); // Repaint the CURRENT position, never reset to the first frame.
    })();
    pending.set(i, promise);
    return promise;
  }
  async function loadRemaining() {
    if (loadingStarted) return;
    loadingStarted = true;
    const remaining = Array.from({ length: 150 }, (_, n) => n + 1).filter(i => !pending.has(i));
    let next = 0;
    await Promise.all(Array.from({ length: 6 }, async () => {
      while (next < remaining.length) await loadFrame(remaining[next++]);
    }));
  }
  function setNativeScroll(active) {
    // Lenis 1.0.42 is used elsewhere on the page. During this section use native
    // wheel/touch movement, with no second easing tail or scroll snapping.
    if (typeof lenis === 'undefined') return;
    const smooth = !active && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (lenis.options.smoothWheel === smooth) return;
    lenis.scrollTo(window.scrollY, { immediate: true });
    lenis.options.smoothWheel = smooth;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference) and (min-height: 600px)', () => {
    let cancelled = false;
    let trigger;
    // The static, matched image/caption sequence remains usable while these load.
    Promise.all(STAGES.map(stage => loadFrame(stage.from))).then(() => {
      if (cancelled || STAGES.some(stage => !frames.has(stage.from))) return;
      enabled = true;
      block.classList.add('is-enhanced');
      function measure() {
        const nav = document.querySelector('nav');
        const top = Math.ceil(nav ? nav.getBoundingClientRect().height : 72);
        block.style.setProperty('--prog-top', `${top}px`);
        // Each short caption gets at least 420px; the two longer beats and closer
        // get more. This is independent of how many frames happen to be in a beat.
        const unit = Math.max(420, Math.min(600, window.innerHeight * 0.55));
        const distance = Math.round(unit * TOTAL_WEIGHT);
        block.style.height = `${pin.offsetHeight + distance}px`;
        return { top, distance };
      }
      let layout = measure();
      trigger = ScrollTrigger.create({
        id: 'tumor-progression',
        trigger: block,
        start: () => `top top+=${layout.top}`,
        end: () => `+=${layout.distance}`,
        pin,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: () => { layout = measure(); },
        onRefresh: self => {
          currentProgress = self.progress;
          setNativeScroll(self.isActive);
          requestRender();
        },
        onToggle: self => setNativeScroll(self.isActive),
        onUpdate: self => {
          currentProgress = self.progress;
          requestRender();
        }
      });
      currentProgress = trigger.progress;
      render();
      loadRemaining();
      ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
      enabled = false;
      if (trigger) trigger.kill();
      setNativeScroll(false);
      block.classList.remove('is-enhanced');
      block.style.removeProperty('height');
      block.style.removeProperty('--prog-top');
      phases.forEach(el => el.removeAttribute('aria-hidden'));
      lastFrame = -1;
    };
  });
})();
