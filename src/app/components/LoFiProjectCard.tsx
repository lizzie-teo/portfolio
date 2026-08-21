"use client";

/*
 * LO-FI PROJECT CARD — the home card undeveloped, and colour as the reward.
 *
 * ProjectCard's composition exactly, with its resting state stripped back to
 * greyscale line work and every bit of that colour returned on hover. The card
 * is the same object; what changes is that it starts unfinished.
 *
 * THE ONE IDEA: THE CARD DEVELOPS. At rest it is a dark plate, a hairline edge,
 * light line work and a drawn mark — the project before it had a palette. Point
 * at it and the halftone forms IN THE COLOUR THE CARD IS ABOUT TO BECOME — not a
 * brand ink chosen for the dots, but the payoff panel's own colour exposed until
 * it reads on the plate, so the hover is one colour event and not two (see
 * `halftoneInk`). It scatters apart, and what it clears to is that same colour
 * sealed: a plate the client signs, their mark reversed at the head,
 * and the project's RESULT at the foot, the outcome figure counting up with its
 * supporting line beneath it. Colour is not a styling choice on this card, it is
 * the vehicle, and it arrives on exactly the ramps the gradient card already
 * runs. Nothing about the motion is new; what is new is that it now has somewhere
 * to travel FROM and something to arrive AT.
 *
 * THE PAYOFF IS THE RESTING CARD'S OWN SKELETON, and that is the most recent and
 * most consequential change to it. It used to be composed in a column of its
 * own, with its own padding and its own flex ratios, and it showed: the panel
 * sealed with everything a step out of place, because two copies of one
 * composition drift the moment either is touched. Both states now wear one
 * `CardFrame` — same gutters, same airs in the same ratios, same title box, and
 * the payoff renders the resting card's own terminal group and foot block,
 * invisibly, purely to hold their heights. What differs is only what goes in
 * each slot.
 *
 * TWO THINGS FALL OUT OF THAT, and they are the composition:
 *
 *   the mark hangs off the top of the TITLE BOX, so its ink starts on exactly
 *   the line the project's name starts on. Through the dissolve one replaces the
 *   other in place.
 *
 *   the air is equal, head and foot, measured to the INK. The distance from the
 *   card's top edge to the top of the mark equals the distance from the bottom of
 *   the result's label to the bottom edge, and it is not two tuned numbers — it
 *   is the column's `grow-7` head air and its `grow-7` foot air, the same
 *   declaration twice, which is how the resting card has always stated that
 *   equality.
 *
 * THE FIGURE IS SET AS THE PROJECT NAME IS SET — the h2's face, step, weight,
 * leading and tracking, quoted rather than re-specified. It used to be fitted
 * display type, sized per value to fill the panel's measure, which meant every
 * card's figure was a different size and none of them was the title's. One voice
 * across both states is worth more than a bigger number.
 *
 * WHAT THE ARRANGEMENT COSTS. Mark at the head and result at the foot means the
 * result no longer lands on anything the resting card puts there — the resting
 * foot carries a tag, a glyph, and an annotation block, and the figure lands on
 * the foot air's line rather than replacing any one of them. That is a real loss
 * of the swap-in-place correspondence and it is named here rather than papered
 * over. What survives is the mark on the title's line, and the type, which is
 * why the figure quoting the h2 matters more now than it did.
 *
 * THE PAYOFF USED TO BE A LOGO ON A PALE TINT, and that is the second inversion
 * this card has taken. The colour flood worked and then had nothing to say: a
 * mark centred on a brand tint is a slide, and the strongest fact the registry
 * holds about each project was sitting in the foot block at annotation size,
 * where the dissolve then wiped it away. The card was spending its loudest
 * moment on the least specific thing it knows. Now the dissolve resolves into a
 * signed result: whose work it was, and what it did. The colour event did not go
 * away — it is the halftone, which is where it always actually was.
 *
 * IT USED TO REST LIGHT, and the inversion is the most consequential change this
 * card has taken. See `loFiInk` for the full reasoning: near-white paper on the
 * warm shell ground put card, hairline, and background within a few percent of
 * each other in luminance, which reads as deliberate for four cards beside a
 * colourful row and as fatiguing for a whole section of them. On a dark plate the
 * same line work stops being drained paper and becomes drafting, and the reveal
 * gets much louder — pale brand tints arriving out of darkness rather than out of
 * light grey.
 *
 * WHAT IS LO-FI AT REST, precisely, since "lo-fi" is easy to wave at:
 *
 *   the field       gone. A flat plate, no blooms, no gradient at all.
 *   the ink         one warm near-white across every card, not each project's own
 *                   brand ink — four different tintings would read as a bug where
 *                   one shared ink reads as a decision.
 *   the edge        a hairline. The finished card separates by shadow alone; an
 *                   unfinished one admits to being a drawn rectangle.
 *   the mark        the same industry glyph at the same size, drawn rather than
 *                   inked.
 *   the foot block  one annotation row, and only when the entry has something to
 *                   put in it — see FootBlock.
 *
 * WHAT IS UNCHANGED: the whole composition. One equal margin at head and foot,
 * the title box floored so a row of tags lands on one line, the declared silence,
 * the tag and mark held together as one terminal group, the display face and its
 * exact sizes. ProjectCard's header derives all of it at length and none of it is
 * re-argued here — this is a treatment of that card, not a redesign of it.
 *
 * WHERE THE OUTCOME LIVES, AND THE THREE PLACES IT HAS LIVED. The grid used to
 * tell a recruiter what each PROJECT was and never what came of it: "Making
 * certification workflows easier to read" is a description, "20 to 30 percent
 * less manual effort for testers" is a result. So the registry grew an `outcome`
 * and the card had to find a home for it.
 *
 *   the centre column   tried first, directly under the title at display size,
 *                       and lost. The title box floors with `items-start` so its
 *                       slack falls BELOW the title, which made the title-to-
 *                       outcome gap two or three times the outcome-to-tag gap on
 *                       every two-line title; and "3 months" is a phrase, not a
 *                       figure, so one step under the title in the same face it
 *                       read as a subtitle and made Funding Finder a two-headed
 *                       card. Recorded so it is not re-proposed.
 *   the foot block      shipped, at annotation size, hanging off a rule. Honest,
 *                       scannable, and it cost the card its head/foot equality.
 *   the payoff, alone   where it is now. The hover states the result at the
 *                       project title's own size on the client's own ground, and
 *                       printing it at the foot as well made the reveal a repeat
 *                       rather than an arrival — the resting card was spoiling
 *                       its own reveal. So the resting card says what the project
 *                       IS and the payoff says what it DID, each once.
 *
 * That last move is what emptied the foot block, gave the card its head/foot
 * equality back, and made the link's accessible name responsible for stating the
 * outcome to assistive tech. See FootBlock and `ariaLabel`.
 *
 * Outcome values are sourced from each project's own published write-up and never
 * written for the card — the rules that keep that honest live on `outcome` in
 * projects.ts.
 *
 * WHAT IS SHARED AND WHAT IS STILL COPIED. The PAYOFFS table has moved out to
 * projectPayoffs.ts, because the gallery's feature item shows the same brand
 * panels at rest and two copies of a client's colour is how a portfolio ends up
 * putting a reversed lockup on the wrong ground. The ramp and timing constants
 * below are still duplicated from ProjectCard rather than imported, and both
 * copies are edited together — the ruling, drift, comet wake, scatter span, and
 * payoff ramps were re-tuned in one pass across both files so /explore/lofi-cards
 * stays a fair test of the treatment. That is a duplicate kept honest by hand,
 * which is exactly the argument for the two cards collapsing into one component
 * with the rest state passed in.
 *
 * WHAT IS NO LONGER SHARED IS THE COLOUR. ProjectCard is the pale control and
 * keeps its hand-picked mid-tone ink from projectFields.ts; this card derives its
 * ink from the ground it develops into and reads nothing from that table. See
 * `halftoneInk`, and the header of /explore/lofi-cards for what the comparison
 * now holds constant.
 */

