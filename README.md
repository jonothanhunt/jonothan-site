# jonothan.dev

Personal site and blog. Astro, static output, deployed on Vercel.

Rebuilt from the previous Next.js version with performance as the goal: the old
site shipped ~129 kB gzip of JavaScript on every page before anything else, plus
three.js eagerly on the home page and a bundler (Sandpack) inside a blog post.
Weak devices ran out of memory. This version ships a few kB.

## Commands

```bash
npm run dev      # dev server on :4321
npm run build    # static build to dist/
npm run preview  # serve dist/
```

## Shape of it

Two pages:

- `/` — full-bleed home: hero, brand strip, work bento, contact, recent writing.
- `/blog` — vertical list of post cards. Clicking one expands it in place.
  `/blog/<slug>` renders the same list with that post already open, so links
  are shareable and work with JavaScript disabled.

```
src/
  assets/          images Astro optimises at build time
  components/      .astro presentational components
    mdx/           components available inside posts
  content/blog/    posts (.mdx) + co-located _media/
  layouts/Base     html shell, <head>, SEO, JSON-LD
  lib/             posts, build-time colour sampling, remark plugin
  pages/           routes
  scenes/          the 3D desk (React + react-three-fiber)
  styles/global    design tokens + base styles, hand-written
```

## The rules that keep it fast

**Zero JavaScript by default.** Astro renders `.astro` components to HTML at
build time and ships no runtime. The only scripts on the site are the copy-email
button, the nav contact panel, the blog URL sync, Astro's link prefetch, and the
3D gate — a few kB in total.

**The 3D desk is opt-in.** `src/components/Desk.astro` holds a gate that checks
viewport width, `prefers-reduced-motion`, `deviceMemory`, `hardwareConcurrency`,
Save-Data and WebGL support, then waits for the element to come near the
viewport before dynamically importing the scene. A device that fails the gate
downloads none of three.js. The scene also pauses its render loop when
off-screen.

**Nothing is fetched on the client that could be rendered.** Blog posts are
compiled into the page at build time, so expanding a card reveals HTML that is
already there. Tag filtering is a radio group plus sibling selectors — no JS, no
extra pages, no duplicated content.

**Embeds defer their weight.** YouTube is a facade — poster plus a play button,
with the iframe (and a megabyte of player JS) only loading on click. TikTok is a
real iframe with `loading="lazy"`, so the browser fetches it when it nears the
viewport. Sandpack demos are React islands with `client:visible`: ~207 kB that
only the one post using them ever pays, and only on scroll.

**Media is detected from plain markdown where possible.** A YouTube or TikTok
URL on its own line becomes an embed. `![alt](clip.mp4)` becomes the `<Video>`
component, with the poster inferred as a same-named `.jpg`. Posts stay readable
as markdown rather than filling up with JSX.

**Images go through `src/`, never `public/`.** Anything under `src/assets` or
`src/content/blog/_media` gets responsive WebP variants and explicit dimensions,
so there's no layout shift. Files in `public/` are served raw — only put things
there that must keep a fixed URL (the GLB model, its textures, videos).

Animated GIFs are converted to MP4 (`ffmpeg -crf 30`) and referenced with the
`<Video>` component. The two in the archive went from 15 MB and 3.7 MB to 413 kB
and 220 kB.

**Card overlays are sampled, not guessed.** `src/lib/tint.ts` reads the bottom
band of each card image with sharp at build time, averages it, pushes it light
or dark, and emits it as `--tint` with a contrasting `--on-tint`. That replaces
a flat black gradient that looked bad over pale images.

## Adding a post

Create `src/content/blog/<slug>.mdx`:

```mdx
---
title: "Title"
date: 2026-08-06
excerpt: "One line for the card and the meta description."
type: ["Post"]
image: "./_media/<slug>/cover.webp"
---
```

Put images in `src/content/blog/_media/<slug>/` and reference them relatively
(`./_media/<slug>/thing.webp`). A YouTube or TikTok URL on its own line becomes
an embed automatically.

## Gotchas

- Remark plugins go on `markdown.processor` via `unified()` from
  `@astrojs/markdown-remark`. Passing them on `markdown` or to `mdx()` directly
  is deprecated and, for MDX, silently does nothing.
- The 3D deps are listed in `vite.optimizeDeps.include` because Vite's scanner
  can't see through the dynamic import in a `<script>` tag, and re-optimises
  mid-session without it.
- `history.pushState` to a URL containing a fragment **cancels an in-flight
  smooth scroll**, in either order. The nav writes `#work` on `scrollend`
  instead. There's no global `scroll-behavior: smooth` either, so arriving at
  `/#work` from another page lands instantly rather than animating the whole
  document after the navigation.
- Absolutely-positioned children of a rounded container need their own
  `border-radius: inherit`. Relying on the parent's `overflow: hidden` alone
  leaves a sliver of image bleeding along the curve.
- Blog filter state lives in `?tag=`. The filtering is still pure CSS
  (`:checked ~ .list`); a few lines of JS only sync the radio to the URL, so
  with JS off the page simply shows everything. The radios must be **siblings
  of the list** for the selector to reach it.
