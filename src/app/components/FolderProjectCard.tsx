"use client";

/*
 * FOLDER PROJECT CARD — the work entry as a die-cut card of paper.
 *
 * A candidate home card, built to be read against `LoFiProjectCard` on
 * /explore/folder-cards. It ships nowhere yet and the home grid does not know it
 * exists.
 *
 * THE ONE IDEA: THE CARD IS A PIECE OF STOCK, NOT A PICTURE. Every other card in
 * this repo shows you the work — a luminous field, a plate that develops, a
 * cover that animates. This one shows you nothing at all. It is a rectangle of
 * white stock lying on a charcoal ground with a step punched out of one corner,
 * a small filing mark at the head, and the title set low. The memorable thing is
 * the SILHOUETTE, so the interior is left almost empty on purpose: a card that
 * has an outline worth looking at does not also need a picture.
 *
 * (Rewritten August 2026. The previous pass was a tab-and-sheet folder over a
 * colour bloom; that whole construction is gone. Two of its lessons are not, and
 * both are load-bearing below: a shape stretched to an unknown card size skews
 * its own corner radii, and two abutting fills of the same colour show a
 * hairline seam wherever they do not overlap.)
 *
 * THE STEP. The silhouette is a rounded rectangle whose top edge runs level,
 * falls away on a shallow diagonal, and then continues level at the lower height
 * to the far corner. EVERY turn on that path is radiused — the convex one where
 * the level edge starts to fall, the concave one where it stops falling, and the
 * outer corner beyond it. That is the whole point of the shape, and it is also
 * why it cannot be a `clip-path: polygon()`: polygons have no radii, and the
 * blur-and-contrast trick that fakes them turns crisp stock into gum.
 *
 * A ROUNDED CORNER IS NOT THE SAME THING AS A CORNER THAT LOOKS ROUNDED, and
 * this component learned that the hard way: its first pass filleted both turns
 * at a 10px radius, which on a 31° to 38° turn bends the outline by less than
 * two thirds of a pixel and reads as a hard angle. Fillets are therefore sized
 * by their RISE and the radius solved backwards — see `FILLET_RISE`. Do not
 * "simplify" that back to a constant radius.
 *
 * SO THE SHAPE IS DRAWN AT 1:1, NEVER STRETCHED. The card is three abutting
 * fills, and only the middle one is bespoke:
 *
 *   SLAB   the level part of the head, a plain box with one rounded outer
 *          corner, running from the card's edge to where the tile begins.
 *   TILE   an inline `<svg>` whose width and height in CSS pixels are exactly
 *          its viewBox, so the fillets come out at the radius they were
 *          specified at no matter how wide the card is. It carries the convex
 *          turn, the diagonal, the concave turn and the outer corner.
 *   BODY   everything below (or above) the step: a plain full-width box with the
 *          two remaining outer corners rounded.
 *
 * Their union is the silhouette. Each overlaps its neighbour by SEAM px, because
 * these edges land on fractional positions and same-coloured fills that merely
 * touch will show a hairline between them.
 *
 * THE NOTCH IS A CONSTANT SIZE, NOT A PROPORTION. Its depth, its run and its
 * distance from the corner are pixel values, so a narrow card and a wide one
 * look punched by the same die rather than by a die that grew. That is the
 * design reason; the engineering reason is the same one, from the other end —
 * a proportional notch is a stretched notch, and a stretched notch has oval
 * fillets. One decision buys both.
 *
 * EVERY CARD IS A DIFFERENT CUT, deterministically. `SHAPES` is a hand-authored
 * table, indexed by the card's position in the grid — not a hash and not a
 * random pick, so the row is stable across renders and every silhouette in it
 * has been checked to fit at 320px. The table is six long against a four-column
 * grid so no column repeats a shape, and it holds one plain rectangle with no
 * step at all, because a set of variations needs a null case to be read as
 * variations rather than as noise.
 *
 * THE PUNCH DOT is the small disc of stock left sitting in the cut. It is the
 * one piece of pure ornament on the card and it earns its place by explaining
 * the void: with it there the gap reads as something removed, without it the
 * card just looks broken at one corner. Only notched cards get one.
 *
 * WHAT THE CARD SAYS, and what it deliberately does not. A filing mark at the
 * head naming what kind of thing this is (and therefore whether the click leaves
 * the site), the title low and in caps, the tagline under it, then the mark and
 * the docket. Every field renders only when the registry holds it, so a card
 * with no measured result simply says less; nothing is invented to fill a slot.
 * `role` is left off — the registry's own note explains that most entries say
 * much the same thing there, and a fact that does not vary between cards cannot
 * help a reader tell them apart.
 */

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";
import { workEntryHref, type WorkEntry } from "../work/projects";
import { articleCardHeading } from "./typography";

