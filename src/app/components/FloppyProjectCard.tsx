"use client";

/*
 * FLOPPY PROJECT CARD — the home grid as an index of 3.5" disks, drawn in line.
 *
 * ── WHAT THIS FINISHES, AND HOW IT ANSWERS IT ────────────────────────────
 * The hero above it (`HomeFlight` → `world/WorldGlassCard.tsx`) draws one
 * floppy as a tonally-modelled object — opaque plates, stepped greys, a bevel
 * instead of an outline — which assembles on load, opens its shutter, and
 * slides UP INTO A SLOT as the reader scrolls toward the work section. The grid
 * is the shelf it was going into, and it answers in the OTHER drawing of the
 * same object: a clean technical outline, the way a disk appears in a catalogue
 * rather than in a photograph. The hero is the thing; the grid is the record.
 *
 * That contrast is deliberate and it is the third answer to the same question.
 * Passes one to three built the grid as small copies of the hero — plates in
 * colour, then plates in pastel, then plates in grey — and all three read as
 * miniatures of an object rather than as an index of work. See `floppyInk.ts`.
 *
 * ── FOUR LINES AND TWO OF TYPE ───────────────────────────────────────────
 * The drawing is the chamfered body, the shutter, the window it uncovers, and
 * the sticker. No insertion arrow, no write-protect hole, no recess step, no
 * bevel — those were miniature fidelity at the 251px card this grid actually
 * produces. The sticker carries the project's name and its tagline; the
 * registry's role, year and outcome are stated statically in the link's
 * accessible name rather than typeset as a form nobody filled in.
 *
 * IT IS NOT A SKETCH. One weight everywhere via `non-scaling-stroke`, geometric
 * arcs, round joins, hidden lines removed. This repo tried hand-drawn line work
 * on the case-study rail and killed it after crit; nothing here is rough.
 *
 * ── THE HOVER IS A DEVELOP, IN LINE ──────────────────────────────────────
 * Everything on the sticker is legible with nothing running (style-rules §7,
 * "motion is not information"): the title is at full ink at rest and the
 * tagline sits at 8.11:1 on the band, above the bar small text is held to. What
 * the pointer buys is the grey line darkening one step, the shutter running
 * open so one rectangle becomes two, and a fresh sticker being pressed on. A
 * reader on a touch screen, or one who never hovers anything, loses a payoff
 * and no facts.
 *
 * THE DRAWING NEVER GOES BLACK. It develops from a quiet draft grey to the deep
 * warm grey the tagline rests in, and the tagline moves up past it to full ink
 * on the same clock — so whichever state a card is in, the title reads first,
 * the tagline second, the line last. A drawing that outshouts its own label is
 * how the previous three passes of this card went wrong.
 *
 * ── ONE CLOCK ────────────────────────────────────────────────────────────
 * A single `develop` MotionValue runs 0 → 1 and every line and fill takes a
 * SUB-RANGE of it with its own easing. So the whole develop is one animation
 * rather than four, it reverses exactly on hover-out (retarget, never queue),
 * and nothing re-renders React per frame — the values are bound through
 * `style`. Nothing runs at rest: no rAF, no canvas, no loop.
 */

