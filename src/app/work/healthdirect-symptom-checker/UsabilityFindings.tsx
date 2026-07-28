"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { motionDuration, motionEase } from "../../lib/motion";

/**
 * One round-2 usability finding, presented as a designed slide rather than a
 * baked image: the finding text lives as real DOM typography (legible from
 * 320px up) and leads the slide, with the evidence sized down to compact
 * supporting exhibits beside it.
 *
 * Evidence follows an overview-plus-detail pattern. A small portrait device
 * frame carries the WHOLE screen users saw — the overview, so a reader can
 * place where the finding sits on the page — and the annotated crops sit beside
 * it as the zoomed detail: each a small thumbnail with a short verdict and a
 * one-line note. Each verdict sits in a coloured box in the journey-map palette
 * — pink for a problem, mint for what worked, an outline box for neutral
 * context — so "what works / what doesn't" reads the same across the case study
 * (journey map, engine audit, landscape review, and here). Nothing in the
 * evidence is meant to be read pixel by pixel — the claim and notes carry the
 * argument in real text, so the crops can stay small.
 */

/**
 * The verdict's semantic weight, driving its box colour the same way the journey
 * map drives a note chip off its lens: a negative finding, what worked, or plain
 * context. Colour is mapped from tone in one place (`verdictBox`), never
 * hard-coded per tag.
 */
type Tone = "pain" | "worked" | "neutral";

type Crop = {
  /** Web asset path under /public — a physical crop of the evidence element. */
  src: string;
  /** Describes the captured element for assistive tech. */
  alt: string;
  /** Intrinsic ratio (width / height) of the physical crop. */
  ratio: number;
  /** Short verdict that ties the claim to this crop, e.g. "Too wordy". */
  tag: string;
  /** Semantic weight of the verdict, mapped to a journey-palette box colour. */
  tone: Tone;
  /** One line connecting the claim to what this crop shows. */
  note: string;
  /**
   * A wall-of-text exhibit: capped to a portrait thumbnail and faded at its
   * foot, so the density still reads as "and it kept going" even small.
   */
  dense?: boolean;
};

/** The whole, uncropped screen a finding reports on — the overview reference. */
type Context = {
  /** Web asset path under /public — the full staged screen, top-anchored. */
  src: string;
  /** Describes the entire screen for assistive tech. */
  alt: string;
};

type Finding = {
  id: string;
  /** Names the screen this finding reports on — the slide eyebrow and dot label. */
  label: string;
  /**
   * The finding itself: what round 2 proved, legible at every width. Set as
   * body-size prose with the load-bearing phrase bolded inline (real `<strong>`
   * emphasis, not a display line), so the finding reads as a sentence with its
   * conclusion weighted rather than shouting the whole claim at heading size.
   */
  claim: ReactNode;
  /** The whole screen behind this finding, shown small for orientation. */
  context: Context;
  crops: Crop[];
};

const A = "/assets/healthdirect/usability-tests";

/**
 * Tone → verdict-card classes, the single place colour is decided (matching the
 * journey map's lens-driven chips and EngineAudit / LandscapeReview's works /
 * doesn't-work boxes). Each verdict is now a small card in the journey-chip
 * family — `rounded-lg` on journey-chip padding — holding the verdict heading
 * and its note together, so the tone tint frames the whole judgment, not just
 * the label.
 *
 * The class sets the card's text colour, so the `h4` verdict and its note both
 * inherit the correct on-tint ink from one place — a card can never end up with
 * foreground ink on a filled tint or tint ink on the outline card.
 *
 * Contrast (small text, held to the §4 7:1 bar): --note-ink on --journey-pink
 * is 12.4:1 and on --journey-mint 11.9:1; the neutral outline card carries
 * --foreground on --card at 11.2:1. All clear 7:1 comfortably.
 *
 * Neutral is an outline card (the journey map's own "actions"-lens vocabulary),
 * not `bg-secondary`: in the Healthdirect scope --secondary is itself mint
 * (#e6f5f5), which would blur against the mint "worked" verdict — the hairline
 * card reads unmistakably as context, not a coloured verdict.
 */
