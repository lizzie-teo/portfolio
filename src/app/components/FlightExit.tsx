"use client";

import { jumpWouldScrubFilm } from "../lib/use-anchor-scroll";

/* ─────────────────────────────────────────────────────────────────────────
   THE ONE DOOR — "View selected work", a button at the foot of the pane, standing
   from the first paint to the handover into the work band.

   IT IS THE WALK'S ONLY CONTROL, and until Aug 2026 it was one of two. The
   route carried a quiet underlined sentence-link here that faded out across
   leg 8, plus a real button built by the engine inside the sign-off's copy
   article — two objects, one job, handing over to each other at the most
   important moment on the page. Owner's call collapsed them:

     · The escape hatch has to be an OBVIOUS CONTROL from the first screen. A
       recruiter landing on a twelve-viewport film must be able to see the way
       out without scrolling to find it, and a 12px underlined sentence in a
       corner is not that.
     · Once it is a button, in the ending's own style, in the ending's own
       position, saying the ending's own words, a crossfade between it and the
       ending's button is two elements pretending to be one — and a crossfade
       is exactly where a box mismatch shows up as a control jumping.

   SO THERE IS ONE ELEMENT AND IT NEVER MOVES. Zero movement at the handover is
   guaranteed by construction rather than by measuring two boxes against each
   other, and there is one implementation of the anchor behaviour instead of
   two (world/ScrollWorld.tsx no longer carries `wireSignOff`).

   ── THE WORDING NAMES THE DESTINATION AND MATCHES ITS HEADING ─────────────
   "View selected work" (owner's call, Aug 2026), against "See the work" and,
   before that, "Skip to the work". The band it lands on is headed **Selected
   work** (page.tsx), and a link should say what the reader will get: "the work"
   is vague, "selected work" is the name of the thing. If that heading ever
   changes, this changes with it — two names for one destination is the fault
   this rename fixed.

   IT IS LONGER AND IT WAS MEASURED. At the button's own 14px body face it sets
   about 123px of text, 155px with the phone's 16px side padding and 163px with
   the desktop's 20px. Against 258px of clear width at 320 (18px margin each
   side, less the trail's 26px gutter) and a 224px copy column at 861px, it fits
   on one line at every width with room, so nothing about the type, the padding
   or the flush-bottom alignment had to give.

   "See selected work" is the flagged alternative if "View" ever reads stiff
   against the house register; it is a one-word swap and about 7px narrower.

   "SKIP" IS DEAD and cannot come back while this control persists into the
   ending: there is nothing left to skip once the walk has stopped. The argument
   it used to carry — that a reader inside a long film needs to be told they may
   DECLINE it — was written when this control disappeared before the sign-off.

   ── IT WEARS THE ENGINE'S OWN BUTTON CLASSES, DELIBERATELY ────────────────
   `sw-btn sw-btn--primary sw-exit`. The first two are the classes the engine
   puts on a section's `cta`, so this IS that button — same size, same weight,
   same radius, same hover, same press, same focus ring — rather than a copy of
   its values that can drift. `.sw-exit` adds position and nothing else
   (world.css, THE STANDING EXIT). If the ending's button styling ever changes,
   this changes with it whether anybody remembers or not.

   ── AND IT ARRIVES THIRD, AFTER THE COPY ──────────────────────────────────
   The opening is three beats: the floppy assembling over the frosted desk with
   nothing on the pane, then leg 1's lockup (mark, PRODUCT DESIGNER, sentence),
   then this. It fades up in the place it will occupy for the rest of the page
   and never moves again.

   THIS REVERSES "STANDING FROM SCROLL 0", which was the spec for most of a day
   and is the reason the control was made prominent in the first place: a
   recruiter should see the way out on the first screen. The floppy beat delays
   exactly that, and the counter-argument is kept rather than deleted — a reader
   who never scrolls never sees an exit, and the masthead's own Work item is the
   only door on that frame. The owner's call is that the delay is short enough
   to accept, because any reader who scrolls at all reaches it immediately.

   HOW LONG, IN REAL DISTANCE: the fade runs 2.96% → 4.06% of the flight, which
   is 0.40 → 0.54 of a viewport on desktop and 0.48 → 0.65 on a phone. Most of
   one screen of scrolling before it is fully up.

   THE TIMING IS DERIVED, NOT SET. 2.96% is just past the end of leg 1's word
   cascade (`--sw-b`, 2.881%), so the button comes after the sentence rather
   than with it. It is a scroll-driven opacity on the flight's
   own timeline — the same language every copy window here uses, so it reverses
   the instant the reader scrolls back and there is no timer to drift. world.css
   (THE BUTTON ARRIVES THIRD) carries the numbers and the reversal.

   AN EARLIER ARRANGEMENT rode `--wgc-copy`, the opening morph's own gate, so
   the control appeared as the sheet finished landing (~0.26 of a viewport). Its
   argument was that the exit is PRINTED ON THE PANEL and may not stand in a
   corner of the floppy screen before there is a panel under it. That is still
   true, and this arrangement satisfies it and then waits a beat longer.

   ── ITS JUMP MUST NOT SCRUB THE FILM ──────────────────────────────────────
   `globals.css` sets document-wide smooth scrolling, so a plain `#work` anchor
   from the middle of the walk would glide the reader across roughly ten
   thousand pixels of scrub track and play the scenes backwards at about 15x.
   The site's one rule decides it (lib/use-anchor-scroll.ts, THE FILM IS NOT
   SCRUBBED BY A NAVIGATION): a jump that would scrub more than a screenful of
   film is instant, and anything shorter keeps the browser's own eased anchor.

   IT IS ASKED EVERY TIME rather than assumed, and now that this control also
   stands AT the ending the answer genuinely varies: from the floppy screen the
   jump is instant, and from the sign-off — where the travel left is under a
   screen of already-settled `hello world` — the predicate says no and the
   anchor behaves like an anchor. That is the better exit in both places, and it
   is one line of code rather than a branch.

   `replaceState`, not `pushState`: declining the walk is not a step in the
   reader's history, and making Back cost two presses is a poor answer to
   somebody who has just said they want to be somewhere else. Focus is moved
   onto the landed band so Tab continues from the work rather than from the top
   of the document.

   ── WHY IT IS A COMPONENT AND NOT ENGINE MARKUP ───────────────────────────
   Same reason WorldGlassCard, the masthead and the scroll cue are components:
   the engine is vendored and is not edited, and anything that has to inherit
   the route's `--sw-*` tokens has to render inside `<ScrollWorld>`. It adds no
   document height — `position: fixed` — so the engine's track still starts at
   scroll 0.

   NO REDUCED-MOTION BRANCH IS NEEDED, and that is a judgment rather than an
   omission. Two things about this control animate and both are SCROLL-LINKED
   OPACITY: the arrival, and the handover that dissolves the flight into the
   bands. §7 keeps opacity under `reduce` and removes movement, and there is no
   movement here — the box is fixed from its first frame, and both values
   advance only as far as the reader's own gesture advances them. It is the same
   call the pane's copy makes for the same reason (world.css, THE CHAPTER
   HOLDS): gating it would leave the reader most likely to be scanning with a
   control that appears with no transition at all. The jump is instant for
   everyone in every mode.
────────────────────────────────────────────────────────────────────────── */

/** The band it lands on — the same id the sign-off's own button uses. */
const EXIT_ID = "work";

export function FlightExit() {
  return (
    <a
      className="sw-btn sw-btn--primary sw-exit"
      href={`#${EXIT_ID}`}
      onClick={(event) => {
        // Let the browser own new-tab / modified / non-primary clicks.
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
        const target = document.getElementById(EXIT_ID);
        if (!target) return;
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        const top = Math.max(
          0,
          target.getBoundingClientRect().top + window.scrollY - margin,
        );
        if (!jumpWouldScrubFilm(window.scrollY, top)) return;
        event.preventDefault();
        window.history.replaceState(null, "", `#${EXIT_ID}`);
        window.scrollTo({ top, behavior: "instant" });
        if (!target.hasAttribute("tabindex")) {
          target.setAttribute("tabindex", "-1");
        }
        target.focus({ preventScroll: true });
      }}
    >
      View selected work
    </a>
  );
}
