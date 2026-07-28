"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
   are all inset-0 / composition-agnostic, so the identical layers drive either
   the side-by-side (md+) or the stacked (below md) composition; only the
   trigger differs.

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

/* Below-md phone frame — a lift of FeatureChips' PhoneFrame device styling
   (kept in sync as shared constants so the two frames never drift). The bezel
   stays soft at BEZEL_RADIUS; the screen clips one standard token tighter to
   SCREEN_RADIUS so the inner corner reads as a crisp cutout, not a card.
   (This project remaps --radius, so rounded-xl resolves to ~0.875rem here.)
   The screen holds a real device viewport (SCREEN_ASPECT, 360:800) and the tall
   full-page capture scrolls INSIDE it like a prototype — a bounded scroller,
   but deliberately WITHOUT overscroll-contain, so at its top and bottom a
   continued drag chains to the page and never re-traps page scroll. */
const BEZEL_RADIUS = "rounded-[1.5rem]";
const SCREEN_RADIUS = "rounded-xl";
/* Standard mobile viewport (9:20). The screen holds this fixed shape and the
   tall page scrolls within it, so the phone reads as a real handset, not a
   7000px strip. */
const SCREEN_ASPECT = "aspect-[360/800]";

/* Keydown inside the bounded phone screen: arrows scroll the capture and stop
   there so the key press never bubbles up to page the outer stage or move page
   focus. Native focusable-scroll already covers Space / Page / Home / End; the
   two explicit arrow cases keep "arrow keys scroll it" true where a browser
   would otherwise defer to an ancestor handler. Lifted verbatim from
   FeatureChips' PhoneFrame. (Boundary scroll-chaining to the page is
   intentional — see the frame note above; no overscroll-contain here.) */
function scrollOnArrows(event: KeyboardEvent<HTMLDivElement>) {
  event.stopPropagation();
  const el = event.currentTarget;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    el.scrollBy({ top: 48 });
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    el.scrollBy({ top: -48 });
  }
}

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

/** One below-md phone prototype: a dark bg-grout bezel device whose screen holds
    a fixed 360:800 handset viewport (SCREEN_ASPECT), with the tall full-page
    capture scrolling inside it. The inner scroller is focusable and
    arrow-scrollable and carries NO overscroll-contain, so at its top and bottom
    a continued drag chains to the page and never re-traps page scroll. Both
    below-md phones render through this one helper so they are guaranteed
    identical rather than hand-duplicated. */
