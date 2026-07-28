"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import { cornerClasses, type TileCorners } from "./Chapter";

type FrameStep = {
  /** Short step name, shown in the step list. */
  title: string;
  /** One decision, explained in a sentence or two. */
  caption: string;
  media: ReactNode;
};

type AnnotatedFrameProps = {
  /** What this walkthrough shows, e.g. "Assessment flow decisions". */
  label: string;
  /**
   * Which corners the tile rounds. Defaults to "all"; pass "none" or "bottom"
   * when the module sits inside a grouped chapter slab.
   */
  corners?: TileCorners;
  steps: FrameStep[];
};

/**
 * Click-stepped decision walkthrough: one screen, one decision at a time.
 * Media sits left with the step list, caption, and controls in a side rail
 * so the whole module stays within one viewport on desktop. Steps are
 * presenter-controlled (never scroll-driven) so the pacing follows the
 * narration in a live interview and stays stable while screen-sharing.
 */
export function AnnotatedFrame({
  label,
  corners = "all",
  steps,
}: AnnotatedFrameProps) {
  const [index, setIndex] = useState(0);
  const shouldReduce = useReducedMotion();
  const step = steps[index];

  const swapTransition = {
    duration: shouldReduce ? 0.01 : motionDuration.fast,
    ease: motionEase.out,
  };
  const swapExit = {
    opacity: 0,
    transition: {
      duration: shouldReduce ? 0.01 : motionDuration.instant,
      ease: motionEase.in,
    },
  };

  const controlClassName =
    "flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-40";

  return (
    <section
      aria-label={label}
      className={`${cornerClasses[corners]} border border-border bg-card p-5 shadow-card sm:p-8 md:p-10`}
    >
      <header className="flex items-center justify-between gap-4">
        <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </h3>
        <p className="text-xs font-medium tabular-nums text-muted-foreground">
          {index + 1} / {steps.length}
        </p>
      </header>

      <div className="mt-4 grid gap-5 md:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,21rem)] lg:gap-10">
        {/* Small-radius clip envelope: matches the crisp screenshot radius its
            MediaFrame steps carry, so the swap-crossfade never rounds the
            captures' corners back up to a card radius. */}
        <div className="min-w-0 self-start overflow-hidden rounded-xs">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: swapTransition }}
              exit={swapExit}
            >
              {step.media}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex min-w-0 flex-col">
          <ol className="flex flex-col gap-1">
            {steps.map((item, itemIndex) => {
              const isActive = itemIndex === index;
              return (
                <li key={item.title}>
                  <button
                    type="button"
                    aria-current={isActive ? "step" : undefined}
                    onClick={() => setIndex(itemIndex)}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="text-xs tabular-nums opacity-70">
                      {String(itemIndex + 1).padStart(2, "0")}
                    </span>
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ol>

          <div
            aria-live="polite"
            className="mt-5 border-t border-border pt-5 lg:mt-6 lg:pt-6"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: swapTransition }}
                exit={swapExit}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {step.caption}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 lg:mt-auto lg:pt-6">
            <button
              type="button"
              aria-label="Previous step"
              disabled={index === 0}
              onClick={() => setIndex((current) => Math.max(0, current - 1))}
              className={controlClassName}
            >
              <ArrowLeftIcon aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next step"
              disabled={index === steps.length - 1}
              onClick={() =>
                setIndex((current) => Math.min(steps.length - 1, current + 1))
              }
              className={controlClassName}
            >
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
