"use client";

import { useEffect, useRef } from "react";
// Portable vanilla-JS engine from the scroll-world skill, kept unconverted so it
// can be diffed against the upstream reference file. It needs no `@ts-expect-error`:
// `allowJs` is on, so TS infers `mountScrollWorld` from the module itself, and the
// suppression that used to sit here was flagged as unused (TS2578) and failed builds.
import { mountScrollWorld } from "./scrub-engine";
// Takes the decoder out of the scroll loop: reads the engine's own scrubbed
// time and paints decoded frames to a canvas, instead of letting it seek a
// <video>. It edits nothing in the engine and falls back to the engine's own
// behaviour wherever it cannot run. See film/world-film.ts.
import { mountWorldFilm } from "./film/world-film";

/* ─────────────────────────────────────────────────────────────────────────
   THE GARDEN WALK — one continuous engraved garden, wild → light, flown
   through by a single forward camera. It is the top of `/` (page.tsx →
   HomeFlight), with the Selected work, Explorations and Writing bands under it;
   `/world` was its own route for one iteration and is now a redirect home
   (next.config.ts), so a `/world` in a comment anywhere in this folder means
   this flight rather than an address. Scroll scrubs the flight; each scene
   carries one of the hero-banner topics as pinned copy. Assets are produced by the Higgsfield
   pipeline in ~/Development/scroll-world-work (previz first, then the final
   1080p chain re-encoded over the same filenames — this config never changes
   between draft and final).

   Architecture A (continuous forward take): the legs ARE the journey, so
   `connectors` stays empty and a small crossfade hides the frame handoff.

   NINE LEGS, A TITLE CARD, FIVE CHAPTERS AND AN ENDING — and it used to be
   NINE LEGS, SEVEN CHAPTERS, which is the shape most of this file's history was
   written against. Read the older notes with that in mind: where one says
   "the seven", it now means the five.

   THE WALK SAYS FEWER THINGS (owner's call, Aug 2026). It opened on a claim
   every designer makes — cross functional collaboration — and then made seven
   claims in a row over 14.3 viewports. It makes five now, over 13.4. Three
   things changed at once:

     · LEG 1 IS A TITLE CARD. No `label`, so no eyebrow and no waymarker, and
       its sentence is the site's positioning statement rather than a chapter's
       claim (see the section).
     · LEG 6 GOES SILENT IN ITS OWN RIGHT, AND LEG 7 SPEAKS FOR BOTH. No
       `label` and no `title` of its own — but the pane is not left empty over
       it, because chapter 7's sentence is held across the pair (see the two
       sections, and THE PAIR below). Leg 8 is the leg that IS left empty, and
       always was.
     · THE SIGN-OFF CLOSES INSTEAD OF PITCHING, because the positioning
       sentence it used to carry has moved to leg 1.

   LEG 8 STAYED WORDLESS THROUGH ALL OF IT, and that is not an oversight in this
   list — it is the one leg the pass tried to change and could not. Copy went on
   and came back off; see its section.

   SILENCING IS THE MECHANISM AND DELETION IS NOT. Every one of the nine
   sections stays in this array with its `still`, `clip`, `linger` and its
   hand-measured `seam` untouched. Removing a section would shift every index
   the engine keys off (`jumpTo(i)`, `nth-of-type` in world.css) and break
   joints that were measured frame by frame. A silent leg is footage the reader
   travels through, which is what the retiming below pays for.

   ── THE PAIR: WHY SILENCE IS NOT THE SAME AS AN EMPTY PANE ────────────────
   Silencing a leg does not remove the glass. The panel is a standing object —
   it lands once at the arrival and never moves again (world.css, WHATEVER
   GROUNDS THE TYPE MUST COMMIT) — so a leg with no words is a PANE WITH
   NOTHING IN IT, not a leg without a pane.

   THAT IS FINE AT LEG 8 AND WRONG AT LEG 6. Leg 8 is the pull-back, where the
   garden turns out to be a screen; its emptiness IS the content and the pane
   holding nothing is the beat (WorldGlassCard.tsx records it as the deliberate
   exception). Leg 6 sits in the middle of a run of speaking chapters, so the
   identical treatment reads as a hole — a panel that failed to load between two
   that did.

   SO CHAPTER 7'S SENTENCE SPANS BOTH LEGS. "Taking a product from the first
   sketch to the shipped screen." rises during leg 6 and stands through leg 7,
   one chapter over two scenes of travel. That is the right line for it: every
   other title names a competency and lands on the landmark that shows it, and
   this one names the whole ARC — its subject is not a landmark, it is the
   distance — so it is the one sentence on the walk that wants two legs under
   it. The mechanism is leg 2's, a `copyWindow` on the section paired with a
   widened range in world.css; see both.

   THE TESTING CLAIM WAS NOT PUT BACK TO FILL THE PANE, and that was considered
   and rejected. It is the weakest claim on the walk (a hiring manager assumes
   it) and the footage does not show it. Filling a pane is not a reason to make
   a claim.

   THE OPEN ALTERNATIVE, NOT BUILT: fade the glass pane out entirely on wordless
   legs, so silence reads as film rather than as an empty panel. The owner is
   holding it as a possible second pass, because it would also change leg 8
   where the emptiness is deliberate. Do not build it on the way past.

   SILENT LEGS ARE SHORT LEGS, WITH ONE EXCEPTION THE PAIR CREATES. Leg 8 has no
   words and comes down. Leg 6 has no words of its OWN but carries half a
   chapter's reading, so it comes down only to the walk's default (1.8 → 1.4)
   rather than to a travel weight. The speaking legs keep theirs, because those
   numbers were raised deliberately to slow the film under the copy (LINGER IS A
   TAIL BUDGET) and travel is the point of the piece. The walk is 13.4vh where
   it was 14.3. Do NOT buy a bigger cut out of legs 2, 3, 4, 5, 6 or 7.

   Legs 1–7 each arrive at their own chapter's
   landmark. Legs 8 and 9 are THE ENDING: the camera pulls back until the whole
   night garden turns out to be the screen of a small machine standing on bare
   paper, and then the screen settles into the words `hello world`. That is the
   sign-off, and leg 9 is where the walk stops, the closing sentence stands and
   the page's one button waits (THE ENDING, on `sign-off`). Its last frame is
   also the home page's resting hero: the film does not move again and ordinary
   scrolling carries the reader on into the bands.

   NO `label` ON EITHER, AND THAT HALF IS PERMANENT. A label is not a name for a
   scene here, it is the word a CHAPTER is given: it sets as the eyebrow over
   that scene's title, it names that scene's waymarker on the trail, and the
   eyebrow is derived from it (THE CHAPTER'S NAME IS AN EYEBROW). So a label on
   the ending would put the ending on the trail and give it a chapter's lockup,
   making it chapter eight — which it is not. The ending is not a chapter and the trail must never say it is.

   ── `label` IS THE TRAIL. `eyebrow` IS THE LOCKUP. THEY ARE NOT THE SAME ──
   This is the invariant the whole route's furniture hangs off, and it was one
   field until Aug 2026:

     A WAYMARKER EXISTS IF AND ONLY IF THE SECTION HAS A `label`. No exception
     is written anywhere and none may be. The eyebrow is a separate field that
     DEFAULTS to `label` when it is absent (`withEyebrows`, and the `Section`
     type below), so a chapter still declares one word and gets both.

   WHY THE SPLIT EXISTS. Two panes want a chapter's LOCKUP without being stops
   on the trail: leg 1's title card, whose eyebrow is the role, and leg 9's
   sign-off, whose eyebrow is "In practice". Under one field the only way to
   give them an eyebrow was to give them a `label`, which would have put
   "Product designer" and "In practice" on the rail as chapters six and seven.
   The alternative — hiding two more indices in world.css — is the special case
   this codebase keeps getting bitten by, and it would have made the invariant
   above conditional. Splitting the field keeps it absolute.

   IT BRIEFLY HAD A THIRD USER. Leg 8 carried an eyebrow for part of one day
   while the pull-back had copy on it; that is gone and the leg is empty glass
   again. The field is not — legs 1 and 9 still need it.

   WHAT FOLLOWS FROM IT, per section:

     · NO `label` → no waymarker, at any width, with no CSS edit. Legs 1, 6, 8
       and 9. FIVE DOTS ON THE RAIL, and that is the whole of the rule.
     · AN `eyebrow` (declared or inherited) → an eyebrow in the lockup AND the
       mark disc at the head of the column, because world.css selects the disc
       off `:has(.sw-copy__eyebrow)`. Legs 1, 2, 3, 4, 5, 7 and 9.
     · NEITHER → nothing on the pane at all. Legs 6 and 8, and they are empty
       for opposite reasons: leg 6's glass is NOT left bare (chapter 7's
       sentence spans it — THE PAIR), and leg 8's is, on purpose (THE PULL BACK
       IS WORDLESS).

   SO SEVEN OF THE NINE PANES WEAR THE IDENTICAL LOCKUP — mark, eyebrow, title —
   and only five of them are stops on the walk. That is the point of the split
   rather than a side effect: the pane is one composition at every scroll
   position (world.css, THE PANE IS ONE COMPOSITION AND NOTHING IN IT EVER
   MOVES) and the RAIL is what tells a reader whether they are in a chapter.

   Only the trail's `top:` percentages and the notch windows still have to be
   recomputed by hand, because those are the scroll weights and CSS cannot read
   them.

   Two unlabelled sections rather than one concatenated outro clip, because the
   8→9 joint is a real joint and the seam machinery dissolves it; concatenating
   them into one file would make it the only hard cut in the piece. The cost is
   two extra waymarkers, and world.css takes them straight back out (THE
   WAYMARKERS). Nothing else may reintroduce them: no `label`, no nav entry.

   THE WORDLESS HALF OF THAT ARGUMENT IS GONE, and this note used to make it. It
   read "no label and no title", on the reasoning that a screen hand-lettering
   `hello world` is its own sign-off and a caption over it would be a second
   voice saying the same thing. Leg 9 now carries a `title`: the closing line,
   standing over the button, so the walk ends on a sentence addressed to the
   reader rather than on a joke printed inside the picture — and so the last
   pane is a lockup rather than a control with nothing to belong to. Leg 8
   stays genuinely wordless, and that is not a leftover: it is the move that
   reframes the whole garden as a screen, and a sentence over it would be read
   instead of the reveal.

   COPY: the picture carries the garden, the words carry the work. The garden
   metaphors ("the gate", "the undergrowth", "the dusk bloom") are NOT written
   anywhere on the page — the engraving says them better than a caption can. The
   scene `label` therefore holds the COMPETENCY, because it is the word the
   reader is given for the chapter: it sets as the EYEBROW above that scene's
   title (world.css, THE EYEBROW), and it is the trail dot's accessible name and
   its hover preview. Do not write an `eyebrow` into a section by hand — it is
   derived from `label` at mount (THE CHAPTER'S NAME IS AN EYEBROW, below), so
   the two can never be different words.

   IT USED TO BE PRINTED IN THE BOTTOM-LEFT CORNER at 24px under a dotted
   contents-page leader, and for that whole period this note said the opposite:
   do not set an `eyebrow`, because the printed name IS the eyebrow. The owner
   relaid the pane out; the name came home to the lockup and the corner prints
   nothing.

   ONE LINE PER SCENE, deliberately. The engine also supports `body` and `tags`;
   both are omitted because a paragraph competed with the flight for the reader
   at the exact moment the camera was moving. Register is CV: the label is the
   competency, the title is the claim, and the footage is the evidence.

   THE FORM IS A CONTENTS PAGE, NOT A CV. The titles were first person once
   ("I start by getting…", all seven), on the reasoning that a repeated "I" made
   the scenes read as one person walking forward. It did the opposite here: seven
   consecutive claims in a row is the register of a résumé, and the flight is
   already carrying the forward motion the "I" was there to supply. They are book
   chapter titles now — a gerund and its object, no subject — so the walk reads
   as chapters of a body of work.

   This is a WORLD-ONLY deviation, and it does not travel. Case-study prose stays
   first person and actor-first (see the ux-writer skill, "Voice"), because there
   the reader is trying to work out which decisions were hers. Here there are no
   decisions to attribute, only competencies, and nobody else is in frame to
   confuse them with. The rule that permits it is the skill's heading rule: a
   heading is a label, not a sentence, so the actor rule does not apply.

   The verbs still carry the arc (building, handing, taking) because naming the
   scenery is forbidden above, so sequence is the only cohesion device left. The
   ten-years entry is the one non-gerund and has its own note. Two of the verbs
   the arc used to run through — watching, and collaborating — left with the
   chapters that carried them; the arc is shorter and it still runs forward.

   THE IDS ARE HISTORICAL and they do not track the labels. Nothing reads them —
   the engine keys every scene off its INDEX (`jumpTo(i)`, `nth-of-type` in
   world.css) and never touches `id`, so `users` sits on the prototyping chapter
   and `vibe-coder` on the testing one, both from earlier drafts of the running
   order. Renaming them would churn a diff for no reader-visible gain; do not
   read a chapter's subject off its id.

   A title should not merely restate its own label in a longer form, since the
   label sets as the eyebrow directly above the title and the two are read as
   one lockup. One still shares a root with its label — design systems — and it
   is allowed for the reason the pair exists: the label is the term a hiring
   manager scans for, and the title extends it rather than echoing it (WHAT for,
   WITH WHAT). A title that could be deleted without losing a fact is the one to
   rewrite; a repeated word is not. Two earlier drafts (garden aphorisms, then a
   rotating-actor story) both read wrong on this imagery.

   AND THE RULE NOW REACHES ACROSS SCENES, NOT JUST WITHIN ONE. Leg 1 is a title
   card carrying the positioning sentence, so it is the line every chapter after
   it is read against: leg 2's title was cut for echoing it almost word for word
   (see that section). A chapter that restates the title card is the same fault
   as a title that restates its own label, one pane further apart.

   Type and colour come from the site theme, wired in world.css — never restyle
   the copy inline here. Keep page.tsx's data-sw-seo block in sync. ────────── */

