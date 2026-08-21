"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";
import { useAnchorScroll } from "../lib/use-anchor-scroll";
import { MaskReveal } from "./MaskReveal";
import { MotionReveal } from "./MotionReveal";
import { statementHeading } from "./typography";

/* ─────────────────────────────────────────────────────────────────────────
   UNMOUNTED, 20 Aug 2026 — NOTHING IMPORTS THIS FILE.

   The owner's FigJam flow put the garden walk back at the top of `/`, so the
   home page opens on the floppy and the flight again (page.tsx, HomeFlight) and
   there is no static hero for this composition to be. The COPY survived and is
   the walk's ending now — "I'm a product designer. I make complicated products
   simpler to use." with "See the work" — set inside the flight's own glass pane
   rather than in page type over a frameless picture (world/ScrollWorld.tsx, THE
   ADDRESS IS A LETTERHEAD).

   It is left on disk rather than deleted because that call is Lizzie's. Two
   things in it are worth reading before anyone does delete it: the measured
   argument that the video blend does not apply to this footage and a matched
   underlay does the job instead, and the reason the static state is the LAST
   frame rather than frame 0. Both are written up below and neither is recorded
   anywhere else.

   IT STILL REFERENCES TWO ASSETS. `leg-9-hero.mp4` and `leg-9-final.webp` are
   reachable only through this file now. `WorldTransition.tsx` — also unmounted
   — is the only reference left to `leg-0-hero.mp4`, and `leg-0.mp4` (the
   all-intra master it was cut from) is referenced by nothing at all. None of
   them ship to a reader while this file is unmounted; leave the masters alone
   and never re-encode a leg in place (see below).
────────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────
   THE FRONT DOOR IS A SENTENCE AND A MACHINE ANSWERING IT

   `/` used to open on the garden walk itself — fourteen viewports of scrubbed
   cinematic with the work bands underneath. The walk is opt in now: it lives at
   `/world`, the masthead's "What I do" is the door to it (lib/site-nav.ts), and
   this is what stands at the top of the home page instead.

   IT IS BUILT FROM THE WALK'S LAST LEG, and only from that. The ending of the
   flight is a small desktop machine on bare paper whose screen holds the whole
   garden, wipes it, and hand-letters `hello world`. Lifting that one beat out
   of the cinematic gives the front door the walk's payoff in five seconds
   instead of fourteen screens — and a reader who wants the fourteen screens
   still has a door to them in the masthead. There is deliberately NO link to
   `/world` here: the nav carries it, and a hero that also pointed at the walk
   would be the page asking twice.

   ── WHY THERE IS NO SCROLL TRACK ──────────────────────────────────────────
   Nothing here is scroll-linked. This is an ordinary page section in normal
   flow: the bands below it start where its bottom padding ends, the masthead
   is a plain in-flow-spaced fixed bar, and `#work` is one anchor jump away.
   The whole handover mechanism the old home page needed (HomeFlight, and the
   `--sw-handoff` property it published) has nothing left to hand over.

   ── THE PICTURE HAS NO RECTANGLE, AND THE BLEND RECIPE COULD NOT GIVE IT ONE
   `.docs/video-blend.md` dissolves a clip into the page with two moves: a
   `mix-blend-mode` against a token backdrop, then an alpha feather. Only the
   second move applies to this footage, and the first was measured out rather
   than skipped.

   The recipe's blend needs the clip's empty field to sit clear of the backdrop
   on the correct side, so the blend clamps it to exactly the page colour. This
   clip is ink on WARM PAPER: its field measures rgb(231,210,192) and the mint
   inside the CRT measures rgb(175,207,186) — the subject is only ~26 levels of
   green and ~18 levels of luma away from the field it stands on. Every levels
   correction that lifts the paper far enough for `darken` or `multiply` to
   clamp it lifts the mint screen with it, and the screen is the subject. Both
   were worked through: a uniform lift washes the mint to paper, a per-channel
   white balance rotates its hue toward cyan, and `saturate()` cannot rescue
   either because it is the paper's own neutrality it would have to spend. That
   is precisely the case the doc rules out ("cannot rescue footage with
   meaningful midtone backgrounds").

   SO THE GROUND DOES THE BLEND'S JOB, which is what `/world` already does for
   the same footage. There, `.sw-sky::before` continues the scene's own colour
   off the film's hard edge on a layer below it and masks that continuation out
   (world.css, "The underlay"). The same move, turned from a left-hand strip
   into an all-round pool: SCENE_PAPER is painted behind the film, wider and
   softer than the film's own feather, so the clip's paper meets identical
   colour and the warmth resolves into `--secondary` over a long ramp with no
   boundary anywhere. Two nested alpha masks (below) do the feather.

   The composite is a smooth blend between page and paper at every pixel by
   construction — `1 − (1−underlay)(1−film)` is monotonic in both — so no
   ordering or tuning of the two gradients can produce a step. Only their
   spread is a judgement call.

   ── THE STILL IS THE FINISHED SENTENCE, THE CLIP IS IT BEING WRITTEN ───────
   The `<img>` under the film is the clip's LAST frame, so the page paints on
   arrival with `hello world` already lettered. That is the useful static state
   §7 requires: no clip, no JavaScript, blocked autoplay, save-data or reduced
   motion all leave a machine that has finished its sentence.

   The film is not the poster frame of itself. Frame 0 of this leg still holds
   the garden on the CRT — so when the clip does arrive and fades in, the screen
   visibly clears and rewrites. That reset is the point rather than a cost: the
   front door shows the reader the ending, then shows the machine working for
   it, and the garden flashing on the screen on the way past is the only thing
   on this page that says the walk exists. It runs ONCE and holds on its last
   frame, which is pixel-identical to the still it faded in over, so the film
   comes to rest exactly where the page started. A loop would turn a machine
   finishing a sentence into a screensaver.

   ── THE CLIP IS A DERIVATIVE, AND leg-9.mp4 IS NOT ────────────────────────
   `/world` decodes the legs through WebCodecs and requires every sample to be
   independently decodable, so `leg-9.mp4` is all-intra (`--gop=1`,
   .docs/asset-weight.md) and 6.85MB. All-intra is exactly wrong for a clip that
   is PLAYED rather than scrubbed, and this leg is a held cel — one plate for
   all 121 frames with only the CRT glass animating — so an ordinary GOP takes
   it to 178KB at SSIM 0.9948. `leg-9-hero.mp4` is that encode;
   `leg-9.mp4` is untouched and still belongs to the walk. Re-encoding the
   shared file in place would not error on `/world`, it would silently drop the
   page back to its jagged path (mp4-intra.ts returns null).
────────────────────────────────────────────────────────────────────────── */