/* GEOMETRY. Artwork constants describing one die, in the same category as the
   bloom coordinates in projectFields.ts: they draw a shape, they are not spacing
   in the layout system. All values are CSS pixels at 1:1. */

/** Outer corner radius, matching `rounded-2xl` so the drawn corner and the
    class-drawn corners on the slab and body are the same curve. */
const R = 16;
/**
 * HOW FAR EACH TURN OF THE STEP PULLS AWAY FROM ITS SHARP VERTEX, in pixels.
 * The radius is solved from this rather than set directly, and that inversion is
 * the whole correction made here.
 *
 * A fillet's visible deviation is its SAGITTA, `r · (sec(θ/2) − 1)`, and at the
 * shallow angles this card uses that factor is only 4% to 6%. The 10px radius
 * this component first shipped with therefore bent the outline by **0.38px to
 * 0.58px** — geometrically a curve, optically a hard angle, which is exactly how
 * it read. Sizing a fillet by its radius is sizing it by the wrong number: the
 * same radius reads as a generous round on a right angle and as nothing at all
 * on a 31° turn.
 *
 * So state the rise and solve `r = rise / (sec(θ/2) − 1)`. Every turn then bends
 * by the same visible amount whatever its angle, which is what "shallow curve on
 * every corner" actually means. The radii that fall out are large (47 to 85px on
 * a 26 to 44px fall) and that is correct, not alarming — a long-radius arc
 * through a shallow turn is a gentle curve, and the arc only ever occupies the
 * corner, never the straight runs on either side of it.
 */
const FILLET_RISE = 3.2;
/** Straight diagonal that must survive between the two arcs. The floor is what
    keeps the fall a fall: let the arcs meet and the step becomes a pure S curve
    with no diagonal in it, which is not the shape. Where the run is too short to
    afford the full rise, the fillet is capped here and bends slightly less. */
const MIN_DIAGONAL = 10;
/** Straight level run between the concave fillet and the outer corner's arc, so
    the two curves read as two corners rather than as one long bend. */
const MIN_LEVEL = 8;
/** Floor for the level run before the fall begins. The fillet's own tangent sets
    the real value; this only stops a small die from starting its fall flush
    against the slab's seam. */
const MIN_LEAD = 18;
/** How far each fill runs under its neighbour, against hairline seams. */
const SEAM = 1;
/** Diameter of the punch dot left in the cut. */
const DOT = 7;

type Cut = {
  /** Which corner the step is punched from. `"none"` is a plain rectangle. */
  corner: "top-right" | "bottom-right" | "none";
  /** How far the edge falls. */
  depth: number;
  /** Level run from the foot of the fall to the outer corner, as a MINIMUM. Sets
      how far in from the edge the step sits. `die()` raises it where the fillet
      needs more room, so the table states intent and the geometry has the last
      word — a hand-set tail can never starve its own corner. */
  tail: number;
  /** Fall angle from the level, in degrees. Kept inside 30–40: below 30 the
      diagonal reads as a second horizontal, above 40 as a chamfered corner. */
  angle: number;
};

/* THE TABLE. Six cuts, checked to fit a 288px card (320px viewport, page
   gutters) with the filing mark still clear of the diagonal. Order matters: the
   null case and the bottom-right cut sit mid-table so a four-column row opens
   with three different top-right steps and then breaks pattern. */
