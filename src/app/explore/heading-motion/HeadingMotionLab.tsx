"use client";

/*
 * EXPLORE-ONLY. The six specimens, plus the replay control that makes them
 * comparable at all.
 *
 * WHY A REPLAY BUTTON. Every reveal on the site fires once on scroll-in and
 * never again, which is right for reading and useless for judging. Replay
 * remounts the specimens under a new key so all six restart from hidden, so a
 * direction can be watched five times in a row instead of once per page load.
 *
 * WHY A CONTROL IN EACH TIER. The current fade-up is rendered first in both
 * tiers using the real MotionReveal, not a copy of it. Without it on screen the
 * candidates only get compared to memory, and memory grades whichever ran last.
 */

import { useState } from "react";
import { LeafPlate, leafHeading, sectionHeading } from "@/app/components/Chapter";
import { MotionReveal } from "@/app/components/MotionReveal";
import { MaskSlip } from "./MaskSlip";

/* The real strings from the live page, so the specimens are judged on the
   lengths they will actually have to carry rather than on a tidy sample. The
   leaf lede is the longest one on the page — if a direction only works on a
   short lede it has not worked. */
const LEAF_LEDE =
  "Evidence before pixels: an audit of the AI engine, a map of the real journey, then a rebuilt architecture, tested twice.";
const LEAF_EYEBROW = "The approach";
const SECTION_HEADINGS = ["Information architecture", "Landscape review"];

