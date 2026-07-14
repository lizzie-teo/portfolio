# Animated cover effects — halftone film and dot dissolve

A recipe for building bespoke animated home-card covers, extracted from
`src/app/components/SymptomCheckerCover.tsx` (the canonical implementation).
Read this before building a cover for another project so the covers share one
motion language and one performance discipline.

## Where covers live

- Every cover is a client component registered in
  `src/app/components/ProjectCover.tsx` under a `WorkCoverId`, and referenced
  from the entry's `media.cover` in `src/app/work/projects.ts`.
- A cover receives `hovered` (owned by `ProjectCard`, driven by Motion's
  `onHoverStart`/`onHoverEnd`, so touch taps do not trigger it) and
  `className` (the card passes `absolute inset-0`; the card frame owns the
  aspect ratio, radius, and border).
- The card's media frame is `aria-hidden`: covers are decorative artwork.
  Meaningful text (title, tagline, tags) lives in the card header below the
  frame, so nothing inside a cover needs screen-reader plumbing.
- Type inside a cover sizes in `cqw` container units against a `@container`
  root, so the same scene composes at every card width from 320px up.

## The three ingredients

None of this is WebGL. The "shader" look is Canvas 2D plus arithmetic.

### 1. Canvas halftone of live video

The film plays in a `<video>` element (muted, `playsInline`, looping,
`preload="auto"`), and a canvas re-renders it as a dot screen:

1. Sample the current frame into a tiny offscreen canvas the size of the dot
   grid (`GRID_COLS` ≈ 92 columns; rows follow the card aspect) with
   `drawImage`, cover-cropping the film into the grid's aspect first.
   Create the sampler context with `{ willReadFrequently: true }`.
2. `getImageData` on that tiny canvas — cheap, because it is ~92×78 pixels,
   not the display resolution.
3. For each cell, compute luminance
   `(0.2126 R + 0.7152 G + 0.0722 B) / 255` and draw one dot on the display
   canvas:
   - **Skip cells darker than `LUM_CUTOFF` (0.06)** — shadows melt into the
     field colour and read as negative space. This is what makes the
     halftone read as an image instead of a uniform dot grid.
   - Radius: `cellWidth * DOT_MAX * sqrt(lum)` — square root, so dot *area*
     tracks luminance like a print halftone.
   - Alpha: `0.3 + 0.7 * lum`.
   - One `fillStyle` for all dots (a near-white with a whisper of the field
     hue, e.g. `#EAF5F2` on `#0F2830`); vary only `globalAlpha` per dot.
4. The display canvas is sized to the container rect × `devicePixelRatio`
   capped at 2, and rebuilt (with the sampler and scatter table) on
   `ResizeObserver`.

Monochrome or muted footage works best: the single dot ink plus luminance
does all the work, and brand colour stays reserved for type. Steady-state
playback samples at ~30fps (`FRAME_MS = 33`); transitions draw every frame.

### 2. Particle scatter dissolve

The dissolve is one scalar, `settle` (1 = assembled image, 0 = fully
scattered/invisible), applied per dot:

- At grid build time, give every dot a random drift vector (angle uniform,
  distance `0.4..1.0 × SCATTER_DRIFT × width`, with `SCATTER_DRIFT = 0.16`)
  and a random delay in `0..SCATTER_DELAY` (0.4). Store them in one
  `Float32Array` (`dx, dy, delay` per dot) — no per-dot objects.
- Per frame, each dot's local progress is
  `clamp((settle − delay) / (1 − SCATTER_DELAY), 0, 1)` eased with
  `easeOutCubic`. Position lerps home → home+drift by `1 − eased`; alpha and
  radius scale down with it (`radius × (0.55 + 0.45 eased)`).
- The delay stagger is what makes it feel like a wave of particles rather
  than a crossfade. Ordering delays by position instead of randomly gives
  directional variants — see the ripple/sweep/swirl math in
  `ParticleDissolve.tsx`, which is the same technique on still images.

### 3. Motion for React for all DOM text

Canvas only ever draws dots. Titles and hook lines are real DOM so type
stays crisp:

- **Persistent title**: bold, in the project's artwork accent, bottom-left
  on a scrim (`linear-gradient(to top, field 95%, transparent)`), revealed
  once with the rise-from-overflow-mask pattern when the card first scrolls
  into view.
- **Hook line**: appears only at the fully-scattered end state, using the
  title/headline stagger recipe from `style-rules.md` (`slow` per line,
  0.06s interval), wrapped in `AnimatePresence` with an `instant`/`ease.in`
  fade exit.

## The hover state machine

The cover idles as the plain film — zero canvas work at rest. Hover drives
two sequential ramps, held in refs and advanced by a self-terminating rAF
loop:

- `dotify` (0→1 over `DOTIFY_MS` 300): crossfades film → dot screen.
  `video.style.opacity = 1 − dotify`, `canvas.style.opacity = dotify`, set
  imperatively so the loop never causes React re-renders.
- `scatter` (0→1 over `SCATTER_MS` 800): scatters the assembled dots
  (`settle = 1 − scatter`). At `scatter ≥ 0.98` a `showHook` state flips and
  the hook line mounts.

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

## Rotating-spotlight playback

