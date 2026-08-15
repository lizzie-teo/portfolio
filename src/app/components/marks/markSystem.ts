"use client";

/*
 * CONSTRUCTED MARK SYSTEM — the shared contract behind the animated project
 * marks in `ConstructedMarks.tsx`.
 *
 * WHAT A CONSTRUCTED MARK IS. Not an icon. Every figure here is generated
 * PARAMETRICALLY — a loop emitting circles, ellipses or rays from an equation —
 * the way the reference set that briefed it was made: circles repeated on a
 * grid, an ellipse family swept along an axis, N elements about one centre.
 * There is no subject matter anywhere. What holds the six marks together is
 * CONSTRUCTION: one hairline, circles/arcs/ellipses only, high element count,
 * everything centred in one box at one optical radius. That is also what makes
 * them animatable — a parametric figure has count, phase, spacing and sweep to
 * drive, where a drawn mortarboard has nothing.
 *
 * THE WEIGHT CONTRACT IS NOT REINVENTED HERE. `Box`, `Weight`, `hair()`,
 * `point()` and `HAIRLINE_PX` are imported verbatim from `IndustryGlyph.tsx`,
 * which is where the "stroke and dot radius are DERIVED from the glyph's own
 * viewBox, so the whole family lands on one rendered hairline at any size" rule
 * lives. A mark passes its real render size as `weight.sizePx` and gets the
 * same 1.1px line and 2.4px point as every shipped glyph. Nothing in this file
 * states a stroke number.
 *
 * ONE BOX FOR ALL SIX, unlike IndustryGlyph. Those glyphs crop per figure
 * because a mortarboard and two rings have nothing like the same bounds. These
 * are all centred fields designed to the same outer radius (`FIELD_R`), so a
 * shared box IS the equal-optical-mass rule rather than a shortcut — and it is
 * what lets the lab stand all six in a row and read them as one family. The box
 * is the REST bounds and never moves: hover contracts every figure inward, so a
 * box that tracked the drawing would make the mark shrink its own footprint.
 *
 * TWO LEVELS OF DETAIL FROM ONE FIGURE, derived continuously. The shipped call
 * sites render at 20-64px and the reference marks live at 200px+; a 22-ellipse
 * sweep at 32px is mud. So element count is derived from the render size the
 * same way `.docs/cover-effects.md` derives a halftone ruling: THE PITCH IS A
 * RENDERED SIZE, NOT A COUNT. `countForPitch` keeps the gap between neighbouring
 * elements near a target number of physical pixels and clamps at both ends, so
 * the small mark is the large one decimated — same centre, same outer radius,
 * same optical mass, fewer elements — and it degrades continuously rather than
 * snapping between two drawings. The clamps do real work at both ends: below the
 * floor a lattice stops being a lattice, above the ceiling it stops reading as
 * constructed cells and becomes texture.
 *
 * SVG, NOT CANVAS, FOR ALL THREE STYLES. The covers are canvas because they
 * push three to seven thousand dots with per-particle comet trails; the honest
 * threshold in the brief is ~200 elements or per-element trails. The richest
 * figure here is 60 rays at 240px and the sparsest is 3 rings at 32px, with no
 * trails, no dpr arithmetic and no field sampling. Against that, SVG wins on the
 * one thing this brief is actually about: a 1.1px hairline. Canvas strokes at
 * sub-pixel widths blur across the dpr boundary and would need the whole
 * cover-effects dpr/ResizeObserver apparatus to hold a line that SVG renders
 * crisply for free. SVG also inherits `currentColor`, renders the full static
 * figure with no JavaScript at all (which is exactly what "motion is not
 * information" and reduced motion require), and costs nothing at rest.
 *
 * THE MOTION CONTRACT is `.docs/cover-effects.md`'s, transplanted from canvas to
 * SVG attributes: state in refs, imperative writes, no per-frame React render, a
 * self-terminating rAF, `dt` clamped, and a POSITION-BASED ramp so hover-out
 * reverses from wherever the ramp is instead of queueing. Nothing runs at rest.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { motionDuration } from "../../lib/motion";
import { HAIRLINE_PX, type Box, type Weight } from "../IndustryGlyph";

/** The drawing space every mark is composed in, and its centre. */
export const VIEW = 200;
export const CX = VIEW / 2;
export const CY = VIEW / 2;

