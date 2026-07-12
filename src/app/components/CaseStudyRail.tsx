"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

export type CaseSection = {
  id: string;
  title: string;
};

export type CaseChapter = {
  id: string;
  title: string;
  sections?: CaseSection[];
};

/**
 * Wide-desktop "On this page" rail, drawn as a stack of chapter tiles
 * spanning the full viewport height (after Raw Materials' section
 * stack): the tiles share the column from just below the header to the
 * viewport's bottom edge, collapsed chapters dividing the space evenly
 * with their labels anchored to the tile foot, while the chapter the
 * reader is inside expands taller into the project colour and carries
 * its subsection links within it. Position is expressed by which tile
 * is open — no numbering, no progress hardware. The expansion is a
 * repeated in-flow interaction, so it stays at the fast token via
 * Motion layout animation and collapses to an opacity-only change
 * under reduced motion. The rail is a fixed column in the content
 * lane the shell reserves from xl up; below xl the ChapterMarker pill
 * provides the same destinations. Anchors keep native browser
 * behaviour — no scroll hijack.
 */
export function CaseStudyRail({
  chapters,
  className,
}: {
  chapters: CaseChapter[];
  className?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const ids = chapters.flatMap((chapter) => [
      chapter.id,
      ...(chapter.sections ?? []).map((section) => section.id),
    ]);
    let frame = 0;
    const update = () => {
      frame = 0;
      // Active anchor = last one whose top has crossed the upper-third line.
      const line = window.innerHeight * 0.4;
      let next: string | null = null;
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line) {
          next = id;
        }
      }
      setActiveId(next);
    };
    const requestUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [chapters]);

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
            return (
              <motion.li
                key={chapter.id}
                layout={!shouldReduce}
                transition={{
                  duration: motionDuration.fast,
                  ease: motionEase.out,
                }}
                className={`min-h-11 rounded-xl shadow-card ${
                  isOpen
                    ? "flex flex-[2.5] flex-col overflow-hidden bg-rail-tile-active px-4 pb-4 pt-3.5"
                    : "flex-1 bg-rail-tile transition-colors hover:bg-rail-tile-hover"
                }`}
              >
                {isOpen ? (
                  <>
                    <h4 className="shrink-0">
                      <a
                        href={`#${chapter.id}`}
                        aria-current={
                          activeId === chapter.id ? "location" : undefined
                        }
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
                                    className={`block py-1 text-[13px] font-semibold leading-snug outline-none transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-rail-tile-active-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-rail-tile-active ${
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
                      className={`${labelBase} flex h-full w-full items-end rounded-xl px-4 py-3.5 text-rail-tile-foreground focus-visible:rounded-xl focus-visible:ring-grout-foreground focus-visible:ring-offset-grout`}
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
