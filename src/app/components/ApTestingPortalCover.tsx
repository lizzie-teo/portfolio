"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";
import { useCoverFilm } from "../lib/useCoverFilm";
import { DITHER_REST_OPACITY, DitherOverlay } from "./DitherOverlay";

const NOOP = () => {};

const ASSETS = "/assets/ap-testing-portal/ap-card-cover-assets";
const VIDEO_SRC = `${ASSETS}/ap-testing-portal.mp4`;

/* Artwork colours for this card's scene, not shell tokens: the AP+ midnight
   ink under a lavender pixel mosaic of the footage. The hook heading and body
   line are white on the FIELD (>15:1); the brand purple lives in the footage
   and badge, not the type. */
const FIELD = "#0D033C";
const PIXEL_INK = "#DFD8F9";

/* Pixel grid — the .docs/cover-effects.md halftone recipe, varied: square
   "pixels" on a coarser grid instead of round halftone dots, so the film
   reads as a screen mosaic rather than a print. Size still follows
   sqrt(luminance) so pixel area tracks brightness. */
const GRID_COLS = 72;
const LUM_CUTOFF = 0.06;
const PIXEL_MAX = 0.8;

/* Hover sequence timings shared with SymptomCheckerCover: film crossfades
   into the mosaic, then the pixels dissolve into the hook line; hover-out
   reverses the ramps from wherever they are (retargets, never queues). */
const DOTIFY_MS = 300;
const SCATTER_MS = 800;
/* Directional variation: the dissolve is a left-to-right sweep. Delay is
   ordered by column (plus light jitter) and every pixel drifts the same way,
   so the mosaic assembles like a scan pass instead of a random scatter. */
const SWEEP_SPAN = 0.5;
const SWEEP_JITTER = 0.12;
const MAX_DELAY = SWEEP_SPAN + SWEEP_JITTER;
/* Steady mosaic playback samples at ~30fps; transitions draw every frame. */
const FRAME_MS = 33;

/* Hook-line cascade from .docs/style-rules.md: `slow` items, 0.06s interval. */
const LINE_STAGGER = 0.06;

type Scene = {
  ctx: CanvasRenderingContext2D;
  sampler: CanvasRenderingContext2D;
  w: number;
  h: number;
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  /* dx, dy, delay per pixel. */
  scatter: Float32Array;
};

