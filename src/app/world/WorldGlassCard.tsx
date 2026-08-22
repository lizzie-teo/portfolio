"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { motionEase } from "../lib/motion";

/* ─────────────────────────────────────────────────────────────────────────
   /world — one sheet of glass, drawn back by the scroll.

   AN OBJECT IS SET DOWN ON A GLASS DESK, THE OBJECT IS TAKEN AWAY, THE DESK
   DRAWS BACK TO THE MARGIN AND THE WORLD IS BEHIND IT. That is the whole arc
   and every timing below serves it.

   THE GLASS IS THE WHOLE VIEWPORT AT REST. It is a desk, not a coaster: the
   engraved garden is already there at scroll 0, sitting under a full-bleed
   frost, and the reader meets a soft wash of world with one object lying on it.
   The morph is then a single physical move — the sheet's trailing edge travels
   to the rail — and the picture SHARPENS as the sheet clears it. The reveal is
   the payoff, which is why nothing else on the page needs to fly.

   At rest it is a 3.5" floppy disk in solid moulded colour, lying on that
   frosted sheet, with a written archival label carrying the name, the role and
   — in the slot a catalogue number would take — "hello world".

   THERE IS NOT ONE OUTLINE ON IT, and that is the whole look. Every form is
   separated from its neighbour by a STEP IN TONE between opaque plates plus a
   sub-pixel bevel, which is how a real moulding separates its forms and how both
   reference photographs do it; the shutter and the window under it are the dark
   note that keeps the assembly from flattening. The sheet is not the object's
   own surface — it is the thing the object is lying ON, and the arrival is
   staged in that order: the glass first, then the disk built on top of it.

   As the reader scrolls off the first viewport the object is PUT AWAY. The
   shutter runs shut, the way it does the moment a disk leaves a drive, and then
   the whole thing — plates, marks, lit edges and every word written on the
   label — slides up into a slot in the glass and is gone. Nothing on it fades
   and nothing on it leaves separately, because an opaque object that fades is a
   stain and a label that evaporates off a disk is not a thing that happens.
   Then the sheet it was lying on, now bare, draws its trailing edge back to the
   rail it is the margin of for the rest of the walk.
   The world it was lying on gives ground rather than being covered: the film's
   frame narrows into the space left of it and re-centres there.

   ── WHY A FLOPPY ──────────────────────────────────────────────────────────
   The page is a walk through what a designer does end to end, and the disk is
   the one object that means "the finished thing, handed over" to anyone who has
   touched a computer. It is also a form that already solves the layout: an
   ARCHIVAL LABEL, which is a micro-field name over a plain value, three times,
   separated by hairlines. Nothing about the card's typography is invented —
   it is the reference's own catalogue label with this disk's contents in it, and
   the contents of a designer-who-codes' disk are "hello world", which is the
   same two words scene 9's Macintosh has hand-lettered on its screen.

   IT IS MOULDED LITERALLY, and every fraction comes off the reference
   photographs: the 45° cut corner, the shutter recess with its shoulders, the
   metal shutter and the dark window beside it, a label covering the bottom 55%,
   and the two write-protect windows flanking it rather than sitting under it.
   The first pass dropped the cut corner and the recess to avoid clipping the
   pane, and without them the object read as a card with a rectangle on it. THE
   CUT CORNER IS THE WHOLE SILHOUETTE, and it is now drawn ONLY here, in the
   SVG. It used to be cut out of the glass as well, because the glass was the
   object's own mount and the two silhouettes had to agree. A desk has no
   chamfer, so that clip is gone — with it goes the backdrop-root hazard that
   made a `clip-path` anywhere near the frost a standing bug (world.css).

   It is a `position: fixed` overlay, so it adds no document height and the
   flight still starts at scroll 0. Nothing in the engine's CONFIG changes and
   scrub-engine.js is untouched; the morph takes its room out of the scroll the
   first leg already owns.

   ── THE ARRIVAL, ON MOUNT ─────────────────────────────────────────────────
   One progress value, `draw`, runs 0→1 over `DRAW_MS` and every plate, mark and
   line of type takes a sub-range of it. NOTHING FADES UP AS A WHOLE: the object
   is ASSEMBLED, in the order the parts of a disk go together, each plate rising
   the last few units into its own seat.

     the sheet       the glass is laid down first, so the disk has a table —
                     and the world goes soft behind it in the same beat
     the shell       the moulded case lands on it, with its shadow
     the recess      the step, and the dark window sunk into it
     the shutter     the metal drops in CLOSED, over the window
     the slide       and slides open, uncovering the window — the object's own
                     mechanism doing the reveal, rather than an opacity
     the label       the paper is set into its well
     the marks       the write-protect window, then the insertion arrow
     the light       the bevels come up last: the edges catch, and a flat
                     assembly of plates turns into a moulding
     the type        and the label is written

   THE SHUTTER IS THE POINT OF THE SEQUENCE. It is the one part of a floppy that
   moves, it travels along its own axis, and closed-then-open is the state change
   the object exists to make — so the window is never faded in at all. It is
   revealed, and on the way out it is covered again.

   The whole sequence is 1.0s: a hero reveal, so it sits above the 300ms
   interactive ceiling on purpose (style-rules §7), but inside the 1s budget for
   display sequences. It plays only if the reader actually arrives at the top —
   a restored scroll position skips straight to the assembled state, because an
   assembly that plays off-screen is just wasted frames.

   ── THE TWO BEATS, ON SCROLL ──────────────────────────────────────────────
   Sub-ranges of one scrubbed progress value, so this is a single continuous
   move that reverses exactly on scroll-up:

     0. THE OBJECT IS PUT AWAY, WHOLE. The shutter runs shut over its window,
        and then the object slides up into a slot in the glass, shutter edge
        first, carrying its label and its lit edges in with it. Only the mouth
        of the slot takes anything away, and it takes each part in the order
        that part reaches it.
     1. THE SHEET DRAWS BACK to the panel it is the ground of for the rest of
        the walk, and the world sharpens into every pixel it leaves behind.
     2. THE PICTURE FOLLOWS IT IN, and — above 861px — the paper margin the two
        of them leave behind is where the mount's frame is uncovered.
     3. AND THE GLASS TURNS OUT TO BE PAPER, once it has stopped.

   WHAT BEAT 1 ACTUALLY IS DEPENDS ON THE VIEWPORT, and this note used to claim
   otherwise. Below 861px it is one edge: the sheet's top runs down to the head
   of a bottom band and the other three stay pinned to the walls. Above 861px
   the landed layout is THE PANEL BESIDE THE PICTURE (world.css, the desktop
   appendix) — a free-standing plate inside a mount — so all FOUR insets travel
   and the plate grows a radius as it goes. The old text here described the
   full-bleed column layout, which that appendix records as deleted.

   IT STAYS AN ANIMATED INSET at both sizes, and never a scale or a translate: a
   scale would drag the 1px lit edge along it and take the type with it, and a
   translate would carry the frost's blurred content sideways with the pane
   instead of resampling what is actually behind it. That is a live conflict
   with the usual "animate transform and opacity only" advice, and the physics
   wins — the whole effect is made of what the sheet resamples.

   THE MATERIAL CHANGE IS NOT PART OF THE GEOMETRY. Above 861px the panel lands
   as paper, and it used to gain that paper on the same value it moved on, so it
   was never seen arriving as anything. `paper` is its own late range now: the
   sheet travels as glass, stops, and then turns out to be paper.

   THE DISK IS NOT INSIDE THE SHEET ANY MORE. It is a fixed-size box centred in
   the VIEWPORT, a sibling of the pane, for one blunt reason: the sheet's centre
   travels left as it narrows, and anything centred in the sheet travels with
   it. Anchored to the viewport the drawing simply holds still — which is the
   better read anyway, and the one the old note already argued for: the drawing
   stays put, the glass leaves.

   ── THE EDGE ARRIVES BEFORE THE MOVE DOES ─────────────────────────────────
   A sheet covering the whole screen has no visible edges, so at rest it is
   given none: the rim and the pool of shadow that used to lift a small plate
   off the picture are gone from the component entirely, not held at zero.
   `.wgc__edge` comes up at 0.18, just BEFORE the travel starts at 0.22, and
   stays for the rest of the page. That ordering is the whole detail: the sheet
   grows a thickness, and then the thickness is what you watch cross the screen.
   Bring it up late and the same move reads as a curtain wipe.

   WHAT THE EDGE IS also depends on the viewport, and the old heading here ("the
   only edge is the one that moves") was only ever true of the phone band. There
   it is the band's lit TOP edge with a shadow falling into the scene. Above
   861px the landed panel is a free-standing plate with four sides on paper, so
   the same element resolves into the plain hairline the picture's plate takes,
   at the same weight — two siblings in a frame rather than one sheet lying on a
   photograph.

   AND THE MOUNT'S FRAME IS NOT FADED IN. It is drawn at the window's own edges
   and travels inward on the picture's value, so the picture, which is opaque
   and full-bleed until that value moves, is what covers it. It is UNCOVERED
   rather than faded — the frame is the edge of the paper the picture is being
   drawn back off. It used to arrive by opacity at its final position, which was
   the one thing on the page that appeared out of nothing.

   ── WHAT THE PANEL HOLDS ──────────────────────────────────────────────────
   ONE COLUMN, READ TOP TO BOTTOM, standing on a single left axis:

     the scene's mark    a small disc of the same glass, carrying one lucide
                         glyph per chapter, at the head of the column
     the scene's name    a 12px tracked eyebrow under it, the chapter's word
     the scene's title   directly under that, the only sentence on the pane
     …the depth of the sheet, which is picture showing through…
     the one door        "View selected work", a button flush to the foot of
                         the pane, standing from the first paint to the
                         handover into the work band

   IT WAS A FOOTER LOCKUP AND IT IS AN EYEBROW. The chapter's name used to be
   printed on the foot at 16 → 24px under a dotted contents-page leader, with
   nothing but sheet between it and the title far above. The owner relaid the
   pane out (Option B, Eyebrow): the name sits with the sentence it names, the
   leader is gone with the object it furnished, and the foot slot it vacated
   now holds the one thing that IS true for the whole walk — the exit to the
   work (world.css, THE STANDING EXIT, and THE TRAIL'S PREVIEW for what became
   of the printed label).

   All of it is drawn in world.css — the mark and the glyph as pseudo-elements
   on the engine's own copy articles (THE SCENE'S MARK), the eyebrow as the
   engine's own `sw-copy__eyebrow` (THE EYEBROW). Nothing here is a React child,
   because the articles are built by the vendored engine; the exit is, because
   it is a control and needs a click handler.

   THE SCENE TITLES ARE WHAT SET THE WIDTH. It is the copy column's own measure
   plus its margin plus a fore-edge, and not a pixel more, because the measure is
   the narrowest that sets a title at its 2.25rem cap without shredding it. The
   type is the lever on the panel's width, not the panel: to narrow the glass,
   bring the title's scale down and let the measure follow (world.css, THE WIDTH
   COMES FROM THE TITLES). Nothing else in the column asks for more room — the
   eyebrow is 12px and the exit 14px on the same measure, and neither is close to
   binding it, where the retired leader was drawn TO that measure exactly. The
   corner fade is retired; the glass is the only ground now.

   THE ENDING IS THE EXCEPTION, AND IT IS TWO DIFFERENT EXCEPTIONS.

   SCENE 8 IS EMPTY GLASS. No label, no eyebrow, no title, so no mark either:
   the pull-back plays and the pane holds nothing. That is right and it is the
   route's oldest standing decision about this leg — THE REVEAL IS THE CONTENT.
   The camera pulls back until the whole garden turns out to be the display of a
   small machine, and a sentence over it would be READ INSTEAD OF WATCHED,
   because a reader's eye goes to type before it goes to a picture. This is the
   one picture on the page that cannot survive being second.

   COPY WAS PUT ON IT AND TAKEN BACK OFF, Aug 2026, and the ground is marked so
   nobody walks it a third time. For part of one day it carried a full lockup —
   a mark, the eyebrow "Still going", and a line about what AI is changing —
   tried first arriving LATE on the settled frame and then EARLY on the house
   curve. The owner removed all three parts. `ScrollWorld.tsx` (THE PULL BACK IS
   WORDLESS) keeps the record and the one thing worth having from it: leg-8.mp4
   measured frame by frame, four fifths of the camera move done by clip 67% and
   NO HARD STOP anywhere — it creeps to the final frame, so "the settled frame"
   is not a moment this footage has, which is why even the late timing could not
   fully honour the objection.

   SCENE 9 IS THE OTHER EXCEPTION AND IT GOES THE OTHER WAY. It carries a mark,
   an eyebrow ("In practice") and a closing line — no `label`, so no waymarker.
   That is a mechanism rather than a loophole: `eyebrow` became its own field
   precisely so a pane can wear a chapter's lockup without becoming a stop on
   the trail, since a dot here would put the ending on the rail and make it
   chapter six. The invariant is unchanged and unqualified — a waymarker exists
   if and only if the section has a `label` (ScrollWorld.tsx, the `Section`
   type). Leg 1's title card uses the same mechanism for the same reason.

   SO THE TWO ENDING PANES ARE OPPOSITES: one is the picture alone, the other is
   the only lockup at this end of the piece, and the silence between them is
   what makes the last pane land as an ending rather than as the film running
   out.

   THE ONE DOOR IS THERE THE WHOLE TIME, including on both of them. It used to
   be two objects — a quiet sentence-link standing through the walk and a real
   button built inside scene 9's own copy article — with the first fading out
   across leg 8 so the second was the only door on the last screen. They are ONE
   control as of Aug 2026 (owner's call): same button, same words, same
   position, from its arrival on the first screen to the handover, so the
   handover moves nothing (world.css, THE STANDING EXIT; ScrollWorld.tsx, NO
   `cta`). The two wordings that used to distinguish them — "Skip to the work"
   against "See the work" — are both retired; there is one offer, and it is
   named for the band it lands on.

   EVERY PANE IS READ TOP TO BOTTOM NOW, INCLUDING THIS ONE. The sign-off used
   to be centred in the sheet, on the reasoning that it had no head and no foot
   to run between; it has a head now, so it hangs from the same place as every
   other article with the door at the foot (world.css, THE PANE IS ONE
   COMPOSITION AND NOTHING IN IT EVER MOVES). The reader's eye never has to
   re-find the type between legs, which on a page whose whole surface is a
   moving picture is worth more than a per-pane composition.

   THE HEADLINE USED TO STAND WITHOUT A MARK, and that argument is now
   OVERRULED here and live everywhere else. It ran: every chapter title needs
   the disc because it has to start somewhere at the head of a narrow column in
   a full-height sheet, where this one was already at the sheet's optical centre
   with air on all four sides — a stronger anchor than a glyph — and giving it a
   disc would apply the one visual signature that says "chapter" to the pane
   whose whole job is to say the chapters have finished.

   HALF OF IT DIED WITH THE CENTRING. This article is not centred any more, so
   "already at the optical centre with air on all four sides" is simply not true
   of it; it hangs from the head of a column like everything else, which is the
   exact situation the first half of the argument says needs a disc.

   THE OTHER HALF IS THE OWNER'S CALL. Scene 9 takes a mark, and what stops it
   reading as chapter six is the RAIL: five dots, all of them behind the reader
   by the time this pane is on screen. Leg 1's title card takes one for the
   mirror-image reason — five dots, none of them lit, because the walk has not
   started. The rail is now the only thing that distinguishes a chapter from a
   pane that merely looks like one, which is thin, and it is the first thing to
   look at if the ending ever reads as one more stop. The cheap reversal is
   dropping this pane's eyebrow, which takes its mark with it.

   ON PHONES the pane is a bottom band and the mark is dropped — the arithmetic
   and the second reason are in world.css's phone block.

   The plate hands its identity over to the SITE MASTHEAD, which runs the full
   width of the frame above the picture (SiteHeader, mounted in page.tsx) and
   fades up on this component's `brand` value as the object gives it away — so
   the page never sets the same name twice. This component prints nothing on the
   landed glass itself: a lockup of the name and the role used to stand at the
   head of the copy column, and with the masthead carrying the identity across
   the top it was the third time the reader met it on one screen.

   ── HOLDING THE FIRST TITLE BACK ──────────────────────────────────────────
   Scene 1's copy is at FULL opacity at scroll 0 and decays from there (the
   engine's "greets on landing" curve), so at rest it competes with the disk for
   the same moment. `--wgc-copy` gates the whole copy layer to 0 until the rail
   has landed, then releases it. The gate multiplies with the engine's per-scene
   inline opacity, so every other scene is untouched and nothing pulses per
   scene — it opens once, at the arrival, and stays open.

   THE COST, and it is arithmetic rather than taste: a multiplicative gate can
   never raise scene 1's title above whatever the engine's own curve has already
   decayed to when the gate opens. Releasing at 0.26 viewports caps it near 0.75,
   which still clears AA comfortably (ink at 75% over the cream fade is ~5.4:1)
   but is quieter than full. That ceiling is what sets the morph's length below:
   every extra 0.1vh of morph costs the first title roughly another 15 points of
   opacity. Fixing it properly means changing the engine's scene-0 copy curve
   from a decay into a rise-and-hold, which is not a CONFIG value.
   ────────────────────────────────────────────────────────────────────────── */

