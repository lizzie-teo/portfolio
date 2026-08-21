"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ChapterNavMasthead } from "./ChapterNavMasthead";
import { useActiveAnchor } from "../lib/use-active-anchor";
import { useAnchorScroll } from "../lib/use-anchor-scroll";
import { motionDuration, motionEase } from "../lib/motion";
import type { CaseChapter } from "./CaseStudyRail";

type ChapterMarkerProps = {
  chapters: CaseChapter[];
};

/**
 * Compact chapter control for below xl — the small-screen counterpart to the
 * ChapterDock. It speaks the dock's language: the trigger pill and expanded
 * menu are a shard of the case study's own deep-leaf material turned to liquid
 * glass (the shared `.chapter-dock-spine` / `.chapter-dock-glass` classes in
 * globals.css, tinted per project by the inherited leaf tokens), and the reader's
 * position is carried by the dock's single coral "you are here" pip rather than a
 * numbered counter. It stays a bottom-left expanding pill, not a right-edge
 * auto-hiding slab: the mobile interaction model is a tap-to-open pill, so the
 * pill persists and the menu rises above it. The pill shows the current chapter
 * (or the active subsection when one is active) as its label — orientation by
 * default, an escape hatch when needed (e.g. "skip to the outcome" mid-read).
 *
 * Appears once the reader passes the first chapter. Anchors stay real
 * `href="#id"` links with a click handler that lands on an exact 1cm offset
 * (useAnchorScroll). Escape and outside-pointer close, focus returns to the
 * trigger. Under reduced motion the disclosure is opacity-only and the pip jumps
 * between rows rather than travelling.
 */
