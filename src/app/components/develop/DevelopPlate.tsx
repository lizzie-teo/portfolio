"use client";

/*
 * DEVELOP PLATE — a still picture that develops while you look at it.
 *
 * THE IDEA, in the language this site already speaks. The home cards rest
 * undeveloped and resolve into print on hover: a halftone screen forms, scatters,
 * and the payoff floods in. That is a darkroom metaphor, and this plate is the
 * same metaphor applied to a photograph instead of a card. At rest it is a latent
 * image — greyscale, flat, a dot screen sitting over it. Look at it and it
 * DEVELOPS: contrast comes up, the picture darkens, the grain starts moving, and
 * the frames begin to turn over. It never gains colour, because a print coming up
 * in a tray does not gain colour, and the moment it did the effect would read as
 * a filter toggling rather than as a process happening.
 *
 * WHAT IS SHARED AND WHY IT IS SHARED. Both card shells consume this. Running the
 * same "develops on attention" language from two independent implementations is
 * how two cards end up with the same idea at two different speeds, so the
 * mechanism lives here once — media strategies, treatment layers, timing — and
 * the shells own only their own typography.
 *
 * THE TONE NO LONGER ANIMATES. ONLY MOTION DOES. This is the one place the
 * original brief has been overruled, and the reason is worth keeping because it
 * only became visible once bespoke scenes replaced photographs.
 *
 * The develop treatment was built as a contrast lift: a multiply veil deepening
 * shadows and a screen layer lifting highlights, both ramping up on activation.
 * That works on a PHOTOGRAPH, which has a tonal range to widen. A scene does not.
 * A scene is mostly flat dark ground, and screening a near-white over near-black
 * lifts it hard, so on scene media the ramp had no range to work on and simply
 * raised the whole plate — which reads as THE BACKGROUND CHANGING COLOUR ON HOVER,
 * not as a picture developing. Three attempts at fixing this by re-deriving the
 * ground colour missed, because the ground was never the problem.
 *
 * So the tone is pinned at the values it used to reach only on activation, and
 * hover, focus, and scroll-into-centre now drive the plate's spring scale, the
 * film grain, the scene's own performance — and exactly one tone move: a single
 * multiply that DEEPENS the whole plate a step (`TONE_DEEPEN`). Direction is the
 * entire point of that survivor. The old ramp lifted the plate on activation,
 * which fought the idea it was meant to express; a print in a tray comes down out
 * of the wash as it develops, not up. The develop metaphor now lives where it was
 * always strongest — the scene resolving its argument — with the tone doing one
 * quiet thing in support instead of asserting the whole idea by itself.
 *
 * The layers themselves stay. They are still doing real work over the media (ink
 * on a print, a screen that bites), and they still matter for the `frames` and
 * `clip` strategies where the source really is photographic. They just no longer
 * move.
 *
 * NO FILTER IS EVER ANIMATED, and the constraint shaped the whole treatment.
 * `filter: grayscale(1)` is set once and never moves. Development is expressed by
 * two stacked layers whose OPACITY animates instead: a multiply veil that drops
 * brightness, and an overlay wash that lifts contrast. Both are cheap compositor
 * work where an animated `filter` would force a repaint of the whole plate every
 * frame, and the visual result is the one the brief asks for — the picture being
 * developed, not colourised. Transform is limited to a single spring on scale.
 *
 * THE TREATMENT LAYERS ARE ARTWORK, not UI, and follow the style-rules §3
 * artwork-scene-constant carve-out: their colours come from `loFiInk`, the same
 * warm ink the lo-fi card already draws in, and the texture parameters below sit
 * beside the artwork rather than becoming tokens. None of it is ever referenced as
 * UI colour.
 *
 * REDUCED MOTION IS A HARD STOP. `useDevelopActivation` never returns true, so
 * every ramp below sits at its resting value, the frame timer never starts, and
 * the grain is not rendered at all. What is left is frame one, greyscale, with its
 * dot screen — a complete and deliberate static state, not a degraded one.
 */

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { motionDuration, motionEase } from "../../lib/motion";
import { loFiInk } from "../loFiInk";
import { PlateActiveContext } from "./plateActive";
import type { PlateMedia } from "./plateMedia";

