"use client";

import { useSyncExternalStore } from "react";

// Matches Tailwind's `lg` breakpoint (1024px) — the width at which case-study
// modules switch from the mobile single-column reading flow to their immersive
// two-column desktop compositions.
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

// Server/first-paint snapshot is always mobile (false). The consumers of this
// hook are far below the fold, so a desktop viewport's hydration correction is
// never visible — and this keeps the whole site mobile-first by default.
function getServerSnapshot() {
  return false;
}

/**
 * `true` at Tailwind's `lg` breakpoint and up. Reactive across resizes via
 * `matchMedia`, and the first client-store hook in the repo.
 *
 * It exists because some desktop compositions cannot be gated by CSS alone:
 * `CollapsingLeaf` wires `useScroll` + a sticky pin that runs at every width
 * (`CollapsingLeaf.tsx:93-114`), so a media stage built on it must be swapped
 * out in JS rather than hidden with a `lg:` class.
 */
export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
