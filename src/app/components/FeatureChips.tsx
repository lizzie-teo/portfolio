"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";
import { useIsDesktop } from "../lib/useIsDesktop";
import { CollapsingLeaf } from "./CollapsingLeaf";
import {
  anchorScrollOffset,
  sectionContentGap,
  sectionHeading,
  sectionLede,
  subsectionHeading,
} from "./Chapter";

export type FeatureScreenshot = {
  src: string;
  alt: string;
  /** Intrinsic pixel dimensions of the asset, so the browser reserves the ratio. */
  width: number;
  height: number;
  /**
   * Which capture this is, so the media stage can size a desktop shot much
   * larger than a mobile one beside it at a fixed 3:1 width ratio (mirroring
   * SymptomsHero's ~73.3% / 23.1% pairing). Desktop captures crop to a
   * landscape showcase frame; mobile captures stay portrait phone screens.
   * Ignored for the single-composite chip, which fills the stage (count === 1).
   */
  device: "desktop" | "mobile";
  /**
   * Optional fixed display width in px for this capture inside the stage,
   * overriding the device-proportion sizing. When any shown capture sets it,
   * the group is laid out in the contained swipe row so a pair that exceeds the
   * stage width centres when it fits and swipes when it doesn't, never clipping
   * on the sides.
   */
  displayWidth?: number;
  /**
   * Optional one-line caption shown under the phone while this capture is the
   * current MOBILE carousel slide. For context the pixels can't carry — e.g.
   * that a Service Finder page opens in a new window in the live product, so
   * the way back here is the carousel arrows, not anything on the screen.
   * Ignored by the desktop path.
   */
  note?: string;
  /**
   * DESKTOP-only curation. When true, this capture is dropped from the desktop
   * media stage but kept in the full mobile gallery. The desktop stage shows a
   * tighter, comparison-friendly subset (a wide stage can't legibly carry a
   * long prototype walk side by side); the mobile carousel still pages every
   * image with its hotspots and notes intact. Every desktop-stage computation
   * (count, mixed, fixedWidth, fitRow, scroll, sizing) reads the filtered list;
   * the mobile branch reads `feature.images` untouched, so this flag never
   * reaches it. Hotspots index the FULL array and are desktop-ignored, so a
   * hidden capture that is also a hotspot target stays reachable on mobile.
   */
  desktopHidden?: boolean;
};

/**
 * A tappable Figma-prototype hotspot on the MOBILE gallery only. It sits over a
 * trigger element on a screen (`onImage`) and comes in two kinds, mirroring the
 * two interaction shapes in the captured product:
 *
 * - `popupImage`: opens that screenshot as an in-frame detail popup over the
 *   current screen (a modal in the product — "Learn more" explainers).
 * - `goToImage`: pages the carousel to that screenshot's slide (a page
 *   navigation in the product — e.g. "Find a clinic" links to Service Finder
 *   results). The reader comes back with the carousel arrows.
 *
 * Coordinates are percentages of the image box: `x`/`y` is the box's top-left
 * corner, `w`/`h` its size. All indices point into the feature's `images` array.
 *
 * The desktop path ignores hotspots entirely. Hotspots are purely ADDITIVE
 * overlays on the mobile gallery: the gallery still shows every image in
 * `images` as a slide, so a capture referenced as a `popupImage` or `goToImage`
 * is allowed to be both a standalone slide AND a hotspot's target.
 */
export type Hotspot = {
  onImage: number;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
} & (
  | { popupImage: number; goToImage?: never }
  | { goToImage: number; popupImage?: never }
);

export type Feature = {
  id: string;
  /** The short pill label and the button's accessible name. */
  label: string;
  /** Optional display line at the top of the expanded card. */
  heading?: string;
  /** The card body — each string renders as its own paragraph. */
  body: string[];
  /** One to three real product screenshots shown for the active feature. */
  images: FeatureScreenshot[];
  /**
   * Optional mobile-only prototype hotspots (see Hotspot). Additive: leaving it
   * undefined keeps a feature's mobile gallery a plain swipe of every image, and
   * the desktop grid never reads this field.
   */
  hotspots?: Hotspot[];
};

export type FeatureChipsProps = {
  features: Feature[];
  /** Anchor target; lands via anchorScrollOffset when the section is jumped to. */
  id?: string;
  /** Optional section heading, rendered with the shared sectionHeading line. */
  heading?: string;
  /** Optional framing sentence beneath the heading, using sectionLede. */
  lede?: string;
  /**
   * Surface treatment for the full-bleed band and its chips.
   *
   * - `"light"` (default): the warm `bg-secondary` band with white reading-tile
   *   pills and cards on light tokens.
   * - `"dark"`: the project's darkest teal band (`bg-grout`), so the showcase
   *   reads as a deep featured plane in SymptomsHero's visual language. Because
   *   the band is now the darkest tone, the layering inverts: closed pills read
   *   as light wireframe tiles on the grout (echoing the case study's own nav
   *   rail tiles), and the open one steps one shade LIGHTER to `bg-leaf` with a
   *   hairline so it still lifts as a distinct card off the darkest band.
   *   Screenshots lift on the hero's soft `shadow-sc-hero` rather than the
   *   near-invisible black `shadow-card`, and all ink switches to light tokens
   *   that clear AA (white on `#10262f` grout is ~16:1).
   */
  tone?: "light" | "dark";
  /**
   * On a case-study page that reserves the wide-desktop rail lane
   * (reserveNavLane), keep the inner content clear of the floating rail while
   * the band still bleeds edge-to-edge.
   */
  reserveNavLane?: boolean;
};

// The 80ms chip→image offset: the panel morph leads, the screenshots answer.
const IMAGE_LEAD = 0.08;

// Morph corner radii, in px, materialised for Motion's layout animation (it
// interpolates numbers, not CSS-var strings, and only scale-corrects a radius
// set inline via `style`). Card = --radius-2xl (0.625rem × 1.8 = 18px); the
// pill stays fully round.
const CARD_RADIUS = 18;
const PILL_RADIUS = 9999;

