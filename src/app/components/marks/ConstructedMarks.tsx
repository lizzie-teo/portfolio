"use client";

/*
 * CONSTRUCTED PROJECT MARKS — three construction families, two projects each.
 *
 * NOT SHIPPED. These are the candidates for /explore/graphical-icons; nothing
 * imports them from a live surface yet. Promotion is an import change, not a
 * rewrite.
 *
 * Read `markSystem.ts` first — it holds the weight contract (borrowed verbatim
 * from IndustryGlyph), the detail-level derivation, the ramp maths and the
 * hover loop, and it explains why all three families are SVG rather than canvas.
 *
 * ── THE SET'S ONE IDEA ────────────────────────────────────────────────────
 *
 * At rest every mark is an EVEN FIELD: N identical elements at one hairline,
 * nothing favoured. On hover the field RESOLVES — the elements converge, one of
 * them ends at full strength while the rest ghost back, and a single filled
 * point appears at the place the figure resolved to. Rest states a question,
 * the resolved state states an answer. That single sentence is what makes six
 * different figures read as one system, and it is why every mark is legible as
 * a still at both ends of its ramp.
 *
 * The two projects are the same argument twice, so they get the same shape of
 * gesture and differ in its LOGIC:
 *
 *   FUNDING FINDER resolves by ALIGNMENT. Many funding options land on one
 *   match, so its marks gather along a path — filled cells travel to one cell,
 *   a raked family rakes flat onto one ring, a full sunburst swings round onto
 *   one ray. This is the cover's own gesture: FundingFinderCover rakes eight
 *   prototype screens back toward a single axis.
 *
 *   SYMPTOM CHECKER resolves by NARROWING. A broad field of possibilities is
 *   triaged down to one answer, so its marks contract and eliminate — the
 *   lattice closes from the outside in, a funnel shuts down to its tip, a ring
 *   field nests into its own centre. This is the cover's gesture too: a deep
 *   teal field dissolving through a halftone until only the hook survives.
 *
 * Read down a style and the construction is identical; read across the two
 * projects and the argument is not.
 *
 * ── DETAIL ────────────────────────────────────────────────────────────────
 *
 * Element counts are derived from the render size (see `countForPitch`), so a
 * 32px mark and a 240px mark are one drawing at two rulings, not two drawings:
 *
 *   lattice   3x3  -> 5x5  -> 7x7 circles       (32 / 64 / 160+)
 *   swept     5    -> 8    -> 20   -> 24 rings (32 / 64 / 160 / 240)
 *   fan       11   -> 23   -> 57   -> 60 rays
 *   rings     3    -> 4    -> 10   -> 14 rings
 *
 * ── REDUCED MOTION ────────────────────────────────────────────────────────
 *
 * Every draw below splits its progress in two: `mp` drives position, scale and
 * rotation and is pinned to 0 under reduced motion; `op` drives opacity and the
 * answer point and runs either way. So the reduced-motion resolved state is the
 * REST field with one element at full strength, the others ghosted, and the
 * answer point present — the same statement, with nothing moved. It is a
 * different drawing, not a shortened animation, and it costs no rAF at all.
 *
 * Ink is `currentColor` throughout; the host sets the tone. Every figure is
 * `aria-hidden` and `focusable="false"` — a mark is artwork, and whatever hosts
 * it already carries the project's real name as text.
 */

import { useRef, type CSSProperties } from "react";
import { hair, point } from "../IndustryGlyph";
import {
  ANSWER_SCALE,
  CX,
  CY,
  FIELD_R,
  MARK_BOX,
  clamp01,
  countForPitch,
  degToRad,
  fixed,
  lerp,
  markWeight,
  ramp,
  useMarkRamp,
  wrapDeg,
  type MarkProps,
} from "./markSystem";

/* ── shared frame ─────────────────────────────────────────────────────────── */

/** IndustryGlyph's Frame with an explicit render size. The size is not styling:
 *  it is the number the hairline and the element count are derived from, so it
 *  has to be the box's real rendered dimension rather than something CSS
 *  decides later. */