import Link from "next/link";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import { workEntryHref, type WorkEntry } from "../work/projects";
import { IndustryGlyph } from "./IndustryGlyph";
import { halftoneInk, loFiInk, loFiWriting } from "./loFiInk";
import { PAYOFFS, payoffInk } from "./projectPayoffs";
import { articleCardHeading, projectCardHeading } from "./typography";

/* MOTION CONSTANTS — ProjectCard's, copied verbatim (see the header). Both
   copies were re-ruled together in the pass described below, so they still are
   verbatim and /explore/lofi-cards is still a one-variable comparison. */

/* THE RULING IS A CELL SIZE, NOT A COLUMN COUNT, and this is the change the card
   most needed. A fixed 84 columns made the screen get FINER as the card got
   smaller, which is backwards — a halftone ruling belongs to the press, not to
   the size of the print. Measured on the home grid, a card runs about 250px wide
   (three across at `xl`, the narrowest the layout ever produces) up to its
   `max-w-md` cap of 448px, so 84 columns landed 3.0px to 5.3px cells and roughly
   a 3.6px dot. At that size no eye can follow one speck: the hover read as a
   colour flood that turned to television snow and then got covered, and the
   scatter this file spends most of its length describing was invisible.

   Derived from the container's CSS width (not its device-pixel width) so the
   cell holds its physical size on a retina screen, and clamped at both ends.
   CELL_PX, MIN_COLS and the whole recipe below are the animated covers' — see
   `.docs/cover-effects.md` and SymptomCheckerCover, which screens a synthesized
   field exactly like this one does, at a ruling the eye can count. One press
   across the site.

   What the clamp actually does here: every card the grid produces below ~364px
   is held at MIN_COLS, so cells run 8.9px at the narrowest card and 13.2px at
   the widest, and the DOT is 6px to 15px across depending on its luminance.
   MAX_COLS is a guard rather than a working value — the card's own `max-w-md`
   caps it at 34 columns — and exists so a wider future card cannot slide back
   toward noise. */
const CELL_PX = 13;
const MIN_COLS = 28;
const MAX_COLS = 44;
const LUM_CUTOFF = 0.06;
const DOT_MAX = 0.6;
const DOTIFY_MS = 280;
const REVEAL_MS = 760;

/* Per-dot stagger, and how far each dot flies as a fraction of card width.

   THE DRIFT DOUBLED WITH THE DOTS. At 0.17 a dot travelled about 50px on a
   300px card, which at the old 3.6px ruling was fourteen dot widths and read as
   flight, and at the new one is four and reads as a shiver. The magnitude spread
   widened too (0.25x..1.20x, against 0.40x..1.00x) so some dots plainly outrun
   others and the field opens unevenly instead of expanding as one sheet — at
   high density a uniform random scatter CONSERVES density, which is the other
   half of why the old dissolve looked like snow. */
const STAGGER = 0.4;
const SCATTER_DRIFT = 0.34;
const DRIFT_MIN = 0.25;
const DRIFT_SPREAD = 0.95;

/* THE SCATTER OWNS THE FIRST TWO THIRDS OF THE REVEAL RAMP, and the plate owns
   the rest. This constant is new, and it is what makes the payoff an arrival
   again now that the dots are big enough to watch.

   The dissolve is back loaded by construction: position is drift x (1 - easeOut
   cubic(local)), so a dot barely moves through the first half of its own
   schedule and then darts out. Running that over the WHOLE reveal ramp put the
   travel at reveal 0.6..1.0 — underneath a panel that was already opaque at
   0.66. The panel was doing all of the clearing and the scatter never actually
   cleared anything; it did not show at 3.6px, and at 10px it would have been the
   whole effect happening behind a curtain.

   So the dot maths runs on `reveal / SCATTER_SPAN`, clamped: the field is fully
   flown and gone at reveal 0.66, which is 500ms after the crossfade, and the
   panel then seals onto a plate the dots have genuinely left. Nothing else about
   the gesture lengthens — the mark lands 46ms later than it used to. */
const SCATTER_SPAN = 0.66;

/* THE MOTION TRAIL, ported from the covers with the ruling that makes it
   readable. A dot redrawn at a new position each frame is a dot that has MOVED;
   it never reads as one that is MOVING. So a dot in flight is stroked back along
   its own drift vector before it is filled, the length proportional to its
   instantaneous speed — 3(1 - local)^2, the derivative of the position ramp,
   which is exactly zero while the dot sits in the assembled halftone (so the
   rest state is untouched circles) and largest as it accelerates away.

   It is a COMET, not a capsule: the wake is stroked at TRAIL_ALPHA of the dot's
   alpha and TRAIL_WIDTH of its width, then the head is filled at full alpha on
   top. Both reductions are load bearing — an evenly lit elongated shape is read
   by the eye as an OBJECT of that shape, so a full-alpha, full-width smear turns
   a scattering halftone into a field of tic-tacs. Capped at TRAIL_MAX_R dot
   radii so a fast dot smears rather than becoming a dash.

   This is the one ingredient that only pays at the new ruling. At 3.6px a wake
   two thirds of 3.6px wide and capped at 5px long is sub-pixel gravy; at 10px it
   is the difference between a field that comes apart and one that dissolves. */
const TRAIL_SCALE = 0.022;
const TRAIL_ALPHA = 0.3;
const TRAIL_WIDTH = 0.62;
const TRAIL_MAX_R = 3;

/* THE PAYOFF RAMPS, re-timed against SCATTER_SPAN rather than re-tuned by feel.
   The panel starts at 0.42, by which point the median dot is a third of the way
   out and a tenth of the field has already gone; it seals at 0.72, just after
   the last dot leaves at 0.66; and the mark rises at 0.78 onto colour that is
   fully sealed. The old 0.30 / 0.66 / 0.72 were the same intent measured against
   a scatter that never completed. */
const PANEL_FADE_FROM = 0.42;
const PANEL_FADE_TO = 0.72;
const LOGO_AT = 0.78;
const TITLE_FADE_FROM = 0.2;
const TITLE_FADE_TO = 0.6;
const TITLE_BLUR_PX = 3;

/* THE PAYOFF'S OWN TWO BEATS, and the only timings this file adds. They are
   delays on the existing `shown` flip (which is Develop's reveal ramp crossing
   LOGO_AT), not a second schedule: nothing here starts a clock, it only says how
   long after the panel has sealed each element settles.

   Two beats rather than three or one. One beat lands figure, label, and mark
   together as a slab, which reads as a rendered image rather than a composed
   card; three beats spends 150ms cascading a three-item column, which at a
   0.05s interval is invisible anyway and only delays the mark. Two says the one
   true thing about the composition: THE RESULT ARRIVES, THEN THE CLIENT SIGNS
   IT. That order is the timing, not the geometry — the mark sits at the head of
   the panel and still lands second. The interval is 0.08s, the stagger ceiling in
   style-rules §7 — earned here because it is two large display elements, not a
   list.

   The whole gesture: reveal crosses LOGO_AT at 0.78 × 760ms ≈ 593ms, the figure
   settles at 593 + 80 + 500 = ~1.17s, the mark at ~1.25s, and the count finishes
   with the figure it is inside rather than after it. LOGO_AT moved from 0.72
   when the scatter was given its own span (see SCATTER_SPAN), which puts the
   whole payoff 46ms later than it was — the only cost of making the dots big
   enough to watch. Hero/display budget in §7 is 1s of CASCADE; the cascade here
   is 580ms. */
const FIGURE_AT = 0.08;
const MARK_AT = 0.16;

const grey = loFiInk;

type Scene = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  field: Float32Array;
  scatter: Float32Array;
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * The dot screen's own light, unchanged from ProjectCard: brighter toward the
 * upper left where a soft light sits, so the halftone has life rather than
 * reading as a dead flat grid, and above LUM_CUTOFF everywhere so the whole field
 * dissolves evenly with no holes. It is the SCREEN's light, not a sample of what
 * lies under it — which is why the same function works over flat paper here and
 * over a bloom field on the live card.
 */
