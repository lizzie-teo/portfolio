"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { CountUp } from "@/app/components/CountUp";
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
 * Who a slow loan application costs, stated once per party.
 *
 * The structure is the argument. A private lending deal has three people in it
 * and the same broken process bills each of them differently — the borrower in
 * abandoned effort, the broker in hours, the lender in wasted assessment. Three
 * parallel rows say that; a single stacked list of grievances would not, and
 * neither would three identical stat cards, which is the shape the scorecard
 * one tile below already owns. So the figure here is deliberately the SMALLER
 * mark: it sits beside its party as evidence, not above it as a headline,
 * because the headline figures in this chapter belong to the bar we set, not to
 * the problem we found.
 *
 * Reading order is the order the cost travels. A borrower gives up, so a broker
 * chases, so a lender waits — each row's pain is the next row's cause, and the
 * rows run in that direction on every screen size because DOM order is the
 * chain.
 *
 * Semantics: a definition list, party as `<dt>` and its cost as `<dd>`, so the
 * pairing survives without the layout. The figures count up on scroll (CountUp)
 * like every other displayed metric in a case study; the quotes are verbatim
 * from user interviews and stay static, because a number in a sentence is
 * reading copy rather than a mark.
 */

type Party = {
  /** Who is paying, in one word. */
  role: string;
  /** The published figure, as a display mark. */
  figure: string;
  /** What the figure counts — a bare "67%" means nothing on its own. */
  measure: string;
  /** The cost in a sentence, in the party's own terms. */
  cost: string;
  /** Verbatim from research, where research caught it. */
  quote?: string;
};

const parties: Party[] = [
  {
    role: "Borrower",
    figure: "67%",
    measure: "of applications arrive incomplete",
    cost: "Borrowers face a long form before anyone tells them whether they qualify. Many close the tab and never apply.",
    /* Trimmed to the half the case statement's verbatim does not already own.
       That quote is the abandonment ("I just close the tab"), so repeating "I
       give up halfway" here spends the same beat twice; what this one adds is
       the reason, which is the thing the whole reframe answers. */
    quote:
      "I don’t know if I even qualify.",
  },
  {
    role: "Broker",
    figure: "40%",
    measure: "of broker hours go to admin",
    /* Deliberately not "deals live across inboxes and spreadsheets": the quote
       below already says that in the broker's own words, and a summary that
       paraphrases its own verbatim wastes both. This states the consequence
       instead, and lets the quote supply the detail. */
    cost: "Brokers cannot see where a deal has got to. They spend the week chasing updates from clients and lenders instead of advising anyone.",
    /* The broker's own words, not a borrower's about their broker. Research
       caught both, and "my broker sends email attachments, I can never find
       the latest version" belongs to the borrower who said it. */
    quote:
      "Tracking deals across emails and spreadsheets means I’m always playing catch up with my clients.",
  },
  {
    role: "Lender",
    figure: "3 to 6",
    measure: "weeks from application to decision",
    cost: "Applications arrive with information missing, or from borrowers who were never eligible. Assessors read them anyway, then decline them.",
  },
];

const partyLabel =
  "text-xs font-semibold uppercase tracking-[0.16em] text-accent-foreground";

export function ProblemSpace({
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
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
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
      aria-label="Who a slow application costs"
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
            text="Everyone pays for the same delay"
          />

          <motion.p variants={v.row} className={sectionLede}>
            A slow application costs more than the borrower’s time. When
            borrowers give up halfway, brokers spend the week chasing them, and
            lenders end up assessing applications that were never finished.
          </motion.p>

          <motion.dl
            variants={v.list}
            className={`${sectionContentGap} grid gap-px overflow-hidden rounded-2xl bg-rule md:grid-cols-3`}
          >
            {parties.map((party, index) => (
              <motion.div
                key={party.role}
                variants={v.row}
                className="flex flex-col bg-card p-6 md:p-8"
              >
                <dt className={partyLabel}>{party.role}</dt>
                <dd className="mt-5 flex flex-1 flex-col gap-4 md:mt-6">
                  <p className="flex flex-col gap-1">
                    <CountUp
                      value={party.figure}
                      delay={shouldReduce ? 0 : index * 0.08}
                      className="text-3xl font-semibold leading-[0.95] tracking-[-0.02em] text-leaf md:text-4xl"
                    />
                    <span className="text-sm font-medium leading-snug text-leaf">
                      {party.measure}
                    </span>
                  </p>
                  <p className="text-base leading-relaxed text-foreground">
                    {party.cost}
                  </p>
                  {party.quote ? (
                    /* Verbatim, set apart from the cost sentence above it: the
                       cost is my summary, the quote is theirs, and a reader
                       should be able to tell which is which without a label. */
                    <p className="mt-auto border-l-2 border-primary pl-4 text-sm italic leading-relaxed text-leaf">
                      {`“${party.quote}”`}
                    </p>
                  ) : null}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>
      </CollapsingLeaf>
    </section>
  );
}