/* Geometry is repositioning, the object's exit is an exit, the rail's copy and
   the whole arrival are entries. The three shared tokens, used for exactly what
   they name — built into easing functions because `useTransform` takes those
   rather than the bezier tuple a `transition` does. The numbers still come from
   motion.ts.

   WHY MOST OF THIS IS THE SITE'S GENTLE `inOut`. The motion-craft guidance this
   morph was rebuilt against is right that the built-in easings are too weak for
   UI, and it is arguing about the CLOCK rather than about taste: that advice
   describes TIME-DRIVEN animation, where a strong curve buys a fast, confident
   start the user reads as responsiveness. `p` is not driven by time. It is
   driven by the reader's own scroll, so the curve is not pacing the move — it
   is pacing the move AGAINST THE FINGER, and a curve with a long flat head
   means the sheet visibly refuses to follow the first part of the gesture.
   Direct manipulation wants something close to linear. The one clock on this
   component that IS time-driven — `draw`, the arrival — takes the strong advice
   unreservedly, and every one of its sub-ranges eases OUT, never in.

   THE GLASS IS THE ONE EXCEPTION, AND IT IS DELIBERATE. The complaint this
   curve answers is that the morph reads as a box being resized rather than as a
   plane travelling — and `inOut`'s soft shoulders are a real suspect, because
   over a move this large a gentle curve never gives either end of the travel a
   moment of decision. `GLASS` is the standard strong in-out, used for the pane
   and the picture geometry ONLY, so the plates leave the walls with intent and
   decelerate hard into their landed edges instead of easing to a stop near
   them. Its flat head is the price, and it is paid where it does not show: the
   pane's range opens at 0.22, twelve hundredths before the disk has finished
   going into the slot, so the reader is watching the object, not the sheet.

   IT IS LOCAL, ON PURPOSE. It is not added to `src/app/lib/motion.ts` and it is
   not proposed as a token. Adopting a stronger ease ladder across the site is a
   design-system decision that belongs to the owner and to one considered pass
   over every surface, not to whichever component happened to be open. Nothing
   but the two geometry values below may use it. */
