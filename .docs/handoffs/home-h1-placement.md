# Handoff: where the home page's `<h1>` sits

Written 21 Aug 2026. **Nothing in this session is committed.** Delete this file
when the placement lands — it is a handoff between sessions, not a standing doc.

The build passes and the current state is shippable. What is open is one design
question, and the owner wants it brainstormed rather than decided.

---

## RESOLVED 21 Aug 2026 — direction "F" is built

The open question below was answered: the name **crosses the plates' top edge**.
The bottom quarter of the letterforms runs over the glass pane and the film, so
the name and the plates are one object. Cover line kept, plates back up high.

What that turned on, and what the brainstorm found:

- **The pane and the cover line are mutually exclusive.** The copy column is
  272px at 861 and 411px at 1440; "Lizzie Teo" at the 88px cap needs ~480px.
  Inside the pane it wraps, or the h1 drops to ~50px. Option A could not have
  both.
- **The mount centres itself** in the space under the bar (`--sw-mount-y`, THE
  MOUNT HUGS THE BAND), so a name positioned from the masthead sits still while
  the plates float down away from it — about 96px of daylight at 1440 × 900.
  The name is therefore derived from `--sw-plate-top`.
- **The overlap is measured from the baseline**, not the line box. A box is
  mostly air; overlapping it by a third puts no ink on the plate.
- **The plates were not made taller.** `--sw-band-h` is
  `min(available height, film-w × 9/16)` and is aspect-bound on most windows.
  Stretching it would either break 16:9 on real footage or crop it, and the
  slack it would consume is what centres the composition and gives the name its
  air.

Tokens: `--sw-name-baseline` / `-dip` / `-lift` / `-air` in `world.css`.
Measured at 1440 × 900: ~125px above the name, ~118px below the plates.
**Still not looked at on screen** — see VERIFY BEFORE COMMITTING.

---

## THE ORIGINAL OPEN QUESTION — kept for the reasoning

`/` now has a real `<h1>`, "Lizzie Teo", set at the case-study cover line
(`.type-cover`, 40 → 88px) in the band **above the mount** — spanning the glass
pane and the film, aligned to the plates' outer edges. It fades and rises in as
the panel takes its place.

The owner is weighing that against a different arrangement:

> "maybe the glass pane and the video pane should be higher and have lizzie teo
> above the icon and text or do we think its better to sit outside"

So:

- **Option A — inside the pane.** The name goes into the glass pane's own copy
  column, above the scene's mark disc and the eyebrow/title lockup. The plates
  rise, because the mount no longer has to clear a line above it.
- **Option B — outside, above both plates.** What is built now.

**Brainstorm both. Do not just implement A.** The owner asked for options, and
this line has already been moved four times (see the graveyard below) — each
move was reasonable and each one read wrong for a reason that only showed up on
screen.

### Which skills to load for it

Per `CLAUDE.md`, check `.docs/taste-skills.md` **before** loading any installed
skill. For this task:

- **`design-taste-frontend`** — the right lens. `.docs/taste-skills.md` rates it
  "Yes, selectively… load for divergent exploration or when a new section's
  direction is genuinely unsettled", which is exactly this. Use it to generate
  options, never as a spec.
- **`frontend-design:frontend-design`** — required by `CLAUDE.md` before writing
  or editing any UI code, whatever else is loaded.
- Ignore, in all of them: font swaps (this site is Avant Garde display / Geist
  body), arbitrary `clamp()` type values (standard Tailwind scale only), hex
  colours (semantic tokens only), and any instruction to install GSAP or Framer
  Motion (the stack is Motion for React, Canvas 2D, Paper Shaders).
- Project docs outrank every skill. If they disagree, say so in the reply rather
  than resolving it silently.

---

## WHAT OPTION A HAS TO SOLVE

These are the facts that killed the naive version of it. None is a reason not to
do it; all three are things the brief has to answer.

