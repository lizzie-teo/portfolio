"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useAnchorScroll } from "../lib/use-anchor-scroll";
import { motionDuration, motionEase } from "../lib/motion";
import { useActiveAnchor } from "../lib/use-active-anchor";

export type CaseSection = {
  id: string;
  title: string;
};

export type CaseChapter = {
  id: string;
  title: string;
  sections?: CaseSection[];
  /**
   * Dock only: keep this chapter's sections expanded whenever the dock is
   * open, not just when it is the active chapter — for a deep chapter whose
   * sub-steps should be reachable on open without scrolling into it first.
   */
  defaultExpanded?: boolean;
};

/**
 * Wide-desktop "On this page" rail, drawn as a stack of chapter tiles
 * spanning the full viewport height (after Raw Materials' section
 * stack): the tiles share the column from just below the header to the
 * viewport's bottom edge, collapsed chapters dividing the space evenly
 * with their labels anchored to the tile foot, while the chapter the
 * reader is inside expands into the project colour and carries its
 * subsection links within it. Position is expressed by which tile is
 * open — no numbering, no progress hardware. The expansion is a
 * repeated in-flow interaction, so it stays at the fast token via
 * Motion layout animation and collapses to an opacity-only change
 * under reduced motion. Collapsed tiles are clean flat wireframes: a
 * 1px grout-ink hairline (--rail-tile-border) with no fill, washing in
 * on hover. The open chapter is the single filled tile in the active
 * colour; its height scales with content, so a sectionless chapter
 * opens only a little taller than a collapsed one instead of leaving an
 * empty coloured belly. The rail is a fixed column in the content lane
 * the shell reserves from xl up; below xl the ChapterMarker pill
 * provides the same destinations. Anchors stay real `href="#id"` links
 * (deep-linkable, modified-click friendly); a click handler scrolls to an exact
 * 1cm landing so the collapsing leaves don't land inconsistently (useAnchorScroll).
 */
export function CaseStudyRail({
  chapters,
  className,
}: {
  chapters: CaseChapter[];
  className?: string;
}) {
  const shouldReduce = useReducedMotion();
  // Active-anchor detection is shared with ChapterDock so both patterns
  // track the same reading position (line = innerHeight * 0.4, last-crossed).
  const activeId = useActiveAnchor(chapters);
  // Deterministic 1cm landing on click (see useAnchorScroll).
  const handleAnchor = useAnchorScroll();

  const activeChapterIndex = chapters.findIndex(
    (chapter) =>
      chapter.id === activeId ||
      chapter.sections?.some((section) => section.id === activeId)
  );

  const labelBase =
    "text-xs font-semibold leading-snug outline-none transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2";

  return (
    <div className={className}>
      <nav
        aria-label="On this page"
        className="fixed bottom-4 right-16 top-[4.5rem] z-30 w-48 2xl:right-24"
      >
        <ul className="flex h-full flex-col gap-2">
          {chapters.map((chapter, index) => {
            const isOpen = index === activeChapterIndex;
            const openWithSections = isOpen && Boolean(chapter.sections?.length);
            return (
              <motion.li
                key={chapter.id}
                layout={!shouldReduce}
                transition={{
                  duration: motionDuration.fast,
                  ease: motionEase.out,
                }}
                className={`relative min-h-11 rounded-xl ${
                  openWithSections
                    ? "flex flex-[2.5] flex-col overflow-hidden bg-rail-tile-active px-4 pb-4 pt-3.5"
                    : isOpen
                      ? "flex-1 bg-rail-tile-active"
                      : "flex-1 border border-rail-tile-border bg-rail-tile transition-colors hover:bg-rail-tile-hover"
                }`}
              >
                {openWithSections ? (
                  <>
                    <h4 className="shrink-0">
                      <a
                        href={`#${chapter.id}`}
                        aria-current={
                          activeId === chapter.id ? "location" : undefined
                        }
                        onClick={(event) => handleAnchor(event, chapter.id)}
                        className={`${labelBase} block text-rail-tile-active-foreground focus-visible:ring-rail-tile-active-foreground focus-visible:ring-offset-rail-tile-active`}
                      >
                        {chapter.title}
                      </a>
                    </h4>
                    <AnimatePresence initial={false}>
                      {chapter.sections?.length ? (
                        <motion.ul
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: shouldReduce
                              ? 0.01
                              : motionDuration.fast,
                            ease: motionEase.out,
                          }}
                          className="mt-2.5 min-h-0 overflow-y-auto"
                        >
                          {chapter.sections.map((section) => {
                            const isSectionCurrent = activeId === section.id;
                            return (
                              <li key={section.id}>
                                <h4>
                                  <a
                                    href={`#${section.id}`}
                                    aria-current={
                                      isSectionCurrent ? "location" : undefined
                                    }
                                    onClick={(event) =>
                                      handleAnchor(event, section.id)
                                    }
                                    className={`block py-1 text-sm font-semibold leading-snug outline-none transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-rail-tile-active-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-rail-tile-active ${
                                      isSectionCurrent
                                        ? "text-rail-tile-active-foreground"
                                        : "text-rail-tile-active-foreground/85 hover:text-rail-tile-active-foreground"
                                    }`}
                                  >
                                    {section.title}
                                  </a>
                                </h4>
                              </li>
                            );
                          })}
                        </motion.ul>
                      ) : null}
                    </AnimatePresence>
                  </>
                ) : (
                  <h4 className="h-full">
                    <a
                      href={`#${chapter.id}`}
                      aria-current={
                        isOpen && activeId === chapter.id ? "location" : undefined
                      }
                      onClick={(event) => handleAnchor(event, chapter.id)}
                      className={`${labelBase} flex h-full w-full items-end rounded-xl px-4 py-3.5 focus-visible:rounded-xl ${
                        isOpen
                          ? "text-rail-tile-active-foreground focus-visible:ring-rail-tile-active-foreground focus-visible:ring-offset-rail-tile-active"
                          : "text-rail-tile-foreground focus-visible:ring-grout-foreground focus-visible:ring-offset-grout"
                      }`}
                    >
                      {chapter.title}
                    </a>
                  </h4>
                )}
              </motion.li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
