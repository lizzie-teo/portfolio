"use client";

import { ArrowRightIcon, FrownIcon, SmileIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
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
 * Three products were reviewed — HashChing, Lendi and Airbnb — and only Lendi
 * is shown. The earlier version of this section ran all three as full
 * teardowns, which put three stacked grids of pros and cons in front of a
 * reader before the case study had reached a single design decision. The
 * review's job is to explain where the flow's conventions came from, and Lendi
 * is where they came from; the other two are named so the reader knows the
 * scan was wider than one product, and left at that.
 *
 * Layout is the symptom checker's landscape review: the product screenshot set
 * against three lenses in one grid on desktop, stacked on mobile so nothing
 * needs pinch-zoom. Every note is visible text, so the review reads correctly
 * without motion or vision.
 */

const lenses = [
  {
    key: "worked",
    label: "What worked",
    icon: SmileIcon,
    chip: "bg-journey-needs text-note-ink",
    notes: [
      "One question per screen, with nothing competing for attention",
      "No login and no account needed to begin",
      "It asks what you are borrowing for before the first question",
      "A way past every question for anyone who does not have the exact figure",
    ],
  },
  {
    key: "friction",
    label: "Where it lost people",
    icon: FrownIcon,
    chip: "bg-journey-pain text-note-ink",
    notes: [
      "No progress indicator, so a borrower cannot tell how many questions are left",
      "No time expectation set before the first question",
      "No way to save and return, so closing the tab loses the work",
      "Every figure entered by hand, from memory or from paperwork",
    ],
  },
  {
    key: "forward",
    label: "What I took forward",
    icon: ArrowRightIcon,
    chip: "bg-primary text-primary-foreground",
    /* Two chips, not two paragraphs wearing chip styling. The earlier pair ran
       three lines each, which stops being a note and starts being prose set in
       the wrong component. The reasoning that was buried in them belongs to the
       borrower chapter, where the decisions are argued. */
    notes: [
      "One question per screen, and no login needed to start",
      "A progress indicator on every question, and a bank connection so nobody types a figure from memory",
    ],
  },
] as const;

export function LandscapeReview({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();

  const v: { map: Variants; lens: Variants; cell: Variants } = {
    map: {
      hidden: {},
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
    },
    lens: {
      hidden: {},
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.04 } },
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
      aria-label="Landscape review, Lendi"
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
          variants={v.map}
        >
          <MaskReveal
            as="h2"
            mode="word"
            duration="fast"
            className={sectionHeading}
            text="What the market had already solved"
          />

          <motion.p variants={v.cell} className={sectionLede}>
            I looked at three products, HashChing, Lendi and Airbnb. Lendi is
            shown here because I borrowed the most from it.
          </motion.p>

          <div className={`${sectionContentGap} lg:grid lg:grid-cols-[minmax(0,13rem)_repeat(3,minmax(0,1fr))] lg:gap-x-6 xl:grid-cols-[minmax(0,15rem)_repeat(3,minmax(0,1fr))] xl:gap-x-8`}>
            <motion.figure
              variants={v.cell}
              className="mx-auto w-full max-w-52 lg:mx-0 lg:max-w-none"
            >
              <div className="overflow-hidden rounded-xs border border-border bg-secondary shadow-card">
                <Image
                  src="/assets/funding-finder/discovery/landscape-review/lend-new.png"
                  alt="Lendi's borrower application: 'What is your expected purchase price?' with a single amount field, a 'What if I'm unsure?' link, and one Next button"
                  width={678}
                  height={1516}
                  sizes="(min-width: 1280px) 15rem, (min-width: 1024px) 13rem, 13rem"
                  className="w-full"
                />
              </div>
              <figcaption className="mt-3 text-sm font-medium leading-relaxed text-leaf">
                Lendi puts the purchase price on a screen of its own. The link
                underneath lets a borrower carry on when they do not know the
                figure yet.
              </figcaption>
            </motion.figure>

            {lenses.map((lens) => {
              const Icon = lens.icon;
              return (
                <motion.div
                  key={lens.key}
                  variants={v.lens}
                  className="mt-8 lg:mt-0"
                >
                  <motion.p
                    variants={v.cell}
                    className="flex items-center gap-2 border-b border-rule pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-foreground"
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    {lens.label}
                  </motion.p>
                  <ul
                    aria-label={lens.label}
                    className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap"
                  >
                    {lens.notes.map((note) => (
                      <motion.li
                        key={note}
                        variants={v.cell}
                        className={`max-w-prose rounded-lg px-3 py-2 text-sm leading-snug ${lens.chip}`}
                      >
                        {note}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </CollapsingLeaf>
    </section>
  );
}
