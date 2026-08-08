"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";

/* Artwork colours for this card's scene, not shell tokens: a deep teal field
   carrying near-white type. The field is pulled from the Healthdirect teal
   family in theme.css (grout #10262f, leaf #183947) so the card reads as the
   product's deep teal air without importing the case-study token scope onto
   the neutral home grid. Hook type is white on the deep teal (white on #0e2932
   is ~15:1). */
const FIELD = "#0e2932";
/* Near-white halftone ink with a whisper of the field hue (see cover-effects). */
const DOT_INK = "#EAF5F2";

/* Halftone grid: the resting flat teal field is broken into a fixed dot matrix
   whose dot size follows a synthesized teal-field luminance. With no video to
   film, the dots read as the teal card itself breaking into a screen of specks
   that then scatter into the hook line.

   COARSE ON PURPOSE. This ran at 92 columns and the dissolve read as television
   snow: at that ruling a dot is a few pixels across, neighbouring dots touch for
   the whole flight, and a random-angle scatter of seven thousand specks is
   statistically a uniform re-shuffle — the field turns to noise and then fades,
   and no individual dot is ever seen travelling. Halving the ruling is what buys
   the flight back: each speck is a legible object, the ground shows between
   them at rest, and gaps open as they leave. See the trail note below for the
   other half of the fix.

   THE RULING IS A CELL SIZE, NOT A COLUMN COUNT. A fixed GRID_COLS makes the
   screen get FINER as the artwork gets smaller, which is backwards: a halftone
   ruling is a property of the press, not of the print's size. It is also what
   made the small instances the worst ones — at 92 columns a 290px card cover ran
   3px cells, well below the size at which an eye can follow one speck. So the
   column count is derived from the container's CSS width to hold the cell near
   CELL_PX, clamped at both ends so a narrow card still reads as a screen rather
   than a chequerboard and a wide plate does not turn back into noise. Measured:
   a 970px feature plate lands 60 columns (16px cells), a 290px card 28 (10px),
   against 10px and 3px before. */
const CELL_PX = 13;
const MIN_COLS = 28;
const MAX_COLS = 60;
const LUM_CUTOFF = 0.06;
const DOT_MAX = 0.6;

/* Hover sequence: the resting flat field crossfades into the dot screen, then
   the dots scatter into the hook line. Hover-out reverses the same ramps from
   wherever they are, so rapid hovers retarget mid-flight instead of queueing.
   An expressive card scene, so the scatter runs past the 300ms UI-response
   tokens like the ParticleDissolve hero does. */
const DOTIFY_MS = 300;
const SCATTER_MS = 800;
/* Portion of scatter progress used to stagger dots, and how far each dot drifts
   while scattered, as a portion of card width. The drift more than doubled in
   the same pass that coarsened the grid: at 0.16 a dot travelled roughly its own
   width before its alpha had spent itself, so the break-up was a fade dressed as
   a scatter. DRIFT_MIN and DRIFT_SPREAD widen the per-dot magnitude range
   (0.25x to 1.2x of SCATTER_DRIFT, against a former 0.4x to 1.0x) so some dots
   plainly outrun others and the field opens unevenly instead of expanding as one
   sheet. */
const SCATTER_DELAY = 0.5;
const SCATTER_DRIFT = 0.36;
const DRIFT_MIN = 0.25;
const DRIFT_SPREAD = 0.95;

/* MOTION TRAIL — the cue that actually says "flying".
   A dot drawn as a circle at a new position each frame is a dot that has MOVED;
   it never reads as a dot that is MOVING. So each dot in flight is drawn as a
   round-capped capsule swept back along its own drift vector, the length
   proportional to its instantaneous speed — a smear, exactly as a camera would
   record it. Position is drift x (1 - easeOutCubic(local)), so the speed factor
   is the derivative 3(1 - local)^2: zero while the dot sits in the assembled
   halftone (so the rest state is untouched, perfect circles) and largest as it
   accelerates away. TRAIL_SCALE converts that into a fraction of the dot's own
   drift vector, which means the trail always points where the dot is going —
   the thing that makes each cover's direction (even burst here, sweep on AP+,
   ping on Macquarie) legible rather than an assertion in a comment.

   It is drawn as a COMET, not a capsule: the smear is stroked at TRAIL_ALPHA of
   the dot's own alpha and the dot is then filled at full alpha on top, so the
   head stays a crisp speck with a soft wake behind it. A uniform-alpha capsule
   was tried first and read as a field of tic-tacs — the eye takes an evenly lit
   elongated shape as an OBJECT of that shape, not as a moving round one. The
   wake is also NARROWER than the head (TRAIL_WIDTH), for the same reason: an
   equal-width wake still silhouettes as a capsule however faint it is, while a
   wake at two thirds the head's width silhouettes as a taper. The length is
   capped at TRAIL_MAX_R dot radii so a fast dot smears rather than turning into
   a dash. */
