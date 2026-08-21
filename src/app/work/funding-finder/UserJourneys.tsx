"use client";

import { ArrowRightIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useState } from "react";
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
import { PerspectiveSwitch, type Perspective } from "./PerspectiveSwitch";

/**
 * Both future state journeys in one module, switched rather than stacked, and
 * drawn as the same journey matrix the symptom checker's current state map uses
 * — so a reader who has met one journey artefact on this site can read the next
 * one without relearning it.
 *
 * Six phases each, and the two are structurally identical by design: the same
 * deal, walked from either desk. Setting them one above the other would run to
 * two full width matrices and about a screen and a half of scrolling to say
 * something the reader can see in one press of a toggle, so the switch is the
 * layout decision, not a space saving one. See PerspectiveSwitch for why the
 * same control appears again on the IA flow. Switching remounts the matrix
 * (keyed on perspective) so the new journey cascades in rather than swapping
 * text inside cells that never moved.
 *
 * THREE LENSES, ALL DRAWN FROM WHAT THE JOURNEY ALREADY SAID. What they do,
 * where it happens, and how it should feel were the three fields every phase
 * already carried; the matrix just turns them into rows so a phase can be read
 * across as well as down. There is deliberately no pain points row: this is the
 * future state, so the fourth lens of the symptom checker's map has nothing
 * truthful to put in it, and inventing one would be a diagram telling a story
 * the project did not.
 *
 * NOTES ARE CHIPS, NOT SENTENCES, and that is what lets six phases sit across
 * one strip. Each phase used to carry a twenty word action sentence, which is
 * unreadable in a 120px column — the earlier version of this module said so and
 * laid the phases out three across instead. The fix is the writing rather than
 * the grid: every action is now split into the two or three moves it actually
 * describes, and each touchpoint into the screens it names, so a cell holds
 * short fragments the eye scans down. Nothing was cut except connective prose.
 *
 * NO EMPHASIS CHIP AND NO LEGEND. The symptom checker marks the moments trust
 * broke down in near-black and explains the marking underneath. A future state
 * journey has no breakdowns, so rather than invent an equivalent the weight
 * goes on the "how it should feel" row: one solid ink chip per phase, the same
 * material as the selected tab of the switch above it, reading across as the
 * band the whole design is aiming at. Its row label says what it is, so there
 * is nothing left for a legend to explain.
 *
 * Semantics: a tabpanel holding one labelled section per phase. DOM order is
 * journey order at every width, and every note is visible text.
 */

const lenses = [
  {
    key: "actions",
    label: "What they do",
    chip: "border border-foreground/30 bg-card",
  },
  {
    key: "touchpoints",
    label: "Where it happens",
    /* --note-ink on the scope's pale pink --secondary (#f9eef3) is ~13:1; the
       scope's own --secondary-foreground is 6.4:1, under the 7:1 that §4 sets
       for small text, so these chips take the shared diagram note ink. */
    chip: "bg-secondary text-note-ink",
  },
  {
    key: "feelings",
    label: "How it should feel",
    /* Ink, matching the switch's selected tab — white on --leaf is 14.9:1. */
    chip: "bg-leaf text-leaf-foreground",
  },
] as const;

type LensKey = (typeof lenses)[number]["key"];

type Phase = {
  /** The phase name, as a verb where it can be. */
  name: string;
  notes: Record<LensKey, string[]>;
};

const journeys: Record<
  Perspective,
  { label: string; lede: string; phases: Phase[] }
