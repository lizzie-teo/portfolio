"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAnchorScroll } from "../lib/use-anchor-scroll";
import { motionDuration, motionEase } from "../lib/motion";
import { useActiveAnchor } from "../lib/use-active-anchor";
import { ChapterNavMasthead } from "./ChapterNavMasthead";
import type { CaseChapter } from "./CaseStudyRail";

/**
 * Right-edge "On this page" dock — the rail's alternate. Rather than a generic
 * floating card, the dock is a shard of the case study's own material: a tinted
 * "liquid glass" version of the deep leaf surface (the `.chapter-dock-glass` /
 * `.chapter-dock-spine` classes in globals.css — a soft backdrop blur with a
 * saturation boost, a specular top edge, and a light rim, all derived from the
 * inherited leaf tokens so each project tints its own glass). It reads as the
 * page's own material turned to glass, so it belongs to the page's language
 * instead of hovering above it as a generic pane. Its one crafted flourish is a
 * single coral "you are
 * here" pip — the project accent — that physically travels: it glides between
 * chapter rows as the reader scrolls (Motion `layoutId`), and at rest it is the
 * one lit tick on the resting spine. Nothing is numbered; position is carried
 * by where the pip sits.
 *
 * The dock stays out of the way and reveals on intent (macOS auto-hide-dock
 * style): a slim leaf spine rests at the right edge; pushing the cursor to the
 * edge, focusing into the nav, or tapping the spine on touch slides the full
 * slab — a tall glass capsule (rounded-full ends), the resting spine grown up —
 * out while its chapter labels deal in with a quick top-to-bottom cascade.
 * Auto-collapses on mouse-leave after a grace delay; closes on Escape, on
 * tapping a link, or on an outside tap.
 *
 * The whole table of contents is shown at once: every chapter and, beneath it,
 * every sub-section, with no caret and nothing to disclose. A dock that opens on
 * hover is already a one-gesture surface, and making the reader spend a second
 * gesture to see what is inside a chapter defeats that — worse, it hides the
 * only place the structure of the deepest chapter (The Approach and its six
 * steps) is legible. Sub-sections hang off a hairline that runs down the same
 * axis the pip travels, one step down in type and indented from their chapter,
 * so depth reads from the drawing rather than from a control. The pip travels to
 * the exact row the reader is in — a chapter row, or a sub-section row within
 * it — so it rides that hairline down into a chapter and back out.
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

  // The travelling coral pip. Rendered in exactly one row — the chapter or
  // sub-section the reader is inside — and the shared layoutId lets Motion slide
  // it from the old row to the new one as that changes on scroll (a jump under
  // reduced motion). Because sub-sections are always visible, this now descends
  // into a chapter and back out rather than stopping at chapter granularity.
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
          className="chapter-dock-spine absolute right-2 top-1/2 flex -translate-y-1/2 cursor-pointer items-center rounded-full px-2.5 py-3.5 shadow-elevated outline-none ring-1 ring-leaf-foreground/10 focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

        {/* Revealed slab — the leaf shard grown out, chapters dealt in. A
            content-sized glass card, vertically centred against the right edge,
            hugging its rows; since the full contents are always shown, the
            list's overflow-y-auto is what keeps a deep case study inside the
            70vh cap on a short viewport. Always mounted so keyboard focus can
            enter it and trigger the reveal; kept invisible and non-interactive
            at rest.

            The slab is a masthead line over a table of contents, the same
            two-tier stack as the page itself: the site return (ChapterNavMasthead)
            rides the frame while only the chapter list scrolls beneath it, so a
            long contents list can never push the way out of the page off the
            top. It sits outside the <nav aria-label="On this page">, because it
            is precisely not on this page. */}
        <motion.div
          id="chapter-dock-panel"
          initial={false}
          variants={slabVariants}
          animate={open ? "open" : "closed"}
          style={{ pointerEvents: open ? "auto" : "none" }}
          className="chapter-dock-glass absolute right-3 top-1/2 flex max-h-[70vh] w-56 -translate-y-1/2 flex-col rounded-2xl px-2 pt-2 text-leaf-foreground"
        >
          {/* First into the cascade — the top of the stack deals in first. */}
          <motion.div variants={rowVariants}>
            <ChapterNavMasthead />
          </motion.div>

          {/* The list's former top padding, moved out onto the scroll
              container as a margin: as padding it scrolled away, and a clipped
              chapter row then smeared right up against the masthead row. As a
              margin it is a fixed gutter of clean glass, so the resting gap is
              unchanged and scrolled rows always clear the site return. */}
          <nav aria-label="On this page" className="mt-2 min-h-0 overflow-y-auto">
            {/* Bottom padding stays on the inner list, not the scroll container:
                Chrome/Safari drop a scroll container's padding-bottom once
                scrolled to the end, which would leave the last chapter flush to
                the card edge. As list padding it scrolls with the content. */}
            <ul className="flex flex-col pb-2">
              {chapters.map((chapter, index) => {
                // The chapter the reader is inside, whether they are on its own
                // leaf or one of its sub-sections. It carries the pip only when
                // the chapter anchor itself is current — once the reader is in a
                // sub-section the pip travels down to that row instead.
                const isCurrentChapter = index === activeChapterIndex;
                return (
                  <motion.li key={chapter.id} variants={rowVariants}>
                    <a
                      href={`#${chapter.id}`}
                      aria-current={
                        activeId === chapter.id ? "location" : undefined
                      }
                      onClick={(event) => {
                        handleAnchor(event, chapter.id);
                        setOpen(false);
                      }}
                      className={`${linkFocus} flex min-h-12 min-w-0 items-center gap-2.5 rounded-lg px-3 text-sm leading-snug text-leaf-foreground transition-colors hover:bg-black/10 ${
                        isCurrentChapter ? "font-semibold" : "font-medium"
                      }`}
                    >
                      <span className="flex w-2 shrink-0 items-center justify-center">
                        {activeId === chapter.id ? (
                          activePip
                        ) : (
                          <span className="block h-1 w-1 rounded-full bg-leaf-foreground/25" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">{chapter.title}</span>
                    </a>
                    {chapter.sections?.length ? (
                      // Sub-sections are always present — no disclosure, no
                      // caret. Each row hangs off a hairline drawn in its own
                      // gutter column, and because that column is 32px wide the
                      // rule lands on the same 16px axis as the chapter pips
                      // above it: one continuous track for the pip to travel.
                      // The rule sits outside the link, so hover fills only the
                      // label and the track stays unbroken.
                      <ul className="mb-1 flex flex-col">
                        {chapter.sections.map((section) => {
                          const isCurrentSection = activeId === section.id;
                          return (
                            <li key={section.id} className="flex">
                              <span
                                aria-hidden="true"
                                className="relative flex w-8 shrink-0 justify-center"
                              >
                                <span className="w-px bg-leaf-foreground/20" />
                                {isCurrentSection ? (
                                  // Centred on the rule by inset-x-0 + justify
                                  // rather than a translate: a transformed
                                  // ancestor is exactly the thing that makes a
                                  // layoutId projection land wrong, and the pip
                                  // has to travel between here and the chapter
                                  // rows above. -mt-2 is half the pip's h-4.
                                  <span className="absolute inset-x-0 top-1/2 -mt-2 flex justify-center">
                                    {activePip}
                                  </span>
                                ) : null}
                              </span>
                              <a
                                href={`#${section.id}`}
                                aria-current={
                                  isCurrentSection ? "location" : undefined
                                }
                                onClick={(event) => {
                                  handleAnchor(event, section.id);
                                  setOpen(false);
                                }}
                                className={`${linkFocus} flex min-h-10 min-w-0 flex-1 items-center rounded-md px-2 text-xs leading-snug text-leaf-foreground transition-colors hover:bg-black/10 ${
                                  isCurrentSection
                                    ? "font-semibold"
                                    : "font-medium"
                                }`}
                              >
                                {section.title}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </motion.li>
                );
              })}
            </ul>
          </nav>
        </motion.div>
      </div>
    </div>
  );
}
