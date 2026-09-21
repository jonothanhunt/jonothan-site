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
const SELF = fileURLToPath(import.meta.url);

/* Two destinations, and which one an output goes to is decided by who reads
   it.

   public/ — the hero, whose srcset is written by hand because a file here has
             no metadata for Astro to read, and the mask ramps, which are named
             by CSS.

   src/assets/generated/ — the logo cutouts. These are imported like any other
             asset, so Astro hashes them, serves them at the right size, and
             hands the component their width and height. A cutout in public/
             would have to be sized by guesswork. */
const OUT = path.join(ROOT, "public/dither");
const OUT_ASSETS = path.join(ROOT, "src/assets/generated");

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
 * Marks whose artwork is a filled field rather than a shape, turned into
 * silhouettes.
 *
 * Two things on the site need a mark's *alpha* to be the mark: the foil
 * stickers paint a gradient through it as a mask, and the client strip
 * flattens marks to ink with `brightness(0)`, which takes every opaque pixel
 * to black and so turns a white-on-blue logo into a black rectangle. Both fail
 * on the same input for the same reason, and both are fixed by deriving alpha
 * from luminance.
 *
 * All three of these are a mark knocked out of a filled field, so what wants
 * to be ink is the field and what wants to be clear is the mark — `pick:
 * "dark"`, which keeps the darker of the two. `pick: "light"` is the other way
 * round, for a bright mark that is itself the shape.
 *
 * `lo`/`hi` are the levels the ramp is taken between. Without them The Drum's
 * red field — luminance around 0.36 either way up — came through at a third
 * opacity and the sticker read as a pale square. Everything past `lo` goes
 * fully clear, everything past `hi` fully opaque, and the short ramp between
 * keeps the edge antialiased: the rest of this script is deliberately 1-bit,
 * but a sticker's outline is a `drop-shadow` ring off this alpha, and a
 * hard-edged mask makes that ring jagged.
 */
const CUTOUTS = [
  // White drum knocked out of a red square.
  { name: "drum", from: "src/assets/logos/the_drum_logo.jpeg", pick: "dark", lo: 0.2, hi: 0.5 },
  // White wordmark knocked out of the NHS blue.
  { name: "nhs", from: "src/assets/logos/nhs_logo.svg", pick: "dark", lo: 0.2, hi: 0.5 },
  // A dotted EE knocked out of a teal field.
  { name: "ee", from: "src/assets/logos/ee_logo.svg", pick: "dark", lo: 0.2, hi: 0.45 },
];

async function buildCutout({ name, from, pick = "dark", lo = 0.4, hi = 0.6, size = 320 }) {
  const src = path.join(ROOT, from);
  const dest = path.join(OUT_ASSETS, `${name}-cutout.png`);
  if (await isFresh(dest, src)) return;

  const { data, info } = await sharp(src)
    // `inside` rather than a width alone, so a wide wordmark and a square mark
    // both come back within the same box and keep their own ratio — which is
    // what Astro then reads the dimensions from.
    .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
    // Full RGBA, and luminance computed by hand below. The source's own alpha
    // has to survive the pass: `greyscale()` reports a transparent pixel as
    // black, and under `pick: "dark"` black is maximally opaque, so every SVG
    // came back as a filled rectangle with its logo somewhere inside. And
    // greyscale collapses the image to *one* channel, which `ensureAlpha`
    // then makes two rather than four — so reading alpha at the fourth byte
    // read the luminance again, and every field came out as faint as it was
    // dark. Asking for four channels up front avoids both.
    .ensureAlpha()
    .toColourspace("srgb")
    .raw()
    .toBuffer({ resolveWithObject: true });

  const stride = 4;
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const lum =
      (0.3 * data[i * stride] +
        0.59 * data[i * stride + 1] +
        0.11 * data[i * stride + 2]) /
      255;
    const v = pick === "light" ? lum : 1 - lum;
    const level = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
    // Scaled by the source's own alpha, so nothing outside the artwork is
    // ever painted whichever way round `pick` is.
    const a = level * (data[i * stride + 3] / 255);
    // Black RGB throughout. Only the alpha is ever read — as a mask, or by a
    // `brightness(0)` that would flatten the colour anyway — and leaving the
    // colour channels flat keeps the file to one plane.
    rgba[i * 4 + 3] = Math.round(a * 255);
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

await Promise.all([
  fs.mkdir(OUT, { recursive: true }),
  fs.mkdir(OUT_ASSETS, { recursive: true }),
]);
await Promise.all([
  ...PHOTOS.map(buildPhoto),
  ...CUTOUTS.map(buildCutout),
  // Fade down into the page, and back up out of it.
  buildRamp("ramp-down"),
  buildRamp("ramp-up", { reverse: true }),
]);
