"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { BookOpenText, HandHeart, type LucideIcon } from "lucide-react";
import { motionDuration, motionEase } from "@/app/lib/motion";

/**
 * The success scorecard for "The problem" chapter: one uniform cell per
 * criterion holding its name and the bar we set. Every criterion gets the
 * same frame so the six read as a single agreed target, not a ranking.
 *
 * Two kinds share the frame. A measurable criterion leads with its figure as
 * the dominant mark. A qualitative one has no number, so a full-scale
 * context-matching icon stands where the figure would and the judged statement
 * carries the weight. Both marks — figure and icon — are set large in the deep
 * leaf teal (--leaf #183947, the case study's darkest brand teal; 10.9:1 on the
 * bg-secondary mint), the same scale and colour as the outcome scorecard this
 * pairs with, so an icon and a number read as equal-weight marks; bar and
 * result are told apart by copy and context, not size.
 *
 * Rhythm: a fixed top-down cadence, not a bottom-anchored figure. The eyebrow
 * label sits at the top; a deliberate mt-6/8 gap sets the dominant mark apart
 * as the hero; the supporting line couples tight beneath it (gap-3). The three
 * parts read as one grouped unit inside a generous p-6/8 frame; equal-height
 * cells carry their slack as trailing space, so the figure never crowds an edge.
 *
 * Semantics: a definition list, each cell a `<dt>` name paired with its
 * `<dd>` target, so assistive tech hears "Completion: 60 to 70 percent".
 * The icon is aria-hidden; the label and statement carry the meaning.
 */

type Criterion =
  | { kind: "metric"; label: string; target: string; detail: string }
  | { kind: "qualitative"; label: string; statement: string; icon: LucideIcon };

const criteria: Criterion[] = [
  {
    kind: "metric",
    label: "Completion",
    target: "60–70%",
    detail: "Reach the industry benchmark",
  },
  {
    kind: "metric",
    label: "Task success",
    target: "78%+",
    detail: "Every severity 3 and 4 issue resolved",
  },
  {
    kind: "metric",
    label: "Step loss",
    target: "<20%",
    detail: "No single step loses more",
  },
  {
    kind: "metric",
    label: "Accessibility",
    target: "AA",
    detail: "WCAG 2.1, compliant in full",
  },
  {
    kind: "qualitative",
    label: "Health literacy",
    statement: "People understand medical terms and instructions unaided",
    icon: BookOpenText,
  },
  {
    kind: "qualitative",
    label: "Confidence",
    statement: "People feel guided and supported throughout",
    icon: HandHeart,
  },
];

const eyebrow =
  "text-xs font-medium uppercase tracking-[0.16em] text-accent-foreground";

export function CriteriaScorecard({ className }: { className?: string }) {
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
      {criteria.map((c) => (
        <motion.div
          key={c.label}
          variants={v.cell}
          className="flex flex-col rounded-xl border border-border bg-secondary p-6 md:p-8"
        >
          <dt className={eyebrow}>{c.label}</dt>
          {c.kind === "metric" ? (
            <dd className="mt-6 flex flex-col gap-3 md:mt-8">
              <span className="text-4xl font-semibold leading-[0.95] tracking-[-0.02em] tabular-nums text-leaf break-words md:text-5xl">
                {c.target}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {c.detail}
              </span>
            </dd>
          ) : (
            <dd className="mt-6 flex flex-col gap-3 md:mt-8">
              <c.icon
                aria-hidden="true"
                strokeWidth={1.75}
                className="size-12 shrink-0 text-leaf md:size-14"
              />
              <span className="text-base leading-relaxed text-foreground">
                {c.statement}
              </span>
            </dd>
          )}
        </motion.div>
      ))}
    </motion.dl>
  );
}