Covers do not loop at rest, and no more than one film ever moves at once. The
home grid wraps its cards in `CoverPlaybackProvider`
(`src/app/components/CoverPlaybackProvider.tsx`), a coordinator that grants
playback to exactly one cover at a time in document order and keeps the
spotlight circling: an in-view card plays a single pass of its film, freezes on
its frame under the `DitherOverlay`, and after a short breather
(`HANDOFF_MS`, ~1.5s) the next eligible in-view card takes its turn. A per-cycle
`played` set tracks which in-view cards have already had a turn this cycle; once
none remain eligible the grid rests (`CYCLE_REST_MS`, ~4s). The `played` set is
cleared when the **rest timer fires**, not when eligibility runs out — the
surviving set is what lets a fresh card scrolling in during the rest preempt to
the short breather while an already-played re-entrant waits out the rest for the
next cycle. After the rest the rotation restarts from the top-most in-view card.

Semantics that fall out of this:

- **Leaving mid-pass counts** for the cycle and advances the spotlight after the
  breather; the departed card does not replay this cycle if it re-enters.
- **Single card in view** simply replays every cycle (~4s rest + one pass).
- **Empty viewport** idles with no looping timers; scrolling anything back in
  resumes the rotation after a uniform ~50ms kick (which lets the initial
  IntersectionObserver batch settle so the true top-most card wins the first
  grant).
- The coordinator owns granted state: a card's `filmActive` is set only by the
  coordinator's grant/release notifier, and a stray `timeupdate` firing
  `endFilm` after a scroll-out is ignored by an idempotency guard.

Known limitation: a browser may pause a hidden granted `<video>` when its tab is
backgrounded, which can stall the rotation on that card until the next
interaction re-nudges it (it self-heals on any hover, scroll, or view change). A
grant-watchdog that re-grants a wedged holder after a timeout is a documented
follow-up, not yet built.

Wiring, from card to cover:

- `ProjectCard` calls `useCoverFilmGrant(articleRef, hasCover && !shouldReduce)`
  and passes the returned `filmActive` / `onFilmEnd` down to `ProjectCover`.
  Disabled cards (no cover, or reduced motion) never register, so they can
  neither hold nor block a slot.
- Each cover drives its `<video>` through
  `useCoverFilm(videoRef, { play, passActive, onPassEnd })`
  (`src/app/lib/useCoverFilm.ts`), which replaces the old per-cover play/pause
  effect. It keeps the `loop` attribute and **never seeks** — the hover
  dissolve needs the film to keep looping. Pass-end is detected by accumulating
  elapsed time across loop wraps from `timeupdate`
  (`elapsed += t >= last ? t − last : duration − last + t`), firing `onPassEnd`
  at `elapsed ≥ duration − 0.05`. A rejected `play()` while a pass is active
  counts as a completed pass so the queue never stalls.
- The play condition is the same in every cover, and **hover lives outside the
  queue**: `play = !reduce && inView && (hovered || filmActive)`, with
  `passActive = filmActive && !reduce`. Hovering any card (even a rested or
  already-played one) resumes the film under the dissolve without consuming or
  blocking a grant; hover during another card's pass lets both play briefly and
  is accepted as user-initiated.

## Non-negotiables for every cover

- **Reduced motion** (`useReducedMotion`): no playback, no dots, no
  positional movement. Hold the film's first frame (or a static scene) with
  the title; if the hook line matters, crossfade it over the still on hover
  at ~0.01s. Every cover must render a useful static state.
- **Off-screen discipline**: pause the video (and never run rAF) while the
  card is outside the viewport — `useInView` without `once`. Playback is also
  gated by the one-pass grant, so at rest an on-screen film is paused on its
  frozen frame, not looping (see the film queue above); `useCoverFilm` owns the
  play/pause, so a cover never writes its own play/pause effect.
- **Autoplay failure is a state, not an error**: `useCoverFilm` runs
  `video.play().catch()` — low-power iOS blocks autoplay; the first decoded
  frame stands in and the hover effect still works on top of it. If the
  rejection happens while a pass is active, it is reported as a completed pass
  so the queue advances instead of waiting on a film that will never run.
- **Artwork colours are scene constants**, declared at the top of the cover
  with a comment (and the contrast ratio if type sits on them, e.g.
  `#66C5C0` on `#0F2830` = 6.6:1). They are not shell tokens and never leak
  into other components. Home cards stay free of the case study's *token*
  theming — the artwork carries the colour.
- **Timing**: hover response should start immediately (the 300ms crossfade
  reads as instant); the fuller scatter may run past the standard UI tokens
  because covers are expressive ambient scenes — same precedent as
  `ParticleDissolve`. Keep the full reveal near ~1.1s.
- Copy rules apply to cover text: no hyphens, no emoji, hook lines short.

## Building a new cover — checklist

1. Add the id to `WorkCoverId` in `src/app/work/projects.ts`, point the
   entry's `media.cover` at it, and register the component in
   `ProjectCover.tsx`.
2. Put web-ready footage under `public/assets/<project>/…` (square ~960px,
   a few seconds, muted; monochrome grades best under the halftone).
3. Copy the scene skeleton from `SymptomCheckerCover.tsx`: field colour,
   `<video>` + `<canvas>` layers, title scrim, hook overlay, hover loop. Drive
   the film with `useCoverFilm` (accept `filmActive` / `onFilmEnd` props and use
   the shared play condition) — never add a bespoke play/pause effect. Retune
   `GRID_COLS`, `LUM_CUTOFF`, field/ink/accent colours, and copy.
4. Verify at 320 / 375 / 768 / 1440 in the real home grid: one-pass grant on
   scroll-in then freeze, hand-off to the next card, played cards staying frozen
   on re-entry, idle, hover in, hover held, hover out mid-flight, reduced
   motion, and off-screen pause.
