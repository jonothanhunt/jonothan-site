# Handover — terminal/spec-sheet redesign

Branch: `claude/proto-astro-migration-4r1fnz`. Written in a cloud container, so
none of it has been seen on real hardware. Delete this file when the work
lands.

## Pick it up

```bash
git fetch origin claude/proto-astro-migration-4r1fnz
git checkout claude/proto-astro-migration-4r1fnz
npm install
npm run dev
```

`dev` and `build` both run `scripts/dither.mjs` first. It bakes the dithered
images into `public/dither/` and `src/assets/generated/`, both gitignored, so a
fresh clone has none of them until you run one of those two commands. If the
hero is missing or a build fails on a missing `*-cutout.png`, that script
hasn't run.

## What this is

A reskin of the existing site in the aesthetic of the three references Jonothan
supplied: light grey ground, JetBrains Mono throughout, square corners, ordered
dithering, iridescent foil stickers, flat block colours with images multiplied
into them, and the WebGL desk replaced by an ASCII renderer. Structure, routes,
content, SEO and the no-JS behaviours are unchanged — this is paint, not
plumbing.

Three commits, each with a long message explaining the decisions:

1. `Lay in the terminal/spec-sheet design system` — type, colour, dither
   pipeline, sticker component.
2. `Rebuild every component on the spec-sheet system` — every component.
3. `Fix the cutouts, the hero's masks and the logo strip` — three bugs found by
   screenshotting rather than by reading the CSS.

There is also a merge commit at the base: the branch was 24 behind `main` and
still carried two stale commits from the original Astro spike (a first-pass
`wrangler.toml` and a `CLAUDE.md` progress note) that `main` has since
superseded. I merged rather than reset, and took `main`'s version of both
files, so that history survives without regressing them.

## The one thing that is NOT verified

**The ASCII desk has never produced a frame.** In the container it mounts
correctly — the canvas is created, `AsciiEffect`'s `<table>` is in the DOM, and
the CSS font and tracking overrides apply — but the table stays empty, so no
characters are ever drawn.

That is *expected* here and may well be fine on your machine: headless
Chromium runs on SwiftShader, and the capability gate in `Desk.astro`
deliberately asks for a WebGL2 context with `failIfMajorPerformanceCaveat:
true`, which software rendering is supposed to fail. I bypassed the gate to
test, and the scene still drew nothing under SwiftShader, which tells me
nothing either way about real hardware.

So this is the first thing to look at, and if it is broken the likely cause is
the visibility gate rather than the ASCII effect:

```jsx
// src/scenes/DeskScene.jsx
frameloop={visible ? "always" : "never"}
```

`visible` starts `false` and is set by an `IntersectionObserver` on the canvas
in `onCreated`. With `frameloop="never"` nothing renders, so if that observer
never fires — or fires before the canvas has a size — the effect never gets a
frame to read. Worth logging `visible` and confirming `useFrame` runs at all
before suspecting the character ramp. The rest of the chain is sound: `invert`
is off and the ramp's first character is a space, which is what makes the
transparent background blank instead of a solid rectangle of `@`.

Everything else in this list I did see rendered, at 1440px and at 420px:
home, blog index, an open post, 404.

## How to look at it the way I did

There is a Chromium at `/opt/pw-browsers/chromium` in the container; locally
you have a real browser, which is better. Screenshotting the *built* site
caught three bugs that reading the CSS did not — the faint cutouts, the hero's
two fades fighting each other, and two client logos flattening to black
rectangles. Worth doing again after any change to a mask or a blend mode.

## The system, in short

**Type.** JetBrains Mono, two `@font-face` rules under one family name.
Fontsource's variable latin subset (40kB) covers prose but carries only 229
codepoints — none of the box drawing, block elements or geometric shapes the
layout is built from. `public/fonts/jetbrains-mono-symbols.woff2` is a subset I
cut from JetBrains Mono's static Regular with `fontTools` holding exactly
those, 348 glyphs in 8.8kB. Both faces declare a `unicode-range`; without one
the browser assumes the first covers everything and renders tofu. Hyperlegible
survives for article body copy only. Lastik is no longer referenced —
`public/fonts/lastik.woff2` and `src/fonts/` can go if this lands.

**Colour.** Warm neutral grey page, seven flat block colours retuned so black
type clears 7:1 on every one. Blocks carry ink, never white.

**Squares.** The `--r-*` tokens still exist so nothing has to be hunted down,
and every one of them is `0`.

**Dithering.** `scripts/dither.mjs`, Bayer, at build time. The CSS
approximations (grayscale + contrast + a tiled overlay in a blend mode) only
look right at one zoom level, and Jonothan has built a dithering camera, so
they were not going to pass. It emits the hero at three widths as 2-colour PNGs
(40kB at full size, smaller than the source JPEG), alpha cutouts for logos that
arrived without an alpha channel, and a 4px-wide alpha ramp that tiles along x
to reproduce a full ordered-dither ramp for about 200 bytes. The `.fade-down`
and `.fade-up` utilities use that ramp as a mask so a block dissolves into the
page instead of fading.

**Images.** Three treatments, chosen by what the image sits on: `.duo`
multiplies into a block of colour, `.dither` is a baked 1-bit image, and an
article image is left alone. `isolation: isolate` on `.block` is load-bearing,
not tidiness — it keeps each blend group to its own block instead of the whole
page.

**Colour from the photograph.** `src/lib/palette.ts` (was `tint.ts`) reads a
24×24 thumbnail and takes a saturation-weighted hue histogram to pick which of
the seven inks a card prints on. A 1×1 mean does not work: opposite hues
cancel and every card comes back grey. Pass `colour=` on a `Card` to override.

**Controls.** One control, two states, everywhere: a hairline box that fills
with ink and knocks the type out. It replaced the nav's three coloured pills,
the blog's six pastel filter chips and the copy bar's rose capsule, which were
three inventions of the same idea.

**Stickers.** `Sticker.astro` masks an iridescent gradient through a logo's own
alpha and rings it with four chained `drop-shadow`s. The nesting is required:
CSS applies `filter` before `mask`, so a shadow on the masked element is
clipped away by the mask that gives it its shape. The client strip does *not*
use this — sixty-odd masked elements each with a filter chain is too much for a
row that scrolls, so those get a single `brightness(0)` instead.

## Things I would look at next

- The desk, above.
- Photo-derived colour clusters warm, so two `sun` cards can land next to each
  other (home grid, and Pebble/Creative Tech Stack on the blog). A tie-break
  that nudges a card off its first choice when the previous one took it would
  fix it; I left it deriving honestly instead of guessing at a rule.
- `.marks--all` only works alongside `.marks` — it overrides the background
  layers but `.marks` is what creates the pseudo-element. The contact block
  uses `marks--all` on its own and so has no crosshairs. Either fold the
  positioning into `--all` or always pair them.
- The awards' foil silhouettes are decorative, not legible as brands: the D&AD
  mark reads as a cube, The Drum as a square with a drum knocked out. The text
  citation beside each one carries the meaning. Fine by me, but it is a call
  worth making deliberately.
- Nothing has been checked in Safari. The masks, `mask-composite` defaults and
  `mix-blend-mode` are the parts most likely to differ.
- No dark mode. The reference has none and the site had none.
