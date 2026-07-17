"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAnchorScroll } from "../lib/use-anchor-scroll";
import { motionDuration, motionEase } from "../lib/motion";
import { useActiveAnchor } from "../lib/use-active-anchor";
import type { CaseChapter } from "./CaseStudyRail";

/**
 * Right-edge "On this page" dock — the rail's alternate. Rather than a generic
 * floating card, the dock is a shard of the case study's own material: a solid
 * leaf slab, the same deep surface as the chapter-divider leaves and the grout
 * the rail sits on, so it belongs to the page's language instead of hovering
 * above it as a pane. Its one crafted flourish is a single coral "you are
 * here" pip — the project accent — that physically travels: it glides between
 * chapter rows as the reader scrolls (Motion `layoutId`), and at rest it is the
 * one lit tick on the resting spine. Nothing is numbered; position is carried
 * by where the pip sits.
 *
 * The dock stays out of the way and reveals on intent (macOS auto-hide-dock
 * style): a slim leaf spine rests at the right edge; pushing the cursor to the
 * edge, focusing into the nav, or tapping the spine on touch slides the full
 * slab out while its chapter labels deal in with a quick top-to-bottom
 * cascade. The current chapter expands inline to its sections (the rail's
 * open-tile behaviour). Auto-collapses on mouse-leave after a grace delay;
 * closes on Escape, on tapping a link, or on an outside tap.
 *
 * Renders at xl+ as the rail's counterpart; below xl the ChapterMarker pill
 * owns the small-screen path. Anchors stay real `href="#id"` links but a click
 * handler scrolls to an exact 1cm landing (useAnchorScroll), so the collapsing
 * leaves land consistently. Under reduced motion the reveal is opacity-only (no
 * slide, no cascade), the pip jumps rather than travels, and the anchor scroll
 * is instant.
 */
