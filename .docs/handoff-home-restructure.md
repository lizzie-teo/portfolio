# Handoff: the walk is the front door

Rewritten 22 Aug 2026 after the copy-and-retiming pass (the layered history it
replaced is in this file's git blame if it is ever needed). **Nothing here is
committed.** Delete this file when the work lands — it is a handoff between
sessions, not a standing project doc.

> **NOTHING BELOW HAS BEEN LOOKED AT.** No screenshots were taken at any point
> in either pass. Everything is green on `tsc`, `eslint` and `next build`, and
> every derived table has been re-verified against the config by script (see
> THE NUMBERS ARE CHECKABLE), but scrub feel, seam feel, lockup composition and
> the new type scale are all unverified.

## THE CURRENT STATE — read this first

`/` opens on the floppy over the garden gate, scrolls nine legs of film, comes
to rest on the Macintosh writing `hello world`, then ordinary scrolling
continues into the Selected work, Explorations and Writing bands. `/world` is a
307 redirect to `/` (`next.config.ts`). The composition is two panels
everywhere: glass pane left, trail rail right.

### The nine legs

| #   | id               | eyebrow                | title                                                         | weight | dot |
| --- | ---------------- | ---------------------- | ------------------------------------------------------------- | ------ | --- |
| 1   | `stakeholders`   | Product designer       | I make complicated products simpler to use.                   | 1.3    | —   |
| 2   | `complexity`     | Systems thinking       | Ten years of improving complex workflows for teams and users. | 1.4    | ●   |
| 3   | `users`          | Prototyping            | Prototyping with paper, Claude Code or Figma.                 | 1.7    | ●   |
| 4   | `design-systems` | Design systems         | Building atomic design systems a team can run without me.     | 1.7    | ●   |
| 5   | `figma-to-code`  | Bridging design & code | Handing over files an engineer or an AI can build from.       | 1.4    | ●   |
| 6   | `vibe-coder`     | —                      | — (leg 7's title spans this leg)                              | 1.4    | —   |
| 7   | `makers-table`   | Start to finish        | Taking a product from discovery to the shipped screen.        | 1.8    | ●   |
| 8   | `reveal`         | —                      | — (wordless: the pull-back)                                   | 1.3    | —   |
| 9   | `sign-off`       | In practice            | Each case study shows how I work and what shipped.            | 1.4    | —   |

**Total 13.4vh**, down from 14.3. Three legs were cut and no speaking leg was
touched: leg 1 (1.5 → 1.3) when the chapter became a title card, leg 6
(1.8 → 1.4) when it stopped carrying a claim, and leg 8 (1.6 → 1.3) which is the
wordless pull-back.

**Seven of the nine panes wear the identical lockup** — mark, eyebrow, title —
and only five are stops on the trail. Two panes carry nothing, for opposite
reasons: leg 6's glass is NOT bare (chapter 7's sentence spans legs 6 and 7),
and leg 8's is, on purpose.

**Leg 8 is the one wordless leg and it earns it.** The pull-back is the move
that reframes the whole garden as the display of a small machine; a sentence
over it would be read instead of watched. Copy was put on it during this pass
and taken back off, in two timings — late on the settled frame, then early on
the house curve. Both files keep the record and the frame measurements so the
ground is not walked a third time.

### `label` is the trail. `eyebrow` is the lockup.

The one invariant, and it has no exception anywhere:

> A WAYMARKER EXISTS IF AND ONLY IF THE SECTION HAS A `label`.

`eyebrow` became its own field on the `Section` type in this pass, defaulting to
`label` when absent. That is what lets legs 1, 8 and 9 wear a chapter's lockup
without appearing on the rail; the alternative was hiding three more indices in
`world.css`, which would have made the invariant conditional. The mark disc
follows the EYEBROW, in CSS, via `:has(.sw-copy__eyebrow)` — so silencing a leg
in the config removes its eyebrow, its mark and its dot with no stylesheet edit.

### One button, one door

`FlightExit` renders `sw-btn sw-btn--primary sw-exit` — literally the engine's
own button classes, so it IS the ending's button rather than a copy of it. The
sign-off carries no `cta`; no section does. `wireSignOff` is deleted.

- Wording **"View selected work"**, matching the band's own "Selected work"
  heading. "Skip to the work" and "See the work" are both retired.
- Flush to the pane's foot slot (`--sw-print-bottom`, the copy column's left
  axis) at every scroll position and every breakpoint. It is never positioned
  twice, so the leg 9 handover moves nothing by construction.
