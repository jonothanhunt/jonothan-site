/**
 * The all-dithered experiment, as one switch.
 *
 * `true` runs every card photograph and the hero through an ordered dither at
 * build time, keeping their colour. It is read by the image service that does
 * the work (src/lib/image-service.mjs) and by the components that decide how to
 * ask for an image, because a dithered image cannot be served as avif or webp
 * — see the note there.
 */
export const ENABLED = true;

/**
 * Levels per channel. Three is twenty-seven colours, which is what the hero's
 * own bake settled on: enough that the dither has something to choose between
 * on every surface, few enough that it never stops being visible.
 */
export const LEVELS = 3;
