"use client";

/*
 * PROJECT CARD — the home grid's project preview.
 *
 * Promoted from the "Icon" lab direction and now the single
 * card the home #work grid renders for every entry. The composition rules and
 * the hover motion contract below are preserved from the lab exactly as
 * approved — do not redesign them here; retune only through the constants they
 * document. The home section sits on --secondary so these near-white luminous
 * cards read as distinct lit objects (see page.tsx and the rule note in the
 * report). Meaningful text (the h2 title, the industry tag) is on the card face
 * in the rest state, so nothing the card says depends on the hover.
 *
 * A tall portrait card built as one centred vertical column, after the West Elm
 * brand card in screenshots/cards/center.png. The structure, not its palette:
 *
 *   field          a luminous near-white ground under three blurred pastel
 *                  blooms in harmony, from that project's theme (projectFields.ts)
 *   air            an empty margin at the head
 *   title          large display type, centred, ragged over two or three lines,
 *                  tight leading
 *   silence        the one real gap on the card
 *   tag            the industry, small caps, widely letterspaced, sitting just
 *                  past the two thirds line
 *   glyph          the industry mark at 32px, a hairline drawing sitting tight
 *                  under the tag — the same fact in a figure, closing the column
 *   air            the same margin again at the foot
 *
 * The reference's badge and left edge rule are deliberately absent: they were
 * tried and ruled out. What is left is four elements on one axis, which is why
 * the vertical rhythm has to be exact rather than approximately centred.
 *
 * THE RHYTHM is built on ONE EQUAL MARGIN. An earlier pass ran the head at
 * 10% of card height and the foot at 25%, on the argument that the title should
 * open near the top edge and the foot should keep the reference's own deep
 * bottom margin. That asymmetry has been looked at and rejected: the card is a
 * framed object, and a frame that is two and a half times deeper at the bottom
 * than the top reads as a mistake at a glance, whatever the argument for it.
 * Head and foot are identical, and the whole composition is derived around that
 * lock. Measured on the four-up desktop card (302px wide, 423 tall):
 *
 *   margin at the head       92px  22%   card edge to the top of the title box
 *   title                   112px  26%   three lines at the longest, top aligned
 *   silence                  62px  15%   the declared gap
 *   tag + mark               64px  15%   one unit, held together by a fixed gap
 *   margin at the foot       92px  22%   bottom of the mark's box to the card edge
 *
 * ALL THREE AIRS WERE CUT 20% in this pass, and the card got shorter to pay for
 * it. That is the only way the cut can be real. The airs are flex-grow ratios
 * filling a fixed card height, so scaling 7 / 6 / 7 by 0.8 is the same ratio and
 * flex redistributes into the same box: a literal reading of the instruction is
 * a no-op. The cut has to come out of the card's own height instead, with the
 * two content blocks held at exactly the size they were. So the aspect ratio is
 * what changed, 5:8 to 5:7, and on the desktop card:
 *
 *                    before   after   cut
 *   head margin      115px     92px   19.4%
 *   silence           78px     62px   20.2%
 *   foot margin      115px     92px   19.4%
 *   total air        307px    247px   19.6%
 *   card height      483px    423px
 *
 * The vertical padding scaled with everything else, py-6 to py-5, because the
 * padding is part of the head and foot air and an eye cannot tell it from the
 * flex box beneath it. Holding it at 24px while the flex air fell would have
 * cut the visible margin by only 16% while the silence fell the full 20%, which
 * is not a cut "across the board". 20px is the scale step nearest 0.8 of 24, so
 * the built figures land at 19.4% and 20.2% rather than a flat 20; the residual
 * is one pixel of padding rounding, not a tuned asymmetry.
 *
 * WHAT THE EYE ACTUALLY SEES IS A SMALLER CUT THAN 20% ON MOST CARDS, and this
 * is the one number in the pass that does not do what the instruction says,
 * because two things are being cut and only one of them moved:
 *
 *   - the title box carries a fixed minimum tall enough for the longest title
 *     in the registry at three lines, and the title TOP aligns inside it;
 *   - three of the four titles set on two lines, so those cards leave a third
 *     line of the box empty, and that slack reads as part of the gap.
 *
 * That slack is a content block, held fixed by the brief, so it did not shrink.
 * The VISIBLE gap, last line of the title to the top of the tag, therefore runs
 * 116px to 101px on a two line title (13%) and 80px to 64px on the three line
 * one (20%). The declared cut is honest; the perceived cut on the majority of
 * the set is two thirds of it. Cutting the visible gap the full 20% would mean
 * taking 24px out of the silence alone, which puts the airs at 10 / 6 / 10 and
 * breaks the 7 / 6 / 7 proportion this pass was told to keep.
 *
 * WHY THE TWO READINGS DIVERGE AT ALL, which is worth stating because
 * it looks like sloppiness and is arithmetic. Three things are fixed: the card
 * height, an equal head and foot, and a row of tags on one line. Tags on one
 * line means the terminal group sits at the same height on every card, which
 * means the foot is identical on every card, which — with head equal to foot —
 * means the title box opens at the same height on every card too. Everything
 * around the title is therefore pinned, and the only thing that varies is how
 * much of the title box the title fills. So the visible gap MUST differ between
 * a two and a three line title by exactly one line of display type, 37px here,
 * whatever the ratio is set to. The alternative — a constant gap, with the title
 * bottom aligned in its box — buys identical gaps and pays for them with a head
 * margin that shrinks by half a line on the long title, and head equal to foot
 * is the harder constraint. The variance is spent on the gap deliberately.
 *
 * WHAT THE SHORTER CARD DID TO THE HIERARCHY, which is the real trade and it
 * is a good one. The two content blocks did not move, so on a card 60px shorter
 * they simply own more of it: the title box goes 23% to 26% and the colophon 13%
 * to 15%, while each margin goes 24% to 22%. The old card had a head margin and
 * a title box at the same share, 24 against 23, so the frame was as large an
 * event as the thing it framed. It no longer is. The order is now unambiguous
 * from the proportions alone: title box, then colophon and frame at a tie, then
 * the silence. Weight up, signature down, air last.
 *
 * The cost is the silence, which was already no longer the largest interval and
 * is now the smallest declared one, a hair under the colophon at 15%. A card
 * that opened as a composition about its own emptiness is now a composition
 * about a title with room around it. That is a different card. It is tighter and
 * more object-like and it survives the four-up row better than the tall one did,
 * but the emptiness was the direction's opening idea and this pass has spent
 * most of it. There is not a third 20% in this card.
 *
 * The three airs are flex-grow ratios (7 / 6 / 7) rather than fixed margins, so
 * head and foot stay equal by construction at every card size with nothing to
 * re-tune per breakpoint — the two share an identical `min-h` floor as well as
 * an identical grow, so neither can bind while the other stretches. Across
 * every width the card renders at (286px to 384px wide) the margin holds
 * between 21% and 25% and the declared silence between 14% and 18%; the drift
 * is the fixed type block taking a smaller share of a taller card, and the same
 * drift means the 20% cut itself measures between 17% and 22% across that range,
 * landing on 19.4 / 20.2 at the four-up desktop card the table above quotes.
 * Neither floor binds anywhere in the range: the tightest card, 286px wide in
 * the two-up row, still runs 65px of flex head against a 16px floor and 55px of
 * silence against a 24px one.
 *
 * THE BOXES ARE EXACTLY EQUAL; the ink is three pixels off, measured on the
 * capture at every width. The head margin ends at the title's line box and the
 * cap sits about five pixels inside it on the display face's own leading, while
 * the mark's viewBox is cropped to its drawn bounds and leaves about one. That
 * is 0.6% of card height, below the threshold where an eye reads it as an
 * imbalance, and correcting it would mean a magic offset that changes with the
 * title's point size at every breakpoint. The construction stays honest instead:
 * head and foot are one declaration written twice.
 *
 * Colour comes from the project, not from the card: the ground, the blooms, and
 * the ink on the glyph and type all come out of that entry's theme block via
 * projectFields.ts. Contrast ratios are recorded there.
 */

