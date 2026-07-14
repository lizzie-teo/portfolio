"use client";

import { useEffect, useRef, type RefObject } from "react";

type UseCoverFilmOptions = {
  /** Whether the film should be playing right now (paused otherwise). */
  play: boolean;
  /** Whether this cover holds a playback grant and is counting one full pass. */
  passActive: boolean;
  /** Fired once the current pass completes (or play() is rejected mid-grant). */
  onPassEnd: () => void;
};

/**
 * Shared film driver for animated covers. Replaces each cover's per-cover
 * play/pause effect and detects the end of one full pass of the film without
 * ever seeking — the `loop` attribute stays on because the hover dissolve
 * needs the film to keep looping underneath it.
 *
 * - `play`: false pauses the film; true calls `play().catch(...)`. A rejected
 *   `play()` while a pass is active (autoplay blocked on low-power iOS) counts
 *   as a completed pass so the queue never stalls waiting on a film that will
 *   never run.
 * - `passActive`: on its rising edge, elapsed playback time is accumulated from
 *   `timeupdate` events, wrap-aware (a loop resets `currentTime` toward 0), and
 *   `onPassEnd` fires once elapsed reaches the film's duration.
 *
 * Callbacks are read through a ref so a fresh `onPassEnd` identity never
 * re-subscribes the listener.
 */
export function useCoverFilm(
  videoRef: RefObject<HTMLVideoElement | null>,
  { play, passActive, onPassEnd }: UseCoverFilmOptions,
) {
  const onPassEndRef = useRef(onPassEnd);
  const passActiveRef = useRef(passActive);

  useEffect(() => {
    onPassEndRef.current = onPassEnd;
  }, [onPassEnd]);

  useEffect(() => {
    passActiveRef.current = passActive;
  }, [passActive]);

  /* Play / pause the film. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!play) {
      video.pause();
      return;
    }
    video.play().catch(() => {
      /* Autoplay blocked: the first decoded frame stands in. If a pass was
         counting on this playback, release the grant so the queue advances. */
      if (passActiveRef.current) onPassEndRef.current();
    });
  }, [play, videoRef]);

  /* Pass-end detection: accumulate elapsed time across loop wraps, never seek. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !passActive) return;

    let elapsed = 0;
    let last = video.currentTime;
    let done = false;

    const onTimeUpdate = () => {
      const t = video.currentTime;
      const duration = video.duration;
      if (!duration || Number.isNaN(duration)) {
        last = t;
        return;
      }
      elapsed += t >= last ? t - last : duration - last + t;
      last = t;
      if (!done && elapsed >= duration - 0.05) {
        done = true;
        onPassEndRef.current();
      }
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, [passActive, videoRef]);
}
