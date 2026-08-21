"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { CountUp } from "@/app/components/CountUp";
import { motionDuration, motionEase } from "@/app/lib/motion";

/**
 * The bar, set before the first screen was drawn: six targets agreed with the
 * founder, one uniform cell each, so they read as a single agreed standard
 * rather than a ranking. Same frame and same treatment as the symptom checker's
 * criteria scorecard, because it does the same job in the same slot — the
 * question this chapter ends on, whose answer closes the case study.
 *
 * Every cell is a number, and that is a fact about the project rather than a
 * gap in the set: Funding Finder defined success numerically across task
 * performance, experience quality and business outcome, and the two rounds of
 * testing were run to measure against exactly these. Inventing a qualitative
 * criterion to vary the rhythm would be inventing a criterion.
 *
 * The six are drawn from a longer measurement plan — eleven targets across
 * three categories — and chosen so no two say the same thing twice and both
 * users are represented. What each one MOVED TO is not here on purpose: this is
 * the bar, and the result belongs to the outcome chapter, so a reader meets the
 * target before they meet the score.
 *
 * Colour, shadow and rhythm are inherited deliberately from CriteriaScorecard:
 * white cells floating on the tinted panel (--shadow-float, no border), the
 * label at the top, a deliberate gap, then the figure as the dominant mark with
 * its supporting line coupled tight beneath. Figures count up on scroll;
 * "Zero" has no digits and stays static in the same frame.
 *
 * Semantics: a definition list, each `<dt>` criterion paired with its `<dd>`
 * target, so assistive tech hears "Completion: 80 percent or better".
 */

type Criterion = {
  /** What is being measured, in one or two words. */
  label: string;
  /** The target, formatted as it was published. */
  target: string;
  /** What the target means, since a bare figure does not say. */
  detail: string;
};

const criteria: Criterion[] = [
  {
    label: "Completion",
    target: "80%+",
    detail: "Borrowers finish the application",
  },
  {
    label: "Time to apply",
    target: "<6 min",
    detail: "First question to submitted",
  },
  {
    label: "Reached matches",
    target: "70%+",
    detail: "Borrowers get as far as a shortlist",
  },
  {
    label: "Abandonment",
    target: "≤25%",
    detail: "Borrowers who quit before the end",
  },
  {
    label: "Severity 3 and 4",
    target: "Zero",
    detail: "Nothing unresolved before launch",
  },
  {
    label: "Confidence",
    target: "4.0/5",
    detail: "Rated by borrowers and brokers",
  },
];

const eyebrow =
  "text-xs font-medium uppercase tracking-[0.16em] text-accent-foreground";

export function SuccessCriteria({ className }: { className?: string }) {
  const shouldReduce = useReducedMotion();

  const v: { grid: Variants; cell: Variants } = {
    grid: {
      hidden: {},
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } },
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
      {criteria.map((c, index) => (
        <motion.div
          key={c.label}
          variants={v.cell}
          className="flex flex-col rounded-xl bg-white p-6 shadow-float md:p-8"
        >
          <dt className={eyebrow}>{c.label}</dt>
          <dd className="mt-6 flex flex-col gap-3 md:mt-8">
            <CountUp
              value={c.target}
              delay={shouldReduce ? 0 : index * 0.05}
              className="break-words text-4xl font-semibold leading-[0.95] tracking-[-0.02em] text-leaf md:text-5xl"
            />
            <span className="text-sm font-medium leading-relaxed text-leaf">
              {c.detail}
            </span>
          </dd>
        </motion.div>
      ))}
    </motion.dl>
  );
}