const verdictBox: Record<Tone, string> = {
  pain: "bg-journey-pain text-note-ink",
  worked: "bg-journey-needs text-note-ink",
  neutral: "border border-foreground/30 bg-card text-foreground",
};

/**
 * ─────────────────────────────────────────────────────────────────────────
 * The three round-2 findings, in reading order. One data set feeds the
 * carousel and its screen-reader equivalent, so nothing is authored twice and
 * changing the count needs no other edits.
 * ─────────────────────────────────────────────────────────────────────────
 */
const findings: Finding[] = [
  {
    id: "seek-urgent-care",
    label: "Urgent care outcome",
    claim: (
      <>
        Users read this outcome as triage, with services listed in order of
        recommendation. In a real emergency the same page{" "}
        <strong>tested as too wordy</strong>, and{" "}
        <strong>heavier still for new arrivals and lower English literacy</strong>.
      </>
    ),
    context: {
      src: `${A}/round-2-seek-context.webp`,
      alt: "The whole urgent care outcome screen: the pink 'Seek immediate medical care' banner at the top, the list of services beneath it, and the important information section further down.",
    },
    crops: [
      {
        src: `${A}/round-2-seek-outcome-banner.webp`,
        alt: "Pink outcome banner reading 'Seek immediate medical care' with a medical cross icon.",
        ratio: 1076 / 463,
        tag: "The outcome",
        tone: "neutral",
        note: "The 'seek immediate medical care' result, read as the next step for the situation.",
      },
      {
        src: `${A}/round-2-seek-service-list.webp`,
        alt: "The service list: Virtual Care Clinics, Urgent Care Clinics and Emergency Departments, each with a paragraph of explanation.",
        ratio: 1080 / 1265,
        tag: "Too wordy",
        tone: "pain",
        note: "Three services, each with its own paragraph. Under real urgency this was more reading than anyone wanted.",
      },
    ],
  },
  {
    id: "important-information",
    label: "Important information",
    claim: (
      <>
        Every section made sense to users, but its{" "}
        <strong>usefulness fell as urgency rose</strong>. The more pressing the
        situation, <strong>the less anyone wanted to read</strong>.
      </>
    ),
    context: {
      src: `${A}/round-2-guidance-context.webp`,
      alt: "The whole 'About these services' screen: the important information section opened to its full depth, section after section of explanatory text about virtual care, urgent care and emergency departments.",
    },
    crops: [
      {
        src: `${A}/round-2-guidance-depth.webp`,
        alt: "The 'About these services' panel: a full screen of dense explanatory text describing Virtual Care Clinics, Urgent Care Clinics and Emergency Departments.",
        ratio: 1080 / 1760,
        tag: "So much to read",
        tone: "pain",
        dense: true,
        note: "The 'About these services' panel, the full depth behind a single link, and it kept going well past the fold.",
      },
    ],
  },
  {
    id: "see-a-gp",
    label: "See a GP outcome",
    claim: (
      <>
        The Service Finder carried people to their next step. But{" "}
        <strong>
          a strict two hour window read as more urgent than the words intended
        </strong>
        , the reverse of the urgent care result.
      </>
    ),
    context: {
      src: `${A}/round-2-see-a-doctor-context.webp`,
      alt: "The whole see a GP outcome screen: the pink 'See a doctor within 2 hours' banner at the top, followed by the Service Finder widget and the important information section.",
    },
    crops: [
      {
        src: `${A}/round-2-see-a-doctor-banner.webp`,
        alt: "Pink outcome banner reading 'See a doctor within 2 hours'.",
        ratio: 734 / 340,
        tag: "Misfired",
        tone: "pain",
        note: "'See a doctor within 2 hours' landed as more alarming than 'seek immediate medical care', the opposite of the intent.",
      },
      {
        src: `${A}/round-2-service-finder.webp`,
        alt: "The 'Find a service' widget: a suburb or postcode field prefilled with Bowden SA 5007 and a Search button.",
        ratio: 984 / 702,
        tag: "What worked",
        tone: "worked",
        note: "The Service Finder moved people straight to a nearby option, though a few needed pointing toward it.",
      },
    ],
  },
];

