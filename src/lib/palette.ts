import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import type { ImageMetadata } from "astro";

/**
 * Picks the block colour a card should be printed on, from the photo that goes
 * on it.
 *
 * This is what's left of the old `tint.ts`, turned around. That module sampled
 * a photo so it could lay a contrasting wash over the bottom of it and put
 * white type on top; nothing does that now — an image sits in its own panel
 * and multiplies into the block, and the type sits on flat colour where its
 * contrast is known in advance. So the sampling survives and the
 * contrast-walking doesn't, and what comes back is a palette name rather than
 * a colour: the page only ever prints the seven inks it has.
 */
export type Palette =
  | "sun"
  | "flame"
  | "grape"
  | "sea"
  | "sky"
  | "rose"
  | "leaf"
  | "paper";

/** Rotating palette, for anything that has no image to sample. */
export const COLOURS = [
  "sea",
  "sun",
  "rose",
  "sky",
  "grape",
  "leaf",
  "flame",
] as const;

/** Hue of each ink, in degrees. Sampled hues snap to the nearest of these. */
const INKS: { name: Palette; hue: number }[] = [
  { name: "flame", hue: 15 },
  { name: "sun", hue: 46 },
  { name: "leaf", hue: 95 },
  { name: "sea", hue: 171 },
  { name: "sky", hue: 212 },
  { name: "grape", hue: 250 },
  { name: "rose", hue: 340 },
];

const ROOTS = ["src/assets", "src/content/blog/_media"];
const EXTS = /\.(jpe?g|png|webp|avif)$/i;

/**
 * Index the source images by `stem.ext`.
 *
 * Deliberately reads the filesystem rather than using `import.meta.glob`:
 * an eager glob makes Vite emit *every* matched image into the build, even
 * ones no page references.
 */
const index = new Map<string, string>();
for (const root of ROOTS) {
  const base = path.resolve(process.cwd(), root);
  if (!fs.existsSync(base)) continue;
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (EXTS.test(e.name)) index.set(e.name, full);
    }
  };
  walk(base);
}

/** Recover the original file from an ImageMetadata `src`. */
function resolveFile(src: string): string | undefined {
  // Dev: /@fs/<absolute path>?origWidth=...
  const fsHit = src.match(/\/@fs(\/[^?]+)/);
  if (fsHit) return decodeURIComponent(fsHit[1]);

  // Build: /_astro/<stem>.<hash>.<ext>
  const parts = path.basename(src.split("?")[0]).split(".");
  if (parts.length < 3) return undefined;
  const ext = parts.at(-1)!;
  const stem = parts.slice(0, -2).join(".");
  return index.get(`${stem}.${ext}`);
}

// One sharp pass per image for the whole build, not per card.
const cache = new Map<string, Promise<Palette>>();

/** sRGB → HSL, hue in degrees, the rest 0–1. */
function toHsl(r: number, g: number, b: number) {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  const h =
    max === R
      ? 60 * (((G - B) / d) % 6)
      : max === G
        ? 60 * ((B - R) / d + 2)
        : 60 * ((R - G) / d + 4);
  return { h: (h + 360) % 360, s, l };
}

/** Shortest distance between two hues, in degrees. */
const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

async function compute(src: string): Promise<Palette> {
  const file = resolveFile(src);
  if (!file || !fs.existsSync(file)) return "paper";

  try {
    // A 24×24 thumbnail, not a single pixel. Averaging a whole photograph to
    // one pixel is the cheap way to get a colour and the wrong one: opposite
    // hues cancel, so almost every photo comes back as the same near-grey and
    // the whole page prints on paper. Reading a grid keeps the hues separate
    // long enough to see which one the picture is actually about.
    const { data, info } = await sharp(file)
      .resize(24, 24, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Hue histogram in 24 buckets of 15°, each pixel weighted by how much
    // colour it actually carries. Saturation squared, so a few emphatic pixels
    // outvote a large wash of nearly-grey — which is what the eye does with a
    // photograph too. Weighted down at the ends of the luminance range as
    // well: hue readings off near-black and near-white pixels are noise.
    const BUCKETS = 24;
    const hist = new Float64Array(BUCKETS);
    let colour = 0;
    let total = 0;

    for (let i = 0; i < info.width * info.height; i++) {
      const { h, s, l } = toHsl(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);
      const solid = 1 - Math.abs(l * 2 - 1) ** 2;
      const weight = s * s * solid;
      hist[Math.floor(h / (360 / BUCKETS)) % BUCKETS] += weight;
      colour += weight;
      total += 1;
    }

    // A genuinely monochrome image has no hue worth trusting, so it gets the
    // paper panel rather than an invented ink. The threshold is on the mean
    // weight rather than on one sampled saturation, so it answers "is there
    // colour in this picture" instead of "is this one pixel colourful".
    if (colour / total < 0.02) return "paper";

    // The fullest bucket, then its own weighted mean hue — the bucket alone
    // would quantise every photo to one of 24 hues before the palette gets to
    // quantise it to one of seven.
    let peak = 0;
    for (let b = 1; b < BUCKETS; b++) if (hist[b] > hist[peak]) peak = b;
    const centre = (peak + 0.5) * (360 / BUCKETS);

    return INKS.reduce((best, ink) =>
      hueGap(centre, ink.hue) < hueGap(centre, best.hue) ? ink : best,
    ).name;
  } catch {
    return "paper";
  }
}

/** The palette ink whose hue is closest to the image's mean colour. */
export function paletteFor(img: ImageMetadata): Promise<Palette> {
  let hit = cache.get(img.src);
  if (!hit) {
    hit = compute(img.src);
    cache.set(img.src, hit);
  }
  return hit;
}
