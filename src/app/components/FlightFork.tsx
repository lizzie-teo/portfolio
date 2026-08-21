"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "motion/react";

/* ─────────────────────────────────────────────────────────────────────────
   THE SCROLL CUE AT THE FOOT OF THE FIRST SCREEN

   The word `Scroll` under a mark that descends, centred on the foot of the
   floppy viewport, fading out over the first half viewport. That is all this is
   now, and the file keeps its name because `.sw-fork*` is the class family in
   world.css and renaming a component to rename a stylesheet's prefix is churn
   with nothing at the end of it.

   ── THE EXIT LEFT THIS LOCKUP, AND IT DID NOT DIE ─────────────────────────
   Three objects have stood beside the cue: a ghost button ("Straight to the
   work"), nothing at all for one iteration while the walk was opt in, and a
   12px underlined sentence ("Skip to the work"). The exit is now a STANDING one
   — `FlightExit`, at the foot of the pane on the copy column's left axis,
   arriving with the pane and fading out only as the sign-off's own button
   arrives.

   IT CARRIES THE SKIP'S WORDING AGAIN, and that is not a reversal of the move:
   what came back is the WORD, not the placement. The thing this file argued out
   of existence was a second object at the foot of the FIRST SCREEN, and there is
   still exactly one thing there — this cue. The exit is elsewhere and later, and
   an Aug 2026 pass that tried to bring it forward onto this screen was reverted
   for the same reason (world.css, THE GATE WAS REMOVED ONCE).

   WHY IT MOVED. This lockup was one screen's answer to a question the whole
   document asks. A reader who wants the case studies wants them at chapter 5 as
   much as on the floppy screen, and an offer that expires half a viewport in is
   an offer most readers never see.

   IT ALSO ENDS AN ARGUMENT THIS FILE LOST TWICE. Set at the cue's own 11px
   tracked caps, the skip and the cue were not equal but INDISTINGUISHABLE. Set
   as a bordered pill, the skip outweighed the cue on area, weight and border.
   Both were attempts to balance two objects at the foot of one screen; the
   answer was to stop putting two objects there. The walk owns the centre and
   the only moving thing on screen, and the exit is in a corner on the page's
   own left axis — a positional separation, which cannot be re-litigated as a
   type treatment can.

   THE CUE ITSELF STAYS. Fourteen viewports of scrub opening on a static object
   still has to say that scrolling is what happens next, and a reader on reduced
   motion — who gets stills rather than a moving picture — needs it more, not
   less.

   ── THE FADE IS THE ENGINE'S OWN CURVE ────────────────────────────────────
   `clamp(1 - y / (0.5 * vh))` — literally what scrub-engine.js:507 wrote onto
   its own `.sw-hint` every frame. Mirroring it rather than choosing a new one
   means the cue leaves on the beat the engine's hint left on. The engine is
   vendored upstream and is not edited; this is the value copied, not the code
   shared. Its `.sw-hint` stays switched off in world.css (Deleted chrome) —
   it carries the same word, so two of them would be a duplicate instruction
   and a duplicate accessible node.

   Driven from a MotionValue rather than React state, like WorldGlassCard: a
   scroll-linked value that re-rendered the tree every frame would be the one
   expensive thing on the page's cheapest screen.

   ── AND IT HAS TO STOP TAKING SPACE IN THE TREE ───────────────────────────
   An element at opacity 0 is still there and still an accessibility node.
   Opacity is not a way of removing something. So `visibility` is flipped once,
   at the end of the fade, which takes it out of hit testing, out of the tab
   order and out of the accessibility tree together. Written only when it
   crosses, not on every frame. It holds no control any more, but a screen
   reader should still not be announcing "Scroll" to somebody nine scenes into
   the garden.
────────────────────────────────────────────────────────────────────────── */
export function FlightFork() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  /* The window height the curve is measured against, held in a ref rather than
     state for the same reason WorldGlassCard holds its span in one: a resize
     must not tear the transform chain down and rebuild it for a number the
     transform can look up on the frame it needs.

     The touch guard is the engine's own (scrub-engine.js, onResize). A mobile
     URL bar sliding away fires `resize` on almost every scroll, and following
     it would move the end of the fade under the reader's thumb mid-gesture. */
  const vhRef = useRef(800);
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    let laidOutW = window.innerWidth;
    const measure = () => {
      vhRef.current = window.innerHeight;
    };
    measure();
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

  const fade = useTransform(scrollY, (y) =>
    Math.min(1, Math.max(0, 1 - y / (0.5 * vhRef.current))),
  );

  /* 0.02 rather than 0: the last two percent of a fade is not visible, and the
     same cached-string guard as HomeFlight's `--sw-handoff-vis` keeps this to
     one write per crossing rather than one per frame. */
  const visRef = useRef("");
  useMotionValueEvent(fade, "change", (v) => {
    const el = rootRef.current;
    if (!el) return;
    const vis = v > 0.02 ? "visible" : "hidden";
    if (vis === visRef.current) return;
    visRef.current = vis;
    el.style.visibility = vis;
  });

  /* The first frame after hydration. A restored scroll position means the page
     can arrive already past the fade, in which case the fork must never have
     been in the tree at all. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const vis = fade.get() > 0.02 ? "visible" : "hidden";
    visRef.current = vis;
    el.style.visibility = vis;
  }, [fade]);

  return (
    <div className="sw-fork" ref={rootRef}>
      {/* The opacity lives on an inner node so the outer one keeps a plain,
          untouched `visibility` for the guard above to write to — two
          properties on one element, one owned by Motion's render loop and one
          by ours, is a fight with no upside. */}
      <motion.div className="sw-fork__set" style={{ opacity: fade }}>
        {/* The word and its mark are one lockup, and the mark is decorative:
            a screen reader gets the word "Scroll" and nothing else. */}
        <span className="sw-fork__cue">
          <span className="sw-fork__word">Scroll</span>
          <svg
            aria-hidden
            className="sw-fork__chev"
            width="14"
            height="8"
            viewBox="0 0 14 8"
          >
            <path d="M1 1 L7 6.5 L13 1" />
          </svg>
        </span>

      </motion.div>
    </div>
  );
}
