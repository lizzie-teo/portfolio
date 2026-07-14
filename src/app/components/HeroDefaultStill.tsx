"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionDuration, motionEase } from "../lib/motion";

/* ─────────────────────────────────────────────────────────────────────────
   Hero default still — the illustration that fills the right-hand column
   while the hero rests in its light idle state (no keyword lit, band on
   --secondary). It is a line-art scene: a hand with a quill detailing a
   wireframe, flowers at the margin, ringed by an ornamental border — the
   same composition the "users" keyword lights up in its dark, glowing filmed
   grade, so the idle scene reads as that payoff at rest.

   Hand-off. The default only lives on the light band. When any keyword
   lights, the band inverts to the dark grout stage; this still fades out
   (subtler and quicker than it entered) as the keyword's clip or the
   particle field fades in over the same square, and it returns when the band
   falls back to light. `active` is simply "no keyword is lit".

   Edge blend, inverted from HeroKeywordVideo. The artwork is dark line-art
   on a near-white field — the opposite of the keyword clips'
   light-on-near-black. So the blend inverts too (see .docs/video-blend.md):

   1. Darken over the band tone. `darken` keeps whichever layer is darker per
      channel. The artwork's field (~#FEFEFE) already sits above the light
      band, so darken clamps every field pixel to exactly the surface colour
      — the square vanishes into the band — while the darker ink of the
      drawing passes through. No brightness lift is needed. The backdrop
      carries the band's tone on the same 500ms crossfade, so during the ramp
      to grout the field always equals the surface behind it and no disc
      appears.

   2. Feather into a circle. The same colourless alpha mask as the keyword
      clips fades the frame to nothing along the inscribed circle, so no
      straight frame line is ever revealed.

   Reduced motion: a still needs no playback guard — only the permitted
   opacity change reveals or hides it (scale holds at the 1.2 rest value). */

// Feather only the outermost sliver of the inscribed circle. The artwork is
// dark line-art on a near-white field that the darken blend already melts into
// the band, so no disc is ever visible — the mask exists purely to soften the
// round frame line, not to dissolve the media. Holding the solid core out to
// 88% keeps the ornamental border ring and the margin flowers at full strength
// right up to the circumference; only the final 12% eases to nothing so no hard
// rim shows. (Was #000 48.7% — a >51-point feather band that washed the ring
// out entirely.)
const EDGE_FADE =
  "radial-gradient(circle closest-side at 50% 50%, #000 88%, transparent 100%)";

export function HeroDefaultStill({
  active,
  src,
}: {
  active: boolean;
  src: string;
}) {
  const reduce = useReducedMotion() ?? false;

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        // Rests at the same 1.2 scale as the keyword hover clips
        // (HeroKeywordVideo) so the idle scene and every hover payoff fill the
        // square identically — one system at one size. A barely-there push-back
        // on exit keeps the exit's character (1.2 → 1.248, the old 1 → 1.04
        // relationship carried up to the new base); no positional/scale move
        // under reduced motion (scale holds at 1.2, opacity only).
        scale: reduce ? 1.2 : active ? 1.2 : 1.248,
      }}
      transition={{
        duration: reduce
          ? 0.01
          : active
            ? motionDuration.base
            : motionDuration.fast,
        ease: active ? motionEase.out : motionEase.in,
      }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div
        data-hero-video-frame
        className="relative aspect-square w-full overflow-hidden rounded-full"
        style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
      >
        {/* Backdrop the artwork darkens against. It carries the band's current
            tone on the same 500ms crossfade, so the clamped field always equals
            the surface — no disc while the band ramps from --secondary to
            --grout. */}
        <div
          className={`absolute inset-0 transition-colors duration-500 ${
            active ? "bg-secondary" : "bg-grout"
          }`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- blended
            decorative art; sizing and masking are handled by the frame */}
        <img
          className="absolute inset-0 h-full w-full object-cover [mix-blend-mode:darken]"
          src={src}
          alt=""
        />
      </div>
    </motion.div>
  );
}
