"use client";

/*
 * EXPLORE / CARDS — direction C: "The Specimen Sheet".
 *
 * THE WORLD
 *
 *   The total inversion of a card. A card is a small bounded object you look
 *   AT; a specimen band is a full-width page you are INSIDE. Each project floods
 *   the entire viewport in one committed colour, sets its name in display type
 *   so large it runs off the right edge, hangs its metadata on a single hairline
 *   baseline row, and puts the animated cover in a small inset plate that is
 *   plainly outranked by the typography. Reference: MOUTHWASH's cropped
 *   logotype, and Hermes Agent's flood-colour field.
 *
 *   Nothing here is rounded, nothing is raised, nothing is tinted. The page has
 *   exactly two kinds of mark: flood colour and hairline rule.
 *
 * WHY IT ANSWERS THE BRIEF. The five-card row splits attention five ways because
 * five things are on screen. Here exactly ONE project is on screen at a time and
 * it owns every pixel of it, so the question "which project leads" stops being a
 * layout problem and becomes a scroll position. And because only the band in
 * view mounts its plate, only one cover is ever running.
 *
 * THE FLOOD COLOURS ARE NOT NEW COLOURS. Each band floods with that project's
 * own deepened artwork ink from projectFields.ts — the value already authored
 * and contrast-measured for its card. They are artwork scene constants under the
 * style-rules §3 carve-out, imported rather than redeclared, and they never
 * touch a shell token. White type on each, measured:
 *
 *   Funding Finder   #7d0c37   9.9:1
 *   Healthdirect     #0a4a44  10.6:1
 *   AP+ Testing      #6e1e50  10.4:1
 *   Macquarie Radar  #2c3072  11.6:1
 *
 * All clear AAA for body text, which matters because the metadata row is small
 * type and style-rules §4 holds small type to 7:1.
 *
 * MOTION
 *   A band arrives by WIPE, not by fade: its flood scales in from the left edge
 *   on a `slow` ramp, so the colour arrives as a physical sweep across the page
 *   and the scheme inverts under it. The type then reveals line by line out of
 *   an overflow mask, on the site's headline recipe. Between bands there is no
 *   cross-fade at all — one colour ends where the next begins, a hard cut, which
 *   is the whole reason the bands read as separate pages rather than a gradient.
 *   Each band fires once and stays. Nothing is scroll-linked, so there is no
 *   parallax and no scroll-jacking.
 *
 * REDUCED MOTION drops the wipe and the masks entirely: the flood is simply
 * there, the type is simply there. There is no positional movement left to
 * remove because the design never depended on it to be readable.
 *
 * Content is read whole from ../content.
 */

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { motionDuration, motionEase } from "../../lib/motion";
import { IndustryGlyph } from "../../components/IndustryGlyph";
import { ProjectCover } from "../../components/ProjectCover";
import { getField } from "../../components/projectFields";
import type { CaseStudyEntry } from "../../work/projects";
import { caseStudies, outcomes } from "../content";
import { coverOf, usePlayNextFrame } from "./shared";

/* Line reveal interval, from the headline recipe in style-rules §7: `slow`
   items at 0.06s, four lines, well inside the 1s display budget. */
const LINE_STAGGER = 0.06;

/* CONTRAST NOTE. Every piece of type on a band is FULL WHITE; hierarchy is
   carried by size and weight, never by washing the ink out. That is deliberate
   rather than timid: at text-xs the metadata labels are small text, which
   style-rules §4 holds to 7:1, and white at 70% on the palest of the four floods
   (#7d0c37) measures about 5.5:1 — a fail that would have been easy to ship
   because it looks fine. The one exception is the 30% hairline rule, which
   carries no text. Measured white on flood: 9.9:1 / 10.6:1 / 10.4:1 / 11.6:1. */

export function DirectionSpecimenSheet() {
  return (
    /* The sheet's own paper, seen only at the head and the foot: everything
       between is flood. */
    <div className="bg-background text-foreground">
      <div className="border-t border-border px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em]">Selected work</p>
      </div>

      {caseStudies.map((entry) => (
        <SpecimenBand entry={entry} key={entry.slug} />
      ))}

      <ClosingSheet />
    </div>
  );
}

/* ── One specimen ─────────────────────────────────────────────────────────── */