import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
  type Variants,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";
import { workEntryHref, type WorkEntry } from "../work/projects";
import { IndustryGlyph } from "./IndustryGlyph";
import { loFiInk } from "./loFiInk";
import { getField, type ProjectField } from "./projectFields";

/* HALFTONE DOT DISSOLVE — the card's one expressive hover, read as ONE
   continuous material transformation rather than a run of separate cuts. On
   hover the luminous bloom breaks into a screen of near-print halftone dots in
   the card's own mid-tone colour; the resting title dissolves INTO that forming
   field; and then the dots DISINTEGRATE — every dot scatters outward and fades,
   the field visibly breaking apart and clearing to the plain ground. The
   disintegration is the whole expressive moment, and it is IDENTICAL on every
   card. On a payoff card the brand panel then simply fades in over the cleared
   ground — a plain opacity crossfade, no iris, no radius, no wipe — timed to lag
   the scatter so the break-up is plainly seen first and the colour just arrives
   quietly behind it; that project's logo then rises onto the settled panel. A
   card with no payoff stops at the cleared ground. Every stage eases into the
   next with overlap and no snap, and hover-out reverses the exact same ramps from
   wherever they are, so flicking on and off retargets mid-flight and never
   queues. The rest state carries the title, tag, and mark, so nothing the card
   says depends on the motion (style-rules §7: motion is not information).

   The ramps, geometry, and timing are shared across all four cards, and the
   canvas behaviour is now uniform — every card scatters its dots to clear the
   same way. Only the COLOURS (ground, dot ink) and, for payoff cards, the brand
   panel come per card. These are artwork scene constants, not shell tokens. */
/* THE RULING IS A CELL SIZE, NOT A COLUMN COUNT. A fixed 84 columns made the
   screen get FINER as the card got smaller, which is backwards — a halftone
   ruling belongs to the press, not to the size of the print. On the home grid a
   card runs about 250px wide (three across at `xl`) up to its `max-w-md` cap of
   448px, so 84 columns landed 3.0px to 5.3px cells and roughly a 3.6px dot,
   below the size at which an eye can follow one speck: the hover read as a
   colour flood that turned to snow, and the scatter these constants describe at
   length was invisible.

   Derived from the container's CSS width (not its device-pixel width) so the
   cell holds its physical size on a retina screen, and clamped at both ends.
   CELL_PX and MIN_COLS are the animated covers' — see `.docs/cover-effects.md`
   and SymptomCheckerCover, which screens a synthesized field exactly like this
   one at a ruling the eye can count. One press across the site. Every card the
   grid produces below ~364px is held at MIN_COLS, so cells run 8.9px at the
   narrowest card and 13.2px at the widest; MAX_COLS is a guard against a wider
   future card sliding back toward noise, not a working value. */
const CELL_PX = 13;
const MIN_COLS = 28;
const MAX_COLS = 44;
const LUM_CUTOFF = 0.06;
const DOT_MAX = 0.6;

/* Phase 1: the bloom crossfades into the card-colour halftone. */
const DOTIFY_MS = 280;

/* Phase 2: the assembled halftone DISINTEGRATES. Every dot scatters outward and
   fades until the field has cleared to the plain ground — identical on every
   card. On a payoff card the brand panel crossfades in over the cleared ground
   afterwards (a DOM layer, see LogoPayoff), timed off this same ramp. It runs
   past the 300ms UI-response tokens the same way the ParticleDissolve hero does —
   a card cover is an expressive ambient scene, not a control. The whole gesture
   lands near ~1.05s. */
const REVEAL_MS = 760;

/* Per-dot stagger (fraction of phase-2 progress) and drift distance (fraction of
   card width). The stagger spreads the scatter so the field reads as a wave
   breaking apart rather than a single crossfade; the drift is how far each dot
   travels as it flies out. Every card scatters the same way — the payoff cards
   disintegrate exactly like the plain ones, then fade a panel in on top. */
