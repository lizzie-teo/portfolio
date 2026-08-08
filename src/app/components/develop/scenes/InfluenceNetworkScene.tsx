"use client";

/*
 * SCENE — "Leadership Without Authority"
 *
 * THE ARGUMENT, PERFORMED. There is a slot above the node where a parent would be,
 * and it is empty. The line up to it draws in — the reach for a mandate — and then
 * fades out, because there is nothing at the other end to hold it. What draws in
 * instead are the lateral connections, one at a time, and those hold.
 *
 * THE ORDER IS THE ARGUMENT. The upward line must be attempted FIRST and must fail
 * before a single sideways line appears. Reversed, or overlapped, the scene says
 * "influence happens sideways", which is a truism. In this order it says "influence
 * happens sideways BECAUSE there is no line from above", which is the article's
 * actual claim and the reason the empty slot is drawn at all rather than simply
 * left out.
 *
 * THE EMPTY SLOT IS DASHED AND STAYS PUT. It is the one element that never
 * animates: the absence is the premise, not an event. A slot that faded in would
 * imply the authority went away, when the point is that it was never there.
 *
 * FOUR SIBLINGS, NOT TWO. Two lateral lines read as a chain — A to B to C, which is
 * a hierarchy lying flat. Four spreading from one node reads as a network, and the
 * staggered draw gives it the quality the piece is actually about: this is work,
 * done one relationship at a time, and it takes longer than a mandate would.
 */

import { useReducedMotion } from "motion/react";
import { usePlateActive } from "../plateActive";
import { DrawnLine, SceneNode, SceneRoot, sceneInk, sceneLoop } from "./sceneKit";

const SELF = { cx: 150, cy: 122, r: 11 } as const;
const SLOT = { cx: 150, cy: 54, r: 11 } as const;

/* Siblings, and the line each one is reached by. Endpoints stop at the node edges
   rather than at centres, so no line ever crosses into a ring. */
const SIBLINGS = [
  { cx: 58, cy: 122, r: 8, from: [139, 122], to: [66, 122], at: 0 },
  { cx: 242, cy: 122, r: 8, from: [161, 122], to: [234, 122], at: 1 },
  { cx: 96, cy: 170, r: 7, from: [142, 130], to: [102, 164], at: 2 },
  { cx: 204, cy: 170, r: 7, from: [158, 130], to: [198, 164], at: 3 },
] as const;

/* THE UPWARD ATTEMPT — draws from 0.06 to 0.28, then fades out by 0.42. It is
   fully gone before the first lateral line starts at 0.44, which is the ordering
   the whole scene depends on. */
const REACH_DRAW = [0, 0.06, 0.28, 1];
const REACH_FADE = [0, 0.28, 0.42, 1];

/** Each lateral line gets its own window, 0.12 apart, all finished by 0.9 so the
    network holds complete for a beat before the reset. */
function lateralTimes(index: number) {
  const start = 0.44 + index * 0.12;
  return [0, start, Math.min(start + 0.13, 0.95), 0.95, 1];
}

export function InfluenceNetworkScene() {
  const active = usePlateActive();
  const shouldReduce = useReducedMotion();
  const run = active && !shouldReduce;
  /* Reduced motion holds the closing frame: the upward line gone, every lateral
     connection drawn. The state the article argues for, not the attempt that
     precedes it. */
  const settled = !!shouldReduce;

  return (
    <SceneRoot>
      {/* The empty slot. Dashed, quiet, and completely still. */}
      <SceneNode cx={SLOT.cx} cy={SLOT.cy} r={SLOT.r} dashed stroke={sceneInk.faint} opacity={0.55} />

      {/* THE REACH UPWARD. One line doing two things on two schedules: it grows
          between 0.06 and 0.28, then fades out between 0.28 and 0.42. They cannot
          share a keyframe timeline — the growth has to be finished before the fade
          begins, and a single `times` array would force both through the same
          stops. Motion takes a transition per animated property, which is exactly
          the seam this needs. */}
      <DrawnLine
        from={[SELF.cx, SELF.cy - SELF.r]}
        to={[SLOT.cx, SLOT.cy + SLOT.r]}
        progress={run ? [0, 0, 1, 1] : settled ? 1 : 0}
        opacity={run ? [0.5, 0.5, 0, 0] : settled ? 0 : 0.5}
        width={1.5}
        stroke={sceneInk.faint}
        transition={
          run
            ? {
                scaleX: { ...sceneLoop, times: REACH_DRAW },
                opacity: { ...sceneLoop, times: REACH_FADE },
              }
            : { duration: 0.01 }
        }
      />

      {/* THE LATERAL CONNECTIONS, one at a time, and they stay. */}
      {SIBLINGS.map((sibling) => (
        <DrawnLine
          key={`line-${sibling.cx}`}
          from={sibling.from}
          to={sibling.to}
          progress={run ? [0, 0, 1, 1, 0] : settled ? 1 : 0}
          opacity={0.85}
          width={1.5}
          stroke={sceneInk.mark}
          transition={
            run ? { ...sceneLoop, times: lateralTimes(sibling.at) } : { duration: 0.01 }
          }
        />
      ))}

      {SIBLINGS.map((sibling) => (
        <SceneNode
          key={`node-${sibling.cx}`}
          cx={sibling.cx}
          cy={sibling.cy}
          r={sibling.r}
          stroke={sceneInk.line}
          opacity={0.8}
        />
      ))}

      {/* The self node last, so it sits over every line that meets it. Filled
          rather than a ring — it is the one node the reader is standing in. */}
      <circle cx={SELF.cx} cy={SELF.cy} r={SELF.r} fill={sceneInk.mark} />
    </SceneRoot>
  );
}
