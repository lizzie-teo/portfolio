"use client";

import { useReducedMotion } from "motion/react";
import { useCallback } from "react";
import { motionEase } from "./motion";

/**
 * Reads an element's live landing position: its top, measured now, minus its
 * own scroll-margin-top (the shared `anchorScrollOffset`, read from computed CSS
 * so the 1cm landing stays defined in one place), clamped into the scrollable
 * range. Recomputed every frame during the ease so the target tracks the page
 * as it reflows.
 */
function landingTarget(element: Element, marginTop: number) {
  const top = element.getBoundingClientRect().top + window.scrollY - marginTop;
  const max =
    document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(0, Math.min(top, max));
}

/**
 * Evaluates a CSS-style cubic-bezier easing (the `[x1, y1, x2, y2]` control
 * points our motion tokens store) as y = f(x). The anchor scroll drives its
 * eased progress from `motionEase.inOut` so the curve stays the same one the
 * rest of the site repositions with — no bespoke easing invented here. Newton
 * homes t so that bezierX(t) = x, then returns bezierY(t); the standard eases
 * are monotonic and well behaved, so a few iterations converge to sub-pixel.
 */
function cubicBezier([x1, y1, x2, y2]: readonly number[]) {
  const bezier = (a: number, b: number, t: number) => {
    const u = 1 - t;
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
  };
  const slope = (a: number, b: number, t: number) => {
    const u = 1 - t;
    return 3 * u * u * a + 6 * u * t * (b - a) + 3 * t * t * (1 - b);
  };
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 5; i += 1) {
      const dx = bezier(x1, x2, t) - x;
      if (Math.abs(dx) < 1e-4) break;
      const d = slope(x1, x2, t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    return bezier(y1, y2, Math.min(1, Math.max(0, t)));
  };
}
const easeInOut = cubicBezier(motionEase.inOut);

/**
 * The landing position for an anchored element, read live. Exported because the
 * flight's arrival re-lands on it after the scrub track exists (HomeFlight, THE
 * HASH IS RE-LANDED ONCE THE TRACK HAS ITS HEIGHT) — a second implementation of
 * "where does #work sit" would be a second answer.
 */
export function anchorLandingTarget(element: Element) {
  return landingTarget(
    element,
    parseFloat(getComputedStyle(element).scrollMarginTop) || 0,
  );
}

/* ── THE FILM IS NOT SCRUBBED BY A NAVIGATION ──────────────────────────────
   `/` opens on the garden flight: eleven thousand pixels of scroll track whose
   whole purpose is that scroll position IS playback position. Ease a jump
   across it and the reader watches seven scenes run backwards at roughly 15x —
   a 520 to 920ms glide over that distance is a strobe, not a transition. It is
   the reason the site's own smooth scrolling (`globals.css`) has to be
   overridden here rather than deferred to.

   THE RULE IS ABOUT THE JUMP, NOT THE PAGE, AND THE UNIT IS ONE VIEWPORT: a
   jump is instant when it would scrub MORE THAN A SCREENFUL of film. A viewport
   is the natural measure because it is how much of the track is on screen at
   once — roughly one scene — and one screenful of scrub is about the most a
   glide can carry before it reads as a rewind rather than a move.

   WHY NOT "ANY OVERLAP AT ALL", which is where this started. The bands begin at
   the track's foot, and an anchored section lands about 130px ABOVE its own top
   edge (the 1cm-under-the-bar landing), so a reader parked on the work band is
   technically still inside the track's box. A bare overlap test made Work →
   Explorations instant while Explorations → Writing stayed eased, which is two
   different behaviours for the same kind of hop. The viewport threshold puts all
   three band hops on the eased path and every jump that genuinely crosses the
   walk on the instant one.

   WHAT LANDS WHERE, on `/`: "My skills" from anywhere below (back to the floppy
   at scroll 0) and "Work" from anywhere inside the walk both scrub the whole
   film and go instant; the three band-to-band hops keep the site's ordinary
   glide with its 1cm landing and its settle. Nothing on a case study is
   affected — there is no track there and this returns false.

   THE CONTRACT IS ONE ATTRIBUTE. Whatever mounts a scrub track stamps
   `data-sw-scrub-track` on the element that IS the track — for the flight that
   is the engine root, which starts at scroll 0 and is exactly as tall as the
   track (world.css, THE FLIGHT IS ITS OWN TIMELINE, has the identity). Measured
   live rather than cached: the track's height is a function of viewport height
   and of `scrollMobileFactor`, so any number read at mount is wrong after a
   rotate.

   EXPORTED, because three call sites share the one rule: this hook (the
   masthead), the arrival's skip (FlightFork) and the ending's button
   (ScrollWorld). A rule implemented three times is three rules. */
export function jumpWouldScrubFilm(from: number, to: number) {
  const track = document.querySelector("[data-sw-scrub-track]");
  if (!track) {
    return false;
  }
  const bottom = track.getBoundingClientRect().bottom + window.scrollY;
  // Every track on this site starts at scroll 0, so the film the jump passes
  // through is whatever of its span lies above the track's foot.
  return bottom - Math.min(from, to) > window.innerHeight;
}