function fieldLum(u: number, v: number): number {
  const glow = 0.9 - Math.hypot(u - 0.3, v - 0.32);
  const base = 0.42 + 0.16 * (1 - v) + 0.1 * (1 - u) + 0.14 * Math.max(0, glow);
  return Math.min(0.85, Math.max(0.28, base));
}

/**
 * The hover, run as one continuous gesture from a single self-cancelling rAF
 * loop. Structurally ProjectCard's FieldDissolve; the difference is what the
 * halftone crossfades OUT of, and that the fade now runs on every card.
 *
 *   1. dotify (0..1): the grey card hands over to a halftone screen drawn in the
 *      project's own dot colour. On the live card this step trades one colour
 *      surface for another; here it is the moment colour enters the card at all.
 *   2. reveal (0..1): the screen DISINTEGRATES, every dot scattering out on its
 *      staggered schedule until the ground has cleared. The brand panel then
 *      fades in over it (PANEL_FADE_FROM..PANEL_FADE_TO) and at LOGO_AT the mark
 *      rises onto the sealed colour.
 *
 * Because the resting layer carries the card's real h2, this component cannot own
 * it — an `aria-hidden` wrapper would take the heading out of the accessible tree
 * — so it pushes that layer's opacity and blur out through MotionValues the card
 * binds, and owns only the canvas. The canvas opacity is a plain imperative
 * `style` write, which is safe precisely because it is NOT a Motion element; the
 * values that are go through MotionValues, since the parent re-renders on the
 * hover and LOGO_AT crossings and an imperative write would race that reconcile.
 *
 * Both ramps are position based, so hover-out reverses from wherever it is —
 * interruptible, never queued — and the loop stops itself once fully back at the
 * flat grey card. Reduced motion never starts it.
 */
function Develop({
  dot,
  hovered,
  contentOpacity,
  contentBlur,
  panelOpacity,
  onReveal,
}: {
  /** The halftone ink: the hovered ground, exposed. See `halftoneInk`. */
  dot: string;
  hovered: boolean;
  /* The resting card's opacity and blur (px). Not optional the way ProjectCard's
     are: there, only payoff cards fade because the ground behind a plain card is
     unchanged by the hover. Here the whole rest state is what the colour
     replaces, so every card fades — otherwise a grey title would sit over a
     coloured screen. */
  contentOpacity: MotionValue<number>;
  contentBlur: MotionValue<number>;
  /* Payoff cards only: the brand panel's opacity, driven off the reveal ramp so
     the crossfade lags the scatter. */
  panelOpacity?: MotionValue<number>;
  /* Payoff cards only: fires once when reveal crosses LOGO_AT. */
  onReveal?: (revealed: boolean) => void;
}) {
  const shouldReduce = useReducedMotion();
  const reduce = !!shouldReduce;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const dotifyRef = useRef(0);
  const revealRef = useRef(0);
  const hoveredRef = useRef(hovered);
  const onRevealRef = useRef(onReveal);
  const revealedRef = useRef(false);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    onRevealRef.current = onReveal;
  }, [onReveal]);

  const setup = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = containerRef.current;
    if (!canvas || !wrap) return;
    const rect = wrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (
      sceneRef.current &&
      sceneRef.current.w === w &&
      sceneRef.current.h === h
    )
      return;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Ruling from the CSS width, not the device-pixel width, so the cell keeps
       its physical size on a retina screen (see CELL_PX). */
    const cols = Math.max(
      MIN_COLS,
      Math.min(MAX_COLS, Math.round(rect.width / CELL_PX)),
    );
    const cellW = w / cols;
    const rows = Math.max(1, Math.round(h / cellW));

    const fieldArr = new Float32Array(cols * rows);
    const scatter = new Float32Array(cols * rows * 3);
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col;
        fieldArr[i] = fieldLum((col + 0.5) / cols, (row + 0.5) / rows);
        const angle = Math.random() * Math.PI * 2;
        const dist = (DRIFT_MIN + Math.random() * DRIFT_SPREAD) * SCATTER_DRIFT * w;
        scatter[i * 3] = Math.cos(angle) * dist;
        scatter[i * 3 + 1] = Math.sin(angle) * dist;
        scatter[i * 3 + 2] = Math.random() * STAGGER;
      }
    }

    sceneRef.current = {
      ctx,
      w,
      h,
      cols,
      rows,
      cellW,
      cellH: h / rows,
      field: fieldArr,
      scatter,
    };
  }, []);

  /* Paints the halftone at a given settle (1 = fully assembled, 0 = fully
     scattered and gone) in the PROJECT'S dot ink, not a grey — this is where the
     colour arrives. The caller has already cleared the canvas.

     `dir` is +1 while the dots are flying out and -1 while they are flying home
     on hover-out. The wake has to lie BEHIND the direction of travel, and on the
     way home that is the far side of the dot; without the sign a reversed
     dissolve draws every comet pointing the way it is going.

     ALPHA TAKES THE SQUARE ROOT OF THE EASE, and that is a correction this card
     needed once it inverted to a dark plate. A dot's alpha used to track `eased`
     directly, which spends a dot's light long before it has travelled far enough
     to be SEEN travelling — the break-up becomes a fade wearing a scatter's
     clothes. `.docs/cover-effects.md` carved the work cards out of this on the
     grounds that they were dark ink on near-white, where a fading dot stays
     legible against the ground. That is no longer true here: the resting plate
     is `loFiInk.paper` at #2a2724 and the dots are mid-tone brand colour, so this
     is light ink on a dark ground, the same polarity as the covers. The doc has
     been amended. */
  const drawDots = useCallback(
    (settle: number, dir: number) => {
      const scene = sceneRef.current;
      if (!scene) return;
      const { ctx, cols, rows, cellW, cellH, field: fieldArr, scatter } = scene;

      ctx.fillStyle = dot;
      ctx.strokeStyle = dot;
      ctx.lineCap = "round";
      const maxRadius = cellW * DOT_MAX;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = row * cols + col;
          const lum = fieldArr[i];
          if (lum < LUM_CUTOFF) continue;
          const local =
            settle >= 1
              ? 1
              : Math.min(
                  1,
                  Math.max(0, (settle - scatter[i * 3 + 2]) / (1 - STAGGER)),
                );
          if (local <= 0) continue;
          const eased = easeOutCubic(local);
          const dx = scatter[i * 3];
          const dy = scatter[i * 3 + 1];
          const x = (col + 0.5) * cellW + dx * (1 - eased);
          const y = (row + 0.5) * cellH + dy * (1 - eased);
          const radius = maxRadius * Math.sqrt(lum) * (0.55 + 0.45 * eased);
          const alpha = Math.sqrt(eased) * (0.35 + 0.65 * lum);

          /* Speed as a fraction of the dot's own drift vector: zero at rest,
             largest as it accelerates out, so the smear only ever appears on a
             dot that is actually travelling. */
          const speed = 3 * (1 - local) ** 2 * TRAIL_SCALE * dir;
          let tx = dx * speed;
          let ty = dy * speed;
          const trail = Math.hypot(tx, ty);
          const cap = radius * TRAIL_MAX_R;
          if (trail > cap) {
            tx = (tx / trail) * cap;
            ty = (ty / trail) * cap;
          }
          if (trail > 1) {
            ctx.globalAlpha = alpha * TRAIL_ALPHA;
            ctx.lineWidth = radius * 2 * TRAIL_WIDTH;
            ctx.beginPath();
            ctx.moveTo(x - tx, y - ty);
            ctx.lineTo(x, y);
            ctx.stroke();
          }

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    },
    [dot],
  );

  const drawFrame = useCallback(
    (settle: number, dir: number) => {
      const scene = sceneRef.current;
      if (!scene) return;
      scene.ctx.clearRect(0, 0, scene.w, scene.h);
      drawDots(settle, dir);
    },
    [drawDots],
  );

  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setup();

    let last: number | null = null;

    const step = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        runningRef.current = false;
        rafRef.current = null;
        return;
      }
      const dt = last === null ? 16 : Math.min(64, now - last);
      last = now;

      let dotify = dotifyRef.current;
      let reveal = revealRef.current;
      if (hoveredRef.current) {
        if (dotify < 1) dotify = Math.min(1, dotify + dt / DOTIFY_MS);
        else reveal = Math.min(1, reveal + dt / REVEAL_MS);
      } else if (reveal > 0) {
        reveal = Math.max(0, reveal - dt / REVEAL_MS);
      } else {
        dotify = Math.max(0, dotify - dt / DOTIFY_MS);
      }
      dotifyRef.current = dotify;
      revealRef.current = reveal;

      const revealed = reveal >= LOGO_AT;
      if (revealed !== revealedRef.current) {
        revealedRef.current = revealed;
        onRevealRef.current?.(revealed);
      }

      canvas.style.opacity = String(dotify);

      /* The resting card dissolves INTO the forming colour. Its progress blends
         dotify (breaking into dots) and reveal (the scatter) into one 0..1, so
         the fade begins as the grey breaks up and finishes early in the scatter,
         well before the panel arrives — no jump cut, no double exposure under the
         mark. A whisper of blur melts the type into the dots. */
      const p = dotify < 1 ? dotify * 0.45 : 0.45 + reveal * 0.55;
      const tf = smoothstep(TITLE_FADE_FROM, TITLE_FADE_TO, p);
      contentOpacity.set(1 - tf);
      contentBlur.set(tf > 0 ? tf * TITLE_BLUR_PX : 0);

      if (panelOpacity)
        panelOpacity.set(smoothstep(PANEL_FADE_FROM, PANEL_FADE_TO, reveal));

      /* The dot maths runs on its own share of the ramp (SCATTER_SPAN), so the
         field is fully flown by the time the panel seals. Past that point there
         is nothing left to draw, so the canvas is cleared and the remaining
         frames cost nothing. Flying out while hovered, flying home while not —
         the comet wake follows the direction of travel (see drawDots). */
      if (dotify > 0 && reveal < SCATTER_SPAN) {
        drawFrame(
          1 - Math.min(1, reveal / SCATTER_SPAN),
          hoveredRef.current ? 1 : -1,
        );
      } else {
        const scene = sceneRef.current;
        scene?.ctx.clearRect(0, 0, scene.w, scene.h);
      }

      if (!hoveredRef.current && dotify === 0 && reveal === 0) {
        runningRef.current = false;
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [setup, drawFrame, contentOpacity, contentBlur, panelOpacity]);

  useEffect(() => {
    if (reduce) return;
    if (hovered) startLoop();
  }, [hovered, reduce, startLoop]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const wrap = containerRef.current;
    if (!wrap || reduce) return;
    const observer = new ResizeObserver(() => {
      sceneRef.current = null;
      setup();
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [setup, reduce]);

  return (
    <div ref={containerRef} aria-hidden="true" className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0 }}
      />
    </div>
  );
}