> = {
  borrower: {
    label: "Borrower",
    lede: "A borrower goes from picking a loan type to a submitted application without having to go and find a document.",
    phases: [
      {
        name: "Discover",
        notes: {
          actions: ["Picks a loan type", "Short term, development or business"],
          touchpoints: ["Landing page", "Loan type selector"],
          feelings: ["Curious"],
        },
      },
      {
        name: "Apply",
        notes: {
          actions: [
            "Answers one question at a time",
            "Starts with no login",
            "Reads the intent framing first",
          ],
          touchpoints: ["Progressive form", "One question per screen"],
          feelings: ["Confident"],
        },
      },
      {
        name: "Link bank",
        notes: {
          actions: [
            "Connects the bank account",
            "Income and expenses pull through",
            "No pages of manual fields",
          ],
          touchpoints: ["Bank connection", "Consent and review"],
          feelings: ["Reassured"],
        },
      },
      {
        name: "Get matched",
        notes: {
          actions: [
            "Gets a shortlist ranked by fit",
            "Best match pinned to the top",
            "Sees the reason it fits",
          ],
          touchpoints: ["Results screen", "Ranked lender cards"],
          feelings: ["Excited"],
        },
      },
      {
        name: "Choose",
        notes: {
          actions: [
            "Reads rate, term, monthly cost",
            "Compares without opening a card",
          ],
          touchpoints: ["Lender comparison", "Card layout"],
          feelings: ["In control"],
        },
      },
      {
        name: "Submit",
        notes: {
          actions: [
            "Sends it to the chosen lender",
            "Reads what happens next",
            "And roughly when",
          ],
          touchpoints: ["Submission", "Confirmation", "Status tracker"],
          feelings: ["Relieved"],
        },
      },
    ],
  },
  broker: {
    label: "Broker",
    lede: "A broker goes from inviting a client to closing the deal, and nothing about it is kept outside the platform.",
    phases: [
      {
        name: "Invite client",
        notes: {
          actions: [
            "Adds a client to the pipeline",
            "Sends the invite",
            "Borrower gets a link into the form",
          ],
          touchpoints: ["Pipeline", "Client invite"],
          feelings: ["Organised"],
        },
      },
      {
        name: "Monitor",
        notes: {
          actions: [
            "Watches progress as it happens",
            "Sees where in the form they are",
          ],
          touchpoints: ["Deal card", "Borrower progress"],
          feelings: ["In control"],
        },
      },
      {
        name: "Review",
        notes: {
          actions: [
            "Reads the whole application in place",
            "Financials and loan type",
            "Products it matched",
          ],
          touchpoints: ["Application tab", "Document view"],
          feelings: ["Focused"],
        },
      },
      {
        name: "Advise",
        notes: {
          actions: [
            "Messages from the deal thread",
            "Conversation stays with the deal",
          ],
          touchpoints: ["Messages tab", "Notifications"],
          feelings: ["Helpful"],
        },
      },
      {
        name: "Track",
        notes: {
          actions: [
            "Runs every deal from one pipeline",
            "Filters to what needs action",
            "Replaces the spreadsheet",
          ],
          touchpoints: ["Pipeline", "Stage chips", "Filters"],
          feelings: ["Efficient"],
        },
      },
      {
        name: "Close",
        notes: {
          actions: [
            "Lender decision lands",
            "Marks the deal complete",
            "Archived with its history",
          ],
          touchpoints: ["Status tab", "Archive", "Activity log"],
          feelings: ["Accomplished"],
        },
      },
    ],
  },
};

/* Static class maps — Tailwind needs literal class names. */
const phaseCol = [
  "lg:col-start-2",
  "lg:col-start-3",
  "lg:col-start-4",
  "lg:col-start-5",
  "lg:col-start-6",
  "lg:col-start-7",
] as const;

const lensRow = ["lg:row-start-2", "lg:row-start-3", "lg:row-start-4"] as const;

/* Desktop matrix rules, drawn as their own full-width grid items rather than
   as a border on each cell. A per-cell border-b/border-t is broken into seven
   dashes by the column gap, which makes the diagram read as six parallel stacks
   that happen to line up instead of one table; spanning every column draws the
   line across the gaps too. Zero-height items pinned to the row edge, so they
   sit flush whatever the row's tallest cell turns out to be.

   Deliberately NOT motion components: the rules are the table's frame, so they
   are already drawn while the cells stagger into them. Riding the stagger would
   snap three full-width lines in at three different moments, which is far more
   conspicuous than the short segments were. */
const gridRules = [
  /* Bottom of the header row. */
  { key: "header", placement: "lg:row-start-1 lg:self-end" },
  /* Top of each lens row after the first — the header rule divides that one. */
  { key: "touchpoints", placement: "lg:row-start-3 lg:self-start" },
  { key: "feelings", placement: "lg:row-start-4 lg:self-start" },
] as const;

const idBase = "funding-finder-journey";