/**
 * The a11y half of an anchor jump. A smooth-scroll to an id famously leaves
 * keyboard focus at the top of the page — Tab after the jump then walks the
 * whole document again instead of continuing from where the reader was sent.
 * So once the glide settles we move focus onto the landed section itself:
 * we make it programmatically focusable (`tabindex="-1"`, left in place — it
 * stays out of the tab order and only accepts scripted focus) and focus it
 * with `preventScroll` so the focus call can't re-scroll and undo the exact
 * 1cm landing. Keyboard navigation then continues *from* the section.
 *
 * `announce` fires the arrival cue — the coral ArrivalCue overlay listens for
 * this. It is skipped under reduced motion (the caller passes `announce=false`)
 * so the cue is suppressed while focus still moves.
 */
function landFocus(element: HTMLElement, id: string, announce: boolean) {
  if (!element.hasAttribute("tabindex")) {
    element.setAttribute("tabindex", "-1");
  }
  element.focus({ preventScroll: true });
  if (announce) {
    window.dispatchEvent(
      new CustomEvent("case:arrival", { detail: { id } }),
    );
  }
}

/**
 * Deterministic in-page anchor navigation for the case-study navs (rail, dock,
 * marker).
 *
 * Two things make the naive `href="#id"` / one-shot `scrollTo` unreliable here:
 *
 * 1. A chapter leaf's target sits only ~1cm above its sticky-pin line (see
 *    CollapsingLeaf) — cross that line by a hair and the leaf pins flush to the
 *    top and starts collapsing instead of resting at its 1cm gap.
 * 2. A far jump glides through sections that collapse/reveal *during* the
 *    scroll, so the page height changes mid-flight. Any target computed once at
 *    click time is stale by arrival — the deeper the target, the larger the
 *    overshoot (a jump to a late chapter can park ~270px past the pin, pinning
 *    the leaf flush with no gap at all).
 *
 * So this doesn't scroll to a fixed pixel. It runs a short rAF ease that
 * **recomputes the element's live landing position every frame** and homes to
 * it, finishing on the exact live target. Because the goal is re-derived from
 * the DOM each frame, a mid-flight reflow just moves the goal and the ease
 * follows it, so every section comes to *rest* at exactly its 1cm gap
 * regardless of distance. The arrival carries a small, fixed-pixel overshoot
 * lobe — a slight follow-through kiss past the landing that settles back onto
 * it, so the stop reads considered rather than abrupt (see the ease block
 * below). A user gesture (wheel / touch / key) cancels the ease so we never
 * fight someone who grabs the scroll back.
 *
 * Returns a click handler `(event, id)`; wire it onto each nav `<a>` alongside
 * whatever the nav already does on click (e.g. closing its panel). Modified
 * clicks (new tab, non-primary button) fall through to native behaviour, and
 * the hash is updated so deep links and the back button keep working. Under
 * reduced motion the ease is skipped for a single instant jump.
 */
