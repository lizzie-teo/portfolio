"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";
import { useIsDesktop } from "../lib/useIsDesktop";
import {
  DEMO_DISMISS_ID,
  demoPressId,
  useHotspotDemo,
} from "../lib/useHotspotDemo";
import { CollapsingLeaf } from "./CollapsingLeaf";
import { MaskReveal } from "./MaskReveal";
import { MotionReveal } from "./MotionReveal";
import { TouchRing } from "./TouchRing";
import {
  anchorScrollOffset,
  sectionContentGap,
  sectionHeading,
  sectionLede,
  subsectionHeading,
} from "./Chapter";

/**
 * Marks a capture as one state of a before-and-after comparison. The whole
 * point of the field is that WHICH STATE THIS IS is carried in words, as real
 * DOM text, on both the desktop stage and the mobile gallery — never by a
 * colour, a position in a row, or a reading order the reader has to infer. The
 * two states of a pair sit at the same width (see the `w-[46%]` pair path), so
 * equal width on equal-width captures is equal zoom and the comparison is fair;
 * the label is what says which is which.
 */
export type CaptureState = {
  /**
   * The word above the rule. "Before" and "After" on a shipped pair; on a
   * single-state exhibit it names the present ("Today"), because there is no
   * "after" for it to precede.
   */
  label: string;
  /** Six words at most: what this state is, so the frame reads on its own. */
  summary?: string;
  /**
   * Marks the SHIPPED state, and takes the one accent rule in the pair. A solo
   * exhibit must never set it: the accent means "and here is what shipped", so
   * spending it on a recommendation that has not shipped would claim delivered
   * work. The honest answer to a missing "after" is no second frame and no
   * accent, not an invented mock.
   */
  shipped?: boolean;
};

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
  /**
   * Marks this capture as one state of a before-and-after comparison, and draws
   * the state caption above it: the word, a rule, and a one line summary (see
   * StateCaption). Additive — a capture without it renders exactly as it always
   * has, so the decisions and usability bands are untouched.
   *
   * It reaches BOTH branches deliberately. A comparison whose states are only
   * told apart on one screen size is not a comparison, and on the mobile
   * gallery, where the pair is paged rather than set side by side, the label is
   * the only thing that says which frame is on the phone right now.
   */
  state?: CaptureState;
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
  /**
   * Position in the auto-demo loop, 1-based. Omit to leave a hotspot
   * reader-only — the demo never touches it.
   *
   * A feature's demo sequence is its hotspots that carry a `demoStep`, sorted
   * ascending, so the scope is authored per user flow rather than switched on
   * globally: number only the `popupImage` hotspots for a loop of explainers, or
   * number the `goToImage` ones too for a full walk through the prototype. A
   * feature with none behaves exactly as it does today. See useHotspotDemo for
   * the sequencer, the gating, and the reader-handover rules.
   */
  demoStep?: number;
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
  /**
   * The card body — each entry renders as its own paragraph. Nodes, not plain
   * strings, so a paragraph can carry inline emphasis: the usability findings
   * bold the load-bearing phrase of a claim and lead each evidence paragraph
   * with a bold verdict ("Too wordy. Three services, each with…"). Keep the
   * markup inline-level — this is one `<p>`, not a slot for blocks.
   */
  body: ReactNode[];
  /**
   * Optional qualifier at the foot of the body: what the frames do not show,
   * stated plainly, so a reader who measures the live pages finds the framing
   * already admitted. It is a separate field rather than a last `body` entry
   * because it is not another beat of the argument — it steps down in ink and
   * size to a figure-legend tone, which a body paragraph cannot do without the
   * page data reaching in and setting its own colours.
   */
  footnote?: ReactNode;
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
   *
   * The tone reaches the below-lg branch too, via `MOBILE_SKIN` — that stack was
   * dark-only until the usability findings needed a light band, and its ink,
   * control pill, focus offsets, and frameless lift all follow the tone now. The
   * phone frame itself deliberately does not (see MobileSkin).
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