/* ── THE SECTION TYPE, AND THE ONE INVARIANT IT EXISTS TO PROTECT ─────────
   Declared for two fields out of a dozen. The rest are the vendored engine's
   and are typed loosely on purpose — `scrub-engine.js` is upstream JS kept
   byte-diffable, so a full config type here would be a second source of truth
   for a file this repo does not own.

       A WAYMARKER EXISTS IF AND ONLY IF THE SECTION HAS A `label`.

   That is absolute, it has no exception anywhere in this route, and the split
   below is what keeps it that way. `label` is the word a CHAPTER is given: it
   puts a dot on the trail and is that dot's accessible name and hover preview.
   `eyebrow` is what prints above the title in the lockup, and it DEFAULTS to
   `label` — so a chapter declares one word and gets both, and cannot end up
   with a rail that says one thing and a pane that says another.

   Declaring `eyebrow` WITHOUT `label` is the deliberate case: a pane that
   wears a chapter's lockup without being a stop on the walk. Two do — leg 1's
   title card and leg 8 — and both are argued in their own sections. Declaring
   `label` without `eyebrow` is the ordinary case and is every chapter.

   THE MARK DISC FOLLOWS THE EYEBROW, NOT THE LABEL, and it follows it in CSS
   rather than here: world.css selects it off `:has(.sw-copy__eyebrow)`. So the
   three pieces of chapter furniture split cleanly — trail off `label`, lockup
   off `eyebrow`, and nothing has to be listed by index. */
type Section = {
  /** Historical and read by nothing — see THE IDS ARE HISTORICAL above. */
  id: string;
  /** Chapter name. Presence of this field IS the waymarker. */
  label?: string;
  /** Prints above the title. Falls back to `label` (`withEyebrows`). */
  eyebrow?: string;
  still: string;
  poster: string;
  clip: string;
  accent: string;
  title?: string;
  /** Leg weight in viewport heights. Absent means `diveScroll`. */
  scroll?: number;
  linger?: number;
  seam?: number;
  /** Fractions of the WHOLE FLIGHT, not of this leg. See leg 2. */
  copyWindow?: { start: number; end: number; hold?: [number, number] };
};

const A = "/assets/world";