function MarkSvg({
  children,
  className,
  style,
  sizePx,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  sizePx: number;
}) {
  return (
    <svg
      viewBox={`${MARK_BOX.x} ${MARK_BOX.y} ${MARK_BOX.size} ${MARK_BOX.size}`}
      width={sizePx}
      height={sizePx}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Opacity for one element once the mark resolves. */
const holdAlpha = (survivor: boolean, floor: number, op: number) =>
  survivor ? 1 : lerp(1, floor, op);

/* ═══ STYLE A — LATTICE ═══════════════════════════════════════════════════
 *
 * CONSTRUCTION. Equal circles on a square grid, radius 0.62 of the pitch so
 * neighbours overlap into lens-shaped cells rather than sitting tangent — the
 * "team" packing in the reference set, not the "building blocks" one. The count
 * is forced ODD so there is a true centre cell for the figure to resolve onto;
 * with an even grid the answer would land in a gap between four circles.
 *
 * The lattice's own pitch scales with the count, so the ring radius, the filled
 * discs and the answer all size off the cell rather than off the box. A filled
 * element in a lattice is a property of its cell; the swept and radial families
 * have no cell, so they take the shared point radius instead.
 */

/* THE LATTICE STAYS LOW COUNT, and that is a correction. A 9 by 9 grid was
   drawn first, on the assumption that the reference set's high element counts
   applied to every family — they do not. The dense references are the swept
   tubes and the radial fields; both lattice references are twelve circles. At
   81 the figure stopped being constructed cells and became chain-link texture,
   so the ceiling is 7 and the ruling is coarser to match. */
const LATTICE_PITCH_PX = 13;
const LATTICE_MAX = 7;
/** Circle radius as a share of the pitch. Above 0.5 the neighbours overlap into
 *  lens cells, which is the "team" packing rather than the tangent one. */
const LATTICE_OVERLAP = 0.62;
/** Radius of a filled node, as a share of its cell. Not the whole cell: the
 *  reference posters fill a circle solid, but IndustryGlyph's weight pass is
 *  the standing lesson here — at 32px a full cell is 10px of solid ink and the
 *  mark stops being line work. Half the cell still reads as a filled node. */
const NODE_R = 0.5;

/* THE FILLED SUBSET IS A COMPOSITION, NOT A MODULUS. A modulus over the cell
   indices was tried first and it is the obvious wrong answer: it fills a fixed
   FRACTION, so a 9 by 9 lattice came out with sixteen filled cells and read as a
   crossword, while the same rule left a 3 by 3 with a tidy diagonal. Four
   anchors in normalised lattice space instead, snapped to the nearest cell at
   whatever the ruling is — so the SAME four nodes, in the same relative places,
   appear at every detail level. That is what the brief means by the small mark
   being the large one decimated. The first anchor is the centre, because the
   centre cell is what the others resolve onto. */
const NODE_ANCHORS: [number, number][] = [
  [0.5, 0.5],
  [0.08, 0.28],
  [0.82, 0.12],
  [0.6, 0.88],
];

function latticeGeometry(sizePx: number) {
  const raw = countForPitch(sizePx, LATTICE_PITCH_PX, 3, LATTICE_MAX);
  const n = raw % 2 === 0 ? raw + 1 : raw;
  const half = (n - 1) / 2;
  /* Solve the pitch from the outer radius rather than fixing a span: the
     outermost circle's EDGE lands on FIELD_R at every count, so all detail
     levels carry the same optical mass. */
  const pitch = FIELD_R / (half + LATTICE_OVERLAP);
  const r = pitch * LATTICE_OVERLAP;
  const nodes = new Set(
    NODE_ANCHORS.map(
      ([u, v]) => `${Math.round(v * (n - 1))}-${Math.round(u * (n - 1))}`,
    ),
  );
  const cells: {
    i: number;
    j: number;
    cx: number;
    cy: number;
    d: number;
    filled: boolean;
  }[] = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      cells.push({
        i,
        j,
        cx: CX + (j - half) * pitch,
        cy: CY + (i - half) * pitch,
        d: Math.max(Math.abs(i - half), Math.abs(j - half)),
        filled: nodes.has(`${i}-${j}`),
      });
    }
  }
  return { n, pitch, r, cells, dmax: half };
}