function SpecimenBand({ entry }: { entry: CaseStudyEntry }) {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  /* Fires once, on ANY intersection. A band is a full screen tall, so a stricter
     margin would leave a band that is already on screen at load (a deep link to
     this direction's anchor, say) sitting under an unlifted wipe — and the wipe
     is opaque, so "not yet revealed" would read as "blank page". Earliest
     possible trigger is the safe one here. */
  const shown = useInView(ref, { once: true });
  /* Mounted only while the band is anywhere near the screen, which is what keeps
     one cover running rather than four. */
  const near = useInView(ref, { margin: "40% 0px 40% 0px" });

  const field = getField(entry.slug);
  const outcome = outcomes[entry.slug];
  const cover = coverOf(entry);

  return (
    <section
      aria-label={entry.title}
      className="relative isolate overflow-x-clip"
      ref={ref}
      style={{ backgroundColor: field.ink }}
    >
      {/* THE WIPE. A plain colour layer scaled from the left edge, sitting under
          the content, so the flood arrives as a sweep. The band's own background
          is already the flood colour, so if this never animates (reduced motion,
          no JavaScript, a failed observer) the page is simply correct. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 -z-10 origin-left bg-background"
        initial={false}
        animate={{ scaleX: shouldReduce || shown ? 0 : 1 }}
        transition={{
          duration: shouldReduce ? 0.01 : motionDuration.slow,
          ease: motionEase.out,
        }}
      />

      <div className="px-4 py-16 text-white sm:px-6 md:px-8 md:py-24 lg:px-12 lg:py-32 xl:py-40">
        <MaskLine order={0} shown={shown}>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
            {entry.industry ?? "Case study"}
          </p>
        </MaskLine>

        {/* THE LOGOTYPE. Set to run off the right edge of the viewport and
            cropped by the band — the name is treated as a specimen of type, not
            as a label that has to fit. `whitespace-nowrap` is what does the
            cropping; the band clips, so nothing ever escapes into a horizontal
            page scroll. */}
        <MaskLine order={1} shown={shown}>
          <h3 className="mt-6 whitespace-nowrap font-heading text-6xl font-medium leading-[0.92] tracking-[-0.03em] sm:text-7xl md:mt-8 md:text-8xl lg:text-9xl">
            {entry.title}
          </h3>
        </MaskLine>

        {/* The plate and the sentence, side by side from md. The plate is
            deliberately small: on a 1440 screen it is about a tenth of the band,
            against a name that is most of it. */}
        <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between md:gap-12">
          <MaskLine order={2} shown={shown}>
            <p className="max-w-prose text-base leading-relaxed text-white md:text-lg">
              {entry.tagline}
            </p>
          </MaskLine>

          <div
            aria-hidden="true"
            className="w-40 shrink-0 overflow-hidden sm:w-48 lg:w-56"
          >
            <div className="relative aspect-square w-full">
              {near ? (
                cover ? (
                  <BandCover cover={cover} playing={shown} />
                ) : (
                  <MarkPlate entry={entry} />
                )
              ) : null}
            </div>
          </div>
        </div>

        {/* THE BASELINE ROW. One hairline, three columns, tiny letterspaced
            labels. This is the specimen sheet's spine — every band carries the
            identical row, so the projects can be read against each other even
            though each owns its own colour. */}
        <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/30 pt-6 md:mt-16 md:grid-cols-4">
          <Spec label="Industry" value={entry.industry} />
          <Spec label="Discipline" value={entry.tags?.[1]} />
          <Spec label="Published outcome" value={outcome} wide />
        </dl>

        <MaskLine order={3} shown={shown}>
          <Link
            href={`/work/${entry.slug}`}
            aria-label={`Open the ${entry.title} case study. ${entry.tagline}`}
            className="mt-10 inline-flex min-h-12 items-center text-sm font-semibold uppercase tracking-[0.2em] text-white underline decoration-white/40 decoration-2 underline-offset-[0.4em] outline-none transition-colors duration-100 hover:decoration-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 md:mt-12"
            style={{ ["--tw-ring-offset-color" as string]: field.ink }}
          >
            Read the case study
          </Link>
        </MaskLine>
      </div>
    </section>
  );
}

/**
 * One cell of the baseline row. An empty value prints a rule and a dash rather
 * than collapsing, because the row's job is comparison: a reader has to be able
 * to see that three of these four have no publishable figure, and a cell that
 * vanishes hides that.
 */
function Spec({ label, value, wide }: { label: string; value?: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">{label}</dt>
      <dd className="mt-3 text-sm font-medium leading-snug text-white">
        {value ?? <span className="font-normal">Not published</span>}
      </dd>
    </div>
  );
}

/**
 * A line of type rising out of an overflow mask, the site's own headline reveal.
 * Reduced motion renders the identical markup with the mask released and no
 * movement, so the copy is never gated on the animation.
 */
function MaskLine({
  children,
  order,
  shown,
}: {
  children: ReactNode;
  order: number;
  shown: boolean;
}) {
  const shouldReduce = useReducedMotion();

  return (
    <div className="overflow-hidden pb-[0.08em]">
      <motion.div
        initial={false}
        animate={{ y: shouldReduce || shown ? "0%" : "115%" }}
        transition={{
          duration: shouldReduce ? 0.01 : motionDuration.slow,
          ease: motionEase.out,
          delay: shouldReduce ? 0 : order * LINE_STAGGER,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function BandCover({
  cover,
  playing,
}: {
  cover: NonNullable<ReturnType<typeof coverOf>>;
  playing: boolean;
}) {
  const play = usePlayNextFrame();

  return (
    <ProjectCover
      cover={cover}
      hovered={play && playing}
      className="absolute inset-0 h-full w-full"
    />
  );
}

/**
 * The inset for the entry with no film, and this direction's answer to it.
 *
 * On a specimen sheet the inset plate is already the least important object on
 * the band, so the absence of a film is close to free: the plate becomes a
 * hairline square holding that project's sector mark, drawn in the flood's own
 * reversed line work. It reads as a specimen tag rather than a broken image, and
 * it is arguably more at home in this world than the three dark film plates are.
 */
function MarkPlate({ entry }: { entry: CaseStudyEntry }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center border border-white/40 text-white">
      <IndustryGlyph industry={entry.industry} className="size-14 shrink-0 lg:size-16" />
    </div>
  );
}

/**
 * The closing sheet, and this direction's answer to the coming-soon tile.
 *
 * A specimen sheet ends on a blank page, so the placeholder becomes exactly
 * that: the paper back, one hairline, one line of type. It cannot be mistaken
 * for a project because it is the only band with no flood, and it needs no
 * "coming soon" framing device to say what it is.
 */
function ClosingSheet() {
  return (
    <section aria-label="More work" className="border-t border-border bg-background">
      <div className="px-4 py-16 sm:px-6 md:px-8 md:py-24 lg:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
          Blank sheet
        </p>
        <p className="mt-6 max-w-prose font-heading text-3xl font-medium leading-[1.06] tracking-[-0.02em] md:text-4xl">
          More work is on the way.
        </p>
      </div>
    </section>
  );
}
