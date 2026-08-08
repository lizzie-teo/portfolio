"use client";

/*
 * EXPLORE / CARDS — direction B: "The Filmstrip Rail".
 *
 * THE WORLD
 *
 *   There are no cards here. No frame, no radius, no shadow, no tint, no
 *   container. Four hard-edged panels sit on flat white and run off both edges
 *   of the viewport, and the only colour on the page comes out of the imagery
 *   itself. The reader moves sideways through the work the way you move through
 *   a contact sheet, and the page's chrome is two small pieces of furniture: a
 *   live clock and the word "(Scroll)". Reference: Vucko, and Shader's
 *   perspective filmstrip.
 *
 *   Against the type index this is the opposite proposition. The index says the
 *   name is the object and the picture is peripheral; the rail says the picture
 *   is the whole thing and the name is a caption in six point type underneath.
 *
 * WHY A RAIL FIXES THE THIN-CATALOGUE PROBLEM. A row of five equal cards reads
 * as a complete inventory, and four of them reads as a short one. A rail has no
 * visible end: panels run off the right edge, so the set reads as a sequence you
 * are part-way through rather than a shelf you can count. Four is plenty for a
 * sequence.
 *
 * PANELS ARE SIZED BY THEIR OWN ASPECT, not cropped to a shared one. That is
 * what stops the rail from being a horizontal grid, and it is why the top and
 * bottom edges of the strip are ragged rather than ruled.
 *
 * MOTION
 *   Native overflow-x, always. Trackpads, touch, shift-wheel, keyboard arrows
 *   and the scrollbar all work because nothing is hijacked.
 *   On a fine pointer, dragging the rail adds momentum: pointer deltas write
 *   scrollLeft directly, and on release a rAF loop decays the last velocity to
 *   zero. Touch is left entirely alone, because the platform's own inertia is
 *   better than anything reimplemented on top of it.
 *   Velocity also drives a small SHEAR. Panels skew a degree or two into the
 *   direction of travel and settle square the moment the rail stops — the strip
 *   behaving like film being pulled past a gate. It is a single MotionValue read
 *   by every panel, so no React render happens per frame.
 *   Exactly one cover runs: whichever panel's centre is nearest the centre of
 *   the viewport. Moving the rail hands the film to the next panel.
 *
 * REDUCED MOTION removes the shear and the momentum entirely (a drag becomes a
 * plain 1:1 scroll, which is what the platform would do anyway) and keeps the
 * centre-panel cover swap, which is content rather than decoration.
 *
 * Content is read whole from ../content.
 */

import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IndustryGlyph } from "../../components/IndustryGlyph";
import { ProjectCover } from "../../components/ProjectCover";
import { getField } from "../../components/projectFields";
import type { CaseStudyEntry } from "../../work/projects";
import { caseStudies } from "../content";
import { coverOf, useMediaQuery, usePlayNextFrame } from "./shared";

/* PANEL SHAPES. Authored per project, not derived and not shared.
   
   A PANEL IS SIZED BY ITS HEIGHT, and its aspect then decides how wide it is —
   which is the opposite of how the rest of the site works and is exactly what
   makes this a filmstrip rather than a horizontal grid. Heights differ per
   project too, so with the strip top-aligned the BOTTOM edge is ragged and the
   captions sit at four different heights. Nothing here shares a crop or a
   baseline.

   Heights are in viewport units because a rail's panel height genuinely IS a
   share of the screen; that sits with the display-type and cover-artwork
   carve-out in style-rules §2 rather than under the spacing scale. The floor
   keeps a panel usable on a short landscape phone. */
type PanelShape = { aspect: string; height: string };

const SHAPES: Record<string, PanelShape> = {
  "funding-finder": { aspect: "aspect-[3/4]", height: "h-[46vh] min-h-56 md:h-[56vh]" },
  "healthdirect-symptom-checker": { aspect: "aspect-square", height: "h-[56vh] min-h-64 md:h-[68vh]" },
  "ap-testing-portal": { aspect: "aspect-[16/9]", height: "h-[34vh] min-h-40 md:h-[44vh]" },
  "macquarie-radar": { aspect: "aspect-[4/5]", height: "h-[50vh] min-h-60 md:h-[60vh]" },
};