/**
 * The panel and whatever rises onto it — ProjectCard's LogoPayoff, generalised
 * to carry either kind of payoff this grid now holds:
 *
 *   a case study    a dark ground the client signs: their mark reversed at the
 *                   head, and the project's measured RESULT at the foot, figure
 *                   counting up with its supporting line beneath it.
 *   an article      warm writing paper, and the piece's own deck line. Nothing
 *                   was withheld, so what arrives is what the piece argues.
 *
 * WHY THE CASE-STUDY PANEL IS A STAT AND NOT A LOGO NOW. The old panel was a
 * pale brand tint with the client's mark centred on it, and it did exactly one
 * thing: flood the colour the resting card withheld. That worked as a colour
 * event and said nothing — the strongest fact the registry holds about each
 * project sat in the resting card's foot block at annotation size, where the
 * hover then dissolved it away. The card was throwing away its best content to
 * show a logo. Now the dissolve resolves INTO that fact at display size, and the
 * mark becomes the signature ON it rather than the message. See
 * projectPayoffs.ts for the grounds and the reversal.
 *
 * Everything below is shared and none of it knows which it is drawing. The panel
 * is a flat colour layer that fades straight in over the cleared ground (a plain
 * opacity crossfade, no iris, no radius, no wipe) and each payoff element lifts
 * `y: 12 -> 0` above it, delayed so it settles once the panel has sealed. The
 * layer stays mounted so an image payoff is preloaded and never flashes, and is
 * `pointer-events-none`, so at rest it is an invisible layer that never
 * intercepts the card's own hover.
 *
 * IT OWNS NO GEOMETRY. It used to: a column of its own with its own padding and
 * its own flex ratios, which is precisely why the payoff did not line up with
 * the card it was replacing. The layer is now the panel, the container, and a
 * full-bleed slot; the case-study payoff fills that slot with `CardFrame`, the
 * SAME skeleton the resting card wears, so the two states share their slots
 * rather than resembling each other. See CardFrame.
 *
 * IT IS A `@container`, and everything on it sizes in `cqw`. The card's width
 * does not track viewport breakpoints: the gallery goes to two columns at `sm`
 * (so a card is NARROWER at 640px than at 639px) and to three at `xl`, and the
 * filter rail eats a fixed 13–15rem out of the row on top of that. Measured
 * across the whole range a card runs about 224px to 448px of content, and a
 * breakpoint-stepped figure steps UP at exactly the widths where the card steps
 * down. Container units track the box the type is actually inside, which is
 * already the treatment for type inside a cover (`cover-effects.md`) and the
 * fluid-display carve-out in style-rules §2.
 *
 * Full motion drives the panel's opacity from Develop's rAF loop, frame locked to
 * the reveal ramp so the crossfade lags the scatter. Reduced motion never runs
 * the loop, so the value stays 0 and an `animate` on `shown` crossfades the panel
 * in instead, with every rise dropped — opacity only, no movement. The reveal
 * still happens there, and so does the FINAL figure: the reveal must never depend
 * on motion (style-rules §7).
 */
function PayoffLayer({
  panel,
  shown,
  reduce,
  panelOpacity,
  children,
}: {
  /** The flat colour the ground resolves to: a dark brand ground, or paper. */
  panel: string;
  shown: boolean;
  reduce: boolean;
  panelOpacity: MotionValue<number>;
  /** What rises onto the sealed panel, with its own geometry. */
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={!shown}
      className="@container pointer-events-none absolute inset-0 z-10"
    >
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: panel, opacity: panelOpacity }}
        initial={false}
        animate={reduce ? { opacity: shown ? 1 : 0 } : undefined}
        transition={{
          duration: motionDuration.fast,
          ease: shown ? motionEase.out : motionEase.in,
        }}
      />

      <div className="relative h-full w-full text-center">{children}</div>
    </div>
  );
}

/*
 * THE CARD SKELETON — one set of numbers, worn by both states.
 *
 * ProjectCard's centred column: air 7, title, silence 6, the terminal group,
 * air 7, and the foot block hanging BELOW the column. Head and foot airs carry
 * identical classes on purpose — that equality is the composition, so it is
 * expressed as one repeated declaration rather than two tuned numbers that
 * happen to match.
 *
 * IT IS A COMPONENT BECAUSE THE PAYOFF WEARS IT TOO, and that is the whole point
 * of this file's most recent change. The payoff used to be composed in its own
 * column with its own padding and its own flex ratios, and the result was a
 * dissolve that ended somewhere other than where it started: the figure landed
 * below the title it replaced, the mark below the tag and glyph it replaced, and
 * the panel sealed with everything a step out of place. Two copies of the same
 * ratios could have been kept in step by hand, for a while. One skeleton cannot
 * drift.
 *
 * THE FOOT BLOCK IS THE TRAP, and it is why mirroring the column alone is not
 * enough. It hangs below the column and eats real height, so a payoff that
 * mirrored only the column would stretch its column across the whole card and
 * push every slot down by the block's height — which varies per card, since the
 * outcome label wraps to one line or two. So the payoff renders the REAL foot
 * block, invisibly, as its own height reservation. Same component, same content,
 * same wrap, guaranteed same height.
 *
 * THE TITLE SLOT IS `relative` AND `items-start`. Its slack falls BELOW the
 * title (see the header's account of why), so anything the payoff hangs here
 * hangs from the TOP of the box, not from its middle — which is the only way a
 * figure and a project name can share a line when the box is floored well below
 * both. It is positioned rather than flowed so that a long label can never
 * inflate the slot and shove everything under it down the card.
 *
 * THE TERMINAL SLOT IS `relative` AND FULL WIDTH for the same reason: the payoff
 * hangs its mark absolutely off the BOTTOM of it, over invisible copies of the
 * terminal group and the foot block stacked to hold the height open. That is
 * what lets the payoff have equal air head and foot while its figure stays
 * exactly on the resting title's line — the slot absorbs both blocks, so the
 * column resolves to the same airs either way and the mark ends up as far below
 * the silence as the head air is above the figure. See the payoff's own note.
 */