/* THE DRIFT DOUBLED WITH THE DOTS. At 0.17 a dot travelled about 50px on a 300px
   card, which at the old 3.6px ruling was fourteen dot widths and read as flight,
   and at the new one is four and reads as a shiver. The magnitude spread widened
   too (0.25x..1.20x, against 0.40x..1.00x) so some dots plainly outrun others and
   the field opens unevenly instead of expanding as one sheet — at high density a
   uniform random scatter CONSERVES density, which is the other half of why the
   old dissolve looked like snow rather than flight. */
const STAGGER = 0.4;
const SCATTER_DRIFT = 0.34;
const DRIFT_MIN = 0.25;
const DRIFT_SPREAD = 0.95;

/* THE SCATTER OWNS THE FIRST TWO THIRDS OF PHASE 2, and the plate owns the rest.
   The dissolve is back loaded by construction: position is drift x (1 -
   easeOutCubic(local)), so a dot barely moves through the first half of its own
   schedule and then darts out. Run over the WHOLE reveal ramp that put the travel
   at reveal 0.6..1.0, underneath a panel already opaque at 0.66 — the panel was
   doing all the clearing and the scatter never actually cleared anything. It did
   not show at 3.6px; at 10px it would be the whole effect happening behind a
   curtain. So the dot maths runs on `reveal / SCATTER_SPAN`, clamped: the field
   is fully flown and gone at 0.66, and the panel seals onto a plate the dots have
   genuinely left. */
const SCATTER_SPAN = 0.66;

/* THE MOTION TRAIL, ported from the covers with the ruling that makes it
   readable. A dot redrawn at a new position each frame is a dot that has MOVED;
   it never reads as one that is MOVING. So a dot in flight is stroked back along
   its own drift vector before it is filled, the length proportional to its
   instantaneous speed — 3(1 - local)^2, the derivative of the position ramp,
   exactly zero while the dot sits in the assembled halftone and largest as it
   accelerates away.

   It is a COMET, not a capsule: the wake is stroked at TRAIL_ALPHA of the dot's
   alpha and TRAIL_WIDTH of its width, then the head is filled at full alpha on
   top. Both reductions are load bearing — the eye reads an evenly lit elongated
   shape as an OBJECT of that shape, so a full-alpha, full-width smear turns a
   scattering halftone into a field of tic-tacs. Capped at TRAIL_MAX_R dot radii
   so a fast dot smears rather than becoming a dash. */
const TRAIL_SCALE = 0.022;
const TRAIL_ALPHA = 0.3;
const TRAIL_WIDTH = 0.62;
const TRAIL_MAX_R = 3;

/* Payoff panel crossfade, expressed in phase-2 (reveal) progress. The brand panel
   is a plain DOM layer (LogoPayoff) that fades straight in over the cleared
   ground — no iris, no radius, no wipe. It LAGS the scatter so the disintegration
   is plainly seen first: the dots break apart alone from reveal 0, the panel
   starts to fade at PANEL_FADE_FROM once the median dot is a third of the way out
   and a tenth of the field has already gone, and it reaches full opacity at
   PANEL_FADE_TO just after the last dot leaves at SCATTER_SPAN. The window is
   deliberately wide enough to read as a fade rather than a pop.

   These are re-timed against SCATTER_SPAN rather than re-tuned by feel: the old
   0.30 / 0.66 were the same intent, measured against a scatter that never
   completed. */
const PANEL_FADE_FROM = 0.42;
const PANEL_FADE_TO = 0.72;

/* LOGO_AT is the reveal progress at which the mark begins to rise — set late,
   after the panel has fully faded in (PANEL_FADE_TO), so it settles onto solid
   colour (and, on the dark AP+ panel, never flashes a white wordmark over a
   still-pale field). The resting title dissolves out over TITLE_FADE_FROM..
   TITLE_FADE_TO of the whole gesture (dotify + reveal blended, see the loop),
   with a whisper of blur so the type melts into the dot field as it forms and
   starts to scatter. */
const LOGO_AT = 0.78;
const TITLE_FADE_FROM = 0.2;
const TITLE_FADE_TO = 0.6;
const TITLE_BLUR_PX = 3;

/* LOGO PAYOFFS. Every card scatters its halftone apart on hover the same way. A
   card not in PAYOFFS (an article, no theme) stops there — its dots clear to the
   plain near-white ground. A card LISTED below additionally fades its brand panel
   in over the cleared ground: a plain opacity crossfade of a flat colour layer
   (no iris, no radius, no wipe), timed to lag the scatter so the break-up reads
   first, and just that project's logo then rises onto the settled panel, centred
   and lifted a touch above the axis. The colour arrives quietly, after the
   disintegration — never as a fill the dots merge into.

   Each `panel` is an artwork SCENE constant for this lab card, the same category
   as the bloom hues in projectFields.ts (style-rules §3 artwork carve-out) — pulled from
   that project's `--accent` in its [data-project-theme] block in theme.css and
   hardcoded here rather than read from the CSS var, because the neutral lab shell
   carries no project scope. Each is the pale, near-white hover/focus tint of the
   brand, so the mark lands on its own colour without the panel becoming a poster.

   LOGO_AT (in the shared constants above) is the reveal progress at which the
   mark begins to rise. It is set late, after the panel has fully faded in, so the
   mark settles onto solid colour rather than over a still-scattering dot field —
   the "rise onto the payoff" read. FieldDissolve drives the panel fade and fires
   the crossing.

   LOGO WIDTHS are tuned per card for matched OPTICAL presence, not copied. The
   three marks run very different aspect ratios — HDA ≈ 4:1, Funding Finder ≈
   3.2:1, AP+ ≈ 2.4:1. HDA and Funding Finder share the baseline width (`w-40
   sm:w-44`): the two carry the most linear wordmark, so at equal width they read
   as an even pair. AP+ sits one notch narrower (`w-36 sm:w-40`) — its 2.4:1
   lockup is the chunkiest mark and stacks its wordmark over three lines, so at
   the baseline width it would carry visibly more ink than the other two; the
   step down holds it level with them. Each stays clear of the card edges at the
   tightest card (~286px in the 2-up row, ~238px of usable width inside the
   panel's px-6): the widest mark at `sm:w-44` is 176px, leaving ~31px a side. */
