"use client";

import Image from "next/image";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import type { AnimationPlaybackControls } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import type { WorkImageMedia } from "../work/projects";

/* Coarsest mosaic cell in CSS pixels. The in-view resolve starts blocky and
   sharpens; the hover shimmer re-coarsens only slightly so the repeated
   interaction stays quiet. */
const RESOLVE_BLOCK = 36;
const SHIMMER_BLOCK = 10;

type PixelResolveProps = {
  media: WorkImageMedia;
  /** Card hover state, owned by the parent link/card. */
  hovered?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * Card media that assembles from coarse pixel blocks into the full image the
 * first time it scrolls into view, then fades the brand mark up over it.
 * Hovering the card replays a brief, subtler shimmer. The real `next/image`
 * is the source of truth and the static state; reduced motion skips the
 * canvas entirely and keeps an opacity-only logo reveal.
 */
export function PixelResolve({
  media,
  hovered = false,
  sizes,
  className,
}: PixelResolveProps) {
  const shouldReduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const samplerRef = useRef<HTMLCanvasElement | null>(null);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const startedRef = useRef(false);
  const inView = useInView(containerRef, {
    once: true,
    margin: "0px 0px -12% 0px",
  });
  const [loaded, setLoaded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [resolved, setResolved] = useState(false);

  const drawFrame = useCallback((progress: number, maxBlock: number) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img?.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width: w, height: h } = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const block = Math.max(1, (1 - progress) * maxBlock * dpr);
    const cols = Math.max(1, Math.round(w / block));
    const rows = Math.max(1, Math.round(h / block));

    /* Mimic the underlying image's object-cover centre crop. */
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const sw = w / scale;
    const sh = h / scale;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;

    const sampler = (samplerRef.current ??= document.createElement("canvas"));
    sampler.width = cols;
    sampler.height = rows;
    const samplerCtx = sampler.getContext("2d");
    if (!samplerCtx) return;
    samplerCtx.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(sampler, 0, 0, w, h);
  }, []);

  const runResolve = useCallback(
    (maxBlock: number, duration: number, onDone?: () => void) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img?.complete || img.naturalWidth === 0) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      controlsRef.current?.stop();
      setAnimating(true);
      drawFrame(0, maxBlock);
      controlsRef.current = animate(0, 1, {
        duration,
        ease: [...motionEase.out],
        onUpdate: (progress) => drawFrame(progress, maxBlock),
        onComplete: () => {
          setAnimating(false);
          onDone?.();
        },
      });
    },
    [drawFrame],
  );

  /* onLoad misses images that finish decoding before hydration, so also
     check the element directly on mount. */
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  /* Reduced motion never runs the canvas, so the logo derives visibility
     directly instead of waiting on a resolve that will not happen. */
  const logoVisible = resolved || !!shouldReduce;

  useEffect(() => {
    if (shouldReduce) return;
    if (inView && loaded && !startedRef.current) {
      startedRef.current = true;
      runResolve(RESOLVE_BLOCK, motionDuration.slow, () => setResolved(true));
    }
  }, [inView, loaded, shouldReduce, runResolve]);

  /* Hover shimmer only replays once the entry resolve has finished, so a
     hover mid-entry can't cut the fuller reveal short. */
  useEffect(() => {
    if (hovered && resolved && !shouldReduce) {
      runResolve(SHIMMER_BLOCK, motionDuration.fast);
    }
  }, [hovered, resolved, shouldReduce, runResolve]);

  useEffect(() => () => controlsRef.current?.stop(), []);

  return (
    <div ref={containerRef} className={className}>
      <Image
        ref={imgRef}
        src={media.image.src}
        alt={media.image.alt}
        fill
        sizes={sizes}
        className="object-cover"
        onLoad={() => setLoaded(true)}
      />
      {!shouldReduce ? (
        <canvas
          aria-hidden
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ opacity: animating ? 1 : 0 }}
        />
      ) : null}
      {media.logo ? (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[13%] flex justify-center"
          initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
          animate={
            logoVisible
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: shouldReduce ? 0 : 10 }
          }
          transition={{
            duration: shouldReduce ? 0.01 : motionDuration.fast,
            ease: motionEase.out,
            delay: shouldReduce ? 0 : 0.05,
          }}
        >
          <Image
            src={media.logo.src}
            alt=""
            width={media.logo.width}
            height={media.logo.height}
            className="h-auto w-[36%] max-w-60"
          />
        </motion.div>
      ) : null}
    </div>
  );
}
