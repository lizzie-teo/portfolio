import type { ReactNode } from "react";
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
  children?: ReactNode;
};

/* The grout of the case-study card system: one spacing rhythm between every
   tile on the page, so the page background reads as a continuous grid gap.
   Chapters, tiles inside chapters, and the shell-level stack all use this. */
export const tileGap = "space-y-3 md:space-y-4";

/**
 * A narrative chapter in the tiled card system (after Raw Materials' Volta
 * case study). It opens on its leaf — a near-viewport-height dark rounded
 * tile in the project's leaf tokens holding only the chapter title and its
 * lede, the card-system version of a book chapter's divider page — and is
 * followed by the chapter's content as a stack of rounded tiles separated
 * by grout, each child either wrapped in `Tile` or rendering the same tile
 * recipe itself (EngineAudit, IaFlow, ArtifactSection, …). Everything
 * scrolls natively; no sticky layers, no full-bleed sheets. Jumping to a
 * chapter anchor lands the reader on its leaf.
 */
export function Chapter({ id, title, lede, children }: ChapterProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-20 ${tileGap}`}
    >
      <div className="flex min-h-[calc(100svh-6.5rem)] flex-col justify-center rounded-3xl bg-leaf px-5 py-16 sm:px-8 md:px-12 lg:px-16">
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
      </div>
      {children ? <div className={tileGap}>{children}</div> : null}
    </section>
  );
}
