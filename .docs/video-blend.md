# Blending video into the page background — lighten blend + edge feather

A recipe for making dark footage dissolve into the page instead of sitting in
a hard-edged box. Extracted from `src/app/components/HeroKeywordVideo.tsx`
(the canonical implementation: the "vibe coder" hover clip in the homepage
hero). No canvas, no shaders, no preprocessing the footage — two CSS moves.

> **"No preprocessing" means the recipe needs no encode step — not that the
> clip may never be re-encoded.** Compressing a clip for weight is safe, and
> measured: at CRF 23 no pixel of the empty field lifts above the backdrop by
> more than the 2/255 that a *near-lossless* encode also produces. Read
> `.docs/asset-weight.md` before re-encoding anything blended; it carries the
> gate. What this doc does rule out is baking visuals into the file — see
> "What not to reach for".

## When this recipe applies

Use it when all of these are true:

- The footage is **bright content on a dark, near-uniform field** — glowing
  lines, particles, type, UI on near-black. The technique treats the clip as
  light-on-nothing; it cannot rescue footage with meaningful midtone
  backgrounds.
- The clip sits on a **dark surface driven by a semantic token** (e.g. the
  hero's `--grout` band). You need one token that names the surrounding
  colour in both themes.
- You want the **edge of the video rectangle to disappear**, not just be
  rounded or bordered.

If the footage is dark-on-light, the same idea inverts: `mix-blend-mode:
darken` over a backdrop in the light surface token. Everything else in this
doc is unchanged.

## The two moves

Both are static CSS on the mounted elements — they apply identically to the
playing film, its poster, and the reduced-motion still, so no state needs
special-casing.

### 1. Lighten blend over a token backdrop

Structure — a positioned wrapper, a backdrop div, the video on top:

```tsx
<div className="relative aspect-square w-full overflow-hidden rounded-2xl">
  {/* Backdrop the film blends against — painted in the surface token. */}
  <div className="absolute inset-0 bg-grout" />
  <video
    className="absolute inset-0 h-full w-full object-cover [mix-blend-mode:lighten]"
    src={SRC}
    poster={POSTER}
    muted
    loop
    playsInline
    preload="metadata"
  />
</div>
```

Why it works: `lighten` keeps whichever layer is brighter, per channel. The
backdrop is lighter than the footage's near-black everywhere except the
glowing content, so:

- every dark footage pixel clamps to **exactly** the surface colour — empty
  film becomes indistinguishable from the page around it;
- the bright content passes through as a glow.

Two rules inside this move:

- **`lighten`, not `screen`.** Screen *adds* the layers, so footage black
  that is not-quite-zero (it never is, after compression) lifts the whole
  frame a shade above the page and leaves a faint rectangle. Lighten clamps
  instead of adding.
- **The backdrop must be the semantic token for the surrounding surface**,
  never a hardcoded colour. That is what makes the blend track light and
  dark themes for free — the backdrop and the page repaint together.

### 2. Edge feather with a colourless alpha mask

Even with the blend, the brightest content can touch the frame line and
reveal the rectangle. Fade the frame's edges to nothing with a `mask-image`
radial gradient on the wrapper:

```tsx
const EDGE_FADE =
  "radial-gradient(circle closest-side at 50% 50%, #000 78%, transparent 100%)";

<div
  className="relative aspect-square w-full overflow-hidden rounded-full"
  style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
>
```

- The `#000` stop is **mask alpha, not ink** — the gradient is colourless,
  so this does not conflict with the no-one-off-colours rule.
- **Keep the feather band narrow.** The mask exists to erase the frame line,
  not to dissolve the media: a wide feather washes out everything near the
  circumference, which is usually where the composition's border, flourishes,
  or brightest content live. Hold a solid core well out toward the edge and
  fade only the outermost sliver. The canonical hero clips
  (`HeroKeywordVideo`, `HeroDefaultStill`) use a `circle closest-side` mask —
  a soft round rim inscribed in the square, so the square's corners are gone
  regardless — with the solid `#000` core held to **78%** for bright-on-dark
  footage and **88%** for a light illustration whose blend already melts the
  field into the band (the tighter core the blend allows, the more edge
  detail survives). Both are a deliberate tightening from an earlier ~49%
  core that lost the ornamental ring entirely.
- If the composition is not a square-inscribed circle, tune the ellipse to it,
  not to the frame: make it taller than wide for a vertical figure (side edges
  soften first, the figure keeps its vertical reach), and offset the centre
  toward where the footage is weighted — but still keep the fade band thin.

## Poster and reduced motion

- Always set a `poster` so a blended frame paints on first hover and stands
  in as the static composition under `prefers-reduced-motion` (where the
  video must never `play()`). Generate it from a strong frame of the clip:

  ```sh
  ffmpeg -ss 1.5 -i public/assets/<dir>/<clip>.mp4 -frames:v 1 -q:v 3 \
    public/assets/<dir>/<clip>-poster.jpg
  ```

- **Regenerate the poster whenever the clip is replaced** — a stale poster
  flashes old footage on first paint.
- Because both blend moves are plain CSS on the element, the poster blends
  and feathers exactly like the live film. Verify the reduced-motion capture
  anyway.

## What not to reach for

- **`DitherOverlay`** (screen-blend grain, tuned for midtone cover footage):
  over near-black clips it lifts the empty field into a visible gray grid
  and makes the box *worse*. Grain is for texture on visible footage, not
  for hiding edges.
- **Re-encoding the video with baked-in vignettes or matching background
  colour**: breaks the moment the surface token changes or a second theme
  exists. Keep the blend in CSS against the token.
- **`screen` blend** — see above; it always leaves a ghost rectangle.

## Checklist for a new placement

1. Confirm the footage is bright-on-near-black (or invert with `darken`).
2. Identify the semantic token of the surface behind the video; paint the
   backdrop div with it.
3. `mix-blend-mode: lighten` on the `<video>` itself.
4. Add the `mask-image` feather on the wrapper; shape the ellipse to the
   footage's composition.
5. Generate a poster from the current clip; wire `poster` + `muted loop
   playsInline preload="metadata"`.
6. Screenshot via `node scripts/screenshot.mjs` in light, dark, and
   reduced-motion — the pass condition is that no rectangle edge is
   detectable in any of the three.