const CONFIG = {
  /* NO `brand`. The engine's brand slot drew a home link — a gradient-blob mark
     beside the name — in the top-left corner, and the site's own masthead
     (SiteHeader, mounted as a fixed overlay in page.tsx) now stands there. Two
     links home a few pixels apart, one of them wearing a decorative gradient the
     site bans outright, is a bug rather than a lockup.

     THE BEAT SURVIVED IT. The opening move of this page is the plate giving the
     name away (WorldGlassCard), and the site masthead is what it gives it to:
     `--wgc-brand` still fades on exactly the timing the engine brand used to
     take, so the masthead arrives as the plate draws back. The name is printed
     nowhere in the copy column — the masthead carries it, once. */
  /* THE DEFAULT LEG LENGTH, and the only length two scenes actually use:
     `complexity` and `figma-to-code` set no `scroll` of their own, so this
     number IS their weight and raising it is how they get retuned. Both are
     speaking chapters and both keep it through the Aug 2026 cut — `figma-to-code`
     was briefly slated to go silent at 0.8 and the owner reversed it (see that
     section), which is why it is still on the default rather than on a number
     of its own. It went
     1.3 → 1.4 with the tail pass below — at 1.3 they were the two fastest
     clips on the page (a 5s take over 1.38vh of scroll) and they carry no
     `linger`, so there was no curve left to flatten and scroll was the only
     lever. Any leg added later inherits this, which is the right default now
     that the tail budget is the thing being held even. */
  diveScroll: 1.4,
  /* THE DEFAULT seam width only. Every joint sets its own `seam` below, because
     the joints are not equally good and one width cannot serve them all: seedance
     re-DRAWS a start frame rather than continuing it, and how close the redraw
     lands varies from frame-adjacent to a genuine cut. A width wide enough to
     cover the loosest joint smears the tightest one into a double exposure of the
     same take. Nothing on this page falls back to this number; it is the floor for
     any scene added later. See THE SEAM in scrub-engine.js for the mechanics. */
  crossfade: 0.12,
  /* ONE WORD. It was "scroll to walk in", which broke this file's own rule three
     lines of comment above the sections: the garden is never named in the copy,
     and "walk in" names it. It was also instruction for a thing the reader has
     not been shown yet. The hairline under the word does the pointing, so the
     word only has to name the gesture (world.css, THE HINT IS A WORD AND A
     LINE). Set in caps by the stylesheet, not here. */
  hint: "Scroll",
  nav: false,
  atmosphere: false, // the engraving supplies its own atmosphere; keep chrome quiet
  /* SEAM WIDTHS ARE MEASURED, THEN LOOKED AT — never one without the other.
     Every value below came down when previz v4 replaced v3, because v4's legs
     are generated with `--end-image` pinning each leg to the plate it has to
     arrive on, so the joints close by construction rather than by dissolve. The
     numbers in each comment are v4's leg-to-leg mean absolute difference /255
     (HANDOFF-INTEGRATION.md §4).

     The number is a screening tool and nothing more. It has now misled this
     project three separate times: SSIM was fooled by moving foliage, mean
     difference by the maze's high-frequency detail, and in v4 a leg 3 take that
     flew straight past its destination into bare paper scored 20.6 — identical
     to the correct take, because bare paper matches bare paper. A joint is good
     when it looks good.

     LINGER IS A TAIL BUDGET, NOT A DWELL DIAL. `lingerEase` (scrub-engine.js)
     is symmetric: it buys a slow middle by running BOTH ends fast, and the
     derivative at x=1 is 1 + 2L. So 0.5 played a scene's last frames at twice
     real time and 0.4 at 1.8×, and every leg is a 5s take that ENDS on its
     arrival — a butterfly landing, a quill finishing its stroke, tiles
     reseating. The payoff was whipped through and then dissolved into the next
     leg. Reading forward you never saw it; scrolling back up you did, which is
     the tell that the curve and not the footage was at fault.

     The values below are set from one number: the scroll distance a leg's LAST
     SECOND of clip gets before its successor's seam starts dissolving it. It
     ranged from 0.10vh (scene 3) to 0.20vh (scenes 2 and 5, the two with no
     linger at all); it is now 0.21–0.26vh on every leg. The ratio that
     actually reads as a whip is mid-speed ÷ end-speed: 4:1 at linger 0.5,
     1.5:1 at 0.15.

     HOUSE VALUE 0.15, and 0.10 where the action lands in the final second.
     Nothing here goes to 0: a few percent of extra travel through the seam is
     wanted, because a dissolve between two MOVING frames reads as travel and a
     dissolve onto a stalling one reads as a stall (THE SEAM, scrub-engine.js).
     0.15 keeps the pre-boundary tail at ~1.1× and only the frames inside the
     dissolve at 1.3×. Do not push any of these back above 0.2.

     WHAT THIS COST. Every scene's middle now moves more under its copy, most
     of all scene 6, which came down from 0.5. That is the trade and it is the
     right way round: the copy sits still and has a whole leg to be read in,
     while the arrival happens once and cannot be re-read. Nothing moved where
     a scene's COPY peaks, either, and that is not luck: lingerEase(0.5, L) is
     0.5 for every L, so the frame under a fully-opaque title is the same frame
     it was before this pass. Only the speed around it changed.

     Scroll weights were raised on scenes 2, 3, 4, 5 and 9 to take the edge off
     the middles — see world.css, THE WAYMARKERS, which must be recomputed with
     them. Total scroll went 13.6 → 14.3vh, which is 5% and the whole price.

     AND THEN 14.3 → 13.4, WHICH IS NOT A REVERSAL OF THIS. The Aug 2026 cut
     took its 0.9vh out of exactly THREE legs and touched no speaking leg's
     weight: leg 1 (1.5 → 1.3) when the chapter became a title card, leg 6
     (1.8 → 1.4) when it stopped carrying a claim of its own, and leg 8
     (1.6 → 1.3) which is the wordless pull-back. Leg 8 went back up to 1.6 for
     the few hours it had copy on it and came down again with the copy. The
     paragraphs above are still the reasoning behind every number legs 2, 3, 4,
     5, 7 and 9 hold, and they are the reason the cut stopped where it did.

     SEAMS WERE NOT TOUCHED. Trimming one would buy tail back, but every width
     below is a measured, eye-checked property of a joint, and the footage is
     about to be re-rolled — a seam moved for timing reasons would be
     indistinguishable from a seam moved for the new joints. Scene 3 is the one
     leg still short of the others (0.38s of clip lost under the 0.12 seam
     ahead of it, against 0.21–0.27s elsewhere) and it is short for exactly
     that reason. If the re-roll closes the leg 3 → 4 pop, take that seam to
     0.08 and scene 3 comes into line for free. */
  sections: [
    /* THE CHAIN OPENS AT THE GATE, and the Macintosh push-in (leg 0) is not a
       section any more. It was, briefly — an unconditional tenth leg at the
       front of this array — and that was wrong for the one audience the front
       of the chain belongs to: a reader landing on /world directly has never
       seen the hello world machine, so opening on it spent the identical-frame
       idea on someone who had no frame to match. The push-in is the READER
       FROM `/`'s transition, so it now plays on `/` itself: clicking "What I
       do" over the hero runs leg-0.mp4 as a timed take (HomeHero.tsx, THE
       PUSH-IN), which ends on `scene-1-gate.webp` — the exact plate this first
       section opens on, because the clip was generated with `--end-image` set
       to it — and then navigates here. Both entries therefore arrive at the
       gate: the direct visitor at scroll 0 with the disk assembling, the
       reader from `/` on the same frame their click just flew through.

       DO NOT RE-ADD IT HERE. A leg at the front changes the denominator under
       every derived table in world.css (~40 numbers across six tables — THE
       WAYMARKERS has the full list) and shifts every `nth-of-type` index by
       one. That recompute was done once, forward and back, and the round trip
       is recorded in .docs/handoff-home-restructure.md. */
    /* ── THE TITLE CARD ─────────────────────────────────────────────────────
       LEG 1 SPEAKS ONCE AND IT IS NOT A CHAPTER (owner's call, Aug 2026). It
       carries the site's positioning sentence and nothing else: no `label`,
       therefore no eyebrow, no waymarker and no mark disc. What a reader meets
       on the first screen is one statement on a landed pane, the way a book
       opens on a title page rather than on chapter one.

       WHAT WAS CUT, AND WHY IT WAS THE RIGHT ONE TO CUT. The slot held
       `label: "Collaboration"` over "Cross functional by habit, and the people
       side is the part I like." — a good sentence making the one claim every
       designer makes, in the position where it was the first thing a reader
       hit. Cross functional collaboration is assumed of the role; spending the
       opening screen on it spent the walk's best position on its weakest claim.
       The claim is gone from the page, not moved: do not reinstate it further
       down the chain, because the argument against it is about the claim and
       not about the slot.

       THE SENTENCE CAME FROM THE SIGN-OFF, where it had been standing over the
       ending's button as a closing address. It is the site's positioning line
       and it belongs where a reader meets it first. The sign-off got a new
       closing line rather than being left to echo this one (see `sign-off`).

       IT TAKES THE FULL CHAPTER LOCKUP (owner's call): mark, eyebrow, title.

           ●
           LIZZIE TEO

           I'm a product designer.
           I make complicated products simpler to use.

       THE EYEBROW IS THE ROLE, AND THE NAME IS THE MASTHEAD'S JOB. This slot
       was briefly specced as "Lizzie Teo" and that was wrong on a point this
       repo has already settled in writing: FlightNameplate.tsx exists to record
       a cover-line being DELETED from this exact screen for being "the third
       setting of Lizzie Teo on one screen", and SiteHeader is mounted inside
       the flight directly above this pane. An eyebrow carrying the name would
       have reinstated the duplication that file exists to document. The eyebrow
       slot on the title card is for the ROLE; do not re-propose the name.

       IT CARRIES NO `label`, so it gets no waymarker and the rail stays at five
       dots — a stop called "Product designer" would make the title card chapter
       one, which is exactly what it is not.

       THE TITLE LOST ITS FIRST SENTENCE WITH THIS. It read "I'm a product
       designer. I make complicated products simpler to use." and the eyebrow
       now says the first half, in caps, one line above. Two sentences where the
       first is the line above it in longhand is the same fault leg 3 is flagged
       for, at the top of the page. What is left is one sentence, which also
       puts the title card back in the walk's own form: every other pane carries
       exactly one.

       THE MARK IS A CONSIDERED OVERRIDE, and the counter-argument is worth
       reading before anybody reverses it: WorldGlassCard.tsx argues the disc is
       "the one visual signature that says chapter", so a disc here risks making
       the title card read as chapter one — the thing it exists not to be. The
       owner weighed that and wants the mark, on legs 1, 8 and 9 alike. What
       makes it survivable is the RAIL: five dots, none of them lit at this
       point, because the walk has not started. A chapter's furniture over a
       cold rail reads as a beginning rather than as a stop, and the rail is now
       the only thing that distinguishes a chapter from a pane that merely looks
       like one. If that turns out to be too thin a signal, this is the note to
       reopen — and the cheap move is dropping an eyebrow, which takes its mark
       with it.

       ITS TYPESETTING IS THE HOUSE SIZE, NOT A LARGER ONE, and that is measured
       rather than preferred. The copy column's measure is a fixed ratio of the
       title's size (world.css, THE MEASURE), so a bigger title sets on a
       proportionally SHORTER line: the sentence already runs five lines on the
       narrow measure, and a step up takes it to about fifteen characters a line
       and shreds the rag. Growing the panel to hold a wider measure is not a
       type change at all — THE WIDTH COMES FROM THE TITLES, so the panel is the
       film's width at every viewport, and widening it for one pane widens it
       for all nine.

       AND IT IS NOT PROMOTED BY POSITION EITHER. A centred title card was built
       and reverted in the same pass: every pane on this route hangs from the
       same place now, so the reader's eye never has to re-find the type
       (world.css, THE PANE IS ONE COMPOSITION AND NOTHING IN IT EVER MOVES).
       What makes this pane the headline is that it is FIRST and that the
       positioning sentence is on it, not that it is set differently.

       THE WRAP, MEASURED OFF THE SHIPPING FONT (Adventor Bold, −0.02em, the
       title's own values). At 43 characters it is now one of the SHORTEST
       titles on the walk rather than the longest, so the risk this pane used to
       carry — one line widening the glass for all nine — is gone with the first
       sentence. The binding case for both the measure and the phone band's
       line budget is leg 2 (61 characters, five lines at 320px).

       The scene `id` is left alone; nothing reads it (THE IDS ARE HISTORICAL).
       ──────────────────────────────────────────────────────────────────── */
    {
      id: "stakeholders",
      /* NOT a `label`. See the `Section` type: `label` is the trail and this
         pane is not a stop on it.

         SENTENCE CASE IN THE SOURCE, caps on the page: `.sw-copy__eyebrow`
         applies `text-transform: uppercase`, so the source case is only about
         matching its four neighbours in this file. Do not type it in caps here.

         A BLINKING TERMINAL CARET STOOD AFTER IT for part of a day and is gone
         (owner's call). world.css keeps the note where it was drawn, including
         the one thing worth keeping — leg 9's footage draws no caret either, so
         the motif never had a second end. Nothing on this page types itself on,
         and that is a rule rather than a preference:
         .docs/portfolio-strategy.md rules out interactions that delay access to
         information, and the line below is the site's positioning statement on
         the first screen. */
      eyebrow: "Product designer",
      still: `${A}/scene-1-gate.webp`,
      poster: `${A}/leg-1-poster.webp`,
      clip: `${A}/leg-1.mp4`,
      accent: "#B4795C",
      /* ── THE LABEL THIS SLOT USED TO CARRY, kept because a rename argument
         is worth having on file if a label ever comes back here — it will not,
         while this is a title card, and a label would put the title card on the
         trail and give it a chapter's lockup. ────────────────────────────────

         THE LABEL IS THE COMPETENCY, NOT THE AUDIENCE. It was "Stakeholders",
         which named the people in the room rather than the thing being claimed
         — and left the head of the pane naming a noun a designer is not
         hired for. The ask was to say cross-functional collaboration, and the
         label slot cannot hold that phrase: it is one short line above a
         title, and 28 characters of tracked caps there is a second sentence
         rather than a term. So the term goes in the eyebrow and the reach goes
         in the title, which is the division of labour those two already have.
         No hyphen in either half, per the house copy rule.

         THE OLD MEASUREMENT IS DEAD, and it was the binding one for renames:
         the label used to print at 16 → 24px with `white-space: nowrap` across
         a ~15em run, so a long name overran the pane's fore-edge. The eyebrow
         sets at 12px on the copy column's own measure and wraps if it has to.
         The constraint on a rename is now taste, not arithmetic.

         The scene `id` is left alone: nothing reads it, and renaming it would
         churn the waymarker order for no reader-visible gain. */
      /* THE POSITIONING SENTENCE, and it is the owner's line to the word. It
         is the only title on the walk in the FIRST PERSON and the only one that
         is two sentences — a statement and its consequence, which is two moves
         and would make the first a subordinate clause of the second if they
         were run together. Both exceptions are the same fact: this is not a
         chapter title and it does not obey the contents-page form above.

         It stood at the sign-off until Aug 2026 and the argument for it there
         is preserved in that section, because most of it still holds — it says
         the same thing to a reader who has walked the garden and to one who has
         just landed. What changed is that a reader who has just landed now
         meets it first.

         Two earlier lines in this slot, neither to be restored: "Collaborating
         across functions to meet business and user goals." and "Cross
         functional by habit, and the people side is the part I like." */
      /* ── THE POSITIONING SENTENCE, AND IT IS SHORT ON PURPOSE ─────────────
         The owner's standing preference is that hero copy stays SHORT AND PLAIN
         and it holds here unqualified. A longer version was written and cut the
         same day — "I make complicated products simpler to use, with a
         background in user research." — on the reasoning that the research
         background is a differentiating claim worth thirteen words on the
         busiest frame in the piece. It is not restored: the claim can be made
         where there is room to evidence it, and the first screen is not that
         place. The front-loaded form of it ("With a background in user
         research, I make…") is doubly dead, because the ux-writer guidance
         names that exact shape as its worked example of the slow version —
         subject in the first three words, front-loaded subordinate clauses are
         always removable.

         Two earlier lines, neither to be restored: "I'm a product designer. I
         make complicated products simpler to use." (the first half is the
         eyebrow now, one line above, so the sentence was saying it twice) and
         "Cross functional by habit, and the people side is the part I like."
         (the collaboration claim, cut with the chapter).

         ── WHAT IT SETS TO, measured against the shipping font (Adventor Bold,
         −0.02em, the title's own values) on the measure each width gives ────

             320px    258px measure    4 lines
             390px    328px            3 lines
             861px    224px column     4 lines
             1440px   336px            4 lines

         IT DOES NOT SET THE GLASS PANEL'S WIDTH, and that is worth stating
         because this pane was briefly the one at risk of it. The panel is
         `2 × pane-pad + --sw-copy-col`, and the column is a fixed ratio of
         `--sw-title-size` (world.css, THE MEASURE / THE WIDTH COMES FROM THE
         TITLES) — a function of the TYPE SCALE, never of a particular string. A
         longer title takes more LINES, not more width. The binding case for the
         phone band's line budget is leg 2, not this pane.

         LEGIBILITY OVER THE GATE does not bite either: the panel is BESIDE the
         film on desktop and BELOW it on a phone, never over it, so this sets on
         solid paper at 12.6:1 whatever the picture is doing. */
      title: "I make complicated products simpler to use.",
      /* 1.5 → 1.3, AND IT STAYS AT 1.3 NOW THE COPY IS HALF AS LONG, which was
         re-judged rather than left alone.

         THIS LEG'S LENGTH IS NOT SET BY ITS READING TIME. The sentence is at
         full ink on the first frame (world.css, chapter 1 GREETS), so there is
         no arrival to wait for — and the first fifth of the leg is spent on the
         opening morph, the disk going into the slot and the sheet drawing back
         to the panel (WorldGlassCard). What the remaining distance buys is a
         reader taking in a headline, an eyebrow and a CONTROL before the gate
         swings and the pane changes, and that is a looking budget rather than a
         reading one. Cutting it further would shorten the arrival, not the
         reading.

         AND EVERY 0.1 HERE COSTS A FULL RECOMPUTE. Six derived tables and three
         `copyWindow` fraction pairs hang off the weights (world.css, THE
         WAYMARKERS), so a weight is not a dial to nudge — it is changed when
         the leg's JOB changes, which is what took it from 1.5 to 1.3 when the
         chapter became a title card. */
      scroll: 1.3,
      /* House value. The gate swings open on the last beat of this one, so it
         has the same claim on a settled tail as the rest even though it is the
         page's shortest labelled leg. */
      linger: 0.15,
    },
    {
      id: "complexity",
      /* "Complexity" named the difficulty and not what she brings to it, so the
         corner printed the problem rather than the competency. Owner's term is
         "Systems thinking" — the HOW rather than the WHAT. ("Domain depth" was
         the intermediate draft and was two abstract nouns in a set of otherwise
         plain terms.)

         IT IS THE CAPTION ON THE LINE BELOW, and the pair is owner-set: the
         corner prints the competency and the sentence spends its length on the
         evidence, which is the division of labour every scene on this trail
         runs on. */
      label: "Systems thinking",
      still: `${A}/scene-2-maze.webp`,
      poster: `${A}/leg-2-poster.webp`,
      clip: `${A}/leg-2.mp4`,
      accent: "#2F8F5B",
      /* OWNER-SET WORDING, twice over: first restored to its own chapter after
         a spell folded into scene 1's title, then trimmed — it briefly ran on
         to "that meet business and user needs", and the owner cut that clause.
         Rightly: scene 1's title already ends on "business and user goals", so
         the tail said a neighbouring line's words a second time and the claim
         is the years and the complexity, not the needs.

         IT IS THE ONE TITLE IN THE SEVEN THAT IS NOT A GERUND, which was true
         of its earlier form too. It states a span of experience rather than an
         activity, and every gerund of it ("Spending ten years…") reads as an
         apology for the years rather than a claim on them. A contents page
         mixes forms; this is the entry that earns it.

         THE THREE INDUSTRIES ARE GONE FROM IT and that is the owner's line, not
         an edit: it once ended "in health, education and fintech" (and before
         that "health, lending and payments" — do not restore either from an old
         draft). The length went to the claim instead.

         IT HOLDS LONGER THAN ANY OTHER CHAPTER. The reason is in the footage:
         every leg is a take that ENDS on its arrival, so leg 2 spends its middle
         in a blank corridor between two hedge walls and only reaches the maze in
         its final frames. A title on the house window would be at its brightest
         over the corridor and gone by the time the one drawing that MEANS a
         complex system arrives. Its dwell is widened in world.css instead — see
         THE LONG HOLD — which is the only lever that reaches this without
         recomputing five tables or editing the vendored engine. */
      /* ── IT WAS CUT FOR ECHOING THE TITLE CARD ────────────────────────────
         The fault was the running order rather than the sentence. It read "Ten
         years of making complicated products feel easy." — a good line on its
         own, and the second thing a reader met after "I'm a product designer. I
         make complicated products simpler to use." Two panes running,
         "complicated products" and then "complicated products", "feel easy" and
         then "simpler to use". The walk restated itself before it had said
         anything.

         SO THIS SLOT IS PERMANENTLY UNDER THE TITLE CARD'S SHADOW, and that is
         the standing constraint on any rewrite here: leg 1 is the pane every
         chapter after it is read against. IN PARTICULAR, THIS LINE MAY NEVER
         REACH FOR "SIMPLER" OR "SIMPLIFYING" — the title card owns that word.

         ── THE CLAIM IS THE PEOPLE, NOT THE DELIVERABLES ─────────────────────
         "for teams and users" (owner's call, and both words are her own — the
         home hero says "I've designed for users" and "making the process better
         for the whole team", so the line invents no audience it cannot
         support). The point of the range claim is that she has worked BOTH
         SIDES, the internal process work and the end-user journey, and naming
         two groups of people says that harder than naming two artefacts.

         ONE "for" GOVERNING BOTH NOUNS, and no comma before it. Not "for teams
         and for users": the same coordination this file defends on leg 3, where
         a repeated preposition was offered as the stricter parallel and cut
         because one preposition governing a list is ordinary English and the
         second makes the line march. And no comma, because without it the line
         is one continuous phrase rather than a claim with a qualifier appended,
         which is how every other title on the trail is built. Do not "fix"
         either back.

         THREE DEAD VERSIONS, none to be restored: "Ten years of improving
         complex workflows." (the range claim was missing), "…workflows and user
         flows." (the two nouns overlap enough that a reader scans them as one
         claim, so the second read as padding), and "…workflows, for staff and
         for customers." (right structure, wrong vocabulary). Older still: "Ten
         years of experience in designing complex products." — the number is the
         best asset in the set, but "experience in designing" is padding.

         NAMING AUDIENCES IS NOT NAMING INDUSTRIES and does not reopen that
         decision (see the note below): "teams and users" are who the work was
         for, not what sector it was in.

         LENGTH, MEASURED. 61 characters, against 50 for the line it replaces
         and 67 for the title card, which is still the longest on the walk and
         still the case the phone band's line budget is sized against. It sets
         four lines on every desktop width and five at 320px, inside the
         five-line budget, so nothing about the glass moves — THE WIDTH COMES
         FROM THE TITLES is not being spent here. */
      title: "Ten years of improving complex workflows for teams and users.",
      /* THE SAME EXCEPTION THE STYLESHEET MAKES, on the other path. world.css
         widens this one chapter's window to 14.928 → 27.036% of the flight and
         holds it flat across 7 → 93% of that (THE LONG HOLD); browsers without
         scroll-driven animations take the engine's derived window instead, and
         would otherwise get the house curve and a title that stands for a third
         less time than the design calls for.

         FRACTIONS OF THE FLIGHT, not of this leg — the same quantity the CSS
         percentages are written against, so the two tables are comparable by
         eye. The bounds are set by the neighbours rather than by taste: scene 1
         does not clear until 0.14803 and scene 3 opens at 0.27153, and every
         copy pane is absolutely positioned in the same place, so an overlap is
         two titles printed over each other rather than a crossfade. CHANGE BOTH
         OR NEITHER.

         THESE ARE FRACTIONS OF THE WHOLE FLIGHT, SO EVERY WEIGHT CHANGE MOVES
         THEM — including a weight change on a leg nowhere near this one. The
         Aug 2026 cut took the total from 14.3 to 13.4 by shortening legs 1, 6
         and 8, and this pair had to be re-derived even though leg 2 itself was
         not touched. The old values were 0.157 / 0.273.

         THE DERIVATION, so it can be re-run rather than guessed at. Express the
         old window in LEG-LENGTHS of leg 2 and hold those two numbers: it opens
         0.5322 of a leg after leg 2 begins and closes 1.7171 leg-lengths after,
         both measured off the 14.3 table. Re-apply them to leg 2's new bounds
         (9.701 → 20.149% of 13.4) and the window is 15.262 → 27.641%. The maze
         therefore still lands at the same point inside the plateau, which is
         the one property THE LONG HOLD exists to hold, and the neighbours still
         clear by about 0.13 points at each end (chapter 1 is gone at 15.134,
         chapter 3 opens at 27.761).

         THIS IS ONE OF TWO LONG-HOLD CHAPTERS NOW. Section 7 has its own,
         widened for a different reason (it spans two legs); both are written in
         the same units against the same table, and world.css holds the matching
         pair for each. */
      copyWindow: { start: 0.1526, end: 0.2764, hold: [0.07, 0.93] },
      /* 1→2, diff 16.5. The signboard's six words are legible on both sides of
         the joint, so this is a match, not a redraw — a sliver is all it wants.
         (The old 0.03 was for a v3 pair that were two halves of one 10s take;
         these are separately generated legs and need slightly more than an
         encode-difference cover.) */
      seam: 0.06,
    },
    {
      id: "users",
      /* THIS SLOT CHANGED SUBJECT, and the `id` did not (see THE IDS ARE
         HISTORICAL). It was the research chapter — "Finding out how people
         really work before designing anything." — and it is now the making
         chapter: prototyping, across three mediums. Owner's call, and the two
         halves of the ask were split the way this file splits every pair, the
         term in the eyebrow and the reason in the sentence.

         THE RESEARCH CLAIM IS OFF THE WALK ENTIRELY, and this note used to say
         otherwise. It said the claim was not lost, that it had moved to scene 6
         as usability testing where it read as validating rather than
         discovering. That was true until Aug 2026, when scene 6 was silenced
         and the testing claim was cut as something a hiring manager already
         assumes (see `vibe-coder`). Nothing on the walk now claims research or
         testing. That is the decision, not an oversight: the healthdirect case
         study shows two rounds of it, and showing beats claiming.

         "Prototyping" is free to be the label here only because scene 6 gave
         it up; there is exactly one prototyping stop on this trail, and now
         there is no testing stop at all. */
      label: "Prototyping",
      still: `${A}/scene-3-tended-bed.webp`,
      poster: `${A}/leg-3-poster.webp`,
      clip: `${A}/leg-3.mp4`,
      accent: "#D98A9B",
      /* ── OWNER-SET, AND IT NAMES THE TOOL ─────────────────────────────────
         "Claude Code" is deliberate and it is the owner's word. Do not
         generalise it back to "code", "an AI tool" or "AI": naming the tool is
         the claim. Anyone can say they work with AI; saying which one, beside
         paper and Figma as peers, says she has a working practice rather than
         an opinion. The full stop is the house pattern; every title on this
         trail carries one.

         ── IT REPEATS ITS OWN LABEL, AND THAT IS THE OPEN QUESTION ───────────
         The eyebrow above this sentence reads PROTOTYPING and the sentence
         opens on "Prototyping", so the lockup prints the word twice, two lines
         apart, at two sizes. Every other chapter on the walk keeps the file's
         division of labour — the eyebrow holds the term, the sentence spends
         its length on the evidence (see the header, A title should not merely
         restate its own label) — and this one does not.

         THE ONE-STRING ALTERNATIVE, which keeps every word the owner chose and
         only drops the duplicate:

             "On paper, in Claude Code or in Figma."

         It reads as the eyebrow's own continuation, which is what the lockup
         is: PROTOTYPING / On paper, in Claude Code or in Figma. The cost is
         that it does not stand alone — lift it out of the pane and it is a
         fragment — where the owner's line is a complete thought anywhere. That
         is the trade, and the owner is deciding it on screen. Swap the string
         and nothing else moves; both fit the measure at every width.

         ── EARLIER LINES IN THIS SLOT, none to be restored ───────────────────
         "Drawing it on paper, building it in Figma, then prompting it into
         code." — the line this replaced, at 71 characters the longest on the
         walk and the one the copy column's measure used to be derived against
         (world.css, THE MEASURE). "Designing on paper, canvas and in code." —
         "canvas" is Figma jargon a hiring manager has to decode, and "in code"
         could be misread as a claim to be a software engineer. "Vibe coding a
         design until it can be used rather than looked at." — the term is off
         the page and the method has scene 5 to live under.

         AND THE GRAMMAR NOTE THAT OUTLIVED ALL OF THEM: a repeated "on" before
         each noun was once offered as the stricter parallel and the owner cut
         it, because one preposition governing a list is ordinary English and
         the repetition made the line march. The alternative above keeps the
         repetition on purpose, since there it is doing a different job — "in
         Claude Code or in Figma" separates two tools that are not the same kind
         of thing. Do not "fix" either back. */
      title: "Prototyping with paper, Claude Code or Figma.",
      /* 1.5 → 1.7, the second-largest bump on the page, and the 0.12 seam in
         front of it is the reason. That joint is owned by scene 4 and is the
         one width deliberately set above its measurement, so scene 3's tail
         gets dissolved earlier in clip time than anyone else's. Scroll is the
         only lever that reaches it without reopening a measured joint: a wider
         leg makes the same seam a smaller fraction of the clip. This is a
         substantial chapter and can carry the length on its own merits. */
      scroll: 1.7,
      /* Below the house 0.15 with scene 7: the bed is still being tended in
         the closing frames, so the last second must run at reading speed. */
      linger: 0.1,
      /* 2→3, diff 18.0. Matches. The v3 mismatch this used to carry 0.22 for —
         foliage present on one side and gone on the other, ribbon changing
         colour across the cut — is not in v4's footage at all. */
      seam: 0.08,
    },
    {
      id: "design-systems",
      label: "Design systems",
      still: `${A}/scene-4-nursery.webp`,
      poster: `${A}/leg-4-poster.webp`,
      clip: `${A}/leg-4.mp4`,
      accent: "#7E997E",
      /* ATOMIC IS IN THE SENTENCE, NOT THE CORNER. The ask for this slot was
         "atomic design system and design engineering", which is two competencies
         and this trail prints one per stop. They are also two chapters that
         already exist: the system is built here, and the engineering half is
         what scene 5 has always been about — so "Design engineering" went there
         (see figma-to-code) rather than being crammed into a label beside this
         one. Nothing about that pairing is arbitrary: a label naming design
         engineering here would make the very next stop read as a subset of it.

         "Atomic design systems" as a label was measured and rejected: 21
         characters, and the current arithmetic puts it at 15.50em — 217px at
         the eyebrow's 14px against the 224px column a 861px desktop window
         gives. It is the last length that fits on one line at every width, and
         it fits with 7px in hand, which is a label with no margin left.

         THE REJECTION STANDS BUT THE CEILING NO LONGER BINDS ABSOLUTELY. When
         it was made, the label printed at 16 → 24px with `white-space: nowrap`
         and overrunning meant running off the pane's fore-edge. The label is a
         12 → 14px eyebrow on the copy column's own measure now and it WRAPS, so
         a longer one costs a second line rather than a broken layout — which is
         exactly the trade leg 5 makes at 24 characters (see there for the
         measured table and the widths where it wraps). Read 21 as "the longest
         label that never wraps", not as "the longest label allowed". */
      title: "Building atomic design systems a team can run without me.",
      /* 1.6 → 1.7. This leg lost the most mid-scene stillness in the tail pass
         (linger 0.4 → 0.15) and it is the one whose title asks the reader to
         hold a whole sentence about a team, so it gets the slack back as
         distance rather than as curve. */
      scroll: 1.7,
      linger: 0.15,
      /* 3→4, diff 20.1, and the only remaining pop in the piece: the scene
         matches, but leg 3 renders the tended bed WITHOUT the hand and the
         feather quill and leg 4 opens with both present. This is the one seam
         set above its measurement — wide enough to ramp the arrival instead of
         stepping it. The real fix is a leg 3 re-roll that stages the hand as
         uncovered by the camera's own movement (the staging that fixed leg 7's
         moon); it costs 12.5 credits and is not guaranteed, so try the eye on
         this first. */
      seam: 0.12,
    },
    {
      id: "figma-to-code",
      /* ── THE LABEL NAMES THE GAP, NOT THE DISCIPLINE ─────────────────────
         "Bridging design & code" (owner's call, Aug 2026), replacing "Design
         engineering". Sentence case, no full stop: that is the trail's form for
         every label, and only titles carry a stop. The owner wrote it title
         cased; it is set to match its neighbours.

         THE AMPERSAND IS THIS LABEL'S ALONE AND IS NOT A HOUSE CONVENTION. It
         read "and" first; the owner's call replaced it. No other label on the
         trail carries a conjunction, so there is nothing for it to be
         inconsistent with — and nothing to go and make consistent either. Do
         not substitute ampersands elsewhere on the strength of this one.

         IT IS UNCHANGED FOR A SCREEN READER, which is why the swap costs
         nothing at the accessibility layer: this string is the trail dot's
         accessible name as well as the eyebrow, and "&" is announced as "and".
         What a non-visual reader hears is identical before and after.

         IT IMPROVES THE PAIRING. The title is about handing off to an engineer
         or an AI, which is a GAP being crossed; "Design engineering" named a
         discipline and left the sentence to explain what the discipline was
         for. The new label names the same thing the sentence does and the
         sentence supplies the evidence, which is this trail's division of
         labour rather than an exception to it.

         Before that, "Figma to code" named the FILES rather than the practice.

         ── AND IT IS STILL THE LONGEST LABEL THE TRAIL HAS CARRIED: 22 ──────
         Measured off the shipping font rather than estimated, at the eyebrow's
         own values (Adventor Bold, 14px, 0.16em tracking, uppercase):

             BRIDGING DESIGN & CODE     16.32em   228.5px   (live)
             BRIDGING DESIGN AND CODE   18.14em   254.0px   (the "and" version)
             ATOMIC DESIGN SYSTEMS      15.50em   217.0px   (rejected, leg 4)
             DESIGN ENGINEERING         13.36em   187.0px   (what it replaced)
             SYSTEMS THINKING           11.46em   160.4px   (next longest live)

         THE AMPERSAND BOUGHT 25.5px, which is most of the problem the "and"
         version had. The eyebrow sets on the copy column, which on desktop is
         `--sw-title-size × 9.33` and on a phone is the band inset from both
         walls:

             320px phone     258px measure   fits, by about 30px
             390px and up    ≥ 328px         fits
             861px desktop   224px column    wraps, by about 5px
             ~883px          228px column    the crossover
             1024px and up   ≥ 258px         fits

         So it is one line everywhere except desktop windows between 861 and
         about 883px — a 22px band, against the 156px the "and" version wrapped
         across. That is structurally safe either way (the lockup grows downward
         into a column with room, and this chapter's title is three lines
         against a five-line budget), and at 22px wide it is close enough to the
         floor to be a curiosity rather than a taste call.

         THE OLD CEILING WAS REAL AND IS NOW EXCEEDED ON PURPOSE. Leg 4's note
         records "Atomic design systems" measured and rejected at 21 characters;
         that number holds — 217px against the 224px column is the last length
         that never wraps — and this is one character past it. Do not read the
         rejection as stale. What is stale is the reason it was binding: the
         label used to print at 16 → 24px with `white-space: nowrap`, where
         overrunning meant running off the pane's fore-edge with nowhere to go.
         The eyebrow wraps, so the consequence of going longer is now a
         two-line label rather than a broken one.

         THE OTHER SURFACE IS THE TRAIL'S HOVER PREVIEW (`.sw-route__label`),
         which shares these type values and did NOT wrap — it was `nowrap`, so
         the "and" version ran about 30px past the panel's right edge onto the
         film at 861px. world.css lets it wrap inside the column now.

         THAT FIX STAYS EVEN THOUGH THIS LABEL BARELY NEEDS IT. The ampersand
         brings the preview to 228.5px against a 224px column, so it still
         overruns at 861 — by 5px rather than 30 — and fits everywhere from
         883px up. The wrap is not a patch for this string: it is the correct
         behaviour for any label longer than the narrowest column, and reverting
         it would leave the next long label to rediscover the same bug against
         the film. */
      label: "Bridging design & code",
      still: `${A}/scene-5-crossing.webp`,
      poster: `${A}/leg-5-poster.webp`,
      clip: `${A}/leg-5.mp4`,
      accent: "#7FA3C8",
      /* ── IT WAS SILENCED AND THE OWNER REVERSED IT, Aug 2026 ──────────────
         This chapter was cut in the same pass that silenced leg 6, on OVERLAP
         grounds: leg 3 already says "prompting it into code" and leg 4 already
         says "a team can run without me", so a handover claim between them
         looked like the third telling of one idea and the picture could carry
         the leg alone.

         THE OWNER'S JUDGMENT IS THAT IT IS THE LEAST ASSUMABLE CLAIM ON THE
         WALK. A hiring manager assumes a designer collaborates and assumes a
         designer tests; nobody assumes files an engineer OR AN AI can build
         from, and in this market that is the scarce thing. The overlap reading
         was also too coarse: legs 4 and 5 are a SYSTEM and a HANDOVER, which a
         reader distinguishes without help — one is what gets built, the other
         is what gets given to whoever builds it.

         SO IT KEEPS ITS LABEL, ITS TITLE AND A SPEAKING LEG'S WEIGHT. It is
         back on `diveScroll` (1.4) rather than the 0.8 a silent leg would have
         taken. Recorded rather than quietly restored, because this file's
         discipline is to write down the positions it has moved through — the
         cut was reasoned and it was wrong, and the reasoning that beat it is
         about what a reader already assumes, not about repetition. */
      title: "Handing over files an engineer or an AI can build from.",
      /* 4→5, diff 15.2. Near-identical. */
      seam: 0.06,
    },
    {
      id: "vibe-coder",
      /* NO SECOND PROTOTYPING STOP. This slot held prototyping until scene 3
         took the subject, and two stops on one trail printing the same word is
         the doubling the owner asked to remove — the label is the term scanned
         out of the corner and a term that appears twice tells a reader the walk
         has stalled rather than moved.

         SO IT TAKES THE CLAIM SCENE 3 DISPLACED, turned to face the other way.
         Research at position 3 was discovery ("before designing anything");
         here, after the prototype and the handover, the same competency is
         validation — watching people use the thing and changing it. That is a
         real chapter of this body of work rather than a slot filler: the
         healthdirect case study is two rounds of it.

         "Usability testing" over "Research" because the trail already implies
         the discovery end at scenes 1 and 2, and because a specific method is
         what a hiring manager scans for. 17 characters, inside the run.

         THE ASSUMPTION IS THE SUBJECT, NOT THE WORDING. The owner asked for a
         different caption here and did not say what the chapter should become;
         this is the reading that loses nothing off the page. If scene 6 should
         be about something else, this is the entry to rewrite.

         ── AND THE ANSWER WAS THAT IT SHOULD BE ABOUT NOTHING (owner's call,
         Aug 2026). THE SLOT IS SILENT. No `label`, no `title`; the dusk bloom
         plays and this section says nothing of its own.

         IT IS NOT AN EMPTY PANE, THOUGH, and that distinction is the whole
         design of this leg. Chapter 7's sentence is held across legs 6 and 7 as
         one long chapter (THE PAIR, in the file header), so what stands on the
         glass here is "Taking a product from the first sketch to the shipped
         screen." — a claim about the whole arc, standing over two scenes of
         travel. Silencing this SECTION and leaving the PANE empty are two
         different things, and only the first was wanted.

         WHY THE TESTING CLAIM WENT. Watching people use a design is TABLE
         STAKES for the role. A hiring manager assumes it before reading a word,
         so a chapter claiming it spends a leg of a fourteen-viewport film — the
         page's scarcest resource — telling somebody a thing they had already
         granted. The evidence for it is not lost and was never on this pane:
         the healthdirect case study is two rounds of usability testing SHOWN,
         which is the only form of that claim worth a reader's time.

         THE PICTURE STAYS AND THAT IS THE POINT. Silencing is not deletion —
         the section keeps its still, its clip, its linger and its measured
         seams on both sides, and the reader still passes under the bridge and
         into the bloom. What changes is that the leg stops being a STOP of its
         own and becomes the first half of the one before the ending.

         AND THE CLAIM WAS NOT PUT BACK TO FILL THE PANE. That was considered
         when the empty-glass problem surfaced and it was rejected: usability
         testing is the weakest claim on the walk and the footage does not show
         it, so restoring it would be making a claim for a layout reason. If
         anything ever stands on this leg again it has to earn the leg.

         THE THREE NOTES ABOVE ARE KEPT ON PURPOSE. They are the record of this
         slot changing subject twice — prototyping, then usability testing — and
         they are the reasoning anybody would need if a claim ever comes back
         here. It should not come back as a restoration; it should come back as
         a decision, and the bar is the one this cut set: is it a thing a hiring
         manager already assumes? ─────────────────────────────────────────── */
      still: `${A}/scene-6-dusk-bloom.webp`,
      poster: `${A}/leg-6-poster.webp`,
      clip: `${A}/leg-6.mp4`,
      accent: "#8F7BB8",
      /* 1.8 → 1.4, THE WALK'S DEFAULT, and 1.8 was the joint-longest leg on the
         page. What 1.8 bought was a slow middle under THIS leg's own sentence,
         and there is no longer one; what the leg still has to do is be read
         across, because chapter 7's title rises here (THE PAIR). So it comes
         down to `diveScroll` — the length a leg gets when it has no special
         claim on distance — rather than to the travel weight a genuinely
         wordless leg takes. Leg 8, which has no words at all, is the
         comparison: it is 1.3 and it is shorter for a reason this leg does not
         have.

         IT WAS BRIEFLY 0.9, while this leg was going to be silent AND empty,
         and the empty pane is what killed that plan. Recorded because 0.9 is
         the number to go back to if the pane is ever allowed to be film alone
         (the open alternative in THE PAIR) — at that point this is travel and
         it should pace like travel.

         THE PAIR PACES AS ONE CHAPTER: 1.4 + 1.8 = 3.2vh under one sentence.
         That is about 1.7 times any other chapter's dwell, which is the point
         rather than an overshoot — it is the only line on the walk making a
         claim about DISTANCE, and it is given the distance to make it in. */
      scroll: 1.4,
      /* The biggest single cut on the page: 0.5 → house 0.15. At 0.5 this
         scene ran its middle at half speed and its last frames at double, so
         the dusk bloom opened out of a near-standstill and then snapped shut.

         UNCHANGED BY THE SILENCING, deliberately. `linger` remaps scroll to
         clip time inside the leg and does not care whether there is a caption
         over it, and the house value is what makes the bloom open at a steady
         rate. Halving the leg already doubles how fast the whole clip plays per
         pixel of scroll; bending the curve on top of that would whip the
         arrival, which is the exact fault the tail pass was written to fix. */
      linger: 0.15,
      /* 5→6, diff 16.9, with a small scale step on the bridge. This was the
         widest seam on the page at 0.26 and the one joint code could not fix:
         v3 put a full pale day on one side of it and a dithered night sky on
         the other. The day/night inversion is gone, so the seam is ordinary
         again. Do not put it back. */
      seam: 0.08,
    },
    {
      id: "makers-table",
      label: "Start to finish",
      still: `${A}/scene-7-gazebo.webp`,
      poster: `${A}/leg-7-poster.webp`,
      clip: `${A}/leg-7.mp4`,
      accent: "#C68A5A",
      /* THE TITLE IS BACK ON ITS OWN CHAPTER, and it must stay here. It was
         moved to the sign-off for a while, on the reasoning that it is the one
         line describing the whole walk rather than a single competency and so
         belonged with the buttons. What that actually produced was the label
         and the claim living TWO VIEWPORTS APART: leg 7 printed "Start to
         finish" into the corner with no sentence anywhere on the pane, and the
         sign-off showed the sentence with no caption, because the ending's
         waymarkers are removed and nothing prints a name there. Enlarging the
         caption made that obvious; it was wrong before that too. The label and
         the title are one scene's two halves — the term a hiring manager scans
         the corner for, and what it means — and they are only legible as a pair
         when they are on screen together. The buttons do not come here with
         them: they wait at the end of the walk (THE ENDING).

         THE SIGN-OFF HAVING ITS OWN LINE NOW IS NOT A REOPENING OF THIS. What
         stands there is a closing address in the first person with no label
         beside it and nothing to caption; what belongs here is a chapter's
         claim with its label printed in the corner. Two different jobs, and the
         failure recorded above was moving THIS one, not writing that one.

         ── THE THIRD POSITION ON THIS TITLE, AND IT IS THE CLOSED ONE ────────
         It has been here, then at the sign-off, then here again, and the Aug
         2026 cut proposed silencing the whole chapter. It is NOT silenced, and
         the question is settled rather than parked.

         The proposal to cut it was made when this title collided with the old
         sign-off sentence — both were about the span of the work, one under the
         other's shadow two viewports apart. That sentence has moved to leg 1
         and become the title card, so the collision it was cut for does not
         exist any more. Cutting it now would remove a claim for a reason that
         has already been fixed by something else.

         AND IT IS WHAT KEEPS THE TAIL FROM GOING QUIET. With leg 6 silent and
         leg 8's pull-back wordless, silencing this one would leave three
         consecutive legs with nothing on the pane — a third of the walk in
         which the reader is shown a great deal and told nothing, arriving at a
         button. This chapter between the bloom and the reveal is what makes the
         ending read as an ending rather than as the film running out, and it is
         also what earns leg 8 its silence: one empty pane after five speaking
         ones is a breath, three in a row is the piece trailing off.

         So the position on this title is: it lives on its own chapter, it is
         the last claim about the work, and it stays speaking. Three positions
         are enough. */
      /* ── "DISCOVERY", NOT "THE FIRST SKETCH" ─────────────────────────────
         The line claims START TO FINISH, so it has to name the actual start,
         and a sketch is not where a product begins — discovery is. That is the
         first reason and it is the plain one.

         THE SECOND IS THAT IT PUTS THE RESEARCH SIGNAL BACK ON THE WALK. The
         usability testing chapter was cut from leg 6 as something a hiring
         manager already assumes, and a research clause was drafted onto leg 1's
         title card and removed for length. This word carries the signal inside
         the arc claim rather than as a separate credential, which is the better
         home for it: it is the one word on the walk that says she starts before
         the drawing does. If a future edit reaches for it, that is why.

         THE TENSION, NOTED AND ACCEPTED: "discovery" is a PHASE NAME where "the
         first sketch" was a thing a reader can picture, and the house guidance
         prefers the concrete noun. It is allowed here because the readers who
         scan this line are design leads and hiring managers, and the gain in
         accuracy is worth more than the loss in picturability. Do not "fix" it
         back to a concrete noun.

         It is also two characters shorter than what it replaced, which this
         chapter can spend: it is one of the two longest titles on the walk and
         the phone band's line budget is measured against the pair. */
      title: "Taking a product from discovery to the shipped screen.",
      /* ══ THIS SENTENCE SPANS TWO LEGS ═══════════════════════════════════
         It rises during leg 6 and stands through the whole of leg 7, so legs 6
         and 7 are ONE CHAPTER over two scenes. Owner's call, Aug 2026, and it
         has two reasons that arrive at the same place.

         THE PROBLEM IT SOLVES. Leg 6 was silenced and silencing a leg does not
         remove the glass — the panel is a standing object, so what a silent leg
         in the middle of the walk actually produces is a PANE WITH NOTHING IN
         IT. That is right at leg 8, where the emptiness is the pull-back's
         content, and it reads as a hole here (THE PAIR, file header).

         THE REASON IT IS THIS SENTENCE. Every other title names a competency
         and lands on the landmark that shows it — the maze, the bed, the grid
         of beds, the crossing. This one names the whole ARC, first sketch to
         shipped screen, so its subject is not a landmark at all, it is the
         DISTANCE. It is the one line on the walk that gets better with two legs
         under it rather than merely tolerating them. A shuffle would have moved
         some other sentence onto leg 6; a span is the only version of this that
         is an improvement rather than a patch.

         ── THE WINDOW, AND IT IS THE HOUSE FORMULA STRETCHED, NOT INVENTED ───
         Fractions of the WHOLE FLIGHT, like leg 2's (see there for why the unit
         is what it is and for the CHANGE BOTH OR NEITHER rule — world.css holds
         the matching range and the two must always agree).

         Derivation, in one line each:

           start = 60% of leg SIX   = 7.5 + 0.6 × 1.4  = 8.34   → 0.6224
           end   = 52% of leg EIGHT = 10.7 + 0.52 × 1.3 = 11.376 → 0.8490

         Both are the standard phasing (THE CHAPTER HOLDS: rise at 60% of your
         own leg, leave at 52% of the next) with the chapter's "own leg" read as
         the PAIR rather than as leg 7. Nothing here is hand-tuned, which is why
         it is written as arithmetic — re-run the two lines against any new
         weights and the window is correct by construction.

         THE BOUNDARIES CLEAR. Chapter 5 is gone at 60.058% and this opens at
         62.239%; leg 8 is wordless and prints nothing, and the sign-off opens
         at 89.552%. Every copy pane is absolutely positioned in the same place, so
         an overlap is two titles printed over each other rather than a
         crossfade — the 0.8 points at the head is the same breath the walk
         leaves between every other pair of chapters.

         THE HOLD IS 7/93, SHARED WITH LEG 2 and for the same reason: the window
         is much wider than a chapter's, so the house 13/87 would spend a third
         of a viewport fading at each end. It is the one keyframe set both long
         chapters use (world.css, THE LONG HOLD). */
      copyWindow: { start: 0.6224, end: 0.849, hold: [0.07, 0.93] },
      /* UNCHANGED AT 1.8 through the Aug 2026 cut, which reduced legs 1, 6 and
         8 and touched no speaking leg. The pair it now heads runs 1.4 + 1.8. */
      scroll: 1.8,
      /* 0.1, AND THE BUTTERFLY IS STILL WHY. Leg 7's butterfly makes its one
         legible pass in the clip's final frames — the diagnosis that turned
         into the page-wide tail budget above. 0.3 was the first pass at it and
         still ran those frames at 1.6×; at 0.1 they run at 1.2× and the last
         second gets 0.26vh of scroll, joint-widest on the page with scene 6.
         This is the floor, not a candidate for going lower: the 7→8 seam is
         the tightest joint here and wants the outgoing frame to still be
         travelling as it dissolves. */
      linger: 0.1,
      /* 6→7, diff 12.4 — the tightest joint on the project, where v3's was the
         loosest at 0.28. v4 stages the moon as a camera reveal rather than
         cutting to a sky that has one, which closed the hue step as well as the
         pop. A wide seam here would now be a double exposure of a matching
         frame. */
      seam: 0.06,
    },
    /* ── THE ENDING ─────────────────────────────────────────────────────────
       No label on either of these, so neither takes a waymarker — both are
       removed in world.css, see the note in the file header. That half is
       permanent: a label here would put the ending on the trail and make it
       chapter six.

       THEY ARE NO LONGER THE ONLY UNLABELLED SECTIONS. Leg 1 is a title card
       and leg 6 is silent as of Aug 2026, so four of the nine carry no `label`
       — but only these two are THE ENDING, and the reason is the running order
       rather than the absence of a word. The pull-back and the sign-off are
       where the walk stops; the other two are inside it.

       THEY STILL DIFFER ON WORDS. Section 8 (the pull-back) is WORDLESS, and
       the argument is its own section's and is in force: it is the move that
       reframes the garden as a screen, and a sentence over it would be read
       instead of the reveal. Copy was put on it for part of a day in Aug 2026
       and removed; that record is kept there so the ground is not walked a
       third time. Section 9 is where the walk stops and hands the reader on,
       and it carries the only lockup at this end of the piece.

       NEITHER CARRIES A `cta`. No section does: the walk has one button and it
       is the standing control at the foot of every pane (NO `cta`, AND THE
       ENDING STILL HAS ITS BUTTON). */
    {
      id: "reveal",
      still: `${A}/scene-8-resolve.webp`,
      poster: `${A}/leg-8-poster.webp`,
      clip: `${A}/leg-8.mp4`,
      /* Graphite: the world is turning back into paper and a scene accent would
         be the last thing still insisting the garden is a place. It only paints
         the traveller on the trail. */
      accent: "#7C7A74",
      /* ══ THE PULL BACK IS WORDLESS, AND THAT IS THE WHOLE OF IT ═════════
         Nothing prints on this pane. No `label`, no `eyebrow`, no `title`, and
         therefore no waymarker and no mark disc — the two derived pieces of
         furniture switch themselves off (see the `Section` type). It is the one
         leg on the walk with an empty pane, and it is the leg that most earns
         one.

         THE REASON, IN FORCE AND NOT AS HISTORY: this is THE MOVE THAT REFRAMES
         THE WHOLE GARDEN AS A SCREEN. Every leg before it has been a place; on
         this one the camera pulls back until the place turns out to be the
         display of a small machine standing on bare paper. That reveal is the
         content. A sentence standing over it would be READ INSTEAD OF WATCHED —
         the reader's eye goes to type before it goes to a picture, and the one
         picture on this page that cannot survive being second is this one.

         IT IS ALSO WHAT GIVES THE ENDING ITS SHAPE. Five chapters of claims,
         then a leg with nothing on it, then the sign-off. The silence is the
         breath before the last pane; without it the walk arrives at its button
         still talking.

         ── COPY WAS PUT HERE AND TAKEN BACK OFF, Aug 2026, and the ground is
         worth marking so nobody walks it a third time ───────────────────────
         For part of one day this section carried a full lockup: a mark with a
         `book-open` glyph, the eyebrow "Still going", and "I keep learning what
         AI is changing about design." It was tried in two timings — arriving
         LATE on the settled frame, which satisfied the objection above by
         staying out of the reveal's way, and then arriving EARLY on the house
         curve, which did not. The owner removed all of it. The line's claim is
         not homeless: nothing on the walk says it now, and that is the
         decision.

         ONE MEASUREMENT SURVIVES and is worth keeping, because it is the only
         hard data anybody has about this leg's timing. leg-8.mp4 was measured
         frame by frame — 121 frames at 24fps, per-frame mean absolute
         difference from the LAST frame, which expresses the whole camera move
         as one number (107.75 at frame 0, 0 at the end):

             clip 50%   d=40.8   62% of the travel done, moving 6.9/frame
             clip 59%   d=29.7   73% done,               moving 5.1/frame
             clip 67%   d=21.4   80% done,               moving 3.1/frame
             clip 75%   d=16.6   85% done,               moving 2.4/frame
             clip 90%   d=5.7    95% done,               moving 0.9/frame

         THERE IS NO HARD STOP. It is an asymptotic ease-out that creeps to the
         final frame, so "the settled frame" is not a moment this footage has —
         which is why the late timing could never fully honour the objection
         either. Four fifths of the travel is done by clip 67% and the rest runs
         at under a third of peak speed. Anyone proposing copy here again should
         read that table first and then read the paragraph above it.

         AND IT COSTS NO EXPLICIT WINDOW. The `copyWindow` this section briefly
         carried is gone with the copy: an empty article needs no boundary
         guard, because there is nothing on it to collide with the sign-off's
         line. The walk is back to TWO explicit windows, leg 2's long hold and
         the legs 6+7 span, and both of those are timing decisions rather than
         guards. */
      /* 1.3. It was 1.6 for most of this route's life, cut to 1.3 in the Aug
         2026 retiming on the rule that a leg with nothing on its pane is TRAVEL
         and does not need a speaking leg's distance, and put back to 1.6 for
         the few hours it had a line — a line can only have a leg's tail, and
         1.3 left it a third of a screen. The line is gone, so the rule applies
         again and so does the number.

         IT IS NOT CUT FURTHER, and the footage is the reason rather than a
         hedge. Leg 6, the other leg with nothing of its own, is 1.4 because it
         is read across; this one is 1.3 because it is watched. A reveal hurried
         is a reveal missed, and this is the last thing a reader sees before the
         ending. Do not take it below about 1.2: the pull-back's own arrival
         lands in the clip's final frames like every other leg's, and under that
         it stops being a passage and starts being a cut. */
      scroll: 1.3,
      /* House value. The final beat here is the pull-back completing — the
         garden turning out to be a screen — and it is the last thing the
         reader sees before the sign-off, so it cannot be the one that gets
         hurried. */
      linger: 0.15,
      /* 7→8, diff 22.6 — the worst NUMBER on the project and a close visual
         match, which is exactly the trap §4 of the handoff warns about. Judged
         by eye, it is an ordinary joint. */
      seam: 0.08,
    },
    {
      id: "sign-off",
      still: `${A}/scene-9-hello-world.webp`,
      poster: `${A}/leg-9-poster.webp`,
      clip: `${A}/leg-9.mp4`,
      /* The path green the route has been drawn in since the gate, arriving at
         the end of the line it started. */
      accent: "#2F8F5B",
      /* 1.2 → 1.4. THE OLD NUMBER WAS SET AGAINST A CLAIM THAT IS NOT TRUE OF
         THE FOOTAGE: the note here used to say the camera is locked off and
         the lettering is fully settled by about 1.6s of the 5s clip, so most
         of the leg rested on a finished frame and the length was mostly there
         to give the CTA somewhere to stand still. It never was, and it is not
         true of the re-shot clip either (THE SEAM WAS THE REASON, below): the
         screen holds the garden past 0.8s and the line is not finished until
         3.67s, so the writing runs three quarters of the leg. This is not the
         page's longest pause, it is the page's LONGEST CONTINUOUS BEAT, and it
         was the shortest leg carrying it.

         So it gets the same treatment as every other late-landing scene: more
         distance and the low linger. The CTA is unaffected — it reaches full
         opacity at 20% of the leg either way (world.css, THE CHAPTER HOLDS),
         so it is on screen and clickable for the whole of the writing. */
      scroll: 1.4,
      /* 0.5 → 0.1, the largest correction on the page and the only one made in
         the opposite direction from the rest. Nothing dissolves this scene's
         tail (no successor, so no seam), which is exactly why the 0.5 survived
         earlier passes — there was no visible cut to blame. But `lingerEase`
         runs both ends fast, and on a clip whose action never stops, both ends
         being fast means the word is written in a rush, crawls through its own
         middle, and is rushed again at the finish. At 0.1 the whole line is
         written at close to one steady rate. */
      linger: 0.1,
      /* ── THE SEAM WAS THE REASON THIS LEG WAS RE-SHOT ──────────────────────
         8→9, diff 18.9, and the number was the only thing here that was fine.
         This note used to read "near-identical — same machine, same angle,
         screen content the only difference", which described what the two
         clips were SUPPOSED to be. Put leg 8's last frame beside leg 9's first
         and the machine is drawn a size larger and lower, the case and bezel
         are relit, the cable leaves at a different angle, and the picture
         inside the screen is a different gazebo entirely — a wide exterior on
         one side, an interior with a moon and a laptop on the other. Across a
         0.06 seam that reads as a ghost: the whole machine slides while the
         picture inside it swaps. Two clips generated from the same scene still
         are not two ends of one shot, and no number in this file could have
         fixed it — a wider seam only lengthens the double exposure.

         So leg-9.mp4 was regenerated from leg 8's EXACT FINAL FRAME as the
         start image (Seedance 2.0, image-to-video, 21:9, with an end frame
         edited off that same still so the lettering had a target to land on).
         The incoming frame now IS the outgoing one and the dissolve has
         nothing left to move. THE CONSTRAINT SURVIVES THIS FILE: whatever
         regenerates either leg has to re-establish it — leg 9 starts on the
         frame leg 8 stops on, or this joint breaks again.

         LEG 9 IS NOT RAW FOOTAGE. Matching the first frame was not enough:
         the generated clip drew its own paper, measured against leg 8's last
         frame as ~10 levels darker on every channel, 4 points warmer on R−B,
         and 1.8× the grain amplitude. Read as a warm cast and a coarser
         texture arriving with the last scene, which is the wrong moment on the
         page to change stock. Denoising could not fix it — the extra texture
         is mottling at a coarse scale, not fine noise, so hqdn3d took the ink
         with it and still only moved grain sd 4.18 → 3.79 at full strength.

         What ships instead is a HELD CEL: leg 8's final frame is the plate for
         all 121 frames and only the CRT glass animates, the way a hand-drawn
         scene holds its background and animates one layer. The glass mask was
         derived from the footage rather than hand-placed — the camera is
         locked (0.97 SSIM across the keyboard band, first frame to last), so
         thresholding max |frame_n − frame_0| finds exactly the glass and
         nothing else. Each generated frame is level-matched to the plate
         before it goes in the hole (per-channel, per-frame, multiplicative, so
         the paper lifts ~13 levels and the ink ~2). Result: paper colour and
         grain are leg 8's BY IDENTITY rather than by correction, and constant
         for the whole leg — 232.6/218.4/207.3, R−B 25.3, grain sd 2.33,
         against leg 8's 234.1/219.7/208.6, R−B 25.5, sd 2.37.

         SO A RE-SHOOT ALONE DOES NOT REPLACE THIS FILE. Dropping fresh
         footage in as leg-9.mp4 brings back the paper it was generated with.
         Either re-do the composite, or prove the new clip's paper matches leg
         8's on both numbers first.

         The stills are untouched and did not have the fault: scene-8-resolve
         and scene-9-hello-world are one drawing with two screens, so stills
         mode (reduced motion, data saver) always crossed this joint cleanly.
         It was the footage that drifted away from them. */
      seam: 0.06,
      /* ── THE ENDING, AND IT IS A HERO RATHER THAN A FAREWELL ─────────────
         The walk comes to rest here and does not move again. The film holds its
         last frame, the sentence and the button stand beside it, and ordinary
         scrolling carries on past the whole thing into Selected work — so the
         final beat of the flight IS the home page's hero, and it has to work as
         one for somebody who arrives already scrolled, or with no JavaScript, or
         with reduced motion. Every one of those readers meets a finished machine
         that has written `hello world` and a set of bands they can reach.

         THE COPY CHANGED WITH THE ARRANGEMENT. It read "That's what I do. I'd
         love to hear what you're working on." — a close and an invitation, which
         is right after fourteen viewports because "that" refers to everything
         just seen, and wrong for anything that has to stand on its own. It was
         replaced by the positioning statement, "I'm a product designer. I make
         complicated products simpler to use.", on the reasoning below: a
         statement rather than a farewell, saying the same thing to a reader who
         has walked the garden and to one who has just landed on it.

         ── AND THAT SENTENCE HAS GONE TO THE FRONT (owner's call, Aug 2026) ───
         It is leg 1's title card now. The whole argument above was that the
         positioning line works for a reader who has just landed — and a reader
         who has just landed is looking at leg 1, not at leg 9. Standing the
         site's positioning statement at the END of a twelve-viewport film was
         asking every reader to scroll to the bottom to find out what she does.

         SO THE ENDING NEEDED A LINE OF ITS OWN or it would have been orphaned:
         a button with nothing to belong to, which is the exact fault the note
         below records and reversed once already.

         THE LINE HANDS OVER: "Each case study shows how I work and what
         shipped." It does one job — it says what is over there and lets the
         button go there — and it carries BOTH halves a hiring manager scans
         for, the process and the outcome. An earlier version, "The case studies
         are where I show my working.", had only the first half and is dead.

         A CLOSING REFLECTION WAS TRIED HERE AND CUT. "I made this walk the same
         way I make everything else." turned the garden into evidence rather
         than decoration, which is a good move and is the reason it was written.
         It died when leg 8 got its own line: "I keep learning what AI is
         changing about design." is already a first-person reflection, so the
         two stood back to back as two codas, and the second one was reaching.
         "Everything else" also gestured at a body of work rather than naming
         one. That line is DEAD — do not restore it as an option.

         NO NUMBER IN IT, deliberately. "Four case studies" is checkable today
         and stale on the fifth; the registry is four now with more planned
         (src/app/work/projects.ts).


         ── WHAT MOVING THE INTRODUCTION TO LEG 1 COST, AND IT WAS PAID ON
         PURPOSE ─────────────────────────────────────────────────────────────
         The sign-off used to carry "I'm a product designer. I make complicated
         products simpler to use." and it worked HERE for a reason no other line
         can reproduce: the machine on screen is typing `hello world`, the first
         program anybody writes, and this was where she introduced herself. The
         end of the walk was a beginning, and the picture made the joke without
         a word of it being written down.

         THAT PAYOFF IS GONE and it was traded knowingly — for the positioning
         sentence being on the FIRST screen, where a recruiter who never scrolls
         still reads it. Anybody tempted to move the introduction back should
         know they are buying the joke back at the price of hiding what she does
         at the bottom of a thirteen-viewport film.

         IT ASKS FOR NOTHING BEYOND THE BUTTON, deliberately. An earlier version
         of this pane both closed and invited ("I'd love to hear what you're
         working on"), which was the page asking twice in one lockup.

         THIS IS THE ONLY SECTION THAT CARRIES `cta`, and that is the whole
         guarantee against a second one: the engine renders a CTA as a child of
         its own section's copy article, and there is exactly one section here to
         render one from.

         ONE BUTTON. The owner's flow names one thing to do at this beat — See
         the work — and the email sets under it as a line of type rather than
         beside it as a second pill (THE ADDRESS IS A LETTERHEAD, below the
         config). A matching pair would be the page asking twice at the moment it
         has finished asking.

         IT WAITS UNTIL THE WALK STOPS. Hanging the offer on chapter 7 was tried
         and reverted — an offer standing over five more viewports of flight asks
         the reader to leave in the middle of a sentence the page is still
         writing. Here it arrives as the machine finishes writing `hello world`,
         at the one moment the piece has nothing further to show, and the
         last-section copy curve holds it at full opacity from 20% of this leg to
         the foot of the page (world.css, THE CHAPTER HOLDS). Riding the section
         system is what buys that hold for free, and it is also what keeps the
         ending inside the walk's own two-panel composition — the glass pane on
         the left, the trail down the right — instead of becoming a rail-free
         variant of it. The ending is a beat of the film, not a different screen.

         THE LINE ABOVE THE BUTTON, and this section used to argue there should
         not be one. "Buttons and a picture is the whole ending" was the claim,
         on the reasoning that a screen hand-lettering `hello world` is its own
         sign-off. What that produced was controls with nothing to belong to —
         the only lockup on the page with no words in it, on a route whose every
         other pane is a sentence with something under it. The line is the
         missing half: the walk stops, the page says who is speaking, and then
         offers the thing to do about it.

         IT IS IN THE FIRST PERSON, which the chapters deliberately are not (THE
         FORM IS A CONTENTS PAGE), and it does not obey the contents-page form:
         no gerund, no label above it, nothing to caption. That is the tell that
         the walk has finished and somebody is speaking — the whole reason a
         closing line reads as an ending rather than as a sixth chapter. It
         shares the exception with leg 1's title card and with nothing else; the
         two first-person panes are the bookends and every pane between them is
         a chapter.

         THE TWO-SENTENCE EXCEPTION WENT WITH THE OLD LINE and is recorded on
         the title card, which now carries it. This one is a single sentence.

         IT DOES NOT DUPLICATE CHAPTER 7. "Taking a product from the first
         sketch to the shipped screen" stays on its own chapter under its own
         eyebrow (see makers-table); that is the last claim about the work. This
         one is about the thing the reader is looking at.

         ── DOES IT FIGHT THE LETTERING? ──────────────────────────────────────
         It is the obvious risk and it was checked rather than assumed: this
         pane is the one place on the site where the PICTURE also carries words,
         and a headline standing beside a screen that hand-letters `hello world`
         could easily be two things saying hello at once. Three things keep them
         apart, and the third is the one that actually decides it.

         REGISTER. One is 36px Avant Garde semibold in charcoal, typeset on
         frosted glass; the other is a mint-screen script drawn inside a CRT.
         Nobody reads them as the same voice — one is the page speaking and one
         is an object in the world.

         DISTANCE. The film re-centres into the open column right of the panel
         (world.css, THE FRAME SHIFT), so at 1440 the sentence's rag stops
         around x376 and the monitor's case starts around x750. They share a
         band of height and about 370px of clear paper.

         SEQUENCE, AND IT IS THE REAL ANSWER. The copy article rises to full
         over the first 20% of this leg (world.css, THE CHAPTER HOLDS) and the
         title's word cascade is settled by 34% of it (THE WINDOW PER CHAPTER)
         — and the hand has not started writing at that point. MEASURED OFF THE
         RE-SHOT leg-9.mp4 at 24fps, 121 frames, 5.04s, by frame index rather
         than by seek: the screen still holds the garden at f20 (0.83s), shows
         "h" at f40 (1.67s), "hello" at f60 (2.5s), "hello worl" at f84 (3.5s),
         and the line is COMPLETE at f88 (3.67s) and settled for the last
         1.37s. The shape is the one the old footage had — writing starts after
         0.8s, finishes in the last third — so the reasoning below survived the
         re-shoot; only the figures moved. So the reader gets the sentence, and then
         watches the machine answer it across two thirds of the leg with the
         sentence and its button standing still beside it. That is the order
         the scene wants: the person says what she is, and the machine replies
         in the only two words it knows.

         THESE ARE THE ONLY FIGURES FOR THIS CLIP THAT ARE STILL LIVE. Two sets
         are dead: the pre-re-shoot measurements (complete at 3.33s, settled for
         1.7s), and before those the claim in the `scroll` note that the clip
         ended on `hello` plus one stroke. The weight of 1.4 is unaffected by
         either correction — the writing beat is real and late in every version
         of the footage — but do not re-derive anything from the old numbers,
         and re-measure by frame index if the leg is ever regenerated again.

         WHAT WOULD BREAK IT. Anything that pushes the copy's arrival past clip
         1.2s: a later `--sw-a` for scene 9, a bigger `scroll` weight here, or a
         later plateau on `sw-copy-arrive` (world.css, THE CHAPTER HOLDS). Then the sentence
         would set on top of a hand mid-word, which is the fight this note says
         does not currently happen. Re-check against the frame times above
         before moving any of the three. The lever to reach for if it ever does
         fight is the headline's SIZE or its arrival, never its wording.

         THE AUG 2026 RETIMING DID NOT TOUCH ANY OF THE THREE, and that was
         checked rather than assumed: this leg keeps `scroll: 1.4`, and its
         `--sw-a` is still 0.02 of its own leg, so the copy still arrives at the
         same point in CLIP time. What moved is only the percentage the
         stylesheet writes that fraction as, because the denominator under every
         percentage on this route went 14.3 → 13.4.

         The title and the labels are literals rather than an import, for the
         same reason the chapter titles above are: HomeFlight.tsx's
         `data-sw-seo` block mirrors this copy by hand for crawlers, and one
         sync rule for the whole config is easier to keep than one rule with an
         exception in it. */
      /* THE SIGN-OFF WEARS THE LOCKUP TOO (owner's call, Aug 2026): mark,
         eyebrow, title. It carries no `label`, so it takes no waymarker and the
         rail stays at five — the `eyebrow`-without-`label` mechanism, same as
         legs 1 and 8 (see the `Section` type).

         "IN PRACTICE" NAMES THE TRANSITION THE PANE IS MAKING: everything above
         was the claim, and the case studies are it happening. It also clears
         every echo trap on this pane — nothing from the line ("case study",
         "work", "shipped") and nothing from the button ("view", "selected
         work"). That is the same fault flagged on leg 3, where the title opens
         on its own eyebrow.

         ── NO SECOND PERSON ANYWHERE ON THIS SITE, and this is the general
         note rather than a fix for one string. The eyebrow read "Over to you"
         and the owner's objection is the word: direct address to the reader is
         sales copy, and nothing else on the site does it. The next person
         writing a line next to a CTA will reach for "you" — do not.

         "Hello world" is the flagged alternative and it is a one-string swap.
         It has more atmosphere and less argument: it captions what the machine
         on screen is literally typing and bookends the walk, but it names
         something the reader can already see, where the eyebrow's job
         everywhere else here is to name something the picture cannot say.

         ── THE MARK HERE OVERRULES THIS ROUTE'S LONGEST-STANDING NO ──────────
         WorldGlassCard.tsx argues at length that the sign-off must NOT have a
         disc: it is already at the sheet's optical centre with air on all four
         sides, "which is a stronger anchor than a glyph", and a disc would
         apply "the one visual signature that says chapter" to the pane whose
         whole job is to say the chapters have finished. That reasoning is
         intact and worth reading before anybody reverses this.

         THE OWNER'S POSITION IS CONSISTENCY. With legs 1 and 8 both wearing the
         lockup, a single bare pane at the very end reads as an error rather
         than as a distinction — the reader has no way to tell "deliberately
         unmarked" from "the mark failed to load", and the one place they meet
         it is the last thing they see. Half of the counter-argument also went
         with the composition change: this article is not centred any more (see
         world.css, THE PANE IS ONE COMPOSITION), so "already at the optical
         centre with air on all four sides" is no longer true of it. */
      eyebrow: "In practice",
      title: "Each case study shows how I work and what shipped.",
      /* ══ NO `cta`, AND THE ENDING STILL HAS ITS BUTTON ═══════════════════
         THE TWO DOORS ARE ONE DOOR NOW (owner's call, Aug 2026). This section
         used to carry `cta: { primary: { label: "See the work", href: "#work" }}`
         and the engine built it inside this copy article, riding the article's
         own opacity — which is where every note in this file about "the
         ending's button" comes from. The walk also carried a SECOND control,
         the standing exit at the foot of the pane, which faded out across leg 8
         so that the ending's button would be the only door on the last screen.

         THAT ARRANGEMENT WAS TWO CONTROLS WITH ONE JOB. It only made sense
         while they looked different: a quiet underlined sentence you could use
         at any time, and a real button that concluded the piece. The owner's
         call is that the escape hatch must be an obvious control from the first
         screen — a recruiter has to see the way out immediately — and once it
         is the same button, in the same place, saying the same words, a
         crossfade between them is two objects pretending to be one.

         SO THERE IS ONE ELEMENT AND IT NEVER LEAVES. `FlightExit` renders
         `sw-btn sw-btn--primary sw-exit`: literally the engine's own button
         classes, so it IS the ending's button rather than a copy of it, pinned
         to the pane's foot slot from the first paint to the handover into the
         work band. Zero movement at the handover is guaranteed by construction
         rather than by two boxes being measured against each other, and there
         is no second implementation of the anchor behaviour to keep in step.

         WHAT THIS SUPERSEDES, recorded rather than deleted — the reasoning was
         sound for the arrangement it was written about:

           · "The ending offers one thing to do and the exit is a sentence"
             (THE STANDING EXIT, world.css). The distinction it protected was
             KIND: a label versus a sentence. There is one kind now.
           · "This fades across leg 8 so the ending's own button is the only
             door on the last screen." There is only ever one door, so the fade
             has nothing to prevent. `sw-exit-leaves` is deleted with it.
           · "One name for the whole walk, and it is Skip to the work." A
             control that persists INTO the ending cannot say "skip" there —
             there is nothing left to skip. "See the work" is the one wording
             true at every scroll position, and naming the destination is what
             a permanent door does.
           · "THIS IS THE ONLY SECTION THAT CARRIES `cta`, and that is the whole
             guarantee against a second one." No section carries one now, which
             is a stronger guarantee of the same thing.

         IF A CTA EVER COMES BACK HERE it comes back as a decision and it has to
         answer this: what does a second control at the ending offer that the
         standing one does not? A different destination is the only good answer.

         The email is not in this pane and has not been for some time — the
         `.sw-signoff__mail` letterhead line was removed with its rules and its
         mirror in HomeFlight.tsx, and contact lives in the site's own chrome.
         There is therefore nothing under the button to orphan by moving it. */
    },
  ],
  connectors: [], // architecture A: the legs chain directly
};

