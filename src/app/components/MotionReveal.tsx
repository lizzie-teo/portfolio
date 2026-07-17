"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Children, type ReactNode } from "react";
import { motionDuration, motionEase } from "../lib/motion";

/* One shared in-view trigger line for every reveal on the page, so a single
   block and a staggered group start at the same scroll position and the whole
   page reveals on one rhythm. Fires when the element is 12% into view. */
const REVEAL_VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * The default single-block reveal: a quiet fade-up (opacity + 10px), `fast`
 * token, ease-out, fired once when scrolled into view and never re-run on
 * scroll-back. Reduced motion keeps the opacity fade but drops the movement
 * and collapses to instant.
 */
export function MotionReveal({ children, className, delay = 0 }: MotionRevealProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: shouldReduce ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}

type RevealTag = "div" | "ul" | "ol" | "li";

const MOTION_TAGS = {
  div: motion.div,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
} as const;

type MotionRevealGroupProps = {
  children: ReactNode;
  className?: string;
  /** Wrapper element. Match the semantics of the list you are revealing. */
  as?: RevealTag;
  /** Delay before the first child begins, e.g. to trail a heading reveal. */
  delay?: number;
};

/**
 * The grouped counterpart to MotionReveal: instead of fading a block up as one
 * object, it cascades its direct `MotionRevealItem` children so a bullet list,
 * card grid, or roadmap reveals item by item on the same fade-up. Use it
 * wherever several sibling items read as a set — the research-themes grid, the
 * roadmap, every BulletList — so grouped content shares one calm rhythm rather
 * than popping in a single slab.
 *
 * The interval sits at the site's ~0.05s stagger for short lists and tightens
 * automatically for long ones so the whole cascade always resolves inside the
 * interactive-list budget (< 500ms; see §7 Stagger budgets): with `fast`
 * (200ms) items that leaves 300ms for the stagger, so the interval is
 * `min(0.05, 0.3 / (count − 1))` — 0.05s up to seven items, tightening beyond.
 * Reduced motion drops the stagger and the movement entirely (opacity-only,
 * instant), matching MotionReveal.
 */
export function MotionRevealGroup({
  children,
  className,
  as = "div",
  delay = 0,
}: MotionRevealGroupProps) {
  const shouldReduce = useReducedMotion();
  const MotionTag = MOTION_TAGS[as];
  const count = Children.count(children);
  const interval = Math.max(
    0.02,
    Math.min(0.05, (0.5 - motionDuration.fast) / Math.max(1, count - 1)),
  );

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: shouldReduce ? 0 : delay,
        staggerChildren: shouldReduce ? 0 : interval,
      },
    },
  };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={REVEAL_VIEWPORT}
      variants={container}
    >
      {children}
    </MotionTag>
  );
}

type MotionRevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: RevealTag;
};

/**
 * One item inside a MotionRevealGroup. Carries only the fade-up variants; the
 * parent group owns the trigger and the stagger, so an item never animates on
 * its own — it must live inside a MotionRevealGroup.
 */
export function MotionRevealItem({
  children,
  className,
  as = "div",
}: MotionRevealItemProps) {
  const shouldReduce = useReducedMotion();
  const MotionTag = MOTION_TAGS[as];

  const item: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
      },
    },
  };

  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  );
}
