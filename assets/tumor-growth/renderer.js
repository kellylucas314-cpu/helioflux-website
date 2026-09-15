/* One ordered manifest drives drawing, scale and the caption returned to callers.
   Artwork stays sharp for most of each interval; growth itself remains continuous. */
(() => {
  const frames = window.TUMOR_SEQUENCE.frames;
  if (window.matchMedia?.('(max-width:880px)').matches) frames.forEach(f=>{f.atlas=f.atlas960||f.atlas;});
  // Keep the changed nucleus readable on small screens without reversing either body dimension.
  if (window.matchMedia?.('(max-width:600px)').matches) {
    let width=0,height=0;
    frames.forEach(f=>{const a=f.bodyAspect,m=Math.max(1,a);f.extent=Math.max(.46+(f.extent-.3)*(.32/.48),height*m,width/a*m);height=f.extent/m;width=height*a;});
  }
  const images = new Map();
  let loading;
  const previousDominant = new WeakMap();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smoothstep = value => value * value * (3 - 2 * value);
  // Keep most of each drawing crisp while giving the change enough scroll
  // travel to resolve smoothly. A stopped scroll retains its exact blend.
  const transitionStart = 0.65;

  function sample(position) {
    const p = clamp(Number.isFinite(position) ? position : 0, 0, frames.length - 1);
    const a = Math.floor(p), b = Math.min(a + 1, frames.length - 1), t = p - a;
    const blend = smoothstep(clamp((t - transitionStart) / (1 - transitionStart), 0, 1));
    const from = frames[a], to = frames[b];
    const fromHeight = from.extent / Math.max(1, from.bodyAspect);
    const toHeight = to.extent / Math.max(1, to.bodyAspect);
    const height = fromHeight + (toHeight - fromHeight) * t;
    const width = fromHeight * from.bodyAspect + (toHeight * to.bodyAspect - fromHeight * from.bodyAspect) * t;
    return {a, b, t, blend, dominant: blend < 0.5 ? a : b, extent: Math.max(width, height), aspect: width / height};
  }

  function load() {
    if (!loading) {
      const sources = [...new Set(frames.flatMap(frame => [frame.atlas, frame.blendSource?.atlas].filter(Boolean)))];
      loading = Promise.all(sources.map(async name => {
        const image = new Image();
        image.decoding = 'async';
        image.src = name;
        // Decode before making the sequence visible, so scrolling never swaps
        // into a blank image or waits for a new file at a stage boundary.
        await image.decode();
        images.set(name, image);
      }));
    }
    return loading;
  }

  function layer(ctx, source, extent, aspect, size, alpha) {
    const [sx, sy, sw, sh] = source.rect, [x0, y0, x1, y1] = source.bounds;
    const height = extent * size / Math.max(1, aspect);
    const scaleX = height * aspect / (x1 - x0), scaleY = height / (y1 - y0);
    ctx.globalAlpha = alpha;
    const raster = images.get(source.atlas);
    const ratio = raster.naturalWidth / (source.pixelSize?.[0] || 1254);
    ctx.drawImage(raster, sx*ratio, sy*ratio, sw*ratio, sh*ratio,
      size * 0.5 - (x0 + x1) * 0.5 * scaleX,
      size * 0.46 - (y0 + y1) * 0.5 * scaleY, sw * scaleX, sh * scaleY);
  }

  function sameSource(a, b) {
    return a.atlas === b.atlas && a.rect.join() === b.rect.join() && a.bounds.join() === b.bounds.join()
      && !a.blendSource && !b.blendSource;
  }

  function frameLayer(ctx, frame, extent, aspect, size, alpha) {
    layer(ctx, frame, extent, aspect, size, alpha);
    if (frame.blendSource) layer(ctx, frame.blendSource, extent, aspect, size, alpha * frame.blendAlpha);
  }

  function draw(canvas, position, options = {}) {
    const state = sample(position);
    const transitionBlend = state.blend;
    if (options.stabilize && state.a !== state.b) {
      const previous = previousDominant.get(canvas);
      // A tiny reversal near 50/50 should not alternate the caption every wheel
      // event. Hold the same visibly dominant source inside a narrow deadband.
      if (previous === state.a && state.blend <= 0.6) {
        state.dominant = state.a;
        state.blend = Math.min(state.blend, 0.499);
      } else if (previous === state.b && state.blend >= 0.4) {
        state.dominant = state.b;
        state.blend = Math.max(state.blend, 0.501);
      }
    }
    state.transitionBlend = transitionBlend;
    state.settled = false;
    previousDominant.set(canvas, state.dominant);
    const ctx = canvas.getContext('2d', {alpha: false});
    if (!ctx) return state;
    const size = canvas.width;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    const from = frames[state.a], to = frames[state.b];
    if (state.blend === 1 && state.b !== state.a) {
      // A settled next frame must not leave an earlier vessel or tissue fringe
      // outside its crop. Draw it alone onto the clean plate.
      frameLayer(ctx, to, state.extent, state.aspect, size, 1);
    } else {
      frameLayer(ctx, from, state.extent, state.aspect, size, 1);
      if (state.b !== state.a && state.blend > 0 && !sameSource(from, to)) {
        frameLayer(ctx, to, state.extent, state.aspect, size, state.blend);
      }
    }
    ctx.restore();
    canvas.dataset.frame = String(state.dominant + 1);
    canvas.dataset.extent = String(state.extent);
    canvas.dataset.blend = String(state.blend);
    return state;
  }

  window.TumorArt = {load, draw, sample, frames};
})();