/* ─────────────────────────────────────────────────────────────────────────
   THE SENTENCE IS SET WORD BY WORD

   Each chapter title is wrapped one word at a time so it can cascade into place
   as the chapter arrives, instead of the whole block coming up on one curve.
   The motion is entirely in world.css (THE COLUMN IS SET, NOT FADED); this pass
   supplies only the markup and two integers per word.

   ── WHY IT IS SAFE TO REWRITE ENGINE-BUILT MARKUP ────────────────────────
   Checked against every write path in scrub-engine.js rather than assumed,
   because a post-mount edit the engine later clobbers is a bug that would only
   surface on a resize:

     · `c.innerHTML = …` (scrub-engine.js:262-268) runs ONCE, inside the
       `SECTIONS.forEach` build pass, and is the only place a copy article's
       children are ever written.
     · The per-frame loop (:437-440) touches three inline styles on the ARTICLE
       and nothing below it — `opacity`, `transform`, `pointerEvents`. It never
       reads or replaces a child.
     · `layout()` (:296-323) recomputes segment offsets, seam geometry and the
       track height on resize and orientation change. It rebuilds no DOM.
     · `enterStillsMode()` (:530-541) removes scene VIDEOS and toggles a class
       on the scene element. It never reaches the copy layer.
     · The only other mutation nearby is `dots.forEach(d =>
       d.classList.toggle('is-active', …))` (:448), on the trail's buttons.

   So the split is permanent for the life of the page. If a future engine
   version gains a second write to `.sw-copy`'s children, this has to become a
   MutationObserver or move into the engine — re-check that list before taking a
   new upstream file.

   ── THE ACCESSIBLE STRING SURVIVES IT ────────────────────────────────────
   .docs/style-rules.md §7 ("Split text must stay real text") bans the obvious
   approach — `aria-hidden` fragments plus an `sr-only` duplicate — because it
   fixes the accessible name and breaks everything that reads text content
   instead: copy-paste, find-in-page and translation all return the heading
   twice.

   So the separators are REAL TEXT NODES outside the spans, and the split runs
   off a capturing `\s+` so the original whitespace is reproduced rather than
   normalised. `h2.textContent` therefore comes back byte-identical to the
   authored sentence: the accessible name follows for free, find-in-page matches
   across the whole title, and a selection copies a sentence rather than a word
   list.

   ONE KNOWN COSMETIC EFFECT, recorded rather than worked around: the spans are
   `display: inline-block` (a transform does not apply to a non-replaced inline
   box) and some accessible-name implementations insert a space around a
   non-inline box, so the name may contain doubled spaces. Every screen reader
   collapses those when announcing, and it still reads as one sentence — which
   is the property the rule exists to protect. `inline-block` is also declared
   only inside world.css's `@supports` and reduced-motion guards, so wherever
   the cascade is switched off the words are plain inline text again.

   HomeFlight.tsx's `data-sw-seo` block mirrors every title as ordinary
   paragraphs for crawlers and no-JS readers, and none of this touches it.

   Idempotent on purpose: React StrictMode runs mount effects twice in
   development and the engine has no double-mount guard of its own. */
