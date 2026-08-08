# Chapter dock — glass treatment brief

> **Archived. Do not build from this.** The work it briefs has shipped. The live
> rules are the code: `.chapter-dock-glass` and `.chapter-dock-spine` at
> `src/app/globals.css:127-187`, applied in `ChapterDock.tsx` and
> `ChapterMarker.tsx`, with the same idiom reused by `.tour-glass-chip` at
> `globals.css:194-222`. The general recipe distilled from all of it lives in
> `.docs/style-rules.md`.
>
> Three parts of what follows are actively wrong about the shipped result. The
> "clean base" section describes a solid surface with all glass code removed,
> which has not been true since the build landed. The brief's target of a mostly
> clear frost with a whisper of tint was tried and abandoned: the shipped tint is
> near opaque, because that is what keeps white labels and the coral pip legible
> over light content scrolling behind. The token plan, the `--dock-glass-*`
> variables and the per scope overrides, was never adopted; values are inlined as
> `color-mix` from `--leaf`, so per project tinting comes free. The references to
> `.project-card-glass`, `--glass-saturate` and `--glass-tint-strong` point at
> code that no longer exists.
>
> One requirement here is genuinely outstanding: the opaque fallback was wired to
> `@supports not (backdrop-filter…)` only. The
> `@media (prefers-reduced-transparency: reduce)` path this brief also asked for
> was never built and appears nowhere in the repo. That is an unmet accessibility
> constraint, not a stale rule.
>
> Kept for the reasoning: the rejection history explains why the shipped values
> are what they are, and the Apple research below is directionally what shipped.