/** Outer radius every figure is built to, so all six carry one optical mass.
 *  The box below is this radius plus a hairline's overshoot for round caps. */
export const FIELD_R = 84;

/** Shared square viewBox. See the header: one box is the equal-mass rule here,
 *  not a shortcut, and it is the REST bounds so a contracting figure never
 *  changes its own footprint. */
export const MARK_BOX: Box = { x: 8, y: 8, size: 184 };

/** What every mark takes. `sizePx` is the mark's REAL render size, which is
 *  what derives both the hairline and the element count — a caller that lies
 *  about it gets a fat stroke and the wrong ruling. `active` is hover OR focus,
 *  owned by the host (never `:hover`, so a touch tap does not fire the scene).
 *  `hold` freezes the figure at a fixed progress with no rAF at all; it exists
 *  for the lab's `?p=` instrument and for stills, and is not a call-site prop. */
export type MarkProps = {
  sizePx: number;
  active: boolean;
  hold?: number;
  className?: string;
};

/** The weight for a mark at its real render size: one rendered hairline
 *  whatever the box scale, straight off IndustryGlyph's contract. */
export function markWeight(sizePx: number): Weight {
  return { sizePx, strokePx: HAIRLINE_PX };
}

/* ── detail level ─────────────────────────────────────────────────────────── */

/** Element count for a figure whose neighbours should sit `pitchPx` apart on
 *  screen, clamped. `span` is how much of the render size the elements are
 *  spread across (1 for a full-width lattice, ~2πr for a rim). See the header:
 *  the pitch is a rendered size, not a count. */
export function countForPitch(
  sizePx: number,
  pitchPx: number,
  min: number,
  max: number,
  span = 1,
): number {
  const n = Math.round((sizePx * span) / pitchPx);
  return Math.max(min, Math.min(max, n));
}

/* ── ramp maths ───────────────────────────────────────────────────────────── */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** The same easing the canvas covers use for their scatter ramps, so a mark and
 *  a cover accelerate on the same curve. */
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** One element's local progress inside the whole gesture: it waits out `delay`,
 *  then runs its own `span` of the ramp. Staggering by POSITION rather than by
 *  index is what turns six simultaneous moves into a wave crossing the figure. */
export function ramp(p: number, delay: number, span: number) {
  return easeOutCubic(clamp01((p - delay) / span));
}

export const degToRad = (deg: number) => (deg * Math.PI) / 180;

/** The answer point, as a multiple of the family's own point radius. Reads as a
 *  resolution rather than a stray dot at 32px without becoming a blot at 240.
 *  Shared rather than per family: the constructed marks and the glyph-argument
 *  marks stand on the same page, and an answer that is one size in one section
 *  and another size below it reads as two systems. */
export const ANSWER_SCALE = 1.8;

/**
 * Round a trigonometric result before it reaches an SVG attribute.
 *
 * NOT COSMETIC — it is a hydration fix. `Math.cos` and `Math.sin` are not
 * required to be bit identical between implementations, and Node's and
 * Chrome's disagree in the last place or two. A figure whose rest coordinates
 * are computed from them therefore serialises one string on the server and
 * another in the browser, and React reports a hydration mismatch on the whole
 * subtree. Three decimals in a 200-unit box is a thousandth of a hairline, so
 * nothing is lost and every mark's static markup becomes reproducible.
 *
 * Only the JSX rest state needs it. Attributes written imperatively by the rAF
 * loop never go through hydration.
 */
export const fixed = (v: number) => Number(v.toFixed(3));

/** Signed angular difference in degrees, wrapped to (-180, 180]. */
export function wrapDeg(deg: number) {
  let d = ((deg + 180) % 360 + 360) % 360 - 180;
  if (d === -180) d = 180;
  return d;
}