type Payoff = {
  panel: string;
  logo: string;
  width: number;
  height: number;
  alt: string;
  /* Per-card width utility; height is auto. Tuned for optical parity (above). */
  logoClass: string;
};

const PAYOFFS: Record<string, Payoff> = {
  /* --accent #ccecea (HDA Green Lighten 80). HDA mark is width-bounded at the
     widest ratio (4:1); its width is the baseline the other two are matched to. */
  "healthdirect-symptom-checker": {
    panel: "#ccecea",
    logo: "/assets/logos-clients/logo-hda.svg",
    width: 444,
    height: 109,
    alt: "healthdirect logo",
    logoClass: "w-40 sm:w-44",
  },
  /* --accent #fbe9f0 (pale pink). Fills are ink plum #361134 and brand pinks
     (#EA3788 / #F391A0) — all read clearly on the pink panel. Its 3.2:1 wordmark
     is close enough to HDA's line that it carries the baseline width, matching
     the HDA mark as an even pair. */
  "funding-finder": {
    panel: "#fbe9f0",
    logo: "/assets/logos-clients/funding-finder.svg",
    width: 160,
    height: 50,
    alt: "Funding Finder logo",
    logoClass: "w-40 sm:w-44",
  },
  /* --grout #0d033c (AP+ midnight, the theme's deepest brand colour). This mark
     is a REVERSED lockup — its wordmark is filled white, so it vanishes on a
     pale panel; midnight is the ground it was drawn for and carries the white at
     19.2:1, the same pairing as the AP+ case-study grout. The lone dark panel in
     the set, matching the logo rather than the pale-tint convention. Filename
     carries spaces — referenced URL-encoded (%20). Ratio 2.4:1 is the chunkiest
     mark and stacks its wordmark over three lines, so it takes the narrowest
     width — one notch under the other two — to keep optical weight in line. */
  "ap-testing-portal": {
    panel: "#0d033c",
    logo: "/assets/logos-clients/AP%20plus%20logo%201_sm.svg",
    width: 242,
    height: 102,
    alt: "AP+ Testing Portal logo",
    logoClass: "w-36 sm:w-40",
  },
  /* --accent #eaebed (Macquarie's pale blue-grey theme accent). Follows the
     pale-tint convention like HDA and Funding Finder, not the AP+ midnight
     panel: the mark is a red lighthouse shield with a black wordmark, which
     reads cleanly on the pale panel. The ONE raster mark in the set — a
     transparent webp, not an SVG, because that is the asset we have; a plain
     <img> like the others carries it fine at these sizes.

     SIZING CAVEAT: the file is a SQUARE 550x550 canvas holding a HORIZONTAL
     lockup, so the visible mark is only ~28% of the box height (heavy
     transparent padding top and bottom) even though the ink runs nearly the
     full box width. A width class therefore renders a mark that reads shorter
     and lighter than the same width does on the tight-cropped SVGs, so this
     entry carries a wider class than the other three to land at optical parity
     rather than equal box width. */
  "macquarie-radar": {
    panel: "#eaebed",
    logo: "/assets/logos-clients/mq.webp",
    width: 550,
    height: 550,
    alt: "Macquarie University logo",
    logoClass: "w-52 sm:w-56",
  },
};

type Scene = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  cols: number;
  rows: number;
  cellW: number;
  cellH: number;
  /* Synthesized field luminance per cell (0..1) — drives dot size and alpha. */
  field: Float32Array;
  /* dx, dy, delay per dot. */
  scatter: Float32Array;
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
/* Hermite ramp between two edges, used for the title fade and the panel crossfade
   so each has soft shoulders instead of a linear start and stop. */
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * A soft field luminance at grid coordinate (u, v) in [0, 1]. Brighter toward
 * the upper-left where a soft light sits, so the halftone has gentle life
 * rather than a dead-flat dot grid, while staying above LUM_CUTOFF everywhere
 * so the whole field dissolves evenly (no holes). This is the dot SCREEN's own
 * light, not a sample of the blooms — the dots read as the card's ground
 * breaking into print, and they need only be alive, not a copy of the field.
 */
function fieldLum(u: number, v: number): number {
  const glow = 0.9 - Math.hypot(u - 0.3, v - 0.32); // soft light upper-left
  const base = 0.42 + 0.16 * (1 - v) + 0.1 * (1 - u) + 0.14 * Math.max(0, glow);
  return Math.min(0.85, Math.max(0.28, base));
}