export function ChapterMarker({ chapters }: ChapterMarkerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldReduce = useReducedMotion();
  // Shared with CaseStudyRail and ChapterDock so all three navs track the same
  // reading position (last chapter/section anchor past the upper-third line).
  const activeId = useActiveAnchor(chapters);
  // Deterministic 1cm landing on click (see useAnchorScroll).
  const handleAnchor = useAnchorScroll();

  // Active chapter = the one owning the current anchor; active subsection = that
  // anchor when it is a section rather than the chapter head.
  const activeIndex = chapters.findIndex(
    (chapter) =>
      chapter.id === activeId ||
      chapter.sections?.some((section) => section.id === activeId)
  );
  const activeSectionId = chapters[activeIndex]?.sections?.some(
    (section) => section.id === activeId
  )
    ? activeId
    : null;

  // Which chapter has its sub-list disclosed. Any chapter with sections can be
  // opened in place (reach "Sketches" inside Approach without navigating into it
  // first); the chapter the reader is inside auto-discloses, seeded whenever the
  // active chapter changes but collapsible by hand afterwards. The dock
  // deliberately no longer does this — on wide desktop it shows the full
  // contents at once — but the phone menu keeps the accordion, because eleven
  // rows will not fit a small viewport without turning the menu into a scroller.
  const activeChapterId = chapters[activeIndex]?.id;
  // Accordion: only one chapter's sub-list is open at a time. Auto-disclosing the
  // chapter the reader is inside (or opening one by hand) collapses any other, so
  // the menu never stacks two expanded chapters and outgrows its height cap into
  // a scroll — the last chapter's sections stay visible without scrolling.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!activeChapterId) {
      return;
    }
    setExpandedIds((prev) =>
      prev.has(activeChapterId) ? prev : new Set([activeChapterId])
    );
  }, [activeChapterId]);
  const toggleChapter = (id: string) =>
    setExpandedIds((prev) => (prev.has(id) ? new Set() : new Set([id])));

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

  // Sub-list disclosure. Animating height (not just opacity) grows and shrinks
  // the sub-list within the document flow, so the menu height and the chapter
  // rows below travel smoothly instead of hard-jumping when a caret is tapped —
  // and with the accordion, one chapter's collapse and another's expand reflow
  // in sync. A quicker opacity fade layers on top. Under reduced motion, height
  // is not animated (opacity only), matching how the rest of the menu degrades.
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

  // Mirrors the dock's focus treatment — a leaf-foreground ring on the leaf
  // surface so focus reads clearly on the tinted glass.
  const linkFocus =
    "outline-none focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-leaf";

  return (
    // Spans the phone edge to edge (symmetric gutters) so it reads as an
    // intentional bottom bar, not a corner pill. From sm up it caps and stays
    // left-anchored — a full-width bar at tablet/near-desktop widths would look
    // absurd, and this component runs all the way to xl. The wrapper itself is
    // click-through (pointer-events-none) so its empty right half never blocks
    // content; the bar and menu re-enable pointer events. pb carries the iOS
    // safe-area inset so the bar clears the home indicator (the one sanctioned
    // env() exception; there is no token for it).
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex flex-col items-stretch pb-[env(safe-area-inset-bottom)] sm:inset-x-6 sm:bottom-8"
    >
      <AnimatePresence>
        {open && active ? (
          <motion.div
            key="menu"
            id="chapter-marker-menu"
            initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
            animate={{ opacity: 1, y: 0, transition: enterTransition }}
            exit={{ opacity: 0, y: shouldReduce ? 0 : 8, transition: exitTransition }}
            className="chapter-dock-glass pointer-events-auto mb-3 flex max-h-[60vh] w-full flex-col rounded-2xl px-2 pt-2 text-leaf-foreground sm:max-w-sm"
          >
            {/* Site-level return, on the menu's frame rather than in its list —
                the same masthead-over-contents stack as the dock, and the same
                reason: the 60vh cap is enforced on the chapter list alone, so an
                expanded chapter scrolls beneath the way out instead of pushing
                it off the top. Reading down the stack the tiers stay in order:
                site (Selected work), page (chapters), position (the pill's own
                label). Below xl this is the reader's only persistent route back
                to site level, which is where the problem bit hardest. */}
            <ChapterNavMasthead />

            {/* The list's former top padding, moved out onto the scroll
                container as a margin: as padding it scrolled away, and a clipped
                chapter row then smeared right up against the masthead row. As a
                margin it is a fixed gutter of clean glass, so the resting gap is
                unchanged and scrolled rows always clear the site return. */}
            <nav
              aria-label="Case study chapters"
              className="mt-3 min-h-0 overflow-y-auto"
            >
              {/* Bottom padding stays on the inner list, not the scroll
                  container: Chrome/Safari drop a scroll container's
                  padding-bottom once you scroll to the end, which left the last
                  chapter (Phase 2) flush against the card's bottom edge. As list
                  padding it scrolls with the content and is always honoured. */}
              <ul className="flex flex-col pb-3">
              {chapters.map((chapter, index) => {
                  const isActive = index === activeIndex;
                  const hasSections = Boolean(chapter.sections?.length);
                  // Disclosed when active (seeded) or opened by hand via the caret.
                  const expanded = hasSections && expandedIds.has(chapter.id);
                  const sectionsId = `chapter-marker-${chapter.id}-sections`;
                  return (
                    <li key={chapter.id}>
                      <div className="flex items-center gap-1">
                        {/* Deliberately not wrapped in a heading, matching the
                            dock. These are nav links, not document structure —
                            and an h4 wrapper also pulled the labels into the
                            display face (globals.css sets h1–h6 to
                            font-heading, which inherits into the anchor), so
                            the menu set its list in Avant Garde while the dock
                            set the same list in Geist. */}
                        <a
                          href={`#${chapter.id}`}
                          aria-current={
                            activeId === chapter.id ? "location" : undefined
                          }
                          onClick={(event) => {
                            handleAnchor(event, chapter.id);
                            setOpen(false);
                          }}
                          className={`${linkFocus} flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 text-sm font-medium leading-snug text-leaf-foreground transition-colors hover:bg-black/10`}
                        >
                            <span className="flex w-2 shrink-0 items-center justify-center">
                              {isActive ? (
                                // The travelling coral "you are here" pip — the
                                // same accent and shared layoutId as the dock's, so
                                // on the rare open-while-scrolling it glides between
                                // rows (a jump under reduced motion).
                                <motion.span
                                  layoutId="chapter-dock-pip"
                                  layout={!shouldReduce}
                                  transition={{
                                    layout: {
                                      duration: shouldReduce
                                        ? 0
                                        : motionDuration.fast,
                                      ease: motionEase.inOut,
                                    },
                                  }}
                                  className="block h-4 w-1 rounded-full bg-rail-tile-active"
                                />
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
                            className={`${linkFocus} flex h-12 w-11 shrink-0 items-center justify-center rounded-lg text-leaf-foreground/70 transition-colors hover:bg-black/10 hover:text-leaf-foreground`}
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
                              const isSectionActive =
                                section.id === activeSectionId;
                              return (
                                <li key={section.id}>
                                  <a
                                    href={`#${section.id}`}
                                    aria-current={
                                      isSectionActive ? "location" : undefined
                                    }
                                    onClick={(event) => {
                                      handleAnchor(event, section.id);
                                      setOpen(false);
                                    }}
                                    // Full ink, matching the dock's sub-rows: a
                                    // dimmed tint for the inactive ones put
                                    // text-xs under the 7:1 bar (style rules
                                    // §4), and the two nav surfaces should not
                                    // set the same list two different ways.
                                    className={`${linkFocus} flex min-h-11 items-center rounded-md px-2.5 text-xs font-medium leading-snug text-leaf-foreground transition-colors hover:bg-black/10`}
                                  >
                                    {section.title}
                                  </a>
                                </li>
                              );
                            })}
                          </motion.ul>
                        ) : null}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
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
            className="chapter-dock-spine pointer-events-auto flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl px-4 text-leaf-foreground shadow-elevated outline-none ring-1 ring-leaf-foreground/10 transition-shadow focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:max-w-sm"
          >
            {/* Label cluster to the left, chevron pinned right, so the wider bar
                reads as a deliberate summary row rather than a small pill's
                contents stranded on the left. */}
            <span className="flex min-w-0 items-center gap-2.5">
              {/* Resting coral tick — the "you are here" accent. Kept a plain
                  span (no shared layoutId) so it never collides with the menu's
                  travelling pip when both are on screen. */}
              <span
                aria-hidden="true"
                className="block h-3.5 w-1 shrink-0 rounded-full bg-rail-tile-active"
              />
              <span className="truncate text-sm font-medium leading-snug">
                {(activeSection ?? active).title}
              </span>
            </span>
            <ChevronUpIcon
              aria-hidden="true"
              className={`size-4 shrink-0 text-leaf-foreground/70 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