**1. The copy column is built by the vendored engine, and the engine is not
edited.** `scrub-engine.js:265` writes each scene's article — eyebrow, title —
and the scene's mark is a `::before` on `.sw-copy` in `world.css`. There is no
React child to add a line to. The two legitimate moves are a fixed overlay
aligned to the column, or a rule using the engine's existing slots. DOM surgery
on engine output is the pattern this route already refuses.

**2. There are ten copy articles, all absolutely positioned in the same place.**
Each fades in and out on its own dwell window. A name placed "inside the column"
is therefore either repeated per scene (wrong — it would arrive and leave nine
times) or a separate layer that only *looks* like it is in the column. The
second is almost certainly what Option A means, and it needs the column's exact
left axis (`--sw-margin-in`) and head (`--sw-copy-top`).

**3. The pane's height budget is genuinely tight, and this is the constraint
that has bitten twice.** `world.css` → THE PANE'S TYPE ROLES: the panel's height
is `--sw-film-w × 9/16` and `--sw-film-w` is the window minus the panel, so
every pixel of panel width is spent twice. Pushing `--sw-copy-top` down to make
room for a name above the mark eats the column's height on every scene, and the
file records that raising the title ramp alone overflowed the column past the
panel's foot at 861×768 and 1024×768. **Re-run those two window sizes before
committing to A.**

The upside of A is real and worth weighing against that: the plates rise back to
their own `clamp(78px, 9svh, 104px)` clearance, because `--sw-mount-top` no
longer has to hold a line above them.

---

## CURRENT STATE — what is built and where it lives

### The `<h1>` itself

- `src/app/components/FlightNameplate.tsx` — the component. No `"use client"`;
  with the fade-out parked there is nothing but markup, so it ships no JS.
- `world.css` → **THE LETTERHEAD, AND IT IS THE PAGE'S ONLY `<h1>`** — placement,
  type, arrival. Search that heading.
- Mounted in `HomeFlight.tsx` after `SiteHeader`, before `FlightFork`.

**Placement.** Above 861px it takes `--sw-mount` / `--sw-mount-right` — the
plates' own outer edges. `--sw-mount-top` is now `max()` of its own ramp and
`header foot + --sw-name-air + --sw-name-stack + --sw-name-gap`, so the plates
start below the line at every window height. Below 861px there is no mount; it
takes the page margins under the masthead.

**Type.** The `h1` carries `.type-cover` — the same class `Funding Finder` wears
on its cover and the home band names wear. `world.css` declares **no**
`font-size`, `font-weight` or `letter-spacing` for it: that file is unlayered
and would silently outrank the shared role. Ink and measure only.

**Arrival.** `opacity: var(--wgc-move, 1)` plus an `em`-based rise.
`--wgc-move` is published by `WorldGlassCard` (0 → 1 across p 0.54 → 0.9 of the
morph). By then the disk has gone into the slot — its insertion runs p 0.06 →
0.34 — so reading one existing number puts the name after the floppy with no
second clock. The morph's span (`0.26 × vh`) lives in a ref inside that
component and is re-measured on resize; do not re-derive it.

**Reduced motion** needs no rule: `WorldGlassCard` lands `p` on 1 outright, so
`--wgc-move` is 1 from the first frame.

**JS off**: the `var(--wgc-move, 1)` fallback fails open so the only `h1` shows
rather than being invisible. Cost is one frame at first paint before the mount
effect writes 0. Deliberate; one line to reverse.

### Rules that must survive any re-placement

- **Opacity only, never `visibility` or `hidden`.** `FlightFork` flips
  visibility on purpose so an expired cue leaves the accessibility tree. A
  heading must do the opposite — an `h1` out of the tree cannot be navigated to,
  which is the fault this component was built to fix. `pointer-events: none`
  handles the click side.
- **The handover is not optional.** `opacity: calc(1 - var(--sw-handoff, 0))` on
  the parent. Every fixed layer here must go as the bands rise or it hangs over
  the work grid forever.
- **Nothing may sit above the engine's track.** Verified, not assumed:
  `scrub-engine.js:370` reads raw `window.scrollY` and its `SEGMENTS[i].start`
  are absolute document offsets assuming the track starts at 0. A band above the
  flight desyncs every segment. The `h1` must stay a fixed layer.

