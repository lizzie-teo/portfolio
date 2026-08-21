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
// The site's one rule for "may this jump be eased?" — see THE FILM IS NOT
// SCRUBBED BY A NAVIGATION there. Imported rather than restated so the ending's
// button, the arrival's skip and the masthead cannot drift apart.
import { jumpWouldScrubFilm } from "../lib/use-anchor-scroll";

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

   NINE LEGS, SEVEN CHAPTERS. Legs 1–7 each arrive at their own chapter's
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

   The verbs still carry the arc (collaborating, vibe coding, building, handing,
   watching, taking) because naming the scenery is forbidden above, so sequence
   is the only cohesion device left. The ten-years entry is the one non-gerund
   and has its own note.

   THE IDS ARE HISTORICAL and they do not track the labels. Nothing reads them —
   the engine keys every scene off its INDEX (`jumpTo(i)`, `nth-of-type` in
   world.css) and never touches `id`, so `users` sits on the prototyping chapter
   and `vibe-coder` on the testing one, both from earlier drafts of the running
   order. Renaming them would churn a diff for no reader-visible gain; do not
   read a chapter's subject off its id.

   A title should not merely restate its own label in a longer form, since the
   label prints in the corner while the title is centred and the two are on
   screen together. Two now share a root with their label — design systems, and
   collaboration — and both are allowed for the same reason: the label is the
   term a hiring manager scans the corner for, and the title extends it rather
   than echoing it (WHO with, WHAT for, WITH WHAT). A title that could
   be deleted without losing a fact is the one to rewrite; a repeated word is not.
   Two earlier drafts (garden aphorisms, then a rotating-actor story) both read
   wrong on this imagery.

   Type and colour come from the site theme, wired in world.css — never restyle
   the copy inline here. Keep page.tsx's data-sw-seo block in sync. ────────── */

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
     number IS their weight and raising it is how they get retuned. It went
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
    {
      id: "stakeholders",
      label: "Collaboration",
      still: `${A}/scene-1-gate.webp`,
      poster: `${A}/leg-1-poster.webp`,
      clip: `${A}/leg-1.mp4`,
      accent: "#B4795C",
      /* THE LABEL IS THE COMPETENCY, NOT THE AUDIENCE. It was "Stakeholders",
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
      /* Aug 2026. It read "Collaborating across functions to meet business
         and user goals." — no person anywhere in it, and "across functions" and
         "business and user goals" are both abstractions standing in for nouns.
         The replacement keeps the cross functional claim (the owner's word) and
         puts a person back in the sentence, and its second half is lifted from
         the register the home hero already sets: "I'm just as into the people
         side." A leg that opens the walk should sound like her. */
      title:
        "Cross functional by habit, and the people side is the part I like.",
      scroll: 1.5,
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
      /* Aug 2026. It read "Ten years of experience in designing complex
         products." — the number is the best asset in the set, but "experience
         in designing" is padding and it was the one title that did not lead on
         a verb. An industry list was drafted here and dropped: naming two
         sectors would have undersold a range that runs wider than two. */
      title: "Ten years of making complicated products feel easy.",
      /* THE SAME EXCEPTION THE STYLESHEET MAKES, on the other path. world.css
         widens this one chapter's window to 15.7 → 27.3% of the flight and
         holds it flat across 7 → 93% of that (THE LONG HOLD); browsers without
         scroll-driven animations take the engine's derived window instead, and
         would otherwise get the house curve and a title that stands for a third
         less time than the design calls for.

         FRACTIONS OF THE FLIGHT, not of this leg — the same quantity the CSS
         percentages are written against, so the two tables are comparable by
         eye. The bounds are set by the neighbours rather than by taste: scene 1
         does not clear until 0.1558 and scene 3 opens at 0.27413, and every
         copy pane is absolutely positioned in the same place, so an overlap is
         two titles printed over each other rather than a crossfade. CHANGE BOTH
         OR NEITHER. */
      copyWindow: { start: 0.157, end: 0.273, hold: [0.07, 0.93] },
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
         halves of the ask are split the way this file splits every pair, the
         term in the corner and the reason in the sentence. The research claim
         is not lost: it moved to scene 6 as usability testing, where it reads
         as validating what was built rather than as discovery.

         "Prototyping" is free to be the label here only because scene 6 gave
         it up; there is exactly one prototyping stop on this trail. */
      label: "Prototyping",
      still: `${A}/scene-3-tended-bed.webp`,
      poster: `${A}/leg-3-poster.webp`,
      clip: `${A}/leg-3.mp4`,
      accent: "#D98A9B",
      /* OWNER-SET, replacing "Vibe coding a design until it can be used rather
         than looked at." — and the wording is owner-set to the word: a repeated
         "on" before canvas ("on paper, on canvas and in code") was offered as
         the stricter parallel and the owner cut it. Rightly, on reading it
         back: "on paper, canvas and in code" lets one "on" govern both nouns,
         which is ordinary English coordination, and the second "on" made the
         line march. Do not "fix" the grammar back. The full stop is the house
         pattern; every title on this trail carries one.

         The vibe coding term is gone from the page with this, and that is the
         owner's trade: the sentence now claims the range of mediums rather
         than the method, and the method has scene 5 ("Design engineering") to
         live under. */
      /* Aug 2026. It read "Designing on paper, canvas and in code." — true,
         but "canvas" is Figma jargon a hiring manager has to decode, and "in
         code" was the one phrase on the page that could be misread as a claim
         to be a software engineer. She prompts; she does not engineer, and that
         distinction is worth more in this market than the overclaim, because
         prompting your way to working code IS the scarce thing. Saying it in
         plain speech settles both at once. */
      title:
        "Drawing it on paper, building it in Figma, then prompting it into code.",
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
         characters sets to about 15em against the ~15.4em run to the pane's
         fore-edge, which is a label with no margin left (world.css, the
         measurement note on `.sw-route__label`). */
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
      /* "Figma to code" named the FILES and this chapter is about the practice,
         so it takes the second half of scene 4's ask. The title already said the
         Figma-to-code part and says it better — a handover an engineer or an AI
         can build from is what design engineering means here — so the corner
         gets the term and the sentence keeps the proof. It is also now the
         widest label on the trail at 18 characters; re-measure before going
         longer (world.css, the note on `.sw-route__label`). */
      label: "Design engineering",
      still: `${A}/scene-5-crossing.webp`,
      poster: `${A}/leg-5-poster.webp`,
      clip: `${A}/leg-5.mp4`,
      accent: "#7FA3C8",
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
         be about something else, this is the entry to rewrite. */
      label: "Usability testing",
      still: `${A}/scene-6-dusk-bloom.webp`,
      poster: `${A}/leg-6-poster.webp`,
      clip: `${A}/leg-6.mp4`,
      accent: "#8F7BB8",
      title: "Watching people use a design and fixing what they get stuck on.",
      scroll: 1.8,
      /* The biggest single cut on the page: 0.5 → house 0.15. At 0.5 this
         scene ran its middle at half speed and its last frames at double, so
         the dusk bloom opened out of a near-standstill and then snapped shut.
         It keeps the joint-longest leg, which is where its dwell comes from
         now. */
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
         failure recorded above was moving THIS one, not writing that one. */
      title: "Taking a product from the first sketch to the shipped screen.",
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
       chapter eight.

       THE TWO SECTIONS DIFFER ON WORDS, THOUGH, and they did not used to.
       Section 8 (the pull-back) stays wordless on purpose: it is the move that
       reframes the whole garden as a screen, and a sentence over it would be
       read instead of the reveal. Section 9 is where the walk stops, so it is
       where the invitation stands — and it now carries a `title` as well as the
       `cta`, one closing line above the one button (THE ENDING). */
    {
      id: "reveal",
      still: `${A}/scene-8-resolve.webp`,
      poster: `${A}/leg-8-poster.webp`,
      clip: `${A}/leg-8.mp4`,
      /* Graphite: the world is turning back into paper and a scene accent would
         be the last thing still insisting the garden is a place. It only paints
         the traveller on the trail. */
      accent: "#7C7A74",
      scroll: 1.6,
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
         just seen, and wrong for anything that has to stand on its own. It is
         the owner's line now, and it is final: "I'm a product designer. I make
         complicated products simpler to use." A statement, not a farewell. It
         says the same thing to a reader who has walked the garden and to one who
         has just landed on it.

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

         IT IS THE ONLY TWO-SENTENCE TITLE ON THE PAGE, and the exception is the
         point. Every chapter title is one sentence because a chapter is one
         claim; this one is a statement and its consequence, which is two moves,
         and running them together would make the first a subordinate clause of
         the second. It is not a chapter title and does not obey the contents-page
         form above: no gerund, and it is in the FIRST PERSON, which the seven
         deliberately are not (THE FORM IS A CONTENTS PAGE). That is the tell that
         the walk has finished and somebody is speaking — the whole reason a
         closing line reads as an ending rather than as an eighth chapter.

         IT DOES NOT DUPLICATE CHAPTER 7. "Taking a product from the first
         sketch to the shipped screen" stays on its own chapter with its own
         printed caption (see makers-table); that is the last claim about the
         work. This one is about the person doing it.

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

         The title and the two labels are literals rather than an import, for
         the same reason the seven titles above are: page.tsx's `data-sw-seo`
         block mirrors this copy by hand for crawlers, and one sync rule for the
         whole config is easier to keep than one rule with an exception in it. */
      title:
        "I’m a product designer and I make complicated products simpler to use.",
      /* ONE BUTTON, AND THE SECOND CONTROL IS NOT A BUTTON. The engine renders
         `cta.secondary` as a ghost pill beside the primary, which is what the
         email used to be. It is not a peer of "See the work" any more — see
         THE ADDRESS IS A LETTERHEAD, below, for where it went and why. */
      cta: {
        primary: { label: "See the work", href: "#work" },
      },
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

   page.tsx's `data-sw-seo` block mirrors all seven titles as ordinary
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
   preview — so writing it out a second time in each section would be seven
   pairs of strings that can drift, for no gain. Deriving also enforces the
   ending's rule for nothing: sections 8 and 9 carry no `label` (THE ENDING),
   so they get no eyebrow, and the sign-off keeps the wordless pane the no-label
   rule asks for.

   IT CLONES RATHER THAN WRITING INTO CONFIG for the same reason `configFor`
   used to: the module outlives a client-side navigation, so mutating the shared
   constant would leave the mutation behind for the rest of the session. Only
   labelled sections are rebuilt; the rest pass through by reference. */
function withEyebrows(config: typeof CONFIG) {
  return {
    ...config,
    sections: config.sections.map((section) =>
      section.label ? { ...section, eyebrow: section.label } : section,
    ),
  };
}

/* ── THE ENDING OFFERS ONE THING TO DO ─────────────────────────────────────
   See the work, and nothing beside it. The pane used to carry the email
   address underneath the button as a quiet letterhead line; it is gone, and
   the sign-off is the button alone. Contact lives in the site's own chrome
   rather than at the foot of the walk, so the last leg asks once and stops.

   WHAT WENT WITH IT. The appended `.sw-signoff__mail` paragraph and its rules
   in world.css, and the address in the no-JS mirror (HomeFlight.tsx), which is
   kept in sync with this pane by contract. If a contact line ever comes back
   here it comes back as a decision, not by restoring a deleted append: it
   would still not be `cta.secondary`, because the engine renders a secondary
   as a bordered pill in the primary's own flex row, which makes the two read
   as peers when this beat names one CTA.

   `.sw-copy__cta` is unique by construction — exactly one section carries a
   `cta` (THE ENDING) — so this needs no id to find the right article, and it
   is idempotent for the same reason the engine mount is: it stamps the article
   and returns early if it is already wired.

   ── AND THE BUTTON MUST NOT SCRUB THE FILM ────────────────────────────────
   `See the work` is an in-page anchor and `globals.css` sets document-wide
   smooth scrolling, so a glide from anywhere inside the walk would play the
   scenes backwards under the reader on the way down. The site's one rule
   decides it (use-anchor-scroll.ts, THE FILM IS NOT SCRUBBED BY A NAVIGATION):
   a jump that would scrub more than a screenful of film is instant, anything
   shorter keeps the browser's own eased anchor.

   IN PRACTICE THIS BUTTON GLIDES, and that is the better exit. It is only on
   screen at the foot of the track, where the travel left is under a screen of
   already-settled `hello world` with the handover dissolving over it — so the
   predicate says no and the anchor behaves like an anchor. It goes instant only
   if the button is reached from further back up leg 9, which a keyboard reader
   can do. The rule is imported rather than restated, because a rule with three
   call sites and three implementations is three rules.

   It is wired directly onto the one anchor rather than through a delegated
   listener, because this file already holds the node. Modified clicks (new tab,
   middle button) fall through untouched, and where the instant path does run
   the hash is written with `replaceState` so it does not put a step in the back
   button between the reader and wherever they came from. */
function wireSignOff(root: HTMLElement) {
  const cta = root.querySelector<HTMLElement>(".sw-copy__cta");
  const article = cta?.closest<HTMLElement>(".sw-copy");
  if (!cta || !article || article.dataset.swSignoff) return;
  article.dataset.swSignoff = "1";

  const primary = cta.querySelector<HTMLAnchorElement>(".sw-btn--primary");
  const id = primary?.getAttribute("href")?.replace(/^\/?#/, "");
  if (primary && id) {
    primary.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const top = Math.max(
        0,
        target.getBoundingClientRect().top + window.scrollY - margin,
      );
      /* The reader is at the foot of the track when this button is on screen,
         so on most frames the answer is that the jump would scrub less than a
         screenful and the browser's own anchor behaviour is fine. It is asked
         rather than assumed because the button is also reachable from further
         back up leg 9 by keyboard, where the answer flips. */
      if (!jumpWouldScrubFilm(window.scrollY, top)) return;
      event.preventDefault();
      window.history.replaceState(null, "", `#${id}`);
      window.scrollTo({ top, behavior: "instant" });
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    });
  }
}

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
      wireSignOff(ref.current);
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
