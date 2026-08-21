"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

/* ─────────────────────────────────────────────────────────────────────────
   Keyword payoff clip — the hero words whose response is footage. Every live
   keyword is now filmed (the particle field in HeroKeywordField remains as the
   fallback medium); each reveals a short generative clip in a shared visual
   language, so the swaps read as one system speaking across the words:

     complexity      a circular botanical labyrinth, one glowing path threading
                     from the entrance to the flower at its centre — the tangle
                     resolved into a single clear route
     users           a hand with a quill detailing a wireframed interface,
                     flowers at its margin — craft applied for the person
                     on the other side of the screen
     vibe coder      a glowing node-and-flower lattice dissolving into pixels
     design systems  a specimen grid of botanical line-art, order dissolving
                     into pixels — a design-systems thesis rendered as footage
     figma to code   a stone bridge over a stream, line-art garden on one bank
                     becoming a pixel-square garden on the other — drawing
                     crossing into code
     stakeholders    a ring of portrait medallions tied together by ribbons —
                     the hub-and-satellite network drawn as people

   One instance renders per filmed word, each fed its own `src`/`poster`; the
   `active` boolean lights exactly one at a time. Each shares the field's square
   frame and sits on the same dark grout stage the band inverts to.

   The element stays mounted (never in AnimatePresence) so the film is already
   loaded and re-plays instantly on every hover; visibility rides a single
   MotionValue-free `animate` toggle — a base/ease-out fade-and-settle in, a
   subtler instant/ease-in fade out (exits are quieter than entries). Playback
   is gated to the active + non-reduced state and reset to the poster frame on
   leave, so the clip only ever moves while the word is lit.

   Reduced motion: the film never autoplays. The poster frame stands in as the
   static composition (a permitted opacity change reveals it), matching how the
   particle field draws a still arrangement instead of animating.

   Edge blend. The film is a glowing lattice on a near-black field, so it is
   really light-on-nothing. The `data-hero-video-frame` wrapper lightens it over
   a backdrop that tracks the band tone — every dark pixel clamps to whatever the
   band currently shows, only the lattice glows through — and feathers the frame
   into a soft circle, so the footage dissolves into the band with no box (see
   the EDGE_FADE note below).

   Why the backdrop tracks the band, not a fixed grout. The band crossfades from
   the light --secondary plane to the dark --grout stage over 500ms whenever the
   word lights. A fixed grout backdrop would sit as a dark disc on the still-light
   band for the length of that crossfade, so the ramp itself would reveal the
   frame. Painting the backdrop with the same tone on the same 500ms colour
   transition keeps backdrop == band at every instant of the ramp: the lightened
   empty field always equals the surface behind it, so there is never a shape to
   see — going in, coming out, or caught mid-crossfade. `dark` is the band's own
   tone flag, so the two move as one. */

/* Edge blend, in two moves.

   1. Lighten blend. The footage is a bright glowing lattice on a near-black
      field, so it is really light-on-nothing. A `lighten` blend over a backdrop
      painted in the current band tone keeps whichever is brighter per channel:
      the band is lighter than the footage's near-black everywhere but the
      lattice, so the whole dark field clamps to exactly the tone the band
      already shows — no darker-and-no-lighter box to hide — while the brighter
      lattice passes through as a glow. (Lighten, not screen: screen adds, so the
      film's not-quite-zero black would lift the whole frame a shade above the
      band and leave a faint rectangle.) The backdrop uses shell tokens
      (--secondary / --grout), so it tracks the band in light, dark, and mid-ramp
      with no ink of its own.

   2. Feather into a circle. A colourless alpha mask fades the frame to nothing
      along a circle inscribed in the square (`closest-side`), so there is no
      rectangle to reveal from any angle: the brightest content — the lattice
      tips and the pixel-dissolve — never meets a straight frame line, only a
      soft round edge. A generous solid core keeps the lattice itself at full
      strength; only the approach to the round edge softens.

   Both moves are static: they read identically on the live film, the poster,
   and under reduced motion.

   Feather band. The solid core holds out to 78% of the inscribed radius and
   only the outer 22% eases to nothing — a much tighter feather than before so
   the glowing lattice keeps its reach toward the frame instead of dimming a
   third of the way in. It stays a touch wider than the light illustration's
   (HeroDefaultStill, 88%) because the brightest lattice tips ride a dark band
   and would flash a hard round rim if the fade started any later. (Was #000
   48.7% — a >51-point feather band that lost detail across the circumference.) */