/**
 * A / Funding Finder — THE FILLED SUBSET MIGRATES.
 *
 * Rest: a lattice of rings with a scattered subset filled — many live options
 * held in one structure. Hover: every filled cell travels along the lattice to
 * the centre cell and merges there, nearest first so the gathering crosses the
 * figure as a wave, and the arrivals dissolve into a single filled cell. The
 * grid never moves: the field is the market, the marks are the options.
 */
export function LatticeFundingMark({ sizePx, active, hold, className }: MarkProps) {
  const weight = markWeight(sizePx);
  const { r, cells, dmax } = latticeGeometry(sizePx);
  const filled = cells.filter((c) => c.filled);

  const rings = useRef<(SVGCircleElement | null)[]>([]);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const answer = useRef<SVGCircleElement | null>(null);

  useMarkRamp(
    active,
    (p, reduce) => {
      const mp = reduce ? 0 : p;
      const op = p;
      cells.forEach((c, k) => {
        rings.current[k]?.setAttribute(
          "opacity",
          String(holdAlpha(c.d === 0, 0.42, op)),
        );
      });
      filled.forEach((c, k) => {
        const el = dots.current[k];
        if (!el) return;
        const e = ramp(mp, (c.d / (dmax || 1)) * 0.45, 0.55);
        el.setAttribute("cx", String(lerp(c.cx, CX, e)));
        el.setAttribute("cy", String(lerp(c.cy, CY, e)));
        /* They do not fade out on the way in — they fade only once they have
           arrived, so the merge reads as absorption rather than as a crossfade
           with travel painted over it. */
        el.setAttribute("opacity", String(1 - clamp01((mp - 0.72) / 0.28)));
      });
      const a = answer.current;
      if (a) {
        a.setAttribute("opacity", String(clamp01((op - 0.5) / 0.5)));
        a.setAttribute("r", String(r * (0.3 + 0.32 * op)));
      }
    },
    hold,
    sizePx,
  );

  return (
    <MarkSvg sizePx={sizePx} className={className}>
      <g {...hair(MARK_BOX, weight)}>
        {cells.map((c, k) => (
          <circle
            key={`${c.i}-${c.j}`}
            ref={(el) => {
              rings.current[k] = el;
            }}
            cx={c.cx}
            cy={c.cy}
            r={r}
          />
        ))}
      </g>
      <g fill="currentColor">
        {filled.map((c, k) => (
          <circle
            key={`f-${c.i}-${c.j}`}
            ref={(el) => {
              dots.current[k] = el;
            }}
            cx={c.cx}
            cy={c.cy}
            r={r * NODE_R}
          />
        ))}
        <circle ref={answer} cx={CX} cy={CY} r={r * 0.3} opacity={0} />
      </g>
    </MarkSvg>
  );
}

/**
 * A / Symptom Checker — THE LATTICE CLOSES FROM THE OUTSIDE IN.
 *
 * Rest: an even lattice of rings, every cell equally possible. Hover: cells
 * contract to nothing and ghost away in Chebyshev rings, outermost first, so
 * the field visibly narrows one band at a time until the centre cell is the
 * only one left standing — and it fills. Triage, drawn: possibilities are not
 * rearranged, they are eliminated.
 */