/**
 * The band's tone-dependent classes, in one place.
 *
 * The mobile linear stack and its gallery were authored for the dark decisions
 * band and hardcoded the light-on-leaf tokens, so a `tone="light"` band (the
 * usability findings) rendered white ink on a mint surface. Every class that
 * has to answer to the band now resolves here and is threaded down as a
 * `skin`, so the two tones can never drift apart by half a component.
 *
 * Named for the branch it was written for, but no longer confined to it: the
 * lift under a frameless capture (`frameless`), the state caption on a
 * comparison frame, and the body footnote are drawn on BOTH branches and read
 * their classes here, because a treatment that differed between the two
 * branches of the same band would be a bug, not a design.
 *
 * The device is deliberately NOT toned. A phone bezel is a physical object, not
 * a surface of the page: it stays the deep `bg-grout` shell with the same
 * screen radius and scroll cue on both bands, so the two galleries read as the
 * same handset photographed on two backgrounds. Only what the band actually
 * touches switches — ink, the control pill, focus-ring offsets, and the lift
 * under a frameless capture.
 */
type MobileSkin = {
  /** Feature title ink. */
  heading: string;
  /** Body paragraph ink. */
  body: string;
  /** Per-slide caption ink (FeatureScreenshot.note). */
  note: string;
  /** The rounded control pill holding the arrows and dots. */
  controlBar: string;
  /** Prev / next arrow buttons. */
  control: string;
  /** The dot button's focus ring (its offset colour follows the pill). */
  dotButton: string;
  /** Active and idle dot fills. */
  dotActive: string;
  dotIdle: string;
  /** The bezel's :has() focus ring, offset onto the band behind it. */
  bezelRing: string;
  /** Lift under a capture shown without a device frame. */
  frameless: string;
  /** The "Before" / "After" word above a comparison frame (CaptureState). */
  stateLabel: string;
  /** Its one line summary, a step quieter than the word above it. */
  stateSummary: string;
  /**
   * The rule under an unshipped state: the band's own hairline, carrying no
   * accent. A shipped state takes `stateRuleShipped` instead.
   */
  stateRuleIdle: string;
  /**
   * The rule under the SHIPPED state — the one accent in a pair. It reuses each
   * tone's established "this is the current one" accent rather than hardcoding
   * `--primary`, because `--primary` is set for the light reading surface: at
   * healthdirect's #007f78 on the #183947 leaf it lands at 2.5:1 and fails the
   * 3:1 bar a non-text indicator has to clear. The dark band's coral
   * (`--rail-tile-active`, the same accent its active carousel dot uses) reads
   * at 4.2:1 there. Colour is never the only signal in either case — the word
   * above the rule says which state this is.
   */
  stateRuleShipped: string;
  /** The body footnote: figure-legend tone, below the body ink. */
  footnote: string;
};

const CONTROL_BASE =
  "flex min-h-11 min-w-11 items-center justify-center rounded-full border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40";