- **It arrives third**, not at scroll 0: floppy → leg 1's lockup → button,
  fading up over `contain 2.96% → 4.06%` (derived from leg 1's `--sw-b`,
  2.881%).
  That is 0.40 → 0.54 of a viewport on desktop, 0.48 → 0.65 on a phone.
- `jumpWouldScrubFilm` unchanged: the jump is instant wherever it would drag the
  reader through more than a screenful of scrubbed film, eased where it would
  not, `replaceState` either way.

## THE NUMBERS ARE CHECKABLE, AND THEY WERE CHECKED

Six tables in `world.css` and three `copyWindow` pairs in `ScrollWorld.tsx` are
all derived from the nine scroll weights. They were re-derived from scratch in
this pass — five times, as the weights moved — and verified at the end by a
script that parses the config, recomputes every table and diffs it against the
stylesheet. Two stale `copyWindow` fractions were caught that way; nothing else
was wrong.

**THE SCRIPT DID NOT SURVIVE THE SESSION IT WAS WRITTEN IN** — it lived in a
session scratchpad and was gone by the next pass, which had to rebuild it from
the file's own comments. It has been rebuilt and extended (it now also asserts
that the glyph table's index set is exactly the panes with an eyebrow, because
an unset `--sw-copy-glyph` paints a solid rectangle rather than nothing). If
this work is going to run over more sessions, the script belongs in `scripts/`
rather than in a scratchpad.

**If a weight ever changes, re-run that check rather than editing by hand.** The
tables are: the dot `top:` percentages, the notch windows, the copy dwell table,
the reduced-motion dwell table, `--sw-a`/`--sw-b`, and the three `copyWindow`
fraction pairs. `world.css`'s THE WAYMARKERS block carries the weight table and
the derivation for each.

Two windows are explicit rather than derived by the engine, and both are timing
decisions:

- **leg 2** — the long hold, widened so the maze lands inside the plateau.
- **leg 7** — the span across legs 6 and 7.
  A third existed briefly — leg 8 needed a boundary guard while it had copy on it,
  because the engine derives "52% of the next leg" unconditionally and the sign-off
  arrives at the HEAD of its own leg. An empty article has nothing to collide with,
  so the guard went with the copy.

## OPEN WITH THE OWNER

- **The type scale is settled at `text-4xl` and BOTH ends have a verdict.**
  48px was built, shipped in the working tree, looked at live and called TOO
  BIG; the gentle 48px slope that put 1440 at ~37px was called TOO SMALL. The
  cap is 36px and the slope lands it at 1442, so a 1440 laptop sits AT the cap:
  1280 / 1366 / 1440 / 1600 / 1920 read 32.7 / 34.4 / 36 / 36 / 36. The phone
  ramp came back with it (30 → 36, cap at 852). Neither number is re-openable
  without a new verdict from the owner — there is no standard step between 36
  and 48, so "a bit bigger" has nowhere to go. The one lever left inside the
  cap is WHERE it lands: `clamp(1.5rem, 0.221rem + 2.376vw, 2.25rem)` puts the
  cap at 1366 and takes 1280 from 32.7 to 34.0.
