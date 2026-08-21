# Type scale — responsive reference

The resolved sizes for every typographic role, mobile through desktop. This is a **lookup table, not a rulebook**: the reasoning lives in `.docs/style-rules.md` §4 (typography and readable measure) and §12 (case-study heading hierarchy), and the values live in `src/app/components/typography.ts`. When they disagree, code wins and this file is stale — fix it.

## A role is not a heading level

`h1` is a document-structure fact: one per page, whatever size it happens to be. A **role** is a typographic fact: what this text is doing to the reader. Every element is both at once, and neither determines the other.

This is why nothing here is named "H1". Two roles are `h1` elements at very different sizes (the 128px home hero and the 88px case-study cover), and two roles are `h2` elements at different sizes (`leafHeading` 46px, `sectionHeading` 36px). Naming by tag would give the first pair one name for two jobs and the second pair no name at all.

Where the line falls is conventional: once type crosses roughly 2× the largest true heading and starts being read as an image of a sentence rather than as document structure, it is **display**. Material 3 splits Display from Headline at the same place; IBM Carbon runs `display-01`–`04` separately from `heading-01`–`07`. Both roles above are display; both are still `<h1>` in the markup.

## Two families, two voices

A role belongs to exactly one. Do not mix a family's weight or tracking onto the other's surface — that's what makes a card title read as a section heading.

| Family | Where | Weight | Tracking | Why |
|---|---|---|---|---|
| **Editorial** | case studies | `font-semibold` | `-0.03em` | tight, dense, set-down reading type — a case study is a document |
| **Gallery** | home | `font-medium` | `-0.01em` to `-0.015em` | lighter and more open, because these label objects on plates to be scanned, not paragraphs to be read |

The home hero sits above both: semibold like the editorial family, `tracking-tight` like neither. It's a poster, and the only instance of its role.

**One role on the home page is editorial.** `bandHeading` — "Selected work", "Explorations", "Substack" — is the case-study cover's own line: semibold at -0.03em, standing over card titles that are still `font-medium`. The two voices are 3.7× apart in size and doing different jobs on one sheet (structure vs content), which is not the mixing the rule above forbids. It is the only exception.

## Faces and base

| | |
|---|---|
| Base font size | 16px (`--font-size`, `src/app/theme.css`) |
| Body face | Geist (`--font-sans`) |
| Display face | `--font-heading`, auto-applied to `h1`–`h4` by tag in `globals.css` |

Avant Garde is display-only. Body copy stays on Geist at paragraph sizes.

## Display

| Role | Token | 375px | 1440px | Leading | Element |
|---|---|---|---|---|---|
| Home hero | `displayHeading` | 36px | 128px | 1.06 → 0.95 | `StatementHero` `h1` |
| Case-study cover | `coverHeading` | 40px | 88px | 1.08 | `CaseStudyShell` `h1` |

`displayHeading` is the site's one breakpoint staircase, deliberately outside the fluid ladder — see below. `coverHeading` is the top rung of the ladder.

## Editorial ladder (fluid clamps)

Four roles sharing two anchors: **minimum at 375px, linear interpolation, maximum at 1440px**. Parallel curves, so the ladder's order holds at *every* width, not only at the endpoints.

| Role | Token | 375px | 1440px | Leading | Element |
|---|---|---|---|---|---|
| Cover | `coverHeading` | 40px | 88px | 1.08 | `h1` |
| Thesis statement | `statementHeading` | 32px | 60px | 1.06 | often not a heading tag |
| Chapter opener | `leafHeading` | 28px | 46px | 1.12 | `h2` |
| In-flow section | `sectionHeading` | 28px | 36px | 1.15 | `h2` |

Tracking is `-0.03em` throughout. `leafHeading` and `sectionHeading` tie at the 28px floor and the leaf pulls ahead from 375px up — a tie at the anchor, not an inversion. They never appear together (a chapter opener owns a dark full-bleed plate; a section title sits in-flow on a light tile), so at the floor the surface tells them apart.

### Retuning a role

Each is written `clamp(min, Nrem + Mvw, max)`, never `clamp(min, Mvw, max)`. The `rem` term keeps the heading responsive to browser text zoom; a size in viewport units alone ignores the reader's font-size setting everywhere between the bounds.

Move both endpoints and recompute both terms:

```
slope  = 100 * (max - min) / 1065
offset = min - 375 * (max - min) / 1065
```

Never hand-set one role in isolation. Mixing a fluid curve with a breakpoint staircase is what inverted the ladder the first time: between 768px and ~833px the chapter opener rendered *smaller* than the section headings nested inside it, and patching the crossover with another breakpoint only relocates the next one.