function setTitlesInWords(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".sw-copy__title").forEach((title) => {
    if (title.dataset.swSet === "1") return;
    /* Capturing split, so the odd entries ARE the original whitespace runs and
       nothing about the string has to be reconstructed. */
    const parts = (title.textContent ?? "").split(/(\s+)/).filter(Boolean);
    const words = parts.filter((p) => !/^\s+$/.test(p));
    if (words.length < 2) return;

    /* `--sw-t` runs 0 → 1 across the words, so the divisor is the number of
       GAPS, not of words. A one-word title returns above, but the floor keeps
       the CSS division valid if that ever stops being true. */
    title.style.setProperty("--sw-n", String(Math.max(1, words.length - 1)));

    const out = document.createDocumentFragment();
    let i = 0;
    for (const part of parts) {
      if (/^\s+$/.test(part)) {
        out.append(document.createTextNode(part));
        continue;
      }
      /* TWO SPANS PER WORD, not one: the outer is the mask and the inner takes
         the travel, because a clip-path clips the box it is declared on and an
         element cannot both hold the edge and slip through it (world.css, THE
         WORD IS SET, NOT FADED UP). Nesting changes nothing about the accessible
         string — `textContent` still returns the word once, so the sentence the
         separators rebuild is byte-identical either way. */
      const span = document.createElement("span");
      span.style.setProperty("--sw-i", String(i));
      const inner = document.createElement("span");
      inner.textContent = part;
      span.append(inner);
      out.append(span);
      i += 1;
    }
    title.replaceChildren(out);
    title.dataset.swSet = "1";
  });
}