const TRAIL_SCALE = 0.022;
const TRAIL_ALPHA = 0.3;
const TRAIL_WIDTH = 0.62;
const TRAIL_MAX_R = 3;

/* Hook-line cascade from .docs/style-rules.md: `slow` items, 0.06s interval. */
const LINE_STAGGER = 0.06;

type Scene = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  /* Synthesized teal-field luminance per cell (0..1). */
  field: Float32Array;
  /* dx, dy, delay per dot. */
  scatter: Float32Array;
};

type SymptomCheckerCoverProps = {
  /** Card hover state, owned by the parent link/card; drives the dissolve. */
  hovered?: boolean;
  className?: string;
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** Rises out of an overflow mask; exit is handled by the parent overlay. */
function RiseLine({ order, children }: { order: number; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden pb-[0.08em]">
      <motion.div
        initial={{ y: "115%" }}
        animate={{ y: "0%" }}
        transition={{
          duration: motionDuration.slow,
          ease: motionEase.out,
          delay: order * LINE_STAGGER,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * A soft teal-field luminance at grid coordinate (u, v) in [0, 1]. Brighter
 * toward the upper-left where a soft light sits, so the halftone has gentle
 * life rather than a flat dot grid, while staying above LUM_CUTOFF everywhere
 * (no cells drop out — the whole teal card dissolves, evenly).
 */
function fieldLum(u: number, v: number): number {
  const glow = 0.9 - Math.hypot(u - 0.28, v - 0.34); // soft light upper-left
  const base = 0.42 + 0.16 * (1 - v) + 0.1 * (1 - u) + 0.14 * Math.max(0, glow);
  return Math.min(0.85, Math.max(0.28, base));
}

/**
 * Cover for the Healthdirect Symptom Checker card. At rest it is a plain deep
 * teal panel (the card's title and tagline live below it on the light card).
 * Hovering the card crossfades the flat field into a halftone of teal-white
 * dots that scatter into the hook line "How sick is too sick?", reversible
 * mid-flight. Reduced motion crossfades the hook over the still teal field.
 */
export function SymptomCheckerCover({
  hovered = false,
  className,
}: SymptomCheckerCoverProps) {
  const shouldReduce = useReducedMotion();
  const reduce = !!shouldReduce;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  /* Sequenced hover ramps: dotify crossfades flat field -> dot screen, scatter
     moves the assembled dots out to the hook line. */
  const dotifyRef = useRef(0);
  const scatterRef = useRef(0);
  const hoveredRef = useRef(hovered);
  const showHookRef = useRef(false);

  const [showHook, setShowHook] = useState(false);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = containerRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (sceneRef.current && sceneRef.current.w === w && sceneRef.current.h === h) return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Ruling from the CSS width, not the device-pixel width, so the cell stays
       the same physical size on a retina screen (see CELL_PX). */
    const cols = Math.max(
      MIN_COLS,
      Math.min(MAX_COLS, Math.round(rect.width / CELL_PX)),
    );
    const cellW = w / cols;
    const rows = Math.max(1, Math.round(h / cellW));

    /* Precompute the static teal-field luminance per cell — no per-frame
       sampler canvas is needed now that the source is synthesized, not a film. */
    const field = new Float32Array(cols * rows);
    const scatter = new Float32Array(cols * rows * 3);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        field[i] = fieldLum((col + 0.5) / cols, (row + 0.5) / rows);
        const angle = Math.random() * Math.PI * 2;
        const dist = (DRIFT_MIN + Math.random() * DRIFT_SPREAD) * SCATTER_DRIFT * w;
        scatter[i * 3] = Math.cos(angle) * dist;
        scatter[i * 3 + 1] = Math.sin(angle) * dist;
        scatter[i * 3 + 2] = Math.random() * SCATTER_DELAY;
      }
    }

    sceneRef.current = { ctx, w, h, cols, rows, cellW, cellH: h / rows, field, scatter };
  }, []);

  /* Draws one halftone frame; settle=1 is fully assembled, lower values move
     each dot toward its scatter offset on its own staggered schedule. `dir` is
     +1 while the dots are flying out and -1 while they are flying home on
     hover-out: the motion smear has to lie BEHIND the direction of travel, and
     on the way home that is the far side of the dot, not the near one. Without
     it a reversed dissolve draws every wake pointing the way the dot is going. */
  const drawFrame = useCallback((settle: number, dir: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const { ctx, w, h, cols, rows, cellW, cellH, field, scatter } = scene;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = DOT_INK;
    ctx.strokeStyle = DOT_INK;
    ctx.lineCap = "round";
    const maxRadius = cellW * DOT_MAX;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const lum = field[i];
        if (lum < LUM_CUTOFF) continue;
        const local =
          settle >= 1
            ? 1
            : Math.min(
                1,
                Math.max(0, (settle - scatter[i * 3 + 2]) / (1 - SCATTER_DELAY)),
              );
        if (local <= 0) continue;
        const eased = easeOutCubic(local);
        const dx = scatter[i * 3];
        const dy = scatter[i * 3 + 1];
        const x = (col + 0.5) * cellW + dx * (1 - eased);
        const y = (row + 0.5) * cellH + dy * (1 - eased);
        const radius = maxRadius * Math.sqrt(lum) * (0.6 + 0.4 * eased);
        const alpha = Math.sqrt(eased) * (0.3 + 0.7 * lum);
        /* Speed as a fraction of the drift vector (see TRAIL_SCALE): zero at
           rest, largest as the dot accelerates out, so the smear appears only
           once the dot is actually travelling. */
        const speed = 3 * (1 - local) ** 2 * TRAIL_SCALE * dir;
        let tx = dx * speed;
        let ty = dy * speed;
        const trail = Math.hypot(tx, ty);
        const cap = radius * TRAIL_MAX_R;
        if (trail > cap) {
          tx = (tx / trail) * cap;
          ty = (ty / trail) * cap;
        }
        if (trail > 1) {
          ctx.globalAlpha = alpha * TRAIL_ALPHA;
          ctx.lineWidth = radius * 2 * TRAIL_WIDTH;
          ctx.beginPath();
          ctx.moveTo(x - tx, y - ty);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }, []);

  /* Hover loop: ramps dotify then scatter toward the hovered target,
     reverses on hover-out, and stops itself once fully back at the flat field.
     The dot canvas opacity is set imperatively to avoid re-renders. */
  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setup();

    let last: number | null = null;

    const step = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        runningRef.current = false;
        rafRef.current = null;
        return;
      }
      const dt = last === null ? 16 : Math.min(64, now - last);
      last = now;

      let dotify = dotifyRef.current;
      let scatter = scatterRef.current;
      if (hoveredRef.current) {
        if (dotify < 1) dotify = Math.min(1, dotify + dt / DOTIFY_MS);
        else scatter = Math.min(1, scatter + dt / SCATTER_MS);
      } else if (scatter > 0) {
        scatter = Math.max(0, scatter - dt / SCATTER_MS);
      } else {
        dotify = Math.max(0, dotify - dt / DOTIFY_MS);
      }
      dotifyRef.current = dotify;
      scatterRef.current = scatter;

      /* The dot canvas fades in over the flat teal field (which is the
         container background), then the dots scatter into the hook line. */
      canvas.style.opacity = String(dotify);

      const hook = scatter >= 0.98;
      if (hook !== showHookRef.current) {
        showHookRef.current = hook;
        setShowHook(hook);
      }

      if (dotify > 0 && scatter < 1) {
        /* Flying out while hovered, flying home while not — the motion smear
           follows the direction of travel (see drawFrame). */
        drawFrame(1 - scatter, hoveredRef.current ? 1 : -1);
      } else {
        const scene = sceneRef.current;
        scene?.ctx.clearRect(0, 0, scene.w, scene.h);
      }

      if (!hoveredRef.current && dotify === 0 && scatter === 0) {
        runningRef.current = false;
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [setup, drawFrame]);

  useEffect(() => {
    if (reduce) return;
    if (hovered) startLoop();
  }, [hovered, reduce, startLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const wrap = containerRef.current;
    if (!wrap) return;
    const observer = new ResizeObserver(() => {
      sceneRef.current = null;
      setup();
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [setup]);

  const hookLines = (
    <>
      <RiseLine order={0}>
        <span className="block font-heading text-[10cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
          How sick is too sick?
        </span>
      </RiseLine>
      <RiseLine order={1}>
        <span className="block text-[3.8cqw] leading-snug text-white/80">
          Know what to do next
        </span>
      </RiseLine>
    </>
  );

  return (
    <div
      ref={containerRef}
      className={cn("@container overflow-hidden", className)}
      style={{ backgroundColor: FIELD }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0 }}
      />

      {/* Hook line the dots dissolve into. */}
      <AnimatePresence>
        {!reduce && showHook ? (
          <motion.div
            key="hook"
            className="absolute inset-0 flex flex-col items-start justify-center gap-[2cqw] px-[7cqw]"
            exit={{
              opacity: 0,
              transition: { duration: motionDuration.instant, ease: motionEase.in },
            }}
          >
            {hookLines}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Reduced motion: the hook crossfades over the still field instead. */}
      <AnimatePresence>
        {reduce && hovered ? (
          <motion.div
            key="hook-static"
            className="absolute inset-0 flex flex-col items-start justify-center gap-[2cqw] px-[7cqw]"
            style={{ backgroundColor: FIELD }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.01 } }}
            exit={{ opacity: 0, transition: { duration: 0.01 } }}
          >
            <span className="block font-heading text-[10cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              How sick is too sick?
            </span>
            <span className="block text-[3.8cqw] leading-snug text-white/80">
              Know what to do next
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