import Link from "next/link";
import { useEffect, useState, type FocusEvent, type ReactNode } from "react";
import {
  animate,
  cubicBezier,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { motionDuration, motionEase } from "../lib/motion";
import { workEntryHref, type WorkEntry } from "../work/projects";
import {
  DISK,
  DISK_VIEW,
  LABEL_BOX,
  LABEL_INK,
  LINE,
  PLATE,
  STICKER,
  STROKE_WIDTH,
  SLIDE,
} from "./floppyInk";

const OUT = cubicBezier(
  motionEase.out[0],
  motionEase.out[1],
  motionEase.out[2],
  motionEase.out[3],
);

/* ── THE DEVELOP'S SUB-RANGES ─────────────────────────────────────────────
   Fractions of one 1.0s ramp, overlapping so the drawing never stops moving
   between beats. The order is the order the object would be made in: the line
   is inked, the mechanism is opened, the label is stuck on, and the caption is
   written last.

   ONE SECOND IS ABOVE THE 300ms INTERACTIVE CEILING ON PURPOSE. Reaching for a
   project card is a deliberate, rare, reader-initiated move rather than a
   repeated in-flow control, which is the frequency gate's own case for an
   expressive reveal, and it sits inside the 1s budget style-rules §7 allows a
   display moment. The last beat lands exactly at 1.0, so the clock has no dead
   tail. */
const DEVELOP_MS = 1000;

type Range = readonly [number, number];

const RANGE = {
  /** Every stroke darkens one step, from a draft grey to the tagline's own. */
  line: [0, 0.5],
  /** The shutter runs open, uncovering the window: one rectangle becomes two. */
  shutter: [0.18, 0.6],
  /** A fresh sticker is pressed onto the case. */
  sticker: [0.34, 0.72],
  /** And the tagline inks from quiet to full. */
  writing: [0.5, 1],
} as const satisfies Record<string, Range>;

/** A numeric sub-range of the develop, eased on its own and clamped at both
    ends, so every beat reads as its own move inside one continuous ramp. */
function useBeat(
  develop: MotionValue<number>,
  range: Range,
  from: number,
  to: number,
) {
  return useTransform(develop, [range[0], range[1]], [from, to], {
    ease: OUT,
    clamp: true,
  });
}

/** The same, mixing two inks rather than two numbers. Safe here: both ends of
    every ramp below are warm neutrals off one ink, so the interpolation cannot
    walk through an intermediate hue. */
function useInk(
  develop: MotionValue<number>,
  range: Range,
  from: string,
  to: string,
) {
  return useTransform(develop, [range[0], range[1]], [from, to], {
    ease: OUT,
    clamp: true,
  });
}

/* ── THE DRAWING ──────────────────────────────────────────────────────────
   Paint order is the section through a real disk, because the fills are doing
   hidden-line removal: the body first, then the window, then the shutter over
   it, then the sticker. `PLATE` is the band's own colour and exists only to
   occlude — see `floppyInk.ts`.

   `aria-hidden`, because it is a picture. Everything a reader needs is either
   HTML type on the sticker or in the link's accessible name. */
function Drawing({ develop }: { develop: MotionValue<number> }) {
  const stroke = useInk(develop, RANGE.line, LINE.rest, LINE.dev);
  const sticker = useBeat(develop, RANGE.sticker, 0, 1);
  const shutterX = useBeat(develop, RANGE.shutter, SLIDE, 0);

  /* One declaration for every line on the object, so a shelf of disks can only
     ever be drawn in one hand. `non-scaling-stroke` is what holds the weight
     constant from a 251px card to a 443px one. */
  const pen = {
    fill: "none" as const,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${DISK_VIEW.w} ${DISK_VIEW.h}`}
      className="absolute inset-0 h-full w-full"
    >
      <motion.path d={DISK.body} {...pen} fill={PLATE} style={{ stroke }} />

      <motion.path d={DISK.window} {...pen} style={{ stroke }} />

      {/* THE SHUTTER IS THE HERO'S SIGNATURE MOVE, REVERSED. That disk runs its
          shutter SHUT as it leaves the screen, because shut is the state a disk
          is in when it is not in a drive. A disk on a shelf is therefore closed
          at rest, and the reader's pointer is the drive that opens it. The fill
          is what makes the travel legible: closed, it hides the window inside
          itself and the object reads as one rectangle. */}
      <motion.g style={{ x: shutterX }}>
        <motion.path d={DISK.shutter} {...pen} fill={PLATE} style={{ stroke }} />
      </motion.g>

      {/* The sticker's outline is there from the first frame; only its paper
          arrives. Two properties on one path rather than a second path over the
          first, so there is never a seam between an outline and its fill. */}
      <motion.path
        d={DISK.sticker}
        {...pen}
        fill={STICKER}
        style={{ stroke, fillOpacity: sticker }}
      />
    </svg>
  );
}

/* ── THE TYPE ON THE STICKER ──────────────────────────────────────────────
 * HTML over the drawing, positioned in percentages of the same box so the two
 * layers stay registered, and sized in `cqw` against the card's own container
 * so one drawn object holds its internal proportions at every width instead of
 * re-typesetting itself per breakpoint (the cover-artwork pattern,
 * `.docs/cover-effects.md`).
 *
 * THE FACE IS GEIST, NOT THE DISPLAY FACE, and that is a deliberate departure
 * from `projectCardHeading`. This label sets between 13px and 22px; Avant
 * Garde's wide geometric forms turn into a row of spaced circles at that size,
 * which is the finding the hero disk's own label recorded before it moved to
 * the body grotesque. Avant Garde is display-only on this site — a ceiling on
 * where it may go, not an obligation — and a sticker is not display type.
 *
 * EVERY SIZE IS A CLAMP WITH A FLOOR, and the binding case is not the phone. A
 * 320px viewport gives a 288px card; the THREE-COLUMN GRID AT EXACTLY 1280px
 * gives a 251px one, which is the narrowest card the layout can produce. Check
 * 1280 first, then 640 (two columns, 280px), then the phone.
 */
const TYPE = {
  /** The project name. 13px floor, 22px cap. */
  title: "clamp(0.8125rem, 5cqw, 1.375rem)",
  /** The tagline under it. */
  body: "clamp(0.625rem, 3.3cqw, 0.875rem)",
} as const;

/** The mark a card that leaves the site carries. Drawn rather than a glyph, so
    it sits on the title's own line at any size and never inherits a font's idea
    of an arrow — and drawn in the same open, round-jointed hand as the disk. */
function LeavesSite() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-[1.4cqw] inline-block h-[0.72em] w-[0.72em] align-[0.02em]"
    >
      <path d="M3 7L7 3M3.6 3H7V6.4" />
    </svg>
  );
}

/* ── THE DISK ─────────────────────────────────────────────────────────────
   Drawing plus sticker type, at the disk's true 188 × 200 proportion. Shared by
   the linked cards and by the placeholder, which is the same drawing with a
   blank sticker.

   The type block's padding is in `cqw` rather than the percentages the
   sticker's position uses, and deliberately: a percentage padding resolves
   against the containing block's WIDTH in both axes, so a vertical figure
   written as a percentage would silently mean something other than what it
   says. The stack is centred and the box clips, so an unusually long title
   spends the sticker's margin instead of printing off the paper. */
function Disk({
  develop,
  children,
}: {
  develop: MotionValue<number>;
  children: ReactNode;
}) {
  return (
    <>
      <Drawing develop={develop} />
      <div
        className="absolute flex flex-col justify-center overflow-hidden"
        style={{
          left: LABEL_BOX.inset,
          right: LABEL_BOX.inset,
          top: LABEL_BOX.top,
          height: LABEL_BOX.height,
          paddingBlock: "3.4cqw",
          paddingInline: "4.6cqw",
        }}
      >
        {children}
      </div>
    </>
  );
}

/**
 * WHAT IS WRITTEN ON THE STICKER, and it is the whole label: the project's
 * name, and the line that says what it was. Both are set at rest; the tagline's
 * ink is the only thing the develop writes.
 *
 * No rule between them, because with two blocks left there is no division for a
 * hairline to draw — the one that used to sit here separated an identity block
 * from a ROLE / YEAR / OUTCOME table, and that table is gone.
 *
 * The clamps are a valve, not a layout — nothing in the registry reaches them
 * at any width.
 */
function Label({
  title,
  sub,
  subInk,
  external,
  titleInk = LABEL_INK.ink,
}: {
  title: string;
  sub: string;
  subInk?: MotionValue<string>;
  external?: boolean;
  titleInk?: string;
}) {
  return (
    <div className="flex flex-col gap-[2cqw]">
      <h2
        className="line-clamp-3 text-balance font-sans font-semibold leading-[1.12]"
        style={{
          fontSize: TYPE.title,
          letterSpacing: "-0.01em",
          color: titleInk,
        }}
      >
        {title}
        {external ? <LeavesSite /> : null}
      </h2>
      <motion.p
        className="line-clamp-3 leading-[1.35]"
        style={{ fontSize: TYPE.body, color: subInk ?? LABEL_INK.quiet }}
      >
        {sub}
      </motion.p>
    </div>
  );
}

/* ── THE CARD ─────────────────────────────────────────────────────────────
   The link is the interactive element and the disk is what it contains, so the
   focus ring belongs to the link and is offset onto the light band the gallery
   sits on. Focus drives the same develop hover does: a keyboard reader must get
   an equally clear state (style-rules §7), and it costs nothing to run one
   clock from two triggers. */
export function FloppyProjectCard({
  entry,
  index,
}: {
  entry: WorkEntry;
  index: number;
}) {
  const reduce = useReducedMotion();
  /* HOVER AND FOCUS ARE HELD SEPARATELY and the develop runs off their union.
     Merged into one flag they interfere: a mouse press focuses the link, and
     the blur that follows a subsequent tab-away would then rest a card the
     pointer is still sitting on. */
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = hovered || focused;
  const isArticle = entry.kind === "article";

  /* ONE CLOCK. Reduced motion pins it developed and never animates it: the
     disks render in a strong static state — every line at full ink, the shutter
     open on its window, the sticker white, the tagline inked — because a card
     whose drawing only resolves during a 1s animation has put its payoff behind
     the one thing that preference removes. */
  const develop = useMotionValue(reduce ? 1 : 0);
  const subInk = useInk(develop, RANGE.writing, LABEL_INK.quiet, LABEL_INK.ink);

  useEffect(() => {
    if (reduce) {
      develop.set(1);
      return;
    }
    /* Nothing to run on first paint, and nothing to run back to from zero. */
    if (!active && develop.get() === 0) return;
    const controls = animate(
      develop,
      active ? 1 : 0,
      active
        ? /* Linear, because every beat above carries its own easing — one clock
             rather than four, so the whole develop retargets as a unit. */
          { duration: DEVELOP_MS / 1000, ease: "linear" }
        : /* Exits are subtler and shorter: the reader's attention has already
             moved on. `animate` retargets from wherever the ramp got to, so
             leaving mid-develop runs back from there and never queues. */
          { duration: motionDuration.instant, ease: motionEase.in },
    );
    return () => controls.stop();
  }, [active, develop, reduce]);

  const href = workEntryHref(entry);

  /* THE ACCESSIBLE NAME CARRIES WHAT THE STICKER NO LONGER DOES. An explicit
     `aria-label` replaces the link's contents, so the registry's role, year and
     outcome are restated here once, statically, in the order a reader wants
     them — which is also why cutting those rows from the drawing cost a
     recruiter nothing. */
  const facts = [
    entry.role ? `Role: ${entry.role}.` : "",
    entry.year ? `Year: ${entry.year}.` : "",
    entry.outcome
      ? `Outcome: ${entry.outcome.value}. ${entry.outcome.label}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  const ariaLabel = (
    isArticle
      ? `Read "${entry.title}" on ${entry.publication}, opens in a new tab: ${entry.tagline} ${facts}`
      : `Open the ${entry.title} case study: ${entry.tagline} ${facts}`
  ).trim();

  /* Focus drives the develop too, but only real keyboard focus: a pointer press
     focuses the link as well, and running the reveal off that would fight the
     hover state already on it. */
  const focusProps = {
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (event.currentTarget.matches(":focus-visible")) setFocused(true);
    },
    onBlur: () => setFocused(false),
  };

  const card = (
    <motion.article
      /* The grid's own entrance: fade up, `fast` on `out`, with the stagger
         capped so a long row is present almost at once. */
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileTap={{ scale: reduce ? 1 : 0.985 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: reduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: reduce ? 0 : Math.min(index * 0.05, 0.15),
      }}
      /* Motion's hover gesture is pointer based and ignores touch, so a tap
         never half-fires the develop. Never `:hover`, for that reason. */
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="@container relative w-full"
      style={{ aspectRatio: `${DISK_VIEW.w} / ${DISK_VIEW.h}` }}
    >
      <Disk develop={develop}>
        <Label
          title={entry.title}
          sub={entry.tagline}
          subInk={subInk}
          external={isArticle}
        />
      </Disk>
    </motion.article>
  );

  const linkClass =
    "group mx-auto block w-full max-w-md rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-secondary";

  return isArticle ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-explore-card
      data-cursor-label="Read"
      aria-label={ariaLabel}
      className={linkClass}
      {...focusProps}
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
      {...focusProps}
    >
      {card}
    </Link>
  );
}

/**
 * THE BLANK DISK. The same drawing in the same hand, with nothing written on
 * its sticker — a disk on the shelf that has not been used yet, which is a
 * truer picture of "more work is coming" than those two words set large on a
 * card.
 *
 * It never develops, because there is nothing to develop into: no link, no
 * hover, no clock. Both its lines are set in `quiet` rather than full ink,
 * which is what an unwritten sticker looks like beside a written one.
 */
export function ComingSoonFloppy({ index }: { index: number }) {
  const reduce = useReducedMotion();
  const develop = useMotionValue(0);

  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: reduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: reduce ? 0 : Math.min(index * 0.05, 0.15),
      }}
      className="@container relative mx-auto w-full max-w-md"
      style={{ aspectRatio: `${DISK_VIEW.w} / ${DISK_VIEW.h}` }}
    >
      <Disk develop={develop}>
        <Label
          title="Coming soon"
          titleInk={LABEL_INK.quiet}
          sub="A blank disk, waiting for the next project."
        />
      </Disk>
    </motion.article>
  );
}