const SHAPES: Cut[] = [
  { corner: "top-right", depth: 34, tail: 34, angle: 34 },
  { corner: "top-right", depth: 26, tail: 74, angle: 38 },
  { corner: "top-right", depth: 44, tail: 30, angle: 31 },
  { corner: "none", depth: 0, tail: 0, angle: 0 },
  { corner: "bottom-right", depth: 30, tail: 40, angle: 36 },
  { corner: "top-right", depth: 30, tail: 52, angle: 33 },
];

type Die = Cut & {
  /** Horizontal distance the edge covers while falling. */
  run: number;
  /** Radius solved from `FILLET_RISE`, then capped by the run. */
  fillet: number;
  /** Resolved level run before the fall, at least the fillet's tangent. */
  lead: number;
  tileW: number;
  tileH: number;
  path: string;
};

const round = (value: number) => Math.round(value * 100) / 100;

/** Resolve one table entry into its fillet, the tile's size, and the path. */
function die(cut: Cut): Die {
  const rad = (cut.angle * Math.PI) / 180;
  const half = Math.tan(rad / 2);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const run = cut.depth / Math.tan(rad);

  /* SOLVE THE RADIUS FROM THE RISE, then cap it on what the fall can afford.
     `sec(θ/2) − 1` is the sagitta per unit radius; inverting it gives the radius
     that bends the outline by FILLET_RISE at this angle. The cap is the tangent
     length that still leaves MIN_DIAGONAL of straight fall between the two
     arcs — a shape whose run is too short bends a little less rather than
     losing its diagonal. */
  const perRadius = 1 / Math.cos(rad / 2) - 1;
  const diagonal = run / cos;
  const maxTangent = Math.max(0, (diagonal - MIN_DIAGONAL) / 2);
  const fillet = Math.min(FILLET_RISE / perRadius, maxTangent / half);

  /* Tangent length: how far back from each vertex the arc starts. Both turns
     deflect by the fall angle, so both use the same tangent, and both the lead
     and the tail have to make room for it. Widening the tile is the right
     failure mode — clipping a corner is not. */
  const t = fillet * half;
  const lead = Math.max(MIN_LEAD, t + 6);
  const tail = Math.max(cut.tail, R + t + MIN_LEVEL);

  const tileW = lead + run + tail;
  /* Tall enough to hold the fall plus the outer corner's arc, with slack below
     it so the body's seam lands on straight stock rather than mid-curve. */
  const tileH = cut.depth + R + 12;

  const v1 = lead; /* vertex where the fall begins */
  const v2 = lead + run; /* vertex where it ends, at y = depth */

  const path = [
    "M 0 0",
    `L ${round(v1 - t)} 0`,
    /* Convex turn onto the diagonal: clockwise on screen, so sweep 1. */
    `A ${round(fillet)} ${round(fillet)} 0 0 1 ${round(v1 + t * cos)} ${round(t * sin)}`,
    `L ${round(v2 - t * cos)} ${round(cut.depth - t * sin)}`,
    /* Concave turn back to level: the opposite hand, so sweep 0. This is the
       corner a polygon cannot round and the reason for the whole tile. */
    `A ${round(fillet)} ${round(fillet)} 0 0 0 ${round(v2 + t)} ${round(cut.depth)}`,
    `L ${round(tileW - R)} ${round(cut.depth)}`,
    `A ${R} ${R} 0 0 1 ${round(tileW)} ${round(cut.depth + R)}`,
    `L ${round(tileW)} ${round(tileH)}`,
    `L 0 ${round(tileH)}`,
    "Z",
  ].join(" ");

  return { ...cut, run, fillet, lead, tail, tileW, tileH, path };
}

/**
 * The stock: three fills whose union is the silhouette, plus the punch dot.
 * Sits behind the content and is invisible to assistive technology — the link's
 * own label carries everything a reader needs.
 */
