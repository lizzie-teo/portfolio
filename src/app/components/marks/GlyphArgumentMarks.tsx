"use client";

/*
 * GLYPH ARGUMENT MARKS — the fourth candidate for the project mark, and the one
 * that argues against the other three.
 *
 * NOT SHIPPED. Candidates for /explore/graphical-icons. Nothing imports them
 * from a live surface; ProjectCard, LoFiProjectCard and FeatureItem are
 * untouched. Promotion would be an import change.
 *
 * ── THE ONE RULE ──────────────────────────────────────────────────────────
 *
 * REST IS THE SECTOR GLYPH, UNCHANGED. MOTION IS THE PROJECT'S ARGUMENT,
 * PERFORMED ON THAT GLYPH'S OWN PARTS. NOTHING IS REDRAWN.
 *
 * Every figure below is `IndustryGlyph`'s figure at `IndustryGlyph`'s
 * coordinates in `IndustryGlyph`'s own cropped box, re-expressed here rather
 * than imported only because the shipped components take no motion. If a still
 * of a rest state differs from the shipped glyph by a pixel, that is a bug and
 * not a variation: the whole value of this direction is that its rest states
 * have already been approved, proven at 32px, and are already on the home page.
 *
 * ── WHY THIS EXISTS NEXT TO THE CONSTRUCTED FAMILIES ──────────────────────
 *
 * Lattice, swept and radial are a GRAMMAR rather than a SUBJECT. All three say
 * "an even field resolves to one answer", which is true of any design project,
 * so swapping two projects' marks would go unnoticed. These four cannot be
 * swapped: the motion only works on the parts the figure actually has. Nine
 * dots on two axes can retract. Three unequal bars can level. Two bodies can
 * agree on a centre. A rhombus that is a square in plan view can be swept. Move
 * any of those moves onto another glyph and it stops meaning anything, which is
 * the test the other three families fail.
 *
 * The cost is honest and worth stating: this is four bespoke figures rather
 * than one parametric system, so a fifth sector needs a fifth drawing and a
 * fifth argument. The constructed families get that for free.
 *
 * ── THE WEIGHT CONTRACT IS IndustryGlyph's ────────────────────────────────
 *
 * `hair()` and `point()` are imported verbatim and evaluated against EACH
 * GLYPH'S OWN BOX at the caller's real render size. That derivation is not
 * ceremony here: these four boxes run 120, 132, 138 and 140 units, so a single
 * shared stroke number would render the finance bars 17 per cent heavier than
 * the payment rings. Nothing in this file states a stroke width.
 *
 * ── REDUCED MOTION: THE GEOMETRY HOLDS AT THE SHIPPED GLYPH ───────────────
 *
 * Same split as the constructed families. Progress divides in two: `mp` drives
 * position, radius and bearing and is PINNED under reduced motion; `op` drives
 * ink and the answer point and runs either way. There is no rAF at all.
 *
 * What makes the split unusually clean in this direction is that the pinned
 * geometry is always the shipped glyph itself:
 *
 *   - three of the four marks pin `mp` to 0, because 0 is the shipped figure;
 *   - the completing cross pins it to 1, because for that one variant the
 *     shipped figure is the RESOLVED state, not the rest state;
 *   - the radar sweeps exactly one turn, so its pinned bearing at `mp = 0` is
 *     already its landing bearing and the still needs no special case.
 *
 * So the reduced-motion resolved state is always the approved drawing with its
 * ink redistributed: something at full strength, the rest ghosted. A different
 * drawing, not a shortened animation.
 *
 * The ramp, the scrub and the interruption rule all come from `useMarkRamp`:
 * position based, so hover out mid flight turns round from wherever it stands,
 * and `hold` freezes a specimen with no loop behind it for the lab's slider.
 *
 * Ink is `currentColor`; every figure is `aria-hidden` and `focusable="false"`.
 */

import { useRef } from "react";
import { hair, point, type Box } from "../IndustryGlyph";
import {
  ANSWER_SCALE,
  clamp01,
  degToRad,
  fixed,
  lerp,
  markWeight,
  ramp,
  useMarkRamp,
  type MarkProps,
} from "./markSystem";

