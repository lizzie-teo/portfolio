import type { ReactNode } from "react";
import Image from "next/image";
import { CollapsingLeaf } from "./CollapsingLeaf";
import { MaskReveal } from "./MaskReveal";
import { MotionReveal } from "./MotionReveal";

type ChapterProps = {
  /** Anchor id — must match the id passed to ChapterMarker. */
  id: string;
  /** Short wayfinding title, shown in the chapter label and ChapterMarker. */
  title: string;
  /**
   * The speakable opening statement — one sentence you would say out loud.
   * It carries the leaf: a reader who only reads the ledes should still get
   * the whole story. Omit only when the chapter title alone can hold the
   * page.
   */
  lede?: string;
  /**
   * Corner rounding for the leaf surface. Defaults to "all" (a standalone
   * rounded leaf); pass "top" when the chapter is grouped into a slab and the
   * leaf caps its top.
   */
  leafCorners?: TileCorners;
  /**
   * Optional decorative plate rendered at the top of the leaf's content stack —
   * a small chapter-opening illustration, the way a printed book opens a
   * chapter with a little engraving before the title. Passing one turns the
   * whole leaf into a printed chapter title page: the composition centres
   * horizontally, a short rule falls beneath the plate, and the chapter
   * eyebrow and heading stack below it, symmetrical like a book's chapter
   * opener. A leaf with no
   * plate keeps the default left-aligned editorial treatment. Purely
   * decorative (mark it aria-hidden at the call site): the lede stays the sole
   * carrier of meaning. It sits in normal flow with the text, so it collapses
   * and re-centres with the rest of the leaf content.
   */
  leafPlate?: ReactNode;
  /**
   * Set when the chapter's first child is a same-tone, full-bleed band — today
   * that means a dark `FeatureChips` showcase (the "Key design decisions"
   * chapter). The rule: a chapter leaf directly followed by such a band squares
   * its *bottom* corners (keeping the standalone top radius) so its lower edge
   * meets the flat band cleanly. The standard grout beneath the leaf is kept, so
   * the leaf and band read as related surfaces with the page's usual gap between
   * them. Leave off for every ordinary chapter whose content is a stack of
   * distinct rounded tiles.
   */
  bandBelow?: boolean;
  children?: ReactNode;
};

/* The grout of the case-study card system: one spacing rhythm between every
   tile on the page, so the page background reads as a continuous grid gap.
   Chapters, tiles inside chapters, and the shell-level stack all use this. */
export const tileGap = "space-y-2 md:space-y-3";

/* Anchor-jump landing offset for every anchored case-study section. Clicking a
   chapter or section link in the rail, dock, or marker lands the section top
   ~1cm below the viewport edge — a small breathing gap above a full leaf rather
   than flush to the top. This is the single source of truth: the shell hero,
   Chapter, ArtifactSection, and every case-study module apply it, and there is
   deliberately no global scroll-padding-top stacking on top of it, so the offset
   resolves to exactly 1cm everywhere. Reuse this on any new case-study section
   that is an anchor target so the whole page family stays consistent. */
export const anchorScrollOffset = "scroll-mt-[1cm]";

/* The "reading page" tile rhythm: horizontal padding matches the standard
   tile, while vertical padding runs noticeably more generous and keeps
   scaling through xl, so a title-led section rests with the top-and-bottom
   margins of a page in a printed document — room above the title and below
   the last line of content. Opt-in per tile (see ArtifactSection `roomy`);
   the shared Tile keeps its own padding unless a caller passes this. */
export const readingTilePadding =
  "px-6 py-10 sm:px-8 sm:py-12 md:px-10 md:py-16 lg:px-12 lg:py-20 xl:py-24";

/* The standard content-tile rhythm: the default internal padding a card tile
   carries. Shared so Tile and ArtifactSection's non-roomy branch reference one
   value instead of each repeating the literal. */
export const tilePadding = "p-6 sm:p-8 md:p-10 lg:p-12";

/* The canonical top-level section heading. Every top-level section title wears
   this one display line, whether the module tiles itself (EngineAudit,
   LandscapeReview, JourneyMap, IaFlow) or renders through ArtifactSection, so
   the look can never drift and no section title falls back to the small
   uppercase eyebrow. That eyebrow style is reserved for captions and kickers,
   never for section titles. */
