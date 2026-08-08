"use client";

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
 * The Infermedica engine audit, drawn as a native annotated diagram in the
 * journey-map's visual language instead of a full-width screenshot. The
 * triage output sits small in the centre as the exhibit; audit notes point
 * at it from either side — what held up, and where trust could break — and
 * the design agenda the tension produced hangs underneath. The near-black
 * note marks the core problem: outputs that could read as a diagnosis
 * inside a legally non-diagnostic service. Mobile recomposes as exhibit →
 * strengths → risks → agenda, which is also DOM order, and every note is
 * visible text, so the diagram reads correctly without motion or vision.
 */

type Note = { text: string; emphasis?: true };

const strengths: Note[] = [
  { text: "Strong clinical reasoning" },
  { text: "Structured symptom assessment" },
];

const risks: Note[] = [
  { text: "Outputs can read as a diagnosis", emphasis: true },
  { text: "Sounds overly certain without supervision" },
];

const agenda = [
  "Reframe recommendations for the Australian clinical and policy context",
  "Clearer signals on when to move from AI guidance to self-care",
];

const groupLabel =
  "text-xs font-semibold uppercase tracking-[0.14em] text-foreground";

/** Desktop-only leader line tying a note chip to the central exhibit. */
function Leader({ toward }: { toward: "right" | "left" }) {
  return (
    <span
      aria-hidden="true"
      className={`hidden min-w-5 flex-1 items-center lg:flex ${
        toward === "left" ? "flex-row-reverse" : ""
      }`}
    >
      <span className="h-[1.5px] flex-1 bg-foreground/20" />
      <span className="size-1.5 shrink-0 rounded-full bg-foreground/40" />
    </span>
  );
}

export function EngineAudit({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();

  const v: { map: Variants; cell: Variants } = {
    map: {
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduce ? 0 : 0.06 },
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
      aria-label="AI engine audit — what held up, where trust could break, and the design agenda"
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
            text="AI engine audit"
          />

          <motion.p variants={v.cell} className={sectionLede}>
            The brief was to rebuild the Symptom Checker around Infermedica, a
            new AI triage engine, inside Australia&apos;s strict clinical
            standards, legal constraints, and Healthdirect&apos;s remit to guide
            people toward care without diagnosing them. Before any design, we
            audited what the engine could and couldn&apos;t do.
          </motion.p>

          <div className={`${sectionContentGap} lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-x-3 xl:gap-x-4`}>
            <motion.figure
              variants={v.cell}
              className="mx-auto w-full max-w-xs lg:col-start-2 lg:row-start-1 lg:w-60 xl:w-72"
            >
              <div
                style={{ aspectRatio: 1910 / 930 }}
                className="relative w-full overflow-hidden rounded-lg border border-border bg-secondary"
              >
                <Image
                  src="/assets/healthdirect/triage-results-tablet.webp"
                  alt="Infermedica triage results on a tablet: a 'Consult a doctor within 24 hours' recommendation above a list of possible conditions"
                  fill
                  sizes="(min-width: 1280px) 288px, (min-width: 1024px) 240px, 320px"
                  className="object-cover"
                />
              </div>
              <figcaption className={`mt-2 text-center ${groupLabel}`}>
                Infermedica, the engine we audited
              </figcaption>
            </motion.figure>

            <div className="mt-8 lg:col-start-1 lg:row-start-1 lg:mt-0">
              <motion.p variants={v.cell} className={groupLabel}>
                What held up
              </motion.p>
              <ul aria-label="What held up" className="mt-3 space-y-2">
                {strengths.map((note) => (
                  <motion.li
                    key={note.text}
                    variants={v.cell}
                    className="flex items-center gap-3"
                  >
                    <span className="rounded-lg bg-journey-needs px-3 py-2 text-sm leading-snug text-note-ink">
                      {note.text}
                    </span>
                    <Leader toward="right" />
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="mt-8 lg:col-start-3 lg:row-start-1 lg:mt-0">
              <motion.p variants={v.cell} className={`${groupLabel} lg:text-right`}>
                Where trust could break
              </motion.p>
              <ul
                aria-label="Where trust could break"
                className="mt-3 space-y-2"
              >
                {risks.map((note) => (
                  <motion.li
                    key={note.text}
                    variants={v.cell}
                    className="flex items-center gap-3"
                  >
                    <Leader toward="left" />
                    <span
                      className={`rounded-lg px-3 py-2 text-sm leading-snug ${
                        note.emphasis
                          ? "bg-primary text-primary-foreground"
                          : "bg-journey-pain text-note-ink"
                      }`}
                    >
                      {note.text}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center lg:mt-2">
            <motion.span
              variants={v.cell}
              aria-hidden="true"
              className="hidden h-7 w-[1.5px] bg-foreground/20 lg:block"
            />
            <motion.p variants={v.cell} className={`${groupLabel} lg:mt-2`}>
              The design agenda
            </motion.p>
            <ul
              aria-label="The design agenda"
              className="mt-3 flex flex-wrap justify-center gap-2"
            >
              {agenda.map((item) => (
                <motion.li
                  key={item}
                  variants={v.cell}
                  className="max-w-prose rounded-lg border border-foreground/30 bg-card px-3 py-2 text-center text-sm leading-snug"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          <p className="mt-8 max-w-prose text-sm leading-relaxed text-foreground">
            <span
              aria-hidden="true"
              className="mr-2 inline-block size-2.5 translate-y-px rounded-[0.25rem] bg-primary"
            />
            The black note marks the core tension. Advice this confident could
            read as exactly the diagnosis the service is never allowed to give.
            The design agenda shows how the redesign answered that.
          </p>
        </motion.div>
      </CollapsingLeaf>
    </section>
  );
}