/* ── SCENE CONSTANTS ───────────────────────────────────────────────────────
   Artwork colour, not shell colour: this is the paper the clip was drawn on,
   sampled from the footage itself (mean of the open field across all 121
   frames, rgb(231,210,192)). It exists only to be the ground the film's own
   paper lands on, exactly as `--sw-paper` does inside the flight. It never
   carries type and it must never become a token.

     #E7D2C0 on --secondary #F2F0EB ...... 1.27:1  (a warm light, not a plate)
     --foreground #3A3733 on it .......... 8.1:1   (recorded, nothing sits here)
*/
const SCENE_PAPER = "#E7D2C0";

const FILM_SRC = "/assets/world/leg-9-hero.mp4";
const FILM_STILL = "/assets/world/leg-9-final.webp";

/* ── THE FEATHER, AS TWO NESTED MASKS ─────────────────────────────────────
   One mask per axis, on two nested elements, because nesting intersects them
   with no `mask-composite` dependency — a single element carrying both would
   need `intersect`/`source-in` in two syntaxes and degrades to a UNION (a
   larger, softer footprint) wherever that is unsupported.

   One ellipse would be simpler and is wrong here, because the two axes want
   different profiles. The drawing is 21:9 with wide empty margins left and
   right and almost none top and bottom: measured off the frame, the machine
   occupies x 31–65% and y 15–82%, with the cable trailing to 98%. A radial mask
   tight enough to erase the vertical edges puts the top of the monitor at ~68%
   alpha; one loose enough to spare the monitor leaves a band of paper alive
   along the top edge. Split by axis
   and both are satisfied — the horizontal fade is generous because there is
   nothing out there but paper, the vertical fade is tight and holds the
   monitor at full ink.

   The bottom fade starting at 78% is deliberate: the keyboard's foot sits at
   ~82% and the trailing cable runs to ~98%, so the foot is grounded by a
   whisper of fade and the cable leaves the drawing by dissolving into the page
   rather than by being cut off at a frame line.

   The `#000` stops are mask ALPHA, not ink — the gradients are colourless. */
const H_FADE =
  "linear-gradient(to right, transparent 0%, #000 16%, #000 84%, transparent 100%)";
const V_FADE =
  "linear-gradient(to bottom, transparent 0%, #000 10%, #000 78%, transparent 100%)";

/* The pool the film stands in. Wider and softer than the film's own feather in
   both axes, so the warmth is still arriving when the film has finished leaving
   and there is no radius at which one of them is the edge. */
const UNDERLAY = `radial-gradient(ellipse 50% 50% at 50% 50%, ${SCENE_PAPER} 0%, ${SCENE_PAPER} 46%, transparent 100%)`;

/* Long enough after paint that the screen clearing reads as a second event
   rather than as the page still loading. Deliberately not on the motion ladder:
   it is a wait, not a transition. */
