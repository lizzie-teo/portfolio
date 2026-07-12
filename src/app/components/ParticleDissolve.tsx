"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import type { AnimationPlaybackControls } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

/* Grid density for sampling the image into particles. Near-white and
   transparent samples are skipped, so only the drawn strokes of the
   illustration become particles. */
const GRID_COLS = 88;

/* Portion of progress by which every particle has settled; the remainder
   crossfades the settled particles into the full-detail image. */
const SETTLE_AT = 0.8;
const MAX_DELAY = 0.45;

/* Swirl effect: extra rotation (radians) particles carry before settling,
   and how far beyond their home radius they begin. */
const SWIRL_MIN_SPIN = 1.3;
const SWIRL_VAR_SPIN = 1.1;
const SWIRL_EXPAND = 0.9;

/* Ripple effect: a ring wave sweeps from the rim to the centre, so delay is
   ordered by radius (span + light jitter) instead of random, and each
   particle slides a short way inward as the wave reaches it. */
const RIPPLE_DELAY_SPAN = 0.55;
const RIPPLE_JITTER = 0.12;
const RIPPLE_PUSH = 0.07;

/* Sweep effect: the image assembles left to right like a render pass, so
   delay is ordered by x (span + light jitter) and each particle slides in
   from the left as the front passes. */
const SWEEP_DELAY_SPAN = 0.55;
const SWEEP_JITTER = 0.12;
const SWEEP_PUSH = 0.06;

/* Ambient hero showcase, so it may run past the standard UI tokens.
   Entries get the fuller treatment; the exit scatter is shorter. */
const DISSOLVE_IN_DURATION = motionDuration.slow * 4; // 2s
const DISSOLVE_OUT_DURATION = motionDuration.slow * 2.8; // 1.4s
/* The settled illustration lingers well beyond the label so the artwork,
   not the words, carries the hero. */
const IMAGE_HOLD_MS = 7200;
const LABEL_HOLD_MS = 3000;

type Phase = "in" | "image" | "out" | "label";

export type DissolveEffect = "scatter" | "swirl" | "ripple" | "sweep";

export type DissolveSlide = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Short line the image dissolves into before the next slide. */
  label?: string;
  /** Small uppercase lead-in above the label. */
  kicker?: string;
  /** Particle motion: random scatter, a vortex that spirals into place, a
      ripple wave settling rim to centre, or a left-to-right sweep. */
  effect?: DissolveEffect;
};

type Particle = {
  homeX: number;
  homeY: number;
  scatterX: number;
  scatterY: number;
  homeAngle: number;
  homeRadius: number;
  spin: number;
  radius: number;
  color: string;
  delay: number;
};

type CanvasState = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
};

type ActiveScene = {
  img: HTMLImageElement;
  particles: Particle[];
  effect: DissolveEffect;
};

type ParticleDissolveProps = {
  /** Cycled in order; each dissolves in, holds, then scatters to its label. */
  slides: DissolveSlide[];
  sizes?: string;
  priority?: boolean;
  className?: string;
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

function buildParticles(
  img: HTMLImageElement,
  w: number,
  h: number,
): Particle[] {
  const cols = GRID_COLS;
  const cellW = w / cols;
  const rows = Math.max(1, Math.round(h / cellW));
  const cellH = h / rows;
  const cx = w / 2;
  const cy = h / 2;

  const sampler = document.createElement("canvas");
  sampler.width = cols;
  sampler.height = rows;
  const samplerCtx = sampler.getContext("2d", { willReadFrequently: true });
  if (!samplerCtx) return [];
  samplerCtx.drawImage(img, 0, 0, cols, rows);
  const { data } = samplerCtx.getImageData(0, 0, cols, rows);

  const particles: Particle[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = (row * cols + col) * 4;
      const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
      if (a < 50 || (r > 246 && g > 246 && b > 246)) continue;

      const homeX = (col + 0.5) * cellW;
      const homeY = (row + 0.5) * cellH;
      const angle = Math.random() * Math.PI * 2;
      const distance = (0.12 + Math.random() * 0.45) * w;
      particles.push({
        homeX,
        homeY,
        scatterX: homeX + Math.cos(angle) * distance,
        scatterY: homeY + Math.sin(angle) * distance,
        homeAngle: Math.atan2(homeY - cy, homeX - cx),
        homeRadius: Math.hypot(homeX - cx, homeY - cy),
        spin: SWIRL_MIN_SPIN + Math.random() * SWIRL_VAR_SPIN,
        radius: cellW * (0.34 + Math.random() * 0.24),
        color: `rgb(${r} ${g} ${b})`,
        delay: Math.random() * MAX_DELAY,
      });
    }
  }
  return particles;
}

