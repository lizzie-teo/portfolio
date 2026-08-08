"use client";

/*
 * SCENE KIT — the shared parts every bespoke article scene is built from.
 *
 * A scene is an inline SVG that performs the article's idea in one gesture. It
 * renders into exactly the same plate as every other media strategy and takes
 * exactly the same treatment on top — halftone, grain, develop-on-attention — so
 * the reader never sees "this one is a scene and that one is a photograph". What
 * differs is only what is inside the box.
 *
 * TRANSFORM AND OPACITY, WITHOUT EXCEPTION. That constraint is why `DrawnLine`
 * exists at all: the reflex for drawing a line in SVG is animating
 * `stroke-dashoffset`, which is neither, and repaints the path on every frame.
 * The trick below gets an identical result on the compositor — see the component.
 *
 * TONE, NOT COLOUR. The plate greyscales its media, so a scene that composed in
 * hue would be designing something the reader will never see. These are drawn in
 * the lo-fi ink family (§3 artwork-scene-constant carve-out, borrowed from
 * `loFiInk` rather than re-invented): bright line work on the dark plate ground,
 * the same drafting register the cards already rest in.
 *
 * THREE STATES, AND ALL THREE ARE DESIGNED:
 *
 *   at rest          the opening frame. Nothing drawn yet, cursor at its start,
 *                    markers unplaced — the scene BEFORE its idea has happened,
 *                    which is what makes the development worth watching.
 *   developing       the loop.
 *   reduced motion   the CLOSING frame, held still: cursor landed, markers
 *                    placed, lateral lines drawn. Not the opening frame — a
 *                    reader who has asked for no motion should get the finished
 *                    thought, not an empty diagram waiting for an animation that
 *                    will never arrive.
 */

import { motion, type Transition } from "motion/react";
import { loFiInk } from "../../loFiInk";

/* 3:2, matching the plate. Every scene composes against this box so they can be
   swapped without re-fitting anything. */
export const SCENE_W = 300;
export const SCENE_H = 200;

/** One full pass of a scene's idea, in seconds. Shared so three scenes sitting in
    a row do not beat against each other at three different tempos. Slow enough to
    read a gesture rather than register a flicker. */
export const SCENE_LOOP = 5;

/** Ink, borrowed from the lo-fi card's set. `line` carries structure, `mark` is
    the one thing a scene wants you to look at, `faint` is everything present but
    not the point. */
export const sceneInk = {
  line: loFiInk.quiet,
  mark: loFiInk.ink,
  faint: loFiInk.draw,
  rule: loFiInk.rule,
} as const;

export const sceneLoop: Transition = {
  duration: SCENE_LOOP,
  repeat: Infinity,
  ease: "easeInOut",
};

/**
 * The SVG wrapper. `preserveAspectRatio` defaults to meet, which would letterbox
 * inside a plate that is not exactly 3:2 after the plate's develop-scale; slicing
 * instead means the scene always fills its plate the way a photograph would.
 */
export function SceneRoot({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
      preserveAspectRatio="xMidYMid slice"
      /* The plate's own ground, not a second dark grey — a scene painting its own
         would put a visible seam inside the plate. See `.develop-plate-ground` in
         globals.css for where the value comes from. */
      className="develop-plate-ground absolute inset-0 h-full w-full"
      /* Decorative, like every other plate surface: the card's accessible name
         carries the article. A scene is an illustration of an argument, never the
         argument itself. */
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/**
 * A line that draws itself using transform alone.
 *
 * THE PROBLEM. `stroke-dashoffset` is the standard way to draw an SVG line and it
 * is banned here — it is not a transform, not an opacity, and it repaints the
 * path every frame. Scaling a `<line>` directly is no better: `scaleX` on a
 * diagonal squashes its stroke as it grows, so the line gets thinner as it
 * extends, which looks exactly as wrong as it sounds.
 *
 * THE FIX. Put a HORIZONTAL rect inside a group that is translated to the start
 * point and rotated to the target angle. The rect then only ever scales along its
 * own length, in its own already-rotated coordinate space, so stroke weight is
 * constant by construction and the whole thing is one compositor transform. Works
 * at any angle, which is what lets a scene draw a diagonal without a special case.
 *
 * `transformBox: "fill-box"` is load-bearing: without it `transform-origin`
 * resolves against the SVG viewBox rather than the element, and every line would
 * grow from the top-left corner of the scene instead of from its own start.
 */
export function DrawnLine({
  from,
  to,
  progress,
  opacity = 1,
  width = 1.5,
  stroke = sceneInk.line,
  transition = sceneLoop,
}: {
  from: readonly [number, number];
  to: readonly [number, number];
  /** 0 undrawn, 1 fully drawn. Keyframe arrays welcome. */
  progress: number | number[];
  opacity?: number | number[];
  width?: number;
  stroke?: string;
  transition?: Transition;
}) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  return (
    <g transform={`translate(${x1} ${y1}) rotate(${angle})`}>
      <motion.rect
        x={0}
        y={-width / 2}
        width={length}
        height={width}
        fill={stroke}
        style={{ transformBox: "fill-box", transformOrigin: "left center" }}
        initial={false}
        animate={{ scaleX: progress, opacity }}
        transition={transition}
      />
    </g>
  );
}

/** A node in a diagram: a ring, not a disc, so a network reads as line work
    rather than as a chart. */
export function SceneNode({
  cx,
  cy,
  r,
  stroke = sceneInk.line,
  dashed = false,
  opacity = 1,
}: {
  cx: number;
  cy: number;
  r: number;
  stroke?: string;
  dashed?: boolean;
  opacity?: number;
}) {
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke={stroke}
      strokeWidth={1.5}
      strokeDasharray={dashed ? "3 3" : undefined}
      opacity={opacity}
    />
  );
}
