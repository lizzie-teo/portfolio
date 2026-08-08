"use client";

/*
 * ANNOTATED — the film plate both directions mount their capability films in.
 *
 * WHY THIS EXISTS. `ExploreCapabilityFilm` is the sanctioned mount (it wraps the
 * shipped `HeroKeywordVideo`, which owns the lighten blend, the tone-tracking
 * backdrop, and the circular edge feather). But it takes `active` as a prop and
 * leaves the trigger to the caller, because on the live hero the trigger is a
 * hovered keyword. These two directions have no keywords: the film is a plate on
 * the page. So this component owns the one thing missing — a pointer region that
 * lights the film — and adds nothing else.
 *
 * WHY IN VIEW AND NOT HOVER, which is the correction this component exists to
 * make. `active` does not only start playback upstream: it drives the frame's
 * OPACITY. At `active={false}` the whole plate is invisible, which is exactly
 * right for a hover payoff (nothing shows until a word is lit) and exactly wrong
 * for a page plate, where an unhovered film would leave a screen sized hole in
 * the layout and a caption under nothing. A fine pointer reader who never moved
 * the mouse over the disc would never learn the films exist, which is the
 * problem this whole exploration set out to fix.
 *
 * So the plate lights when it enters the viewport, on every pointer type, and
 * hovering the region lights it early. What lights it, by case:
 *
 *   in view          an IntersectionObserver on the plate, inset so the film
 *                    lights once it is properly on screen rather than as its
 *                    first pixel crosses the fold.
 *   pointer          the plate's own region. The handler sits on the OUTER
 *                    element, not the frame, so it lights from the copy too.
 *   coarse pointer   `autoPlayInView` is still forwarded, so the sanctioned
 *                    touch path upstream stays in force; the two triggers simply
 *                    agree.
 *   reduced motion   nothing plays, ever. HeroKeywordVideo gates play() on the
 *                    media query itself, and the blended poster stands in as the
 *                    static composition — which is why the plate is visible at
 *                    all under reduced motion, and why every plate here carries a
 *                    written caption. The footage is never load bearing.
 *
 * WHAT THAT COSTS, stated plainly. A clip's body (0.9MB to 3.0MB) is fetched the
 * moment something calls play(), so scrolling past a plate now downloads it.
 * Each direction mounts two, and neither is in the initial viewport at desktop
 * widths except the one in direction two's hero. Nothing here is ever set to
 * `preload="auto"`, so the cost is still paid on reach rather than on load.
 *
 * SURFACE CONTRACT. `dark` is forwarded untouched and still means exactly what it
 * means upstream: false for a plate sitting on --secondary, true for one on
 * --grout. Nothing else blends. Both directions below record which surface each
 * plate sits on in a comment beside the call.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CapabilityFilm } from "../content";
import { ExploreCapabilityFilm } from "../ExploreCapabilityFilm";

export function AnnotatedFilmPlate({
  film,
  dark = false,
  className = "",
  frameClassName = "",
  children,
}: {
  film: CapabilityFilm;
  /** True only where the plate sits on --grout. See the surface contract above. */
  dark?: boolean;
  /** The hover region. Give it the whole plate, copy included. */
  className?: string;
  /** Sizing for the film frame itself. Keep it square or near square: the
      upstream frame draws a square inscribed circle and would spill out of a
      wide, short box. */
  frameClassName?: string;
  /** Caption and any annotation, rendered under the frame inside the region. */
  children?: ReactNode;
}) {
  const plateRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const plate = plateRef.current;
    if (!plate) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "-15% 0px -15% 0px" },
    );
    observer.observe(plate);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={plateRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={className}
    >
      <ExploreCapabilityFilm
        film={film}
        active={inView || hovered}
        dark={dark}
        autoPlayInView
        className={frameClassName}
      />
      {children}
    </div>
  );
}
