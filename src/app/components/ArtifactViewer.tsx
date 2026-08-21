"use client";

import { ArrowLeftIcon, ArrowRightIcon, Maximize2Icon, XIcon } from "lucide-react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import { MediaSurface } from "./MediaFrame";

export type ArtifactRegion = {
  /** Short step name, shown in the tour pills. */
  title: string;
  /** Why this region matters, in a sentence. */
  caption: string;
  /** Region centre as % of the artifact (0–100). */
  x: number;
  y: number;
  /** Camera zoom for this region; 1 = whole artifact. */
  scale: number;
};

type ArtifactViewerProps = {
  /** What the artifact is, shown in the frame and as the dialog name. */
  label: string;
  /** The takeaway — must be readable without opening the viewer. */
  caption?: string;
  /** CSS aspect-ratio (width / height). */
  ratio?: number;
  /** Real asset path under /public. Omit for the placeholder frame. */
  src?: string;
  /**
   * "document" presents a page-like artifact (deck slide, scan) as a
   * matted exhibit without shadow; see MediaSurface. The enlarged
   * overlay always shows the artifact plain — enlargement is inspection.
   */
  variant?: "media" | "document";
  /**
   * Optional guided detail tour for artifacts too large to read at
   * viewport size. Authored camera stops replace freeform zoom: the
   * viewer never steers, they step through regions the author chose.
   */
  regions?: ArtifactRegion[];
  className?: string;
};

/** Keep the camera window inside the artifact edges. */
function clampCenter(value: number, scale: number): number {
  const half = 50 / scale;
  return Math.min(100 - half, Math.max(half, value));
}

/**
 * An enlargeable artifact card. The thumbnail morphs into a full-size
 * overlay via a shared-element layout animation (origin-aware). With
 * `regions`, the overlay becomes a guided tour: the camera animates
 * between authored crops — an overview first, then one region at a time —
 * with a minimap for orientation. Under reduced motion the morph and the
 * camera glides (vestibular triggers) become instant cuts.
 */
