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
// LEGIBILITY IS THE WHOLE PROBLEM. The ring crosses two substrates in one loop:
// a white product screenshot, then the near-black grout of an open popup. A
// single tone reads on one and vanishes on the other, so the object carries
// both — a dark translucent pad with a dark inner hairline for the white
// screens, and a light hairline ringing it on the outside for the dark popup.
// Whichever substrate it is over, one of the two is doing the work and the other
// is quietly invisible. No tone swapping, no substrate detection.
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
      {/* The pad. The radial is lit off-centre so it reads as a soft fingertip
          catching light rather than a symmetrical target reticle. `border` sits
          inside the box and `ring` outside it, which is how one element carries
          both the dark and the light hairline. */}
      <span className="absolute inset-0 rounded-full border border-grout/40 bg-radial-[circle_at_38%_30%] from-grout/42 from-25% to-grout/12 ring-1 ring-grout-foreground/55 backdrop-blur-xs" />
      {/* The contact point. Small, and the reason the ring reads as precise:
          it names the pixel being pressed instead of gesturing at a region. */}
      <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-grout/75 ring-1 ring-grout-foreground/45" />
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
