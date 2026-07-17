"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { motionDuration, motionEase } from "@/app/lib/motion";

/**
 * The success scorecard for "The problem" chapter: one uniform cell per
 * criterion holding its name and the bar we set. Every criterion gets the
 * same frame so the six read as a single agreed target, not a ranking.
 *
 * Two kinds share the frame. A measurable criterion leads with its figure
 * as the dominant mark; a qualitative one has no number, so a geometric
 * marker stands where the figure would and the judged statement carries the
 * weight. The figures are deliberately static and scorecard-scale — smaller
 * than the animated count-up in the outcome row one chapter above — so this
 * reads as "the bar we set" rather than an echo of "the result we got".
 *
 * Semantics: a definition list, each cell a `<dt>` name paired with its
 * `<dd>` target, so assistive tech hears "Completion: 60 to 70 percent".
 * The marker is aria-hidden; the qualitative statement carries the meaning.
 */

type Criterion =
  | { kind: "metric"; label: string; target: string; detail: string }
  | { kind: "qualitative"; label: string; statement: string };

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
    target: "under 20%",
    detail: "No single step loses more",
  },
  {
    kind: "metric",
    label: "Accessibility",
    target: "WCAG 2.1 AA",
    detail: "Compliant in full",
  },
  {
    kind: "qualitative",
    label: "Health literacy",
    statement:
      "People understand medical terms and instructions unaided",
  },
  {
    kind: "qualitative",
    label: "Confidence",
    statement: "People feel guided and supported throughout",
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
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3 ${className ?? ""}`}
    >
      {criteria.map((c) => (
        <motion.div
          key={c.label}
          variants={v.cell}
          className="flex flex-col gap-4 rounded-xl border border-border bg-secondary p-5 md:p-6"
        >
          <dt className={eyebrow}>{c.label}</dt>
          {c.kind === "metric" ? (
            <dd className="flex flex-col gap-1.5">
              <span className="text-2xl font-semibold leading-none tracking-[-0.02em] tabular-nums text-foreground md:text-3xl">
                {c.target}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {c.detail}
              </span>
            </dd>
          ) : (
            <dd className="flex flex-col gap-3">
              <span
                aria-hidden="true"
                className="size-5 rotate-45 rounded-sm border-2 border-primary"
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