function Stock({ shape }: { shape: Die }) {
  if (shape.corner === "none") {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-card"
      />
    );
  }

  const top = shape.corner === "top-right";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* SLAB — the level part of the stepped edge. */}
      <div
        className={cn(
          "absolute left-0 bg-card",
          top ? "top-0 rounded-tl-2xl" : "bottom-0 rounded-bl-2xl"
        )}
        style={{ right: shape.tileW - SEAM, height: shape.tileH }}
      />

      {/* TILE — the step itself, at 1:1 so its fillets keep their radius. The
          bottom-right cut is the same path mirrored about the tile's midline,
          which is exact where a second hand-written path would drift. */}
      <svg
        className={cn("absolute right-0 block", top ? "top-0" : "bottom-0")}
        width={round(shape.tileW)}
        height={round(shape.tileH)}
        viewBox={`0 0 ${round(shape.tileW)} ${round(shape.tileH)}`}
        fill="none"
      >
        <g
          transform={
            top ? undefined : `translate(0 ${round(shape.tileH)}) scale(1 -1)`
          }
        >
          <path d={shape.path} fill="var(--card)" />
        </g>
      </svg>

      {/* BODY — everything past the step, carrying the two far corners. */}
      <div
        className={cn(
          "absolute inset-x-0 bg-card",
          top ? "bottom-0 rounded-b-2xl" : "top-0 rounded-t-2xl"
        )}
        style={top ? { top: shape.tileH - SEAM } : { bottom: shape.tileH - SEAM }}
      />

      {/* THE PUNCH DOT, centred in the cut. */}
      <div
        className="absolute rounded-full bg-card"
        style={{
          right: shape.tail / 2 - DOT / 2,
          top: top ? shape.depth / 2 - DOT / 2 : undefined,
          bottom: top ? undefined : shape.depth / 2 - DOT / 2,
          width: DOT,
          height: DOT,
        }}
      />
    </div>
  );
}

/**
 * One work entry as a die-cut card: a stepped silhouette, a filing mark at the
 * head, and the title set low.
 */
