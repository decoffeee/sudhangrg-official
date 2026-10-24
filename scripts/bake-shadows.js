// Bakes the design's CSS drop-shadow() stacks into the cut-out WebPs and
// rasterises the brush SVGs to WebP, so no moving layer needs a CSS filter or
// an SVG decode. Uses the sharp that ships with Next.
//
//   node scripts/bake-shadows.js <dir-with-original-cutouts> [outDir=public/images]
//
// Point it at a folder holding the *un-shadowed* hero-front / person-front /
// vision-front / send-front WebPs (the pre-bake originals are in git history
// before the "transform-only hero" commit). Brushes are read from public/svg.
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const SRC = process.argv[2] ? path.resolve(process.argv[2]) : null;
const OUT = path.resolve(process.argv[3] ?? path.join(ROOT, "public/images"));
if (!SRC) {
  console.error("usage: node scripts/bake-shadows.js <dir-with-original-cutouts> [outDir]");
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });
const svg = (f) => path.join(ROOT, "public/svg", f);

// Shadow colour from the stylesheet: rgba(5, 9, 20, a).
const COLOR = { r: 5, g: 9, b: 20 };
const CLEAR = { r: 0, g: 0, b: 0, alpha: 0 };

// One CSS drop-shadow(0 dy blur alpha) in design units; `ppu` is image pixels
// per design unit at the layer's resting scale.
async function shadowLayer(src, { dy, blur, alpha }, ppu) {
  const { width, height } = await sharp(src).metadata();
  const dyPx = Math.round(dy * ppu);
  const sigma = Math.max(0.3, (blur * ppu) / 2); // CSS blur radius ≈ 2σ
  const a = await sharp(src).ensureAlpha().extractChannel("alpha").linear(alpha, 0).toBuffer();
  const tinted = await sharp({ create: { width, height, channels: 3, background: COLOR } }).joinChannel(a).png().toBuffer();
  const shifted = await sharp(tinted).blur(sigma).extend({ top: dyPx, bottom: 0, left: 0, right: 0, background: CLEAR }).png().toBuffer();
  return sharp(shifted).extract({ left: 0, top: 0, width, height }).png().toBuffer();
}

// Seeded value noise: a coarse random grid upscaled with a cubic kernel, so
// the result is smooth at roughly `cell` px and identical on every run.
async function smoothNoise(width, height, cell, seed) {
  const w = Math.ceil(width / cell) + 2;
  const h = Math.ceil(height / cell) + 2;
  let t = seed >>> 0;
  const rand = () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const grid = Buffer.alloc(w * h);
  for (let i = 0; i < grid.length; i++) grid[i] = Math.round(rand() * 255);
  return sharp(grid, { raw: { width: w, height: h, channels: 1 } })
    .resize(width, height, { kernel: "cubic", fit: "fill" })
    .extractChannel(0) // sharp widens single-channel raw input to sRGB
    .raw()
    .toBuffer();
}

