#!/usr/bin/env node
/*
 * Renders a hero option page frame by frame with headless Chrome and encodes a video.
 *   --page option-a-terrain.html   which page to render (default index.html)
 *
 *   node render.mjs --out mitosis-wireframe-2160p.mp4 --w 3840 --h 2160 --fps 60
 *   node render.mjs --still 2.4 still.png --w 1920 --h 1080
 *   node render.mjs --out clean-1080p.mp4 --w 1920 --h 1080 --hud 0 --fade 0 --webm
 *
 * Flags: --w --h (pixels), --fps, --out (mp4 path), --webm (also write VP9 .webm),
 *        --hud 0|1, --fade 0|1, --start/--end (seconds), --keep (keep PNG frames),
 *        --still <t> <out.png>.
 */
import { chromium } from '/Users/kellylucas/playwright-tutorial/node_modules/playwright-core/index.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 && i + 1 < args.length ? args[i + 1] : def; };
const has  = name => args.includes('--' + name);

const W = parseInt(flag('w', '1920'), 10), H = parseInt(flag('h', '1080'), 10);
const FPS = parseFloat(flag('fps', '60'));
const HUD = flag('hud', '1'), FADE = flag('fade', '1');
const STILL = has('still') ? parseFloat(args[args.indexOf('--still') + 1]) : null;
const STILL_OUT = STILL !== null ? args[args.indexOf('--still') + 2] : null;
const PAGE = flag('page', 'index.html');
const OUT = flag('out', PAGE.replace(/\.html$/, '') + `-${H}p.mp4`);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG = process.env.FFMPEG || `${process.env.HOME}/.local/bin/ffmpeg`;

/* tiny static server for the folder (ES modules need http://) */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(here, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!p.startsWith(here) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ executablePath: CHROME, args: ['--use-gl=angle', '--use-angle=metal', '--enable-unsafe-swiftshader', '--disable-gpu-vsync', '--hide-scrollbars'] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('page error:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(`http://127.0.0.1:${port}/${PAGE}?export=1&dpr=1&hud=${HUD}&fade=${FADE}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 90000 });
const DURATION = await page.evaluate(() => window.__duration);

if (STILL !== null) {
  await page.evaluate(t => window.__seek(t), STILL);
  await page.screenshot({ path: STILL_OUT, type: 'png' });
  console.log('wrote', STILL_OUT);
} else {
  const start = parseFloat(flag('start', '0')), end = parseFloat(flag('end', String(DURATION)));
  const framesDir = path.join(here, '.frames'); fs.rmSync(framesDir, { recursive: true, force: true }); fs.mkdirSync(framesDir);
  const n = Math.round((end - start) * FPS);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = start + i / FPS;
    await page.evaluate(t => window.__seek(t), t);
    await page.screenshot({ path: path.join(framesDir, `f_${String(i).padStart(6, '0')}.png`), type: 'png' });
    if (i % 30 === 0) process.stdout.write(`\rframe ${i + 1}/${n}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  console.log(`\nrendered ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  const inPat = path.join(framesDir, 'f_%06d.png');
  const mp4 = spawnSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-i', inPat,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.resolve(here, OUT)], { stdio: 'inherit' });
  if (mp4.status !== 0) console.error('ffmpeg mp4 failed');
  else console.log('wrote', OUT);
  if (has('webm')) {
    const webm = OUT.replace(/\.mp4$/, '.webm');
    const r = spawnSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', String(FPS), '-i', inPat,
      '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '28', '-row-mt', '1', '-pix_fmt', 'yuv420p', path.resolve(here, webm)], { stdio: 'inherit' });
    if (r.status === 0) console.log('wrote', webm);
  }
  if (!has('keep')) fs.rmSync(framesDir, { recursive: true, force: true });
}

await browser.close();
server.close();
