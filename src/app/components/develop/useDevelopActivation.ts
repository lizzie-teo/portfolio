"use client";

/*
 * DEVELOP ACTIVATION — the one question every developing plate has to answer:
 * "am I being looked at right now?"
 *
 * It is a separate module rather than a few lines inside the plate because the
 * answer is not local. On a pointer device a card answers it alone (am I hovered,
 * am I focused). On touch there is no hover, so the honest substitute is "is this
 * the card nearest the middle of the screen" — and no single card can know that.
 * It is a question about the whole set, which means one observer, one shared
 * store, and exactly one winner. That is what lives here.
 *
 * THREE TRIGGERS, IN PRIORITY ORDER, matching the brief:
 *
 *   1. reduced motion   nothing ever activates. Checked first and returned early,
 *                       so neither listener path is even attached — a hard
 *                       requirement (style-rules §7), not a shortened animation.
 *   2. pointer devices  hover AND :focus-visible. Focus is not an afterthought
 *                       here: a keyboard reader must see what a mouse reader
 *                       sees, so the same boolean comes out of both.
 *   3. touch devices    IntersectionObserver plus the shared registry below.
 *                       Nearest to the viewport centre wins, one at a time.
 *
 * THE REF GOES ON THE LINK, not on the plate. Focus lands on the anchor, and an
 * element cannot observe a focus event on its own parent, so a ref pointed at the
 * plate would silently never see keyboard focus — the failure mode being guarded
 * against here is a card that works with a mouse and looks dead on Tab. The card
 * frame owns the anchor and therefore owns this hook; the plate is handed the
 * boolean.
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/* ─── The touch registry ───────────────────────────────────────────────────────
 *
 * Module scope on purpose. "Only one card active at a time" is a fact about the
 * page, not about any card, so it is held once for the page rather than
 * negotiated between components. One IntersectionObserver serves every registered
 * card, created on the first registration and torn down with the last, so a page
 * with no touch cards pays nothing.
 */

type Registration = {
  el: Element;
  set: (active: boolean) => void;
};

const registered = new Set<Registration>();
/* Cards currently intersecting the viewport. Only these are candidates — a card
   two screens down is not "nearest the centre" in any useful sense, and scoring
   the whole set on every scroll frame would mean laying out cards that are
   nowhere near the reader. */
const visible = new Set<Registration>();
let observer: IntersectionObserver | null = null;
let active: Registration | null = null;
let frame: number | null = null;

/**
 * Scores every visible card by the distance from its middle to the viewport's
 * middle and lights the closest one, clearing whichever was lit before. Reading
 * layout for a handful of on-screen elements, so it is rAF-throttled by `schedule`
 * below and never runs more than once per frame.
 */
function pickNearest() {
  frame = null;
  if (visible.size === 0) {
    if (active) {
      active.set(false);
      active = null;
    }
    return;
  }

  const centre = window.innerHeight / 2;
  let winner: Registration | null = null;
  let best = Infinity;

  for (const entry of visible) {
    const rect = entry.el.getBoundingClientRect();
    const distance = Math.abs(rect.top + rect.height / 2 - centre);
    if (distance < best) {
      best = distance;
      winner = entry;
    }
  }

  if (winner === active) return;
  /* Order matters: extinguish the old one before lighting the new one, so the
     two never overlap even for a frame. "One at a time" is the rule. */
  active?.set(false);
  active = winner;
  active?.set(true);
}

function schedule() {
  if (frame !== null) return;
  frame = requestAnimationFrame(pickNearest);
}

function register(entry: Registration) {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const record of entries) {
          const match = [...registered].find((r) => r.el === record.target);
          if (!match) continue;
          if (record.isIntersecting) visible.add(match);
          else visible.delete(match);
        }
        schedule();
      },
      /* No threshold list: this only maintains the candidate set, and the ranking
         that actually decides the winner is done by `pickNearest` against live
         geometry. A finer threshold ladder would fire far more often and change
         nothing about the answer. */
      { rootMargin: "0px" },
    );
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
  }

  registered.add(entry);
  observer.observe(entry.el);

  return () => {
    observer?.unobserve(entry.el);
    registered.delete(entry);
    visible.delete(entry);
    if (active === entry) active = null;
    /* Last one out turns off the lights, so a route with no cards leaves no
       scroll listener running behind it. */
    if (registered.size === 0) {
      observer?.disconnect();
      observer = null;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    } else {
      schedule();
    }
  };
}

/* ─── The hook ─────────────────────────────────────────────────────────────── */

/**
 * Returns whether this card should be developing right now.
 *
 * @param el The card's LINK element. See the header — anything lower in the tree
 *           misses keyboard focus.
 */
export function useDevelopActivation(el: HTMLElement | null): boolean {
  const shouldReduce = useReducedMotion();
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!el) return;

    /* Reduced motion never activates, and never attaches a listener or an
       observer to find out. The plate's static state is the whole experience.
       Bailing out here only stops new activations; the guarantee that nothing is
       ALREADY lit comes from the derived return below, not from resetting state
       in this effect. */
    if (shouldReduce) return;

    /* Both halves are required. `hover: hover` alone is true for some stylus and
       hybrid devices that report a coarse pointer, where a hover state can latch
       on and never clear; pairing it with `pointer: fine` keeps this path to
       devices with a real cursor and sends everything else to the observer. */
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (!pointer.matches) {
      return register({ el, set: setActivated });
    }

    const on = () => setActivated(true);
    const off = () => setActivated(false);

    /* `:focus-visible` rather than plain focus, so a mouse click on the card does
       not leave it stuck developing after the pointer has gone. The browser owns
       the heuristic for what counts as a keyboard focus; this just asks it. */
    const onFocus = () => {
      if (el.matches(":focus-visible")) setActivated(true);
    };

    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", off);

    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", off);
    };
  }, [el, shouldReduce]);

  /* Derived, not stored. If the preference flips to "reduce" while a card is lit
     — a real case, since the OS setting can change under a live page — this goes
     false on the very next render rather than waiting for an effect to clean up
     after it. Reduced motion is a hard requirement, so it is enforced on the way
     out rather than trusted to state that happens to be correct. */
  return activated && !shouldReduce;
}
