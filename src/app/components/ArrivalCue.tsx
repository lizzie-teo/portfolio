"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

type Landing = { key: number; left: number; top: number; height: number };

/**
 * The arrival payoff for an in-page anchor jump. When a chapter or section is
 * navigated to from the rail, dock, or marker, useAnchorScroll fires a
 * `case:arrival` event once the glide settles; this overlay answers it with a
 * single coral marker in the tile's left margin, top-aligned with the section
 * header (or, on a chapter title page, with the opening illustration) — the
 * same coral "you are here" language as the dock/rail pip, now arrived at the
 * title itself, so the navigation and the destination read as one motion
 * system. The marker grows in from its top, holds a beat, and fades, so a jump
 * reads as a deliberate arrival rather than a teleport.
 *
 * It is a decorative confirmation, not information: the scroll itself, the URL
 * hash, and the focus move (also in useAnchorScroll) carry the actual arrival.
 * So the cue is a large, brief accent under motion and is suppressed entirely
 * under reduced motion — the hook stops announcing and this renders nothing.
 * Mounted once per case study; a fixed, pointer-transparent, aria-hidden layer.
 */
export function ArrivalCue() {
  const shouldReduce = useReducedMotion();
  const [landing, setLanding] = useState<Landing | null>(null);

  useEffect(() => {
    if (shouldReduce) {
      return;
    }
    let hideTimer = 0;
    const onArrival = (event: Event) => {
      const id = (event as CustomEvent<{ id: string }>).detail?.id;
      if (!id) {
        return;
      }
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      const rect = element.getBoundingClientRect();
      // A vertical coral marker in the tile's left margin, top-aligned with the
      // section's header so the "you are here" accent starts exactly where the
      // title begins. Chapter labels its lede `#<id>-heading`; ArtifactSection
      // and the self-tiled modules (e.g. JourneyMap → "User journey") open with
      // an h2/h3. A chapter title page opens on its illustration plate above the
      // heading, so when a decorative plate sits before the heading the header
      // block visually begins there — start from the plate instead.
      const heading =
        document.getElementById(`${id}-heading`) ??
        element.querySelector("h1, h2, h3");
      let anchorEl: Element | null = heading;
      const plate = element.querySelector('img[aria-hidden="true"]');
      if (
        plate &&
        heading &&
        (plate.compareDocumentPosition(heading) &
          Node.DOCUMENT_POSITION_FOLLOWING) !==
          0
      ) {
        anchorEl = plate;
      }
      const anchorRect = (anchorEl ?? element).getBoundingClientRect();
      // Track the header/illustration height but clamp it, so the marker reads
      // as a tick starting at the header rather than a full-height bar. Its top
      // edge sits on the header's (or plate's) top edge.
      const MIN_HEIGHT = 32;
      const MAX_HEIGHT = 72;
      const height = anchorEl
        ? Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.round(anchorRect.height)))
        : 56;
      setLanding({
        key: performance.now(),
        left: Math.max(0, Math.round(rect.left)),
        top: Math.round(anchorRect.top),
        height,
      });
      window.clearTimeout(hideTimer);
      // Hold, then let AnimatePresence play the fade-out exit.
      hideTimer = window.setTimeout(() => setLanding(null), 650);
    };
    window.addEventListener("case:arrival", onArrival as EventListener);
    return () => {
      window.removeEventListener("case:arrival", onArrival as EventListener);
      window.clearTimeout(hideTimer);
    };
  }, [shouldReduce]);

  if (shouldReduce) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence>
        {landing ? (
          <motion.span
            key={landing.key}
            initial={{ opacity: 0, scaleY: 0.25 }}
            animate={{
              opacity: 1,
              scaleY: 1,
              transition: {
                opacity: { duration: motionDuration.fast, ease: motionEase.out },
                scaleY: { duration: motionDuration.base, ease: motionEase.out },
              },
            }}
            exit={{
              opacity: 0,
              transition: { duration: motionDuration.slow, ease: motionEase.in },
            }}
            style={{
              left: landing.left,
              top: landing.top,
              height: landing.height,
              transformOrigin: "top",
            }}
            className="absolute block w-1 rounded-full bg-rail-tile-active"
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