export function ChapterDock({
  chapters,
  className,
}: {
  chapters: CaseChapter[];
  className?: string;
}) {
  const shouldReduce = useReducedMotion();
  // Shared with CaseStudyRail so both patterns track the same reading position.
  const activeId = useActiveAnchor(chapters);
  // Deterministic 1cm landing on click (native jumps land inconsistently on the
  // collapsing leaves — see useAnchorScroll).
  const handleAnchor = useAnchorScroll();
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  const activeChapterIndex = chapters.findIndex(
    (chapter) =>
      chapter.id === activeId ||
      chapter.sections?.some((section) => section.id === activeId)
  );

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const reveal = () => {
    clearCloseTimer();
    setOpen(true);
  };
  const scheduleClose = () => {
    clearCloseTimer();
    // Small grace delay so a quick cursor slip past the edge doesn't retract
    // the slab mid-read. Kept open while focus is still inside (keyboard use).
    closeTimer.current = window.setTimeout(() => {
      if (
        rootRef.current &&
        rootRef.current.contains(document.activeElement)
      ) {
        return;
      }
      setOpen(false);
    }, 220);
  };

  useEffect(() => () => clearCloseTimer(), []);

  // Escape + outside-pointer close, mirroring ChapterMarker's touch handling.
  // Only bound while open; on mouse the mouse-leave path already retracts.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        spineRef.current?.focus();
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

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  };

  // The travelling coral pip. Rendered only in the active row; the shared
  // layoutId lets Motion slide it from the old row to the new one as the
  // active chapter changes on scroll (a jump under reduced motion).
  const activePip = (
    <motion.span
      layoutId="chapter-dock-pip"
      layout={!shouldReduce}
      transition={{
        layout: {
          duration: shouldReduce ? 0 : motionDuration.fast,
          ease: motionEase.inOut,
        },
      }}
      className="block h-4 w-1 rounded-full bg-rail-tile-active"
    />
  );

  const slabVariants = {
    closed: {
      opacity: 0,
      x: shouldReduce ? 0 : 20,
      transition: {
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.in,
        when: "afterChildren" as const,
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduce ? 0.01 : motionDuration.base,
        ease: motionEase.out,
        when: "beforeChildren" as const,
        delayChildren: shouldReduce ? 0 : 0.04,
        staggerChildren: shouldReduce ? 0 : 0.045,
      },
    },
  };
  const rowVariants = {
    closed: { opacity: 0, x: shouldReduce ? 0 : 10 },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
      },
    },
  };

  const linkFocus =
    "outline-none focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-leaf";

  return (
    <div
      className={`pointer-events-none fixed inset-y-0 right-0 z-30 w-80 overflow-hidden ${className ?? ""}`}
    >
      <div
        ref={rootRef}
        className="pointer-events-auto absolute inset-y-0 right-0"
        onMouseEnter={reveal}
        onMouseLeave={scheduleClose}
        onFocus={reveal}
        onBlur={handleBlur}
      >
        {/* Resting spine — a slim leaf shard carrying one tick per chapter,
            the current tick lit coral. Doubles as the touch handle. */}
        <motion.button
          ref={spineRef}
          type="button"
          // Pointer/touch handle only. Keyboard users reach the slab's links
          // directly (they sit in the tab order and reveal the dock on focus),
          // so the spine stays out of the tab sequence — it would otherwise
          // fade to invisible the moment focus opened the dock.
          tabIndex={-1}
          aria-expanded={open}
          aria-controls="chapter-dock-panel"
          aria-label={open ? "Hide chapters" : "Show chapters"}
          onClick={() => (open ? setOpen(false) : reveal())}
          initial={false}
          animate={{ opacity: open ? 0 : 1 }}
          transition={{ duration: shouldReduce ? 0.01 : motionDuration.fast }}
          style={{ pointerEvents: open ? "none" : "auto" }}
          className="chapter-dock-spine absolute right-2 top-1/2 flex -translate-y-1/2 cursor-pointer items-center rounded-full bg-grout px-2.5 py-3.5 shadow-elevated outline-none ring-1 ring-leaf-foreground/10 focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="flex flex-col items-center gap-2.5">
            {chapters.map((chapter, index) => (
              <span
                key={chapter.id}
                aria-hidden="true"
                className={`h-0.5 rounded-full transition-all duration-200 ${
                  index === activeChapterIndex
                    ? "w-4 bg-rail-tile-active"
                    : "w-3 bg-leaf-foreground/30"
                }`}
              />
            ))}
          </span>
        </motion.button>

        {/* Revealed slab — the leaf shard grown out, chapters dealt in. Always
            mounted so keyboard focus can enter it and trigger the reveal; kept
            invisible and non-interactive at rest. */}
        <motion.nav
          id="chapter-dock-panel"
          aria-label="On this page"
          initial={false}
          variants={slabVariants}
          animate={open ? "open" : "closed"}
          style={{ pointerEvents: open ? "auto" : "none" }}
          className="absolute right-3 top-1/2 max-h-[70vh] w-56 -translate-y-1/2 overflow-y-auto rounded-2xl bg-grout p-2 text-leaf-foreground shadow-elevated ring-1 ring-leaf-foreground/10"
        >
          <ul className="flex flex-col">
            {chapters.map((chapter, index) => {
              const isActive = index === activeChapterIndex;
              // The current chapter always expands to its sections; a chapter
              // flagged defaultExpanded (the deep "Approach" chapter) keeps its
              // sections visible whenever the dock is open, so its sub-steps are
              // reachable without first scrolling into it.
              const showSections =
                Boolean(chapter.sections?.length) &&
                (isActive || Boolean(chapter.defaultExpanded));
              return (
                <motion.li
                  key={chapter.id}
                  variants={rowVariants}
                  layout={!shouldReduce}
                  transition={{
                    layout: {
                      duration: motionDuration.fast,
                      ease: motionEase.inOut,
                    },
                  }}
                >
                  <a
                    href={`#${chapter.id}`}
                    aria-current={
                      activeId === chapter.id ? "location" : undefined
                    }
                    onClick={(event) => {
                      handleAnchor(event, chapter.id);
                      setOpen(false);
                    }}
                    className={`${linkFocus} flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold leading-snug transition-colors ${
                      isActive
                        ? "text-leaf-foreground"
                        : "text-leaf-foreground/55 hover:bg-leaf-foreground/5 hover:text-leaf-foreground"
                    }`}
                  >
                    <span className="flex w-2 shrink-0 items-center justify-center">
                      {isActive ? (
                        activePip
                      ) : (
                        <span className="block h-1 w-1 rounded-full bg-leaf-foreground/25" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">{chapter.title}</span>
                  </a>
                  <AnimatePresence initial={false}>
                    {showSections ? (
                      <motion.ul
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: shouldReduce ? 0.01 : motionDuration.fast,
                          ease: motionEase.out,
                        }}
                        className="mb-1 ml-[1.05rem] flex flex-col border-l border-leaf-foreground/15 pl-3"
                      >
                        {chapter.sections?.map((section) => {
                          const isSectionCurrent = activeId === section.id;
                          return (
                            <li key={section.id}>
                              <a
                                href={`#${section.id}`}
                                aria-current={
                                  isSectionCurrent ? "location" : undefined
                                }
                                onClick={(event) => {
                                  handleAnchor(event, section.id);
                                  setOpen(false);
                                }}
                                className={`${linkFocus} flex min-h-9 items-center rounded-md px-2 text-xs font-medium leading-snug transition-colors ${
                                  isSectionCurrent
                                    ? "text-leaf-foreground"
                                    : "text-leaf-foreground/50 hover:bg-leaf-foreground/5 hover:text-leaf-foreground"
                                }`}
                              >
                                {section.title}
                              </a>
                            </li>
                          );
                        })}
                      </motion.ul>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </motion.nav>
      </div>
    </div>
  );
}
