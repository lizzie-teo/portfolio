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
 * The two people the product serves, set facing each other.
 *
 * Two personas side by side is the only honest layout for this project: the
 * structural fact of Funding Finder is that one deal has two users who want
 * opposite things from it, and stacking them would make the second read as a
 * secondary audience. On a phone they stack because there is no choice, and
 * DOM order puts the borrower first because the deal starts with them.
 *
 * No portraits. A stock headshot on a persona card is a claim about a person
 * who does not exist, and the initials do the same identifying job without
 * pretending to be photography. What each one wants and what stops them getting
 * it is the content; the job to be done sits underneath in their own voice,
 * inverted onto white so it reads as the line the design was held against.
 *
 * Semantics: each persona is a `<section>` with an `<h3>`; goals and
 * frustrations are labelled lists, so the pairing survives without the columns.
 */

type Persona = {
  initials: string;
  name: string;
  /** What they do and which side of the deal they are on. */
  role: string;
  goals: string[];
  frustrations: string[];
  /** Their own framing of what they need, in one sentence. */
  job: string;
};

const personas: Persona[] = [
  {
    initials: "MB",
    name: "Marcus, 41",
    role: "Property developer · Borrower",
    goals: [
      "Secure development finance quickly",
      "Know what a lender wants before applying to them",
      "Keep the paperwork and the back and forth to a minimum",
    ],
    frustrations: [
      "The form is too long, and it comes too early",
      "No sense of whether he qualifies until after he has applied",
      "No way to see where an application currently stands",
    ],
    job: "Help me find the right lender without wasting time on forms I might not qualify for.",
  },
  {
    initials: "SC",
    name: "Sarah, 35",
    role: "Finance broker · Intermediary",
    goals: [
      "Run several client deals at once without dropping any of them",
      "Get clients funded faster",
      "Spend less of the week on admin and more of it advising",
    ],
    frustrations: [
      "No central place where a deal and its history live",
      "Clients leave details out, and nobody notices until the lender does",
      "No way to predict when a lender will come back",
    ],
    job: "Give me a live view of all my deals so I can act fast and keep clients informed.",
  },
];

const listLabel =
  "text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground";

export function Personas({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();

  const v: { list: Variants; card: Variants; cell: Variants } = {
    list: {
      hidden: {},
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
    },
    card: {
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
      aria-label="Who we designed for"
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
            text="Who we designed for"
          />

          <motion.p variants={v.cell} className={sectionLede}>
            Marcus is trying to fund a property development, and Sarah is
            running several client deals at once. The line at the bottom of
            each card is what I held the later decisions against.
          </motion.p>

          <motion.div
            variants={v.list}
            className={`${sectionContentGap} grid gap-4 md:gap-5 lg:grid-cols-2`}
          >
            {personas.map((persona) => (
              <motion.section
                key={persona.name}
                variants={v.card}
                aria-label={`${persona.name} — ${persona.role}`}
                className="flex flex-col rounded-2xl border border-border bg-secondary p-6 md:p-8"
              >
                <motion.div
                  variants={v.cell}
                  className="flex items-center gap-4"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-card text-sm font-semibold tracking-[0.06em] text-leaf md:size-14"
                  >
                    {persona.initials}
                  </span>
                  <div className="min-w-0">
                    <h3 className={subsectionHeading}>{persona.name}</h3>
                    <p className="mt-1 text-sm font-medium leading-snug text-secondary-foreground">
                      {persona.role}
                    </p>
                  </div>
                </motion.div>

                {(
                  [
                    { label: "Goals", items: persona.goals, marker: "bg-primary" },
                    {
                      label: "Frustrations",
                      items: persona.frustrations,
                      marker: "bg-foreground/35",
                    },
                  ] as const
                ).map((group) => (
                  <div key={group.label} className="mt-8">
                    <motion.p variants={v.cell} className={listLabel}>
                      {group.label}
                    </motion.p>
                    <ul
                      aria-label={`${group.label} — ${persona.name}`}
                      className="mt-4 flex flex-col gap-3"
                    >
                      {group.items.map((item) => (
                        <motion.li
                          key={item}
                          variants={v.cell}
                          className="flex gap-3 text-base leading-relaxed text-foreground"
                        >
                          <span
                            aria-hidden="true"
                            className={`mt-2 size-1.5 shrink-0 rounded-full ${group.marker}`}
                          />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Inverted onto white inside the tinted card: the job to be
                    done is the line every decision in the two chapters after
                    this one was held against, so it should not read as a third
                    bullet list. */}
                <motion.figure
                  variants={v.cell}
                  className="mt-8 rounded-xl bg-card p-5 shadow-float md:mt-auto md:p-6"
                >
                  <figcaption className={listLabel}>Job to be done</figcaption>
                  <blockquote className="mt-3 text-base italic leading-relaxed text-leaf">
                    {`“${persona.job}”`}
                  </blockquote>
                </motion.figure>
              </motion.section>
            ))}
          </motion.div>
        </motion.div>
      </CollapsingLeaf>
    </section>
  );
}