### The parked fade-out

An earlier version stood at scroll 0, left on the arrival cue's beat, and came
back at **95.8 → 98.6%** of the flight so the page signed itself once the
Macintosh had finished writing `hello world` (leg 9 runs 90.4 → 100%; the
lettering completes at ~97.6% off the frame notes in `world.css`). The owner
parked the leaving half — "maybe it need not fade off for now i like to decide
this later". The arithmetic is preserved in `FlightNameplate.tsx`; restoring it
is a MotionValue on `.sw-nameplate__line` and nothing else.

### The placement graveyard — do not re-propose these

| Placement | Why it went |
|---|---|
| `sr-only` heading | Owner wants it visible. |
| 14px byline above the copy column | Read as a credit, not the page's name. |
| Cover line from the film's left edge | Read as a poster lying across the picture. |
| 28 → 36px above the mount | "styling follows project title Funding Finder" — wanted the cover line. |
| "Lizzie Teo, Senior Product AI Designer" | Job title removed; a cover carries a name. Role still lives in `<title>` and the meta description. |

Copy candidates the owner floated and did not pick: "Designer with a terminal",
"Design Engineer" (she wrote "Designer Engineer" — the term is *design
engineer*).

---

## ALSO UNCOMMITTED IN THIS SESSION — unrelated to the open question

Both are finished and building. Do not re-open them while working on the `h1`.

### 1. Home band names wear the case-study cover line

"Selected work", "Explorations", "Substack" are now `bandHeading` →
`.type-cover` (40 → 88px), the same role as a project cover.

- `theme.css` → `--type-cover-size/-weight/-leading/-tracking`, with derivations.
- `globals.css` → `.type-cover` in `@layer components` (no colour; call sites set
  ink, so `coverHeading` adds the leaf tone and `bandHeading` does not).
- `typography.ts` → `coverHeading = "type-cover text-leaf-foreground"`,
  `bandHeading = "type-cover"`.
- **`galleryHeading` stayed at 30 → 36px** and now serves `/work` and
  `/explorations` only. Both open with their own `h1` (48px, 32 → 60px), and an
  `h2` at 88px under either is an inverted outline. So `/` and `/work` say
  "Selected work" at different sizes on purpose.
- Band ledes moved `mt-3` → `mt-5 md:mt-6`; 12px under an 88px line sat on the
  descenders.

**The failed attempt before it is recorded in `theme.css` and is worth reading
once**: the bands were first typeset from the `/world` glass pane — identical
face, weight, letterfit and size — and it measured identical but did not look
it, because the pane's ramp floors at 24px for its panel's sake and reaches 36px
only at 1441. The display face also has no 600 of its own (`regular.woff2`
covers 300–500, `bold.woff2` 600–900), so the bands jumped a whole font file
while the pane did not move. **A relationship that is obviously a different size
reads as a hierarchy; one that is almost-but-not-quite the same reads as a
mistake.**

### 2. The home page's heading outline

`[data-sw-seo]`'s `h1` became an `h2` and its `h3`s stepped down, because both
that block and the nameplate ship in the served HTML and two `h1`s would have
gone out on every render. Outline now: `h1` the name → `h2` the walk → `h3` each
skill → the bands' `h2`s.

`.docs/type-scale.md` is updated for all of the above, including two rows that
were already stale before this session.

---

## VERIFY BEFORE COMMITTING

- `npx tsc --noEmit && npm run build` — both pass as of this handoff.
- **Nothing has been looked at on screen.** Screenshots are opt-in on this
  project (`CLAUDE.md`); the owner has been reading it live instead. The things
  that need eyes: how the `h1` sits against the plates at desktop, how much
  lower the mount now starts on a short window, and the phone layout below
  861px, where the pane is a band at the foot and the top of the screen is
  engraving rather than paper.
- If a visual pass is wanted, use the `visual-qa` agent with the route `/` — do
  not capture in the main conversation.
