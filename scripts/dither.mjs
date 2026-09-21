#!/usr/bin/env node
/**
 * Build-time ordered (Bayer) dithering.
 *
 * Every dithered surface on the site is baked here rather than filtered in the
 * browser: a real 1-bit threshold is per-pixel work, and the CSS equivalents
 * (grayscale + contrast + a tiled overlay in a blend mode) only *look* like
 * dithering at one zoom level. Doing it with sharp means the client downloads a
 * finished 2-colour PNG and spends nothing on it.
 *
 * Two kinds of output:
 *
 *   photos — a source image reduced to black and white at a few widths, for
 *            the hero. Written as a 2-colour palette PNG, which is where the
 *            format is at its best: no smooth gradients left to encode.
 *
 *   ramps  — a 4px-wide strip whose alpha dithers from opaque to clear. Tiled
 *            with `mask-repeat: repeat-x` at its native size it reproduces the
 *            full ordered-dither ramp, because a Bayer tile repeated along x is
 *            exactly the pattern it would have had anyway. ~1kB, and crisp at
 *            any element width, which a stretched gradient never is.
 *
 * Idempotent: an output newer than both its source and this script is left
 * alone, so a rebuild costs nothing.
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");
const OUT = path.join(ROOT, "public/dither");
const SELF = fileURLToPath(import.meta.url);

/* The classic 8×8 Bayer matrix. Ordered dithering scales its cells to
   thresholds and compares each pixel against the one under it — the matrix is
   arranged so that any threshold level it produces is spread as evenly as
   possible, which is what stops the output from clumping. */
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];
const N = 8;

/** Threshold for the matrix cell at (x, y), as a 0–255 grey level. */
const threshold = (x, y) => ((BAYER[y % N][x % N] + 0.5) / (N * N)) * 255;

/* ------------------------------------------------------------------ photos */

/** Sources to dither, and the widths each is needed at. */
const PHOTOS = [
  // The source is 1223px wide, so there's no point asking for more than that —
  // `withoutEnlargement` would only hand back a second copy of the same image.
  { name: "hero", from: "src/assets/site/header.jpg", widths: [640, 900, 1223] },
];

/**
 * One channel of grey in, one bit out.
 *
 * `gamma` pulls the midtones before thresholding. A photograph dithered
 * straight from its sRGB values comes out muddy, because half of an 8-bit
 * image's range describes the top stop of brightness; lifting it first means
 * the mid greys land on a genuinely mid dot density.
 */
function ditherGrey(grey, width, height, { gamma = 0.8, contrast = 1.25 } = {}) {
  const out = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      let v = grey[i] / 255;
      v = Math.pow(v, gamma);
      v = (v - 0.5) * contrast + 0.5;
      const level = Math.min(255, Math.max(0, v * 255));
      out[i] = level > threshold(x, y) ? 255 : 0;
    }
  }
  return out;
}

async function buildPhoto({ name, from, widths }) {
  const src = path.join(ROOT, from);
  for (const width of widths) {
    const dest = path.join(OUT, `${name}-${width}.png`);
    if (await isFresh(dest, src)) continue;

    // Greyscale and resize in one pass, then read the raw single channel.
    const { data, info } = await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const bits = ditherGrey(data, info.width, info.height);

    await sharp(bits, {
      raw: { width: info.width, height: info.height, channels: 1 },
    })
      .png({ palette: true, colours: 2, compressionLevel: 9, effort: 10 })
      .toFile(dest);

    report(dest);
  }
}

/* ----------------------------------------------------------------- cutouts */

/**
 * Logos that carry no alpha of their own, turned into silhouettes.
 *
 * The foil stickers paint an iridescent gradient through a mask, so they need
 * an image whose *alpha* is the mark. A logo supplied as a flat JPEG — a white
 * mark on a solid red square, say — has none, so its luminance becomes its
 * alpha instead: `pick: "light"` keeps the bright mark, `pick: "dark"` keeps a
 * dark mark on a light ground.
 *
 * Alpha is left as a smooth ramp rather than thresholded. Everything else here
 * is deliberately 1-bit, but a sticker's outline is drawn by a `drop-shadow`
 * ring off this alpha, and a hard-edged mask would make that ring jagged.
 */
const CUTOUTS = [
  { name: "drum", from: "src/assets/logos/the_drum_logo.jpeg", pick: "light" },
];

async function buildCutout({ name, from, pick = "dark", size = 320 }) {
  const src = path.join(ROOT, from);
  const dest = path.join(OUT, `${name}-cutout.png`);
  if (await isFresh(dest, src)) return;

  const { data, info } = await sharp(src)
    .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    const a = pick === "light" ? v : 255 - v;
    // Black RGB throughout — the mask only ever reads the alpha, and leaving
    // the colour channels black keeps the file down to one flat plane.
    rgba[i * 4 + 3] = a;
  }

  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(dest);

  report(dest);
}

/* ------------------------------------------------------------------- ramps */

/**
 * A 4px × `steps` strip of black whose alpha dithers from opaque to clear.
 *
 * Only 4 columns wide: the Bayer pattern repeats every 8, but at 4 the tile
 * still carries a full set of thresholds per row pair and the seam is
 * invisible, and a narrower tile means the browser repeats a smaller image.
 */
async function buildRamp(name, { steps = 192, reverse = false } = {}) {
  const dest = path.join(OUT, `${name}.png`);
  if (await isFresh(dest, SELF)) return;

  const width = 4;
  const rgba = Buffer.alloc(width * steps * 4);
  for (let y = 0; y < steps; y++) {
    // Coverage runs 1 → 0 down the strip (or the other way, reversed).
    const p = y / (steps - 1);
    const coverage = (reverse ? p : 1 - p) * 255;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // RGB stays black; only alpha is dithered, so the strip works as a mask
      // on any colour without tinting it.
      rgba[i + 3] = coverage > threshold(x, y) ? 255 : 0;
    }
  }

  await sharp(rgba, { raw: { width, height: steps, channels: 4 } })
    .png({ compressionLevel: 9, effort: 10 })
    .toFile(dest);

  report(dest);
}

/* ------------------------------------------------------------------- plumbing */

/** True when `dest` is newer than both `src` and this script. */
async function isFresh(dest, src) {
  try {
    const [d, s, self] = await Promise.all([
      fs.stat(dest),
      fs.stat(src),
      fs.stat(SELF),
    ]);
    return d.mtimeMs > s.mtimeMs && d.mtimeMs > self.mtimeMs;
  } catch {
    return false;
  }
}

function report(dest) {
  const kb = (fsSync.statSync(dest).size / 1024).toFixed(1);
  console.log(`  dither  ${path.relative(ROOT, dest)}  ${kb}kB`);
}

await fs.mkdir(OUT, { recursive: true });
await Promise.all([
  ...PHOTOS.map(buildPhoto),
  ...CUTOUTS.map(buildCutout),
  // Fade down into the page, and back up out of it.
  buildRamp("ramp-down"),
  buildRamp("ramp-up", { reverse: true }),
]);