const bezier = (e: readonly [number, number, number, number]) =>
  cubicBezier(e[0], e[1], e[2], e[3]);
const MORPH = bezier(motionEase.inOut);
const GLASS = cubicBezier(0.77, 0, 0.175, 1);
const OUT = bezier(motionEase.in);
const IN = bezier(motionEase.out);

/* Fraction of the viewport the three beats spend. Short on purpose: see THE
   COST above — this number is bought directly out of scene 1's title. */
const SPAN = 0.26;
/* …and the release that follows it, as a fraction of the same. */
const RELEASE = 0.27;

/* The arrival. `draw` is driven linearly across this and every sub-range below
   carries its own easing, so the sequence has one clock rather than fourteen. */
const DRAW_MS = 1000;
/* Beyond this much scroll on load, the drawing has already left the screen by
   the time it would finish, so it is skipped to its final state. */
const DRAW_SKIP = 0.1;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/* THIS FILE READS NOTHING OUT OF THE ENGINE'S SECTION TABLE, and that is worth
   keeping true. It held two fractions of it for a while — the scroll positions
   chapter 7's leg starts and peaks at — to bring a fixed CTA overlay up with
   that chapter's title. The buttons are the sign-off's own `cta` again, so the
   engine holds them and the numbers are gone. The one scroll fraction the route
   still needs written down, the point the ending's buttons become reachable,
   lives in world.css beside the waymarker table it is derived from, which is
   where anything of that kind belongs (world.css, THE BUTTON AT THE ENDING). */

/* ── THE DISK, IN ITS OWN UNITS ───────────────────────────────────────────
   A 188 × 200 viewBox — 0.94, the real proportion of a 3.5" disk (90 × 94mm),
   and the exact ratio `--wgc-card-w` derives from `--wgc-card-h` in world.css.
   Those two numbers must agree or the drawing letterboxes inside its own box.

   Every shape is a `<path>` rather than a `<rect>` — a hold-over from the line
   version, kept because the bevel below draws each shape three times at three
   offsets and one `d` string is cheaper to translate than three elements'
   worth of x/y attributes.

   The HTML type layer is positioned in percentages of this same box; the
   percentages are noted against the shapes they sit inside. */
const roundRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}` +
  `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}` +
  `V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;

/* THE SHELL, WITH ITS CORNER CUT. Every fraction below is measured off
   screenshots/glass/card-treatment/floppy.png and converted into these units, so
   the silhouette is the object rather than an impression of it.

   The chamfer is the detail that makes it read as a floppy and nothing else, and
   it is 22 × 22 — a true 45°, the same in both axes because the box is 0.94 and
   22/188 of the width is the same physical length as 22/200 of the height. It
   lives HERE ONLY. It used to be cut out of the glass in CSS as well, back when
   the glass was this object's mount and the two silhouettes had to agree; the
   glass is a desk now, and it retires with the rest of the object under the cut
   rather than needing a scroll range of its own. */
const BODY =
  "M8 3H163L185 25V192A5 5 0 0 1 180 197H8A5 5 0 0 1 3 192V8A5 5 0 0 1 8 3Z";
/* The shutter RECESS — the step moulded into the top of the shell that the
   metal slides in. An open path: down the left shoulder, across the floor, back
   up the right. Leaving it out was what made the first pass read as a card with
   a rectangle on it; the step is what gives the top of the object depth. */
const RECESS = "M35 3V66H150V3";
/* The metal shutter and its window, offset right of centre — the one piece of
   asymmetry the silhouette needs. */
const SHUTTER = roundRect(38, 6, 76, 56, 2);
const WINDOW = roundRect(117, 10, 25, 48, 2);
/* The paper label. It is BIG — 38.5% to 94% of the height and 76% of the width,
   which is what the reference's is, and it is the reason the greeting had to
   move onto the label rather than float above it: a literal disk has no open
   plastic left in the middle.

   IT IS CENTRED ON THE SHELL, and it was not. `BODY` runs x3 to x185, so the
   paper's own centre is x94 and a 143-wide plate starts at x22.5. It used to
   start at x25 — 22 units of bare plastic down the left, 17 down the right —
   which is only 2.5 units out but reads plainly as a sticker applied crooked,
   because the two margins are the same colour, the same height and directly
   comparable across the widest part of the object. Nothing else on the disk was
   asked to move: the plate keeps its 143 measure, so no type reflows.

   THE OFFSET WAS NEVER THE ASYMMETRY THE OBJECT WANTED. That job is done, on
   purpose, by the shutter sitting right of centre and by the single write-protect
   window answering it (see both notes). Those are hardware reading as hardware.
   A label a couple of units off its own centre line is not an echo of them, it is
   an error, and it lands on the one element a reader's eye squares up first.

   The vertical is NOT symmetrical and should not be: the paper runs y77 to y188
   against a shell ending at y197, because the shutter's recess owns the top of
   the object. A label centred vertically would sit in the recess. */
const LABEL = roundRect(22.5, 77, 143, 111, 3);
/* The write-protect window, in the bottom-RIGHT corner beside the label rather
   than sitting under it.

   THERE IS ONE, NOT A PAIR. A square in each bottom corner bracketed the label
   symmetrically, and a symmetrical pair of marks stops reading as hardware and
   starts reading as decoration — two full stops at the end of the object. One
   window off to the right also answers the shutter, which is itself offset
   right of centre: the asymmetry at the top of the disk gets an echo at the
   bottom instead of being cancelled by a centred pair.

   IT IS CENTRED IN THE STRIP IT SITS IN, the 19.5 units of bare shell between
   the label's right edge at x165.5 and the shell's own right edge at x185. A
   10-wide window centres at x170.25, leaving 4.75 either side. It once sat at
   x170 against a 17-unit strip — 2 units off the label, 5 off the shell — which
   read as a window that had drifted toward the paper rather than one moulded
   into the margin. Same move as the insertion arrow at the other end of the
   object: a mark centres in its own panel, and the panel is whatever two edges
   bound it.

   SO THIS NUMBER IS DOWNSTREAM OF THE LABEL'S. Centring the plate widened the
   strip by 2.5 units and the window had to follow it left by half of that, or
   the rule above would have quietly stopped being true — the mark would have
   been sitting 2.5 units off the middle of its own panel while claiming to be
   centred in it. Move `LABEL` and re-derive this in the same pass.

   Only the horizontal is a choice. Vertically there is nothing to centre it
   in — the space below the label runs y188 to the shell's bottom at y197, nine
   units for a form twelve deep, so the window has to overlap the label's band
   and sits where the label's lower corner puts it. */
