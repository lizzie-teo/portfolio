import type { ReactNode } from "react";
import { CollapsingLeaf } from "./CollapsingLeaf";
import { cornerClasses, type TileCorners } from "./Chapter";

type TileProps = {
  /**
   * card — the default white content tile (matches the self-tiled artifact
   * modules: EngineAudit, IaFlow, JourneyMap, LandscapeReview,
   * AnnotatedFrame). secondary — the project-tinted quiet panel, for a
   * statement moment like InsightCallout. leaf — the dark chapter surface,
   * for divider-weight tiles.
   */
  surface?: "card" | "secondary" | "leaf";
  /**
   * Drop the internal padding when the tile's content bleeds to its own
   * rounded edge (full-tile media stages).
   */
  flush?: boolean;
  /**
   * Give a short section the leaf's "owns the screen" arrival: the tile opens
   * at the full leaf height (110svh — the viewport plus the leaves' 10%
   * overshoot past the fold), then collapses scroll-linked to its natural
   * height, its receding edge handing off to the next tile at the grout gap
   * (see CollapsingLeaf). A tile already taller than the viewport is
   * unaffected — the collapse quietly no-ops — so this only lifts sections
   * that would otherwise rest small against the grout. Under reduced motion
   * the collapse is removed and the tile rests at its natural height.
   */
  immersive?: boolean;
  /**
   * Which corners the tile rounds. Defaults to "all" (a standalone rounded
   * tile); pass "none" or "bottom" when the tile sits inside a grouped
   * chapter slab and only the slab's ends round.
   */
  corners?: TileCorners;
  className?: string;
  children: ReactNode;
};

const surfaceClasses = {
  card: "border border-border bg-card shadow-card",
  secondary: "border border-border bg-secondary shadow-card",
  leaf: "bg-leaf text-leaf-foreground",
} as const;

/**
 * The rounded content tile of the case-study card system (after Raw
 * Materials' tiled sections): the page background stays visible as grout
 * between tiles, and every top-level module sits in one of these — or
 * renders the same recipe itself, like the artifact modules that already
 * carry `rounded-3xl border-border bg-card`. Tiles are layout surfaces
 * only; type, motion, and anchors belong to the content inside.
 */
export function Tile({
  surface = "card",
  flush = false,
  immersive = false,
  corners = "all",
  className,
  children,
}: TileProps) {
  const surfaceClassName = `${cornerClasses[corners]} ${surfaceClasses[surface]} ${
    flush ? "" : "p-6 sm:p-8 md:p-10 lg:p-12"
  } ${className ?? ""}`;

  if (immersive) {
    // Content sits at the top, where reading starts — the tile then extends
    // below to fill the screen, and that sub-fold breathing room is what the
    // collapse reclaims as the reader scrolls on. Top-anchored (not centred
    // like a divider leaf, whose poster-weight headline earns the middle) so a
    // detail list never floats with a pool of empty space above its heading,
    // and the content never drifts during the collapse — only the tile's
    // bottom edge moves, up to meet the next tile at the grout gap.
    return (
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-start ${surfaceClassName}`}
      >
        {children}
      </CollapsingLeaf>
    );
  }

  return <div className={surfaceClassName}>{children}</div>;
}
