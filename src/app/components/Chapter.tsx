import type { ReactNode } from "react";
import { CollapsingLeaf } from "./CollapsingLeaf";
import { MotionReveal } from "./MotionReveal";

type ChapterProps = {
  /** Anchor id — must match the id passed to ChapterMarker. */
  id: string;
  /** Short wayfinding title, shown in the chapter label and ChapterMarker. */
  title: string;
  /**
   * The speakable opening statement — one sentence you would say out loud.
   * It carries the leaf: a reader who only reads the ledes should still get
   * the whole story. Omit only when the chapter title alone can hold the
   * page.
   */
  lede?: string;
  /**
   * Corner rounding for the leaf surface. Defaults to "all" (a standalone
   * rounded leaf); pass "top" when the chapter is grouped into a slab and the
   * leaf caps its top.
   */
  leafCorners?: TileCorners;
  children?: ReactNode;
};

/* The grout of the case-study card system: one spacing rhythm between every
   tile on the page, so the page background reads as a continuous grid gap.
   Chapters, tiles inside chapters, and the shell-level stack all use this. */
export const tileGap = "space-y-2 md:space-y-3";

/* Wider grout between chapter slabs and standalone panels at the page level,
   so each chapter reads as one grouped block with its own cap corners rather
   than a loose stack of equal tiles. Intra-chapter tiles keep the tighter
   tileGap. The gap is a page-level breathing rhythm, so it keeps scaling
   through the desktop breakpoints (a smaller step on mobile, a larger one on
   wide desktop) rather than plateauing at md. */
export const chapterGap =
  "space-y-10 md:space-y-16 lg:space-y-20 xl:space-y-24";

/**
 * Which corners a tile surface rounds. When chapters are grouped into one
 * slab the first panel (the leaf) caps the top, the last section caps the
 * bottom, and everything between is square, so the run reads as a single
 * shape. Standalone tiles outside a chapter stay fully rounded ("all"), which
 * is the default everywhere else on the site. Chapter caps use a larger
 * radius than a standalone tile so the whole slab reads as one bigger shape.
 */
export type TileCorners = "all" | "top" | "bottom" | "none";

export const cornerClasses: Record<TileCorners, string> = {
  all: "rounded-3xl",
  top: "rounded-t-4xl",
  bottom: "rounded-b-4xl",
  none: "",
};

/**
 * A narrative chapter in the tiled card system (after Raw Materials' Volta
 * case study). It opens on its leaf — a dark rounded tile in the project's
 * leaf tokens holding only the chapter title and its lede, the card-system
 * version of a book chapter's divider page. The leaf opens at full viewport
 * height and collapses to its natural title+lede height as the reader scrolls
 * onto it (see CollapsingLeaf); it is followed by the chapter's content as a
 * stack of rounded tiles separated by grout, each child either wrapped in
 * `Tile` or rendering the same tile recipe itself (EngineAudit, IaFlow,
 * ArtifactSection, …). Native scroll only — the collapse is scroll-linked, not
 * a snap. Scrolling in or jumping to a chapter anchor both land the reader on
 * a full leaf.
 */
export function Chapter({
  id,
  title,
  lede,
  leafCorners = "all",
  children,
}: ChapterProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-20 ${tileGap}`}
    >
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-center ${cornerClasses[leafCorners]} bg-leaf px-5 py-16 sm:px-8 md:px-12 lg:px-16`}
        staticClassName="min-h-[100svh]"
      >
        {lede ? (
          <>
            <MotionReveal>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-leaf-foreground/70">
                {title}
              </p>
            </MotionReveal>
            <MotionReveal delay={0.05}>
              <h2
                id={`${id}-heading`}
                className="mt-5 max-w-[26ch] text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-leaf-foreground"
              >
                {lede}
              </h2>
            </MotionReveal>
          </>
        ) : (
          <MotionReveal>
            <h2
              id={`${id}-heading`}
              className="max-w-[26ch] text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-leaf-foreground"
            >
              {title}
            </h2>
          </MotionReveal>
        )}
      </CollapsingLeaf>
      {children ? <div className={tileGap}>{children}</div> : null}
    </section>
  );
}