const FALLBACK_SHAPE: PanelShape = {
  aspect: "aspect-[4/5]",
  height: "h-[50vh] min-h-60 md:h-[60vh]",
};

/* Shear. Two degrees at full tilt is enough to read as drag and small enough
   that type inside a panel never looks broken. VELOCITY_FULL is the px/frame at
   which the shear maxes out; above it the transform clamps. */
const SHEAR_MAX_DEG = 2;
const VELOCITY_FULL = 40;
/* Momentum decay per frame at 60fps, and the speed below which the loop stops. */
const FRICTION = 0.94;
const MOMENTUM_FLOOR = 0.4;
/* How far the pointer must travel before a press becomes a drag. Below this a
   press is a click and the rail never captures the pointer (see startDrag). */
const DRAG_THRESHOLD = 4;

export function DirectionFilmstripRail() {
  return (
    /* Pure white, edge to edge. Nothing on this page is tinted. */
    <div className="bg-card text-foreground">
      <ChromeRow />
      <Rail />
    </div>
  );
}

/* ── Chrome ───────────────────────────────────────────────────────────────── */

/**
 * The whole of the page furniture: a label, a live local clock, and the
 * instruction. Small, monospaced-feeling, and set on the same baseline so the
 * row reads as a strip of machine readout rather than a header.
 */
function ChromeRow() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    /* Rendered only after mount: a clock printed on the server is wrong by the
       time it reaches the reader, and it would fail hydration on the way. */
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border px-4 py-5 sm:px-6 md:px-8 md:py-6 lg:px-12">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground">
        Selected work
      </p>

      <div className="flex items-baseline gap-4 sm:gap-8">
        {/* Fixed-width tabular time so the row does not twitch every second. */}
        <p
          aria-hidden="true"
          className="hidden text-xs font-medium tabular-nums tracking-[0.16em] text-muted-foreground sm:block"
        >
          {now ?? " "}
        </p>
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground">(Scroll)</p>
      </div>
    </div>
  );
}

/* ── The rail ─────────────────────────────────────────────────────────────── */