export function LatticeTriageMark({ sizePx, active, hold, className }: MarkProps) {
  const weight = markWeight(sizePx);
  const { r, cells, dmax } = latticeGeometry(sizePx);

  const rings = useRef<(SVGCircleElement | null)[]>([]);
  const answer = useRef<SVGCircleElement | null>(null);

  useMarkRamp(
    active,
    (p, reduce) => {
      const mp = reduce ? 0 : p;
      const op = p;
      cells.forEach((c, k) => {
        const el = rings.current[k];
        if (!el) return;
        if (c.d === 0) {
          el.setAttribute("r", String(r));
          el.setAttribute("opacity", "1");
          return;
        }
        /* A LARGER delay departs LATER, so the outermost band — the largest d —
           takes delay 0 and leaves first. Same trap as the covers' scatter
           ordering, opposite sign: there `settle` counts down. */
        const delay = (1 - c.d / (dmax || 1)) * 0.5;
        el.setAttribute("r", String(r * (1 - 0.88 * ramp(mp, delay, 0.5))));
        el.setAttribute(
          "opacity",
          String(1 - 0.8 * ramp(op, delay, 0.5)),
        );
      });
      const a = answer.current;
      if (a) {
        a.setAttribute("opacity", String(clamp01((op - 0.45) / 0.55)));
        a.setAttribute("r", String(r * (0.28 + 0.34 * op)));
      }
    },
    hold,
    sizePx,
  );

  return (
    <MarkSvg sizePx={sizePx} className={className}>
      <g {...hair(MARK_BOX, weight)}>
        {cells.map((c, k) => (
          <circle
            key={`${c.i}-${c.j}`}
            ref={(el) => {
              rings.current[k] = el;
            }}
            cx={c.cx}
            cy={c.cy}
            r={r}
          />
        ))}
      </g>
      <circle
        ref={answer}
        cx={CX}
        cy={CY}
        r={r * 0.28}
        fill="currentColor"
        opacity={0}
      />
    </MarkSvg>
  );
}

/* ═══ STYLE B — SWEPT FAMILY ══════════════════════════════════════════════
 *
 * CONSTRUCTION. One ellipse repeated along an oblique axis with a rotation and
 * a scale ramp, so the stack reads as an extruded volume rather than a pile of
 * shapes — the "impact" tube in the reference set. Each ring is a circle seen
 * obliquely: semi-axes (A, A x 0.42) with the long axis held perpendicular to
 * the sweep axis, which is what makes the family read as one solid turned in
 * space instead of as concentric decoration.
 *
 * The rotation ramp is the load-bearing part. Without a per-ring twist the
 * stack is a shadow of itself repeated; with it, the silhouette turns along the
 * axis and the volume appears.
 *
 * Position and rotation both ride ONE transform attribute per ring
 * (`translate(...) rotate(... 100 100)`, applied to an ellipse that is centred
 * at the box centre before translation), so a 24-ring figure costs three
 * attribute writes per ring per frame.
 */

const AXIS_DEG = -34;
const AXIS_L = 54;
const RING_A = 47;
const RING_K = 0.5;
const AXIS_UX = Math.cos(degToRad(AXIS_DEG));
const AXIS_UY = Math.sin(degToRad(AXIS_DEG));
/** Per-ring twist across the whole sweep, in degrees, for the raked pose. It is
 *  the ONLY thing making the raked mark read as a volume: the first pass gave
 *  it a scale ramp as well, and a scale ramp is what a cone is made of, so the
 *  two Style B marks came out as a mild cone and a strong cone rather than as a
 *  tube and a funnel. The tube now carries no taper at all and the twist does
 *  the work, which is also how the reference tube is drawn. */
const RAKE_SPIN = 20;
/** The gentler twist the funnel carries: it is a taper, not a rake, and a
 *  strong spin would make the two Style B marks read as the same move. */
const FUNNEL_SPIN = 6;
/* WHERE THE FUNNEL LANDS, and the correction that produced it. The first pass
   converged the family onto the cone's own tip at t = -1, which is the honest
   reading of "narrows to its tip" and a composition failure: the resolved mark
   sat in the bottom left corner of its box with the rest of the box empty, and
   at 32px it was a speck against the edge. A mark may lose mass on resolve —
   that IS the narrowing — but it may not leave the middle of its own frame. So
   the family converges just short of centre, on the tip side: the closure still
   runs mouth to tip, and the resolved figure still sits where the eye already
   is. The direction is carried by the ORDER of the wave and by which end of the
   cone survives, not by dragging the whole mark into a corner. */
const FUNNEL_CONVERGE_T = -0.15;
/** How completely the family stacks. Short of 1 on purpose: a residual spread
 *  keeps the resolved figure a short tube rather than one lonely ring, which is
 *  most of what stops the 32px specimen disappearing. */
const FUNNEL_COLLAPSE = 0.85;
/** Diameter at the tip, as a share of the ring. Raised from 0.26: the narrow
 *  end has to survive at 32px, where a quarter of the ring is four pixels. */
