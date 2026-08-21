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
  subsectionHeading,
  type TileCorners,
} from "@/app/components/Chapter";
import { CollapsingLeaf } from "@/app/components/CollapsingLeaf";
import { MaskReveal } from "@/app/components/MaskReveal";

/**
 * The turn: one problem statement, then the four questions it was broken into.
 *
 * Everything before this section is evidence and everything after it is
 * product, so this is where the case study stops reporting and starts
 * deciding. The statement gets the leaf's ink and the full width because it is
 * the single sentence the whole build answers; the four questions sit under it
 * as a grid because they are peers, not a sequence, and were worked in
 * parallel.
 *
 * Each card pairs its question with the answer that shipped. That pairing is
 * the load bearing part: a wall of how might we statements with no responses is
 * the most skippable artefact in a case study, and the four responses here are
 * the first appearance of the four things the two decisions chapters go on to
 * show working.
 *
 * Semantics: an ordered list whose items are `<h3>`-titled blocks. The question
 * is the heading because it is genuinely what the block is about; the tag above
 * it is a kicker, not a title.
 */

type Direction = {
  /** Who it is for and what part of the product it touches. */
  tag: string;
  /** The question, as it was written on the wall. */
  question: string;
  /** What shipped in answer to it. */
  response: string;
};

const directions: Direction[] = [
  {
    tag: "Borrower · Form effort",
    question:
      "How might we lighten a long application so borrowers do not abandon it before they know whether they qualify?",
    response:
      "The application asks one question per screen, so a borrower only has to think about one thing at a time. A progress indicator shows how many questions are left.",
  },
  {
    tag: "Borrower · Data collection",
    question:
      "How might we collect the financials a lender needs without making the borrower go and find documents?",
    response:
      "The borrower links their bank account instead. Their income, spending and transaction history come through automatically. Pages of manual fields become one consent screen and a quick check of the numbers.",
  },
  {
    tag: "Broker · Oversight",
    question:
      "How might we give a broker one source of truth across every deal they are running?",
    response:
      "A live pipeline holds every deal, with its stage on the card and filters across the top. It replaces the spreadsheet and the email thread that were doing that job between them.",
  },
  {
    tag: "Platform · Matching",
    question:
      "How might we surface the most relevant products without burying the borrower in options?",
    response:
      "Results are held back until every question is answered, then ranked by what this borrower can actually afford. Showing matches earlier would mean judging someone on half an application.",
  },
];

export function DesignDirection({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();

  const v: { list: Variants; cell: Variants } = {
    list: {
      hidden: {},
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
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
    <section
      id={id}
      aria-label="Design direction"
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
            text="Design direction"
          />

          <motion.p variants={v.cell} className={sectionLede}>
            The research narrowed to one problem statement, which broke into
            four questions the build had to answer.
          </motion.p>

          {/* The statement takes the leaf's ink and the full measure: it is the
              one thing in this chapter that is not a finding or a card, and the
              four questions below only make sense as its parts. */}
          <motion.figure
            variants={v.cell}
            className={`${sectionContentGap} rounded-2xl bg-leaf px-6 py-8 text-leaf-foreground md:px-10 md:py-10`}
          >
            <figcaption className="text-xs font-semibold uppercase tracking-[0.14em] text-leaf-foreground/70">
              Problem statement
            </figcaption>
            <p className="mt-4 max-w-[46ch] text-lg font-semibold leading-snug tracking-[-0.02em] md:text-xl lg:text-2xl">
              Borrowers abandon loan applications because the form comes first
              and never tells them whether they qualify. Brokers cannot step
              in, because they cannot see where a deal stands.
            </p>
          </motion.figure>

          <motion.ol
            variants={v.list}
            className="mt-4 grid gap-4 md:mt-5 md:gap-5 lg:grid-cols-2"
          >
            {directions.map((direction) => (
              <motion.li
                key={direction.question}
                variants={v.cell}
                className="flex flex-col rounded-2xl border border-border bg-muted p-6 md:p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                  {direction.tag}
                </p>
                <h3 className={`mt-4 ${subsectionHeading}`}>
                  {direction.question}
                </h3>
                <p className="mt-6 border-t border-rule pt-6 text-base leading-relaxed text-foreground">
                  {direction.response}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </CollapsingLeaf>
    </section>
  );
}
