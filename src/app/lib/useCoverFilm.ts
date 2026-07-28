"use client";

import { useEffect, type RefObject } from "react";

type UseCoverFilmOptions = {
  /** Whether the film should be playing right now (paused otherwise). */
  play: boolean;
};

/**
 * Shared film driver for animated covers. Every in-view cover loops
 * continuously; this hook just plays or pauses the film in response to `play`.
 * The `loop` attribute stays on so the hover dissolve has a moving film to work
 * over.
 *
 * `play`: false pauses the film; true calls `play().catch(...)`. A rejected
 * `play()` (autoplay blocked on low-power iOS) is swallowed — the first decoded
 * frame stands in.
 */
export function useCoverFilm(
  videoRef: RefObject<HTMLVideoElement | null>,
  { play }: UseCoverFilmOptions,
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!play) {
      video.pause();
      return;
    }
    video.play().catch(() => {
      /* Autoplay blocked: the first decoded frame stands in. */
    });
  }, [play, videoRef]);
}