/* ── the ramp loop ────────────────────────────────────────────────────────── */

/* Entry is `slow` and the return is `base` — both straight off the motion
   tokens. The mark is a display payoff rather than a UI response, so entry sits
   at the token reserved for reveals; the return is shorter and quieter because
   the reader's attention has already left ("exits are subtler than entries").
   The per-element stagger lives INSIDE the 0..1 progress, so the whole cascade
   resolves in 500ms whatever the element count — a 9-circle mark and an
   81-circle mark finish together, which is the only way the lab's four detail
   levels can be compared mid-flight. */
const IN_MS = motionDuration.slow * 1000;
const OUT_MS = motionDuration.base * 1000;

/**
 * Drive a mark's figure from one scalar.
 *
 * `draw(p, reduce)` is called with progress 0 (rest field) to 1 (resolved) and
 * writes SVG attributes through refs. It must be idempotent and it must render
 * the rest figure at p = 0, because the JSX ships that state statically and the
 * loop only ever mutates it.
 *
 * REDUCED MOTION IS A DIFFERENT DRAWING, NOT A FASTER ONE. There is no rAF at
 * all: `draw` is called once with `reduce`, and every mark honours that by
 * zeroing its positional, scale and rotation terms while still applying its
 * opacity terms. The resolved state therefore still SAYS the same thing — the
 * field ghosts back, one element stays at full strength, the answer point
 * appears — with nothing moving. That is the still the brief asks for.
 */
export function useMarkRamp(
  active: boolean,
  draw: (p: number, reduce: boolean) => void,
  hold?: number,
  /** Anything that changes the figure's element count (its render size). A new
   *  count means new nodes carrying rest attributes, so the current progress
   *  has to be written onto them or a resized mark snaps back to its field. */
  redrawKey?: unknown,
) {
  const reduce = useReducedMotion();
  const drawRef = useRef(draw);
  const pRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const activeRef = useRef(active);

  /* Both syncs are declared before the effects that read them, on purpose:
     effects run in declaration order, so the loop always starts with the live
     target and the live draw already in their refs. (A ref cannot be assigned
     during render — that is what the react-hooks refs rule is protecting, and
     the rAF loop reads `drawRef` on a frame, never in a render pass.) */
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  /* Frozen specimen (the lab's `?p=`) and reduced motion are both single
     imperative writes with no loop behind them. */
  useEffect(() => {
    if (hold !== undefined) {
      pRef.current = hold;
      /* Reduced motion still wins over a frozen specimen: scrubbing the lab
         with the preference set should show the still, not the moved figure. */
      drawRef.current(hold, !!reduce);
      return;
    }
    if (!reduce) return;
    pRef.current = active ? 1 : 0;
    drawRef.current(pRef.current, true);
  }, [hold, reduce, active]);

  useEffect(() => {
    drawRef.current(pRef.current, !!reduce);
  }, [redrawKey, reduce]);

  useEffect(() => {
    if (hold !== undefined || reduce) return;
    /* Nothing runs at rest: an unhovered mark that has never been hovered has
       no loop to start, and one that has returned home has already stopped. */
    if (!active && pRef.current === 0) return;
    if (runningRef.current) return;
    runningRef.current = true;

    let last: number | null = null;
    const step = (now: number) => {
      const dt = last === null ? 16 : Math.min(64, now - last);
      last = now;

      /* Position based: the ramp advances toward whatever the target is RIGHT
         NOW, so hover-out mid-flight reverses from where it stands. Nothing is
         queued and nothing replays from zero. */
      const target = activeRef.current ? 1 : 0;
      const ms = activeRef.current ? IN_MS : OUT_MS;
      let p = pRef.current;
      p =
        target > p
          ? Math.min(target, p + dt / ms)
          : Math.max(target, p - dt / ms);
      pRef.current = p;
      drawRef.current(p, false);

      if (p === target) {
        runningRef.current = false;
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, [active, reduce, hold]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );
}
