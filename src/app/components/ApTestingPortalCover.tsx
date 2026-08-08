"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";

const ASSETS = "/assets/ap-testing-portal/ap-card-cover-assets";

/* Artwork colours for this card's scene, not shell tokens: the AP+ midnight
   ink under a lavender pixel mosaic. The hook heading and body line are white
   on the FIELD (>15:1); the brand purple lives in the badge, not the type. */
const FIELD = "#0D033C";
const PIXEL_INK = "#DFD8F9";

/* Pixel grid — the .docs/cover-effects.md halftone recipe, varied: square
   "pixels" on a coarser grid instead of round halftone dots, so the field
   reads as a screen mosaic rather than a print. Size follows sqrt(luminance)
   so pixel area tracks a synthesized field brightness.

   THE RULING IS A CELL SIZE, NOT A COLUMN COUNT, and it is the coarsest of the
   three covers because this one is a MOSAIC: a screen pixel is meant to be an
   object you can count. A fixed column count made the screen finer as the
   artwork got smaller, which is backwards for a ruling and is why the small
   instances read as static rather than as a mosaic coming apart. Clamped at both
   ends: a 970px feature plate lands 48 columns (20px cells), a 290px card 22
   (13px), against 13px and 4px before. */
const CELL_PX = 17;
const MIN_COLS = 22;
const MAX_COLS = 48;
const LUM_CUTOFF = 0.06;
const PIXEL_MAX = 0.8;

/* Hover sequence timings shared with SymptomCheckerCover: the flat field
   crossfades into the mosaic, then the pixels dissolve into the hook line;
   hover-out reverses the ramps from wherever they are (retargets, never
   queues). */
const DOTIFY_MS = 300;
const SCATTER_MS = 800;
/* Directional variation: the dissolve is a LEFT TO RIGHT sweep. Delay is
   ordered by column (plus light jitter) and every pixel drifts the same way, so
   the mosaic comes apart like a scan pass rather than a random scatter.

   THE ORDER WAS INVERTED. A pixel's local progress is (settle - delay) over the
   remaining span and `settle` counts DOWN from 1, so a LARGER delay departs
   EARLIER. Ordering the delay as col/cols therefore sent the right edge first
   and ran the front right to left — the opposite of what this cover's comment,
   and its whole character, claimed. It is now (1 - col/cols), so the left edge
   goes first and the front travels left to right. The drift stays leftward, so
   pixels are flung back into the space the front has already cleared: they fly
   against emptiness instead of over pixels still waiting their turn, which is
   what makes the scan legible.

   The drift also grew from 6..12% of the width to 12..40%. At the old distance a
   pixel travelled well under its own cell before its alpha was spent, so the
   sweep was a fade with a direction rather than a mosaic being blown across the
   frame. */
const SWEEP_SPAN = 0.46;
const SWEEP_JITTER = 0.12;
const MAX_DELAY = SWEEP_SPAN + SWEEP_JITTER;
const DRIFT_MIN = 0.12;
const DRIFT_SPREAD = 0.28;
const WOBBLE = 0.05;

/* MOTION TRAIL — the cue that actually says "flying". A pixel drawn at a new
   place each frame has MOVED; it never reads as MOVING. So a travelling pixel is
   drawn as a bar swept back along its own drift vector, at TRAIL_ALPHA of its own
   alpha and TRAIL_WIDTH of its own size, with the square pixel filled on top: a
   crisp head with a faint smear behind it. The length is the derivative of the
   position ramp (3(1 - local)^2, zero at rest so the assembled mosaic is
   untouched) scaled by TRAIL_SCALE, and capped at TRAIL_MAX_R pixel widths. On
   this cover the drift is near horizontal, so every smear lies the same way and
   the scan direction is stated by the artwork rather than asserted in a comment.
   Butt caps, not round: this is the mosaic, and its particles have corners. */
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
  /* Synthesized midnight-field luminance per cell (0..1). */
  field: Float32Array;
  /* dx, dy, delay per pixel. */
  scatter: Float32Array;
};

