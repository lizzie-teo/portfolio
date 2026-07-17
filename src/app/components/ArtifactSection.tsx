import type { ReactNode } from "react";
import {
  anchorScrollOffset,
  cornerClasses,
  readingTilePadding,
  tilePadding,
  sectionHeading,
  subsectionHeading,
  type TileCorners,
} from "./Chapter";
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
  /**
   * Semantic level for the section title. Defaults to `3` (a subsection under
   * the chapter's `h2` lede). A case study may pass `2` to flatten its
   * in-chapter section titles to chapter level. Both render as the shared
   * display heading; `2` takes the full `sectionHeading` size and `3` steps
   * down one notch to `subsectionHeading`, so nesting still reads.
   */
  headingLevel?: 2 | 3;
  /**
   * Opt in to the roomier "reading page" vertical rhythm (see
   * `readingTilePadding`): more space above the title and below the last line
   * of content, so the section rests with printed-page top/bottom margins.
   * Defaults off, so every other case study keeps the standard tile padding —
   * only the Healthdirect page turns it on. Horizontal padding is unchanged.
   */
  roomy?: boolean;
  children?: ReactNode;
};

/**
 * An anchored artifact section inside a Chapter, rendered as its own tile
 * in the case-study card system (the same recipe as the self-tiled
 * artifact modules): a display section heading that mirrors the nav link
 * text (arrival feedback for anchor jumps), a one-line takeaway as its
 * supporting lede, then the artifact. The heading dominates and the
 * takeaway reads as the subheading beneath it, the same hierarchy the
 * self-tiled modules give their title and intro line. Extends the Chapter
 * "speakable lede" pattern one level down: chapter ledes carry the story
 * arc, artifact takeaways carry the evidence, so a skimmer reading only
 * ledes and takeaways still gets the whole argument.
 *
 * Like every section surface, the tile shares the leaf arrival: if its
 * natural height is under a viewport it opens at the full leaf height and
 * collapses onto its content as the reader scrolls on (see CollapsingLeaf);
 * taller sections no-op and rest as plain tiles. The anchor id stays on the
 * outer section wrapper so anchor jumps land above the pin line — arriving
 * on the full open tile, the same feedback chapters give. Content is
 * top-aligned: the heading sits where reading starts and never moves.
 *
 * Artifact modules that render their own tile and internal `h2` section
 * heading (e.g. IaFlow, JourneyMap) are not wrapped in this component — they
 * take the anchor `id` directly so the nav ties to their own heading,
 * avoiding a duplicated label above the tile.
 */
export function ArtifactSection({
  id,
  title,
  takeaway,
  corners = "all",
  headingLevel = 3,
  roomy = false,
  children,
}: ArtifactSectionProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const padding = roomy
    ? readingTilePadding
    : tilePadding;
  return (
    <section id={id} className={anchorScrollOffset}>
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-start ${cornerClasses[corners]} border border-border bg-card shadow-card ${padding}`}
      >
        <MotionReveal>
          <Heading
            className={headingLevel === 2 ? sectionHeading : subsectionHeading}
          >
            {title}
          </Heading>
        </MotionReveal>
        <MotionReveal delay={0.05}>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground md:mt-4 md:text-lg">
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
