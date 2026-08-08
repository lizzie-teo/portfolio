"use client";

/*
 * SCENE — "How a UX QA Custom Agent Changed the Way I Test"
 *
 * THE ARGUMENT, PERFORMED. An agent looking at an interface and finding things. A
 * scan line crosses one viewport of UI blocks top to bottom, and each block picks
 * up a marker as the line reaches it. The line finishes, the markers hold, and the
 * whole thing resets.
 *
 * THE MARKERS ARE PINNED TO ELEMENTS, not scattered across the frame, and that is
 * the difference between "an agent read this screen" and "something scanned past
 * this screen". Each one sits on its block's top-right corner, which is where an
 * annotation goes in every review tool anyone has used, so the scene reads as
 * findings rather than as decoration.
 *
 * THE STAGGER IS DERIVED, NOT AUTHORED. Every marker's appearance is computed from
 * where its block actually sits under the sweep (`markerTimes` below), so a block
 * moved in the layout keeps its marker in sync automatically. Hand-tuned delays
 * would drift out of step the first time this artwork is edited, and a marker that
 * lands before the line reaches it breaks the only causal claim the scene makes.
 *
 * WHAT IT DELIBERATELY DOES NOT SHOW: a verdict. No ticks, no crosses, no counts.
 * The article is about where judgement still sits, and a scene that scored the
 * screen would be making the opposite argument to the one it illustrates.
 */

import { motion, useReducedMotion } from "motion/react";
import { usePlateActive } from "../plateActive";
import { SceneRoot, sceneInk, sceneLoop } from "./sceneKit";

/* The viewport being examined. */
const VIEW = { x: 30, y: 24, w: 240, h: 152 } as const;

/* The blocks, and therefore the findings — one marker per block, pinned to its
   top-right corner. Order in this array is irrelevant; the sweep decides. */
const BLOCKS = [
  { x: 44, y: 40, w: 212, h: 16, weight: 0.55 },
  { x: 44, y: 68, w: 98, h: 44, weight: 0.3 },
  { x: 158, y: 68, w: 98, h: 44, weight: 0.3 },
  { x: 44, y: 124, w: 212, h: 14, weight: 0.3 },
  { x: 44, y: 148, w: 58, h: 16, weight: 0.55 },
] as const;

/** Fraction of the loop spent sweeping. The rest is the hold and the reset — the
    findings need to sit still long enough to register as findings. */
const SWEEP_END = 0.6;
const HOLD_END = 0.9;

/**
 * When a block's marker lands: the moment the sweep line crosses its top edge,
 * expressed as a fraction of the loop. Clamped away from 0 and 1 so no marker is
 * ever mid-transition at the loop boundary, where it would flicker on the wrap.
 */
function markerTimes(blockY: number) {
  const crossed = ((blockY - VIEW.y) / VIEW.h) * SWEEP_END;
  const at = Math.min(Math.max(crossed, 0.02), SWEEP_END);
  return [0, at, Math.min(at + 0.05, SWEEP_END + 0.05), HOLD_END, 1];
}

export function UxQaAgentScene() {
  const active = usePlateActive();
  const shouldReduce = useReducedMotion();
  const run = active && !shouldReduce;
  /* Reduced motion holds the closing frame: every finding placed, the sweep line
     gone. The result of the pass, not the start of it. */
  const settled = !!shouldReduce;

  return (
    <SceneRoot>
      {/* The viewport frame and its chrome bar. Static — this is the thing being
          looked at, and it does not participate. */}
      <rect
        x={VIEW.x}
        y={VIEW.y}
        width={VIEW.w}
        height={VIEW.h}
        fill="none"
        stroke={sceneInk.line}
        strokeWidth={1.5}
        opacity={0.5}
      />
      {[38, 46, 54].map((cx) => (
        <circle key={cx} cx={cx} cy={32} r={2} fill={sceneInk.faint} opacity={0.7} />
      ))}

      {BLOCKS.map((block) => (
        <rect
          key={`${block.x}-${block.y}`}
          x={block.x}
          y={block.y}
          width={block.w}
          height={block.h}
          rx={2}
          fill={sceneInk.line}
          opacity={block.weight * 0.4}
        />
      ))}

      {/* THE SWEEP. One translate down the viewport, then gone. It fades out at
          the end of its pass rather than snapping back to the top: a line that
          teleports upward reads as a second sweep starting, which would break the
          "one pass, then the findings hold" beat the whole scene is built on. */}
      <motion.g
        initial={false}
        animate={
          run
            ? { y: [0, VIEW.h, VIEW.h, 0], opacity: [0.9, 0.9, 0, 0] }
            : { y: settled ? VIEW.h : 0, opacity: settled ? 0 : 0.9 }
        }
        transition={
          run
            ? /* LINEAR, unlike every other motion in the set. The shared loop
                 eases in and out, which is right for a cursor (a hand accelerates
                 and settles) and wrong for a machine reading a screen — an easing
                 scan line looks like it is deciding where to slow down. Constant
                 speed is what makes it read as a pass rather than a gesture, and
                 it also keeps the derived marker times honest: `markerTimes` maps
                 position to time linearly, so any other curve would drift the
                 markers out of step with the line that is supposed to be causing
                 them. */
              { ...sceneLoop, ease: "linear", times: [0, SWEEP_END, SWEEP_END + 0.06, 1] }
            : { duration: 0.01 }
        }
      >
        <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={1.5} fill={sceneInk.mark} />
      </motion.g>

      {/* THE FINDINGS. Opacity plus a small scale so each one lands rather than
          fades up — a marker that eases in reads as a hover state, and one that
          pops reads as something being noticed. */}
      {BLOCKS.map((block) => {
        const times = markerTimes(block.y);
        return (
          <motion.g
            key={`marker-${block.x}-${block.y}`}
            initial={false}
            animate={
              run
                ? { opacity: [0, 0, 1, 1, 0], scale: [0.4, 0.4, 1, 1, 0.4] }
                : { opacity: settled ? 1 : 0, scale: settled ? 1 : 0.4 }
            }
            transition={run ? { ...sceneLoop, times } : { duration: 0.01 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <circle
              cx={block.x + block.w}
              cy={block.y}
              r={4.5}
              fill={sceneInk.mark}
              opacity={0.95}
            />
            <circle
              cx={block.x + block.w}
              cy={block.y}
              r={8}
              fill="none"
              stroke={sceneInk.mark}
              strokeWidth={1}
              opacity={0.4}
            />
          </motion.g>
        );
      })}
    </SceneRoot>
  );
}
