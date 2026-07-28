# Symptom Checker card — halftone dot dissolve on hover

How the hover animation on the Healthdirect Symptom Checker home card is built,
so it can be replicated on another card or lifted into a new scene. The single
source of truth is `src/app/components/SymptomCheckerCover.tsx`; this doc walks
through what that file does and why.

> Note: `.docs/cover-effects.md` describes an earlier version of this cover that
> sampled a live `<video>` through the halftone. That is no longer how this card
> works. There is **no video** here now — the teal field is synthesized in code,
> and the old `CoverPlaybackProvider` playback coordinator is gone. When the two
> docs disagree, this one matches the current source.

## What you see

At rest the card is a plain deep-teal panel. Nothing animates, and no canvas
work runs. On hover the flat teal fades into a screen of near-white halftone
dots (as if the solid field broke into print specks), and those dots then
scatter outward and reveal the hook line **"How sick is too sick? / Know what
to do next."** Moving the pointer away reverses the exact same motion from
wherever it currently is, so flicking on and off never queues or stutters.

Three moving parts produce this:

1. A **synthesized teal field** — a luminance value computed per grid cell, no
   image or video source.
2. A **Canvas 2D halftone + particle scatter** — the dots, drawn and moved by
   arithmetic, never WebGL.
3. **Motion for React DOM text** — the hook line is real DOM so type stays crisp.

A self-terminating `requestAnimationFrame` loop drives two sequential progress
ramps (`dotify`, then `scatter`) held in refs.

## How the card is wired in

- The cover is a `"use client"` component registered in
  `src/app/components/ProjectCover.tsx` under the `WorkCoverId`
  `"symptom-checker"`, and referenced from the entry's `media.cover` in
  `src/app/work/projects.ts`.
- `ProjectCard` (`src/app/components/ProjectCard.tsx`) owns the hover state. It
  uses Motion's `onHoverStart` / `onHoverEnd` to flip a local `isHovered`
  boolean and passes it down as the `hovered` prop. Using Motion's hover events
  (not raw `:hover`) means a touch tap does not trigger the effect.
- The card frame owns aspect ratio, corner radius, and border; the cover just
  gets `className="absolute inset-0"` and fills it.
- The media frame is decorative (`aria-hidden` canvas). The real title and
  tagline live in the card header below the frame, so nothing inside the cover
  needs screen-reader plumbing.
- Type inside the cover sizes in `cqw` container units against an `@container`
  root, so the same scene composes at every card width from 320px up.

## Ingredient 1 — the synthesized teal field

There is no source image. Each grid cell is assigned a luminance value by
`fieldLum(u, v)`, where `u, v` are the cell's normalized position in `[0, 1]`:

```
glow = 0.9 − hypot(u − 0.28, v − 0.34)   // a soft light sitting upper-left
base = 0.42 + 0.16·(1 − v) + 0.10·(1 − u) + 0.14·max(0, glow)
return clamp(base, 0.28, 0.85)
```

This gives the halftone gentle life — brighter toward the upper-left where a
soft light sits — instead of a dead-flat uniform dot grid, while keeping every
cell above the drop-out cutoff so the *whole* panel dissolves evenly (no holes).

The field is computed **once** at setup into a `Float32Array` (`cols × rows`).
There is no per-frame sampler canvas, because nothing is being read from a live
source anymore.

Scene constants (declared at the top of the file, with the reasoning in a
comment — these are artwork colours, not shell tokens, and must not leak into
other components):

- `FIELD = "#0e2932"` — the resting teal panel, set as the container's
  `backgroundColor`. Also the visible background the dot canvas fades in over.
- `DOT_INK = "#EAF5F2"` — near-white halftone ink with a whisper of the field
  hue. Hook type is white on this deep teal (~15:1 contrast).
- `GRID_COLS = 92` — halftone columns; rows are derived from the card aspect.
- `LUM_CUTOFF = 0.06` — cells darker than this are skipped (none are here,
  since `fieldLum` floors at 0.28, but the guard is kept for reuse on real
  imagery).
- `DOT_MAX = 0.62` — max dot radius as a fraction of cell width.

## Ingredient 2 — Canvas halftone + particle scatter

### Grid setup (`setup`)

- Size the display canvas to the container rect × `devicePixelRatio` (capped at
  2). Bail if the rect has no size yet, and skip rebuilds when dimensions are
  unchanged.
- `cols = GRID_COLS`; `cellW = w / cols`; `rows = round(h / cellW)`.
- Build two `Float32Array`s:
  - `field[cols·rows]` — the `fieldLum` value per cell (above).
  - `scatter[cols·rows·3]` — per dot: a random drift vector (`dx, dy`) and a
    random delay. Angle is uniform; distance is
    `(0.4 + rand·0.6) · SCATTER_DRIFT · w` with `SCATTER_DRIFT = 0.16`; delay is
    `rand · SCATTER_DELAY` with `SCATTER_DELAY = 0.4`. Storing three floats per
    dot in one flat array avoids allocating a per-dot object.
- Rebuilt on `ResizeObserver` (the scene ref is nulled so the next `setup`
  regenerates the grid and scatter table at the new size).

### Drawing one frame (`drawFrame(settle)`)

`settle` is a single scalar: `1` = fully assembled halftone, lower = dots moving
out to their scatter offsets on their own staggered schedule. For each cell:

- Skip if `lum < LUM_CUTOFF`.
- Per-dot local progress:
  `local = clamp((settle − delay) / (1 − SCATTER_DELAY), 0, 1)`, then
  `eased = easeOutCubic(local)`. (When `settle >= 1`, `local` is forced to 1.)