/* ─── Artwork constants ────────────────────────────────────────────────────────
 *
 * Timing and texture for the plate, held beside the artwork exactly as
 * LoFiProjectCard holds its dissolve ramps. Not tokens: a halftone pitch is not a
 * spacing decision and a frame hold is not a UI response time, so neither belongs
 * on the shared scales (§2, §4). They are tuned by eye at card size and recorded
 * here so the next person tunes the same numbers instead of new ones.
 */

/** How long each frame holds before turning over. Long enough to read as a
    photograph rather than a flicker; short enough that a reader who pauses on a
    card sees the loop come round. */
const FRAME_HOLD_MS = 1150;
/** The cross-dissolve itself. Deliberately not instant — a hard cut reads as a
    broken image swap, and the overlap is what sells one picture becoming
    another. */
const FRAME_DISSOLVE = motionDuration.base;
/* Halftone pitch and dot radius, in px, and the two opacities the screen runs
   between.
 *
 * RETUNED ONCE ALREADY, and the direction of the fix is worth recording because
 * the obvious one is wrong. The first pass ran a 3px pitch at 0.2, which was
 * tuned against photographs. Over the flat fills of a vector scene the same screen
 * reads much heavier — there is no grain in the source for the dots to sit inside,
 * so they land as a uniform film ON the picture, which is precisely the "reads as
 * a dot texture rather than an image" failure.
 *
 * The reflex fix is to lower the opacity and stop there. That makes it fainter
 * without making it read as printing, because at a 3px pitch the individual dots
 * are still too small to resolve as dots at card size — a fainter uniform film is
 * still a film. So the pitch goes UP as the ink comes DOWN: coarser dots are
 * legible AS dots, which is what makes the eye read "this is printed" instead of
 * "this is textured", and the wider spacing drops total coverage from about 17% to
 * 12.6% before opacity is applied at all. Net ink is roughly a third lighter and
 * the screen reads more like a screen, not less. */
const DOT_PITCH = 4;
const DOT_RADIUS = 0.8;

/* THE PLATE'S TONE — one fixed set now, rather than the two ends of a ramp. These
   are the values the plate used to reach only on activation, and it wears them all
   the time. Change the veil and the fixer together: they are a matched pair, and
   moving one alone shifts brightness where the pair expresses contrast. */
const DOT_OPACITY = 0.26;
const TONE_VEIL = 0.22;
const TONE_FIX = 0.12;

/* THE ONE TONE CHANGE LEFT ON ACTIVATION: the plate deepens a little.
 *
 * It is a separate layer at the top of the stack rather than a nudge to the pair
 * above, because neither of those can do this job. Raising `TONE_VEIL` is almost
 * invisible — the fixer's screen contributes most of the ground's final value and
 * swamps it, so a veil moved from 0.22 to 0.30 shifts the composite by about one
 * value in 255. Lowering `TONE_FIX` does darken, but by pulling the highlights
 * down it flattens photographic media, which the `frames` and `clip` strategies
 * still need.
 *
 * A multiply over the finished composite darkens everything uniformly instead, so
 * it behaves the same over a flat scene and over a photograph. In the warm plate
 * ink rather than black: black would drag the chroma out as it darkens, which is
 * the exact fault that made three earlier ground derivations read as the wrong
 * grey. */
const TONE_DEEPEN = 0.25;
/** How much the plate grows as it develops. Small enough to feel like the picture
    leaning forward rather than a zoom. */
const PLATE_SCALE = 1.03;

/* The dot screen, as one repeating CSS background — a single paint, no canvas.
   Multiply so the dots behave like ink laid on the picture rather than a grey
   film floating above it. */
const halftone = `radial-gradient(circle at center, ${loFiInk.paper} 0 ${DOT_RADIUS}px, transparent ${DOT_RADIUS}px)`;

