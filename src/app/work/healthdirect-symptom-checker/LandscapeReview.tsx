"use client";

import { ArrowRightIcon, FrownIcon, SmileIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { motionDuration, motionEase } from "@/app/lib/motion";

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
    chip: "bg-journey-needs text-journey-needs-foreground",
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
    chip: "bg-journey-pain text-journey-pain-foreground",
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

export function LandscapeReview({ id }: { id?: string }) {
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
      className="scroll-mt-24 rounded-3xl border border-border bg-card p-4 shadow-card sm:p-6 md:p-8"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -80px 0px" }}
        variants={v.map}
      >
        <h3 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl lg:text-4xl">
          Landscape review
        </h3>

        <motion.div variants={v.cell} className="mt-8 max-w-prose">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Product studied — Ada Symptom Check
          </p>
          <p className="mt-2 text-base font-semibold leading-snug">
            One of the products reviewed to learn what people already expected
            from digital triage
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We ran full assessments through Ada and noted which conventions
            helped and which added anxiety, as evidence for the patterns our
            own flow should adopt or avoid.
          </p>
        </motion.div>

        <div className="mt-8 md:mt-10 lg:grid lg:grid-cols-[minmax(0,13rem)_repeat(3,minmax(0,1fr))] lg:gap-x-6 xl:grid-cols-[minmax(0,15rem)_repeat(3,minmax(0,1fr))] xl:gap-x-8">
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
            <figcaption className="mt-3 text-xs leading-relaxed text-muted-foreground">
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
                  className="flex items-center gap-2 border-b border-border pb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground"
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
                      className={`max-w-prose rounded-lg px-3 py-2 text-xs leading-snug ${lens.chip}`}
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
    </section>
  );
}
