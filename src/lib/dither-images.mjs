/**
 * The all-dithered experiment, as one switch.
 *
 * `true` runs every card photograph and the hero through an ordered dither at
 * build time, keeping their colour. Read by the image service that does the
 * work (src/lib/image-service.mjs) and by the components, which have to ask
 * for images differently when it is on — see the notes on each setting.
 */
export const ENABLED = true;

/**
 * Levels per channel. Two is eight colours: black, white, and the corners of
 * the RGB cube. That sounds like far too few and is the point — at anything
 * near a photographic palette the dither has almost nothing to choose between
 * on any given surface, so the pattern stops being visible and all you are
 * left with is a slightly degraded photograph and a much bigger file.
 */
export const LEVELS = 2;

/**
 * How much smaller the file is than the space it fills.
 *
 * The single biggest lever, on both looks and weight, and they pull the same
 * way for once. A dither drawn at the size it is displayed has dots one device
 * pixel across, which nobody can see; drawn at two fifths and scaled back up
 * through `image-rendering: pixelated`, the dots are big enough to read as a
 * screen — and the file is a fraction of the pixels. Measured on one card
 * image: 1040px at 27 colours is 106kB, 416px at 8 colours is 13kB.
 *
 * The widths in the components are scaled by this, rather than the service
 * quietly shrinking what it was asked for, so the `w` descriptors in the
 * srcset keep describing the files they point at.
 */
export const SCALE = 0.4;

/**
 * The hero's own scale, because it is the one image whose slot is the whole
 * viewport.
 *
 * Dot size is display width over file width, so a shared scale only gives a
 * shared dot size where the slots are the same — and the hero's isn't. At a
 * 1440px viewport the feature card is shown 741px wide from a 640px file: a
 * dot of 1.16css. The hero is shown at the full 1440 and at 0.4 came from a
 * 653px file — a dot of 2.20css, twice as coarse as everything beside it,
 * which is exactly what it looked like.
 *
 * Matching 1.16css across a 1440px slot wants a 1241px bake and the source
 * photograph is 1223px, so the hero gets very nearly all of it: 0.74 of the
 * widest requested width, landing at 1208px and a dot of 1.19css — within
 * three percent of the cards. Not 0.75, which asks for 1224px: a width above
 * the source clamps back down to it, and a clamped width collides with the
 * plain full-size file Astro emits for the `src` attribute, which never went
 * through the dither. The hero silently came back a smooth photograph.
 */
export const HERO_SCALE = 0.74;

/** Applied to a component's width list when the experiment is on. */
export const widths = (list, scale = SCALE) =>
  ENABLED ? list.map((w) => Math.round(w * scale)) : list;

/**
 * Lossless WebP, not the palette PNG this started with.
 *
 * Lossy is out of the question — there is nothing a lossy codec handles worse
 * than a field of hard single-pixel dots, it smears them — but lossless WebP
 * beat PNG on every size and depth measured, by 1% to 10%. It is also why the
 * components can't use <Picture>: the service returns this format whatever it
 * was asked for, so a <Picture> labelling sources avif and webp would be
 * telling the browser something it acts on and that isn't true.
 */
export const FORMAT = "webp";