- **The panel/picture height decoupling was KEPT, and reframed.** It was built
  to fit 48px and its composition cost was argued at that size (paper above and
  below the film at most widths, the picture down to 739 × 416 at 1440). At
  36px it is INERT from about 1100px of width up — `--sw-film-inset` is exactly
  0 at 1152 and every width above, the picture is 851 × 479 at 1440 again and
  the panel is 28.5% of the window again. What is left is a short-window floor,
  and it is the only thing in scope that fixes 861 × 768. One-line revert if
  the owner wants it gone: `--sw-band-h: min(var(--sw-avail-h), var(--sw-film-h))`.
- **861 × 768 and 1024 × 768 now clear, and the cause was never the type.** At
  861 the title is at its FLOOR, so no cap could have reached it; the overlap is
  the standing exit growing from an 18px line box to a 44px button (~26px of
  the 36px). Coupled, they run −36px and −7px. With the floor kept they run 0
  and 0, with 18px and 4px of paper above and below the picture. The three real
  levers stay the film's 9/16 box, the button leaving the panel's foot, and the
  floor; all three are the owner's.
- **320 × 568 is the tightest phone** and `--sw-band-lines: 5` is exactly its
  content rather than a budget with slack in it. Six lines does not fit at that
  shape; leg 2 is the binding title at five. Unchanged by the type pass — the
  phone ramp is at its 30px floor at 320 under both caps. Where the cap DID
  matter is 740 × 360, which is cap-bound: the 48px ramp pushed about 21px of
  copy up onto the picture there and the revert takes it back.
- **The rail during legs 1 and 9.** Both panes look like chapters and no dot is
  lit on either. At leg 1 the rail is cold (correct: the walk has not started)
  and at 9 it is fully passed (correct: it is over). Worth a look — the rail is
  now the only thing distinguishing a chapter from a pane that merely looks like
  one.
- **The scroll cue alone on the opening frame.** With the button delayed,
  `FlightFork`'s cue is the only affordance at scroll 0. It has never had to
  carry a screen by itself.
- **AI is named twice** — Claude Code (leg 3) and "an engineer or an AI"
  (leg 5). The third mention went with leg 8's copy.
- **Leg 3's title opens on its own eyebrow** (PROTOTYPING / "Prototyping with
  paper…"). The one-string alternative that keeps every word and drops the
  duplicate is `"On paper, in Claude Code or in Figma."`
- **One other flagged one-string swap**: leg 9's eyebrow (`Hello world` against
  `In practice`). Every other alternative in this pass was closed by the owner.

- **Leg 5's label uses an ampersand** — "Bridging design & code". It is that
  label's wording, not a house convention, and no other label carries a
  conjunction. It is announced as "and" by a screen reader, so the dot's
  accessible name is unchanged.
- **The five chapters now have five distinct glyphs**, and any one is a
  one-line swap in world.css (ONE GLYPH PER CHAPTER):

  | leg | chapter                | glyph       | silhouette                   |
  | --- | ---------------------- | ----------- | ---------------------------- |
  | 2   | Systems thinking       | `waypoints` | connected lattice of circles |
  | 3   | Prototyping            | `box`       | hexagon — owner's call       |
  | 4   | Design systems         | `shapes`    | three unlike loose forms     |
  | 5   | Bridging design & code | `code-xml`  | mirrored angles              |
  | 7   | Start to finish        | `flag`      | pole with a banner           |

  The two non-chapter panes keep `signature` (leg 1) and `files` (leg 9). Seven
  outlines, no collisions. Sections 3 and 4 had their notes written and their
  DECLARATIONS MISSING for part of this pass, which is not an empty disc: an
  unset `--sw-copy-glyph` invalidates the mask and paints a solid paper
  rectangle over the lens.

## REJECTED OR SUPERSEDED IN THIS PASS — do not re-propose

- **The name as leg 1's eyebrow.** `FlightNameplate.tsx` exists to record a
  cover-line being deleted from this screen for being the third setting of
  "Lizzie Teo" on it. The eyebrow slot on the title card is for the ROLE.
- **A blinking terminal caret** after that eyebrow. Built and removed the same
  day. One measurement survives: leg-9.mp4 draws no caret either, so the motif
  never had a second end.
