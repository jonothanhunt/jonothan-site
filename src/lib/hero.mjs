/**
 * The hero photograph's treatment, in one place.
 *
 * Shared deliberately: `scripts/dither.mjs` bakes the treated versions and
 * `src/pages/index.astro` decides which one to print, and when those two
 * disagree the result is either a broken image or — what actually happened —
 * a public/ directory full of bakes nothing references, shipped on every
 * deploy. Plain .mjs so the build script and Astro can both read it.
 */

/**
 * Treated or not.
 *
 * `false` prints the photograph as shot, through astro:assets like every other
 * image on the site, and nothing is baked at all. `true` bakes VARIANT below
 * and prints that.
 */
export const TREATED = false;

/**
 * Which bake, when TREATED.
 *
 *   "tone"  three tones through a horizontal line screen
 *   "flat"  the same three tones with the screen off — hard bands, no dither
 *   "mono"  one bit, Bayer, black on paper
 *
 * Only the named one is built. The others cost nothing by existing.
 */
export const VARIANT = "flat";

/** Baked widths. Wider than the source on purpose — see buildPhotoTone. */
export const WIDTHS = [860, 1200, 1632];

/**
 * Grape, rose, sun — three of the seven inks the page already prints, dark to
 * light. The darkest is grape taken well down: `--grape` at #a08cff is a mid
 * tone and can't be the bottom of a ramp.
 */
export const TONES = ["#2a1b6b", "#ff8fb8", "#ffc400"];

/** Rows per band in the line screen, in baked pixels. */
export const PERIOD = 3;

/** The widest bake, which is the one a plain `src` points at. */
export const WIDEST = WIDTHS[WIDTHS.length - 1];

/** The source is 1223 x 611, so call it 2:1. */
export const height = (width) => Math.round(width / 2);

/** Where a baked file lands, so both sides spell it the same way. */
export const file = (width) => `/dither/hero-${VARIANT}-${width}.png`;
