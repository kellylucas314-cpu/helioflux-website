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

/* Two systems, one signal: light specks leave the cells on the left and fly to QSense, drawn as an upright
   sensor. Each one it catches is counted and sent to LuminAI's three lanes, one per color, where the counts
   scroll past as bars, so both the color and the timing of the light show. Off screen or paused, it rests;
   with reduced motion it draws one still frame. */
(() => {
  const stage = document.querySelector('[data-signal-path]');
  if (!stage) return;
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const toggle = stage.querySelector('.signal-path__pause');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const COLORS = ['0,169,214', '125,212,240', '226,240,255'];
  const BIN = .14, LANE_SECONDS = 6.5;
  let W = 0, H = 0, g = {}, specks = [], movers = [], lanes = [[], [], []], current = [0, 0, 0];
  let binClock = 0, clock = 0, spawnDebt = 0, flash = 0;
  let inView = false, paused = false, frame = 0, last = 0;

  function layout() {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const narrow = W < 560;
    const cr = Math.min(H * .13, W * (narrow ? .07 : .05));
    const cx = W * (narrow ? .17 : .15), cy = H * .52;
    g = {
      narrow,
      cells: [[cx - cr * .9, cy - cr * .75, cr], [cx + cr * .95, cy - cr * .55, cr * .92], [cx - cr * .1, cy + cr * .95, cr * 1.04], [cx + cr * 1.6, cy + cr * .95, cr * .7]],
      dx: W * (narrow ? .44 : .42), dTop: H * .2, dBot: H * .84,
      laneX0: W * .55, laneX1: W * .95, laneY: [H * .3, H * .52, H * .74], laneH: H * .16,
    };
  }

  function spawn() {
    const c = g.cells[Math.floor(Math.random() * g.cells.length)];
    const a = (Math.random() - .5) * Math.PI * 1.3;
    const x = c[0] + Math.cos(a) * c[2], y = c[1] + Math.sin(a) * c[2];
    const ty = g.dTop + Math.random() * (g.dBot - g.dTop);
    const speed = W * (.11 + Math.random() * .07);
    const d = Math.hypot(g.dx - x, ty - y);
    specks.push({ x, y, vx: (g.dx - x) / d * speed, vy: (ty - y) / d * speed, ch: Math.floor(Math.random() * 3), size: 1.1 + Math.random() * .9, phase: Math.random() * 6.28 });
  }

  function step(dt) {
    clock += dt;
    // The emission rate breathes slowly and comes in small bursts, so the lanes show a rhythm.
    const rate = (g.narrow ? 9 : 14) * (1 + .55 * Math.sin(clock * 1.3) + .35 * Math.sin(clock * 3.7 + 1));
    spawnDebt += Math.max(2, rate) * dt;
    while (spawnDebt >= 1) { spawnDebt -= 1; spawn(); }
    specks = specks.filter((p) => {
      p.x += p.vx * dt; p.y += p.vy * dt + Math.sin(clock * 3 + p.phase) * .15;
      if (p.x < g.dx) return true;
      flash = 1;
      movers.push({ x: g.dx, y: p.y, ch: p.ch, t: 0 });
      return false;
    });
    movers = movers.filter((m) => { m.t += dt / .45; if (m.t < 1) return true; current[m.ch] += 1; return false; });
    binClock += dt;
    while (binClock >= BIN) {
      binClock -= BIN;
      lanes.forEach((lane, i) => { lane.unshift(current[i]); if (lane.length > LANE_SECONDS / BIN) lane.pop(); });
      current = [0, 0, 0];
    }
    flash = Math.max(0, flash - dt * 4);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Cells: soft outlines with a nucleus each.
    g.cells.forEach(([x, y, r], i) => {
      const s = 1 + .018 * Math.sin(clock * 1.1 + i);
      ctx.beginPath(); ctx.arc(x, y, r * s, 0, 6.283);
      ctx.fillStyle = 'rgba(0,169,214,.06)'; ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(216,238,255,.5)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(x + r * .12, y - r * .08, r * .34, 0, 6.283);
      ctx.fillStyle = 'rgba(0,169,214,.22)'; ctx.fill();
      ctx.strokeStyle = 'rgba(125,212,240,.55)'; ctx.stroke();
    });
    // Specks in flight.
    specks.forEach((p) => {
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
      glow.addColorStop(0, 'rgba(' + COLORS[p.ch] + ',.45)'); glow.addColorStop(1, 'rgba(' + COLORS[p.ch] + ',0)');
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 6, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(' + COLORS[p.ch] + ',.95)'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill();
    });
    // QSense: an upright sensor face that brightens as it catches light.
    const sw = Math.max(8, W * .012);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(g.dx - sw / 2, g.dTop, sw, g.dBot - g.dTop, sw / 2); else ctx.rect(g.dx - sw / 2, g.dTop, sw, g.dBot - g.dTop);
    ctx.fillStyle = 'rgba(0,169,214,' + (.12 + flash * .28) + ')'; ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(255,255,255,.62)'; ctx.stroke();
    // Counted light travelling to its color lane.
    movers.forEach((m) => {
      const e = m.t * m.t * (3 - 2 * m.t);
      const x = g.dx + (g.laneX0 - g.dx) * e, y = m.y + (g.laneY[m.ch] - m.y) * e;
      ctx.fillStyle = 'rgba(' + COLORS[m.ch] + ',.9)'; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 6.283); ctx.fill();
    });
    // LuminAI: three lanes, one per color; each bar is one moment's count, newest on the left.
    const binW = (g.laneX1 - g.laneX0) / (LANE_SECONDS / BIN);
    const offset = (binClock / BIN) * binW;
    lanes.forEach((lane, i) => {
      const y = g.laneY[i];
      ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(g.laneX0, y - .5, g.laneX1 - g.laneX0, 1);
      lane.forEach((n, k) => {
        if (!n) return;
        const x = g.laneX0 + (k + 1) * binW + offset;
        if (x > g.laneX1) return;
        const h = Math.min(g.laneH, n * g.laneH * .32);
        const fade = 1 - (x - g.laneX0) / (g.laneX1 - g.laneX0) * .7;
        ctx.fillStyle = 'rgba(' + COLORS[i] + ',' + (.9 * fade) + ')';
        ctx.fillRect(x - Math.max(1.2, binW * .32), y - h / 2, Math.max(2.4, binW * .64), h);
      });
      ctx.fillStyle = 'rgba(' + COLORS[i] + ',.9)'; ctx.beginPath(); ctx.arc(g.laneX0, y, 2.6, 0, 6.283); ctx.fill();
    });
  }

  function tick(now) {
    frame = 0;
    const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
    last = now; step(dt); draw();
    if (inView && !paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; last = 0;
    if (inView && !paused && !document.hidden && !reduce.matches) frame = requestAnimationFrame(tick);
  }
  function still() { for (let t = 0; t < 7; t += 1 / 30) step(1 / 30); draw(); }

  layout(); still();
  new ResizeObserver(() => { layout(); if (!frame) draw(); }).observe(stage);
  if (reduce.matches || !('IntersectionObserver' in window)) return;
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play' : 'Pause';
    sync();
  });
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { rootMargin: '80px 0px' }).observe(stage);
  document.addEventListener('visibilitychange', sync);
})();