export const sectionHeading =
  "text-2xl font-semibold tracking-[-0.03em] md:text-3xl lg:text-4xl";

/* The chapter-leaf title — the largest section heading, worn only by a chapter
   opener plate on its dark leaf surface. It is a top-level `h2` like every other
   section, but a chapter opener is a distinct display role and steps up above
   `sectionHeading` in the same family (28 → 52px). Named, not inline, so a leaf
   title can never drift from this one size. */
export const leafHeading =
  "text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-leaf-foreground";

/* A nested subsection heading (ArtifactSection with headingLevel 3, and every
   content-level h3 — persona cards, roadmap items, scorecard titles): a clear
   two steps down from sectionHeading at desktop (h2 36px → h3 24px) so a nested
   heading reads unmistakably below its section, never as a second h2, and never
   reverting to an eyebrow. This is the single content-h3 style — do not size
   nested headings ad hoc; reach for this token. */
export const subsectionHeading =
  "text-lg font-semibold tracking-[-0.03em] md:text-xl lg:text-2xl";

/* A content-level h4 — the deepest heading the case-study outline goes (§12:
   h2 section → h3 subsection → h4, never deeper). It names one part *inside* a
   subsection: the "Before" and "After" states of a comparison exhibit, and any
   future peer at that depth. One step below subsectionHeading at desktop
   (h3 24px → h4 18px) in the same display family, so depth still reads from
   size alone and an h4 never draws level with the h3 above it.

   This is a heading role, not a label role. The small uppercase tracked eyebrow
   (§3) remains the right treatment for a caption or kicker that happens to use
   a heading tag for outline reasons — reach for this token only when the text
   genuinely titles a block of content. */
export const minorHeading =
  "text-base font-semibold tracking-[-0.03em] md:text-lg";

/* The canonical lede that sits directly beneath a sectionHeading /
   subsectionHeading — the sentence or short paragraph that frames the section
   (an ArtifactSection takeaway, or the intro paragraph a self-tiled module
   renders under its own heading, e.g. EngineAudit, LandscapeReview). One
   treatment so the heading→lede pairing never drifts in size, colour, measure,
   or the gap above it: full-strength foreground reading text (§4 — the lede is
   primary reading copy, not muted metadata) at the same body size as the
   case-study cover intro (CaseStudyShell), i.e. text-base with no desktop
   step-up, capped to a reading measure. Apply it to the single element that
   immediately follows the heading — do not add a competing top margin on a
   wrapper. Diagram modules (JourneyMap, IaFlow) are exempt: their heading is
   followed by a legend or persona block, not a lede. See .docs/style-rules.md
   §"Section heading + lede". */
export const sectionLede =
  "mt-3 max-w-prose text-base leading-relaxed text-foreground";

/* The well below a section's heading+lede block, before its artifact or
   content. One shared gap (56px on desktop) so the heading→lede pairing reads
   as finished and the diagram beneath it clearly gets its own attention — a
   deliberate pause, wider than the gaps inside the diagram.
   Shared so it never drifts per module: ArtifactSection and the self-tiled
   diagram modules that carry a lede (EngineAudit, LandscapeReview) all
   reference it. Theme-scale only (§2) — 40/56px land exactly on mt-10/mt-14, so
   never hand-set an arbitrary value here. Out of scope: chapter leaves, and the
   lede-exempt diagram modules (JourneyMap, IaFlow) whose heading is followed by
   a legend/persona rather than a lede. See .docs/style-rules.md
   §"Section heading + lede". */
export const sectionContentGap = "mt-10 md:mt-14";

/* Wider grout between chapter slabs and standalone panels at the page level,
   so each chapter reads as one grouped block with its own cap corners rather
   than a loose stack of equal tiles. Intra-chapter tiles keep the tighter
   tileGap. The gap is a page-level breathing rhythm, so it keeps scaling
   through the desktop breakpoints (a smaller step on mobile, a larger one on
   wide desktop) rather than plateauing at md. */
export const chapterGap =
  "space-y-10 md:space-y-16 lg:space-y-20 xl:space-y-24";

