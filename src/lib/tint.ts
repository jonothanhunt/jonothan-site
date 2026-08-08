import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import type { ImageMetadata } from "astro";

export interface Tint {
  /** Colour for the overlay behind card text. */
  tint: string;
  /** Text colour guaranteed to contrast against `tint`. */
  ink: string;
}

/** Used when an image can't be resolved or read. */
const FALLBACK: Tint = { tint: "rgb(12 10 8)", ink: "#fff" };

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
const cache = new Map<string, Promise<Tint>>();

/** WCAG relative luminance. */
function luminance(r: number, g: number, b: number) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG contrast ratio between two relative luminances. */
const contrast = (a: number, b: number) =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** sRGB → HSL, all channels 0–1 except hue in degrees. */
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

/** HSL → sRGB, returned as 0–255 integers. */
function toRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const i = Math.floor(h / 60) % 6;
  const [r, g, b] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][i];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

async function compute(src: string): Promise<Tint> {
  const file = resolveFile(src);
  if (!file || !fs.existsSync(file)) return FALLBACK;

  try {
    const meta = await sharp(file).metadata();
    const height = meta.height ?? 0;
    const width = meta.width ?? 0;
    if (!height || !width) return FALLBACK;

    // Average the bottom band, where the card text sits. Resizing to 1x1 is
    // the cheapest possible way to get a mean colour.
    const top = Math.round(height * 0.62);
    const { data } = await sharp(file)
      .extract({ left: 0, top, width, height: height - top })
      .resize(1, 1, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const [r, g, b] = data;

    // Both the overlay and the title come from the image's own hue, the way
    // the original site pairs a `-100` background with `-800` text: a pale
    // wash to sit the type on, and a deep saturated version of the same
    // colour for the type itself. Colour-coded to the photo, not to a fixed
    // palette, and not merely light-or-dark.
    const { h, s } = toHsl(r, g, b);

    // A near-greyscale photo has no hue worth trusting — the reading is noise
    // — so it stays neutral rather than being given an invented colour.
    const muted = s < 0.08;
    const tintSat = muted ? 0.05 : clamp(s, 0.3, 0.8);
    const inkSat = muted ? 0.08 : clamp(s, 0.4, 0.9);

    // The wash follows the photo: a dark image gets a deep wash and light
    // type, a light image a pale wash and dark type. Both stay on the image's
    // hue, so the pairing is colour-coded either way rather than flipping
    // between tinted and plain white.
    const dark = luminance(r, g, b) <= 0.179;

    const [tr, tg, tb] = toRgb(h, tintSat, dark ? 0.16 : 0.9);
    const tintLum = luminance(tr, tg, tb);

    // Walk the title away from the wash until it clears AAA.
    let ink: [number, number, number] = [0, 0, 0];
    const from = dark ? 0.8 : 0.34;
    const step = dark ? 0.02 : -0.02;
    for (let i = 0; i < 12; i++) {
      ink = toRgb(h, inkSat, from + step * i);
      if (contrast(tintLum, luminance(...ink)) >= 7) break;
    }

    return {
      tint: `rgb(${tr} ${tg} ${tb})`,
      ink: `rgb(${ink[0]} ${ink[1]} ${ink[2]})`,
    };
  } catch {
    return FALLBACK;
  }
}

/** Average colour of an image's lower band, plus a contrasting text colour. */
export function bottomTint(img: ImageMetadata): Promise<Tint> {
  let hit = cache.get(img.src);
  if (!hit) {
    hit = compute(img.src);
    cache.set(img.src, hit);
  }
  return hit;
}