const DOT_BASE =
  "flex min-h-11 min-w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const MOBILE_SKIN: Record<"light" | "dark", MobileSkin> = {
  // The decisions band: light ink on the leaf, coral for the active dot, the
  // hero's soft shadow (a black `shadow-card` all but vanishes on the leaf).
  dark: {
    heading: "text-leaf-foreground",
    body: "text-leaf-foreground/85",
    note: "text-leaf-foreground/70",
    controlBar: "border-rail-tile-border bg-grout shadow-sc-hero",
    control: cn(
      CONTROL_BASE,
      "border-rail-tile-border bg-transparent text-leaf-foreground hover:bg-rail-tile-hover focus-visible:ring-leaf-foreground focus-visible:ring-offset-grout"
    ),
    dotButton: cn(
      DOT_BASE,
      "focus-visible:ring-leaf-foreground focus-visible:ring-offset-grout"
    ),
    dotActive: "bg-rail-tile-active",
    dotIdle: "bg-leaf-foreground/25",
    bezelRing:
      "has-[:focus-visible]:ring-leaf-foreground has-[:focus-visible]:ring-offset-leaf",
    // No hairline: these captures are white product UI on the deep leaf, so
    // luminance already closes their edge and a light border would ring them.
    frameless: "shadow-sc-hero",
    // 80% white on the leaf is 9.4:1 — the state word is load-bearing (it is
    // what tells Before from After), so it sits a step brighter than the note
    // ink beneath it rather than joining the quiet metadata.
    stateLabel: "text-leaf-foreground/80",
    stateSummary: "text-leaf-foreground/70",
    stateRuleIdle: "bg-leaf-foreground/30",
    stateRuleShipped: "bg-rail-tile-active",
    footnote: "text-leaf-foreground/65",
  },
  // The findings band: the reading tokens, borrowing ExhibitCarousel's light
  // control pill so the two evidence galleries in this chapter page with the
  // same controls. A frameless capture takes a hairline as well as the shadow —
  // some of these crops are themselves mint panels sitting on the mint band,
  // and a shadow alone leaves them edgeless.
  light: {
    heading: "text-foreground",
    body: "text-muted-foreground",
    note: "text-muted-foreground",
    controlBar: "border-primary/15 bg-card shadow-card",
    control: cn(
      CONTROL_BASE,
      "border-primary/40 bg-card text-primary hover:border-primary/70 hover:bg-primary/10 active:bg-primary/20 focus-visible:ring-focus focus-visible:ring-offset-card"
    ),
    dotButton: cn(
      DOT_BASE,
      "focus-visible:ring-focus focus-visible:ring-offset-card"
    ),
    dotActive: "bg-primary",
    dotIdle: "bg-primary/25",
    bezelRing:
      "has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-secondary",
    frameless: "border border-border shadow-card",
    // On the light band the reading tokens already carry the §3 caption role,
    // and `--primary` is the accent this surface was tuned for.
    stateLabel: "text-foreground",
    stateSummary: "text-muted-foreground",
    stateRuleIdle: "bg-border",
    stateRuleShipped: "bg-primary",
    footnote: "text-muted-foreground",
  },
};

/**
 * The state marker over a comparison frame: the word, a rule, and a one line
 * summary. Drawn by BOTH branches from the same component, so "Before" looks
 * and reads the same whether the pair is set side by side on the desktop stage
 * or paged through one phone below `lg`.
 *
 * Above the frame, not below it, and that is the load-bearing placement
 * decision: the desktop stage top-loads its captures and hard-clips whatever
 * runs past the band's bottom edge, so anything under an image is the first
 * thing lost. A label the reader cannot see is worse than no comparison at all.
 *
 * The word is the §3 caption/kicker eyebrow, not `minorHeading`. In the tiled
 * exhibit this content came from (`ResolvedFindings`) it was a genuine `h4`,
 * because an `h3` named the pair directly above it. Here nothing does: the
 * exhibit is titled by a chip, which is a button, and the desktop stage sits
 * ABOVE the chip list in the DOM. An `h4` there would follow the section's `h2`
 * with no `h3` between them and break the §12 outline. It is a caption by role
 * now, so it takes the caption treatment — which §12 asks for explicitly when a
 * label is not really titling a block.
 *
 * The rule is the second signal, never the first: `stateRuleShipped` marks the
 * state that shipped, `stateRuleIdle` everything else, and a solo exhibit takes
 * the idle rule on its only frame. Colour alone never says which is which.
 */
