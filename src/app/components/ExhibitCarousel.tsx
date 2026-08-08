"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { motionDuration, motionEase } from "../lib/motion";

/**
 * The paged evidence carousel: one designed exhibit per slide, with prev/next
 * controls, a dot rail that jumps directly, arrow-key paging, and a screen
 * reader equivalent that carries every slide's copy as plain text.
 *
 * Lifted verbatim out of `UsabilityFindings` once a second case-study module
 * needed the same mechanics, so the two page the same way rather than drifting
 * into two carousels with different keyboard and focus behaviour. It owns the
 * shell only: paging state, controls, animation, and the accessible
 * equivalent. Every caller supplies its own slide composition, so a section can
 * look nothing like its sibling and still behave identically.
 *
 * Motion: an `AnimatePresence` crossfade with a small directional offset at the
 * `base` token. The offset is what would be a vestibular problem, so under
 * reduced motion it collapses to zero and the swap becomes instant.
 */

export type ExhibitSlide = {
  /** Stable key; also the AnimatePresence key, so slides swap rather than morph. */
  id: string;
  /** Names this slide — the dot control's accessible name. */
  label: string;
  /** The slide itself, composed by the caller. */
  slide: ReactNode;
  /** The same content as plain text, for the screen reader equivalent. */
  summary: ReactNode;
};

type ExhibitCarouselProps = {
  /** Names the whole carousel, e.g. "Round 2 usability findings". */
  label: string;
  /**
   * What one slide is called, lowercase and singular — "finding", "comparison".
   * Builds the prev/next accessible names so they say what is being paged.
   */
  noun: string;
  items: ExhibitSlide[];
  /** Section-level layout only (e.g. pulling the carousel up under a lede). */
  className?: string;
};

const controlClassName =
  "flex min-h-11 min-w-11 items-center justify-center rounded-full border border-primary/40 bg-card text-primary outline-none transition-colors hover:border-primary/70 hover:bg-primary/10 active:bg-primary/20 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-40";

export function ExhibitCarousel({
  label,
  noun,
  items,
  className,
}: ExhibitCarouselProps) {
  const shouldReduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const atStart = index === 0;
  const atEnd = index === items.length - 1;
  const slideOffset = shouldReduce ? 0 : 24;

  const goTo = (next: number, step: number) => {
    if (next < 0 || next > items.length - 1) {
      return;
    }
    setDirection(step);
    setIndex(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft" && !atStart) {
      event.preventDefault();
      goTo(index - 1, -1);
    } else if (event.key === "ArrowRight" && !atEnd) {
      event.preventDefault();
      goTo(index + 1, 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * slideOffset }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -slideOffset }),
  };

  return (
    <section
      className={className}
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={items[index].id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: shouldReduce ? 0.01 : motionDuration.base,
              ease: motionEase.out,
            }}
          >
            {items[index].slide}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex justify-center sm:mt-8">
        <div className="flex max-w-full items-center gap-2 rounded-full border border-primary/15 bg-card p-1.5 shadow-card">
          <button
            type="button"
            aria-label={`Previous ${noun}`}
            disabled={atStart}
            onClick={() => goTo(index - 1, -1)}
            className={controlClassName}
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4" />
          </button>
          <ol className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {items.map((item, dotIndex) => {
              const isActive = dotIndex === index;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-label={item.label}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => goTo(dotIndex, dotIndex > index ? 1 : -1)}
                    className="flex min-h-11 min-w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    <span
                      className={`h-1.5 rounded-full transition-all ${
                        isActive ? "w-5 bg-primary" : "w-1.5 bg-primary/25"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            aria-label={`Next ${noun}`}
            disabled={atEnd}
            onClick={() => goTo(index + 1, 1)}
            className={controlClassName}
          >
            <ArrowRightIcon aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>

      {/* Every slide as text, for assistive tech — the accessible equivalent of
          the visual carousel, so nothing is reachable only by paging. */}
      <ol className="sr-only">
        {items.map((item) => (
          <li key={item.id}>{item.summary}</li>
        ))}
      </ol>
    </section>
  );
}
