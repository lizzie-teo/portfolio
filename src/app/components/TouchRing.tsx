"use client";

import { AnimatePresence, motion } from "motion/react";
import { motionDuration, motionEase } from "../lib/motion";

/**
 * The ring's diameter, and the reason it is 44px: this stands in for a
 * fingertip, so it is drawn at the platform's minimum touch target rather than
 * at some decorative size. On the 288px-wide phone screen that reads as a thumb
 * covering roughly a sixth of the width — the same footprint the reader's own
 * thumb would have. Every other measurement here is derived from it.
 */
export const TOUCH_RING_SIZE = 44;

export type TouchRingProps = {
  /** Contact point in screen-clip coordinates, px from the screen's top-left. */
  x: number;
  y: number;
  /**
   * Where the hand reaches in from. Read once on mount, like any Motion
   * `initial` — retargeting a mounted ring just moves it.
   */
  from?: { x: number; y: number };
  /** True between contact and release. */
  pressed: boolean;
  /** Bumped on every contact so the ripple remounts and fires again. */
  pressKey: number;
};

// The pointer for the auto-demo (see useHotspotDemo). It is deliberately a
// fingertip, not a cursor: the surface it moves over is a phone screen inside a
// bezel, and an arrow would claim the reader has a mouse they don't have on the
// only breakpoint this ever renders at. ExploreCursor is no help here — that one
// is position: fixed, tracks real pointer events, and is hard-disabled on coarse
// pointers, which is exactly the audience this has.
//
// It matches the pointer in the hero clip on this same page
// (`/assets/healthdirect/hero/prototype.mp4`): a plain circle, white hairline
// outline, translucent white inside. One page, one prototype pointer — a reader
// who has watched the hero and then reaches the decisions band should recognise
// the same hand, not meet a second convention.
//
// LEGIBILITY IS THE WHOLE PROBLEM, and white alone does not solve it: the ring
// crosses two substrates in one loop — a white product screenshot, then the
// near-black grout of an open popup. On the popup the outline carries it; on a
// white screen the outline is gone and the *shadow* is what draws the disc,
// which is exactly how the hero clip's own pointer stays visible over white
// paper. Both are always on. No tone swapping, no substrate detection.
//
// Purely decorative and inert: aria-hidden, pointer-events-none. Everything it
// demonstrates is reachable by touching the real hotspots underneath, and under
// reduced motion the hook never mounts it at all.
export function TouchRing({ x, y, from, pressed, pressKey }: TouchRingProps) {
  return (
    <motion.div
      aria-hidden="true"
      // Position is a transform on a zero-offset anchor, so travel is composited
      // and never touches layout inside the scrolling screen.
      initial={{ x: from?.x ?? x, y: from?.y ?? y, opacity: 0, scale: 0.72 }}
      animate={{ x, y, opacity: 1, scale: pressed ? 0.84 : 1 }}
      exit={{
        opacity: 0,
        scale: 0.88,
        transition: {
          duration: motionDuration.fast,
          ease: motionEase.in,
        },
      }}
      transition={{
        // Travel is the one long move here: `slow` is the explanatory-sequence
        // token, and the hook's approach/exit beats are the same value, so the
        // ring is always settled before it presses.
        x: { duration: motionDuration.slow, ease: motionEase.out },
        y: { duration: motionDuration.slow, ease: motionEase.out },
        opacity: { duration: motionDuration.fast, ease: motionEase.out },
        // Contact is a press, which is the one thing `spring` is reserved for.
        scale: motionEase.spring,
      }}
      style={{
        width: TOUCH_RING_SIZE,
        height: TOUCH_RING_SIZE,
        marginLeft: -TOUCH_RING_SIZE / 2,
        marginTop: -TOUCH_RING_SIZE / 2,
      }}
      // Above the popup layer (z-10), not below it. A pointer that disappears
      // behind the surface it is about to press stops being a pointer — and the
      // loop's dismissal beat is the ring pressing the popup's own X.
      className="pointer-events-none absolute left-0 top-0 z-20"
    >
      {/* The disc: white hairline, translucent white fill, soft drop shadow.
          Flat rather than gradient-lit — the hero clip's pointer is a plain
          circle, and a radial highlight would read as a different object at the
          same size. The shadow is not decoration: it is the only thing holding
          the disc's edge over a white screenshot. */}
      <span className="absolute inset-0 rounded-full border border-white/85 bg-white/30 shadow-elevated" />
      {/* Contact ripple, in the same action green as HOTSPOT_AFFORDANCE's wash,
          so the ring's press and the hotspot lighting up underneath it are
          visibly one event. Keyed on pressKey so a second press re-fires it
          rather than reusing a finished animation. */}
      <AnimatePresence>
        {pressed ? (
          <motion.span
            key={pressKey}
            initial={{ opacity: 0.75, scale: 0.5 }}
            animate={{
              opacity: 0,
              scale: 1.85,
              transition: {
                duration: motionDuration.slow,
                ease: motionEase.out,
              },
            }}
            exit={{
              opacity: 0,
              transition: { duration: motionDuration.instant },
            }}
            className="absolute inset-0 rounded-full border border-primary"
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