export function FeatureChips({
  features,
  id,
  heading,
  lede,
  tone = "light",
  reserveNavLane = false,
}: FeatureChipsProps) {
  const shouldReduce = useReducedMotion();
  const reactId = useId();
  const dark = tone === "dark";
  // The desktop stage is a CollapsingLeaf (sticky + useScroll), which cannot be
  // disabled by CSS — so the mobile/desktop split is a JS decision here, not a
  // `lg:` class. Below lg we render a calm linear stack instead (see the branch
  // in the render). Server/first-paint is mobile, corrected after hydration
  // (this section is far below the fold, so the swap is never seen).
  const isDesktop = useIsDesktop();

  const firstId = features[0]?.id ?? null;
  // openId drives the accordion (one open, click-to-collapse). shownId drives
  // the media stage and only ever advances on an expand, so collapsing a chip
  // leaves the last screenshots on the stage rather than emptying it.
  const [openId, setOpenId] = useState<string | null>(firstId);
  const [shownId, setShownId] = useState<string | null>(firstId);

  // Keep the last non-null shown id so the stage never blanks (belt and braces
  // alongside the "only advance on expand" rule below).
  const lastShownRef = useRef<string | null>(shownId);
  useEffect(() => {
    if (shownId) lastShownRef.current = shownId;
  }, [shownId]);

  if (features.length === 0) return null;

  const shown =
    features.find((feature) => feature.id === shownId) ??
    features.find((feature) => feature.id === lastShownRef.current) ??
    features[0];

  const handleToggle = (featureId: string) => {
    const isCollapsing = openId === featureId;
    setOpenId(isCollapsing ? null : featureId);
    // Advance the media stage only on expand.
    if (!isCollapsing) setShownId(featureId);
  };

  const hasIntro = Boolean(heading || lede);
  // Desktop curates a subset; the mobile branch reads shown.images / feature
  // .images untouched. Every desktop-stage computation below (count, mixed,
  // fixedWidth, fitRow, scroll, widthClass, imageSizes) and the desktop render
  // itself run off this filtered list, so hiding a capture on desktop never
  // shifts the mobile gallery, its hotspots, or its notes.
  const desktopImages = shown.images.filter((image) => !image.desktopHidden);
  const count = desktopImages.length;
  // When the active feature mixes a desktop capture with mobile ones, the pair
  // sizes on SymptomsHero's ~73.3% / 23.1% proportion so the desktop shot reads
  // roughly three times the mobile beside it. Two mobiles split evenly.
  const mixed =
    desktopImages.some((image) => image.device === "desktop") &&
    desktopImages.some((image) => image.device === "mobile");
  // One coherent sizing model for every phone capture: it caps at its natural
  // width (a ceiling, so an ultra-wide monitor never upscales a phone shot to
  // mush) and centres when the stage has room; it shrinks to fit when the stage
  // is narrower; and it only falls back to a swipe row where shrinking would
  // breach a legible floor. Two expressions of the same rule:
  //  - A displayWidth pair (Accessible / Guided help) is pinned to its fixed
  //    ceiling and centres, swiping only when even that overflows a narrow
  //    stage — the fixedWidth path below.
  //  - The multi-shot Advice group (the outcome page, its three Learn more
  //    modals, and the Service Finder) can't sit that many fixed shots side by
  //    side, so it flexes: from sm up they all fit as centred columns that
  //    shrink from the 240px ceiling but never grow past it (fitRow); at base
  //    that many columns would be illegible, so it swipes instead.
  const fixedWidth =
    count > 1 && desktopImages.some((image) => image.displayWidth);
  // The 3-or-more group fits its columns without scrolling from sm up; below sm
  // it swipes (see fitRow handling in the media row's classes).
  const fitRow = count >= 3 && !fixedWidth;
  const scroll = fixedWidth;

  // Width of each capture inside the bounded stage. count === 1 fills it (the
  // single composite); a fitting pair takes hero proportions so it never needs
  // to scroll (and so nothing is clipped on the right); the swipe gallery uses
  // fixed bounded-media widths (the §5 media-frame exception).
  const widthClass = (image: FeatureScreenshot) => {
    if (count === 1) return "w-full";
    // Explicit fixed width wins; applied inline on the figure (below).
    if (image.displayWidth) return "";
    if (fitRow) {
      // Four portrait phone shots. Below 2xl the desktop stage isn't wide
      // enough to carry four across legibly once the chip column takes its
      // share (at 1024 / iPad landscape they'd crush to slivers), so the row
      // holds each column at the 240px legible ceiling (w-60) and SWIPES —
      // the same snap affordance the pairs use. From 2xl up the four become
      // centred columns that shrink from that 240px ceiling to fit but never
      // below it, and never grow past it — grow is off (flex-none on the
      // figure) so a wide monitor caps at 240 and centres rather than
      // upscaling. The 240px floor holds legibility flat across the range.
      return "w-60 2xl:shrink 2xl:min-w-0";
    }
    if (scroll) {
      // In a swipe gallery the desktop shot only reads a touch larger than the
      // mobiles beside it — a full 3:1 would let one capture dominate and crop
      // hard at the stage edge. The pairs below keep the full hero proportion.
      return image.device === "desktop"
        ? "w-72 md:w-80 lg:w-[22rem]"
        : "w-44 md:w-48 lg:w-52";
    }
    if (mixed) return image.device === "desktop" ? "w-[73.3%]" : "w-[23.1%]";
    return "w-[46%]";
  };

  // next/image sizes hints matched to the widthClass above.
  const imageSizes = (image: FeatureScreenshot) => {
    if (count === 1) return "(min-width: 1024px) 60vw, 92vw";
    if (image.displayWidth) return `${image.displayWidth}px`;
    if (fitRow) {
      // The stage only mounts from lg up, and columns hold at 240px through the
      // swipe range, shrinking no lower than ~215px once they fit at 2xl.
      return "240px";
    }
    if (scroll) {
      return image.device === "desktop"
        ? "(min-width: 1024px) 352px, (min-width: 768px) 320px, 288px"
        : "(min-width: 1024px) 208px, (min-width: 768px) 192px, 176px";
    }
    if (mixed) {
      return image.device === "desktop"
        ? "(min-width: 1024px) 42vw, (min-width: 768px) 52vw, 68vw"
        : "(min-width: 1024px) 14vw, (min-width: 768px) 17vw, 22vw";
    }
    return "(min-width: 1024px) 28vw, (min-width: 768px) 34vw, 44vw";
  };

  // Media swap. mode="wait": the outgoing group crossfades out, then the
  // incoming screenshots rise into the row with a per-image fade-up stagger —
  // the whole group delayed by the 80ms chip→image offset so the panel morph
  // leads and the media answers. The entrance is vertical, not horizontal, so
  // it never fights the row's own horizontal scroll container. Budget (4
  // images): last image starts at 0.08 + 3×0.05 = 0.23s + 0.2s fast = 0.43s,
  // under the 500ms interactive ceiling.
  const groupVariants: Variants = shouldReduce
    ? {
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: { duration: motionDuration.fast, ease: motionEase.out },
        },
        exit: {
          opacity: 0,
          transition: { duration: motionDuration.fast, ease: motionEase.in },
        },
      }
    : {
        initial: {},
        animate: {
          transition: {
            delayChildren: IMAGE_LEAD,
            staggerChildren: 0.05,
          },
        },
        // Exit is a quiet crossfade — subtler than the entry (attention has
        // already moved to the newly opened chip).
        exit: {
          opacity: 0,
          transition: { duration: motionDuration.fast, ease: motionEase.in },
        },
      };

  // Fade-up per screenshot: opacity plus a short vertical rise, the house
  // default for content blocks. Reduced motion: no transform at all — figures
  // render in place and only the group opacity crossfades.
  const itemVariants: Variants = shouldReduce
    ? { initial: {}, animate: {} }
    : {
        initial: { opacity: 0, y: 12 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: motionDuration.fast, ease: motionEase.out },
        },
      };

  return (
    <section
      id={id}
      aria-labelledby={heading ? `${reactId}-heading` : undefined}
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2",
        // Dark tone floods the chapter-leaf teal (bg-leaf #183947) so the band
        // matches the case study's chapter leaves; light keeps the warm band.
        // White ink on the leaf clears AA at ~12.3:1.
        dark ? "bg-leaf" : "bg-secondary",
        id && anchorScrollOffset
      )}
    >
      {/* Inner wrapper re-establishes the reading column's gutters and
          max-width so chips + media stay aligned with the rest of the page,
          while the band above bleeds to both viewport edges. Vertical padding
          is deliberately tighter than a standard section slab so the tall,
          top-loaded media stage carries the height instead of the well. */}
      <div
        className={cn(
          // Side gutters run tight from lg up so the showcase spans close to
          // the full band; the right lane is handed back to the floating rail
          // via reserveNavLane at xl+ where the rail overlays.
          "mx-auto w-full max-w-[1800px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16",
          // Vertical padding is split, not symmetric. Below lg the layout is one
          // column (media stage above, chips beneath), so the bottom padding
          // correctly spaces below the chips. From lg up the media leaf owns its
          // own column and reaches the band's bottom edge, so any bottom padding
          // shows as a bg-leaf strip below the hard-clipped screenshots — the
          // gutter. Drop it at lg so the captures bleed flush to the band bottom,
          // hero-style, exactly as SymptomsHero clips at its slab's bottom edge.
          "pt-10 pb-10 md:pt-14 md:pb-14 lg:pt-16 lg:pb-0",
          reserveNavLane && "xl:pr-64 2xl:pr-72"
        )}
      >
        {hasIntro ? (
          <div className="max-w-prose">
            {heading ? (
              <h2
                id={`${reactId}-heading`}
                className={cn(sectionHeading, dark && "text-leaf-foreground")}
              >
                {heading}
              </h2>
            ) : null}
            {lede ? (
              <p className={cn(sectionLede, dark && "text-leaf-foreground")}>
                {lede}
              </p>
            ) : null}
          </div>
        ) : null}

        {isDesktop ? (
        <div
          className={cn(
            // Chip column held to a tight reading measure so the media column
            // (1fr) takes the lion's share of the full-bleed band — the point of
            // the band is a closer look at the screenshots, so the media earns
            // the width the chips don't need. Narrowed from 20rem to 17rem to
            // hand the enlarged media stage more room; 17rem still holds the
            // expanded card's two-paragraph body at a comfortable measure.
            "lg:grid lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-10",
            hasIntro && sectionContentGap
          )}
        >
          {/* Media stage — first in DOM so it sits above the chips on mobile
              (they stack beneath it) and in the right grid column on lg. It
              mirrors SymptomsHero: a CollapsingLeaf that opens at 110svh and
              owns the screen on arrival, then collapses scroll-linked onto its
              floor height as the reader scrolls on. Captures are top-aligned and
              bleed off the receding bottom edge, HARD-clipped by overflow-hidden
              — a clean cut, no gradient scrim, exactly as the hero clips its
              screenshots. Reduced motion renders the static floor band (no large
              scroll-linked resize), the same contract the hero and chapter
              leaves follow. */}
          <div className="mb-6 min-w-0 lg:col-start-2 lg:row-start-1 lg:mb-0">
            <CollapsingLeaf
              pinTopPx={0}
              className={cn(
                // The responsive floor height is also the reduced-motion rest
                // height (CollapsingLeaf renders just this className when motion
                // is reduced), so the stage always has a bounded, tuned band to
                // rest in — this is the reviewed showcase composition. It stays
                // well under a viewport so the 110svh open genuinely overshoots
                // and the immersive arrival fires. min-w-0 lets the stage shrink
                // inside the grid so the reserved rail lane can never crop a
                // capture; overflow-hidden contains the bleed and the swipe
                // gallery so the page body never gains a horizontal scrollbar.
                "relative w-full min-w-0 overflow-hidden rounded-xs",
                "h-80 sm:h-[22rem] md:h-[26rem] lg:h-[30rem] xl:h-[34rem]"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  scroll
                    ? "overflow-x-auto overflow-y-hidden"
                    : fitRow
                      ? // Swipe below 2xl; from 2xl the four shrink to fit, so
                        // the stage no longer scrolls.
                        "overflow-x-auto overflow-y-hidden 2xl:overflow-hidden"
                      : "overflow-hidden"
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={shown.id}
                    variants={groupVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className={cn(
                      "flex px-4 pt-6 sm:px-6 md:px-8 md:pt-8 lg:px-10 xl:px-12 2xl:px-16",
                      count === 1
                        ? "h-full w-full items-start justify-center"
                        : fitRow
                          ? cn(
                              // Below 2xl: a scroll-snapped swipe row (four
                              // portrait phones can't sit legibly across a
                              // narrow desktop / iPad-landscape stage), each held
                              // at its 240px ceiling on the same 32px gap the
                              // pairs use — one gap rhythm across the showcase.
                              "mx-auto w-max snap-x snap-mandatory scroll-px-4 items-start gap-8",
                              // From 2xl up the row is full width and the four
                              // shrink to fit, centred.
                              "2xl:w-full 2xl:snap-none 2xl:justify-center"
                            )
                          : scroll
                            ? cn(
                                // A two-shot fixed-width pair centres and sits on
                                // the 32px set gap (gap-8), swiping only when even
                                // that overflows a narrow stage.
                                "mx-auto w-max snap-x snap-mandatory scroll-px-4 items-start",
                                count === 2 ? "gap-8" : "gap-12"
                              )
                            : "w-full items-start justify-center gap-[3.6%]"
                    )}
                  >
                    {desktopImages.map((image) => (
                      <motion.figure
                        key={image.src}
                        variants={itemVariants}
                        className={cn(
                          "m-0 flex-none snap-start",
                          widthClass(image)
                        )}
                        style={
                          image.displayWidth
                            ? { width: image.displayWidth }
                            : undefined
                        }
                      >
                        {/* Shadow and radius on the same element so the soft lift
                            follows the rounded-xs screenshot with no square halo
                            (CLAUDE.md screenshot carve-out). On the dark leaf the
                            black shadow-card all but vanishes, so the captures
                            lift on the hero's soft shadow-sc-hero and separate
                            from the leaf by luminance, exactly as the hero does. */}
                        <div
                          className={cn(
                            "w-full overflow-hidden rounded-xs",
                            dark ? "shadow-sc-hero" : "shadow-card"
                          )}
                        >
                          <Image
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            sizes={imageSizes(image)}
                            // Screenshots carry fine UI text and 1px borders that
                            // default q75 softens; 90 (whitelisted in next.config)
                            // keeps the captures crisp at the swipe-gallery scale.
                            quality={90}
                            className="block h-auto w-full"
                          />
                        </div>
                      </motion.figure>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </CollapsingLeaf>
          </div>

          {/* Chip accordion — a ragged stack of hugging pills; the open one
              morphs into a fixed-width card the full width of this column. On lg
              the column pins in sync with the media leaf and shares its top
              line: the first pill's top and the screenshot's top sit on one
              horizontal rule and stay there through the pin-and-collapse.
              Geometry — both grid items are row-start-1 under items-start, so
              they begin at the same y; the leaf pins at the viewport top (0) and
              its screenshots sit 32px (md:pt-8) below the pinned edge, so the
              chips match by pinning at the same top-0 and carrying an equal
              lg:pt-8 that pushes the first pill 32px below their own pinned
              edge. Equal internal offset + equal pin = coincident tops before,
              during, and after the collapse. (This supersedes the earlier
              top-16 "step below the leaf" balance; alignment wins.) Mobile
              stacks and scrolls normally, so the pt/top only apply from lg. */}
          <ul className="mt-2 flex flex-col items-start gap-3 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:sticky lg:top-0 lg:self-start lg:pt-8">
            {features.map((feature) => {
              const open = openId === feature.id;
              const panelId = `${reactId}-panel-${feature.id}`;
              return (
                <motion.li
                  key={feature.id}
                  layout={!shouldReduce}
                  // Drive radius inline so Motion scale-corrects the corners
                  // through the morph (a className radius swap pinches them).
                  style={{ borderRadius: open ? CARD_RADIUS : PILL_RADIUS }}
                  // Overshoot spring: expand grows past target then settles;
                  // collapse dips below pill size then springs back. Radius is
                  // corrected per-frame, so the corners hold through the bounce.
                  transition={{ layout: motionEase.springMorph }}
                  className={cn(
                    "overflow-hidden border transition-colors",
                    // Dark: the band is now the leaf, so closed pills are light
                    // wireframe tiles on the leaf (echoing this case study's
                    // nav-rail tiles), and the open one steps one shade DARKER to
                    // bg-grout (#10262f, below the #183947 leaf band), keeping the
                    // wireframe hairline plus the soft hero shadow so it still
                    // reads as a distinct inset card. White ink clears AA on both
                    // (leaf 12.3:1, grout higher still).
                    dark
                      ? open
                        ? "border-rail-tile-border bg-grout shadow-sc-hero"
                        : "border-rail-tile-border bg-transparent"
                      : "border-border bg-card shadow-card",
                    open ? "w-full" : "w-fit"
                  )}
                >
                  <motion.button
                    type="button"
                    // Full layout so the header box animates its width in
                    // lockstep with the li; the label and icon below carry
                    // position-only projection so they stay crisp and simply
                    // travel (the plus slides out to the card's right edge).
                    layout={!shouldReduce}
                    transition={{ layout: motionEase.springMorph }}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => handleToggle(feature.id)}
                    className={cn(
                      // Hover fill only on the closed pill — the open header is
                      // a card, clickable to collapse but not a hoverable chip.
                      // Dark uses a light focus ring (the ink ring vanishes on
                      // slate) with no offset so it hugs the tile crisply.
                      "flex w-full items-center justify-between gap-3 text-left outline-none transition-colors focus-visible:ring-2",
                      dark
                        ? "focus-visible:ring-leaf-foreground"
                        : "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                      open
                        ? "px-6 pt-6 md:px-7 md:pt-7"
                        : cn(
                            "min-h-11 px-5",
                            dark ? "hover:bg-rail-tile-hover" : "hover:bg-accent"
                          )
                    )}
                  >
                    <motion.span
                      layout={shouldReduce ? false : "position"}
                      transition={{ layout: motionEase.springMorph }}
                      className={cn(
                        "font-heading text-base font-semibold tracking-[-0.01em]",
                        dark ? "text-leaf-foreground" : "text-foreground"
                      )}
                    >
                      {feature.label}
                    </motion.span>
                    <motion.span
                      aria-hidden="true"
                      layout={shouldReduce ? false : "position"}
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center",
                        dark ? "text-leaf-foreground/70" : "text-muted-foreground"
                      )}
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{
                        rotate: {
                          duration: shouldReduce ? 0.01 : motionDuration.base,
                          ease: motionEase.inOut,
                        },
                        // Position springs with the box so the plus travels on
                        // the same bounce; rotation stays a smooth tween.
                        layout: motionEase.springMorph,
                      }}
                    >
                      <svg
                        viewBox="0 0 20 20"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                      >
                        <line x1="10" y1="4" x2="10" y2="16" />
                        <line x1="4" y1="10" x2="16" y2="10" />
                      </svg>
                    </motion.span>
                  </motion.button>
                  {/* popLayout: on collapse the panel is lifted out of flow so
                      the li reflows to the pill height immediately and the box
                      shrink and the content fade run together, not in sequence.
                      The panel carries no y-translate — the growing box reveals
                      it through overflow-clip, so height and reveal are one
                      coordinated motion instead of two racing ones. */}
                  <AnimatePresence initial={false} mode="popLayout">
                    {open ? (
                      <motion.div
                        key="panel"
                        id={panelId}
                        layout={!shouldReduce}
                        transition={{ layout: motionEase.springMorph }}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          transition: {
                            duration: shouldReduce ? 0.01 : motionDuration.fast,
                            ease: motionEase.out,
                            delay: shouldReduce ? 0 : IMAGE_LEAD,
                          },
                        }}
                        exit={{
                          opacity: 0,
                          transition: {
                            duration: shouldReduce
                              ? 0.01
                              : motionDuration.instant,
                            ease: motionEase.in,
                          },
                        }}
                        className="px-6 pb-6 pt-3 md:px-7 md:pb-7"
                      >
                        {feature.heading ? (
                          <h3
                            className={cn(
                              subsectionHeading,
                              dark && "text-leaf-foreground"
                            )}
                          >
                            {feature.heading}
                          </h3>
                        ) : null}
                        {feature.body.map((paragraph, index) => (
                          <p
                            key={index}
                            className={cn(
                              "text-sm leading-relaxed",
                              // On the grout card white ink reads well past
                              // 13:1; dipped to 85% for editorial softness, AA.
                              dark
                                ? "text-leaf-foreground/85"
                                : "text-muted-foreground",
                              index === 0
                                ? feature.heading
                                  ? "mt-3"
                                  : ""
                                : "mt-3"
                            )}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </div>
        ) : (
          // Mobile (below lg): a calm linear scroll of the four decisions. Each
          // reads top to bottom — heading, body, then a light single-axis swipe
          // gallery of focused top-crops — so no decision hides behind an
          // interaction and no tall screenshot is clipped to an illegible
          // sliver. Replaces the desktop CollapsingLeaf stage + accordion,
          // which have no working small-screen translation.
          <div className={cn("space-y-12", hasIntro && sectionContentGap)}>
            {features.map((feature) => (
              <MobileFeatureSection key={feature.id} feature={feature} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type MobileFeatureSectionProps = {
  feature: Feature;
};

// One decision, stacked for reading: the label as an h3 (these features carry
// no separate `heading`, so the label is the subsection title), the body
// paragraphs at the accordion's dark-card measure, then the swipe gallery.
function MobileFeatureSection({ feature }: MobileFeatureSectionProps) {
  const title = feature.heading ?? feature.label;
  return (
    <div>
      <h3 className={cn(subsectionHeading, "text-leaf-foreground")}>{title}</h3>
      {feature.body.map((paragraph, index) => (
        <p
          key={index}
          className={cn(
            "mt-3 max-w-prose text-sm leading-relaxed text-leaf-foreground/85"
          )}
        >
          {paragraph}
        </p>
      ))}
      <MobileGallery
        images={feature.images}
        hotspots={feature.hotspots}
        galleryLabel={title}
      />
    </div>
  );
}

// A hotspot resolved for a single primary screen: its placement plus the actual
// popup screenshot it opens, so PhoneFrame never re-reads the images array.
// A hotspot with its target capture resolved. `popup` is present only for the
// popupImage kind — goToImage hotspots page the carousel and open nothing.
type ResolvedHotspot = Hotspot & { popup?: FeatureScreenshot };

type MobileGalleryProps = {
  images: FeatureScreenshot[];
  hotspots?: Hotspot[];
  galleryLabel: string;
};

// The mobile design gallery, built to match the usability-findings carousel
// (`FindingsCarousel` in UsabilityFindings.tsx) so the two galleries read as one
// system. A paged, one-slide-at-a-time model (AnimatePresence mode="wait", the
// same crossfade + x-offset `slideVariants`, `slideOffset` 0 under reduced
// motion) with the same rounded-full control pill: prev arrow · dot pills
// (active = wide `w-5`, inactive = small `w-1.5`) · next arrow, arrow-key nav,
// `aria-roledescription="carousel"`, an `aria-live` stage, and an `sr-only`
// list of the slide labels. Restyled for the dark leaf band: the light tokens
// FindingsCarousel uses (bg-card / bg-accent / text-primary) would vanish on
// bg-leaf, so it borrows FeatureChips' dark set (text-leaf-foreground,
// border-rail-tile-border, the grout pill, shadow-sc-hero) and keeps the coral
// rail-tile-active for the active dot, which reads on the band.
//
// Two device models under one control bar. An all-mobile feature keeps a single
// PERSISTENT phone and pages the screen content inside it (PersistentPhoneFrame),
// so the bezel stays put and only the capture swaps. The mixed "momentum"
// feature (a desktop capture beside a mobile one) can't put a desktop shot in a
// phone, so it keeps the per-slide crossfade: each slide is a whole framed
// mobile shot or a frameless desktop shot. The control bar, keyboard paging, and
// a11y are identical for both.
//
// No cropping: each slide shows the WHOLE screenshot at its natural aspect,
// scrolled within the bounded phone screen so nothing is cut off the side. Many
// captures are full-page scrolls up to ~1:14.5, so those screens scroll a long
// way by design — that is what showing the whole screen means here.
// Single-shot features render just the slide — no control bar.
function MobileGallery({ images, hotspots, galleryLabel }: MobileGalleryProps) {
  const shouldReduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Every image is a carousel slide — hotspots are purely additive overlays, so
  // a capture can be both a standalone page AND a hotspot's popup target. Each
  // slide keeps its ORIGINAL images index so hotspots (which reference images by
  // index) can be matched to the primary screen they annotate.
  const slides = images.map((image, imageIndex) => ({ image, imageIndex }));
  const multi = slides.length > 1;
  // An all-mobile feature pages the SCREEN inside one persistent phone (the new
  // model below). A feature that mixes in a desktop capture ("Keeping momentum")
  // keeps the per-slide crossfade — a desktop shot can't live inside a phone.
  const allMobile = images.every((image) => image.device === "mobile");

  const atStart = index === 0;
  const atEnd = index === slides.length - 1;
  const slideOffset = shouldReduce ? 0 : 24;

  const goTo = (next: number, step: number) => {
    if (next < 0 || next > slides.length - 1) return;
    setDirection(step);
    setIndex(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft" && !atStart) {
      event.preventDefault();
      goTo(index - 1, -1);
    } else if (event.key === "ArrowRight" && !atEnd) {
      event.preventDefault();
      goTo(index + 1, 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * slideOffset }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -slideOffset }),
  };

  // Dark restyle of FindingsCarousel's control button: a wireframe tile on the
  // grout pill, light ink, coral-free — the coral is reserved for the dot.
  const controlClassName =
    "flex min-h-11 min-w-11 items-center justify-center rounded-full border border-rail-tile-border bg-transparent text-leaf-foreground outline-none transition-colors hover:bg-rail-tile-hover focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-grout disabled:pointer-events-none disabled:opacity-40";

  const currentSlide = slides[index] ?? slides[0];
  const current = currentSlide.image;
  // Hotspots that annotate the visible primary screen, each carrying its popup
  // capture. Only mobile captures wear a phone frame, so only they show them.
  const currentHotspots: ResolvedHotspot[] = (hotspots ?? [])
    .filter((hotspot) => hotspot.onImage === currentSlide.imageIndex)
    .map((hotspot) => ({
      ...hotspot,
      popup:
        hotspot.popupImage !== undefined
          ? images[hotspot.popupImage]
          : undefined,
    }));
  // goToImage hotspots page the carousel like tapping a link in the product —
  // slide index === images index, so the target image is the target slide.
  const navigateToImage = (imageIndex: number) =>
    goTo(imageIndex, imageIndex > index ? 1 : -1);
  // A slide whose capture is some hotspot's popup target is a modal reached via
  // the arrows as well as via its entry hotspot. On that slide the modal's own
  // dismiss controls (the X and Ok drawn in the capture's pixels) become
  // hotspots that page the carousel back to the primary screen the modal
  // annotates — otherwise those controls are dead pixels and the reader is
  // stranded on the modal slide. Slide index === images index (one slide per
  // image), so the hotspot's onImage is the slide to return to.
  const modalSource = (hotspots ?? []).find(
    (hotspot) => hotspot.popupImage === currentSlide.imageIndex
  );
  const dismissSlide = modalSource
    ? () => goTo(modalSource.onImage, -1)
    : undefined;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`${galleryLabel} designs`}
      onKeyDown={handleKeyDown}
      className="mt-6"
    >
      {/* min-height holds a floor for short slides; tall full-page captures
          grow past it to their natural height. */}
      <div aria-live="polite" aria-atomic="true" className="min-h-64">
        {allMobile ? (
          // Persistent-phone model: the bezel, screen, fixed screen height, and
          // scroll cue stay put while the carousel pages the SCREEN CONTENT
          // inside the device (like flipping frames of a Figma prototype on one
          // handset). The slide swap lives inside PersistentPhoneFrame, so the
          // phone never crossfades or resizes as you page.
          <PersistentPhoneFrame
            image={current}
            hotspots={currentHotspots}
            onNavigate={navigateToImage}
            onDismissSlide={dismissSlide}
            direction={direction}
            slideVariants={slideVariants}
            shouldReduce={shouldReduce}
          />
        ) : (
          // Mixed feature ("Keeping momentum"): its desktop capture can't live in
          // a phone, so each slide still crossfades as a whole — a framed mobile
          // shot or a frameless desktop shot. Radius + shadow on the same clip
          // element so the lift follows the rounded-xs screenshot with no square
          // halo (CLAUDE.md screenshot carve-out).
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={current.src}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: shouldReduce ? 0.01 : motionDuration.base,
                ease: motionEase.out,
              }}
            >
              {current.device === "mobile" ? (
                <PhoneFrame
                  image={current}
                  hotspots={currentHotspots}
                  onNavigate={navigateToImage}
                />
              ) : (
                <div className="mx-auto w-full overflow-hidden rounded-xs shadow-sc-hero">
                  <Image
                    src={current.src}
                    alt={current.alt}
                    width={current.width}
                    height={current.height}
                    sizes="100vw"
                    quality={90}
                    className="block h-auto w-full"
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Per-slide caption for behaviour the capture can't show (see
            FeatureScreenshot.note). Inside the aria-live region, so paging onto
            the slide announces it with the slide itself. The row exists on
            every slide of a gallery that uses notes, reserving three caption
            lines (no note runs longer), so the control bar below never shifts
            as slides page. */}
        {images.some((image) => image.note) ? (
          <p className="mx-auto mt-3 min-h-[3lh] max-w-[19rem] px-2 text-left text-xs leading-relaxed text-leaf-foreground/70">
            {current.note}
          </p>
        ) : null}
      </div>

      {multi ? (
        <div className="mt-4 flex justify-center">
          <div className="flex max-w-full items-center gap-2 rounded-full border border-rail-tile-border bg-grout p-1.5 shadow-sc-hero">
            <button
              type="button"
              aria-label="Previous design"
              disabled={atStart}
              onClick={() => goTo(index - 1, -1)}
              className={controlClassName}
            >
              <ArrowLeftIcon aria-hidden="true" className="size-4" />
            </button>
            <ol className="flex min-w-0 items-center gap-1 overflow-x-auto">
              {slides.map(({ image }, dotIndex) => {
                const isActive = dotIndex === index;
                return (
                  <li key={image.src}>
                    <button
                      type="button"
                      aria-label={image.alt}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() =>
                        goTo(dotIndex, dotIndex > index ? 1 : -1)
                      }
                      className="flex min-h-11 min-w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-leaf-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-grout"
                    >
                      <span
                        className={`h-1.5 rounded-full transition-all ${
                          isActive
                            ? "w-5 bg-rail-tile-active"
                            : "w-1.5 bg-leaf-foreground/25"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
            <button
              type="button"
              aria-label="Next design"
              disabled={atEnd}
              onClick={() => goTo(index + 1, 1)}
              className={controlClassName}
            >
              <ArrowRightIcon aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* The slide labels, as text, for assistive tech. */}
      <ol className="sr-only">
        {slides.map(({ image }) => (
          <li key={image.src}>{image.alt}</li>
        ))}
      </ol>
    </section>
  );
}

type PhoneFrameProps = {
  image: FeatureScreenshot;
  hotspots?: ResolvedHotspot[];
  /** Pages the carousel to an images index — the goToImage hotspot action. */
  onNavigate?: (imageIndex: number) => void;
};

// Keydown inside a bounded screen scroll: arrows scroll the capture and never
// bubble up to page the carousel — paging keys stay scoped to the carousel root
// (its section onKeyDown), so inner-scroll and paging never fight. Native
// focusable-scroll already handles Space / Page / Home / End; the two explicit
// arrow cases keep "arrow keys scroll it" true where a browser defers to the
// ancestor handler. Shared by the primary screen and the popup body.
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

// Device radii — the deliberate frame carve-out (a bezel is not a card). The
// bezel stays soft at rounded-[1.5rem]; the screen clips one standard token
// tighter so the inner corner still reads as a crisp cutout, not a card. The
// earlier half-bezel radius (~0.625rem) read too small once the frame settled,
// so the screen steps up ~40% to rounded-xl. NB: this project remaps --radius to
// 0.625rem, so rounded-xl resolves to 0.875rem (14px) here, not Tailwind's stock
// 0.75rem — it's the standard token nearest the ~0.8rem target. Kept as shared
// constants so the bezel, screen clip, popup clip, and scroll cue never drift.
const BEZEL_RADIUS = "rounded-[1.5rem]";
const SCREEN_RADIUS = "rounded-xl";
const SCREEN_RADIUS_B = "rounded-b-xl";

// Shared tap affordance for every in-frame prototype hotspot: invisible at rest
// (nothing drawn over the clean capture), a translucent wash of the case study's
// brand action green (--primary #007f78) on hover, press, and keyboard focus.
// The fill IS the cue and doubles as the focus-visible indicator — no ring,
// border, or outline. Bumped from the first pass (/25·/30) so the wash is clearly
// perceptible over the light product screenshots. No animation beyond the colour
// transition, so reduced motion needs no special case.
const HOTSPOT_AFFORDANCE =
  "bg-transparent outline-none transition-colors hover:bg-primary/35 focus-visible:bg-primary/45 active:bg-primary/45";

// The modal dismiss bounds, shared by PhonePopup's close controls and the
// carousel's modal-slide dismiss hotspots (PersistentPhoneFrame), so a modal
// dismisses from the same on-screen controls however it was reached.
//
// The close-hotspot sits over the X control in the top-right of every
// healthdirect "More info" / "Learn more" modal capture (mint header). The X
// glyph centres at ~93% across / ~2.9% down in all four popup images; these
// bounds enlarge that to a ~44px touch target that stays within the ~8.2% header
// band. Percentages of the popup image box, same coordinate model as the entry
// hotspots.
const CLOSE_HOTSPOT = { left: "83%", top: "0%", width: "17%", height: "7.5%" };

// The second dismiss affordance: the wide dark "Ok" button pinned to the foot of
// every healthdirect "Learn more" modal capture. The button now runs close to
// edge-to-edge, so the hotspot spans ~x 3–97%, y 92–98% to wrap the widened pill
// as a generous touch target. Same coordinate model as CLOSE_HOTSPOT —
// percentages of the popup image box.
const OK_HOTSPOT = { left: "3%", top: "91.5%", width: "94%", height: "7.5%" };

// A calm editorial device for a single mobile capture: a thin dark bezel on the
// leaf band, the screen clipped to a slightly smaller radius, and the tall
// full-page shot scrolling vertically inside a bounded window — like scrolling a
// Figma prototype. This bounds the section height and tucks each capture's
// footer below the inner scroll instead of trailing it down the page. Minimal by
// intent: no notch, no glare, no home indicator; the portrait proportion, the
// dark bezel token, and the device radius carry the "phone" read on their own.
// The screen is a bounded media frame (§5), its height tuned so the copy above
// and the control bar below still share the mobile viewport, and its inner
// scroll uses overscroll containment so reaching an end hands scrolling back to
// the page rather than trapping it.
//
// With `hotspots`, the frame becomes a lightweight prototype: invisible
// affordances sit over trigger elements on the capture (scrolling WITH it), each
// revealing a green wash on hover/press/focus, and tapping one slides a detail
// popup up over the screen — the popup capture itself. Closing returns to the
// exact same scroll position underneath; the carousel index is never touched.
function PhoneFrame({ image, hotspots = [], onNavigate }: PhoneFrameProps) {
  const [openHotspot, setOpenHotspot] = useState<ResolvedHotspot | null>(null);
  // The trigger element, so focus can return to it precisely on close.
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openPopup = (
    hotspot: ResolvedHotspot,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    if (!hotspot.popup) return;
    triggerRef.current = event.currentTarget;
    setOpenHotspot(hotspot);
  };

  const closePopup = () => {
    setOpenHotspot(null);
    triggerRef.current?.focus();
  };

  return (
    // Small side inset so the bezel reads as a device against the band, and the
    // frame caps at a phone-ish width so it never sprawls on a wide handset. The
    // focus ring rides the bezel via :has() so it isn't clipped by the screen's
    // overflow, landing cleanly on the leaf band behind it.
    <div className="mx-auto w-full max-w-[19rem] px-2">
      <div
        className={cn(
          "bg-grout p-2 shadow-sc-hero outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-leaf-foreground has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-leaf",
          BEZEL_RADIUS
        )}
      >
        <div className={cn("relative overflow-hidden", SCREEN_RADIUS)}>
          <div
            tabIndex={0}
            role="group"
            aria-label={`Scrollable preview: ${image.alt}`}
            onKeyDown={scrollOnArrows}
            className={cn(
              "h-[60svh] max-h-[32rem] overflow-y-auto overscroll-contain outline-none [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              SCREEN_RADIUS
            )}
          >
            {/* Content wrapper is the full natural image height, so hotspot
                percentages resolve against the capture (not the bounded screen)
                and the affordances scroll with it. */}
            <div className="relative">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 420px) 288px, 82vw"
                quality={90}
                className="block h-auto w-full"
              />
              {hotspots.map((hotspot) => (
                <Hotspot
                  key={`${hotspot.onImage}-${hotspot.popupImage ?? hotspot.goToImage}`}
                  hotspot={hotspot}
                  onOpen={openPopup}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
          {/* Quiet scroll cue: a faint fade at the screen foot hinting the
              capture continues under the bezel. Non-interactive, sits above the
              scroll layer, clipped to the screen radius. Hidden while a popup is
              open so it never bleeds over the detail view. */}
          {openHotspot ? null : (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-grout/40",
                SCREEN_RADIUS_B
              )}
            />
          )}

          <AnimatePresence>
            {openHotspot ? (
              <PhonePopup hotspot={openHotspot} onClose={closePopup} />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

type PersistentPhoneFrameProps = {
  image: FeatureScreenshot;
  hotspots?: ResolvedHotspot[];
  /** Pages the carousel to an images index — the goToImage hotspot action. */
  onNavigate?: (imageIndex: number) => void;
  /**
   * Present when the current slide is a modal capture (a hotspot's popup
   * target) browsed to via the arrows: pages the carousel back to the primary
   * screen the modal annotates. Rendered as dismiss hotspots over the modal's
   * own X and Ok controls, so the controls the reader can see actually work.
   */
  onDismissSlide?: () => void;
  direction: number;
  slideVariants: Variants;
  shouldReduce: boolean | null;
};

// The persistent-phone gallery device. Where PhoneFrame is one static screen,
// this keeps ONE device on the band while the carousel pages the screen CONTENT
// inside it — the bezel, screen clip, fixed screen height, scroll cue, and popup
// layer are all persistent; only the current capture and its hotspots swap. The
// swap is the same shared slideVariants (crossfade + x-offset, fade-only under
// reduced motion) keyed to the image src, but it now runs INSIDE the screen and
// is hard-clipped by the screen's overflow, so it reads as paging within the
// phone rather than a moving handset. Each incoming screen is a fresh scroll
// container, so paging resets it to the top; the width-driven 9:20 screen
// viewport keeps the bezel from jumping between slides of differing capture
// height, and fits the popup modal captures (also 9:20) with no scroll. Popups
// still
// open over the persistent screen and close back to the same slide, with the
// focus trap / Escape / restore intact. Used only for all-mobile features — the
// mixed "momentum" feature keeps the per-slide PhoneFrame model.
function PersistentPhoneFrame({
  image,
  hotspots = [],
  onNavigate,
  onDismissSlide,
  direction,
  slideVariants,
  shouldReduce,
}: PersistentPhoneFrameProps) {
  const [openHotspot, setOpenHotspot] = useState<ResolvedHotspot | null>(null);
  // The trigger element, so focus can return to it precisely on close.
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Paging to a new screen dismisses any open popup: the new screen arrives
  // clean at the top, so a popup from the previous slide must not linger. This
  // is the React "adjust state while rendering when a prop changes" pattern
  // (compare against the previous src) rather than an effect, so the reset lands
  // in the same commit as the slide change with no extra pass. Focus restore is
  // reserved for the reader's own close (X / Escape) below.
  const [prevSrc, setPrevSrc] = useState(image.src);
  if (image.src !== prevSrc) {
    setPrevSrc(image.src);
    if (openHotspot) setOpenHotspot(null);
  }

  const openPopup = (
    hotspot: ResolvedHotspot,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    if (!hotspot.popup) return;
    triggerRef.current = event.currentTarget;
    setOpenHotspot(hotspot);
  };

  const closePopup = () => {
    setOpenHotspot(null);
    triggerRef.current?.focus();
  };

  return (
    // Same device shell as PhoneFrame: small side inset, capped phone-ish width,
    // the focus ring riding the bezel via :has() so it isn't clipped by the
    // screen's overflow.
    <div className="mx-auto w-full max-w-[19rem] px-2">
      <div
        className={cn(
          "bg-grout p-2 shadow-sc-hero outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-leaf-foreground has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-leaf",
          BEZEL_RADIUS
        )}
      >
        {/* The screen owns a width-driven 9:20 viewport (360×800 design frame),
            so its height derives from the capped bezel width and stays stable as
            slides page inside it — the bezel never jumps. 9:20 matches the popup
            modal captures exactly (1080×2400 / 1440×3200), so a detail popup
            fills the screen edge to edge with no letterbox or scroll; taller flow
            captures still scroll vertically inside. overflow-hidden clips the
            x-offset swap to the screen so paging reads as WITHIN the phone, not a
            device moving on the band. The aspect ratio is a frame carve-out
            alongside the device radii, not a new spacing token. */}
        <div
          className={cn(
            "relative aspect-[9/20] overflow-hidden",
            SCREEN_RADIUS
          )}
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={image.src}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: shouldReduce ? 0.01 : motionDuration.base,
                ease: motionEase.out,
              }}
              className="h-full"
            >
              {/* Each slide is its own scroll container, so a new screen starts
                  at the top. Content wrapper is the capture's full natural
                  height, so hotspot percentages resolve against the capture and
                  the affordances scroll with it. */}
              <div
                tabIndex={0}
                role="group"
                aria-label={`Scrollable preview: ${image.alt}`}
                onKeyDown={scrollOnArrows}
                className={cn(
                  "h-full overflow-y-auto overscroll-contain outline-none [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  SCREEN_RADIUS
                )}
              >
                <div className="relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 420px) 288px, 82vw"
                    quality={90}
                    className="block h-auto w-full"
                  />
                  {hotspots.map((hotspot) => (
                    <Hotspot
                      key={`${hotspot.onImage}-${hotspot.popupImage ?? hotspot.goToImage}`}
                      hotspot={hotspot}
                      onOpen={openPopup}
                      onNavigate={onNavigate}
                    />
                  ))}
                  {/* Modal slide reached via the arrows: the capture's own X
                      and Ok controls dismiss it by paging back to the primary
                      screen — the same bounds and affordance as PhonePopup's
                      close controls, so the two routes to a modal read
                      identically. */}
                  {onDismissSlide ? (
                    <>
                      <button
                        type="button"
                        aria-label="Close, back to the previous screen"
                        onClick={onDismissSlide}
                        style={CLOSE_HOTSPOT}
                        className={cn(
                          "absolute z-[1] rounded-md",
                          HOTSPOT_AFFORDANCE
                        )}
                      />
                      <button
                        type="button"
                        aria-label="Ok, back to the previous screen"
                        onClick={onDismissSlide}
                        style={OK_HOTSPOT}
                        className={cn(
                          "absolute z-[1] rounded-full",
                          HOTSPOT_AFFORDANCE
                        )}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Scroll cue — persistent at the screen foot, hidden while a popup is
              open so it never bleeds over the detail view. */}
          {openHotspot ? null : (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-grout/40",
                SCREEN_RADIUS_B
              )}
            />
          )}

          <AnimatePresence>
            {openHotspot ? (
              <PhonePopup hotspot={openHotspot} onClose={closePopup} />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

type HotspotProps = {
  hotspot: ResolvedHotspot;
  onOpen: (hotspot: ResolvedHotspot, event: MouseEvent<HTMLButtonElement>) => void;
  onNavigate?: (imageIndex: number) => void;
};

// The tappable affordance over a trigger element. Invisible at rest — nothing is
// drawn over the screenshot, so the capture reads as a clean product screen. It
// wears the shared HOTSPOT_AFFORDANCE, so the wash, focus behaviour, and the
// popup's close-hotspot all read as one consistent affordance. A popupImage
// hotspot opens the in-frame popup (and announces itself as a dialog trigger);
// a goToImage hotspot pages the carousel instead.
function Hotspot({ hotspot, onOpen, onNavigate }: HotspotProps) {
  return (
    <button
      type="button"
      aria-haspopup={hotspot.goToImage === undefined ? "dialog" : undefined}
      aria-label={hotspot.label}
      onClick={(event) => {
        if (hotspot.goToImage !== undefined) onNavigate?.(hotspot.goToImage);
        else onOpen(hotspot, event);
      }}
      style={{
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.w}%`,
        height: `${hotspot.h}%`,
      }}
      className={cn("absolute z-[1] rounded-md", HOTSPOT_AFFORDANCE)}
    />
  );
}

type PhonePopupProps = {
  hotspot: ResolvedHotspot;
  onClose: () => void;
};

// The in-frame detail popup — a Figma-prototype modal that slides up over the
// phone screen and shows the referenced capture. It behaves as a dialog: focus
// moves to the close-hotspot on open, is trapped while open, Escape closes, and
// focus restores to the triggering hotspot on close (handled by the parent). It
// is deliberately NOT the full-screen ArtifactViewer: no body-scroll lock, no
// shared-element morph — a light overlay bounded to the device. The popup body
// scrolls (overscroll-contained) when the capture is taller than the screen.
//
// No chrome dismiss bar: every healthdirect modal capture already carries its
// own close control (the X in the mint header), so the popup places an invisible
// close-hotspot over that X — tapping the control the reader can see dismisses
// the popup, the same in-image affordance as the entry hotspots. The hotspot
// sits inside the scrolling image so it tracks the X, and it is the accessible
// close control: focus lands on it on open, and it carries an aria-label.
function PhonePopup({ hotspot, onClose }: PhonePopupProps) {
  const shouldReduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const popup = hotspot.popup;

  useEffect(() => {
    closeRef.current?.focus();
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "Tab") {
        const focusables = dialog.querySelectorAll<HTMLElement>(
          "button:not([disabled]), [tabindex]:not([tabindex='-1'])"
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Only popupImage hotspots are ever opened (openPopup guards), so this is a
  // type narrowing, not a reachable state.
  if (!popup) return null;

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={hotspot.label}
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduce ? 0.01 : motionDuration.base,
          ease: motionEase.out,
        },
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: shouldReduce ? 0.01 : motionDuration.instant,
          ease: motionEase.in,
        },
      }}
      className={cn("absolute inset-0 z-10 bg-grout", SCREEN_RADIUS)}
    >
      {/* No chrome header — the popup is the modal capture itself, scrolling
          within the screen. The close-hotspot below sits over the capture's own
          X control (top-right of the mint header) and scrolls with it. */}
      <div
        tabIndex={0}
        role="group"
        aria-label={`Scrollable detail: ${popup.alt}`}
        onKeyDown={scrollOnArrows}
        className={cn(
          "h-full overflow-y-auto overscroll-contain outline-none [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          SCREEN_RADIUS
        )}
      >
        {/* Relative wrapper is the capture's full natural height, so the
            close-hotspot percentages resolve against the image and the affordance
            tracks the X as the capture scrolls. */}
        <div className="relative">
          <Image
            src={popup.src}
            alt={popup.alt}
            width={popup.width}
            height={popup.height}
            sizes="(min-width: 420px) 288px, 82vw"
            quality={90}
            className="block h-auto w-full"
          />
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={CLOSE_HOTSPOT}
            className={cn("absolute z-[1] rounded-md", HOTSPOT_AFFORDANCE)}
          />
          {/* Second dismiss control over the modal's own "Ok" button at the
              foot of the capture — same in-image affordance as the X, so a
              reader can close from either control they can see. rounded-full to
              hug the pill; the wash doubles as its focus-visible cue. */}
          <button
            type="button"
            aria-label="OK"
            onClick={onClose}
            style={OK_HOTSPOT}
            className={cn("absolute z-[1] rounded-full", HOTSPOT_AFFORDANCE)}
          />
        </div>
      </div>
    </motion.div>
  );
}
