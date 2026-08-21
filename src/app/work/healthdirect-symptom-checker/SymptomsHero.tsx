"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { PlayIcon, RotateCwIcon } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { cornerClasses, type TileCorners } from "@/app/components/Chapter";
import { CollapsingLeaf } from "@/app/components/CollapsingLeaf";
import { motionDuration, motionEase } from "@/app/lib/motion";

/* ─────────────────────────────────────────────────────────────────────────
   Bloom, then dissolve to the page. At rest the stage is the flat slate-teal
   still it has always been (bg-sc-hero-stage) — no ambient drift. The whole
   motion moment is a legible two-beat hover: first a GrainGradient teal ink
   wash blooms IN behind the crisp product screenshots; then the ENTIRE stage
   backdrop — the ink wash AND the base slate fill — melts to transparent,
   revealing the shell surface behind the rounded panel, so the pair is left
   floating on the page plane, grown and shadow-lifted. Read it as bloom then
   clear: the ink arrives, then the whole field dissolves away beneath the
   growing screenshots.

   Layering (bottom → top): a base slate FILL div carries bg-sc-hero-stage as
   its own animatable layer (the leaf itself is transparent now, so both the
   fill and the wash can dissolve together); the ink bloom sits over the fill;
   the screenshots ride above both (z-10); a transparent hover catcher spans
   the top (z-30). The shader keeps VEIL's rAF-sleep discipline — speed 0 fully
   halts the library's loop, so it only spends frames while the wash is
   transitioning, and sleeps at both rest states (flat slate) and held hover
   (wash fully dissolved, backdrop cleared).

   Two triggers, one moment — split by input capability at lg. On lg+ (a
   pointer with room to earn it) the moment is hover-driven exactly as before:
   bloom in, hold, dissolve, reverses on hover-out. Below lg (touch) there is
   no hover, so the same `active` state is driven ONCE by scroll-into-view
   (useInView, once): the stage plays a single forward pass — bloom in, hold,
   then the backdrop dissolves to the grout and SETTLES there, the screenshots
   left floating on the revealed page plane. The bloom, fill, and screenshots
   are all inset-0 / composition-agnostic, so the identical layers sit under the
   stacked column at every width; only the trigger differs.

   The FILL div is rendered unconditionally and holds opacity 1 at rest, in the
   pending pre-resolve pass, with no WebGL, and under reduced motion, so the
   stage always falls back to today's solid slate panel. The touch pass is
   gated on WebGL the way the desktop path effectively is (the shader mounts or
   it does not): with no WebGL the dissolve never runs bloomless — it stays the
   static solid-slate stacked still. The shader is mounted for the whole
   interactive session so the WebGL compile happens at mount, not on the first
   trigger.
──────────────────────────────────────────────────────────────────────────── */

/* Ink-bloom palette — scene constants (canvas artwork; never leak into shell
   tokens). Derived from --sc-hero-stage #4b6c7a. The screenshots cover most of
   the stage, so the wash has to read in the gutters AROUND them: every shader
   tone sits a step or more DARKER than the base stage, so the bloom floods the
   whole field to teal ink and reads unmistakably in the margins while the
   crisp screenshots stay lit above it. colorBack is the mid field; the blob
   shape pools BLOOM_DEEP through it and BLOOM_HAZE lifts a little teal back,
   all still darker than the base — grainy ink blooming, not a flat fill. These
   tones also sit close to the shell grout the dissolve reveals, so the ink
   "seeds" the deep teal the panel then settles into as its field clears. */
const BLOOM_BACK = "rgb(31, 58, 67)"; /*  #1f3a43 — mid field, shader colorBack */
const BLOOM_HAZE = "rgb(42, 74, 84)"; /*  #2a4a54 — lifted teal (lightest tone) */
const BLOOM_DEEP = "rgb(12, 30, 37)"; /*  #0c1e25 — deep teal ink, bloom pool */

/* Step-into-focus hover — the two screenshots grow AND lift forward on hover,
   pulling toward the viewer as the ink bloom floods in and the field then
   dissolves away beneath them. Two reads compound: the pair scales up a
   clearly readable amount, and each screenshot's shadow deepens and spreads
   (SHADOW_REST → SHADOW_LIFT) so the growth reads as rising toward the reader,
   not a flat zoom. Origin is the top edge (top-center) so the crop only ever
   deepens off the already-bled bottom: the top stays pinned, no gap opens,
   growth spills into the overflow. The scale stays under the point where the
   crisp desktop capture would soften. Expressive ambient move — slow,
   deliberate settle in, subtler/faster reverse — same expressive-cover
   latitude as the bloom and dissolve ramps. FOCUS_IN is also the span the
   whole backdrop takes to bloom and clear, so scale and dissolve settle
   together. */
