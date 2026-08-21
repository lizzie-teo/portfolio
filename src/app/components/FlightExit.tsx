"use client";

import { jumpWouldScrubFilm } from "../lib/use-anchor-scroll";

/* ─────────────────────────────────────────────────────────────────────────
   THE STANDING EXIT — "Skip to the work", open for the whole walk.

   A fixed link at the foot of the pane, on the copy column's own left axis
   (world.css, THE STANDING EXIT, which carries the design argument, the slot's
   history, the fade window and the phone contrast defect). This file is the
   markup and the one behaviour that cannot be written in CSS.

   ── IT ARRIVES WITH THE PANE, AND IT IS NOT ON THE FLOPPY SCREEN ──────────
   The link rides `--wgc-copy`, the opening move's own gate, so it fades up as
   the sheet finishes landing beside the film — roughly 0.26 of a viewport in.
   That is deliberate and it has been settled twice: this object is printed on
   the panel, so standing it in a corner before the panel exists puts a piece of
   the pane's furniture on a screen whose composition is a disk and a scroll cue.
   A pass in Aug 2026 removed the gate on the argument that a skip control must
   be visible from the first frame; the owner's call put it back the same day.
   world.css (THE GATE WAS REMOVED ONCE) carries both sides, including where the
   first screen's actual door is — the masthead's own Work item.

   ── AND IT IS NAMED FOR THE OFFER, NOT THE DESTINATION ────────────────────
   "See the work" for a while, which was the ending button's own words, on the
   argument that a permanent door names where it goes. It names the act now: a
   reader inside a fourteen-viewport film needs to be told they may decline it,
   and a destination does not say that. The ending's button keeps "See the work"
   and the two never share a screen.

   ── WHY IT IS A COMPONENT AND NOT ENGINE MARKUP ───────────────────────────
   Same reason WorldGlassCard, the masthead and the scroll cue are components:
   the engine is vendored and is not edited, and anything that has to inherit
   the route's `--sw-*` tokens has to render inside `<ScrollWorld>`. It adds no
   document height — `position: fixed` — so the engine's track still starts at
   scroll 0.

   ── IT REPLACED A THING ON ONE SCREEN WITH A THING ON EVERY SCREEN ────────
   The arrival's fork used to carry the exit ("Skip to the work"), and before
   that a ghost button. Both expired half a viewport in, which is an offer most
   readers never see, and both spent that half viewport arguing for rank against
   the scroll cue beside them. This stands in a corner on the page's own axis
   instead, for fourteen viewports. FlightFork.tsx carries the full history.

   ── ITS JUMP MUST NOT SCRUB THE FILM ──────────────────────────────────────
   `globals.css` sets document-wide smooth scrolling, so a plain `#work` anchor
   from the middle of the walk would glide the reader across roughly eleven
   thousand pixels of scrub track and play seven scenes backwards at about 15x.
   The site's one rule decides it (lib/use-anchor-scroll.ts, THE FILM IS NOT
   SCRUBBED BY A NAVIGATION): a jump that would scrub more than a screenful of
   film is instant, and anything shorter keeps the browser's own eased anchor.

   From anywhere this link is visible the answer is yes — it fades out during
   leg 8 and is gone before the last leg — so in practice it always jumps. It
   asks the predicate anyway rather than assuming, because a rule with several
   call sites and several implementations is several rules.

   `replaceState`, not `pushState`, for the same reason the fork's skip used:
   declining the walk is not a step in the reader's history, and making Back
   cost two presses is a poor answer to somebody who has just said they want to
   be somewhere else. Focus is moved onto the landed band so Tab continues from
   the work rather than from the top of the document.

   NO REDUCED-MOTION BRANCH IS NEEDED. Its only motion is a scroll-linked
   opacity in the stylesheet, which is what §7 keeps under `reduce`, and the
   jump is instant for everyone.
────────────────────────────────────────────────────────────────────────── */

/** The band it lands on — the same id the sign-off's own button uses. */
const EXIT_ID = "work";

export function FlightExit() {
  return (
    <a
      className="sw-exit"
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
      Skip to the work
    </a>
  );
}
