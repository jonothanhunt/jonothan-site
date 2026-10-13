import sharpService from "astro/assets/services/sharp";
import sharp from "sharp";
import { FORMAT, LEVELS } from "./dither-images.mjs";

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

/**
 * `crop: [left, right]` — a vertical slice of the source, as fractions of its
 * width, cut *before* anything else happens to it.
 *
 * For art direction: the hero's portrait source on a phone (see index.astro),
 * which shows a narrow slice of a wide photograph and was downloading the
 * whole width to do it. Cut before the resize and the dither, so the slice is
 * resized and dithered exactly as the full frame is, at the same scale, and
 * comes out the same pixels as the matching part of the full-width file.
 */
async function cropTo(inputBuffer, [left, right]) {
  const img = sharp(inputBuffer);
  const { width, height } = await img.metadata();
  const x = Math.round(left * width);
  const w = Math.min(width - x, Math.round((right - left) * width));
  // PNG out: a lossless hand-off, so the crop costs nothing in quality.
  return img.extract({ left: x, top: 0, width: w, height }).png().toBuffer();
}

export default {
  ...sharpService,

  /* No `crop` in propertiesToHash, deliberately. Adding any property to that
     list renames every generated image on the site — a full cache bust for
     every returning visitor. A crop is told apart by its dimensions instead:
     the hero's portrait cut is square where the full frame is 2:1, so the
     two never share a width *and* a height. A future crop that keeps the
     source's aspect would need the hash after all. */

  getURL(options, imageConfig) {
    let url = sharpService.getURL(options, imageConfig);
    // A plain string means the service declined to process it at all.
    if (typeof url !== "string" || !url.includes("?")) return url;
    if (options.dither) url += "&dither=1";
    if (options.crop) url += `&crop=${options.crop.join(",")}`;
    return url;
  },

  parseURL(url, imageConfig) {
    const transform = sharpService.parseURL(url, imageConfig);
    if (transform && url.searchParams.get("dither")) transform.dither = true;
    const crop = url.searchParams.get("crop");
    if (transform && crop) transform.crop = crop.split(",").map(Number);
    return transform;
  },

  getHTMLAttributes(options, imageConfig) {
    // Or `dither` and `crop` land on the <img> as unknown attributes.
    const { dither, crop, ...rest } = options;
    return sharpService.getHTMLAttributes(rest, imageConfig);
  },

  async transform(inputBuffer, transform, config) {
    if (transform.crop) inputBuffer = await cropTo(inputBuffer, transform.crop);

    if (!transform.dither) {
      return sharpService.transform(inputBuffer, transform, config);
    }

    /* Resize through the normal service, but ask for PNG — a lossless
       intermediate, so nothing is smeared between the resize and the dither.
       What comes out the other end is WebP; see FORMAT. */
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

    /* Lossless, and WebP rather than an indexed PNG: measured across four
       sizes and three depths, lossless WebP came out smaller every time, by
       between 1% and 10%. */
    const out = await sharp(dithered, {
      raw: { width: info.width, height: info.height, channels: 3 },
    })
      .webp({ lossless: true, effort: 6 })
      .toBuffer();

    return { data: out, format: FORMAT };
  },
};
