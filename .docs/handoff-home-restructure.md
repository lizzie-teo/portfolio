# Handoff: the walk is the front door

Rewritten 21 Aug 2026 as one current-state document (the layered history it
replaced is in this file's git blame if it is ever needed). **Nothing here is
committed.** Delete this file when the work lands — it is a handoff between
sessions, not a standing project doc.

> **KNOW THIS ABOUT PHONES (owner-flagged):** below 861px the copy band is
> still glass over film, and on the three dark scenes anything printed there
> loses contrast — a pre-existing defect that now touches a CONTROL (the
> standing exit), not just a caption. The exit goes full ink on phones as a
> partial mitigation; the real fix — painting the phone band solid on the
> pane's own progress, as desktop already does — is named in world.css and
> under OPEN WITH THE OWNER below, **not built**: it changes the phone
> composition and deserves a look first.

## THE CURRENT STATE — read this first

The owner's FigJam flow (20 Aug, night) settled the architecture after two
redirects in one day: **the garden walk IS the home page.** There is no
separate hero and no separate walk route.

`/` opens on the floppy over the garden gate, scrolls the nine legs (glass
pane left, trail rail right — the owner confirmed the two-panel composition
stays, twice), comes to rest on the Macintosh leg with the closing sentence
("I'm a product designer. I make complicated products simpler to use."), ONE
button (**See the work** → `#work`) and the email as a quiet line of type
under it — then ordinary scrolling continues into the Selected work,
Explorations and Writing bands. `/world` is a **307 redirect to `/`**
(`next.config.ts`; deliberately not a 308 — this address changed direction
twice in a day).

On top of that, the pane was relaid out to the owner's pick from a design
canvas (**"Option B — Eyebrow"**, https://claude.ai/code/artifact/07fb9b0e-0546-4d1f-8a60-2c50992c6500):

- The chapter's competency label is a **12px eyebrow inside the copy lockup**
  (mark → eyebrow → title, all left aligned, `--sw-ink-soft`), not a ~22px
  printed caption at the pane's foot. It is derived from `section.label` at
  mount (`withEyebrows`, ScrollWorld.tsx) and rendered by the vendored
  engine's own eyebrow slot — no DOM surgery — so it inherits the article's
  dwell window and parallax for free. That IS the simplified motion the owner
  asked for: one fade per chapter, no letter-tracking gesture, no leader draw.
- The foot slot holds a **standing "See the work" exit** (`FlightExit.tsx`,
  `.sw-exit`), present from scroll 0 for the whole walk, in the quiet
  sentence-link voice (12px body face, underlined, 44px padded target). It
  fades out across leg 8's own gap in the dwell table so the ending's real
  button is the only door on the last screen. The fork's separate "Skip to
  the work" was **folded into it** — one exit, one wording, one position;
  `FlightFork` is back to the scroll cue alone.
- `.sw-route__label` survives with one job: the trail dots' **hover/focus
  preview** (and their accessible name — the engine hides labels below 860px,
  so the `display: block` restatement is what keeps seven buttons named for
  screen readers). It no longer prints the current chapter (`.is-active`
  dropped: the eyebrow already says it).

### The mount, structurally

`page.tsx` wraps the three bands in `<HomeFlight>`; HomeFlight mounts
`ScrollWorld id="skills"` + `WorldGlassCard` + `SiteHeader tone="bare" flush`
(inside the flight — mounting SiteHeader in page.tsx too would stack two
fixed bars) + `FlightFork` + `FlightExit`, and publishes `--sw-handoff` from
the work band's rise so world.css dissolves the flight's fixed layers into
the bands. The masthead's four items are all section items now
(`site-nav.ts`): **My skills** (`#skills` — the flight's own container, lit
for the whole walk), Work, Explorations, Writing. No route items exist and
`SiteNavItem.section` is no longer optional.

### Load-bearing machinery — do not undo

- **The view timeline.** `.sw-root` declares `view-timeline-name: --sw-flight`
  and every range says `contain`, so flight percentages resolve against the
  track, not the taller document. This is the identity that lets the flight
  share `/` with the bands. It holds by construction but has NOT been watched
  live with the bands below.
- **THE FILM IS NOT SCRUBBED BY A NAVIGATION** (`use-anchor-scroll.ts`).
  `jumpWouldScrubFilm` (keyed off `data-sw-scrub-track`, exported) cuts any
  anchor jump to `behavior: "instant"` when it would cross more than a
  viewport of film; short hops between bands keep the eased scroll and the
  1cm landing. The exit and the ending's button import the same predicate.
  Recorded in style-rules §9. (`globals.css` sets document-wide smooth
  scrolling — that is why the rule is a short-circuit, not a CSS change.)
- **Selector discipline for range tables**: an applier must sit BELOW its
  per-index rules in specificity (`:where()`), never tied, never above. The
  full pile-up post-mortem lives in world.css above the copy dwell table —
  which is now the route's ONLY range table (the label table was retired
  with the caption).
- **The engine double-mount guard** (ScrollWorld.tsx): the mount effect
  stamps `data-sw-engine-mounted` and skips the engine on a second run
  against the same container. The engine has no teardown; prevention is the
  only option.
- **All-intra masters.** The nine `leg-N.mp4` files are `--gop=1` because
  `mp4-intra.ts` returns `null` for anything with a delta frame — an
  in-place re-encode would not error, it would silently drop the film to its
  jagged path. Playback copies are separate `-hero.mp4` derivatives.
  `scrub-engine.js` is vendored and never edited.
- **The 14.3 tables** (dwell windows, marks, waymarkers, unfurl, notches) are
  the walk's verified numbers — probe-verified chapter-at-a-time in Chromium
  and WebKit. The standing exit's fade window is leg 8's own dwell entry
  COPIED (`contain 84.839% → 90.21%`), not a new tuning.
- **Masthead legibility on phones** rides `--wgc-move`: `.sw-stage`'s top
  edge lerps down to a clearance line under the bar (read from
  `--site-header-bottom`, because the bar wraps at ~620px and ~340px),
  uncovering `.sw-sky` so ink measures 13.4:1 at every scene. Not a plate —
  the route's three plate rejections stand. Residual: ~0.38–0.54 of the
  opening morph briefly leaves the bar on bare film over scene 1 only;
  closing it needs `--wgc-pt` (a WorldGlassCard change, instruction in the
  CSS block).
- **The disk label budget is not a guideline**: the label stack fills its
  padding box exactly at the binding case, which is 870×600 rather than the
  1000×600 this doc used to name. Current pair (`SUBJECT: How I work` /
  `COVERS: Complex products, AI workflows`) totals 40 characters, against the
  44-character ceiling; anything longer must be measured at 870×600 first. The
  four spare characters are not a reserve to spend.

### Dead, on disk, owner's call to delete

`HomeHero.tsx` and `WorldTransition.tsx` are unmounted with notes at the top
saying why (each carries reasoning worth keeping: the measured
video-blend-does-not-apply argument, the last-frame-not-frame-0 rule, the
push-in's guard ladder). Between them they are the only references to
`leg-9-hero.mp4`, `leg-9-final.webp` and `leg-0-hero.mp4`; `leg-0.mp4` (the
all-intra master) is referenced by nothing. None of it ships to a reader.

## OPEN WITH THE OWNER

- **The phone copy band on dark scenes** — the one real defect. Below 861px
  the band is frosted glass over the film, so on the three dark scenes
  everything printed on it loses contrast — chapter titles (pre-existing) and
  now the standing exit (new; a control, which is worse). Shipped mitigation:
  the exit takes full ink at ≤860px, which buys back mid-tone scenes and
  does nothing for the dark three. **The named fix, not built:** paint the
  phone band solid on the pane's own progress, the way `.wgc__pane::before`
  lands the desktop panel as paper (~12.6:1 at every scene). Fixes the titles
  at the same time; visibly changes the phone composition; wants a look.
- **Flagged assumptions from the builds** (defaults chosen, owner may
  overrule): the email lives under the ending's button as a plain address
  line, no label; the nav label is **"My skills"** (the FigJam board sketched
  "My capabilities", but its labels are shorthand — it also says "Substack");
  `/world` redirects rather than 404s; the disk label values kept unchanged.
- **Back from the work band leaves the site** — the exit and instant CTA
  paths use `replaceState`, so declining the walk does not stack history. If
  the owner wants "back returns to the floppy", that is a one-line change and
  a different philosophy.
- **Pacing** — still blocked on a live look, and the stakes changed: phone
  readers are an involuntary audience again, so `scrollMobileFactor` 1.2
  (17.16vh legs) is worth revisiting — but it is a 20% change to the whole
  walk and must not ride along with targeted trims. The old design-crit trims
  conflict with reasoning written into the config: legs 3/4 (1.7 → suggested
  1.5) compensate a 0.12 seam and a linger cut respectively — do not apply
  blind; leg 9 1.4 → suggested 1.1, but the config wants the writing
  unhurried. Do not touch legs 7 and 8.
- **Legacy browsers without `animation-timeline: scroll()`**: the standing
  exit never fades, so the sign-off screen shows it beside the button saying
  the same words. Two working doors, declared as redundancy not defect.

## NEEDS A LIVE LOOK — nothing below is visually verified

Everything shipped green (`tsc` / `eslint` on touched files / `next build`,
plus served-HTML probes: `/world` 307s, anchors and copy present, `sw-skip`
gone, `sw-exit` present once), but **no screenshots were taken at any point**.

- Whether the view timeline truly holds with the bands in the same scroller
  (the one architectural assumption with no live proof).
- The eyebrow in place: mark → eyebrow → title against the 30–36px title
  (it renders from engine-built markup at runtime, so it is not even in the
  served HTML).
- The foot slot with two objects: the trail's hover preview appearing one
  line above "See the work".
- The exit's departure across leg 8 — handover or disappearance?
- Phone height budgets by arithmetic only: 740×360 landscape has ~2px of
  clearance, 320×568 ~9px.
- The ending's lockup (sentence, button, address line), the handover into
  `#work`, the masthead plate arriving over the bands, the fork at 320px,
  reduced motion at 390 (where `--wgc-copy` releases on frame one and title,
  cue and exit all stand together).
- Dark-scene severity of the 12px exit on real footage.

Suggested `visual-qa` run: `/` at 320 / 390 / 740×360 / 861 / 1440, stops at
0, the seven chapter midpoints, mid-leg-8, the sign-off, and the handover
into `#work`; a trail hover pass at 1440; one reduced-motion pass at 390.
`/world` should answer with `/`.

## THE 15.7 TABLES, PRESERVED

world.css points here for the arrival-chain values should a tenth leg ever
return. Weights `1.4 (arrival) + 1.5 + 1.4 + 1.7 + 1.7 + 1.4 + 1.8 + 1.8 +
1.6 + 1.4 = 15.7`; formulas as documented in world.css (dwell 60% of own leg
→ 52% of next; marks 68→88% of own leg; sign-off marks 2→34%; waymarkers =
midpoints; unfurl origin = first walk boundary, 11% wide; notch centre =
origin + F×11%, window −0.35/+0.7).

- Dwell (articles 2–8): 14.65→23.108, 23.23→33.77 (long hold, off-formula),
  33.885→43.847, 44.713→53.682, 54.395→63.924, 64.841→75.389, 76.306→86.191;
  arrival 0→14.65, pull back 86.191→91.083, sign-off 91.083→100 (cta lit at
  92.866).
- Marks `--sw-a/--sw-b` (2–8): 15.414/17.325, 24.535/26.318, 34.752/36.917,
  45.58/47.745, 55.108/56.892, 65.758/68.051, 77.223/79.516; sign-off (10)
  91.261/94.115.
- Waymarker tops (dots 2–8): 13.694, 22.93, 32.803, 43.631, 53.503, 63.694,
  75.159.
- Unfurl 8.917→19.917; notches (dots 2–8): 10.073/11.123, 11.089/12.139,
  12.175/13.225, 13.366/14.416, 14.452/15.502, 15.573/16.623, 16.834/17.884;
  traveller opacity gate 8.917→10.073.
- Under 15.7 the chapter-1 exceptions are DELETED (arrival leg ahead of it);
  under 14.3 they exist (`sw-copy-dwell-first`, mark window pinned 1.3→2.7).
  The two go together in both directions. (`sw-name-first` used to be in this
  set; it was retired with the caption's animations in the Option B pass.)

## HOW IT GOT HERE — so nobody resurrects a dead state

One day, three architectures; each was green when replaced:

1. **The opt-in era (20 Aug, morning):** `/` opened on a static hero
   (HomeHero — headline over a frameless picture of the Mac), the walk lived
   at `/world` behind a "What I do" masthead route item, and a leg-0 push-in
   (WorldTransition) played on `/` as the click transition. All built, all
   verified by DOM probe.
2. **The last-leg panel spec (20 Aug, evening):** the owner redirected — the
   hero was to become the /world glass-panel composition with "See the work"
   + "My skills" CTAs and a parade-suppression entry flag. **Specced, never
   built** (the build was stopped early when the owner redirected again).
3. **The walk returns (20 Aug, night, the FigJam flow):** the current state.
   The owner called the standalone hero redundant — "clicking on Lizzie Teo
   goes to floppy". Then the Option B pane relayout on top (21 Aug).

Two owner clarifications during the final build, binding: the walk keeps its
**two-panel composition** (glass pane + right rail) everywhere including the
ending; the legs-with-text-and-caption screens **can have the rail**.

## REJECTED — do not re-propose

- An "entrance garden" variant of leg 9. Both ends of the old push-in were
  `hello world`; the question no longer exists.
- Putting the floppy inside the hero's Mac screen. Moot (no hero), and the
  reasoning stands for any future hero: the Work grid below is floppy disks.
- Frosted chrome (plates, scrims, pills) laid over the artwork — rejected
  three separate times on this route; the artwork steps out from under the
  bar instead. The phone-band fix above must respect this: it paints the
  pane's own ground, not a plate over film.
- A skip/exit styled as a pill or matched to the cue's 11px caps — failed
  twice on rank grounds. The distinction that works is KIND (label vs
  sentence) and now POSITION (the exit owns the corner).
- Per-scene accent colour on the eyebrow (the engine's default). All six
  accents fail contrast at 12px on the pale pane; it is ink, deliberately.
- Re-deriving track progress in JS to fade the exit on legacy browsers. The
  view timeline owns that number.
- A second wording for the exit ("Skip to the work" beside "See the work").
  One name for one act.

## LOCAL SCRATCH TO DELETE WHEN DONE

Both gitignored: `src/app/explore/leg0/page.tsx` (review bench for the dead
push-in — deletable with it) and `public/scratchpad/` (raw clip + frames).
The design canvas working files live in the session scratchpad and need
nothing.

## SESSION NOTES

- Several terminal sessions run on this repo at once. A file changing mid
  task is routine; never revert to reassert. (Two pre-existing `tsc` errors
  in `src/app/explore/iso-icons/page.tsx` are another session's work.)
- The walk is owned by the `scroll-world` skill; `higgsfield-generate` is the
  model catalogue. `scrub-engine.js` is vendored upstream and never edited.
- Screenshots are opt in everywhere and cost real money. `visual-qa` is the
  agent for them; never capture in the main conversation. Stills cannot
  verify live motion — the exit's departure, the eyebrow's arrival and the
  handover all need a real scroll.
- Asset re-encodes go through `node scripts/shrink-asset.mjs --blend --write`
  only.
