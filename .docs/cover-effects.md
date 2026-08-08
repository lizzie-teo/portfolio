# Animated cover effects — halftone fields and dot dissolve

A recipe for building a bespoke animated card cover, extracted from
`src/app/components/SymptomCheckerCover.tsx` (the canonical implementation).
Read this before building a cover for another project so the covers share one
motion language and one performance discipline.

## Where covers live

- Every cover is a client component registered in
  `src/app/components/ProjectCover.tsx` under a `WorkCoverId`, and referenced
  from the entry's `media.cover` in `src/app/work/projects.ts`.
- **Covers are not on the home grid.** The home grid renders `LoFiProjectCard`,
  which draws its own halftone and never mounts a cover, so `media.cover` is
  consumed only by the card directions under `/explore` and `/explore/cards`.
  Treat a cover as a self-contained scene that any frame can host, and check
  those direction pages when you change one.
- A cover receives `hovered` from whichever component hosts it. Whoever owns
  that flag drives it from Motion's `onHoverStart`/`onHoverEnd` rather than
  `:hover`, so a touch tap does not trigger the scene. It also receives
  `className`: the host passes `absolute inset-0`, and the frame around it owns
  the aspect ratio, radius, and border.
- The host's media frame is `aria-hidden`: covers are decorative artwork.
  Meaningful text (title, tagline, tags) lives in the card below the frame, so
  nothing inside a cover needs screen-reader plumbing.
- Type inside a cover sizes in `cqw` container units against a `@container`
  root, so the same scene composes at every card width from 320px up.

## The three ingredients

None of this is WebGL. The "shader" look is Canvas 2D plus arithmetic.

### 1. Canvas halftone of a synthesized field

There is no video and no source image behind the dots. Each cell of the grid is
handed a luminance value by a `fieldLum(u, v)` function, where `u, v` are the
cell's normalised position in `[0, 1]`, and the canvas draws that field as a dot
screen:

1. **The ruling is a cell size, not a column count.** Derive the column count
   from the container's **CSS** width (not its device-pixel width, so the cell
   holds its physical size on a retina screen) to keep the cell near a target
   `CELL_PX`, clamped at both ends:
   `cols = clamp(round(cssWidth / CELL_PX), MIN_COLS, MAX_COLS)`.
   A fixed `GRID_COLS` makes the screen get *finer* as the artwork gets
   smaller, which is backwards for a halftone ruling and is what made the
   small instances the worst ones — at 92 fixed columns a 290px card cover ran
   3px cells, below the size at which an eye can follow one speck, so the
   dissolve read as television snow. The round-dot covers use `CELL_PX` 13
   clamped 28..60; the AP+ mosaic, whose pixels are meant to be countable, uses
   17 clamped 22..48.
2. For each cell, take its `fieldLum` value and draw one dot on the display
   canvas:
   - **Skip cells darker than `LUM_CUTOFF` (0.06)** — anything below the cutoff
     melts into the field colour and reads as negative space. On a real
     luminance source this is what makes the halftone read as an image instead
     of a uniform dot grid.
   - Radius: `cellWidth * DOT_MAX * sqrt(lum)` — square root, so dot *area*
     tracks luminance like a print halftone.
   - Alpha: `0.3 + 0.7 * lum`.
   - One `fillStyle` for all dots (a near-white with a whisper of the field
     hue, e.g. `#EAF5F2` on `#0e2932`); vary only `globalAlpha` per dot.
3. The field is computed **once** at setup into a `Float32Array` (`cols × rows`)
   alongside the scatter table. Nothing is sampled per frame, so a cover in
   flight pays only for its own draw.
4. The display canvas is sized to the container rect × `devicePixelRatio`
   capped at 2, and rebuilt (with the field and scatter tables) on
   `ResizeObserver`.

**Give the field a gradient, and floor it above the cutoff.** A constant
luminance draws a dead-flat matrix of identical dots, which reads as a texture
swatch rather than as a panel breaking up; one soft light somewhere off centre
is enough to make the screen look printed. The floor matters as much in the
other direction: a cell below `LUM_CUTOFF` never draws at all, so a field that
dips under it leaves permanent holes and the dissolve starts from something
already broken. Clamp the function above the cutoff and the whole panel
dissolves evenly. The symptom checker's field is a soft light sitting upper left
over a mild diagonal:

```
glow = 0.9 − hypot(u − 0.28, v − 0.34)
base = 0.42 + 0.16(1 − v) + 0.10(1 − u) + 0.14·max(0, glow)
return clamp(base, 0.28, 0.85)
```

Its `LUM_CUTOFF` skip therefore never fires. Keep the guard anyway: it is what
lets the same draw loop carry a real luminance source later, where shadows
*should* drop out.