/**
 * A transparency mask (not a colour gradient) that fades an image at its foot,
 * so a capped screen reads as "and it kept going" rather than a hard cut. Used
 * on the full-screen context frame and on the dense wall-of-text crop. Purely
 * visual, so no reduced-motion concern.
 */
const FOOT_FADE = "linear-gradient(to bottom, black 78%, transparent 100%)";

/**
 * Sizing hints for the evidence imagery. On mobile the frames go fluid and fill
 * the card column (up to a small-phone viewport width); from `sm` up they settle
 * onto the fixed exhibit widths (176px, then 192px at `lg`).
 */
const exhibitSizes = "(min-width: 1024px) 192px, (min-width: 640px) 176px, 100vw";

/**
 * The whole screen behind a finding, shown small: a portrait device frame with
 * a soft fade at its foot for "this page continued". It is the overview half of
 * the overview-plus-detail pairing — orientation, not something to read.
 */
function ContextScreen({ context }: { context: Context }) {
  return (
    <figure className="w-full shrink-0 sm:w-44 lg:w-48">
      {/* Device bezel: a rounded, tinted frame carries the shadow so no square
          shadow halos the rounded screen clipped inside it. */}
      <div className="overflow-hidden rounded-lg border border-border bg-secondary p-1 shadow-card">
        <div
          style={{ aspectRatio: "9 / 19" }}
          className="relative w-full overflow-hidden rounded-xs bg-card"
        >
          <Image
            src={context.src}
            alt={context.alt}
            fill
            sizes={exhibitSizes}
            className="object-cover object-top"
            style={{ maskImage: FOOT_FADE, WebkitMaskImage: FOOT_FADE }}
          />
        </div>
      </div>
      <figcaption className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Full screen
      </figcaption>
    </figure>
  );
}

/**
 * One annotated evidence crop, compact: a small screenshot thumbnail with its
 * judgment tag and note beside it (stacked on the narrowest widths, side by
 * side once there is room), so the crop footprint stays small and the note
 * still gets a readable measure.
 */
function CropExhibit({ crop }: { crop: Crop }) {
  return (
    <figure className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      <div className="w-full shrink-0 sm:w-44 lg:w-48">
        <div
          style={
            crop.dense ? { aspectRatio: "4 / 5" } : { aspectRatio: crop.ratio }
          }
          className="relative w-full overflow-hidden rounded-xs border border-border bg-card shadow-card"
        >
          <Image
            src={crop.src}
            alt={crop.alt}
            fill
            sizes={exhibitSizes}
            className={`object-cover ${crop.dense ? "object-top" : ""}`}
            style={
              crop.dense
                ? { maskImage: FOOT_FADE, WebkitMaskImage: FOOT_FADE }
                : undefined
            }
          />
        </div>
      </div>
      <figcaption className="min-w-0 flex-1">
        {/* The verdict is a coloured card in the journey-map palette — the same
            "what works / what doesn't" language as the journey map, EngineAudit,
            and LandscapeReview: pink for a problem, mint for what worked, an
            outline card for neutral context. Colour comes from tone via
            `verdictBox`, never per-tag. The verdict heading and its note both
            live inside the tint, and both inherit the card's on-tint ink from
            that one class, so the heading and note can never split contrast.
            The heading is an `h4` (§12 outline: h2 section → h3 finding →
            h4 verdict) but keeps its compact verdict-label styling — a small
            sentence-case semibold label, not a display heading. */}
        <div
          className={`max-w-prose rounded-lg px-3 py-2.5 ${verdictBox[crop.tone]}`}
        >
          <h4 className="text-sm font-semibold leading-snug">{crop.tag}</h4>
          {/* The note carries the argument that ties the claim to this crop.
              No colour of its own — it inherits the card's on-tint ink so it
              always matches the heading above it. */}
          <p className="mt-1.5 text-sm leading-relaxed">{crop.note}</p>
        </div>
      </figcaption>
    </figure>
  );
}

