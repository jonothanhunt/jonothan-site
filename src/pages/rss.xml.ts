import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { allPosts } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = await allPosts();

  return rss({
    title: "Jonothan Hunt",
    description: "Writing on creative technology, AR, real-time 3D and the web.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
      categories: post.data.type,
    })),
    customData: "<language>en-gb</language>",
  });
}
