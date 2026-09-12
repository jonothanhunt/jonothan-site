import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
// From @astrojs/mdx/container-renderer, not @astrojs/mdx — the re-export on the
// package root is deprecated and warns on every build. Same function.
import { getContainerRenderer as mdxRenderer } from "@astrojs/mdx/container-renderer";
import { render } from "astro:content";
import type { Post } from "./posts";

import YouTube from "../components/rss/YouTube.astro";
import TikTok from "../components/rss/TikTok.astro";
import Video from "../components/rss/Video.astro";
import CodeDemo from "../components/rss/CodeDemo.astro";

/**
 * Renders a post to the HTML a feed reader can actually display.
 *
 * The same MDX the site renders, but with the four embed components swapped for
 * versions that stand on their own — real YouTube, TikTok and video players,
 * each with a link a reader falls back to if it strips the element — and with
 * the output rewritten so nothing depends on the page it was going to live in:
 * absolute URLs throughout, no srcset, no scoped-style attributes.
 *
 * Building the container is not free, so it is created once and reused for
 * every post in the feed.
 */
let container: AstroContainer | undefined;

async function getContainer() {
  if (!container) {
    const renderers = await loadRenderers([mdxRenderer()]);
    container = await AstroContainer.create({ renderers });
  }
  return container;
}

/** Absolute form of a site-root path, left alone if it is already absolute. */
function absolute(url: string, site: URL): string {
  if (!url || /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//"))
    return url;
  if (url.startsWith("#")) return url;
  return new URL(url, site).href;
}

/**
 * A feed item is read outside the site entirely: in a reader's own shell, in an
 * email digest, on a different origin. Everything the article assumed about its
 * surroundings has to be resolved or removed here.
 */
export function forFeed(html: string, site: URL): string {
  return (
    html
      // Astro's scoped-style hooks. They reference stylesheets the feed does
      // not carry, so they are pure noise in a reader.
      .replace(/\s+data-astro-cid-[a-z0-9-]+(="[^"]*")?/gi, "")
      // Any <style> or <script> the component tree emitted inline. A reader
      // strips both, and leaving them risks the CSS being shown as text.
      .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      // <picture> is a compatibility gamble: the first <source> a reader
      // understands wins, and AVIF support across readers is patchy. Unwrap to
      // the plain <img> the picture element already carries as its fallback.
      .replace(/<picture\b[^>]*>([\s\S]*?)<\/picture>/gi, (_m, inner) => {
        const img = inner.match(/<img\b[^>]*>/i);
        return img ? img[0] : "";
      })
      .replace(/<source\b[^>]*>/gi, "")
      // srcset and sizes together let a reader pick a width using a viewport
      // the article knows nothing about, and some pick the smallest. Drop both
      // and let the single src stand.
      .replace(/\s+(srcset|sizes)="[^"]*"/gi, "")
      // Lazy loading and async decoding are page-level hints that mean nothing
      // in a feed, and a couple of older readers treat loading="lazy" as a
      // reason not to fetch the image at all.
      .replace(/\s+(loading|decoding|fetchpriority)="[^"]*"/gi, "")
      // Everything left that points at the site by root-relative path: images,
      // links, video posters.
      .replace(
        /\s(src|href|poster)="(\/[^"]*)"/gi,
        (_m, attr, path) => ` ${attr}="${absolute(path, site)}"`,
      )
  );
}

/**
 * A plain-text summary taken from the article's own opening.
 *
 * Only three of the posts set an excerpt, and <description> is what a reader
 * shows in its list view — without one those eight arrive as a bare headline.
 * Falling back to the first couple of sentences is better than nothing and
 * needs no upkeep. Cut on a word boundary so it does not end mid-word.
 */
export function summarise(html: string, limit = 200): string {
  const text = html
    .replace(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return cut.slice(0, cut.lastIndexOf(" ")).trimEnd() + "…";
}

/** The full article as feed-ready HTML. */
export async function renderForFeed(post: Post, site: URL): Promise<string> {
  const { Content } = await render(post);
  const c = await getContainer();
  const html = await c.renderToString(Content, {
    props: { components: { YouTube, TikTok, Video, CodeDemo } },
    // The post's own URL, for the components that have to point back at the
    // article — a code demo can only be linked to, not carried. locals is the
    // container's supported way in; the components prop above belongs to MDX
    // and can't carry anything the MDX didn't write.
    locals: { postUrl: new URL(`/blog/${post.id}`, site).href },
  });
  return forFeed(html, site);
}