function CardFrame({
  title,
  terminal,
  foot,
}: {
  title: React.ReactNode;
  terminal: React.ReactNode;
  foot: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full flex-col px-6 py-5">
      <div className="flex grow flex-col items-center text-center">
        <div aria-hidden="true" className="min-h-4 basis-0 grow-7" />

        <div className="relative flex w-full min-h-24 items-start justify-center sm:min-h-28">
          {title}
        </div>

        <div aria-hidden="true" className="min-h-6 basis-0 grow-6" />

        <div className="relative flex w-full flex-col items-center">
          {terminal}
        </div>

        <div aria-hidden="true" className="min-h-4 basis-0 grow-7" />
      </div>

      {foot}
    </div>
  );
}

/**
 * The industry tag and its glyph, held together as one terminal group — one
 * object at the foot of the column rather than two stacked items.
 *
 * `ghost` renders it as pure geometry: `invisible` keeps the box and takes it out
 * of paint and out of the accessible tree, which is exactly what the payoff needs
 * from it. The payoff's mark then centres on the band this group defines, so the
 * mark lands where the tag and glyph were rather than near where they were.
 */
function TerminalGroup({
  industry,
  ghost = false,
}: {
  industry?: string;
  ghost?: boolean;
}) {
  return (
    <div
      aria-hidden={ghost || undefined}
      className={`flex flex-col items-center gap-3 sm:gap-4${ghost ? " invisible" : ""}`}
    >
      {industry ? (
        <p className="indent-[0.28em] text-xs font-medium uppercase tracking-[0.28em]">
          {industry}
        </p>
      ) : null}

      {/* The same mark at the same size, stepped back to pencil grey. */}
      <span style={{ color: grey.draw }}>
        <IndustryGlyph industry={industry} className="size-8 shrink-0" />
      </span>
    </div>
  );
}

/**
 * THE FOOT BLOCK — a working drawing's title block, and now one annotation row:
 * where the piece lives, and when.
 *
 * THE OUTCOME WAS HERE AND CAME OFF, which is the change that emptied the block.
 * The card used to print the measured result twice — at annotation size down
 * here at rest, and at display size on the payoff — and the second printing is
 * the louder one by a long way. A hover that repeats a fact already on the card
 * is not an arrival, it is a zoom, and the resting card was spending its foot on
 * a spoiler for its own reveal. Now the resting card states what the project IS
 * and the payoff states what it DID.
 *
 * ROLE CAME OFF BEFORE IT. Three of the four registry entries record "End to end
 * UX", so the row spent a line of every card restating the same phrase, and a
 * fact that does not vary between four cards is not a fact a reader can use to
 * tell them apart. Case-study pages state role properly in their own meta
 * blocks, which is where a claim about scope can be qualified; a card cannot
 * qualify anything.
 *
 * WHAT IS LEFT IS ONE ROW, and the two kinds of card no longer need separate
 * shapes for it. An article prints its publication and its date, because a card
 * that leaves the site should say so on the card rather than only in the cursor
 * label. A case study prints its year, when the registry has one — and today
 * none of the four does, so every case-study card in the grid currently renders
 * ProjectCard's column and nothing below it.
 *
 * THAT GIVES THE CARD BACK ITS HEAD/FOOT EQUALITY, which this treatment had
 * knowingly spent. The block used to hang below the centred column and make the
 * card's foot heavier than its head; with nothing below the column, the equality
 * the composition is built on holds for the whole card again, on the resting
 * layer and on the payoff alike. A card that does record a year spends it again,
 * by exactly one row.
 *
 * LEFT ALIGNED, NOT CENTRED, and that is the whole reason the row reads as
 * annotation: annotation aligns to its edges, composition to its axis. Mono for
 * the same reason — it is the type a drawing labels itself in, deliberately
 * unlike the display face in the column above. Two facts justify left and right;
 * one fact takes the left edge and has nothing opposite it. Small text on the
 * 12.5:1 lo-fi ink, well clear of the 7:1 floor (style-rules §4).
 *
 * `ghost` renders the block as height and nothing else. The payoff needs the
 * block's exact height to place its own slots on the resting card's lines, and
 * that height is not a number anyone can write down — it is a row or it is
 * nothing, depending on data. So the payoff renders this component with the same
 * entry and hides it. Same content, same height, always, including when the
 * honest height is zero.
 */
function FootBlock({
  entry,
  ghost = false,
}: {
  entry: WorkEntry;
  ghost?: boolean;
}) {
  const publication = entry.kind === "article" ? entry.publication : null;
  if (!publication && !entry.year) return null;

  return (
    <div
      aria-hidden={ghost || undefined}
      className={`mt-4 shrink-0 border-t pt-3${ghost ? " invisible" : ""}`}
      style={{ borderColor: grey.rule }}
    >
      <div className="flex items-baseline justify-between gap-3 font-mono text-xs font-medium uppercase tracking-[0.16em]">
        {publication ? (
          <span className="min-w-0 truncate">{publication}</span>
        ) : null}
        {entry.year ? <span className="shrink-0">{entry.year}</span> : null}
      </div>
    </div>
  );
}

/**
 * One element rising onto the sealed panel. Pulled out of PayoffLayer once the
 * case-study payoff had two beats instead of one — the transition pair was
 * already written once and would have been written twice.
 *
 * Entry takes `slow` on `ease.out`; exit takes `instant` on `ease.in`, because
 * by hover-out the reader has already left (style-rules §7, exits are subtler
 * than entries). Reduced motion drops the `y` entirely rather than shortening
 * it — positional movement is removed, not sped up — and runs the opacity at
 * `fast` with no delay, so the whole payoff simply appears.
 */
function Rise({
  shown,
  reduce,
  delay,
  className,
  children,
}: {
  shown: boolean;
  reduce: boolean;
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: shown ? 1 : 0, y: reduce ? 0 : shown ? 0 : 12 }}
      transition={
        shown
          ? {
              duration: reduce ? motionDuration.fast : motionDuration.slow,
              ease: motionEase.out,
              delay: reduce ? 0 : delay,
            }
          : {
              duration: reduce ? motionDuration.fast : motionDuration.instant,
              ease: motionEase.in,
            }
      }
    >
      {children}
    </motion.div>
  );
}