/* ── shared frame ─────────────────────────────────────────────────────────── */

/** IndustryGlyph's `Frame` with an explicit render size and a per-glyph box.
 *  The size is not styling: it is the number the hairline and the point radius
 *  are derived from, so it has to be the box's real rendered dimension rather
 *  than something CSS decides later. */
function GlyphSvg({
  box,
  sizePx,
  className,
  children,
}: {
  box: Box;
  sizePx: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={`${box.x} ${box.y} ${box.size} ${box.size}`}
      width={sizePx}
      height={sizePx}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Ink for a part that is not the answer: it falls back to `floor` as the mark
 *  resolves. The survivor is not written through this — it simply stays at 1,
 *  because a part that brightens as well as its neighbours dimming double
 *  counts the emphasis and blows past the hairline. */
const fallback = (floor: number, op: number) => lerp(1, floor, op);

/* ═══ HEALTHCARE — the dot matrix cross ═══════════════════════════════════
 *
 * Healthdirect Symptom Checker. Nine dots, five down and five across, sharing a
 * centre. Two variants off ONE drawing, because the case study has two true
 * things to say and they are the same figure read in opposite directions.
 *
 * NARROWING is triage: the arms retract, outermost pair first, and the centre
 * ends at the answer scale at full ink while what is left of the field ghosts.
 * Rest is the shipped glyph.
 *
 * THE ARMS DO NOT ALL REACH THE CENTRE, and that took two passes to get right.
 * The first retracted all eight dots the whole way in and dissolved them, which
 * is the honest reading of "until the centre point is all that remains" and a
 * composition failure at exactly the size that decides things: at 32px the
 * resolved mark was one four pixel dot in an empty box. A mark may lose mass on
 * resolve — that IS the narrowing — but it may not stop being a figure.
 *
 * The second pass kept the inner four and absorbed the outer four, and that is
 * the wrong half to keep. The inner ring sits 28 units out and the answer point
 * grows to nearly 9, so any contraction large enough to READ as a contraction
 * collides with the answer, and any contraction small enough to clear it is
 * invisible. The ring with room to move is the OUTER one. So the outer four
 * lead the retraction, travel 40 per cent of the way in and stay as the ghosted
 * field; the inner four follow and are absorbed into the growing centre. The
 * cross visibly closes, the field thins from nine points to five, and the
 * resolved figure still fills its box at 240px and still reads as a cross at 32.
 *
 * COMPLETING is the 49 to 84 per cent completion claim: the cross starts broken
 * — its outer four dots missing — and completes outward, vertical axis then
 * horizontal, until the shipped figure is whole. Rest is a compact five dot
 * plus; the RESOLVED state is the approved glyph.
 *
 * That inversion is the one deliberate break with the direction's rule, and it
 * is the trade the variant exists to show: retraction keeps the approved rest
 * and states triage; completion gives up the approved rest to state the number
 * the case study actually publishes. Only one of them can have both.
 *
 * The inner ring does not move in completing mode. A version where both rings
 * flew out from the centre was drawn first and it is wrong twice over: its rest
 * state is a single lonely dot, and "nothing to everything" is not what 49 to
 * 84 per cent says.
 */

const HEALTHCARE_BOX: Box = { x: 34, y: 34, size: 132 };
const CROSS_CX = 100;
const CROSS_CY = 100;
/** Spacing between neighbouring dots on an arm, in glyph units. Straight off
 *  the shipped coordinates: 44, 72, 100, 128, 156. */
const CROSS_STEP = 28;
/** Where the outer four settle when the cross narrows: 40 per cent of the way
 *  in from 56. Far enough that the closure reads, far enough out that the
 *  resolved plus still spans most of its box rather than huddling. */
const CROSS_HOLD = 34;
/** How far the surviving field falls back. Higher than the dense families' 0.3
 *  because there are only four dots left to carry it. */
const CROSS_FLOOR = 0.4;

type Arm = {
  ring: 1 | 2;
  dx: -1 | 0 | 1;
  dy: -1 | 0 | 1;
  /** Rest position: the shipped dot this element IS. */
  cx: number;
  cy: number;
  /** One step in toward the centre: where a completing outer dot starts. */
  inCx: number;
  inCy: number;
  /** Where this dot ends up when the cross narrows. The outer four close to
   *  `CROSS_HOLD` and stay as the ghosted field; the inner four go all the way
   *  to the centre and are absorbed. */
  toCx: number;
  toCy: number;
  vertical: boolean;
};

const CROSS_ARMS: Arm[] = ([1, 2] as const).flatMap((ring) =>
  ([
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ] as const).map(([dx, dy]) => ({
    ring,
    dx,
    dy,
    cx: CROSS_CX + dx * ring * CROSS_STEP,
    cy: CROSS_CY + dy * ring * CROSS_STEP,
    inCx: CROSS_CX + dx * (ring - 1) * CROSS_STEP,
    inCy: CROSS_CY + dy * (ring - 1) * CROSS_STEP,
    toCx: CROSS_CX + dx * (ring === 2 ? CROSS_HOLD : 0),
    toCy: CROSS_CY + dy * (ring === 2 ? CROSS_HOLD : 0),
    vertical: dy !== 0,
  })),
);

export type CrossMode = "narrow" | "complete";

export function HealthcareCrossMark({
  mode,
  sizePx,
  active,
  hold,
  className,
}: MarkProps & { mode: CrossMode }) {
  const weight = markWeight(sizePx);
  const pr = point(HEALTHCARE_BOX, weight);
  const narrow = mode === "narrow";

  const arms = useRef<(SVGCircleElement | null)[]>([]);
  const centre = useRef<SVGCircleElement | null>(null);

  useMarkRamp(
    active,
    (p, reduce) => {
      /* THE PINNED GEOMETRY IS THE SHIPPED GLYPH IN BOTH MODES. Narrowing rests
         on the approved figure, so it pins to 0; completing RESOLVES to it, so
         it pins to 1 and the outer dots simply appear where they belong instead
         of appearing stacked on the inner ring. Either way nothing moves. */
      const mp = reduce ? (narrow ? 0 : 1) : p;
      const op = p;

      CROSS_ARMS.forEach((a, k) => {
        const el = arms.current[k];
        if (!el) return;

        if (narrow) {
          /* Outermost pair leaves first, so the LARGER ring takes the smaller
             delay. The inner ring's span runs past the outer one's so the two
             bands do not arrive together and flatten the wave. */
          const outer = a.ring === 2;
          const delay = outer ? 0 : 0.35;
          const e = ramp(mp, delay, outer ? 0.55 : 0.6);
          el.setAttribute("cx", String(lerp(a.cx, a.toCx, e)));
          el.setAttribute("cy", String(lerp(a.cy, a.toCy, e)));
          /* Two ink terms, and they do different jobs. The first is the ghost,
             driven by `op`, and it is what the reduced-motion still shows — the
             whole rest cross, faint, around a heavy centre. The second is
             absorption, driven by the element's own TRAVEL, so a dot that
             reaches the centre dissolves on arrival rather than crossfading
             over its own trip, and it contributes nothing when nothing travels.
             Only the inner four reach the centre, so only they carry it. */
          const ghost = 1 - (1 - CROSS_FLOOR) * ramp(op, delay, 0.6);
          const absorbed = outer ? 0 : clamp01((e - 0.55) / 0.45);
          el.setAttribute("opacity", String(ghost * (1 - absorbed)));
          return;
        }

        if (a.ring === 1) {
          /* The inner ring is already there. It is written anyway so a resize
             or a scrub cannot leave it holding a stale attribute. */
          el.setAttribute("cx", String(a.cx));
          el.setAttribute("cy", String(a.cy));
          el.setAttribute("opacity", "1");
          return;
        }
        /* Completing: the outer four extend from the inner ring's position out
           to their own, the vertical axis leading so the cross grows along one
           axis and then the other rather than popping as a square. */
        const delay = a.vertical ? 0 : 0.18;
        const e = ramp(mp, delay, 0.62);
        el.setAttribute("cx", String(lerp(a.inCx, a.cx, e)));
        el.setAttribute("cy", String(lerp(a.inCy, a.cy, e)));
        el.setAttribute("opacity", String(ramp(op, delay, 0.62)));
      });

      const c = centre.current;
      if (!c) return;
      /* Narrowing ends on one point at the answer scale: everything the field
         held is now this. Completing ends on the shipped glyph exactly, so its
         centre never grows — the answer there is the whole cross. */
      c.setAttribute("r", String(narrow ? pr * lerp(1, ANSWER_SCALE, op) : pr));
    },
    hold,
    sizePx,
  );

  return (
    <GlyphSvg box={HEALTHCARE_BOX} sizePx={sizePx} className={className}>
      <g fill="currentColor">
        {CROSS_ARMS.map((a, k) => {
          const start = narrow || a.ring === 1;
          return (
            <circle
              key={`${a.ring}-${a.dx}-${a.dy}`}
              ref={(el) => {
                arms.current[k] = el;
              }}
              cx={start ? a.cx : a.inCx}
              cy={start ? a.cy : a.inCy}
              r={pr}
              opacity={start ? 1 : 0}
            />
          );
        })}
        <circle ref={centre} cx={CROSS_CX} cy={CROSS_CY} r={pr} />
      </g>
    </GlyphSvg>
  );
}

/* ═══ FINANCIAL SERVICES — the outlined bars ══════════════════════════════
 *
 * Funding Finder. Three outlined stadium bars at three heights: many options,
 * unresolved. On hover they LEVEL onto one height, left to right, and the bar
 * that never had to move holds at full ink while the other two fall back to a
 * ghosted hairline. Many funding options made comparable, one match.
 *
 * THEY LEVEL ONTO THE MIDDLE BAR'S OWN HEIGHT, and both halves of that are
 * decisions. Levelling onto the tallest would raise two bars from the baseline,
 * which is a chart entrance and says GROWTH — the wrong claim for a service
 * that matches a business to a grant it was already eligible for. Levelling
 * onto the middle makes the movement reciprocal: one bar rises a little, one
 * falls a little, and the net silhouette barely changes mass, so the gesture
 * reads as a row being levelled rather than as a bar chart loading.
 *
 * And the survivor is then the bar that did not move, which is the truer thing
 * anyway: the match was already among the options; what the tool changed was
 * that the options became comparable.
 */

const FINANCIAL_BOX: Box = { x: 40, y: 45, size: 120 };
/** Shipped geometry: feet on the 160 baseline, 16 wide, fully rounded. */
const BAR_BASE = 160;
const BAR_W = 16;
const BAR_RX = 8;
const BARS: { x: number; y: number }[] = [
  { x: 50, y: 112 },
  { x: 92, y: 84 },
  { x: 134, y: 50 },
];
const BAR_SURVIVOR = 1;
const BAR_LEVEL = BARS[BAR_SURVIVOR].y;
/** A higher ghost floor than the dense families use. Three outlined pills is
 *  the sparsest figure in the lab, and at 0.3 the levelled row disappeared at
 *  32px and left one lonely stadium standing in an empty box. */
const BAR_FLOOR = 0.42;

export function FinancialLevelMark({ sizePx, active, hold, className }: MarkProps) {
  const weight = markWeight(sizePx);
  const bars = useRef<(SVGRectElement | null)[]>([]);

  useMarkRamp(
    active,
    (p, reduce) => {
      const mp = reduce ? 0 : p;
      const op = p;
      BARS.forEach((b, i) => {
        const el = bars.current[i];
        if (!el) return;
        /* Left to right, as if a hand passed over the row. Staggering by travel
           distance was tried and is invisible: the two moving bars travel 34 and
           28 units, so ordering by it produced no readable wave at all. */
        const e = ramp(mp, ((b.x - BARS[0].x) / 84) * 0.28, 0.62);
        const y = lerp(b.y, BAR_LEVEL, e);
        el.setAttribute("y", String(y));
        el.setAttribute("height", String(BAR_BASE - y));
        el.setAttribute(
          "opacity",
          String(i === BAR_SURVIVOR ? 1 : fallback(BAR_FLOOR, op)),
        );
      });
    },
    hold,
    sizePx,
  );

  return (
    <GlyphSvg box={FINANCIAL_BOX} sizePx={sizePx} className={className}>
      <g {...hair(FINANCIAL_BOX, weight)}>
        {BARS.map((b, i) => (
          <rect
            key={b.x}
            ref={(el) => {
              bars.current[i] = el;
            }}
            x={b.x}
            y={b.y}
            width={BAR_W}
            height={BAR_BASE - b.y}
            rx={BAR_RX}
          />
        ))}
      </g>
    </GlyphSvg>
  );
}

/* ═══ PAYMENTS — the two rings ════════════════════════════════════════════
 *
 * AP+ Testing Portal. Two overlapping rings at rest, cx 76 and 124, r 38. On
 * hover they SLIDE ONTO ONE CENTRE until they are a single ring, and the point
 * they now agree on fills. Two systems certified against each other is exactly
 * what a testing portal proves, and two bodies arriving at one centre is the
 * only move this figure has that means that.
 *
 * NEITHER RING GHOSTS, which breaks the lab's "one survivor, the rest fall
 * back" habit on purpose. Ghosting one of two would say that one system
 * deferred to the other; certification is symmetric, so the ink stays even and
 * the answer point carries the whole opacity channel. It also makes the
 * reduced-motion still the best of the four: the shipped overlapping rings with
 * a filled point at 100, 100 — which is the exact centre of the lens where the
 * two already overlap. The still says "these two share this point" without
 * moving anything, which is the claim.
 *
 * THE LEMNISCATE VARIANT WAS NOT BUILT. A point travelling a figure of eight
 * through the overlap is prettier in flight, and it fails this direction's own
 * reduced-motion rule outright: pin its position and it is a dot parked at a
 * start point with nothing to say, so the variant would have to be judged on
 * motion alone in a lab whose whole method is comparing stills.
 */

const PAYMENTS_BOX: Box = { x: 30, y: 30, size: 140 };
const RING_R = 38;
const RING_CY = 100;
const RING_CX = [76, 124];
const RING_MEET = 100;

export function PaymentsAgreeMark({ sizePx, active, hold, className }: MarkProps) {
  const weight = markWeight(sizePx);
  const answerR = point(PAYMENTS_BOX, weight) * ANSWER_SCALE;
  const rings = useRef<(SVGCircleElement | null)[]>([]);
  const answer = useRef<SVGCircleElement | null>(null);

  useMarkRamp(
    active,
    (p, reduce) => {
      const mp = reduce ? 0 : p;
      const op = p;
      /* One ramp for both, no stagger: they agree, so they arrive together. A
         staggered version reads as one ring chasing the other. */
      const e = ramp(mp, 0, 0.82);
      RING_CX.forEach((cx, i) => {
        rings.current[i]?.setAttribute("cx", String(lerp(cx, RING_MEET, e)));
      });
      /* The point lands after the rings have all but met, so it reads as the
         consequence of the meeting rather than as a third element arriving. */
      answer.current?.setAttribute("opacity", String(clamp01((op - 0.55) / 0.45)));
    },
    hold,
    sizePx,
  );

  return (
    <GlyphSvg box={PAYMENTS_BOX} sizePx={sizePx} className={className}>
      <g {...hair(PAYMENTS_BOX, weight)}>
        {RING_CX.map((cx, i) => (
          <circle
            key={cx}
            ref={(el) => {
              rings.current[i] = el;
            }}
            cx={cx}
            cy={RING_CY}
            r={RING_R}
          />
        ))}
      </g>
      <circle
        ref={answer}
        cx={RING_MEET}
        cy={RING_CY}
        r={answerR}
        fill="currentColor"
        opacity={0}
      />
    </GlyphSvg>
  );
}

/* ═══ HIGHER EDUCATION — the board and the sweep ══════════════════════════
 *
 * Macquarie Radar. The mortarboard is a rhombus, which is a SQUARE IN PLAN VIEW
 * seen at an angle, and the project is called Radar. So a hairline sweeps
 * around the board's own plane from its centre point and settles on the corner
 * the tassel hangs from, and the tassel's dot lights as the contact it found.
 *
 * THE SWEEP IS IN THE BOARD'S PLANE, NOT THE SCREEN'S. The rhombus is the image
 * of a square under the map that sends plan x to 60 screen units across and
 * plan y to 24 down, so a ray at plan bearing φ meets the board's edge at
 * 1 / (|cos φ| + |sin φ|) of the way out. Running the sweep through that map
 * keeps its tip exactly on the perimeter all the way round, which is what makes
 * it read as a plane being scanned rather than as a hand going round a clock.
 * A constant length spoke was drawn first and it reads as a second tassel.
 *
 * EXACTLY ONE TURN, and that is a reduced-motion decision as much as a motion
 * one. A full revolution starts and ends on the same bearing, so pinning the
 * bearing under reduced motion lands it on the tassel corner with no special
 * case: the still is the board with a line drawn from its centre to the corner
 * the answer hangs off, which is the sentence the motion spends 500ms saying.
 *
 * THE TASSEL DOES NOT SWING. It is the charming move and it says nothing; the
 * dot lighting is what a radar contact is.
 */

const EDUCATION_BOX: Box = { x: 32, y: 30, size: 138 };
/** The board's centre — the shipped glyph's own centre dot, which is where the
 *  sweep pivots. */
const BOARD_CX = 100;
const BOARD_CY = 86;
/** Half diagonals of the rhombus, straight off the shipped path. */
const BOARD_AX = 60;
const BOARD_AY = 24;
const BOARD_PATH = "M40 86 L100 62 L160 86 L100 110 Z";
const TASSEL_PATH = "M160 86 L160 128";
const TASSEL_DOT = { cx: 160, cy: 134 };
/** How far the board falls back once the contact is found. The board is the
 *  field; the sweep, the tassel and its dot are the route to the answer and
 *  stay at full ink. */
const BOARD_FLOOR = 0.38;

/** Where a plan bearing meets the board's edge, in screen units. */
function boardEdge(deg: number) {
  const r = degToRad(deg);
  const c = Math.cos(r);
  const s = Math.sin(r);
  const k = 1 / (Math.abs(c) + Math.abs(s));
  return { x: BOARD_CX + BOARD_AX * k * c, y: BOARD_CY + BOARD_AY * k * s };
}

export function EducationSweepMark({ sizePx, active, hold, className }: MarkProps) {
  const weight = markWeight(sizePx);
  const pr = point(EDUCATION_BOX, weight);
  const rest = boardEdge(0);

  const board = useRef<SVGPathElement | null>(null);
  const sweep = useRef<SVGLineElement | null>(null);
  const contact = useRef<SVGCircleElement | null>(null);

  useMarkRamp(
    active,
    (p, reduce) => {
      const mp = reduce ? 0 : p;
      const op = p;
      const e = ramp(mp, 0, 1);
      /* 360 at rest and 0 resolved: the same bearing, so the pinned still and
         the landing agree. Decreasing means the sweep runs anticlockwise on
         screen and comes up onto the tassel corner from below, past the corner
         the tassel already points at rather than away from it. */
      const tip = boardEdge(360 * (1 - e));
      const el = sweep.current;
      if (el) {
        el.setAttribute("x2", String(tip.x));
        el.setAttribute("y2", String(tip.y));
        /* The sweep is not in the shipped figure, so it has to be gone at rest
           for the rest state to be pixel identical. It arrives fast: it is the
           instrument, not the payoff. */
        el.setAttribute("opacity", String(clamp01(op / 0.2)));
      }
      board.current?.setAttribute("opacity", String(fallback(BOARD_FLOOR, op)));
      contact.current?.setAttribute(
        "r",
        String(pr * lerp(1, ANSWER_SCALE, clamp01((op - 0.45) / 0.55))),
      );
    },
    hold,
    sizePx,
  );

  return (
    <GlyphSvg box={EDUCATION_BOX} sizePx={sizePx} className={className}>
      <g {...hair(EDUCATION_BOX, weight)}>
        <path ref={board} d={BOARD_PATH} />
        <line
          ref={sweep}
          x1={BOARD_CX}
          y1={BOARD_CY}
          x2={fixed(rest.x)}
          y2={fixed(rest.y)}
          opacity={0}
        />
        <path d={TASSEL_PATH} />
      </g>
      <g fill="currentColor">
        <circle cx={BOARD_CX} cy={BOARD_CY} r={pr} />
        <circle ref={contact} cx={TASSEL_DOT.cx} cy={TASSEL_DOT.cy} r={pr} />
      </g>
    </GlyphSvg>
  );
}

/* ── registry ─────────────────────────────────────────────────────────────── */

export type GlyphArgumentId =
  | "funding"
  | "triage-narrow"
  | "triage-complete"
  | "payments"
  | "radar";

/** One row per argument. Titles and industries are NOT here: the lab reads them
 *  off `workEntries` by slug, which is the registry's job. */
export const glyphArguments: {
  id: GlyphArgumentId;
  slug: string;
  /** What the resting figure is, in the reader's words. */
  figure: string;
  /** What the motion does and why it is that project's claim. */
  motion: string;
}[] = [
  {
    id: "funding",
    slug: "funding-finder",
    figure: "Three outlined stadium bars at three heights.",
    motion:
      "The bars level onto one height, left to right, and the bar that never had to move holds at full ink while the other two fall back to a ghosted hairline. Many options made comparable, one match. They level onto the middle height rather than the tallest, because raising bars off a baseline says growth, and growth is not what this project did.",
  },
  {
    id: "triage-narrow",
    slug: "healthdirect-symptom-checker",
    figure: "Nine dots, five down and five across, on a shared centre.",
    motion:
      "The arms retract, the outermost four leading, and the inner four are absorbed into the centre as it grows to the answer scale. What is left is a tight plus of ghosts around one heavy point. Triage, drawn on the cross the card already carries. The field closes rather than vanishing, because a mark that resolves to a single dot has stopped being a mark at 32px.",
  },
  {
    id: "triage-complete",
    slug: "healthdirect-symptom-checker",
    figure: "The same cross, started broken: the outer four dots are missing.",
    motion:
      "The cross completes outward, the vertical axis leading, until the shipped figure is whole. This is the same drawing with its ramp reversed, and it is the case study's own claim: completion went from 49 to 84 per cent. It gives up the approved rest state to get an approved resolved one, which is the trade to judge.",
  },
  {
    id: "payments",
    slug: "ap-testing-portal",
    figure: "Two overlapping rings.",
    motion:
      "The rings slide onto one centre until they are a single ring, and the point they now agree on fills. Neither ring ghosts: certification is symmetric, so dimming one would say the wrong thing.",
  },
  {
    id: "radar",
    slug: "macquarie-radar",
    figure: "A rhombus board, which is a square in plan view, and a tassel.",
    motion:
      "A hairline sweeps one full turn around the board's own plane from its centre point, its tip riding the perimeter, and settles on the corner the tassel hangs from as the tassel's dot lights. The board falls back; the route to the contact stays. The tassel never swings.",
  },
];

export function GlyphArgumentMark({
  id,
  ...rest
}: MarkProps & { id: GlyphArgumentId }) {
  switch (id) {
    case "funding":
      return <FinancialLevelMark {...rest} />;
    case "triage-narrow":
      return <HealthcareCrossMark mode="narrow" {...rest} />;
    case "triage-complete":
      return <HealthcareCrossMark mode="complete" {...rest} />;
    case "payments":
      return <PaymentsAgreeMark {...rest} />;
    default:
      return <EducationSweepMark {...rest} />;
  }
}
