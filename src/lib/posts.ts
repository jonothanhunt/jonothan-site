import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/** All published posts, newest first. */
export async function allPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", (p) => !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Every distinct tag, with how many posts use it. */
export async function allTags(): Promise<{ tag: string; count: number }[]> {
  const counts = new Map<string, number>();
  for (const post of await allPosts())
    for (const t of post.data.type) counts.set(t, (counts.get(t) ?? 0) + 1);

  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export const tagSlug = (tag: string) =>
  tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Tags are written inconsistently in frontmatter ("SITE", "Post", "3D prints").
 * Normalise to sentence case for display, but keep known initialisms intact.
 */
const KEEP = new Set(["AI", "AR", "VR", "XR", "3D", "CSS", "UI", "UX", "API"]);

export const tagLabel = (tag: string) =>
  tag
    .split(" ")
    .map((word, i) => {
      if (KEEP.has(word.toUpperCase())) return word.toUpperCase();
      // Brands that carry their own casing: mixed case, e.g. TikTok. All-caps
      // like "SITE" isn't a brand, so it falls through to sentence case.
      if (/[a-z]/.test(word) && /[A-Z]/.test(word.slice(1))) return word;
      return i === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase();
    })
    .join(" ");

export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** Rotating palette so consecutive cards differ. */
export const COLOURS = ["sun", "sea", "rose", "sky", "grape", "leaf", "flame"] as const;