const FILM_CUE_MS = 700;

/* The arrival, as one sequence rather than three components each firing on
   their own trigger. The headline is three lines at `slow` on a 0.05s stagger,
   so its last line lands at 0.60s; the controls trail it and the picture rises
   under both. Longest thing on screen finishes at 0.85s, inside §7's 1s ceiling
   for a hero moment. Nothing here waits on anything else — every delay is
   absolute, so a slow line-measure cannot stall the rest. */
const CONTROLS_DELAY = 0.45;
const PICTURE_DELAY = 0.35;

const HEADLINE =
  "I’m a product designer. I make complicated products simpler to use.";

export function HomeHero() {
  return (
    <section className="relative bg-secondary">
      {/* Gutters are the bands' own, so the headline stands on the same left
          axis as every heading below it and the page reads as one document.
          The bottom padding runs a step deeper than the top from `md` up, and
          that is load-bearing rather than taste: the picture's ground extends
          14% of the picture's height past it, and at the widest the picture
          gets (60rem → 411px tall) that is 58px of soft warmth which must
          finish inside this padding rather than drift onto the work band's
          green sheet. */}
      <div className="mx-auto w-full max-w-[1800px] px-4 pb-12 pt-10 sm:px-6 md:px-8 md:pb-16 lg:px-12 lg:pb-20 lg:pt-16 xl:px-16 2xl:px-24">
        {/* The page's h1. `statementHeading` and not `displayHeading`, which is
            named as the home hero's role and is the wrong instrument for this
            copy: that staircase tops out at 128px because it was cut for a
            five-word poster in a narrow column ("A decade designing for
            complexity"). This headline is two whole sentences, and at 128px a
            67-character line fragments into six. `statementHeading` is the
            standalone-display role — the same one `/work` opens on — and it
            tops out at 60px, which sets this in three lines on desktop with the
            picture still able to stand under it above the fold.

            LINE SLIP, NOT WORD SLIP, for the same reason §7 gives: a full
            sentence revealed word by word reads as a teleprompter. One mask per
            rendered line, `slow`, 0.05s apart. */}
        <MaskReveal
          as="h1"
          mode="line"
          text={HEADLINE}
          duration="slow"
          className={`max-w-[46rem] ${statementHeading} text-foreground`}
        />

        {/* FADE UP, NOT A BLOCK SLIP, and the reason is the focus ring rather
            than the composition. `MaskReveal`'s block mode clips its content to
            a `clip-path` inset of about 1px, which is permanent — it is what
            makes the mask a mask — and the button primitive's focus ring stands
            3px outside the border box. A slipped control is a control whose
            keyboard focus indicator is shaved. Fade up carries no clip, and §7
            names it the default for anything that is not type being set. */}
        <MotionReveal className="mt-8 lg:mt-10" delay={CONTROLS_DELAY}>
          <HeroControls />
        </MotionReveal>

        <HelloWorldFilm />
      </div>
    </section>
  );
}

/* ── THE TWO CONTROLS ──────────────────────────────────────────────────────
   `buttonVariants` from the site's own button (components/ui/button) rather
   than `.sw-btn`. The walk's pair are the same design — solid ink primary, drawn
   outline secondary, 1px press — because `.sw-btn` was written to match this
   one; but they live in world.css, which is out of scope and would drag the
   whole flight stylesheet onto a page that no longer renders the flight.

   The cva EXPORT and not the `<Button>` component, because both of these are
   navigations: one is an in-page anchor and one is a `mailto:`, so they have to
   be real anchors with real hrefs (right-click, copy address, open in new tab,
   Enter from the keyboard). Wrapping a link in a button primitive to get its
   look back is the long way round to the same class list.

   SIZE IS OVERRIDDEN AND THAT IS NOT A STYLE CHOICE. The primitive's ladder
   tops out at `h-9` (36px), which is below §8's 44px touch minimum. `h-12`
   clears it with room and reads as a hero control rather than a toolbar one.

   Overrides go through `cn` (tailwind-merge), not through cva's `className`
   slot. cva only concatenates, so `h-12` and the variant's `h-9` would BOTH be
   emitted and the winner decided by Tailwind's stylesheet order rather than by
   this file. Merging drops the loser outright. */
const CONTROL = "h-12 rounded-lg px-6";

