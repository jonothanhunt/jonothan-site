import { defineCollection } from "astro:content";
// From astro:schema, not astro:content — the re-export there is deprecated.
import { z } from "astro:schema";
import { glob } from "astro/loaders";

const blog = defineCollection({
  // `_media` is ignored: a leading underscore keeps it out of the entry glob.
  loader: glob({ pattern: "*.mdx", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      excerpt: z.string().default(""),
      type: z.array(z.string()).default([]),
      // An imported image, so Astro knows its dimensions at build time and can
      // reserve the right space — no layout shift.
      //
      // JPEG or PNG, never WebP: this file also becomes og:image untouched
      // (see Base.astro), and social scrapers — Bluesky's included — have
      // always been unreliable at decoding WebP. JPEG/PNG is what every one
      // of them can render without question, and it means og:image needs no
      // conversion step of its own to stay working.
      image: image().optional(),
      /* The cover is already dithered, so the site must not dither it again.
         ---
         Everywhere else the frontmatter image is a plain, undithered
         photograph: the build makes the dithered copy this site shows for
         its cards, and social cards link straight to the source untouched.
         One source, two outputs. A picture that arrived dithered breaks
         that, because the second pass quantises an already quantised image
         and the two grids beat against each other. This says the source is
         the finished article and to leave it alone — DITHRPIX is the only
         post where that's true, because the post is about the dithering
         camera itself. */
      dithered: z.boolean().default(false),
      links: z
        .array(z.object({ title: z.string(), url: z.string().url() }))
        .default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
