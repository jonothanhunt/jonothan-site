import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getImage } from "astro:assets";
import { allPosts } from "../lib/posts";
import { renderForFeed, summarise } from "../lib/rss-content";
// Imported rather than linked as a public/ path so it can be resized: the RSS
// spec caps the channel image at 144px wide, and the original is 2000x2000 at
// 433kB — an absurd download for a feed avatar.
import profile from "../../public/images/jonothan_profile.jpeg";

const AUTHOR = "Jonothan Hunt";
const TITLE = "Jonothan Hunt";
const DESCRIPTION =
  "Writing on creative technology, AR, real-time 3D and the web.";

/** Attribute- and text-safe. @astrojs/rss escapes its own fields, not customData. */
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function GET(context: APIContext) {
  const site = context.site!;
  const abs = (path: string) => new URL(path, site).href;

  // Every item carries its whole article, so the feed grows with the archive —
  // eleven posts is 60kB. Readers only ever show what they have not seen, and
  // capping the window is the convention for exactly this reason. No effect
  // today; it stops the feed becoming a megabyte at fifty posts.
  const posts = (await allPosts()).slice(0, 20);

  const logo = await getImage({
    src: profile,
    width: 144,
    height: 144,
    format: "jpeg",
  });

  const items = await Promise.all(
    posts.map(async (post) => {
      const { title, date, excerpt, type, image } = post.data;

      // JPEG rather than the WebP used in the article body. This one is read
      // by the aggregator itself to build a card, and JPEG is the format every
      // reader can render without question.
      const card = image
        ? await getImage({ src: image, width: 1200, format: "jpeg" })
        : null;

      const cardXml = card
        ? `<media:content url="${esc(abs(card.src))}" medium="image" type="image/jpeg"${
            card.attributes.width ? ` width="${card.attributes.width}"` : ""
          }${card.attributes.height ? ` height="${card.attributes.height}"` : ""} />` +
          `<media:thumbnail url="${esc(abs(card.src))}" />`
        : "";

      const body = await renderForFeed(post, site);

      return {
        title,
        // The summary. Readers that show a list view use this; the ones that
        // show the article use content:encoded below. Only three posts set an
        // excerpt, so the rest borrow their own opening lines rather than
        // arriving as a bare headline.
        description: excerpt || summarise(body),
        pubDate: date,
        link: `/blog/${post.id}`,
        categories: type,
        // The whole article, as HTML a reader can display.
        content: body,
        // dc:creator rather than <author>, which in RSS 2.0 is specifically an
        // email address. The name is what a reader displays, and there is no
        // reason to publish an inbox to every scraper that reads the feed.
        customData: `<dc:creator>${esc(AUTHOR)}</dc:creator>${cardXml}`,
      };
    }),
  );

  return rss({
    title: TITLE,
    description: DESCRIPTION,
    site,
    // Matches the canonical URLs, which carry no trailing slash.
    trailingSlash: false,
    xmlns: {
      dc: "http://purl.org/dc/elements/1.1/",
      media: "http://search.yahoo.com/mrss/",
      atom: "http://www.w3.org/2005/Atom",
      // Feedly's extension, and honoured by several other readers: gives the
      // feed a proper avatar and accent instead of a generic placeholder.
      webfeeds: "http://webfeeds.org/rss/1.0",
    },
    items,
    customData: [
      `<language>en-gb</language>`,
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      `<copyright>© ${new Date().getFullYear()} ${esc(AUTHOR)}</copyright>`,
      // Required by the spec for a feed to describe its own address, and used
      // by readers to re-find a feed that has moved.
      `<atom:link href="${esc(abs("/rss.xml"))}" rel="self" type="application/rss+xml" />`,
      `<image><url>${esc(abs(logo.src))}</url><title>${esc(TITLE)}</title><link>${esc(abs("/"))}</link><width>144</width><height>144</height></image>`,
      `<webfeeds:icon>${esc(abs(logo.src))}</webfeeds:icon>`,
      `<webfeeds:accentColor>065f46</webfeeds:accentColor>`,
    ].join(""),
  });
}