function StateCaption({
  state,
  skin,
  as: Tag = "div",
  className,
  reserveSummary = false,
}: {
  state: CaptureState;
  skin: MobileSkin;
  /**
   * `figcaption` on the desktop stage, where the caption sits inside the
   * capture's own `<figure>`; the default `div` on the mobile gallery, where the
   * phone is a persistent frame the slides page through rather than a figure per
   * capture, and a stray figcaption would have no figure to caption.
   */
  as?: "figcaption" | "div";
  className?: string;
  /**
   * Draw the summary line even where this state has none, so a gallery that
   * mixes captioned and uncaptioned captures keeps one caption height and the
   * frame below it never jumps as slides page.
   */
  reserveSummary?: boolean;
}) {
  return (
    <Tag className={cn("mb-3", className)}>
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-[0.18em]",
          skin.stateLabel
        )}
      >
        {state.label}
      </p>
      {/* A fixed 2px track holds both frames' captions on one baseline while
          the lines themselves differ in weight. */}
      <span aria-hidden="true" className="mt-2 block h-0.5">
        <span
          className={cn(
            "block w-full rounded-full",
            state.shipped
              ? cn("h-0.5", skin.stateRuleShipped)
              : cn("h-px", skin.stateRuleIdle)
          )}
        />
      </span>
      {state.summary || reserveSummary ? (
        // min-h reserves one line on every frame of a pair, so two summaries of
        // different length still start their captures' images on the same line.
        <p
          className={cn(
            "mt-2 min-h-[1lh] text-xs leading-relaxed",
            skin.stateSummary
          )}
        >
          {state.summary}
        </p>
      ) : null}
    </Tag>
  );
}

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
  const skin = MOBILE_SKIN[dark ? "dark" : "light"];
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
    // Explicit fixed width wins; applied inline on the figure (below). Checked
    // before count === 1 because a lone capture can be a pinned phone shot
    // (Accessible) as well as a full-stage composite — w-full would blow a
    // portrait phone up to the whole stage.
    if (image.displayWidth) return "";
    // A comparison capture always takes the pair track, and never a fixed pixel
    // width. Two reasons, and they are the same reason twice:
    //  - A pair must FIT. Two pinned 300px captures plus their gap overflow the
    //    stage at lg, so the "after" is pushed off the edge and has to be swiped
    //    to. A comparison you have to swipe to complete is not a comparison; the
    //    percentage track fits at every width the stage mounts at.
    //  - A solo comparison keeps the same track rather than filling the stage.
    //    Equal width is equal zoom, which is what makes the exhibit fair, and it
    //    would be odd for the one unshipped recommendation to be the biggest
    //    picture in the section purely because nothing shipped beside it.
    // Guarded at two, which is what a before-and-after is; a longer group of
    // states would fall through to the sizing paths below.
    if (image.state && count <= 2) return "w-[46%]";
    if (count === 1) return "w-full";
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
    if (image.displayWidth) return `${image.displayWidth}px`;
    // Matches the pair track above, solo or paired — the stage only mounts from
    // lg, so the pair sizing is the only hint that ever applies.
    if (image.state && count <= 2)
      return "(min-width: 1024px) 28vw, (min-width: 768px) 34vw, 44vw";
    if (count === 1) return "(min-width: 1024px) 60vw, 92vw";
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
            {/* The word slip, like every other top-level section title on a
                case-study page — this band is a section in the stack, not a
                sub-part of one, and it is the gesture that marks a heading as a
                heading (see ArtifactSection). The lede trails it on the
                standard fade-up. */}
            {heading ? (
              <MaskReveal
                as="h2"
                mode="word"
                duration="fast"
                id={`${reactId}-heading`}
                className={cn(sectionHeading, dark && "text-leaf-foreground")}
                text={heading}
              />
            ) : null}
            {lede ? (
              <MotionReveal delay={0.05}>
                <p className={cn(sectionLede, dark && "text-leaf-foreground")}>
                  {lede}
                </p>
              </MotionReveal>
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
                        {/* The state marker on a comparison capture, above the
                            frame it names. Above, because this stage top-loads
                            its captures and hard-clips whatever runs past the
                            band's bottom edge: anything set under an image here
                            is the first thing lost, and a label the reader
                            cannot see is worse than no comparison at all. */}
                        {image.state ? (
                          <StateCaption
                            as="figcaption"
                            state={image.state}
                            skin={skin}
                          />
                        ) : null}
                        {/* Shadow, hairline, and radius on the same element so
                            the lift follows the rounded-xs screenshot with no
                            square halo (CLAUDE.md screenshot carve-out). On the
                            dark leaf the black shadow-card all but vanishes, so
                            the captures lift on the hero's soft shadow-sc-hero
                            and separate from the leaf by luminance, exactly as
                            the hero does. On the light band the shadow is real
                            but not always enough: a capture can be a mint panel
                            on the mint band (the Service Finder crop), so the
                            hairline is what closes its edge. Same treatment as
                            the mobile branch's frameless slide. */}
                        <div
                          className={cn(
                            "w-full overflow-hidden rounded-xs",
                            skin.frameless
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
                        {/* The qualifier, a step down in size and ink from the
                            argument it closes — a figure legend, not another
                            beat of the claim. */}
                        {feature.footnote ? (
                          <p
                            className={cn(
                              "mt-4 text-xs leading-relaxed",
                              skin.footnote
                            )}
                          >
                            {feature.footnote}
                          </p>
                        ) : null}
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
              <MobileFeatureSection
                key={feature.id}
                feature={feature}
                skin={skin}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

type MobileFeatureSectionProps = {
  feature: Feature;
  skin: MobileSkin;
};

// One feature, stacked for reading: the label as an h3 (these features carry
// no separate `heading`, so the label is the subsection title), the body
// paragraphs at the accordion's card measure, then the swipe gallery.
function MobileFeatureSection({ feature, skin }: MobileFeatureSectionProps) {
  const title = feature.heading ?? feature.label;
  return (
    <div>
      <h3 className={cn(subsectionHeading, skin.heading)}>{title}</h3>
      {feature.body.map((paragraph, index) => (
        <p
          key={index}
          className={cn("mt-3 max-w-prose text-sm leading-relaxed", skin.body)}
        >
          {paragraph}
        </p>
      ))}
      {feature.footnote ? (
        <p
          className={cn(
            "mt-4 max-w-prose text-xs leading-relaxed",
            skin.footnote
          )}
        >
          {feature.footnote}
        </p>
      ) : null}
      <MobileGallery
        images={feature.images}
        hotspots={feature.hotspots}
        galleryLabel={title}
        skin={skin}
      />
    </div>
  );
}

// A hotspot resolved for a single primary screen: its placement plus the actual
// popup screenshot it opens, so PhoneFrame never re-reads the images array.
// A hotspot with its target capture resolved. `popup` is present only for the
// popupImage kind — goToImage hotspots page the carousel and open nothing.
type ResolvedHotspot = Hotspot & { popup?: FeatureScreenshot };

// Module-level so a feature with no auto-demo hands the sequencer the SAME empty
// array on every render rather than a fresh one — the hook holds this list for
// the life of a loop.
const EMPTY_DEMO_STEPS: ResolvedHotspot[] = [];

type MobileGalleryProps = {
  images: FeatureScreenshot[];
  hotspots?: Hotspot[];
  galleryLabel: string;
  skin: MobileSkin;
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
function MobileGallery({
  images,
  hotspots,
  galleryLabel,
  skin,
}: MobileGalleryProps) {
  const shouldReduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  // The gallery root, handed to the demo as both its in-view gate and the
  // surface it listens on for the reader taking over.
  const galleryRef = useRef<HTMLElement | null>(null);
  // True only while the auto-demo is driving. It exists to silence the stage's
  // live region: the demo changes slides and opens popups on its own, and a
  // screen reader being told about each of those is noise the reader did not
  // ask for. The instant the reader takes over, announcements come back.
  const [demoActive, setDemoActive] = useState(false);

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

  // The auto-demo sequence: the feature's hotspots that opted in, in step order,
  // each carrying its popup capture like any other resolved hotspot. Memoised on
  // the authored arrays (module constants, so stable) because the sequencer
  // holds this list for the life of a loop — rebuilding it every render would
  // hand the running loop a new array on every ring frame.
  const demoSteps: ResolvedHotspot[] = useMemo(
    () =>
      (hotspots ?? [])
        .filter((hotspot) => hotspot.demoStep !== undefined)
        .sort((a, b) => (a.demoStep ?? 0) - (b.demoStep ?? 0))
        .map((hotspot) => ({
          ...hotspot,
          popup:
            hotspot.popupImage !== undefined
              ? images[hotspot.popupImage]
              : undefined,
        })),
    [hotspots, images]
  );

  return (
    <section
      ref={galleryRef}
      aria-roledescription="carousel"
      aria-label={`${galleryLabel} designs`}
      onKeyDown={handleKeyDown}
      className="mt-6"
    >
      {/* The stage floor, and the reason the control bar below never moves as
          you page. It matches the framed phone's own height (its `h-[60svh]
          max-h-[32rem]` screen plus the bezel's 8px inset on each edge), so a
          gallery that mixes a tall framed screen with a short frameless
          fragment — the usability findings page a whole screen, then a 2.3:1
          banner crop — keeps one box for every slide instead of collapsing by
          200px and dragging the arrows up with it. Short slides centre in the
          box; taller captures grow past it to their natural height. */}
      <div
        aria-live={demoActive ? "off" : "polite"}
        aria-atomic="true"
        className="flex min-h-[min(60svh,33rem)] flex-col justify-center"
      >
        {/* Which state is on the phone right now. Here the pair is paged rather
            than set side by side, so this label is the ONLY thing saying which
            frame you are looking at — it is inside the live region so paging
            announces the state with the slide. The row is drawn on every slide
            of a gallery that uses states, so the phone below never shifts as
            you page between a captioned frame and an uncaptioned one. */}
        {images.some((image) => image.state) ? (
          <StateCaption
            state={current.state ?? { label: "" }}
            skin={skin}
            reserveSummary
            className="mx-auto w-full max-w-[19rem] px-2"
          />
        ) : null}
        {allMobile ? (
          // Persistent-phone model: the bezel, screen, fixed screen height, and
          // scroll cue stay put while the carousel pages the SCREEN CONTENT
          // inside the device (like flipping frames of a Figma prototype on one
          // handset). The slide swap lives inside PersistentPhoneFrame, so the
          // phone never crossfades or resizes as you page.
          <PersistentPhoneFrame
            image={current}
            imageIndex={currentSlide.imageIndex}
            hotspots={currentHotspots}
            demoSteps={demoSteps}
            galleryRef={galleryRef}
            onDemoActiveChange={setDemoActive}
            onNavigate={navigateToImage}
            onDismissSlide={dismissSlide}
            direction={direction}
            slideVariants={slideVariants}
            shouldReduce={shouldReduce}
            skin={skin}
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
                  skin={skin}
                />
              ) : (
                <div
                  className={cn(
                    "mx-auto w-full overflow-hidden rounded-xs",
                    skin.frameless
                  )}
                >
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
          <p
            className={cn(
              "mx-auto mt-3 min-h-[3lh] max-w-[19rem] px-2 text-left text-xs leading-relaxed",
              skin.note
            )}
          >
            {current.note}
          </p>
        ) : null}
      </div>

      {multi ? (
        <div className="mt-4 flex justify-center">
          <div
            className={cn(
              "flex max-w-full items-center gap-2 rounded-full border p-1.5",
              skin.controlBar
            )}
          >
            <button
              type="button"
              aria-label="Previous design"
              disabled={atStart}
              onClick={() => goTo(index - 1, -1)}
              className={skin.control}
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
                      className={skin.dotButton}
                    >
                      <span
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          isActive
                            ? `w-5 ${skin.dotActive}`
                            : `w-1.5 ${skin.dotIdle}`
                        )}
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
              className={skin.control}
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
  skin: MobileSkin;
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
// (nothing drawn over the clean capture), then a soft GLOW of the case study's
// brand action green (--primary #007f78) on hover, press, and keyboard focus.
// The glow IS the cue and doubles as the focus-visible indicator — no ring,
// border, or outline.
//
// A glow rather than a fill. Earlier passes washed the whole box in flat
// primary (/35·/45), which read as a green rectangle stamped on the product
// screenshot — it fought the capture instead of pointing into it, and the
// harder it was pushed for legibility the uglier it got. The bloom does the
// same job by a different route: an inset edge-light hugs the trigger's shape
// and a soft outer halo lifts it off the page, so the underlying UI stays
// readable THROUGH the highlight. The faint tint (/8) only stops the middle of
// a large hotspot reading as a hole. Perceptible over light product captures
// and over the dark grout of a popup, because a halo carries on both where a
// mid-opacity fill washes out on one of them.
//
// Box-shadow and background only: no transform, no position change, nothing
// that moves. So reduced motion still needs no special case.
//
// `data-demo-press` is the auto-demo's finger (useHotspotDemo): it lights the
// same glow at the same strength as a real press, so a hotspot pressed by the
// ring and one pressed by a thumb are indistinguishable. That is the point —
// the demo is showing the reader what their own tap will do, so it must not
// have a private visual language.
// Written out per state rather than composed from a shared fragment: Tailwind
// scans source text, so a variant built by interpolation is a class that never
// gets generated.
const HOTSPOT_AFFORDANCE =
  "bg-transparent shadow-primary/0 outline-none transition-[background-color,box-shadow] duration-200 ease-out " +
  "hover:bg-primary/8 hover:shadow-[0_0_14px_3px,inset_0_0_10px_1px] hover:shadow-primary/40 " +
  "focus-visible:bg-primary/8 focus-visible:shadow-[0_0_14px_3px,inset_0_0_10px_1px] focus-visible:shadow-primary/40 " +
  "active:bg-primary/8 active:shadow-[0_0_14px_3px,inset_0_0_10px_1px] active:shadow-primary/40 " +
  "data-[demo-press=true]:bg-primary/8 data-[demo-press=true]:shadow-[0_0_14px_3px,inset_0_0_10px_1px] data-[demo-press=true]:shadow-primary/40";

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
function PhoneFrame({
  image,
  hotspots = [],
  onNavigate,
  skin,
}: PhoneFrameProps) {
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
          // The bezel itself does not follow the band — a handset is the same
          // object on either tone (see MobileSkin). Only its focus ring, which
          // lands on the band behind the device, is toned.
          "bg-grout p-2 shadow-sc-hero outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2",
          skin.bezelRing,
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
  /** The images index of the current slide, so the demo knows where it is. */
  imageIndex: number;
  hotspots?: ResolvedHotspot[];
  /**
   * The feature's auto-demo sequence in step order (see Hotspot.demoStep).
   * Empty for every feature that has not opted in, which makes the demo inert.
   */
  demoSteps?: ResolvedHotspot[];
  /** The gallery root: the demo's in-view gate and handover surface. */
  galleryRef: RefObject<HTMLElement | null>;
  /** Reports whether the demo is driving, so the stage can silence aria-live. */
  onDemoActiveChange?: (active: boolean) => void;
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
  skin: MobileSkin;
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
  imageIndex,
  hotspots = [],
  demoSteps = EMPTY_DEMO_STEPS,
  galleryRef,
  onDemoActiveChange,
  onNavigate,
  onDismissSlide,
  direction,
  slideVariants,
  shouldReduce,
  skin,
}: PersistentPhoneFrameProps) {
  const [openHotspot, setOpenHotspot] = useState<ResolvedHotspot | null>(null);
  // The trigger element, so focus can return to it precisely on close.
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // Whether the popup currently on screen was opened by the demo rather than by
  // the reader. It decides two things a demo-opened popup must not do: pull
  // focus into itself on open (which would scroll the page to the band and trap
  // Tab around a dialog nobody asked for), and hand focus back to a "trigger"
  // the reader never touched on close.
  const [popupFromDemo, setPopupFromDemo] = useState(false);

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
    if (popupFromDemo) setPopupFromDemo(false);
  }

  const openPopup = (
    hotspot: ResolvedHotspot,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    if (!hotspot.popup) return;
    triggerRef.current = event.currentTarget;
    setPopupFromDemo(false);
    setOpenHotspot(hotspot);
  };

  const closePopup = () => {
    setOpenHotspot(null);
    // Only restore focus to a trigger the reader actually pressed. A demo-opened
    // popup was never focused, and its "trigger" is whatever the reader last
    // touched — sending focus there on close would be a jump out of nowhere.
    if (!popupFromDemo) triggerRef.current?.focus();
    setPopupFromDemo(false);
  };

  // The demo's own open/close: identical state changes, minus focus. Stable
  // identities so the running sequence never sees them change under it.
  const demoOpenPopup = useCallback((hotspot: ResolvedHotspot) => {
    if (!hotspot.popup) return;
    setPopupFromDemo(true);
    setOpenHotspot(hotspot);
  }, []);
  const demoClosePopup = useCallback(() => {
    setOpenHotspot(null);
    setPopupFromDemo(false);
  }, []);
  const demoNavigate = useCallback(
    (target: number) => onNavigate?.(target),
    [onNavigate]
  );

  const demo = useHotspotDemo<ResolvedHotspot>({
    steps: demoSteps,
    imageIndex,
    galleryRef,
    openPopup: demoOpenPopup,
    closePopup: demoClosePopup,
    navigate: demoNavigate,
    shouldReduce,
  });

  useEffect(() => {
    onDemoActiveChange?.(demo.active);
  }, [demo.active, onDemoActiveChange]);

  return (
    // Same device shell as PhoneFrame: small side inset, capped phone-ish width,
    // the focus ring riding the bezel via :has() so it isn't clipped by the
    // screen's overflow.
    <div className="mx-auto w-full max-w-[19rem] px-2">
      <div
        className={cn(
          // The bezel itself does not follow the band — a handset is the same
          // object on either tone (see MobileSkin). Only its focus ring, which
          // lands on the band behind the device, is toned.
          "bg-grout p-2 shadow-sc-hero outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2",
          skin.bezelRing,
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
                ref={demo.setScrollEl}
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
                      demoPressed={demo.pressTarget === demoPressId(hotspot)}
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
              <PhonePopup
                hotspot={openHotspot}
                onClose={closePopup}
                autoFocus={!popupFromDemo}
                demoPressedDismiss={demo.pressTarget === DEMO_DISMISS_ID}
              />
            ) : null}
          </AnimatePresence>

          {/* The auto-demo's finger. Last child and z-20, so it rides above both
              the capture and an open popup — a pointer that hides behind the
              surface it is pressing explains nothing. Clipped by the screen's
              own overflow, so it enters and leaves under the bezel. Null under
              reduced motion, on a feature with no demo, and the moment the
              reader takes over. */}
          <AnimatePresence>
            {demo.ring ? (
              <TouchRing
                x={demo.ring.x}
                y={demo.ring.y}
                from={demo.ring.from}
                pressed={demo.ring.pressed}
                pressKey={demo.ring.pressKey}
              />
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
  /** The auto-demo's finger is on this one right now. */
  demoPressed?: boolean;
};

// The tappable affordance over a trigger element. Invisible at rest — nothing is
// drawn over the screenshot, so the capture reads as a clean product screen. It
// wears the shared HOTSPOT_AFFORDANCE, so the wash, focus behaviour, and the
// popup's close-hotspot all read as one consistent affordance. A popupImage
// hotspot opens the in-frame popup (and announces itself as a dialog trigger);
// a goToImage hotspot pages the carousel instead.
function Hotspot({ hotspot, onOpen, onNavigate, demoPressed }: HotspotProps) {
  return (
    <button
      type="button"
      aria-haspopup={hotspot.goToImage === undefined ? "dialog" : undefined}
      aria-label={hotspot.label}
      data-demo-press={demoPressed ? "true" : undefined}
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
  /**
   * False for a popup the auto-demo opened. A dialog that focuses itself is
   * right when the reader asked for it and wrong when nobody did: it would drag
   * focus (and the page scroll) into a band the reader may be nowhere near, and
   * trap Tab inside it. A demo-opened popup therefore stays visual — no
   * autofocus, no trap — while Escape and both dismiss controls still work, and
   * a reader-opened popup keeps the full dialog behaviour unchanged.
   */
  autoFocus?: boolean;
  /** The auto-demo's finger is on the capture's own "Ok" pill. */
  demoPressedDismiss?: boolean;
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
function PhonePopup({
  hotspot,
  onClose,
  autoFocus = true,
  demoPressedDismiss,
}: PhonePopupProps) {
  const shouldReduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const popup = hotspot.popup;

  useEffect(() => {
    if (autoFocus) closeRef.current?.focus();
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      // The Tab trap belongs to a dialog the reader opened. Trapping an
      // unrequested one would corral keyboard focus inside a popup the reader
      // never asked for — and the first keypress hands the demo over anyway.
      if (!autoFocus) return;
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
  }, [onClose, autoFocus]);

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
              hug the pill; the glow doubles as its focus-visible cue.
              This is the control the auto-demo presses: Ok is the modal's
              primary action, wide and labelled and already under the thumb,
              where the X is the escape hatch in the far corner. */}
          <button
            type="button"
            aria-label="OK"
            onClick={onClose}
            data-demo-press={demoPressedDismiss ? "true" : undefined}
            style={OK_HOTSPOT}
            className={cn("absolute z-[1] rounded-full", HOTSPOT_AFFORDANCE)}
          />
        </div>
      </div>
    </motion.div>
  );
}