const FUNNEL_TIP = 0.38;

/* Ruling: at a pitch of 8 the 32px tube ran five rings across nineteen
   rendered pixels, each ring sixteen pixels wide — a smear. Eleven gives three
   plainly separate ovals at 32 and still twenty-two at 240. */
function sweptRings(sizePx: number) {
  const n = countForPitch(sizePx, 11, 3, 22);
  return Array.from({ length: n }, (_, i) => (n === 1 ? 0 : -1 + (2 * i) / (n - 1)));
}

const ringTransform = (t: number, phi: number) =>
  `translate(${(AXIS_UX * t * AXIS_L).toFixed(2)} ${(AXIS_UY * t * AXIS_L).toFixed(
    2,
  )}) rotate(${phi.toFixed(2)} ${CX} ${CY})`;

/**
 * B / Funding Finder — THE RAKED FAMILY RAKES FLAT.
 *
 * Rest: the family spread the full length of its axis, twisted ring to ring and
 * tapering with distance, so it reads as a long tube seen off axis. This is
 * FundingFinderCover's rest pose in one figure. Hover: the spacing, the twist
 * and the taper all collapse together, near end first, and twenty-four rings
 * rake onto one. A residual spread is kept — a family that lands perfectly
 * coincident stops being a family and becomes a thick ring.
 */
export function SweptFundingMark({ sizePx, active, hold, className }: MarkProps) {
  const weight = markWeight(sizePx);
  const rings = sweptRings(sizePx);
  const nodes = useRef<(SVGEllipseElement | null)[]>([]);
  const answer = useRef<SVGCircleElement | null>(null);
  const answerR = point(MARK_BOX, weight) * ANSWER_SCALE;
  const mid = (rings.length - 1) / 2;

  useMarkRamp(
    active,
    (p, reduce) => {
      const mp = reduce ? 0 : p;
      const op = p;
      rings.forEach((t, i) => {
        const el = nodes.current[i];
        if (!el) return;
        const e = ramp(mp, ((t + 1) / 2) * 0.45, 0.55);
        el.setAttribute(
          "transform",
          ringTransform(t * (1 - 0.9 * e), AXIS_DEG + 90 + t * RAKE_SPIN * (1 - e)),
        );
        el.setAttribute(
          "opacity",
          String(holdAlpha(Math.abs(i - mid) < 0.51, 0.34, op)),
        );
      });
      answer.current?.setAttribute("opacity", String(clamp01((op - 0.55) / 0.45)));
    },
    hold,
    sizePx,
  );

  return (
    <MarkSvg sizePx={sizePx} className={className}>
      <g {...hair(MARK_BOX, weight)}>
        {rings.map((t, i) => (
          <ellipse
            key={t}
            ref={(el) => {
              nodes.current[i] = el;
            }}
            cx={CX}
            cy={CY}
            rx={RING_A}
            ry={RING_A * RING_K}
            transform={ringTransform(t, AXIS_DEG + 90 + t * RAKE_SPIN)}
          />
        ))}
      </g>
      <circle
        ref={answer}
        cx={CX}
        cy={CY}
        r={answerR}
        fill="currentColor"
        opacity={0}
      />
    </MarkSvg>
  );
}

/**
 * B / Symptom Checker — THE FUNNEL SHUTS DOWN TO ITS TIP.
 *
 * Rest: the same swept family, but scaled along its axis into a cone — wide
 * mouth, narrow tip. Hover: the mouth closes to the tip's diameter and the
 * whole family slides down the axis onto the tip, the wave running mouth to
 * tip so the closure is directional rather than a uniform shrink. The answer
 * sits at the tip, not at the centre: this project resolves at the narrow end
 * of its own field, and that is where the eye is already looking.
 */
