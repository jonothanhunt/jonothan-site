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
  integrations: [mdx(), sitemap(), react()],

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
    // The 3D scene is only reachable through a dynamic import inside a script
    // tag, so Vite's scanner misses it and re-optimises mid-session (504s in
    // dev). Naming the deps up front keeps the dev server stable.
    optimizeDeps: {
      include: [
        "react",
        "react-dom/client",
        // The JSX runtimes for the same reason: unprebundled they resolve to
        // raw CJS and the compiled scene throws "_jsxDEV is not a function".
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
      ],
    },
  },
});
