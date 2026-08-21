"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  CalendarCheck,
  Compass,
  DoorOpen,
  type LucideIcon,
} from "lucide-react";
import { CountUp } from "@/app/components/CountUp";
import { motionDuration, motionEase } from "@/app/lib/motion";

/**
 * The result scorecard for "The outcome" chapter — the deliberate answer to
 * "What success had to look like" one chapter above (CriteriaScorecard). It
 * shares that scorecard's frame exactly (one uniform cell per outcome, the
 * same six-cell grid) so the pair reads as bar-then-result: the Completion
 * cell here answers the Completion target there. Figures share the bar's large
 * teal scale exactly, so the two scorecards read as one matched pair.
 *
 * Colour mirrors the bar exactly, and the pair has to move together: the
 * section is the light teal quiet panel (--secondary, Tile surface="secondary")
 * and the cells are white, floating on --shadow-float with no border. See
 * CriteriaScorecard for why white rather than the theme's retinted --card, and
 * why float rather than card or elevated. Flip one scorecard's surface without
 * the other and the bar stops matching its result.
 *
 * Two kinds share the frame, as in the bar scorecard: a measured result leads
 * with its published figure; a qualitative outcome swaps the figure for a
 * context icon and lets the statement carry the weight. Both marks sit in the
 * deep leaf teal (--leaf #183947, 12.3:1 on white) at the same large scale as
 * the bar scorecard, so the pair reads as one matched system.
 *
 * Figures count up from zero every time they scroll into view (CountUp), on
 * the cell stagger's own cadence, so the result lands as it arrives.
 *
 * Rhythm mirrors the bar exactly: eyebrow at the top, a deliberate mt-6/8 gap
 * to the dominant mark, the supporting line coupled tight beneath (gap-3), all
 * inside a generous p-6/8 frame. Equal-height cells carry slack as trailing
 * space so the figure never crowds an edge.
 *
 * Semantics mirror the bar: a definition list, each cell a `<dt>` label paired
 * with its `<dd>` result. The icon is aria-hidden.
 */

type Outcome =
  | { kind: "metric"; label: string; value: string; detail: string }
  | { kind: "qualitative"; label: string; statement: string; icon: LucideIcon };

const outcomes: Outcome[] = [
  {
    kind: "metric",
    label: "Completion",
    value: "84%",
    detail: "Up from 49%, past the 60–70% target",
  },
  {
    kind: "metric",
    label: "Reach",
    value: "2M",
    detail: "Checks a year, across jurisdictions",
  },
  {
    kind: "metric",
    label: "Adoption",
    value: "2×",
    detail: "More used than the nurse helpline",
  },
  {
    kind: "qualitative",
    label: "Right care, right place",
    statement:
      "Only offers the pathways available to that person's location, time, and jurisdiction",
    icon: Compass,
  },
  {
    kind: "qualitative",
    label: "Connected to care",
    statement:
      "Links straight to real-time appointment availability and booking through Service Finder",
    icon: CalendarCheck,
  },
  {
    kind: "qualitative",
    label: "A front door",
    statement:
      "Became the foundation Healthdirect now calls Gen 2, its first step toward a national virtual front door",
    icon: DoorOpen,
  },
];

const eyebrow =
  "text-xs font-medium uppercase tracking-[0.16em] text-accent-foreground";

export function OutcomeScorecard({ className }: { className?: string }) {
  const shouldReduce = useReducedMotion();

  const v: { grid: Variants; cell: Variants } = {
    grid: {
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduce ? 0 : 0.05 },
      },
    },
    cell: {
      hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduce ? 0.01 : motionDuration.fast,
          ease: motionEase.out,
        },
      },
    },
  };

  return (
    <motion.dl
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      variants={v.grid}
      className={`grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 ${className ?? ""}`}
    >
      {outcomes.map((o, index) => (
        <motion.div
          key={o.label}
          variants={v.cell}
          className="flex flex-col rounded-xl bg-white p-6 md:p-8 shadow-float"
        >
          <dt className={eyebrow}>{o.label}</dt>
          {o.kind === "metric" ? (
            <dd className="mt-6 flex flex-col gap-3 md:mt-8">
              <CountUp
                value={o.value}
                delay={shouldReduce ? 0 : index * 0.05}
                className="text-4xl font-semibold leading-[0.95] tracking-[-0.02em] text-leaf break-words md:text-5xl"
              />
              <span className="text-sm font-medium leading-relaxed text-leaf">
                {o.detail}
              </span>
            </dd>
          ) : (
            <dd className="mt-6 flex flex-col gap-3 md:mt-8">
              <o.icon
                aria-hidden="true"
                strokeWidth={1.75}
                className="size-12 shrink-0 text-leaf md:size-14"
              />
              <span className="text-base leading-relaxed text-foreground">
                {o.statement}
              </span>
            </dd>
          )}
        </motion.div>
      ))}
    </motion.dl>
  );
}
