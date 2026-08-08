"use client";

/*
 * SCENE — "Figma to Code: Best Practices"
 *
 * THE ARGUMENT, PERFORMED. The piece is about structuring design files so the
 * handoff to production stops losing information. The scene is that handoff as one
 * gesture: two framed canvases, design on the left and code on the right, a cursor
 * crossing between them, and a label underneath that survives the crossing by
 * CHANGING FORM rather than by being copied. `Color/Background/Primary` becomes
 * `--color-background-primary` — the same fact, restated in the other side's
 * language, which is the whole thesis of the article in eleven characters of
 * difference.
 *
 * THE LABEL IS THE SIGNATURE and everything else is staging, so everything else
 * holds still. The canvases do not animate, the code lines do not type themselves
 * in, and the design blocks do not assemble. An earlier instinct to have the right
 * canvas fill in as the cursor landed was cut: two things moving at the same moment
 * means the reader picks one, and the one they would have picked is the wrong one.
 *
 * The crossfade is the one moment the scene asks for attention, so it is the one
 * moment anything changes.
 */

import { motion, useReducedMotion } from "motion/react";
import { usePlateActive } from "../plateActive";
import { DrawnLine, SceneRoot, sceneInk, sceneLoop } from "./sceneKit";

/* The cursor's travel, as an offset from its resting position over the left
   canvas. It lands just inside the right frame rather than at its centre — a
   cursor parked dead centre reads as a target, and this one is meant to have
   arrived somewhere and stopped. */
const TRAVEL_X = 150;
const TRAVEL_Y = -6;

/* One shared timeline, so the cursor's landing and the label's change are the
   same event rather than two things that happen to be scheduled close together.
   The cursor is still by 0.42; the label turns between 0.42 and 0.5. */
const CURSOR_TIMES = [0, 0.08, 0.42, 0.92, 1];
const LABEL_TIMES = [0, 0.42, 0.5, 0.92, 1];

export function FigmaToCodeScene() {
  const active = usePlateActive();
  const shouldReduce = useReducedMotion();
  const run = active && !shouldReduce;
  /* Reduced motion holds the CLOSING frame: cursor landed, label already
     resolved. The finished thought, not the setup for one. */
  const settled = !!shouldReduce;

  const cursor = run
    ? { x: [0, 0, TRAVEL_X, TRAVEL_X, 0], y: [0, 0, TRAVEL_Y, TRAVEL_Y, 0] }
    : { x: settled ? TRAVEL_X : 0, y: settled ? TRAVEL_Y : 0 };

  const before = run ? { opacity: [1, 1, 0, 0, 1] } : { opacity: settled ? 0 : 1 };
  const after = run ? { opacity: [0, 0, 1, 1, 0] } : { opacity: settled ? 1 : 0 };

  return (
    <SceneRoot>
      {/* THE TWO CANVASES. Same size, same weight, same distance from the centre
          line — the article's position is that these are two representations of
          one thing, not a source and a derivative, and a scene that drew the code
          frame smaller would be arguing the opposite. */}
      <Canvas x={26} label="design">
        {/* A swatch and two text lines: the smallest thing that reads as a design
            file without becoming a drawing of Figma's UI. */}
        <rect x={38} y={48} width={22} height={22} rx={2} fill={sceneInk.mark} opacity={0.9} />
        <rect x={66} y={51} width={44} height={4} rx={2} fill={sceneInk.line} opacity={0.7} />
        <rect x={66} y={61} width={30} height={4} rx={2} fill={sceneInk.line} opacity={0.45} />
        <rect x={38} y={80} width={72} height={4} rx={2} fill={sceneInk.line} opacity={0.3} />
        <rect x={38} y={90} width={52} height={4} rx={2} fill={sceneInk.line} opacity={0.3} />
      </Canvas>

      <Canvas x={174} label="code">
        {/* Indented rules of varying length. Deliberately not legible as real
            code — a scene that could be read would invite reading, and this one
            wants to be recognised in a glance and then looked past. */}
        <rect x={186} y={48} width={56} height={4} rx={2} fill={sceneInk.line} opacity={0.7} />
        <rect x={192} y={58} width={68} height={4} rx={2} fill={sceneInk.mark} opacity={0.85} />
        <rect x={192} y={68} width={40} height={4} rx={2} fill={sceneInk.line} opacity={0.45} />
        <rect x={186} y={80} width={30} height={4} rx={2} fill={sceneInk.line} opacity={0.3} />
        <rect x={186} y={90} width={62} height={4} rx={2} fill={sceneInk.line} opacity={0.3} />
      </Canvas>

      {/* The path between them, drawn once and left in place. Faint: it is the
          route, not the event. */}
      <DrawnLine
        from={[130, 74]}
        to={[174, 74]}
        progress={1}
        opacity={0.25}
        width={1}
        stroke={sceneInk.faint}
      />

      {/* THE CURSOR. Translate only — the arrow itself is a static polygon and the
          group carries all the movement. */}
      <motion.g
        initial={false}
        animate={cursor}
        transition={run ? { ...sceneLoop, times: CURSOR_TIMES } : { duration: 0.01 }}
      >
        <path
          d="M0 0 L0 13 L3.6 9.6 L6 15 L8.4 13.8 L6 8.7 L10.5 8.7 Z"
          transform="translate(70 68)"
          fill={sceneInk.mark}
        />
      </motion.g>

      {/* THE LABEL. Two lines stacked in the same place, crossfading. Both are
          `text-anchor: middle` on the scene's centre line so the swap happens in
          place rather than sliding — the point is that the name did not move, it
          changed form. Monospace because both halves of this argument are things
          you type. */}
      <g transform="translate(150 152)">
        <motion.text
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={12}
          fill={sceneInk.mark}
          initial={false}
          animate={before}
          transition={run ? { ...sceneLoop, times: LABEL_TIMES } : { duration: 0.01 }}
        >
          Color/Background/Primary
        </motion.text>
        <motion.text
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={12}
          fill={sceneInk.mark}
          initial={false}
          animate={after}
          transition={run ? { ...sceneLoop, times: LABEL_TIMES } : { duration: 0.01 }}
        >
          --color-background-primary
        </motion.text>
      </g>

      <rect x={98} y={166} width={104} height={1} fill={sceneInk.rule} opacity={0.6} />
    </SceneRoot>
  );
}

/** A framed canvas with a small caption above it. */
function Canvas({
  x,
  label,
  children,
}: {
  x: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <text
        x={x}
        y={30}
        fontFamily="var(--font-mono)"
        fontSize={8}
        letterSpacing={1.4}
        fill={sceneInk.faint}
      >
        {label.toUpperCase()}
      </text>
      <rect
        x={x}
        y={38}
        width={100}
        height={72}
        fill="none"
        stroke={sceneInk.line}
        strokeWidth={1.5}
        opacity={0.5}
      />
      {children}
    </>
  );
}