/**
 * The hover transformation for one card, run as a single continuous gesture.
 * FieldDissolve owns the bloom, the halftone canvas, and — for payoff cards — the
 * resting title column's fade and the brand panel's crossfade, and drives them all
 * from one self-cancelling rAF loop, so nothing re-renders per frame and the
 * stages ease into one another with no cuts:
 *
 *   1. dotify (0..1): the bloom crossfades into a card-colour halftone.
 *      bloom.opacity = 1 - dotify, canvas.opacity = dotify.
 *   2. reveal (0..1): the halftone DISINTEGRATES. Every card scatters the dots
 *      out and fades them on their staggered schedule until the field has cleared
 *      to the plain ground — the canvas behaviour is identical on all four cards.
 *      A payoff card does two extra things off this same ramp, both timed to LAG
 *      the scatter so the break-up reads first: it fades its brand panel in over
 *      the cleared ground (a plain opacity crossfade on the LogoPayoff DOM layer,
 *      via the `panelOpacity` MotionValue, PANEL_FADE_FROM..PANEL_FADE_TO), and at
 *      LOGO_AT it fires `onReveal` so the mark rises onto the settled panel. The
 *      resting title dissolves into the forming field over the blended dotify+
 *      reveal ramp (opacity + a whisper of blur).
 *
 * The bloom and canvas opacities are plain imperative `style` writes — they are
 * non-Motion elements the loop owns outright. The title fade and the panel
 * crossfade, however, live on `motion` elements whose values Motion also manages,
 * so they are driven through MotionValues (`contentOpacity`, `contentBlur`,
 * `panelOpacity`) the loop `.set()`s rather than inline-style writes: the parent
 * re-renders on the hover and LOGO_AT crossings, and an imperative
 * `element.style.opacity` on a Motion element races that reconcile (Motion can
 * re-assert its own value on the render frame). Handing each value to a MotionValue
 * makes Motion own it consistently across those renders, so the fades hold instead
 * of being stomped.
 *
 * Both ramps are position based (advance by dt/duration toward the current
 * target), so hover-out reverses from wherever it is — interruptible, never
 * queued, and the loop stops itself once fully back at the flat field. Reduced
 * motion drops the canvas, the loop-driven title fade, and the loop-driven panel
 * fade entirely and keeps a still bloom that eases down a touch on hover (opacity
 * only, no movement); the panel and mark crossfade in from LogoPayoff instead.
 */
function FieldDissolve({
  field,
  hovered,
  contentOpacity,
  contentBlur,
  panelOpacity,
  onReveal,
}: {
  field: ProjectField;
  hovered: boolean;
  /* Payoff cards only: the resting title column's opacity and blur (px), owned by
     Motion and driven by the loop in step with the dot field so the type melts
     into the forming dots rather than jump-cutting out. MotionValues rather than a
     ref of inline-style writes, so the fade survives the parent's re-renders on
     the hover and LOGO_AT crossings (see the component docstring). */
  contentOpacity?: MotionValue<number>;
  contentBlur?: MotionValue<number>;
  /* Payoff cards only: the brand panel's opacity (0..1), owned by Motion and
     driven by the loop off the reveal ramp (PANEL_FADE_FROM..PANEL_FADE_TO) so the
     flat colour layer fades in plainly, lagging the scatter. Its presence is what
     makes this a payoff card. */
  panelOpacity?: MotionValue<number>;
  /* Payoff cards only: fires once when reveal crosses LOGO_AT, so the parent can
     raise the mark onto the by-then sealed panel. */
  onReveal?: (revealed: boolean) => void;
}) {
  const shouldReduce = useReducedMotion();
  const reduce = !!shouldReduce;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const dotifyRef = useRef(0);
  const revealRef = useRef(0);
  const hoveredRef = useRef(hovered);
  /* Kept in a ref so the rAF loop reads the latest callback without re-tuning
     its own dependencies, and the reveal flag so the loop fires only on a
     crossing rather than every frame. */
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
    if (sceneRef.current && sceneRef.current.w === w && sceneRef.current.h === h) return;
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

    sceneRef.current = { ctx, w, h, cols, rows, cellW, cellH: h / rows, field: fieldArr, scatter };
  }, []);

  /* Paints the halftone dots at a given settle (1 = fully assembled, 0 = fully
     scattered and gone) in the card's dot ink. Assumes the caller has already
     cleared the canvas, so it only ever adds dots on top. Each dot moves toward
     its own scatter offset on its staggered schedule and fades as it drifts, so
     the field breaks apart as a wave rather than a crossfade. Shared by every
     card: the payoff dots disintegrate exactly like the plain ones.

     `dir` is +1 while the dots are flying out and -1 while they are flying home
     on hover-out. The comet wake has to lie BEHIND the direction of travel, and
     on the way home that is the far side of the dot; without the sign a reversed
     dissolve draws every wake pointing the way it is going.

     Alpha takes the square root of the ease so a dot stays lit through most of
     its travel instead of spending its light before it has moved far enough to be
     SEEN moving — see LoFiProjectCard, which carries the same maths and the full
     note on why this stopped being a light-ground carve-out. */
  const drawDots = useCallback((settle: number, dir: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const { ctx, cols, rows, cellW, cellH, field: fieldArr, scatter } = scene;

    ctx.fillStyle = field.dot;
    ctx.strokeStyle = field.dot;
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
           largest as it accelerates out, so the smear only ever appears on a dot
           that is actually travelling. */
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
  }, [field.dot]);

  /* Clear the canvas and scatter the dots to the plain ground. settle=1 is the
     fully assembled halftone, settle=0 fully scattered and gone. Used by every
     card — the canvas behaviour is uniform; a payoff card just fades its panel in
     over the cleared ground afterwards (the DOM LogoPayoff layer). */
  const drawFrame = useCallback((settle: number, dir: number) => {
    const scene = sceneRef.current;
    if (!scene) return;
    scene.ctx.clearRect(0, 0, scene.w, scene.h);
    drawDots(settle, dir);
  }, [drawDots]);

  /* Hover loop: raise dotify to 1 then raise reveal while hovered; on hover-out
     lower reveal to 0 first, then lower dotify, so the motion reverses from
     wherever it is. Every frame it writes the bloom and canvas opacity (plain
     non-Motion elements) imperatively and — on a payoff card — pushes the resting
     title's opacity and blur and the brand panel's opacity into their
     MotionValues, so every layer stays locked with no React re-render. The loop
     stops itself once fully back at the flat field. */
  const startLoop = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setup();

    const secondMs = REVEAL_MS;
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
        else reveal = Math.min(1, reveal + dt / secondMs);
      } else if (reveal > 0) {
        reveal = Math.max(0, reveal - dt / secondMs);
      } else {
        dotify = Math.max(0, dotify - dt / DOTIFY_MS);
      }
      dotifyRef.current = dotify;
      revealRef.current = reveal;

      /* Fire the payoff logo crossing (payoff cards pass a callback; the others
         leave it undefined and this is a no-op). */
      const revealed = reveal >= LOGO_AT;
      if (revealed !== revealedRef.current) {
        revealedRef.current = revealed;
        onRevealRef.current?.(revealed);
      }

      canvas.style.opacity = String(dotify);
      const bloom = bloomRef.current;
      if (bloom) bloom.style.opacity = String(1 - dotify);

      /* The resting title dissolves into the forming field. Its progress blends
         dotify (breaking into dots) and reveal (the scatter) into one 0..1 so the
         fade begins as the bloom breaks up and finishes early in the scatter, well
         before the panel fades in — no jump-cut, no double-exposure under the mark.
         A whisper of blur melts the type into the dots. Pushed into Motion-owned
         values so the parent's hover/LOGO_AT re-renders cannot reassert the
         opacity the loop just set. */
      if (contentOpacity) {
        const p = dotify < 1 ? dotify * 0.45 : 0.45 + reveal * 0.55;
        const tf = smoothstep(TITLE_FADE_FROM, TITLE_FADE_TO, p);
        contentOpacity.set(1 - tf);
        contentBlur?.set(tf > 0 ? tf * TITLE_BLUR_PX : 0);
      }

      /* The brand panel fades in plainly over the cleared ground, lagging the
         scatter (PANEL_FADE_FROM..PANEL_FADE_TO) so the dots are seen breaking
         apart before the flat colour arrives, and reaching full opacity before
         LOGO_AT so the mark rises onto a sealed panel. Pushed into a Motion-owned
         value for the same reason as the title fade. */
      if (panelOpacity) panelOpacity.set(smoothstep(PANEL_FADE_FROM, PANEL_FADE_TO, reveal));

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

  /* One stable tree in both modes and on the server, so nothing structural
     diverges after hydration (useReducedMotion resolves to null on the server).
     Full motion: the rAF loop above writes bloom and canvas opacity imperatively
     (bloom carries no `animate`, so those writes hold). Reduced motion: the loop
     never starts and the canvas stays empty; the bloom instead eases its opacity
     down a touch on hover — an opacity-only cue that hints at the same clearing
     with no movement, the vestibular-safe half of the effect. */
  return (
    <div ref={containerRef} aria-hidden="true" className="absolute inset-0">
      <motion.div
        ref={bloomRef}
        className="absolute inset-0"
        style={{ backgroundImage: field.image }}
        initial={false}
        animate={reduce ? { opacity: hovered ? 0.72 : 1 } : undefined}
        transition={{ duration: motionDuration.base, ease: motionEase.out }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0 }}
      />
    </div>
  );
}