const HOLE_R = roundRect(170.25, 173, 10, 12, 1.5);
/* The insertion arrow, on the raised shoulder LEFT of the recess. It is an icon
   rather than a bare chevron: an up arrow ringed by a circle, which is the mark
   a real drive bezel carries.

   The one mark that is a LINE rather than an area, so it is the one thing here
   with a stroke — but the stroke is a tone off the ladder, not an outline: a
   groove cut into the plastic, with one lit sliver under it, exactly like every
   plate marked `sunk` below (world.css, THE ARROW IS THE RECESS'S OWN TONE).

   IT IS CENTRED IN THE SHOULDER, NOT PUSHED INTO THE CORNER. The shoulder is
   the panel bounded by the shell's left edge at x3 and the recess's left wall
   at x35, running from the top edge at y3 down to the recess floor at y66 —
   so its middle is 19, 34.5 and the ring sits at 19, 34. Off-centre it reads as
   a sticker that slipped; in the middle it reads as moulded in.

   r8 leaves 8 units of clear shell on every side of the ring, which is what
   keeps a mark this small from crowding either the recess wall or the shell's
   own rounded corner. The arrow inside runs 38 → 30, centred in the ring with
   4 units of air above and below, so the icon still reads at the size the disk
   shrinks to on a phone. */
const ARROW =
  "M11 34A8 8 0 1 1 27 34A8 8 0 1 1 11 34ZM19 38V30M15.5 33.5L19 30L22.5 33.5";

/* ── HOW A FORM IS SEPARATED FROM ITS NEIGHBOUR ───────────────────────────
   NOT BY AN OUTLINE. Every plate is opaque and every boundary on the object is
   a step in tone plus this: the same path painted twice more, offset a hair up
   and a hair down, in a light and a dark that are pure light rather than pigment
   (world.css, THE TONAL LADDER). The base plate covers everything but a sliver
   at the top and bottom edge, which is exactly what a moulded edge shows.

   Flipping which sliver is light says whether the form stands PROUD (light on
   top, shadow under it) or is SUNK INTO the shell (shadow at the top of the
   opening, light on its floor) — one boolean per plate, and it is the whole
   difference between a shutter and a hole.

   0.9 of the drawing's 188 units renders about 1px on a phone and about 1.6px at
   1440: a bevel, not a border. It scales with the object, which for a physical
   thing is the honest behaviour. */
const BEVEL = 0.9;

function Plate({ d, tone, sunk }: { d: string; tone: string; sunk?: boolean }) {
  const k = sunk ? -1 : 1;
  return (
    <>
      <path
        className="wgc__bev wgc__bev--lit"
        d={d}
        transform={`translate(0 ${BEVEL * -k})`}
      />
      <path
        className="wgc__bev wgc__bev--dim"
        d={d}
        transform={`translate(0 ${BEVEL * k})`}
      />
      <path className={tone} d={d} />
    </>
  );
}

/* THE SHUTTER'S TRAVEL, in the same units. Closed, the metal sits hard right in
   its recess with the window completely under it: 38 + 28 = 66 to 142, which is
   the window's own right edge, and still inside the recess's 35→150. What is
   left uncovered on its left is the bare step, which is what reference b shows
   at rest. Open, it is back at its authored 38 and the window is the dark note.
   Change SHUTTER or WINDOW and re-derive this number: it is WINDOW's right edge
   minus SHUTTER's. */
const SLIDE = 28;

/* ── COMPOSING THE TWO CLOCKS ─────────────────────────────────────────────
   Everything on the disk is under two independent progress values: `draw`
   (mount, once) and `p` (scroll, scrubbed both ways). Where a single property
   is driven by both they have to be composed rather than fought over, because a
   MotionValue on `style` and an `animate` prop on the same property would race.

   THERE IS ONLY ONE SUCH PROPERTY LEFT, and that is the measure of how much the
   insertion simplified this file. `useFade` (the product of an arrival and an
   exit) and `useSpan` (their minimum, for extents) both existed to let a part
   of the object arrive on one clock and leave on the other. No part of the
   object leaves on its own any more — the slot takes all of them — so every
   fade here is arrival-only and both helpers are gone. What survives is the
   shutter, whose travel is a SUM: how far the arrival has slid it open, plus
   how far the exit has slid it back. */
function useLift(
  draw: MotionValue<number>,
  inR: [number, number],
  rise: number,
  p: MotionValue<number>,
  outR: [number, number],
  exit: number,
) {
  const on = useTransform(draw, inR, [rise, 0], { ease: IN, clamp: true });
  const off = useTransform(p, outR, [0, exit], { ease: OUT, clamp: true });
  return useTransform([on, off], ([a, b]: number[]) => a + b);
}

