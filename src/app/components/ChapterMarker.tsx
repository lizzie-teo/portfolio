"use client";

import { ChevronUpIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import type { CaseChapter } from "./CaseStudyRail";

type ChapterMarkerProps = {
  chapters: CaseChapter[];
};

/**
 * Compact sticky chapter control: shows "02 / 05 — current title" once the
 * reader passes the first chapter (the active subsection's title when one is
 * active, else the chapter's), and expands into a jump list on demand.
 * Deliberately not a permanent TOC — orientation by default, escape hatch
 * when needed (e.g. "skip to the outcome" mid-interview).
 */
export function ChapterMarker({ chapters }: ChapterMarkerProps) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Active chapter = last one whose top has crossed the upper-third line;
      // active subsection = last section anchor crossed within that chapter.
      const line = window.innerHeight * 0.4;
      let next = -1;
      let nextSectionId: string | null = null;
      chapters.forEach((chapter, index) => {
        const element = document.getElementById(chapter.id);
        if (element && element.getBoundingClientRect().top <= line) {
          next = index;
          nextSectionId = null;
        }
        chapter.sections?.forEach((section) => {
          const sectionElement = document.getElementById(section.id);
          if (
            sectionElement &&
            sectionElement.getBoundingClientRect().top <= line
          ) {
            nextSectionId = section.id;
          }
        });
      });
      setActiveIndex(next);
      setActiveSectionId(nextSectionId);
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

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const active = activeIndex >= 0 ? chapters[activeIndex] : null;
  const activeSection =
    active?.sections?.find((section) => section.id === activeSectionId) ?? null;
  const enterTransition = {
    duration: shouldReduce ? 0.01 : motionDuration.fast,
    ease: motionEase.out,
  };
  const exitTransition = {
    duration: shouldReduce ? 0.01 : motionDuration.fast,
    ease: motionEase.in,
  };

  return (
    <div
      ref={rootRef}
      className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6"
    >
      <AnimatePresence>
        {open && active ? (
          <motion.nav
            key="menu"
            id="chapter-marker-menu"
            aria-label="Case study chapters"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0, transition: enterTransition }}
            exit={{ opacity: 0, y: shouldReduce ? 0 : 8, transition: exitTransition }}
            className="mb-3 max-h-[60vh] w-64 overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-elevated"
          >
            <ul>
              {chapters.map((chapter, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={chapter.id}>
                    <h4>
                      <a
                        href={`#${chapter.id}`}
                        aria-current={isActive ? "location" : undefined}
                        onClick={() => setOpen(false)}
                        className={`flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold leading-snug outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {chapter.title}
                      </a>
                    </h4>
                    {isActive && chapter.sections?.length ? (
                      <ul className="mb-1">
                        {chapter.sections.map((section) => {
                          const isSectionActive = section.id === activeSectionId;
                          return (
                            <li key={section.id}>
                              <h4>
                                <a
                                  href={`#${section.id}`}
                                  aria-current={
                                    isSectionActive ? "location" : undefined
                                  }
                                  onClick={() => setOpen(false)}
                                  className={`flex min-h-11 items-center rounded-lg py-2 pl-6 pr-3 text-[13px] font-semibold leading-snug outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                                    isSectionActive
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {section.title}
                                </a>
                              </h4>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <motion.button
            key="trigger"
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-controls="chapter-marker-menu"
            onClick={() => setOpen((current) => !current)}
            initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0, transition: enterTransition }}
            exit={{ opacity: 0, y: shouldReduce ? 0 : 8, transition: exitTransition }}
            className="flex min-h-11 items-center gap-3 rounded-full border border-border bg-card/95 px-4 shadow-card outline-none backdrop-blur-md transition-shadow hover:shadow-elevated focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="text-xs font-bold tabular-nums tracking-[0.14em]">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(chapters.length).padStart(2, "0")}
            </span>
            <span className="hidden max-w-44 truncate font-heading text-xs font-semibold text-muted-foreground sm:inline">
              {(activeSection ?? active).title}
            </span>
            <ChevronUpIcon
              aria-hidden="true"
              className={`size-3.5 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
