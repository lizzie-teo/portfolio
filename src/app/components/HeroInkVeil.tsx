"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

/* ─────────────────────────────────────────────────────────────────────────
   Hero ink veil — two stacked GrainGradient layers that keep the hero band a
   living surface in BOTH of its states, so grain is always present, never a
   thing that only switches on at hover.

   Layer 1 — REST (bottom of the stack, a plain always-mounted div). A whisper
   of warm-neutral grain over the flat secondary band while no keyword is lit:
   a paper texture that drifts slowly, not a visible gradient shift. It lives
   OUTSIDE the fading veil wrapper below (that wrapper goes visibility:hidden
   when dormant, which would freeze the rest layer with it), so it keeps its
   own life while the veil sleeps. The charcoal hero copy reads directly on it.

   Layer 2 — VEIL (top of the stack, the fading wrapper). The opaque grout wash
   that rides over the band while a keyword is lit. The section's CSS class flip
   (secondary → grout) still drives text colour and is the fallback when WebGL
   is unavailable; this veil is opaque at full opacity, so while active it
   becomes the actual dark stage the copy reads against — a warm, grainy ink
   gradient rather than the flat grout fill, so the inversion reads as ink
   soaking in with life in it.

   Both canvases stay mounted for the whole desktop session (StatementHero only
   renders this at lg+, where keywords are live) so the WebGL contexts and
   shader compiles happen at hero mount, not on first hover.

   rAF budget. speed 0 fully halts the library's rAF loop (verified in
   shader-mount), so each layer stops when it has nothing to show:
     · VEIL is speed 0 unless mid-fade or lit — driven off the fade lifecycle,
       and visibility:hidden while dormant.
     · REST is speed 0 under reduced motion, while a keyword is active (the
       opaque veil covers it, so its drift would be wasted), and while the hero
       has scrolled out of view. The rest layer has no fade lifecycle to sleep
       it, so a small IntersectionObserver stands in — otherwise it would run a
       rAF for the whole session.
──────────────────────────────────────────────────────────────────────────── */

/* REST scene palette — whisper-subtle warm neutrals around --secondary
   (#F2F0EB, theme.css). Declared as scene constants (canvas artwork; never
   leaks into shell tokens). colorBack sits at the secondary tone and the two
   bands are only a few percent darker/warmer, so the field reads as the same
   calm light band from a normal distance — living paper, not a gradient.
   Contrast on the darkest band REST_DEEP rgb(234,230,222) = #EAE6DE:
     foreground copy #3A3733 9.51:1 · secondary-foreground #55504A 6.41:1
     lit keyword tints on the light band still clear AA here too — the lowest,
     users #00736c, is 4.60:1   (all ≥ AA 4.5:1) */
const REST_BACK = "rgb(242, 240, 235)"; /* #F2F0EB — secondary, verbatim */
const REST_WARM = "rgb(239, 236, 229)"; /* #EFECE5 — a touch warmer/darker */
const REST_DEEP = "rgb(234, 230, 222)"; /* #EAE6DE — darkest band, AA-audited */

/* VEIL scene palette — the warm-dark grout stage. Because the veil is opaque
   while lit, these ARE the surface the hero copy sits on, so the whole gradient
   is capped at a warm amber the copy still clears AA against. The grout-tone
   keyword tints (theme.css) are unchanged; contrast on the brightest band
   VEIL_PEAK rgb(52,42,32):
     grout-foreground copy 11.9:1 · users #40bdb2 6.10:1 · stakeholders 5.24:1
     designSystems #cf7fb0 4.88:1 · vibeCoder #f060ac 4.66:1   (all ≥ AA 4.5:1)
   VEIL_BACK is the deep-ink darkest band; VEIL_MID keeps the field mostly deep
   so the peak reads as warm light breaking through, not an overall lift. The
   ~3.5× luminance span from back to peak, plus pronounced grain, is what makes
   the wash unmistakable while staying within the tint budget. */
const VEIL_BACK = "rgb(15, 14, 12)";
const VEIL_PEAK = "rgb(52, 42, 32)";
const VEIL_MID = "rgb(31, 27, 22)";

/* The veil's settled body tone — between VEIL_BACK and VEIL_MID, which is what
   the field reads as away from its warm peaks. Exported because the masthead
   above the hero has to flood to the SAME ink when the band inverts: the
   --grout token is a different, lighter warm ink (~rgb(43,39,35)) and painting
   the bar with it left a visibly lighter slab sitting on top of the hero
   instead of one continuous dark stage. Scene artwork, not a shell token —
   HeroInkVeil owns it, SiteHeader borrows it, nothing else should. */
export const HERO_VEIL_INK = "rgb(22, 20, 16)";

/* Speeds — tuned visually against screenshots. REST is a slow paper drift; the
   VEIL flows fast enough that the hover wash reads as moving ink, not a crawl. */
const REST_SPEED = 0.17;
const VEIL_SPEED = 0.55;

export function HeroInkVeil({ active }: { active: boolean }) {
  const reduce = useReducedMotion() ?? false;
  // `live` keeps the veil's rAF loop running while it is visible OR mid-fade,
  // driven off the fade's own lifecycle: it drops to false only once a fade-out
  // has fully settled, halting the loop and hiding the layer.
  const [live, setLive] = useState(false);

  // The rest layer has no fade lifecycle, so a small IntersectionObserver puts
  // it to sleep once the hero scrolls off screen and wakes it on return.
  const restRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = restRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // speed 0 stops the library's rAF loop entirely (verified in shader-mount).
  // VEIL: static under reduced motion, dormant when fully faded out.
  // REST: static under reduced motion, paused while the veil covers it (active)
  // or while the hero is scrolled out of view.
  const veilSpeed = reduce || !live ? 0 : VEIL_SPEED;
  const restSpeed = reduce || active || !inView ? 0 : REST_SPEED;

  return (
    <>
      {/* REST layer — always mounted, beneath the veil. Its own plain div so it
          is never frozen by the veil wrapper's visibility:hidden. */}
      <div
        ref={restRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <GrainGradient
          className="h-full w-full"
          colorBack={REST_BACK}
          colors={[REST_WARM, REST_DEEP]}
          intensity={0.34}
          noise={0.12}
          shape="wave"
          softness={0.85}
          speed={restSpeed}
        />
      </div>

      {/* VEIL layer — the opaque grout wash, fading in over the rest layer while
          a keyword is lit. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{
          duration: active ? motionDuration.slow : motionDuration.base,
          ease: active ? motionEase.out : motionEase.in,
        }}
        // The fade drives the loop: a starting fade (either direction) wakes it;
        // a completed fade-out puts it back to sleep. Retargeting mid-flight just
        // restarts a fade, so the loop stays awake — no flicker on a fast sweep.
        onAnimationStart={() => setLive(true)}
        onAnimationComplete={() => {
          if (!active) setLive(false);
        }}
        style={{ visibility: live ? "visible" : "hidden" }}
      >
        <GrainGradient
          className="h-full w-full"
          colorBack={VEIL_BACK}
          colors={[VEIL_PEAK, VEIL_MID]}
          intensity={0.58}
          noise={0.44}
          shape="wave"
          softness={0.58}
          speed={veilSpeed}
        />
      </motion.div>
    </>
  );
}
