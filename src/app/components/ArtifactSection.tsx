import type { ReactNode } from "react";
import { MotionReveal } from "./MotionReveal";

type ArtifactSectionProps = {
  /** Anchor id — must match the section id in the case study's chapters registry. */
  id: string;
  /** Wayfinding title — must match the rail and chapter-marker link text exactly. */
  title: string;
  /** The speakable finding — what this artifact proved, not what was done. */
  takeaway: string;
  children?: ReactNode;
};

/**
 * An anchored artifact section inside a Chapter, rendered as its own tile
 * in the case-study card system (the same recipe as the self-tiled
 * artifact modules): a quiet heading that mirrors the nav link text
 * (arrival feedback for anchor jumps), a one-line takeaway, then the
 * artifact. Extends the Chapter "speakable lede" pattern one level down —
 * chapter ledes carry the story arc, artifact takeaways carry the
 * evidence, so a skimmer reading only ledes and takeaways still gets the
 * whole argument.
 *
 * Artifact modules that render their own tile and internal `h3` title
 * (e.g. IaFlow, JourneyMap) are not wrapped in this component — they take
 * the anchor `id` directly so the nav links to their own heading,
 * avoiding a duplicated label above the tile.
 */
export function ArtifactSection({
  id,
  title,
  takeaway,
  children,
}: ArtifactSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6 md:p-8 lg:p-10"
    >
      <MotionReveal>
        <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h3>
      </MotionReveal>
      <MotionReveal delay={0.05}>
        <p className="mt-4 max-w-[34ch] text-xl font-semibold leading-snug tracking-[-0.02em] md:text-2xl">
          {takeaway}
        </p>
      </MotionReveal>
      {children ? (
        <div className="mt-6 space-y-6 md:mt-8 md:space-y-8">{children}</div>
      ) : null}
    </section>
  );
}