export function HeadingMotionLab() {
  const [run, setRun] = useState(0);

  return (
    <div>
      {/* Sticky so it is reachable from anywhere on the page — the specimens are
          taller than a screen and a replay you have to scroll back to is a
          replay you stop using. */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1800px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <button
            type="button"
            onClick={() => setRun((current) => current + 1)}
            className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Replay all
          </button>
          <p className="text-sm text-muted-foreground">
            Specimens fire once on scroll-in, like the real page. Replay restarts
            every one of them. Turn on Reduce Motion in system settings and
            replay again to check the degraded state.
          </p>
        </div>
      </div>

      <div key={run}>
        <Tier
          id="leaf"
          label="Tier 1 — chapter leaf heading"
          note="Five of these on the page, each an arrival moment on the dark leaf. Long: 19 words at up to 52px. The frequency gate allows an expressive treatment here."
        >
          <LeafSpecimen
            name="Control — current fade-up"
            detail="MotionReveal, opacity + 10px, fast (200ms). What ships today."
          >
            <MotionReveal delay={0.1}>
              <h3 className={`mt-5 max-w-[22ch] ${leafHeading}`}>{LEAF_LEDE}</h3>
            </MotionReveal>
          </LeafSpecimen>

          <LeafSpecimen
            name="A — block slip"
            detail="One mask on the whole heading, slow (500ms), ease out, no opacity fade. Line-agnostic: no measuring, survives every breakpoint free."
          >
            <MaskSlip
              as="h3"
              text={LEAF_LEDE}
              mode="block"
              duration="slow"
              delay={0.1}
              className={`mt-5 max-w-[22ch] ${leafHeading}`}
            />
          </LeafSpecimen>

          <LeafSpecimen
            name="B — line slip"
            detail="One mask per rendered line, slow (500ms), 0.05s apart. Three lines lands at 0.6s, inside the 1s display budget. Costs a measure pass and a resize observer — resize the window and watch it regroup."
          >
            <MaskSlip
              as="h3"
              text={LEAF_LEDE}
              mode="line"
              duration="slow"
              interval={0.05}
              delay={0.1}
              className={`mt-5 max-w-[22ch] ${leafHeading}`}
            />
          </LeafSpecimen>
        </Tier>

        <Tier
          id="section"
          label="Tier 2 — section heading"
          note="About twelve of these, in-flow down the page, 2 to 5 words. Repeated interactions stay quick, so everything here runs at fast (200ms)."
        >
          <SectionSpecimen
            name="Control — current fade-up"
            detail="MotionReveal, opacity + 10px, fast. What ships today."
          >
            {SECTION_HEADINGS.map((heading) => (
              <MotionReveal key={heading}>
                <h3 className={sectionHeading}>{heading}</h3>
              </MotionReveal>
            ))}
          </SectionSpecimen>

          <SectionSpecimen
            name="C — block slip"
            detail="Same gesture as the leaf, less ceremony: fast (200ms) instead of slow. One motion language at two speeds."
          >
            {SECTION_HEADINGS.map((heading) => (
              <MaskSlip
                key={heading}
                as="h3"
                text={heading}
                mode="block"
                duration="fast"
                className={sectionHeading}
              />
            ))}
          </SectionSpecimen>

          <SectionSpecimen
            name="D — word slip"
            detail="Word by word, fast per word, 0.05s apart. Three words resolves in 0.3s, well inside budget. The real question is not the budget, it is whether this reads as a tic by the twelfth time."
          >
            {SECTION_HEADINGS.map((heading) => (
              <MaskSlip
                key={heading}
                as="h3"
                text={heading}
                mode="word"
                duration="fast"
                interval={0.05}
                className={sectionHeading}
              />
            ))}
          </SectionSpecimen>
        </Tier>
      </div>
    </div>
  );
}

/* Separator and framing above each tier. Scaffolding for this page only. */
function Tier({
  id,
  label,
  note,
  children,
}: {
  id: string;
  label: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} id={id} className="scroll-mt-20">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 md:px-8 md:py-10 lg:px-12 xl:px-16 2xl:px-24">
          <h2
            id={`${id}-heading`}
            className="font-heading text-2xl font-semibold tracking-[-0.01em] md:text-3xl"
          >
            {label}
          </h2>
          <p className="mt-3 max-w-prose text-base leading-relaxed opacity-90">
            {note}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

/* A leaf specimen: the real chapter opener composition — plate, rule, eyebrow,
   heading — on the real Healthdirect leaf tokens, at natural height rather than
   the live 100svh, so all three candidates can be replayed close together.
   The leaf's own collapse is deliberately not reproduced; what is being judged
   here is the type. */
function LeafSpecimen({
  name,
  detail,
  children,
}: {
  name: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <SpecimenLabel name={name} detail={detail} />
      <div
        data-project-theme="healthdirect-symptom-checker"
        className="px-4 pb-10 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24"
      >
        <div className="mx-auto flex w-full max-w-[1800px] flex-col items-center rounded-3xl bg-leaf px-5 py-10 text-center sm:px-8 sm:py-12 md:px-12 md:py-16 lg:px-16 lg:py-20">
          <MotionReveal>
            <div className="mb-6 flex justify-center sm:mb-8">
              <LeafPlate
                src="/assets/chapter-illustrations/approach-alpha.webp"
                width={971}
                height={306}
              />
            </div>
          </MotionReveal>
          <MotionReveal delay={0.05}>
            <div className="mx-auto w-fit">
              <div className="mb-6 h-px w-full bg-leaf-foreground/40" />
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-leaf-foreground/70">
                {LEAF_EYEBROW}
              </p>
            </div>
          </MotionReveal>
          {children}
        </div>
      </div>
    </div>
  );
}

/* A section specimen: two real section headings on a plain tile, the way they
   sit inside a chapter. Two rather than one so a repeated gesture can be seen
   repeating — the failure mode for tier 2 is not how it looks once. */
function SectionSpecimen({
  name,
  detail,
  children,
}: {
  name: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border">
      <SpecimenLabel name={name} detail={detail} />
      <div className="px-4 pb-10 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-10 rounded-3xl bg-card px-6 py-10 text-card-foreground sm:px-8 sm:py-12 md:px-10 md:py-16 lg:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}

function SpecimenLabel({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="mx-auto w-full max-w-[1800px] px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {name}
      </p>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        {detail}
      </p>
    </div>
  );
}
