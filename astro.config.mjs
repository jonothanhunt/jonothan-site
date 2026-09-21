// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { unified } from "@astrojs/markdown-remark";
import remarkMediaEmbeds from "./src/lib/remark-media-embeds.mjs";

export default defineConfig({
  site: "https://jonothan.dev",

  // React is pulled in only by the one 3D island; every other page ships zero JS.
  integrations: [
    mdx(),
    // Every canonical on the site drops its trailing slash except the root, so
    // the sitemap has to say the same thing — a sitemap URL that redirects to
    // the canonical is a wasted crawl. This has to happen in serialize: the
    // integration's own `trailingSlash` option is applied after it, and it
    // strips the root's slash too.
    sitemap({
      serialize(item) {
        const url = new URL(item.url);
        if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/$/, "");
        return { ...item, url: url.href };
      },
    }),
    react(),
  ],

  // Hover-prefetch internal links. ~1.6kB of JS that makes navigation feel instant.
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },

  markdown: {
    // The unified() processor goes on `processor` — MDX inherits it from here.
    // Passing plugins on `markdown` or `mdx()` directly is deprecated and, for
    // MDX, silently does nothing.
    processor: unified({ remarkPlugins: [remarkMediaEmbeds] }),
    // Syntax highlighting happens at build time, so code blocks cost no client JS.
    shikiConfig: { theme: "github-light", wrap: true },
  },

  image: {
    responsiveStyles: true,
    layout: "constrained",
  },

  build: {
    // Inline small stylesheets to save a round trip.
    inlineStylesheets: "auto",
  },

  vite: {
    build: { assetsInlineLimit: 2048 },
    // Anything Vite's scanner can't see from a plain import has to be named
    // here, or it gets discovered the first time something asks for it, the
    // optimiser re-runs mid-session, and every module already in flight comes
    // back 504 Outdated Optimize Dep.
    optimizeDeps: {
      include: [
        "react",
        "react-dom/client",
        // The JSX runtimes for the same reason: unprebundled they resolve to
        // raw CJS and the compiled scene throws "_jsxDEV is not a function".
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        // The 3D scene is only reachable through a dynamic import inside a
        // script tag, so the scanner never sees these at all.
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        // Sandpack is reached through an Astro island (`client:visible` in
        // CodeDemo.astro), so it isn't requested until a code demo scrolls
        // into view — which is the worst possible moment to re-optimise, and
        // is exactly when the 504 showed up. It is also by far the biggest
        // dependency here, so pre-bundling it costs a slower first `dev` and
        // saves the stall every time after.
        "@codesandbox/sandpack-react",
      ],
    },
  },
});