/*
 * PARSING AN OUTCOME INTO A COUNTABLE FIGURE.
 *
 * Written as one general rule rather than four cases, because the registry is a
 * living table and the next entry will not be one of the four that exist. The
 * rule: animate the LAST run of digits in the string and render everything
 * around it statically. That is the right token in every value the registry
 * holds and in the shapes it plausibly grows —
 *
 *   "84%"       →  84 counts, "%" static      the plain case
 *   "30%"       →  30 counts, "%" static
 *   "3 months"  →   3 counts, "months" static  a phrase, not a percentage
 *   "20–30%"    →  30 counts, "20–" static     a RANGE: the top of it is the
 *                                              claim, the floor is context, and
 *                                              counting the floor as well would
 *                                              be two numbers racing
 *
 * A value with no digits at all returns null and renders as plain static text,
 * which is the only honest fallback: "Shipped" cannot count.
 *
 * Decimals are carried through so "1.5×" would count on 1.5 and format to one
 * place rather than snapping to whole numbers. Nothing in the registry uses
 * them; the parse costs one optional group and removes a future trap.
 *
 * THE WHOLE VALUE IS ONE SIZE, and that retires two systems this file used to
 * carry. It had a fitted size (an optical width estimate that sized each figure
 * to fill the same measure, so "84%" came out bigger than "20–30%") and a set of
 * ratios that stepped spelled-out units and glued prefixes DOWN against the
 * counting numeral. Both are gone, and what replaced them is simpler than
 * either: THE FIGURE IS SET EXACTLY AS THE PROJECT TITLE IS.
 *
 * That is the alignment idea carried to its conclusion. The payoff already lands
 * the result in the slot the project's name occupies; setting it in the name's
 * own face, size, weight, leading, and tracking means the dissolve swaps one for
 * the other with nothing moving and nothing resizing — the card says "Macquarie
 * Radar" and then says "30%" in the same voice, in the same place. A fitted size
 * cannot do that, because fitted means every card's figure is a different size
 * and none of them is the title's.
 *
 * It also settles the range. "20–30%" now sets both numerals at one size, which
 * is what a range IS: two ends of the same measurement, not a claim and a
 * footnote. The earlier version shrank the floor to half, and the argument for it
 * was typographic rather than editorial — see the dash below.
 *
 * The longest value the registry holds is "20–30%" at six glyphs, which runs
 * about 150px at the `sm:text-4xl` step and about 125px at `text-3xl`. The
 * narrowest card the grid produces holds around 200px of content between its
 * gutters, so the widest value clears it on one line with room to spare. A value
 * long enough to wrap would wrap the same way a two-word project title already
 * does, into a box floored for exactly that.
 *
 * THE DASH IS THE ONE GLYPH THAT STILL NEEDS HANDLING. This display face's en
 * dash is nearly as wide as a digit and sits low against lining figures, so with
 * the numerals crowding it on both sides "20–30%" read as one mangled word with
 * a strikethrough through it. That complaint was real and is still true; what
 * changed is the fix. Shrinking a numeral solved it by removing one of the two
 * crowding neighbours, at the cost of saying something about the range that is
 * not true. Giving the DASH its own optical treatment solves it where the
 * problem actually is: a hairline of air on each side, and the display face's
 * negative tracking lifted off that one glyph so the letter-space is not also
 * pulling the numeral after it into the bar.
 *
 * It is a rule about a class of glyph, not about a value, so it holds for
 * "20–30%", for an em dash, for a hyphenated range, and for anything the
 * registry grows. Everything else in an affix — "%", "$", "up to", "months" —
 * needs nothing, and gets nothing.
 */
type ParsedOutcome = {
  /** Everything before the counting digits: "20–", "up to ", "$". */
  prefix: string;
  /** The digits as written, used to reserve the box at its final width. */
  digits: string;
  /** Everything after them: "%", " months". */
  suffix: string;
  target: number;
  decimals: number;
};

function parseOutcome(value: string): ParsedOutcome | null {
  const match = /^(.*?)(\d+(?:\.\d+)?)(\D*)$/.exec(value);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  return {
    prefix,
    digits,
    suffix,
    target: Number(digits),
    decimals: digits.includes(".") ? digits.split(".")[1].length : 0,
  };
}

/* THE TITLE'S OWN TYPE, quoted rather than re-specified — literally the same
   token the h2 wears. Same face, same step at both breakpoints, same weight,
   same leading, same tracking, because it IS that string: if the title's
   treatment ever moves, this moves with it and the dissolve keeps swapping like
   for like. Aliased rather than used directly so the intent stays legible at
   the two call sites below. */
const FIGURE_TYPE = projectCardHeading;

/** Air on each flank of a dash, in the figure's own em so it scales with the
    step. Enough to unstick the bar from lining figures either side of it and no
    more — a word space here would break one range into two numbers. */
const DASH_AIR_EM = 0.09;

const DASH_RUN = /^[‐-―-]+$/;

/**
 * A static run either side of the counting digits, with any dash inside it given
 * its own air and its own tracking. Split rather than styled whole, because the
 * correction belongs to the glyph and not to the run it happens to sit in.
 *
 * `whitespace-pre` on every part: these are flex items, and flex strips the
 * leading and trailing whitespace off a text run, which would set "3 months" as
 * "3months".
 */
function Affix({ text }: { text: string }) {
  if (!text) return null;
  return (
    <>
      {text
        .split(/([‐-―-]+)/)
        .filter(Boolean)
        .map((part, i) =>
          DASH_RUN.test(part) ? (
            <span
              key={i}
              className="whitespace-pre"
              style={{
                paddingInline: `${DASH_AIR_EM}em`,
                letterSpacing: "normal",
              }}
            >
              {part}
            </span>
          ) : (
            <span key={i} className="whitespace-pre">
              {part}
            </span>
          ),
        )}
    </>
  );
}

/**
 * THE OUTCOME FIGURE — the thing the card is now about, set as the project's
 * name is set.
 *
 * THE COUNT HANGS OFF THE EXISTING REVEAL, it does not add a clock. `shown` is
 * already Develop's reveal ramp crossing LOGO_AT (the moment the panel has
 * sealed and the mark is cleared to land), so the count is triggered by the same
 * position the rest of the payoff is, and runs for `slow` on `ease.out` with the
 * figure's own rise delay — it finishes exactly when the figure it is inside
 * finishes settling. Ease-out is what makes it read as a TALLY rather than a
 * slot machine: most of the distance is covered in the first third and the last
 * few units drop in slowing down, which is how a real counter behaves.
 *
 * HOVER-OUT IS A RETARGET, NOT A QUEUE. Motion's `animate` on a MotionValue
 * retargets from wherever the value is, so leaving mid-count runs it back down
 * from 61 rather than waiting for 84 — matching the position-based ramps
 * underneath it, which do the same thing to the halftone. The value is driven
 * back to 0 on `instant` (the panel is fading over the same 100ms, so the
 * countdown is not really seen; what matters is that the next hover starts from
 * 0 and never from a stuck partial). The effect stops the animation on cleanup,
 * so a card unmounted mid-count leaves nothing running.
 *
 * REDUCED MOTION SETS THE FINAL VALUE AND NEVER ANIMATES. The figure is content,
 * not motion, and the panel must state the result whether or not anything moved.
 *
 * THE BOX IS RESERVED AT THE FINAL WIDTH. An invisible copy of the final digits
 * occupies the grid cell and the live value is laid over it right-aligned, so
 * "0 → 84" grows leftward into space that was already there and the "%" beside
 * it never moves. `tabular-nums` on the whole figure holds the digits themselves
 * on a fixed advance, and holds a range's floor on the same advance as its top.
 * Without both, a two-digit count jitters the whole centred figure twice.
 *
 * It reads nothing to a screen reader: `aria-hidden`, like the article deck
 * beside it, because the LINK's accessible name states the outcome as a static
 * sentence instead. A counting number in the accessible tree announces every
 * intermediate value it passes through, which is noise pretending to be
 * feedback — so the number that moves is artwork, and the fact it is counting
 * toward is text.
 */
