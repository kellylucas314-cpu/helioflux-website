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
    const drift = r.height * .025;            // matches the 2.5% of spare photo above and below
    img.style.transform = 'translate3d(0,' + (drift - 2 * drift * t).toFixed(1) + 'px,0)';
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

/* The two systems as Kelly's cream drawing, set moving, as the earlier live diagram did: light specks start at
   mitochondria inside the cells (where the light comes from, Nirosha's point), drift out through the membrane to
   QSense, each one glows as it lands, a counted dot runs to its color's lane, and LuminAI's bars
   ride the lanes left to right, taller when counts come in bursts. The cells, the detector and the lines are one
   still picture; the specks and bars are cut from the same drawing (assets/next/signal-path-night-parts.webp, the navy re-inking).
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
  const SPECKS = [[714,122,735,122,756,122,19,19],[213,122,237,122,261,122,22,23],[117,163,134,163,151,163,15,15],[168,163,184,163,200,163,14,15],[471,163,487,163,503,163,14,14],[777,122,798,122,819,122,19,19],[357,122,382,122,407,122,23,22],[216,163,234,163,252,163,16,15],[432,122,456,122,480,122,22,22],[270,163,287,163,304,163,15,15],[285,122,309,122,333,122,22,23],[840,122,861,122,882,122,19,19],[57,122,84,122,111,122,25,25],[504,122,528,122,552,122,22,22],[321,163,337,163,353,163,14,15],[903,122,923,122,943,122,18,18],[963,122,983,122,1003,122,18,18],[567,163,583,163,599,163,14,13],[369,163,386,163,403,163,15,15],[519,163,535,163,551,163,14,14],[576,122,599,122,622,122,21,22],[138,122,163,122,188,122,23,24],[60,163,79,163,98,163,17,16],[0,163,20,163,40,163,18,18],[645,122,668,122,691,122,21,21]];
  const MOVER = [420,163,437,163,454,163,15,15];
  const BARS = [[[198,0,19,75,38.4],[907,0,18,40,19.4],[927,0,16,40,19.4],[219,0,18,75,39.4],[408,0,15,50,24.4],[119,0,16,82,39.4],[100,0,17,84,40.4],[21,0,18,118,60.4],[763,0,16,41,19.4],[137,0,18,80,40.4],[577,0,16,44,21.4],[982,0,15,39,17.4],[615,0,15,43,19.4],[999,0,15,39,17.4],[781,0,17,41,19.4],[707,0,16,42,20.4],[177,0,19,77,38.4],[443,0,17,48,23.4],[0,122,18,39,18.4]],[[371,0,17,51,26.5],[390,0,16,51,23.5],[80,0,18,89,42.5],[483,0,17,45,22.5],[632,0,17,43,19.5],[39,122,16,38,15.5],[315,0,18,68,28.5],[41,0,18,105,49.5],[800,0,16,41,16.5],[818,0,15,41,16.5],[835,0,17,41,17.5],[854,0,15,41,16.5],[725,0,16,42,18.5],[61,0,17,103,47.5],[945,0,17,40,16.5],[276,0,18,70,32.5],[871,0,15,41,17.5],[20,122,17,39,16.5],[462,0,19,48,24.5]],[[595,0,18,44,21.0],[239,0,17,71,35.0],[258,0,16,71,35.0],[296,0,17,70,35.0],[353,0,16,52,27.0],[0,0,19,120,62.0],[335,0,16,65,33.0],[425,0,16,49,26.0],[651,0,16,43,20.0],[502,0,16,45,22.0],[157,0,18,78,38.0],[520,0,16,45,21.0],[669,0,17,43,21.0],[688,0,17,43,21.0],[964,0,16,40,18.0],[888,0,17,41,19.0],[538,0,18,45,22.0],[743,0,18,42,20.0],[558,0,17,45,22.0]]];
  const MITO = [[82,187],[87,220],[102,236],[104,112],[123,108],[141,217],[147,386],[154,352],[159,401],[178,264],[180,304],[199,198],[203,97],[208,257],[222,415],[224,191],[295,390],[305,313],[308,199],[335,165],[362,129],[363,250],[374,376],[391,330],[403,137],[405,418],[414,290],[445,206],[466,316],[475,395],[486,336]];
  const LANES = [[126.41, 0], [282.49, .00001], [440, 0]];      // each lane line: y = c + slope * x
  const DETECTOR = { x: 898, top: 64, bottom: 476, out: 932 };
  const DOT_X = 1060, LANE_X0 = 1084, LANE_X1 = 1824, SPEED = 60;
  const GLOW = ['80,170,172', '0,144,184', '105,155,200'];          // the middle lane is the display teal of the heading
  const bySize = BARS.map((lane) => lane.filter((b) => b[2] >= 10).sort((a, b) => a[3] - b[3]));
  const glows = GLOW.map((rgb) => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${rgb},.42)`); grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    return c;
  });
  const base = new Image(), parts = new Image();
  let specks = [], sources = [], movers = [], hits = [], bars = [[], [], []], queue = [0, 0, 0], energy = [0, 0, 0], lastBar = [0, 0, 0];
  let clock = 0, debt = 0, scale = 1, ready = false, inView = false, paused = false, frame = 0, last = 0;

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
  }

  function sprite(sx, sy, w, h, x, y, dw, dh) { ctx.drawImage(parts, sx, sy, w, h, x, y, dw, dh); }
  function draw() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    ctx.drawImage(base, 0, 0, W, H);
    // Soft colored halos on the paper: where each speck leaves its mitochondrion, around it in flight, and where it lands.
    hits.forEach((h) => { ctx.globalAlpha = (1 - h.t) * .8; ctx.drawImage(glows[h.ch], DETECTOR.x - 26, h.y - 26, 52, 52); });
    sources.forEach((o) => { ctx.globalAlpha = Math.sin(o.t * Math.PI) * .9; ctx.drawImage(glows[o.ch], o.x - 18, o.y - 18, 36, 36); });
    specks.forEach((p) => {
      const r = SPECKS[p.s][6] * 1.25 * grown(p);
      ctx.globalAlpha = Math.min(1, p.age / .5) * .7; ctx.drawImage(glows[p.ch], p.x - r, p.y - r, r * 2, r * 2);
    });
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