export function SweptTriageMark({ sizePx, active, hold, className }: MarkProps) {
  const weight = markWeight(sizePx);
  const rings = sweptRings(sizePx);
  const nodes = useRef<(SVGEllipseElement | null)[]>([]);
  const answer = useRef<SVGCircleElement | null>(null);
  const answerR = point(MARK_BOX, weight) * ANSWER_SCALE;
  /* The answer sits at the narrow end of the RESOLVED cluster, not of the rest
     figure, so the point and the ring it belongs to arrive in the same place. */
  const tipT = lerp(-1, FUNNEL_CONVERGE_T, FUNNEL_COLLAPSE);
  const tipX = fixed(CX + AXIS_UX * tipT * AXIS_L);
  const tipY = fixed(CY + AXIS_UY * tipT * AXIS_L);
  const taper = (t: number) =>
    RING_A * (FUNNEL_TIP + (1 - FUNNEL_TIP) * ((t + 1) / 2));

  useMarkRamp(
    active,
    (p, reduce) => {
      const mp = reduce ? 0 : p;
      const op = p;
      rings.forEach((t, i) => {
        const el = nodes.current[i];
        if (!el) return;
        const s = (t + 1) / 2;
        const e = ramp(mp, (1 - s) * 0.5, 0.5);
        const a =
          RING_A * (FUNNEL_TIP + (1 - FUNNEL_TIP) * s * (1 - 0.94 * e));
        el.setAttribute("rx", String(a));
        el.setAttribute("ry", String(a * RING_K));
        el.setAttribute(
          "transform",
          ringTransform(
            lerp(t, FUNNEL_CONVERGE_T, FUNNEL_COLLAPSE * e),
            AXIS_DEG + 90 + t * FUNNEL_SPIN * (1 - e),
          ),
        );
        el.setAttribute("opacity", String(holdAlpha(i === 0, 0.34, op)));
      });
      answer.current?.setAttribute("opacity", String(clamp01((op - 0.55) / 0.45)));
    },
    hold,
    sizePx,
  );

  return (
    <MarkSvg sizePx={sizePx} className={className}>
      <g {...hair(MARK_BOX, weight)}>
        {rings.map((t, i) => {
          const a = taper(t);
          return (
            <ellipse
              key={t}
              ref={(el) => {
                nodes.current[i] = el;
              }}
              cx={CX}
              cy={CY}
              rx={a}
              ry={a * RING_K}
              transform={ringTransform(t, AXIS_DEG + 90 + t * FUNNEL_SPIN)}
            />
          );
        })}
      </g>
      <circle
        ref={answer}
        cx={tipX}
        cy={tipY}
        r={answerR}
        fill="currentColor"
        opacity={0}
      />
    </MarkSvg>
  );
}

/* ═══ STYLE C — RADIAL FIELD ══════════════════════════════════════════════
 *
 * CONSTRUCTION. N elements sharing one centre — a spoke fan and a nested ring
 * set, the two members of this family in the reference posters. They are held
 * together by the centre itself: both figures leave the middle empty at rest
 * and both resolve into it, so the fan's rays and the ring set's circles are
 * plainly about the same point.
 *
 * Both animate on ONE attribute per element — a rotation for the fan, a radius
 * for the rings — which is what lets the fan run 60 rays at 240px without a
 * canvas.
 */

const FAN_R0 = 20;
/** Rim spacing, as a share of the render size: a fan's ruling is the gap
 *  between rays at the rim, not the number of rays. 2 x pi x (84/184). */
const RIM_SPAN = 2.87;
/** Where the fan gathers. Up: the resolved wedge reads as a pointer rather than
 *  as a figure that fell over. */
const FAN_TARGET = -90;
/* HOW THE FAN GATHERS, after two wrong answers.
 *
 * The first swung every ray to within six per cent of ONE bearing and left the
 * answer point at the centre, twenty pixels below the resulting hairline
 * sliver: the resolved mark read as an EXCLAMATION MARK. The second opened the
 * gather into a wedge, which killed the punctuation but moved the whole figure
 * into the top half of its box — a mark that jumps out of the middle of its own
 * frame on hover is not usable at 32px in a card.
 *
 * So the gather is folded to the nearest HALF turn: a ray goes to the target
 * bearing or to its opposite, whichever is closer, and the burst closes into a
 * spindle through the centre rather than a beam off one side. The figure stays
 * centred, keeps its mass at every size, and pinches at exactly the point the
 * answer occupies. It still says the one thing the fan is for — every direction
 * agreeing on one axis — and it says it as a taut figure rather than a sliver.
 */
