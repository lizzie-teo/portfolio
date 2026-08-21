"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { motionDuration, motionEase } from "@/app/lib/motion";
import {
  anchorScrollOffset,
  cornerClasses,
  readingTilePadding,
  sectionContentGap,
  sectionHeading,
  sectionLede,
  type TileCorners,
} from "@/app/components/Chapter";
import { CollapsingLeaf } from "@/app/components/CollapsingLeaf";
import { MaskReveal } from "@/app/components/MaskReveal";

/**
 * The four research activities, set as a ledger rather than a card grid.
 *
 * Every other module in this chapter is a composition — quotes beside figures,
 * two personas facing each other, a flow. This one is a list of what was done,
 * and a list should look like a list. Four full-width rows divided by hairlines
 * read in one pass and stay in one pass at 320px, where a two by two grid of
 * cards becomes a four-tall stack that no longer reads as a set.
 *
 * The order is chronological and load bearing: the stakeholder sessions set the
 * hypothesis, the interviews tested it against people, the landscape review
 * looked for patterns already solving it, and the testing rounds measured
 * whether the answer worked. Each activity's scope sits on the right at desktop
 * and under the detail on a phone, because "8 participants" is the fact that
 * tells a reader how much weight the finding can carry.
 *
 * Semantics: an ordered list. The numeral is decorative — the `<ol>` already
 * carries the sequence — so it is aria-hidden and never read twice.
 */

type Method = {
  /** What the activity was, in two or three words. */
  title: string;
  /** What it covered and what it was for. */
  detail: string;
  /** How much of it there was, so a reader can weigh the finding. */
  scope: string;
};

const methods: Method[] = [
  {
    title: "Stakeholder interviews",
    detail:
      "I had two sessions with the founder and one with an advisor. We talked about what the business needed, what it was assuming, and what we could build in three months.",
    scope: "3 sessions · 60 to 90 minutes",
  },
  {
    title: "User interviews",
    detail:
      "I interviewed five borrowers and three brokers about how they apply for a loan today, not how we wanted them to. I asked what takes the longest, where people give up, and what each side assumes the other is doing.",
    scope: "8 participants · 45 minutes",
  },
  {
    title: "Landscape review",
    detail:
      "I compared two lending platforms and one marketplace outside finance. I looked at their forms, how they work on a phone, and how much each one asks before it shows you anything.",
    scope: "3 products · 5 dimensions",
  },
  {
    title: "Usability testing",
    detail:
      "I ran two rounds of testing, sitting with people as they used it. The first was on wireframes and the second on the working prototype, checking how many finished and how long it took them.",
    scope: "2 rounds · 8 participants",
  },
];

const scopeLabel =
  "text-xs font-medium uppercase tracking-[0.14em] text-accent-foreground";

export function ResearchMethod({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();

  const v: { list: Variants; row: Variants } = {
    list: {
      hidden: {},
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.07 } },
    },
    row: {
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
    <section
      id={id}
      aria-label="Research methodology"
      className={anchorScrollOffset}
    >
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-start ${cornerClasses[corners]} border border-border bg-card shadow-card ${readingTilePadding}`}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          variants={v.list}
        >
          <MaskReveal
            as="h2"
            mode="word"
            duration="fast"
            className={sectionHeading}
            text="How I gathered the evidence"
          />

          <motion.p variants={v.row} className={sectionLede}>
            I ran four activities in this order, because each one set the
            questions for the next.
          </motion.p>

          <motion.ol variants={v.list} className={sectionContentGap}>
            {methods.map((method, index) => (
              <motion.li
                key={method.title}
                variants={v.row}
                className="grid gap-x-6 gap-y-3 border-t border-rule py-6 last:border-b md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,13rem)] md:py-8"
              >
                <p
                  aria-hidden="true"
                  className="text-sm font-semibold tabular-nums tracking-[0.08em] text-accent-foreground"
                >
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-snug text-leaf">
                    {method.title}
                  </h3>
                  <p className="mt-2 max-w-prose text-base leading-relaxed text-foreground">
                    {method.detail}
                  </p>
                </div>
                <p className={`${scopeLabel} md:pt-1 md:text-right`}>
                  {method.scope}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </CollapsingLeaf>
    </section>
  );
}