/**
 * Reveals each slide by condensing dot particles ("atoms") into the drawing —
 * a random scatter, a vortex swirl around the image centre, a ripple wave
 * settling rim to centre, or a left-to-right sweep — then crossfading to the
 * full-detail picture. It holds, dissolves back out, shows
 * the slide's label, and cycles to the next slide. The real `next/image`
 * elements are the source of truth and the static state. Reduced motion skips
 * the cycle entirely and shows the first slide with the labels read-only.
 */
export function ParticleDissolve({
  slides,
  sizes,
  priority = false,
  className,
}: ParticleDissolveProps) {
  const shouldReduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const canvasStateRef = useRef<CanvasState | null>(null);
  const particlesRef = useRef(new Map<number, Particle[]>());
  const activeRef = useRef<ActiveScene | null>(null);
  const startedRef = useRef(false);
  const pendingRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("in");
  /* Hover peek (fine pointers only): reveals the settled slide's label over
     the image and pauses the cycle while the visitor is looking. */
  const [peek, setPeek] = useState(false);

  const drawFrame = useCallback((progress: number) => {
    const state = canvasStateRef.current;
    const scene = activeRef.current;
    if (!state || !scene) return;
    const { ctx, w, h } = state;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);
    const imageAlpha = Math.min(
      1,
      Math.max(0, (progress - SETTLE_AT) / (1 - SETTLE_AT)),
    );

    if (imageAlpha < 1) {
      const swarmAlpha = (1 - imageAlpha) * Math.min(1, progress / 0.08);
      const maxRadius = Math.min(cx, cy);
      for (const p of scene.particles) {
        let delay = p.delay;
        if (scene.effect === "ripple") {
          delay =
            (1 - Math.min(1, p.homeRadius / maxRadius)) * RIPPLE_DELAY_SPAN +
            p.delay * RIPPLE_JITTER;
        } else if (scene.effect === "sweep") {
          delay = (p.homeX / w) * SWEEP_DELAY_SPAN + p.delay * SWEEP_JITTER;
        }
        const local = Math.min(
          1,
          Math.max(0, (progress - delay) / (SETTLE_AT - delay)),
        );
        if (local <= 0) continue;
        const eased = easeOutCubic(local);
        let x: number;
        let y: number;
        if (scene.effect === "ripple") {
          const push = RIPPLE_PUSH * w * (1 - eased);
          x = p.homeX + Math.cos(p.homeAngle) * push;
          y = p.homeY + Math.sin(p.homeAngle) * push;
        } else if (scene.effect === "sweep") {
          x = p.homeX - SWEEP_PUSH * w * (1 - eased);
          y = p.homeY;
        } else if (scene.effect === "swirl") {
          const unwound = 1 - eased;
          const angle = p.homeAngle + p.spin * unwound;
          const radius = p.homeRadius * (1 + SWIRL_EXPAND * unwound);
          x = cx + Math.cos(angle) * radius;
          y = cy + Math.sin(angle) * radius;
        } else {
          x = p.scatterX + (p.homeX - p.scatterX) * eased;
          y = p.scatterY + (p.homeY - p.scatterY) * eased;
        }
        ctx.globalAlpha = swarmAlpha * (0.25 + 0.75 * eased);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.radius * (0.55 + 0.45 * eased), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (imageAlpha > 0) {
      ctx.globalAlpha = imageAlpha;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(scene.img, 0, 0, w, h);
    }
  }, []);

  const runDissolve = useCallback(
    (direction: "in" | "out", slideIndex: number) => {
      const canvas = canvasRef.current;
      const img = imgRefs.current[slideIndex];
      if (!canvas) return;
      if (!img?.complete || img.naturalWidth === 0) {
        /* Next slide not decoded yet; its onLoad resumes the cycle. */
        pendingRef.current = slideIndex;
        return;
      }

      if (!canvasStateRef.current || canvasStateRef.current.ctx.canvas !== canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvasStateRef.current = { ctx, w: canvas.width, h: canvas.height };
        particlesRef.current.clear();
      }
      const { w, h } = canvasStateRef.current;

      let particles = particlesRef.current.get(slideIndex);
      if (!particles) {
        particles = buildParticles(img, w, h);
        particlesRef.current.set(slideIndex, particles);
      }
      activeRef.current = {
        img,
        particles,
        effect: slides[slideIndex].effect ?? "scatter",
      };

      controlsRef.current?.stop();
      const [from, to] = direction === "in" ? [0, 1] : [1, 0];
      drawFrame(from);
      controlsRef.current = animate(from, to, {
        duration:
          direction === "in" ? DISSOLVE_IN_DURATION : DISSOLVE_OUT_DURATION,
        ease: [...(direction === "in" ? motionEase.out : motionEase.in)],
        onUpdate: drawFrame,
        onComplete: () => setPhase(direction === "in" ? "image" : "label"),
      });
    },
    [drawFrame, slides],
  );

  const start = useCallback(() => {
    const img = imgRefs.current[0];
    if (startedRef.current || !img?.complete || img.naturalWidth === 0) return;
    startedRef.current = true;
    runDissolve("in", 0);
  }, [runDissolve]);

  /* onLoad misses images that finish decoding before hydration, so also
     check the element directly on mount. */
  useEffect(() => {
    if (shouldReduce) return;
    start();
    return () => {
      /* Allow a re-run of this effect (e.g. Strict Mode's mount, cleanup,
         mount) to start the cycle again; without this the guard stays set
         and the animation freezes before the first dissolve. */
      controlsRef.current?.stop();
      startedRef.current = false;
    };
  }, [shouldReduce, start]);

  /* Hold phases: image -> dissolve out; label -> next slide condenses in.
     A hover peek pauses both holds; un-hovering restarts the full hold. */
  useEffect(() => {
    if (shouldReduce || peek) return;
    if (phase === "image" && (slides.length > 1 || slides[index].label)) {
      const hold = setTimeout(() => {
        setPhase("out");
        runDissolve("out", index);
      }, IMAGE_HOLD_MS);
      return () => clearTimeout(hold);
    }
    if (phase === "label") {
      const hold = setTimeout(() => {
        const next = (index + 1) % slides.length;
        setIndex(next);
        setPhase("in");
        runDissolve("in", next);
      }, LABEL_HOLD_MS);
      return () => clearTimeout(hold);
    }
  }, [phase, index, slides, shouldReduce, peek, runDissolve]);

  const slide = slides[index];
  const peekVisible = peek && !!slide.label && (shouldReduce || phase === "image");

  return (
    <div
      className={`@container relative ${className ?? ""}`}
      onMouseEnter={() => {
        /* Touch taps emulate mouseenter; only real hover devices peek. */
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          setPeek(true);
        }
      }}
      onMouseLeave={() => setPeek(false)}
    >
      {slides.map((s, i) => {
        const visible = shouldReduce
          ? i === 0
          : i === index && phase === "image";
        return (
          <Image
            key={s.src}
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            src={s.src}
            alt={s.alt}
            width={s.width}
            height={s.height}
            priority={priority && i === 0}
            sizes={sizes}
            className={
              i === 0 ? "h-auto w-full" : "absolute inset-0 h-full w-full"
            }
            style={{ opacity: visible ? 1 : 0 }}
            onLoad={
              shouldReduce
                ? undefined
                : () => {
                    if (i === 0) start();
                    if (pendingRef.current === i) {
                      pendingRef.current = null;
                      runDissolve("in", i);
                    }
                  }
            }
          />
        );
      })}
      {!shouldReduce ? (
        <canvas
          aria-hidden
          className="absolute inset-0 h-full w-full"
          style={{ opacity: phase === "in" || phase === "out" ? 1 : 0 }}
          ref={canvasRef}
        />
      ) : null}
      {slides.some((s) => s.label) ? (
        <span className="sr-only">
          {slides
            .filter((s) => s.label)
            .map((s) => (s.kicker ? `${s.kicker}: ${s.label}` : s.label))
            .join(". ")}
        </span>
      ) : null}
      {slide.label && !shouldReduce ? (
        <AnimatePresence>
          {phase === "label" ? (
            <motion.p
              aria-hidden
              className="absolute inset-0 flex flex-col items-center justify-center gap-[3cqw] px-[14cqw] text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: motionDuration.fast, ease: motionEase.out },
              }}
              exit={{
                opacity: 0,
                transition: { duration: motionDuration.instant, ease: motionEase.in },
              }}
              key={index}
            >
              {slide.kicker ? (
                <span className="text-[clamp(0.5rem,3.4cqw,0.95rem)] font-medium uppercase tracking-[0.18em] text-primary">
                  {slide.kicker}
                </span>
              ) : null}
              <span className="text-balance text-[clamp(0.6rem,5cqw,1.75rem)] font-normal leading-[1.3] tracking-[0.01em] text-secondary-foreground">
                {slide.label}
              </span>
            </motion.p>
          ) : null}
        </AnimatePresence>
      ) : null}
      <AnimatePresence>
        {peekVisible ? (
          <motion.div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-card/75 px-[14cqw] text-center"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                duration: shouldReduce ? 0.01 : motionDuration.fast,
                ease: motionEase.out,
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: shouldReduce ? 0.01 : motionDuration.instant,
                ease: motionEase.in,
              },
            }}
          >
            <span className="text-balance text-[clamp(0.6rem,5cqw,1.75rem)] font-normal leading-[1.3] tracking-[0.01em] text-secondary-foreground">
              {slide.label}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