const HOVER_SCALE = 1.075;
const FOCUS_IN = 1.6; /* s — slow, deliberate settle; the full bloom→dissolve span */

/* Backdrop dissolve — the base slate FILL holds solid while the bloom arrives,
   then melts to transparent so the shell surface shows through the panel and
   the pair floats on the page plane. Delayed so the bloom registers FIRST;
   delay + duration land the melt's settle at FOCUS_IN, in step with the scale
   and the bloom's own fade-out. Expressive-cover ambient latitude
   (cover-effects.md) — past the standard UI tokens, same precedent as the
   enter ramp; the reverse and the bloom's opacity stay on tokens. */
const DISSOLVE_DELAY = motionDuration.slow; /* s (0.5) — hold slate solid while the bloom blooms in */
const DISSOLVE_IN = 1.1; /* s — 0.5 delay + 1.1 = 1.6 = FOCUS_IN */

/* Bloom keyframe stops (fractions of FOCUS_IN): the wash rises 0→1 by the
   first ~0.5s (BLOOM_PEAK_T), holds a beat, then melts 1→0 with the fill over
   the back half, so the ink registers before the field clears. */
const BLOOM_PEAK_T = 0.31; /* ~0.5s of FOCUS_IN — bloom reaches full */
const BLOOM_HOLD_T = 0.42; /* ~0.67s — holds, then dissolves out with the fill */

/* Paired lift shadow — matches shadow-sc-hero's character (soft, warm-black,
   light from top-left) but deeper and larger at the hover end so the growing
   pair reads as lifting toward the viewer. SHADOW_REST is shadow-sc-hero
   verbatim (--sc-hero-shadow) so rest is pixel-identical to the static token;
   SHADOW_LIFT carries a longer drop, wider blur, more spread and a touch more
   ink, the shadow an object throws once it rises off the surface. Animated,
   not scaled — a real shadow ramp, so the lift reads independently of the
   pair's transform. (With the field dissolving to the deep-teal shell grout,
   the black shadow reads only faintly at held hover — the pair separates by
   luminance, light UI on deep teal; see the report's rule-conflict note.) */
const SHADOW_REST = "5px 5px 20px 2px rgb(0 0 0 / 0.25)";
const SHADOW_LIFT = "9px 20px 42px 4px rgb(0 0 0 / 0.35)";

/* The wash flows fast enough to read as moving ink, not a crawl (cf. VEIL). */
const BLOOM_SPEED = 0.5;

/* ── The prototype clip ──────────────────────────────────────────────────────
   The phone slot carries a screen recording of the working prototype rather
   than a still. The recording was made in the prototype's own device
   presentation, so a black handset bezel with rounded corners is BAKED INTO
   the footage: no PhoneFrame is wrapped around it, or the device would wear two
   bezels.

   Which means the video's rectangle has to be clipped back to the device shape
   it already draws, or its four square black corners print on the stage. Both
   numbers below are measured off the footage, not chosen:

   - PROTOTYPE_ASPECT is the encode's own 798x1674.
   - PROTOTYPE_CLIP is the device's outer corner, 115px in a 798px-wide frame,
     expressed per-axis (115/798 = 14.4% of width, 115/1674 = 6.9% of height) so
     the corner stays CIRCULAR at any rendered size — a single percentage would
     go elliptical on a 1:2.1 box. 115px is the largest radius that clips no
     device pixel (measured: 0 lit pixels removed at 115, 54 removed at 120),
     and it leaves the same ~8px black rim at the corners that the footage
     already carries down its straight edges, so the rim reads as bezel.
   Re-measure both if the clip is ever re-recorded. */
const PROTOTYPE_ASPECT = 798 / 1674;
const PROTOTYPE_CLIP = "14.4% / 6.9%";