/**
 * Which corners a tile surface rounds. When chapters are grouped into one
 * slab the first panel (the leaf) caps the top, the last section caps the
 * bottom, and everything between is square, so the run reads as a single
 * shape. Standalone tiles outside a chapter stay fully rounded ("all"), which
 * is the default everywhere else on the site. Chapter caps use a larger
 * radius than a standalone tile so the whole slab reads as one bigger shape.
 */
export type TileCorners = "all" | "top" | "bottom" | "none";

export const cornerClasses: Record<TileCorners, string> = {
  all: "rounded-3xl",
  top: "rounded-t-4xl",
  bottom: "rounded-b-4xl",
  none: "",
};

/**
 * The chapter-opening engraving for a leaf title page — the standard art
 * treatment behind Chapter's `leafPlate` slot, so every plate on the site
 * lays out identically. The art must be a white-knockout drawing on
 * transparency (linework only, no background); the plate renders it 96px
 * tall at every breakpoint, at its natural width, capped to the leaf on
 * narrow screens. Height, not width, is the constant: plates run from
 * near-square to wide friezes, and a shared height keeps every chapter
 * opener sitting on one optical band. It stays fixed across breakpoints on
 * purpose — the leaf's air is tuned by the well beneath the eyebrow (see
 * Chapter's headingGap), so the art itself never has to rescale.
 * Decorative only: aria-hidden, empty alt; the chapter lede carries the
 * meaning. Pass the asset's natural pixel dimensions so the browser can
 * reserve the aspect ratio before the image loads.
 */
export function LeafPlate({
  src,
  width,
  height,
  heightClass = "h-24",
}: {
  src: string;
  width: number;
  height: number;
  /**
   * Tailwind height for the rendered plate; the default `h-24` suits the
   * compact, dense openers. Override it for a wide, sparse composition (e.g.
   * a row of separate studies) whose fine linework would otherwise fall to
   * sub-pixel and wash out at `h-24`.
   */
  heightClass?: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      /* unoptimized: plate assets are pre-optimized knockout webps (white
         linework on transparency). Next's lossy re-encode of the srcset
         variants lifts the fully transparent background to alpha ~17,
         printing a faint rectangle around the drawing. Serving the clean
         alpha directly keeps the knockout crisp — the §6 "unless a technical
         constraint requires otherwise" exception. */
      unoptimized
      className={`${heightClass} w-auto max-w-full select-none object-contain`}
    />
  );
}

/**
 * A narrative chapter in the tiled card system (after Raw Materials' Volta
 * case study). It opens on its leaf — a dark rounded tile in the project's
 * leaf tokens holding only the chapter title and its lede, the card-system
 * version of a book chapter's divider page. The leaf opens at full viewport
 * height and collapses to its natural title+lede height as the reader scrolls
 * onto it (see CollapsingLeaf); it is followed by the chapter's content as a
 * stack of rounded tiles separated by grout, each child either wrapped in
 * `Tile` or rendering the same tile recipe itself (EngineAudit, IaFlow,
 * ArtifactSection, …). Native scroll only — the collapse is scroll-linked, not
 * a snap. Scrolling in or jumping to a chapter anchor both land the reader on
 * a full leaf.
 */