export function WorldGlassCard() {
  const reduce = useReducedMotion();
  /* `scrollY` only. `scrollYProgress` was destructured here as well, for the
     retired CTA ramp — the one value on this component that was a fraction of
     the whole flight rather than of the object's own morph. Everything left
     here is measured in pixels from the top of the page. */
  const { scrollY } = useScroll();

  /* Read through a ref rather than state: the morph's length follows the
     viewport, but re-rendering would tear down and rebuild thirty MotionValue
     chains for a number the transform can just look up on the frame it needs. */
  const spanRef = useRef(220);
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let laidOutW = window.innerWidth;
    const measure = () => {
      spanRef.current = Math.max(180, window.innerHeight * SPAN);
    };
    measure();
    /* Mobile browsers fire `resize` every time the URL bar slides; the engine
       ignores height-only changes on touch for the same reason (scrub-engine.js,
       onResize) and so does this, or the morph's length would shift under the
       reader mid-scroll. */
    const onResize = () => {
      if (coarse && window.innerWidth === laidOutW) return;
      laidOutW = window.innerWidth;
      measure();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  const scrubbed = useTransform(scrollY, (y) => clamp01(y / spanRef.current));
  /* Reduced motion lands on the settled rail and stays there: the panel is the
     margin from the first frame, the world has already given ground, the
     masthead is set, and nothing moves. A frozen mid-morph would be neither. */
  const settled = useMotionValue(1);
  const p = reduce ? settled : scrubbed;

  /* ── the arrival's own clock ───────────────────────────────────────────── */
  const draw = useMotionValue(0);
  useEffect(() => {
    /* Reduced motion gets the assembled object with no assembly: the sequence is
       decoration, and a 1s parade of plates sliding into place is precisely the
       kind of movement the preference exists to remove. Every part is at its
       seat, the shutter is open, the bevels are lit. */
    if (reduce || window.scrollY > spanRef.current * DRAW_SKIP) {
      draw.set(1);
      return;
    }
    const controls = animate(draw, 1, {
      duration: DRAW_MS / 1000,
      ease: "linear",
      delay: 0.12,
    });
    return () => controls.stop();
  }, [reduce, draw]);

  /* ── beat 0 · the object is assembled, then it is PUT AWAY ─────────────────

     AN OPAQUE OBJECT CANNOT LEAVE BY FADING. That still holds and it is the
     lesson of the first solid pass, but the conclusion drawn from it has now
     been drawn twice and the second one is the right one.

     THE OBJECT GOES IN WHOLE. NOTHING ON IT LEAVES SEPARATELY. That is the rule
     this beat is built on now, and it replaces a staged disassembly in which
     the light went, then the marks, then the writing, then the body — each on
     its own little range. Every one of those was a workaround for an exit that
     could not carry the parts with it. This one can: a thing being put into a
     slot takes its own surface with it, because a label does not evaporate off a
     disk in the second before you push it into a drive. The type, the two
     write-protect marks, the insertion arrow and the lit bevels now hold at
     full strength until the mouth of the slot takes them, and they are taken in
     the order they meet it — which is the object's own geometry doing the
     sequencing rather than eight hand-tuned ranges pretending to.

     THE ONE EXCEPTION IS THE SHUTTER, and it is an exception for a physical
     reason rather than an aesthetic one. A disk in your hand has a CLOSED
     shutter; the drive is what slides it open, and it springs shut the moment
     the disk comes back out. So the metal running shut just before the object
     starts moving is not a part leaving early — it is the object returning to
     the state a disk is in when it is not in a drive, which is precisely the
     state it needs to be in to go into one.

     THE EXIT IS AN INSERTION, and that is the correction to the version before
     this one. The object used to be taken away by a horizontal cut running up
     the drawing: correct in principle, since a cut is not a fade, but in
     practice one straight line crossing a solid rectangle is a WIPE, and a wipe
     is the one thing on this page that has no physical explanation. The reader
     sees the object stop existing from the bottom up for no stated reason.

     So it leaves the way a floppy disk leaves a desk: it slides UP and is taken
     in, shutter edge first, exactly as you would push one into a drive. Nothing
     about that had to be invented — THE OBJECT IS ALREADY LABELLED WITH IT. The
     insertion arrow moulded into the shell's left shoulder is an up arrow in a
     ring, which is the mark a real drive bezel carries, and it has been pointing
     at this move since the drawing was made. The exit is now the instruction on
     the object being followed.

     WHAT IT DISAPPEARS INTO is the top edge of its own box. The SVG viewport
     clips at 188 × 200 and the shell's top sits at y3, so the mouth of the slot
     is three units above where the object has been lying all along — it is not
     a new place, it is the line the object was already touching. `.wgc__slot`
     draws that line on the glass as the move starts, so the object goes into
     something rather than into nothing; see world.css.

     Because the SVG's own viewport does the clipping, the exit needs no clip
     path at all. `wgc-take` is therefore an ARRIVAL-ONLY extent now, no longer
     a `useSpan` min-composition against the scroll: filling DOWNWARD from the
     top, the case is formed rather than revealed, and once assembled the rect
     covers the whole box and never moves again.

     ORDER SURVIVES THE CHANGE, and it is still geometric — it has simply
     rotated. The cut took the label first because the label sits at the bottom;
     the slot takes the shutter first because the shutter sits at the top. Both
     are last-in-first-out against the assembly. The CSS drop-shadow rides along
     and is clipped by the same viewport, so no part of the object ever casts a
     shadow it no longer has.

     THE TYPE IS HTML AND HAS NO SVG VIEWPORT TO CUT IT, which is the one place
     this costs something. It rides on `.wgc__carry`, a full-box wrapper that
     takes the same travel expressed as a percentage of the disk's height, and
     `.wgc__well` clips both layers at the same line. The travel had to go on a
     wrapper rather than on `.wgc__label` itself because a percentage in
     `translateY` resolves against the ELEMENT's own height, and the label is
     55.5% of the box — the same number would have moved it not quite twice as
     far as the drawing. The wrapper is the box, so 100% means the box.

     Each plate also rises the last few UNITS OF THE DRAWING into its seat on the
     way in, which is why the rises are 3 to 5 rather than a pixel count: they are
     measured in the object, so they scale with it and none of them can carry a
     plate outside the shell mid-flight (checked against each shape's bounds). */
  const take = useTransform(draw, [0.08, 0.36], [0, 1], {
    ease: IN,
    clamp: true,
  });
  const takeH = useTransform(take, (v) => v * 200);

  /* THE TRAVEL, in the drawing's own units so it scales with the object at every
     viewport. 212 rather than 200: the shell's bottom is at y197 and the contact
     shadow falls a few units below it, so the last of the shadow has to clear the
     mouth too or the object leaves a smudge hanging in the slot.

     IT STARTS AT 0.06 NOW, not 0.15. The old number was set by the type: the
     writing had to be clear of the object before the object could move, and the
     last block finished at 0.15. The writing rides along now, so the only thing
     left to wait for is the shutter, which is shut at 0.13 — and even that is a
     soft constraint, because the metal closes as the object begins to lift, the
     way a disk is picked up and squared off in the same movement. It closes at
     0.34, four hundredths after the sheet has started to travel at 0.22, so the
     reader never watches one thing at a time.

     EASED OUT, NOT IN-OUT. This is an exit — it should accelerate away rather
     than decelerate into its own disappearance, which is the one place on this
     component where the time-driven easing advice applies unchanged to a
     scrubbed value, because the end of the range is off-screen and there is
     nothing to arrive AT. */
  const insert = useTransform(p, [0.06, 0.34], [0, -212], {
    ease: OUT,
    clamp: true,
  });
  /* The same travel as a fraction of the disk's BOX rather than of the drawing's
     units — 200 units is the full height, so halving the value converts it. It
     drives the HTML type layer, which has no viewBox of its own. */
  const insertPct = useTransform(insert, (v) => `${v / 2}%`);
  /* The mouth, and it is the shortest-lived thing on the page: up just before
     the object reaches it, gone once the object is through. A slot that outlives
     the disk is a scratch on the glass. */
  const slotOpacity = useTransform(p, [0.12, 0.19, 0.32, 0.42], [0, 1, 1, 0], {
    ease: MORPH,
    clamp: true,
  });
  const stepOpacity = useTransform(draw, [0.24, 0.46], [0, 1], {
    ease: IN,
    clamp: true,
  });
  const stepY = useTransform(draw, [0.24, 0.46], [3, 0], {
    ease: IN,
    clamp: true,
  });
  const metalOpacity = useTransform(draw, [0.32, 0.52], [0, 1], {
    ease: IN,
    clamp: true,
  });
  const metalY = useTransform(draw, [0.32, 0.52], [4, 0], {
    ease: IN,
    clamp: true,
  });
  /* THE ONE MOVE THE OBJECT MAKES ITSELF, and the ONE part that still has an
     exit of its own. The metal arrives closed over the window and runs open
     along its own axis; on the way out it runs shut again, ahead of everything,
     because a disk out of a drive has a closed shutter and that is the state it
     has to be in to be pushed into one. The window is never faded at all — it is
     uncovered and covered, which is what a shutter is for. */
  const shutterX = useLift(draw, [0.5, 0.76], SLIDE, p, [0.02, 0.13], SLIDE);
  const labelOpacity = useTransform(draw, [0.5, 0.7], [0, 1], {
    ease: IN,
    clamp: true,
  });
  const labelY = useTransform(draw, [0.5, 0.7], [5, 0], {
    ease: IN,
    clamp: true,
  });
  /* The two write-protect marks and the insertion groove. Moulded INTO the
     plastic, so they cannot leave it: arrival only, and the slot takes them with
     the shell they are cut into. */
  const markOpacity = useTransform(draw, [0.66, 0.8], [0, 1], {
    ease: IN,
    clamp: true,
  });
  /* THE LIGHT, LAST. Up to here the plates are flat colour butted against flat
     colour; this is the pass that puts a lit and a shaded sliver on every edge
     and turns the assembly into a moulding. Published as one custom property on
     the svg rather than as thirty opacities.

     IT USED TO GO FIRST ON THE WAY OUT — "the light leaves before the object
     does" — which was a nicety bought with a lie: an object still sitting in
     plain view on a lit desk does not stop catching the light. It was there to
     soften a wipe. There is no wipe now, so the bevels stay lit right up to the
     mouth of the slot and go out because they are inside it. */
  const bevelOpacity = useTransform(draw, [0.74, 0.94], [0, 1], {
    ease: IN,
    clamp: true,
  });
  /* THE GLASS IS PUT DOWN FIRST, and that is the deliberate part of the new
     arrival: the sheet is no longer something that condenses out of the drawing,
     it is the table the object is set on, so it has to be there before the shell
     lands at 0.08. It then never leaves — it is the panel's own surface from
     here on. At full bleed this beat is also the moment the WORLD goes soft:
     one 200ms frost over the whole viewport, and the garden the reader can
     already see turns to a wash for the duration of the object's visit. */
  const frost = useTransform(draw, [0, 0.2], [0, 1], { ease: IN, clamp: true });

  /* ── what is written on the label ─────────────────────────────────────────
     Sets top to bottom, the way a label is read: the header block, the rule
     under it, the field it exists to carry, the second rule, the footer row. The
     greeting lands in the middle rather than last, because it is the hero value
     and the row after it is footnote.

     IT IS WRITTEN ONCE AND NEVER UNWRITTEN. Every block here is arrival-only
     now: no `p`, no exit range, no lift-and-fade on the way out. The label goes
     into the slot with the disk it is stuck to, and `.wgc__well` cuts each line
     of it at the mouth as it passes.

     THE ORDER OF THE FADES USED TO BE A REAL PROBLEM and it is worth recording
     why, because it is the clearest evidence that the staged exit was a
     workaround rather than a design. The old cut ate the object from the BOTTOM
     edge up, so the footer row — nearest that edge — had to be gone EARLIEST or
     there was a band of scroll where two lines of type stood on bare glass with
     their plate already taken. Its range had to be hand-moved to dodge the cut.
     Now the geometry sequences it for free and in the right direction: the slot
     takes the identity block first because the identity block sits at the top,
     and the footer row is the last thing still readable, which is also the order
     a hand would feed the disk in. */
  const nameOpacity = useTransform(draw, [0.58, 0.8], [0, 1], {
    ease: IN,
    clamp: true,
  });
  const nameY = useTransform(draw, [0.58, 0.8], [12, 0], {
    ease: IN,
    clamp: true,
  });
  const ruleOpacity = useTransform(draw, [0.66, 0.84], [0, 1], {
    ease: IN,
    clamp: true,
  });
  /* The hairline's opacity and its extent were two values because they composed
     differently against the exit — a product for the fade, a minimum for the
     length. With no exit to compose against, both reduce to the same arrival
     ramp, so they are the same value rather than two identical ones. */
  const ruleScale = ruleOpacity;
  const helloOpacity = useTransform(draw, [0.72, 0.94], [0, 1], {
    ease: IN,
    clamp: true,
  });
  const helloY = useTransform(draw, [0.72, 0.94], [12, 0], {
    ease: IN,
    clamp: true,
  });
  const footOpacity = useTransform(draw, [0.86, 1], [0, 1], {
    ease: IN,
    clamp: true,
  });
  const footY = useTransform(draw, [0.86, 1], [10, 0], {
    ease: IN,
    clamp: true,
  });

  /* ── beat 1 · the sheet travels ───────────────────────────────────────────
     THE SHEET GOES ONE WAY, AND ONLY ONE WAY, FOR AS LONG AS IT IS TRAVELLING.
     That is the whole of this beat and it is the correction the desktop layout
     needed: the pane used to pull all four insets at once, so the single move
     the page is built on was a rectangle contracting, and a rectangle
     contracting is a box being resized no matter how it is eased. Split in two,
     it is a plane sliding off a picture and then settling into a frame.

     The two phases below are SEQUENTIAL, with six hundredths of overlap. The
     overlap is what makes it one gesture with a change of direction rather than
     two moves stitched together; more than that and the two axes blur into the
     contraction this beat exists to stop being.

       `paneTrail`  --wgc-pt   PHONE ONLY. The band's top edge running down to
                               the head of the band, three edges pinned. It keeps
                               the range it has always had, because the phone
                               never had this problem: a full-width band travels
                               on one axis and needs no second phase. The move
                               the desktop is being given here is the one the
                               phone has been making all along.
       `paneRun`    --wgc-px   DESKTOP phase A. The trailing edge runs LEFT to
                               the panel's far edge. Top, bottom and left stay on
                               the walls; the sheet is full viewport height the
                               whole way and has no corner radius, because a
                               sheet flush to three walls cannot have one.
       `paneSet`    --wgc-ps   DESKTOP phase B. Only then does it take its
                               height: top and bottom pull in to the plate, the
                               left comes off the wall, the corners round, and
                               the lit travelling edge hands over to the hairline
                               the picture beside it takes.

     PHASE A OWNS THE RANGE, and by more than the numbers suggest. 0.42 of the
     morph against phase B's 0.30 — but A crosses about 1040px at 1440 against
     B's 225px of height off each end, so edge for edge the sheet is moving
     roughly three times faster during the phase the reader is actually
     watching. That ratio is the read: fast sideways, then settle.

     ON `GLASS` RATHER THAN `MORPH`: see the note on the constant. These are the
     values the reader is judging, so they get the curve with a decision at each
     end — and here the curve earns its keep twice, because phase B decelerating
     hard into its edges is what stops the handover reading as a second move. */
  const paneTrail = useTransform(p, [0.22, 0.92], [0, 1], {
    ease: GLASS,
    clamp: true,
  });
  const paneRun = useTransform(p, [0.22, 0.64], [0, 1], {
    ease: GLASS,
    clamp: true,
  });
  const paneSet = useTransform(p, [0.58, 0.88], [0, 1], {
    ease: GLASS,
    clamp: true,
  });
  /* THE EDGE ARRIVES BEFORE THE MOVE DOES, by four hundredths — see the note of
     that name. It is a pure entry with no exit here: what happens to it later is
     a change of MATERIAL rather than a fade, and it is written in world.css
     against phase B. Through phase A it is the lit trailing edge with its shadow
     falling into the scene, at both sizes, which is what makes the travel read
     as a sheet with thickness rather than as a boundary drawn on the picture.
     On `GLASS` the ordering reads harder than it used to, because the sheet is
     under eight percent of the way across by the time it is lit — about 79px of
     phase A's 1040 at 1440. */
  const edgeOpacity = useTransform(p, [0.18, 0.34], [0, 1], {
    ease: IN,
    clamp: true,
  });

  /* ── beat 2 · the picture follows the sheet in ────────────────────────────
     WHAT THIS DRIVES IS NOT THE SAME THING AT BOTH SIZES, and the old note here
     only described the phone.

     Below 861px it is THE GIVE: the film's own bottom edge pulls up so the band
     reads as making room rather than merely covering, and the frame shift and
     the underlay follow it. The one invariant that binds is that the film's
     pulled-in edge must stay under the sheet — true at every p, because the
     give tops out near 90px against a band of 52svh.

     Above 861px there is no give at all (world.css, NOTHING GIVES GROUND AND
     NOTHING SHIFTS). This is the PICTURE'S OWN GEOMETRY: `.sw-stage` drawing
     off the four walls into its plate beside the panel, and — new — the mount's
     hairline frame travelling in behind it from the same walls.

     IT RUNS WITH PHASE B, NOT WITH PHASE A, and that is the call this beat
     turns on. Through phase A the film must stay FULL BLEED, because the sheet
     running left uncovers a full-height column of it and the only motion on
     screen has to be horizontal — a picture shrinking into a plate while the
     sheet sweeps across it puts a vertical move under a horizontal one and the
     sweep stops reading as a sweep. It is also the exact failure this pass is
     correcting, one layer down: two rectangles contracting on one clock.

     So the picture holds still, at full bleed, and is simply uncovered. Then at
     0.54 — four hundredths ahead of phase B, where phase A is about 95% spent
     and the trailing edge has all but arrived — the closing gesture starts, and
     the
     panel and the picture take their height TOGETHER. That synchrony is right
     here and would have been wrong before: the division has already happened,
     horizontally, so what is left is one frame closing on both sides at once
     rather than one rectangle being halved.

     THE FOUR HUNDREDTHS OF LEAD ARE NOT DECORATION. Phase B brings the panel's
     left inset off the wall, and what is behind the panel is film, so the film
     has to have started drawing in or a strip of sharp full-bleed picture opens
     at the left window edge before the paper is there to receive it. */
  const move = useTransform(p, [0.54, 0.9], [0, 1], {
    ease: GLASS,
    clamp: true,
  });

  /* ── beat 3 · and the glass turns out to be paper ─────────────────────────
     DESKTOP ONLY IN EFFECT, because only the desktop layout lands as a solid
     (world.css, THE GLASS IS NOT DELETED, IT LANDS AS PAPER). Below 861px the
     band stays glass to the foot of the page and nothing reads this value.

     It used to ride the pane's own geometry, so the panel changed material and
     position on one ramp and the reader never saw it arrive as anything: a
     sheet that is already halfway to being paper while it is still travelling
     is neither.

     IT STARTS WHERE PHASE B ENDS, at 0.88, and that is now literal rather than
     approximate: the pane's last frame of movement is the frame before this
     value leaves zero. The picture has essentially arrived by then too, so
     the material change is genuinely the last thing that happens, alone, on a
     composition that has stopped. It is the shortest beat on the page — about
     26px of scroll at a 900px window — which is defensible for a tonal
     crossfade with no geometry in it, but it is the first number to lengthen if
     the landing ever feels snapped rather than set.

     It also carries the frost's blur down with it, which is the honest version
     of "modulate blur to bridge two states": the lens loses its depth INTO the
     paper rather than the paper cross-dissolving over a lens still at full
     strength. The backdrop filter is a no-op behind an opaque plate for the
     thirteen viewports after this lands, and world.css already records that as
     an unpaid cost; this is what pays it. */
  const paper = useTransform(p, [0.88, 0.99], [0, 1], {
    ease: IN,
    clamp: true,
  });

  /* ── and the site masthead sets on what landed ────────────────────────────
     THIS COMPONENT RENDERS NO MASTHEAD OF ITS OWN ANY MORE. There used to be a
     lockup printed on the landed glass at the head of the copy column — the
     name, the role, and the disk's own hairline redrawn as the column's head
     rule. It is gone: the site's masthead (SiteHeader, page.tsx) now runs the
     full width of the frame and carries the identity, so a name in the left
     column was the third place the reader met it in one screen.

     `brand` SURVIVES THE DELETION, and it is the reason this value is still
     here at all. It is the beat the plate hands the name over on, published
     below as `--wgc-brand` / `--wgc-brand-vis` and ridden by `.sw-masthead` in
     world.css. Nothing in this subtree consumes it. Delete it and the site
     masthead loses its arrival and simply exists at scroll 0, on top of the
     object, which is the one thing the opening move is built to avoid. */
  const brand = useTransform(p, [0.66, 0.92], [0, 1], {
    ease: IN,
    clamp: true,
  });

  /* ── then, and only then, the first title arrives ─────────────────────── */
  const gate = useTransform(scrollY, (y) => {
    const s = spanRef.current;
    return IN(clamp01((y - s) / (s * RELEASE)));
  });
  const open = useMotionValue(1);
  const copy = reduce ? open : gate;

  /* NOTHING IS PUBLISHED FOR THE END BUTTONS. A `--wgc-cta` ramp used to be
     derived here, to fade a fixed CTA overlay up over chapter 7 and hold it to
     the foot of the page. The buttons are the sign-off's own `cta` again, so
     the engine's per-scene copy opacity brings them in and holds them, and
     there is nothing left for this file to drive. */

  /* Five values belong to nodes outside this subtree — two the engine's copy
     layer, one the site masthead's, one the standing exit's, and one the pane's
     own `::after`, which is a pseudo-element and therefore unreachable from
     React at all — so they are published on the document element and read back
     in world.css. Written imperatively from the MotionValue: no React render per
     scroll frame. */
  const brandVisRef = useRef("");
  useMotionValueEvent(brand, "change", (v) => {
    const root = document.documentElement;
    root.style.setProperty("--wgc-brand", String(v));
    /* Hidden means hidden: an invisible brand link that still takes clicks and
       tab stops is a defect, so it leaves the tab order until it is on screen.
       Only written when it crosses, not on every frame. */
    const vis = v > 0.02 ? "visible" : "hidden";
    if (vis !== brandVisRef.current) {
      brandVisRef.current = vis;
      root.style.setProperty("--wgc-brand-vis", vis);
    }
  });
  useMotionValueEvent(move, "change", (v) => {
    document.documentElement.style.setProperty("--wgc-move", String(v));
  });
  useMotionValueEvent(paper, "change", (v) => {
    document.documentElement.style.setProperty("--wgc-paper", String(v));
  });
  /* The copy gate publishes a visibility crossing as well as its ramp, for the
     one consumer that is a CONTROL rather than type: the standing exit
     (world.css, THE STANDING EXIT'S ONLY `filter` AND ONLY `visibility`).
     `filter: opacity(0)` hides pixels and leaves a tab stop behind, so a
     keyboard reader on the floppy screen would land on an invisible "Skip to the
     work" with its focus ring drawn off-screen.

     IT IS WRITTEN WHEN GATED AND REMOVED WHEN NOT, where `--wgc-brand-vis` above
     writes both keywords. That asymmetry is the whole reason it works: the exit
     has a SECOND visibility switch downstream (the handover), `visibility` is a
     keyword and cannot be multiplied the way the two opacity terms are, so the
     stylesheet composes them as a `var()` fallback chain — and a chain can only
     fall through a property that is ABSENT. Publishing "visible" here would pin
     the link visible for the rest of the page and strand the handover's switch.

     Still one write per crossing rather than one per frame. The engine's own copy
     layer does not read this — its links have their own scroll-range switch. */
  const copyVisRef = useRef("");
  useMotionValueEvent(copy, "change", (v) => {
    const root = document.documentElement;
    root.style.setProperty("--wgc-copy", String(v));
    const vis = v > 0.02 ? "" : "hidden";
    if (vis !== copyVisRef.current) {
      copyVisRef.current = vis;
      if (vis) root.style.setProperty("--wgc-copy-vis", vis);
      else root.style.removeProperty("--wgc-copy-vis");
    }
  });
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--wgc-brand", String(brand.get()));
    root.style.setProperty(
      "--wgc-brand-vis",
      brand.get() > 0.02 ? "visible" : "hidden",
    );
    root.style.setProperty("--wgc-move", String(move.get()));
    root.style.setProperty("--wgc-paper", String(paper.get()));
    root.style.setProperty("--wgc-copy", String(copy.get()));
    /* Absent means "arrived" — see the crossing guard above. The initial state
       has to agree with it, including the reduced-motion case where the gate is
       already open on the first frame. */
    if (copy.get() > 0.02) {
      copyVisRef.current = "";
      root.style.removeProperty("--wgc-copy-vis");
    } else {
      copyVisRef.current = "hidden";
      root.style.setProperty("--wgc-copy-vis", "hidden");
    }
    return () => {
      root.style.removeProperty("--wgc-brand");
      root.style.removeProperty("--wgc-brand-vis");
      root.style.removeProperty("--wgc-move");
      root.style.removeProperty("--wgc-paper");
      root.style.removeProperty("--wgc-copy");
      root.style.removeProperty("--wgc-copy-vis");
    };
  }, [brand, move, paper, copy]);

  return (
    <div className="wgc">
      {/* THE THREE GEOMETRY VALUES ARE INLINE, not published on the document
          element, because every rule that reads them is this node or a
          descendant of it — unlike `--wgc-move`, `--wgc-paper`, `--wgc-brand`
          and `--wgc-copy`, which belong to the film, the mount and the engine's
          own layers and have nowhere else to be written.

          TWO OF THE THREE ARE INERT AT ANY GIVEN VIEWPORT and that is the
          honest cost of one component serving a band and a plate: below 861px
          only `--wgc-pt` is read, above it only `--wgc-px` and `--wgc-ps`. They
          are not folded into one value because the phone's single-axis travel
          and the desktop's two phases want different ranges, and a `useTransform`
          cannot be re-ranged on resize without tearing down every chain here. */}
      <motion.div
        className="wgc__pane"
        style={
          {
            "--wgc-pt": paneTrail,
            "--wgc-px": paneRun,
            "--wgc-ps": paneSet,
          } as never
        }
      >
        {/* The surface itself. Its own element rather than a background on the
            pane so the arrival can bring it up first, ahead of the object — and
            because `backdrop-filter` is not something to put on a node whose
            opacity is also being driven. */}
        <motion.div className="wgc__frost" style={{ opacity: frost }} />
        {/* …and the sheet's travelling edge: the side facing the picture.

            ITS ARRIVAL IS PUBLISHED AS A PROPERTY, NOT SET AS AN OPACITY, and
            that is not bookkeeping. Above 861px this edge has to be COMPOSED
            with phase B, because the lit trailing edge of a full-height sheet
            and the plain hairline of a landed plate are two different things
            and the second is not the first faded — the handover is written in
            world.css as `--wgc-eo × (1 − --wgc-ps)`. An inline `opacity` would
            win against that rule outright and there would be nothing to
            compose. Below 861px the same property is simply read straight. */}
        <motion.div
          className="wgc__edge"
          style={{ "--wgc-eo": edgeOpacity } as never}
        />
      </motion.div>

      {/* THE DISK IS A SIBLING OF THE SHEET, NOT A CHILD — it is centred in the
          viewport and the sheet's centre travels. Painted after the pane, so it
          lies ON the glass and the frost never blurs it.

          Decoration in the accessibility tree. Everything written on the label
          is a picture of a label; the page's own identity is carried by the
          document title ("The garden — Lizzie Teo"), the site masthead's
          wordmark link, and the served `data-sw-seo` block in page.tsx. */}
      <div className="wgc__disk" aria-hidden>
        {/* THE WELL IS THE SLOT'S INSIDE. Everything that travels lives in here
            and is cut at its top edge, which is the same line `.wgc__slot` draws
            on the glass. The mouth itself is deliberately OUTSIDE it, because it
            overhangs the disk on both sides and this box would clip it. */}
        <div className="wgc__well">
          {/* PAINT ORDER IS THE SECTION THROUGH THE OBJECT, back to front: the
              shell, the step sunk into it with its window, the metal over the
              window, the paper set into the shell's lower well, and the small
              marks moulded into what is left. Nothing here is stroked. */}
          <motion.svg
            className="wgc__svg"
            viewBox="0 0 188 200"
            fill="none"
            focusable="false"
            style={{ "--wgc-bev": bevelOpacity } as never}
          >
            <defs>
              {/* THE ARRIVAL'S CUT, and arrival only. One rect anchored at the top
                of the drawing whose height is the object's own extent, so the
                case FILLS DOWNWARD into existence rather than fading up. Once
                the object is assembled this covers the whole box and is inert;
                the exit is the slot, not a clip. In the drawing's units, so it
                is the same cut at every viewport. */}
              <clipPath id="wgc-take">
                <motion.rect x="0" y="0" width="188" height={takeH} />
              </clipPath>
            </defs>

            {/* `y` carries the whole object into the slot. The CSS drop-shadow and
              the arrival clip both ride the same transform, so the object
              travels as one piece and the SVG's viewport is what cuts it. */}
            <motion.g
              className="wgc__obj"
              clipPath="url(#wgc-take)"
              style={{ y: insert }}
            >
              <Plate d={BODY} tone="wgc__p wgc__p--shell" />

              <motion.g style={{ opacity: stepOpacity, y: stepY }}>
                <Plate d={RECESS} tone="wgc__p wgc__p--step" sunk />
                <Plate d={WINDOW} tone="wgc__p wgc__p--slot" sunk />
              </motion.g>

              <motion.g
                style={{ opacity: metalOpacity, y: metalY, x: shutterX }}
              >
                <Plate d={SHUTTER} tone="wgc__p wgc__p--metal" />
              </motion.g>

              {/* The label is the one plate that has to carry type, so it is the
                  one plate engineered for contrast rather than for looks. */}
              <motion.g style={{ opacity: labelOpacity, y: labelY }}>
                <Plate d={LABEL} tone="wgc__p wgc__p--label" sunk />
              </motion.g>

              <motion.g style={{ opacity: markOpacity }}>
                <Plate d={HOLE_R} tone="wgc__p wgc__p--sunk" sunk />
                {/* The arrow is the one mark that is a line rather than an area,
                    so it takes the same treatment a hair narrower: the recess's
                    own tone for the groove, one lit sliver under it. Same order
                    as `Plate` with `sunk` — bevel first, body over it. */}
                <path
                  className="wgc__mark wgc__mark--lit"
                  d={ARROW}
                  transform={`translate(0 ${BEVEL})`}
                />
                <path className="wgc__mark" d={ARROW} />
              </motion.g>
            </motion.g>
          </motion.svg>

          {/* THE TYPE RIDES ALONG. Same travel as the drawing, expressed against
              the box rather than the viewBox; see THE TYPE IS HTML above for why
              it cannot sit on `.wgc__label` itself. */}
          <motion.div className="wgc__carry" style={{ y: insertPct }}>
            {/* ── WHAT IS WRITTEN ON THE LABEL ─────────────────────────────────
              The reference's own archival structure, with this disk's contents in
              it: an identity block, a hairline, the field the label exists to
              carry, a hairline, a footnote row. Micro-label above value in every
              block, which is the form that makes a label read as catalogued
              rather than as a caption.

              Nothing here is invented. The name and the role are the owner's;
              SUBJECT is what the walk is about and COVERS is the territory the
              seven chapters behind it cover.

              THE FRONT DOOR MOVED TWICE AND THESE VALUES DID NOT MOVE BACK,
              WHICH IS A DECISION RATHER THAN AN OVERSIGHT. They were written
              for a destination page — `/` opened on a static hero, the walk was
              opt in at its own route, and a reader only reached this disk by
              choosing it. The walk is the front door again (the owner's flow,
              20 Aug): this disk is the first object on the site, over the gate,
              at scroll 0, before anything else.

              COVERS NAMES THE TERRITORY, NOT THREE OF THE CHAPTERS, and that is the
              Aug 2026 change. It read "Collaboration, prototyping, testing",
              which was three of the seven legs named concretely — the trouble
              is that those are the three legs EVERY designer's CV claims, so a
              plate meant to introduce this walk introduced a competency list.
              "Complex products, AI workflows" says what the work is ABOUT
              instead, which is the thing the market currently reads as scarce
              and the thing the legs behind it actually demonstrate.

              It is still not a table of contents, and it must not become one.
              An earlier value, "Case studies, explorations, learnings", named
              the BANDS under the flight, and the argument for it has genuinely
              come back now that those bands are on this page. It loses anyway:
              the masthead directly above already sets Work, Explorations and
              Writing in type, eight pixels up, so the label would be repeating
              the navigation.

              THE NUMBERS ARE NOT ON THIS PLATE ON PURPOSE. The four work cards
              one scroll down carry 84%, 30%, 20 to 30% and three months in
              their own outcome beat (work/projects.ts). A disk that recited
              them would be arguing the case twice, and this one is the object
              you meet before the argument starts.

              SUBJECT STAYS "How I work". The one objection to its predecessor,
              "What I do", was that it was the verbatim wording of the masthead
              item the reader had just clicked, so the label confirmed its own
              title. There is no such item any more, so the objection has lapsed
              — but "How I work" is still the better field: the walk is about
              method, and a first-time reader gets more from the question the
              disk answers than from a restatement of the page's subject.

              MEASURED AGAINST THE BUDGET: the pair is now 40 characters against
              the 44 it has been, so this pass SPENDS LESS than its predecessor
              and needs no re-measure. The four characters are not a reserve to
              be claimed later — see the budget note below.

              THE ROW HAS A CHARACTER BUDGET AND IT IS NOT A GUIDELINE. world.css
              (the block above `.wgc__lblfield`) records that at 1000 × 600 this
              stack fills its padding box EXACTLY, with no reserve, and that 1440
              only keeps about 7px in hand BECAUSE THE FOOTER ROW SETS IN ONE
              LINE up there. `.wgc__val` wraps (`text-wrap: pretty`, no nowrap),
              so a longer pair here does not overflow visibly — it silently takes
              a second line and blows the exact fit at the smaller size. The two
              values below total 40 characters, against the 44 they replaced and
              the 45 before that. Anything longer than 44 has to be measured at
              870 × 600 first, which is the binding case (world.css corrects the
              older 1000 × 600 reading in `.wgc__label`).

              The one joke is that the CONTENTS of a designer-with-a-terminal's
              disk are "hello world", and it is the same two words scene 9's
              Macintosh has lettered on its screen — so the plate quotes the far
              end of the walk it opens. */}
            <div className="wgc__label">
              <motion.div
                className="wgc__lblhead"
                style={{ opacity: nameOpacity, y: nameY }}
              >
                {/* THE NAME BELONGS ON THE DISK, and only on the disk. It is
                    the object's own archival label — the thing a catalogue
                    label is for — so it stays here at hero scale through the
                    opening move. What came off is the lockup that used to print
                    it a second time in the copy column once the plate had drawn
                    back; the masthead carries it from that point on. */}
                <p className="wgc__lblname">Lizzie Teo</p>
                <p className="wgc__lblsub">Designer with a terminal</p>
              </motion.div>

              {/* Both rules retract to the left as they go, pointing at where the
                glass is about to be. */}
              <motion.div
                className="wgc__lblrule"
                style={{ opacity: ruleOpacity, scaleX: ruleScale }}
              />

              <motion.div
                className="wgc__lblfield"
                style={{ opacity: helloOpacity, y: helloY }}
              >
                <p className="wgc__micro">Contents</p>
                <p className="wgc__hello">hello world</p>
              </motion.div>

              <motion.div
                className="wgc__lblrule wgc__lblrule--foot"
                style={{ opacity: ruleOpacity, scaleX: ruleScale }}
              />

              <motion.div
                className="wgc__lblrow"
                style={{ opacity: footOpacity, y: footY }}
              >
                <div>
                  <p className="wgc__micro">Subject</p>
                  <p className="wgc__val">How I work</p>
                </div>
                <div>
                  <p className="wgc__micro">Covers</p>
                  <p className="wgc__val">Complex products, AI workflows</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* THE MOUTH OF THE SLOT, on the glass rather than in the drawing, and
            outside the well so its overhang and its shadow are not clipped: the
            object is what moves, and a slot that travelled with it would be a
            marking on the disk instead of an opening in the desk. */}
        <motion.div className="wgc__slot" style={{ opacity: slotOpacity }} />
      </div>
    </div>
  );
}