type ScreenshotProps = {
  src: string;
  alt: string;
  /** CSS aspect-ratio (width / height); must match the asset. Used only when
      `aspectClassName` is not supplied. */
  ratio: number;
  sizes: string;
  /**
   * Optional responsive aspect override (e.g. a square crop below md that
   * relaxes to the native ratio above it). When present it drives the frame's
   * aspect ratio via classes and the inline `ratio` is dropped, so the same
   * capture can crop to a focused square on mobile and show whole on desktop.
   */
  aspectClassName?: string;
  /**
   * `object-position` for the cover crop — tunes which vertical band survives
   * when the frame is squarer than the asset. Only meaningful where the crop
   * actually clips (the square mobile crop); a no-op where the frame matches
   * the asset ratio.
   */
  objectPosition?: string;
  /**
   * Extra classes on the <Image>. Used by the square mobile crop to zoom past
   * the captured page's own footer (transform from the top edge), so the frame
   * foregrounds the meaningful step instead of the page's brand footer; reset
   * to scale-100 above md where the whole capture is shown.
   */
  imgClassName?: string;
};

function Screenshot({
  src,
  alt,
  ratio,
  sizes,
  aspectClassName,
  objectPosition,
  imgClassName,
}: ScreenshotProps) {
  return (
    <div
      style={aspectClassName ? undefined : { aspectRatio: ratio }}
      className={`relative w-full overflow-hidden rounded-xs ${aspectClassName ?? ""}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes={sizes}
        className={`object-cover ${imgClassName ?? ""}`}
        style={objectPosition ? { objectPosition } : undefined}
      />
    </div>
  );
}

/** The prototype clip in its slot. One <video> serves every breakpoint — the
    composition around it changes, the element does not, so the 6MB encode is
    never fetched twice on one page.

    The clip ships raw (a <video src> bypasses next/image entirely), so it is
    `preload="none"` behind its poster: nothing but the 48KB WebP still is
    fetched until playback is actually asked for, which is what keeps a reduced
    motion reader — who never starts it — off the download. Playback itself is
    driven from the parent, so the replay control and the in-view gate share one
    source of truth.

    It does NOT loop. The recording is a single 1m45s walkthrough with a real
    beginning and end, so it plays once and rests on its last frame; watching it
    again is a deliberate act via the replay chip, not something that happens to
    you if you linger. `onEnded` is what tells the parent the run is over. */
function PrototypeVideo({
  clip,
  videoRef,
  onEnded,
  onPlay,
}: {
  clip: PrototypeClip;
  videoRef: RefObject<HTMLVideoElement | null>;
  onEnded: () => void;
  onPlay: () => void;
}) {
  return (
    <video
      ref={videoRef}
      className="block h-full w-full object-cover"
      src={clip.src}
      poster={clip.poster}
      /* A silent <video> with no `controls` is not focusable and carries no
         implicit role, so assistive tech can skip it entirely and the alt text
         goes unread. role="img" is the settled pattern for an illustrative
         clip like this: it announces once, as the picture it functions as. The
         replay affordance is a real button elsewhere in the stage. */
      role="img"
      aria-label={clip.alt}
      muted
      playsInline
      preload="none"
      onEnded={onEnded}
      onPlay={onPlay}
    />
  );
}

/**
 * Case-study hero: the redesigned checker on a muted slate-teal stage tile.
 * One centred stacked column at every width — the running prototype clip on
 * top, a landscape crop of the desktop capture beneath it. Only the two
 * members' widths change with the breakpoint (the clip 30% of the stage above
 * md, near full width below it; the capture 66% above md, full width below),
 * so it is ONE <video> element across every breakpoint and a 6MB encode is
 * never fetched twice on one page.
 *
 * The phone in the composition is the prototype ACTUALLY RUNNING — a screen
 * recording of the working flow, landing through symptoms and assessment to a
 * "Seek immediate medical care" result and on into the service finder. It
 * carries its own device bezel in the footage, so nothing frames it;
 * PROTOTYPE_CLIP just clips the rectangle back to the handset shape the
 * recording already draws.
 *
 * A "bloom then dissolve" joins the stage to the site's motion language: a
 * teal ink wash blooms in behind the media, then the whole backdrop — the wash
 * and the slate fill — melts to transparent, revealing the shell surface behind
 * the panel so the media is left floating on the page plane. The media stays
 * crisp above the field (relative z-10) throughout. On lg+ the moment is a
 * reversible hover; below lg it plays once on scroll-into-view and settles at
 * the dissolved composition. The pair also steps forward (scale, deeper shadow)
 * on the lg hover.
 *
 * Playback is its own gate, independent of that moment. The clip runs ONCE,
 * muted, starting when the handset itself is meaningfully scrolled into view —
 * the same rule on desktop and touch — pausing the instant it leaves and
 * resuming where it left off on the way back. It does not loop: at the end of
 * the walkthrough it rests on its last frame. It never autostarts under reduced
 * motion, where the poster stands in as the static composition and the control
 * below is the way in. That control is a replay chip at the stage's upper-right,
 * in the same liquid-glass material as the artifact viewer's tour control, so
 * the page speaks one floating-chrome language rather than two.
 *
 * Note for future edits: replacing the pause affordance with replay-only is a
 * deliberate call by the author, and it trades away the WCAG 2.2.2 (Pause,
 * Stop, Hide) mechanism this stage used to carry — a 1m45s clip that starts on
 * its own now has no in-page stop. If that becomes a problem, the fix is a
 * second control or a chip that pauses while playing, not a return to looping.
 */
/* NO stage aspect at any width — the stacked column's own height is the leaf
   floor, exactly like the case study's other content leaves.
   The side-by-side composition needed a fixed band (md:aspect-[100/58.22])
   because it deliberately ran the tall portrait desktop capture off the tile's
   bottom edge, and only a declared floor could say where that cut landed. The
   stacked column shows both captures whole, so a declared band could only
   over- or under-shoot it: content height is now the honest floor. The cost is
   that above md the column is taller than 110svh on a short laptop, where the
   CollapsingLeaf pin quietly becomes a no-op (its documented behaviour for any
   section taller than the open leaf) — the arrival still lands the clip whole
   with the desktop capture entering beneath it. Below lg, where viewports are
   proportionally taller, the collapse still runs. */
const DEFAULT_STAGE_ASPECT = "";

/* The desktop capture is a 1800x2578 FULL-PAGE capture — a scrolled page, not a
   screen. Stacked at the foot of the column it has to read as a desktop SCREEN,
   so the frame crops it to its own above-the-fold band: 1800x1246, top-anchored,
   which is masthead + nav + the four-step progress bar + the whole Symptoms step
   down to the bottom edge of the teal (1246px is measured off the asset — the
   teal/footer seam). Everything below, the phone-number band and the government
   footer, is the "long page" tell and is cropped away. objectPosition pins the
   crop to the top; no img scale, since the crop is the whole framing.

   It takes the FULL column at every width, with no max-width cap. A desktop
   capture is 1800px of interface, so the only thing that makes it legible is
   width: held to 66-72% under a 44rem cap it rendered about 634px at a
   1440px viewport — roughly a third of life size, at which the page reads as a
   thumbnail of itself rather than as the design. Full column takes the same
   viewport to 960px. The stack is what buys this: side by side the capture had
   to leave room for the phone beside it, and stacked it does not. Do not
   re-introduce a cap to "balance" it against the clip — the clip carries its own
   cap and the two are sized independently on purpose. */
const DEFAULT_DESKTOP: HeroCapture = {
  src: "/assets/healthdirect/hero/symptoms-prompt-desktop.webp",
  alt: "The redesigned Symptoms step on desktop: Vomiting and Sore throat added under My symptoms, one at a time.",
  ratio: 1800 / 1246,
  aspectClassName: "aspect-[1800/1246]",
  objectPosition: "50% 0%",
  /* The column is the viewport less the shell's gutters (px-4 → 2xl:px-64) and
     the media row's own (px-4 → lg:px-12), so `sizes` subtracts both rather than
     guessing a vw fraction — at full width an over-estimate costs real bytes. */
  sizes:
    "(min-width: 1536px) calc(100vw - 608px), (min-width: 1280px) calc(100vw - 480px), (min-width: 1024px) calc(100vw - 256px), (min-width: 768px) calc(100vw - 128px), (min-width: 640px) calc(100vw - 96px), calc(100vw - 64px)",
  widthClassName: "w-full",
};

/** The running clip placed in the stage. `alt` is the video's accessible name —
    a <video> carries no alt attribute, so it is spoken from aria-label; keep it
    describing what the recording SHOWS, the same job the screenshot alt did.
    `widthClassName` is the composition lever, matching HeroCapture's. */
type PrototypeClip = {
  src: string;
  poster: string;
  alt: string;
  widthClassName: string;
};

const DEFAULT_CLIP: PrototypeClip = {
  src: "/assets/healthdirect/hero/prototype.mp4",
  poster: "/assets/healthdirect/hero/prototype-poster.webp",
  alt: "A recording of the redesigned symptom checker running on a phone: starting a check, clearing the triple zero warning and the background questions, entering Vomiting and Lower back pain one at a time, reaching a 'Seek immediate medical care' result with what to do next and the virtual, urgent, and emergency options, then opening an urgent care clinic in the service finder with its hours and map.",
  widthClassName:
    "w-full max-w-[19rem] md:w-[36%] md:max-w-[20rem] lg:w-[33%] xl:w-[30%]",
};

/** A capture placed in the stage: the screenshot props plus its `widthClassName`
    — the composition lever. The pair stacks at every width: the capture takes
    the full column at all of them, always wider than the clip above it.
    Parameterised so the same stage can carry a full-page capture
    cropped to a screen (the assessment steps) or a natively landscape one (the
    landing page), which want different aspect crops. */
type HeroCapture = ScreenshotProps & { widthClassName: string };

export function SymptomsHero({
  corners = "all",
  stageAspectClassName = DEFAULT_STAGE_ASPECT,
  desktop = DEFAULT_DESKTOP,
  clip = DEFAULT_CLIP,
}: {
  /** Corner rounding for the stage surface — "top" when the hero caps the
      introduction slab. */
  corners?: TileCorners;
  /** Optional stage aspect ratio, overriding the content-driven floor. Empty by
      default: the stacked column's own height is the CollapsingLeaf floor. Kept
      as a prop for a future pairing that wants a declared band. */
  stageAspectClassName?: string;
  /** The wide capture, beneath the clip at every width. */
  desktop?: HeroCapture;
  /** The running prototype clip, on top at every width. */
  clip?: PrototypeClip;
}) {
  const reduce = useReducedMotion() ?? false;

  // Input-capability split at lg. "pending" until matchMedia resolves so the
  // first paint (and SSR) is the neutral static slate and never briefly enters
  // the touch branch on a desktop. "desktop" wires the reversible hover;
  // "touch" wires the once, scroll-into-view forward pass.
  const [mode, setMode] = useState<"pending" | "desktop" | "touch">("pending");
  const [hovered, setHovered] = useState(false);
  // Keeps the shader's rAF loop alive only while the wash is transitioning
  // (blooming in or dissolving out), driven off the bloom's animation
  // lifecycle: it drops to false once the bloom animation settles — at rest
  // (flat slate) and at the settled dissolve (wash fully faded), the wash is at
  // opacity 0, so the loop halts and the shader sleeps.
  const [live, setLive] = useState(false);
  // WebGL probe. The touch pass is gated on it so the dissolve never runs
  // bloomless: with no shader, below lg stays the static solid-slate still,
  // mirroring how the desktop path only blooms where the shader actually mounts.
  const [webglOk, setWebglOk] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      setMode(mq.matches ? "desktop" : "touch");
      if (!mq.matches) setHovered(false);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl") ?? null;
    setWebglOk(Boolean(gl));
  }, []);

  const interactive = mode === "desktop";
  // The touch forward pass only wires below lg, with a shader to bloom, and
  // never under reduced motion (a scroll-linked reveal is non-essential motion).
  const touchMotion = mode === "touch" && webglOk && !reduce;

  // Fires once when the stage first scrolls meaningfully into view — jitter
  // can't re-fire it, so the pass settles at the dissolved composition and stays.
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, {
    once: true,
    margin: "0px 0px -20% 0px",
  });

  // The hover drive (reversible, lg+) and the touch drive (once, below lg) feed
  // the SAME active state. Reduced motion holds the flat slate still: no bloom,
  // no dissolve, no scale, no shadow lift.
  const hoverActive = hovered && !reduce;
  const active = hoverActive || (touchMotion && inView);

  // speed 0 stops the library's rAF loop entirely; static under reduced motion.
  const bloomSpeed = reduce || !live ? 0 : BLOOM_SPEED;

  /* ── Clip playback ────────────────────────────────────────────────────────
     Deliberately NOT tied to the bloom moment: the reader should be able to
     watch the prototype run without holding a hover, and the moment should
     still play for someone who has let the clip finish.

     The gate is the CLIP's own box, not the stage's. The stage leaf arrives
     110svh tall and runs taller again above md, so a fraction of IT can be
     satisfied by a sliver of empty slate at the top of the viewport — the clip
     would be running well before anyone could see it. Probing the handset
     itself, at a substantial fraction, means "playing" and "on screen in front
     of the reader" are the same thing at every width, desktop and touch alike.
     0.45 is picked to be reachable: the handset is a 1:2.1 box that renders
     roughly 640-670px tall, so a stricter fraction would never resolve on a
     short phone viewport. The probe is live (not `once`), so the clip also
     stops decoding the moment it scrolls away instead of burning battery
     off-screen, and picks up where it left off on the way back.

     `ended` retires the gate once the walkthrough has run its course: without
     `loop` the video stops on its own, and this keeps a later scroll-past from
     restarting a clip the reader has already watched. Replay clears it.

     `userStarted` is the opt-in that lets the control override reduced motion —
     where the clip must never autostart, but a reader who presses the control
     has asked for it, so refusing would be removing the content rather than the
     motion. */
  const videoRef = useRef<HTMLVideoElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const [ended, setEnded] = useState(false);
  const [userStarted, setUserStarted] = useState(false);
  // Latched off the video's own `play` event — the moment playback ACTUALLY
  // begins, not the moment we ask for it, so a refused autoplay leaves the chip
  // reading "Play". Never cleared: it is what the control's glyph and label
  // read from, so the chip says "Play" exactly once, before anything has run,
  // and "Replay" from then on — including while the clip is scrolled away
  // mid-run.
  const [hasRun, setHasRun] = useState(false);
  const onScreen = useInView(clipRef, { amount: 0.45 });
  const playing = onScreen && !ended && (!reduce || userStarted);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!playing) {
      video.pause();
      return;
    }
    // Re-assert muted as a PROPERTY before playing. React renders `muted` as an
    // attribute, which the server HTML carries but iOS does not always honour —
    // and an unmuted inline video is exactly what mobile Safari refuses to
    // autoplay. Setting the property is what makes the gesture-free play legal.
    video.muted = true;
    // Play can still be refused; swallow the rejection so a refusal leaves the
    // poster showing rather than throwing an unhandled promise.
    void video.play().catch(() => {});
  }, [playing]);

  /* Replay — rewind to the first frame and run the walkthrough again. Clearing
     `ended` is what re-opens the gate above; `userStarted` is what makes the
     control work under reduced motion, where nothing has autostarted. The
     explicit play() covers the case where neither flag actually changes (a
     reader replaying a clip that is already running), which would leave the
     effect with nothing to react to. */
  const replay = () => {
    const video = videoRef.current;
    setEnded(false);
    setUserStarted(true);
    if (!video) return;
    video.currentTime = 0;
    video.muted = true;
    void video.play().catch(() => {});
  };

  /* The stage shares the leaf arrival (CollapsingLeaf): where the stacked
     column is shorter than the open leaf it opens at the full leaf height and
     collapses onto the column's own height, resting snug on the composition.
     Where the column is taller — above md on a short laptop — the floor wins
     and the pin quietly becomes a no-op, exactly as it does for any tall
     section.

     w-full pins the width definite so the collapse only ever moves the bottom
     edge, and so a caller that does pass `stageAspectClassName` can never have
     the ratio transfer a 110svh height back into a wide width and balloon the
     stage past its lane.

     The leaf background is TRANSPARENT — the slate fill lives in its own
     absolutely-positioned layer below so it can dissolve. When the fill melts,
     the leaf reveals whatever sits behind the panel in the shell (the grout
     plane), seamlessly continuous with the grout gaps around the tile: no
     visible rectangle at the reveal, in the spirit of video-blend.md.

     relative anchors the absolutely-positioned fill, bloom, and hover catcher
     to the stage; overflow-hidden + the rounded corners crop them to the
     panel shape as before. */
  return (
    <CollapsingLeaf
      pinTopPx={0}
      className={`relative w-full overflow-hidden ${stageAspectClassName} ${cornerClasses[corners]}`}
    >
      {/* Base slate fill — the flat-still fallback AND the dissolving layer in
          one. Rendered unconditionally, so at rest, in the pending pre-resolve
          pass, with no WebGL, and under reduced motion it holds opacity 1 and
          the stage is today's solid slate panel. When the moment runs it melts
          to transparent (delayed, so the bloom lands first), revealing the
          shell surface behind the panel. Carries the in-view probe ref. */}
      <motion.div
        ref={stageRef}
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-sc-hero-stage"
        initial={false}
        animate={{ opacity: active ? 0 : 1 }}
        transition={{
          duration: active ? DISSOLVE_IN : motionDuration.slow,
          delay: active ? DISSOLVE_DELAY : 0,
          ease: active ? motionEase.out : motionEase.in,
        }}
      />

      {/* Ink bloom — over the slate fill, below the screenshots. Mounts for
          either trigger (hover on lg+, the scroll pass below lg). It blooms in
          (0→1), holds a beat, then melts out (1→0) together with the fill, so
          the ink registers before the field clears. The shader's speed rides
          the fade lifecycle so it sleeps once the wash is gone. */}
      {(interactive || touchMotion) && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0"
          initial={false}
          animate={{ opacity: active ? [0, 1, 1, 0] : 0 }}
          transition={
            active
              ? {
                  duration: FOCUS_IN,
                  times: [0, BLOOM_PEAK_T, BLOOM_HOLD_T, 1],
                  ease: [motionEase.out, motionEase.out, motionEase.in],
                }
              : { duration: motionDuration.base, ease: motionEase.in }
          }
          onAnimationStart={() => setLive(true)}
          onAnimationComplete={() => setLive(false)}
        >
          <GrainGradient
            className="h-full w-full"
            colorBack={BLOOM_BACK}
            colors={[BLOOM_HAZE, BLOOM_DEEP]}
            intensity={0.62}
            noise={0.4}
            shape="blob"
            softness={0.62}
            speed={bloomSpeed}
          />
        </motion.div>
      )}

      {/* Hover catcher — desktop only. Transparent, spans the whole stage so
          hover fires anywhere over it (the screenshots are decorative, no
          interaction is lost). Motion's onHover ignores touch, so it never
          fires on tap; below lg the scroll pass drives the moment instead. */}
      {interactive && (
        <motion.div
          data-symptoms-stage
          className="absolute inset-0 z-30"
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        />
      )}

      {/* The media — crisp above the field (z-10) at every width. ONE centred
          column at every breakpoint: the running clip on top, the desktop
          capture beneath it. Only the two members' widths change with the
          breakpoint, never the structure, so the <video> stays a single element
          and the 6MB encode is fetched once no matter what is on screen.

          Stacking is what makes the clip big: side by side it had 23% of the
          stage width to live in, and a 1:2.1 portrait phone in a quarter-width
          column is a sliver. On its own line it takes 36% at md easing to 30%
          at xl — a 30 to 55% wider handset at every breakpoint — and, more to
          the point, has nothing beside it to be measured against.

          The clip's percentages ease DOWN as the stage widens because it is the
          height-hungry member: at a fixed percentage a 1:2.1 box grows twice as
          fast as the stage does, and the whole column's height rides on it. The
          20rem cap stops it entirely past about 1600px, so very wide screens
          get more slate air rather than a taller lockup.

          The capture below it is the opposite case and carries NO cap: it is
          landscape, so width costs it little height, and it is 1800px of
          interface that only width can make legible. See DEFAULT_DESKTOP —
          capping the two together was what made it read as a thumbnail.

          On desktop hover the row steps into focus: it scales up to a clearly
          readable HOVER_SCALE while each frame's shadow deepens (SHADOW_REST →
          SHADOW_LIFT), so growing bigger reads as lifting toward the viewer.
          The scale step is the LG HOVER read only (`hoverActive`);
          transform-origin is the top edge so growth spills only into the
          already-cropped bottom bleed — no gap opens above. On hover-out the
          scale reverses subtler/faster; Motion retargets mid-flight. Under
          reduced motion the scale pins to 1 and each shadow to SHADOW_REST — no
          lift. The shadow lift rides the shared `active`, so it deepens on both
          triggers as the field clears beneath the media.

          The column's own height (both boxes plus the gap and padding) is what
          the leaf floor rests on at every width — see DEFAULT_STAGE_ASPECT.
          Which is also why the vertical padding is deliberately ASYMMETRIC
          (pt-8 → xl:pt-12 against pb-12 → xl:pb-24) rather than a single py-*:
          with the floor set by content, the bottom padding IS the gap between
          the capture and the tile's edge, and matching it to the top left the
          capture sitting almost on that edge. The column now hangs from the top
          with air beneath it; do not "balance" it back to py-*. */}
      <motion.div
        className="relative z-10 flex w-full flex-col items-center gap-6 px-4 pb-12 pt-8 will-change-transform sm:px-6 md:gap-8 md:px-8 md:pb-16 md:pt-10 lg:px-12 lg:pb-20 xl:gap-10 xl:pb-24 xl:pt-12"
        style={{ transformOrigin: "50% 0%" }}
        initial={false}
        animate={{ scale: hoverActive ? HOVER_SCALE : 1 }}
        transition={{
          duration: hoverActive ? FOCUS_IN : motionDuration.slow,
          ease: hoverActive ? motionEase.out : motionEase.in,
        }}
      >
        {/* The running clip — top of the stack, and the object the composition
            is built around. The radius and the overflow clip sit on the
            SHADOW-BEARING element, not on an inner wrapper, so the lift shadow
            follows the handset's rounded corners instead of haloing a square
            around them. */}
        <motion.div
          ref={clipRef}
          className={`${clip.widthClassName} overflow-hidden`}
          style={{
            aspectRatio: PROTOTYPE_ASPECT,
            borderRadius: PROTOTYPE_CLIP,
          }}
          initial={false}
          animate={{ boxShadow: active ? SHADOW_LIFT : SHADOW_REST }}
          transition={{
            duration: active ? FOCUS_IN : motionDuration.slow,
            ease: active ? motionEase.out : motionEase.in,
          }}
        >
          <PrototypeVideo
            clip={clip}
            videoRef={videoRef}
            onEnded={() => setEnded(true)}
            onPlay={() => setHasRun(true)}
          />
        </motion.div>
        {/* The wide capture — beneath the clip, at every width. Wider than the
            phone so the pair reads as two surfaces of one product, and shorter,
            so the clip keeps the composition's weight. Its width and crop come
            from the `desktop` config, so the same slot carries either the
            assessment steps or a landing capture. */}
        <motion.div
          className={`${desktop.widthClassName} rounded-xs`}
          initial={false}
          animate={{ boxShadow: active ? SHADOW_LIFT : SHADOW_REST }}
          transition={{
            duration: active ? FOCUS_IN : motionDuration.slow,
            ease: active ? motionEase.out : motionEase.in,
          }}
        >
          <Screenshot
            src={desktop.src}
            alt={desktop.alt}
            ratio={desktop.ratio}
            aspectClassName={desktop.aspectClassName}
            objectPosition={desktop.objectPosition}
            imgClassName={desktop.imgClassName}
            sizes={desktop.sizes}
          />
        </motion.div>
      </motion.div>

      {/* Replay control — the clip runs once, so the only thing worth offering
          is another run of it. It rides at z-40, ABOVE the hover catcher, or
          the catcher would swallow the click; the pointer handlers on the chip
          re-assert `hovered` because leaving the catcher for the chip fires the
          catcher's hover-end in the same dispatch, and without them reaching
          for the control would collapse the bloom under your cursor.

          Under reduced motion nothing has autostarted, so the same control is
          the way IN: it reads "Play" with a play glyph until the clip has run,
          and becomes "Replay" with the rewind glyph afterwards — one button,
          labelled for what it will actually do next. Same rewind idiom as the
          IA flow's reset.

          Pinned to the stage's UPPER-right, which is the one corner that is
          always both visible and uncropped. Not the clip (it is centred at md+,
          so a chip glued to it would float in the middle of the stage), and not
          the stage's lower-right: the leaf arrives 110svh tall, so its bottom
          edge — and anything glued to it — starts a tenth of a viewport below
          the fold, and above md the stacked column is taller again, putting
          that corner a whole screen down. The top edge is pinned and still, and
          the stack now leaves it in clear stage rather than over the phone's
          shoulder. Same liquid-glass material as the
          artifact viewer's tour chip (style-rules "Glass surfaces": one
          floating-chrome language, and a new surface only if it can take the
          same idiom). */}
      <div className="pointer-events-none absolute inset-0 z-40 flex items-start justify-end p-4">
        <div
          className="tour-glass-chip pointer-events-auto rounded-full p-1 text-leaf-foreground sm:p-1.5"
          onPointerEnter={interactive ? () => setHovered(true) : undefined}
          onPointerLeave={interactive ? () => setHovered(false) : undefined}
        >
          <button
            type="button"
            aria-label={
              hasRun
                ? "Replay the prototype recording"
                : "Play the prototype recording"
            }
            onClick={replay}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-leaf-foreground outline-none transition-colors hover:bg-primary/35 focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-leaf active:bg-primary/50"
          >
            {hasRun ? (
              <RotateCwIcon aria-hidden="true" className="size-4" />
            ) : (
              <PlayIcon aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>
    </CollapsingLeaf>
  );
}
