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

const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

/** WCAG relative luminance. */
function luminance(r: number, g: number, b: number) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

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

    // Push the sampled colour to a definite light or dark, keeping its hue.
    // The overlay still feels like it belongs to the photo, but the text on
    // top always has room to breathe.
    const light = luminance(r, g, b) > 0.42;
    const t = 0.62;
    const [tr, tg, tb] = light
      ? [mix(r, 255, t), mix(g, 255, t), mix(b, 255, t)]
      : [mix(r, 0, t), mix(g, 0, t), mix(b, 0, t)];

    return {
      tint: `rgb(${tr} ${tg} ${tb})`,
      ink: light ? "#17130f" : "#ffffff",
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