/**
 * The brand panel and the mark that rises onto it. The panel is a flat colour
 * layer (`backgroundColor: payoff.panel`) that fills the card and fades straight
 * in — a plain opacity crossfade, no iris, no radius, no wipe — and the mark lifts
 * `y: 12 -> 0` and fades in above it, delayed a touch so it settles once the panel
 * has sealed. The whole layer sits ABOVE the title column, stays mounted (so the
 * mark is preloaded and never flashes), and is `pointer-events-none`, so at rest
 * it is an invisible layer that never intercepts the card's own hover.
 *
 * In FULL MOTION the panel's opacity is driven by FieldDissolve's rAF loop through
 * the `panelOpacity` MotionValue, so the crossfade is frame-locked to the reveal
 * ramp and lags the scatter (the dots break apart first, then the flat colour
 * arrives). Motion owns the value across the parent's re-renders, so it holds. In
 * REDUCED MOTION the loop never runs, `panelOpacity` stays 0, and an `animate` on
 * `shown` crossfades the panel in instead (opacity only), with the mark's rise
 * dropped — a bare crossfade of colour and mark over the still bloom, mirroring
 * SymptomCheckerCover's reduced-motion reveal (style-rules §7: the reveal never
 * depends on motion, and the rest state already carries the title). No positional
 * or scale movement survives the pass.
 *
 * The mark is centred and carries `mb-6` so it sits a touch above dead-centre —
 * the same lift on every card, so the payoffs share one composition. Its width
 * comes from the PAYOFFS entry, tuned for optical parity across ratios.
 *
 * Plain <img> for the marks — next/image would need SVG opt-in and buys nothing
 * for these small vectors. A real alt: this is a brand reveal, not decoration.
 */
function LogoPayoff({
  payoff,
  shown,
  reduce,
  panelOpacity,
}: {
  payoff: Payoff;
  shown: boolean;
  reduce: boolean;
  /* Full motion: the brand panel's opacity, driven by FieldDissolve's loop off the
     reveal ramp so the crossfade lags the scatter. In reduced motion the loop never
     runs and this stays 0, so the panel `animate`s on `shown` instead. */
  panelOpacity: MotionValue<number>;
}) {
  /* The mark rises and fades on the `slow` token — this is the moment; on
     hover-out it retreats quickly on ease.in so a flick off never lingers. */
  const markT = shown
    ? { duration: reduce ? motionDuration.fast : motionDuration.slow, ease: motionEase.out, delay: reduce ? 0 : 0.08 }
    : { duration: reduce ? motionDuration.fast : motionDuration.instant, ease: motionEase.in };

  return (
    <div
      aria-hidden={!shown}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 py-6 text-center sm:py-8"
    >
      {/* The brand panel — a flat colour layer that fades straight in over the
          cleared ground. In full motion its opacity rides the `panelOpacity`
          MotionValue that FieldDissolve's loop drives off the reveal ramp, so the
          crossfade lags the scatter (the dots break apart first). In reduced
          motion the loop never runs (the value stays 0) and `animate` crossfades
          it in on `shown` instead. Rendered in both modes (never conditionally) so
          the tree is identical on the server and after hydration. */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: payoff.panel, opacity: panelOpacity }}
        initial={false}
        animate={reduce ? { opacity: shown ? 1 : 0 } : undefined}
        transition={{ duration: motionDuration.fast, ease: shown ? motionEase.out : motionEase.in }}
      />

      {/* The mark rises onto the settled colour. */}
      <motion.img
        src={payoff.logo}
        alt={payoff.alt}
        width={payoff.width}
        height={payoff.height}
        className={`relative mb-6 h-auto ${payoff.logoClass}`}
        initial={false}
        animate={{ opacity: shown ? 1 : 0, y: reduce ? 0 : shown ? 0 : 12 }}
        transition={markT}
      />
    </div>
  );
}

