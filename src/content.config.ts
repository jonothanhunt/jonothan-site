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
      type: z.array(z.string()).default(["Post"]),
      // An imported image, so Astro knows its dimensions at build time and can
      // reserve the right space — no layout shift.
      image: image().optional(),
      links: z
        .array(z.object({ title: z.string(), url: z.string().url() }))
        .default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