function HeroControls() {
  const handleAnchor = useAnchorScroll();

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {/* The site's own eased anchor scroll, the same one the masthead's
          contents line runs, so arriving at the work band from the hero and
          arriving at it from the nav are one behaviour — including the 1cm
          landing, the focus handover and the reduced-motion instant jump. */}
      <Link
        href="/#work"
        onClick={(event) => handleAnchor(event, "work")}
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          CONTROL,
        )}
      >
        See the work
      </Link>

      {/* `bg-transparent` and a drawn line off `--foreground`: the outline
          variant's default `bg-background` is a whisper LIGHTER than the
          `--secondary` sheet this stands on, which turns a secondary control
          into a pale chip floating on the page. 22% ink is the lightest the
          line goes and still reads as a line — the same value and the same
          reasoning as the walk's own secondary button.

          THE HOVER MOVES TO THE BORDER for the same reason. The variant answers
          a hover with `--muted` (#F5F3EF), which is 1.01:1 against `--secondary`
          — a fill that cannot be seen is not feedback. Deepening the drawn line
          instead is a colour transition, which §7 leaves to CSS, and Tailwind v4
          gates `hover:` behind `@media (hover: hover)` so a tap never leaves it
          stuck on. */}
      <a
        href="mailto:lizzie.teo@icloud.com"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          CONTROL,
          "border-[color-mix(in_oklch,var(--foreground)_22%,transparent)] bg-transparent",
          "hover:border-[color-mix(in_oklch,var(--foreground)_50%,transparent)]",
        )}
      >
        Get in touch
      </a>
    </div>
  );
}

/* ── THE PICTURE ───────────────────────────────────────────────────────────
   Width is capped in rem rather than left to the band's 1800px measure. The
   drawing is a small object on a big field, and stretched across a wide desktop
   its hatching thins out and the machine stops reading as something you could
   put on a desk. 60rem is as large as it wants to be; below that it takes the
   full sheet, which is where a phone needs it. */
function HelloWorldFilm() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "0px 0px -10% 0px" });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (reduce || !inView) return;
    /* Save-data is a stated preference about bytes, not a capability check:
       honour it the same way reduced motion is honoured, by never fetching the
       clip at all. The still is already the finished picture. */
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      const video = videoRef.current;
      if (!video || cancelled) return;
      /* The fade is driven by play() RESOLVING, not by calling it. A blocked
         autoplay (low-power iOS, a strict media policy) rejects, `playing`
         stays false, and the reader keeps the finished still instead of a blank
         frame fading in over it. `.docs/cover-effects.md` states the rule the
         other way round: a rejected play() is a state, not an error. */
      video
        .play()
        .then(() => {
          if (!cancelled) setPlaying(true);
        })
        .catch(() => {
          /* Autoplay refused. The still is the whole picture. */
        });
    }, FILM_CUE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [inView, reduce]);

  return (
    <motion.div
      ref={rootRef}
      /* WorldTransition (the What I do push-in) reads this element's rect to
         start the leg 0 video exactly where this picture stands. The attribute
         is the contract; move it with the picture, never onto a wrapper with
         different bounds. */
      data-hero-film
      /* Opacity only. A hero picture this size sliding into place is the
         positional movement §7 removes under reduced motion anyway, and a pool
         of warm light does not arrive from a direction — which is also why
         reduced motion collapses the duration to 0.01s rather than dropping the
         property: there is no travel to remove, only a fade to shorten.

         `initial` is unconditional so the server and the client render the same
         inline style. Branching it on a media query is the classic way a
         reduced-motion component starts throwing hydration mismatches. */
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reduce ? 0.01 : motionDuration.slow,
        ease: motionEase.out,
        delay: reduce ? 0 : PICTURE_DELAY,
      }}
      className="relative mx-auto mt-10 aspect-[21/9] w-full max-w-[60rem] lg:mt-14"
    >
      {/* The ground. Outside the masked wrapper and outside its overflow clip,
          because its whole job is to be wider than the film. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-[8%] -inset-y-[14%]"
        style={{ backgroundImage: UNDERLAY }}
      />

      <div
        className="absolute inset-0"
        style={{ maskImage: V_FADE, WebkitMaskImage: V_FADE }}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ maskImage: H_FADE, WebkitMaskImage: H_FADE }}
        >
          <Image
            src={FILM_STILL}
            alt="A small desktop computer, drawn by hand, with the words hello world lettered on its screen."
            fill
            priority
            sizes="(min-width: 1024px) 60rem, 100vw"
            className="object-cover"
          />

          {/* MOUNTED ALWAYS, FETCHED ALMOST NEVER. Under reduced motion (and
              under save-data, and wherever autoplay is refused) the effect
              above never runs, so `preload="none"` means this element requests
              nothing at all, plays nothing and stays at opacity 0 — the still
              behind it is the whole picture. Conditionally rendering it would
              buy exactly that same nothing and cost a hydration mismatch, since
              the server cannot know the reader's motion preference. */}
          <motion.video
            ref={videoRef}
            aria-hidden
            muted
            playsInline
            preload="none"
            disablePictureInPicture
            src={FILM_SRC}
            initial={{ opacity: 0 }}
            animate={{ opacity: playing ? 1 : 0 }}
            transition={{
              duration: motionDuration.base,
              ease: motionEase.inOut,
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
}