## Below the ladder (breakpoint steps)

These stay on the standard Tailwind scale because they sit far enough below `sectionHeading` (24 vs 36 at desktop) that no crossing is reachable.

| Role | Token | Mobile | `md:` | `lg:` |
|---|---|---|---|---|
| Subsection `h3` | `subsectionHeading` | `text-lg` 18px | `text-xl` 20px | `text-2xl` 24px |
| Minor `h4` | `minorHeading` | `text-base` 16px | `text-lg` 18px | — |
| Section lede | `sectionLede` | `text-base` 16px | — | — |
| Body copy | `text-base` | 16px | — | — |
| Captions, annotations, nav links | `text-sm` | 14px | — | — |
| Uppercase eyebrows and category labels | `text-xs` | 12px | — | — |

**One documented exception to the eyebrow row**: the `/world` chapter eyebrow and its marker pill run at `text-sm` (14px), set from `--sw-eyebrow-size` in `world.css`. Every other eyebrow on the site labels an object on paper at reading distance; that one is set on a photographic engraving behind glass in a full-viewport cinematic, under a Bold title, and at 12px it read as a caption that had come loose rather than as the chapter's name. The derivation, the phone band cost, and the 7:1 contrast recheck are all recorded at the token. Do not treat it as licence to raise eyebrows elsewhere.

`sectionLede` deliberately has no desktop step-up: it must never outsize the case-study cover's own intro body.

`h4` is the deepest the outline goes — `h2` section → `h3` subsection → `h4`, never deeper.

## Gallery voice (home)

| Role | Token | Mobile | Desktop | Leading | Tracking |
|---|---|---|---|---|---|
| Project card title | `projectCardHeading` | 30px | 30px (flat) | 1.02 | -0.015em |
| Gallery section rubric | `galleryHeading` | 30px | 36px (`md:`) | default | -0.015em |
| Home band name | `bandHeading` → `.type-cover` | 40px | 88px | 1.08 | -0.03em |
| Article card title | `articleCardHeading` | 20px | 24px (`sm:`) | 1.15 | -0.01em |
| Writing-index row | `indexItemHeading` | 18px | 20px (`md:`) | snug | -0.01em |

**The project card title is 30px, and the /world glass pane is no longer the reason.** It was: the pane's desktop block used to re-cap its chapter titles at `1.875rem`, so 30px was what a reader saw on any desktop, on a 336px column in the same display face, and matching it stopped the old `sm:text-4xl` step making a card title read a full step louder than the pane it rhymes with. That tie is **retired**. The pane's desktop ramp was re-cut in the same pass (Aug 2026, the pane rebalance) to 24 → 36px — same cap as the shared rubric, a lower floor for the panel's own reasons (see below) — so the pane a desktop reader meets caps a full step above the cards further down the same page.

The cards stay at 30px anyway, on their own argument rather than a borrowed one: they sit on a ~300px measure against the pane's 336px, they are objects on plates to be scanned rather than the one sentence on a full-height sheet, and this file's own rule about the gallery's two `h2`s — if a tie ever reads as two headings at one volume, move the **rubric** down, never the card title up — still binds. **Open question for the owner:** whether a 36px pane and a 30px card, eight viewports apart on one document, read as a hierarchy or as a drift. It is a look, not an arithmetic.

### The home bands wear the case-study cover's line

**The band name and the project cover are one role.** A reader who meets "Funding Finder" at 88px on a case-study cover meets "Selected work" at 88px on the way back — one scale for "the name of a whole thing, set as the opening of the surface it names". Owner's call, Aug 2026.

| Where the values live | What it holds |
|---|---|
| `--type-cover-size/-weight/-leading/-tracking` (`src/app/theme.css`) | the four values, with the derivation of each |
| `.type-cover` (`src/app/globals.css`, `@layer components`) | the role, assembled — no colour, because the two grounds differ |
| `coverHeading` (`typography.ts`) | `.type-cover` + the leaf ink, for the case-study `h1` |
| `bandHeading` (`typography.ts`) | `.type-cover` alone; the call site sets `text-foreground` |

**Not for `/work` or `/explorations`.** Their shelf headings keep `galleryHeading` at 30 → 36px. Both pages open with their own `h1` (48px and 32 → 60px), and an `h2` at 88px under either is an inverted outline, not a chapter break. So `/` and `/work` both say "Selected work" at different sizes on purpose: on `/` it is a chapter break, on `/work` it is a shelf heading under that page's own opening statement.

