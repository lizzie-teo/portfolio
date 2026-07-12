import type { ReactNode } from "react";

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
  className,
  children,
}: TileProps) {
  return (
    <div
      className={`rounded-3xl ${surfaceClasses[surface]} ${
        flush ? "" : "p-5 sm:p-6 md:p-8 lg:p-10"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
