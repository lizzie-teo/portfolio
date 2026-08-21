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
 * The landscape-review teardown of Ada Symptom Check, rebuilt as a native
 * responsive diagram instead of a static artefact export — the same treatment
 * as the journey map. Desktop sets the product screenshot against three
 * review lenses (what worked, the friction we noted, and the near-black
 * conclusions we carried forward) in one grid; mobile stacks the screenshot
 * above the lenses so nothing needs pinch-zoom. Every note is visible text,
 * so the review reads correctly without motion or vision.
 */

const lenses = [
  {
    key: "worked",
    label: "What worked",
    icon: SmileIcon,
    chip: "bg-journey-needs text-note-ink",
    notes: [
      "Conversational, human voice",
      "One question at a time",
      "Visual diagrams demonstrate what a question means",
      "App shows possible causes for the user's symptoms",
      "Motion design helps with user engagement",
      "“Tell me more” on each possible cause removes cognitive load from the report screen",
    ],
  },
  {
    key: "friction",
    label: "The friction we noted",
    icon: FrownIcon,
    chip: "bg-journey-pain text-note-ink",
    notes: [
      "Poor readability, with small fonts and low contrast on some small text",
      "Tapping an answer is a challenge for big thumbs",
      "Answer options placed too close together",
      "Scanning multiple options not optimal due to right alignment",
      "Some latency in question transitions",
    ],
  },
  {
    key: "forward",
    label: "What we took forward",
    icon: ArrowRightIcon,
    chip: "bg-primary text-primary-foreground",
    notes: [
      "The patterns that reduced cognitive load, like one question at a time and plain language explanations, became conventions for our own flow",
      "The readability and tap target failures became acceptance criteria for it",
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
      visible: {
        transition: { staggerChildren: shouldReduce ? 0 : 0.06 },
      },
    },
    lens: {
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduce ? 0 : 0.04 },
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
    <section
      id={id}
      aria-label="Landscape review — Ada Symptom Check"
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
            text="Landscape review"
          />

          <motion.p variants={v.cell} className={sectionLede}>
            I ran a competitor analysis on a few symptom checkers, and Ada was
            one of them.
          </motion.p>

          <div className={`${sectionContentGap} lg:grid lg:grid-cols-[minmax(0,13rem)_repeat(3,minmax(0,1fr))] lg:gap-x-6 xl:grid-cols-[minmax(0,15rem)_repeat(3,minmax(0,1fr))] xl:gap-x-8`}>
            <motion.figure
              variants={v.cell}
              className="mx-auto w-full max-w-52 lg:mx-0 lg:max-w-none"
            >
              <div className="overflow-hidden rounded-2xl border border-border bg-secondary shadow-card">
                <Image
                  src="/assets/healthdirect/ada.webp"
                  alt="Ada Symptom Check home screen: 'Hi, I'm Ada. I can help you learn more about your health' above a 'Start symptom assessment' button"
                  width={828}
                  height={1791}
                  sizes="(min-width: 1280px) 17rem, (min-width: 1024px) 15rem, 13rem"
                  className="w-full"
                />
              </div>
              <figcaption className="mt-3 text-sm font-medium leading-relaxed text-leaf">
                Ada&apos;s home screen, with the conversational framing our
                review kept coming back to.
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
