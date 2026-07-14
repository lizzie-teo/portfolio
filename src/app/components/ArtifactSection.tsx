import type { ReactNode } from "react";
import { cornerClasses, type TileCorners } from "./Chapter";
import { CollapsingLeaf } from "./CollapsingLeaf";
import { MotionReveal } from "./MotionReveal";

type ArtifactSectionProps = {
  /** Anchor id — must match the section id in the case study's chapters registry. */
  id: string;
  /** Wayfinding title — must match the rail and chapter-marker link text exactly. */
  title: string;
  /** The speakable finding — what this artifact proved, not what was done. */
  takeaway: string;
  /**
   * Which corners the tile rounds. Defaults to "all"; pass "none" or "bottom"
   * when the section sits inside a grouped chapter slab.
   */
  corners?: TileCorners;
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
 * Like every section surface, the tile shares the leaf arrival: if its
 * natural height is under a viewport it opens at the full leaf height and
 * collapses onto its content as the reader scrolls on (see CollapsingLeaf);
 * taller sections no-op and rest as plain tiles. The anchor id stays on the
 * outer section wrapper so anchor jumps land above the pin line — arriving
 * on the full open tile, the same feedback chapters give. Content is
 * top-aligned: the heading sits where reading starts and never moves.
 *
 * Artifact modules that render their own tile and internal `h3` title
 * (e.g. IaFlow, JourneyMap) are not wrapped in this component — they take
 * the anchor `id` directly so the nav ties to their own heading,
 * avoiding a duplicated label above the tile.
 */
export function ArtifactSection({
  id,
  title,
  takeaway,
  corners = "all",
  children,
}: ArtifactSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-start ${cornerClasses[corners]} border border-border bg-card p-6 shadow-card sm:p-8 md:p-10 lg:p-12`}
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
      </CollapsingLeaf>
    </section>
  );
}
