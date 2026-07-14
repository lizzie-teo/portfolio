"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, type ReactNode } from "react";

/* The open leaf owns the whole screen and overshoots it by a deliberate 10%:
   on arrival its bottom edge sits about a tenth of a viewport past the fold,
   so the screen stays fully immersed for a beat before the collapse becomes
   visible. Every section surface shares this one open height — chapter
   leaves, the cover, and short content sections alike — so any section whose
   natural height is under a viewport arrives owning the screen the same way.
   Kept as one string so the reserved scroll distance (wrapper) and the
   animated floor (leaf min-height) can never drift apart — the collapse
   stays snug only while they are equal. */
const LEAF_FULL_HEIGHT = "110svh";

type CollapsingLeafProps = {
  children: ReactNode;
  /** Surface, padding, and content-alignment classes for the leaf itself. */
  className: string;
  /**
   * Sticky pin distance from the top of the viewport, in px. All call sites
   * pass 0: a pinned leaf owns the screen while it collapses (SiteHeader
   * auto-hides on downward scroll, so nothing overlays it mid-collapse; on
   * scroll up the returning header legitimately overlays it like everything
   * else). Kept as a prop so a future leaf can pin lower if a design needs it.
   */
  pinTopPx: number;
  /**
   * Classes applied to the resting leaf only under reduced motion, where the
   * collapse is removed entirely (a large scroll-linked resize is a vestibular
   * trigger). Chapter leaves rest one full viewport (min-h-[100svh]) — no
   * overshoot, since with no collapse the extra 10% would only be dead
   * scroll; the cover rests at its natural height, so it passes nothing.
   * Content sections pass nothing either: with the collapse gone, forcing a
   * short section to fill the screen would only be dead space, so they simply
   * rest at their natural height — the immersive presence is the collapse
   * itself, which carries no information (all content stays readable without
   * it).
   */
  staticClassName?: string;
};

/**
 * A section surface that opens taller than the viewport (LEAF_FULL_HEIGHT, a
 * 10% overshoot past the fold) and shrinks to its natural content height as
 * the reader scrolls onto it. Originally the book-divider tile of the
 * case-study system (Chapter leaf, CaseStudyShell cover); short content
 * sections now share the same arrival (Tile `immersive`, ArtifactSection,
 * the self-tiled artifact modules), so every section smaller than the screen
 * owns the screen before receding. Anything whose natural content height
 * exceeds the open height never collapses — the floor wins and the pin
 * quietly becomes a no-op — which is why tall sections behave exactly as
 * plain tiles.
 *
 * Sticky-pin collapse: an outer wrapper reserves one full leaf height of
 * stable scroll distance so page layout never jumps, and the leaf inside is
 * pinned at the viewport top with its min-height scroll-linked from full to
 * zero (the natural content height is the floor). Because the wrapper height
 * and the shrink distance are both LEAF_FULL_HEIGHT, the leaf's shrinking
 * bottom tracks the wrapper's bottom exactly: it reaches its natural height at
 * the instant it unpins and scrolls away, leaving no residual grout gap.
 * Motion rides on MotionValues, so there are no per-frame React re-renders;
 * native scroll only, no snap points. Arriving from below (progress 0) renders
 * the leaf exactly as a static full-height tile; an anchor jump lands the
 * section top at its scroll margin, above the pin line, which clamps progress
 * to 0 — a full leaf whose bottom simply extends past the fold.
 *
 * Because the open leaf is 10svh taller than the screen, flex-centred content
 * would sit 5svh below the visible centre on arrival. A content wrapper
 * carries a decaying bottom margin (openAmount * 10svh) that re-centres the
 * title and lede within the first 100svh while the leaf is open, easing to
 * zero as it collapses so the resting tile is pixel identical to a plain one.
 * Top-aligned content (justify-start, the content-section variant) is
 * unaffected by this bottom margin — its content sits where reading starts
 * and never moves; only the surface's bottom edge recedes.
 */
export function CollapsingLeaf({
  children,
  className,
  pinTopPx,
  staticClassName,
}: CollapsingLeafProps) {
  const shouldReduce = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: [`start ${pinTopPx}px`, `end ${pinTopPx}px`],
  });
  // 1 at full height, 0 once the leaf has collapsed onto its content floor.
  const openAmount = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const minHeight = useMotionTemplate`calc(${openAmount} * 110svh)`;
  // Optically centres the content in the on-screen 100svh while the leaf
  // overshoots the fold; gone by the time the leaf rests.
  const contentLift = useMotionTemplate`calc(${openAmount} * 10svh)`;

  if (shouldReduce) {
    return (
      <div className={`${className} ${staticClassName ?? ""}`}>{children}</div>
    );
  }

  return (
    <div ref={wrapperRef} style={{ minHeight: LEAF_FULL_HEIGHT }}>
      <motion.div
        className={className}
        style={{ position: "sticky", top: pinTopPx, minHeight }}
      >
        <motion.div style={{ marginBottom: contentLift }}>{children}</motion.div>
      </motion.div>
    </div>
  );
}