const FAN_GATHER = 0.8;
/** Inner radius of the fan at rest, and the waist it closes to. */
const FAN_R1 = 4;

/**
 * C / Funding Finder — THE SUNBURST SWINGS ONTO ONE RAY.
 *
 * Rest: a full 360-degree fan of hairline rays, every direction equally weighted
 * — every option on the table. Hover: each ray swings toward one bearing,
 * nearest first — folded to the nearest half turn — while their inner ends run in
 * to a waist, so the burst closes like an iris and lands as one taut spindle
 * with the answer at its pinch. Alignment, at its most literal: the options do
 * not disappear, they agree.
 */
export function RadialFundingMark({ sizePx, active, hold, className }: MarkProps) {
  const weight = markWeight(sizePx);
  const n = countForPitch(sizePx, 8, 9, 60, RIM_SPAN);
  const rays = Array.from({ length: n }, (_, i) => {
    const deg = (i * 360) / n;
    /* Folded to the nearest half turn, so no ray ever travels more than 90
       degrees and the two halves of the burst close toward each other. */
    const raw = wrapDeg(deg - FAN_TARGET);
    const delta = raw > 90 ? raw - 180 : raw < -90 ? raw + 180 : raw;
    /* `raw`, not `delta`, picks the survivor: the fold makes the two ends of the
       axis equivalent for the TRAVEL, but the ray that stays at full ink should
       be the one on the target end, not its opposite. Choosing on the folded
       value leaves a lone hairline pointing the wrong way in the reduced-motion
       still, which is the one state that has nothing else to explain itself. */
    return { deg, rad: degToRad(deg), delta, toTarget: Math.abs(raw) };
  });
  const closest = rays.reduce(
    (best, r, i) => (r.toTarget < rays[best].toTarget ? i : best),
    0,
  );
  const nodes = useRef<(SVGLineElement | null)[]>([]);
  const answer = useRef<SVGCircleElement | null>(null);
  const answerR = point(MARK_BOX, weight) * ANSWER_SCALE;

  useMarkRamp(
    active,
    (p, reduce) => {
      const mp = reduce ? 0 : p;
      const op = p;
      rays.forEach((r, i) => {
        const el = nodes.current[i];
        if (!el) return;
        const e = ramp(mp, (Math.abs(r.delta) / 90) * 0.5, 0.5);
        const turn = -r.delta * FAN_GATHER * e;
        el.setAttribute("transform", `rotate(${turn.toFixed(2)} ${CX} ${CY})`);
        const inner = lerp(FAN_R0, FAN_R1, e);
        el.setAttribute("x1", String(CX + Math.cos(r.rad) * inner));
        el.setAttribute("y1", String(CY + Math.sin(r.rad) * inner));
        el.setAttribute("opacity", String(holdAlpha(i === closest, 0.22, op)));
      });
      answer.current?.setAttribute("opacity", String(clamp01((op - 0.55) / 0.45)));
    },
    hold,
    sizePx,
  );

  return (
    <MarkSvg sizePx={sizePx} className={className}>
      <g {...hair(MARK_BOX, weight)}>
        {rays.map((r, i) => (
          <line
            key={r.deg}
            ref={(el) => {
              nodes.current[i] = el;
            }}
            x1={fixed(CX + Math.cos(r.rad) * FAN_R0)}
            y1={fixed(CY + Math.sin(r.rad) * FAN_R0)}
            x2={fixed(CX + Math.cos(r.rad) * FIELD_R)}
            y2={fixed(CY + Math.sin(r.rad) * FIELD_R)}
          />
        ))}
      </g>
      <circle
        ref={answer}
        cx={CX}
        cy={CY}
        r={answerR}
        fill="currentColor"
        opacity={0}
      />
    </MarkSvg>
  );
}

const RING_IN = 18;
/** Radial pitch of the ring set, as a share of the render size: (84 - 18)/184. */
const RING_SPAN = 0.359;

