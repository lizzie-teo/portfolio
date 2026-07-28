"use client";

import { ArrowRightIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Image from "next/image";
import { motionDuration, motionEase } from "@/app/lib/motion";
import {
  anchorScrollOffset,
  cornerClasses,
  readingTilePadding,
  sectionHeading,
  subsectionHeading,
  type TileCorners,
} from "@/app/components/Chapter";
import { CollapsingLeaf } from "@/app/components/CollapsingLeaf";

/**
 * The current-state user journey map for the priority persona, rebuilt as a
 * native responsive matrix instead of a static artefact export. Desktop lays
 * the five journey stages against the four research lenses as one grid;
 * mobile recomposes stage by stage so nothing needs pinch-zoom. Near-black
 * notes mark the moments trust broke down — the doubts behind most of the
 * 55% drop-off. DOM order is journey order and every note is visible text,
 * so the map reads correctly without motion or vision.
 */

type Note = string | { text: string; emphasis: true };

const lenses = [
  {
    key: "actions",
    label: "User actions",
    chip: "border border-foreground/30 bg-card",
  },
  { key: "feelings", label: "Feelings and thoughts", chip: "bg-secondary" },
  {
    key: "needs",
    label: "Needs",
    chip: "bg-journey-needs text-note-ink",
  },
  {
    key: "pains",
    label: "Pain points",
    chip: "bg-journey-pain text-note-ink",
  },
] as const;

type LensKey = (typeof lenses)[number]["key"];

type Stage = { title: string; notes: Record<LensKey, Note[]> };

const stages: Stage[] = [
  {
    title: "Situation",
    notes: {
      actions: ["Child experiencing symptoms"],
      feelings: [
        "I want to help my family",
        "Researching online is me time",
        "I want control over things",
      ],
      needs: ["Learn more — symptoms and possible conditions"],
      pains: ["Don't have time", "Busy with children, parents and work"],
    },
  },
  {
    title: "Consideration",
    notes: {
      actions: [
        "Visually engaging but not overwhelming",
        "Human touch, feels a connection",
        "A health tool I can trust",
      ],
      feelings: [
        "Supports me moving forward as I answer questions",
        "Hits on every symptom I enter",
        "Intelligent, flexible search",
      ],
      needs: [
        "Simple tools, quick reads",
        "Easy to understand questions",
        "Reassurance and guidance",
      ],
      pains: ["If tool is difficult to use", "Reading through long text"],
    },
  },
  {
    title: "Complete questionnaire",
    notes: {
      actions: ["Complete symptom check questions"],
      feelings: [{ text: "This test feels too long", emphasis: true }],
      needs: ["Plain language to understand questions", "To the point"],
      pains: [
        "Medical terms unfamiliar",
        "Not user friendly",
        "Too many questions",
        "Doesn't feel intelligent",
      ],
    },
  },
  {
    title: "Care advice",
    notes: {
      actions: ["Read care advice"],
      feelings: [
        {
          text: "Care advice is not giving me info on possible conditions",
          emphasis: true,
        },
      ],
      needs: [
        "Possible conditions to my symptoms",
        "Constructive ideas on treatments, prevention",
        "Feedback, explanations, dialogue",
      ],
      pains: ["Time spent on questions only to get inadequate care advice"],
    },
  },
  {
    title: "Get help",
    notes: {
      actions: ["Seek help"],
      feelings: [
        {
          text: "Tells me my child should see a doctor and nothing more, it is pointless",
          emphasis: true,
        },
      ],
      needs: [
        "Help me find a doctor near us",
        "Should tell me more about what is happening to my child",
      ],
      pains: [
        "Not getting tailored advice",
        "Not telling me about possible conditions",
      ],
    },
  },
];

/* Static class maps — Tailwind needs literal class names. */
const stageCol = [
  "lg:col-start-2",
  "lg:col-start-3",
  "lg:col-start-4",
  "lg:col-start-5",
  "lg:col-start-6",
] as const;

const lensRow = [
  "lg:row-start-2",
  "lg:row-start-3",
  "lg:row-start-4",
  "lg:row-start-5",
] as const;

const lensRule = (lensIndex: number) =>
  lensIndex > 0 ? "lg:border-t lg:border-border" : "";

function NoteChip({ note, lensChip }: { note: Note; lensChip: string }) {
  const text = typeof note === "string" ? note : note.text;
  const emphasis = typeof note !== "string" && note.emphasis;
  return (
    <li
      className={`max-w-prose rounded-lg px-3 py-2 text-sm leading-snug ${
        emphasis ? "bg-primary text-primary-foreground" : lensChip
      }`}
    >
      {text}
    </li>
  );
}

export function JourneyMap({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();

  const v: { map: Variants; stage: Variants; cell: Variants } = {
    map: {
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduce ? 0 : 0.06 },
      },
    },
    stage: {
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
      aria-label="User journey — current state"
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
          <h2 className={sectionHeading}>User journey</h2>

          <motion.div
            variants={v.cell}
            className="mt-8 flex items-start gap-4 md:gap-6"
          >
            <Image
              src="/assets/healthdirect/family.svg"
              alt=""
              width={123}
              height={123}
              className="size-16 shrink-0 md:size-24"
            />
            <div className="min-w-0 max-w-prose">
              <h3 className={subsectionHeading}>Aliya</h3>
              <p className="mt-2 text-base font-semibold leading-snug">
                A time-poor parent researching a child&apos;s symptoms
              </p>
              <blockquote className="mt-3 border-l border-border pl-4 text-sm leading-relaxed text-muted-foreground">
                &ldquo;I take online search results with a grain of salt but I
                like smart tools that save me time and get to the point quickly
                and have constructive and progressive ideas on treatments and
                prevention.&rdquo;
              </blockquote>
            </div>
          </motion.div>

          <div className="mt-8 md:mt-10 lg:grid lg:grid-cols-[7.5rem_repeat(5,minmax(0,1fr))] lg:gap-x-5 xl:grid-cols-[8.5rem_repeat(5,minmax(0,1fr))] xl:gap-x-6">
            {/* Desktop-only row labels; mobile repeats them inside each stage. */}
            <div className="hidden lg:contents">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground lg:col-start-1 lg:row-start-1 lg:self-end lg:border-b lg:border-border lg:pb-3">
                Journey steps
              </p>
              {lenses.map((lens, lensIndex) => (
                <p
                  key={lens.key}
                  aria-hidden="true"
                  className={`text-xs font-semibold uppercase tracking-[0.14em] text-foreground lg:col-start-1 ${lensRow[lensIndex]} ${lensRule(lensIndex)} lg:py-4`}
                >
                  {lens.label}
                </p>
              ))}
            </div>

            {stages.map((stage, stageIndex) => (
              <motion.section
                key={stage.title}
                variants={v.stage}
                aria-label={`Stage ${stageIndex + 1} — ${stage.title}`}
                className="mt-8 border-t border-border pt-6 first-of-type:mt-0 first-of-type:border-t-0 first-of-type:pt-0 lg:contents"
              >
                <motion.div
                  variants={v.cell}
                  className={`${stageCol[stageIndex]} lg:row-start-1 lg:flex lg:items-end lg:justify-between lg:gap-2 lg:border-b lg:border-border lg:pb-3`}
                >
                  <p className="text-base font-semibold leading-snug">
                    {stage.title}
                  </p>
                  {stageIndex < stages.length - 1 ? (
                    <ArrowRightIcon
                      aria-hidden="true"
                      className="hidden size-3.5 shrink-0 text-foreground/45 lg:mb-0.5 lg:block"
                    />
                  ) : null}
                </motion.div>

                {lenses.map((lens, lensIndex) => (
                  <motion.div
                    key={lens.key}
                    variants={v.cell}
                    className={`mt-4 lg:mt-0 ${stageCol[stageIndex]} ${lensRow[lensIndex]} ${lensRule(lensIndex)} lg:py-4`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground lg:hidden">
                      {lens.label}
                    </p>
                    <ul
                      aria-label={`${lens.label} — ${stage.title}`}
                      className="mt-2 flex flex-wrap gap-2 lg:mt-0 lg:flex-col lg:flex-nowrap"
                    >
                      {stage.notes[lens.key].map((note) => (
                        <NoteChip
                          key={typeof note === "string" ? note : note.text}
                          note={note}
                          lensChip={lens.chip}
                        />
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </motion.section>
            ))}
          </div>

          <p className="mt-8 max-w-prose text-sm leading-relaxed text-foreground">
            <span
              aria-hidden="true"
              className="mr-2 inline-block size-2.5 translate-y-px rounded-[0.25rem] bg-primary"
            />
            Near-black notes mark where trust broke down — momentum stalling
            inside the question loop and care advice that didn&apos;t explain
            itself, the doubts behind most of the 55% drop-off.
          </p>
        </motion.div>
      </CollapsingLeaf>
    </section>
  );
}