/* ── THE CHAPTER'S NAME IS AN EYEBROW, AND THE ENGINE ALREADY DRAWS ONE ────
   The owner relaid the pane out (Option B, Eyebrow): the competency label moves
   from the printed caption at the foot of the pane to an eyebrow above the
   title, inside the lockup — mark, eyebrow, title, one left-aligned stack.

   NO DOM SURGERY IS NEEDED, and that is worth stating because the obvious
   assumption is that it would be. The vendored engine already supports an
   `eyebrow` per section and renders it as a `<span class="sw-copy__eyebrow">`
   in exactly the right slot, between the (hidden) counter and the title
   (scrub-engine.js:264). Nothing was passing one. So this is a config change,
   not a `wireSignOff`-style post-mount append: the eyebrow is an ordinary child
   of the copy article, which is precisely what the relayout wants — it rides
   the article's dwell window, its per-frame opacity and its slip for free, and
   the caption and its sentence are a pair by construction rather than by two
   range tables kept in step (world.css, THE CHAPTER'S NAME IS NOT ANIMATED ANY
   MORE).

   IT IS DERIVED, NOT DECLARED TWICE. The eyebrow IS the scene's `label` — the
   same string the trail dot carries as its accessible name and its hover
   preview — so writing it out a second time in each section would be a pair of
   strings per chapter that can drift, for no gain. Deriving also enforces the
   unlabelled sections' rule for nothing: sections 1, 6, 8 and 9 carry no
   `label`, so they get no eyebrow — the title card and the sign-off keep the
   bare lockup they are designed as, and the two silent legs paint nothing at
   all.

   AND world.css DERIVES OFF THE SAME FACT rather than off a list of indices:
   the scene's mark disc is selected with `:has(.sw-copy__eyebrow)`, which is
   true of exactly the sections this function rebuilt. Silence a leg by removing
   its `label` here and its eyebrow, its mark and its waymarker all go with it
   without a stylesheet edit.

   IT CLONES RATHER THAN WRITING INTO CONFIG for the same reason `configFor`
   used to: the module outlives a client-side navigation, so mutating the shared
   constant would leave the mutation behind for the rest of the session. Only
   labelled sections are rebuilt; the rest pass through by reference. */
