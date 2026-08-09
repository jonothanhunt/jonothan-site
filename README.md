# jonothan.dev

My personal site and blog. Astro, static output, deployed to Cloudflare.

I rebuilt it from the previous Next.js version with one goal: make it fast. The
old site shipped around 129 kB gzip of JavaScript on every page before anything
else had loaded, pulled in three.js eagerly on the home page, and had a whole
bundler (Sandpack) sitting inside a blog post. Weaker devices ran out of memory
opening it. This version ships a few kB, and the 3D scene only downloads if your
device can actually handle it.

## Running it

```bash
npm install
npm run dev      # dev server on :4321
npm run build    # static build to dist/
npm run preview  # serve what you just built
```

Node 22.12 or newer.

## What's here

- `/` — the home page: hero, brand strip, work bento, contact, recent writing.
- `/blog` — a vertical list of post cards. Click one and it expands in place.
- `/blog/<slug>` — the same list with that post already open, so links are
  shareable and still work with JavaScript switched off.
- `/rss.xml`, `/sitemap-index.xml`, a 404, and a couple of `.well-known` routes
  for [AT Protocol](https://atproto.com/) records.

```
src/
  assets/          images Astro optimises at build time
  components/      .astro presentational components
    mdx/           components available inside posts
  content/blog/    posts (.mdx) + co-located _media/
  layouts/Base     html shell, <head>, SEO, JSON-LD
  lib/             post helpers, build-time colour sampling, remark plugin
  pages/           routes
  scenes/          the 3D desk (React + react-three-fiber)
  styles/global    design tokens and base styles, hand-written
```

There's no CSS framework. Everything is hand-written CSS with custom properties
as design tokens in `src/styles/global.css`.

## Writing a post

Posts are MDX files in `src/content/blog/`, one file per post, validated against
a schema in `src/content.config.ts` — so a typo in the frontmatter fails the
build rather than the page.

````mdx
---
title: "You can make music videos in PowerPoint"
date: 2025-05-20
excerpt: "One line, used on the card and as the meta description."
type: ["Post"]
image: "./_media/<slug>/cover.webp"
links:
  - title: "SITE"
    url: "https://example.com"
---

Ordinary markdown from here down.

![A caption](./_media/<slug>/thing.webp)
*Italics under an image become the caption.*
````

Only `title` and `date` are required. Images live in
`src/content/blog/_media/<slug>/` next to the post and are referenced
relatively, which is what lets Astro optimise them and reserve their space so
nothing jumps around as the page loads.

The nice part: **you mostly write plain markdown, not components.** A remark
plugin (`src/lib/remark-media-embeds.mjs`) rewrites a few patterns as you go:

- A YouTube or TikTok URL on its own line becomes an embed.
- `![alt](clip.mp4)` becomes the `<Video>` component, with the poster inferred
  as a same-named `.jpg`.

So a post stays readable as markdown instead of filling up with JSX. The
components in `src/components/mdx/` are there if you want them directly.

## The rules that keep it fast

**Zero JavaScript by default.** Astro renders `.astro` components to HTML at
build time and ships no runtime. What's left is small and deliberate: the
copy-email button, the nav, the blog URL sync, link prefetch, the view-transition
router, and the gate in front of the 3D scene.

**The 3D desk is opt-in.** `src/components/Desk.astro` checks viewport width,
`prefers-reduced-motion`, `deviceMemory`, `hardwareConcurrency`, Save-Data and
WebGL support before it will load anything. A device that fails the gate
downloads none of three.js. The scene parks its render loop when off-screen, and
disposes its WebGL context when you navigate away.

**Pages cross-fade instead of reloading.** Astro's view-transition router is on,
and the nav bar is marked `transition:persist` so it's carried between pages
rather than torn down and rebuilt. The catch: scripts don't re-execute on a
client-side navigation, so anything interactive re-initialises on
`astro:page-load`.

**Nothing is fetched on the client that could be rendered.** Posts are compiled
into the page at build time, so expanding a card reveals HTML that's already
there. Tag filtering is a radio group plus sibling selectors — no JS, no extra
pages, no duplicated content.

**Embeds defer their weight.** YouTube is a facade: poster frame plus a play
button, with the iframe (and a megabyte of player JS) only loading on click.
TikTok is a lazy iframe. Sandpack demos are React islands with `client:visible`,
so the ~207 kB is paid only by the one post that uses them, and only on scroll.

**Images go through `src/`, never `public/`.** Anything under `src/assets` or
`src/content/blog/_media` gets responsive WebP and AVIF variants with explicit
dimensions, so there's no layout shift. `public/` is served raw — only things
that need a fixed URL go there (the GLB model, its textures, videos).

Animated GIFs get converted to MP4 (`ffmpeg -crf 30`) and used with `<Video>`.
The two in the archive went from 15 MB and 3.7 MB down to 413 kB and 220 kB.

**Card overlays are sampled, not guessed.** `src/lib/tint.ts` reads the bottom
band of each card image with sharp at build time, averages it, pushes it light
or dark, and emits it as `--tint` with a contrasting `--on-tint`. It replaced a
flat black gradient that looked bad over pale images.

## Deploying

Cloudflare builds from `main` and serves `dist/` as a Worker with
[static assets](https://developers.cloudflare.com/workers/static-assets/) —
there's no server-side code, so `wrangler.toml` has no `main` entrypoint, just
an `[assets]` directory.

Two files in `public/` come along for the ride and are read by Cloudflare from
the root of the deployed site:

- `_headers` — long immutable caching for hashed assets and fonts, plus
  `nosniff`, `Referrer-Policy` and HSTS.
- `_redirects` — 301s from the site's old `/things` URLs to `/blog`.

## Gotchas

Things that cost me an afternoon, written down so they don't cost me another.

- Remark plugins go on `markdown.processor` via `unified()` from
  `@astrojs/markdown-remark`. Passing them on `markdown`, or to `mdx()`
  directly, is deprecated and — for MDX — silently does nothing at all.
- The 3D deps are listed in `vite.optimizeDeps.include` because Vite's scanner
  can't see through the dynamic import inside a `<script>` tag, and re-optimises
  mid-session without it.
- `history.pushState` to a URL containing a fragment **cancels an in-flight
  smooth scroll**, in either order. The nav writes `#work` on `scrollend`
  instead. There's no global `scroll-behavior: smooth` either, so arriving at
  `/#work` from another page lands instantly rather than animating the whole
  document after the navigation.
- Lastik's `ascent-override` and `descent-override` (set so the fallback font
  occupies the same space) leave its glyphs sitting high in the line box, so
  flex centring puts them above the optical middle. The nav corrects for it with
  a measured nudge on the label rather than the pill.
- Absolutely-positioned children of a rounded container need their own
  `border-radius: inherit`. Relying on the parent's `overflow: hidden` alone
  leaves a sliver of image bleeding along the curve.
- Blog filter state lives in `?tag=`. The filtering is still pure CSS
  (`:checked ~ .list`); a few lines of JS only sync the radio to the URL, so
  with JS off the page simply shows everything. The radios have to be
  **siblings of the list** for the selector to reach it.

## A note on AI

I write the posts on this site. Where AI helped with the code, it helped the way
a good pair does — I still had to understand it to ship it.