/**
 * C / Symptom Checker — THE RING FIELD NESTS INTO ITS OWN CENTRE.
 *
 * Rest: concentric rings out to the field radius, a wide open question. Hover:
 * every ring contracts toward the innermost one, outermost first, so the field
 * narrows band by band into a tight nested cluster with the answer at its
 * centre. Nothing is deleted — the whole field is still there, compressed onto
 * one answer, which is what a triage actually does to a differential.
 */
export function RadialTriageMark({ sizePx, active, hold, className }: MarkProps) {
  const weight = markWeight(sizePx);
  const n = countForPitch(sizePx, 6, 3, 14, RING_SPAN);
  const radii = Array.from({ length: n }, (_, i) => {
    const s = n === 1 ? 0 : i / (n - 1);
    return { s, r: RING_IN + s * (FIELD_R - RING_IN), nested: RING_IN + s * 8 };
  });
  const nodes = useRef<(SVGCircleElement | null)[]>([]);
  const answer = useRef<SVGCircleElement | null>(null);
  const answerR = point(MARK_BOX, weight) * ANSWER_SCALE;

  useMarkRamp(
    active,
    (p, reduce) => {
      const mp = reduce ? 0 : p;
      const op = p;
      radii.forEach((ring, i) => {
        const el = nodes.current[i];
        if (!el) return;
        const delay = (1 - ring.s) * 0.5;
        el.setAttribute(
          "r",
          String(lerp(ring.r, ring.nested, ramp(mp, delay, 0.5))),
        );
        el.setAttribute("opacity", String(holdAlpha(i === 0, 0.3, op)));
      });
      answer.current?.setAttribute("opacity", String(clamp01((op - 0.55) / 0.45)));
    },
    hold,
    sizePx,
  );

  return (
    <MarkSvg sizePx={sizePx} className={className}>
      <g {...hair(MARK_BOX, weight)}>
        {radii.map((ring, i) => (
          <circle
            key={ring.r}
            ref={(el) => {
              nodes.current[i] = el;
            }}
            cx={CX}
            cy={CY}
            r={ring.r}
          />
        ))}
      </g>
      <circle
        ref={answer}
        cx={CX}
        cy={CY}
        r={answerR}
        fill="currentColor"
        opacity={0}
      />
    </MarkSvg>
  );
}

/* ── registry ─────────────────────────────────────────────────────────────── */

export type MarkStyleId = "lattice" | "swept" | "radial";
export type MarkProjectId = "funding" | "triage";

export const markStyles: {
  id: MarkStyleId;
  name: string;
  construction: string;
  motion: string;
}[] = [
  {
    id: "lattice",
    name: "Lattice",
    construction:
      "Equal circles on an odd square grid, overlapping into lens cells. The pitch is solved from the outer radius, so 3 by 3 and 7 by 7 carry the same optical mass.",
    motion:
      "The field holds still and the marks move, or the field closes and one mark holds still.",
  },
  {
    id: "swept",
    name: "Swept family",
    construction:
      "One ellipse repeated along an oblique axis with a rotation ramp, reading as an extruded volume rather than a stack. A tube for one project, a cone for the other.",
    motion:
      "The sweep collapses along its own axis: spacing, twist and diameter resolve together onto one ring.",
  },
  {
    id: "radial",
    name: "Radial field",
    construction:
      "N elements about one centre, left empty at rest. A spoke fan and a nested ring set, one ruling each.",
    motion:
      "Everything converges on the centre it already shares, either by bearing or by radius.",
  },
];

export function ConstructedMark({
  style,
  project,
  ...rest
}: MarkProps & { style: MarkStyleId; project: MarkProjectId }) {
  if (style === "lattice") {
    return project === "funding" ? (
      <LatticeFundingMark {...rest} />
    ) : (
      <LatticeTriageMark {...rest} />
    );
  }
  if (style === "swept") {
    return project === "funding" ? (
      <SweptFundingMark {...rest} />
    ) : (
      <SweptTriageMark {...rest} />
    );
  }
  return project === "funding" ? (
    <RadialFundingMark {...rest} />
  ) : (
    <RadialTriageMark {...rest} />
  );
}
