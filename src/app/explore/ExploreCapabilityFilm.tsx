"use client";

/*
 * EXPLORE — the sanctioned way to mount a capability film.
 *
 * A thin wrapper around the shipped `HeroKeywordVideo`. Do NOT hand-roll a
 * <video> for these clips: the footage is a bright lattice on a near-black
 * field, and getting it to dissolve into the page rather than sit in a visible
 * black rectangle takes a `lighten` blend over a tone-tracking backdrop plus a
 * circular alpha feather. That is all solved in HeroKeywordVideo (and argued in
 * .docs/video-blend.md). This wrapper adds only the two things /explore needs
 * on top of it.
 *
 * 1. A SIZED, POSITIONED FRAME. HeroKeywordVideo paints `absolute inset-0`, so
 *    it needs a parent with dimensions. This gives it a square one by default.
 *
 * 2. A TOUCH ANSWER. The live hero reveals a film on hover, which does not
 *    exist on a phone — so on a coarse pointer these would simply never play.
 *    Pass `autoPlayInView` and the film lights while its frame is on screen
 *    instead, on coarse pointers only. Fine-pointer devices keep hover/focus as
 *    the trigger, because a grid of films all playing at once is noise.
 *
 * LOADING. HeroKeywordVideo mounts at `preload="metadata"`, so a mounted film
 * costs a metadata range request (tens of KB), not the clip. The 0.9MB–3.0MB
 * body is only fetched when something calls play(), i.e. one clip at a time on
 * hover, or the in-view clips on touch. That is why mounting several on one page
 * is affordable and why nothing here should be changed to `preload="auto"`.
 *
 * SURFACE CONTRACT. The `dark` flag tells the film which band tone to lighten
 * against. It MUST match the actual surface behind it: `false` for --secondary,
 * `true` for --grout. Any other surface will show the film's black field as a
 * rectangle. This is the one thing that silently looks broken if you get it
 * wrong, and a screenshot on the wrong surface is how you would find out.
 */

import { useEffect, useRef, useState } from "react";
import { HeroKeywordVideo } from "../components/HeroKeywordVideo";
import type { CapabilityFilm } from "./content";

export function ExploreCapabilityFilm({
  film,
  active = false,
  dark = false,
  autoPlayInView = false,
  className = "",
}: {
  film: CapabilityFilm;
  /** Hover/focus state owned by the caller. */
  active?: boolean;
  /** True only when the film sits on --grout. See the surface contract above. */
  dark?: boolean;
  /** Light the film while it is on screen, on coarse pointers only. */
  autoPlayInView?: boolean;
  /** Sizing for the frame. Defaults to a square that fills its column. */
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [inViewOnTouch, setInViewOnTouch] = useState(false);

  useEffect(() => {
    if (!autoPlayInView) return;
    const frame = frameRef.current;
    if (!frame) return;

    // Hover-capable devices keep hover as the trigger; only coarse pointers
    // fall back to "playing because it is on screen".
    const coarse = window.matchMedia("(hover: none)");
    if (!coarse.matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInViewOnTouch(entry.isIntersecting),
      { rootMargin: "-20% 0px -20% 0px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [autoPlayInView]);

  return (
    <div
      ref={frameRef}
      className={`relative ${className || "aspect-square w-full"}`}
    >
      <HeroKeywordVideo
        active={active || inViewOnTouch}
        dark={dark}
        src={film.src}
        poster={film.poster}
      />
    </div>
  );
}
