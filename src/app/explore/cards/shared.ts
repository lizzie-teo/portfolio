"use client";

/*
 * EXPLORE / CARDS — the small amount of machinery all four directions need.
 *
 * Deliberately tiny. The whole point of this page is that the four directions
 * share content and share NOTHING else: no layout helper, no type scale, no
 * surface, no motion recipe. Anything that would let two of them read as the
 * same stylesheet belongs in the direction file, not here.
 */

import { useEffect, useState } from "react";
import type { CaseStudyEntry, WorkCoverId } from "../../work/projects";

/** The registered animated cover for an entry, or undefined if it has none. */
export function coverOf(entry: CaseStudyEntry): WorkCoverId | undefined {
  return entry.media && "cover" in entry.media ? entry.media.cover : undefined;
}

/**
 * True one animation frame after mount.
 *
 * A cover has never before been mounted ALREADY active — on the home card it is
 * mounted at rest and hovered later — and mounting one in that state trips
 * React's StrictMode double-invoke in development: the cover's `startLoop`
 * latches its `runningRef` on the first pass, StrictMode's cleanup cancels the
 * rAF it just scheduled, and the second pass returns early on the latched ref.
 * The loop never runs and the plate sits on a flat field.
 *
 * Handing a freshly mounted cover `hovered={false}` for one frame and flipping
 * it after means it always sees the transition it is built around, in
 * development and in production alike. It costs 16ms, which disappears inside
 * whatever entrance the plate is already playing.
 */
export function usePlayNextFrame(): boolean {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPlay(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return play;
}

/**
 * True once the viewport matches `query`.
 *
 * Used where a direction makes a claim about what is RUNNING rather than what is
 * visible: `hidden lg:block` still mounts and animates its subtree, so a
 * behaviour that is supposed to belong to one breakpoint has to be gated on the
 * same query the layout uses. Starts `false` so the server and first client
 * render agree, and everything that reads it has a complete state at `false`.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