export function Chapter({
  id,
  title,
  lede,
  leafCorners = "all",
  leafPlate,
  bandBelow = false,
  children,
}: ChapterProps) {
  // With a plate the leaf reads top to bottom like a book chapter opening, so
  // the reveals cascade plate → eyebrow → lede. Without one the eyebrow leads,
  // so its timing is unchanged for every other chapter.
  const hasPlate = Boolean(leafPlate);
  const eyebrowDelay = hasPlate ? 0.05 : 0;
  const ledeDelay = hasPlate ? 0.1 : 0.05;

  // A plate turns the leaf into a printed chapter title page: centre the stack
  // horizontally and drop a short rule under the illustration. Text-only
  // leaves keep the editorial left alignment (their longer ledes should not be
  // centred). Both start from the top of the leaf, on the same vertical rhythm
  // as readingTilePadding, so a chapter opening and a section heading land at
  // the same y — only the leaf's bottom edge recedes as it collapses.
  const leafAlign = hasPlate
    ? "items-center text-center"
    : "";
  const headingMeasure = hasPlate ? "max-w-[22ch]" : "max-w-[26ch]";
  // The well between the eyebrow and the lede: the title page's one piece of
  // air, holding the lede away from the engraving at the head of the leaf the
  // way a printed title page sets its title down the page rather than stacking
  // everything under the headpiece.
  //
  // It is a budget, not a proportion of the plate, and it gets spent twice —
  // which is why it stays modest. Every px lands in the leaf's *collapsed*
  // height, because CollapsingLeaf rests on natural content height: air here
  // permanently inflates the chapter divider the reader scrolls past, and a
  // divider that grows toward a full screen stops reading as a divider. Every px
  // also pushes the lede down the opening screen, and carrying the lede is the
  // leaf's whole job.
  //
  // The ramp is by width but the ceiling is vertical: the stack (padding, plate,
  // rule, eyebrow, well, lede) has to clear the fold, and past 110svh
  // CollapsingLeaf's floor wins and the collapse stops happening at all. Mobile
  // takes the smallest step because it pays the most — a multi-line lede at 320px
  // is already most of the screen.
  const headingGap = hasPlate ? "mt-6 md:mt-20 lg:mt-28" : "mt-5";
  // The book rule: a centred hairline in the leaf's own ink, sitting between
  // the plate and the chapter eyebrow. It lives with the eyebrow inside a
  // fit-content wrapper so its length always matches the eyebrow text.
  // Only meaningful with a plate.
  const rule = hasPlate ? (
    <div className="mb-6 h-px w-full bg-leaf-foreground/40" />
  ) : null;
  const eyebrowWrap = hasPlate ? "mx-auto w-fit" : "";

  // A leaf that sits above a same-tone band squares its bottom (keeping the
  // standalone top radius) so its lower edge meets the flat band cleanly; the
  // standard grout beneath the leaf stays, so the two read as related surfaces
  // with the page's usual breathing gap between them. See `bandBelow`.
  const leafCornerClass = bandBelow ? "rounded-t-3xl" : cornerClasses[leafCorners];

  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`${anchorScrollOffset} ${tileGap}`}
    >
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-start ${leafAlign} ${leafCornerClass} bg-leaf px-5 py-10 sm:px-8 sm:py-12 md:px-12 md:py-16 lg:px-16 lg:py-20 xl:py-24`}
        staticClassName="min-h-[100svh]"
      >
        {hasPlate ? (
          <MotionReveal>
            {/* flex justify-center, not text-center: the plate is a block-level
                image, so text alignment can't centre it. It must self-centre
                here because CollapsingLeaf wraps the leaf content in an inner
                motion wrapper under live motion — the leaf's own items-center
                then only centres that wrapper, not the plate inside it. */}
            <div className="mb-6 flex justify-center sm:mb-8">{leafPlate}</div>
          </MotionReveal>
        ) : null}
        {lede ? (
          <>
            <MotionReveal delay={eyebrowDelay}>
              <div className={eyebrowWrap}>
                {rule}
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-leaf-foreground/70">
                  {title}
                </p>
              </div>
            </MotionReveal>
            {/* Line rather than word: the lede is a full sentence at display
                size, and word by word would read as a teleprompter and overrun
                the 1s display budget. `slow` because a chapter opener is an
                arrival moment the frequency gate lets be expressive, against
                the `fast` the section headings below it run at. */}
            <MaskReveal
              as="h2"
              mode="line"
              duration="slow"
              delay={ledeDelay}
              id={`${id}-heading`}
              className={`${headingGap} ${headingMeasure} ${leafHeading}`}
              text={lede}
            />
          </>
        ) : (
          <div className={eyebrowWrap}>
            {/* The rule keeps its own fade-up: it is not type being set, and
                slipping it with the title would put two gestures on one small
                composition. */}
            {rule ? <MotionReveal delay={eyebrowDelay}>{rule}</MotionReveal> : null}
            <MaskReveal
              as="h2"
              mode="line"
              duration="slow"
              delay={eyebrowDelay}
              id={`${id}-heading`}
              className={`${headingMeasure} ${leafHeading}`}
              text={title}
            />
          </div>
        )}
      </CollapsingLeaf>
      {children ? <div className={tileGap}>{children}</div> : null}
    </section>
  );
}