type ApTestingPortalCoverProps = {
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
 * A soft midnight-field luminance at grid coordinate (u, v) in [0, 1]. Brighter
 * to the left so the pixels the sweep front reveals first read strongest, with
 * a gentle vertical band; stays above LUM_CUTOFF everywhere so the whole field
 * turns to mosaic evenly (no cells drop out).
 */
function fieldLum(u: number, v: number): number {
  const band = 0.5 + 0.22 * Math.sin((v - 0.15) * Math.PI); // soft mid band
  const base = band + 0.18 * (1 - u) - 0.06 * Math.abs(v - 0.5);
  return Math.min(0.85, Math.max(0.3, base));
}

/**
 * Cover for the AP+ Testing Portal card, built on the cover-effects recipe with
 * two variations: square pixels on a coarser grid (a screen mosaic in lavender
 * on AP+ midnight) and a left-to-right sweep dissolve instead of a random
 * scatter. At rest it is a plain midnight panel with the AP+ badge (the card's
 * title and tags live below it); hovering crossfades the flat field into the
 * mosaic and sweeps it away into the top-anchored hook line (an Avant Garde
 * headline over a plain Geist body line, both white on the field), and
 * hover-out reverses mid-flight. Reduced motion crossfades the hook over the
 * still field on hover.
 */
export function ApTestingPortalCover({
  hovered = false,
  className,
}: ApTestingPortalCoverProps) {
  const shouldReduce = useReducedMotion();
  const reduce = !!shouldReduce;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  /* Sequenced hover ramps: dotify crossfades flat field -> mosaic, scatter
     sweeps the assembled pixels out to the hook line. */
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

    /* Precompute the static midnight-field luminance per cell — no per-frame
       sampler canvas is needed now that the source is synthesized, not a film.
       Sweep table: delay ordered by column with light jitter; drift points
       left with a whisper of vertical wobble, so pixels slide in from the
       left as the scan front passes and exit the same way. */
    const field = new Float32Array(cols * rows);
    const scatter = new Float32Array(cols * rows * 3);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        field[i] = fieldLum((col + 0.5) / cols, (row + 0.5) / rows);
        scatter[i * 3] = -(DRIFT_MIN + Math.random() * DRIFT_SPREAD) * w;
        scatter[i * 3 + 1] = (Math.random() - 0.5) * WOBBLE * w;
        /* (1 - col/cols): the LEFT edge carries the largest delay and therefore
           departs first, so the scan front runs left to right (see SWEEP_SPAN). */
        scatter[i * 3 + 2] =
          (1 - col / cols) * SWEEP_SPAN + Math.random() * SWEEP_JITTER;
      }
    }

    sceneRef.current = { ctx, w, h, cols, rows, cellW, cellH: h / rows, field, scatter };
  }, []);

  /* Draws one mosaic frame; settle=1 is fully assembled, lower values sweep
     each pixel toward its drift offset on its column-ordered schedule. `dir` is
     +1 while the pixels are flying out and -1 while they are flying home on
     hover-out: the motion smear has to lie BEHIND the direction of travel, and
     on the way home that is the far side of the pixel, not the near one.
     Without it a reversed sweep draws every smear pointing the way it is
     going. */
  const drawFrame = useCallback((settle: number, dir: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const { ctx, w, h, cols, rows, cellW, cellH, field, scatter } = scene;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PIXEL_INK;
    ctx.strokeStyle = PIXEL_INK;
    ctx.lineCap = "butt";
    const maxSize = cellW * PIXEL_MAX;

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
                Math.max(0, (settle - scatter[i * 3 + 2]) / (1 - MAX_DELAY)),
              );
        if (local <= 0) continue;
        const eased = easeOutCubic(local);
        const dx = scatter[i * 3];
        const dy = scatter[i * 3 + 1];
        const x = (col + 0.5) * cellW + dx * (1 - eased);
        const y = (row + 0.5) * cellH + dy * (1 - eased);
        const size = maxSize * Math.sqrt(lum) * (0.6 + 0.4 * eased);
        /* sqrt(eased), not eased: on the midnight field a linear alpha spends
           the pixel before it has travelled far enough to be seen travelling. */
        const alpha = Math.sqrt(eased) * (0.3 + 0.7 * lum);
        const speed = 3 * (1 - local) ** 2 * TRAIL_SCALE * dir;
        let tx = dx * speed;
        let ty = dy * speed;
        const trail = Math.hypot(tx, ty);
        const cap = size * TRAIL_MAX_R;
        if (trail > cap) {
          tx = (tx / trail) * cap;
          ty = (ty / trail) * cap;
        }
        if (trail > 1) {
          ctx.globalAlpha = alpha * TRAIL_ALPHA;
          ctx.lineWidth = size * TRAIL_WIDTH;
          ctx.beginPath();
          ctx.moveTo(x - tx, y - ty);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.globalAlpha = alpha;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }, []);

  /* Hover loop: ramps dotify then scatter toward the hovered target,
     reverses on hover-out, and stops itself once fully back at the flat field.
     The mosaic canvas opacity is set imperatively to avoid re-renders. */
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

      /* The mosaic canvas fades in over the flat midnight field (the container
         background), then the pixels sweep away into the hook line. */
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

  const hookVisible = reduce ? hovered : showHook;

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

      {/* Hook line the pixels sweep into. */}
      <AnimatePresence>
        {!reduce && showHook ? (
          <motion.div
            key="hook"
            className="absolute inset-0 flex flex-col items-start justify-start gap-[2cqw] px-[8cqw] pt-[10cqw]"
            exit={{
              opacity: 0,
              transition: { duration: motionDuration.instant, ease: motionEase.in },
            }}
          >
            <RiseLine order={0}>
              <span className="block font-heading text-[8.5cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
                Testing without the guesswork
              </span>
            </RiseLine>
            <RiseLine order={1}>
              <span className="block text-[3.6cqw] leading-snug text-white/80">
                Certification status at a glance
              </span>
            </RiseLine>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Reduced motion: the hook crossfades over the still field instead. */}
      <AnimatePresence>
        {reduce && hovered ? (
          <motion.div
            key="hook-static"
            className="absolute inset-0 flex flex-col items-start justify-start gap-[2cqw] px-[8cqw] pt-[10cqw]"
            style={{ backgroundColor: FIELD }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.01 } }}
            exit={{ opacity: 0, transition: { duration: 0.01 } }}
          >
            <span className="block font-heading text-[8.5cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-white">
              Testing without the guesswork
            </span>
            <span className="block text-[3.6cqw] leading-snug text-white/80">
              Certification status at a glance
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* AP+ badge over the field; yields while the hook line is up. */}
      <motion.div
        className="absolute right-[6cqw] top-[6cqw] h-[11cqw] w-[11cqw]"
        initial={false}
        animate={{ opacity: hookVisible ? 0 : 1 }}
        transition={{
          duration: reduce ? 0.01 : motionDuration.fast,
          ease: motionEase.inOut,
        }}
      >
        <Image
          src={`${ASSETS}/logo.svg`}
          alt=""
          width={24}
          height={24}
          className="h-full w-full"
        />
      </motion.div>
    </div>
  );
}