function withEyebrows(config: typeof CONFIG) {
  return {
    ...config,
    sections: config.sections.map((section) => {
      const { label, eyebrow } = section as Section;
      /* Already declared → leave it. That is the `eyebrow`-without-`label`
         case (legs 1 and 8), and it is also how a chapter could ever say one
         thing on the rail and another in the lockup, if one ever needed to. */
      if (eyebrow || !label) return section;
      return { ...section, eyebrow: label };
    }),
  };
}

/* ── THE ENDING'S BUTTON LEFT THIS FILE, AND `wireSignOff` WENT WITH IT ────
   A `wireSignOff(root)` pass used to stand here. It found the engine-built
   `.sw-copy__cta` inside the sign-off's article and attached one behaviour to
   the primary anchor: the site's rule that a jump which would drag the reader
   through more than a screenful of scrubbed film is made INSTANT
   (lib/use-anchor-scroll.ts, THE FILM IS NOT SCRUBBED BY A NAVIGATION), with
   the hash written by `replaceState` so declining or concluding the walk does
   not put a step in the back button.

   NONE OF THAT IS LOST; ALL OF IT MOVED. The sign-off carries no `cta` any more
   (NO `cta`, AND THE ENDING STILL HAS ITS BUTTON, in the config above): the
   walk has exactly one door, `FlightExit`, and it is a React component that
   owns its own click handler and imports the same predicate. So the engine
   builds no `.sw-copy__cta`, this pass would find nothing, and a post-mount
   query for a class nothing emits is worse than no code.

   THE TWO NOTES WORTH CARRYING FORWARD, because they are about the RULE rather
   than about this pass:

     · The predicate is imported, never restated. A rule with several call sites
       and several implementations is several rules. There is one call site now,
       which is the best version of that.
     · Modified clicks (new tab, middle button, meta/ctrl/shift/alt) must fall
       through untouched, and focus must be moved onto the landed band so Tab
       continues from the work rather than from the top of the document.
       FlightExit does both; check them there if either ever regresses.

   IF AN ENGINE-BUILT CONTROL EVER RETURNS to this route, this is the shape the
   wiring took: idempotent, stamped on the article's dataset, wired directly
   onto the one anchor rather than through a delegated listener, because the
   mount effect already holds the node. Git history has the implementation. */

