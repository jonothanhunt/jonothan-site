import sharpService from "astro/assets/services/sharp";
import sharp from "sharp";
import { LEVELS } from "./dither-images.mjs";

/**
 * Astro's sharp service, with an ordered dither on the way out.
 *
 * ## Why a service rather than a pre-baked file
 *
 * The dither has to be the *last* thing that happens to a picture. Bake a
 * dithered PNG and let the image pipeline resize it and the pattern is
 * resampled — the dots average together and what comes out is a slightly
 * grubby photograph. Here the dither runs after the resize, separately for
 * every width in the srcset, so each one is dithered at its own scale and the
 * dots stay the size they were drawn.
 *
 * ## Why it is opt-in
 *
 * `dither` is a prop on the component. Astro's base service only serialises a
 * fixed set of parameters into the image URL, so the flag has to be written
 * into the URL and read back out by hand — `getURL` and `parseURL` below. It
 * survives into the srcset for free: `getSrcSet` spreads everything but the
 * dimensions into each width's transform.
 *
 * The blog's body images are deliberately left alone, which is the whole
 * reason this isn't just applied to everything the service touches.
 */

/* The classic 8x8 Bayer matrix: thresholds arranged so that any level they
   produce is spread as evenly as possible, which is what stops the output
   clumping. */
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
const N = BAYER.length;
const threshold = (x, y) => (BAYER[y % N][x % N] + 0.5) / (N * N);

/**
 * Ordered dither, per channel, to `levels`.
 *
 * The ramp decides which two levels a value sits between; the matrix only
 * decides which of the two this pixel takes. That is the difference between a
 * dither and a posterise, and it is why twenty-seven colours can still hold a
 * photograph.
 *
 * The gamma lift first, for the same reason the rest of the site's dithering
 * does it: half of an 8-bit image's range describes the top stop of
 * brightness, so a picture quantised straight from its sRGB values puts most
 * of itself in the bottom level or two.
 */
function ditherRGB(rgb, width, height, { levels, gamma = 0.85, contrast = 1.1 }) {
  const steps = levels - 1;
  const out = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = threshold(x, y);
      for (let c = 0; c < 3; c++) {
        const i = (y * width + x) * 3 + c;
        let v = Math.pow(rgb[i] / 255, gamma);
        v = Math.min(1, Math.max(0, (v - 0.5) * contrast + 0.5));
        const scaled = v * steps;
        const lower = Math.floor(scaled);
        const step = Math.min(steps, lower + (scaled - lower > t ? 1 : 0));
        out[i] = Math.round((step / steps) * 255);
      }
    }
  }
  return out;
}

export default {
  ...sharpService,

  getURL(options, imageConfig) {
    const url = sharpService.getURL(options, imageConfig);
    // A plain string means the service declined to process it at all.
    if (!options.dither || typeof url !== "string" || !url.includes("?")) return url;
    return `${url}&dither=1`;
  },

  parseURL(url, imageConfig) {
    const transform = sharpService.parseURL(url, imageConfig);
    if (transform && url.searchParams.get("dither")) transform.dither = true;
    return transform;
  },

  getHTMLAttributes(options, imageConfig) {
    // Or `dither` lands on the <img> as an unknown attribute.
    const { dither, ...rest } = options;
    return sharpService.getHTMLAttributes(rest, imageConfig);
  },

  async transform(inputBuffer, transform, config) {
    if (!transform.dither) {
      return sharpService.transform(inputBuffer, transform, config);
    }

    /* Resize through the normal service, but ask for PNG. Letting it encode to
       webp or avif first would put a lossy codec between the resize and the
       dither, and there is nothing a lossy codec handles worse than a field of
       hard single-pixel dots — it smears them, which is the one thing that
       must not happen to the pattern. */
    const resized = await sharpService.transform(
      inputBuffer,
      { ...transform, format: "png" },
      config,
    );

    const { data, info } = await sharp(resized.data)
      .removeAlpha()
      .toColourspace("srgb")
      .raw()
      .toBuffer({ resolveWithObject: true });

    const dithered = ditherRGB(data, info.width, info.height, { levels: LEVELS });

    const out = await sharp(dithered, {
      raw: { width: info.width, height: info.height, channels: 3 },
    })
      // Indexed: the output only ever holds `levels ** 3` colours, and a
      // palette PNG stores that in a fraction of what truecolour would.
      .png({ palette: true, colours: LEVELS ** 3, compressionLevel: 9, effort: 10 })
      .toBuffer();

    return { data: out, format: "png" };
  },
};