export function UserJourneys({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();
  const [perspective, setPerspective] = useState<Perspective>("borrower");
  const journey = journeys[perspective];

  const v: { map: Variants; phase: Variants; cell: Variants } = {
    map: {
      hidden: {},
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
    },
    phase: {
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
    <section id={id} aria-label="User journeys" className={anchorScrollOffset}>
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-start ${cornerClasses[corners]} border border-border bg-card shadow-card ${readingTilePadding}`}
      >
        <MaskReveal
          as="h2"
          mode="word"
          duration="fast"
          className={sectionHeading}
          text="User journeys"
        />

        <p className={sectionLede}>
          These two journeys walk the same deal from different desks. Both run
          six phases, and each borrower phase has a broker move that matches
          it.
        </p>

        <div className={`${sectionContentGap} flex flex-col gap-6`}>
          <PerspectiveSwitch
            value={perspective}
            onChange={setPerspective}
            idBase={idBase}
            label="Choose a journey"
            labels={{ borrower: "Borrower", broker: "Broker" }}
          />

          <div
            role="tabpanel"
            id={`${idBase}-panel-${perspective}`}
            aria-labelledby={`${idBase}-tab-${perspective}`}
            tabIndex={0}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <p className="max-w-prose text-base leading-relaxed text-foreground">
              {journey.lede}
            </p>

            <motion.div
              /* Keyed on the perspective so switching remounts the matrix and
                 the new journey cascades in, rather than swapping text inside
                 cells that never moved. */
              key={perspective}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              variants={v.map}
              /* Named group rather than a bare labelled div: the label is the
                 only thing that tells a screen reader which of the two journeys
                 the matrix currently holds, and aria-label on a roleless div is
                 dropped. */
              role="group"
              aria-label={`${journey.label} journey`}
              className="mt-8 md:mt-10 lg:grid lg:grid-cols-[6.5rem_repeat(6,minmax(0,1fr))] lg:gap-x-4 xl:grid-cols-[7.5rem_repeat(6,minmax(0,1fr))] xl:gap-x-5 2xl:gap-x-6"
            >
              {gridRules.map((rule) => (
                <div
                  key={rule.key}
                  aria-hidden="true"
                  className={`hidden lg:col-span-full lg:block lg:border-t lg:border-rule ${rule.placement}`}
                />
              ))}

              {/* Desktop-only row labels; mobile repeats them inside each
                  phase. */}
              <div className="hidden lg:contents">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground lg:col-start-1 lg:row-start-1 lg:self-end lg:pb-3">
                  Phases
                </p>
                {lenses.map((lens, lensIndex) => (
                  <p
                    key={lens.key}
                    aria-hidden="true"
                    className={`text-xs font-semibold uppercase tracking-[0.14em] text-foreground lg:col-start-1 ${lensRow[lensIndex]} lg:py-6`}
                  >
                    {lens.label}
                  </p>
                ))}
              </div>

              {journey.phases.map((phase, phaseIndex) => (
                <motion.section
                  key={phase.name}
                  variants={v.phase}
                  aria-label={phase.name}
                  className="mt-8 border-t border-rule pt-6 first-of-type:mt-0 first-of-type:border-t-0 first-of-type:pt-0 lg:contents"
                >
                  <motion.div
                    variants={v.cell}
                    className={`${phaseCol[phaseIndex]} lg:row-start-1 lg:flex lg:items-end lg:justify-between lg:gap-2 lg:pb-3`}
                  >
                    <p className="text-base font-semibold leading-snug">
                      {phase.name}
                    </p>
                    {phaseIndex < journey.phases.length - 1 ? (
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
                      className={`mt-4 lg:mt-0 ${phaseCol[phaseIndex]} ${lensRow[lensIndex]} lg:py-6`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground lg:hidden">
                        {lens.label}
                      </p>
                      <ul
                        aria-label={`${lens.label} — ${phase.name}`}
                        className="mt-2 flex flex-wrap gap-2 lg:mt-0 lg:flex-col lg:flex-nowrap"
                      >
                        {phase.notes[lens.key].map((note) => (
                          <li
                            key={note}
                            className={`max-w-prose rounded-lg px-3 py-2 text-sm leading-snug ${lens.chip}`}
                          >
                            {note}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </motion.section>
              ))}
            </motion.div>
          </div>
        </div>
      </CollapsingLeaf>
    </section>
  );
}
