"use client";

import { useEffect, useState } from "react";

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
 * Wide-desktop "On this page" rail: the case study's chapters as primary
 * anchors, with one level of subsection anchors beneath them, scroll-spied
 * so the reader's position is always visible. Rendered in a reserved
 * column at xl and up; below that the ChapterMarker pill provides the same
 * destinations. Anchors keep native browser behaviour — no scroll hijack —
 * and targets carry scroll-mt offsets for the sticky chrome.
 */
export function CaseStudyRail({
  chapters,
  className,
}: {
  chapters: CaseChapter[];
  className?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const activeChapter = chapters.find(
    (chapter) =>
      chapter.id === activeId ||
      chapter.sections?.some((section) => section.id === activeId)
  );

  const linkBase =
    "-ml-px flex items-center border-l-2 py-1.5 outline-none transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <div className={className}>
      <nav
        aria-label="On this page"
        className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto"
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          On this page
        </p>
        <ul className="mt-4 border-l border-border">
          {chapters.map((chapter, index) => {
            const isChapterCurrent = activeId === chapter.id;
            const isWithinChapter = chapter.id === activeChapter?.id;
            return (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  aria-current={isChapterCurrent ? "location" : undefined}
                  className={`${linkBase} gap-2.5 pl-4 text-[13px] leading-snug ${
                    isChapterCurrent
                      ? "border-primary font-medium text-foreground"
                      : isWithinChapter
                        ? "border-transparent font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium tabular-nums ${
                      isWithinChapter ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {chapter.title}
                </a>
                {chapter.sections?.length ? (
                  <ul>
                    {chapter.sections.map((section) => {
                      const isSectionCurrent = activeId === section.id;
                      return (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            aria-current={
                              isSectionCurrent ? "location" : undefined
                            }
                            className={`${linkBase} pl-9 text-xs leading-snug ${
                              isSectionCurrent
                                ? "border-primary font-medium text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {section.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