export function DevelopPlate({
  media,
  active,
  className = "",
}: {
  media: PlateMedia;
  /** Supplied by the card frame via `useDevelopActivation` — hover, focus, or
      nearest-to-centre on touch. The plate never works this out itself: "one card
      at a time" is a fact about the page, not about a plate. */
  active: boolean;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();
  const reduce = !!shouldReduce;
  const developed = active && !reduce;

  return (
    /* `rounded-xs` — the screenshot carve-out in CLAUDE.md, reused rather than
       invented. A photographic print has square corners, and the 4px radius is
       the site's existing way of saying "this is a captured artifact" while
       stopping short of a hard corner that would fight the card's own 2xl.
       Clipping happens here so no treatment layer escapes the plate.

       THE GROUND IS ONE STEP DEEPER THAN THE PAGE, via `.develop-plate-ground`
       in globals.css, where the derivation is recorded. Short version: card ink
       made the plate a lighter tile floating on the grout, matching the grout
       removed its edge entirely, and going darker instead makes it read as an
       aperture cut into the page — unexposed stock — which is the metaphor this
       component runs on.

       It is derived from `--grout` rather than picked, because its job is to sit
       a fixed step below whatever the section is; that relationship belongs in a
       reference, and it follows the grout into dark mode for free. The treatment
       layers above stay on artwork constants: those are blend inks, not surfaces,
       and they are tuned values rather than derived ones. */
    <div
      className={`develop-plate-ground relative aspect-[3/2] w-full overflow-hidden rounded-xs ${className}`}
    >
      {/* THE PICTURE. Scale is the only transform, on a spring, so the plate has
          some weight to it as it comes forward. Greyscale is static — see the
          header; it is set here once and never animated. */}
      <motion.div
        className="absolute inset-0"
        style={{ filter: "grayscale(1)" }}
        initial={false}
        animate={{ scale: developed ? PLATE_SCALE : 1 }}
        transition={reduce ? { duration: 0.01 } : motionEase.spring}
      >
        {/* Published for the `media` strategy: a bespoke scene is an opaque node
            by the time it reaches this component, so it subscribes to the plate's
            state rather than being handed it. */}
        <PlateActiveContext.Provider value={developed}>
          <PlateSurface media={media} active={developed} />
        </PlateActiveContext.Provider>
      </motion.div>

      {/* THE DEVELOPER — a multiply veil in the warm plate ink, so the picture
          sinks rather than greys out; a neutral black here read as the image being
          dimmed by a scrim, which is the wrong story.

          FIXED, NOT RAMPED. See the tone note in the file header: this used to run
          0.06 → 0.22 on activation and now holds at its developed value. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{ backgroundColor: loFiInk.paper, opacity: TONE_VEIL }}
      />

      {/* THE FIXER — the light half of the pair. Contrast is a tonal range
          widening, so it takes two layers pulling opposite ways: the multiply veil
          above deepens the shadows and this screens the highlights back up. It is
          also the layer that made the plate look like it was changing colour — see
          the file header — which is why it is now fixed rather than ramped. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{ backgroundColor: loFiInk.ink, opacity: TONE_FIX }}
      />

      {/* THE DOT SCREEN. Always on — the picture is a print the whole time, and a
          halftone that faded in on hover would be an effect rather than a
          material. That was already true of this layer before the rest of the tone
          was pinned; it simply no longer bites harder on activation. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{
          backgroundImage: halftone,
          backgroundSize: `${DOT_PITCH}px ${DOT_PITCH}px`,
          opacity: DOT_OPACITY,
        }}
      />

      {/* THE DEEPEN. The plate settles a step darker while it is being looked at.
          Last of the tone layers so it acts on the finished composite — veil,
          fixer, and dot screen included — which is what makes it read as the whole
          plate sinking rather than as one more ingredient in the mix.

          It is also the right way round for the metaphor, which the old ramp never
          was: a print in a tray comes DOWN out of the wash as it develops. The
          previous treatment lifted the plate on hover and that always fought the
          idea it was supposed to be expressing. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mix-blend-multiply"
        style={{ backgroundColor: loFiInk.paper }}
        initial={false}
        animate={{ opacity: developed ? TONE_DEEPEN : 0 }}
        transition={{ duration: motionDuration.base, ease: motionEase.out }}
      />

      {/* FILM GRAIN. Not rendered at all under reduced motion — the element is
          absent rather than paused, so there is nothing for the global
          reduced-motion rule in globals.css to have to neutralise. It stutters on
          a stepped keyframe rather than gliding: grain that eases is a moving
          texture, and grain that jumps between fixed positions is film. */}
      {!reduce ? (
        <motion.div
          aria-hidden="true"
          className="develop-grain pointer-events-none absolute -inset-1/2 mix-blend-overlay"
          initial={false}
          animate={{ opacity: developed ? 0.42 : 0 }}
          transition={{ duration: motionDuration.base, ease: motionEase.out }}
        />
      ) : null}
    </div>
  );
}

/**
 * The media itself. Narrows the union by presence and hands off; every arm
 * renders into the same box and receives the same treatment above, so nothing
 * below this point is visible to the reader as a difference in strategy.
 */
function PlateSurface({ media, active }: { media: PlateMedia; active: boolean }) {
  if ("frames" in media && media.frames) {
    return <FramesSurface frames={media.frames} active={active} />;
  }
  if ("media" in media && media.media) {
    /* Handed straight through. The plate deliberately does not wrap, measure, or
       introspect the node: a scene is a component the author wrote, and anything
       this layer did to it would become a rule every future scene has to satisfy.
       It learns the plate's state through `PlateActiveContext` (see plateActive.ts)
       rather than through props, which is what keeps the node opaque. */
    return <>{media.media}</>;
  }
  /* `clip` lands here until its pass. Deliberately rendering nothing rather than
     falling back to a frames-like guess: a silent wrong picture is worse than an
     empty plate, and the plate ground reads as unexposed stock, which is honest
     about the state. */
  return null;
}

/**
 * THE FRAMES STRATEGY — two to four stills, cross-dissolving on a loop.
 *
 * Every frame stays mounted and stacked; only opacity moves. The alternative,
 * swapping a single `<img>` src, cannot cross-dissolve at all (there is nothing to
 * dissolve from) and flashes on every turn as the next file decodes.
 *
 * THE TIMER RUNS ONLY WHILE ACTIVE, which is the whole performance story for this
 * strategy: an inactive card holds frame one with no interval, no rAF, and no
 * work. Because activation on touch is already limited to a single card, at most
 * one timer exists on the page no matter how many cards are rendered.
 *
 * IT SETTLES WHERE IT STOPS rather than snapping back to frame one, and that is a
 * design choice before it is an implementation one. A moving photograph that
 * rewound itself the instant you looked away would announce that it is a loop
 * being played; one that simply comes to rest mid-gesture behaves like the thing
 * it is imitating. The frames are meant to be variations on a single picture, so
 * which one it rests on is not a composition the reader can notice — and it keeps
 * the whole strategy on one piece of state with no reset to synchronise.
 */
function FramesSurface({ frames, active }: { frames: readonly string[]; active: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % frames.length),
      FRAME_HOLD_MS,
    );
    return () => window.clearInterval(id);
  }, [active, frames.length]);

  return (
    <>
      {frames.map((src, i) => (
        <motion.div
          key={src}
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: FRAME_DISSOLVE, ease: motionEase.inOut }}
        >
          <Image
            src={src}
            /* Decorative. The card's accessible name already carries the title
               and deck, so an alt here would either be ignored for the name or
               announce the piece a second time (style-rules §6). The plate is
               never the only source of information. */
            alt=""
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            /* The resting frame is what a reader sees before any interaction, so
               it loads with the card. The rest are lazy — they are needed only
               once the plate develops. Deliberately NOT `priority`: a grid of
               these would hand the browser one preload hint per card and flatten
               the very prioritisation the hint exists to express. */
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className="object-cover"
          />
        </motion.div>
      ))}
    </>
  );
}
