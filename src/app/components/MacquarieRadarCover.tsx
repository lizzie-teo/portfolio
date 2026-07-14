"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { useCoverFilm } from "../lib/useCoverFilm";

const NOOP = () => {};

const ASSETS = "/assets/macquarie-uni";
const VIDEO_SRC = `${ASSETS}/radar.mp4`;
const POSTER_SRC = `${ASSETS}/radar-poster.jpg`;

/* Artwork field behind the film — a deep plum drawn from the project's own
   brand, visible only for the instant before the poster paints. This is
   scene artwork, not a shell token: home cards stay neutral, and a cover
   carries its own imagery (see ApTestingPortalCover / SymptomCheckerCover). */
const FIELD = "#2b0d20";

type MacquarieRadarCoverProps = {
  /** Card hover state, owned by the parent card. There is no canvas dissolve
      here, but hover still resumes the film (independent of the queue) so a
      rested card comes alive under the pointer; the card face fades its title
      scrim on hover to reveal the clean footage. */
  hovered?: boolean;
  className?: string;
  /** True while this card holds the one-pass playback grant; the film plays a
      single pass then freezes on its frame. */
  filmActive?: boolean;
  /** Fired when the pass ends, releasing the grant to the next card. */
  onFilmEnd?: () => void;
};

/**
 * Cover for the Macquarie Radar card: the campus film plays full-bleed and
 * cropped to the card, its black-and-white-to-colour reveal running one granted
 * pass on scroll-in under the card's own title and tags, then freezing on its
 * frame. Deliberately simple — no canvas dissolve — with the fuller motion
 * centrepiece left to a later pass; hover resumes the film so a rested card
 * still comes alive under the pointer. Under reduced motion it holds on its
 * poster (a strong colour-reveal frame) and never plays.
 */
export function MacquarieRadarCover({
  hovered = false,
  className,
  filmActive = false,
  onFilmEnd,
}: MacquarieRadarCoverProps) {
  const shouldReduce = useReducedMotion();
  const reduce = !!shouldReduce;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(containerRef);

  /* Plays a single granted pass on scroll-in, then freezes on its frame; hover
     resumes it independent of the queue. Off-screen and reduced motion hold the
     poster. Pass-end detection and play/pause live in useCoverFilm. */
  useCoverFilm(videoRef, {
    play: !reduce && inView && (hovered || filmActive),
    passActive: filmActive && !reduce,
    onPassEnd: onFilmEnd ?? NOOP,
  });

  return (
    <div
      ref={containerRef}
      className={cn("@container overflow-hidden", className)}
      style={{ backgroundColor: FIELD }}
    >
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        muted
        playsInline
        loop
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