- Position lerps from home toward home + drift by `(1 − eased)`:
  `x = cellCenterX + dx·(1 − eased)`, `y = cellCenterY + dy·(1 − eased)`.
- Alpha: `eased · (0.3 + 0.7·lum)`.
- Radius: `cellW · DOT_MAX · sqrt(lum) · (0.55 + 0.45·eased)`. The `sqrt(lum)`
  makes dot **area** track luminance like a print halftone; the `eased` factor
  shrinks dots as they fly apart.
- One `fillStyle` (`DOT_INK`) for every dot — only `globalAlpha` varies per dot.

The per-dot `delay` staggering is what makes the scatter read as a *wave* of
particles rather than a uniform crossfade.

## Ingredient 3 — the hook line (Motion DOM)

Canvas only ever draws dots. The hook text is real DOM, mounted only at the
fully-scattered end state:

- A `showHook` state flips true when `scatter >= 0.98`. It's mirrored in a ref
  (`showHookRef`) so the rAF loop only calls `setShowHook` on an actual change,
  not every frame.
- Each line rises out of an `overflow-hidden` mask (`RiseLine`): `y` animates
  `115% → 0%` over `motionDuration.slow` (0.5s) with `motionEase.out`, staggered
  by `order · LINE_STAGGER` (0.06s) — the headline/line cascade from
  `.docs/style-rules.md`.
- The block is wrapped in `AnimatePresence` with an `instant` (0.1s) `ease.in`
  fade `exit`, so retreating dots take the text away cleanly.

## The hover state machine

Two ramps, both stored in refs and advanced by one self-terminating rAF loop
(`startLoop` → `step`). The canvas/opacity writes are imperative so the loop
never triggers a React re-render.

- `dotify` (0 → 1 over `DOTIFY_MS = 300`): crossfades the flat teal field into
  the dot screen. Set imperatively as `canvas.style.opacity = String(dotify)`.
  The teal underneath is just the container background, so fading the canvas in
  *is* the field-to-dots crossfade — no second layer needed.
- `scatter` (0 → 1 over `SCATTER_MS = 800`): scatters the assembled dots. The
  frame is drawn with `settle = 1 − scatter`. At `scatter >= 0.98` the hook
  mounts.

Per frame (`step`):

```
dt = clamp(now − last, .., 64)          // cap so a background tab can't teleport
if (hovered)      dotify < 1 ? raise dotify : raise scatter
else if (scatter) lower scatter
else              lower dotify
canvas.style.opacity = dotify
if (dotify > 0 && scatter < 1) drawFrame(1 − scatter)
else                          clear the canvas
if (!hovered && dotify === 0 && scatter === 0) stop the loop
```

The rules that keep it correct:

- **Hovered**: raise `dotify` to 1 first, *then* raise `scatter`. **Unhovered**:
  lower `scatter` to 0 first, *then* lower `dotify`. Because each ramp advances
  by `dt / duration` toward its current target, hover-out mid-flight simply
  reverses from wherever it is — the motion is interruptible, never queued.
- The loop **starts on hover** (a `useEffect` on `hovered` calls `startLoop`)
  and **cancels itself** once fully back at `dotify === 0 && scatter === 0`,
  clearing the canvas on the way out. At rest there is zero ongoing work.
- `hovered` is read through `hoveredRef` (synced in a `useEffect`) so the rAF
  loop always sees the live value without re-subscribing.
- `dt` is clamped to ≤ 64ms so a throttled/background tab doesn't jump the ramps.

## Reduced motion

`useReducedMotion` short-circuits everything animated: no rAF loop, no dots, no
positional movement. When the card is hovered under reduced motion, the hook
crossfades in over the still teal field at ~0.01s (`AnimatePresence` with a near-
instant `initial`/`animate`/`exit`). Every cover must render a useful static
state — here it's the plain teal panel with the hook appearing on hover.

## Timing summary

| Stage | Constant | Value |
| --- | --- | --- |
| Field → dots crossfade | `DOTIFY_MS` | 300ms |
| Dots scatter to hook | `SCATTER_MS` | 800ms |
| Hook mount threshold | — | `scatter >= 0.98` |
| Hook line rise | `motionDuration.slow` | 0.5s, `ease.out` |
| Hook line stagger | `LINE_STAGGER` | 0.06s per line |
| Hook fade out | `motionDuration.instant` | 0.1s, `ease.in` |

The 300ms crossfade reads as an immediate hover response; the fuller ~1.1s
reveal is deliberately longer than the standard 300ms UI-response tokens because
covers are expressive ambient scenes (same precedent as `ParticleDissolve`).

## Replicating it on another card — checklist

1. Add the id to `WorkCoverId` in `src/app/work/projects.ts`, point the entry's
   `media.cover` at it, and register the component in `ProjectCover.tsx`.
2. Copy the scene skeleton from `SymptomCheckerCover.tsx`: `FIELD` background,
   the `<canvas>` layer, the hook overlay, `setup` / `drawFrame`, and the
   `startLoop` state machine.
3. Retune the scene: `FIELD` / `DOT_INK` colours, `GRID_COLS`, `fieldLum` (or
   swap it for a real luminance source if you want an image behind the dots),
   and the hook copy. Keep contrast for any type that sits on the field.
4. Keep the non-negotiables: `hovered` driven by Motion hover events (no touch
   trigger), imperative opacity/canvas writes inside the loop, a self-cancelling
   rAF, `ResizeObserver` rebuilds, and a full reduced-motion static state.
5. Verify at 320 / 375 / 768 / 1440 in the real home grid: idle (no work), hover
   in, hover held (hook shows), hover out mid-flight (clean reverse), and reduced
   motion.