function Rail() {
  const railRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [centreSlug, setCentreSlug] = useState<string | null>(null);

  /* One MotionValue for the whole strip: signed scroll velocity, normalised and
     mapped to degrees. Every panel reads the same derived value, so the shear
     costs one transform write per panel per frame and zero React renders. */
  const velocity = useMotionValue(0);
  const shear = useTransform(velocity, [-VELOCITY_FULL, 0, VELOCITY_FULL], [
    SHEAR_MAX_DEG,
    0,
    -SHEAR_MAX_DEG,
  ]);
  const skew = useTransform(shear, (deg) => `${shouldReduce ? 0 : deg}deg`);

  const lastLeft = useRef(0);
  const frame = useRef<number | null>(null);
  const drag = useRef<{
    pointerId: number;
    /** Last seen x, for the per-move delta. */
    x: number;
    /** Where the press started, for the drag threshold. */
    origin: number;
    /** True once the threshold is crossed and the rail has captured. */
    active: boolean;
  } | null>(null);
  const momentum = useRef<number | null>(null);
  /** Set by a real drag, read and cleared by the click guard. */
  const dragged = useRef(false);

  /* Which panel owns the film, and how fast the rail is going: both read off the
     same scroll frame, throttled to one rAF so a fling does not run this per
     scroll event. */
  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    frame.current = null;

    const left = rail.scrollLeft;
    velocity.set(left - lastLeft.current);
    lastLeft.current = left;

    const mid = rail.clientWidth / 2;
    let bestSlug: string | null = null;
    let bestGap = Infinity;
    for (const panel of rail.querySelectorAll<HTMLElement>("[data-panel-slug]")) {
      const gap = Math.abs(panel.offsetLeft - left + panel.offsetWidth / 2 - mid);
      if (gap < bestGap) {
        bestGap = gap;
        bestSlug = panel.dataset.panelSlug ?? null;
      }
    }
    setCentreSlug((current) => (current === bestSlug ? current : bestSlug));
  }, [velocity]);

  const onScroll = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(measure);
  }, [measure]);

  /* The rail comes to rest: velocity decays to zero so the shear settles square
     even when the scroll simply stops without another event. */
  useEffect(() => {
    const id = window.setInterval(() => {
      const rail = railRef.current;
      if (!rail) return;
      if (rail.scrollLeft === lastLeft.current) velocity.set(0);
    }, 120);
    return () => window.clearInterval(id);
  }, [velocity]);

  useEffect(() => {
    measure();
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (momentum.current !== null) cancelAnimationFrame(momentum.current);
    };
  }, [measure]);

  /* Pointer drag with a decaying fling, on fine pointers only. Touch keeps the
     platform's own inertia, which is better than anything rebuilt here, and
     reduced motion keeps the 1:1 drag but skips the fling.

     THE THRESHOLD IS LOAD BEARING, not a nicety. Capturing the pointer on
     pointerdown retargets the whole gesture to the rail, and the browser then
     dispatches `click` to the common ancestor of down and up — the rail, not the
     panel link. Capturing eagerly therefore makes every panel unclickable, which
     is a silent break a screenshot cannot show. So the rail does not capture
     until the pointer has actually travelled DRAG_THRESHOLD, and a plain click
     never enters the drag path at all. Once a drag HAS happened the trailing
     click is swallowed in the capture phase, so releasing over a panel after
     flinging the strip does not open a project by accident. */
  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!finePointer || event.pointerType !== "mouse" || event.button !== 0) return;
      if (momentum.current !== null) {
        cancelAnimationFrame(momentum.current);
        momentum.current = null;
      }
      drag.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        origin: event.clientX,
        active: false,
      };
    },
    [finePointer],
  );

  const moveDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const state = drag.current;
    if (!rail || !state || state.pointerId !== event.pointerId) return;

    if (!state.active) {
      if (Math.abs(event.clientX - state.origin) < DRAG_THRESHOLD) return;
      state.active = true;
      dragged.current = true;
      rail.setPointerCapture(event.pointerId);
      /* Text selection during a drag makes the strip feel like a document
         rather than an object. Toggled imperatively so a drag costs no render. */
      rail.classList.add("select-none");
    }

    const dx = event.clientX - state.x;
    state.x = event.clientX;
    rail.scrollLeft -= dx;
  }, []);

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rail = railRef.current;
      const state = drag.current;
      if (!rail || !state || state.pointerId !== event.pointerId) return;
      const wasActive = state.active;
      drag.current = null;
      rail.classList.remove("select-none");
      if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
      if (!wasActive || shouldReduce) return;

      /* Fling from the velocity the scroll handler already measured, decaying
         to a floor. Any new pointerdown cancels it mid-flight. */
      let speed = velocity.get();
      const step = () => {
        const current = railRef.current;
        if (!current || Math.abs(speed) < MOMENTUM_FLOOR) {
          momentum.current = null;
          return;
        }
        current.scrollLeft += speed;
        speed *= FRICTION;
        momentum.current = requestAnimationFrame(step);
      };
      momentum.current = requestAnimationFrame(step);
    },
    [shouldReduce, velocity],
  );

  /* Swallow the click that follows a real drag, so a fling that happens to end
     over a panel does not navigate. A click with no drag behind it passes. */
  const guardClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragged.current) return;
    dragged.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    /* Native overflow. `overscroll-x-contain` stops a fling at the end of the
       strip from triggering a browser back gesture, which is the one platform
       behaviour worth suppressing here. The rail bleeds off both edges: the
       leading pad matches the page gutter so the first panel lines up with the
       chrome above it, and the trailing pad keeps the end plate off the edge. */
    <div
      ref={railRef}
      onScroll={onScroll}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={guardClick}
      className="flex snap-none items-start gap-8 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-16 pt-6 sm:gap-12 sm:px-6 md:px-8 md:pb-24 lg:gap-16 lg:px-12"
    >
      {caseStudies.map((entry) => (
        <Panel
          entry={entry}
          key={entry.slug}
          playing={centreSlug === entry.slug}
          skew={skew}
        />
      ))}

      <EndPlate skew={skew} />
    </div>
  );
}

