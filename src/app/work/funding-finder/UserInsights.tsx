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
 * Three findings from the interviews, each paired with what it changed.
 *
 * The split is the argument: heard on the left, changed on the right, three
 * times. Research that only reports what people said leaves a reader to guess
 * whether it went anywhere, and a decisions chapter that arrives with no
 * provenance reads as taste. Putting the pair on one row means neither half can
 * be shipped without the other.
 *
 * Two of the three carry a verbatim and the third does not, which is a fact
 * about where the quotes went rather than a gap. The two strongest borrower
 * lines are already spent earlier in the page — one opens the case study as the
 * reframe's evidence, one sits in the problem chapter against the 67% — and
 * repeating either here would make the research look thinner than it was. The
 * row without a quote leads on its figure instead.
 *
 * The figures are the smaller mark, as they are in the problem chapter: the
 * headline numbers on this page belong to the bar and the result, not to the
 * discovery. Each counts up on scroll like every other displayed metric.
 *
 * Semantics: an ordered list of three, each item labelled with its finding, so
 * the pairing survives without the two column layout.
 */

type Insight = {
  /** The finding, stated as the problem it is. */
  finding: string;
  /** The supporting figure, as a display mark. */
  figure: string;
  /** What the figure counts. */
  measure: string;
  /** Verbatim from the interviews, where one is not already spent earlier. */
  quote?: string;
  /** Who said it. */
  attribution?: string;
  /** What the finding changed in the product. */
  response: string;
};

const insights: Insight[] = [
  {
    finding:
      "Borrowers have to complete the whole form before they learn anything about whether they qualify.",
    figure: "3×",
    measure:
      "more likely to finish when asked one question at a time rather than all at once",
    response:
      "One question per screen, with a progress indicator on every one. A borrower can always see how much is left before deciding whether to carry on.",
  },
  {
    finding:
      "A broker and their client have no shared record of the deal, so both spend time rebuilding one out of emails and attachments.",
    figure: "60%",
    measure: "of brokers tracked deal status in a spreadsheet",
    quote:
      "My broker sends email attachments. I can never find the latest version.",
    attribution: "Borrower, user interviews",
    response:
      "Both sides read from the same live pipeline. Status, documents and messages are attached to the application, so neither of them has to search an inbox.",
  },
  {
    finding:
      "Borrowers cannot see what a lender requires until an application has already been declined for missing it.",
    figure: "8/10",
    measure:
      "borrowers could not name the right lender type for what they needed",
    quote:
      "Different lenders want slightly different things. I never know what to prepare.",
    attribution: "Borrower, user interviews",
    response:
      "Matching uses the answers already given and returns a ranked shortlist, with a reason next to each lender. A borrower never has to know the category to find the right product.",
  },
];

const columnLabel =
  "text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground";

export function UserInsights({
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
      aria-label="What users told us"
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
            text="What users told us"
          />

          <motion.p variants={v.row} className={sectionLede}>
            Eight interviews produced three findings that mattered. Each one is
            shown next to the change I made in response to it.
          </motion.p>

          <motion.ol variants={v.list} className={sectionContentGap}>
            {insights.map((insight, index) => (
              <motion.li
                key={insight.finding}
                variants={v.row}
                aria-label={insight.finding}
                className="grid gap-8 border-t border-rule py-8 last:border-b md:gap-10 md:py-10 lg:grid-cols-2 lg:gap-14"
              >
                <div className="min-w-0">
                  <p className={columnLabel}>What they said</p>
                  <p className="mt-5 flex flex-col gap-1">
                    <CountUp
                      value={insight.figure}
                      delay={shouldReduce ? 0 : index * 0.08}
                      className="text-3xl font-semibold leading-[0.95] tracking-[-0.02em] text-leaf md:text-4xl"
                    />
                    <span className="text-sm font-medium leading-snug text-leaf">
                      {insight.measure}
                    </span>
                  </p>
                  <p className="mt-5 max-w-prose text-base font-semibold leading-relaxed text-leaf">
                    {insight.finding}
                  </p>
                  {insight.quote ? (
                    /* Verbatim, marked off from the finding above it: the
                       finding is my reading of the research, the quote is the
                       research. A reader should be able to tell which is
                       which without a label. */
                    <figure className="mt-4">
                      <blockquote className="border-l-2 border-primary pl-4 text-sm italic leading-relaxed text-leaf">
                        {`“${insight.quote}”`}
                      </blockquote>
                      <figcaption className="mt-2 pl-4 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        {insight.attribution}
                      </figcaption>
                    </figure>
                  ) : null}
                </div>

                <div className="min-w-0">
                  <p className={columnLabel}>What I changed</p>
                  <p className="mt-5 max-w-prose text-base leading-relaxed text-foreground">
                    {insight.response}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </CollapsingLeaf>
    </section>
  );
}
