"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";

/* Artwork colours for this card's scene, not shell tokens: a deep plum field
   drawn from the project's own brand, carrying near-white rose dots. Hook type
   is white on the plum (white on #2b0d20 is ~16:1). Home cards stay neutral;
   the cover carries its own imagery (see ApTestingPortalCover /
   SymptomCheckerCover). */
const FIELD = "#2b0d20";
/* Near-white halftone ink with a whisper of the field's rose (see cover-effects). */
const DOT_INK = "#F4E3EC";

/* Halftone grid: the resting flat plum field breaks into a fixed dot matrix
   whose dot size follows a synthesized field luminance. Its own character is a
   radar ping — the dots assemble and scatter as a ring travelling out from the
   centre rather than the even scatter (Symptom) or left-to-right sweep (AP). */
const GRID_COLS = 84;
const LUM_CUTOFF = 0.06;
const DOT_MAX = 0.6;

/* Hover sequence timings shared with the sibling covers: the flat field
   crossfades into the dot screen, then the dots ping outward into the hook
   line; hover-out reverses the ramps from wherever they are (retargets, never
   queues). */
const DOTIFY_MS = 300;
const SCATTER_MS = 800;
/* Portion of scatter progress used to stagger dots by radius (the ping front),
   and how far each dot drifts outward while scattered, as a portion of width. */
const SCATTER_DELAY = 0.4;
const SCATTER_DRIFT = 0.18;

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
  /* Synthesized plum-field luminance per cell (0..1). */
  field: Float32Array;
  /* dx, dy, delay per dot. */
  scatter: Float32Array;
};

type MacquarieRadarCoverProps = {
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
 * A soft plum-field luminance at grid coordinate (u, v) in [0, 1]. Brightest at
 * the centre where the radar ping originates, easing out toward the edges, and
 * staying above LUM_CUTOFF everywhere so the whole field turns to dots evenly.
 */
function fieldLum(u: number, v: number): number {
  const r = Math.hypot(u - 0.5, v - 0.5) / 0.7071; // 0 centre .. 1 corner
  const base = 0.72 - 0.32 * r;
  return Math.min(0.82, Math.max(0.3, base));
}

/**
 * Cover for the Macquarie Radar card. At rest it is a plain deep plum panel
 * (the card's title and tagline live below it on the light card). Hovering
 * crossfades the flat field into a halftone of rose-white dots that ping
 * outward from the centre — a radar sweep — resolving into the hook line
 * "Which students need you now?", reversible mid-flight. Reduced motion
 * crossfades the hook over the still plum field.
 */
export function MacquarieRadarCover({
  hovered = false,
  className,
}: MacquarieRadarCoverProps) {
  const shouldReduce = useReducedMotion();
  const reduce = !!shouldReduce;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  /* Sequenced hover ramps: dotify crossfades flat field -> dot screen, scatter
     pings the assembled dots outward to the hook line. */
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

    const cols = GRID_COLS;
    const cellW = w / cols;
    const rows = Math.max(1, Math.round(h / cellW));

    /* Precompute the static plum-field luminance per cell, plus a radial ping
       table: delay ordered by distance from centre (the ping front) with light
       jitter, and drift pointing outward from centre, so dots ping out as a
       ring rather than a random scatter. */
    const field = new Float32Array(cols * rows);
    const scatter = new Float32Array(cols * rows * 3);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const u = (col + 0.5) / cols;
        const v = (row + 0.5) / rows;
        field[i] = fieldLum(u, v);
        const nx = u - 0.5;
        const ny = v - 0.5;
        const dist = Math.hypot(nx, ny) || 0.0001;
        const drift = (0.4 + Math.random() * 0.6) * SCATTER_DRIFT * w;
        scatter[i * 3] = (nx / dist) * drift;
        scatter[i * 3 + 1] = (ny / dist) * drift;
        /* Radius (0 centre .. ~1 corner) sets the ping delay, with jitter so
           the ring front is soft rather than a hard circle. */
        scatter[i * 3 + 2] =
          Math.min(1, dist / 0.7071) * SCATTER_DELAY * 0.8 +
          Math.random() * SCATTER_DELAY * 0.2;
      }
    }

    sceneRef.current = { ctx, w, h, cols, rows, cellW, cellH: h / rows, field, scatter };
  }, []);

  /* Draws one halftone frame; settle=1 is fully assembled, lower values ping
     each dot outward on its radius-ordered schedule. */
  const drawFrame = useCallback((settle: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const { ctx, w, h, cols, rows, cellW, cellH, field, scatter } = scene;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = DOT_INK;
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
        const x = (col + 0.5) * cellW + scatter[i * 3] * (1 - eased);
        const y = (row + 0.5) * cellH + scatter[i * 3 + 1] * (1 - eased);
        ctx.globalAlpha = eased * (0.3 + 0.7 * lum);
        ctx.beginPath();
        ctx.arc(x, y, maxRadius * Math.sqrt(lum) * (0.55 + 0.45 * eased), 0, Math.PI * 2);
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

      /* The dot canvas fades in over the flat plum field (the container
         background), then the dots ping outward into the hook line. */
      canvas.style.opacity = String(dotify);

      const hook = scatter >= 0.98;
      if (hook !== showHookRef.current) {
        showHookRef.current = hook;
        setShowHook(hook);
      }

      if (dotify > 0 && scatter < 1) {
        drawFrame(1 - scatter);
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
        <span className="block font-heading text-[9.5cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
          Which students need you now?
        </span>
      </RiseLine>
      <RiseLine order={1}>
        <span className="block text-[3.8cqw] leading-snug text-white/80">
          Reach them sooner
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

      {/* Hook line the dots ping into. */}
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
            <span className="block font-heading text-[9.5cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              Which students need you now?
            </span>
            <span className="block text-[3.8cqw] leading-snug text-white/80">
              Reach them sooner
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
