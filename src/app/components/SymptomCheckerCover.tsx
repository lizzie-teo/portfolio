"use client";

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

/* Artwork colours for this card's scene, not shell tokens: a deep teal-ink
   field under a near-white halftone of the film. The hook heading and body
   line are white on the FIELD (>13:1); the product teal lives in the footage,
   not the type. */
const FIELD = "#0F2830";
const DOT_INK = "#EAF5F2";

const VIDEO_SRC = "/assets/healthdirect/sc-card-cover-assets/child-unwell.mp4";

/* Halftone grid: the film is sampled into a fixed dot matrix; dot size and
   alpha follow luminance, and cells darker than the cutoff melt into the
   field so shadows read as negative space. */
const GRID_COLS = 92;
const LUM_CUTOFF = 0.06;
const DOT_MAX = 0.62;

/* Hover sequence: the plain film crossfades into the dot screen, then the
   dots scatter into the hook line. Hover-out reverses the same ramps from
   wherever they are, so rapid hovers retarget mid-flight instead of
   queueing. An expressive card scene, so the scatter runs past the 300ms
   UI-response tokens like the ParticleDissolve hero does. */
const DOTIFY_MS = 300;
const SCATTER_MS = 800;
/* Portion of scatter progress used to stagger dots, and how far each dot
   drifts while scattered, as a portion of card width. */
const SCATTER_DELAY = 0.4;
const SCATTER_DRIFT = 0.16;
/* Steady halftone playback samples at ~30fps; transitions draw every frame. */
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
  /* dx, dy, delay per dot. */
  scatter: Float32Array;
};

type SymptomCheckerCoverProps = {
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
 * Cover for the Healthdirect Symptom Checker card. At rest the child-unwell
 * film plays plainly under the card's own title and tags. Hovering the card
 * dissolves the film into a halftone of teal-white dots that scatter into the
 * hook line, anchored at the top of the card: an Avant Garde headline over a
 * plain Geist body line, both white on the dark field. Hover-out condenses
 * everything back into the film, reversible mid-flight. Reduced motion holds
 * the film's first frame and crossfades the hook over it on hover instead.
 */
export function SymptomCheckerCover({
  hovered = false,
  className,
  filmActive = false,
  onFilmEnd,
}: SymptomCheckerCoverProps) {
  const shouldReduce = useReducedMotion();
  const reduce = !!shouldReduce;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ditherRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  /* Sequenced hover ramps: dotify crossfades film -> dot screen, scatter
     moves the assembled dots out to the hook line. */
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

    const scatter = new Float32Array(cols * rows * 3);
    for (let i = 0; i < cols * rows; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = (0.4 + Math.random() * 0.6) * SCATTER_DRIFT * w;
      scatter[i * 3] = Math.cos(angle) * dist;
      scatter[i * 3 + 1] = Math.sin(angle) * dist;
      scatter[i * 3 + 2] = Math.random() * SCATTER_DELAY;
    }

    sceneRef.current = { ctx, sampler, w, h, cols, rows, cellW, cellH: h / rows, scatter };
  }, []);

  /* Draws one halftone frame; settle=1 is fully assembled, lower values move
     each dot toward its scatter offset on its own staggered schedule. */
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
    ctx.fillStyle = DOT_INK;
    const maxRadius = cellW * DOT_MAX;

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
         film so it never sits over the halftone or the hook line. */
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

  const hookLines = (
    <>
      <RiseLine order={0}>
        <span className="block font-heading text-[10cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-glass-foreground">
          How sick is too sick?
        </span>
      </RiseLine>
      <RiseLine order={1}>
        <span className="block text-[3.8cqw] leading-snug text-glass-foreground/80">
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
          film into the halftone on hover. */}
      <DitherOverlay ref={ditherRef} />
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
            className="absolute inset-0 flex flex-col items-start justify-start gap-[2cqw] px-[8cqw] pt-[10cqw]"
            exit={{
              opacity: 0,
              transition: { duration: motionDuration.instant, ease: motionEase.in },
            }}
          >
            {hookLines}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Reduced motion: the hook crossfades over the still frame instead. */}
      <AnimatePresence>
        {reduce && hovered ? (
          <motion.div
            key="hook-static"
            className="absolute inset-0 flex flex-col items-start justify-start gap-[2cqw] px-[8cqw] pt-[10cqw]"
            style={{ backgroundColor: "rgba(15, 40, 48, 0.9)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.01 } }}
            exit={{ opacity: 0, transition: { duration: 0.01 } }}
          >
            <span className="block font-heading text-[10cqw] font-semibold leading-[1.08] tracking-[-0.03em] text-glass-foreground">
              How sick is too sick?
            </span>
            <span className="block text-[3.8cqw] leading-snug text-glass-foreground/80">
              Know what to do next
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* The card face carries the title and tags now (ProjectCard); this
          cover stays pure artwork under that label. */}
    </div>
  );
}