export function ProjectCard({ entry, index }: { entry: WorkEntry; index: number }) {
  const shouldReduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  /* The card's payoff mark: raised once the reveal crosses LOGO_AT (full motion)
     or plainly on hover (reduced motion). */
  const [revealed, setRevealed] = useState(false);
  /* The resting title column's fade, on payoff cards in full motion. Held in
     MotionValues so Motion owns them across the hover/LOGO_AT re-renders: the loop
     `.set()`s them and the column binds them via `style`, so an imperative write
     on a Motion element can never be stomped back on reconcile. Untouched in
     reduced motion (the loop never runs) — the column's `animate` crossfade drives
     opacity there instead, and blur stays 0. */
  const contentOpacity = useMotionValue(1);
  const contentBlur = useMotionValue(0);
  const contentFilter = useMotionTemplate`blur(${contentBlur}px)`;
  /* The brand panel's opacity on payoff cards in full motion. Held in a MotionValue
     so Motion owns it across the hover/LOGO_AT re-renders: the loop `.set()`s it and
     LogoPayoff's panel binds it via `style`. Untouched in reduced motion (the loop
     never runs) — LogoPayoff's `animate` crossfades the panel on `panelShown`
     instead, and this stays 0. */
  const panelOpacity = useMotionValue(0);
  const href = workEntryHref(entry);
  const isArticle = entry.kind === "article";
  const slug = entry.kind === "case-study" ? entry.slug : undefined;
  const field = getField(slug);
  /* Cards in PAYOFFS resolve into a brand panel; the rest scatter to ground. */
  const payoff = slug ? PAYOFFS[slug] : undefined;
  const panelShown = !!payoff && (shouldReduce ? hovered : revealed);

  const ariaLabel = isArticle
    ? `Read "${entry.title}" (opens in a new tab): ${entry.tagline}`
    : `Open the ${entry.title} case study: ${entry.tagline}`;
  /* Label for the ExploreCursor magnetic follower (fine-pointer, hover-capable
     devices only). The cursor reads it off `data-cursor-label` and gates its
     active state on `data-explore-card`; both hooks live on the link, not the
     card frame, so the whole target drives the cursor. */
  const cursorLabel = isArticle ? "Read" : "Open";

  /* Card motion. Entry is the house fade-up with a stagger inside budget
     (4 items, 0.05s apart, 200ms each = 350ms total). Hover is the one
     expressive moment and it lives entirely in the field below (FieldDissolve):
     the bloom breaks into a halftone of the card's own colour that scatters
     apart and clears; on a payoff card the brand panel then fades in plainly and
     the mark rises. The card itself stays put — no lift, no swell — so the dissolve is the
     single move and the type never rides a transform. Only the shadow lifts, via
     the CSS group-hover below, which reduced motion is free to keep. */
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
      className="relative isolate aspect-[5/7] overflow-hidden rounded-2xl shadow-card transition-shadow duration-100 group-hover:shadow-elevated"
      style={{ backgroundColor: field.ground }}
    >
      {/* The luminous field and its hover transformation. Sits exactly on the
          card, so every bloom position in projectFields.ts means what it says. Owns the
          bloom, the dot canvas, and (on payoff cards) the resting title's fade and
          the brand panel's crossfade; driven by Motion hover events (not :hover)
          so a touch tap never fires the dissolve. A payoff card passes its
          `contentOpacity`/`contentBlur` MotionValues (the title dissolves in step)
          and `panelOpacity` (the flat brand panel fades in over the cleared ground,
          lagging the scatter). */}
      <FieldDissolve
        field={field}
        hovered={hovered}
        contentOpacity={payoff && !shouldReduce ? contentOpacity : undefined}
        contentBlur={payoff && !shouldReduce ? contentBlur : undefined}
        panelOpacity={payoff && !shouldReduce ? panelOpacity : undefined}
        onReveal={payoff && !shouldReduce ? setRevealed : undefined}
      />

      {/* Fine grain over the blooms. Wide soft gradients band on 8-bit displays;
          a whisper of noise at overlay keeps the field smooth and tactile
          without dirtying the light where the type sits. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* The centred column: margin, title, silence, tag + mark, the same
          margin. Head and foot carry identical classes on purpose — that
          equality is the composition, so it is expressed as one repeated
          declaration rather than two tuned numbers that happen to match. The
          silence grows at 6 against their 7, a proportion originally set from
          the VISIBLE gap on a two line title rather than the declared share,
          because the empty third line of the title box reads as gap. The 20%
          cut left that proportion alone and took the space out of the card's
          height instead; `py-5` is the padding half of the same cut, scaled
          with the flex air so the two halves of the margin fall together (see
          the header). */}
      {/* A payoff card dissolves this resting column out as the bloom breaks into
          dots, so the title melts into the forming field rather than jump-cutting
          out — no double-exposure under the arriving panel. In FULL MOTION the
          fade (opacity + a whisper of blur) rides the `contentOpacity`/`contentBlur`
          MotionValues that FieldDissolve's loop drives, frame-locked to the dot
          progress; Motion owns those values, so there is no `animate` and the hover
          and LOGO_AT re-renders cannot reassert them. In REDUCED MOTION the loop
          never runs, so `animate` crossfades the same `opacity` MotionValue on
          `panelShown` (opacity only, blur stays 0). Cards without a payoff never
          fade — their MotionValues stay at 1 / 0 and the column holds on the
          ground the whole time. */}
      <motion.div
        className="relative flex h-full flex-col items-center px-6 py-5 text-center"
        style={{ color: field.ink, opacity: contentOpacity, filter: contentFilter }}
        initial={false}
        animate={shouldReduce ? { opacity: panelShown ? 0 : 1 } : undefined}
        transition={{ duration: shouldReduce ? 0.01 : motionDuration.fast, ease: motionEase.in }}
      >
        <div aria-hidden="true" className="min-h-4 basis-0 grow-7" />

        {/* The measure, not the point size, is what makes the rag. At 10ch every
            title in the registry breaks the way the reference does — two ragged
            lines, three for the longest — where a wider box would leave three of
            the four on a single line and the set would lose its shape.

            The box floor is one longest title at three lines and the title top
            aligns inside it. That floor is what holds a row of tags on one line:
            it is the only element between the head margin and the tag, so a
            constant box height is a constant tag height. The price is the empty
            third line on a two line title, which is the slack the gap ratio
            above is tuned around. */}
        <div className="flex w-full min-h-24 items-start justify-center sm:min-h-28">
          <h2 className="max-w-[10ch] text-balance font-heading text-3xl font-medium leading-[1.02] tracking-[-0.015em] sm:text-4xl">
            {entry.title}
          </h2>
        </div>

        <div aria-hidden="true" className="min-h-6 basis-0 grow-6" />

        {/* The terminal group. The tag names the sector in words and the mark
            restates it as a figure, so they are one unit on a fixed gap rather
            than two elements the flex airs could ever drift apart.

            THE TAG IS SET IN CAPS, which is a change of register as much as of
            case: lowercase read as a caption of the title, caps read as a
            colophon stamped on the card, which is the job. Caps then need more
            air than the 0.22em the lowercase setting was tuned to — even
            height, flat tops and no ascender rhythm make a cap string pack into
            a solid bar at that value — so the tracking opens to 0.28em, which
            is where "HIGHER EDUCATION" stops reading as one word and starts
            reading as spaced letters. Both sit past the standard tracking
            scale's 0.1em ceiling, which is a heading utility rather than a
            display letterspacing range; the repo already spaces its eyebrows
            this way.

            The `indent` is optical centring, not a gap. Letterspacing puts a
            trailing space after the LAST letter that centring counts as ink, so
            a centred cap string hangs half a tracking unit left of the axis —
            1.7px here, on a card whose entire premise is one exact axis with a
            hairline glyph on it. A text-indent equal to the tracking shifts the
            line back by half its own value, which cancels it exactly. */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {entry.industry ? (
            <p className="indent-[0.28em] text-xs font-medium uppercase tracking-[0.28em]">
              {entry.industry}
            </p>
          ) : null}

          <IndustryGlyph industry={entry.industry} className="size-8 shrink-0" />
        </div>

        <div aria-hidden="true" className="min-h-4 basis-0 grow-7" />
      </motion.div>

      {/* A payoff card fades its brand panel in over the cleared ground and rises
          its mark onto it. Rendered only for cards in PAYOFFS; the rest stop at the
          scatter-to-ground clear. Sits above the column so the sealed panel carries
          the mark over the resting title. */}
      {payoff ? (
        <LogoPayoff payoff={payoff} shown={panelShown} reduce={!!shouldReduce} panelOpacity={panelOpacity} />
      ) : null}
    </motion.article>
  );

  /* The card is capped and centred in its grid cell at every width. Its type
     comes from the standard scale, so it cannot grow with the card; past about
     384px the title stops being large-on-a-card and starts being small-in-a-
     field, and the rhythm the whole direction rests on goes slack. Capping the
     artwork is the honest fix — the two-up rows between 1024 and 1280 simply
     centre a correctly proportioned card instead of stretching a wrong one. */
  const linkClass =
    "group mx-auto block w-full max-w-sm rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-secondary";

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

/**
 * The trailing placeholder tile for a project not yet ready to show. A quiet
 * member of the same set: the identical 5:7 portrait frame, radius, and shadow,
 * and the same centred column geometry as ProjectCard — but no field, no tag, no
 * glyph, no payoff, and no hover dissolve. It rests one step down on --muted (a
 * touch quieter than the section's --secondary ground), so it reads as "more to
 * come" rather than an object to reach for. It is not a link and carries no
 * project semantics: just "Coming soon" on the card's own axis, in
 * muted-foreground. It shares ProjectCard's fade-up entry so it arrives with the
 * grid; reduced motion drops the movement (style-rules §7).
 *
 * Kept beside ProjectCard rather than inlined in page.tsx so the frame geometry
 * (aspect, radius, padding, the head/foot air) stays defined once and cannot
 * drift from the real cards.
 */
export function ComingSoonCard({ index }: { index: number }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.article
      initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: shouldReduce ? 0 : Math.min(index * 0.05, 0.15),
      }}
      /* The hairline is the lo-fi family's edge, and this card takes it because
         the home grid it sits in is now entirely lo-fi. It used to be the one
         flat card among luminous ones, where a borderless muted plate read as
         deliberately quiet; against seven flat grey cards that all declare an
         edge, the same plate reads as one that lost its border. Paper and rule
         come from `loFiInk` rather than shell tokens for the same reason the
         cards do — they are artwork constants (style-rules §3). */
      className="relative isolate mx-auto flex aspect-[5/7] w-full max-w-md flex-col items-center overflow-hidden rounded-2xl border px-6 py-5 text-center shadow-card"
      style={{ backgroundColor: loFiInk.paper, borderColor: loFiInk.rule }}
    >
      <div aria-hidden="true" className="min-h-4 basis-0 grow-7" />
      <div className="flex w-full min-h-24 items-start justify-center sm:min-h-28">
        <p className="font-heading text-3xl font-medium leading-[1.02] tracking-[-0.015em] text-muted-foreground sm:text-4xl">
          Coming soon
        </p>
      </div>
      <div aria-hidden="true" className="min-h-6 basis-0 grow-6" />
      <div aria-hidden="true" className="min-h-4 basis-0 grow-7" />
    </motion.article>
  );
}
