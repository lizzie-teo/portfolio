"use client";

import { ChevronDownIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useAnchorScroll } from "../lib/use-anchor-scroll";
import { motionDuration, motionEase } from "../lib/motion";
import { useActiveAnchor } from "../lib/use-active-anchor";
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
 * out while its chapter labels deal in with a quick top-to-bottom cascade. On
 * open the chapter the reader is currently inside auto-discloses its sub-sections,
 * and any chapter with sections carries a caret that discloses its sub-list in
 * place, so a sub-step is reachable without navigating into its chapter first.
 * The disclosure is seeded only while the dock is open, so a click on a parent
 * chapter jumps and closes without flashing its sub-list open on the way out.
 * Auto-collapses
 * on mouse-leave after a grace delay; closes on Escape, on tapping a link, or on
 * an outside tap.
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

  // Which chapter has its sub-list disclosed. Any chapter with sections can be
  // opened in place by tapping its caret (so a reader can reach "Sketches" inside
  // Approach without first navigating into Approach), and the chapter the reader
  // is currently inside auto-discloses so that reopening the dock lands on an
  // already-expanded sub-list.
  const activeChapterId = chapters[activeChapterIndex]?.id;
  // Accordion: only one chapter's sub-list is open at a time. Auto-disclosing the
  // chapter the reader is inside (or opening one by hand) collapses any other, so
  // the list never stacks two expanded chapters and outgrows the card into a
  // scroll — the last chapter's sections stay visible without scrolling.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // Seed the auto-disclosure only while the dock is open. Clicking a parent
  // chapter jumps to it and closes the dock (setOpen(false)); without the `open`
  // gate the newly-active chapter would expand its sub-list mid-close — a
  // pointless flash, since the reader is already leaving. Gating on `open` keeps
  // the reveal for where it belongs: the next time the dock opens (by hover,
  // focus, or tap) it discloses whichever chapter the reader is now inside.
  useEffect(() => {
    if (!open || !activeChapterId) {
      return;
    }
    setExpandedIds((prev) =>
      prev.has(activeChapterId) ? prev : new Set([activeChapterId])
    );
  }, [open, activeChapterId]);
  const toggleChapter = (id: string) =>
    setExpandedIds((prev) => (prev.has(id) ? new Set() : new Set([id])));

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

  // Sub-list disclosure. Animating height (not just opacity) grows and shrinks
  // the sub-list within the document flow, so the chapter rows below travel
  // smoothly instead of snapping when a caret is tapped — and with the accordion,
  // one chapter's collapse and another's expand reflow in sync. A quicker opacity
  // fade layers on top. Under reduced motion, height is not animated (opacity
  // only), matching how the rest of the dock degrades.
  const sublistDisclosure = shouldReduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.01 },
      }
    : {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto", opacity: 1 },
        exit: { height: 0, opacity: 0 },
        transition: {
          height: { duration: motionDuration.base, ease: motionEase.inOut },
          opacity: { duration: motionDuration.fast, ease: motionEase.out },
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
            hugging its rows; the internal overflow-y-auto handles the taller
            case when a chapter is expanded. Always mounted so keyboard focus can
            enter it and trigger the reveal; kept invisible and non-interactive
            at rest. */}
        <motion.nav
          id="chapter-dock-panel"
          aria-label="On this page"
          initial={false}
          variants={slabVariants}
          animate={open ? "open" : "closed"}
          style={{ pointerEvents: open ? "auto" : "none" }}
          className="chapter-dock-glass absolute right-3 top-1/2 max-h-[70vh] w-56 -translate-y-1/2 overflow-y-auto rounded-2xl px-2 text-leaf-foreground"
        >
          {/* Vertical padding on the inner list, not the scroll container:
              Chrome/Safari drop a scroll container's padding-bottom once scrolled
              to the end, which would leave the last chapter flush to the card
              edge. As list padding it scrolls with the content. */}
          <ul className="flex flex-col py-2">
            {chapters.map((chapter, index) => {
              const isActive = index === activeChapterIndex;
              const hasSections = Boolean(chapter.sections?.length);
              // Disclosed when the reader is inside it (auto, seeded above) or
              // when they have opened it by hand via the caret. defaultExpanded
              // is deliberately no longer read here.
              const expanded = hasSections && expandedIds.has(chapter.id);
              const sectionsId = `${chapter.id}-sections`;
              return (
                <motion.li key={chapter.id} variants={rowVariants}>
                  <div className="flex items-center gap-1">
                    <a
                      href={`#${chapter.id}`}
                      aria-current={
                        activeId === chapter.id ? "location" : undefined
                      }
                      onClick={(event) => {
                        handleAnchor(event, chapter.id);
                        setOpen(false);
                      }}
                      className={`${linkFocus} flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 text-sm font-semibold leading-snug text-leaf-foreground transition-colors hover:bg-black/10`}
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
                    {hasSections ? (
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={sectionsId}
                        aria-label={`${expanded ? "Hide" : "Show"} sections in ${chapter.title}`}
                        onClick={() => toggleChapter(chapter.id)}
                        className={`${linkFocus} flex h-12 w-9 shrink-0 items-center justify-center rounded-lg text-leaf-foreground/70 transition-colors hover:bg-black/10 hover:text-leaf-foreground`}
                      >
                        <ChevronDownIcon
                          aria-hidden="true"
                          className={`size-4 transition-transform ${
                            expanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    ) : null}
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded ? (
                      <motion.ul
                        key="sections"
                        id={sectionsId}
                        {...sublistDisclosure}
                        className="mb-1 ml-[1.05rem] flex flex-col overflow-hidden pl-3"
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
                                className={`${linkFocus} flex min-h-10 items-center rounded-md px-2.5 text-xs font-medium leading-snug text-leaf-foreground transition-colors hover:bg-black/10`}
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