const EDGE_FADE =
  "radial-gradient(circle closest-side at 50% 50%, #000 78%, transparent 100%)";

export function HeroKeywordVideo({
  active,
  dark,
  src,
  poster,
  preload = "metadata",
}: {
  active: boolean;
  dark: boolean;
  src: string;
  poster: string;
  /* How much of the film to fetch before it is asked for. `metadata` is the
     desktop default: the pointer can light a word at any moment, so the header
     is worth having in hand. Below `lg` the caller passes `none` — the six
     clips total ~8.6MB and a phone should download exactly the one it taps.
     Under `none` the poster moves out of the video's own attribute and onto a
     real <img> beneath it (see POSTER_STAND_IN below), because Chrome defers
     the poster fetch along with the media: measured, a `preload="none"` clip
     shows an empty disc for as long as the film takes to arrive, and under
     reduced motion — where play() is never called, so the load algorithm never
     runs — it would stay empty for good. */
  preload?: "none" | "metadata";
}) {
  const reduce = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement>(null);

  /* POSTER STAND-IN. On the lazy path the poster is the first thing to arrive
     (50–130KB against ~1MB of film) and the only thing that arrives at all
     under reduced motion, so it is rendered as its own layer under the video
     rather than left to the attribute. It is requested the first time the word
     is asked for and then stays — six posters eagerly loaded would be half a
     megabyte a phone never asked for, and one poster re-requested on every tap
     would flicker. The video paints over it the moment it has frames. */
  const [primed, setPrimed] = useState(false);
  const lazy = preload === "none";
  // Adjusted during render rather than in an effect, so the poster's request is
  // in flight in the same commit that lights the word — an effect would cost a
  // second render before the img element exists.
  if (active && !primed) setPrimed(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && !reduce) {
      video.currentTime = 0;
      const played = video.play();
      if (played) played.catch(() => {});
    } else {
      video.pause();
      // Snap back to the poster frame so the next reveal starts clean.
      try {
        video.currentTime = 0;
      } catch {
        /* seeking before metadata loads throws; harmless to ignore */
      }
    }
  }, [active, reduce]);

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        scale: active ? 1.2 : reduce ? 1.2 : 1.152,
      }}
      transition={{
        duration: reduce ? 0.01 : active ? motionDuration.base : motionDuration.instant,
        ease: active ? motionEase.out : motionEase.in,
      }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div
        data-hero-video-frame
        className="relative aspect-square w-full overflow-hidden rounded-full"
        style={{
          maskImage: EDGE_FADE,
          WebkitMaskImage: EDGE_FADE,
        }}
      >
        {/* Backdrop the film lightens against. It carries the band's current
            tone on the same 500ms colour crossfade, so the lightened empty field
            always equals the surface behind it — no dark disc while the band is
            still ramping from --secondary to --grout. */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            dark ? "bg-grout" : "bg-secondary"
          }`}
        />
        {lazy && primed && (
          /* eslint-disable-next-line @next/next/no-img-element -- blend-
             composited decorative frame; sizing and masking are the frame's */
          <img
            aria-hidden="true"
            alt=""
            className="absolute inset-0 h-full w-full object-cover [mix-blend-mode:lighten]"
            src={poster}
          />
        )}
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover [mix-blend-mode:lighten]"
          src={src}
          poster={lazy ? undefined : poster}
          muted
          loop
          playsInline
          preload={preload}
        />
      </div>
    </motion.div>
  );
}