function PhonePrototype({ src, alt, ratio }: PhoneCapture) {
  return (
    <div className="w-full max-w-[19rem]">
      <div
        className={`bg-grout p-2 shadow-sc-hero outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-leaf-foreground has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-leaf ${BEZEL_RADIUS}`}
      >
        <div className={`relative overflow-hidden ${SCREEN_RADIUS}`}>
          <div
            tabIndex={0}
            role="group"
            aria-label={`Scrollable preview: ${alt}`}
            onKeyDown={scrollOnArrows}
            className={`${SCREEN_ASPECT} overflow-y-auto outline-none [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${SCREEN_RADIUS}`}
          >
            <Image
              src={src}
              alt={alt}
              width={1080}
              height={Math.round(1080 / ratio)}
              priority
              sizes="(min-width: 420px) 288px, 92vw"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Case-study hero: the redesigned checker on a muted slate-teal stage tile.
 * The composition is width-driven at md. Above md the desktop and mobile
 * captures sit side by side, flat and top-aligned, bleeding off the tile's
 * bottom edge — the reviewed showcase proportions. Below md the desktop
 * capture is dropped and the hero becomes TWO stacked scrollable phone
 * prototypes — the Symptoms input step on top, the Assessment step below —
 * each a dark bezel device whose screen holds a real handset viewport (360:800)
 * and scrolls its tall full-page capture INSIDE it like a prototype. Both
 * render through one PhonePrototype helper, so the devices are identical; each
 * inner scroller carries no overscroll-contain, so at its top and bottom edge a
 * continued drag chains to the page and never re-traps page scroll. The frame
 * is lifted from FeatureChips' PhoneFrame, minus its hotspot/popup machinery —
 * a plain scrollable device.
 *
 * A "bloom then dissolve" joins the stage to the site's motion language: a
 * teal ink wash blooms in behind the screenshots, then the whole backdrop —
 * the wash and the slate fill — melts to transparent, revealing the shell
 * surface behind the panel so the media is left floating on the page plane.
 * The screenshots stay crisp above the field (relative z-10) throughout, the
 * stacked phones included. On lg+ the moment is a reversible hover; below lg it
 * plays once on scroll-into-view and settles at the dissolved composition. The
 * md+ pair also steps forward (scale, deeper shadow) on the lg hover; the
 * below-md stack takes neither — both phones keep a static shadow-sc-hero
 * (equal to the rest shadow) so their device shadows never double, and the
 * backdrop reveal alone carries the touch moment there.
 */
/* Default composition — the assessment-steps pairing. At md+ a PORTRAIT desktop
   capture (73.3%) sits beside a slim portrait phone (23.1%). Below md the desktop
   capture is dropped and two phone prototypes stack, each on its fixed 360:800
   screen, so the stage floor changes with the breakpoint: md+ keeps a fixed
   aspect band (md:aspect-[100/58.22]); below md there is NO stage aspect — the
   two 360:800 screens (plus the gap and padding) drive the leaf floor instead,
   exactly like the case study's other content leaves. Omitting the base aspect
   is what lets the collapse rest snug on the stacked phones rather than on an
   aspect band that would over- or under-shoot them. */
const DEFAULT_STAGE_ASPECT = "md:aspect-[100/58.22]";

const DEFAULT_DESKTOP: HeroCapture = {
  src: "/assets/healthdirect/hero/symptoms-prompt-desktop.webp",
  alt: "The redesigned Symptoms step on desktop: Vomiting and Sore throat added under My symptoms, one at a time.",
  ratio: 1800 / 2578,
  aspectClassName: "aspect-square md:aspect-[1800/2578]",
  objectPosition: "50% 0%",
  imgClassName: "origin-top scale-[1.3] md:origin-center md:scale-100",
  sizes: "(min-width: 768px) 66vw, 100vw",
  widthClassName: "w-full md:w-[73.3%]",
};

const DEFAULT_MOBILE: HeroCapture = {
  src: "/assets/healthdirect/hero/assessment-mobile.webp",
  alt: "The Assessment step on mobile, asking for body temperature with one-tap answer options.",
  ratio: 540 / 1198,
  sizes: "(min-width: 768px) 21vw, 62vw",
  widthClassName: "w-[62%] max-w-72 md:w-[23.1%] md:max-w-none",
};

/* Below md the hero is TWO stacked scrollable phone prototypes, each carrying a
   full-length page capture (not the single-viewport mockup the md+ side-by-side
   uses, DEFAULT_MOBILE). Each capture's tall page scrolls inside a fixed 360:800
   device screen, so the whole interface is viewable by scrolling the prototype.
   Kept as their own captures so the md+ phone mockup stays a fixed-aspect device
   shot rather than a 6000-7000px sliver. `PhoneCapture` is the trio the frame
   reads (src/alt/ratio); the ratio is the capture's own, used only to compute
   the intrinsic <Image> height (the visible height is the 360:800 screen). */
type PhoneCapture = Pick<ScreenshotProps, "src" | "alt" | "ratio">;

/* TOP prototype — the Symptoms input step. */
const DEFAULT_MOBILE_PAGE_TOP: PhoneCapture = {
  src: "/assets/healthdirect/hero/symptoms-input-mobile.webp",
  alt: "The Symptoms step on mobile, entering symptoms one at a time, scrolled through the full page.",
  ratio: 1080 / 6204,
};

/* BOTTOM prototype — the Assessment step. */
const DEFAULT_MOBILE_PAGE: PhoneCapture = {
  src: "/assets/healthdirect/hero/assessment-facepain-mobile.webp",
  alt: "The Assessment step on mobile, asking whether the person has face pain, scrolled through the full page.",
  ratio: 1080 / 7320,
};

/** A capture placed in the stage: the screenshot props plus its `widthClassName`
    — the composition lever. Below md the pair stacks (wide capture full width,
    phone a centred column); at md the two sit side by side and their widths
    plus the row gap sum to ~100%. Parameterised so the same stage can carry a
    PORTRAIT desktop capture (the assessment steps) or a LANDSCAPE one (the
    landing page), which want different proportions. */
type HeroCapture = ScreenshotProps & { widthClassName: string };

export function SymptomsHero({
  corners = "all",
  stageAspectClassName = DEFAULT_STAGE_ASPECT,
  desktop = DEFAULT_DESKTOP,
  mobile = DEFAULT_MOBILE,
  mobilePageTop = DEFAULT_MOBILE_PAGE_TOP,
  mobilePage = DEFAULT_MOBILE_PAGE,
}: {
  /** Corner rounding for the stage surface — "top" when the hero caps the
      introduction slab. */
  corners?: TileCorners;
  /** Stage aspect ratio (base + md). Drives the CollapsingLeaf floor, so it
      changes with the captures inside: a tall stacked column below md, a wide
      showcase band above it. */
  stageAspectClassName?: string;
  /** The wide capture (left). Portrait by default; a landscape landing capture
      supplies its own ratio and width. md+ side-by-side only — not shown below
      md, where the stack is two phone prototypes instead. */
  desktop?: HeroCapture;
  /** The phone capture (right) — the md+ side-by-side device mockup. */
  mobile?: HeroCapture;
  /** The full-length page capture scrolled inside the TOP below-md phone. */
  mobilePageTop?: PhoneCapture;
  /** The full-length page capture scrolled inside the BOTTOM below-md phone. */
  mobilePage?: PhoneCapture;
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

  /* The stage shares the leaf arrival (CollapsingLeaf): it opens at the full
     leaf height — showing more of the screenshots than the tuned crop — and
     collapses onto its aspect-ratio height, the bottom edge cropping the
     screenshots progressively until the reviewed composition rests. The
     aspect classes stay on the collapsing surface as its natural floor.

     w-full pins the width definite so the collapse only ever moves the bottom
     edge. This is the one leaf whose floor is an aspect ratio, not content
     height; while the leaf's min-height overshoots that ratio (110svh on
     arrival), an auto width would let the aspect ratio transfer the tall
     height back into a wide width and balloon the stage past its lane. A
     100% width leaves the ratio only the height to compute, so the width
     stays exactly as tuned.

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

      {/* md+ pair — crisp above the field (z-10), hidden below md where the
          framed phone below takes over. On desktop hover the pair steps into
          focus: it scales up to a clearly readable HOVER_SCALE while each
          capture's shadow deepens (SHADOW_REST → SHADOW_LIFT), so growing
          bigger reads as lifting toward the viewer. The scale step is the LG
          HOVER read only (`hoverActive`); transform-origin is the top edge so
          growth spills only into the already-cropped bottom bleed — no gap
          opens above. On hover-out the scale reverses subtler/faster; Motion
          retargets mid-flight. Under reduced motion the scale pins to 1 and
          each shadow to SHADOW_REST — no lift. The shadow lift rides the shared
          `active`, so it deepens on both triggers as the field clears beneath
          the pair. */}
      <motion.div
        className="relative z-10 hidden w-full items-center gap-6 px-4 pt-[7%] will-change-transform sm:px-6 md:flex md:flex-row md:items-start md:gap-[3.6%] md:px-8 md:pt-[min(4%,4.5rem)] lg:px-12"
        style={{ transformOrigin: "50% 0%" }}
        initial={false}
        animate={{ scale: hoverActive ? HOVER_SCALE : 1 }}
        transition={{
          duration: hoverActive ? FOCUS_IN : motionDuration.slow,
          ease: hoverActive ? motionEase.out : motionEase.in,
        }}
      >
        {/* The wide capture (left/top). Its width and crop come from the
            `desktop` config, so the same slot carries either a portrait
            assessment capture or a landscape landing capture. */}
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
        {/* The phone capture (right/bottom). */}
        <motion.div
          className={`${mobile.widthClassName} rounded-xs`}
          initial={false}
          animate={{ boxShadow: active ? SHADOW_LIFT : SHADOW_REST }}
          transition={{
            duration: active ? FOCUS_IN : motionDuration.slow,
            ease: active ? motionEase.out : motionEase.in,
          }}
        >
          <Screenshot
            src={mobile.src}
            alt={mobile.alt}
            ratio={mobile.ratio}
            aspectClassName={mobile.aspectClassName}
            objectPosition={mobile.objectPosition}
            imgClassName={mobile.imgClassName}
            sizes={mobile.sizes}
          />
        </motion.div>
      </motion.div>

      {/* Below md: two stacked scrollable phone prototypes — the Symptoms input
          step on top, the Assessment step below — replacing the md+ desktop
          capture (which stays in the side-by-side above md). Both ride above the
          dissolving field at z-10 exactly as the md+ pair does, and both render
          through the one PhonePrototype helper so the two devices are identical:
          the same 360:800 screen, the same focusable, arrow-scrollable inner
          scroller with NO overscroll-contain, so each chains to the page at its
          top and bottom edges and neither re-traps page scroll. Each keeps a
          static shadow-sc-hero (no active scale or shadow lift) so device
          shadows never double — the backdrop dissolve alone carries the touch
          moment. The two fixed-aspect screens are what the leaf floor rests on
          below md (see DEFAULT_STAGE_ASPECT). */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 py-8 md:hidden">
        <PhonePrototype
          src={mobilePageTop.src}
          alt={mobilePageTop.alt}
          ratio={mobilePageTop.ratio}
        />
        <PhonePrototype
          src={mobilePage.src}
          alt={mobilePage.alt}
          ratio={mobilePage.ratio}
        />
      </div>
    </CollapsingLeaf>
  );
}