/** One finding, presented as a slide: the claim leads, the evidence supports. */
function FindingSlide({ finding }: { finding: Finding }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          {/* Signature accent bar — the teal action hue, echoing the nav's
              travelling pip, marks the head of every claim. */}
          <span aria-hidden="true" className="block h-1 w-10 rounded-full bg-primary" />
          {/* The finding label titles this finding block, so it is the `h3`
              between the section `h2` ("Usability testing") and each verdict
              `h4` — keeping the outline from skipping a level. §12 lets a
              heading tag that serves the eyebrow/kicker role keep that styling,
              so the tag changes to `h3` but the compact uppercase-kicker look
              does not. */}
          <h3 className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
            {finding.label}
          </h3>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-foreground">
            {finding.claim}
          </p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6 lg:gap-8">
          <ContextScreen context={finding.context} />
          <div className="flex min-w-0 flex-1 flex-col gap-5 sm:gap-6">
            {finding.crops.map((crop) => (
              <CropExhibit key={crop.src} crop={crop} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * The round-2 findings as one paged carousel across every width. Each slide is
 * a designed presentation of one finding — real DOM claim text leading, with a
 * small full-screen overview and compact annotated crops as supporting
 * evidence — so nothing is trapped in a baked image and the whole thing reads
 * from 320px up. Keyboard arrows page between findings; the dot rail jumps
 * directly; an sr-only ordered list carries every finding to assistive tech,
 * and the live region announces the active one. Under reduced motion the slide
 * offset and crossfade collapse to an instant swap.
 */
export function UsabilityFindings() {
  const shouldReduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const atStart = index === 0;
  const atEnd = index === findings.length - 1;
  const slideOffset = shouldReduce ? 0 : 24;

  const goTo = (next: number, step: number) => {
    if (next < 0 || next > findings.length - 1) {
      return;
    }
    setDirection(step);
    setIndex(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft" && !atStart) {
      event.preventDefault();
      goTo(index - 1, -1);
    } else if (event.key === "ArrowRight" && !atEnd) {
      event.preventDefault();
      goTo(index + 1, 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * slideOffset }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -slideOffset }),
  };

  const controlClassName =
    "flex min-h-11 min-w-11 items-center justify-center rounded-full border border-primary/40 bg-card text-primary outline-none transition-colors hover:border-primary/70 hover:bg-primary/10 active:bg-primary/20 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-40";

  return (
    <section
      // Pulls the findings up from under ArtifactSection's shared
      // `sectionContentGap` (40/56px): this evidence carousel leads with a
      // claim and reads as one unit with the takeaway above it, so it wants a
      // tighter pause than a standalone artifact. Scoped here on this one usage
      // rather than touching the shared chrome. Net gap ~24px / 32px.
      className="-mt-4 md:-mt-6"
      aria-roledescription="carousel"
      aria-label="Round 2 usability findings"
      onKeyDown={handleKeyDown}
    >
      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={findings[index].id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: shouldReduce ? 0.01 : motionDuration.base,
              ease: motionEase.out,
            }}
          >
            <FindingSlide finding={findings[index]} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-center sm:mt-8">
        <div className="flex max-w-full items-center gap-2 rounded-full border border-primary/15 bg-card p-1.5 shadow-card">
          <button
            type="button"
            aria-label="Previous finding"
            disabled={atStart}
            onClick={() => goTo(index - 1, -1)}
            className={controlClassName}
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
          </button>
          <ol className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {findings.map((finding, dotIndex) => {
              const isActive = dotIndex === index;
              return (
                <li key={finding.id}>
                  <button
                    type="button"
                    aria-label={finding.label}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => goTo(dotIndex, dotIndex > index ? 1 : -1)}
                    className="flex min-h-11 min-w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    <span
                      className={`h-1.5 rounded-full transition-all ${
                        isActive ? "w-5 bg-primary" : "w-1.5 bg-primary/25"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            aria-label="Next finding"
            disabled={atEnd}
            onClick={() => goTo(index + 1, 1)}
            className={controlClassName}
          >
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      {/* The findings as text, for assistive tech — the accessible equivalent
          of the visual carousel, including a description of each full screen. */}
      <ol className="sr-only">
        {findings.map((finding) => (
          <li key={finding.id}>
            {finding.label}: {finding.claim} {finding.context.alt}{" "}
            {finding.crops.map((crop) => `${crop.tag}. ${crop.note}`).join(" ")}
          </li>
        ))}
      </ol>
    </section>
  );
}