/* ── One panel ────────────────────────────────────────────────────────────── */

function Panel({
  entry,
  playing,
  skew,
}: {
  entry: CaseStudyEntry;
  playing: boolean;
  skew: MotionValue<string>;
}) {
  const shape = SHAPES[entry.slug] ?? FALLBACK_SHAPE;
  const cover = coverOf(entry);

  return (
    <div className="shrink-0" data-panel-slug={entry.slug}>
      <Link
        href={`/work/${entry.slug}`}
        aria-label={`Open the ${entry.title} case study. ${entry.tagline}`}
        className="group block outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-card"
      >
        {/* The panel. Square corners, no border, no shadow, no ground — the
            artwork is the object. Shear is applied here rather than on the
            wrapper so the caption underneath stays upright and readable while
            the picture leans. */}
        <motion.div
          className={`relative w-auto overflow-hidden bg-muted ${shape.height} ${shape.aspect}`}
          style={{ skewX: skew, transformOrigin: "50% 100%" }}
        >
          {cover ? (
            <PanelCover cover={cover} playing={playing} />
          ) : (
            <ColourPlate entry={entry} />
          )}
        </motion.div>

        {/* The caption: name, then the sector in parentheses. Six point type
            doing a job that a card would have spent a whole header on. */}
        <p className="mt-4 max-w-[34ch] text-xs leading-relaxed text-foreground">
          <span className="font-semibold">{entry.title}</span>
          {entry.industry ? (
            <span className="text-muted-foreground"> {`(${entry.industry})`}</span>
          ) : null}
        </p>
      </Link>
    </div>
  );
}

function PanelCover({
  cover,
  playing,
}: {
  cover: NonNullable<ReturnType<typeof coverOf>>;
  playing: boolean;
}) {
  const play = usePlayNextFrame();

  return (
    <ProjectCover
      cover={cover}
      hovered={play && playing}
      className="absolute inset-0 h-full w-full"
    />
  );
}

/**
 * The panel for the entry with no film, and this direction's answer to it.
 *
 * A rail whose whole premise is "the imagery does the colour" cannot leave one
 * panel pale and empty, so this one becomes a FLOOD: the project's own deepened
 * artwork ink from projectFields.ts, filling the panel, with the name reversed
 * out of it. Funding Finder's ink is #7d0c37, and white on it measures 9.9:1.
 *
 * That reads as a deliberate colour plate in a strip of films rather than a
 * missing frame, and it costs no new colour — the value is already an authored
 * artwork constant for that project.
 */
function ColourPlate({ entry }: { entry: CaseStudyEntry }) {
  const field = getField(entry.slug);

  return (
    <div
      className="absolute inset-0 flex flex-col justify-between p-5 text-white sm:p-6 md:p-8"
      style={{ backgroundColor: field.ink }}
    >
      <IndustryGlyph industry={entry.industry} className="size-8 shrink-0 md:size-10" />
      <p className="max-w-[12ch] text-balance font-heading text-2xl font-medium leading-[1.05] tracking-[-0.02em] md:text-3xl">
        {entry.title}
      </p>
    </div>
  );
}

/**
 * The end of the strip, and this direction's answer to the coming-soon tile.
 *
 * Not a panel and not a project: a hairline outline the width of the narrowest
 * panel, holding one line of type. A filmstrip already has a natural place for
 * "there is more to come" — the leader at the end of the reel — so the
 * placeholder becomes that rather than a fifth object competing with four
 * pictures.
 */
function EndPlate({ skew }: { skew: MotionValue<string> }) {
  return (
    <div className="shrink-0">
      <motion.div
        className="flex h-[38vh] min-h-48 w-auto items-end border border-border p-5 aspect-[3/4] md:h-[46vh] md:p-6"
        style={{ skewX: skew, transformOrigin: "50% 100%" }}
      >
        <p className="text-xs leading-relaxed text-muted-foreground">
          More work is on the way.
        </p>
      </motion.div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">End of reel</p>
    </div>
  );
}