function OutcomeFigure({
  value,
  shown,
  reduce,
}: {
  value: string;
  shown: boolean;
  reduce: boolean;
}) {
  const parsed = useMemo(() => parseOutcome(value), [value]);
  const count = useMotionValue(0);
  const decimals = parsed?.decimals ?? 0;
  const text = useTransform(count, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (!parsed) return;
    if (reduce) {
      count.set(parsed.target);
      return;
    }
    const controls = animate(
      count,
      shown ? parsed.target : 0,
      shown
        ? {
            duration: motionDuration.slow,
            ease: motionEase.out,
            delay: FIGURE_AT,
          }
        : { duration: motionDuration.instant, ease: motionEase.in },
    );
    return () => controls.stop();
  }, [count, parsed, reduce, shown]);

  if (!parsed) {
    /* No digits to count. The value still gets the title's type and the panel
       still resolves — it simply arrives whole, the same way it does under
       reduced motion. */
    return (
      <span
        aria-hidden="true"
        className={FIGURE_TYPE}
        style={{ color: payoffInk.figure }}
      >
        {value}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-baseline justify-center tabular-nums ${FIGURE_TYPE}`}
      style={{ color: payoffInk.figure }}
    >
      <Affix text={parsed.prefix} />
      <span className="grid justify-items-end">
        <span className="invisible col-start-1 row-start-1">
          {parsed.digits}
        </span>
        <motion.span className="col-start-1 row-start-1">{text}</motion.span>
      </span>
      <Affix text={parsed.suffix} />
    </span>
  );
}

/**
 * The card. Geometry, type, and the centred column are ProjectCard's, unchanged:
 * one equal margin at head and foot, the title box floored at the longest title
 * in the registry so a row of tags lands on one line, the declared silence, and
 * the tag and mark held together as one terminal group. See ProjectCard's header
 * for the derivation — none of it is re-argued here, because a candidate that
 * changed the composition as well as the treatment would not be a test of the
 * treatment.
 *
 * The spec bar is the single structural addition, and it sits OUTSIDE the centred
 * column rather than becoming another item in it: the column's flex airs ARE the
 * composition, and adding a fifth element to them would re-tune a rhythm this
 * direction has no business touching. It hangs under the column as a foot rule
 * instead. The honest cost is that the card's foot now carries slightly more
 * weight than its head, so the head/foot equality the live card is built on holds
 * for the column but no longer for the whole card. That is the price of the extra
 * fact, and it is worth naming rather than hiding — if the bar is dropped, the
 * equality returns exactly.
 */
export function LoFiProjectCard({
  entry,
  index,
}: {
  entry: WorkEntry;
  index: number;
}) {
  const shouldReduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  /* The resting card's fade, and the panel's. Held in MotionValues so Motion owns
     them across the hover and LOGO_AT re-renders: the loop `.set()`s them and the
     elements bind them via `style`, so an imperative write on a Motion element
     can never be stomped back on reconcile. Untouched in reduced motion, where
     the loop never runs and `animate` drives the same values instead. */
  const contentOpacity = useMotionValue(1);
  const contentBlur = useMotionValue(0);
  const contentFilter = useMotionTemplate`blur(${contentBlur}px)`;
  const panelOpacity = useMotionValue(0);
  const href = workEntryHref(entry);
  const isArticle = entry.kind === "article";
  const slug = entry.kind === "case-study" ? entry.slug : undefined;
  const payoff = slug ? PAYOFFS[slug] : undefined;
  /* THE HALFTONE IS THE HOVERED GROUND, EXPOSED — the card's colour is derived
     from where the hover is going, never chosen for the dots. The card used to
     read `projectFields.dot`, a mid-tone brand ink picked per project, which put
     two colour events in one gesture and in three cases two different hues. See
     `halftoneInk` for the rule and the exposure. */
  const hoverGround = payoff?.panel ?? loFiWriting.panel;
  const dotInk = halftoneInk(hoverGround);
  /* Every card now develops into something: a client's panel and mark, or an
     article's writing paper and deck. That is not a nicety — a card with no
     payoff runs the dissolve, fades its own content to nothing, and finishes on
     blank paper, so "has a payoff" is a correctness condition here rather than a
     decoration. The one card that legitimately has neither is an entry with no
     slug and no deck, which the registry's types no longer permit. */
  const hasPayoff = !!payoff || isArticle;
  const panelShown = hasPayoff && (shouldReduce ? hovered : revealed);

  /* THE ACCESSIBLE NAME CARRIES THE OUTCOME, and it has to now. The resting card
     used to print value and label in its foot block, which is what made it safe
     to hide the payoff's copy of them from assistive tech. That block no longer
     carries the result, so without this line the strongest fact the registry
     holds about the project would not exist in the accessible tree at all.

     It goes here rather than into the payoff because the payoff's figure is a
     COUNTING number: exposed, it would announce every intermediate value it
     passes through, which is noise wearing the costume of feedback. A static
     sentence on the link is read once, in full, in the order a reader wants it —
     what this is, what it was about, what came of it.

     Named on the link and not inside the card on purpose: an explicit
     `aria-label` replaces the element's contents entirely, so sr-only text in
     the card would never be reached. */
  const outcomeLine = entry.outcome
    ? ` Outcome: ${entry.outcome.value}. ${entry.outcome.label}.`
    : "";
  const ariaLabel = isArticle
    ? `Read "${entry.title}" (opens in a new tab): ${entry.tagline}`
    : `Open the ${entry.title} case study: ${entry.tagline}.${outcomeLine}`;
  const cursorLabel = isArticle ? "Read" : "Open";

  const cardMotion: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
    shown: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: shouldReduce ? 0 : Math.min(index * 0.05, 0.15),
      },
    },
    tap: { scale: shouldReduce ? 1 : 0.985, transition: motionEase.spring },
  };

  const card = (
    <motion.article
      variants={cardMotion}
      initial="hidden"
      whileInView="shown"
      whileTap="tap"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative isolate aspect-[5/7] overflow-hidden rounded-2xl border shadow-card transition-shadow duration-100 group-hover:shadow-elevated"
      style={{ backgroundColor: grey.paper, borderColor: grey.rule }}
    >
      {/* THE RESTING CARD. Carries the real h2, so it is a content layer rather
          than artwork and must stay out of any aria-hidden subtree — which is why
          its opacity and blur arrive from Develop through MotionValues instead of
          the loop owning the element. In FULL MOTION the fade is frame locked to
          the dot progress. In REDUCED MOTION the loop never runs, so `animate`
          takes over: a payoff card clears so the mark can land, and a card without
          one dips a touch as an opacity-only cue with no movement. */}
      <motion.div
        className="absolute inset-0"
        style={{
          color: grey.ink,
          opacity: contentOpacity,
          filter: contentFilter,
        }}
        initial={false}
        animate={
          shouldReduce
            ? { opacity: hasPayoff ? (panelShown ? 0 : 1) : hovered ? 0.82 : 1 }
            : undefined
        }
        transition={{
          duration: shouldReduce ? 0.01 : motionDuration.fast,
          ease: motionEase.in,
        }}
      >
        <CardFrame
          /* THE TITLE, sized to what it actually is. A project name is two or
             three words and takes the full display step at a 10ch measure. An
             article title is a sentence — the longest here runs 46 characters —
             and at that size on that measure it wraps to five lines, breaks the
             box floor, and stops reading as a name at all. So writing steps down
             one size and opens the measure to 20ch, which is the same decision
             the type scale makes everywhere else: display type is sized to its
             content, not to its slot. Both land inside the shared floor, so the
             two kinds of card still line up across a row. */
          title={
            <h2
              className={
                isArticle
                  ? `max-w-[20ch] text-balance ${articleCardHeading}`
                  : `max-w-[10ch] text-balance ${projectCardHeading}`
              }
            >
              {entry.title}
            </h2>
          }
          terminal={<TerminalGroup industry={entry.industry} />}
          foot={<FootBlock entry={entry} />}
        />
      </motion.div>

      {/* The halftone the grey card develops into, in the colour it is becoming. */}
      <Develop
        dot={dotInk}
        hovered={hovered}
        contentOpacity={contentOpacity}
        contentBlur={contentBlur}
        panelOpacity={hasPayoff && !shouldReduce ? panelOpacity : undefined}
        onReveal={hasPayoff && !shouldReduce ? setRevealed : undefined}
      />

      {/* Fine grain. On the live card this stops wide gradients banding on 8-bit
          displays; there is no gradient here to band, and it stays because flat
          grey without tooth reads as a screenshot of flat grey. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {payoff ? (
        <PayoffLayer
          panel={payoff.panel}
          shown={panelShown}
          reduce={!!shouldReduce}
          panelOpacity={panelOpacity}
        >
          {/* THE PAYOFF WEARS THE RESTING CARD'S SKELETON — CardFrame, the same
              component the resting layer wears, not a copy of its numbers. Same
              padding, same airs in the same ratios, same title box, and the same
              blocks below it holding the same height. What changed is only what
              goes in each slot: the client's mark takes the head, and the result
              takes the foot.

              EQUAL AIR, HEAD AND FOOT, MEASURED TO THE INK. The distance from
              the card's top edge to the top of the mark equals the distance from
              the bottom of the label to the card's bottom edge, and that is the
              resting column's own principle — its head and foot airs carry
              identical classes because the equality IS the composition. So it is
              expressed the same way here rather than as two numbers that happen
              to match: the mark hangs off the top of the title slot, which sits
              directly under the `grow-7` head air, and the result hangs off the
              bottom of the slot below, which sits directly above the `grow-7`
              foot air. Two instances of one declaration. */}
          <CardFrame
            /* THE MARK, reversed, hung from the TOP of the title box — the same
               line the project's name sits on. That box is `items-start` and its
               slack falls below the title (see the header), so the title's
               optical top IS the box's top edge, and the mark and the name share
               it. It is the one correspondence that survives the head-and-foot
               swap, and it is worth having: the thing that replaces the name
               starts exactly where the name started.

               Positioned rather than flowed, so a tall lockup can never inflate
               the box and drag the rest of the panel down. Every mark in the set
               clears the box floor with room to spare, so the slack below it is
               the same slack the title leaves.

               THE TRIM IS WHY THE HEAD AIR IS HONEST. The mark's negative margins
               pull the artwork's empty canvas off both edges, so the element's
               box IS the ink's box and hanging it from the top puts the INK on
               the line. Zero for the three tight SVGs; over a third of the mark's
               width for the square Macquarie raster, which without it would hang
               half a mark below a line the other three sit on. See
               projectPayoffs.ts for the grounds, the knockout, the one mark that
               needed a different reversal, and why the widths scale as a set. */
            title={
              <Rise
                shown={panelShown}
                reduce={!!shouldReduce}
                delay={MARK_AT}
                className="absolute inset-x-0 top-0 flex justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- the mark is
                    artwork inside a canvas-driven crossfade, preloaded by staying
                    mounted; next/image's lazy wrapper would flash it on first hover. */}
                <img
                  src={payoff.logo}
                  alt={payoff.alt}
                  width={payoff.width}
                  height={payoff.height}
                  className="h-auto"
                  style={{
                    width: `${payoff.markCqw}cqw`,
                    marginTop: `${-payoff.markCqw * payoff.markPadTop}cqw`,
                    marginBottom: `${-payoff.markCqw * payoff.markPadBottom}cqw`,
                    filter: payoff.markFilter,
                  }}
                />
              </Rise>
            }
            /* THE RESULT, hung from the BOTTOM of the slot that absorbs
               everything the resting card puts below the silence.

               THE SLOT ABSORBS THE TERMINAL GROUP AND THE FOOT BLOCK, rendered
               here as height and nothing else, stacked. That is what keeps the
               column resolving to the identical head air, silence, and foot air
               it resolves to at rest — the payoff has no foot block hanging below
               the column, so without this the column would stretch the full card
               and every air on the panel would come out wrong.

               IT IS THE HONEST COST OF THE SWAP, and worth naming. The figure
               used to land on the resting title's own line, in the title's own
               type, so the dissolve swapped one for the other with nothing
               moving. With the mark at the head the figure has moved to the foot,
               where the resting card has a tag, a glyph, and an annotation block
               rather than one element it could replace — so it lands on the foot
               AIR's line rather than on any single thing. What it keeps is the
               type: it is still set exactly as the project name is set, so the
               two states still speak in one voice even though they no longer
               speak from the same spot.

               The label hangs at `mt-3` — close enough that figure and line read
               as one fact, not two rows — and takes `text-sm`, the same reading
               size the article payoff's deck takes on this same layer. It is
               small text on 8.7:1 ink at worst, clearing the 7:1 floor
               (style-rules §4).

               BOTH ARE `aria-hidden`, and the link's accessible name is what
               carries the outcome instead. The figure counts, and a counting
               number in the accessible tree announces every value it passes
               through; the label beside it would then be read a second time. The
               resting card used to state both in its foot block, which is what
               made hiding them here free — it no longer does, so the name on the
               link states them once, statically. See `ariaLabel` below. */
            terminal={
              <>
                <div aria-hidden="true" className="w-full">
                  <div className="flex justify-center">
                    <TerminalGroup industry={entry.industry} ghost />
                  </div>
                  <FootBlock entry={entry} ghost />
                </div>

                {entry.outcome ? (
                  <Rise
                    shown={panelShown}
                    reduce={!!shouldReduce}
                    delay={FIGURE_AT}
                    className="absolute inset-x-0 bottom-0 flex flex-col items-center"
                  >
                    <OutcomeFigure
                      value={entry.outcome.value}
                      shown={panelShown}
                      reduce={!!shouldReduce}
                    />
                    <p
                      aria-hidden="true"
                      className="mt-3 max-w-[22ch] text-balance text-sm leading-snug"
                      style={{ color: payoffInk.label }}
                    >
                      {entry.outcome.label}
                    </p>
                  </Rise>
                ) : null}
              </>
            }
            /* Nothing hangs below the payoff's column: the foot block's height
               has moved up into the slot above, where it is what carries the
               result down to the foot line. Passing the block again here would
               count it twice and drop every slot on the panel. */
            foot={null}
          />
        </PayoffLayer>
      ) : entry.kind === "article" ? (
        <PayoffLayer
          panel={loFiWriting.panel}
          shown={panelShown}
          reduce={!!shouldReduce}
          panelOpacity={panelOpacity}
        >
          {/* THE DECK, in the slot a client's result takes. Set as reading type
              rather than a wordmark, because it is a sentence and the payoff is
              that you can read it — a deck shrunk to logo scale would be a
              texture. `text-sm` on 11.5:1 ink clears the 7:1 floor small text is
              held to. `aria-hidden` because the card's accessible name already
              carries the tagline, and a hover-only line that duplicates it would
              read the piece twice to a screen reader.

              CENTRED ON THE CARD, and the one payoff that does NOT wear the
              resting skeleton. A case study's payoff has two elements that each
              replace a counterpart on the resting card, so it lands them on
              those counterparts' lines. An article's payoff is one paragraph
              with nothing under it: there is no second element to align, and
              hanging a three-line deck off the title box's top edge would put it
              high on a panel that is otherwise empty. So it keeps the axis, on
              the card's own `px-6 py-5` margins, lifted a touch off the foot. */}
          <div className="flex h-full w-full items-center justify-center px-6 py-5">
            <Rise
              shown={panelShown}
              reduce={!!shouldReduce}
              delay={FIGURE_AT}
              className="pb-[6cqw]"
            >
              <p
                aria-hidden="true"
                className="max-w-[26ch] text-balance text-sm leading-snug"
                style={{ color: loFiWriting.ink }}
              >
                {entry.deck}
              </p>
            </Rise>
          </div>
        </PayoffLayer>
      ) : null}
    </motion.article>
  );

  const linkClass =
    /* Capped at `md` rather than `sm` since the gallery holds the grid at two
       columns: at `sm` the card stopped growing around 384px and sat centred in a
       cell half again as wide, which reads as a small card in a big hole rather
       than as generous spacing. The cap still exists so a single card in a
       one-column view does not stretch to a full-width slab. Ring offset is the
       grout the gallery sits on, not the page background. */
    "group mx-auto block w-full max-w-md rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-grout";

  return isArticle ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-explore-card
      data-cursor-label={cursorLabel}
      aria-label={ariaLabel}
      className={linkClass}
    >
      {card}
    </a>
  ) : (
    <Link
      href={href}
      data-explore-card
      data-cursor-label={cursorLabel}
      aria-label={ariaLabel}
      className={linkClass}
    >
      {card}
    </Link>
  );
}