export function ScrollWorld({
  children,
  id,
}: {
  children?: React.ReactNode;
  /**
   * Anchor id for the whole flight. `/` passes "skills" so the site masthead
   * has a real element to scroll to and to spy on — the container starts at the
   * top of the document and is as tall as the engine's track, which is exactly
   * the stretch of scrolling the "My skills" label names (lib/site-nav.ts).
   */
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    /* Order matters and only in one direction: the engine builds `.sw-stage`
       synchronously, so the film renderer can attach to it on the next line. It
       is mounted second and only ever decorates scenes the engine has already
       made, so in stills mode there is nothing for it to decorate. The engine
       itself returns no teardown (it is the portable upstream file and is left
       alone), so the film renderer's is the only cleanup this effect has. */
    /* THE ENGINE MOUNTS AT MOST ONCE PER ELEMENT, and the guard is on the DOM
       node rather than in React state because the failure it stops is the
       effect running twice against the SAME node. That happened in practice on
       a client-side navigation into the flight's route (measured: two
       `.sw-stage`s, two trails, eighteen copy articles in one container — every
       chapter printed twice), while a hard load runs the effect once. The
       engine has no teardown, so a second call cannot be cleaned up, only
       prevented. A true REMOUNT gets a fresh div with a clean dataset and mounts
       normally; the film renderer sits outside the guard because its teardown
       below really does run between double invocations, so it must come back
       each time. */
    if (!ref.current.dataset.swEngineMounted) {
      ref.current.dataset.swEngineMounted = "1";
      mountScrollWorld(ref.current, withEyebrows(CONFIG));
      /* Synchronous for the same reason as the engine: the copy articles exist
         by the time `mountScrollWorld` returns, so the titles can be re-set and
         the sign-off wired in the same tick, and no frame is ever painted with
         an unsplit title. Neither needs a teardown — the markup they write is
         inert without the stylesheet, and both are idempotent. */
      setTitlesInWords(ref.current);
    }
    return mountWorldFilm(ref.current);
  }, []);

  /* children = the server-rendered data-sw-seo copy block (the page); the
     engine hides it on mount but crawlers read it from the served HTML.

     `data-sw-scrub-track` is a published contract, not a hook for this file:
     it marks the element whose height IS the scroll track, so the site's anchor
     scroll can tell whether a jump would drag the reader through a scrubbed
     film and cut the glide if it would (use-anchor-scroll.ts, THE FILM IS NOT
     SCRUBBED BY A NAVIGATION). It sits on the same element the view timeline is
     declared on, and for the same reason: the engine's only in-flow child is
     the track, so this box and the track are the same box. */
  return (
    <div ref={ref} id={id} data-sw-theme data-sw-scrub-track>
      {children}
    </div>
  );
}
