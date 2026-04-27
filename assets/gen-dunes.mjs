// Procedurally generate stippled dune SVG for divider B.
// Outputs a single <svg> string that replaces the current .divider-b block.

import fs from 'fs';

const W = 800;        // viewBox width — smaller so dots scale up visually
const H = 460;        // viewBox height — keep dramatic but proportional

// Seeded RNG so output is stable across runs
let seed = 0x9b3c2e4a;
function rand() {
  seed = (seed * 1664525 + 1013904223) | 0;
  return ((seed >>> 0) % 100000) / 100000;
}
function jitter(amt) { return (rand() - 0.5) * 2 * amt; }

// A dune: baseline y(x) = base + amp * sin(2π x/period + phase)
// Fills from the wave line down to H with stippled dots.
// Density increases toward the bottom of each layer to create depth.
function dune({ base, amp, period, phase, color, opacity, count, sizeMin, sizeMax, fadeTop = 0.55 }) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const x = rand() * W;
    const yWave = base + amp * Math.sin((2 * Math.PI * x) / period + phase);
    if (yWave >= H) continue;
    // Pick a y between yWave and H, biased toward the bottom (squared random).
    const t = rand();
    const biased = Math.pow(t, 0.7); // 0..1, bias to bottom
    const y = yWave + biased * (H - yWave) + jitter(2);
    if (y >= H) continue;

    // Top-fade: dots near the wave crest are sparser/dimmer
    const distFromCrest = (y - yWave) / Math.max(1, H - yWave);
    if (distFromCrest < fadeTop && rand() > distFromCrest / fadeTop) continue;

    const r = sizeMin + rand() * (sizeMax - sizeMin);
    const op = (opacity * (0.55 + 0.45 * Math.min(1, distFromCrest / 0.6))).toFixed(2);
    dots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="${color}" opacity="${op}"/>`);
  }
  return dots.join('');
}

// Layered dunes from back (light cyan dust) to front (dense navy).
// Bigger dot sizes so they remain visible when SVG is scaled down on mobile.
const layers = [
  // Back dune: cyan dust — ethereal halo above the horizon
  { base: 110, amp: 55,  period: 620, phase: 0.4,  color: '#00A9D6', opacity: 0.55, count: 900,  sizeMin: 1.4, sizeMax: 2.2, fadeTop: 0.65 },
  // Second dune: brighter cyan, more pronounced
  { base: 170, amp: 75,  period: 540, phase: 1.2,  color: '#3ABFE3', opacity: 0.78, count: 1300, sizeMin: 1.6, sizeMax: 2.6, fadeTop: 0.55 },
  // Mid dune: teal warm accent
  { base: 230, amp: 65,  period: 460, phase: 2.4,  color: '#00c9c8', opacity: 0.88, count: 1500, sizeMin: 1.7, sizeMax: 2.8, fadeTop: 0.50 },
  // Forward dune: bright teal, dramatic peaks
  { base: 290, amp: 85,  period: 400, phase: 3.1,  color: '#1FD1D0', opacity: 0.95, count: 1700, sizeMin: 1.8, sizeMax: 3.0, fadeTop: 0.45 },
  // Front dune: dense navy that resolves into solid floor
  { base: 340, amp: 75,  period: 360, phase: 4.2,  color: '#0A2A48', opacity: 1.0,  count: 2400, sizeMin: 2.0, sizeMax: 3.4, fadeTop: 0.30 },
];

const dotsMarkup = layers.map(l => `<g>${dune(l)}</g>`).join('\n');

const svg = `<svg class="divider-b-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F7F6F2" stop-opacity="1"/>
      <stop offset="100%" stop-color="#F7F6F2" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#092743" stop-opacity="0"/>
      <stop offset="55%" stop-color="#092743" stop-opacity=".75"/>
      <stop offset="100%" stop-color="#092743" stop-opacity="1"/>
    </linearGradient>
  </defs>
  <!-- Cream sky fading down so dots emerge from the cream above seamlessly -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bSky)"/>
  ${dotsMarkup}
  <!-- Navy floor that absorbs the densest dots into solid navy -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#bFloor)"/>
</svg>`;

fs.writeFileSync('/home/user/helioflux-website/assets/divider-dunes.svg', svg);
console.log('wrote /tmp/divider-b.svg', svg.length, 'bytes,', layers.reduce((s, l) => s + l.count, 0), 'dots requested');