- **Any copy at all on leg 8.** A mark, the eyebrow "Still going" and a line
  about AI changing design, tried in two timings and removed entirely. The
  original wordless argument is restored as live reasoning, with the frame
  measurements kept: four fifths of the pull-back is done by clip 67% and there
  is no hard stop anywhere in the clip.
- **Centring the sign-off.** Its stated reason ("it has no head and no foot to
  run between") died when it got a head. Every pane hangs from the same place
  now; the alternative, bottom-grouping the sign-off's lockup with its button,
  was rejected because it puts a vertical jump at the one boundary the piece
  cannot afford one.
- **Silencing leg 5, and silencing leg 7.** Both proposed, both reversed by the
  owner, both recorded in the file with the reasoning that beat them.
- **The research clause on leg 1's title.** Written, measured, cut. The signal
  lives in leg 7's "discovery" instead.

## Load-bearing machinery — do not undo

- **The view timeline.** `.sw-root` declares `view-timeline-name: --sw-flight`
  and every range says `contain`, so flight percentages resolve against the
  track and not the taller document. Holds by construction; not watched live.
- **THE FILM IS NOT SCRUBBED BY A NAVIGATION** (`use-anchor-scroll.ts`). One
  predicate, now one call site — the button. Recorded in style-rules §9.
- **Selector discipline for range tables**: an applier must sit BELOW its
  per-index rules in specificity, never tied, never above. The post-mortem is
  above the copy dwell table.
- **The engine double-mount guard** (`ScrollWorld.tsx`). The engine has no
  teardown; prevention is the only option.
- **All-intra masters.** The nine `leg-N.mp4` files are `--gop=1`; an in-place
  re-encode would silently drop the film to its jagged path. `scrub-engine.js`
  is vendored and never edited.
- **The disk label budget** fills its padding box exactly at 870×600. The
  current pair totals 40 characters against a 44-character ceiling.

## Rule conflicts on this route

1. **§7 bans CSS keyframes for product UI motion.** Declared exemption: the DOM
   is built by a vendored engine, and every animation here is SCROLL-driven, so
   its timeline is the reader's own gesture. Proposed amendment is written out
   in the Motion block. Every animation on the route is scroll-driven again —
   the caret would have been the exception and it is gone.
2. **§4 sends uppercase eyebrows to `text-xs`.** This route sets 14px, argued at
   `--sw-eyebrow-size`. It did NOT go to 16px with the title's new cap; the
   reasoning is under THE PANE'S TYPE ROLES.

## Suggested `visual-qa` run

`/` at 320 / 390 / 740×360 / 861 / 1024×768 / 1280 / 1440 / 1920. Stops at 0,
the arrival (~4% of the flight, where the button lands), the five chapter
midpoints, mid leg 6 (chapter 7's sentence over the bloom), leg 8 during the
pull-back (the pane should be empty), the sign-off, and the handover into
`#work`. A trail hover pass at 1440 (the preview now wraps rather than
overrunning). One reduced-motion pass at 390. `/world` should answer with `/`.

Priorities for that run, in order: **the type scale at 1280 and 1440** (36px is
the cap and 1280 is the width that gave up the most when 48px was withdrawn),
**the five chapter glyphs at 861 and 1440** (silhouette separation at ~19px is
the whole argument for the set, and it is the one thing arithmetic cannot
settle), **861 × 768 and 1024 × 768** (the lockup against the button — both
should now clear, with a thin strip of paper above and below the picture),
**740 × 360** (the landscape phone, which is cap-bound and where the type
revert bought back ~21px), **leg 8's empty pane against the reveal**, and **the
opening frame with no button on it**.

## LOCAL SCRATCH TO DELETE WHEN DONE

Both gitignored: `src/app/explore/leg0/page.tsx` and `public/scratchpad/`.
`HomeHero.tsx`, `WorldTransition.tsx` and `FlightNameplate.tsx` are unmounted
with notes at the top saying why; none of it ships to a reader.
