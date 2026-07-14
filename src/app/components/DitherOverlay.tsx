"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/* A slight ordered (Bayer) dither laid over resting cover footage, so the film
   reads with a fine editorial print-screen grain rather than a clean video.
   It is pure static artwork: an 8x8 Bayer matrix baked once into an SVG tile
   and repeated, blended over the film. No canvas, no rAF, no per-frame work —
   the finish costs nothing on scroll and carries no motion, so reduced motion
   needs no special case here.

   The speck colours are scene constants (neutral white / black dither ink),
   not shell tokens: like the covers' field/dot colours, they belong to the
   artwork and never leak into the neutral shell. `soft-light` keeps the finish
   contrast preserving — the white specks gently lift highlights and the black
   specks gently deepen shadows without crushing either, so the footage stays
   clearly readable underneath. */
const SPECK_LIGHT = "#FFFFFF";
const SPECK_DARK = "#000000";

/* Which ordered Bayer matrix drives the dither: 2, 4, or 8 (the demo's
   2x2 / 4x4 / 8x8 types). 4 gives a slightly coarser, more visible grain than
   8 while staying fine at every card width. */
const BAYER_SIZE = 4;

/* How many of the BAYER_SIZE^2 ordered levels become a light speck (lowest) or
   a dark speck (highest); the rest stay transparent. At 4x4 that is 1 of 16
   each way — the sparsest possible grain, a single lit and a single darkened
   cell per tile, thinned further by the soft-light blend and rest opacity. */
const SPECK_COUNT = 1;

/* Rest strength of the finish. Slight by intent: the dither is a texture, not
   a subject. Exported so a cover can fade it in lockstep with its film as the
   film crossfades into the halftone on hover. */
export const DITHER_REST_OPACITY = 0.6;

/* Each Bayer cell paints at this many CSS pixels, so the grain stays fine and
   crisp (pixel-snapped) from a 320px card up through wide desktop. */
const CELL_PX = 1.5;

/* How the finish blends into the film. `soft-light` is contrast preserving: the
   white specks gently lighten and the black specks gently darken their cells
   relative to mid grey, so the dither reads as a soft print grain over the
   footage without blowing out highlights or crushing shadows. The dev
   playground at /dev/dither lets these be retuned before they land here. */
const BLEND_MODE = "soft-light";

/* Shipped values in one place, so the /dev/dither playground can preview and
   reset against exactly what the site renders (single source of truth). */
export const DITHER_DEFAULTS = {
  speckLight: SPECK_LIGHT,
  speckDark: SPECK_DARK,
  bayerSize: BAYER_SIZE,
  speckCount: SPECK_COUNT,
  restOpacity: DITHER_REST_OPACITY,
  cellPx: CELL_PX,
  blendMode: BLEND_MODE,
} as const;

/** Recursive ordered Bayer matrix of side `size` (a power of two: 2, 4, 8). */
function bayer(size: number): number[][] {
  let m: number[][] = [[0]];
  let s = 1;
  while (s < size) {
    const prev = m;
    const next = s * 2;
    m = Array.from({ length: next }, () => new Array(next).fill(0));
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const v = prev[y][x];
        m[y][x] = 4 * v;
        m[y][x + s] = 4 * v + 2;
        m[y + s][x] = 4 * v + 3;
        m[y + s][x + s] = 4 * v + 1;
      }
    }
    s = next;
  }
  return m;
}

export type DitherTileOptions = {
  /** Bayer matrix side (2, 4, or 8 — the demo's 2x2 / 4x4 / 8x8 types). */
  matrix?: number;
  /** Ordered levels (of matrix^2) that become a light / dark speck. */
  speckCount?: number;
  /** Light speck ink (raises highlights under a soft-light blend). */
  light?: string;
  /** Dark speck ink (deepens shadows under a soft-light blend). */
  dark?: string;
};

/**
 * Builds the dither tile: a transparent Bayer grid with a dispersed set of
 * light and dark specks placed by ordered threshold, returned as a
 * `url("data:image/svg+xml,...")` string ready for `backgroundImage`. Pure and
 * cheap — the shipped overlay calls it once at module load; the /dev/dither
 * playground calls it live per control change. One implementation, no drift.
 */
export function buildDitherTile({
  matrix = BAYER_SIZE,
  speckCount = SPECK_COUNT,
  light = SPECK_LIGHT,
  dark = SPECK_DARK,
}: DitherTileOptions = {}): string {
  const m = bayer(matrix);
  const max = matrix * matrix;
  let rects = "";
  for (let y = 0; y < matrix; y++) {
    for (let x = 0; x < matrix; x++) {
      const v = m[y][x];
      let fill: string | null = null;
      if (v < speckCount) fill = light;
      else if (v >= max - speckCount) fill = dark;
      if (fill) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${fill}"/>`;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${matrix}" height="${matrix}" viewBox="0 0 ${matrix} ${matrix}" shape-rendering="crispEdges">${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* Baked once at module load from the shipped defaults. */
const DITHER_TILE = buildDitherTile();

const TILE_PX = BAYER_SIZE * CELL_PX;

type DitherOverlayProps = {
  className?: string;
};

/**
 * Static Bayer dither finish for a video cover. Place it directly over the
 * `<video>` layer and below the halftone canvas. The parent fades it out with
 * the film via a ref during the hover crossfade; at rest it holds
 * `DITHER_REST_OPACITY`.
 */
export const DitherOverlay = forwardRef<HTMLDivElement, DitherOverlayProps>(
  function DitherOverlay({ className }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("pointer-events-none absolute inset-0", className)}
        style={{
          backgroundImage: DITHER_TILE,
          backgroundRepeat: "repeat",
          backgroundSize: `${TILE_PX}px ${TILE_PX}px`,
          imageRendering: "pixelated",
          mixBlendMode: BLEND_MODE,
          opacity: DITHER_REST_OPACITY,
        }}
      />
    );
  },
);