// A paper cut-out behind the subject, hugging its silhouette. The alpha is
// blurred into a falloff field (σ = `width` px) and thresholded at a level
// that wanders with smooth noise, so the edge swells and pinches like a
// hand-cut border instead of tracing a uniform offset. `rough` 0 gives an
// even border about `width` px wide; 1 lets it range from ~0.4× to ~1.6×.
// `fringe` px of torn fibres can be added past the cut (0 = clean cut). The
// cut edge is shaded a touch darker over `rim` px, which is what makes it
// read as a sheet with thickness rather than a flat outline.
async function outlined(
  src,
  { width: w, rough = 0.6, seed = 7, fringe = 0, rim = 2.5, grain = 0, color = { r: 244, g: 240, b: 231 } },
) {
  const { width, height } = await sharp(src).metadata();
  const field = await sharp(src).ensureAlpha().extractChannel("alpha").blur(w).raw().toBuffer();
  const swell = await smoothNoise(width, height, w * 8, seed);
  const grit = await smoothNoise(width, height, w * 2, seed + 1);
  const fiber = fringe || grain ? await smoothNoise(width, height, 1.5, seed + 3) : null;
  const ramp = (255 * 0.24) / w; // field change across ~1px at the edge
  const px = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const n = ((swell[i] - 128) / 128) * 0.75 + ((grit[i] - 128) / 128) * 0.25;
    const thr = 40 * 2 ** (rough * n * 1.6); // 40 ≈ one σ out from a solid edge
    const d = (field[i] - thr) / ramp; // signed px from the cut, + inside
    const f = fiber ? (fiber[i] - 128) / 128 : 0;
    let alpha;
    let tone;
    if (d >= 0) {
      alpha = Math.min(1, d + 1);
      tone = 1 - 0.07 * Math.max(0, 1 - d / rim) + f * grain * 0.03;
    } else if (fringe > 0) {
      // Fibres thin out with distance past the edge.
      alpha = Math.max(0, Math.min(1, (f + 0.2 + d / fringe) * 1.6)) * Math.max(0, 1 + d / fringe) * 0.85;
      tone = 1.04;
    } else {
      alpha = 0;
      tone = 1;
    }
    px[i * 4] = Math.min(255, color.r * tone);
    px[i * 4 + 1] = Math.min(255, color.g * tone);
    px[i * 4 + 2] = Math.min(255, color.b * tone);
    px[i * 4 + 3] = Math.round(alpha * 255);
  }
  const border = await sharp(px, { raw: { width, height, channels: 4 } }).png().toBuffer();
  return sharp(border).composite([{ input: src }]).png().toBuffer();
}

async function bake(file, shadows, ppu, border) {
  const src = border ? await outlined(path.join(SRC, file), { ...border, width: border.width * ppu }) : path.join(SRC, file);
  const { width, height } = await sharp(src).metadata();
  const layers = [];
  // CSS applies the list left→right, each shadow under the previous result,
  // so the last-listed shadow is the bottom-most layer.
  for (const s of [...shadows].reverse()) layers.push({ input: await shadowLayer(src, s, ppu), top: 0, left: 0 });
  layers.push({ input: src, top: 0, left: 0 });
  const out = path.join(OUT, file);
  await sharp({ create: { width, height, channels: 4, background: CLEAR } })
    .composite(layers)
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(out);
  console.log(file, width, height, fs.statSync(out).size);
}

async function raster(file, outName, width) {
  const meta = await sharp(svg(file)).metadata();
  const out = path.join(OUT, outName);
  await sharp(svg(file), { density: (72 * width) / meta.width })
    .webp({ quality: 88, alphaQuality: 100, effort: 6 })
    .toFile(out);
  const m = await sharp(out).metadata();
  console.log(outName, m.width, m.height, fs.statSync(out).size);
}

(async () => {
  // Hero.module.css: drop-shadow(0 4px 10px .28) drop-shadow(0 22px 48px .36)
  const HERO = [
    { dy: 4, blur: 10, alpha: 0.28 },
    { dy: 22, blur: 48, alpha: 0.36 },
  ];
  // ParallaxPair: drop-shadow(0 4px 10px .22) drop-shadow(0 18px 40px .28)
  const PAIR = [
    { dy: 4, blur: 10, alpha: 0.22 },
    { dy: 18, blur: 40, alpha: 0.28 },
  ];
  // image px per design unit = (image px / frame width in --u) ÷ GSAP layer scale
  // Border width is in design units, like the shadows.
  await bake("hero-front.webp", HERO, 2600 / 1819, { width: 16, rough: 0.3 });
  await bake("person-front.webp", PAIR, 734 / 667 / 1.1);
  await bake("vision-front.webp", PAIR, 683 / 830 / 1.1);
  await bake("send-front.webp", PAIR, 1280 / 1004 / 1.08);
  // Brush.tsx expects these pixel sizes (VARIANTS[*].px).
  await raster("brush-a.svg", "brush-a.webp", 2400);
  await raster("brush-c.svg", "brush-c.webp", 2000);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