export function FolderProjectCard({
  entry,
  index = 0,
}: {
  entry: WorkEntry;
  index?: number;
}) {
  const shouldReduce = useReducedMotion();
  const isArticle = entry.kind === "article";
  const href = workEntryHref(entry);
  const shape = die(SHAPES[index % SHAPES.length]);

  /* THE HEAD MARK names the kind rather than counting the card. A lettered or
     numbered index in this slot is what the reference does; it would be the one
     thing on the card carrying no information, and the site does not number
     things a reader cannot use the number for. "Writing" also does real work —
     it is the warning that the click leaves the site, which until now only the
     aria-label carried. */
  const kind = isArticle ? "Writing" : "Work";

  /* The foot, resolved from the registry and never from an assumption. A case
     study leads with what it caused; a piece of writing leads with where it
     lives, because that is what a reader needs before a link opens a new tab. */
  const markValue = entry.outcome?.value ?? (isArticle ? entry.publication : undefined);
  const markLabel = entry.outcome?.label;
  const filing = isArticle ? entry.topic : entry.industry;
  const docket = [filing, entry.year].filter(Boolean).join(" · ");

  /* Named on the link rather than inside the card: an explicit aria-label
     replaces the element's contents, so anything set sr-only in the card would
     never be reached. */
  const outcomeLine = entry.outcome
    ? ` Outcome: ${entry.outcome.value}. ${entry.outcome.label}.`
    : "";
  const ariaLabel = isArticle
    ? `Read "${entry.title}" on ${entry.publication} (opens in a new tab): ${entry.tagline}`
    : `Open the ${entry.title} case study: ${entry.tagline}.${outcomeLine}`;

  const cardMotion: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
    shown: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: shouldReduce ? 0 : Math.min(index * 0.05, 0.15),
      },
    },
    tap: { scale: shouldReduce ? 1 : 0.985, transition: motionEase.spring },
  };

  /* THE ONLY MOTION ON THE CARD: the stock lifts off the ground. There is no
     shadow to grow and no colour to reveal, so a few pixels of travel against a
     flat charcoal plane is the whole hover. Composed here rather than as a
     `motion-reduce:` variant stack so there is one place to read what reduced
     motion gets, which is no movement at all. It sits on an inner wrapper rather
     than on the article, because Motion owns the article's transform. Hover
     only: keyboard focus draws an offset outline, and lifting the card inside a
     stationary outline reads as a glitch rather than as a response. */
  const liftClass = shouldReduce
    ? ""
    : "transition-transform duration-200 ease-out group-hover:-translate-y-1";

  /* Two reserves, both driven by the die rather than guessed. Horizontally, the
     head mark is kept clear of the diagonal by reserving the tile's full width —
     over-reserving by the container's padding, which only ever shortens the
     mark's measure and can never collide, and safe at every depth because the
     diagonal moves RIGHT as it falls, so a mark that wraps gains room on its
     second line. Vertically, the foot clears a bottom-right step.

     The horizontal reserve is `tileW − lead`, which is EXACT at the mark's own
     top edge rather than merely safe: the paper still runs level as far as the
     lead, so that is where the mark's measure has to stop. Reserving the whole
     tile (as this did first) threw away the lead, and the lead grew when the
     fillets did — the mark would have lost measure for a curve that never
     reaches it. */
  const headReserve =
    shape.corner === "top-right" ? shape.tileW - shape.lead : undefined;
  const footReserve =
    shape.corner === "bottom-right" ? shape.depth + 8 : undefined;

  const card = (
    <motion.article
      variants={cardMotion}
      initial="hidden"
      whileInView="shown"
      whileTap="tap"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      className="relative flex h-full min-h-72 flex-col sm:min-h-80"
    >
      <div className={cn("relative flex grow flex-col", liftClass)}>
        <Stock shape={shape} />

        <div className="relative flex grow flex-col p-5 sm:p-6">
          {/* THE FILING MARK. Parenthesised because the reference's index is,
              and because parentheses read as an aside rather than a label —
              which is what this is. */}
          <p
            className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground"
            style={headReserve ? { paddingRight: headReserve } : undefined}
          >
            ( {kind} )
          </p>

          {/* The empty middle is the point: the silhouette is what the card is a
              picture of, and it needs room to be seen. It is also the slack that
              absorbs a row stretching every card to the tallest one in it. */}
          <div aria-hidden="true" className="min-h-16 grow" />

          {/* Caps in the display face, which is a geometric sans drawn for
              exactly this. The size token stands; only its tracking is
              overridden, because -0.01em is set for lowercase and caps at the
              same value close up into a block. */}
          <h3
            className={cn(
              articleCardHeading,
              "text-balance uppercase tracking-[0.02em] text-foreground"
            )}
          >
            {entry.title}
          </h3>
          <p className="mt-2 max-w-[36ch] text-sm leading-snug text-muted-foreground">
            {entry.tagline}
          </p>

          {markValue && (
            <p className="mt-4 max-w-[36ch] text-sm leading-snug">
              <span className="font-medium text-foreground">{markValue}</span>
              {markLabel && (
                <span className="text-muted-foreground"> {markLabel}</span>
              )}
            </p>
          )}

          {/* THE DOCKET stays in sentence case while the head mark above is
              uppercase and tracked, and that is a split rather than an
              inconsistency. The head mark is a category label and takes the
              house treatment for one; this is a subject and a date, which at
              12px uppercase on 0.16em runs 277px and wraps on a 320px card into
              a broken stamp. Supporting text of a few words, set as such. */}
          {docket && (
            <p className="mt-3 text-xs leading-snug text-muted-foreground">
              {docket}
            </p>
          )}

          {/* A bottom-right cut raises the card's foot on the right, so the last
              line has to finish above the step. Held as a spacer rather than as
              inline padding, which would overwrite the responsive padding class
              instead of adding to it. */}
          {footReserve ? (
            <div aria-hidden="true" style={{ height: footReserve }} />
          ) : null}
        </div>
      </div>
    </motion.article>
  );

  /* Outline rather than a ring, and rectangular rather than notched: an offset
     outline shows whatever ground the card is sitting on, and a copy of the
     silhouette grown by 3px would put its diagonal 4.2px off the card's instead
     of 3, which reads as a mistake rather than a halo. */
  const linkClass =
    "group mx-auto block h-full w-full max-w-md rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";

  return isArticle ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-explore-card
      data-cursor-label="Read"
      aria-label={ariaLabel}
      className={linkClass}
    >
      {card}
    </a>
  ) : (
    <Link
      href={href}
      data-explore-card
      data-cursor-label="Open"
      aria-label={ariaLabel}
      className={linkClass}
    >
      {card}
    </Link>
  );
}