export function useAnchorScroll() {
  const shouldReduce = useReducedMotion();

  return useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
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
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      event.preventDefault();
      // The section carries the 1cm landing as its scroll-margin-top
      // (anchorScrollOffset); read it back so this stays a single source of truth.
      const marginTop =
        parseFloat(getComputedStyle(element).scrollMarginTop) || 0;

      // Keep the URL in sync without a second, native jump undoing the scroll.
      if (window.location.hash !== `#${id}`) {
        window.history.pushState(null, "", `#${id}`);
      }

      if (shouldReduce) {
        // A large scroll-linked animation is a vestibular trigger; jump once.
        // instant beats the site's html { scroll-behavior: smooth }, which
        // "auto" would otherwise defer to.
        window.scrollTo({ top: landingTarget(element, marginTop), behavior: "instant" });
        // Move focus for keyboard continuity; a reduced-motion jump suppresses
        // the arrival cue (announce=false) but still lands focus.
        landFocus(element, id, false);
        return;
      }

      // Time-parameterised glide toward a live-recomputed target, ending on a
      // small, well-damped overshoot so the arrival has follow-through rather
      // than a hard stop. Two phases share one fixed duration:
      //
      //   • Glide (0 → CORE_END): the shared inOut curve, time-compressed so it
      //     reaches the *exact* landing by CORE_END for any distance. Keeps the
      //     gentle ease-in departure; unlike an exponential decay (full velocity
      //     off the line) it leaves softly, accelerates, and eases in to rest.
      //   • Settle (CORE_END → 1): a single fixed-pixel overshoot lobe past the
      //     landing that returns to zero — the "slight bounce". Because it is a
      //     fixed pixel amount (not a fraction of the journey), the kiss reads
      //     the same on a short hop or a full-page jump and can never look like a
      //     runaway scroll-past; the deeper the jump, the more negligible it is.
      //
      // Position rides from the click-time scroll point toward the target
      // *re-read every frame*: the glide fraction hits exactly 1 at CORE_END and
      // the lobe returns to 0 at t=1, so the final position is always the live
      // target — a mid-scroll reflow just moves the goal and it still lands on
      // the exact 1cm pin.
      const startY = window.scrollY;
      const initialTarget = landingTarget(element, marginTop);

      // A jump that would drag the reader through a scroll-scrubbed film gets
      // no glide at all — see THE FILM IS NOT SCRUBBED BY A NAVIGATION. Focus
      // still lands and the arrival still announces; only the travel is cut.
      if (jumpWouldScrubFilm(startY, initialTarget)) {
        window.scrollTo({ top: initialTarget, behavior: "instant" });
        landFocus(element, id, true);
        return;
      }

      const distance = Math.abs(initialTarget - startY);
      // Already there (re-click on the current section): don't sit through an
      // eased nudge that moves nothing.
      if (distance < 4) {
        window.scrollTo({ top: initialTarget, behavior: "instant" });
        // Re-click on the current section: land focus and give the same quiet
        // arrival cue so "you're already here" still reads as a real response.
        landFocus(element, id, true);
        return;
      }
      // Distance-scaled duration: a short hop stays snappy, a full-page traverse
      // takes longer but never draggy. Linear ramp from MIN to MAX across the
      // first RAMP_PX of travel, then capped — kept under 1s so a page-level
      // navigation reads confident, not slow.
      const MIN_MS = 520;
      const MAX_MS = 920;
      const RAMP_PX = 6000;
      const duration =
        MIN_MS + (MAX_MS - MIN_MS) * Math.min(1, distance / RAMP_PX);
      // Fraction of the timeline the glide takes to reach the exact landing; the
      // remainder carries the settle lobe.
      const CORE_END = 0.72;
      // Magnitude of the follow-through past the landing. Small and fixed: a
      // tasteful kiss, never a fraction of the (possibly huge) travel distance.
      const OVERSHOOT_PX = 12;
      const direction = Math.sign(initialTarget - startY);
      // Hard ceiling so a still-reflowing page can't trap the loop past its ease.
      const deadline = duration + 300;
      const startedAt = performance.now();
      let frame = 0;

      const cancel = () => {
        if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        removeEventListener("wheel", onWheel);
        removeEventListener("touchstart", cancel);
        removeEventListener("keydown", cancel);
      };
      /* ── MOMENTUM IS NOT A GESTURE, AND TREATING IT AS ONE WAS A REAL BUG ──
         Every wheel event used to cancel, which meant the commonest way to use
         this nav broke it: scroll down the bands with a trackpad, reach up,
         click "Work". A macOS trackpad keeps firing wheel events for up to a
         second and a half after the fingers leave the glass, so the flick that
         got the reader there was still arriving when the glide started and
         killed it on its first frame. The reader stayed put, the URL said
         `#work`, and clicking again — by then the tail had run out — worked.
         Intermittent by construction.

         THE TELL IS THE SHAPE OF THE DELTAS, not their size and not the clock.
         An inertia tail decays monotonically; a hand back on the glass makes
         the numbers go UP. So a wheel event only takes the scroll back when it
         is bigger than the last one seen, which a real gesture manages within a
         frame or two of starting and a tail never manages at all. A grace
         window would not do: the tail routinely outlives any window short
         enough to keep the nav feeling interruptible.

         Touch and keys stay immediate. Neither has an inertia tail that reaches
         the page as events — iOS momentum scrolling fires no touchstart — so
         there is nothing to tell apart. */
      let lastDelta = Infinity;
      const onWheel = (event: WheelEvent) => {
        const delta = Math.abs(event.deltaY) + Math.abs(event.deltaX);
        if (delta > lastDelta) {
          cancel();
          return;
        }
        lastDelta = delta;
      };
      // A user grabbing the scroll back wins immediately.
      addEventListener("wheel", onWheel, { passive: true });
      addEventListener("touchstart", cancel, { passive: true });
      addEventListener("keydown", cancel);

      const step = () => {
        const elapsed = performance.now() - startedAt;
        const target = landingTarget(element, marginTop);
        if (elapsed >= duration || elapsed >= deadline) {
          window.scrollTo({ top: target, behavior: "instant" });
          cancel();
          // Arrived under its own power (not cancelled by a user gesture):
          // hand focus to the section and fire the coral arrival cue.
          landFocus(element, id, true);
          return;
        }
        const t = elapsed / duration;
        // Glide: the shared inOut curve compressed into [0, CORE_END], so it
        // reaches the exact target early and leaves the tail free for the lobe.
        const glide = easeInOut(Math.min(1, t / CORE_END));
        // Settle: one smooth positive lobe over (CORE_END, 1], zero-velocity at
        // both edges so it neither yanks off the glide nor snaps at the end.
        const lobe =
          t <= CORE_END
            ? 0
            : Math.sin((Math.PI * (t - CORE_END)) / (1 - CORE_END)) ** 2;
        const position =
          startY + (target - startY) * glide + direction * OVERSHOOT_PX * lobe;
        // behavior:instant so each frame lands immediately rather than the html
        // scroll-behavior:smooth re-animating on top of every step.
        window.scrollTo({ top: position, behavior: "instant" });
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    },
    [shouldReduce],
  );
}