Handoff for a fresh session. Goal: give the symptom-checker chapter dock an
**Apple-style glass surface** — a real translucent, blurred material (like
Apple's "liquid glass" / macOS sidebar & control-centre panels), not a flat
tinted slab.

## What "glass" means here (the target)
- **Translucent** — you can see the page content *softly blurred* through the
  surface. It is see-through, not opaque.
- **Backdrop blur** — the frost is the material. Content behind is legibly
  softened, not just darkened.
- **A little tint, not a colour pane** — barely tinted so it reads as glass over
  the page, not as a coloured block. Earlier attempts that leaned on a strong
  tint were rejected (see history).
- **Depth/edge** — a subtle lit edge / specular catch so it reads as a physical
  pane with thickness, the way Apple's panels do.

## Component + files
- Component: `src/app/components/ChapterDock.tsx` — right-edge auto-hide dock.
  Renders **xl+ only** (≥1280px). Reveal by pushing the cursor to the right edge
  or focusing into the nav; resting state is a slim vertical spine of ticks.
  Below xl, `ChapterMarker` owns the small-screen path (dock is `hidden xl:block`).
- Route to view: `/work/healthdirect-symptom-checker`.
- Tokens: `src/app/theme.css`. Utility mappings (e.g. `--color-grout`) live in
  the `@theme` block of `src/app/globals.css`.
- Any reusable `.chapter-dock-*` CSS classes → `src/app/globals.css`.

## Current state (clean base)
The dock is a **solid `bg-grout`** surface — `#10262f` on Healthdirect (the deep
teal grout token), white text (`text-leaf-foreground`), coral "you are here" pip,
`shadow-elevated`, `ring-1 ring-leaf-foreground/10`. **All prior glass code has
been fully removed** — no `--dock-glass-*` tokens, no `.chapter-dock-glass`
classes. This is the clean slate to build the new glass on.

## History — what was tried and REJECTED (don't repeat)
Several glass passes were built and each rejected, in order:
1. **Leaf-tinted glass** (`--leaf` #183947 at high opacity) — rejected: read as a
   too-strong saturated teal *coloured pane*, not glass.
2. **Neutral near-clear / warm-graphite frost** — rejected: read as a lifeless
   grey blur card. (There is also a standing note that a *frosted-glass dock was
   rejected once before this whole thread as "ugly / lifeless — a safe blur
   card"; the challenge is glass with character, not a generic blur pane.)
3. **Dark glass = near-black ink + 18% theme hue** — rejected: read as black.
4. **Dark glass tinted by `--leaf` / `--grout` directly** — rejected: `#183947`
   and `#10262f` are such low-chroma deep teals they just read as dark
   grey/slate, never "teal".
5. **Light glass from `--background`** — abandoned before shipping when the user
   pivoted to a solid grout fill.

**Key lesson:** the user does NOT want a heavily *tinted* pane in either
direction. The Apple-glass target is **mostly clear/translucent frost with only a
whisper of tint** — the blur and translucency carry the look, not the colour.
Keep saturation modest so the page behind doesn't glow through.

## Hard constraints
- **Legibility is the acceptance criterion.** White labels, section sublist,
  coral pip, and resting-spine ticks must stay crisp over BOTH a dark chapter
  leaf (`#problem`) AND a light content tile (`#outcome`) scrolling behind the
  dock. With a translucent surface this needs a tuned contrast scrim behind the
  text column and/or a faint text-shadow — engineered, not hoped for.
- **Reusable per case study.** Source any tint from a per-scope token
  (`var(--grout)` / `var(--leaf)` / `var(--background)`) so dropping ChapterDock
  into another study inherits that study's palette. Confirm it resolves for
  Healthdirect and AP+ (`data-project-theme` scopes in `theme.css`).
- **Semantic tokens only** — no one-off hex; add `--dock-glass-*` tokens in
  `theme.css` if needed (`.docs/style-rules.md` §3).
- **`backdrop-filter` needs a fallback** — provide an opaque `@supports not
  (backdrop-filter…)` flood so unsupported browsers still get a legible surface.
- Don't regress reduced motion, keyboard behaviour, focus rings, or the below-xl
  `ChapterMarker` path.
- Read `.docs/style-rules.md` + `CLAUDE.md` first; load the `frontend-design`
  skill; route the build through the `fd` agent. Verify at 1280px+ with the dock
  revealed (temporarily force `open`, then revert) over both light and dark
  backgrounds, light + dark mode, plus the resting spine. Capture only via
  `node scripts/screenshot.mjs`.

## Research — how Apple keeps glass legible (2026-07-16)
Legibility in Apple's Liquid Glass is **a stack of layers, not the tint.** The two
levers every rejected pass here was missing are `saturate` and an engineered dimming
scrim — the tint was never the readability lever, so the "whisper of tint" instinct
above was already right.

1. **Blur is the material.** Content behind dissolves into soft colour; *more* blur ⇒
   *more* legible foreground (Apple's own iOS 26 blur slider trades see-through for
   readability this way). Push blur to the high end — ~24–30px, not a typical card's 12.
2. **Saturate un-greys it.** Pure blur averages the backdrop toward grey — that is the
   "lifeless grey blur card" this dock kept getting rejected as. `saturate(~1.8)`
   restores chroma so it reads as premium glass, not cloudy. (The existing
   `.project-card-glass` already ships `--glass-saturate: 1.7` — proven precedent.)
3. **Adaptive dimming is the readability engine.** Apple *samples the backdrop* and
   drops in a dimming layer + flips foreground vibrancy when contrast would fall below
   its stated **4.5:1-after-blur** floor. CSS can't sample the backdrop, so engineer the
   static equivalent: an always-on **density scrim** — denser/darker behind the text
   column, fading to near-clear at the screen-rooted edge. This guaranteed backing is
   the whole game for white labels over the light `#outcome` tile.
4. **Specular edge = physical thickness.** A hairline lit top-inner highlight + soft
   outer drop shadow is the "glass, not translucent rectangle" tell.
5. **Tint is last and least.** Apple applies only a whisper by default and treats heavy
   tint as a *contrast tool* (its "Tinted" variant raises opacity), never an aesthetic
   default — which matches every rejection in the history above.

**Apple rules → our hard constraints (build checklist):**
- Measure white labels at **4.5:1 against the *blurred* light tile**, not the raw tile.
- **One glass sheet per view** — the dock is the only glass in frame; never stack glass.
- Glass sits on a system material, never raw content — the **density scrim *is*** that
  separating layer.
- **Reduce Transparency ⇒ solid fill.** Wire the opaque fallback to BOTH
  `@supports not (backdrop-filter…)` AND `@media (prefers-reduced-transparency: reduce)`,
  reusing the `--glass-tint-strong` fallback already in `globals.css:140`.

Sources: Apple Newsroom (Liquid Glass intro); Apple Developer WWDC25 "Get to know the
new design system"; LogRocket "Adopting Liquid Glass"; Designed for Humans (Liquid Glass
accessibility); Superdesign + Yarin Sasson (CSS glassmorphism recipes).

## Suggested technical starting point (Apple-glass)
Mirror the existing `.project-card-glass` token structure; give the dock its own
`--dock-glass-*` tokens (per `.docs/style-rules.md` §3), sourced via `color-mix` from
each scope's `--grout` so it inherits per case study.

```css
/* .chapter-dock-glass (globals.css), driven by --dock-glass-* tokens in theme.css */
background: var(--dock-glass-tint);            /* color-mix(in srgb, var(--grout) ~16%, transparent) — a whisper */
-webkit-backdrop-filter: blur(var(--dock-glass-blur)) saturate(var(--dock-glass-saturate));
backdrop-filter: blur(var(--dock-glass-blur)) saturate(var(--dock-glass-saturate)); /* blur ~26px, saturate ~1.8 */
box-shadow:
  inset 0 1px 0 rgb(255 255 255 / .28),   /* lit top rim — the specular catch */
  inset 0 -1px 0 rgb(255 255 255 / .06),  /* faint counter-edge for thickness */
  var(--dock-glass-shadow);               /* soft outer drop shadow to float it */
/* + a density-scrim layer (::before / gradient): opaque grout-derived behind the text
     column → transparent at the right, screen-rooted edge, so labels keep a backing
     while the edge stays see-through */
/* + a faint text-shadow on labels ONLY if the scrim alone doesn't clear 4.5:1 */
```

**Where it lands (for the `fd` build):**
- `theme.css`: add `--dock-glass-tint` / `--dock-glass-tint-strong` / `--dock-glass-blur`
  / `--dock-glass-saturate` / `--dock-glass-shadow` as a `:root` default plus overrides in
  the `healthdirect-symptom-checker` and `ap-testing-portal` scopes.
- `globals.css`: add `.chapter-dock-glass` + its density-scrim layer next to
  `.project-card-glass`, with both fallbacks alongside.
- `ChapterDock.tsx`: swap `bg-grout … ring-1 ring-leaf-foreground/10` for
  `chapter-dock-glass` on the revealed nav (line ~232). Likely keep the **resting spine**
  (line ~205) solid `bg-grout` — it's too small to blur convincingly — and glass only the
  slab; `fd` to confirm on the render. Keep text `--leaf-foreground` white.