**The dot ink is the hovered ground, exposed — never a colour of its own.**
Where a dissolve resolves to a surface (the home card's payoff plate, an
article's writing paper), the halftone draws in *that* colour rather than one
picked for the dots. A separately chosen ink puts two colour events in one
gesture, and nothing keeps them related: the home cards ran a rose halftone
clearing to a plum plate, a plum halftone to an indigo plate, an indigo halftone
to a slate plate. Derived, the gesture says one thing — the card turns the
colour it is about to become, and the flying dots resolve into the plate they
were already made of.

Literally the same hex usually will not show, because a plate that has to carry
reversed type is a near-black and the card resting on it is another. So the
ground is **exposed**: multiplied in linear light until it clears a stated
contrast against the resting plate, and never past the point where a channel
clips. Nothing clipping is what makes it an exposure rather than a recolour —
hue and saturation come through untouched, so it is the same colour turned up,
the way a print is the same negative at a different exposure. A ground already
light enough is used as-is. `halftoneInk` in `src/app/components/loFiInk.ts` is
the implementation and carries the contrast figure and its reasoning; covers
whose scatter resolves to a hook line rather than a surface have no ground to
derive from and keep declaring their ink as a scene constant.

### 2. Particle scatter dissolve

The dissolve is one scalar, `settle` (1 = assembled image, 0 = fully
scattered/invisible), applied per dot:

- At grid build time, give every dot a random drift vector (angle uniform,
  distance `DRIFT_MIN + rand × DRIFT_SPREAD` times `SCATTER_DRIFT × width`,
  i.e. `0.25..1.2 ×` the drift) and a random delay in `0..SCATTER_DELAY` (0.5).
  `SCATTER_DRIFT` runs **0.34 on the round-dot covers and 0.36 on the symptom
  checker**; the AP+ mosaic drops the shared scalar and states its magnitudes
  absolutely (`DRIFT_MIN` 0.12, `DRIFT_SPREAD` 0.28) because a countable pixel
  travels less than a speck. Store the vector and delay in one
  `Float32Array` (`dx, dy, delay` per dot) — no per-dot objects.
- Per frame, each dot's local progress is
  `clamp((settle − delay) / (1 − SCATTER_DELAY), 0, 1)` eased with
  `easeOutCubic`. Position lerps home → home+drift by `1 − eased`; radius
  scales down with it (`radius × (0.6 + 0.4 eased)`) and alpha with
  **`sqrt(eased)`**, not `eased`. **The condition is polarity: wherever the ink
  is lighter than the ground it flies over, the alpha takes the square root.** A
  linear alpha spends a near-white dot long before it has travelled far enough to
  be *seen* travelling, so the break-up reads as a fade wearing a scatter's
  clothes. Dark ink on a pale ground does not have that problem — a fading dark
  dot stays legible all the way out — but running `sqrt` there costs nothing
  either, so every halftone on the site uses it rather than carrying a
  per-component tuning. This was once carved out the other way and the carve-out
  went stale the moment the card it named inverted; state the polarity, not the
  component.
- **Draw a travelling dot as a comet, not as a dot in a new place.** A dot
  redrawn at a new position each frame has *moved*; it never reads as *moving*.
  So stroke a round-capped (square-capped, for a mosaic) smear back along the
  dot's own drift vector before filling the dot on top:
  `trail = drift × 3(1 − local)² × TRAIL_SCALE`, which is the derivative of the
  position ramp — zero while the dot sits in the assembled halftone, so the
  rest state is untouched, and largest as it accelerates away. Stroke it at
  `TRAIL_ALPHA` (0.3) of the dot's alpha and `TRAIL_WIDTH` (0.62) of its width,
  capped at `TRAIL_MAX_R` (3) dot radii. Both reductions are load bearing: a
  full-alpha, full-width smear silhouettes as a *capsule*, and the eye reads an
  evenly lit elongated shape as an object of that shape rather than as a moving
  round one. Because the smear always lies along the drift vector, this is also
  what makes a cover's direction legible instead of merely asserted.
- **The smear has a sign, and the reverse flips it.** A wake has to lie *behind*
  the direction of travel, and on hover out the dots are flying home, so behind
  is the far side of the dot rather than the near one. Take the direction as an
  argument — `drawFrame(settle, dir)`, called with `+1` while hovered and `-1`
  while not — and multiply the speed factor by it. Without that, a reversed
  dissolve draws every wake pointing the way its dot is going, which is the one
  cue the whole trail exists to give.
- The delay stagger is what makes it feel like a wave of particles rather
  than a crossfade. Ordering delays by position instead of randomly gives
  directional variants — see the ripple/sweep/swirl math in
  `ParticleDissolve.tsx`, which is the same technique on still images.
- **Delay ordering runs backwards from the obvious reading, and both
  directional covers originally had their sign wrong.** `settle` counts *down*
  from 1, and a dot leaves when `settle` falls past its delay, so a **larger
  delay departs earlier**. A left-to-right sweep therefore orders delay as
  `1 − col/cols`, and an outward ping as `1 − radius`. Ordering them the
  intuitive way round gave AP+ a front running right to left and Macquarie an
  implosion. Measure a radial order in **pixels**, not in normalised `(u, v)`,
  or the ring comes out as a lozenge on any non-square crop.

### 3. Motion for React for all DOM text

Canvas only ever draws dots. Titles and hook lines are real DOM so type
stays crisp:

- **No title, and no scrim.** The cover carries neither: the card that hosts it
  sets the project name below the frame, as real document text at the card's own
  type scale. A cover has no reason to restate it, and a gradient scrim exists
  only to rescue type laid over artwork that was never meant to carry it.
- **A static brand mark is allowed** where the scene is about a product. AP+
  puts its logo in a corner as an `<Image>` and fades it out while the hook line
  is up. A mark is artwork inside the `aria-hidden` frame, not the card's label,
  so it carries an empty `alt`.
- **Hook line**: appears only at the fully-scattered end state, using the
  title/headline stagger recipe from `style-rules.md` (`slow` per line,
  0.06s interval), wrapped in `AnimatePresence` with an `instant`/`ease.in`
  fade exit.

## The hover state machine

The cover idles as the plain field — zero canvas work at rest. Hover drives
two sequential ramps, held in refs and advanced by a self-terminating rAF
loop:

- `dotify` (0→1 over `DOTIFY_MS` 300): crossfades the flat field into the dot
  screen. The resting field is the container's own `backgroundColor`, so
  `canvas.style.opacity = dotify` *is* the crossfade and no second layer is
  needed. Set it imperatively so the loop never causes React re-renders.
- `scatter` (0→1 over `SCATTER_MS` 800): scatters the assembled dots
  (`settle = 1 − scatter`). At `scatter ≥ 0.98` a `showHook` state flips and
  the hook line mounts. Mirror that flag in a ref and compare before calling
  the setter, or the one piece of React state in the scene is set on every
  frame instead of on the two frames it actually changes.

Rules that keep it correct:

- **Hovered**: raise `dotify` to 1, then raise `scatter`. **Unhovered**:
  lower `scatter` to 0, then lower `dotify`. Because the ramps are position
  based (advance by `dt / duration` toward the current target), hover-out
  mid-flight reverses from wherever it is — interruptible, never queued.
- The loop starts on hover and cancels itself once fully back at
  `dotify === 0 && scatter === 0`, clearing the canvas on the way out.
  Clamp `dt` (≤ 64ms) so a background tab does not teleport the ramps.
- Read `hovered` through a ref (synced in an effect) so the rAF loop sees
  the live value without re-subscribing.

## Non-negotiables for every cover

- **Reduced motion** (`useReducedMotion`): no rAF loop, no dots, no positional
  movement. The cover rests on its plain field, and if the hook line matters it
  crossfades over that still field on hover at ~0.01s. Every cover must render a
  useful static state.
- **Nothing runs at rest.** The rAF loop starts on hover and cancels itself once
  both ramps are back at zero, clearing the canvas on the way out, so an idle
  cover costs nothing whether it is on screen or off. That is a stronger
  guarantee than pausing an off-screen animation, and it is why a page can carry
  a wall of covers. It only holds while hover is the sole driver: if a cover ever
  gains an ambient loop that runs unhovered, it needs an explicit in-view gate as
  well, and it should earn that first.
- **Artwork colours are scene constants**, declared at the top of the cover
  with a comment (and the contrast ratio if type sits on them — the symptom
  checker's hook is white on `#0e2932`, about 15:1). They are not shell tokens
  and never leak into other components. Cards stay free of the case study's
  *token* theming — the artwork carries the colour.
- **Timing**: hover response should start immediately (the 300ms crossfade
  reads as instant); the fuller scatter may run past the standard UI tokens
  because covers are expressive ambient scenes — same precedent as
  `ParticleDissolve`. Keep the full reveal near ~1.1s.
- Copy rules apply to cover text: no hyphens, no emoji, hook lines short.

## Building a new cover — checklist

1. Add the id to `WorkCoverId` in `src/app/work/projects.ts`, point the
   entry's `media.cover` at it, and register the component in
   `ProjectCover.tsx`.
2. Copy the scene skeleton from `SymptomCheckerCover.tsx`: field colour, the
   `<canvas>` layer, the hook overlay, `setup` / `drawFrame`, and the hover
   loop. Retune `CELL_PX` / `MIN_COLS` / `MAX_COLS`, `LUM_CUTOFF`, `fieldLum`,
   the field and ink colours, and the copy.
3. Verify at 320 / 375 / 768 / 1440 wherever the cover is hosted: idle (no work
   at all), hover in, hover held until the hook shows, hover out mid-flight (a
   clean reverse, with the wakes trailing the right way), a resize rebuild, and
   reduced motion.