**What this replaced, in one pass, because the failure is instructive.** The band names were first typeset from the `/world` glass pane — same face, same 600, same -0.02em, same 30 → 36px. It measured identical and did not look it: the pane's ramp floors at 24px for its panel's sake and reaches 36px only at 1441, so between 861 and 1441 the same role rendered small in a narrow column beside a picture and full-size alone on an empty sheet. The display face also has no 600 of its own (`regular.woff2` covers 300–500, `bold.woff2` 600–900), so the bands jumped a whole font file while the pane did not move. **A relationship that is obviously a different size reads as a hierarchy; one that is almost-but-not-quite the same reads as a mistake.** The pane is self-contained again.

**The gallery's two `h2`s now descend by size, and the tie is history.** On the home page the band name is 88px at desktop over 24px card titles, in a different family. The arrangement has been all of: 36 → 30 (inversion), 30 = 30 (a tie, when the card came down to meet the pane), 36 over 24, and now 88 over 24.

The old argument is kept because it is the diagnosis if this ever reads as top-heavy: "Selected work" is a quiet rubric naming the region, while the card titles *are* the gallery's content, so hierarchy should come from the plates and the ground rather than from out-sizing the thing the reader came for. What overrode it is that the cards came down far enough that the rubric read as too small to open a band, and then that the rubric had to answer the glass pane above it. **If it ever needs closing, close it from the rubric end — never move the card title back up.**

`projectCardHeading` also clothes `LoFiProjectCard`'s animated outcome figure — the figure quotes the token rather than re-specifying it, so the title→figure dissolve swaps like for like and stays locked if the title moves.

`articleCardHeading` steps down from the project step because an article title is a sentence (the longest runs 46 characters); at the project step on a 10ch measure it wraps to five lines and breaks the box floor the row aligns to. Display type is sized to its content, not to its slot.

## The one staircase: `displayHeading`

The home hero is a breakpoint ladder rather than a clamp:

```
     text-4xl   36px
sm   text-5xl   48px   ×1.33
md   text-6xl   60px   ×1.25
lg   text-7xl   72px   ×1.20
xl   text-8xl   96px   ×1.33
2xl  text-9xl  128px   ×1.33
```

Monotonic, no skipped rung, every ratio inside the 1.2–1.35 band. Leading tightens as size grows: 1.06 → 1.02 at `lg` → 1 at `xl` → 0.95 at `2xl`.

It stays off the fluid ladder because it's sized to **characters per line** (display type wants roughly 20–40) against its own **column** — about 530px at `lg`, 610px at `xl`, 710px at `2xl`, not the 1024/1280/1536 the breakpoint names suggest. A curve on viewport width overshoots by a full step and fragments the headline.

`text-9xl` is the top of the standard scale, so `2xl` is this approach's ceiling. Going past 128px means a clamp — a carve-out to propose and justify, not a default.

## Standing constraints

- **Standard scale only.** No arbitrary sizes (`text-[13px]`, `text-[0.72rem]`) and no intermediate custom size tokens. If a size feels in-between, take the nearest standard step.
- **`sectionHeading` carries its own ink.** The role sets `text-heading` (the `--heading` token), which resolves to `--foreground` on the neutral shell and to the brand's deepest tone in a project scope that opts in — Healthdirect's section titles are its darkest teal, `#10262f`. Don't add a colour class at the call site; a local `text-foreground` silently opts that one heading out. A heading on a dark surface is the exception and overrides with `text-leaf-foreground`.
- **One token per role, never an inline size.** Reach for the token; never hand-size a heading at a call site. That drift is what makes a card label read as body text or a "special" statement escape the scale. There is no display-statement exemption.
- **Tokens carry type; call sites carry measure.** `max-w-[18ch]`, `max-w-[70rem]`, `max-w-[10ch]` stay at the call site — measure is layout, not type.
- **Letter-spacing is exempt** from the standard-scale rule, which governs size and spacing only. Uppercase eyebrows, kickers, and colophons may set tracking directly in the range **0.16em to 0.28em**. Centred tracked labels need a matching `text-indent`, or the trailing letter-space hangs them left of their axis.
- **An arbitrary font-size carries no line-height.** `text-2xl` ships a paired leading; `text-[clamp(…)]` does not and silently inherits body leading. Every clamped role sets its own `leading-*`. Dropping it reads as a heading gone loose.
- **Small text needs more contrast, not less.** Anything at `text-sm` or below that carries meaning clears **7:1**, not merely AA. See `.docs/style-rules.md` §4.

## Not yet converted

`ProjectCard.tsx` still carries the project-card type inline and is used only by the `/explore` direction pages, not by the live home grid. If it ever returns to production, point it at `projectCardHeading`.