type ApTestingPortalCoverProps = {
  /** Card hover state, owned by the parent link/card; drives the dissolve. */
  hovered?: boolean;
  className?: string;
  /** True while this card holds the one-pass playback grant; the film plays a
      single pass then freezes on its frame under the dither. */
  filmActive?: boolean;
  /** Fired when the pass ends, releasing the grant to the next card. */
  onFilmEnd?: () => void;
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
 * Cover for the AP+ Testing Portal card, built on the cover-effects recipe
 * with two variations: square pixels on a coarser grid (a screen mosaic in
 * lavender on AP+ midnight) and a left-to-right sweep dissolve instead of a
 * random scatter. At rest the portal footage plays plainly with the corner
 * badge, under the card's own title and tags; hovering pixelates the film and
 * sweeps it away into the top-anchored hook line (an Avant Garde headline over
 * a plain Geist body line, both white on the field), and hover-out reverses
 * mid-flight. Reduced motion holds the film's first frame and crossfades the
 * hook over it on hover.
 */
export function ApTestingPortalCover({
  hovered = false,
  className,
  filmActive = false,
  onFilmEnd,
}: ApTestingPortalCoverProps) {
  const shouldReduce = useReducedMotion();
  const reduce = !!shouldReduce;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ditherRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  /* Sequenced hover ramps: dotify crossfades film -> mosaic, scatter sweeps
     the assembled pixels out to the hook line. */
  const dotifyRef = useRef(0);
  const scatterRef = useRef(0);
  const hoveredRef = useRef(hovered);
  const showHookRef = useRef(false);

  const [showHook, setShowHook] = useState(false);
  const inView = useInView(containerRef);

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

    const samplerCanvas = document.createElement("canvas");
    samplerCanvas.width = cols;
    samplerCanvas.height = rows;
    const sampler = samplerCanvas.getContext("2d", { willReadFrequently: true });
    if (!sampler) return;

    /* Sweep table: delay ordered by column with light jitter; drift points
       left with a whisper of vertical wobble, so pixels slide in from the
       left as the scan front passes and exit the same way. */
    const scatter = new Float32Array(cols * rows * 3);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        scatter[i * 3] = -(0.06 + Math.random() * 0.06) * w;
        scatter[i * 3 + 1] = (Math.random() - 0.5) * 0.04 * w;
        scatter[i * 3 + 2] =
          (col / cols) * SWEEP_SPAN + Math.random() * SWEEP_JITTER;
      }
    }

    sceneRef.current = { ctx, sampler, w, h, cols, rows, cellW, cellH: h / rows, scatter };
  }, []);

  /* Draws one mosaic frame; settle=1 is fully assembled, lower values sweep
     each pixel toward its drift offset on its column-ordered schedule. */
  const drawFrame = useCallback((settle: number) => {
    const scene = sceneRef.current;
    const video = videoRef.current;
    if (!scene || !video || video.readyState < 2) return;
    const { ctx, sampler, w, h, cols, rows, cellW, cellH, scatter } = scene;

    /* Cover-crop the film into the grid's aspect. */
    const videoAspect = video.videoWidth / video.videoHeight;
    const gridAspect = w / h;
    let sx = 0;
    let sy = 0;
    let sw = video.videoWidth;
    let sh = video.videoHeight;
    if (videoAspect > gridAspect) {
      sw = video.videoHeight * gridAspect;
      sx = (video.videoWidth - sw) / 2;
    } else {
      sh = video.videoWidth / gridAspect;
      sy = (video.videoHeight - sh) / 2;
    }
    sampler.drawImage(video, sx, sy, sw, sh, 0, 0, cols, rows);
    const { data } = sampler.getImageData(0, 0, cols, rows);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = PIXEL_INK;
    const maxSize = cellW * PIXEL_MAX;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        const o = i * 4;
        const lum =
          (0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]) / 255;
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
        const x = (col + 0.5) * cellW + scatter[i * 3] * (1 - eased);
        const y = (row + 0.5) * cellH + scatter[i * 3 + 1] * (1 - eased);
        const size = maxSize * Math.sqrt(lum) * (0.55 + 0.45 * eased);
        ctx.globalAlpha = eased * (0.3 + 0.7 * lum);
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }, []);

  /* Hover loop: ramps dotify then scatter toward the hovered target,
     reverses on hover-out, and stops itself once fully back at the plain
     film. Element opacities are set imperatively to avoid re-renders. */
  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setup();

    let last: number | null = null;
    let lastDraw = 0;

    const step = (now: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) {
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

      video.style.opacity = String(1 - dotify);
      canvas.style.opacity = String(dotify);
      /* The dither finish belongs to the resting film; fade it out with the
         film so it never sits over the mosaic or the hook line. */
      if (ditherRef.current) {
        ditherRef.current.style.opacity = String(DITHER_REST_OPACITY * (1 - dotify));
      }

      const hook = scatter >= 0.98;
      if (hook !== showHookRef.current) {
        showHookRef.current = hook;
        setShowHook(hook);
      }

      if (dotify > 0 && scatter < 1) {
        const steady = dotify >= 1 && scatter === 0;
        if (!steady || now - lastDraw >= FRAME_MS) {
          lastDraw = now;
          drawFrame(1 - scatter);
        }
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

  /* The film plays a single granted pass on scroll-in, then freezes; hover
     resumes it under the dissolve independent of the queue. Off-screen and
     reduced motion hold the first frame. Pass-end detection and play/pause
     both live in useCoverFilm (keeps `loop`, never seeks). */
  useCoverFilm(videoRef, {
    play: !reduce && inView && (hovered || filmActive),
    passActive: filmActive && !reduce,
    onPassEnd: onFilmEnd ?? NOOP,
  });

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
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        muted
        playsInline
        loop
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      {/* Slight ordered-dither finish over the resting film; fades with the
          film into the mosaic on hover. */}
      <DitherOverlay ref={ditherRef} />
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
              <span className="block font-heading text-[8.5cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-glass-foreground">
                Testing without the guesswork
              </span>
            </RiseLine>
            <RiseLine order={1}>
              <span className="block text-[3.6cqw] leading-snug text-glass-foreground/80">
                Certification status at a glance
              </span>
            </RiseLine>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Reduced motion: the hook crossfades over the still frame instead. */}
      <AnimatePresence>
        {reduce && hovered ? (
          <motion.div
            key="hook-static"
            className="absolute inset-0 flex flex-col items-start justify-start gap-[2cqw] px-[8cqw] pt-[10cqw]"
            style={{ backgroundColor: "rgba(13, 3, 60, 0.9)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.01 } }}
            exit={{ opacity: 0, transition: { duration: 0.01 } }}
          >
            <span className="block font-heading text-[8.5cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-glass-foreground">
              Testing without the guesswork
            </span>
            <span className="block text-[3.6cqw] leading-snug text-glass-foreground/80">
              Certification status at a glance
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* AP+ badge over the footage; yields while the hook line is up. */}
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

      {/* The card face carries the title and tags now (ProjectCard); this
          cover stays pure artwork under that label. */}
    </div>
  );
}