export function ArtifactViewer({
  label,
  caption,
  ratio = 16 / 10,
  src,
  variant = "media",
  regions,
  className,
}: ArtifactViewerProps) {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const shouldReduce = useReducedMotion();
  const layoutId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const hasTour = Boolean(regions?.length);
  const steps: ArtifactRegion[] = hasTour
    ? [
        {
          title: "Overview",
          caption: caption ?? `The complete ${label.toLowerCase()}.`,
          x: 50,
          y: 50,
          scale: 1,
        },
        ...(regions as ArtifactRegion[]),
      ]
    : [];
  const step = steps[stepIndex] ?? steps[0];

  const morphId = shouldReduce ? undefined : layoutId;
  const morphTransition = {
    layout: { duration: motionDuration.base, ease: motionEase.inOut },
  };
  const cameraTransition = {
    duration: shouldReduce ? 0.01 : motionDuration.slow,
    ease: motionEase.inOut,
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open || !hasTour) {
      return;
    }
    const element = viewportRef.current;
    if (!element) {
      return;
    }
    const measure = () => {
      setViewportSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [open, hasTour]);

  useEffect(() => {
    if (!open) {
      return;
    }
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) {
          return;
        }
        const focusables = dialog.querySelectorAll<HTMLElement>(
          "button:not([disabled]), [href]"
        );
        if (!focusables.length) {
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const controlClassName =
    "flex min-h-11 min-w-11 items-center justify-center rounded-full border border-border outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:pointer-events-none disabled:opacity-40";

  // Controls inside the floating glass chip: no border (the glass is the
  // container), leaf-foreground icons, a leaf focus offset so the white ring
  // reads against the dark glass rather than the light card. Hover/press tint
  // from --primary (the project's action hue — teal here, AP+ purple / Radar
  // slate elsewhere), not neutral white: a white wash over the dark teal glass
  // read as a disconnected grey smudge, whereas a primary wash lifts the button
  // as a brighter shard of the same material. Kept off the coral --rail-tile-active,
  // which means "current" on the travelling marker.
  const chipControlClassName =
    "flex min-h-11 min-w-11 items-center justify-center rounded-full text-leaf-foreground outline-none transition-colors hover:bg-primary/35 active:bg-primary/50 focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-leaf disabled:pointer-events-none disabled:opacity-40";

  // Camera transform, in measured pixels so drag (which deals in pixel
  // deltas) and the step animation share one coordinate system. After
  // `translate(t) scale(s)` with origin 0 0, an image point p lands at
  // t + s·p; solving for the region centre at the viewport centre gives
  // t = (0.5 − s·centre) × viewport size. The viewport keeps the artifact's
  // aspect at every width, so the image maps 1:1 to the box and the authored
  // region coordinates frame the same crop on a phone as on desktop.
  const scale = step?.scale ?? 1;
  const centerX = step ? clampCenter(step.x, scale) : 50;
  const centerY = step ? clampCenter(step.y, scale) : 50;
  const targetX = (0.5 - (scale * centerX) / 100) * viewportSize.width;
  const targetY = (0.5 - (scale * centerY) / 100) * viewportSize.height;
  const cameraX = useMotionValue(0);
  const cameraY = useMotionValue(0);

  // The minimap highlight follows the live camera values, so it stays
  // truthful while the user drags between authored stops.
  const minimapLeft = useTransform(cameraX, (value) =>
    viewportSize.width > 0
      ? (-value / (scale * viewportSize.width)) * 100
      : centerX - 50 / scale
  );
  const minimapTop = useTransform(cameraY, (value) =>
    viewportSize.height > 0
      ? (-value / (scale * viewportSize.height)) * 100
      : centerY - 50 / scale
  );
  const minimapLeftPct = useMotionTemplate`${minimapLeft}%`;
  const minimapTopPct = useMotionTemplate`${minimapTop}%`;

  // Keep full artifact coverage while dragging: the scaled content spans
  // [x, x + s·size], so x stays within [size − s·size, 0].
  const dragConstraints = {
    left: Math.min(0, viewportSize.width - scale * viewportSize.width),
    right: 0,
    top: Math.min(0, viewportSize.height - scale * viewportSize.height),
    bottom: 0,
  };

  return (
    <figure className={className}>
      <motion.button
        ref={triggerRef}
        type="button"
        aria-label={`View ${label} in detail`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setStepIndex(0);
          setOpen(true);
        }}
        className={`group relative block w-full rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-background ${
          variant === "document"
            ? ""
            : "shadow-card transition-shadow hover:shadow-elevated"
        }`}
      >
        <motion.div
          layoutId={morphId}
          transition={morphTransition}
          style={{ borderRadius: 16 }}
          className="overflow-hidden"
        >
          <MediaSurface label={label} ratio={ratio} src={src} variant={variant} />
        </motion.div>
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground backdrop-blur-sm transition-colors group-hover:text-foreground"
        >
          <Maximize2Icon className="size-3.5" />
        </span>
      </motion.button>
      {caption ? (
        <figcaption className="mt-3 max-w-prose text-sm font-medium leading-relaxed text-leaf">
          {caption}
        </figcaption>
      ) : null}

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
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
              onClick={close}
              className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              key="dialog"
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              layoutId={morphId}
              transition={morphTransition}
              initial={shouldReduce ? { opacity: 0 } : undefined}
              animate={
                shouldReduce
                  ? { opacity: 1, transition: { duration: 0.01 } }
                  : undefined
              }
              exit={
                shouldReduce
                  ? { opacity: 0, transition: { duration: 0.01 } }
                  : undefined
              }
              style={{
                borderRadius: 24,
                // Tour mode zooms, so the overview needn't fit the viewport
                // height — let the dialog go wide. Plain mode still sizes
                // the dialog so the full artifact is visible without scroll.
                maxWidth: hasTour
                  ? "min(calc(100vw - 1rem), 80rem)"
                  : `min(calc(100vw - 1rem), 72rem, calc((100dvh - 8rem) * ${ratio}))`,
              }}
              className="fixed inset-0 z-[70] m-auto h-fit max-h-[calc(100dvh-2rem)] w-full overflow-y-auto border border-border bg-card p-3 shadow-elevated sm:p-6"
            >
              <div className="flex items-center justify-between gap-4 pb-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {label}
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className={controlClassName}
                >
                  <XIcon aria-hidden="true" className="size-4" />
                </button>
              </div>

              {hasTour && src ? (
                <>
                  <div
                    className="relative mx-auto w-full"
                    style={{
                      // Cap the camera window by viewport height (keeping the
                      // artifact's aspect) instead of shrinking the whole
                      // dialog; width binds on mobile, height on desktop.
                      maxWidth: `calc(72dvh * ${ratio})`,
                    }}
                  >
                    <div
                      ref={viewportRef}
                      style={{ aspectRatio: ratio }}
                      className="relative w-full overflow-hidden rounded-2xl border border-border bg-secondary"
                    >
                      <motion.div
                        className={`absolute inset-0 ${
                          scale > 1 ? "cursor-grab active:cursor-grabbing" : ""
                        }`}
                        style={{ originX: 0, originY: 0, x: cameraX, y: cameraY }}
                        animate={{ x: targetX, y: targetY, scale }}
                        transition={cameraTransition}
                        drag={scale > 1}
                        dragConstraints={dragConstraints}
                        dragElastic={0.08}
                        dragMomentum={false}
                      >
                        <Image
                          src={src}
                          alt={label}
                          fill
                          sizes="92vw"
                          className="object-cover"
                          draggable={false}
                        />
                      </motion.div>

                      {scale > 1 ? (
                        <div
                          aria-hidden="true"
                          style={{ aspectRatio: ratio }}
                          className="pointer-events-none absolute bottom-3 right-3 hidden w-24 overflow-hidden rounded-md border border-border bg-card/90 backdrop-blur-sm sm:block"
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            sizes="96px"
                            className="object-cover opacity-60"
                          />
                          <motion.div
                            style={{ left: minimapLeftPct, top: minimapTopPct }}
                            animate={{
                              width: `${100 / scale}%`,
                              height: `${100 / scale}%`,
                            }}
                            transition={cameraTransition}
                            className="absolute rounded-sm border-2 border-primary"
                          />
                        </div>
                      ) : null}
                    </div>

                    {/* Liquid-glass control chip: one shard of the dock's leaf
                        material carrying the guided tour's prev / step-dots /
                        next. From md up it floats over the artifact's lower edge
                        — one floating-chrome language across the page. Below md
                        the viewport is a short landscape strip with no lower
                        margin to spare, so the chip drops just beneath the media
                        instead of over it, leaving the zoomed screen fully
                        visible. Position is carried by which dot the coral marker
                        sits on (it glides between steps, matching the dock's "you
                        are here" pip), never a number; the step's name reads
                        below the media either way. */}
                    <div className="pointer-events-none mt-3 flex justify-center md:absolute md:inset-x-0 md:bottom-3 md:z-10 md:mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          duration: shouldReduce ? 0.01 : motionDuration.fast,
                          ease: motionEase.out,
                          delay: shouldReduce ? 0 : motionDuration.base,
                        },
                      }}
                      className="tour-glass-chip pointer-events-auto flex items-center gap-0 rounded-full p-1 text-leaf-foreground sm:gap-0.5 sm:p-1.5"
                    >
                      <button
                        type="button"
                        aria-label="Previous region"
                        disabled={stepIndex === 0}
                        onClick={() =>
                          setStepIndex((current) => Math.max(0, current - 1))
                        }
                        className={chipControlClassName}
                      >
                        <ArrowLeftIcon aria-hidden="true" className="size-4" />
                      </button>
                      <span
                        aria-hidden="true"
                        className="mx-0.5 hidden h-4 w-px bg-leaf-foreground/15 sm:block"
                      />
                      <ol className="flex items-center">
                        {steps.map((item, itemIndex) => {
                          const isActive = itemIndex === stepIndex;
                          return (
                            <li key={item.title}>
                              <button
                                type="button"
                                aria-label={item.title}
                                aria-current={isActive ? "step" : undefined}
                                onClick={() => setStepIndex(itemIndex)}
                                className="group flex min-h-11 min-w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-leaf"
                              >
                                {isActive ? (
                                  <motion.span
                                    layoutId={`${layoutId}-tour-dot`}
                                    layout={!shouldReduce}
                                    transition={{
                                      layout: {
                                        duration: shouldReduce
                                          ? 0
                                          : motionDuration.fast,
                                        ease: motionEase.inOut,
                                      },
                                    }}
                                    className="block size-2.5 rounded-full bg-rail-tile-active"
                                  />
                                ) : (
                                  <span className="block size-2 rounded-full bg-leaf-foreground/40 transition-colors group-hover:bg-leaf-foreground/75" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                      <span
                        aria-hidden="true"
                        className="mx-0.5 hidden h-4 w-px bg-leaf-foreground/15 sm:block"
                      />
                      <button
                        type="button"
                        aria-label="Next region"
                        disabled={stepIndex === steps.length - 1}
                        onClick={() =>
                          setStepIndex((current) =>
                            Math.min(steps.length - 1, current + 1)
                          )
                        }
                        className={chipControlClassName}
                      >
                        <ArrowRightIcon aria-hidden="true" className="size-4" />
                      </button>
                    </motion.div>
                    </div>
                  </div>

                  {/* Reading text sits below the media, crisp on the card —
                      never glassed. The chip carries position; this names the
                      step (and stays the accessible label the live region
                      announces). */}
                  <div aria-live="polite" className="max-w-prose pt-4">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={stepIndex}
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
                            duration: shouldReduce
                              ? 0.01
                              : motionDuration.instant,
                            ease: motionEase.in,
                          },
                        }}
                      >
                        <p className="text-sm font-semibold">{step.title}</p>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-leaf">
                          {step.caption}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <MediaSurface label={label} ratio={ratio} src={src} />
                  {caption ? (
                    <p className="pt-4 text-sm font-medium leading-relaxed text-leaf">
                      {caption}
                    </p>
                  ) : null}
                </>
              )}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </figure>
  );
}
