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

/* The two systems as Kelly's navy drawing, set moving, as the earlier live diagram did: light specks start at
   mitochondria inside the cells (where the light comes from, Nirosha's point), drift out through the membrane to
   QSense, each one glows as it lands, a counted dot runs to its color's lane, and LuminAI's bars
   ride the lanes left to right, taller when counts come in bursts. The cells, the detector and the lines are one
   still picture; the specks and bars are cut from the same drawing (assets/next/signal-path-night-parts.webp).
   Reduced motion and no JS keep the still drawing, and it only runs while it is on screen. */
(() => {
  const art = document.querySelector('[data-signal-path]');
  if (!art || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const canvas = art.querySelector('canvas');
  const toggle = art.querySelector('.signal-path__pause');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx || !toggle) return;
  // Everything below is measured in the drawing's own pixels (1856 x 540).
  const W = 1856, H = 540;
  const SPECKS = [[845,124,867,124,889,124,20,21],[524,124,551,124,578,124,25,24],[528,167,547,167,566,167,17,17],[243,167,261,167,279,167,16,18],[795,167,812,167,829,167,15,15],[911,124,936,124,961,124,23,21],[113,124,140,124,167,124,25,27],[297,167,318,167,339,167,19,18],[605,124,631,124,657,124,24,24],[360,167,378,167,396,167,16,18],[359,124,386,124,413,124,25,25],[174,167,197,167,220,167,21,19],[194,124,222,124,250,124,26,27],[278,124,305,124,332,124,25,26],[414,167,433,167,452,167,17,18],[986,124,0,167,21,167,19,21],[42,167,65,167,88,167,21,20],[693,167,710,167,727,167,15,16],[585,167,604,167,623,167,17,17],[642,167,659,167,676,167,15,17],[683,124,710,124,737,124,25,23],[440,124,468,124,496,124,26,25],[471,167,490,167,509,167,17,18],[111,167,132,167,153,167,19,20],[764,124,791,124,818,124,25,23]];
  const MOVER = [744,167,761,167,778,167,15,16];
  const BARS = [[[213,0,19,78,40.0],[0,124,17,41,20.0],[95,124,16,39,18.0],[150,0,19,79,41.0],[430,0,16,52,26.0],[133,0,15,83,40.0],[113,0,18,86,42.0],[42,0,6,109,54.0],[21,0,19,120,61.0],[913,0,18,42,19.0],[171,0,19,79,40.0],[507,0,16,47,23.0],[58,124,16,40,18.0],[933,0,18,42,19.0],[19,124,16,41,19.0],[702,0,17,44,21.0],[721,0,17,44,21.0],[234,0,20,78,38.0],[448,0,18,50,24.0],[37,124,19,41,19.0]],[[409,0,19,53,27.4],[389,0,18,55,25.4],[92,0,19,88,43.4],[525,0,18,46,22.4],[953,0,16,42,18.3],[76,124,17,40,17.3],[332,0,18,70,30.3],[50,0,19,107,50.3],[778,0,17,43,18.3],[740,0,18,44,19.3],[797,0,17,43,18.3],[816,0,18,43,19.3],[836,0,17,43,18.3],[71,0,19,105,48.3],[855,0,17,43,18.3],[275,0,19,71,31.3],[760,0,16,44,19.3],[971,0,18,42,18.3],[468,0,19,50,25.3]],[[604,0,18,45,21.1],[296,0,16,71,34.1],[256,0,17,72,35.1],[314,0,16,71,35.1],[370,0,17,61,33.1],[0,0,19,122,61.1],[352,0,16,66,33.1],[489,0,16,50,25.1],[545,0,17,46,21.1],[624,0,17,45,21.1],[192,0,19,79,38.1],[643,0,17,45,20.1],[662,0,18,45,21.1],[874,0,18,43,20.1],[894,0,17,43,19.1],[991,0,17,42,19.1],[564,0,19,46,22.1],[682,0,18,45,21.1],[585,0,17,46,22.1]]];
  const MITO = [[80,217],[81,187],[100,233],[130,104],[139,219],[146,386],[150,357],[160,401],[174,265],[179,303],[190,205],[192,260],[205,98],[220,192],[223,414],[292,391],[300,380],[303,310],[308,195],[326,224],[336,157],[364,127],[365,254],[373,378],[390,330],[398,338],[401,139],[402,417],[427,137],[443,210],[462,315],[477,391],[484,337]];
  const LANES = [[126.98, .00001], [283.48, -.00011], [440, .00005]];      // each lane line: y = c + slope * x
  const DETECTOR = { x: 888, top: 60, bottom: 488, out: 935, face: [880, 18, 58, 504] };
  const DOT_X = 1061, LANE_X0 = 1084, LANE_X1 = 1825, SPEED = 60;
  const GLOW = ['120,214,200', '0,169,214', '150,195,235'];          // the middle lane is the brand cyan of the heading
  const bySize = BARS.map((lane) => lane.filter((b) => b[2] >= 10).sort((a, b) => a[3] - b[3]));
  const glows = GLOW.map((rgb) => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${rgb},.55)`); grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    return c;
  });
  const base = new Image(), parts = new Image();
  let specks = [], sources = [], movers = [], hits = [], bars = [[], [], []], queue = [0, 0, 0], energy = [0, 0, 0], lastBar = [0, 0, 0];
  let clock = 0, debt = 0, flash = 0, scale = 1, ready = false, inView = false, paused = false, frame = 0, last = 0;

  const laneY = (i, x) => LANES[i][0] + LANES[i][1] * x;
  const ease = (t) => t * t * (3 - 2 * t);
  const grown = (p) => .35 + .65 * ease(Math.min(1, p.age / .9));            // a speck swells as it leaves the cell
  // Colors come from a shuffled bag of three, so no lane runs away with the light for long.
  let bag = [];
  function nextColor() {
    if (!bag.length) bag = [0, 1, 2].sort(() => Math.random() - .5);
    return bag.pop();
  }
  function spawn() {
    // Each speck starts at a mitochondrion, more often in the cells nearer the detector, and leaves the cell.
    const [mx, my] = MITO[Math.floor(Math.pow(Math.random(), .6) * MITO.length)];
    const x = mx + (Math.random() - .5) * 4, y = my + (Math.random() - .5) * 4, ch = nextColor();
    const ty = DETECTOR.top + Math.random() * (DETECTOR.bottom - DETECTOR.top);
    const dx = DETECTOR.x - x, dy = ty - y, d = Math.hypot(dx, dy), speed = d / (3.6 + Math.random() * 1.6);
    specks.push({ x, y, vx: dx / d * speed, vy: dy / d * speed, s: Math.floor(Math.random() * SPECKS.length), ch, age: 0, ph: Math.random() * 6.28 });
    sources.push({ x: mx, y: my, ch, t: 0 });
  }
  function addBar(i) {
    // Counts that arrive close together make taller bars, as in the drawing's clusters.
    energy[i] = energy[i] * Math.exp(-(clock - lastBar[i]) / .7) + 1;
    lastBar[i] = clock;
    const list = bySize[i], rank = Math.min(1, Math.random() ** 1.15 * .85 + Math.min(1, (energy[i] - 1) / 2.5) * .45);
    bars[i].push({ x: LANE_X0, b: list[Math.min(list.length - 1, Math.floor(rank * list.length))], age: 0 });
  }
  function step(dt) {
    clock += dt;
    const rate = 5 * (1 + .5 * Math.sin(clock * 1.1) + .3 * Math.sin(clock * 3.3 + 1));
    debt += Math.max(1.5, rate) * dt;
    while (debt >= 1) { debt -= 1; spawn(); }
    specks = specks.filter((p) => {
      p.age += dt;
      p.x += p.vx * dt; p.y += p.vy * dt + Math.sin(clock * 2.4 + p.ph) * 5 * dt;
      if (p.x < DETECTOR.x) return true;
      flash = Math.min(1, flash + .4);
      hits.push({ y: p.y, ch: p.ch, t: 0 });
      movers.push({ y: p.y, ch: p.ch, t: 0 });
      return false;
    });
    hits = hits.filter((h) => (h.t += dt / .5) < 1);
    sources = sources.filter((o) => (o.t += dt / .8) < 1);
    movers = movers.filter((m) => { m.t += dt / .55; if (m.t < 1) return true; queue[m.ch] = Math.min(3, queue[m.ch] + 1); return false; });
    bars.forEach((lane, i) => {
      lane.forEach((b) => { b.x += SPEED * dt; b.age += dt; });
      while (lane.length && lane[0].x > LANE_X1 + 20) lane.shift();
      const prev = lane[lane.length - 1];
      if (queue[i] && (!prev || prev.x - LANE_X0 >= (prev.b[2] + 16) / 2 + 6)) { queue[i] -= 1; addBar(i); }
    });
    flash = Math.max(0, flash - dt * 3);
  }

  function sprite(sx, sy, w, h, x, y, dw, dh) { ctx.drawImage(parts, sx, sy, w, h, x, y, dw, dh); }
  function draw() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.drawImage(base, 0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    if (flash > .01) {
      // QSense brightens a little as light lands on it, and glows where each speck hits.
      const [fx, fy, fw, fh] = DETECTOR.face;
      ctx.globalAlpha = flash * .3; ctx.drawImage(base, fx, fy, fw, fh, fx, fy, fw, fh);
    }
    hits.forEach((h) => { ctx.globalAlpha = (1 - h.t) * .8; ctx.drawImage(glows[h.ch], DETECTOR.x - 26, h.y - 26, 52, 52); });
    sources.forEach((o) => { ctx.globalAlpha = Math.sin(o.t * Math.PI) * .9; ctx.drawImage(glows[o.ch], o.x - 18, o.y - 18, 36, 36); });
    specks.forEach((p) => {
      const r = SPECKS[p.s][6] * 1.25 * grown(p);
      ctx.globalAlpha = Math.min(1, p.age / .5) * .7; ctx.drawImage(glows[p.ch], p.x - r, p.y - r, r * 2, r * 2);
    });
    ctx.globalCompositeOperation = 'source-over';
    specks.forEach((p) => {
      const s = SPECKS[p.s], k = grown(p), w = s[6] * k, h = s[7] * k;
      ctx.globalAlpha = Math.min(1, p.age / .5);
      sprite(s[p.ch * 2], s[p.ch * 2 + 1], s[6], s[7], p.x - w / 2, p.y - h / 2, w, h);
    });
    movers.forEach((m) => {
      const e = ease(m.t), w = MOVER[6], h = MOVER[7];
      const x = DETECTOR.out + (DOT_X - DETECTOR.out) * e, y = m.y + (laneY(m.ch, DOT_X) - m.y) * e;
      ctx.globalAlpha = m.t > .8 ? (1 - m.t) / .2 : 1;
      sprite(MOVER[m.ch * 2], MOVER[m.ch * 2 + 1], w, h, x - w / 2, y - h / 2, w, h);
    });
    bars.forEach((lane, i) => lane.forEach((bar) => {
      const [sx, sy, w, h, line] = bar.b, grow = ease(Math.min(1, bar.age / .3)), ly = laneY(i, bar.x);
      ctx.globalAlpha = Math.max(0, Math.min(1, (LANE_X1 - bar.x) / 140));
      sprite(sx, sy, w, h, bar.x - w / 2, ly - line * grow, w, h * grow);
    }));
    ctx.globalAlpha = 1;
  }

  function layout() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr));
    scale = canvas.width / W;
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
    if (ready && inView && !paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function start() {
    // Run a while unseen so the lanes are already full when it first shows.
    for (let t = 0; t < 14; t += 1 / 30) step(1 / 30);
    layout(); draw();
    ready = true;
    art.classList.add('is-live');
    toggle.hidden = false;
    new ResizeObserver(() => { layout(); draw(); }).observe(canvas);
    sync();
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play animation' : 'Pause animation';
    sync();
  });
  let loading = false;
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView && !loading) {
      loading = true;
      base.src = art.dataset.base; parts.src = art.dataset.parts;
      Promise.all([base.decode(), parts.decode()]).then(start).catch(() => {});
    }
    sync();
  }, { rootMargin: '300px 0px' }).observe(art);
  document.addEventListener('visibilitychange', sync);
})();
